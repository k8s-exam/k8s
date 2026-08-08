# State Persistence (8%)

kubernetes.io > Documentation > Tasks > Configure Pods and Containers > [Configure a Pod to Use a Volume for Storage](https://kubernetes.io/docs/tasks/configure-pod-container/configure-volume-storage/)

kubernetes.io > Documentation > Tutorials > Configuration > [Configure a Pod to Use a PersistentVolume for Storage](https://kubernetes.io/docs/tutorials/configuration/configure-persistent-volume-storage/)

## Define volumes 

### Create busybox pod with two containers, each one will have the image busybox and will run the 'sleep 3600' command. Make both containers mount an emptyDir at '/shared'. Connect to the second container, write the first column of '/etc/passwd' file to '/shared/passwd'. Connect to the first container and write '/shared/passwd' file to standard output. Delete pod.

<details><summary>show</summary>
<p>

*This question is probably a better fit for the 'Multi-container-pods' section but I'm keeping it here as it will help you get acquainted with state*

The easiest way to do this is to create a template pod with:

```bash
kubectl run tandem --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'sleep 3600' > pod.yaml
vi pod.yaml
```
Copy paste the container definition and type the lines that have a comment in the end:

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: tandem
  name: tandem
spec:
  dnsPolicy: ClusterFirst
  restartPolicy: Never
  containers:
  - args:
    - /bin/sh
    - -c
    - sleep 3600
    image: busybox
    imagePullPolicy: IfNotPresent
    name: writer
    resources: {}
    volumeMounts: #
    - name: scratch #
      mountPath: /shared #
  - args:
    - /bin/sh
    - -c
    - sleep 3600
    image: busybox
    name: reader # don't forget to change the name during copy paste, must be different from the first container's name!
    volumeMounts: #
    - name: scratch #
      mountPath: /shared #
  volumes: #
  - name: scratch #
    emptyDir: {} #
```
In case you forget to add ```bash -- /bin/sh -c 'sleep 3600'``` in template pod create command, you can include command field in config file

```YAML
spec:
  containers:
  - image: busybox
    name: writer
    command: ["/bin/sh", "-c", "sleep 3600"]
```

Connect to the second container:

```bash
kubectl exec -it tandem -c reader -- /bin/sh
cat /etc/passwd | cut -f 1 -d ':' > /shared/passwd # instead of cut command you can use awk -F ":" '{print $1}'
cat /shared/passwd # confirm that stuff has been written successfully
exit
```

Connect to the first container:

```bash
kubectl exec -it tandem -c writer -- /bin/sh
mount | grep shared # confirm the mounting
cat /shared/passwd
exit
kubectl delete po tandem
```

</p>
</details>


### Create a PersistentVolume of 10Gi, called 'store'. Make it have accessMode of 'ReadWriteOnce' and 'ReadWriteMany', storageClassName 'standard', mounted on hostPath '/mnt/data'. Save it on pv.yaml, add it to the cluster. Show the PersistentVolumes that exist on the cluster

<details><summary>show</summary>
<p>

```bash
vi pv.yaml
```

```YAML
kind: PersistentVolume
apiVersion: v1
metadata:
  name: store
spec:
  storageClassName: standard
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
    - ReadWriteMany
  hostPath:
    path: /mnt/data
```

Show the PersistentVolumes:

```bash
kubectl create -f pv.yaml
# will have status 'Available'
kubectl get pv
```

> Note: the official [access modes table](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) lists `hostPath` as `ReadWriteOnce` only. The API still accepts `ReadWriteMany` here (it does not validate against the plugin), so the claim below still binds — but for a truly multi-node readable/writable volume you would need a plugin such as NFS.

</p>
</details>

### Create a PersistentVolumeClaim for this PersistentVolume, called 'store-claim', a request of 4Gi and an accessMode of ReadWriteOnce, with the storageClassName of standard, and save it on pvc.yaml. Create it on the cluster. Show the PersistentVolumeClaims of the cluster. Show the PersistentVolumes of the cluster

<details><summary>show</summary>
<p>

```bash
vi pvc.yaml
```

```YAML
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: store-claim
spec:
  storageClassName: standard
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi
```

Create it on the cluster:

```bash
kubectl create -f pvc.yaml
```

Show the PersistentVolumeClaims and PersistentVolumes:

```bash
kubectl get pvc # will show as 'Bound'
kubectl get pv # will show as 'Bound' as well
```

</p>
</details>

### Create a busybox pod with command 'sleep 3600', save it on pod.yaml. Mount the PersistentVolumeClaim to '/data'. Connect to the 'storer' pod, and copy the '/etc/passwd' file to '/data/passwd'

<details><summary>show</summary>
<p>

Create a skeleton pod:

```bash
kubectl run storer --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'sleep 3600' > pod.yaml
vi pod.yaml
```

Add the lines that finish with a comment:

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: storer
  name: storer
spec:
  containers:
  - args:
    - /bin/sh
    - -c
    - sleep 3600
    image: busybox
    imagePullPolicy: IfNotPresent
    name: storer
    resources: {}
    volumeMounts: #
    - name: store #
      mountPath: /data #
  dnsPolicy: ClusterFirst
  restartPolicy: Never
  volumes: #
  - name: store #
    persistentVolumeClaim: #
      claimName: store-claim #
status: {}
```

Create the pod:

```bash
kubectl create -f pod.yaml
```

Connect to the pod and copy '/etc/passwd' to '/data/passwd':

```bash
kubectl exec storer -it -- cp /etc/passwd /data/passwd
```

</p>
</details>

### Create a second pod which is identical with the one you just created (you can easily do it by changing the 'name' property on pod.yaml). Connect to it and verify that '/data' contains the 'passwd' file. Delete pods to cleanup. Note: If you can't see the file from the second pod, can you figure out why? What would you do to fix that?



<details><summary>show</summary>
<p>

Create the second pod, called storer2:

```bash
vim pod.yaml
# change 'metadata.name: storer' to 'metadata.name: storer2'
kubectl create -f pod.yaml
kubectl exec storer2 -- ls /data # will show 'passwd'
# cleanup
kubectl delete po storer storer2
kubectl delete pvc store-claim
kubectl delete pv store
```

If the file doesn't show on the second pod but it shows on the first, it has most likely been scheduled on a different node.

```bash
# check which nodes the pods are on
kubectl get po storer -o wide
kubectl get po storer2 -o wide
```

If they are on different nodes, you won't see the file, because we used the `hostPath` volume type.
If you need to access the same files in a multi-node cluster, you need a volume type that is independent of a specific node.
There are lots of different types per cloud provider [(see here)](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes), a general solution could be to use NFS.

</p>
</details>

### Create a busybox pod with 'sleep 3600' as arguments. Copy '/etc/passwd' from the pod to your local folder

<details><summary>show</summary>
<p>

```bash
kubectl run carrier --image=busybox --restart=Never -- sleep 3600
kubectl cp carrier:/etc/passwd ./passwd # kubectl cp command
# previous command might report an error, feel free to ignore it since copy command works
cat passwd
```

</p>
</details>
