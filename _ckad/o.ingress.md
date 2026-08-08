# Ingress

kubernetes.io > Documentation > Concepts > Services, Load Balancing, and Networking > [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)

kubernetes.io > Documentation > Concepts > Services, Load Balancing, and Networking > [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/)

The Ingress resource is HTTP(S) routing; an **Ingress controller** is what actually serves it (installing one is out of scope for CKAD/CKA, but you must know how to author and troubleshoot the resource). All answers reference the official IngressClass + TLS shapes. Use original names `shop`, `shop-svc`, `shop-ingress`, `nginx`, `shop-tls`.

## Authoring the routing

### Create a Deployment `shop` (nginx, 3 replicas) labelled `app=shop`, expose it on port 80 via a ClusterIP Service `shop-svc`.

<details><summary>show</summary>
<p>

```bash
kubectl create deployment shop --image=nginx --port=80 --replicas=3
kubectl label deployment shop app=shop
kubectl expose deployment shop --port=80 --name=shop-svc
kubectl get deploy shop
kubectl get svc shop-svc
```

</p>
</details>

Note: `--port=80` on the deployment only documents `containerPort`; `kubectl expose --port=80` builds the Service with `targetPort: 80`.

### Create an Ingress `shop-ingress` (class `nginx`) routing `shop.example.com/...` on `/`, backed by `shop-svc` port 80.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  ingressClassName: nginx
  rules:
  - host: shop.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: shop-svc
            port:
              number: 80
EOF
kubectl get ingress shop-ingress
```

</p>
</details>

Explanation: `ingressClassName: nginx` binds the rule to the `nginx` IngressClass (created in the next step). `pathType: Prefix` with `path: /` matches every request under `shop.example.com`. With the older annotation (`kubernetes.io/ingress.class: nginx`) kept for backwards compatibility. The backend is a `service.name` + `service.port.number` pair — never a bare pod. `host` + `path` must both match before traffic is forwarded.

### Create the IngressClass `nginx` (and mark it as the cluster default) used by `shop-ingress`.

<details><summary>show</summary>
<p>

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx
EOF
kubectl get ingressclass nginx -o yaml
```

</p>
</details>

Explanation: the IngressClass resource is cluster-scoped and names a single controller (`k8s.io/ingress-nginx` is the value the ingress-nginx project uses; nginx.org's controller uses `nginx.org/nginx-ingress`). Marking it as default (`is-default-class: "true"`) means a new Ingress **without** `spec.ingressClassName` is still picked up by this controller. Only **one** default class is allowed; the admission controller rejects a second one.

### Add HTTPS/TLS. Generate a self-signed cert for `shop.example.com`, store it as the secret `shop-tls`, and reference it in `shop-ingress`.

<details><summary>show</summary>
<p>

```bash
# 1. self-signed cert whose CN matches the Ingress host
openssl req -x509 -nodes -days=365 -newkey=rsa:2048 \
  -keyout shop.key -out shop.crt \
  -subj "/CN=shop.example.com"

# 2. upload it as a kubernetes.io/tls Secret
kubectl create secret tls shop-tls --cert=shop.crt --key=shop.key
kubectl get secret shop-tls -o go-template='{{.type}} {{.data | keys}}'

# 3. wire TLS into the Ingress (hosts in tls must also appear in rules)
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-ingress
spec:
  ingressClassName: nginx
  tls:
  - hosts:
      - shop.example.com
    secretName: shop-tls
  rules:
  - host: shop.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: shop-svc
            port:
              number: 80
EOF
```

</p>
</details>

Explanation: a TLS secret must contain two keys, `tls.crt` and `tls.key` (base64), and be of type `kubernetes.io/tls`. The Ingress `tls.hosts` entries **must match** the `rules[].host` entries (TLS is matched by SNI before the rule routing runs). The Ingress controller terminates TLS at the edge; pod-to-service traffic stays plain text.

## Verifying and troubleshooting

### Confirm the controller accepted the rule and that the address has been allocated.

<details><summary>show</summary>
<p>

```bash
kubectl describe ingress shop-ingress
# look for: Address (the LB IP/host assigned by the controller)
#          Rules -> Paths -> Backends: shop-svc:80 (1⁄3 ...)  <- healthy endpoints

kubectl get endpoints shop-svc            # the Service's ready pod IPs
```

</p>
</details>

Explanation: `describe ingress` is the single most useful troubleshooting command. If `Events` show `service ... not found` or `backend ... has no active endpoints`, the backing Service or its pods are the problem (not the Ingress itself). An `<pending>` Address means the Ingress controller is still provisioning the external load balancer.

> Common gotchas (per the official "Alternatives" note): Ingress **only** does HTTP(S); for arbitrary TCP/UDP use `Service.type=NodePort` / `LoadBalancer`. A bare `Ingress` object with no controller installed, and no default IngressClass, yields no address — confirm a controller is running with `kubectl get pods -n ingress-nginx` (or the equivalent namespace).
