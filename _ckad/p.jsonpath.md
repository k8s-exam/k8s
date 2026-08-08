# Jsonpath

kubernetes.io > Documentation > Reference > Command line tool (kubectl) > [JSONPath Support](https://kubernetes.io/docs/reference/kubectl/jsonpath/)

kubernetes.io > Documentation > Reference > Command line tool (kubectl) > [kubectl Quick Reference](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

`kubectl -o jsonpath` and `-o custom-columns` let you extract exactly the columns you want. JSONPath operators supported by kubectl: `$` / `.name` / `['name']` / `[n]` / `[start:end:step]` / `[*]` / `[?(expr)]` / `..` / `@`. **Regex is not supported** — pipe through `jq`/`grep` instead. Custom columns live in `kubectl get` and accept `NAME:.metadata.name`.

## JSONPath queries (`-o jsonpath`)

### Create a busybox pod `walker` so there is data to query, plus list the objects you will inspect.

<details><summary>show</summary>
<p>

```bash
kubectl run walker --image=busybox --restart=Never -- sleep 3600
kubectl get pods -n kube-system                   # there should also be kube-system pods
kubectl get nodes
```

</p>
</details>

### Print just the names of every pod in the default namespace (no `NAME` header, no `STATUS` noise).

<details><summary>show</summary>
<p>

```bash
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
```

</p>
or
<p>
one name per line:

```bash
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}'
```

</p>
</details>

Explanation: `.items[*].metadata.name` maps over all items. The `{range …}{…}{"\n"}{end}` form is the standard k8s way to get one-field-per-line output; it is the idiom most CKAD/CKA answers look for.

### Show each pod's name and IP, tab-separated, for every pod in the cluster.

<details><summary>show</summary>
<p>

```bash
kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{"."}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}'
# or just the default namespace:
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}'
```

</p>
</details>

### List only the pods that are `Running` (use a JSONPath filter).

<details><summary>show</summary>
<p>

```bash
kubectl get pods -o jsonpath='{range .items[?(@.status.phase=="Running")]}{.metadata.name}{"\n"}{end}'
# the same as a one-liner (no newline between names):
kubectl get pods -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}'
```

</p>
</details>

Explanation: `[?(@.status.phase=="Running")]` is a filter; `@` is the current item. (k8s JSONPath supports comparisons inside `[?()]` but **not** regex like `[?(@.metadata.name=~/^walker/)]`.)

### Print the control-plane role label of every node, plus its kubelet version.

<details><summary>show</summary>
<p>

```bash
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.nodeInfo.kubeletVersion}{"\t"}{.metadata.labels.node-role\.kubernetes\.io/control-plane}{"\n"}{end}'
```

Note: because the label key `node-role.kubernetes.io/control-plane` contains dots, the bracket form `labels["node-role.kubernetes.io/control-plane"]` is **not** valid here (kubectl errors with `invalid array index`) — escape the dots as `labels.node-role\.kubernetes\.io/control-plane`. On a control-plane node the value is the empty string, so nothing prints after the version; a worker node simply has no such label.

</p>
</details>

## Custom columns (`-o custom-columns`)

### Show a pods table with `NAME`, the node it runs on, its IP, and restart count.

<details><summary>show</summary>
<p>

```bash
kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP,RESTARTS:.status.containerStatuses[0].restartCount
```

</p>
or
<p>
the same with a single quoted expression:

```bash
kubectl get pods -o=custom-columns='NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP,RESTARTS:.status.containerStatuses[0].restartCount'
```

</p>
</details>

Explanation: custom-columns takes `HEADER:JSONPATH` pairs separated by commas. Field paths starting with `.` are relative to each item in `.items;` you can also index (`.containerStatuses[0]`).

### Show a nodes table with `NAME`, Kubernetes version, OS image, and internal IP.

<details><summary>show</summary>
<p>

```bash
kubectl get nodes -o custom-columns='NAME:.metadata.name,VERSION:.status.nodeInfo.kubeletVersion,OS-IMAGE:.status.nodeInfo.osImage,INTERNAL-IP:.status.addresses[?(@.type=="InternalIP")].address'
```

Note: a node's IP-address entries use the field `.address` (not `.ip` — `.ip` yields `<none>`), and because custom-columns evaluates each expression relative to a single item, quote the whole `-o custom-columns=...` argument in single quotes so your shell does not glob-expand the `[?()]` filter.

</p>
</details>

### Use a custom-columns **file** instead of an inline expression.

<details><summary>show</summary>
<p>

First create `columns.txt` (one header line, one field-path line, whitespace separated):

```text
NAME  IP
metadata.name  status.podIP
```

```bash
kubectl get pods -o custom-columns-file=columns.txt
```

</p>
</details>

Explanation: `-o custom-columns-file=<file>` reads the `NAME` → `path` mapping from a file, which is handy for long column lists. The field paths use the **same** JSONPath notation as `-o jsonpath`, just without the surrounding `{ … }`.

> Tip: `kubectl get --sort-by=.metadata.name` is the lightweight sort equivalent and does **not** go through custom-columns.
