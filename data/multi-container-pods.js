window.CKAD_TOPIC = {
  "slug": "multi-container-pods",
  "title": "Multi-container Pods",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Workloads &gt; Pods &gt; <a href=\"https://kubernetes.io/docs/concepts/workloads/pods/init-containers/\" target=\"_blank\" rel=\"noopener\">Init Containers</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Workloads &gt; Pods &gt; <a href=\"https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/\" target=\"_blank\" rel=\"noopener\">Sidecar Containers</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Configure Pods and Containers &gt; <a href=\"https://kubernetes.io/docs/tasks/configure-pod-container/share-process-namespace/\" target=\"_blank\" rel=\"noopener\">Share Process Namespace between Containers in a Pod</a>"
    },
    {
      "type": "text",
      "html": "&gt; <strong>Story arc for this topic.</strong> You are shipping a web frontend (nginx) and you need sidekicks around it: first a debug container that shares its network namespace, then a shared log-volume sidecar so the frontend can serve a pre-built index.html, then an init container that fetches a config file before nginx starts, and finally a process-namespace-shared pod where one container tails the others logs. Each exercise builds on the previous one so the concepts stick. Original names: <code>duo</code>, <code>portal</code>, <code>sharedlogs</code>, <code>init</code>, <code>procshare</code>."
    }
  ],
  "sections": [
    {
      "heading": "Containers that share a pod",
      "id": "containers-that-share-a-pod",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a Pod with two containers, both with image busybox and command &quot;echo hello; sleep 3600&quot;. Connect to the second container and run 'ls'.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "The easiest way is to create a pod with a single container and save its definition in a YAML file:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run duo --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'echo hello;sleep 3600' > duo.yaml\nvi duo.yaml"
            },
            {
              "type": "text",
              "html": "Copy/paste the container related values, so your final YAML should contain the following two containers (make sure those containers have a different name; each container in a pod must be uniquely named):"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "containers:\n  - args:\n    - /bin/sh\n    - -c\n    - echo hello;sleep 3600\n    image: busybox\n    imagePullPolicy: IfNotPresent\n    name: main\n    resources: {}\n  - args:\n    - /bin/sh\n    - -c\n    - echo hello;sleep 3600\n    image: busybox\n    name: helper"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f duo.yaml\n# Connect to the helper container within the pod\nkubectl exec -it duo -c helper -- /bin/sh\nls\nexit\n# or you can do the above with just a one-liner\nkubectl exec -it duo -c helper -- ls\n# you can do some cleanup\nkubectl delete po duo"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: containers in the same pod share the same network namespace (same IP, localhost), and you target a specific container with <code>kubectl exec -c &lt;container-name&gt; ...</code>. The pod's <code>restartPolicy</code> defaults to <code>Always</code> for the pod object, but for one-shot/debug pods you typically set it to <code>Never</code> or <code>OnFailure</code>."
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Using the same pod, prove the two containers share the same network namespace: exec into each and print both the pod IP (from the downward API) and the IP of <code>localhost</code> as seen by <code>ping</code>.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Containers in a pod share one network namespace, so they all see the same IP on <code>eth0</code> and <code>localhost</code>. Exec into each container and confirm they resolve to the same pod IP, and that <code>localhost</code> is reachable from both:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# recreate duo if you deleted it\nkubectl apply -f duo.yaml\n# pod IP from the downward API / status\nPODIP=$(kubectl get pod duo -o jsonpath='{.status.podIP}')\necho \"=== main container sees pod IP $PODIP and localhost as 127.0.0.1 ===\"\nkubectl exec duo -c main -- /bin/sh -c \"echo PODIP=$PODIP; getent hosts \\$(hostname -i); ping -c1 -w2 127.0.0.1\"\necho \"=== helper container sees the SAME pod IP and its own localhost ===\"\nkubectl exec duo -c helper -- /bin/sh -c \"echo PODIP=$PODIP; getent hosts \\$(hostname -i); ping -c1 -w2 127.0.0.1\""
            },
            {
              "type": "text",
              "html": "Both containers report the same IP — that's the shared network namespace. Cleanup:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete po duo"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: because both containers live in one pod they share the pod's network namespace (single IP, shared localhost). This is the foundation of the sidecar pattern: a sidecar proxy can listen on <code>localhost:15000</code> and the app container reaches it over localhost without touching the network."
        }
      ]
    },
    {
      "heading": "Sidecar containers sharing data",
      "id": "sidecar-containers-sharing-data",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Create a Deployment <code>sharedlogs</code> (nginx) exposed on port 80, and a sidecar <code>busybox</code> container that writes an <code>index.html</code> (via <code>echo</code>) into a shared <code>emptyDir</code> volume mounted at <code>/usr/share/nginx/html</code> in the nginx container and <code>/shared</code> in the sidecar. Confirm nginx serves the sidecar-written file by curling the pod IP from another pod.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "The sidecar shares an <code>emptyDir</code> volume with nginx so it can drop a file nginx then serves. Because the sidecar must keep writing (or in a real scenario tail logs), it runs alongside nginx as a regular container, not an init container:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deployment sharedlogs --image=nginx --port=80 --dry-run=client -o yaml > sharedlogs.yaml\nvi sharedlogs.yaml"
            },
            {
              "type": "text",
              "html": "Add the sidecar and the shared volume:"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  labels:\n    app: sharedlogs\n  name: sharedlogs\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: sharedlogs\n  template:\n    metadata:\n      labels:\n        app: sharedlogs\n    spec:\n      containers:\n      - image: nginx\n        name: web\n        ports:\n        - containerPort: 80\n        volumeMounts:\n        - name: content\n          mountPath: /usr/share/nginx/html\n      - image: busybox\n        name: sidecar\n        command: [\"/bin/sh\", \"-c\"]\n        args:\n        - while true; do echo \"<h1>Hello from sidecar at $(date)</h1>\" > /shared/index.html; sleep 5; done\n        volumeMounts:\n        - name: content\n          mountPath: /shared\n      volumes:\n      - name: content\n        emptyDir: {}\n      # nginx serves /usr/share/nginx/html/index.html by default"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f sharedlogs.yaml\nkubectl rollout status deployment sharedlogs\n# confirm nginx serves the sidecar-written content\nPODIP=$(kubectl get pod -l app=sharedlogs -o jsonpath='{.items[0].status.podIP}')\nkubectl run tmp --image=busybox --rm -it --restart=Never -- \\\n  wget -qO- \"http://$PODIP/\"          # expect the <h1>Hello from sidecar</h1> line\nkubectl delete deployment sharedlogs"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: the sidecar is a second container in the same pod; it owns its lifecycle but shares the pod's network and any volumes it mounts. Here the sidecar continuously (over)writes <code>index.html</code> on an <code>emptyDir</code> that nginx mounts at its document root, so nginx serves the sidecar's content."
        }
      ]
    },
    {
      "heading": "Init containers (run before app containers)",
      "id": "init-containers-run-before-app-containers",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Create a pod <code>portal</code> with one nginx container exposed on port 80 and a single init container (image <code>busybox</code>) that writes <code>echo &quot;Test&quot; &gt; /work-dir/index.html</code>. Share an <code>emptyDir</code> volume (<code>content</code>) between them: mount it at <code>/usr/share/nginx/html</code> in nginx and <code>/work-dir</code> in the init container. Get the pod IP and fetch it from a second pod to confirm nginx serves the init-written file.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Init containers run to completion <strong>before</strong> the app containers start, so the init container pre-seeds the shared volume that nginx then serves:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run portal --image=nginx --restart=Never --port=80 --dry-run=client -o yaml > portal.yaml\nvi portal.yaml"
            },
            {
              "type": "text",
              "html": "Final manifest:"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: portal\nspec:\n  initContainers:\n  - args:\n    - /bin/sh\n    - -c\n    - echo \"Test\" > /work-dir/index.html\n    image: busybox\n    name: pagewriter\n    volumeMounts:\n    - name: content\n      mountPath: /work-dir\n  containers:\n  - image: nginx\n    name: web\n    ports:\n    - containerPort: 80\n    volumeMounts:\n    - name: content\n      mountPath: /usr/share/nginx/html\n  volumes:\n  - name: content\n    emptyDir: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f portal.yaml\nkubectl get po -w portal       # watch Init:0/1 -> Running\nPODIP=$(kubectl get pod portal -o jsonpath='{.status.podIP}')\nkubectl run checker --image=busybox --rm -it --restart=Never -- \\\n  wget -qO- \"http://$PODIP/\"    # expect: Test\nkubectl delete po portal"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: as the official docs state, init containers &quot;run before app containers are started&quot;, &quot;each init container must complete successfully before the next one starts&quot;, and the field is <code>initContainers</code> alongside <code>containers</code> in the Pod spec. Here nginx only starts after the init container finishes writing <code>index.html</code>, so the page is guaranteed to exist when nginx boots."
        }
      ]
    },
    {
      "heading": "Multiple init containers",
      "id": "multiple-init-containers",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Extend <code>portal</code> so that there are TWO init containers that must run sequentially: <code>prep</code> (<code>busybox</code>) creates <code>/work-dir/setup.done</code>, then <code>writer</code> writes <code>echo &quot;Test&quot; &gt; /work-dir/index.html</code> only after <code>prep</code> finished. Keep nginx serving <code>/usr/share/nginx/html</code>. Inspect <code>.status.initContainerStatuses</code> to confirm <code>prep</code> completed (Completed) before <code>writer</code> ran.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Add a second init container. Kubernetes runs them in the order listed in the <code>initContainers</code> array:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "vi portal.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: portal\nspec:\n  initContainers:\n  - name: prep\n    image: busybox\n    command: [\"/bin/sh\", \"-c\"]\n    args:\n    - mkdir -p /work-dir && touch /work-dir/setup.done\n    volumeMounts:\n    - name: content\n      mountPath: /work-dir\n  - name: writer\n    image: busybox\n    command: [\"/bin/sh\", \"-c\"]\n    args:\n    - echo \"Test\" > /work-dir/index.html\n    volumeMounts:\n    - name: content\n      mountPath: /work-dir\n  containers:\n  - image: nginx\n    name: web\n    ports:\n    - containerPort: 80\n    volumeMounts:\n    - name: content\n      mountPath: /usr/share/nginx/html\n  volumes:\n  - name: content\n    emptyDir: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f portal.yaml\nkubectl rollout status pod/portal 2>/dev/null || kubectl get po -w portal\n# confirm the init containers ran in order via status\nkubectl get pod portal -o jsonpath='{range .status.initContainerStatuses[*]}{.containerID} {.state.terminated.reason}{\"\\n\"}{end}'\nPODIP=$(kubectl get pod portal -o jsonpath='{.status.podIP}')\nkubectl run checker --image=busybox --rm -it --restart=Never -- wget -qO- \"http://$PODIP/\"   # Test\nkubectl delete po portal"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: the official docs note &quot;each init container must complete successfully before the next one starts&quot; — the <code>.status.initContainerStatuses</code> array reflects exactly this ordering and each container's <code>terminated.reason</code> (Completed). This is useful for ordered setup steps like &quot;create namespace&quot; -&gt; &quot;seed config&quot;."
        }
      ]
    },
    {
      "heading": "Sharing the process namespace",
      "id": "sharing-the-process-namespace",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Enable <code>shareProcessNamespace</code> on the <code>duo</code> pod so containers can see each others processes. Create the pod with two busybox containers, then from the <code>main</code> container run <code>ps aux</code> and show that the <code>helper</code> container's <code>sleep</code> process is visible (via the shared PID namespace), and vice-versa.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Setting <code>shareProcessNamespace: true</code> on the pod spec gives all containers a shared PID namespace, so <code>ps</code> inside one container shows processes from the others:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: procshare\nspec:\n  shareProcessNamespace: true\n  containers:\n  - name: main\n    image: busybox\n    command: [\"/bin/sh\",\"-c\",\"sleep 3600\"]\n  - name: helper\n    image: busybox\n    command: [\"/bin/sh\",\"-c\",\"sleep 3600\"]\nEOF\nkubectl wait --for=condition=Ready pod/procshare\necho \"=== processes visible from 'main' (incl. helper's sleep) ===\"\nkubectl exec procshare -c main -- ps aux\necho \"=== processes visible from 'helper' (incl. main's sleep) ===\"\nkubectl exec procshare -c helper -- ps aux"
            },
            {
              "type": "text",
              "html": "Each container's <code>sleep</code> shows up in the other container's <code>ps</code> output — proof of the shared PID namespace. Cleanup: <code>kubectl delete po procshare</code>."
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: per the official &quot;Share Process Namespace&quot; task, when <code>shareProcessNamespace: true</code> the first process in each container is PID 1 of that container, and other containers' processes are visible. This is the mechanism <code>kubectl debug</code> uses to attach debug tooling into a running pod. Note all containers must agree on the namespace, so this is an explicit opt-in at the pod level."
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "With <code>shareProcessNamespace: true</code> still set, demonstrate inter-container signaling: recreate <code>procshare</code> so the <code>main</code> container runs <code>tail -f /dev/null</code> (a distinctive process name), then from the <code>helper</code> container send <code>SIGTERM</code> to that process. Confirm from <code>main</code> that the PID is identical across containers (the shared namespace), and observe the signal terminating the process cross-container.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: procshare\nspec:\n  shareProcessNamespace: true\n  containers:\n  - name: main\n    image: busybox\n    command: [\"/bin/sh\",\"-c\",\"tail -f /dev/null\"]   # distinctive comm -> easy to find in ps\n  - name: helper\n    image: busybox\n    command: [\"/bin/sh\",\"-c\",\"sleep 3600\"]\nEOF\nkubectl wait --for=condition=Ready pod/procshare\n# find main's tail process as seen from helper (shared PID ns -> same PID number)\nMAINPID=$(kubectl exec procshare -c helper -- ps -o pid,comm | awk '/tail/{print $1; exit}')\necho \"main's tail PID (seen from helper): $MAINPID\"\n# the same PID must be visible from main too -> the namespace is truly shared\nkubectl exec procshare -c main -- ps -o pid,comm | grep tail\n# signal it from helper; the signal crosses the shared PID namespace boundary\nkubectl exec procshare -c helper -- kill -TERM \"$MAINPID\" && echo \"sent SIGTERM to PID $MAINPID from helper\"\nkubectl get pod procshare -o jsonpath='{range .status.containerStatuses[*]}{.name}: restartCount={.restartCount}{\"\\n\"}{end}'\n# main's tail was terminated by the signal, so the kubelet restarts main (main: restartCount=1)\nkubectl delete po procshare"
            },
            {
              "type": "quote",
              "html": "<strong>Note on signaling and PID 1.</strong> In a shared PID namespace the first process of every container is visible pod-wide, but PID 1 of the namespace belongs to the sandbox (<code>/pause</code>), not to your container. A signal's effect depends on the target: busybox's <code>sleep</code> and <code>tail</code> do <strong>not</strong> ignore signals — <code>SIGTERM</code>/<code>SIGUSR1</code> terminate them (so the exercise's original &quot;signals do not kill sleep&quot; claim was wrong). The official docs instead demonstrate <code>kill -HUP</code> against nginx's master process, which (re)spawns its workers; that variant needs the <code>SYS_PTRACE</code> capability on the signaling container."
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: because the PID namespace is shared, the PID you read from <code>helper</code>'s <code>ps</code> is the <strong>same numeric PID</strong> the <code>main</code> container sees, and <code>kill</code> from one container targets a process owned by another. This is exactly how an in-pod sidecar can manage/health-check a sibling container without leaving the pod."
        }
      ]
    },
    {
      "heading": "Bringing it together",
      "id": "bringing-it-together",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Build the canonical sidecar-from-the-docs example: a pod <code>sharedlogs</code> with one nginx container (port 80) and a sidecar <code>busybox</code> that tails the nginx access log (<code>/var/log/nginx/access.log</code>) and mirrors it to <code>/var/log/nginx/mirror.log</code> on the same <code>emptyDir</code> volume, using <code>shareProcessNamespace: true</code> so the sidecar can also <code>tail</code> nginx's open file descriptor via <code>/proc/&lt;pid&gt;/fd</code>. Keep nginx serving its default page.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "This combines a shared volume AND the shared PID namespace so the sidecar can read nginx's access log both from disk and via the process FD table:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: sharedlogs\nspec:\n  shareProcessNamespace: true\n  volumes:\n  - name: logs\n    emptyDir: {}\n  containers:\n  - name: web\n    image: nginx\n    ports:\n    - containerPort: 80\n    volumeMounts:\n    - name: logs\n      mountPath: /var/log/nginx\n  - name: sidecar\n    image: busybox\n    command: [\"/bin/sh\",\"-c\"]\n    args:\n    - |\n      # mirror the access log to a sibling file every few seconds\n      while true; do\n        if [ -f /var/log/nginx/access.log ]; then\n          tail -n 50 /var/log/nginx/access.log > /var/log/nginx/mirror.log\n        fi\n        sleep 5\n      done\n    volumeMounts:\n    - name: logs\n      mountPath: /var/log/nginx\nEOF\nkubectl wait --for=condition=Ready pod/sharedlogs\n# generate some access-log traffic against nginx (same pod IP -> localhost)\n# NOTE: the nginx image ships curl but NOT wget, so use curl here (wget would fail with \"not found\")\nkubectl exec sharedlogs -c web -- sh -c 'while true; do curl -s http://127.0.0.1/ >/dev/null; sleep 1; done &'\nsleep 7\necho \"=== /var/log/nginx/access.log (written by nginx) ===\"\nkubectl exec sharedlogs -c web -- cat /var/log/nginx/access.log\necho \"=== /var/log/nginx/mirror.log (written by sidecar) ===\"\nkubectl exec sharedlogs -c sidecar -- cat /var/log/nginx/mirror.log\nkubectl delete po sharedlogs"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: this is the sidecar pattern in miniature — the sidecar shares nginx's log volume (via <code>emptyDir</code>) and, thanks to <code>shareProcessNamespace: true</code>, could additionally inspect nginx's open files through <code>/proc/&lt;nginx-pid&gt;/fd</code>. The sidecar owns the log-mirroring responsibility while nginx owns serving traffic; neither can be removed without breaking the contract, and both are declared as sibling <code>containers</code> (not init containers, which run to completion then exit)."
        },
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "Troubleshooting exercise: a colleague created a pod <code>broken</code> with one nginx container, but the pod is stuck in <code>Init:0/1</code> and never becomes ready. Inspect the pod, explain why, and fix it <strong>without changing the nginx image</strong> — only by adding an init container that writes <code>mkdir -p /usr/share/nginx/html &amp;&amp; echo &quot;ok&quot; &gt; /usr/share/nginx/html/index.html</code> so nginx has something to serve.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "First reproduce the broken pod. A plain nginx pod alone would come up <code>1/1 Running</code>, so the scenario needs the failing init container that actually puts the pod in <code>Init:0/1</code>:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: broken\nspec:\n  initContainers:\n  - name: bad-init\n    image: busybox\n    command: [\"/bin/sh\",\"-c\"]\n    args:\n    - \"exit 1\"    # the failing init container that blocks the app container\n  containers:\n  - name: web\n    image: nginx\n    ports:\n    - containerPort: 80\nEOF\nkubectl get po -w broken   # observe Init:0/1 (or Init:CrashLoopBackOff)"
            },
            {
              "type": "text",
              "html": "Inspect why it is stuck:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl describe pod broken\n# look at \"Init:\" line and any events; a stuck Init:0/1 means an init\n# container did not complete.\nkubectl get pod broken -o jsonpath='{.status.initContainerStatuses[0].state}'"
            },
            {
              "type": "text",
              "html": "The fix is to replace the failing init container with one that pre-creates the document root, so the app container (nginx) has the file it expects before it starts — without touching the nginx image:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete pod broken\nkubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: broken\nspec:\n  initContainers:\n  - name: prep-html\n    image: busybox\n    command: [\"/bin/sh\",\"-c\"]\n    args:\n    - mkdir -p /usr/share/nginx/html && echo \"ok\" > /usr/share/nginx/html/index.html\n    volumeMounts:\n    - name: html\n      mountPath: /usr/share/nginx/html\n  containers:\n  - name: web\n    image: nginx\n    ports:\n    - containerPort: 80\n    volumeMounts:\n    - name: html\n      mountPath: /usr/share/nginx/html\n  volumes:\n  - name: html\n    emptyDir: {}\nEOF\nkubectl wait --for=condition=Ready pod/broken\nkubectl get pod broken -o jsonpath='{.status.phase}'\nkubectl delete pod broken"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: the pod was <code>Init:0/1</code> because an init container was failing, so the app container never got a successful preconditions pass. Per the official docs, &quot;if a Pod's init container fails, the kubelet repeatedly restarts that init container until it succeeds&quot; (and with <code>restartPolicy: Never</code> a failed init makes the Pod Failed). The cleanest fix is to swap in a <code>busybox</code> init container that seeds <code>/usr/share/nginx/html/index.html</code> on a shared <code>emptyDir</code>, leaving the nginx image untouched — then nginx starts into a populated document root and becomes Ready."
        }
      ]
    },
    {
      "heading": "Recap",
      "id": "recap",
      "blocks": [
        {
          "type": "text",
          "html": "<strong>Summary table</strong>"
        },
        {
          "type": "text",
          "html": "| Pattern | Field | Runs... | Use case |"
        },
        {
          "type": "text",
          "html": "|---|---|---|---|"
        },
        {
          "type": "text",
          "html": "| Regular container | <code>containers</code> | with the pod, forever | app / sidecar / ambassador |"
        },
        {
          "type": "text",
          "html": "| Init container | <code>initContainers</code> | before app containers, to completion, sequentially | pre-seed data, wait for a dependency, one-time setup |"
        },
        {
          "type": "text",
          "html": "| <code>shareProcessNamespace: true</code> | pod <code>spec</code> | whole-pod opt-in | one container inspects/mutates another via <code>/proc/&lt;pid&gt;</code> |"
        },
        {
          "type": "text",
          "html": "| Shared volume | <code>volumes</code> + <code>volumeMounts</code> | across co-scheduled containers | pass files/config between sidecars |"
        },
        {
          "type": "text",
          "html": "- Containers in a pod share the <strong>network</strong> namespace (one IP, shared localhost)."
        },
        {
          "type": "text",
          "html": "- Multiple regular containers are declared under <code>containers</code> (the sidecar pattern)."
        },
        {
          "type": "text",
          "html": "- Init containers are declared under <code>initContainers</code> and run <strong>to completion, in order, before</strong> the <code>containers</code> start — &quot;each must complete successfully before the next starts&quot;."
        },
        {
          "type": "text",
          "html": "- <code>shareProcessNamespace: true</code> opts the whole-pod into a shared <strong>PID</strong> namespace so containers can see and signal each others processes."
        },
        {
          "type": "text",
          "html": "- Containers share filesystem data via a mounted <code>emptyDir</code> (or other Volume)."
        }
      ]
    }
  ],
  "count": 9,
  "description": "Sidecars, init containers, and shared volumes.",
  "file": "b.multi_container_pods.md"
};
