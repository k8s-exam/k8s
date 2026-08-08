window.CKAD_TOPIC = {
  "slug": "state-persistence",
  "title": "State Persistence",
  "weight": "8%",
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Configure Pods and Containers &gt; <a href=\"https://kubernetes.io/docs/tasks/configure-pod-container/configure-volume-storage/\" target=\"_blank\" rel=\"noopener\">Configure a Pod to Use a Volume for Storage</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tutorials &gt; Configuration &gt; <a href=\"https://kubernetes.io/docs/tutorials/configuration/configure-persistent-volume-storage/\" target=\"_blank\" rel=\"noopener\">Configure a Pod to Use a PersistentVolume for Storage</a>"
    }
  ],
  "sections": [
    {
      "heading": "Define volumes",
      "id": "define-volumes",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create busybox pod with two containers, each one will have the image busybox and will run the 'sleep 3600' command. Make both containers mount an emptyDir at '/shared'. Connect to the second container, write the first column of '/etc/passwd' file to '/shared/passwd'. Connect to the first container and write '/shared/passwd' file to standard output. Delete pod.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "<em>This question is probably a better fit for the 'Multi-container-pods' section but I'm keeping it here as it will help you get acquainted with state</em>"
            },
            {
              "type": "text",
              "html": "The easiest way to do this is to create a template pod with:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run tandem --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'sleep 3600' > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "text",
              "html": "Copy paste the container definition and type the lines that have a comment in the end:"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: tandem\n  name: tandem\nspec:\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\n  containers:\n  - args:\n    - /bin/sh\n    - -c\n    - sleep 3600\n    image: busybox\n    imagePullPolicy: IfNotPresent\n    name: writer\n    resources: {}\n    volumeMounts: #\n    - name: scratch #\n      mountPath: /shared #\n  - args:\n    - /bin/sh\n    - -c\n    - sleep 3600\n    image: busybox\n    name: reader # don't forget to change the name during copy paste, must be different from the first container's name!\n    volumeMounts: #\n    - name: scratch #\n      mountPath: /shared #\n  volumes: #\n  - name: scratch #\n    emptyDir: {} #"
            },
            {
              "type": "text",
              "html": "In case you forget to add ``<code>bash -- /bin/sh -c 'sleep 3600'</code>`` in template pod create command, you can include command field in config file"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "spec:\n  containers:\n  - image: busybox\n    name: writer\n    command: [\"/bin/sh\", \"-c\", \"sleep 3600\"]"
            },
            {
              "type": "text",
              "html": "Connect to the second container:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl exec -it tandem -c reader -- /bin/sh\ncat /etc/passwd | cut -f 1 -d ':' > /shared/passwd # instead of cut command you can use awk -F \":\" '{print $1}'\ncat /shared/passwd # confirm that stuff has been written successfully\nexit"
            },
            {
              "type": "text",
              "html": "Connect to the first container:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl exec -it tandem -c writer -- /bin/sh\nmount | grep shared # confirm the mounting\ncat /shared/passwd\nexit\nkubectl delete po tandem"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Create a PersistentVolume of 10Gi, called 'store'. Make it have accessMode of 'ReadWriteOnce' and 'ReadWriteMany', storageClassName 'standard', mounted on hostPath '/mnt/data'. Save it on pv.yaml, add it to the cluster. Show the PersistentVolumes that exist on the cluster",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "vi pv.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "kind: PersistentVolume\napiVersion: v1\nmetadata:\n  name: store\nspec:\n  storageClassName: standard\n  capacity:\n    storage: 10Gi\n  accessModes:\n    - ReadWriteOnce\n    - ReadWriteMany\n  hostPath:\n    path: /mnt/data"
            },
            {
              "type": "text",
              "html": "Show the PersistentVolumes:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pv.yaml\n# will have status 'Available'\nkubectl get pv"
            },
            {
              "type": "quote",
              "html": "Note: the official <a href=\"https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes\" target=\"_blank\" rel=\"noopener\">access modes table</a> lists <code>hostPath</code> as <code>ReadWriteOnce</code> only. The API still accepts <code>ReadWriteMany</code> here (it does not validate against the plugin), so the claim below still binds — but for a truly multi-node readable/writable volume you would need a plugin such as NFS."
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Create a PersistentVolumeClaim for this PersistentVolume, called 'store-claim', a request of 4Gi and an accessMode of ReadWriteOnce, with the storageClassName of standard, and save it on pvc.yaml. Create it on the cluster. Show the PersistentVolumeClaims of the cluster. Show the PersistentVolumes of the cluster",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "vi pvc.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "kind: PersistentVolumeClaim\napiVersion: v1\nmetadata:\n  name: store-claim\nspec:\n  storageClassName: standard\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 4Gi"
            },
            {
              "type": "text",
              "html": "Create it on the cluster:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pvc.yaml"
            },
            {
              "type": "text",
              "html": "Show the PersistentVolumeClaims and PersistentVolumes:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pvc # will show as 'Bound'\nkubectl get pv # will show as 'Bound' as well"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Create a busybox pod with command 'sleep 3600', save it on pod.yaml. Mount the PersistentVolumeClaim to '/data'. Connect to the 'storer' pod, and copy the '/etc/passwd' file to '/data/passwd'",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Create a skeleton pod:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run storer --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'sleep 3600' > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "text",
              "html": "Add the lines that finish with a comment:"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: storer\n  name: storer\nspec:\n  containers:\n  - args:\n    - /bin/sh\n    - -c\n    - sleep 3600\n    image: busybox\n    imagePullPolicy: IfNotPresent\n    name: storer\n    resources: {}\n    volumeMounts: #\n    - name: store #\n      mountPath: /data #\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\n  volumes: #\n  - name: store #\n    persistentVolumeClaim: #\n      claimName: store-claim #\nstatus: {}"
            },
            {
              "type": "text",
              "html": "Create the pod:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml"
            },
            {
              "type": "text",
              "html": "Connect to the pod and copy '/etc/passwd' to '/data/passwd':"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl exec storer -it -- cp /etc/passwd /data/passwd"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Create a second pod which is identical with the one you just created (you can easily do it by changing the 'name' property on pod.yaml). Connect to it and verify that '/data' contains the 'passwd' file. Delete pods to cleanup. Note: If you can't see the file from the second pod, can you figure out why? What would you do to fix that?",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Create the second pod, called storer2:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "vim pod.yaml\n# change 'metadata.name: storer' to 'metadata.name: storer2'\nkubectl create -f pod.yaml\nkubectl exec storer2 -- ls /data # will show 'passwd'\n# cleanup\nkubectl delete po storer storer2\nkubectl delete pvc store-claim\nkubectl delete pv store"
            },
            {
              "type": "text",
              "html": "If the file doesn't show on the second pod but it shows on the first, it has most likely been scheduled on a different node."
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# check which nodes the pods are on\nkubectl get po storer -o wide\nkubectl get po storer2 -o wide"
            },
            {
              "type": "text",
              "html": "If they are on different nodes, you won't see the file, because we used the <code>hostPath</code> volume type."
            },
            {
              "type": "text",
              "html": "If you need to access the same files in a multi-node cluster, you need a volume type that is independent of a specific node."
            },
            {
              "type": "ref",
              "html": "There are lots of different types per cloud provider <a href=\"https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes\" target=\"_blank\" rel=\"noopener\">(see here)</a>, a general solution could be to use NFS."
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Create a busybox pod with 'sleep 3600' as arguments. Copy '/etc/passwd' from the pod to your local folder",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run carrier --image=busybox --restart=Never -- sleep 3600\nkubectl cp carrier:/etc/passwd ./passwd # kubectl cp command\n# previous command might report an error, feel free to ignore it since copy command works\ncat passwd"
            }
          ]
        }
      ]
    }
  ],
  "count": 6,
  "description": "Volumes, PVs, and PVCs.",
  "file": "g.state.md"
};
