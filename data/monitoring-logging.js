window.CKAD_TOPIC = {
  "slug": "monitoring-logging",
  "title": "Monitoring & Logging",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Troubleshooting Clusters &gt; <a href=\"https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-usage-monitoring/\" target=\"_blank\" rel=\"noopener\">Tools for Monitoring Resources</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Monitoring, Logging, and Debugging &gt; <a href=\"https://kubernetes.io/docs/tasks/debug/logging/\" target=\"_blank\" rel=\"noopener\">Logging in Kubernetes</a>"
    },
    {
      "type": "text",
      "html": "&gt; <code>kubectl top</code> is served by the <strong>Metrics API</strong>, so it only works when <code>metrics-server</code> is installed (<code>kubectl get pods -n kube-system | grep metrics-server</code>). Log flags are read directly by the kubelet, so they need no extra component. Original names: <code>sampler</code>, <code>duet</code>."
    }
  ],
  "sections": [
    {
      "heading": "Resource usage (`kubectl top`)",
      "id": "resource-usage-kubectl-top",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Show CPU and memory usage for every node in the cluster.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl top nodes"
            }
          ]
        },
        {
          "type": "text",
          "html": "Sample output:"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "text",
          "html": "NAME            CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%"
        },
        {
          "type": "text",
          "html": "controlplane    146m         7%     1434            74%"
        },
        {
          "type": "text",
          "html": "worker1         66m          3%     901             47%"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "text",
          "html": "Explanation: the numbers come from the in-cluster <code>metrics-server</code>, which scrapes the kubelet's stats summary over HTTPS. Without it the command errors with <code>unable to retrieve metrics</code>."
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Show usage for every pod (all namespaces) and sort it by CPU descending.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl top pods -A\nkubectl top pod -A --sort-by=cpu\n# or for memory:\nkubectl top pod -A --sort-by=memory"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "A pod may run several containers; show per-container usage.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl top pod duet -n default --containers"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>--containers</code> breaks the pod's aggregate line out into one row per container; the pod name is required (no <code>pods -n … --containers</code> without a specific pod)."
        }
      ]
    },
    {
      "heading": "Logs",
      "id": "logs",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Create a <code>sampler</code> pod that writes a timestamped line every second, then stream its logs.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run sampler --image=busybox --restart=Never -- /bin/sh -c 'i=0; while true; do echo \"$i: $(date)\"; i=$((i+1)); sleep 1; done'\nkubectl logs sampler                 # print the logs accumulated so far\nkubectl logs -f sampler              # follow (stream) the logs"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Show the last 5 lines, only from the last 30 seconds, with timestamps prefixed.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl logs --tail=5 --since=30s --timestamps sampler"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>--tail</code>, <code>--since</code> and <code>--timestamps</code> are purely client-side filters on the log stream. <code>--since</code> takes a duration (<code>30s</code>, <code>5m</code>, <code>1h</code>); <code>--since-time</code> takes an RFC3339 timestamp."
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Create a multi-container pod <code>duet</code> (nginx + busybox side-car) and fetch logs from one specific container, then from all containers at once.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: duet\nspec:\n  restartPolicy: Never\n  containers:\n  - name: web\n    image: nginx\n  - name: side\n    image: busybox\n    command: [\"sh\",\"-c\",\"while true; do echo side: $(date +%s); sleep 5; done\"]\nEOF\nkubectl logs duet -c side            # only the side-car's logs\nkubectl logs duet --all-containers   # all containers in the pod"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "When a container has restarted, print the logs it produced <strong>before</strong> the restart.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl logs -p duet -c side         # -p/--previous: logs from the prior container instance"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Aggregate logs across multiple pods by label.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl logs -l app=duet --all-containers=true -f --since=10s"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>-l</code> selects pods by label; with <code>-f</code> it follows the union of their streams. <code>--prefix</code> adds the <code>namespace/pod/container</code> prefix so you can tell the streams apart:"
        },
        {
          "type": "text",
          "html": "```bash"
        },
        {
          "type": "text",
          "html": "kubectl logs -l app=duet --all-containers=true --prefix=true"
        },
        {
          "type": "text",
          "html": "```"
        }
      ]
    },
    {
      "heading": "Events and node health",
      "id": "events-and-node-health",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "Inspect why a pod is stuck (recent events) and list cluster-wide events in chronological order.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl describe pod duet\n# the Events section at the bottom usually explains ImagePullBackOff/OOMKilled/scheduling failures\nkubectl get events -A --sort-by=.lastTimestamp"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>kubectl describe</code> appends the pod's recent events; <code>kubectl get events --sort-by=.lastTimestamp</code> orders the whole list (default is newest-last). For a compact filter:"
        },
        {
          "type": "text",
          "html": "```bash"
        },
        {
          "type": "text",
          "html": "kubectl get events --field-selector type=Warning"
        },
        {
          "type": "text",
          "html": "```"
        }
      ]
    }
  ],
  "count": 9,
  "description": "kubectl top and logs for nodes and pods.",
  "file": "q.monitoring.md"
};
