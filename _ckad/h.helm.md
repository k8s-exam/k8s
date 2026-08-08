# Helm

- Note: Helm is part of the new CKAD syllabus. Here are a few examples of using Helm to manage Kubernetes.

## Helm in K8s

### Creating a basic Helm chart

<details><summary>show</summary>
<p>

```bash
helm create weather ## this would create a new chart skeleton named weather
```

</p>
</details>

### Running a Helm chart

<details><summary>show</summary>
<p>

```bash
helm install -f myvalues.yaml forecast ./weather
```

</p>
</details>

### Find pending Helm deployments on all namespaces

<details><summary>show</summary>
<p>

```bash
helm list --pending -A
```

</p>
</details>

### Uninstall a Helm release

<details><summary>show</summary>
<p>

```bash
helm uninstall -n ops forecast
```

</p>
</details>

### Upgrading a Helm chart

<details><summary>show</summary>
<p>

```bash
helm upgrade -f myvalues.yaml -f override.yaml forecast ./weather
```

</p>
</details>

### Using Helm repo

<details><summary>show</summary>
<p>

Add, list, remove, update and index chart repos

```bash
helm repo add [NAME] [URL]  [flags]

helm repo list / helm repo ls

helm repo remove [REPO1] [flags]

helm repo update / helm repo up

helm repo update [REPO1] [flags]

helm repo index [DIR] [flags]
```

</p>
</details>

### Download a Helm chart from a repository 

<details><summary>show</summary>
<p>

```bash
helm pull [chart URL | repo/chartname] [...] [flags] ## this would download a chart, not install it
helm pull --untar repo/chartname # untar the chart after downloading it 
```

</p>
</details>

### Add the Bitnami repo at https://charts.bitnami.com/bitnami to Helm
<details><summary>show</summary>
<p>
    
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```
  
</p>
</details>

### Write the contents of the values.yaml file of the `bitnami/node` chart to standard output
<details><summary>show</summary>
<p>
    
```bash
helm show values bitnami/node
```
  
</p>
</details>

### Install the `bitnami/node` chart setting the number of replicas to 5
<details><summary>show</summary>
<p>

To achieve this, we need two key pieces of information:
- The name of the attribute in values.yaml which controls replica count
- A simple way to set the value of this attribute during installation

To identify the name of the attribute in the values.yaml file, we could get all the values, as in the previous task, and then grep to find attributes matching the pattern `replica`
```bash
helm show values bitnami/node | grep -i replica
```
which returns
```bash
## @param replicaCount Specify the number of replicas for the application
replicaCount: 1
```
 
We can use the `--set` argument during installation to override attribute values. Hence, to set the replica count to 5, we need to run
```bash
helm install forecast bitnami/node --set replicaCount=5
```

> **Cluster/pull pitfall.** This chart (pinned to old `debian-11-r*` tags) pulls a `bitnami/git` **init container** (`git-clone-repository`) plus a `bitnami/mongodb` dependency. Those old tags have been removed from Docker Hub (Bitnami now ships `sha256-…`-style tags), so on a cluster with no registry access the install can fail with `ImagePullBackOff`/`ErrImagePull` on the init container — the release deploys but never becomes Ready. To verify the helm mechanics alone, `helm template forecast bitnami/node --set replicaCount=5` still renders the 5-replica Deployment (that's what the exam checks); only the running install needs the images.

</p>
</details>
