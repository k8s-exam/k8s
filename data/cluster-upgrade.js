window.CKAD_TOPIC = {
  "slug": "cluster-upgrade",
  "title": "Cluster Upgrade",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Administer a Cluster &gt; Administration with kubeadm &gt; <a href=\"https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/\" target=\"_blank\" rel=\"noopener\">Upgrading kubeadm clusters</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Administer a Cluster &gt; Administration with kubeadm &gt; <a href=\"https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/upgrading-linux-nodes/\" target=\"_blank\" rel=\"noopener\">Upgrading Linux nodes</a>"
    },
    {
      "type": "text",
      "html": "The procedures below assume a kubeadm cluster on a Debian/Ubuntu host (replace <code>apt</code>/<code>apt-get</code> with <code>yum</code>/<code>dnf</code> on RHEL-like systems). <code>kubeadm</code> only supports upgrading one MINOR version at a time (for example <code>v1.35.x → v1.36.x</code>, or any <code>1.36.y</code>). Use original node names like <code>controlplane</code>, <code>worker1</code>, <code>worker2</code>."
    }
  ],
  "sections": [
    {
      "heading": "Discover versions and plan the upgrade",
      "id": "discover-versions-and-plan-the-upgrade",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Check the current version of the control plane and of every node.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl version               # client + control-plane version\nkubeadm version               # the kubeadm binary version\nkubectl get nodes             # shows each node's kubernetes version and 'Ready' status\nkubectl get nodes -o custom-columns='NAME:.metadata.name,VERSION:.status.nodeInfo.kubeletVersion,STATUS:.status.conditions[-1].type'"
            },
            {
              "type": "text",
              "html": "Note: the <code>-o custom-columns=...</code> expression contains <code>[-1]</code>, which zsh would otherwise try to glob-match — keep it in single quotes."
            }
          ]
        },
        {
          "type": "text",
          "html": "<code>kubectl version</code> prints both the client (<code>Client Version</code>) and the control-plane (<code>Server Version</code>); <code>kubectl get nodes</code> lists the Kubelet version actually running on each node. An upgrade must move every node forward together, so the node list is the source of truth."
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "List the kubeadm versions available in the package repository.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "sudo apt-get update\nsudo apt-cache madison kubeadm      # Ubuntu/Debian\n# RHEL:  sudo yum list --showduplicates kubeadm --disableexcludes=kubernetes"
            }
          ]
        },
        {
          "type": "text",
          "html": "The output shows all published <code>kubeadm</code> packages for every supported minor version; pick the line whose version is one minor above the current cluster version (e.g. <code>1.36.x</code>)."
        }
      ]
    },
    {
      "heading": "Upgrade a control-plane node",
      "id": "upgrade-a-control-plane-node",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "On the first control-plane node, install the new kubeadm, run <code>kubeadm upgrade plan</code>, then apply the upgrade to <code>v1.36.3</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# 1. allow kubeadm to be upgraded, then install the pinned version\nsudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' && sudo apt-mark hold kubeadm\n# 2. preview what will change\nsudo kubeadm upgrade plan\n# 3. apply the upgrade (this upgrades CoreDNS + kube-proxy too)\nsudo kubeadm upgrade apply v1.36.3"
            }
          ]
        },
        {
          "type": "text",
          "html": "<code>kubeadm upgrade apply</code> validates that the target version is exactly one minor above the current one, then updates the control-plane components (they restart as static pods) and renews expiring certificates. <code>upgrade plan</code> also prints any version-skew warnings and the &quot;CoreDNS and kube-proxy are upgraded only after all control-plane nodes are upgraded&quot; note."
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Drain the control-plane node, then upgrade kubelet and kubectl on it and bring it back.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# 1. cordon + drain the node so pods move off it\nkubectl drain controlplane --ignore-daemonsets\n# 2. install the matching kubelet + kubectl\nsudo apt-mark unhold kubelet kubectl\nsudo apt-get update && sudo apt-get install -y 'kubelet=1.36.x-*' 'kubectl=1.36.x-*'\nsudo apt-mark hold kubelet kubectl\n# 3. restart the kubelet so the new binary takes over\nsudo systemctl daemon-reload\nsudo systemctl restart kubelet\n# 4. bring the node back\nkubectl uncordon controlplane"
            }
          ]
        },
        {
          "type": "text",
          "html": "Drainage prevents the node from receiving new pods while its kubelet restarts; <code>--ignore-daemonsets</code> lets the (host-networked, node-critical) DaemonSets like the CNI pod stay in place. <code>daemon-reload</code> + <code>restart kubelet</code> is required because the kubelet is a systemd unit that does not pick up a replaced binary otherwise."
        }
      ]
    },
    {
      "heading": "Upgrade the remaining nodes",
      "id": "upgrade-the-remaining-nodes",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Upgrade the other control-plane nodes (and then every worker), bringing each back online as you go.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# additional control-plane node: upgrade its local config (no 'upgrade apply')\nsudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' && sudo apt-mark hold kubeadm\nsudo kubeadm upgrade node                       # upgrades the local kubelet config\n# worker node upgrade (run the following FROM A CONTROL-PLANE NODE)\nkubectl drain worker1 --ignore-daemonsets\n# ...back on worker1:\nsudo apt-mark unhold kubeadm kubelet kubectl\nsudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' 'kubelet=1.36.x-*' 'kubectl=1.36.x-*'\nsudo apt-mark hold kubeadm kubelet kubectl\nsudo systemctl daemon-reload\nsudo systemctl restart kubelet\n# ...back on a control-plane node:\nkubectl uncordon worker1"
            }
          ]
        },
        {
          "type": "text",
          "html": "Extra control-plane nodes use <code>kubeadm upgrade node</code> (not <code>upgrade apply</code>), and worker nodes must be upgraded <strong>one at a time</strong> — the version-skew policy forbids skipping minor versions. <code>apt-mark hold</code> pins the binaries so a later generic <code>apt upgrade</code> does not revert them."
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Verify the whole cluster after the upgrade.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get nodes                       # every node Ready, all showing v1.36.3\nkubectl get pods -n kube-system         # etcd / kube-apiserver / CoreDNS / kube-proxy all Running\nkubectl get ds -n kube-system kube-proxy"
            }
          ]
        },
        {
          "type": "text",
          "html": "All nodes should report the new version and <code>Ready</code>; CoreDNS and the kube-proxy DaemonSet must be <code>Running</code> before traffic is considered healthy, which is why the docs upgrade one control-plane (and its addons) only after every instance is upgraded."
        }
      ]
    }
  ],
  "count": 6,
  "description": "Upgrade control-plane and worker nodes.",
  "file": "l.cluster_upgrade.md"
};
