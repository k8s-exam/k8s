window.CKAD_TOPIC = {
  "slug": "observability",
  "title": "Observability",
  "weight": "18%",
  "preamble": [],
  "sections": [
    {
      "heading": "Liveness, readiness and startup probes",
      "id": "liveness-readiness-and-startup-probes",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Configure Pods and Containers &gt; <a href=\"https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/\" target=\"_blank\" rel=\"noopener\">Configure Liveness, Readiness and Startup Probes</a>"
        },
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create an nginx pod with a liveness probe that just runs the command 'ls'. Save its YAML in pod.yaml. Run it, check its probe status, delete it.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run sentinel --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: sentinel\n  name: sentinel\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: sentinel\n    resources: {}\n    livenessProbe: # our probe\n      exec: # add this line\n        command: # command definition\n        - ls # ls command\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl describe pod sentinel | grep -i liveness # run this to see that liveness probe works\nkubectl delete -f pod.yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Modify the pod.yaml file so that liveness probe starts kicking in after 5 seconds whereas the interval between probes would be 5 seconds. Run it, check the probe, delete it.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl explain pod.spec.containers.livenessProbe # get the exact names"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: sentinel\n  name: sentinel\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: sentinel\n    resources: {}\n    livenessProbe:\n      initialDelaySeconds: 5 # add this line\n      periodSeconds: 5 # add this line as well\n      exec:\n        command:\n        - ls\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl describe po sentinel | grep -i liveness\nkubectl delete -f pod.yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Create an nginx pod (that includes port 80) with an HTTP readinessProbe on path '/' on port 80. Again, run it, check the readinessProbe, delete it.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run relay --image=nginx --dry-run=client -o yaml --restart=Never --port=80 > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: relay\n  name: relay\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: relay\n    resources: {}\n    ports:\n    - containerPort: 80 # Note: Readiness probes runs on the container during its whole lifecycle. Since nginx exposes 80, containerPort: 80 is not required for readiness to work.\n    readinessProbe: # declare the readiness probe\n      httpGet: # add this line\n        path: / #\n        port: 80 #\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl describe pod relay | grep -i readiness # to see the pod readiness details\nkubectl delete -f pod.yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Lots of pods are running in <code>alpha</code>,<code>beta</code>,<code>gamma</code>,<code>delta</code> namespaces.  All of these pods are configured with liveness probe.  Please list all pods whose liveness probe are failed in the format of <code>&lt;namespace&gt;/&lt;pod name&gt;</code> per line.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "A typical liveness probe failure event"
            },
            {
              "type": "code",
              "language": "text",
              "code": "LAST SEEN   TYPE      REASON      OBJECT              MESSAGE\n22m         Warning   Unhealthy   pod/sentinel        Liveness probe failed: cat: can't open '/tmp/healthy': No such file or directory"
            },
            {
              "type": "text",
              "html": "collect failed pods namespace by namespace"
            },
            {
              "type": "code",
              "language": "sh",
              "code": "kubectl get events -A -o json | jq -r '.items[] | select(.message | contains(\"Liveness probe failed\")).involvedObject | .namespace + \"/\" + .name'"
            }
          ]
        }
      ]
    },
    {
      "heading": "Logging",
      "id": "logging",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Create a busybox pod that runs <code>i=0; while true; do echo &quot;$i: $(date)&quot;; i=$((i+1)); sleep 1; done</code>. Check its logs",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run logger --image=busybox --restart=Never -- /bin/sh -c 'i=0; while true; do echo \"$i: $(date)\"; i=$((i+1)); sleep 1; done'\nkubectl logs logger -f # follow the logs"
            }
          ]
        }
      ]
    },
    {
      "heading": "Debugging",
      "id": "debugging",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Create a busybox pod that runs 'ls /notexist'. Determine if there's an error (of course there is), see it. In the end, delete the pod",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run faulty --restart=Never --image=busybox -- /bin/sh -c 'ls /notexist'\n# show that there's an error\nkubectl logs faulty\nkubectl describe po faulty\nkubectl delete po faulty"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Create a busybox pod that runs 'notexist'. Determine if there's an error (of course there is), see it. In the end, delete the pod forcefully with a 0 grace period",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run broken --restart=Never --image=busybox -- notexist\nkubectl logs broken # will bring nothing! container never started\nkubectl describe po broken # in the events section, you'll see the error\n# also...\nkubectl get events | grep -i error # you'll see the error here as well\nkubectl delete po broken --force --grace-period=0"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Get CPU/memory utilization for nodes (<a href=\"https://github.com/kubernetes-sigs/metrics-server\" target=\"_blank\" rel=\"noopener\">metrics-server</a> must be running)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl top nodes"
            }
          ]
        }
      ]
    }
  ],
  "count": 8,
  "description": "Probes, logging, and debugging.",
  "file": "e.observability.md"
};
