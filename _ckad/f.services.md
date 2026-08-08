# Services & Networking (13%)

### Create a pod with image nginx called web and expose its port 80

<details><summary>show</summary>
<p>

```bash
kubectl run web --image=nginx --restart=Never --port=80 --expose
# observe that a pod as well as a service are created
```

</p>
</details>


### Confirm that ClusterIP has been created. Also check endpoints

<details><summary>show</summary>
<p>

```bash
kubectl get svc web # services
kubectl get ep # endpoints
```

</p>
</details>

### Get service's ClusterIP, create a temp busybox pod and 'hit' that IP with wget

<details><summary>show</summary>
<p>

```bash
kubectl get svc web # get the IP (something like 10.108.93.130)
kubectl run tester --rm --image=busybox -it --restart=Never --
wget -O- [PUT THE POD'S IP ADDRESS HERE]:80
exit
```

</p>
or
<p>

```bash
IP=$(kubectl get svc web --template={{.spec.clusterIP}}) # get the IP (something like 10.108.93.130)
kubectl run tester --rm --image=busybox -it --restart=Never --env="IP=$IP" -- wget -O- $IP:80 --timeout 2
# Tip: --timeout is optional, but it helps to get answer more quickly when connection fails (in seconds vs minutes)
```

</p>
</details>

### Convert the ClusterIP to NodePort for the same service and find the NodePort port. Hit service using Node's IP. Delete the service and the pod at the end.

<details><summary>show</summary>
<p>

```bash
kubectl edit svc web
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: default
spec:
  clusterIP: 10.97.242.220
  ports:
  - port: 80
    protocol: TCP
    targetPort: 80
  selector:
    run: web
  sessionAffinity: None
  type: NodePort # change type from ClusterIP to NodePort
```

or

```bash
kubectl patch svc web -p '{"spec":{"type":"NodePort"}}' 
```

```bash
kubectl get svc
```

```
# result:
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP   10.96.0.1        <none>        443/TCP        1d
web          NodePort    10.107.253.138   <none>        80:31931/TCP   3m
```

```bash
wget -O- NODE_IP:31931 # if you're using Kubernetes with Docker for Windows/Mac, try 127.0.0.1
#if you're using minikube, try minikube ip, then get the node ip such as 192.168.99.117
```

```bash
kubectl delete svc web # Deletes the service
kubectl delete pod web # Deletes the pod
```
</p>
</details>

### Create a deployment called hello using image 'gcr.io/google-samples/hello-app:1.0' (a simple server that returns hostname) and 3 replicas. Label it as 'app=hello'. Declare that containers in this pod will accept traffic on port 8080 (do NOT create a service yet)

<details><summary>show</summary>
<p>

```bash
kubectl create deploy hello --image=gcr.io/google-samples/hello-app:1.0 --port=8080 --replicas=3
kubectl label deployment hello --overwrite app=hello #This is optional since kubectl create deploy hello will create label app=hello by default
```
</p>
</details>

### Get the pod IPs. Create a temp busybox pod and try hitting them on port 8080

<details><summary>show</summary>
<p>


```bash
kubectl get pods -l app=hello -o wide # 'wide' will show pod IPs
kubectl run tester --image=busybox --restart=Never -it --rm -- sh
wget -O- <POD_IP>:8080 # do not try with pod name, will not work
# try hitting all IPs generated after running 1st command to confirm that hostname is different
exit
# or
kubectl get po -o wide -l app=hello | awk '{print $6}' | grep -v IP | xargs -L1 -I '{}' kubectl run --rm -i tester --restart=Never --image=busybox -- wget -O- http://\{\}:8080
# or
kubectl get po -l app=hello -o jsonpath='{range .items[*]}{.status.podIP}{"\n"}{end}' | xargs -L1 -I '{}' kubectl run --rm -i tester --restart=Never --image=busybox -- wget -O- http://\{\}:8080
```

</p>
</details>

### Create a service that exposes the deployment on port 6262. Verify its existence, check the endpoints

<details><summary>show</summary>
<p>


```bash
kubectl expose deploy hello --port=6262 --target-port=8080
kubectl get service hello # you will see ClusterIP as well as port 6262
kubectl get endpoints hello # you will see the IPs of the three replica pods, listening on port 8080
```

</p>
</details>

### Create a temp busybox pod and connect via wget to hello service. Verify that each time there's a different hostname returned. Delete deployment and services to cleanup the cluster

<details><summary>show</summary>
<p>

```bash
kubectl get svc # get the hello service ClusterIP
kubectl run tester --image=busybox -it --rm --restart=Never -- sh
wget -O- hello:6262 # DNS works! run it many times, you'll see different pods responding
wget -O- <SERVICE_CLUSTER_IP>:6262 # ClusterIP works as well
# you can also kubectl logs on deployment pods to see the container logs
kubectl delete svc hello
kubectl delete deploy hello
```

</p>
</details>

### Create an nginx deployment of 2 replicas, expose it via a ClusterIP service on port 80. Create a NetworkPolicy so that only pods with labels 'access: granted' can access the pods in this deployment and apply it

kubernetes.io > Documentation > Concepts > Services, Load Balancing, and Networking > [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

> Note that network policies may not be enforced by default, depending on your k8s implementation. E.g. Azure AKS by default won't have policy enforcement, the cluster must be created with an explicit support for `netpol` (see [Azure docs](https://docs.microsoft.com/en-us/azure/aks/use-network-policies#overview-of-network-policy)).
  
<details><summary>show</summary>
<p>

```bash
kubectl create deployment secure --image=nginx --replicas=2
kubectl expose deployment secure --port=80

kubectl describe svc secure # see the 'app=secure' selector for the pods
# or
kubectl get svc secure -o yaml

vi policy.yaml
```

```YAML
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: secure-allow # pick a name
spec:
  podSelector:
    matchLabels:
      app: secure # selector for the pods
  ingress: # allow ingress traffic
  - from:
    - podSelector: # from pods
        matchLabels: # with this label
          access: granted
```

```bash
# Create the NetworkPolicy
kubectl create -f policy.yaml

# Check if the Network Policy has been created correctly
# make sure that your cluster's network provider supports Network Policy (https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/#before-you-begin)
kubectl run tester --image=busybox --rm -it --restart=Never -- wget -O- http://secure:80 --timeout 2 # This should not work. --timeout is optional here. But it helps to get answer more quickly (in seconds vs minutes)
kubectl run granted --image=busybox --rm -it --restart=Never --labels=access=granted -- wget -O- http://secure:80 --timeout 2  # This should be fine
```

</p>
</details>

### Create an Ingress resource to expose an existing service using HTTP path routing
You already have:
- a Deployment secure
- a Service secure exposing port 80

You want to expose it externally using an Ingress rule.
> Note that in CKAD, you are not required to install an Ingress Controller, but you must know how to define and troubleshoot an Ingress resource and understand how it connects to a Service.

<details><summary>show</summary> <p>
Verify the service exists:
  
```bash
kubectl get svc secure
```
Expected:
- Type: ClusterIP
- Port: 80

If the Deployment and Service do not already exist in your practice environment, you can create them using the following commands:
```bash
kubectl create deployment secure --image=nginx --port=80
kubectl expose deployment secure --port=80
```

Create an Ingress resource:
```bash
vi ingress.yaml
```
```bash
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
spec:
  rules:
  - host: secure.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: secure
            port:
              number: 80
```
Apply it:
```bash
kubectl apply -f ingress.yaml
```

Verify the Ingress:
```bash
kubectl get ingress
kubectl describe ingress secure-ingress
```
