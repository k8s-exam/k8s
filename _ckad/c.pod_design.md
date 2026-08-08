# Pod Design (20%)

[Labels And Annotations](#labels-and-annotations)

[Deployments](#deployments)

[Jobs](#jobs)

[Cron Jobs](#cron-jobs)

## Labels and Annotations
kubernetes.io > Documentation > Concepts > Overview > Working with Kubernetes Objects > [Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#label-selectors)

### Create 3 pods with names app1,app2,app3. All of them should have the label app=v1

<details><summary>show</summary>
<p>

```bash
kubectl run app1 --image=nginx --restart=Never --labels=app=v1
kubectl run app2 --image=nginx --restart=Never --labels=app=v1
kubectl run app3 --image=nginx --restart=Never --labels=app=v1
# or
for i in `seq 1 3`; do kubectl run app$i --image=nginx --restart=Never -l app=v1 ; done
```

</p>
</details>

### Show all labels of the pods

<details><summary>show</summary>
<p>

```bash
kubectl get po --show-labels
```

</p>
</details>

### Change the labels of pod 'app2' to be app=v2

<details><summary>show</summary>
<p>

```bash
kubectl label po app2 app=v2 --overwrite
# or edit the pod yaml
kubectl edit po app2
```

</p>
</details>

### Get the label 'app' for the pods (show a column with APP labels)

<details><summary>show</summary>
<p>

```bash
kubectl get po -L app
# or
kubectl get po --label-columns=app
```

</p>
</details>

### Get only the 'app=v2' pods

<details><summary>show</summary>
<p>

```bash
kubectl get po -l app=v2
# or
kubectl get po -l 'app in (v2)'
# or
kubectl get po --selector=app=v2
```

</p>
</details>

### Get 'app=v2' and not 'tier=frontend' pods

<details><summary>show</summary>
<p>

```bash
kubectl get po -l app=v2,tier!=frontend
# or
kubectl get po -l 'app in (v2), tier notin (frontend)'
# or
kubectl get po --selector=app=v2,tier!=frontend
```

</p>
</details>

### Add a new label tier=web to all pods having 'app=v2' or 'app=v1' labels

<details><summary>show</summary>
<p>

```bash
kubectl label po -l 'app in (v1,v2)' tier=web
```
</p>
</details>


### Add an annotation 'owner: marketing' to all pods having 'app=v2' label

<details><summary>show</summary>
<p>

```bash
kubectl annotate po -l "app=v2" owner=marketing
```
</p>
</details>

### Remove the 'app' label from the pods we created before

<details><summary>show</summary>
<p>

```bash
kubectl label po app1 app2 app3 app-
# or
kubectl label po app{1..3} app-
# or
kubectl label po -l app app-
```

</p>
</details>

### Annotate pods app1, app2, app3 with "description='my description'" value

<details><summary>show</summary>
<p>


```bash
kubectl annotate po app1 app2 app3 description='my description'

#or

kubectl annotate po app{1..3} description='my description'
```

</p>
</details>

### Check the annotations for pod app1

<details><summary>show</summary>
<p>

```bash
kubectl annotate pod app1 --list

# or

kubectl describe po app1 | grep -i 'annotations'

# or

kubectl get po app1 -o custom-columns=Name:metadata.name,ANNOTATIONS:metadata.annotations.description
```

As an alternative to using `| grep` you can use jsonPath like `kubectl get po app1 -o jsonpath='{.metadata.annotations}{"\n"}'`

</p>
</details>

### Remove the annotations for these three pods

<details><summary>show</summary>
<p>

```bash
kubectl annotate po app{1..3} description- owner-
```

</p>
</details>

### Remove these pods to have a clean state in your cluster

<details><summary>show</summary>
<p>

```bash
kubectl delete po app{1..3}
```

</p>
</details>

## Pod Placement

### Create a pod that will be deployed to a Node that has the label 'accelerator=nvidia-tesla-p100'

<details><summary>show</summary>
<p>

Add the label to a node:

```bash
kubectl label nodes <your-node-name> accelerator=nvidia-tesla-p100
kubectl get nodes --show-labels
```

We can use the 'nodeSelector' property on the Pod YAML:

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: gpu-worker
spec:
  containers:
    - name: gpu-worker
      image: "registry.k8s.io/cuda-vector-add:v0.1"
  nodeSelector: # add this
    accelerator: nvidia-tesla-p100 # the selection label
```

You can easily find out where in the YAML it should be placed by:

```bash
kubectl explain po.spec
```

OR:
Use node affinity (https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/#schedule-a-pod-using-required-node-affinity)

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: gpu-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: accelerator
            operator: In
            values:
            - nvidia-tesla-p100
  containers:
    - name: gpu-affinity
      image: "registry.k8s.io/cuda-vector-add:v0.1"
```

</p>
</details>

### Create a pod that will be placed on node `node01` using `nodeName`

<details><summary>show</summary>
<p>

`nodeName` forces the Pod to be bound to a specific node (bypassing the scheduler). For more details, see the official docs: [https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pinned-pod
spec:
  nodeName: node01
  containers:
  - name: pinned-app
    image: nginx  
```

Verify which node it landed on:

```bash
kubectl get pod pinned-pod -o wide
```

</p>
</details>

### Taint a node with key `tier` and value `frontend` with the effect `NoSchedule`. Then, create a pod that tolerates this taint.

<details><summary>show</summary>
<p>

Taint a node:

```bash
kubectl taint node node1 tier=frontend:NoSchedule # key=value:Effect
kubectl describe node node1 # view the taints on a node
```

And to tolerate the taint:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tolerant-pod
spec:
  containers:
  - name: tolerant-app
    image: nginx
  tolerations:
  - key: "tier"
    operator: "Equal"
    value: "frontend"
    effect: "NoSchedule"
```

</p>
</details>

### Create a pod that will be placed on node `controlplane`. Use nodeSelector and tolerations.

<details><summary>show</summary>
<p>

```bash
vi pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ops-pod
spec:
  containers:
  - name: ops-app
    image: nginx
  nodeSelector:
    kubernetes.io/hostname: controlplane
  tolerations:
  - key: "node-role.kubernetes.io/control-plane"
    operator: "Exists"
    effect: "NoSchedule"
```

```bash
kubectl create -f pod.yaml
```

</p>
</details>

## Deployments

kubernetes.io > Documentation > Concepts > Workloads > Workload Resources > [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment)

### Create a deployment with image nginx:1.18.0, called webapp, having 2 replicas, defining port 80 as the port that this container exposes (don't create a service for this deployment)

<details><summary>show</summary>
<p>

```bash
kubectl create deployment webapp  --image=nginx:1.18.0  --dry-run=client -o yaml > deploy.yaml
vi deploy.yaml
# change the replicas field from 1 to 2
# add this section to the container spec and save the deploy.yaml file
# ports:
#   - containerPort: 80
kubectl apply -f deploy.yaml
```

or, do something like:

```bash
kubectl create deployment webapp  --image=nginx:1.18.0  --dry-run=client -o yaml | sed 's/replicas: 1/replicas: 2/g'  | sed 's/image: nginx:1.18.0/image: nginx:1.18.0\n        ports:\n        - containerPort: 80/g' | kubectl apply -f -
```

or,
```bash
kubectl create deploy webapp --image=nginx:1.18.0 --replicas=2 --port=80
```

</p>
</details>

### View the YAML of this deployment

<details><summary>show</summary>
<p>

```bash
kubectl get deploy webapp -o yaml
```

</p>
</details>

### View the YAML of the replica set that was created by this deployment

<details><summary>show</summary>
<p>

```bash
kubectl describe deploy webapp # you'll see the name of the replica set on the Events section and in the 'NewReplicaSet' property
# OR you can find rs directly by:
kubectl get rs -l run=webapp # if you created deployment by 'run' command
kubectl get rs -l app=webapp # if you created deployment by 'create' command
# you could also just do kubectl get rs
kubectl get rs webapp-7bf7478b77 -o yaml
```

</p>
</details>

### Get the YAML for one of the pods

<details><summary>show</summary>
<p>

```bash
kubectl get po # get all the pods
# OR you can find pods directly by:
kubectl get po -l run=webapp # if you created deployment by 'run' command
kubectl get po -l app=webapp # if you created deployment by 'create' command
kubectl get po webapp-7bf7478b77-gjzp8 -o yaml
```

</p>
</details>

### Check how the deployment rollout is going

<details><summary>show</summary>
<p>

```bash
kubectl rollout status deploy webapp
```

</p>
</details>

### Update the webapp image to nginx:1.19.8

<details><summary>show</summary>
<p>

```bash
kubectl set image deploy webapp nginx=nginx:1.19.8
# alternatively...
kubectl edit deploy webapp # change the .spec.template.spec.containers[0].image
```

The syntax of the 'kubectl set image' command is `kubectl set image (-f FILENAME | TYPE NAME) CONTAINER_NAME_1=CONTAINER_IMAGE_1 ... CONTAINER_NAME_N=CONTAINER_IMAGE_N [options]`

Note: the container inside the deployment is named `nginx` (kubectl names the container after the image when `kubectl create deploy webapp --image=nginx:1.18.0` is used), so the left-hand side of `set image` must be `nginx`, not `webapp` — otherwise you get `error: container webapp is not valid for deployment webapp`.

</p>
</details>

### Check the rollout history and confirm that the replicas are OK

<details><summary>show</summary>
<p>

```bash
kubectl rollout history deploy webapp
kubectl get deploy webapp
kubectl get rs # check that a new replica set has been created
kubectl get po
```

</p>
</details>

### Undo the latest rollout and verify that new pods have the old image (nginx:1.18.0)

<details><summary>show</summary>
<p>

```bash
kubectl rollout undo deploy webapp
# wait a bit
kubectl get po # select one 'Running' Pod
kubectl describe po webapp-5ff4457d65-nslcl | grep -i image # should be nginx:1.18.0
```

</p>
</details>

### Do an on-purpose update of the deployment with a wrong image nginx:1.91

<details><summary>show</summary>
<p>

```bash
kubectl set image deploy webapp nginx=nginx:1.91
# or
kubectl edit deploy webapp
# change the image to nginx:1.91
# vim tip: type (without quotes) '/image' and press Enter, to navigate quickly
```

</p>
</details>

### Verify that something's wrong with the rollout

<details><summary>show</summary>
<p>

```bash
kubectl rollout status deploy webapp
# or
kubectl get po # you'll see 'ErrImagePull' or 'ImagePullBackOff'
```

</p>
</details>


### Return the deployment to the second revision (number 2) and verify the image is nginx:1.19.8

<details><summary>show</summary>
<p>

```bash
kubectl rollout undo deploy webapp --to-revision=2
kubectl describe deploy webapp | grep Image:
kubectl rollout status deploy webapp # Everything should be OK
```

</p>
</details>

### Check the details of the fourth revision (number 4)

<details><summary>show</summary>
<p>

```bash
kubectl rollout history deploy webapp --revision=4 # You'll also see the wrong image displayed here
```

</p>
</details>

### Scale the deployment to 5 replicas

<details><summary>show</summary>
<p>

```bash
kubectl scale deploy webapp --replicas=5
kubectl get po
kubectl describe deploy webapp
```

</p>
</details>

### Autoscale the deployment, pods between 5 and 10, targeting CPU utilization at 80%

<details><summary>show</summary>
<p>

```bash
kubectl autoscale deploy webapp --min=5 --max=10 --cpu=80%
# view the horizontalpodautoscalers.autoscaling for webapp
kubectl get hpa webapp
```

</p>
</details>

### Pause the rollout of the deployment

<details><summary>show</summary>
<p>

```bash
kubectl rollout pause deploy webapp
```

</p>
</details>

### Update the image to nginx:1.19.9 and check that there's nothing going on, since we paused the rollout

<details><summary>show</summary>
<p>

```bash
kubectl set image deploy webapp nginx=nginx:1.19.9
# or
kubectl edit deploy webapp
# change the image to nginx:1.19.9
kubectl rollout history deploy webapp # no new revision
```

</p>
</details>

### Resume the rollout and check that the nginx:1.19.9 image has been applied

<details><summary>show</summary>
<p>

```bash
kubectl rollout resume deploy webapp
kubectl rollout history deploy webapp
kubectl rollout history deploy webapp --revision=6 # insert the number of your latest revision
```

</p>
</details>

### Delete the deployment and the horizontal pod autoscaler you created

<details><summary>show</summary>
<p>

```bash
kubectl delete deploy webapp
kubectl delete hpa webapp

# or
kubectl delete deploy/webapp hpa/webapp
```
</p>
</details>

### Implement canary deployment by running two instances of nginx marked as version=v1 and version=v2 so that the load is balanced at 75%-25% ratio

<details><summary>show</summary>
<p>

Deploy 3 replicas of v1:
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog-v1
  labels:
    app: catalog
spec:
  replicas: 3
  selector:
    matchLabels:
      app: catalog
      version: v1
  template:
    metadata:
      labels:
        app: catalog
        version: v1
    spec:
      containers:
      - name: web
        image: nginx
        ports:
        - containerPort: 80
        volumeMounts:
        - name: content
          mountPath: /usr/share/nginx/html
      initContainers:
      - name: pagewriter
        image: busybox:1.28
        command:
        - /bin/sh
        - -c
        - "echo version-1 > /work-dir/index.html"
        volumeMounts:
        - name: content
          mountPath: "/work-dir"
      volumes:
      - name: content
        emptyDir: {}
```

Create the service:
```
apiVersion: v1
kind: Service
metadata:
  name: catalog-svc
  labels:
    app: catalog
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 80
    targetPort: 80
  selector:
    app: catalog
```

Test if the deployment was successful from within a Pod:
```
# run a wget to the Service catalog-svc
kubectl run -it --rm --restart=Never probe --image=busybox --command -- wget -qO- catalog-svc

version-1
```

Deploy 1 replica of v2:
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog-v2
  labels:
    app: catalog
spec:
  replicas: 1
  selector:
    matchLabels:
      app: catalog
      version: v2
  template:
    metadata:
      labels:
        app: catalog
        version: v2
    spec:
      containers:
      - name: web
        image: nginx
        ports:
        - containerPort: 80
        volumeMounts:
        - name: content
          mountPath: /usr/share/nginx/html
      initContainers:
      - name: pagewriter
        image: busybox:1.28
        command:
        - /bin/sh
        - -c
        - "echo version-2 > /work-dir/index.html"
        volumeMounts:
        - name: content
          mountPath: "/work-dir"
      volumes:
      - name: content
        emptyDir: {}
```

Observe that calling the ip exposed by the service the requests are load balanced across the two versions:
```
# run a busyBox pod that will make a wget call to the service catalog-svc and print out the version of the pod it reached.
kubectl run -it --rm --restart=Never probe --image=busybox -- /bin/sh -c 'while sleep 1; do wget -qO- catalog-svc; done'

version-1
version-1
version-1
version-2
version-2
version-1
```

If the v2 is stable, scale it up to 4 replicas and shutdown the v1:
```
kubectl scale --replicas=4 deploy catalog-v2
kubectl delete deploy catalog-v1
# hit the Service from inside the cluster (its ClusterIP is not reachable from your workstation)
kubectl run probe --image=busybox --restart=Never -it --rm -- /bin/sh -c 'while sleep 1; do wget -qO- http://catalog-svc; done'
version-2
version-2
version-2
version-2
version-2
version-2
```

</p>
</details>

## Jobs

### Create a job named digits with image perl:5.34 that runs the command with arguments "perl -Mbignum=bpi -wle 'print bpi(2000)'"

<details><summary>show</summary>
<p>

```bash
kubectl create job digits --image=perl:5.34 -- perl -Mbignum=bpi -wle 'print bpi(2000)'
```

</p>
</details>

### Wait till it's done, get the output

<details><summary>show</summary>
<p>

```bash
kubectl get jobs -w # wait till 'SUCCESSFUL' is 1 (will take some time, perl image might be big)
kubectl get po # get the pod name
kubectl logs digits-**** # get the pi numbers
kubectl delete job digits
```
OR

```bash
kubectl get jobs -w # wait till 'SUCCESSFUL' is 1 (will take some time, perl image might be big)
kubectl logs job/digits
kubectl delete job digits
```
OR

```bash
kubectl wait --for=condition=complete --timeout=300s job digits
kubectl logs job/digits
kubectl delete job digits
```

</p>
</details>

### Create a job with the image busybox that executes the command 'echo hello;sleep 30;echo world'

<details><summary>show</summary>
<p>

```bash
kubectl create job beeper --image=busybox -- /bin/sh -c 'echo hello;sleep 30;echo world'
```

</p>
</details>

### Follow the logs for the pod (you'll wait for 30 seconds)

<details><summary>show</summary>
<p>

```bash
kubectl get po # find the job pod
kubectl logs beeper-ptx58 -f # follow the logs
```

</p>
</details>

### See the status of the job, describe it and see the logs

<details><summary>show</summary>
<p>

```bash
kubectl get jobs
kubectl describe jobs beeper
kubectl logs job/beeper
```

</p>
</details>

### Delete the job

<details><summary>show</summary>
<p>

```bash
kubectl delete job beeper
```

</p>
</details>

### Create the same job, make it run 5 times, one after the other. Verify its status and delete it

<details><summary>show</summary>
<p>

```bash
kubectl create job beeper --image=busybox --dry-run=client -o yaml -- /bin/sh -c 'echo hello;sleep 30;echo world' > job.yaml
vi job.yaml
```

Add job.spec.completions=5 and job.spec.completionMode=Indexed

```YAML
apiVersion: batch/v1
kind: Job
metadata:
  creationTimestamp: null
  labels:
    run: beeper
  name: beeper
spec:
  completions: 5 # add this line
  completionMode: Indexed # add this line
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: beeper
    spec:
      containers:
      - args:
        - /bin/sh
        - -c
        - echo hello;sleep 30;echo world
        image: busybox
        name: beeper
        resources: {}
      restartPolicy: OnFailure
status: {}
```

```bash
kubectl create -f job.yaml
```

Verify that it has been completed:

```bash
kubectl get job beeper -w # will take two and a half minutes
kubectl delete jobs beeper
```

</p>
</details>

### Create the same job, but make it run 5 parallel times

<details><summary>show</summary>
<p>

```bash
vi job.yaml
```

Add job.spec.parallelism=5

```YAML
apiVersion: batch/v1
kind: Job
metadata:
  creationTimestamp: null
  labels:
    run: beeper
  name: beeper
spec:
  parallelism: 5 # add this line
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: beeper
    spec:
      containers:
      - args:
        - /bin/sh
        - -c
        - echo hello;sleep 30;echo world
        image: busybox
        name: beeper
        resources: {}
      restartPolicy: OnFailure
status: {}
```

```bash
kubectl create -f job.yaml
kubectl get jobs
```

It will take some time for the parallel jobs to finish (>= 30 seconds)

```bash
kubectl delete job beeper
```

</p>
</details>

### Create a job but ensure that it will be automatically terminated by kubernetes if it takes more than 30 seconds to execute

<details><summary>show</summary>
<p>

```bash
kubectl create job beeper --image=busybox --dry-run=client -o yaml -- /bin/sh -c 'while true; do echo hello; sleep 10;done' > job.yaml
vi job.yaml
```

Add job.spec.activeDeadlineSeconds=30

```bash
apiVersion: batch/v1
kind: Job
metadata:
  creationTimestamp: null
  labels:
    run: beeper
  name: beeper
spec:
  activeDeadlineSeconds: 30 # add this line
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: beeper
    spec:
      containers:
      - args:
        - /bin/sh
        - -c
        - while true; do echo hello; sleep 10;done
        image: busybox
        name: beeper
        resources: {}
      restartPolicy: OnFailure
status: {}
```
</p>
</details>

## Cron jobs

kubernetes.io > Documentation > Tasks > Run Jobs > [Running Automated Tasks with a CronJob](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/)

### Create a cron job with image busybox that runs on a schedule of "*/1 * * * *" and writes 'date; echo Hello from the Kubernetes cluster' to standard output

<details><summary>show</summary>
<p>

```bash
kubectl create cronjob ticker --image=busybox --schedule="*/1 * * * *" -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster'
```

</p>
</details>

### See its logs and delete it

<details><summary>show</summary>
<p>

```bash
kubectl get po # copy the ID of the pod whose container was just created
kubectl logs <ticker-***> # you will see the date and message 
kubectl delete cj ticker # cj stands for cronjob
```

</p>
</details>

### Create the same cron job again, and watch the status. Once it ran, check which job ran by the created cron job. Check the log, and delete the cron job

<details><summary>show</summary>
<p>

```bash
kubectl get cj
kubectl get jobs --watch
kubectl get po --show-labels # observe that the pods have a label that mentions their 'parent' job
kubectl logs ticker-1529745840-m867r
# Bear in mind that Kubernetes will run a new job/pod for each new cron job
kubectl delete cj ticker
```

</p>
</details>

### Create a cron job with image busybox that runs every minute and writes 'date; echo Hello from the Kubernetes cluster' to standard output. The cron job should be terminated if it takes more than 17 seconds to start execution after its scheduled time (i.e. the job missed its scheduled time).

<details><summary>show</summary>
<p>

```bash
kubectl create cronjob deadline-job --image=busybox --restart=Never --dry-run=client --schedule="* * * * *" -o yaml -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster' > deadline-job.yaml
vi deadline-job.yaml
```
Add cronjob.spec.startingDeadlineSeconds=17

```bash
apiVersion: batch/v1
kind: CronJob
metadata:
  creationTimestamp: null
  name: deadline-job
spec:
  startingDeadlineSeconds: 17 # add this line
  jobTemplate:
    metadata:
      creationTimestamp: null
      name: deadline-job
    spec:
      template:
        metadata:
          creationTimestamp: null
        spec:
          containers:
          - args:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
            image: busybox
            name: deadline-job
            resources: {}
          restartPolicy: Never
  schedule: '* * * * *'
status: {}
```

</p>
</details>

### Create a cron job with image busybox that runs every minute and writes 'date; echo Hello from the Kubernetes cluster' to standard output. The cron job should be terminated if it successfully starts but takes more than 12 seconds to complete execution.

<details><summary>show</summary>
<p>

```bash
kubectl create cronjob deadline-job --image=busybox --restart=Never --dry-run=client --schedule="* * * * *" -o yaml -- /bin/sh -c 'date; echo Hello from the Kubernetes cluster' > deadline-job.yaml
vi deadline-job.yaml
```
Add cronjob.spec.jobTemplate.spec.activeDeadlineSeconds=12

```bash
apiVersion: batch/v1
kind: CronJob
metadata:
  creationTimestamp: null
  name: deadline-job
spec:
  jobTemplate:
    metadata:
      creationTimestamp: null
      name: deadline-job
    spec:
      activeDeadlineSeconds: 12 # add this line
      template:
        metadata:
          creationTimestamp: null
        spec:
          containers:
          - args:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
            image: busybox
            name: deadline-job
            resources: {}
          restartPolicy: Never
  schedule: '* * * * *'
status: {}
```

</p>
</details>

### Keep only the last 2 successful and 1 failed runs of a CronJob

<details><summary>show</summary> <p>

Create a CronJob with history limits configured:
```bash
kubectl create cronjob history-job \
  --image=busybox \
  --schedule="*/1 * * * *" \
  --dry-run=client -o yaml \
  -- /bin/sh -c 'date; echo Hello from history demo' > history-job.yaml
```

Edit the file:

```bash
vi history-job.yaml
```

Add the following fields under spec:

```bash
apiVersion: batch/v1
kind: CronJob
metadata:
  name: history-job
spec:
  schedule: "*/1 * * * *"
  successfulJobsHistoryLimit: 2   # keep last 2 successful jobs
  failedJobsHistoryLimit: 1        # keep last 1 failed job
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: history-job
            image: busybox
            args:
            - /bin/sh
            - -c
            - date; echo Hello from history demo
          restartPolicy: Never
```

Apply the CronJob:
```bash
kubectl apply -f history-job.yaml
```

Verify job history behavior:

```bash
kubectl get cj history-job
kubectl get jobs --watch
```

After several runs, confirm that:
- Only 2 successful Jobs are kept
- Only 1 failed Job is kept (if failures occur)

Clean up:
```bash
kubectl delete cj history-job
```
</p> </details>

### Create a job from cronjob.

<details><summary>show</summary>
<p>

```bash
kubectl create job --from=cronjob/ticker manual-run
```
</p>
</details>
