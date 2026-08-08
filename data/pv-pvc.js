window.CKAD_TOPIC = {
  "slug": "pv-pvc",
  "title": "PV & PVC",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Storage &gt; <a href=\"https://kubernetes.io/docs/concepts/storage/persistent-volumes/\" target=\"_blank\" rel=\"noopener\">Persistent Volumes</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Storage &gt; <a href=\"https://kubernetes.io/docs/concepts/storage/storage-classes/\" target=\"_blank\" rel=\"noopener\">Storage Classes</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tutorials &gt; Configuration &gt; <a href=\"https://kubernetes.io/docs/tutorials/configuration/configure-persistent-volume-storage/\" target=\"_blank\" rel=\"noopener\">Configure a Pod to Use a PersistentVolume for Storage</a>"
    },
    {
      "type": "text",
      "html": "This topic treats PersistentVolumes and PersistentVolumeClaims as first-class concepts: the access-mode matrix, static vs dynamic provisioning, the reclaim policy, and StorageClass fields. Use the original resource names <code>data-pv</code>, <code>data-claim</code>, <code>keeper</code>, <code>keeper2</code>, <code>dynamic-claim</code>, <code>fast</code>."
    }
  ],
  "sections": [
    {
      "heading": "Static provisioning: PV + PVC",
      "id": "static-provisioning-pv-pvc",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a PersistentVolume <code>data-pv</code> of 10Gi, access mode <code>ReadWriteOnce</code>, storageClassName <code>standard</code>, backed by <code>hostPath /mnt/data</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: PersistentVolume\nmetadata:\n  name: data-pv\nspec:\n  storageClassName: standard\n  capacity:\n    storage: 10Gi\n  accessModes:\n    - ReadWriteOnce\n  hostPath:\n    path: /mnt/data\n  persistentVolumeReclaimPolicy: Retain\nEOF\nkubectl get pv data-pv\n# STATUS will be \"Available\" (nothing claims it yet)"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: a PV is a piece of storage <strong>provisioned by an admin</strong>; <code>hostPath</code> is a stand-in you can use in labs (in a real cluster you would use a networked volume such as EBS/NFS/GCE-PD). <code>persistentVolumeReclaimPolicy: Retain</code> is the safe default for static, admin-provisioned disks so the data is <strong>not</strong> deleted when the claim is released."
        },
        {
          "type": "text",
          "html": "&gt; <strong>Cluster-specific pitfall.</strong> On this sandbox, <code>standard</code> is <strong>also</strong> the name of the built-in default StorageClass (<code>rancher.io/local-path</code>, marked <code>is-default-class: &quot;true&quot;</code>), whose provisioner is <strong>not</strong> running here. If a PVC asks for <code>storageClassName: standard</code>, the controller waits for that provisioner and the PVC stays <code>Pending</code> forever instead of binding to your static PV. For the static-binding exercises below, give the PV and PVC a name that does not collide, e.g. <code>storageClassName: manual</code>."
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Create a PersistentVolumeClaim <code>data-claim</code> asking for 4Gi, <code>ReadWriteOnce</code>, storageClassName <code>standard</code>. What state is <code>data-claim</code> in and why?",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: data-claim\nspec:\n  storageClassName: standard\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 4Gi\nEOF\nkubectl get pv,pvc data-pv,data-claim\n# pv: STATUS \"Bound\"      pvc: STATUS \"Bound\", VOLUME=data-pv"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: Kubernetes binds a claim to a PV whose capacity is <strong>&gt;= the request</strong> and whose access modes are a superset, using the <code>storageClassName</code> to match. Because <code>10Gi ≥ 4Gi</code> and the modes line up, <code>data-claim</code> binds to <code>data-pv</code> and both flip to <code>Bound</code>."
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Mount the claim into a pod <code>keeper</code> at <code>/data</code>, write <code>/etc/passwd</code> into it, then recreate an identical pod <code>keeper2</code> and confirm the file is visible in the new pod.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: keeper\nspec:\n  restartPolicy: Never\n  containers:\n  - image: busybox\n    name: keeper\n    command: [\"sleep\",\"3600\"]\n    volumeMounts:\n    - name: data\n      mountPath: /data\n  volumes:\n  - name: data\n    persistentVolumeClaim:\n      claimName: data-claim\nEOF\nkubectl cp keeper:/etc/passwd /tmp/passwd && kubectl cp /tmp/passwd keeper:/data/passwd"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl exec keeper -- cp /etc/passwd /data/passwd\n# then launch keeper2 (identical manifest, just metadata.name: keeper2) and read it back:\nkubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: keeper2\nspec:\n  restartPolicy: Never\n  containers:\n  - image: busybox\n    name: keeper\n    command: [\"sleep\",\"3600\"]\n    volumeMounts:\n    - name: data\n      mountPath: /data\n  volumes:\n  - name: data\n    persistentVolumeClaim:\n      claimName: data-claim\nEOF\nkubectl exec keeper2 -- cat /data/passwd"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: the <strong>claim</strong> outlives any single pod — it is the indirection that keeps <code>/data</code> persistent. Because the PVC is still <code>Bound</code> to the same PV (and the PV uses <code>Retain</code>), deleting <code>keeper</code> does not delete the data; <code>keeper2</code> mounts the same volume and sees the file. (With <code>hostPath</code> this only works when both pods schedule to the same node — a networked volume is required for the multi-node case.)"
        }
      ]
    },
    {
      "heading": "Inspecting and changing policy",
      "id": "inspecting-and-changing-policy",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Show the reclaim policy of <code>data-pv</code> and the claim's bound volume, then change the reclaim policy to <code>Retain</code> (if it isn't already).",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pv data-pv -o jsonpath='{.spec.persistentVolumeReclaimPolicy}'\n# show the binding:\nkubectl get pvc data-claim -o jsonpath='{.spec.volumeName}'\n# change the reclaim policy (Retain is the default for manually-created PVs):\nkubectl patch pv data-pv -p '{\"spec\":{\"persistentVolumeReclaimPolicy\":\"Retain\"}}'"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>persistentVolumeReclaimPolicy</code> is a <strong>PV</strong> field (there is also a <code>volumeBindingMode</code> field — see the StorageClass topic). <code>Reclaim</code> deletes the underlying storage when the claim is deleted; <code>Retain</code> leaves it behind so you can back it up or migrate it; <code>Recycle</code> is removed."
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Delete the claim and observe what happens to the PV (because the policy is <code>Retain</code>).",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete pvc data-claim\nkubectl get pv data-pv     # STATUS \"Released\" (the PV is kept, not removed)"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: with <code>Retain</code>, deleting the PVC releases the bind (<code>Released</code> status) but the PV and its data survive for an operator to handle manually — the correct behaviour for important data. Had the policy been <code>Delete</code>, the PV and the backing disk would be garbage-collected together."
        }
      ]
    },
    {
      "heading": "Dynamic provisioning with a StorageClass",
      "id": "dynamic-provisioning-with-a-storageclass",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Inspect the cluster's default StorageClass and confirm there is one marked as default.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get sc\n# the default one carries: storageclass.kubernetes.io/is-default-class: \"true\"\nkubectl get sc -o custom-columns='NAME:.metadata.name,DEFAULT:.metadata.annotations.storageclass\\.kubernetes\\.io/is-default-class,PROVISIONER:.provisioner'"
            },
            {
              "type": "text",
              "html": "Note: keep the <code>-o custom-columns=...</code> expression in <strong>single quotes</strong> — unquoted, zsh strips the backslash-dot escapes so <code>DEFAULT</code> renders as <code>&lt;none&gt;</code> even for the default class."
            }
          ]
        },
        {
          "type": "ref",
          "html": "Explanation: a StorageClass with <code>is-default-class: &quot;true&quot;</code> is used automatically when a PVC omits <code>storageClassName</code>. The <code>provisioner</code> field names the CSI/cloud driver that actually creates the disk (e.g. <code>kubernetes.io/gce-pd</code>, <code>kubernetes.io/aws-ebs</code>, <code>k8s.io/minikube-hostpath</code>)."
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Create a PVC <code>dynamic-claim</code> that does not name a storage class and watch a PV appear for it automatically (dynamic provisioning).",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: dynamic-claim\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 5Gi\nEOF\nkubectl get pvc dynamic-claim       # \"Bound\" once the provisioner finished\nkubectl get pv | grep dynamic       # the auto-created PV (has spec.claimRef.name set to dynamic-claim)\n# or via jsonpath:\nkubectl get pv -o jsonpath='{range .items[?(@.spec.claimRef.name==\"dynamic-claim\")]}{.metadata.name}{\"\\n\"}{end}'"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: because <code>storageClassName</code> is omitted, the control plane hands the claim to the <strong>default</strong> StorageClass controller, which provisions a fresh PV matching the request and binds it. The new PV is <code>dynamic-volume-&lt;random&gt;</code> and disappears when the PVC is deleted (the controller honours the SC <code>reclaimPolicy</code>, default <code>Delete</code>)."
        },
        {
          "type": "text",
          "html": "&gt; <strong>Cluster-specific pitfall (dynamic provisioning).</strong> On this sandbox the default class is <code>rancher.io/local-path</code>, but its <code>local-path-provisioner</code> pod is <strong>not</strong> deployed, so <code>dynamic-claim</code> will stay <code>Pending</code> (with a <code>FailedBinding</code>-style warning event) rather than producing a PV. To exercise dynamic provisioning here you must first install the provisioner (e.g. <code>kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml</code>) or point the class at an available CSI driver. The exercise remains correct on a stock kubeadm/kind/minikube cluster."
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Create a StorageClass <code>fast</code> with <code>volumeBindingMode: WaitForFirstConsumer</code>, <code>allowVolumeExpansion: true</code> and <code>reclaimPolicy: Delete</code>, copying the provisioner from the cluster default so it actually provisions.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# reuse whatever provisioner the cluster already ships with:\nPROV=$(kubectl get sc -o jsonpath='{range .items[?(@.metadata.annotations.storageclass\\.kubernetes\\.io/is-default-class==\"true\")]}{.provisioner}{end}')\nkubectl apply -f - <<EOF\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast\nprovisioner: ${PROV}\nvolumeBindingMode: WaitForFirstConsumer   # wait for a pod before binding (topology-aware)\nallowVolumeExpansion: true                # PVCs using this class can be resized later\nreclaimPolicy: Delete\nEOF\nkubectl get sc fast -o yaml"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>WaitForFirstConsumer</code> defers binding until a pod actually uses the PVC, which lets the scheduler place the pod and volume in the same zone — essential for network-attached volumes. <code>allowVolumeExpansion: true</code> is what lets the &quot;Expand a PVC&quot; operation work; without it a <code>kubectl edit pvc</code>/<code>kubectl patch pvc</code> resize is rejected. <code>reclaimPolicy: Delete</code> keeps the cloud disk lifecycle in sync with the claim (the default for dynamically-provisioned storage)."
        },
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "(Bonus) Expand <code>dynamic-claim</code> from 5Gi to 8Gi and confirm the file-system is grown on the node.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl patch pvc dynamic-claim -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"8Gi\"}}}}'\nkubectl get pvc dynamic-claim -o jsonpath='{.spec.resources.requests.storage}{\"\\n\"}{.status.capacity.storage}'\n# only works because the StorageClass has allowVolumeExpansion: true"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: the PVC <code>spec.resources.requests.storage</code> is the target size; the underlying PV + file system are grown automatically by the CSI/driver once the PVC is patched."
        }
      ]
    }
  ],
  "count": 9,
  "description": "Static and dynamic volume provisioning.",
  "file": "m.pv_pvc.md"
};
