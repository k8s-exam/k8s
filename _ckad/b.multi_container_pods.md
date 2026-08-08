# Multi-container Pods

kubernetes.io > Documentation > Concepts > Workloads > Pods > [Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)

kubernetes.io > Documentation > Concepts > Workloads > Pods > [Sidecar Containers](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/)

kubernetes.io > Documentation > Tasks > Configure Pods and Containers > [Share Process Namespace between Containers in a Pod](https://kubernetes.io/docs/tasks/configure-pod-container/share-process-namespace/)

> **Story arc for this topic.** You are shipping a web frontend (nginx) and you need sidekicks around it: first a debug container that shares its network namespace, then a shared log-volume sidecar so the frontend can serve a pre-built index.html, then an init container that fetches a config file before nginx starts, and finally a process-namespace-shared pod where one container tails the others logs. Each exercise builds on the previous one so the concepts stick. Original names: `duo`, `portal`, `sharedlogs`, `init`, `procshare`.

## Containers that share a pod

### Create a Pod with two containers, both with image busybox and command "echo hello; sleep 3600". Connect to the second container and run 'ls'.

<details><summary>show</summary>
<p>

The easiest way is to create a pod with a single container and save its definition in a YAML file:

```bash
kubectl run duo --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'echo hello;sleep 3600' > duo.yaml
vi duo.yaml
```

Copy/paste the container related values, so your final YAML should contain the following two containers (make sure those containers have a different name; each container in a pod must be uniquely named):

```YAML
containers:
  - args:
    - /bin/sh
    - -c
    - echo hello;sleep 3600
    image: busybox
    imagePullPolicy: IfNotPresent
    name: main
    resources: {}
  - args:
    - /bin/sh
    - -c
    - echo hello;sleep 3600
    image: busybox
    name: helper
```

```bash
kubectl create -f duo.yaml
# Connect to the helper container within the pod
kubectl exec -it duo -c helper -- /bin/sh
ls
exit

# or you can do the above with just a one-liner
kubectl exec -it duo -c helper -- ls

# you can do some cleanup
kubectl delete po duo
```

</p>
</details>

Explanation: containers in the same pod share the same network namespace (same IP, localhost), and you target a specific container with `kubectl exec -c <container-name> ...`. The pod's `restartPolicy` defaults to `Always` for the pod object, but for one-shot/debug pods you typically set it to `Never` or `OnFailure`.

### Using the same pod, prove the two containers share the same network namespace: exec into each and print both the pod IP (from the downward API) and the IP of `localhost` as seen by `ping`.

<details><summary>show</summary>
<p>

Containers in a pod share one network namespace, so they all see the same IP on `eth0` and `localhost`. Exec into each container and confirm they resolve to the same pod IP, and that `localhost` is reachable from both:

```bash
# recreate duo if you deleted it
kubectl apply -f duo.yaml

# pod IP from the downward API / status
PODIP=$(kubectl get pod duo -o jsonpath='{.status.podIP}')

echo "=== main container sees pod IP $PODIP and localhost as 127.0.0.1 ==="
kubectl exec duo -c main -- /bin/sh -c "echo PODIP=$PODIP; getent hosts \$(hostname -i); ping -c1 -w2 127.0.0.1"

echo "=== helper container sees the SAME pod IP and its own localhost ==="
kubectl exec duo -c helper -- /bin/sh -c "echo PODIP=$PODIP; getent hosts \$(hostname -i); ping -c1 -w2 127.0.0.1"
```

Both containers report the same IP — that's the shared network namespace. Cleanup:

```bash
kubectl delete po duo
```

</p>
</details>

Explanation: because both containers live in one pod they share the pod's network namespace (single IP, shared localhost). This is the foundation of the sidecar pattern: a sidecar proxy can listen on `localhost:15000` and the app container reaches it over localhost without touching the network.

## Sidecar containers sharing data

### Create a Deployment `sharedlogs` (nginx) exposed on port 80, and a sidecar `busybox` container that writes an `index.html` (via `echo`) into a shared `emptyDir` volume mounted at `/usr/share/nginx/html` in the nginx container and `/shared` in the sidecar. Confirm nginx serves the sidecar-written file by curling the pod IP from another pod.

<details><summary>show</summary>
<p>

The sidecar shares an `emptyDir` volume with nginx so it can drop a file nginx then serves. Because the sidecar must keep writing (or in a real scenario tail logs), it runs alongside nginx as a regular container, not an init container:

```bash
kubectl create deployment sharedlogs --image=nginx --port=80 --dry-run=client -o yaml > sharedlogs.yaml
vi sharedlogs.yaml
```

Add the sidecar and the shared volume:

```YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: sharedlogs
  name: sharedlogs
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sharedlogs
  template:
    metadata:
      labels:
        app: sharedlogs
    spec:
      containers:
      - image: nginx
        name: web
        ports:
        - containerPort: 80
        volumeMounts:
        - name: content
          mountPath: /usr/share/nginx/html
      - image: busybox
        name: sidecar
        command: ["/bin/sh", "-c"]
        args:
        - while true; do echo "<h1>Hello from sidecar at $(date)</h1>" > /shared/index.html; sleep 5; done
        volumeMounts:
        - name: content
          mountPath: /shared
      volumes:
      - name: content
        emptyDir: {}
      # nginx serves /usr/share/nginx/html/index.html by default
```

```bash
kubectl apply -f sharedlogs.yaml
kubectl rollout status deployment sharedlogs

# confirm nginx serves the sidecar-written content
PODIP=$(kubectl get pod -l app=sharedlogs -o jsonpath='{.items[0].status.podIP}')
kubectl run tmp --image=busybox --rm -it --restart=Never -- \
  wget -qO- "http://$PODIP/"          # expect the <h1>Hello from sidecar</h1> line

kubectl delete deployment sharedlogs
```

</p>
</details>

Explanation: the sidecar is a second container in the same pod; it owns its lifecycle but shares the pod's network and any volumes it mounts. Here the sidecar continuously (over)writes `index.html` on an `emptyDir` that nginx mounts at its document root, so nginx serves the sidecar's content.

## Init containers (run before app containers)

### Create a pod `portal` with one nginx container exposed on port 80 and a single init container (image `busybox`) that writes `echo "Test" > /work-dir/index.html`. Share an `emptyDir` volume (`content`) between them: mount it at `/usr/share/nginx/html` in nginx and `/work-dir` in the init container. Get the pod IP and fetch it from a second pod to confirm nginx serves the init-written file.

<details><summary>show</summary>
<p>

Init containers run to completion **before** the app containers start, so the init container pre-seeds the shared volume that nginx then serves:

```bash
kubectl run portal --image=nginx --restart=Never --port=80 --dry-run=client -o yaml > portal.yaml
vi portal.yaml
```

Final manifest:

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: portal
spec:
  initContainers:
  - args:
    - /bin/sh
    - -c
    - echo "Test" > /work-dir/index.html
    image: busybox
    name: pagewriter
    volumeMounts:
    - name: content
      mountPath: /work-dir
  containers:
  - image: nginx
    name: web
    ports:
    - containerPort: 80
    volumeMounts:
    - name: content
      mountPath: /usr/share/nginx/html
  volumes:
  - name: content
    emptyDir: {}
```

```bash
kubectl apply -f portal.yaml
kubectl get po -w portal       # watch Init:0/1 -> Running

PODIP=$(kubectl get pod portal -o jsonpath='{.status.podIP}')
kubectl run checker --image=busybox --rm -it --restart=Never -- \
  wget -qO- "http://$PODIP/"    # expect: Test

kubectl delete po portal
```

</p>
</details>

Explanation: as the official docs state, init containers "run before app containers are started", "each init container must complete successfully before the next one starts", and the field is `initContainers` alongside `containers` in the Pod spec. Here nginx only starts after the init container finishes writing `index.html`, so the page is guaranteed to exist when nginx boots.

## Multiple init containers

### Extend `portal` so that there are TWO init containers that must run sequentially: `prep` (`busybox`) creates `/work-dir/setup.done`, then `writer` writes `echo "Test" > /work-dir/index.html` only after `prep` finished. Keep nginx serving `/usr/share/nginx/html`. Inspect `.status.initContainerStatuses` to confirm `prep` completed (Completed) before `writer` ran.

<details><summary>show</summary>
<p>

Add a second init container. Kubernetes runs them in the order listed in the `initContainers` array:

```bash
vi portal.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: portal
spec:
  initContainers:
  - name: prep
    image: busybox
    command: ["/bin/sh", "-c"]
    args:
    - mkdir -p /work-dir && touch /work-dir/setup.done
    volumeMounts:
    - name: content
      mountPath: /work-dir
  - name: writer
    image: busybox
    command: ["/bin/sh", "-c"]
    args:
    - echo "Test" > /work-dir/index.html
    volumeMounts:
    - name: content
      mountPath: /work-dir
  containers:
  - image: nginx
    name: web
    ports:
    - containerPort: 80
    volumeMounts:
    - name: content
      mountPath: /usr/share/nginx/html
  volumes:
  - name: content
    emptyDir: {}
```

```bash
kubectl apply -f portal.yaml
kubectl rollout status pod/portal 2>/dev/null || kubectl get po -w portal

# confirm the init containers ran in order via status
kubectl get pod portal -o jsonpath='{range .status.initContainerStatuses[*]}{.containerID} {.state.terminated.reason}{"\n"}{end}'

PODIP=$(kubectl get pod portal -o jsonpath='{.status.podIP}')
kubectl run checker --image=busybox --rm -it --restart=Never -- wget -qO- "http://$PODIP/"   # Test
kubectl delete po portal
```

</p>
</details>

Explanation: the official docs note "each init container must complete successfully before the next one starts" — the `.status.initContainerStatuses` array reflects exactly this ordering and each container's `terminated.reason` (Completed). This is useful for ordered setup steps like "create namespace" -> "seed config".

## Sharing the process namespace

### Enable `shareProcessNamespace` on the `duo` pod so containers can see each others processes. Create the pod with two busybox containers, then from the `main` container run `ps aux` and show that the `helper` container's `sleep` process is visible (via the shared PID namespace), and vice-versa.

<details><summary>show</summary>
<p>

Setting `shareProcessNamespace: true` on the pod spec gives all containers a shared PID namespace, so `ps` inside one container shows processes from the others:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: procshare
spec:
  shareProcessNamespace: true
  containers:
  - name: main
    image: busybox
    command: ["/bin/sh","-c","sleep 3600"]
  - name: helper
    image: busybox
    command: ["/bin/sh","-c","sleep 3600"]
EOF
kubectl wait --for=condition=Ready pod/procshare

echo "=== processes visible from 'main' (incl. helper's sleep) ==="
kubectl exec procshare -c main -- ps aux

echo "=== processes visible from 'helper' (incl. main's sleep) ==="
kubectl exec procshare -c helper -- ps aux
```

Each container's `sleep` shows up in the other container's `ps` output — proof of the shared PID namespace. Cleanup: `kubectl delete po procshare`.

</p>
</details>

Explanation: per the official "Share Process Namespace" task, when `shareProcessNamespace: true` the first process in each container is PID 1 of that container, and other containers' processes are visible. This is the mechanism `kubectl debug` uses to attach debug tooling into a running pod. Note all containers must agree on the namespace, so this is an explicit opt-in at the pod level.

### With `shareProcessNamespace: true` still set, demonstrate inter-container signaling: recreate `procshare` so the `main` container runs `tail -f /dev/null` (a distinctive process name), then from the `helper` container send `SIGTERM` to that process. Confirm from `main` that the PID is identical across containers (the shared namespace), and observe the signal terminating the process cross-container.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: procshare
spec:
  shareProcessNamespace: true
  containers:
  - name: main
    image: busybox
    command: ["/bin/sh","-c","tail -f /dev/null"]   # distinctive comm -> easy to find in ps
  - name: helper
    image: busybox
    command: ["/bin/sh","-c","sleep 3600"]
EOF
kubectl wait --for=condition=Ready pod/procshare

# find main's tail process as seen from helper (shared PID ns -> same PID number)
MAINPID=$(kubectl exec procshare -c helper -- ps -o pid,comm | awk '/tail/{print $1; exit}')
echo "main's tail PID (seen from helper): $MAINPID"

# the same PID must be visible from main too -> the namespace is truly shared
kubectl exec procshare -c main -- ps -o pid,comm | grep tail

# signal it from helper; the signal crosses the shared PID namespace boundary
kubectl exec procshare -c helper -- kill -TERM "$MAINPID" && echo "sent SIGTERM to PID $MAINPID from helper"
kubectl get pod procshare -o jsonpath='{range .status.containerStatuses[*]}{.name}: restartCount={.restartCount}{"\n"}{end}'
# main's tail was terminated by the signal, so the kubelet restarts main (main: restartCount=1)

kubectl delete po procshare
```

> **Note on signaling and PID 1.** In a shared PID namespace the first process of every container is visible pod-wide, but PID 1 of the namespace belongs to the sandbox (`/pause`), not to your container. A signal's effect depends on the target: busybox's `sleep` and `tail` do **not** ignore signals — `SIGTERM`/`SIGUSR1` terminate them (so the exercise's original "signals do not kill sleep" claim was wrong). The official docs instead demonstrate `kill -HUP` against nginx's master process, which (re)spawns its workers; that variant needs the `SYS_PTRACE` capability on the signaling container.

</p>
</details>

Explanation: because the PID namespace is shared, the PID you read from `helper`'s `ps` is the **same numeric PID** the `main` container sees, and `kill` from one container targets a process owned by another. This is exactly how an in-pod sidecar can manage/health-check a sibling container without leaving the pod.

## Bringing it together

### Build the canonical sidecar-from-the-docs example: a pod `sharedlogs` with one nginx container (port 80) and a sidecar `busybox` that tails the nginx access log (`/var/log/nginx/access.log`) and mirrors it to `/var/log/nginx/mirror.log` on the same `emptyDir` volume, using `shareProcessNamespace: true` so the sidecar can also `tail` nginx's open file descriptor via `/proc/<pid>/fd`. Keep nginx serving its default page.

<details><summary>show</summary>
<p>

This combines a shared volume AND the shared PID namespace so the sidecar can read nginx's access log both from disk and via the process FD table:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: sharedlogs
spec:
  shareProcessNamespace: true
  volumes:
  - name: logs
    emptyDir: {}
  containers:
  - name: web
    image: nginx
    ports:
    - containerPort: 80
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
  - name: sidecar
    image: busybox
    command: ["/bin/sh","-c"]
    args:
    - |
      # mirror the access log to a sibling file every few seconds
      while true; do
        if [ -f /var/log/nginx/access.log ]; then
          tail -n 50 /var/log/nginx/access.log > /var/log/nginx/mirror.log
        fi
        sleep 5
      done
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
EOF
kubectl wait --for=condition=Ready pod/sharedlogs

# generate some access-log traffic against nginx (same pod IP -> localhost)
# NOTE: the nginx image ships curl but NOT wget, so use curl here (wget would fail with "not found")
kubectl exec sharedlogs -c web -- sh -c 'while true; do curl -s http://127.0.0.1/ >/dev/null; sleep 1; done &'

sleep 7
echo "=== /var/log/nginx/access.log (written by nginx) ==="
kubectl exec sharedlogs -c web -- cat /var/log/nginx/access.log
echo "=== /var/log/nginx/mirror.log (written by sidecar) ==="
kubectl exec sharedlogs -c sidecar -- cat /var/log/nginx/mirror.log

kubectl delete po sharedlogs
```

</p>
</details>

Explanation: this is the sidecar pattern in miniature — the sidecar shares nginx's log volume (via `emptyDir`) and, thanks to `shareProcessNamespace: true`, could additionally inspect nginx's open files through `/proc/<nginx-pid>/fd`. The sidecar owns the log-mirroring responsibility while nginx owns serving traffic; neither can be removed without breaking the contract, and both are declared as sibling `containers` (not init containers, which run to completion then exit).

### Troubleshooting exercise: a colleague created a pod `broken` with one nginx container, but the pod is stuck in `Init:0/1` and never becomes ready. Inspect the pod, explain why, and fix it **without changing the nginx image** — only by adding an init container that writes `mkdir -p /usr/share/nginx/html && echo "ok" > /usr/share/nginx/html/index.html` so nginx has something to serve.

<details><summary>show</summary>
<p>

First reproduce the broken pod. A plain nginx pod alone would come up `1/1 Running`, so the scenario needs the failing init container that actually puts the pod in `Init:0/1`:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: broken
spec:
  initContainers:
  - name: bad-init
    image: busybox
    command: ["/bin/sh","-c"]
    args:
    - "exit 1"    # the failing init container that blocks the app container
  containers:
  - name: web
    image: nginx
    ports:
    - containerPort: 80
EOF
kubectl get po -w broken   # observe Init:0/1 (or Init:CrashLoopBackOff)
```

Inspect why it is stuck:

```bash
kubectl describe pod broken
# look at "Init:" line and any events; a stuck Init:0/1 means an init
# container did not complete.
kubectl get pod broken -o jsonpath='{.status.initContainerStatuses[0].state}'
```

The fix is to replace the failing init container with one that pre-creates the document root, so the app container (nginx) has the file it expects before it starts — without touching the nginx image:

```bash
kubectl delete pod broken

kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: broken
spec:
  initContainers:
  - name: prep-html
    image: busybox
    command: ["/bin/sh","-c"]
    args:
    - mkdir -p /usr/share/nginx/html && echo "ok" > /usr/share/nginx/html/index.html
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
  containers:
  - name: web
    image: nginx
    ports:
    - containerPort: 80
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
  volumes:
  - name: html
    emptyDir: {}
EOF
kubectl wait --for=condition=Ready pod/broken
kubectl get pod broken -o jsonpath='{.status.phase}'
kubectl delete pod broken
```

</p>
</details>

Explanation: the pod was `Init:0/1` because an init container was failing, so the app container never got a successful preconditions pass. Per the official docs, "if a Pod's init container fails, the kubelet repeatedly restarts that init container until it succeeds" (and with `restartPolicy: Never` a failed init makes the Pod Failed). The cleanest fix is to swap in a `busybox` init container that seeds `/usr/share/nginx/html/index.html` on a shared `emptyDir`, leaving the nginx image untouched — then nginx starts into a populated document root and becomes Ready.

## Recap

**Summary table**

| Pattern | Field | Runs... | Use case |
|---|---|---|---|
| Regular container | `containers` | with the pod, forever | app / sidecar / ambassador |
| Init container | `initContainers` | before app containers, to completion, sequentially | pre-seed data, wait for a dependency, one-time setup |
| `shareProcessNamespace: true` | pod `spec` | whole-pod opt-in | one container inspects/mutates another via `/proc/<pid>` |
| Shared volume | `volumes` + `volumeMounts` | across co-scheduled containers | pass files/config between sidecars |

- Containers in a pod share the **network** namespace (one IP, shared localhost).
- Multiple regular containers are declared under `containers` (the sidecar pattern).
- Init containers are declared under `initContainers` and run **to completion, in order, before** the `containers` start — "each must complete successfully before the next starts".
- `shareProcessNamespace: true` opts the whole-pod into a shared **PID** namespace so containers can see and signal each others processes.
- Containers share filesystem data via a mounted `emptyDir` (or other Volume).

