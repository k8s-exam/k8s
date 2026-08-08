window.CKAD_TOPIC = {
  "slug": "pod-design",
  "title": "Pod Design",
  "weight": "20%",
  "preamble": [
    {
      "type": "text",
      "html": "<a href=\"#labels-and-annotations\">Labels And Annotations</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#deployments\">Deployments</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#jobs\">Jobs</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#cron-jobs\">Cron Jobs</a>"
    }
  ],
  "sections": [
    {
      "heading": "Labels and Annotations",
      "id": "labels-and-annotations",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Overview &gt; Working with Kubernetes Objects &gt; <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#label-selectors\" target=\"_blank\" rel=\"noopener\">Labels and Selectors</a>"
        },
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create 3 pods with names app1,app2,app3. All of them should have the label app=v1",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run app1 --image=nginx --restart=Never --labels=app=v1\nkubectl run app2 --image=nginx --restart=Never --labels=app=v1\nkubectl run app3 --image=nginx --restart=Never --labels=app=v1\n# or\nfor i in `seq 1 3`; do kubectl run app$i --image=nginx --restart=Never -l app=v1 ; done"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Show all labels of the pods",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po --show-labels"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Change the labels of pod 'app2' to be app=v2",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl label po app2 app=v2 --overwrite\n# or edit the pod yaml\nkubectl edit po app2"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Get the label 'app' for the pods (show a column with APP labels)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po -L app\n# or\nkubectl get po --label-columns=app"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Get only the 'app=v2' pods",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po -l app=v2\n# or\nkubectl get po -l 'app in (v2)'\n# or\nkubectl get po --selector=app=v2"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Get 'app=v2' and not 'tier=frontend' pods",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po -l app=v2,tier!=frontend\n# or\nkubectl get po -l 'app in (v2), tier notin (frontend)'\n# or\nkubectl get po --selector=app=v2,tier!=frontend"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Add a new label tier=web to all pods having 'app=v2' or 'app=v1' labels",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl label po -l 'app in (v1,v2)' tier=web"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Add an annotation 'owner: marketing' to all pods having 'app=v2' label",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl annotate po -l \"app=v2\" owner=marketing"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "Remove the 'app' label from the pods we created before",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl label po app1 app2 app3 app-\n# or\nkubectl label po app{1..3} app-\n# or\nkubectl label po -l app app-"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-9",
          "question": "Annotate pods app1, app2, app3 with &quot;description='my description'&quot; value",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl annotate po app1 app2 app3 description='my description'\n#or\nkubectl annotate po app{1..3} description='my description'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-10",
          "question": "Check the annotations for pod app1",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl annotate pod app1 --list\n# or\nkubectl describe po app1 | grep -i 'annotations'\n# or\nkubectl get po app1 -o custom-columns=Name:metadata.name,ANNOTATIONS:metadata.annotations.description"
            },
            {
              "type": "text",
              "html": "As an alternative to using <code>| grep</code> you can use jsonPath like <code>kubectl get po app1 -o jsonpath='{.metadata.annotations}{&quot;\\n&quot;}'</code>"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-11",
          "question": "Remove the annotations for these three pods",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl annotate po app{1..3} description- owner-"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-12",
          "question": "Remove these pods to have a clean state in your cluster",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete po app{1..3}"
            }
          ]
        }
      ]
    },
    {
      "heading": "Pod Placement",
      "id": "pod-placement",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-13",
          "question": "Create a pod that will be deployed to a Node that has the label 'accelerator=nvidia-tesla-p100'",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Add the label to a node:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl label nodes <your-node-name> accelerator=nvidia-tesla-p100\nkubectl get nodes --show-labels"
            },
            {
              "type": "text",
              "html": "We can use the 'nodeSelector' property on the Pod YAML:"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: gpu-worker\nspec:\n  containers:\n    - name: gpu-worker\n      image: \"registry.k8s.io/cuda-vector-add:v0.1\"\n  nodeSelector: # add this\n    accelerator: nvidia-tesla-p100 # the selection label"
            },
            {
              "type": "text",
              "html": "You can easily find out where in the YAML it should be placed by:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl explain po.spec"
            },
            {
              "type": "text",
              "html": "OR:"
            },
            {
              "type": "ref",
              "html": "Use node affinity (https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/#schedule-a-pod-using-required-node-affinity)"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: gpu-affinity\nspec:\n  affinity:\n    nodeAffinity:\n      requiredDuringSchedulingIgnoredDuringExecution:\n        nodeSelectorTerms:\n        - matchExpressions:\n          - key: accelerator\n            operator: In\n            values:\n            - nvidia-tesla-p100\n  containers:\n    - name: gpu-affinity\n      image: \"registry.k8s.io/cuda-vector-add:v0.1\""
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-14",
          "question": "Create a pod that will be placed on node <code>node01</code> using <code>nodeName</code>",
          "setup": [],
          "answer": [
            {
              "type": "ref",
              "html": "<code>nodeName</code> forces the Pod to be bound to a specific node (bypassing the scheduler). For more details, see the official docs: <a href=\"https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename\" target=\"_blank\" rel=\"noopener\">https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename</a>"
            },
            {
              "type": "code",
              "language": "yaml",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: pinned-pod\nspec:\n  nodeName: node01\n  containers:\n  - name: pinned-app\n    image: nginx  "
            },
            {
              "type": "text",
              "html": "Verify which node it landed on:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pod pinned-pod -o wide"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-15",
          "question": "Taint a node with key <code>tier</code> and value <code>frontend</code> with the effect <code>NoSchedule</code>. Then, create a pod that tolerates this taint.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Taint a node:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl taint node node1 tier=frontend:NoSchedule # key=value:Effect\nkubectl describe node node1 # view the taints on a node"
            },
            {
              "type": "text",
              "html": "And to tolerate the taint:"
            },
            {
              "type": "code",
              "language": "yaml",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: tolerant-pod\nspec:\n  containers:\n  - name: tolerant-app\n    image: nginx\n  tolerations:\n  - key: \"tier\"\n    operator: \"Equal\"\n    value: \"frontend\"\n    effect: \"NoSchedule\""
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-16",
          "question": "Create a pod that will be placed on node <code>controlplane</code>. Use nodeSelector and tolerations.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "vi pod.yaml"
            },
            {
              "type": "code",
              "language": "yaml",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: ops-pod\nspec:\n  containers:\n  - name: ops-app\n    image: nginx\n  nodeSelector:\n    kubernetes.io/hostname: controlplane\n  tolerations:\n  - key: \"node-role.kubernetes.io/control-plane\"\n    operator: \"Exists\"\n    effect: \"NoSchedule\""
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml"
            }
          ]
        }
      ]
    },
    {
      "heading": "Deployments",
      "id": "deployments",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Workloads &gt; Workload Resources &gt; <a href=\"https://kubernetes.io/docs/concepts/workloads/controllers/deployment\" target=\"_blank\" rel=\"noopener\">Deployments</a>"
        },
        {
          "type": "exercise",
          "id": "ex-17",
          "question": "Create a deployment with image nginx:1.18.0, called webapp, having 2 replicas, defining port 80 as the port that this container exposes (don't create a service for this deployment)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deployment webapp  --image=nginx:1.18.0  --dry-run=client -o yaml > deploy.yaml\nvi deploy.yaml\n# change the replicas field from 1 to 2\n# add this section to the container spec and save the deploy.yaml file\n# ports:\n#   - containerPort: 80\nkubectl apply -f deploy.yaml"
            },
            {
              "type": "text",
              "html": "or, do something like:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deployment webapp  --image=nginx:1.18.0  --dry-run=client -o yaml | sed 's/replicas: 1/replicas: 2/g'  | sed 's/image: nginx:1.18.0/image: nginx:1.18.0\\n        ports:\\n        - containerPort: 80/g' | kubectl apply -f -"
            },
            {
              "type": "text",
              "html": "or,"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deploy webapp --image=nginx:1.18.0 --replicas=2 --port=80"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-18",
          "question": "View the YAML of this deployment",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get deploy webapp -o yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-19",
          "question": "View the YAML of the replica set that was created by this deployment",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl describe deploy webapp # you'll see the name of the replica set on the Events section and in the 'NewReplicaSet' property\n# OR you can find rs directly by:\nkubectl get rs -l run=webapp # if you created deployment by 'run' command\nkubectl get rs -l app=webapp # if you created deployment by 'create' command\n# you could also just do kubectl get rs\nkubectl get rs webapp-7bf7478b77 -o yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-20",
          "question": "Get the YAML for one of the pods",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po # get all the pods\n# OR you can find pods directly by:\nkubectl get po -l run=webapp # if you created deployment by 'run' command\nkubectl get po -l app=webapp # if you created deployment by 'create' command\nkubectl get po webapp-7bf7478b77-gjzp8 -o yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-21",
          "question": "Check how the deployment rollout is going",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl rollout status deploy webapp"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-22",
          "question": "Update the webapp image to nginx:1.19.8",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl set image deploy webapp nginx=nginx:1.19.8\n# alternatively...\nkubectl edit deploy webapp # change the .spec.template.spec.containers[0].image"
            },
            {
              "type": "text",
              "html": "The syntax of the 'kubectl set image' command is <code>kubectl set image (-f FILENAME | TYPE NAME) CONTAINER_NAME_1=CONTAINER_IMAGE_1 ... CONTAINER_NAME_N=CONTAINER_IMAGE_N [options]</code>"
            },
            {
              "type": "text",
              "html": "Note: the container inside the deployment is named <code>nginx</code> (kubectl names the container after the image when <code>kubectl create deploy webapp --image=nginx:1.18.0</code> is used), so the left-hand side of <code>set image</code> must be <code>nginx</code>, not <code>webapp</code> — otherwise you get <code>error: container webapp is not valid for deployment webapp</code>."
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-23",
          "question": "Check the rollout history and confirm that the replicas are OK",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl rollout history deploy webapp\nkubectl get deploy webapp\nkubectl get rs # check that a new replica set has been created\nkubectl get po"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-24",
          "question": "Undo the latest rollout and verify that new pods have the old image (nginx:1.18.0)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl rollout undo deploy webapp\n# wait a bit\nkubectl get po # select one 'Running' Pod\nkubectl describe po webapp-5ff4457d65-nslcl | grep -i image # should be nginx:1.18.0"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-25",
          "question": "Do an on-purpose update of the deployment with a wrong image nginx:1.91",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl set image deploy webapp nginx=nginx:1.91\n# or\nkubectl edit deploy webapp\n# change the image to nginx:1.91\n# vim tip: type (without quotes) '/image' and press Enter, to navigate quickly"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-26",
          "question": "Verify that something's wrong with the rollout",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl rollout status deploy webapp\n# or\nkubectl get po # you'll see 'ErrImagePull' or 'ImagePullBackOff'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-27",
          "question": "Return the deployment to the second revision (number 2) and verify the image is nginx:1.19.8",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl rollout undo deploy webapp --to-revision=2\nkubectl describe deploy webapp | grep Image:\nkubectl rollout status deploy webapp # Everything should be OK"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-28",
          "question": "Check the details of the fourth revision (number 4)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl rollout history deploy webapp --revision=4 # You'll also see the wrong image displayed here"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-29",
          "question": "Scale the deployment to 5 replicas",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl scale deploy webapp --replicas=5\nkubectl get po\nkubectl describe deploy webapp"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-30",
          "question": "Autoscale the deployment, pods between 5 and 10, targeting CPU utilization at 80%",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl autoscale deploy webapp --min=5 --max=10 --cpu=80%\n# view the horizontalpodautoscalers.autoscaling for webapp\nkubectl get hpa webapp"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-31",
          "question": "Pause the rollout of the deployment",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl rollout pause deploy webapp"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-32",
          "question": "Update the image to nginx:1.19.9 and check that there's nothing going on, since we paused the rollout",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl set image deploy webapp nginx=nginx:1.19.9\n# or\nkubectl edit deploy webapp\n# change the image to nginx:1.19.9\nkubectl rollout history deploy webapp # no new revision"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-33",
          "question": "Resume the rollout and check that the nginx:1.19.9 image has been applied",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl rollout resume deploy webapp\nkubectl rollout history deploy webapp\nkubectl rollout history deploy webapp --revision=6 # insert the number of your latest revision"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-34",
          "question": "Delete the deployment and the horizontal pod autoscaler you created",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete deploy webapp\nkubectl delete hpa webapp\n# or\nkubectl delete deploy/webapp hpa/webapp"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-35",
          "question": "Implement canary deployment by running two instances of nginx marked as version=v1 and version=v2 so that the load is balanced at 75%-25% ratio",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Deploy 3 replicas of v1:"
            },
            {
              "type": "code",
              "language": "text",
              "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: catalog-v1\n  labels:\n    app: catalog\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: catalog\n      version: v1\n  template:\n    metadata:\n      labels:\n        app: catalog\n        version: v1\n    spec:\n      containers:\n      - name: web\n        image: nginx\n        ports:\n        - containerPort: 80\n        volumeMounts:\n        - name: content\n          mountPath: /usr/share/nginx/html\n      initContainers:\n      - name: pagewriter\n        image: busybox:1.28\n        command:\n        - /bin/sh\n        - -c\n        - \"echo version-1 > /work-dir/index.html\"\n        volumeMounts:\n        - name: content\n          mountPath: \"/work-dir\"\n      volumes:\n      - name: content\n        emptyDir: {}"
            },
            {
              "type": "text",
              "html": "Create the service:"
            },
            {
              "type": "code",
              "language": "text",
              "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: catalog-svc\n  labels:\n    app: catalog\nspec:\n  type: ClusterIP\n  ports:\n  - name: http\n    port: 80\n    targetPort: 80\n  selector:\n    app: catalog"
            },
            {
              "type": "text",
              "html": "Test if the deployment was successful from within a Pod:"
            },
            {
              "type": "code",
              "language": "text",
              "code": "# run a wget to the Service catalog-svc\nkubectl run -it --rm --restart=Never probe --image=busybox --command -- wget -qO- catalog-svc\nversion-1"
            },
            {
              "type": "text",
              "html": "Deploy 1 replica of v2:"
            },
            {
              "type": "code",
              "language": "text",
              "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: catalog-v2\n  labels:\n    app: catalog\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: catalog\n      version: v2\n  template:\n    metadata:\n      labels:\n        app: catalog\n        version: v2\n    spec:\n      containers:\n      - name: web\n        image: nginx\n        ports:\n        - containerPort: 80\n        volumeMounts:\n        - name: content\n          mountPath: /usr/share/nginx/html\n      initContainers:\n      - name: pagewriter\n        image: busybox:1.28\n        command:\n        - /bin/sh\n        - -c\n        - \"echo version-2 > /work-dir/index.html\"\n        volumeMounts:\n        - name: content\n          mountPath: \"/work-dir\"\n      volumes:\n      - name: content\n        emptyDir: {}"
            },
            {
              "type": "text",
              "html": "Observe that calling the ip exposed by the service the requests are load balanced across the two versions:"
            },
            {
              "type": "code",
              "language": "text",
              "code": "# run a busyBox pod that will make a wget call to the service catalog-svc and print out the version of the pod it reached.\nkubectl run -it --rm --restart=Never probe --image=busybox -- /bin/sh -c 'while sleep 1; do wget -qO- catalog-svc; done'\nversion-1\nversion-1\nversion-1\nversion-2\nversion-2\nversion-1"
            },
            {
              "type": "text",
              "html": "If the v2 is stable, scale it up to 4 replicas and shutdown the v1:"
            },
            {
              "type": "code",
              "language": "text",
              "code": "kubectl scale --replicas=4 deploy catalog-v2\nkubectl delete deploy catalog-v1\n# hit the Service from inside the cluster (its ClusterIP is not reachable from your workstation)\nkubectl run probe --image=busybox --restart=Never -it --rm -- /bin/sh -c 'while sleep 1; do wget -qO- http://catalog-svc; done'\nversion-2\nversion-2\nversion-2\nversion-2\nversion-2\nversion-2"
            }
          ]
        }
      ]
    },
    {
      "heading": "Jobs",
      "id": "jobs",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-36",
          "question": "Create a job named digits with image perl:5.34 that runs the command with arguments &quot;perl -Mbignum=bpi -wle 'print bpi(2000)'&quot;",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create job digits --image=perl:5.34 -- perl -Mbignum=bpi -wle 'print bpi(2000)'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-37",
          "question": "Wait till it's done, get the output",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get jobs -w # wait till 'SUCCESSFUL' is 1 (will take some time, perl image might be big)\nkubectl get po # get the pod name\nkubectl logs digits-**** # get the pi numbers\nkubectl delete job digits"
            },
            {
              "type": "text",
              "html": "OR"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get jobs -w # wait till 'SUCCESSFUL' is 1 (will take some time, perl image might be big)\nkubectl logs job/digits\nkubectl delete job digits"
            },
            {
              "type": "text",
              "html": "OR"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl wait --for=condition=complete --timeout=300s job digits\nkubectl logs job/digits\nkubectl delete job digits"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-38",
          "question": "Create a job with the image busybox that executes the command 'echo hello;sleep 30;echo world'",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create job beeper --image=busybox -- /bin/sh -c 'echo hello;sleep 30;echo world'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-39",
          "question": "Follow the logs for the pod (you'll wait for 30 seconds)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po # find the job pod\nkubectl logs beeper-ptx58 -f # follow the logs"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-40",
          "question": "See the status of the job, describe it and see the logs",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get jobs\nkubectl describe jobs beeper\nkubectl logs job/beeper"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-41",
          "question": "Delete the job",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete job beeper"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-42",
          "question": "Create the same job, make it run 5 times, one after the other. Verify its status and delete it",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create job beeper --image=busybox --dry-run=client -o yaml -- /bin/sh -c 'echo hello;sleep 30;echo world' > job.yaml\nvi job.yaml"
            },
            {
              "type": "text",
              "html": "Add job.spec.completions=5 and job.spec.completionMode=Indexed"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: batch/v1\nkind: Job\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: beeper\n  name: beeper\nspec:\n  completions: 5 # add this line\n  completionMode: Indexed # add this line\n  template:\n    metadata:\n      creationTimestamp: null\n      labels:\n        run: beeper\n    spec:\n      containers:\n      - args:\n        - /bin/sh\n        - -c\n        - echo hello;sleep 30;echo world\n        image: busybox\n        name: beeper\n        resources: {}\n      restartPolicy: OnFailure\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f job.yaml"
            },
            {
              "type": "text",
              "html": "Verify that it has been completed:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get job beeper -w # will take two and a half minutes\nkubectl delete jobs beeper"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-43",
          "question": "Create the same job, but make it run 5 parallel times",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "vi job.yaml"
            },
            {
              "type": "text",
              "html": "Add job.spec.parallelism=5"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: batch/v1\nkind: Job\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: beeper\n  name: beeper\nspec:\n  parallelism: 5 # add this line\n  template:\n    metadata:\n      creationTimestamp: null\n      labels:\n        run: beeper\n    spec:\n      containers:\n      - args:\n        - /bin/sh\n        - -c\n        - echo hello;sleep 30;echo world\n        image: busybox\n        name: beeper\n        resources: {}\n      restartPolicy: OnFailure\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f job.yaml\nkubectl get jobs"
            },
            {
              "type": "text",
              "html": "It will take some time for the parallel jobs to finish (&gt;= 30 seconds)"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete job beeper"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-44",
          "question": "Create a job but ensure that it will be automatically terminated by kubernetes if it takes more than 30 seconds to execute",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create job beeper --image=busybox --dry-run=client -o yaml -- /bin/sh -c 'while true; do echo hello; sleep 10;done' > job.yaml\nvi job.yaml"
            },
            {
              "type": "text",
              "html": "Add job.spec.activeDeadlineSeconds=30"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "apiVersion: batch/v1\nkind: Job\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: beeper\n  name: beeper\nspec:\n  activeDeadlineSeconds: 30 # add this line\n  template:\n    metadata:\n      creationTimestamp: null\n      labels:\n        run: beeper\n    spec:\n      containers:\n      - args:\n        - /bin/sh\n        - -c\n        - while true; do echo hello; sleep 10;done\n        image: busybox\n        name: beeper\n        resources: {}\n      restartPolicy: OnFailure\nstatus: {}"
            }
          ]
        }
      ]
    },
    {
      "heading": "Cron jobs",
      "id": "cron-jobs",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Run Jobs &gt; <a href=\"https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/\" target=\"_blank\" rel=\"noopener\">Running Automated Tasks with a CronJob</a>"
        },
        {
          "type": "exercise",
          "id": "ex-45",
          "question": "Create a cron job with image busybox that runs on a schedule of &quot;<em>/1 </em> <em> </em> *&quot; and writes 'date; echo Hello from the Kubernetes cluster' to standard output",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create cronjob ticker --image=busybox --schedule=\"*/1 * * * *\" -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-46",
          "question": "See its logs and delete it",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get po # copy the ID of the pod whose container was just created\nkubectl logs <ticker-***> # you will see the date and message \nkubectl delete cj ticker # cj stands for cronjob"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-47",
          "question": "Create the same cron job again, and watch the status. Once it ran, check which job ran by the created cron job. Check the log, and delete the cron job",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get cj\nkubectl get jobs --watch\nkubectl get po --show-labels # observe that the pods have a label that mentions their 'parent' job\nkubectl logs ticker-1529745840-m867r\n# Bear in mind that Kubernetes will run a new job/pod for each new cron job\nkubectl delete cj ticker"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-48",
          "question": "Create a cron job with image busybox that runs every minute and writes 'date; echo Hello from the Kubernetes cluster' to standard output. The cron job should be terminated if it takes more than 17 seconds to start execution after its scheduled time (i.e. the job missed its scheduled time).",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create cronjob deadline-job --image=busybox --restart=Never --dry-run=client --schedule=\"* * * * *\" -o yaml -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster' > deadline-job.yaml\nvi deadline-job.yaml"
            },
            {
              "type": "text",
              "html": "Add cronjob.spec.startingDeadlineSeconds=17"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  creationTimestamp: null\n  name: deadline-job\nspec:\n  startingDeadlineSeconds: 17 # add this line\n  jobTemplate:\n    metadata:\n      creationTimestamp: null\n      name: deadline-job\n    spec:\n      template:\n        metadata:\n          creationTimestamp: null\n        spec:\n          containers:\n          - args:\n            - /bin/sh\n            - -c\n            - date; echo Hello from the Kubernetes cluster\n            image: busybox\n            name: deadline-job\n            resources: {}\n          restartPolicy: Never\n  schedule: '* * * * *'\nstatus: {}"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-49",
          "question": "Create a cron job with image busybox that runs every minute and writes 'date; echo Hello from the Kubernetes cluster' to standard output. The cron job should be terminated if it successfully starts but takes more than 12 seconds to complete execution.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create cronjob deadline-job --image=busybox --restart=Never --dry-run=client --schedule=\"* * * * *\" -o yaml -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster' > deadline-job.yaml\nvi deadline-job.yaml"
            },
            {
              "type": "text",
              "html": "Add cronjob.spec.jobTemplate.spec.activeDeadlineSeconds=12"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  creationTimestamp: null\n  name: deadline-job\nspec:\n  jobTemplate:\n    metadata:\n      creationTimestamp: null\n      name: deadline-job\n    spec:\n      activeDeadlineSeconds: 12 # add this line\n      template:\n        metadata:\n          creationTimestamp: null\n        spec:\n          containers:\n          - args:\n            - /bin/sh\n            - -c\n            - date; echo Hello from the Kubernetes cluster\n            image: busybox\n            name: deadline-job\n            resources: {}\n          restartPolicy: Never\n  schedule: '* * * * *'\nstatus: {}"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-50",
          "question": "Keep only the last 2 successful and 1 failed runs of a CronJob",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Create a CronJob with history limits configured:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create cronjob history-job \\\n  --image=busybox \\\n  --schedule=\"*/1 * * * *\" \\\n  --dry-run=client -o yaml \\\n  -- /bin/sh -c 'date; echo Hello from history demo' > history-job.yaml"
            },
            {
              "type": "text",
              "html": "Edit the file:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "vi history-job.yaml"
            },
            {
              "type": "text",
              "html": "Add the following fields under spec:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: history-job\nspec:\n  schedule: \"*/1 * * * *\"\n  successfulJobsHistoryLimit: 2   # keep last 2 successful jobs\n  failedJobsHistoryLimit: 1        # keep last 1 failed job\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n          - name: history-job\n            image: busybox\n            args:\n            - /bin/sh\n            - -c\n            - date; echo Hello from history demo\n          restartPolicy: Never"
            },
            {
              "type": "text",
              "html": "Apply the CronJob:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f history-job.yaml"
            },
            {
              "type": "text",
              "html": "Verify job history behavior:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get cj history-job\nkubectl get jobs --watch"
            },
            {
              "type": "text",
              "html": "After several runs, confirm that:"
            },
            {
              "type": "list",
              "items": [
                "Only 1 failed Job is kept (if failures occur)"
              ]
            },
            {
              "type": "text",
              "html": "Clean up:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete cj history-job"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-51",
          "question": "Create a job from cronjob.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create job --from=cronjob/ticker manual-run"
            }
          ]
        }
      ]
    }
  ],
  "count": 52,
  "description": "Labels, deployments, jobs, and cron jobs.",
  "file": "c.pod_design.md"
};
