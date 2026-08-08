# PV & PVC

kubernetes.io > Documentation > Concepts > Storage > [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

kubernetes.io > Documentation > Concepts > Storage > [Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/)

kubernetes.io > Documentation > Tutorials > Configuration > [Configure a Pod to Use a PersistentVolume for Storage](https://kubernetes.io/docs/tutorials/configuration/configure-persistent-volume-storage/)

This topic treats PersistentVolumes and PersistentVolumeClaims as first-class concepts: the access-mode matrix, static vs dynamic provisioning, the reclaim policy, and StorageClass fields. Use the original resource names `data-pv`, `data-claim`, `keeper`, `keeper2`, `dynamic-claim`, `fast`.

## Static provisioning: PV + PVC

### Create a PersistentVolume `data-pv` of 10Gi, access mode `ReadWriteOnce`, storageClassName `standard`, backed by `hostPath /mnt/data`.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: data-pv
spec:
  storageClassName: standard
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /mnt/data
  persistentVolumeReclaimPolicy: Retain
EOF
kubectl get pv data-pv
# STATUS will be "Available" (nothing claims it yet)
```

</p>
</details>

Explanation: a PV is a piece of storage **provisioned by an admin**; `hostPath` is a stand-in you can use in labs (in a real cluster you would use a networked volume such as EBS/NFS/GCE-PD). `persistentVolumeReclaimPolicy: Retain` is the safe default for static, admin-provisioned disks so the data is **not** deleted when the claim is released.

> **Cluster-specific pitfall.** On this sandbox, `standard` is **also** the name of the built-in default StorageClass (`rancher.io/local-path`, marked `is-default-class: "true"`), whose provisioner is **not** running here. If a PVC asks for `storageClassName: standard`, the controller waits for that provisioner and the PVC stays `Pending` forever instead of binding to your static PV. For the static-binding exercises below, give the PV and PVC a name that does not collide, e.g. `storageClassName: manual`.

### Create a PersistentVolumeClaim `data-claim` asking for 4Gi, `ReadWriteOnce`, storageClassName `standard`. What state is `data-claim` in and why?

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-claim
spec:
  storageClassName: standard
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi
EOF
kubectl get pv,pvc data-pv,data-claim
# pv: STATUS "Bound"      pvc: STATUS "Bound", VOLUME=data-pv
```

</p>
</details>

Explanation: Kubernetes binds a claim to a PV whose capacity is **>= the request** and whose access modes are a superset, using the `storageClassName` to match. Because `10Gi ≥ 4Gi` and the modes line up, `data-claim` binds to `data-pv` and both flip to `Bound`.

### Mount the claim into a pod `keeper` at `/data`, write `/etc/passwd` into it, then recreate an identical pod `keeper2` and confirm the file is visible in the new pod.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: keeper
spec:
  restartPolicy: Never
  containers:
  - image: busybox
    name: keeper
    command: ["sleep","3600"]
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-claim
EOF
kubectl cp keeper:/etc/passwd /tmp/passwd && kubectl cp /tmp/passwd keeper:/data/passwd
```

</p>
or
<p>

```bash
kubectl exec keeper -- cp /etc/passwd /data/passwd
# then launch keeper2 (identical manifest, just metadata.name: keeper2) and read it back:
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: keeper2
spec:
  restartPolicy: Never
  containers:
  - image: busybox
    name: keeper
    command: ["sleep","3600"]
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-claim
EOF
kubectl exec keeper2 -- cat /data/passwd
```

</p>
</details>

Explanation: the **claim** outlives any single pod — it is the indirection that keeps `/data` persistent. Because the PVC is still `Bound` to the same PV (and the PV uses `Retain`), deleting `keeper` does not delete the data; `keeper2` mounts the same volume and sees the file. (With `hostPath` this only works when both pods schedule to the same node — a networked volume is required for the multi-node case.)

## Inspecting and changing policy

### Show the reclaim policy of `data-pv` and the claim's bound volume, then change the reclaim policy to `Retain` (if it isn't already).

<details><summary>show</summary>
<p>

```bash
kubectl get pv data-pv -o jsonpath='{.spec.persistentVolumeReclaimPolicy}'
# show the binding:
kubectl get pvc data-claim -o jsonpath='{.spec.volumeName}'
# change the reclaim policy (Retain is the default for manually-created PVs):
kubectl patch pv data-pv -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
```

</p>
</details>

Explanation: `persistentVolumeReclaimPolicy` is a **PV** field (there is also a `volumeBindingMode` field — see the StorageClass topic). `Reclaim` deletes the underlying storage when the claim is deleted; `Retain` leaves it behind so you can back it up or migrate it; `Recycle` is removed.

### Delete the claim and observe what happens to the PV (because the policy is `Retain`).

<details><summary>show</summary>
<p>

```bash
kubectl delete pvc data-claim
kubectl get pv data-pv     # STATUS "Released" (the PV is kept, not removed)
```

</p>
</details>

Explanation: with `Retain`, deleting the PVC releases the bind (`Released` status) but the PV and its data survive for an operator to handle manually — the correct behaviour for important data. Had the policy been `Delete`, the PV and the backing disk would be garbage-collected together.

## Dynamic provisioning with a StorageClass

### Inspect the cluster's default StorageClass and confirm there is one marked as default.

<details><summary>show</summary>
<p>

```bash
kubectl get sc
# the default one carries: storageclass.kubernetes.io/is-default-class: "true"
kubectl get sc -o custom-columns='NAME:.metadata.name,DEFAULT:.metadata.annotations.storageclass\.kubernetes\.io/is-default-class,PROVISIONER:.provisioner'
```

Note: keep the `-o custom-columns=...` expression in **single quotes** — unquoted, zsh strips the backslash-dot escapes so `DEFAULT` renders as `<none>` even for the default class.

</p>
</details>

Explanation: a StorageClass with `is-default-class: "true"` is used automatically when a PVC omits `storageClassName`. The `provisioner` field names the CSI/cloud driver that actually creates the disk (e.g. `kubernetes.io/gce-pd`, `kubernetes.io/aws-ebs`, `k8s.io/minikube-hostpath`).

### Create a PVC `dynamic-claim` that does not name a storage class and watch a PV appear for it automatically (dynamic provisioning).

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
EOF
kubectl get pvc dynamic-claim       # "Bound" once the provisioner finished
kubectl get pv | grep dynamic       # the auto-created PV (has spec.claimRef.name set to dynamic-claim)
# or via jsonpath:
kubectl get pv -o jsonpath='{range .items[?(@.spec.claimRef.name=="dynamic-claim")]}{.metadata.name}{"\n"}{end}'
```

</p>
</details>

Explanation: because `storageClassName` is omitted, the control plane hands the claim to the **default** StorageClass controller, which provisions a fresh PV matching the request and binds it. The new PV is `dynamic-volume-<random>` and disappears when the PVC is deleted (the controller honours the SC `reclaimPolicy`, default `Delete`).

> **Cluster-specific pitfall (dynamic provisioning).** On this sandbox the default class is `rancher.io/local-path`, but its `local-path-provisioner` pod is **not** deployed, so `dynamic-claim` will stay `Pending` (with a `FailedBinding`-style warning event) rather than producing a PV. To exercise dynamic provisioning here you must first install the provisioner (e.g. `kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml`) or point the class at an available CSI driver. The exercise remains correct on a stock kubeadm/kind/minikube cluster.

### Create a StorageClass `fast` with `volumeBindingMode: WaitForFirstConsumer`, `allowVolumeExpansion: true` and `reclaimPolicy: Delete`, copying the provisioner from the cluster default so it actually provisions.

<details><summary>show</summary>
<p>

```bash
# reuse whatever provisioner the cluster already ships with:
PROV=$(kubectl get sc -o jsonpath='{range .items[?(@.metadata.annotations.storageclass\.kubernetes\.io/is-default-class=="true")]}{.provisioner}{end}')
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: ${PROV}
volumeBindingMode: WaitForFirstConsumer   # wait for a pod before binding (topology-aware)
allowVolumeExpansion: true                # PVCs using this class can be resized later
reclaimPolicy: Delete
EOF
kubectl get sc fast -o yaml
```

</p>
</details>

Explanation: `WaitForFirstConsumer` defers binding until a pod actually uses the PVC, which lets the scheduler place the pod and volume in the same zone — essential for network-attached volumes. `allowVolumeExpansion: true` is what lets the "Expand a PVC" operation work; without it a `kubectl edit pvc`/`kubectl patch pvc` resize is rejected. `reclaimPolicy: Delete` keeps the cloud disk lifecycle in sync with the claim (the default for dynamically-provisioned storage).

### (Bonus) Expand `dynamic-claim` from 5Gi to 8Gi and confirm the file-system is grown on the node.

<details><summary>show</summary>
<p>

```bash
kubectl patch pvc dynamic-claim -p '{"spec":{"resources":{"requests":{"storage":"8Gi"}}}}'
kubectl get pvc dynamic-claim -o jsonpath='{.spec.resources.requests.storage}{"\n"}{.status.capacity.storage}'
# only works because the StorageClass has allowVolumeExpansion: true
```

</p>
</details>

Explanation: the PVC `spec.resources.requests.storage` is the target size; the underlying PV + file system are grown automatically by the CSI/driver once the PVC is patched.
