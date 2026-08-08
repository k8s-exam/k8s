window.CKAD_TOPIC = {
  "slug": "etcd-backup-restore",
  "title": "ETCD Backup",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Administer a Cluster &gt; <a href=\"https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/\" target=\"_blank\" rel=\"noopener\">Operating etcd clusters for Kubernetes</a>"
    },
    {
      "type": "text",
      "html": "All operations below run on a <strong>control-plane node</strong>. On a kubeadm cluster etcd runs as a static pod; its TLS certificates live under <code>/etc/kubernetes/pki/etcd/</code>. Set <code>ETCDCTL_API=3</code> for every <code>etcdctl</code> call (the older <code>etcdctl</code> restore/status commands are deprecated; prefer <code>etcdutl</code>)."
    }
  ],
  "sections": [
    {
      "heading": "Back up the etcd datastore",
      "id": "back-up-the-etcd-datastore",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Take a point-in-time snapshot of etcd with etcdctl and the API server's TLS credentials. Save it to /tmp/etcd-snapshot.db and confirm the file was created.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "ETCDCTL_API=3 etcdctl \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /tmp/etcd-snapshot.db"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "text",
              "html": "If you already exported the variables, the shorter form is fine:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /tmp/etcd-snapshot.db\n# alternative backup: copy the data dir file that is NOT in use by etcd:\n#   cp /var/lib/etcd/member/snap/db /tmp/etcd-snapshot.db"
            }
          ]
        },
        {
          "type": "text",
          "html": "The <code>snapshot save</code> sub-command copies the keyspace served by the endpoint to a file; the API server keeps serving while the snapshot is taken (no performance impact on the member). The certificates are read from the etcd Pod description so etcdctl can authenticate with the cluster etcd."
        },
        {
          "type": "text",
          "html": "Verify:"
        },
        {
          "type": "text",
          "html": "```bash"
        },
        {
          "type": "text",
          "html": "ls -l /tmp/etcd-snapshot.db"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Verify that the snapshot is valid and report its revision, total keys, and size.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# recommended (etcd v3.5+): etcdutl does not need the cluster\netcdutl --write-out=table snapshot status /tmp/etcd-snapshot.db"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# deprecated alias (etcd v3.5+, removed in v3.6): etcdctl with ETCDCTL_API=3\nexport ETCDCTL_API=3\netcdctl --write-out=table snapshot status /tmp/etcd-snapshot.db"
            }
          ]
        },
        {
          "type": "text",
          "html": "A healthy snapshot prints a table whose columns are <code>HASH | REVISION | TOTAL KEYS | TOTAL SIZE</code> (for example <code>fe01cf57 | 10 | 7 | 2.1 MB</code>). The command only reads the file, so it works even when the cluster is down."
        }
      ]
    },
    {
      "heading": "Restore an etcd snapshot",
      "id": "restore-an-etcd-snapshot",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "(Disaster scenario) Stop etcd, restore <code>/tmp/etcd-snapshot.db</code> into a fresh data directory <code>/var/lib/etcd-restored</code>, and report the command.",
          "setup": [],
          "answer": [
            {
              "type": "quote",
              "html": "Warning: only restore a cluster that is fully stopped — never restore against a running etcd that still has the API servers up."
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# 1. stop all API server instances (and kubelet so static pods don't restart)\nsudo systemctl stop kubelet\n# 2. restore the snapshot into a new data directory\netcdutl --data-dir /var/lib/etcd-restored snapshot restore /tmp/etcd-snapshot.db"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "export ETCDCTL_API=3\netcdctl --data-dir /var/lib/etcd-restored snapshot restore /tmp/etcd-snapshot.db"
            }
          ]
        },
        {
          "type": "text",
          "html": "<code>etcdutl</code> writes a brand new etcd data directory at <code>/var/lib/etcd-restored</code> populated from the snapshot. The restore target must be a different folder than the existing <code>/var/lib/etcd</code> (the official caveat: &quot;If <code>&lt;data-dir-location&gt;</code> is the same folder as before, delete it and stop the etcd process before restoring&quot;). Restoration is only supported from the same <code>major.minor</code> etcd version (a different patch version is allowed)."
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Rewire the etcd static pod so the restored data is used, and restart etcd to finish the recovery.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# the static-pod manifest is at /etc/kubernetes/manifests/etcd.yaml\n# change the etcd-data volume to point at the restored directory:\nsudo sed -i 's#path: /var/lib/etcd#path: /var/lib/etcd-restored#' /etc/kubernetes/manifests/etcd.yaml\n# restart the kubelet; it reconciles the static pod, which mounts the new data dir\nsudo systemctl start kubelet"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# alternative: let the static pod respawn by deleting it instead of restarting the kubelet\nkubectl -n kube-system delete pod etcd-controlplane\n# then confirm etcd came back with the restored revision:\nETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key endpoint health"
            }
          ]
        },
        {
          "type": "text",
          "html": "Because etcd is a static pod, editing <code>/etc/kubernetes/manifests/etcd.yaml</code> (the <code>volumes.hostPath.path</code> of the <code>etcd-data</code> volume) and restarting the kubelet is the supported way to point etcd at the new data directory. After the etcd pod is <code>Running</code> again, start the rest of the control plane with <code>sudo systemctl start kubelet</code> (the API server, controller-manager and scheduler come back as static pods too)."
        },
        {
          "type": "text",
          "html": "Verify:"
        },
        {
          "type": "text",
          "html": "```bash"
        },
        {
          "type": "text",
          "html": "kubectl -n kube-system get pod -l component=etcd"
        },
        {
          "type": "text",
          "html": "ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\"
        },
        {
          "type": "text",
          "html": "--cacert=/etc/kubernetes/pki/etcd/ca.crt \\"
        },
        {
          "type": "text",
          "html": "--cert=/etc/kubernetes/pki/etcd/server.crt \\"
        },
        {
          "type": "text",
          "html": "--key=/etc/kubernetes/pki/etcd/server.key member list"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "List the etcd members and their client/peer URLs.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "ETCDCTL_API=3 etcdctl \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  member list"
            }
          ]
        },
        {
          "type": "text",
          "html": "<code>member list</code> prints each member's ID, name, DB size, peer/client URLs and the leader — useful to confirm a single-member (kubeadm default) vs. a multi-member HA cluster before restoring."
        },
        {
          "type": "text",
          "html": "&gt; Note: <code>--endpoints</code> must point at an etcd member (usually <code>https://127.0.0.1:2379</code> on a single-node control plane), and the CA/cert/key are the etcd server credentials, not the kubelet ones."
        }
      ]
    }
  ],
  "count": 5,
  "description": "Back up and restore the etcd datastore.",
  "file": "k.etcd_backup_restore.md"
};
