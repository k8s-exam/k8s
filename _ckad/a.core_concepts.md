# Core Concepts (13%)

kubernetes.io > Documentation > Reference > kubectl CLI > [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

kubernetes.io > Documentation > Tasks > Monitoring, Logging, and Debugging > [Get a Shell to a Running Container](https://kubernetes.io/docs/tasks/debug-application-cluster/get-shell-running-container/)

kubernetes.io > Documentation > Tasks > Access Applications in a Cluster > [Configure Access to Multiple Clusters](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)

kubernetes.io > Documentation > Tasks > Access Applications in a Cluster > [Accessing Clusters](https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/) using API

kubernetes.io > Documentation > Tasks > Access Applications in a Cluster > [Use Port Forwarding to Access Applications in a Cluster](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)

kubernetes.io > Documentation > Concepts > Overview > Working with Objects > [Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)

kubernetes.io > Documentation > Concepts > Overview > Working with Objects > [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

kubernetes.io > Documentation > Concepts > Overview > Working with Objects > [Annotations](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/)

### Create a namespace called 'atlas' and a pod with image nginx called webserver on this namespace

<details><summary>show</summary>
<p>

```bash
kubectl create namespace atlas
kubectl run webserver --image=nginx --restart=Never -n atlas
```

</p>
</details>

### Create the pod that was just described using YAML

<details><summary>show</summary>
<p>

Easily generate YAML with:

```bash
kubectl run webserver --image=nginx --restart=Never --dry-run=client -n atlas -o yaml > pod.yaml
```

```bash
cat pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: webserver
  name: webserver
  namespace: atlas
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: webserver
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
```

Alternatively, you can run in one line

```bash
kubectl run webserver --image=nginx --restart=Never --dry-run=client -o yaml | kubectl create -n atlas -f -
```

</p>
</details>

### Create a busybox pod (using kubectl command) that runs the command "env". Run it and see the output

<details><summary>show</summary>
<p>

```bash
kubectl run envcheck --image=busybox --command --restart=Never -it --rm -- env # -it will help in seeing the output, --rm will immediately delete the pod after it exits
# or, just run it without -it
kubectl run envcheck --image=busybox --command --restart=Never -- env
# and then, check its logs
kubectl logs envcheck
```

</p>
</details>

### Create a busybox pod (using YAML) that runs the command "env". Run it and see the output

<details><summary>show</summary>
<p>

```bash
# create a  YAML template with this command
kubectl run envcheck --image=busybox --restart=Never --dry-run=client -o yaml --command -- env > envpod.yaml
# see it
cat envpod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: envcheck
  name: envcheck
spec:
  containers:
  - command:
    - env
    image: busybox
    name: envcheck
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
# apply it and then see the logs
kubectl apply -f envpod.yaml
kubectl logs envcheck
```

</p>
</details>

### Get the YAML for a new namespace called 'research' without creating it

<details><summary>show</summary>
<p>

```bash
kubectl create namespace research -o yaml --dry-run=client
```

</p>
</details>

### Create the YAML for a new ResourceQuota called 'cap' with hard limits of 1 CPU, 1G memory and 2 pods without creating it

<details><summary>show</summary>
<p>

```bash
kubectl create quota cap --hard=cpu=1,memory=1G,pods=2 --dry-run=client -o yaml
```

</p>
</details>

### Get pods on all namespaces

<details><summary>show</summary>
<p>

```bash
kubectl get po --all-namespaces
```
Alternatively 

```bash
kubectl get po -A
```
</p>
</details>

### Create a pod with image nginx called webfront and expose traffic on port 80

<details><summary>show</summary>
<p>

```bash
kubectl run webfront --image=nginx --restart=Never --port=80
```

</p>
</details>

### Change pod's image to nginx:1.24.0. Observe that the container will be restarted as soon as the image gets pulled

<details><summary>show</summary>
<p>

*Note*: The `RESTARTS` column should contain 0 initially (ideally - it could be any number)

```bash
# kubectl set image POD/POD_NAME CONTAINER_NAME=IMAGE_NAME:TAG
kubectl set image pod/webfront webfront=nginx:1.24.0
kubectl describe po webfront # you will see an event 'Container will be killed and recreated'
kubectl get po webfront -w # watch it
```

*Note*: some time after changing the image, you should see that the value in the `RESTARTS` column has been increased by 1, because the container has been restarted, as stated in the events shown at the bottom of the `kubectl describe pod` command:

```
Events:
  Type    Reason     Age                  From               Message
  ----    ------     ----                 ----               -------
[...]
  Normal  Killing    100s                 kubelet, node3     Container webfront definition changed, will be restarted
  Normal  Pulling    100s                 kubelet, node3     Pulling image "nginx:1.24.0"
  Normal  Pulled     41s                  kubelet, node3     Successfully pulled image "nginx:1.24.0"
  Normal  Created    36s (x2 over 9m43s)  kubelet, node3     Created container webfront
  Normal  Started    36s (x2 over 9m43s)  kubelet, node3     Started container webfront
```

*Note*: you can check pod's image by running

```bash
kubectl get po webfront -o jsonpath='{.spec.containers[].image}{"\n"}'
```

</p>
</details>

### Get webfront pod's ip created in previous step, use a temp busybox image to wget its '/'

<details><summary>show</summary>
<p>

```bash
kubectl get po -o wide # get the IP, will be something like '10.1.1.131'
# create a temp busybox pod
kubectl run netprobe --image=busybox --rm -it --restart=Never -- wget -O- 10.1.1.131:80
```

Alternatively you can also try a more advanced option:

```bash
# Get IP of the webfront pod
WEBFRONT_IP=$(kubectl get pod webfront -o jsonpath='{.status.podIP}')
# create a temp busybox pod
kubectl run netprobe --image=busybox --env="WEBFRONT_IP=$WEBFRONT_IP" --rm -it --restart=Never -- sh -c 'wget -O- $WEBFRONT_IP:80'
``` 

Or just in one line:

```bash
kubectl run netprobe --image=busybox --rm -it --restart=Never -- wget -O- $(kubectl get pod webfront -o jsonpath='{.status.podIP}:{.spec.containers[0].ports[0].containerPort}')
```

</p>
</details>

### Get pod's YAML

<details><summary>show</summary>
<p>

```bash
kubectl get po webfront -o yaml
# or
kubectl get po webfront -oyaml
# or
kubectl get po webfront --output yaml
# or
kubectl get po webfront --output=yaml
```

</p>
</details>

### Get information about the pod, including details about potential issues (e.g. pod hasn't started)

<details><summary>show</summary>
<p>

```bash
kubectl describe po webfront
```

</p>
</details>

### Get pod logs

<details><summary>show</summary>
<p>

```bash
kubectl logs webfront
```

</p>
</details>

### If pod crashed and restarted, get logs about the previous instance

<details><summary>show</summary>
<p>

```bash
kubectl logs webfront -p
# or
kubectl logs webfront --previous
```

</p>
</details>

### Execute a simple shell on the webfront pod

<details><summary>show</summary>
<p>

```bash
kubectl exec -it webfront -- /bin/sh
```

</p>
</details>

### Create a busybox pod that echoes 'hello world' and then exits

<details><summary>show</summary>
<p>

```bash
kubectl run echoer --image=busybox -it --restart=Never -- echo 'hello world'
# or
kubectl run echoer --image=busybox -it --restart=Never -- /bin/sh -c 'echo hello world'
```

</p>
</details>

### Do the same, but have the pod deleted automatically when it's completed

<details><summary>show</summary>
<p>

```bash
kubectl run echoer --image=busybox -it --rm --restart=Never -- /bin/sh -c 'echo hello world'
kubectl get po # nowhere to be found :)
```

</p>
</details>

### Create an nginx pod and set an env value as 'var1=val1'. Check the env value existence within the pod

<details><summary>show</summary>
<p>

```bash
kubectl run envbox --image=nginx --restart=Never --env=var1=val1
# then
kubectl exec -it envbox -- env
# or
kubectl exec -it envbox -- sh -c 'echo $var1'
# or
kubectl describe po envbox | grep val1
# or
kubectl run envbox --restart=Never --image=nginx --env=var1=val1 -it --rm -- env
# or
kubectl run envbox --image nginx --restart=Never --env=var1=val1 -it --rm -- sh -c 'echo $var1'
```

</p>
</details>

## Labels and Selectors

### Create two nginx pods, one labelled `app=frontend,tier=web` and one `app=backend,tier=web`, then list them with an equality-based label selector

<details><summary>show</summary>
<p>

```bash
kubectl run web-front --image=nginx --restart=Never --labels=app=frontend,tier=web
kubectl run web-back --image=nginx --restart=Never --labels=app=backend,tier=web

# equality-based: '=' and '==' are synonyms, '!=' is inequality
kubectl get pods -l app=frontend
kubectl get pods -l 'app!=backend'
```

</p>
</details>

Per the official [Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) page, labels are key/value pairs attached to objects and `-l` filters by them. Equality-based requirements use `=`, `==` or `!=`; a comma acts as a logical AND.

### List pods using set-based label selectors (`in`, `notin`), including a combined selector

<details><summary>show</summary>
<p>

```bash
# value must be one of the listed set
kubectl get pods -l 'app in (frontend,backend)'

# value must NOT be in the set
kubectl get pods -l 'app notin (frontend)'

# mixed set-based + equality-based; comma = AND
kubectl get pods -l 'app in (frontend,backend),tier=web'
```

</p>
</details>

Per the official [Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) page, set-based requirements use `in`, `notin`, and existence (`partition`, `!partition`). There is no logical OR operator — comma always means AND.

### Show the labels of pods as extra columns with `-L`, and dump all labels with `--show-labels`

<details><summary>show</summary>
<p>

```bash
kubectl get pods -L app -L tier
# pods without the label show '<none>' in the new column

kubectl get pods --show-labels
# or the raw YAML
kubectl get pod web-front -o yaml | grep -A2 labels
```

</p>
</details>

### Add a label `env=prod` to an existing pod, then update it to `env=staging` (requires `--overwrite`)

<details><summary>show</summary>
<p>

```bash
kubectl label pod web-front env=prod
kubectl get pod web-front --show-labels

# updating a label that already exists fails without --overwrite
kubectl label pod web-front env=staging --overwrite
kubectl get pod web-front --show-labels
```

</p>
</details>

Labels can be attached at creation time and added or modified afterwards with `kubectl label` — see the official [Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) page.

## Annotations

### Add an annotation `owner=team-a` to the `web-front` pod and read it back

<details><summary>show</summary>
<p>

```bash
kubectl annotate pod web-front owner=team-a
kubectl get pod web-front -o jsonpath='{.metadata.annotations}'
# or
kubectl describe pod web-front | grep -A1 Annotations
```

</p>
</details>

Per the official [Annotations](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/) page, annotations are key/value maps attached to objects for **non-identifying** metadata (they cannot be used to select objects, unlike labels). Both keys and values must be strings.

## Namespaces

### List all namespaces and name the four namespaces a cluster starts with

<details><summary>show</summary>
<p>

```bash
kubectl get namespace
# or
kubectl get ns
```

</p>
</details>

Per the official [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) page, Kubernetes starts with four namespaces: `default` (start using the cluster without creating one), `kube-node-lease` (node heartbeats/leases), `kube-public` (readable by all clients, incl. unauthenticated), and `kube-system` (objects created by the Kubernetes system). Avoid the reserved `kube-` prefix for your own namespaces.

### Set the namespace preference for the current context, then verify and reset it

<details><summary>show</summary>
<p>

```bash
kubectl config set-context --current --namespace=atlas
# verify it was saved
kubectl config view --minify | grep namespace:
# now every kubectl command (without -n) targets 'atlas'
kubectl get pods

# reset back
kubectl config set-context --current --namespace=default
```

</p>
</details>

Per the official [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) page, `kubectl config set-context --current --namespace=<name>` permanently saves the namespace for all subsequent commands in that context.

### Find out which resource types are namespaced and which are cluster-scoped

<details><summary>show</summary>
<p>

```bash
# resources that live inside a namespace
kubectl api-resources --namespaced=true

# resources that are cluster-wide (not in a namespace)
kubectl api-resources --namespaced=false
```

</p>
</details>

Per the official [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) page, most resources (Pods, Services, Deployments...) are namespaced, while low-level resources such as Nodes and PersistentVolumes are not in any namespace.

## Cluster introspection with kubectl

### Get the control-plane address and the current kubectl context

<details><summary>show</summary>
<p>

```bash
kubectl cluster-info
kubectl config current-context
kubectl config get-contexts
```

</p>
</details>

`kubectl cluster-info` shows the URLs of the control plane and add-ons; `kubectl config current-context` tells you which cluster you are talking to (see the official [Accessing Clusters](https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/) page).

### Use `kubectl explain` to discover the fields of the Pod resource

<details><summary>show</summary>
<p>

```bash
kubectl explain pod
kubectl explain pod.spec
kubectl explain pod.spec.containers
```

</p>
</details>

`kubectl explain` documents the API resources and their fields straight from the cluster, which is handy when writing manifests (e.g. `.spec.containers[].image`).

### List the nodes and their details with `-o wide`

<details><summary>show</summary>
<p>

```bash
kubectl get nodes
kubectl get nodes -o wide   # adds INTERNAL-IP, OS-IMAGE, KERNEL-VERSION, CONTAINER-RUNTIME
```

</p>
</details>

### List all resources in a namespace with `kubectl get all`

<details><summary>show</summary>
<p>

```bash
kubectl get all -n default
# or, if your namespace preference is set
kubectl get all
```

</p>
</details>

`kubectl get all` is a convenience that lists the common workload and service resources (pods, services, deployments, replicasets, statefulsets) in a namespace. It does **not** list everything — `kubectl get all` omits things like ConfigMaps and Secrets.
