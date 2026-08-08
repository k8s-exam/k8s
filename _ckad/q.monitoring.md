# Monitoring & Logging

kubernetes.io > Documentation > Tasks > Troubleshooting Clusters > [Tools for Monitoring Resources](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-usage-monitoring/)

kubernetes.io > Documentation > Tasks > Monitoring, Logging, and Debugging > [Logging in Kubernetes](https://kubernetes.io/docs/tasks/debug/logging/)

> `kubectl top` is served by the **Metrics API**, so it only works when `metrics-server` is installed (`kubectl get pods -n kube-system | grep metrics-server`). Log flags are read directly by the kubelet, so they need no extra component. Original names: `sampler`, `duet`.

## Resource usage (`kubectl top`)

### Show CPU and memory usage for every node in the cluster.

<details><summary>show</summary>
<p>

```bash
kubectl top nodes
```

</p>
</details>

Sample output:

```
NAME            CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
controlplane    146m         7%     1434            74%
worker1         66m          3%     901             47%
```

Explanation: the numbers come from the in-cluster `metrics-server`, which scrapes the kubelet's stats summary over HTTPS. Without it the command errors with `unable to retrieve metrics`.

### Show usage for every pod (all namespaces) and sort it by CPU descending.

<details><summary>show</summary>
<p>

```bash
kubectl top pods -A
kubectl top pod -A --sort-by=cpu
# or for memory:
kubectl top pod -A --sort-by=memory
```

</p>
</details>

### A pod may run several containers; show per-container usage.

<details><summary>show</summary>
<p>

```bash
kubectl top pod duet -n default --containers
```

</p>
</details>

Explanation: `--containers` breaks the pod's aggregate line out into one row per container; the pod name is required (no `pods -n … --containers` without a specific pod).

## Logs

### Create a `sampler` pod that writes a timestamped line every second, then stream its logs.

<details><summary>show</summary>
<p>

```bash
kubectl run sampler --image=busybox --restart=Never -- /bin/sh -c 'i=0; while true; do echo "$i: $(date)"; i=$((i+1)); sleep 1; done'

kubectl logs sampler                 # print the logs accumulated so far
kubectl logs -f sampler              # follow (stream) the logs
```

</p>
</details>

### Show the last 5 lines, only from the last 30 seconds, with timestamps prefixed.

<details><summary>show</summary>
<p>

```bash
kubectl logs --tail=5 --since=30s --timestamps sampler
```

</p>
</details>

Explanation: `--tail`, `--since` and `--timestamps` are purely client-side filters on the log stream. `--since` takes a duration (`30s`, `5m`, `1h`); `--since-time` takes an RFC3339 timestamp.

### Create a multi-container pod `duet` (nginx + busybox side-car) and fetch logs from one specific container, then from all containers at once.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: duet
spec:
  restartPolicy: Never
  containers:
  - name: web
    image: nginx
  - name: side
    image: busybox
    command: ["sh","-c","while true; do echo side: $(date +%s); sleep 5; done"]
EOF
kubectl logs duet -c side            # only the side-car's logs
kubectl logs duet --all-containers   # all containers in the pod
```

</p>
</details>

### When a container has restarted, print the logs it produced **before** the restart.

<details><summary>show</summary>
<p>

```bash
kubectl logs -p duet -c side         # -p/--previous: logs from the prior container instance
```

</p>
</details>

### Aggregate logs across multiple pods by label.

<details><summary>show</summary>
<p>

```bash
kubectl logs -l app=duet --all-containers=true -f --since=10s
```

</p>
</details>

Explanation: `-l` selects pods by label; with `-f` it follows the union of their streams. `--prefix` adds the `namespace/pod/container` prefix so you can tell the streams apart:
```bash
kubectl logs -l app=duet --all-containers=true --prefix=true
```

## Events and node health

### Inspect why a pod is stuck (recent events) and list cluster-wide events in chronological order.

<details><summary>show</summary>
<p>

```bash
kubectl describe pod duet
# the Events section at the bottom usually explains ImagePullBackOff/OOMKilled/scheduling failures

kubectl get events -A --sort-by=.lastTimestamp
```

</p>
</details>

Explanation: `kubectl describe` appends the pod's recent events; `kubectl get events --sort-by=.lastTimestamp` orders the whole list (default is newest-last). For a compact filter:
```bash
kubectl get events --field-selector type=Warning
```
