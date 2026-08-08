window.CKAD_TOPIC = {
  "slug": "ingress",
  "title": "Ingress",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Services, Load Balancing, and Networking &gt; <a href=\"https://kubernetes.io/docs/concepts/services-networking/ingress/\" target=\"_blank\" rel=\"noopener\">Ingress</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Services, Load Balancing, and Networking &gt; <a href=\"https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/\" target=\"_blank\" rel=\"noopener\">Ingress Controllers</a>"
    },
    {
      "type": "text",
      "html": "The Ingress resource is HTTP(S) routing; an <strong>Ingress controller</strong> is what actually serves it (installing one is out of scope for CKAD/CKA, but you must know how to author and troubleshoot the resource). All answers reference the official IngressClass + TLS shapes. Use original names <code>shop</code>, <code>shop-svc</code>, <code>shop-ingress</code>, <code>nginx</code>, <code>shop-tls</code>."
    }
  ],
  "sections": [
    {
      "heading": "Authoring the routing",
      "id": "authoring-the-routing",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a Deployment <code>shop</code> (nginx, 3 replicas) labelled <code>app=shop</code>, expose it on port 80 via a ClusterIP Service <code>shop-svc</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deployment shop --image=nginx --port=80 --replicas=3\nkubectl label deployment shop app=shop\nkubectl expose deployment shop --port=80 --name=shop-svc\nkubectl get deploy shop\nkubectl get svc shop-svc"
            }
          ]
        },
        {
          "type": "text",
          "html": "Note: <code>--port=80</code> on the deployment only documents <code>containerPort</code>; <code>kubectl expose --port=80</code> builds the Service with <code>targetPort: 80</code>."
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Create an Ingress <code>shop-ingress</code> (class <code>nginx</code>) routing <code>shop.example.com/...</code> on <code>/</code>, backed by <code>shop-svc</code> port 80.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: shop-ingress\n  annotations:\n    kubernetes.io/ingress.class: nginx\nspec:\n  ingressClassName: nginx\n  rules:\n  - host: shop.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: shop-svc\n            port:\n              number: 80\nEOF\nkubectl get ingress shop-ingress"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Explanation: <code>ingressClassName: nginx</code> binds the rule to the <code>nginx</code> IngressClass (created in the next step). <code>pathType: Prefix</code> with <code>path: /</code> matches every request under <code>shop.example.com</code>. With the older annotation (<code>kubernetes.io/ingress.class: nginx</code>) kept for backwards compatibility. The backend is a <code>service.name</code> + <code>service.port.number</code> pair — never a bare pod. <code>host</code> + <code>path</code> must both match before traffic is forwarded."
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Create the IngressClass <code>nginx</code> (and mark it as the cluster default) used by <code>shop-ingress</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: IngressClass\nmetadata:\n  name: nginx\n  annotations:\n    ingressclass.kubernetes.io/is-default-class: \"true\"\nspec:\n  controller: k8s.io/ingress-nginx\nEOF\nkubectl get ingressclass nginx -o yaml"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: the IngressClass resource is cluster-scoped and names a single controller (<code>k8s.io/ingress-nginx</code> is the value the ingress-nginx project uses; nginx.org's controller uses <code>nginx.org/nginx-ingress</code>). Marking it as default (<code>is-default-class: &quot;true&quot;</code>) means a new Ingress <strong>without</strong> <code>spec.ingressClassName</code> is still picked up by this controller. Only <strong>one</strong> default class is allowed; the admission controller rejects a second one."
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Add HTTPS/TLS. Generate a self-signed cert for <code>shop.example.com</code>, store it as the secret <code>shop-tls</code>, and reference it in <code>shop-ingress</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# 1. self-signed cert whose CN matches the Ingress host\nopenssl req -x509 -nodes -days=365 -newkey=rsa:2048 \\\n  -keyout shop.key -out shop.crt \\\n  -subj \"/CN=shop.example.com\"\n# 2. upload it as a kubernetes.io/tls Secret\nkubectl create secret tls shop-tls --cert=shop.crt --key=shop.key\nkubectl get secret shop-tls -o go-template='{{.type}} {{.data | keys}}'\n# 3. wire TLS into the Ingress (hosts in tls must also appear in rules)\nkubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: shop-ingress\nspec:\n  ingressClassName: nginx\n  tls:\n  - hosts:\n      - shop.example.com\n    secretName: shop-tls\n  rules:\n  - host: shop.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: shop-svc\n            port:\n              number: 80\nEOF"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Explanation: a TLS secret must contain two keys, <code>tls.crt</code> and <code>tls.key</code> (base64), and be of type <code>kubernetes.io/tls</code>. The Ingress <code>tls.hosts</code> entries <strong>must match</strong> the <code>rules[].host</code> entries (TLS is matched by SNI before the rule routing runs). The Ingress controller terminates TLS at the edge; pod-to-service traffic stays plain text."
        }
      ]
    },
    {
      "heading": "Verifying and troubleshooting",
      "id": "verifying-and-troubleshooting",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Confirm the controller accepted the rule and that the address has been allocated.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl describe ingress shop-ingress\n# look for: Address (the LB IP/host assigned by the controller)\n#          Rules -> Paths -> Backends: shop-svc:80 (1⁄3 ...)  <- healthy endpoints\nkubectl get endpoints shop-svc            # the Service's ready pod IPs"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>describe ingress</code> is the single most useful troubleshooting command. If <code>Events</code> show <code>service ... not found</code> or <code>backend ... has no active endpoints</code>, the backing Service or its pods are the problem (not the Ingress itself). An <code>&lt;pending&gt;</code> Address means the Ingress controller is still provisioning the external load balancer."
        },
        {
          "type": "text",
          "html": "&gt; Common gotchas (per the official &quot;Alternatives&quot; note): Ingress <strong>only</strong> does HTTP(S); for arbitrary TCP/UDP use <code>Service.type=NodePort</code> / <code>LoadBalancer</code>. A bare <code>Ingress</code> object with no controller installed, and no default IngressClass, yields no address — confirm a controller is running with <code>kubectl get pods -n ingress-nginx</code> (or the equivalent namespace)."
        }
      ]
    }
  ],
  "count": 5,
  "description": "HTTP routing with TLS secrets.",
  "file": "o.ingress.md"
};
