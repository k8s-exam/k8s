window.CKAD_TOPIC = {
  "slug": "core-concepts",
  "title": "Core Concepts",
  "weight": "13%",
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Reference &gt; kubectl CLI &gt; <a href=\"https://kubernetes.io/docs/reference/kubectl/cheatsheet/\" target=\"_blank\" rel=\"noopener\">kubectl Cheat Sheet</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Monitoring, Logging, and Debugging &gt; <a href=\"https://kubernetes.io/docs/tasks/debug-application-cluster/get-shell-running-container/\" target=\"_blank\" rel=\"noopener\">Get a Shell to a Running Container</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Access Applications in a Cluster &gt; <a href=\"https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/\" target=\"_blank\" rel=\"noopener\">Configure Access to Multiple Clusters</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Access Applications in a Cluster &gt; <a href=\"https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/\" target=\"_blank\" rel=\"noopener\">Accessing Clusters</a> using API"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Access Applications in a Cluster &gt; <a href=\"https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/\" target=\"_blank\" rel=\"noopener\">Use Port Forwarding to Access Applications in a Cluster</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Overview &gt; Working with Objects &gt; <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/\" target=\"_blank\" rel=\"noopener\">Labels and Selectors</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Overview &gt; Working with Objects &gt; <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/\" target=\"_blank\" rel=\"noopener\">Namespaces</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Overview &gt; Working with Objects &gt; <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/\" target=\"_blank\" rel=\"noopener\">Annotations</a>"
    }
  ],
  "sections": [
    {
      "heading": "Exercises",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a namespace called 'atlas' and a pod with image nginx called webserver on this namespace",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create namespace atlas\nkubectl run webserver --image=nginx --restart=Never -n atlas"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Create the pod that was just described using YAML",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Easily generate YAML with:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run webserver --image=nginx --restart=Never --dry-run=client -n atlas -o yaml > pod.yaml"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "cat pod.yaml"
            },
            {
              "type": "code",
              "language": "yaml",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: webserver\n  name: webserver\n  namespace: atlas\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: webserver\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml"
            },
            {
              "type": "text",
              "html": "Alternatively, you can run in one line"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run webserver --image=nginx --restart=Never --dry-run=client -o yaml | kubectl create -n atlas -f -"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Create a busybox pod (using kubectl command) that runs the command &quot;env&quot;. Run it and see the output",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run envcheck --image=busybox --command --restart=Never -it --rm -- env # -it will help in seeing the output, --rm will immediately delete the pod after it exits\n# or, just run it without -it\nkubectl run envcheck --image=busybox --command --restart=Never -- env\n# and then, check its logs\nkubectl logs envcheck"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Create a busybox pod (using YAML) that runs the command &quot;env&quot;. Run it and see the output",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# create a  YAML template with this command\nkubectl run envcheck --image=busybox --restart=Never --dry-run=client -o yaml --command -- env > envpod.yaml\n# see it\ncat envpod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: envcheck\n  name: envcheck\nspec:\n  containers:\n  - command:\n    - env\n    image: busybox\n    name: envcheck\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# apply it and then see the logs\nkubectl apply -f envpod.yaml\nkubectl logs envcheck"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Get the YAML for a new namespace called 'research' without creating it",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create namespace research -o yaml --dry-run=client"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Create the YAML for a new ResourceQuota called 'cap' with hard limits of 1 CPU, 1G memory and 2 pods without creating it",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create quota cap --hard=cpu=1,memory=1G,pods=2 --dry-run=client -o yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Get pods on all namespaces",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po --all-namespaces"
            },
            {
              "type": "text",
              "html": "Alternatively"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po -A"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Create a pod with image nginx called webfront and expose traffic on port 80",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run webfront --image=nginx --restart=Never --port=80"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "Change pod's image to nginx:1.24.0. Observe that the container will be restarted as soon as the image gets pulled",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "<em>Note</em>: The <code>RESTARTS</code> column should contain 0 initially (ideally - it could be any number)"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# kubectl set image POD/POD_NAME CONTAINER_NAME=IMAGE_NAME:TAG\nkubectl set image pod/webfront webfront=nginx:1.24.0\nkubectl describe po webfront # you will see an event 'Container will be killed and recreated'\nkubectl get po webfront -w # watch it"
            },
            {
              "type": "text",
              "html": "<em>Note</em>: some time after changing the image, you should see that the value in the <code>RESTARTS</code> column has been increased by 1, because the container has been restarted, as stated in the events shown at the bottom of the <code>kubectl describe pod</code> command:"
            },
            {
              "type": "code",
              "language": "text",
              "code": "Events:\n  Type    Reason     Age                  From               Message\n  ----    ------     ----                 ----               -------\n[...]\n  Normal  Killing    100s                 kubelet, node3     Container webfront definition changed, will be restarted\n  Normal  Pulling    100s                 kubelet, node3     Pulling image \"nginx:1.24.0\"\n  Normal  Pulled     41s                  kubelet, node3     Successfully pulled image \"nginx:1.24.0\"\n  Normal  Created    36s (x2 over 9m43s)  kubelet, node3     Created container webfront\n  Normal  Started    36s (x2 over 9m43s)  kubelet, node3     Started container webfront"
            },
            {
              "type": "text",
              "html": "<em>Note</em>: you can check pod's image by running"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po webfront -o jsonpath='{.spec.containers[].image}{\"\\n\"}'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-9",
          "question": "Get webfront pod's ip created in previous step, use a temp busybox image to wget its '/'",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po -o wide # get the IP, will be something like '10.1.1.131'\n# create a temp busybox pod\nkubectl run netprobe --image=busybox --rm -it --restart=Never -- wget -O- 10.1.1.131:80"
            },
            {
              "type": "text",
              "html": "Alternatively you can also try a more advanced option:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# Get IP of the webfront pod\nWEBFRONT_IP=$(kubectl get pod webfront -o jsonpath='{.status.podIP}')\n# create a temp busybox pod\nkubectl run netprobe --image=busybox --env=\"WEBFRONT_IP=$WEBFRONT_IP\" --rm -it --restart=Never -- sh -c 'wget -O- $WEBFRONT_IP:80'"
            },
            {
              "type": "text",
              "html": "Or just in one line:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run netprobe --image=busybox --rm -it --restart=Never -- wget -O- $(kubectl get pod webfront -o jsonpath='{.status.podIP}:{.spec.containers[0].ports[0].containerPort}')"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-10",
          "question": "Get pod's YAML",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po webfront -o yaml\n# or\nkubectl get po webfront -oyaml\n# or\nkubectl get po webfront --output yaml\n# or\nkubectl get po webfront --output=yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-11",
          "question": "Get information about the pod, including details about potential issues (e.g. pod hasn't started)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl describe po webfront"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-12",
          "question": "Get pod logs",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl logs webfront"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-13",
          "question": "If pod crashed and restarted, get logs about the previous instance",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl logs webfront -p\n# or\nkubectl logs webfront --previous"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-14",
          "question": "Execute a simple shell on the webfront pod",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl exec -it webfront -- /bin/sh"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-15",
          "question": "Create a busybox pod that echoes 'hello world' and then exits",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run echoer --image=busybox -it --restart=Never -- echo 'hello world'\n# or\nkubectl run echoer --image=busybox -it --restart=Never -- /bin/sh -c 'echo hello world'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-16",
          "question": "Do the same, but have the pod deleted automatically when it's completed",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run echoer --image=busybox -it --rm --restart=Never -- /bin/sh -c 'echo hello world'\nkubectl get po # nowhere to be found :)"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-17",
          "question": "Create an nginx pod and set an env value as 'var1=val1'. Check the env value existence within the pod",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run envbox --image=nginx --restart=Never --env=var1=val1\n# then\nkubectl exec -it envbox -- env\n# or\nkubectl exec -it envbox -- sh -c 'echo $var1'\n# or\nkubectl describe po envbox | grep val1\n# or\nkubectl run envbox --restart=Never --image=nginx --env=var1=val1 -it --rm -- env\n# or\nkubectl run envbox --image nginx --restart=Never --env=var1=val1 -it --rm -- sh -c 'echo $var1'"
            }
          ]
        }
      ]
    },
    {
      "heading": "Labels and Selectors",
      "id": "labels-and-selectors",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-18",
          "question": "Create two nginx pods, one labelled <code>app=frontend,tier=web</code> and one <code>app=backend,tier=web</code>, then list them with an equality-based label selector",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run web-front --image=nginx --restart=Never --labels=app=frontend,tier=web\nkubectl run web-back --image=nginx --restart=Never --labels=app=backend,tier=web\n# equality-based: '=' and '==' are synonyms, '!=' is inequality\nkubectl get pods -l app=frontend\nkubectl get pods -l 'app!=backend'"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Per the official <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/\" target=\"_blank\" rel=\"noopener\">Labels and Selectors</a> page, labels are key/value pairs attached to objects and <code>-l</code> filters by them. Equality-based requirements use <code>=</code>, <code>==</code> or <code>!=</code>; a comma acts as a logical AND."
        },
        {
          "type": "exercise",
          "id": "ex-19",
          "question": "List pods using set-based label selectors (<code>in</code>, <code>notin</code>), including a combined selector",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# value must be one of the listed set\nkubectl get pods -l 'app in (frontend,backend)'\n# value must NOT be in the set\nkubectl get pods -l 'app notin (frontend)'\n# mixed set-based + equality-based; comma = AND\nkubectl get pods -l 'app in (frontend,backend),tier=web'"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Per the official <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/\" target=\"_blank\" rel=\"noopener\">Labels and Selectors</a> page, set-based requirements use <code>in</code>, <code>notin</code>, and existence (<code>partition</code>, <code>!partition</code>). There is no logical OR operator — comma always means AND."
        },
        {
          "type": "exercise",
          "id": "ex-20",
          "question": "Show the labels of pods as extra columns with <code>-L</code>, and dump all labels with <code>--show-labels</code>",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -L app -L tier\n# pods without the label show '<none>' in the new column\nkubectl get pods --show-labels\n# or the raw YAML\nkubectl get pod web-front -o yaml | grep -A2 labels"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-21",
          "question": "Add a label <code>env=prod</code> to an existing pod, then update it to <code>env=staging</code> (requires <code>--overwrite</code>)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl label pod web-front env=prod\nkubectl get pod web-front --show-labels\n# updating a label that already exists fails without --overwrite\nkubectl label pod web-front env=staging --overwrite\nkubectl get pod web-front --show-labels"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Labels can be attached at creation time and added or modified afterwards with <code>kubectl label</code> — see the official <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/\" target=\"_blank\" rel=\"noopener\">Labels and Selectors</a> page."
        }
      ]
    },
    {
      "heading": "Annotations",
      "id": "annotations",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-22",
          "question": "Add an annotation <code>owner=team-a</code> to the <code>web-front</code> pod and read it back",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl annotate pod web-front owner=team-a\nkubectl get pod web-front -o jsonpath='{.metadata.annotations}'\n# or\nkubectl describe pod web-front | grep -A1 Annotations"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Per the official <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/\" target=\"_blank\" rel=\"noopener\">Annotations</a> page, annotations are key/value maps attached to objects for <strong>non-identifying</strong> metadata (they cannot be used to select objects, unlike labels). Both keys and values must be strings."
        }
      ]
    },
    {
      "heading": "Namespaces",
      "id": "namespaces",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-23",
          "question": "List all namespaces and name the four namespaces a cluster starts with",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get namespace\n# or\nkubectl get ns"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Per the official <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/\" target=\"_blank\" rel=\"noopener\">Namespaces</a> page, Kubernetes starts with four namespaces: <code>default</code> (start using the cluster without creating one), <code>kube-node-lease</code> (node heartbeats/leases), <code>kube-public</code> (readable by all clients, incl. unauthenticated), and <code>kube-system</code> (objects created by the Kubernetes system). Avoid the reserved <code>kube-</code> prefix for your own namespaces."
        },
        {
          "type": "exercise",
          "id": "ex-24",
          "question": "Set the namespace preference for the current context, then verify and reset it",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl config set-context --current --namespace=atlas\n# verify it was saved\nkubectl config view --minify | grep namespace:\n# now every kubectl command (without -n) targets 'atlas'\nkubectl get pods\n# reset back\nkubectl config set-context --current --namespace=default"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Per the official <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/\" target=\"_blank\" rel=\"noopener\">Namespaces</a> page, <code>kubectl config set-context --current --namespace=&lt;name&gt;</code> permanently saves the namespace for all subsequent commands in that context."
        },
        {
          "type": "exercise",
          "id": "ex-25",
          "question": "Find out which resource types are namespaced and which are cluster-scoped",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# resources that live inside a namespace\nkubectl api-resources --namespaced=true\n# resources that are cluster-wide (not in a namespace)\nkubectl api-resources --namespaced=false"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Per the official <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/\" target=\"_blank\" rel=\"noopener\">Namespaces</a> page, most resources (Pods, Services, Deployments...) are namespaced, while low-level resources such as Nodes and PersistentVolumes are not in any namespace."
        }
      ]
    },
    {
      "heading": "Cluster introspection with kubectl",
      "id": "cluster-introspection-with-kubectl",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-26",
          "question": "Get the control-plane address and the current kubectl context",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl cluster-info\nkubectl config current-context\nkubectl config get-contexts"
            }
          ]
        },
        {
          "type": "ref",
          "html": "<code>kubectl cluster-info</code> shows the URLs of the control plane and add-ons; <code>kubectl config current-context</code> tells you which cluster you are talking to (see the official <a href=\"https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/\" target=\"_blank\" rel=\"noopener\">Accessing Clusters</a> page)."
        },
        {
          "type": "exercise",
          "id": "ex-27",
          "question": "Use <code>kubectl explain</code> to discover the fields of the Pod resource",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl explain pod\nkubectl explain pod.spec\nkubectl explain pod.spec.containers"
            }
          ]
        },
        {
          "type": "text",
          "html": "<code>kubectl explain</code> documents the API resources and their fields straight from the cluster, which is handy when writing manifests (e.g. <code>.spec.containers[].image</code>)."
        },
        {
          "type": "exercise",
          "id": "ex-28",
          "question": "List the nodes and their details with <code>-o wide</code>",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get nodes\nkubectl get nodes -o wide   # adds INTERNAL-IP, OS-IMAGE, KERNEL-VERSION, CONTAINER-RUNTIME"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-29",
          "question": "List all resources in a namespace with <code>kubectl get all</code>",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get all -n default\n# or, if your namespace preference is set\nkubectl get all"
            }
          ]
        },
        {
          "type": "text",
          "html": "<code>kubectl get all</code> is a convenience that lists the common workload and service resources (pods, services, deployments, replicasets, statefulsets) in a namespace. It does <strong>not</strong> list everything — <code>kubectl get all</code> omits things like ConfigMaps and Secrets."
        }
      ]
    }
  ],
  "count": 30,
  "description": "Namespaces, pods, and kubectl basics.",
  "file": "a.core_concepts.md"
};
