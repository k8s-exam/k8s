window.CKAD_TOPIC = {
  "slug": "configuration",
  "title": "Configuration",
  "weight": "18%",
  "preamble": [
    {
      "type": "text",
      "html": "<a href=\"#configmaps\">ConfigMaps</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#securitycontext\">SecurityContext</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#resource-requests-and-limits\">Resource Requests and Limits</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#limit-ranges\">Limit Ranges</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#resource-quotas\">Resource Quotas</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#secrets\">Secrets</a>"
    },
    {
      "type": "text",
      "html": "<a href=\"#serviceaccounts\">ServiceAccounts</a>"
    },
    {
      "type": "text",
      "html": "#Tips, export to variable"
    },
    {
      "type": "text",
      "html": "export ns=&quot;-n vault&quot;"
    },
    {
      "type": "text",
      "html": "export do=&quot;--dry-run=client -oyaml&quot;"
    }
  ],
  "sections": [
    {
      "heading": "ConfigMaps",
      "id": "configmaps",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Configure Pods and Containers &gt; <a href=\"https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/\" target=\"_blank\" rel=\"noopener\">Configure a Pod to Use a ConfigMap</a>"
        },
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a configmap named brioche with values flour=strong,rise=slow",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create configmap brioche --from-literal=flour=strong --from-literal=rise=slow"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Display its values",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get cm brioche -o yaml\n# or\nkubectl describe cm brioche"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Create and display a configmap from a file",
          "setup": [
            {
              "type": "text",
              "html": "Create the file with"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "echo -e \"crumb=airy\\ncrust=crisp\" > batch.txt"
            }
          ],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create cm baguette --from-file=batch.txt\nkubectl get cm baguette -o yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Create and display a configmap from a .env file",
          "setup": [
            {
              "type": "text",
              "html": "Create the file with the command"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "echo -e \"butter=many\\n# this is a comment\\n\\nfold=triple\\n#anothercomment\" > mise.env"
            }
          ],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create cm croissant --from-env-file=mise.env\nkubectl get cm croissant -o yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Create and display a configmap from a file, giving the key 'starter'",
          "setup": [
            {
              "type": "text",
              "html": "Create the file with"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "echo -e \"tang=sharp\\nchew=slow\" > loaf.txt"
            }
          ],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create cm sourdough --from-file=starter=loaf.txt\nkubectl describe cm sourdough\nkubectl get cm sourdough -o yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Create a configMap called 'focaccia' with the value topping=rosemary. Create a new nginx pod that loads the value from key 'topping' in an env variable called 'TOPPING'",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create cm focaccia --from-literal=topping=rosemary\nkubectl run chef --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: chef\n  name: chef\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: chef\n    resources: {}\n    env:\n    - name: TOPPING # name of the env variable\n      valueFrom:\n        configMapKeyRef:\n          name: focaccia # name of config map\n          key: topping # name of the entity in config map\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl exec -it chef -- env | grep TOPPING # will show 'TOPPING=rosemary'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Create a configMap 'pita' with values 'pocket=deep', 'warm=yes'. Load this configMap as env variables into a new nginx pod",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create configmap pita --from-literal=pocket=deep --from-literal=warm=yes\nkubectl run baker --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: baker\n  name: baker\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: baker\n    resources: {}\n    envFrom: # different than previous one, that was 'env'\n    - configMapRef: # different from the previous one, was 'configMapKeyRef'\n        name: pita # the name of the config map\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl exec -it baker -- env "
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Create a configMap 'bagel' with values 'core=chewy', 'sheen=gloss'. Load this as a volume inside an nginx pod on path '/etc/config'. Create the pod and 'ls' into the '/etc/config' directory.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create configmap bagel --from-literal=core=chewy --from-literal=sheen=gloss\nkubectl run oven --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: oven\n  name: oven\nspec:\n  volumes: # add a volumes list\n  - name: bread # just a name, you'll reference this in the pods\n    configMap:\n      name: bagel # name of your configmap\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: oven\n    resources: {}\n    volumeMounts: # your volume mounts are listed here\n    - name: bread # the name that you specified in pod.spec.volumes.name\n      mountPath: /etc/config # the path inside your container\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl exec -it oven -- /bin/sh\ncd /etc/config\nls # will show core sheen\ncat core # will show chewy"
            }
          ]
        }
      ]
    },
    {
      "heading": "SecurityContext",
      "id": "securitycontext",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Configure Pods and Containers &gt; <a href=\"https://kubernetes.io/docs/tasks/configure-pod-container/security-context/\" target=\"_blank\" rel=\"noopener\">Configure a Security Context for a Pod or Container</a>"
        },
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "Create the YAML for an nginx pod that runs with the user ID 101. No need to create the pod",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run sandbox --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: sandbox\n  name: sandbox\nspec:\n  securityContext: # insert this line\n    runAsUser: 101 # UID for the user\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: sandbox\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-9",
          "question": "Create the YAML for an nginx pod that has the capabilities &quot;NET_ADMIN&quot;, &quot;SYS_TIME&quot; added to its single container",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run elevated --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: elevated\n  name: elevated\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: elevated\n    securityContext: # insert this line\n      capabilities: # and this\n        add: [\"NET_ADMIN\", \"SYS_TIME\"] # this as well\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            }
          ]
        }
      ]
    },
    {
      "heading": "Resource requests and limits",
      "id": "resource-requests-and-limits",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Configure Pods and Containers &gt; <a href=\"https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/\" target=\"_blank\" rel=\"noopener\">Assign CPU Resources to Containers and Pods</a>"
        },
        {
          "type": "exercise",
          "id": "ex-10",
          "question": "Create an nginx pod with requests cpu=100m,memory=256Mi and limits cpu=200m,memory=512Mi",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run server --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: server\n  name: server\nspec:\n  containers:\n  - image: nginx\n    name: server\n    resources:\n      requests:\n        memory: \"256Mi\"\n        cpu: \"100m\"\n      limits:    \n        memory: \"512Mi\"\n        cpu: \"200m\"\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            }
          ]
        }
      ]
    },
    {
      "heading": "Limit Ranges",
      "id": "limit-ranges",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Policies &gt; Limit Ranges (https://kubernetes.io/docs/concepts/policy/limit-range/)"
        },
        {
          "type": "exercise",
          "id": "ex-11",
          "question": "Create a namespace named bounds with a LimitRange that limits pod memory to a max of 500Mi and min of 100Mi",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create ns bounds"
            },
            {
              "type": "text",
              "html": "vi mem-limit.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: LimitRange\nmetadata:\n  name: mem-bounds\n  namespace: bounds\nspec:\n  limits:\n  - max: # max and min define the limit range\n      memory: \"500Mi\"\n    min:\n      memory: \"100Mi\"\n    type: Pod"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f mem-limit.yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-12",
          "question": "Describe the namespace bounds",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl describe ns bounds\n# and, to see the enforced values of the LimitRange:\nkubectl describe limitrange mem-bounds -n bounds"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-13",
          "question": "Create an nginx pod that requests 250Mi of memory in the bounds namespace",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "vi app.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: app\n  name: app\n  namespace: bounds\nspec:\n  containers:\n  - image: nginx\n    name: app\n    resources:\n      requests:\n        memory: \"250Mi\"\n      limits:\n        memory: \"500Mi\" # limit has to be specified and be <= limitrange\n  dnsPolicy: ClusterFirst\n  restartPolicy: Always\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f app.yaml"
            }
          ]
        }
      ]
    },
    {
      "heading": "Resource Quotas",
      "id": "resource-quotas",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Policies &gt; Resource Quotas (https://kubernetes.io/docs/concepts/policy/resource-quotas/)"
        },
        {
          "type": "exercise",
          "id": "ex-14",
          "question": "Create ResourceQuota in namespace <code>billing</code> with hard requests <code>cpu=1</code>, <code>memory=1Gi</code> and hard limits <code>cpu=2</code>, <code>memory=2Gi</code>.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Create the namespace:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create ns billing"
            },
            {
              "type": "text",
              "html": "Create the ResourceQuota"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "vi budget.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: budget\n  namespace: billing\nspec:\n  hard:\n    requests.cpu: \"1\"\n    requests.memory: 1Gi\n    limits.cpu: \"2\"\n    limits.memory: 2Gi"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f budget.yaml"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create quota budget --namespace=billing --hard=requests.cpu=1,requests.memory=1Gi,limits.cpu=2,limits.memory=2Gi"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-15",
          "question": "Attempt to create a pod with resource requests <code>cpu=2</code>, <code>memory=3Gi</code> and limits <code>cpu=3</code>, <code>memory=4Gi</code> in namespace <code>billing</code>",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "vi invoice.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: invoice\n  name: invoice\n  namespace: billing\nspec:\n  containers:\n  - image: nginx\n    name: invoice\n    resources:\n      requests:\n        memory: \"3Gi\"\n        cpu: \"2\"\n      limits:\n        memory: \"4Gi\"\n        cpu: \"3\"\n  dnsPolicy: ClusterFirst\n  restartPolicy: Always\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f invoice.yaml"
            },
            {
              "type": "text",
              "html": "Expected error message:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "Error from server (Forbidden): error when creating \"invoice.yaml\": pods \"invoice\" is forbidden: exceeded quota: budget, requested: limits.cpu=3,limits.memory=4Gi,requests.cpu=2,requests.memory=3Gi, used: limits.cpu=0,limits.memory=0,requests.cpu=0,requests.memory=0, limited: limits.cpu=2,limits.memory=2Gi,requests.cpu=1,requests.memory=1Gi"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-16",
          "question": "Create a pod with resource requests <code>cpu=0.5</code>, <code>memory=1Gi</code> and limits <code>cpu=1</code>, <code>memory=2Gi</code> in namespace <code>billing</code>",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "vi receipt.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: receipt\n  name: receipt\n  namespace: billing\nspec:\n  containers:\n  - image: nginx\n    name: receipt\n    resources:\n      requests:\n        memory: \"1Gi\"\n        cpu: \"0.5\"\n      limits:\n        memory: \"2Gi\"\n        cpu: \"1\"\n  dnsPolicy: ClusterFirst\n  restartPolicy: Always\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f receipt.yaml"
            },
            {
              "type": "text",
              "html": "Show the ResourceQuota usage in namespace <code>billing</code>"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get resourcequota -n billing"
            },
            {
              "type": "code",
              "language": "text",
              "code": "NAME     AGE   REQUEST                                          LIMIT\nbudget   10m   requests.cpu: 500m/1, requests.memory: 1Gi/1Gi   limits.cpu: 1/2, limits.memory: 2Gi/2Gi"
            }
          ]
        }
      ]
    },
    {
      "heading": "Secrets",
      "id": "secrets",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Configuration &gt; <a href=\"https://kubernetes.io/docs/concepts/configuration/secret/\" target=\"_blank\" rel=\"noopener\">Secrets</a>"
        },
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Inject Data Into Applications &gt; <a href=\"https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/\" target=\"_blank\" rel=\"noopener\">Distribute Credentials Securely Using Secrets</a>"
        },
        {
          "type": "exercise",
          "id": "ex-17",
          "question": "Create a secret called gateway with the values password=swordfish",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create secret generic gateway --from-literal=password=swordfish"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-18",
          "question": "Create a secret called creds that gets key/value from a file",
          "setup": [
            {
              "type": "text",
              "html": "Create a file called user with the value admin:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "echo -n admin > user"
            }
          ],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create secret generic creds --from-file=user"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-19",
          "question": "Get the value of creds",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get secret creds -o yaml\necho -n YWRtaW4= | base64 -d # on MAC it is -D, which decodes the value and shows 'admin'"
            },
            {
              "type": "text",
              "html": "Alternative using <code>--jsonpath</code>:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get secret creds -o jsonpath='{.data.user}' | base64 -d  # on MAC it is -D"
            },
            {
              "type": "text",
              "html": "Alternative using <code>--template</code>:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get secret creds --template '{{.data.user}}' | base64 -d  # on MAC it is -D"
            },
            {
              "type": "text",
              "html": "Alternative using <code>jq</code>:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get secret creds -o json | jq -r .data.user | base64 -d  # on MAC it is -D"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-20",
          "question": "Create an nginx pod that mounts the secret creds in a volume on path /etc/creds",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run reader --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: reader\n  name: reader\nspec:\n  volumes: # specify the volumes\n  - name: creds # this name will be used for reference inside the container\n    secret: # we want a secret\n      secretName: creds # name of the secret - this must already exist on pod creation\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: reader\n    resources: {}\n    volumeMounts: # our volume mounts\n    - name: creds # name on pod.spec.volumes\n      mountPath: /etc/creds #our mount path\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl exec -it reader -- /bin/bash\nls /etc/creds  # shows user\ncat /etc/creds/user # shows admin"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-21",
          "question": "Delete the pod you just created and mount the variable 'user' from secret creds onto a new nginx pod in env variable called 'USER'",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete po reader\nkubectl run env-consumer --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: env-consumer\n  name: env-consumer\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: env-consumer\n    resources: {}\n    env: # our env variables\n    - name: USER # asked name\n      valueFrom:\n        secretKeyRef: # secret reference\n          name: creds # our secret's name\n          key: user # the key of the data in the secret\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl exec -it env-consumer -- env | grep USER | cut -d '=' -f 2 # will show 'admin'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-22",
          "question": "Create a Secret named 'external-api' in the namespace 'vault'. Then, provide the key-value pair API_KEY=LmWfRzVnYxQaKdCjTuShPeObIgXcQ as literal.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create namespace vault # make sure the namespace exists first\nexport ns=\"-n vault\"\nexport do=\"--dry-run=client -oyaml\"\nk create secret generic external-api --from-literal=API_KEY=LmWfRzVnYxQaKdCjTuShPeObIgXcQ $ns $do > sc.yaml\nk apply -f sc.yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-23",
          "question": "Consuming the Secret. Create a Pod named 'fetcher' with the image 'nginx' in the namespace 'vault' and consume the Secret as an environment variable. Then, open an interactive shell to the Pod, and print all environment variables.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "export ns=\"-n vault\"\nexport do=\"--dry-run=client -oyaml\"\nk run fetcher --image=nginx --restart=Never $ns $do > nginx.yaml\nvi nginx.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: fetcher\n  name: fetcher\n  namespace: vault\nspec:\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: fetcher\n    resources: {}\n    env:\n    - name: API_KEY\n      valueFrom:\n        secretKeyRef:\n          name: external-api\n          key: API_KEY\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "k create $ns -f nginx.yaml\nk exec -it $ns fetcher -- /bin/sh\n#env"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-24",
          "question": "Create a Secret named 'ssh-key' of type 'kubernetes.io/ssh-auth' in the namespace 'vault'. Define a single key named 'ssh-privatekey', and point it to the file 'id_rsa' in this directory.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "#Tips, export to variable\nexport do=\"--dry-run=client -oyaml\"\nexport ns=\"-n vault\"\n#if id_rsa file didn't exist, generate it in the CURRENT directory (--from-file looks here):\nssh-keygen -t rsa -f id_rsa -N \"\"\nk create secret generic ssh-key $ns --type=\"kubernetes.io/ssh-auth\" --from-file=ssh-privatekey=id_rsa $do > sc.yaml\nk apply -f sc.yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-25",
          "question": "Create a Pod named 'agent' with the image 'nginx' in the namespace 'vault', and consume the Secret as Volume. Mount the Secret as Volume to the path /var/app with read-only access. Open an interactive shell to the Pod, and render the contents of the file.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "#Tips, export to variable\nexport ns=\"-n vault\"\nexport do=\"--dry-run=client -oyaml\"\nk run agent --image=nginx --restart=Never $ns $do > nginx.yaml\nvi nginx.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: agent\n  name: agent\n  namespace: vault\nspec:\n  containers:\n    - image: nginx\n      imagePullPolicy: IfNotPresent\n      name: agent\n      resources: {}\n      volumeMounts:\n        - name: sshkey\n          mountPath: \"/var/app\"\n          readOnly: true\n  volumes:\n    - name: sshkey\n      secret:\n        secretName: ssh-key\n        optional: true\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "k exec -it $ns agent -- /bin/sh\n# cat /var/app/ssh-privatekey\n# exit"
            }
          ]
        }
      ]
    },
    {
      "heading": "ServiceAccounts",
      "id": "serviceaccounts",
      "blocks": [
        {
          "type": "ref",
          "html": "kubernetes.io &gt; Documentation &gt; Tasks &gt; Configure Pods and Containers &gt; <a href=\"https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/\" target=\"_blank\" rel=\"noopener\">Configure Service Accounts for Pods</a>"
        },
        {
          "type": "exercise",
          "id": "ex-26",
          "question": "See all the service accounts of the cluster in all namespaces",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get sa --all-namespaces"
            },
            {
              "type": "text",
              "html": "Alternatively"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get sa -A"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-27",
          "question": "Create a new serviceaccount called 'builder'",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create sa builder"
            },
            {
              "type": "text",
              "html": "Alternatively:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# let's get a template easily\nkubectl get sa default -o yaml > sa.yaml\nvim sa.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: builder"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f sa.yaml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-28",
          "question": "Create an nginx pod that uses 'builder' as a service account",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run runner --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml\nvi pod.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: runner\n  name: runner\nspec:\n  serviceAccountName: builder # we use pod.spec.serviceAccountName\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: runner\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  creationTimestamp: null\n  labels:\n    run: runner\n  name: runner\nspec:\n  serviceAccount: builder # deprecated alias for pod.spec.serviceAccountName\n  containers:\n  - image: nginx\n    imagePullPolicy: IfNotPresent\n    name: runner\n    resources: {}\n  dnsPolicy: ClusterFirst\n  restartPolicy: Never\nstatus: {}"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create -f pod.yaml\nkubectl get pod runner -o jsonpath='{.spec.serviceAccountName}' # output: builder\nkubectl exec -it runner -- cat /var/run/secrets/kubernetes.io/serviceaccount/token # to check if the ServiceAccount token is mounted inside the Pod. Starting from Kubernetes 1.24+, the token is dynamically projected into the Pod"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-29",
          "question": "Generate an API token for the service account 'builder'",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create token builder"
            }
          ]
        }
      ]
    }
  ],
  "count": 30,
  "description": "ConfigMaps, secrets, resources, and quotas.",
  "file": "d.configuration.md"
};
