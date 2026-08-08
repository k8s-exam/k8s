# Observability

## Liveness, readiness and startup probes

kubernetes.io > Documentation > Tasks > Configure Pods and Containers > [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

### Create an nginx pod with a liveness probe that just runs the command 'ls'. Save its YAML in pod.yaml. Run it, check its probe status, delete it.

<details><summary>show</summary>
<p>

```bash
kubectl run sentinel --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: sentinel
  name: sentinel
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: sentinel
    resources: {}
    livenessProbe: # our probe
      exec: # add this line
        command: # command definition
        - ls # ls command
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl describe pod sentinel | grep -i liveness # run this to see that liveness probe works
kubectl delete -f pod.yaml
```

</p>
</details>

### Modify the pod.yaml file so that liveness probe starts kicking in after 5 seconds whereas the interval between probes would be 5 seconds. Run it, check the probe, delete it.

<details><summary>show</summary>
<p>

```bash
kubectl explain pod.spec.containers.livenessProbe # get the exact names
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: sentinel
  name: sentinel
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: sentinel
    resources: {}
    livenessProbe:
      initialDelaySeconds: 5 # add this line
      periodSeconds: 5 # add this line as well
      exec:
        command:
        - ls
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl describe po sentinel | grep -i liveness
kubectl delete -f pod.yaml
```

</p>
</details>

### Create an nginx pod (that includes port 80) with an HTTP readinessProbe on path '/' on port 80. Again, run it, check the readinessProbe, delete it.

<details><summary>show</summary>
<p>

```bash
kubectl run relay --image=nginx --dry-run=client -o yaml --restart=Never --port=80 > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: relay
  name: relay
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: relay
    resources: {}
    ports:
    - containerPort: 80 # Note: Readiness probes runs on the container during its whole lifecycle. Since nginx exposes 80, containerPort: 80 is not required for readiness to work.
    readinessProbe: # declare the readiness probe
      httpGet: # add this line
        path: / #
        port: 80 #
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl describe pod relay | grep -i readiness # to see the pod readiness details
kubectl delete -f pod.yaml
```

</p>
</details>

### Lots of pods are running in `alpha`,`beta`,`gamma`,`delta` namespaces.  All of these pods are configured with liveness probe.  Please list all pods whose liveness probe are failed in the format of `<namespace>/<pod name>` per line.

<details><summary>show</summary>
<p>

A typical liveness probe failure event
```
LAST SEEN   TYPE      REASON      OBJECT              MESSAGE
22m         Warning   Unhealthy   pod/sentinel        Liveness probe failed: cat: can't open '/tmp/healthy': No such file or directory
```

collect failed pods namespace by namespace

```sh
kubectl get events -A -o json | jq -r '.items[] | select(.message | contains("Liveness probe failed")).involvedObject | .namespace + "/" + .name'
```

</p>
</details>

## Logging

### Create a busybox pod that runs `i=0; while true; do echo "$i: $(date)"; i=$((i+1)); sleep 1; done`. Check its logs

<details><summary>show</summary>
<p>

```bash
kubectl run logger --image=busybox --restart=Never -- /bin/sh -c 'i=0; while true; do echo "$i: $(date)"; i=$((i+1)); sleep 1; done'
kubectl logs logger -f # follow the logs
```

</p>
</details>

## Debugging

### Create a busybox pod that runs 'ls /notexist'. Determine if there's an error (of course there is), see it. In the end, delete the pod

<details><summary>show</summary>
<p>

```bash
kubectl run faulty --restart=Never --image=busybox -- /bin/sh -c 'ls /notexist'
# show that there's an error
kubectl logs faulty
kubectl describe po faulty
kubectl delete po faulty
```

</p>
</details>

### Create a busybox pod that runs 'notexist'. Determine if there's an error (of course there is), see it. In the end, delete the pod forcefully with a 0 grace period

<details><summary>show</summary>
<p>

```bash
kubectl run broken --restart=Never --image=busybox -- notexist
kubectl logs broken # will bring nothing! container never started
kubectl describe po broken # in the events section, you'll see the error
# also...
kubectl get events | grep -i error # you'll see the error here as well
kubectl delete po broken --force --grace-period=0
```

</p>
</details>


### Get CPU/memory utilization for nodes ([metrics-server](https://github.com/kubernetes-sigs/metrics-server) must be running)

<details><summary>show</summary>
<p>

```bash
kubectl top nodes
```

</p>
</details>
