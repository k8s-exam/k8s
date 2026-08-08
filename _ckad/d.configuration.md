# Configuration (18%)

[ConfigMaps](#configmaps)

[SecurityContext](#securitycontext)

[Resource Requests and Limits](#resource-requests-and-limits)

[Limit Ranges](#limit-ranges)

[Resource Quotas](#resource-quotas)

[Secrets](#secrets)

[ServiceAccounts](#serviceaccounts)

<br>#Tips, export to variable<br>
<br>export ns="-n vault"</br>
<br>export do="--dry-run=client -oyaml"</br>
## ConfigMaps

kubernetes.io > Documentation > Tasks > Configure Pods and Containers > [Configure a Pod to Use a ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/)

### Create a configmap named brioche with values flour=strong,rise=slow

<details><summary>show</summary>
<p>

```bash
kubectl create configmap brioche --from-literal=flour=strong --from-literal=rise=slow
```

</p>
</details>

### Display its values

<details><summary>show</summary>
<p>

```bash
kubectl get cm brioche -o yaml
# or
kubectl describe cm brioche
```

</p>
</details>

### Create and display a configmap from a file

Create the file with

```bash
echo -e "crumb=airy\ncrust=crisp" > batch.txt
```

<details><summary>show</summary>
<p>

```bash
kubectl create cm baguette --from-file=batch.txt
kubectl get cm baguette -o yaml
```

</p>
</details>

### Create and display a configmap from a .env file

Create the file with the command

```bash
echo -e "butter=many\n# this is a comment\n\nfold=triple\n#anothercomment" > mise.env
```

<details><summary>show</summary>
<p>

```bash
kubectl create cm croissant --from-env-file=mise.env
kubectl get cm croissant -o yaml
```

</p>
</details>

### Create and display a configmap from a file, giving the key 'starter'

Create the file with

```bash
echo -e "tang=sharp\nchew=slow" > loaf.txt
```

<details><summary>show</summary>
<p>

```bash
kubectl create cm sourdough --from-file=starter=loaf.txt
kubectl describe cm sourdough
kubectl get cm sourdough -o yaml
```

</p>
</details>

### Create a configMap called 'focaccia' with the value topping=rosemary. Create a new nginx pod that loads the value from key 'topping' in an env variable called 'TOPPING'

<details><summary>show</summary>
<p>

```bash
kubectl create cm focaccia --from-literal=topping=rosemary
kubectl run chef --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: chef
  name: chef
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: chef
    resources: {}
    env:
    - name: TOPPING # name of the env variable
      valueFrom:
        configMapKeyRef:
          name: focaccia # name of config map
          key: topping # name of the entity in config map
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl exec -it chef -- env | grep TOPPING # will show 'TOPPING=rosemary'
```

</p>
</details>

### Create a configMap 'pita' with values 'pocket=deep', 'warm=yes'. Load this configMap as env variables into a new nginx pod

<details><summary>show</summary>
<p>

```bash
kubectl create configmap pita --from-literal=pocket=deep --from-literal=warm=yes
kubectl run baker --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: baker
  name: baker
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: baker
    resources: {}
    envFrom: # different than previous one, that was 'env'
    - configMapRef: # different from the previous one, was 'configMapKeyRef'
        name: pita # the name of the config map
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl exec -it baker -- env 
```

</p>
</details>

### Create a configMap 'bagel' with values 'core=chewy', 'sheen=gloss'. Load this as a volume inside an nginx pod on path '/etc/config'. Create the pod and 'ls' into the '/etc/config' directory.

<details><summary>show</summary>
<p>

```bash
kubectl create configmap bagel --from-literal=core=chewy --from-literal=sheen=gloss
kubectl run oven --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: oven
  name: oven
spec:
  volumes: # add a volumes list
  - name: bread # just a name, you'll reference this in the pods
    configMap:
      name: bagel # name of your configmap
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: oven
    resources: {}
    volumeMounts: # your volume mounts are listed here
    - name: bread # the name that you specified in pod.spec.volumes.name
      mountPath: /etc/config # the path inside your container
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl exec -it oven -- /bin/sh
cd /etc/config
ls # will show core sheen
cat core # will show chewy
```

</p>
</details>

## SecurityContext

kubernetes.io > Documentation > Tasks > Configure Pods and Containers > [Configure a Security Context for a Pod or Container](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)

### Create the YAML for an nginx pod that runs with the user ID 101. No need to create the pod

<details><summary>show</summary>
<p>

```bash
kubectl run sandbox --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: sandbox
  name: sandbox
spec:
  securityContext: # insert this line
    runAsUser: 101 # UID for the user
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: sandbox
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

</p>
</details>


### Create the YAML for an nginx pod that has the capabilities "NET_ADMIN", "SYS_TIME" added to its single container

<details><summary>show</summary>
<p>

```bash
kubectl run elevated --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: elevated
  name: elevated
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: elevated
    securityContext: # insert this line
      capabilities: # and this
        add: ["NET_ADMIN", "SYS_TIME"] # this as well
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

</p>
</details>

## Resource requests and limits

kubernetes.io > Documentation > Tasks > Configure Pods and Containers > [Assign CPU Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/)

### Create an nginx pod with requests cpu=100m,memory=256Mi and limits cpu=200m,memory=512Mi

<details><summary>show</summary>
<p>

```bash
kubectl run server --image=nginx --restart=Never --dry-run=client -o yaml > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: server
  name: server
spec:
  containers:
  - image: nginx
    name: server
    resources:
      requests:
        memory: "256Mi"
        cpu: "100m"
      limits:    
        memory: "512Mi"
        cpu: "200m"
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
``` 

</p>
</details>

## Limit Ranges
kubernetes.io > Documentation > Concepts > Policies > Limit Ranges (https://kubernetes.io/docs/concepts/policy/limit-range/)

### Create a namespace named bounds with a LimitRange that limits pod memory to a max of 500Mi and min of 100Mi

<details><summary>show</summary>
<p>

```bash
kubectl create ns bounds
```

vi mem-limit.yaml
```YAML
apiVersion: v1
kind: LimitRange
metadata:
  name: mem-bounds
  namespace: bounds
spec:
  limits:
  - max: # max and min define the limit range
      memory: "500Mi"
    min:
      memory: "100Mi"
    type: Pod
```

```bash
kubectl apply -f mem-limit.yaml
```
</p>
</details>

### Describe the namespace bounds

<details><summary>show</summary>
<p>

```bash
kubectl describe ns bounds
# and, to see the enforced values of the LimitRange:
kubectl describe limitrange mem-bounds -n bounds
```
</p>
</details>

### Create an nginx pod that requests 250Mi of memory in the bounds namespace

<details><summary>show</summary>
<p>

vi app.yaml
```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: app
  name: app
  namespace: bounds
spec:
  containers:
  - image: nginx
    name: app
    resources:
      requests:
        memory: "250Mi"
      limits:
        memory: "500Mi" # limit has to be specified and be <= limitrange
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
``` 

```bash
kubectl apply -f app.yaml
```
</p>
</details>


## Resource Quotas
kubernetes.io > Documentation > Concepts > Policies > Resource Quotas (https://kubernetes.io/docs/concepts/policy/resource-quotas/)

### Create ResourceQuota in namespace `billing` with hard requests `cpu=1`, `memory=1Gi` and hard limits `cpu=2`, `memory=2Gi`.

<details><summary>show</summary>
<p>

Create the namespace:
```bash
kubectl create ns billing
```

Create the ResourceQuota
```bash
vi budget.yaml
```

```YAML
apiVersion: v1
kind: ResourceQuota
metadata:
  name: budget
  namespace: billing
spec:
  hard:
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
```

```bash
kubectl apply -f budget.yaml
```

or
```bash
kubectl create quota budget --namespace=billing --hard=requests.cpu=1,requests.memory=1Gi,limits.cpu=2,limits.memory=2Gi
```
</p>
</details>

### Attempt to create a pod with resource requests `cpu=2`, `memory=3Gi` and limits `cpu=3`, `memory=4Gi` in namespace `billing`

<details><summary>show</summary>
<p>

```bash
vi invoice.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: invoice
  name: invoice
  namespace: billing
spec:
  containers:
  - image: nginx
    name: invoice
    resources:
      requests:
        memory: "3Gi"
        cpu: "2"
      limits:
        memory: "4Gi"
        cpu: "3"
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```

```bash
kubectl create -f invoice.yaml
```

Expected error message:
```bash
Error from server (Forbidden): error when creating "invoice.yaml": pods "invoice" is forbidden: exceeded quota: budget, requested: limits.cpu=3,limits.memory=4Gi,requests.cpu=2,requests.memory=3Gi, used: limits.cpu=0,limits.memory=0,requests.cpu=0,requests.memory=0, limited: limits.cpu=2,limits.memory=2Gi,requests.cpu=1,requests.memory=1Gi
```
</p>
</details>

### Create a pod with resource requests `cpu=0.5`, `memory=1Gi` and limits `cpu=1`, `memory=2Gi` in namespace `billing`

<details><summary>show</summary>
<p>

```bash
vi receipt.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: receipt
  name: receipt
  namespace: billing
spec:
  containers:
  - image: nginx
    name: receipt
    resources:
      requests:
        memory: "1Gi"
        cpu: "0.5"
      limits:
        memory: "2Gi"
        cpu: "1"
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```

```bash
kubectl create -f receipt.yaml
```

Show the ResourceQuota usage in namespace `billing`
```bash
kubectl get resourcequota -n billing
```

```
NAME     AGE   REQUEST                                          LIMIT
budget   10m   requests.cpu: 500m/1, requests.memory: 1Gi/1Gi   limits.cpu: 1/2, limits.memory: 2Gi/2Gi
```
</p>
</details>


## Secrets

kubernetes.io > Documentation > Concepts > Configuration > [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

kubernetes.io > Documentation > Tasks > Inject Data Into Applications > [Distribute Credentials Securely Using Secrets](https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/)

### Create a secret called gateway with the values password=swordfish

<details><summary>show</summary>
<p>

```bash
kubectl create secret generic gateway --from-literal=password=swordfish
```

</p>
</details>

### Create a secret called creds that gets key/value from a file

Create a file called user with the value admin:

```bash
echo -n admin > user
```

<details><summary>show</summary>
<p>

```bash
kubectl create secret generic creds --from-file=user
```

</p>
</details>

### Get the value of creds

<details><summary>show</summary>
<p>

```bash
kubectl get secret creds -o yaml
echo -n YWRtaW4= | base64 -d # on MAC it is -D, which decodes the value and shows 'admin'
```

Alternative using `--jsonpath`:

```bash
kubectl get secret creds -o jsonpath='{.data.user}' | base64 -d  # on MAC it is -D
```

Alternative using `--template`:

```bash
kubectl get secret creds --template '{{.data.user}}' | base64 -d  # on MAC it is -D
```

Alternative using `jq`:

```bash
kubectl get secret creds -o json | jq -r .data.user | base64 -d  # on MAC it is -D
```

</p>
</details>

### Create an nginx pod that mounts the secret creds in a volume on path /etc/creds

<details><summary>show</summary>
<p>

```bash
kubectl run reader --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: reader
  name: reader
spec:
  volumes: # specify the volumes
  - name: creds # this name will be used for reference inside the container
    secret: # we want a secret
      secretName: creds # name of the secret - this must already exist on pod creation
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: reader
    resources: {}
    volumeMounts: # our volume mounts
    - name: creds # name on pod.spec.volumes
      mountPath: /etc/creds #our mount path
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl exec -it reader -- /bin/bash
ls /etc/creds  # shows user
cat /etc/creds/user # shows admin
```

</p>
</details>

### Delete the pod you just created and mount the variable 'user' from secret creds onto a new nginx pod in env variable called 'USER'

<details><summary>show</summary>
<p>

```bash
kubectl delete po reader
kubectl run env-consumer --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: env-consumer
  name: env-consumer
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: env-consumer
    resources: {}
    env: # our env variables
    - name: USER # asked name
      valueFrom:
        secretKeyRef: # secret reference
          name: creds # our secret's name
          key: user # the key of the data in the secret
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl exec -it env-consumer -- env | grep USER | cut -d '=' -f 2 # will show 'admin'
```

</p>
</details>

### Create a Secret named 'external-api' in the namespace 'vault'. Then, provide the key-value pair API_KEY=LmWfRzVnYxQaKdCjTuShPeObIgXcQ as literal.

<details><summary>show</summary>
<p>

```bash
kubectl create namespace vault # make sure the namespace exists first
export ns="-n vault"
export do="--dry-run=client -oyaml"
k create secret generic external-api --from-literal=API_KEY=LmWfRzVnYxQaKdCjTuShPeObIgXcQ $ns $do > sc.yaml
k apply -f sc.yaml
```

</p>
</details>

### Consuming the Secret. Create a Pod named 'fetcher' with the image 'nginx' in the namespace 'vault' and consume the Secret as an environment variable. Then, open an interactive shell to the Pod, and print all environment variables.
<details><summary>show</summary>
<p>

```bash
export ns="-n vault"
export do="--dry-run=client -oyaml"
k run fetcher --image=nginx --restart=Never $ns $do > nginx.yaml
vi nginx.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: fetcher
  name: fetcher
  namespace: vault
spec:
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: fetcher
    resources: {}
    env:
    - name: API_KEY
      valueFrom:
        secretKeyRef:
          name: external-api
          key: API_KEY
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
k create $ns -f nginx.yaml
k exec -it $ns fetcher -- /bin/sh
#env
```
</p>
</details>

### Create a Secret named 'ssh-key' of type 'kubernetes.io/ssh-auth' in the namespace 'vault'. Define a single key named 'ssh-privatekey', and point it to the file 'id_rsa' in this directory.
<details><summary>show</summary>
<p>

```bash
#Tips, export to variable
export do="--dry-run=client -oyaml"
export ns="-n vault"

#if id_rsa file didn't exist, generate it in the CURRENT directory (--from-file looks here):
ssh-keygen -t rsa -f id_rsa -N ""

k create secret generic ssh-key $ns --type="kubernetes.io/ssh-auth" --from-file=ssh-privatekey=id_rsa $do > sc.yaml
k apply -f sc.yaml
```
</p>
</details>

### Create a Pod named 'agent' with the image 'nginx' in the namespace 'vault', and consume the Secret as Volume. Mount the Secret as Volume to the path /var/app with read-only access. Open an interactive shell to the Pod, and render the contents of the file.
<details><summary>show</summary>
<p>

```bash
#Tips, export to variable
export ns="-n vault"
export do="--dry-run=client -oyaml"
k run agent --image=nginx --restart=Never $ns $do > nginx.yaml
vi nginx.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: agent
  name: agent
  namespace: vault
spec:
  containers:
    - image: nginx
      imagePullPolicy: IfNotPresent
      name: agent
      resources: {}
      volumeMounts:
        - name: sshkey
          mountPath: "/var/app"
          readOnly: true
  volumes:
    - name: sshkey
      secret:
        secretName: ssh-key
        optional: true
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
k exec -it $ns agent -- /bin/sh
# cat /var/app/ssh-privatekey
# exit
```
</p>
</details>

## ServiceAccounts

kubernetes.io > Documentation > Tasks > Configure Pods and Containers > [Configure Service Accounts for Pods](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/)

### See all the service accounts of the cluster in all namespaces

<details><summary>show</summary>
<p>

```bash
kubectl get sa --all-namespaces
```
Alternatively 

```bash
kubectl get sa -A
```

</p>
</details>

### Create a new serviceaccount called 'builder'

<details><summary>show</summary>
<p>

```bash
kubectl create sa builder
```

Alternatively:

```bash
# let's get a template easily
kubectl get sa default -o yaml > sa.yaml
vim sa.yaml
```

```YAML
apiVersion: v1
kind: ServiceAccount
metadata:
  name: builder
```

```bash
kubectl create -f sa.yaml
```

</p>
</details>

### Create an nginx pod that uses 'builder' as a service account

<details><summary>show</summary>
<p>

```bash
kubectl run runner --image=nginx --restart=Never -o yaml --dry-run=client > pod.yaml
vi pod.yaml
```

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: runner
  name: runner
spec:
  serviceAccountName: builder # we use pod.spec.serviceAccountName
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: runner
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

or

```YAML
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: runner
  name: runner
spec:
  serviceAccount: builder # deprecated alias for pod.spec.serviceAccountName
  containers:
  - image: nginx
    imagePullPolicy: IfNotPresent
    name: runner
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

```bash
kubectl create -f pod.yaml
kubectl get pod runner -o jsonpath='{.spec.serviceAccountName}' # output: builder

kubectl exec -it runner -- cat /var/run/secrets/kubernetes.io/serviceaccount/token # to check if the ServiceAccount token is mounted inside the Pod. Starting from Kubernetes 1.24+, the token is dynamically projected into the Pod

```

</p>
</details>

### Generate an API token for the service account 'builder'

<details><summary>show</summary>
<p>
  
```bash
kubectl create token builder
```

</p>
</details>
