# ETCD Backup

kubernetes.io > Documentation > Tasks > Administer a Cluster > [Operating etcd clusters for Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/)

All operations below run on a **control-plane node**. On a kubeadm cluster etcd runs as a static pod; its TLS certificates live under `/etc/kubernetes/pki/etcd/`. Set `ETCDCTL_API=3` for every `etcdctl` call (the older `etcdctl` restore/status commands are deprecated; prefer `etcdutl`).

## Back up the etcd datastore

### Take a point-in-time snapshot of etcd with etcdctl and the API server's TLS credentials. Save it to /tmp/etcd-snapshot.db and confirm the file was created.

<details><summary>show</summary>
<p>

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /tmp/etcd-snapshot.db
```

</p>
or
<p>

If you already exported the variables, the shorter form is fine:

```bash
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /tmp/etcd-snapshot.db
# alternative backup: copy the data dir file that is NOT in use by etcd:
#   cp /var/lib/etcd/member/snap/db /tmp/etcd-snapshot.db
```

</p>
</details>

The `snapshot save` sub-command copies the keyspace served by the endpoint to a file; the API server keeps serving while the snapshot is taken (no performance impact on the member). The certificates are read from the etcd Pod description so etcdctl can authenticate with the cluster etcd.

Verify:

```bash
ls -l /tmp/etcd-snapshot.db
```

</details>
</p>

### Verify that the snapshot is valid and report its revision, total keys, and size.

<details><summary>show</summary>
<p>

```bash
# recommended (etcd v3.5+): etcdutl does not need the cluster
etcdutl --write-out=table snapshot status /tmp/etcd-snapshot.db
```

</p>
or
<p>

```bash
# deprecated alias (etcd v3.5+, removed in v3.6): etcdctl with ETCDCTL_API=3
export ETCDCTL_API=3
etcdctl --write-out=table snapshot status /tmp/etcd-snapshot.db
```

</p>
</details>

A healthy snapshot prints a table whose columns are `HASH | REVISION | TOTAL KEYS | TOTAL SIZE` (for example `fe01cf57 | 10 | 7 | 2.1 MB`). The command only reads the file, so it works even when the cluster is down.

## Restore an etcd snapshot

### (Disaster scenario) Stop etcd, restore `/tmp/etcd-snapshot.db` into a fresh data directory `/var/lib/etcd-restored`, and report the command.

<details><summary>show</summary>
<p>

> Warning: only restore a cluster that is fully stopped — never restore against a running etcd that still has the API servers up.

```bash
# 1. stop all API server instances (and kubelet so static pods don't restart)
sudo systemctl stop kubelet

# 2. restore the snapshot into a new data directory
etcdutl --data-dir /var/lib/etcd-restored snapshot restore /tmp/etcd-snapshot.db
```

</p>
or
<p>

```bash
export ETCDCTL_API=3
etcdctl --data-dir /var/lib/etcd-restored snapshot restore /tmp/etcd-snapshot.db
```

</p>
</details>

`etcdutl` writes a brand new etcd data directory at `/var/lib/etcd-restored` populated from the snapshot. The restore target must be a different folder than the existing `/var/lib/etcd` (the official caveat: "If `<data-dir-location>` is the same folder as before, delete it and stop the etcd process before restoring"). Restoration is only supported from the same `major.minor` etcd version (a different patch version is allowed).

### Rewire the etcd static pod so the restored data is used, and restart etcd to finish the recovery.

<details><summary>show</summary>
<p>

```bash
# the static-pod manifest is at /etc/kubernetes/manifests/etcd.yaml
# change the etcd-data volume to point at the restored directory:
sudo sed -i 's#path: /var/lib/etcd#path: /var/lib/etcd-restored#' /etc/kubernetes/manifests/etcd.yaml

# restart the kubelet; it reconciles the static pod, which mounts the new data dir
sudo systemctl start kubelet
```

</p>
or
<p>

```bash
# alternative: let the static pod respawn by deleting it instead of restarting the kubelet
kubectl -n kube-system delete pod etcd-controlplane
# then confirm etcd came back with the restored revision:
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key endpoint health
```

</p>
</details>

Because etcd is a static pod, editing `/etc/kubernetes/manifests/etcd.yaml` (the `volumes.hostPath.path` of the `etcd-data` volume) and restarting the kubelet is the supported way to point etcd at the new data directory. After the etcd pod is `Running` again, start the rest of the control plane with `sudo systemctl start kubelet` (the API server, controller-manager and scheduler come back as static pods too).

Verify:

```bash
kubectl -n kube-system get pod -l component=etcd
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key member list
```

### List the etcd members and their client/peer URLs.

<details><summary>show</summary>
<p>

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  member list
```

</p>
</details>

`member list` prints each member's ID, name, DB size, peer/client URLs and the leader — useful to confirm a single-member (kubeadm default) vs. a multi-member HA cluster before restoring.

> Note: `--endpoints` must point at an etcd member (usually `https://127.0.0.1:2379` on a single-node control plane), and the CA/cert/key are the etcd server credentials, not the kubelet ones.
