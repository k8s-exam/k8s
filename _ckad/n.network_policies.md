# Network Policies

kubernetes.io > Documentation > Concepts > Services, Load Balancing, and Networking > [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)

> **Prerequisite:** NetworkPolicies are only enforced when the cluster's CNI plugin supports them. Creating the resource does nothing on a cluster whose network plugin ignores it. Use original names `api`, `api-allow-ingress`, `api-egress`, `tester`, `granted`, namespace `trusted`.

## Allow / deny by label

### Create a Deployment `api` of nginx (2 replicas) with label `app=api` and expose it on port 80 with a ClusterIP Service `api`.

<details><summary>show</summary>
<p>

```bash
kubectl create deployment api --image=nginx --port=80   # creates pods with label app=api
kubectl expose deployment api --port=80   # ClusterIP Service `api`
kubectl get deploy,svc api
```

</p>
</details>

Explanation: `app=api` is the label the NetworkPolicy will select. The deployment is auto-labelled by `create deployment` (it sets `app: <name>`), but the explicit `kubectl label` makes the selector explicit and matches what the policy targets.

### Create a NetworkPolicy `api-allow-ingress` that isolates pods `app=api` for ingress and allows traffic to port 80 **only** from pods labelled `access=granted`.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-ingress
spec:
  podSelector:
    matchLabels:
      app: api                      # this policy applies to the api pods
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              access: granted
      ports:
        - protocol: TCP
          port: 80
EOF
kubectl describe netpol api-allow-ingress
```

</p>
</details>

Explanation: as soon as **any** NetworkPolicy selects a pod with `Ingress` in `policyTypes`, that pod becomes **isolated for ingress** — only the `ingress` rules listed below are allowed, everything else is denied. `from.podSelector` is namespace-scoped: it matches pods in the **same namespace** as the policy.

### Verify the policy: `tester` (no label) cannot reach `api:80`, while `granted` (label `access=granted`) can.

<details><summary>show</summary>
<p>

```bash
kubectl run granted --image=busybox --restart=Never --labels=access=granted -- sleep 3600
kubectl run tester  --image=busybox --restart=Never -- sleep 3600

kubectl exec tester -- wget -qO- --timeout=2 http://api:80 ; echo "exit=$?"   # blocked
kubectl exec granted -- wget -qO- --timeout=2 http://api:80 ; echo "exit=$?"  # ok
```

</p>
</details>

Expected: the `tester` call times out / is blocked (`wget` returns non-zero), the `granted` call succeeds. The two `--timeout`/`echo` lines make the pass/fail visible side by side.

## Namespace and IP-based rules

### Also allow ingress to `app=api` from every pod in the `trusted` namespace (selected by the label `env=trusted`), and verify.

<details><summary>show</summary>
<p>

```bash
# label the namespace (network policies target namespace OBJECTS, which need a label)
kubectl create namespace trusted
kubectl label namespace trusted env=trusted

# add the namespace as an allowed source on the api pods
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-ingress
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              access: granted
        - namespaceSelector:
            matchLabels:
              env: trusted
      ports:
        - protocol: TCP
          port: 80
EOF
```

</p>
</details>

Explanation: a single `from` entry may list **both** a `namespaceSelector` and a `podSelector` (then it means "pods matching podSelector that live in namespaces matching namespaceSelector"); putting them as **separate list items** (one `namespaceSelector`, one `podSelector`) means "pods with `access=granted` in this namespace, **or** any pod in a namespace labelled `env=trusted`". To target a namespace **by name** directly, use the built-in label `kubernetes.io/metadata.name: <ns>`:
```
namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: trusted}}
```

### Add an egress rule so `app=api` pods may only reach `10.0.0.0/8` on TCP 443, and block everything else.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-egress
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Egress
  egress:
    - to:
        - ipBlock:
            cidr: 10.0.0.0/8
      ports:
        - protocol: TCP
          port: 443
EOF
kubectl get netpol
kubectl describe netpol api-egress
```

</p>
</details>

Explanation: `policyTypes: [Egress]` isolates the pod for **egress**; the only allowed egress is `10.0.0.0/8:443` (optionally excluding a sub-range with `ipBlock.except`). Because egress is now isolated, **all other** egress — including DNS to the cluster's `kube-dns` service — is denied; if the workload needs DNS, add a second egress rule for the CoreDNS ClusterIP/port 53 UDP.

> Note: NetworkPolicies apply only to **pod IP** traffic, never to traffic originating on the node where the pod runs (including `hostNetwork` pods) unless the plugin explicitly supports it.
