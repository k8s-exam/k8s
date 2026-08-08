# RBAC

kubernetes.io > Documentation > Reference > API Access Control > [Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)

kubernetes.io > Documentation > Concepts > Security > [Service Accounts](https://kubernetes.io/docs/concepts/security/service-accounts/)

RBAC is the authorization layer; a **ServiceAccount** is the identity a pod runs as. A **Role**/ClusterRole says *what verbs* apply to *what resources*; a **RoleBinding**/**ClusterRoleBinding** ties a role to a subject (User, Group, or ServiceAccount). All RBAC objects are `apiGroup: rbac.authorization.k8s.io` and the current API is `rbac.authorization.k8s.io/v1` (the older `v1beta1`/`v1alpha1` are removed). Original names: `builder`, `pod-reader`, `read-pods`, `deployer`, `runner`, `secret-reader`, `secret-reader-global`, user `auditor`.

## ServiceAccounts

### Create a ServiceAccount `builder` and inspect the identity Kubernetes gives it.

<details><summary>show</summary>
<p>

```bash
kubectl create serviceaccount builder
kubectl get sa builder -o yaml
# secret at /var/run/secrets/kubernetes.io/serviceaccount/ is a projected, auto-rotated token
# (default SA in each namespace is auto-created and gets only default API-discovery rights)
```

</p>
or
<p>

```bash
# declarative form
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: builder
EOF
```

</p>
</details>

Explanation: every pod that does not set `serviceAccountName` is bound to the namespace's `default` ServiceAccount. Tokens are short-lived and rotated via the `TokenRequest` API (mounted as a projected volume), not the old long-lived secret.

## Roles and RoleBindings (namespaced)

### Grant the `builder` ServiceAccount permission to `get`, `list`, and `watch` pods in the `default` namespace, using a Role `pod-reader` and a RoleBinding `read-pods`.

<details><summary>show</summary>
<p>

```bash
# 1. define the role (verbs + resources it covers)
kubectl create role pod-reader --verb=get,list,watch --resource=pods

# 2. bind it to the ServiceAccount
kubectl create rolebinding read-pods --clusterrole=pod-reader --serviceaccount=default:builder
#   NB: --role=<role>   (namespaced)   |   --clusterrole=<clusterrole>  (binds a ClusterRole in this namespace too)
#   NB: --serviceaccount=<namespace>:<name>   (or --user=<name> / --group=<name>)

# 3. inspect
kubectl get role pod-reader -o yaml
kubectl get rolebinding read-pods -o yaml
```

</p>
</details>

The binding subject string is `<namespace>:<serviceaccount>` (`default:builder`). A Role only grants rights inside the namespace where it lives — `builder` could `get pods` in `default` but **not** in `kube-system`.

### Run a pod `runner` as the `builder` ServiceAccount and confirm the identity it uses.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: runner
spec:
  serviceAccountName: builder
  restartPolicy: Never
  containers:
  - name: runner
    image: busybox
    command: ["sleep","3600"]
EOF
kubectl get pod runner -o jsonpath='{.spec.serviceAccountName}'   # -> builder
kubectl exec runner -- ls /var/run/secrets/kubernetes.io/serviceaccount/   # token, ca.crt, namespace
```

</p>
</details>

Explanation: `kubectl run` has no `--serviceaccount` flag, so set `spec.serviceAccountName` in a manifest instead. The token file and CA are mounted for you; never embed credentials.

## ClusterRoles and verification

### Create a ClusterRole `secret-reader` (cluster-wide `get`/`list`/`watch` on secrets) and bind it to user `auditor` with a ClusterRoleBinding `secret-reader-global`.

<details><summary>show</summary>
<p>

```bash
# ClusterRole: cluster-scoped verb set on a resource
kubectl create clusterrole secret-reader --verb=get,list,watch --resource=secrets

# ClusterRoleBinding: binds a ClusterRole to a subject for the WHOLE cluster
kubectl create clusterrolebinding secret-reader-global --clusterrole=secret-reader --user=auditor

kubectl get clusterrole secret-reader -o yaml
kubectl get clusterrolebinding secret-reader-global -o yaml
```

</p>
</details>

Explanation: a `ClusterRole` can be bound at cluster scope (ClusterRoleBinding) **or** reused inside one namespace (RoleBinding) — that is why `kubectl create rolebinding --clusterrole=...` is valid above. `--user`/`--group` bind to authenticated human users/groups; `--serviceaccount` binds to a SA.

### Validate the granted abilities with `kubectl auth can-i` (no action is actually performed).

<details><summary>show</summary>
<p>

```bash
# as the builder SA in default -> should be YES (role above grants it)
kubectl auth can-i get pods --as=system:serviceaccount:default:builder
# as user auditor -> should be YES (secret-reader ClusterRoleBinding)
kubectl auth can-i list secrets --as=auditor
# as the same SA for secrets -> should be NO
kubectl auth can-i list secrets --as=system:serviceaccount:default:builder
# list everything this identity may do:
kubectl auth can-i --list --as=system:serviceaccount:default:builder
```

</p>
</details>

`can-i` returns `yes`/`no` (plus `warning:` lines for partial access) and works with `--namespace`, `--as`, `--as-group`, and `--list` — use it to sanity-check a Role/ClusterRoleBinding before trusting it.

> Reminder: the legacy pod field was `spec.serviceAccount` (singular); current clusters expect **`serviceAccountName`**. Both are accepted but `serviceAccount` is deprecated.
