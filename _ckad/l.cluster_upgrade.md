# Cluster Upgrade

kubernetes.io > Documentation > Tasks > Administer a Cluster > Administration with kubeadm > [Upgrading kubeadm clusters](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/)

kubernetes.io > Documentation > Tasks > Administer a Cluster > Administration with kubeadm > [Upgrading Linux nodes](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/upgrading-linux-nodes/)

The procedures below assume a kubeadm cluster on a Debian/Ubuntu host (replace `apt`/`apt-get` with `yum`/`dnf` on RHEL-like systems). `kubeadm` only supports upgrading one MINOR version at a time (for example `v1.35.x → v1.36.x`, or any `1.36.y`). Use original node names like `controlplane`, `worker1`, `worker2`.

## Discover versions and plan the upgrade

### Check the current version of the control plane and of every node.

<details><summary>show</summary>
<p>

```bash
kubectl version               # client + control-plane version
kubeadm version               # the kubeadm binary version
kubectl get nodes             # shows each node's kubernetes version and 'Ready' status
kubectl get nodes -o custom-columns='NAME:.metadata.name,VERSION:.status.nodeInfo.kubeletVersion,STATUS:.status.conditions[-1].type'
```

Note: the `-o custom-columns=...` expression contains `[-1]`, which zsh would otherwise try to glob-match — keep it in single quotes.

</p>
</details>

`kubectl version` prints both the client (`Client Version`) and the control-plane (`Server Version`); `kubectl get nodes` lists the Kubelet version actually running on each node. An upgrade must move every node forward together, so the node list is the source of truth.

### List the kubeadm versions available in the package repository.

<details><summary>show</summary>
<p>

```bash
sudo apt-get update
sudo apt-cache madison kubeadm      # Ubuntu/Debian
# RHEL:  sudo yum list --showduplicates kubeadm --disableexcludes=kubernetes
```

</p>
</details>

The output shows all published `kubeadm` packages for every supported minor version; pick the line whose version is one minor above the current cluster version (e.g. `1.36.x`).

## Upgrade a control-plane node

### On the first control-plane node, install the new kubeadm, run `kubeadm upgrade plan`, then apply the upgrade to `v1.36.3`.

<details><summary>show</summary>
<p>

```bash
# 1. allow kubeadm to be upgraded, then install the pinned version
sudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' && sudo apt-mark hold kubeadm

# 2. preview what will change
sudo kubeadm upgrade plan

# 3. apply the upgrade (this upgrades CoreDNS + kube-proxy too)
sudo kubeadm upgrade apply v1.36.3
```

</p>
</details>

`kubeadm upgrade apply` validates that the target version is exactly one minor above the current one, then updates the control-plane components (they restart as static pods) and renews expiring certificates. `upgrade plan` also prints any version-skew warnings and the "CoreDNS and kube-proxy are upgraded only after all control-plane nodes are upgraded" note.

### Drain the control-plane node, then upgrade kubelet and kubectl on it and bring it back.

<details><summary>show</summary>
<p>

```bash
# 1. cordon + drain the node so pods move off it
kubectl drain controlplane --ignore-daemonsets

# 2. install the matching kubelet + kubectl
sudo apt-mark unhold kubelet kubectl
sudo apt-get update && sudo apt-get install -y 'kubelet=1.36.x-*' 'kubectl=1.36.x-*'
sudo apt-mark hold kubelet kubectl

# 3. restart the kubelet so the new binary takes over
sudo systemctl daemon-reload
sudo systemctl restart kubelet

# 4. bring the node back
kubectl uncordon controlplane
```

</p>
</details>

Drainage prevents the node from receiving new pods while its kubelet restarts; `--ignore-daemonsets` lets the (host-networked, node-critical) DaemonSets like the CNI pod stay in place. `daemon-reload` + `restart kubelet` is required because the kubelet is a systemd unit that does not pick up a replaced binary otherwise.

## Upgrade the remaining nodes

### Upgrade the other control-plane nodes (and then every worker), bringing each back online as you go.

<details><summary>show</summary>
<p>

```bash
# additional control-plane node: upgrade its local config (no 'upgrade apply')
sudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' && sudo apt-mark hold kubeadm
sudo kubeadm upgrade node                       # upgrades the local kubelet config

# worker node upgrade (run the following FROM A CONTROL-PLANE NODE)
kubectl drain worker1 --ignore-daemonsets
# ...back on worker1:
sudo apt-mark unhold kubeadm kubelet kubectl
sudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' 'kubelet=1.36.x-*' 'kubectl=1.36.x-*'
sudo apt-mark hold kubeadm kubelet kubectl
sudo systemctl daemon-reload
sudo systemctl restart kubelet
# ...back on a control-plane node:
kubectl uncordon worker1
```

</p>
</details>

Extra control-plane nodes use `kubeadm upgrade node` (not `upgrade apply`), and worker nodes must be upgraded **one at a time** — the version-skew policy forbids skipping minor versions. `apt-mark hold` pins the binaries so a later generic `apt upgrade` does not revert them.

### Verify the whole cluster after the upgrade.

<details><summary>show</summary>
<p>

```bash
kubectl get nodes                       # every node Ready, all showing v1.36.3
kubectl get pods -n kube-system         # etcd / kube-apiserver / CoreDNS / kube-proxy all Running
kubectl get ds -n kube-system kube-proxy
```

</p>
</details>

All nodes should report the new version and `Ready`; CoreDNS and the kube-proxy DaemonSet must be `Running` before traffic is considered healthy, which is why the docs upgrade one control-plane (and its addons) only after every instance is upgraded.
