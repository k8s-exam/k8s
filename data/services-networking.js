window.CKAD_TOPIC = {
  "slug": "services-networking",
  "title": "Services & Networking",
  "weight": null,
  "preamble": [],
  "sections": [
    {
      "heading": "Exercises",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a pod with image nginx called web and expose its port 80",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run web --image=nginx --restart=Never --port=80 --expose\n# observe that a pod as well as a service are created"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Confirm that ClusterIP has been created. Also check endpoints",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get svc web # services\nkubectl get ep # endpoints"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Get service's ClusterIP, create a temp busybox pod and 'hit' that IP with wget",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get svc web # get the IP (something like 10.108.93.130)\nkubectl run tester --rm --image=busybox -it --restart=Never --\nwget -O- [PUT THE POD'S IP ADDRESS HERE]:80\nexit"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "IP=$(kubectl get svc web --template={{.spec.clusterIP}}) # get the IP (something like 10.108.93.130)\nkubectl run tester --rm --image=busybox -it --restart=Never --env=\"IP=$IP\" -- wget -O- $IP:80 --timeout 2\n# Tip: --timeout is optional, but it helps to get answer more quickly when connection fails (in seconds vs minutes)"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Convert the ClusterIP to NodePort for the same service and find the NodePort port. Hit service using Node's IP. Delete the service and the pod at the end.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl edit svc web"
            },
            {
              "type": "code",
              "language": "yaml",
              "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: web\n  namespace: default\nspec:\n  clusterIP: 10.97.242.220\n  ports:\n  - port: 80\n    protocol: TCP\n    targetPort: 80\n  selector:\n    run: web\n  sessionAffinity: None\n  type: NodePort # change type from ClusterIP to NodePort"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl patch svc web -p '{\"spec\":{\"type\":\"NodePort\"}}' "
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get svc"
            },
            {
              "type": "code",
              "language": "text",
              "code": "# result:\nNAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE\nkubernetes   ClusterIP   10.96.0.1        <none>        443/TCP        1d\nweb          NodePort    10.107.253.138   <none>        80:31931/TCP   3m"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "wget -O- NODE_IP:31931 # if you're using Kubernetes with Docker for Windows/Mac, try 127.0.0.1\n#if you're using minikube, try minikube ip, then get the node ip such as 192.168.99.117"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl delete svc web # Deletes the service\nkubectl delete pod web # Deletes the pod"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Create a deployment called hello using image 'gcr.io/google-samples/hello-app:1.0' (a simple server that returns hostname) and 3 replicas. Label it as 'app=hello'. Declare that containers in this pod will accept traffic on port 8080 (do NOT create a service yet)",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deploy hello --image=gcr.io/google-samples/hello-app:1.0 --port=8080 --replicas=3\nkubectl label deployment hello --overwrite app=hello #This is optional since kubectl create deploy hello will create label app=hello by default"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Get the pod IPs. Create a temp busybox pod and try hitting them on port 8080",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -l app=hello -o wide # 'wide' will show pod IPs\nkubectl run tester --image=busybox --restart=Never -it --rm -- sh\nwget -O- <POD_IP>:8080 # do not try with pod name, will not work\n# try hitting all IPs generated after running 1st command to confirm that hostname is different\nexit\n# or\nkubectl get po -o wide -l app=hello | awk '{print $6}' | grep -v IP | xargs -L1 -I '{}' kubectl run --rm -i tester --restart=Never --image=busybox -- wget -O- http://\\{\\}:8080\n# or\nkubectl get po -l app=hello -o jsonpath='{range .items[*]}{.status.podIP}{\"\\n\"}{end}' | xargs -L1 -I '{}' kubectl run --rm -i tester --restart=Never --image=busybox -- wget -O- http://\\{\\}:8080"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Create a service that exposes the deployment on port 6262. Verify its existence, check the endpoints",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl expose deploy hello --port=6262 --target-port=8080\nkubectl get service hello # you will see ClusterIP as well as port 6262\nkubectl get endpoints hello # you will see the IPs of the three replica pods, listening on port 8080"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Create a temp busybox pod and connect via wget to hello service. Verify that each time there's a different hostname returned. Delete deployment and services to cleanup the cluster",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get svc # get the hello service ClusterIP\nkubectl run tester --image=busybox -it --rm --restart=Never -- sh\nwget -O- hello:6262 # DNS works! run it many times, you'll see different pods responding\nwget -O- <SERVICE_CLUSTER_IP>:6262 # ClusterIP works as well\n# you can also kubectl logs on deployment pods to see the container logs\nkubectl delete svc hello\nkubectl delete deploy hello"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "Create an nginx deployment of 2 replicas, expose it via a ClusterIP service on port 80. Create a NetworkPolicy so that only pods with labels 'access: granted' can access the pods in this deployment and apply it",
          "setup": [
            {
              "type": "ref",
              "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Services, Load Balancing, and Networking &gt; <a href=\"https://kubernetes.io/docs/concepts/services-networking/network-policies/\" target=\"_blank\" rel=\"noopener\">Network Policies</a>"
            },
            {
              "type": "quote",
              "html": "Note that network policies may not be enforced by default, depending on your k8s implementation. E.g. Azure AKS by default won't have policy enforcement, the cluster must be created with an explicit support for <code>netpol</code> (see <a href=\"https://docs.microsoft.com/en-us/azure/aks/use-network-policies#overview-of-network-policy\" target=\"_blank\" rel=\"noopener\">Azure docs</a>)."
            }
          ],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deployment secure --image=nginx --replicas=2\nkubectl expose deployment secure --port=80\nkubectl describe svc secure # see the 'app=secure' selector for the pods\n# or\nkubectl get svc secure -o yaml\nvi policy.yaml"
            },
            {
              "type": "code",
              "language": "YAML",
              "code": "kind: NetworkPolicy\napiVersion: networking.k8s.io/v1\nmetadata:\n  name: secure-allow # pick a name\nspec:\n  podSelector:\n    matchLabels:\n      app: secure # selector for the pods\n  ingress: # allow ingress traffic\n  - from:\n    - podSelector: # from pods\n        matchLabels: # with this label\n          access: granted"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# Create the NetworkPolicy\nkubectl create -f policy.yaml\n# Check if the Network Policy has been created correctly\n# make sure that your cluster's network provider supports Network Policy (https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/#before-you-begin)\nkubectl run tester --image=busybox --rm -it --restart=Never -- wget -O- http://secure:80 --timeout 2 # This should not work. --timeout is optional here. But it helps to get answer more quickly (in seconds vs minutes)\nkubectl run granted --image=busybox --rm -it --restart=Never --labels=access=granted -- wget -O- http://secure:80 --timeout 2  # This should be fine"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-9",
          "question": "Create an Ingress resource to expose an existing service using HTTP path routing",
          "setup": [
            {
              "type": "text",
              "html": "You already have:"
            },
            {
              "type": "list",
              "items": [
                "a Service secure exposing port 80"
              ]
            },
            {
              "type": "text",
              "html": "You want to expose it externally using an Ingress rule."
            },
            {
              "type": "quote",
              "html": "Note that in CKAD, you are not required to install an Ingress Controller, but you must know how to define and troubleshoot an Ingress resource and understand how it connects to a Service."
            }
          ],
          "answer": [
            {
              "type": "text",
              "html": "Verify the service exists:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get svc secure"
            },
            {
              "type": "text",
              "html": "Expected:"
            },
            {
              "type": "list",
              "items": [
                "Port: 80"
              ]
            },
            {
              "type": "text",
              "html": "If the Deployment and Service do not already exist in your practice environment, you can create them using the following commands:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deployment secure --image=nginx --port=80\nkubectl expose deployment secure --port=80"
            },
            {
              "type": "text",
              "html": "Create an Ingress resource:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "vi ingress.yaml"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: secure-ingress\nspec:\n  rules:\n  - host: secure.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: secure\n            port:\n              number: 80"
            },
            {
              "type": "text",
              "html": "Apply it:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f ingress.yaml"
            },
            {
              "type": "text",
              "html": "Verify the Ingress:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get ingress\nkubectl describe ingress secure-ingress"
            }
          ]
        }
      ]
    }
  ],
  "count": 10,
  "description": "Services, endpoints, and NodePorts.",
  "file": "f.services.md"
};
