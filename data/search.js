window.CKAD_SEARCH = [
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create a namespace called 'atlas' and a pod with image nginx called webserver on this namespace",
    "answer": "kubectl create namespace atlas\nkubectl run webserver --image=nginx --restart=Never -n atlas",
    "anchor": "ex-0"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create the pod that was just described using YAML",
    "answer": "Easily generate YAML with: kubectl run webserver --image=nginx --restart=Never --dry-run=client -n atlas -o yaml > pod.yaml cat pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: webserver\n  name: webserver\n  namespace: atlas\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: webserver\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml Alternatively, you can run in one line kubectl run webserver --image=nginx --restart=Never --dry-run=client -o yaml | kubectl create -n atlas -f -",
    "anchor": "ex-1"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create a busybox pod (using kubectl command) that runs the command &quot;env&quot;. Run it and see the output",
    "answer": "kubectl run envcheck --image=busybox --command --restart=Never -it --rm -- env # -it will help in seeing the output, --rm will immediately delete the pod after it exits\n# or, just run it without -it\nkubectl run envcheck --image=busybox --command --restart=Never -- env\n# and then, check its logs\nkubectl logs envcheck",
    "anchor": "ex-2"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create a busybox pod (using YAML) that runs the command &quot;env&quot;. Run it and see the output",
    "answer": "# create a  YAML template with this command\nkubectl run envcheck --image=busybox --restart=Never --dry-run=client -o yaml --command -- env > envpod.yaml\n# see it\ncat envpod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: envcheck\n  name: envcheck\nspec:\n  containers:\n  - command:\n    - env\n    image: busybox\n    name: envcheck\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} # apply it and then see the logs\nkubectl apply -f envpod.yaml\nkubectl logs envcheck",
    "anchor": "ex-3"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Get the YAML for a new namespace called 'research' without creating it",
    "answer": "kubectl create namespace research -o yaml --dry-run=client",
    "anchor": "ex-4"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create the YAML for a new ResourceQuota called 'cap' with hard limits of 1 CPU, 1G memory and 2 pods without creating it",
    "answer": "kubectl create quota cap --hard=cpu=1,memory=1G,pods=2 --dry-run=client -o yaml",
    "anchor": "ex-5"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Get pods on all namespaces",
    "answer": "kubectl get po --all-namespaces Alternatively kubectl get po -A",
    "anchor": "ex-6"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create a pod with image nginx called webfront and expose traffic on port 80",
    "answer": "kubectl run webfront --image=nginx --restart=Never --port=80",
    "anchor": "ex-7"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Change pod's image to nginx:1.24.0. Observe that the container will be restarted as soon as the image gets pulled",
    "answer": "Note: The RESTARTS column should contain 0 initially (ideally - it could be any number) # kubectl set image POD/POD_NAME CONTAINER_NAME=IMAGE_NAME:TAG\nkubectl set image pod/webfront webfront=nginx:1.24.0\nkubectl describe po webfront # you will see an event 'Container will be killed and recreated'\nkubectl get po webfront -w # watch it Note: some time after changing the image, you should see that the value in the RESTARTS column has been increased by 1, because the container has been restarted, as stated in the events shown at the bottom of the kubectl describe pod command: Events:\n  Type    Reason     Age                  From               Message\n  ----    ------     ----                 ----               -------\n[...]\n  Normal  Killing    100s                 kubelet, node3     Container webfront definition changed, will be restarted\n  Normal  Pulling    100s                 kubelet, node3     Pulling image \"nginx:1.24.0\"\n  Normal  Pulled     41s                  kubelet, node3     Successfully pulled image \"nginx:1.24.0\"\n  Normal  Created    36s (x2 over 9m43s)  kubelet, node3     Created container webfront\n  Normal  Started    36s (x2 over 9m43s)  kubelet, node3     Started container webfront Note: you can check pod's image by running kubectl get po webfront -o jsonpath='{.spec.containers[].image}{\"\\n\"}'",
    "anchor": "ex-8"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Get webfront pod's ip created in previous step, use a temp busybox image to wget its '/'",
    "answer": "kubectl get po -o wide # get the IP, will be something like '10.1.1.131'\n# create a temp busybox pod\nkubectl run netprobe --image=busybox --rm -it --restart=Never -- wget -O- 10.1.1.131:80 Alternatively you can also try a more advanced option: # Get IP of the webfront pod\nWEBFRONT_IP=$(kubectl get pod webfront -o jsonpath='{.status.podIP}')\n# create a temp busybox pod\nkubectl run netprobe --image=busybox --env=\"WEBFRONT_IP=$WEBFRONT_IP\" --rm -it --restart=Never -- sh -c 'wget -O- $WEBFRONT_IP:80' Or just in one line: kubectl run netprobe --image=busybox --rm -it --restart=Never -- wget -O- $(kubectl get pod webfront -o jsonpath='{.status.podIP}:{.spec.containers[0].ports[0].containerPort}')",
    "anchor": "ex-9"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Get pod's YAML",
    "answer": "kubectl get po webfront -o yaml\n# or\nkubectl get po webfront -oyaml\n# or\nkubectl get po webfront --output yaml\n# or\nkubectl get po webfront --output=yaml",
    "anchor": "ex-10"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Get information about the pod, including details about potential issues (e.g. pod hasn't started)",
    "answer": "kubectl describe po webfront",
    "anchor": "ex-11"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Get pod logs",
    "answer": "kubectl logs webfront",
    "anchor": "ex-12"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "If pod crashed and restarted, get logs about the previous instance",
    "answer": "kubectl logs webfront -p\n# or\nkubectl logs webfront --previous",
    "anchor": "ex-13"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Execute a simple shell on the webfront pod",
    "answer": "kubectl exec -it webfront -- /bin/sh",
    "anchor": "ex-14"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create a busybox pod that echoes 'hello world' and then exits",
    "answer": "kubectl run echoer --image=busybox -it --restart=Never -- echo 'hello world'\n# or\nkubectl run echoer --image=busybox -it --restart=Never -- /bin/sh -c 'echo hello world'",
    "anchor": "ex-15"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Do the same, but have the pod deleted automatically when it's completed",
    "answer": "kubectl run echoer --image=busybox -it --rm --restart=Never -- /bin/sh -c 'echo hello world'\nkubectl get po # nowhere to be found :)",
    "anchor": "ex-16"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create an nginx pod and set an env value as 'var1=val1'. Check the env value existence within the pod",
    "answer": "kubectl run envbox --image=nginx --restart=Never --env=var1=val1\n# then\nkubectl exec -it envbox -- env\n# or\nkubectl exec -it envbox -- sh -c 'echo $var1'\n# or\nkubectl describe po envbox | grep val1\n# or\nkubectl run envbox --restart=Never --image=nginx --env=var1=val1 -it --rm -- env\n# or\nkubectl run envbox --image nginx --restart=Never --env=var1=val1 -it --rm -- sh -c 'echo $var1'",
    "anchor": "ex-17"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Create two nginx pods, one labelled app=frontend,tier=web and one app=backend,tier=web, then list them with an equality-based label selector",
    "answer": "kubectl run web-front --image=nginx --restart=Never --labels=app=frontend,tier=web\nkubectl run web-back --image=nginx --restart=Never --labels=app=backend,tier=web\n# equality-based: '=' and '==' are synonyms, '!=' is inequality\nkubectl get pods -l app=frontend\nkubectl get pods -l 'app!=backend'",
    "anchor": "ex-18"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "List pods using set-based label selectors (in, notin), including a combined selector",
    "answer": "# value must be one of the listed set\nkubectl get pods -l 'app in (frontend,backend)'\n# value must NOT be in the set\nkubectl get pods -l 'app notin (frontend)'\n# mixed set-based + equality-based; comma = AND\nkubectl get pods -l 'app in (frontend,backend),tier=web'",
    "anchor": "ex-19"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Show the labels of pods as extra columns with -L, and dump all labels with --show-labels",
    "answer": "kubectl get pods -L app -L tier\n# pods without the label show '<none>' in the new column\nkubectl get pods --show-labels\n# or the raw YAML\nkubectl get pod web-front -o yaml | grep -A2 labels",
    "anchor": "ex-20"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Add a label env=prod to an existing pod, then update it to env=staging (requires --overwrite)",
    "answer": "kubectl label pod web-front env=prod\nkubectl get pod web-front --show-labels\n# updating a label that already exists fails without --overwrite\nkubectl label pod web-front env=staging --overwrite\nkubectl get pod web-front --show-labels",
    "anchor": "ex-21"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Add an annotation owner=team-a to the web-front pod and read it back",
    "answer": "kubectl annotate pod web-front owner=team-a\nkubectl get pod web-front -o jsonpath='{.metadata.annotations}'\n# or\nkubectl describe pod web-front | grep -A1 Annotations",
    "anchor": "ex-22"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "List all namespaces and name the four namespaces a cluster starts with",
    "answer": "kubectl get namespace\n# or\nkubectl get ns",
    "anchor": "ex-23"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Set the namespace preference for the current context, then verify and reset it",
    "answer": "kubectl config set-context --current --namespace=atlas\n# verify it was saved\nkubectl config view --minify | grep namespace:\n# now every kubectl command (without -n) targets 'atlas'\nkubectl get pods\n# reset back\nkubectl config set-context --current --namespace=default",
    "anchor": "ex-24"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Find out which resource types are namespaced and which are cluster-scoped",
    "answer": "# resources that live inside a namespace\nkubectl api-resources --namespaced=true\n# resources that are cluster-wide (not in a namespace)\nkubectl api-resources --namespaced=false",
    "anchor": "ex-25"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Get the control-plane address and the current kubectl context",
    "answer": "kubectl cluster-info\nkubectl config current-context\nkubectl config get-contexts",
    "anchor": "ex-26"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "Use kubectl explain to discover the fields of the Pod resource",
    "answer": "kubectl explain pod\nkubectl explain pod.spec\nkubectl explain pod.spec.containers",
    "anchor": "ex-27"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "List the nodes and their details with -o wide",
    "answer": "kubectl get nodes\nkubectl get nodes -o wide   # adds INTERNAL-IP, OS-IMAGE, KERNEL-VERSION, CONTAINER-RUNTIME",
    "anchor": "ex-28"
  },
  {
    "slug": "core-concepts",
    "title": "Core Concepts",
    "question": "List all resources in a namespace with kubectl get all",
    "answer": "kubectl get all -n default\n# or, if your namespace preference is set\nkubectl get all",
    "anchor": "ex-29"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "Create a Pod with two containers, both with image busybox and command &quot;echo hello; sleep 3600&quot;. Connect to the second container and run 'ls'.",
    "answer": "The easiest way is to create a pod with a single container and save its definition in a YAML file: kubectl run duo --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'echo hello;sleep 3600' > duo.yaml\nvi duo.yaml Copy/paste the container related values, so your final YAML should contain the following two containers (make sure those containers have a different name; each container in a pod must be uniquely named): containers:\n  - args:\n    - /bin/sh\n    - -c\n    - echo hello;sleep 3600\n    image: busybox\n    imagePullPolicy: IfNotPresent\n    name: main\n    resources: {}\n  - args:\n    - /bin/sh\n    - -c\n    - echo hello;sleep 3600\n    image: busybox\n    name: helper kubectl create -f duo.yaml\n# Connect to the helper container within the pod\nkubectl exec -it duo -c helper -- /bin/sh\nls\nexit\n# or you can do the above with just a one-liner\nkubectl exec -it duo -c helper -- ls\n# you can do some cleanup\nkubectl delete po duo",
    "anchor": "ex-0"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "Using the same pod, prove the two containers share the same network namespace: exec into each and print both the pod IP (from the downward API) and the IP of localhost as seen by ping.",
    "answer": "Containers in a pod share one network namespace, so they all see the same IP on eth0 and localhost. Exec into each container and confirm they resolve to the same pod IP, and that localhost is reachable from both: # recreate duo if you deleted it\nkubectl apply -f duo.yaml\n# pod IP from the downward API / status\nPODIP=$(kubectl get pod duo -o jsonpath='{.status.podIP}')\necho \"=== main container sees pod IP $PODIP and localhost as 127.0.0.1 ===\"\nkubectl exec duo -c main -- /bin/sh -c \"echo PODIP=$PODIP; getent hosts \\$(hostname -i); ping -c1 -w2 127.0.0.1\"\necho \"=== helper container sees the SAME pod IP and its own localhost ===\"\nkubectl exec duo -c helper -- /bin/sh -c \"echo PODIP=$PODIP; getent hosts \\$(hostname -i); ping -c1 -w2 127.0.0.1\" Both containers report the same IP — that's the shared network namespace. Cleanup: kubectl delete po duo",
    "anchor": "ex-1"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "Create a Deployment sharedlogs (nginx) exposed on port 80, and a sidecar busybox container that writes an index.html (via echo) into a shared emptyDir volume mounted at /usr/share/nginx/html in the nginx container and /shared in the sidecar. Confirm nginx serves the sidecar-written file by curling the pod IP from another pod.",
    "answer": "The sidecar shares an emptyDir volume with nginx so it can drop a file nginx then serves. Because the sidecar must keep writing (or in a real scenario tail logs), it runs alongside nginx as a regular container, not an init container: kubectl create deployment sharedlogs --image=nginx --port=80 --dry-run=client -o yaml > sharedlogs.yaml\nvi sharedlogs.yaml Add the sidecar and the shared volume: apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  labels:\n    app: sharedlogs\n  name: sharedlogs\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: sharedlogs\n  template:\n    metadata:\n      labels:\n        app: sharedlogs\n    spec:\n      containers:\n      - image: nginx\n        name: web\n        ports:\n        - containerPort: 80\n        volumeMounts:\n        - name: content\n          mountPath: /usr/share/nginx/html\n      - image: busybox\n        name: sidecar\n        command: [\"/bin/sh\", \"-c\"]\n        args:\n        - while true; do echo \"<h1>Hello from sidecar at $(date)</h1>\" > /shared/index.html; sleep 5; done\n        volumeMounts:\n        - name: content\n          mountPath: /shared\n      volumes:\n      - name: content\n        emptyDir: {}\n      # nginx serves /usr/share/nginx/html/index.html by default kubectl apply -f sharedlogs.yaml\nkubectl rollout status deployment sharedlogs\n# confirm nginx serves the sidecar-written content\nPODIP=$(kubectl get pod -l app=sharedlogs -o jsonpath='{.items[0].status.podIP}')\nkubectl run tmp --image=busybox --rm -it --restart=Never -- \\\n  wget -qO- \"http://$PODIP/\"          # expect the <h1>Hello from sidecar</h1> line\nkubectl delete deployment sharedlogs",
    "anchor": "ex-2"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "Create a pod portal with one nginx container exposed on port 80 and a single init container (image busybox) that writes echo &quot;Test&quot; &gt; /work-dir/index.html. Share an emptyDir volume (content) between them: mount it at /usr/share/nginx/html in nginx and /work-dir in the init container. Get the pod IP and fetch it from a second pod to confirm nginx serves the init-written file.",
    "answer": "Init containers run to completion before the app containers start, so the init container pre-seeds the shared volume that nginx then serves: kubectl run portal --image=nginx --restart=Never --port=80 --dry-run=client -o yaml > portal.yaml\nvi portal.yaml Final manifest: apiVersion: v1\nkind: Pod\nmetadata:\n  name: portal\nspec:\n  initContainers:\n  - args:\n    - /bin/sh\n    - -c\n    - echo \"Test\" > /work-dir/index.html\n    image: busybox\n    name: pagewriter\n    volumeMounts:\n    - name: content\n      mountPath: /work-dir\n  containers:\n  - image: nginx\n    name: web\n    ports:\n    - containerPort: 80\n    volumeMounts:\n    - name: content\n      mountPath: /usr/share/nginx/html\n  volumes:\n  - name: content\n    emptyDir: {} kubectl apply -f portal.yaml\nkubectl get po -w portal       # watch Init:0/1 -> Running\nPODIP=$(kubectl get pod portal -o jsonpath='{.status.podIP}')\nkubectl run checker --image=busybox --rm -it --restart=Never -- \\\n  wget -qO- \"http://$PODIP/\"    # expect: Test\nkubectl delete po portal",
    "anchor": "ex-3"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "Extend portal so that there are TWO init containers that must run sequentially: prep (busybox) creates /work-dir/setup.done, then writer writes echo &quot;Test&quot; &gt; /work-dir/index.html only after prep finished. Keep nginx serving /usr/share/nginx/html. Inspect .status.initContainerStatuses to confirm prep completed (Completed) before writer ran.",
    "answer": "Add a second init container. Kubernetes runs them in the order listed in the initContainers array: vi portal.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  name: portal\nspec:\n  initContainers:\n  - name: prep\n    image: busybox\n    command: [\"/bin/sh\", \"-c\"]\n    args:\n    - mkdir -p /work-dir && touch /work-dir/setup.done\n    volumeMounts:\n    - name: content\n      mountPath: /work-dir\n  - name: writer\n    image: busybox\n    command: [\"/bin/sh\", \"-c\"]\n    args:\n    - echo \"Test\" > /work-dir/index.html\n    volumeMounts:\n    - name: content\n      mountPath: /work-dir\n  containers:\n  - image: nginx\n    name: web\n    ports:\n    - containerPort: 80\n    volumeMounts:\n    - name: content\n      mountPath: /usr/share/nginx/html\n  volumes:\n  - name: content\n    emptyDir: {} kubectl apply -f portal.yaml\nkubectl rollout status pod/portal 2>/dev/null || kubectl get po -w portal\n# confirm the init containers ran in order via status\nkubectl get pod portal -o jsonpath='{range .status.initContainerStatuses[*]}{.containerID} {.state.terminated.reason}{\"\\n\"}{end}'\nPODIP=$(kubectl get pod portal -o jsonpath='{.status.podIP}')\nkubectl run checker --image=busybox --rm -it --restart=Never -- wget -qO- \"http://$PODIP/\"   # Test\nkubectl delete po portal",
    "anchor": "ex-4"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "Enable shareProcessNamespace on the duo pod so containers can see each others processes. Create the pod with two busybox containers, then from the main container run ps aux and show that the helper container's sleep process is visible (via the shared PID namespace), and vice-versa.",
    "answer": "Setting shareProcessNamespace: true on the pod spec gives all containers a shared PID namespace, so ps inside one container shows processes from the others: kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: procshare\nspec:\n  shareProcessNamespace: true\n  containers:\n  - name: main\n    image: busybox\n    command: [\"/bin/sh\",\"-c\",\"sleep 3600\"]\n  - name: helper\n    image: busybox\n    command: [\"/bin/sh\",\"-c\",\"sleep 3600\"]\nEOF\nkubectl wait --for=condition=Ready pod/procshare\necho \"=== processes visible from 'main' (incl. helper's sleep) ===\"\nkubectl exec procshare -c main -- ps aux\necho \"=== processes visible from 'helper' (incl. main's sleep) ===\"\nkubectl exec procshare -c helper -- ps aux Each container's sleep shows up in the other container's ps output — proof of the shared PID namespace. Cleanup: kubectl delete po procshare.",
    "anchor": "ex-5"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "With shareProcessNamespace: true still set, demonstrate inter-container signaling: recreate procshare so the main container runs tail -f /dev/null (a distinctive process name), then from the helper container send SIGTERM to that process. Confirm from main that the PID is identical across containers (the shared namespace), and observe the signal terminating the process cross-container.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: procshare\nspec:\n  shareProcessNamespace: true\n  containers:\n  - name: main\n    image: busybox\n    command: [\"/bin/sh\",\"-c\",\"tail -f /dev/null\"]   # distinctive comm -> easy to find in ps\n  - name: helper\n    image: busybox\n    command: [\"/bin/sh\",\"-c\",\"sleep 3600\"]\nEOF\nkubectl wait --for=condition=Ready pod/procshare\n# find main's tail process as seen from helper (shared PID ns -> same PID number)\nMAINPID=$(kubectl exec procshare -c helper -- ps -o pid,comm | awk '/tail/{print $1; exit}')\necho \"main's tail PID (seen from helper): $MAINPID\"\n# the same PID must be visible from main too -> the namespace is truly shared\nkubectl exec procshare -c main -- ps -o pid,comm | grep tail\n# signal it from helper; the signal crosses the shared PID namespace boundary\nkubectl exec procshare -c helper -- kill -TERM \"$MAINPID\" && echo \"sent SIGTERM to PID $MAINPID from helper\"\nkubectl get pod procshare -o jsonpath='{range .status.containerStatuses[*]}{.name}: restartCount={.restartCount}{\"\\n\"}{end}'\n# main's tail was terminated by the signal, so the kubelet restarts main (main: restartCount=1)\nkubectl delete po procshare Note on signaling and PID 1. In a shared PID namespace the first process of every container is visible pod-wide, but PID 1 of the namespace belongs to the sandbox (/pause), not to your container. A signal's effect depends on the target: busybox's sleep and tail do not ignore signals — SIGTERM/SIGUSR1 terminate them (so the exercise's original &quot;signals do not kill sleep&quot; claim was wrong). The official docs instead demonstrate kill -HUP against nginx's master process, which (re)spawns its workers; that variant needs the SYS_PTRACE capability on the signaling container.",
    "anchor": "ex-6"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "Build the canonical sidecar-from-the-docs example: a pod sharedlogs with one nginx container (port 80) and a sidecar busybox that tails the nginx access log (/var/log/nginx/access.log) and mirrors it to /var/log/nginx/mirror.log on the same emptyDir volume, using shareProcessNamespace: true so the sidecar can also tail nginx's open file descriptor via /proc/&lt;pid&gt;/fd. Keep nginx serving its default page.",
    "answer": "This combines a shared volume AND the shared PID namespace so the sidecar can read nginx's access log both from disk and via the process FD table: kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: sharedlogs\nspec:\n  shareProcessNamespace: true\n  volumes:\n  - name: logs\n    emptyDir: {}\n  containers:\n  - name: web\n    image: nginx\n    ports:\n    - containerPort: 80\n    volumeMounts:\n    - name: logs\n      mountPath: /var/log/nginx\n  - name: sidecar\n    image: busybox\n    command: [\"/bin/sh\",\"-c\"]\n    args:\n    - |\n      # mirror the access log to a sibling file every few seconds\n      while true; do\n        if [ -f /var/log/nginx/access.log ]; then\n          tail -n 50 /var/log/nginx/access.log > /var/log/nginx/mirror.log\n        fi\n        sleep 5\n      done\n    volumeMounts:\n    - name: logs\n      mountPath: /var/log/nginx\nEOF\nkubectl wait --for=condition=Ready pod/sharedlogs\n# generate some access-log traffic against nginx (same pod IP -> localhost)\n# NOTE: the nginx image ships curl but NOT wget, so use curl here (wget would fail with \"not found\")\nkubectl exec sharedlogs -c web -- sh -c 'while true; do curl -s http://127.0.0.1/ >/dev/null; sleep 1; done &'\nsleep 7\necho \"=== /var/log/nginx/access.log (written by nginx) ===\"\nkubectl exec sharedlogs -c web -- cat /var/log/nginx/access.log\necho \"=== /var/log/nginx/mirror.log (written by sidecar) ===\"\nkubectl exec sharedlogs -c sidecar -- cat /var/log/nginx/mirror.log\nkubectl delete po sharedlogs",
    "anchor": "ex-7"
  },
  {
    "slug": "multi-container-pods",
    "title": "Multi-container Pods",
    "question": "Troubleshooting exercise: a colleague created a pod broken with one nginx container, but the pod is stuck in Init:0/1 and never becomes ready. Inspect the pod, explain why, and fix it without changing the nginx image — only by adding an init container that writes mkdir -p /usr/share/nginx/html &amp;&amp; echo &quot;ok&quot; &gt; /usr/share/nginx/html/index.html so nginx has something to serve.",
    "answer": "First reproduce the broken pod. A plain nginx pod alone would come up 1/1 Running, so the scenario needs the failing init container that actually puts the pod in Init:0/1: kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: broken\nspec:\n  initContainers:\n  - name: bad-init\n    image: busybox\n    command: [\"/bin/sh\",\"-c\"]\n    args:\n    - \"exit 1\"    # the failing init container that blocks the app container\n  containers:\n  - name: web\n    image: nginx\n    ports:\n    - containerPort: 80\nEOF\nkubectl get po -w broken   # observe Init:0/1 (or Init:CrashLoopBackOff) Inspect why it is stuck: kubectl describe pod broken\n# look at \"Init:\" line and any events; a stuck Init:0/1 means an init\n# container did not complete.\nkubectl get pod broken -o jsonpath='{.status.initContainerStatuses[0].state}' The fix is to replace the failing init container with one that pre-creates the document root, so the app container (nginx) has the file it expects before it starts — without touching the nginx image: kubectl delete pod broken\nkubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: broken\nspec:\n  initContainers:\n  - name: prep-html\n    image: busybox\n    command: [\"/bin/sh\",\"-c\"]\n    args:\n    - mkdir -p /usr/share/nginx/html && echo \"ok\" > /usr/share/nginx/html/index.html\n    volumeMounts:\n    - name: html\n      mountPath: /usr/share/nginx/html\n  containers:\n  - name: web\n    image: nginx\n    ports:\n    - containerPort: 80\n    volumeMounts:\n    - name: html\n      mountPath: /usr/share/nginx/html\n  volumes:\n  - name: html\n    emptyDir: {}\nEOF\nkubectl wait --for=condition=Ready pod/broken\nkubectl get pod broken -o jsonpath='{.status.phase}'\nkubectl delete pod broken",
    "anchor": "ex-8"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create 3 pods with names app1,app2,app3. All of them should have the label app=v1",
    "answer": "kubectl run app1 --image=nginx --restart=Never --labels=app=v1\nkubectl run app2 --image=nginx --restart=Never --labels=app=v1\nkubectl run app3 --image=nginx --restart=Never --labels=app=v1\n# or\nfor i in `seq 1 3`; do kubectl run app$i --image=nginx --restart=Never -l app=v1 ; done",
    "anchor": "ex-0"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Show all labels of the pods",
    "answer": "kubectl get po --show-labels",
    "anchor": "ex-1"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Change the labels of pod 'app2' to be app=v2",
    "answer": "kubectl label po app2 app=v2 --overwrite\n# or edit the pod yaml\nkubectl edit po app2",
    "anchor": "ex-2"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Get the label 'app' for the pods (show a column with APP labels)",
    "answer": "kubectl get po -L app\n# or\nkubectl get po --label-columns=app",
    "anchor": "ex-3"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Get only the 'app=v2' pods",
    "answer": "kubectl get po -l app=v2\n# or\nkubectl get po -l 'app in (v2)'\n# or\nkubectl get po --selector=app=v2",
    "anchor": "ex-4"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Get 'app=v2' and not 'tier=frontend' pods",
    "answer": "kubectl get po -l app=v2,tier!=frontend\n# or\nkubectl get po -l 'app in (v2), tier notin (frontend)'\n# or\nkubectl get po --selector=app=v2,tier!=frontend",
    "anchor": "ex-5"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Add a new label tier=web to all pods having 'app=v2' or 'app=v1' labels",
    "answer": "kubectl label po -l 'app in (v1,v2)' tier=web",
    "anchor": "ex-6"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Add an annotation 'owner: marketing' to all pods having 'app=v2' label",
    "answer": "kubectl annotate po -l \"app=v2\" owner=marketing",
    "anchor": "ex-7"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Remove the 'app' label from the pods we created before",
    "answer": "kubectl label po app1 app2 app3 app-\n# or\nkubectl label po app{1..3} app-\n# or\nkubectl label po -l app app-",
    "anchor": "ex-8"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Annotate pods app1, app2, app3 with &quot;description='my description'&quot; value",
    "answer": "kubectl annotate po app1 app2 app3 description='my description'\n#or\nkubectl annotate po app{1..3} description='my description'",
    "anchor": "ex-9"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Check the annotations for pod app1",
    "answer": "kubectl annotate pod app1 --list\n# or\nkubectl describe po app1 | grep -i 'annotations'\n# or\nkubectl get po app1 -o custom-columns=Name:metadata.name,ANNOTATIONS:metadata.annotations.description As an alternative to using | grep you can use jsonPath like kubectl get po app1 -o jsonpath='{.metadata.annotations}{&quot;\\n&quot;}'",
    "anchor": "ex-10"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Remove the annotations for these three pods",
    "answer": "kubectl annotate po app{1..3} description- owner-",
    "anchor": "ex-11"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Remove these pods to have a clean state in your cluster",
    "answer": "kubectl delete po app{1..3}",
    "anchor": "ex-12"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a pod that will be deployed to a Node that has the label 'accelerator=nvidia-tesla-p100'",
    "answer": "Add the label to a node: kubectl label nodes <your-node-name> accelerator=nvidia-tesla-p100\nkubectl get nodes --show-labels We can use the 'nodeSelector' property on the Pod YAML: apiVersion: v1\nkind: Pod\nmetadata:\n  name: gpu-worker\nspec:\n  containers:\n    - name: gpu-worker\n      image: \"registry.k8s.io/cuda-vector-add:v0.1\"\n  nodeSelector: # add this\n    accelerator: nvidia-tesla-p100 # the selection label You can easily find out where in the YAML it should be placed by: kubectl explain po.spec OR: Use node affinity (https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/#schedule-a-pod-using-required-node-affinity) apiVersion: v1\nkind: Pod\nmetadata:\n  name: gpu-affinity\nspec:\n  affinity:\n    nodeAffinity:\n      requiredDuringSchedulingIgnoredDuringExecution:\n        nodeSelectorTerms:\n        - matchExpressions:\n          - key: accelerator\n            operator: In\n            values:\n            - nvidia-tesla-p100\n  containers:\n    - name: gpu-affinity\n      image: \"registry.k8s.io/cuda-vector-add:v0.1\"",
    "anchor": "ex-13"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a pod that will be placed on node node01 using nodeName",
    "answer": "nodeName forces the Pod to be bound to a specific node (bypassing the scheduler). For more details, see the official docs: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename apiVersion: v1\nkind: Pod\nmetadata:\n  name: pinned-pod\nspec:\n  nodeName: node01\n  containers:\n  - name: pinned-app\n    image: nginx   Verify which node it landed on: kubectl get pod pinned-pod -o wide",
    "anchor": "ex-14"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Taint a node with key tier and value frontend with the effect NoSchedule. Then, create a pod that tolerates this taint.",
    "answer": "Taint a node: kubectl taint node node1 tier=frontend:NoSchedule # key=value:Effect\nkubectl describe node node1 # view the taints on a node And to tolerate the taint: apiVersion: v1\nkind: Pod\nmetadata:\n  name: tolerant-pod\nspec:\n  containers:\n  - name: tolerant-app\n    image: nginx\n  tolerations:\n  - key: \"tier\"\n    operator: \"Equal\"\n    value: \"frontend\"\n    effect: \"NoSchedule\"",
    "anchor": "ex-15"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a pod that will be placed on node controlplane. Use nodeSelector and tolerations.",
    "answer": "vi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  name: ops-pod\nspec:\n  containers:\n  - name: ops-app\n    image: nginx\n  nodeSelector:\n    kubernetes.io/hostname: controlplane\n  tolerations:\n  - key: \"node-role.kubernetes.io/control-plane\"\n    operator: \"Exists\"\n    effect: \"NoSchedule\" kubectl create -f pod.yaml",
    "anchor": "ex-16"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a deployment with image nginx:1.18.0, called webapp, having 2 replicas, defining port 80 as the port that this container exposes (don't create a service for this deployment)",
    "answer": "kubectl create deployment webapp  --image=nginx:1.18.0  --dry-run=client -o yaml > deploy.yaml\nvi deploy.yaml\n# change the replicas field from 1 to 2\n# add this section to the container spec and save the deploy.yaml file\n# ports:\n#   - containerPort: 80\nkubectl apply -f deploy.yaml or, do something like: kubectl create deployment webapp  --image=nginx:1.18.0  --dry-run=client -o yaml | sed 's/replicas: 1/replicas: 2/g'  | sed 's/image: nginx:1.18.0/image: nginx:1.18.0\\n        ports:\\n        - containerPort: 80/g' | kubectl apply -f - or, kubectl create deploy webapp --image=nginx:1.18.0 --replicas=2 --port=80",
    "anchor": "ex-17"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "View the YAML of this deployment",
    "answer": "kubectl get deploy webapp -o yaml",
    "anchor": "ex-18"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "View the YAML of the replica set that was created by this deployment",
    "answer": "kubectl describe deploy webapp # you'll see the name of the replica set on the Events section and in the 'NewReplicaSet' property\n# OR you can find rs directly by:\nkubectl get rs -l run=webapp # if you created deployment by 'run' command\nkubectl get rs -l app=webapp # if you created deployment by 'create' command\n# you could also just do kubectl get rs\nkubectl get rs webapp-7bf7478b77 -o yaml",
    "anchor": "ex-19"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Get the YAML for one of the pods",
    "answer": "kubectl get po # get all the pods\n# OR you can find pods directly by:\nkubectl get po -l run=webapp # if you created deployment by 'run' command\nkubectl get po -l app=webapp # if you created deployment by 'create' command\nkubectl get po webapp-7bf7478b77-gjzp8 -o yaml",
    "anchor": "ex-20"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Check how the deployment rollout is going",
    "answer": "kubectl rollout status deploy webapp",
    "anchor": "ex-21"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Update the webapp image to nginx:1.19.8",
    "answer": "kubectl set image deploy webapp nginx=nginx:1.19.8\n# alternatively...\nkubectl edit deploy webapp # change the .spec.template.spec.containers[0].image The syntax of the 'kubectl set image' command is kubectl set image (-f FILENAME | TYPE NAME) CONTAINER_NAME_1=CONTAINER_IMAGE_1 ... CONTAINER_NAME_N=CONTAINER_IMAGE_N [options] Note: the container inside the deployment is named nginx (kubectl names the container after the image when kubectl create deploy webapp --image=nginx:1.18.0 is used), so the left-hand side of set image must be nginx, not webapp — otherwise you get error: container webapp is not valid for deployment webapp.",
    "anchor": "ex-22"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Check the rollout history and confirm that the replicas are OK",
    "answer": "kubectl rollout history deploy webapp\nkubectl get deploy webapp\nkubectl get rs # check that a new replica set has been created\nkubectl get po",
    "anchor": "ex-23"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Undo the latest rollout and verify that new pods have the old image (nginx:1.18.0)",
    "answer": "kubectl rollout undo deploy webapp\n# wait a bit\nkubectl get po # select one 'Running' Pod\nkubectl describe po webapp-5ff4457d65-nslcl | grep -i image # should be nginx:1.18.0",
    "anchor": "ex-24"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Do an on-purpose update of the deployment with a wrong image nginx:1.91",
    "answer": "kubectl set image deploy webapp nginx=nginx:1.91\n# or\nkubectl edit deploy webapp\n# change the image to nginx:1.91\n# vim tip: type (without quotes) '/image' and press Enter, to navigate quickly",
    "anchor": "ex-25"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Verify that something's wrong with the rollout",
    "answer": "kubectl rollout status deploy webapp\n# or\nkubectl get po # you'll see 'ErrImagePull' or 'ImagePullBackOff'",
    "anchor": "ex-26"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Return the deployment to the second revision (number 2) and verify the image is nginx:1.19.8",
    "answer": "kubectl rollout undo deploy webapp --to-revision=2\nkubectl describe deploy webapp | grep Image:\nkubectl rollout status deploy webapp # Everything should be OK",
    "anchor": "ex-27"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Check the details of the fourth revision (number 4)",
    "answer": "kubectl rollout history deploy webapp --revision=4 # You'll also see the wrong image displayed here",
    "anchor": "ex-28"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Scale the deployment to 5 replicas",
    "answer": "kubectl scale deploy webapp --replicas=5\nkubectl get po\nkubectl describe deploy webapp",
    "anchor": "ex-29"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Autoscale the deployment, pods between 5 and 10, targeting CPU utilization at 80%",
    "answer": "kubectl autoscale deploy webapp --min=5 --max=10 --cpu=80%\n# view the horizontalpodautoscalers.autoscaling for webapp\nkubectl get hpa webapp",
    "anchor": "ex-30"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Pause the rollout of the deployment",
    "answer": "kubectl rollout pause deploy webapp",
    "anchor": "ex-31"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Update the image to nginx:1.19.9 and check that there's nothing going on, since we paused the rollout",
    "answer": "kubectl set image deploy webapp nginx=nginx:1.19.9\n# or\nkubectl edit deploy webapp\n# change the image to nginx:1.19.9\nkubectl rollout history deploy webapp # no new revision",
    "anchor": "ex-32"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Resume the rollout and check that the nginx:1.19.9 image has been applied",
    "answer": "kubectl rollout resume deploy webapp\nkubectl rollout history deploy webapp\nkubectl rollout history deploy webapp --revision=6 # insert the number of your latest revision",
    "anchor": "ex-33"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Delete the deployment and the horizontal pod autoscaler you created",
    "answer": "kubectl delete deploy webapp\nkubectl delete hpa webapp\n# or\nkubectl delete deploy/webapp hpa/webapp",
    "anchor": "ex-34"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Implement canary deployment by running two instances of nginx marked as version=v1 and version=v2 so that the load is balanced at 75%-25% ratio",
    "answer": "Deploy 3 replicas of v1: apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: catalog-v1\n  labels:\n    app: catalog\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: catalog\n      version: v1\n  template:\n    metadata:\n      labels:\n        app: catalog\n        version: v1\n    spec:\n      containers:\n      - name: web\n        image: nginx\n        ports:\n        - containerPort: 80\n        volumeMounts:\n        - name: content\n          mountPath: /usr/share/nginx/html\n      initContainers:\n      - name: pagewriter\n        image: busybox:1.28\n        command:\n        - /bin/sh\n        - -c\n        - \"echo version-1 > /work-dir/index.html\"\n        volumeMounts:\n        - name: content\n          mountPath: \"/work-dir\"\n      volumes:\n      - name: content\n        emptyDir: {} Create the service: apiVersion: v1\nkind: Service\nmetadata:\n  name: catalog-svc\n  labels:\n    app: catalog\nspec:\n  type: ClusterIP\n  ports:\n  - name: http\n    port: 80\n    targetPort: 80\n  selector:\n    app: catalog Test if the deployment was successful from within a Pod: # run a wget to the Service catalog-svc\nkubectl run -it --rm --restart=Never probe --image=busybox --command -- wget -qO- catalog-svc\nversion-1 Deploy 1 replica of v2: apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: catalog-v2\n  labels:\n    app: catalog\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: catalog\n      version: v2\n  template:\n    metadata:\n      labels:\n        app: catalog\n        version: v2\n    spec:\n      containers:\n      - name: web\n        image: nginx\n        ports:\n        - containerPort: 80\n        volumeMounts:\n        - name: content\n          mountPath: /usr/share/nginx/html\n      initContainers:\n      - name: pagewriter\n        image: busybox:1.28\n        command:\n        - /bin/sh\n        - -c\n        - \"echo version-2 > /work-dir/index.html\"\n        volumeMounts:\n        - name: content\n          mountPath: \"/work-dir\"\n      volumes:\n      - name: content\n        emptyDir: {} Observe that calling the ip exposed by the service the requests are load balanced across the two versions: # run a busyBox pod that will make a wget call to the service catalog-svc and print out the version of the pod it reached.\nkubectl run -it --rm --restart=Never probe --image=busybox -- /bin/sh -c 'while sleep 1; do wget -qO- catalog-svc; done'\nversion-1\nversion-1\nversion-1\nversion-2\nversion-2\nversion-1 If the v2 is stable, scale it up to 4 replicas and shutdown the v1: kubectl scale --replicas=4 deploy catalog-v2\nkubectl delete deploy catalog-v1\n# hit the Service from inside the cluster (its ClusterIP is not reachable from your workstation)\nkubectl run probe --image=busybox --restart=Never -it --rm -- /bin/sh -c 'while sleep 1; do wget -qO- http://catalog-svc; done'\nversion-2\nversion-2\nversion-2\nversion-2\nversion-2\nversion-2",
    "anchor": "ex-35"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a job named digits with image perl:5.34 that runs the command with arguments &quot;perl -Mbignum=bpi -wle 'print bpi(2000)'&quot;",
    "answer": "kubectl create job digits --image=perl:5.34 -- perl -Mbignum=bpi -wle 'print bpi(2000)'",
    "anchor": "ex-36"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Wait till it's done, get the output",
    "answer": "kubectl get jobs -w # wait till 'SUCCESSFUL' is 1 (will take some time, perl image might be big)\nkubectl get po # get the pod name\nkubectl logs digits-**** # get the pi numbers\nkubectl delete job digits OR kubectl get jobs -w # wait till 'SUCCESSFUL' is 1 (will take some time, perl image might be big)\nkubectl logs job/digits\nkubectl delete job digits OR kubectl wait --for=condition=complete --timeout=300s job digits\nkubectl logs job/digits\nkubectl delete job digits",
    "anchor": "ex-37"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a job with the image busybox that executes the command 'echo hello;sleep 30;echo world'",
    "answer": "kubectl create job beeper --image=busybox -- /bin/sh -c 'echo hello;sleep 30;echo world'",
    "anchor": "ex-38"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Follow the logs for the pod (you'll wait for 30 seconds)",
    "answer": "kubectl get po # find the job pod\nkubectl logs beeper-ptx58 -f # follow the logs",
    "anchor": "ex-39"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "See the status of the job, describe it and see the logs",
    "answer": "kubectl get jobs\nkubectl describe jobs beeper\nkubectl logs job/beeper",
    "anchor": "ex-40"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Delete the job",
    "answer": "kubectl delete job beeper",
    "anchor": "ex-41"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create the same job, make it run 5 times, one after the other. Verify its status and delete it",
    "answer": "kubectl create job beeper --image=busybox --dry-run=client -o yaml -- /bin/sh -c 'echo hello;sleep 30;echo world' > job.yaml\nvi job.yaml Add job.spec.completions=5 and job.spec.completionMode=Indexed apiVersion: batch/v1\nkind: Job\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: beeper\n  name: beeper\nspec:\n  completions: 5 # add this line\n  completionMode: Indexed # add this line\n  template:\n    metadata:\n      creationTimestamp: null\n      labels:\n        run: beeper\n    spec:\n      containers:\n      - args:\n        - /bin/sh\n        - -c\n        - echo hello;sleep 30;echo world\n        image: busybox\n        name: beeper\n        resources: {}\n      restartPolicy: OnFailure\nstatus: {} kubectl create -f job.yaml Verify that it has been completed: kubectl get job beeper -w # will take two and a half minutes\nkubectl delete jobs beeper",
    "anchor": "ex-42"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create the same job, but make it run 5 parallel times",
    "answer": "vi job.yaml Add job.spec.parallelism=5 apiVersion: batch/v1\nkind: Job\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: beeper\n  name: beeper\nspec:\n  parallelism: 5 # add this line\n  template:\n    metadata:\n      creationTimestamp: null\n      labels:\n        run: beeper\n    spec:\n      containers:\n      - args:\n        - /bin/sh\n        - -c\n        - echo hello;sleep 30;echo world\n        image: busybox\n        name: beeper\n        resources: {}\n      restartPolicy: OnFailure\nstatus: {} kubectl create -f job.yaml\nkubectl get jobs It will take some time for the parallel jobs to finish (&gt;= 30 seconds) kubectl delete job beeper",
    "anchor": "ex-43"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a job but ensure that it will be automatically terminated by kubernetes if it takes more than 30 seconds to execute",
    "answer": "kubectl create job beeper --image=busybox --dry-run=client -o yaml -- /bin/sh -c 'while true; do echo hello; sleep 10;done' > job.yaml\nvi job.yaml Add job.spec.activeDeadlineSeconds=30 apiVersion: batch/v1\nkind: Job\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: beeper\n  name: beeper\nspec:\n  activeDeadlineSeconds: 30 # add this line\n  template:\n    metadata:\n      creationTimestamp: null\n      labels:\n        run: beeper\n    spec:\n      containers:\n      - args:\n        - /bin/sh\n        - -c\n        - while true; do echo hello; sleep 10;done\n        image: busybox\n        name: beeper\n        resources: {}\n      restartPolicy: OnFailure\nstatus: {}",
    "anchor": "ex-44"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a cron job with image busybox that runs on a schedule of &quot;/1    *&quot; and writes 'date; echo Hello from the Kubernetes cluster' to standard output",
    "answer": "kubectl create cronjob ticker --image=busybox --schedule=\"*/1 * * * *\" -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster'",
    "anchor": "ex-45"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "See its logs and delete it",
    "answer": "kubectl get po # copy the ID of the pod whose container was just created\nkubectl logs <ticker-***> # you will see the date and message \nkubectl delete cj ticker # cj stands for cronjob",
    "anchor": "ex-46"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create the same cron job again, and watch the status. Once it ran, check which job ran by the created cron job. Check the log, and delete the cron job",
    "answer": "kubectl get cj\nkubectl get jobs --watch\nkubectl get po --show-labels # observe that the pods have a label that mentions their 'parent' job\nkubectl logs ticker-1529745840-m867r\n# Bear in mind that Kubernetes will run a new job/pod for each new cron job\nkubectl delete cj ticker",
    "anchor": "ex-47"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a cron job with image busybox that runs every minute and writes 'date; echo Hello from the Kubernetes cluster' to standard output. The cron job should be terminated if it takes more than 17 seconds to start execution after its scheduled time (i.e. the job missed its scheduled time).",
    "answer": "kubectl create cronjob deadline-job --image=busybox --restart=Never --dry-run=client --schedule=\"* * * * *\" -o yaml -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster' > deadline-job.yaml\nvi deadline-job.yaml Add cronjob.spec.startingDeadlineSeconds=17 apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  creationTimestamp: null\n  name: deadline-job\nspec:\n  startingDeadlineSeconds: 17 # add this line\n  jobTemplate:\n    metadata:\n      creationTimestamp: null\n      name: deadline-job\n    spec:\n      template:\n        metadata:\n          creationTimestamp: null\n        spec:\n          containers:\n          - args:\n            - /bin/sh\n            - -c\n            - date; echo Hello from the Kubernetes cluster\n            image: busybox\n            name: deadline-job\n            resources: {}\n          restartPolicy: Never\n  schedule: '* * * * *'\nstatus: {}",
    "anchor": "ex-48"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a cron job with image busybox that runs every minute and writes 'date; echo Hello from the Kubernetes cluster' to standard output. The cron job should be terminated if it successfully starts but takes more than 12 seconds to complete execution.",
    "answer": "kubectl create cronjob deadline-job --image=busybox --restart=Never --dry-run=client --schedule=\"* * * * *\" -o yaml -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster' > deadline-job.yaml\nvi deadline-job.yaml Add cronjob.spec.jobTemplate.spec.activeDeadlineSeconds=12 apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  creationTimestamp: null\n  name: deadline-job\nspec:\n  jobTemplate:\n    metadata:\n      creationTimestamp: null\n      name: deadline-job\n    spec:\n      activeDeadlineSeconds: 12 # add this line\n      template:\n        metadata:\n          creationTimestamp: null\n        spec:\n          containers:\n          - args:\n            - /bin/sh\n            - -c\n            - date; echo Hello from the Kubernetes cluster\n            image: busybox\n            name: deadline-job\n            resources: {}\n          restartPolicy: Never\n  schedule: '* * * * *'\nstatus: {}",
    "anchor": "ex-49"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Keep only the last 2 successful and 1 failed runs of a CronJob",
    "answer": "Create a CronJob with history limits configured: kubectl create cronjob history-job \\\n  --image=busybox \\\n  --schedule=\"*/1 * * * *\" \\\n  --dry-run=client -o yaml \\\n  -- /bin/sh -c 'date; echo Hello from history demo' > history-job.yaml Edit the file: vi history-job.yaml Add the following fields under spec: apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: history-job\nspec:\n  schedule: \"*/1 * * * *\"\n  successfulJobsHistoryLimit: 2   # keep last 2 successful jobs\n  failedJobsHistoryLimit: 1        # keep last 1 failed job\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n          - name: history-job\n            image: busybox\n            args:\n            - /bin/sh\n            - -c\n            - date; echo Hello from history demo\n          restartPolicy: Never Apply the CronJob: kubectl apply -f history-job.yaml Verify job history behavior: kubectl get cj history-job\nkubectl get jobs --watch After several runs, confirm that:  Clean up: kubectl delete cj history-job",
    "anchor": "ex-50"
  },
  {
    "slug": "pod-design",
    "title": "Pod Design",
    "question": "Create a job from cronjob.",
    "answer": "kubectl create job --from=cronjob/ticker manual-run",
    "anchor": "ex-51"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a configmap named brioche with values flour=strong,rise=slow",
    "answer": "kubectl create configmap brioche --from-literal=flour=strong --from-literal=rise=slow",
    "anchor": "ex-0"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Display its values",
    "answer": "kubectl get cm brioche -o yaml\n# or\nkubectl describe cm brioche",
    "anchor": "ex-1"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create and display a configmap from a file",
    "answer": "Create the file with echo -e \"crumb=airy\\ncrust=crisp\" > batch.txt kubectl create cm baguette --from-file=batch.txt\nkubectl get cm baguette -o yaml",
    "anchor": "ex-2"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create and display a configmap from a .env file",
    "answer": "Create the file with the command echo -e \"butter=many\\n# this is a comment\\n\\nfold=triple\\n#anothercomment\" > mise.env kubectl create cm croissant --from-env-file=mise.env\nkubectl get cm croissant -o yaml",
    "anchor": "ex-3"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create and display a configmap from a file, giving the key 'starter'",
    "answer": "Create the file with echo -e \"tang=sharp\\nchew=slow\" > loaf.txt kubectl create cm sourdough --from-file=starter=loaf.txt\nkubectl describe cm sourdough\nkubectl get cm sourdough -o yaml",
    "anchor": "ex-4"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a configMap called 'focaccia' with the value topping=rosemary. Create a new nginx pod that loads the value from key 'topping' in an env variable called 'TOPPING'",
    "answer": "kubectl create cm focaccia --from-literal=topping=rosemary\nkubectl run chef --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: chef\n  name: chef\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: chef\n    resources: {}\n    env:\n    - name: TOPPING # name of the env variable\n      valueFrom:\n        configMapKeyRef:\n          name: focaccia # name of config map\n          key: topping # name of the entity in config map\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl exec -it chef -- env | grep TOPPING # will show 'TOPPING=rosemary'",
    "anchor": "ex-5"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a configMap 'pita' with values 'pocket=deep', 'warm=yes'. Load this configMap as env variables into a new nginx pod",
    "answer": "kubectl create configmap pita --from-literal=pocket=deep --from-literal=warm=yes\nkubectl run baker --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: baker\n  name: baker\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: baker\n    resources: {}\n    envFrom: # different than previous one, that was 'env'\n    - configMapRef: # different from the previous one, was 'configMapKeyRef'\n        name: pita # the name of the config map\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl exec -it baker -- env ",
    "anchor": "ex-6"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a configMap 'bagel' with values 'core=chewy', 'sheen=gloss'. Load this as a volume inside an nginx pod on path '/etc/config'. Create the pod and 'ls' into the '/etc/config' directory.",
    "answer": "kubectl create configmap bagel --from-literal=core=chewy --from-literal=sheen=gloss\nkubectl run oven --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: oven\n  name: oven\nspec:\n  volumes: # add a volumes list\n  - name: bread # just a name, you'll reference this in the pods\n    configMap:\n      name: bagel # name of your configmap\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: oven\n    resources: {}\n    volumeMounts: # your volume mounts are listed here\n    - name: bread # the name that you specified in pod.spec.volumes.name\n      mountPath: /etc/config # the path inside your container\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl exec -it oven -- /bin/sh\ncd /etc/config\nls # will show core sheen\ncat core # will show chewy",
    "anchor": "ex-7"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create the YAML for an nginx pod that runs with the user ID 101. No need to create the pod",
    "answer": "kubectl run sandbox --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: sandbox\n  name: sandbox\nspec:\n  securityContext: # insert this line\n    runAsUser: 101 # UID for the user\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: sandbox\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}",
    "anchor": "ex-8"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create the YAML for an nginx pod that has the capabilities &quot;NET_ADMIN&quot;, &quot;SYS_TIME&quot; added to its single container",
    "answer": "kubectl run elevated --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: elevated\n  name: elevated\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: elevated\n    securityContext: # insert this line\n      capabilities: # and this\n        add: [\"NET_ADMIN\", \"SYS_TIME\"] # this as well\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}",
    "anchor": "ex-9"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create an nginx pod with requests cpu=100m,memory=256Mi and limits cpu=200m,memory=512Mi",
    "answer": "kubectl run server --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: server\n  name: server\nspec:\n  containers:\n  - image: nginx\n    name: server\n    resources:\n      requests:\n        memory: \"256Mi\"\n        cpu: \"100m\"\n      limits:    \n        memory: \"512Mi\"\n        cpu: \"200m\"\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}",
    "anchor": "ex-10"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a namespace named bounds with a LimitRange that limits pod memory to a max of 500Mi and min of 100Mi",
    "answer": "kubectl create ns bounds vi mem-limit.yaml apiVersion: v1\nkind: LimitRange\nmetadata:\n  name: mem-bounds\n  namespace: bounds\nspec:\n  limits:\n  - max: # max and min define the limit range\n      memory: \"500Mi\"\n    min:\n      memory: \"100Mi\"\n    type: Pod kubectl apply -f mem-limit.yaml",
    "anchor": "ex-11"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Describe the namespace bounds",
    "answer": "kubectl describe ns bounds\n# and, to see the enforced values of the LimitRange:\nkubectl describe limitrange mem-bounds -n bounds",
    "anchor": "ex-12"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create an nginx pod that requests 250Mi of memory in the bounds namespace",
    "answer": "vi app.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: app\n  name: app\n  namespace: bounds\nspec:\n  containers:\n  - image: nginx\n    name: app\n    resources:\n      requests:\n        memory: \"250Mi\"\n      limits:\n        memory: \"500Mi\" # limit has to be specified and be <= limitrange\n  dnsPolicy: ClusterFirst\n  restartPolicy: Always\nstatus: {} kubectl apply -f app.yaml",
    "anchor": "ex-13"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create ResourceQuota in namespace billing with hard requests cpu=1, memory=1Gi and hard limits cpu=2, memory=2Gi.",
    "answer": "Create the namespace: kubectl create ns billing Create the ResourceQuota vi budget.yaml apiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: budget\n  namespace: billing\nspec:\n  hard:\n    requests.cpu: \"1\"\n    requests.memory: 1Gi\n    limits.cpu: \"2\"\n    limits.memory: 2Gi kubectl apply -f budget.yaml or kubectl create quota budget --namespace=billing --hard=requests.cpu=1,requests.memory=1Gi,limits.cpu=2,limits.memory=2Gi",
    "anchor": "ex-14"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Attempt to create a pod with resource requests cpu=2, memory=3Gi and limits cpu=3, memory=4Gi in namespace billing",
    "answer": "vi invoice.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: invoice\n  name: invoice\n  namespace: billing\nspec:\n  containers:\n  - image: nginx\n    name: invoice\n    resources:\n      requests:\n        memory: \"3Gi\"\n        cpu: \"2\"\n      limits:\n        memory: \"4Gi\"\n        cpu: \"3\"\n  dnsPolicy: ClusterFirst\n  restartPolicy: Always\nstatus: {} kubectl create -f invoice.yaml Expected error message: Error from server (Forbidden): error when creating \"invoice.yaml\": pods \"invoice\" is forbidden: exceeded quota: budget, requested: limits.cpu=3,limits.memory=4Gi,requests.cpu=2,requests.memory=3Gi, used: limits.cpu=0,limits.memory=0,requests.cpu=0,requests.memory=0, limited: limits.cpu=2,limits.memory=2Gi,requests.cpu=1,requests.memory=1Gi",
    "anchor": "ex-15"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a pod with resource requests cpu=0.5, memory=1Gi and limits cpu=1, memory=2Gi in namespace billing",
    "answer": "vi receipt.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: receipt\n  name: receipt\n  namespace: billing\nspec:\n  containers:\n  - image: nginx\n    name: receipt\n    resources:\n      requests:\n        memory: \"1Gi\"\n        cpu: \"0.5\"\n      limits:\n        memory: \"2Gi\"\n        cpu: \"1\"\n  dnsPolicy: ClusterFirst\n  restartPolicy: Always\nstatus: {} kubectl create -f receipt.yaml Show the ResourceQuota usage in namespace billing kubectl get resourcequota -n billing NAME     AGE   REQUEST                                          LIMIT\nbudget   10m   requests.cpu: 500m/1, requests.memory: 1Gi/1Gi   limits.cpu: 1/2, limits.memory: 2Gi/2Gi",
    "anchor": "ex-16"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a secret called gateway with the values password=swordfish",
    "answer": "kubectl create secret generic gateway --from-literal=password=swordfish",
    "anchor": "ex-17"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a secret called creds that gets key/value from a file",
    "answer": "Create a file called user with the value admin: echo -n admin > user kubectl create secret generic creds --from-file=user",
    "anchor": "ex-18"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Get the value of creds",
    "answer": "kubectl get secret creds -o yaml\necho -n YWRtaW4= | base64 -d # on MAC it is -D, which decodes the value and shows 'admin' Alternative using --jsonpath: kubectl get secret creds -o jsonpath='{.data.user}' | base64 -d  # on MAC it is -D Alternative using --template: kubectl get secret creds --template '{{.data.user}}' | base64 -d  # on MAC it is -D Alternative using jq: kubectl get secret creds -o json | jq -r .data.user | base64 -d  # on MAC it is -D",
    "anchor": "ex-19"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create an nginx pod that mounts the secret creds in a volume on path /etc/creds",
    "answer": "kubectl run reader --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: reader\n  name: reader\nspec:\n  volumes: # specify the volumes\n  - name: creds # this name will be used for reference inside the container\n    secret: # we want a secret\n      secretName: creds # name of the secret - this must already exist on pod creation\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: reader\n    resources: {}\n    volumeMounts: # our volume mounts\n    - name: creds # name on pod.spec.volumes\n      mountPath: /etc/creds #our mount path\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl exec -it reader -- /bin/bash\nls /etc/creds  # shows user\ncat /etc/creds/user # shows admin",
    "anchor": "ex-20"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Delete the pod you just created and mount the variable 'user' from secret creds onto a new nginx pod in env variable called 'USER'",
    "answer": "kubectl delete po reader\nkubectl run env-consumer --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: env-consumer\n  name: env-consumer\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: env-consumer\n    resources: {}\n    env: # our env variables\n    - name: USER # asked name\n      valueFrom:\n        secretKeyRef: # secret reference\n          name: creds # our secret's name\n          key: user # the key of the data in the secret\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl exec -it env-consumer -- env | grep USER | cut -d '=' -f 2 # will show 'admin'",
    "anchor": "ex-21"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a Secret named 'external-api' in the namespace 'vault'. Then, provide the key-value pair API_KEY=LmWfRzVnYxQaKdCjTuShPeObIgXcQ as literal.",
    "answer": "kubectl create namespace vault # make sure the namespace exists first\nexport ns=\"-n vault\"\nexport do=\"--dry-run=client -oyaml\"\nk create secret generic external-api --from-literal=API_KEY=LmWfRzVnYxQaKdCjTuShPeObIgXcQ $ns $do > sc.yaml\nk apply -f sc.yaml",
    "anchor": "ex-22"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Consuming the Secret. Create a Pod named 'fetcher' with the image 'nginx' in the namespace 'vault' and consume the Secret as an environment variable. Then, open an interactive shell to the Pod, and print all environment variables.",
    "answer": "export ns=\"-n vault\"\nexport do=\"--dry-run=client -oyaml\"\nk run fetcher --image=nginx --restart=Never $ns $do > nginx.yaml\nvi nginx.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: fetcher\n  name: fetcher\n  namespace: vault\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: fetcher\n    resources: {}\n    env:\n    - name: API_KEY\n      valueFrom:\n        secretKeyRef:\n          name: external-api\n          key: API_KEY\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} k create $ns -f nginx.yaml\nk exec -it $ns fetcher -- /bin/sh\n#env",
    "anchor": "ex-23"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a Secret named 'ssh-key' of type 'kubernetes.io/ssh-auth' in the namespace 'vault'. Define a single key named 'ssh-privatekey', and point it to the file 'id_rsa' in this directory.",
    "answer": "#Tips, export to variable\nexport do=\"--dry-run=client -oyaml\"\nexport ns=\"-n vault\"\n#if id_rsa file didn't exist, generate it in the CURRENT directory (--from-file looks here):\nssh-keygen -t rsa -f id_rsa -N \"\"\nk create secret generic ssh-key $ns --type=\"kubernetes.io/ssh-auth\" --from-file=ssh-privatekey=id_rsa $do > sc.yaml\nk apply -f sc.yaml",
    "anchor": "ex-24"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a Pod named 'agent' with the image 'nginx' in the namespace 'vault', and consume the Secret as Volume. Mount the Secret as Volume to the path /var/app with read-only access. Open an interactive shell to the Pod, and render the contents of the file.",
    "answer": "#Tips, export to variable\nexport ns=\"-n vault\"\nexport do=\"--dry-run=client -oyaml\"\nk run agent --image=nginx --restart=Never $ns $do > nginx.yaml\nvi nginx.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: agent\n  name: agent\n  namespace: vault\nspec:\n  containers:\n    - image: nginx\n      imagePullPolicy: IfNotPresent\n      name: agent\n      resources: {}\n      volumeMounts:\n        - name: sshkey\n          mountPath: \"/var/app\"\n          readOnly: true\n  volumes:\n    - name: sshkey\n      secret:\n        secretName: ssh-key\n        optional: true\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} k exec -it $ns agent -- /bin/sh\n# cat /var/app/ssh-privatekey\n# exit",
    "anchor": "ex-25"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "See all the service accounts of the cluster in all namespaces",
    "answer": "kubectl get sa --all-namespaces Alternatively kubectl get sa -A",
    "anchor": "ex-26"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create a new serviceaccount called 'builder'",
    "answer": "kubectl create sa builder Alternatively: # let's get a template easily\nkubectl get sa default -o yaml > sa.yaml\nvim sa.yaml apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: builder kubectl create -f sa.yaml",
    "anchor": "ex-27"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Create an nginx pod that uses 'builder' as a service account",
    "answer": "kubectl run runner --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: runner\n  name: runner\nspec:\n  serviceAccountName: builder # we use pod.spec.serviceAccountName\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: runner\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} or apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: runner\n  name: runner\nspec:\n  serviceAccount: builder # deprecated alias for pod.spec.serviceAccountName\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: runner\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl get pod runner -o jsonpath='{.spec.serviceAccountName}' # output: builder\nkubectl exec -it runner -- cat /var/run/secrets/kubernetes.io/serviceaccount/token # to check if the ServiceAccount token is mounted inside the Pod. Starting from Kubernetes 1.24+, the token is dynamically projected into the Pod",
    "anchor": "ex-28"
  },
  {
    "slug": "configuration",
    "title": "Configuration",
    "question": "Generate an API token for the service account 'builder'",
    "answer": "kubectl create token builder",
    "anchor": "ex-29"
  },
  {
    "slug": "observability",
    "title": "Observability",
    "question": "Create an nginx pod with a liveness probe that just runs the command 'ls'. Save its YAML in pod.yaml. Run it, check its probe status, delete it.",
    "answer": "kubectl run sentinel --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: sentinel\n  name: sentinel\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: sentinel\n    resources: {}\n    livenessProbe: # our probe\n      exec: # add this line\n        command: # command definition\n        - ls # ls command\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl describe pod sentinel | grep -i liveness # run this to see that liveness probe works\nkubectl delete -f pod.yaml",
    "anchor": "ex-0"
  },
  {
    "slug": "observability",
    "title": "Observability",
    "question": "Modify the pod.yaml file so that liveness probe starts kicking in after 5 seconds whereas the interval between probes would be 5 seconds. Run it, check the probe, delete it.",
    "answer": "kubectl explain pod.spec.containers.livenessProbe # get the exact names apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: sentinel\n  name: sentinel\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: sentinel\n    resources: {}\n    livenessProbe:\n      initialDelaySeconds: 5 # add this line\n      periodSeconds: 5 # add this line as well\n      exec:\n        command:\n        - ls\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl describe po sentinel | grep -i liveness\nkubectl delete -f pod.yaml",
    "anchor": "ex-1"
  },
  {
    "slug": "observability",
    "title": "Observability",
    "question": "Create an nginx pod (that includes port 80) with an HTTP readinessProbe on path '/' on port 80. Again, run it, check the readinessProbe, delete it.",
    "answer": "kubectl run relay --image=nginx --dry-run=client -o yaml --restart=Never --port=80 > pod.yaml\nvi pod.yaml apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: relay\n  name: relay\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: relay\n    resources: {}\n    ports:\n    - containerPort: 80 # Note: Readiness probes runs on the container during its whole lifecycle. Since nginx exposes 80, containerPort: 80 is not required for readiness to work.\n    readinessProbe: # declare the readiness probe\n      httpGet: # add this line\n        path: / #\n        port: 80 #\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {} kubectl create -f pod.yaml\nkubectl describe pod relay | grep -i readiness # to see the pod readiness details\nkubectl delete -f pod.yaml",
    "anchor": "ex-2"
  },
  {
    "slug": "observability",
    "title": "Observability",
    "question": "Lots of pods are running in alpha,beta,gamma,delta namespaces.  All of these pods are configured with liveness probe.  Please list all pods whose liveness probe are failed in the format of &lt;namespace&gt;/&lt;pod name&gt; per line.",
    "answer": "A typical liveness probe failure event LAST SEEN   TYPE      REASON      OBJECT              MESSAGE\n22m         Warning   Unhealthy   pod/sentinel        Liveness probe failed: cat: can't open '/tmp/healthy': No such file or directory collect failed pods namespace by namespace kubectl get events -A -o json | jq -r '.items[] | select(.message | contains(\"Liveness probe failed\")).involvedObject | .namespace + \"/\" + .name'",
    "anchor": "ex-3"
  },
  {
    "slug": "observability",
    "title": "Observability",
    "question": "Create a busybox pod that runs i=0; while true; do echo &quot;$i: $(date)&quot;; i=$((i+1)); sleep 1; done. Check its logs",
    "answer": "kubectl run logger --image=busybox --restart=Never -- /bin/sh -c 'i=0; while true; do echo \"$i: $(date)\"; i=$((i+1)); sleep 1; done'\nkubectl logs logger -f # follow the logs",
    "anchor": "ex-4"
  },
  {
    "slug": "observability",
    "title": "Observability",
    "question": "Create a busybox pod that runs 'ls /notexist'. Determine if there's an error (of course there is), see it. In the end, delete the pod",
    "answer": "kubectl run faulty --restart=Never --image=busybox -- /bin/sh -c 'ls /notexist'\n# show that there's an error\nkubectl logs faulty\nkubectl describe po faulty\nkubectl delete po faulty",
    "anchor": "ex-5"
  },
  {
    "slug": "observability",
    "title": "Observability",
    "question": "Create a busybox pod that runs 'notexist'. Determine if there's an error (of course there is), see it. In the end, delete the pod forcefully with a 0 grace period",
    "answer": "kubectl run broken --restart=Never --image=busybox -- notexist\nkubectl logs broken # will bring nothing! container never started\nkubectl describe po broken # in the events section, you'll see the error\n# also...\nkubectl get events | grep -i error # you'll see the error here as well\nkubectl delete po broken --force --grace-period=0",
    "anchor": "ex-6"
  },
  {
    "slug": "observability",
    "title": "Observability",
    "question": "Get CPU/memory utilization for nodes (metrics-server must be running)",
    "answer": "kubectl top nodes",
    "anchor": "ex-7"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Create a pod with image nginx called web and expose its port 80",
    "answer": "kubectl run web --image=nginx --restart=Never --port=80 --expose\n# observe that a pod as well as a service are created",
    "anchor": "ex-0"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Confirm that ClusterIP has been created. Also check endpoints",
    "answer": "kubectl get svc web # services\nkubectl get ep # endpoints",
    "anchor": "ex-1"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Get service's ClusterIP, create a temp busybox pod and 'hit' that IP with wget",
    "answer": "kubectl get svc web # get the IP (something like 10.108.93.130)\nkubectl run tester --rm --image=busybox -it --restart=Never --\nwget -O- [PUT THE POD'S IP ADDRESS HERE]:80\nexit or IP=$(kubectl get svc web --template={{.spec.clusterIP}}) # get the IP (something like 10.108.93.130)\nkubectl run tester --rm --image=busybox -it --restart=Never --env=\"IP=$IP\" -- wget -O- $IP:80 --timeout 2\n# Tip: --timeout is optional, but it helps to get answer more quickly when connection fails (in seconds vs minutes)",
    "anchor": "ex-2"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Convert the ClusterIP to NodePort for the same service and find the NodePort port. Hit service using Node's IP. Delete the service and the pod at the end.",
    "answer": "kubectl edit svc web apiVersion: v1\nkind: Service\nmetadata:\n  name: web\n  namespace: default\nspec:\n  clusterIP: 10.97.242.220\n  ports:\n  - port: 80\n    protocol: TCP\n    targetPort: 80\n  selector:\n    run: web\n  sessionAffinity: None\n  type: NodePort # change type from ClusterIP to NodePort or kubectl patch svc web -p '{\"spec\":{\"type\":\"NodePort\"}}'  kubectl get svc # result:\nNAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE\nkubernetes   ClusterIP   10.96.0.1        <none>        443/TCP        1d\nweb          NodePort    10.107.253.138   <none>        80:31931/TCP   3m wget -O- NODE_IP:31931 # if you're using Kubernetes with Docker for Windows/Mac, try 127.0.0.1\n#if you're using minikube, try minikube ip, then get the node ip such as 192.168.99.117 kubectl delete svc web # Deletes the service\nkubectl delete pod web # Deletes the pod",
    "anchor": "ex-3"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Create a deployment called hello using image 'gcr.io/google-samples/hello-app:1.0' (a simple server that returns hostname) and 3 replicas. Label it as 'app=hello'. Declare that containers in this pod will accept traffic on port 8080 (do NOT create a service yet)",
    "answer": "kubectl create deploy hello --image=gcr.io/google-samples/hello-app:1.0 --port=8080 --replicas=3\nkubectl label deployment hello --overwrite app=hello #This is optional since kubectl create deploy hello will create label app=hello by default",
    "anchor": "ex-4"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Get the pod IPs. Create a temp busybox pod and try hitting them on port 8080",
    "answer": "kubectl get pods -l app=hello -o wide # 'wide' will show pod IPs\nkubectl run tester --image=busybox --restart=Never -it --rm -- sh\nwget -O- <POD_IP>:8080 # do not try with pod name, will not work\n# try hitting all IPs generated after running 1st command to confirm that hostname is different\nexit\n# or\nkubectl get po -o wide -l app=hello | awk '{print $6}' | grep -v IP | xargs -L1 -I '{}' kubectl run --rm -i tester --restart=Never --image=busybox -- wget -O- http://\\{\\}:8080\n# or\nkubectl get po -l app=hello -o jsonpath='{range .items[*]}{.status.podIP}{\"\\n\"}{end}' | xargs -L1 -I '{}' kubectl run --rm -i tester --restart=Never --image=busybox -- wget -O- http://\\{\\}:8080",
    "anchor": "ex-5"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Create a service that exposes the deployment on port 6262. Verify its existence, check the endpoints",
    "answer": "kubectl expose deploy hello --port=6262 --target-port=8080\nkubectl get service hello # you will see ClusterIP as well as port 6262\nkubectl get endpoints hello # you will see the IPs of the three replica pods, listening on port 8080",
    "anchor": "ex-6"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Create a temp busybox pod and connect via wget to hello service. Verify that each time there's a different hostname returned. Delete deployment and services to cleanup the cluster",
    "answer": "kubectl get svc # get the hello service ClusterIP\nkubectl run tester --image=busybox -it --rm --restart=Never -- sh\nwget -O- hello:6262 # DNS works! run it many times, you'll see different pods responding\nwget -O- <SERVICE_CLUSTER_IP>:6262 # ClusterIP works as well\n# you can also kubectl logs on deployment pods to see the container logs\nkubectl delete svc hello\nkubectl delete deploy hello",
    "anchor": "ex-7"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Create an nginx deployment of 2 replicas, expose it via a ClusterIP service on port 80. Create a NetworkPolicy so that only pods with labels 'access: granted' can access the pods in this deployment and apply it",
    "answer": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Services, Load Balancing, and Networking &gt; Network Policies Note that network policies may not be enforced by default, depending on your k8s implementation. E.g. Azure AKS by default won't have policy enforcement, the cluster must be created with an explicit support for netpol (see Azure docs). kubectl create deployment secure --image=nginx --replicas=2\nkubectl expose deployment secure --port=80\nkubectl describe svc secure # see the 'app=secure' selector for the pods\n# or\nkubectl get svc secure -o yaml\nvi policy.yaml kind: NetworkPolicy\napiVersion: networking.k8s.io/v1\nmetadata:\n  name: secure-allow # pick a name\nspec:\n  podSelector:\n    matchLabels:\n      app: secure # selector for the pods\n  ingress: # allow ingress traffic\n  - from:\n    - podSelector: # from pods\n        matchLabels: # with this label\n          access: granted # Create the NetworkPolicy\nkubectl create -f policy.yaml\n# Check if the Network Policy has been created correctly\n# make sure that your cluster's network provider supports Network Policy (https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/#before-you-begin)\nkubectl run tester --image=busybox --rm -it --restart=Never -- wget -O- http://secure:80 --timeout 2 # This should not work. --timeout is optional here. But it helps to get answer more quickly (in seconds vs minutes)\nkubectl run granted --image=busybox --rm -it --restart=Never --labels=access=granted -- wget -O- http://secure:80 --timeout 2  # This should be fine",
    "anchor": "ex-8"
  },
  {
    "slug": "services-networking",
    "title": "Services & Networking",
    "question": "Create an Ingress resource to expose an existing service using HTTP path routing",
    "answer": "You already have:  You want to expose it externally using an Ingress rule. Note that in CKAD, you are not required to install an Ingress Controller, but you must know how to define and troubleshoot an Ingress resource and understand how it connects to a Service. Verify the service exists: kubectl get svc secure Expected:  If the Deployment and Service do not already exist in your practice environment, you can create them using the following commands: kubectl create deployment secure --image=nginx --port=80\nkubectl expose deployment secure --port=80 Create an Ingress resource: vi ingress.yaml apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: secure-ingress\nspec:\n  rules:\n  - host: secure.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: secure\n            port:\n              number: 80 Apply it: kubectl apply -f ingress.yaml Verify the Ingress: kubectl get ingress\nkubectl describe ingress secure-ingress",
    "anchor": "ex-9"
  },
  {
    "slug": "state-persistence",
    "title": "State Persistence",
    "question": "Create busybox pod with two containers, each one will have the image busybox and will run the 'sleep 3600' command. Make both containers mount an emptyDir at '/shared'. Connect to the second container, write the first column of '/etc/passwd' file to '/shared/passwd'. Connect to the first container and write '/shared/passwd' file to standard output. Delete pod.",
    "answer": "This question is probably a better fit for the 'Multi-container-pods' section but I'm keeping it here as it will help you get acquainted with state The easiest way to do this is to create a template pod with: kubectl run tandem --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'sleep 3600' > pod.yaml\nvi pod.yaml Copy paste the container definition and type the lines that have a comment in the end: apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: tandem\n  name: tandem\nspec:\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\n  containers:\n  - args:\n    - /bin/sh\n    - -c\n    - sleep 3600\n    image: busybox\n    imagePullPolicy: IfNotPresent\n    name: writer\n    resources: {}\n    volumeMounts: #\n    - name: scratch #\n      mountPath: /shared #\n  - args:\n    - /bin/sh\n    - -c\n    - sleep 3600\n    image: busybox\n    name: reader # don't forget to change the name during copy paste, must be different from the first container's name!\n    volumeMounts: #\n    - name: scratch #\n      mountPath: /shared #\n  volumes: #\n  - name: scratch #\n    emptyDir: {} # In case you forget to add ``bash -- /bin/sh -c 'sleep 3600'`` in template pod create command, you can include command field in config file spec:\n  containers:\n  - image: busybox\n    name: writer\n    command: [\"/bin/sh\", \"-c\", \"sleep 3600\"] Connect to the second container: kubectl exec -it tandem -c reader -- /bin/sh\ncat /etc/passwd | cut -f 1 -d ':' > /shared/passwd # instead of cut command you can use awk -F \":\" '{print $1}'\ncat /shared/passwd # confirm that stuff has been written successfully\nexit Connect to the first container: kubectl exec -it tandem -c writer -- /bin/sh\nmount | grep shared # confirm the mounting\ncat /shared/passwd\nexit\nkubectl delete po tandem",
    "anchor": "ex-0"
  },
  {
    "slug": "state-persistence",
    "title": "State Persistence",
    "question": "Create a PersistentVolume of 10Gi, called 'store'. Make it have accessMode of 'ReadWriteOnce' and 'ReadWriteMany', storageClassName 'standard', mounted on hostPath '/mnt/data'. Save it on pv.yaml, add it to the cluster. Show the PersistentVolumes that exist on the cluster",
    "answer": "vi pv.yaml kind: PersistentVolume\napiVersion: v1\nmetadata:\n  name: store\nspec:\n  storageClassName: standard\n  capacity:\n    storage: 10Gi\n  accessModes:\n    - ReadWriteOnce\n    - ReadWriteMany\n  hostPath:\n    path: /mnt/data Show the PersistentVolumes: kubectl create -f pv.yaml\n# will have status 'Available'\nkubectl get pv Note: the official access modes table lists hostPath as ReadWriteOnce only. The API still accepts ReadWriteMany here (it does not validate against the plugin), so the claim below still binds — but for a truly multi-node readable/writable volume you would need a plugin such as NFS.",
    "anchor": "ex-1"
  },
  {
    "slug": "state-persistence",
    "title": "State Persistence",
    "question": "Create a PersistentVolumeClaim for this PersistentVolume, called 'store-claim', a request of 4Gi and an accessMode of ReadWriteOnce, with the storageClassName of standard, and save it on pvc.yaml. Create it on the cluster. Show the PersistentVolumeClaims of the cluster. Show the PersistentVolumes of the cluster",
    "answer": "vi pvc.yaml kind: PersistentVolumeClaim\napiVersion: v1\nmetadata:\n  name: store-claim\nspec:\n  storageClassName: standard\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 4Gi Create it on the cluster: kubectl create -f pvc.yaml Show the PersistentVolumeClaims and PersistentVolumes: kubectl get pvc # will show as 'Bound'\nkubectl get pv # will show as 'Bound' as well",
    "anchor": "ex-2"
  },
  {
    "slug": "state-persistence",
    "title": "State Persistence",
    "question": "Create a busybox pod with command 'sleep 3600', save it on pod.yaml. Mount the PersistentVolumeClaim to '/data'. Connect to the 'storer' pod, and copy the '/etc/passwd' file to '/data/passwd'",
    "answer": "Create a skeleton pod: kubectl run storer --image=busybox --restart=Never -o yaml --dry-run=client -- /bin/sh -c 'sleep 3600' > pod.yaml\nvi pod.yaml Add the lines that finish with a comment: apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: storer\n  name: storer\nspec:\n  containers:\n  - args:\n    - /bin/sh\n    - -c\n    - sleep 3600\n    image: busybox\n    imagePullPolicy: IfNotPresent\n    name: storer\n    resources: {}\n    volumeMounts: #\n    - name: store #\n      mountPath: /data #\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\n  volumes: #\n  - name: store #\n    persistentVolumeClaim: #\n      claimName: store-claim #\nstatus: {} Create the pod: kubectl create -f pod.yaml Connect to the pod and copy '/etc/passwd' to '/data/passwd': kubectl exec storer -it -- cp /etc/passwd /data/passwd",
    "anchor": "ex-3"
  },
  {
    "slug": "state-persistence",
    "title": "State Persistence",
    "question": "Create a second pod which is identical with the one you just created (you can easily do it by changing the 'name' property on pod.yaml). Connect to it and verify that '/data' contains the 'passwd' file. Delete pods to cleanup. Note: If you can't see the file from the second pod, can you figure out why? What would you do to fix that?",
    "answer": "Create the second pod, called storer2: vim pod.yaml\n# change 'metadata.name: storer' to 'metadata.name: storer2'\nkubectl create -f pod.yaml\nkubectl exec storer2 -- ls /data # will show 'passwd'\n# cleanup\nkubectl delete po storer storer2\nkubectl delete pvc store-claim\nkubectl delete pv store If the file doesn't show on the second pod but it shows on the first, it has most likely been scheduled on a different node. # check which nodes the pods are on\nkubectl get po storer -o wide\nkubectl get po storer2 -o wide If they are on different nodes, you won't see the file, because we used the hostPath volume type. If you need to access the same files in a multi-node cluster, you need a volume type that is independent of a specific node. There are lots of different types per cloud provider (see here), a general solution could be to use NFS.",
    "anchor": "ex-4"
  },
  {
    "slug": "state-persistence",
    "title": "State Persistence",
    "question": "Create a busybox pod with 'sleep 3600' as arguments. Copy '/etc/passwd' from the pod to your local folder",
    "answer": "kubectl run carrier --image=busybox --restart=Never -- sleep 3600\nkubectl cp carrier:/etc/passwd ./passwd # kubectl cp command\n# previous command might report an error, feel free to ignore it since copy command works\ncat passwd",
    "anchor": "ex-5"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Creating a basic Helm chart",
    "answer": "helm create weather ## this would create a new chart skeleton named weather",
    "anchor": "ex-0"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Running a Helm chart",
    "answer": "helm install -f myvalues.yaml forecast ./weather",
    "anchor": "ex-1"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Find pending Helm deployments on all namespaces",
    "answer": "helm list --pending -A",
    "anchor": "ex-2"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Uninstall a Helm release",
    "answer": "helm uninstall -n ops forecast",
    "anchor": "ex-3"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Upgrading a Helm chart",
    "answer": "helm upgrade -f myvalues.yaml -f override.yaml forecast ./weather",
    "anchor": "ex-4"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Using Helm repo",
    "answer": "Add, list, remove, update and index chart repos helm repo add [NAME] [URL]  [flags]\nhelm repo list / helm repo ls\nhelm repo remove [REPO1] [flags]\nhelm repo update / helm repo up\nhelm repo update [REPO1] [flags]\nhelm repo index [DIR] [flags]",
    "anchor": "ex-5"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Download a Helm chart from a repository",
    "answer": "helm pull [chart URL | repo/chartname] [...] [flags] ## this would download a chart, not install it\nhelm pull --untar repo/chartname # untar the chart after downloading it ",
    "anchor": "ex-6"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Add the Bitnami repo at https://charts.bitnami.com/bitnami to Helm",
    "answer": "helm repo add bitnami https://charts.bitnami.com/bitnami",
    "anchor": "ex-7"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Write the contents of the values.yaml file of the bitnami/node chart to standard output",
    "answer": "helm show values bitnami/node",
    "anchor": "ex-8"
  },
  {
    "slug": "helm",
    "title": "Helm",
    "question": "Install the bitnami/node chart setting the number of replicas to 5",
    "answer": "To achieve this, we need two key pieces of information:  To identify the name of the attribute in the values.yaml file, we could get all the values, as in the previous task, and then grep to find attributes matching the pattern replica helm show values bitnami/node | grep -i replica which returns ## @param replicaCount Specify the number of replicas for the application\nreplicaCount: 1 We can use the --set argument during installation to override attribute values. Hence, to set the replica count to 5, we need to run helm install forecast bitnami/node --set replicaCount=5 Cluster/pull pitfall. This chart (pinned to old debian-11-r* tags) pulls a bitnami/git init container (git-clone-repository) plus a bitnami/mongodb dependency. Those old tags have been removed from Docker Hub (Bitnami now ships sha256-…-style tags), so on a cluster with no registry access the install can fail with ImagePullBackOff/ErrImagePull on the init container — the release deploys but never becomes Ready. To verify the helm mechanics alone, helm template forecast bitnami/node --set replicaCount=5 still renders the 5-replica Deployment (that's what the exam checks); only the running install needs the images.",
    "anchor": "ex-9"
  },
  {
    "slug": "crd",
    "title": "CRDs",
    "question": "Create a CustomResourceDefinition manifest file for an Employee resource with the following specifications :",
    "answer": " apiVersion: apiextensions.k8s.io/v1\nkind: CustomResourceDefinition\nmetadata:\n  # name must match the spec fields below, and be in the form: <plural>.<group>\n  name: employees.hr.example.com\nspec:\n  group: hr.example.com\n  versions:\n    - name: v1\n      served: true\n      # One and only one version must be marked as the storage version.\n      storage: true\n      schema:\n        openAPIV3Schema:\n          type: object\n          properties:\n            spec:\n              type: object\n              properties:\n                contact:\n                  type: string\n                nickname:\n                  type: string\n                level:\n                  type: integer\n  scope: Namespaced\n  names:\n    plural: employees\n    singular: employee\n    # kind is normally the CamelCased singular type. Your resource manifests use this.\n    kind: Employee\n    shortNames:\n    - emp",
    "anchor": "ex-0"
  },
  {
    "slug": "crd",
    "title": "CRDs",
    "question": "Create the CRD resource in the K8S API",
    "answer": "kubectl apply -f employee-crd.yml",
    "anchor": "ex-1"
  },
  {
    "slug": "crd",
    "title": "CRDs",
    "question": "Create custom object from the CRD",
    "answer": " apiVersion: hr.example.com/v1\nkind: Employee\nmetadata:\n  name: jane-ross\nspec:\n  contact: jane.ross@hr.example.com\n  nickname: \"jane ross\"\n  level: 30 kubectl apply -f employee.yml",
    "anchor": "ex-2"
  },
  {
    "slug": "crd",
    "title": "CRDs",
    "question": "Listing employees",
    "answer": "Use singular, plural and short forms kubectl get employees\nor\nkubectl get employee\nor\nkubectl get emp",
    "anchor": "ex-3"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Create a Dockerfile to deploy an Apache HTTP Server which hosts a custom main page",
    "answer": "FROM httpd:2.4\nRUN echo \"Hello from Podman!\" > /usr/local/apache2/htdocs/index.html",
    "anchor": "ex-0"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Build and see how many layers the image consists of",
    "answer": ":~$ podman build -t welcome .\nSTEP 1/2: FROM httpd:2.4\nSTEP 2/2: RUN echo \"Hello from Podman!\" > /usr/local/apache2/htdocs/index.html\nCOMMIT welcome\n--> ef4b14a72d0\nSuccessfully tagged localhost/welcome:latest\nef4b14a72d02ae0577eb0632d084c057777725c279e12ccf5b0c6e4ff5fd598b\n:~$ podman images\nREPOSITORY               TAG         IMAGE ID      CREATED        SIZE\nlocalhost/welcome        latest      ef4b14a72d02  8 seconds ago  148 MB\ndocker.io/library/httpd  2.4         98f93cd0ec3b  7 days ago     148 MB\n:~$ podman image tree localhost/welcome:latest\nImage ID: ef4b14a72d02\nTags:     [localhost/welcome:latest]\nSize:     147.8MB\nImage Layers\n├── ID: ad6562704f37 Size:  83.9MB\n├── ID: c234616e1912 Size: 3.072kB\n├── ID: c23a797b2d04 Size: 2.721MB\n├── ID: ede2e092faf0 Size: 61.11MB\n├── ID: 971c2cdf3872 Size: 3.584kB Top Layer of: [docker.io/library/httpd:2.4]\n└── ID: 61644e82ef1f Size: 6.144kB Top Layer of: [localhost/welcome:latest]",
    "anchor": "ex-1"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Run the image locally, inspect its status and logs, finally test that it responds as expected",
    "answer": ":~$ podman run -d --name site -p 8080:80 localhost/welcome\n2f3d7d613ea6ba19703811d30704d4025123c7302ff6fa295affc9bd30e532f8\n:~$ podman ps\nCONTAINER ID  IMAGE                     COMMAND           CREATED        STATUS            PORTS                 NAMES\n2f3d7d613ea6  localhost/welcome:latest  httpd-foreground  5 seconds ago  Up 6 seconds ago  0.0.0.0:8080->80/tcp  site\n:~$ podman logs site\nAH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 10.0.2.100. Set the 'ServerName' directive globally to suppress this message\nAH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 10.0.2.100. Set the 'ServerName' directive globally to suppress this message\n[Sat Jun 04 16:15:38.071377 2022] [mpm_event:notice] [pid 1:tid 139756978220352] AH00489: Apache/2.4.53 (Unix) configured -- resuming normal operations\n[Sat Jun 04 16:15:38.073570 2022] [core:notice] [pid 1:tid 139756978220352] AH00094: Command line: 'httpd -D FOREGROUND'\n:~$ curl 0.0.0.0:8080\nHello from Podman!",
    "anchor": "ex-2"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Run a command inside the pod to print out the index.html file",
    "answer": ":~$ podman exec -it site cat /usr/local/apache2/htdocs/index.html\nHello from Podman!",
    "anchor": "ex-3"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Tag the image with ip and port of a private local registry and then push the image to this registry",
    "answer": "Note: Some small distributions of Kubernetes (such as microk8s) have a built-in registry you can use for this exercise. If this is not your case, you'll have to setup it on your own. :~$ podman tag localhost/welcome $registry_ip:5000/welcome\n# plain-HTTP (insecure) registry: pass --tls-verify=false (or configure\n# $registry_ip:5000 under [registries.insecure] in /etc/containers/registries.conf)\n# or podman will refuse with \"server gave HTTP response to HTTPS client\"\n:~$ podman push --tls-verify=false $registry_ip:5000/welcome",
    "anchor": "ex-4"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Verify that the registry contains the pushed image and that you can pull it",
    "answer": ":~$ curl http://$registry_ip:5000/v2/_catalog\n{\"repositories\":[\"welcome\"]}\n# remove the image already present\n:~$ podman rmi $registry_ip:5000/welcome\n:~$ podman pull --tls-verify=false $registry_ip:5000/welcome\nTrying to pull 10.152.183.13:5000/welcome:latest...\nGetting image source signatures\nCopying blob 643ea8c2c185 skipped: already exists\nCopying blob 972107ece720 skipped: already exists\nCopying blob 9857eeea6120 skipped: already exists\nCopying blob 93859aa62dbd skipped: already exists\nCopying blob 8e47efbf2b7e skipped: already exists\nCopying blob 42e0f5a91e40 skipped: already exists\nCopying config ef4b14a72d done\nWriting manifest to image destination\nStoring signatures\nef4b14a72d02ae0577eb0632d084c057777725c279e12ccf5b0c6e4ff5fd598b",
    "anchor": "ex-5"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Create a container without running/starting it",
    "answer": ":~$ podman create busybox # create\nResolved \"busybox\" as an alias (/etc/containers/registries.conf.d/000-shortnames.conf)\nTrying to pull docker.io/library/busybox:latest...\nGetting image source signatures\nCopying blob sha256:213a27df5921cd9ae24732504c590bb6408911c20fb50a597f2a40896d554a8f\nCopying config sha256:3fba0c87fcc8ba126bf99e4ee205b43c91ffc6b15bb052315312e71bc6296551\nWriting manifest to image destination\n51b613406e8889213c176523e1c430e4bd00047965b0c22cff5b1c9badfbc452\n:~$ podman container ls -a\nCONTAINER ID  IMAGE                             COMMAND     CREATED        STATUS      PORTS       NAMES\n51b613406e88  docker.io/library/busybox:latest  sh          2 minutes ago  Created                 priceless_hopper",
    "anchor": "ex-6"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Export a container to output.tar file",
    "answer": ":~$ podman container ls -a # pick the container id\nCONTAINER ID  IMAGE                             COMMAND     CREATED        STATUS      PORTS       NAMES\n51b613406e88  docker.io/library/busybox:latest  sh          2 minutes ago  Created                 priceless_hopper\n:~$ podman export <container id> --output=output.tar\n:~$ ls -al output.tar\n-rw-r--r--@ 1 user  wheel  4272640 28 Aug 13:48 output.tar",
    "anchor": "ex-7"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Run a pod with the image pushed to the registry",
    "answer": ":~$ kubectl run welcome --image=$registry_ip:5000/welcome --port=80\n:~$ curl $(kubectl get pods welcome -o jsonpath='{.status.podIP}')\nHello from Podman! Note: for the pod to actually pull from the plain-HTTP registry, the cluster's container runtime must trust it too — add $registry_ip:5000 under [registries.insecure] in /etc/containers/registries.conf (CRI-O) or the equivalent containerd config.toml mirrors entry, otherwise the kubelet reports ErrImagePull: server gave HTTP response to HTTPS client.",
    "anchor": "ex-8"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Log into a remote registry server and then read the credentials from the default file",
    "answer": "Note: The two most used container registry servers with a free plan are DockerHub and Quay.io. :~$ podman login --username $YOUR_USER --password $YOUR_PWD docker.io\n:~$ cat ~/.config/containers/auth.json\n{\n        \"auths\": {\n                \"docker.io\": {\n                        \"auth\": \"Z2l1bGl0JLSGtvbkxCcX1xb617251xh0x3zaUd4QW45Q3JuV3RDOTc=\"\n                }\n        }\n} Note: Podman writes registry credentials to $HOME/.config/containers/auth.json (not $XDG_RUNTIME_DIR). This is the same file kubectl create secret docker-registry --from-file=.dockerconfigjson=~/.config/containers/auth.json (or Docker's $HOME/.docker/config.json) reads for private-registry image pulls.",
    "anchor": "ex-9"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Create a secret both from existing login credentials and from the CLI",
    "answer": ":~$ kubectl create secret generic docker-creds --from-file=.dockerconfigjson=${XDG_RUNTIME_DIR}/containers/auth.json --type=kubernetes.io/dockerconfigjson\nsecret/docker-creds created\n:~$ kubectl create secret docker-registry registry-login --docker-server=https://index.docker.io/v1/ --docker-username=$YOUR_USR --docker-password=$YOUR_PWD\nsecret/registry-login created",
    "anchor": "ex-10"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Create the manifest for a Pod that uses one of the two secrets just created to pull an image hosted on the relative private remote registry",
    "answer": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: registry-app\nspec:\n  containers:\n  - name: registry-app-container\n    image: $YOUR_PRIVATE_IMAGE\n  imagePullSecrets:\n  - name: docker-creds",
    "anchor": "ex-11"
  },
  {
    "slug": "podman",
    "title": "Podman",
    "question": "Clean up all the images and containers",
    "answer": ":~$ podman rm --all --force\n:~$ podman rmi --all\n:~$ kubectl delete pod welcome",
    "anchor": "ex-12"
  },
  {
    "slug": "etcd-backup-restore",
    "title": "ETCD Backup",
    "question": "Take a point-in-time snapshot of etcd with etcdctl and the API server's TLS credentials. Save it to /tmp/etcd-snapshot.db and confirm the file was created.",
    "answer": "ETCDCTL_API=3 etcdctl \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /tmp/etcd-snapshot.db or If you already exported the variables, the shorter form is fine: ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /tmp/etcd-snapshot.db\n# alternative backup: copy the data dir file that is NOT in use by etcd:\n#   cp /var/lib/etcd/member/snap/db /tmp/etcd-snapshot.db",
    "anchor": "ex-0"
  },
  {
    "slug": "etcd-backup-restore",
    "title": "ETCD Backup",
    "question": "Verify that the snapshot is valid and report its revision, total keys, and size.",
    "answer": "# recommended (etcd v3.5+): etcdutl does not need the cluster\netcdutl --write-out=table snapshot status /tmp/etcd-snapshot.db or # deprecated alias (etcd v3.5+, removed in v3.6): etcdctl with ETCDCTL_API=3\nexport ETCDCTL_API=3\netcdctl --write-out=table snapshot status /tmp/etcd-snapshot.db",
    "anchor": "ex-1"
  },
  {
    "slug": "etcd-backup-restore",
    "title": "ETCD Backup",
    "question": "(Disaster scenario) Stop etcd, restore /tmp/etcd-snapshot.db into a fresh data directory /var/lib/etcd-restored, and report the command.",
    "answer": "Warning: only restore a cluster that is fully stopped — never restore against a running etcd that still has the API servers up. # 1. stop all API server instances (and kubelet so static pods don't restart)\nsudo systemctl stop kubelet\n# 2. restore the snapshot into a new data directory\netcdutl --data-dir /var/lib/etcd-restored snapshot restore /tmp/etcd-snapshot.db or export ETCDCTL_API=3\netcdctl --data-dir /var/lib/etcd-restored snapshot restore /tmp/etcd-snapshot.db",
    "anchor": "ex-2"
  },
  {
    "slug": "etcd-backup-restore",
    "title": "ETCD Backup",
    "question": "Rewire the etcd static pod so the restored data is used, and restart etcd to finish the recovery.",
    "answer": "# the static-pod manifest is at /etc/kubernetes/manifests/etcd.yaml\n# change the etcd-data volume to point at the restored directory:\nsudo sed -i 's#path: /var/lib/etcd#path: /var/lib/etcd-restored#' /etc/kubernetes/manifests/etcd.yaml\n# restart the kubelet; it reconciles the static pod, which mounts the new data dir\nsudo systemctl start kubelet or # alternative: let the static pod respawn by deleting it instead of restarting the kubelet\nkubectl -n kube-system delete pod etcd-controlplane\n# then confirm etcd came back with the restored revision:\nETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key endpoint health",
    "anchor": "ex-3"
  },
  {
    "slug": "etcd-backup-restore",
    "title": "ETCD Backup",
    "question": "List the etcd members and their client/peer URLs.",
    "answer": "ETCDCTL_API=3 etcdctl \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  member list",
    "anchor": "ex-4"
  },
  {
    "slug": "cluster-upgrade",
    "title": "Cluster Upgrade",
    "question": "Check the current version of the control plane and of every node.",
    "answer": "kubectl version               # client + control-plane version\nkubeadm version               # the kubeadm binary version\nkubectl get nodes             # shows each node's kubernetes version and 'Ready' status\nkubectl get nodes -o custom-columns='NAME:.metadata.name,VERSION:.status.nodeInfo.kubeletVersion,STATUS:.status.conditions[-1].type' Note: the -o custom-columns=... expression contains [-1], which zsh would otherwise try to glob-match — keep it in single quotes.",
    "anchor": "ex-0"
  },
  {
    "slug": "cluster-upgrade",
    "title": "Cluster Upgrade",
    "question": "List the kubeadm versions available in the package repository.",
    "answer": "sudo apt-get update\nsudo apt-cache madison kubeadm      # Ubuntu/Debian\n# RHEL:  sudo yum list --showduplicates kubeadm --disableexcludes=kubernetes",
    "anchor": "ex-1"
  },
  {
    "slug": "cluster-upgrade",
    "title": "Cluster Upgrade",
    "question": "On the first control-plane node, install the new kubeadm, run kubeadm upgrade plan, then apply the upgrade to v1.36.3.",
    "answer": "# 1. allow kubeadm to be upgraded, then install the pinned version\nsudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' && sudo apt-mark hold kubeadm\n# 2. preview what will change\nsudo kubeadm upgrade plan\n# 3. apply the upgrade (this upgrades CoreDNS + kube-proxy too)\nsudo kubeadm upgrade apply v1.36.3",
    "anchor": "ex-2"
  },
  {
    "slug": "cluster-upgrade",
    "title": "Cluster Upgrade",
    "question": "Drain the control-plane node, then upgrade kubelet and kubectl on it and bring it back.",
    "answer": "# 1. cordon + drain the node so pods move off it\nkubectl drain controlplane --ignore-daemonsets\n# 2. install the matching kubelet + kubectl\nsudo apt-mark unhold kubelet kubectl\nsudo apt-get update && sudo apt-get install -y 'kubelet=1.36.x-*' 'kubectl=1.36.x-*'\nsudo apt-mark hold kubelet kubectl\n# 3. restart the kubelet so the new binary takes over\nsudo systemctl daemon-reload\nsudo systemctl restart kubelet\n# 4. bring the node back\nkubectl uncordon controlplane",
    "anchor": "ex-3"
  },
  {
    "slug": "cluster-upgrade",
    "title": "Cluster Upgrade",
    "question": "Upgrade the other control-plane nodes (and then every worker), bringing each back online as you go.",
    "answer": "# additional control-plane node: upgrade its local config (no 'upgrade apply')\nsudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' && sudo apt-mark hold kubeadm\nsudo kubeadm upgrade node                       # upgrades the local kubelet config\n# worker node upgrade (run the following FROM A CONTROL-PLANE NODE)\nkubectl drain worker1 --ignore-daemonsets\n# ...back on worker1:\nsudo apt-mark unhold kubeadm kubelet kubectl\nsudo apt-get update && sudo apt-get install -y 'kubeadm=1.36.x-*' 'kubelet=1.36.x-*' 'kubectl=1.36.x-*'\nsudo apt-mark hold kubeadm kubelet kubectl\nsudo systemctl daemon-reload\nsudo systemctl restart kubelet\n# ...back on a control-plane node:\nkubectl uncordon worker1",
    "anchor": "ex-4"
  },
  {
    "slug": "cluster-upgrade",
    "title": "Cluster Upgrade",
    "question": "Verify the whole cluster after the upgrade.",
    "answer": "kubectl get nodes                       # every node Ready, all showing v1.36.3\nkubectl get pods -n kube-system         # etcd / kube-apiserver / CoreDNS / kube-proxy all Running\nkubectl get ds -n kube-system kube-proxy",
    "anchor": "ex-5"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "Create a PersistentVolume data-pv of 10Gi, access mode ReadWriteOnce, storageClassName standard, backed by hostPath /mnt/data.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: PersistentVolume\nmetadata:\n  name: data-pv\nspec:\n  storageClassName: standard\n  capacity:\n    storage: 10Gi\n  accessModes:\n    - ReadWriteOnce\n  hostPath:\n    path: /mnt/data\n  persistentVolumeReclaimPolicy: Retain\nEOF\nkubectl get pv data-pv\n# STATUS will be \"Available\" (nothing claims it yet)",
    "anchor": "ex-0"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "Create a PersistentVolumeClaim data-claim asking for 4Gi, ReadWriteOnce, storageClassName standard. What state is data-claim in and why?",
    "answer": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: data-claim\nspec:\n  storageClassName: standard\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 4Gi\nEOF\nkubectl get pv,pvc data-pv,data-claim\n# pv: STATUS \"Bound\"      pvc: STATUS \"Bound\", VOLUME=data-pv",
    "anchor": "ex-1"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "Mount the claim into a pod keeper at /data, write /etc/passwd into it, then recreate an identical pod keeper2 and confirm the file is visible in the new pod.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: keeper\nspec:\n  restartPolicy: Never\n  containers:\n  - image: busybox\n    name: keeper\n    command: [\"sleep\",\"3600\"]\n    volumeMounts:\n    - name: data\n      mountPath: /data\n  volumes:\n  - name: data\n    persistentVolumeClaim:\n      claimName: data-claim\nEOF\nkubectl cp keeper:/etc/passwd /tmp/passwd && kubectl cp /tmp/passwd keeper:/data/passwd or kubectl exec keeper -- cp /etc/passwd /data/passwd\n# then launch keeper2 (identical manifest, just metadata.name: keeper2) and read it back:\nkubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: keeper2\nspec:\n  restartPolicy: Never\n  containers:\n  - image: busybox\n    name: keeper\n    command: [\"sleep\",\"3600\"]\n    volumeMounts:\n    - name: data\n      mountPath: /data\n  volumes:\n  - name: data\n    persistentVolumeClaim:\n      claimName: data-claim\nEOF\nkubectl exec keeper2 -- cat /data/passwd",
    "anchor": "ex-2"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "Show the reclaim policy of data-pv and the claim's bound volume, then change the reclaim policy to Retain (if it isn't already).",
    "answer": "kubectl get pv data-pv -o jsonpath='{.spec.persistentVolumeReclaimPolicy}'\n# show the binding:\nkubectl get pvc data-claim -o jsonpath='{.spec.volumeName}'\n# change the reclaim policy (Retain is the default for manually-created PVs):\nkubectl patch pv data-pv -p '{\"spec\":{\"persistentVolumeReclaimPolicy\":\"Retain\"}}'",
    "anchor": "ex-3"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "Delete the claim and observe what happens to the PV (because the policy is Retain).",
    "answer": "kubectl delete pvc data-claim\nkubectl get pv data-pv     # STATUS \"Released\" (the PV is kept, not removed)",
    "anchor": "ex-4"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "Inspect the cluster's default StorageClass and confirm there is one marked as default.",
    "answer": "kubectl get sc\n# the default one carries: storageclass.kubernetes.io/is-default-class: \"true\"\nkubectl get sc -o custom-columns='NAME:.metadata.name,DEFAULT:.metadata.annotations.storageclass\\.kubernetes\\.io/is-default-class,PROVISIONER:.provisioner' Note: keep the -o custom-columns=... expression in single quotes — unquoted, zsh strips the backslash-dot escapes so DEFAULT renders as &lt;none&gt; even for the default class.",
    "anchor": "ex-5"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "Create a PVC dynamic-claim that does not name a storage class and watch a PV appear for it automatically (dynamic provisioning).",
    "answer": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: dynamic-claim\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 5Gi\nEOF\nkubectl get pvc dynamic-claim       # \"Bound\" once the provisioner finished\nkubectl get pv | grep dynamic       # the auto-created PV (has spec.claimRef.name set to dynamic-claim)\n# or via jsonpath:\nkubectl get pv -o jsonpath='{range .items[?(@.spec.claimRef.name==\"dynamic-claim\")]}{.metadata.name}{\"\\n\"}{end}'",
    "anchor": "ex-6"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "Create a StorageClass fast with volumeBindingMode: WaitForFirstConsumer, allowVolumeExpansion: true and reclaimPolicy: Delete, copying the provisioner from the cluster default so it actually provisions.",
    "answer": "# reuse whatever provisioner the cluster already ships with:\nPROV=$(kubectl get sc -o jsonpath='{range .items[?(@.metadata.annotations.storageclass\\.kubernetes\\.io/is-default-class==\"true\")]}{.provisioner}{end}')\nkubectl apply -f - <<EOF\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast\nprovisioner: ${PROV}\nvolumeBindingMode: WaitForFirstConsumer   # wait for a pod before binding (topology-aware)\nallowVolumeExpansion: true                # PVCs using this class can be resized later\nreclaimPolicy: Delete\nEOF\nkubectl get sc fast -o yaml",
    "anchor": "ex-7"
  },
  {
    "slug": "pv-pvc",
    "title": "PV & PVC",
    "question": "(Bonus) Expand dynamic-claim from 5Gi to 8Gi and confirm the file-system is grown on the node.",
    "answer": "kubectl patch pvc dynamic-claim -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"8Gi\"}}}}'\nkubectl get pvc dynamic-claim -o jsonpath='{.spec.resources.requests.storage}{\"\\n\"}{.status.capacity.storage}'\n# only works because the StorageClass has allowVolumeExpansion: true",
    "anchor": "ex-8"
  },
  {
    "slug": "network-policies",
    "title": "Network Policies",
    "question": "Create a Deployment api of nginx (2 replicas) with label app=api and expose it on port 80 with a ClusterIP Service api.",
    "answer": "kubectl create deployment api --image=nginx --port=80   # creates pods with label app=api\nkubectl expose deployment api --port=80   # ClusterIP Service `api`\nkubectl get deploy,svc api",
    "anchor": "ex-0"
  },
  {
    "slug": "network-policies",
    "title": "Network Policies",
    "question": "Create a NetworkPolicy api-allow-ingress that isolates pods app=api for ingress and allows traffic to port 80 only from pods labelled access=granted.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: api-allow-ingress\nspec:\n  podSelector:\n    matchLabels:\n      app: api                      # this policy applies to the api pods\n  policyTypes:\n    - Ingress\n  ingress:\n    - from:\n        - podSelector:\n            matchLabels:\n              access: granted\n      ports:\n        - protocol: TCP\n          port: 80\nEOF\nkubectl describe netpol api-allow-ingress",
    "anchor": "ex-1"
  },
  {
    "slug": "network-policies",
    "title": "Network Policies",
    "question": "Verify the policy: tester (no label) cannot reach api:80, while granted (label access=granted) can.",
    "answer": "kubectl run granted --image=busybox --restart=Never --labels=access=granted -- sleep 3600\nkubectl run tester  --image=busybox --restart=Never -- sleep 3600\nkubectl exec tester -- wget -qO- --timeout=2 http://api:80 ; echo \"exit=$?\"   # blocked\nkubectl exec granted -- wget -qO- --timeout=2 http://api:80 ; echo \"exit=$?\"  # ok",
    "anchor": "ex-2"
  },
  {
    "slug": "network-policies",
    "title": "Network Policies",
    "question": "Also allow ingress to app=api from every pod in the trusted namespace (selected by the label env=trusted), and verify.",
    "answer": "# label the namespace (network policies target namespace OBJECTS, which need a label)\nkubectl create namespace trusted\nkubectl label namespace trusted env=trusted\n# add the namespace as an allowed source on the api pods\nkubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: api-allow-ingress\nspec:\n  podSelector:\n    matchLabels:\n      app: api\n  policyTypes:\n    - Ingress\n  ingress:\n    - from:\n        - podSelector:\n            matchLabels:\n              access: granted\n        - namespaceSelector:\n            matchLabels:\n              env: trusted\n      ports:\n        - protocol: TCP\n          port: 80\nEOF",
    "anchor": "ex-3"
  },
  {
    "slug": "network-policies",
    "title": "Network Policies",
    "question": "Add an egress rule so app=api pods may only reach 10.0.0.0/8 on TCP 443, and block everything else.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: api-egress\nspec:\n  podSelector:\n    matchLabels:\n      app: api\n  policyTypes:\n    - Egress\n  egress:\n    - to:\n        - ipBlock:\n            cidr: 10.0.0.0/8\n      ports:\n        - protocol: TCP\n          port: 443\nEOF\nkubectl get netpol\nkubectl describe netpol api-egress",
    "anchor": "ex-4"
  },
  {
    "slug": "ingress",
    "title": "Ingress",
    "question": "Create a Deployment shop (nginx, 3 replicas) labelled app=shop, expose it on port 80 via a ClusterIP Service shop-svc.",
    "answer": "kubectl create deployment shop --image=nginx --port=80 --replicas=3\nkubectl label deployment shop app=shop\nkubectl expose deployment shop --port=80 --name=shop-svc\nkubectl get deploy shop\nkubectl get svc shop-svc",
    "anchor": "ex-0"
  },
  {
    "slug": "ingress",
    "title": "Ingress",
    "question": "Create an Ingress shop-ingress (class nginx) routing shop.example.com/... on /, backed by shop-svc port 80.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: shop-ingress\n  annotations:\n    kubernetes.io/ingress.class: nginx\nspec:\n  ingressClassName: nginx\n  rules:\n  - host: shop.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: shop-svc\n            port:\n              number: 80\nEOF\nkubectl get ingress shop-ingress",
    "anchor": "ex-1"
  },
  {
    "slug": "ingress",
    "title": "Ingress",
    "question": "Create the IngressClass nginx (and mark it as the cluster default) used by shop-ingress.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: IngressClass\nmetadata:\n  name: nginx\n  annotations:\n    ingressclass.kubernetes.io/is-default-class: \"true\"\nspec:\n  controller: k8s.io/ingress-nginx\nEOF\nkubectl get ingressclass nginx -o yaml",
    "anchor": "ex-2"
  },
  {
    "slug": "ingress",
    "title": "Ingress",
    "question": "Add HTTPS/TLS. Generate a self-signed cert for shop.example.com, store it as the secret shop-tls, and reference it in shop-ingress.",
    "answer": "# 1. self-signed cert whose CN matches the Ingress host\nopenssl req -x509 -nodes -days=365 -newkey=rsa:2048 \\\n  -keyout shop.key -out shop.crt \\\n  -subj \"/CN=shop.example.com\"\n# 2. upload it as a kubernetes.io/tls Secret\nkubectl create secret tls shop-tls --cert=shop.crt --key=shop.key\nkubectl get secret shop-tls -o go-template='{{.type}} {{.data | keys}}'\n# 3. wire TLS into the Ingress (hosts in tls must also appear in rules)\nkubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: shop-ingress\nspec:\n  ingressClassName: nginx\n  tls:\n  - hosts:\n      - shop.example.com\n    secretName: shop-tls\n  rules:\n  - host: shop.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: shop-svc\n            port:\n              number: 80\nEOF",
    "anchor": "ex-3"
  },
  {
    "slug": "ingress",
    "title": "Ingress",
    "question": "Confirm the controller accepted the rule and that the address has been allocated.",
    "answer": "kubectl describe ingress shop-ingress\n# look for: Address (the LB IP/host assigned by the controller)\n#          Rules -> Paths -> Backends: shop-svc:80 (1⁄3 ...)  <- healthy endpoints\nkubectl get endpoints shop-svc            # the Service's ready pod IPs",
    "anchor": "ex-4"
  },
  {
    "slug": "jsonpath-custom-columns",
    "title": "Jsonpath",
    "question": "Create a busybox pod walker so there is data to query, plus list the objects you will inspect.",
    "answer": "kubectl run walker --image=busybox --restart=Never -- sleep 3600\nkubectl get pods -n kube-system                   # there should also be kube-system pods\nkubectl get nodes",
    "anchor": "ex-0"
  },
  {
    "slug": "jsonpath-custom-columns",
    "title": "Jsonpath",
    "question": "Print just the names of every pod in the default namespace (no NAME header, no STATUS noise).",
    "answer": "kubectl get pods -o jsonpath='{.items[*].metadata.name}' or one name per line: kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{\"\\n\"}{end}'",
    "anchor": "ex-1"
  },
  {
    "slug": "jsonpath-custom-columns",
    "title": "Jsonpath",
    "question": "Show each pod's name and IP, tab-separated, for every pod in the cluster.",
    "answer": "kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{\".\"}{.metadata.name}{\"\\t\"}{.status.podIP}{\"\\n\"}{end}'\n# or just the default namespace:\nkubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.podIP}{\"\\n\"}{end}'",
    "anchor": "ex-2"
  },
  {
    "slug": "jsonpath-custom-columns",
    "title": "Jsonpath",
    "question": "List only the pods that are Running (use a JSONPath filter).",
    "answer": "kubectl get pods -o jsonpath='{range .items[?(@.status.phase==\"Running\")]}{.metadata.name}{\"\\n\"}{end}'\n# the same as a one-liner (no newline between names):\nkubectl get pods -o jsonpath='{.items[?(@.status.phase==\"Running\")].metadata.name}'",
    "anchor": "ex-3"
  },
  {
    "slug": "jsonpath-custom-columns",
    "title": "Jsonpath",
    "question": "Print the control-plane role label of every node, plus its kubelet version.",
    "answer": "kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.nodeInfo.kubeletVersion}{\"\\t\"}{.metadata.labels.node-role\\.kubernetes\\.io/control-plane}{\"\\n\"}{end}' Note: because the label key node-role.kubernetes.io/control-plane contains dots, the bracket form labels[&quot;node-role.kubernetes.io/control-plane&quot;] is not valid here (kubectl errors with invalid array index) — escape the dots as labels.node-role\\.kubernetes\\.io/control-plane. On a control-plane node the value is the empty string, so nothing prints after the version; a worker node simply has no such label.",
    "anchor": "ex-4"
  },
  {
    "slug": "jsonpath-custom-columns",
    "title": "Jsonpath",
    "question": "Show a pods table with NAME, the node it runs on, its IP, and restart count.",
    "answer": "kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP,RESTARTS:.status.containerStatuses[0].restartCount or the same with a single quoted expression: kubectl get pods -o=custom-columns='NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP,RESTARTS:.status.containerStatuses[0].restartCount'",
    "anchor": "ex-5"
  },
  {
    "slug": "jsonpath-custom-columns",
    "title": "Jsonpath",
    "question": "Show a nodes table with NAME, Kubernetes version, OS image, and internal IP.",
    "answer": "kubectl get nodes -o custom-columns='NAME:.metadata.name,VERSION:.status.nodeInfo.kubeletVersion,OS-IMAGE:.status.nodeInfo.osImage,INTERNAL-IP:.status.addresses[?(@.type==\"InternalIP\")].address' Note: a node's IP-address entries use the field .address (not .ip — .ip yields &lt;none&gt;), and because custom-columns evaluates each expression relative to a single item, quote the whole -o custom-columns=... argument in single quotes so your shell does not glob-expand the [?()] filter.",
    "anchor": "ex-6"
  },
  {
    "slug": "jsonpath-custom-columns",
    "title": "Jsonpath",
    "question": "Use a custom-columns file instead of an inline expression.",
    "answer": "First create columns.txt (one header line, one field-path line, whitespace separated): NAME  IP\nmetadata.name  status.podIP kubectl get pods -o custom-columns-file=columns.txt",
    "anchor": "ex-7"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "Show CPU and memory usage for every node in the cluster.",
    "answer": "kubectl top nodes",
    "anchor": "ex-0"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "Show usage for every pod (all namespaces) and sort it by CPU descending.",
    "answer": "kubectl top pods -A\nkubectl top pod -A --sort-by=cpu\n# or for memory:\nkubectl top pod -A --sort-by=memory",
    "anchor": "ex-1"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "A pod may run several containers; show per-container usage.",
    "answer": "kubectl top pod duet -n default --containers",
    "anchor": "ex-2"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "Create a sampler pod that writes a timestamped line every second, then stream its logs.",
    "answer": "kubectl run sampler --image=busybox --restart=Never -- /bin/sh -c 'i=0; while true; do echo \"$i: $(date)\"; i=$((i+1)); sleep 1; done'\nkubectl logs sampler                 # print the logs accumulated so far\nkubectl logs -f sampler              # follow (stream) the logs",
    "anchor": "ex-3"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "Show the last 5 lines, only from the last 30 seconds, with timestamps prefixed.",
    "answer": "kubectl logs --tail=5 --since=30s --timestamps sampler",
    "anchor": "ex-4"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "Create a multi-container pod duet (nginx + busybox side-car) and fetch logs from one specific container, then from all containers at once.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: duet\nspec:\n  restartPolicy: Never\n  containers:\n  - name: web\n    image: nginx\n  - name: side\n    image: busybox\n    command: [\"sh\",\"-c\",\"while true; do echo side: $(date +%s); sleep 5; done\"]\nEOF\nkubectl logs duet -c side            # only the side-car's logs\nkubectl logs duet --all-containers   # all containers in the pod",
    "anchor": "ex-5"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "When a container has restarted, print the logs it produced before the restart.",
    "answer": "kubectl logs -p duet -c side         # -p/--previous: logs from the prior container instance",
    "anchor": "ex-6"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "Aggregate logs across multiple pods by label.",
    "answer": "kubectl logs -l app=duet --all-containers=true -f --since=10s",
    "anchor": "ex-7"
  },
  {
    "slug": "monitoring-logging",
    "title": "Monitoring & Logging",
    "question": "Inspect why a pod is stuck (recent events) and list cluster-wide events in chronological order.",
    "answer": "kubectl describe pod duet\n# the Events section at the bottom usually explains ImagePullBackOff/OOMKilled/scheduling failures\nkubectl get events -A --sort-by=.lastTimestamp",
    "anchor": "ex-8"
  },
  {
    "slug": "vim-nano",
    "title": "VIM & Nano",
    "question": "Generate a Pod manifest pod.yaml for a busybox pod, then open it in vi and rename the pod to editor.",
    "answer": "kubectl run editor --image=busybox --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml",
    "anchor": "ex-0"
  },
  {
    "slug": "vim-nano",
    "title": "VIM & Nano",
    "question": "Use kubectl explain to confirm the exact name of restartPolicy, then set it to Never on pod.yaml.",
    "answer": "kubectl explain pod.spec.restartPolicy        # prints: \"Restart policy ... default: Always\"\nkubectl explain pod.spec.containers.resources # shows requests/limits schema\n# inside pod.yaml add under spec:\n#   restartPolicy: Never",
    "anchor": "ex-1"
  },
  {
    "slug": "vim-nano",
    "title": "VIM & Nano",
    "question": "Open a live object in your editor and change one value (e.g. scale an image tag), using nano instead of vi.",
    "answer": "kubectl expose deployment editor --port=80 --name=editor-svc 2>/dev/null || \\\nkubectl create deployment editor --image=nginx --port=80\nKUBE_EDITOR=nano kubectl edit deploy editor",
    "anchor": "ex-2"
  },
  {
    "slug": "vim-nano",
    "title": "VIM & Nano",
    "question": "Scaffold a Deployment manifest with kubectl run + --dry-run, open it in vi, and add a readiness probe by consulting kubectl explain.",
    "answer": "# 1. scaffold and open in vi\nkubectl create deployment editor --image=nginx --port=80 --dry-run=client -o yaml > deploy.yaml\nvi deploy.yaml In vi: press i\n# (the manifest is already open; add under spec.template.spec.containers[0]:)\nreadinessProbe:\n  httpGet:\n    path: /\n    port: 80\npress Esc\n:wq Then apply it: kubectl apply -f deploy.yaml kubectl explain deploy.spec.template.spec.containers.readinessProbe\nkubectl explain deploy.spec.template.spec.containers.readinessProbe.httpGet --recursive",
    "anchor": "ex-3"
  },
  {
    "slug": "vim-nano",
    "title": "VIM & Nano",
    "question": "What keystrokes do I need to save and quit in each editor?",
    "answer": "| Operation | vim / vi | nano | |---|---|---| | open a file | vi file.yaml | nano file.yaml | | enter editing | i (insert) | already in insert mode | | leave insert mode | Esc | n/a | | save | :w + Enter | Ctrl-O Enter | | save + quit | :wq (or ZZ) | Ctrl-X (prompts to save) | | quit without saving | :q! | Ctrl-X then N | | search | /pattern Enter n | Ctrl-W | To make one of them your editor everywhere: export KUBE_EDITOR=nano (or vi/vim).",
    "anchor": "ex-4"
  },
  {
    "slug": "rbac",
    "title": "RBAC",
    "question": "Create a ServiceAccount builder and inspect the identity Kubernetes gives it.",
    "answer": "kubectl create serviceaccount builder\nkubectl get sa builder -o yaml\n# secret at /var/run/secrets/kubernetes.io/serviceaccount/ is a projected, auto-rotated token\n# (default SA in each namespace is auto-created and gets only default API-discovery rights) or # declarative form\nkubectl apply -f - <<EOF\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: builder\nEOF",
    "anchor": "ex-0"
  },
  {
    "slug": "rbac",
    "title": "RBAC",
    "question": "Grant the builder ServiceAccount permission to get, list, and watch pods in the default namespace, using a Role pod-reader and a RoleBinding read-pods.",
    "answer": "# 1. define the role (verbs + resources it covers)\nkubectl create role pod-reader --verb=get,list,watch --resource=pods\n# 2. bind it to the ServiceAccount\nkubectl create rolebinding read-pods --clusterrole=pod-reader --serviceaccount=default:builder\n#   NB: --role=<role>   (namespaced)   |   --clusterrole=<clusterrole>  (binds a ClusterRole in this namespace too)\n#   NB: --serviceaccount=<namespace>:<name>   (or --user=<name> / --group=<name>)\n# 3. inspect\nkubectl get role pod-reader -o yaml\nkubectl get rolebinding read-pods -o yaml",
    "anchor": "ex-1"
  },
  {
    "slug": "rbac",
    "title": "RBAC",
    "question": "Run a pod runner as the builder ServiceAccount and confirm the identity it uses.",
    "answer": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: runner\nspec:\n  serviceAccountName: builder\n  restartPolicy: Never\n  containers:\n  - name: runner\n    image: busybox\n    command: [\"sleep\",\"3600\"]\nEOF\nkubectl get pod runner -o jsonpath='{.spec.serviceAccountName}'   # -> builder\nkubectl exec runner -- ls /var/run/secrets/kubernetes.io/serviceaccount/   # token, ca.crt, namespace",
    "anchor": "ex-2"
  },
  {
    "slug": "rbac",
    "title": "RBAC",
    "question": "Create a ClusterRole secret-reader (cluster-wide get/list/watch on secrets) and bind it to user auditor with a ClusterRoleBinding secret-reader-global.",
    "answer": "# ClusterRole: cluster-scoped verb set on a resource\nkubectl create clusterrole secret-reader --verb=get,list,watch --resource=secrets\n# ClusterRoleBinding: binds a ClusterRole to a subject for the WHOLE cluster\nkubectl create clusterrolebinding secret-reader-global --clusterrole=secret-reader --user=auditor\nkubectl get clusterrole secret-reader -o yaml\nkubectl get clusterrolebinding secret-reader-global -o yaml",
    "anchor": "ex-3"
  },
  {
    "slug": "rbac",
    "title": "RBAC",
    "question": "Validate the granted abilities with kubectl auth can-i (no action is actually performed).",
    "answer": "# as the builder SA in default -> should be YES (role above grants it)\nkubectl auth can-i get pods --as=system:serviceaccount:default:builder\n# as user auditor -> should be YES (secret-reader ClusterRoleBinding)\nkubectl auth can-i list secrets --as=auditor\n# as the same SA for secrets -> should be NO\nkubectl auth can-i list secrets --as=system:serviceaccount:default:builder\n# list everything this identity may do:\nkubectl auth can-i --list --as=system:serviceaccount:default:builder",
    "anchor": "ex-4"
  }
];
