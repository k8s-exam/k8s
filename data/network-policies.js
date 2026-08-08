window.CKAD_TOPIC = {
  "slug": "network-policies",
  "title": "Network Policies",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Services, Load Balancing, and Networking &gt; <a href=\"https://kubernetes.io/docs/concepts/services-networking/network-policies/\" target=\"_blank\" rel=\"noopener\">Network Policies</a>"
    },
    {
      "type": "text",
      "html": "&gt; <strong>Prerequisite:</strong> NetworkPolicies are only enforced when the cluster's CNI plugin supports them. Creating the resource does nothing on a cluster whose network plugin ignores it. Use original names <code>api</code>, <code>api-allow-ingress</code>, <code>api-egress</code>, <code>tester</code>, <code>granted</code>, namespace <code>trusted</code>."
    }
  ],
  "sections": [
    {
      "heading": "Allow / deny by label",
      "id": "allow-deny-by-label",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a Deployment <code>api</code> of nginx (2 replicas) with label <code>app=api</code> and expose it on port 80 with a ClusterIP Service <code>api</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create deployment api --image=nginx --port=80   # creates pods with label app=api\nkubectl expose deployment api --port=80   # ClusterIP Service `api`\nkubectl get deploy,svc api"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>app=api</code> is the label the NetworkPolicy will select. The deployment is auto-labelled by <code>create deployment</code> (it sets <code>app: &lt;name&gt;</code>), but the explicit <code>kubectl label</code> makes the selector explicit and matches what the policy targets."
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Create a NetworkPolicy <code>api-allow-ingress</code> that isolates pods <code>app=api</code> for ingress and allows traffic to port 80 <strong>only</strong> from pods labelled <code>access=granted</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: api-allow-ingress\nspec:\n  podSelector:\n    matchLabels:\n      app: api                      # this policy applies to the api pods\n  policyTypes:\n    - Ingress\n  ingress:\n    - from:\n        - podSelector:\n            matchLabels:\n              access: granted\n      ports:\n        - protocol: TCP\n          port: 80\nEOF\nkubectl describe netpol api-allow-ingress"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: as soon as <strong>any</strong> NetworkPolicy selects a pod with <code>Ingress</code> in <code>policyTypes</code>, that pod becomes <strong>isolated for ingress</strong> — only the <code>ingress</code> rules listed below are allowed, everything else is denied. <code>from.podSelector</code> is namespace-scoped: it matches pods in the <strong>same namespace</strong> as the policy."
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Verify the policy: <code>tester</code> (no label) cannot reach <code>api:80</code>, while <code>granted</code> (label <code>access=granted</code>) can.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run granted --image=busybox --restart=Never --labels=access=granted -- sleep 3600\nkubectl run tester  --image=busybox --restart=Never -- sleep 3600\nkubectl exec tester -- wget -qO- --timeout=2 http://api:80 ; echo \"exit=$?\"   # blocked\nkubectl exec granted -- wget -qO- --timeout=2 http://api:80 ; echo \"exit=$?\"  # ok"
            }
          ]
        },
        {
          "type": "text",
          "html": "Expected: the <code>tester</code> call times out / is blocked (<code>wget</code> returns non-zero), the <code>granted</code> call succeeds. The two <code>--timeout</code>/<code>echo</code> lines make the pass/fail visible side by side."
        }
      ]
    },
    {
      "heading": "Namespace and IP-based rules",
      "id": "namespace-and-ip-based-rules",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Also allow ingress to <code>app=api</code> from every pod in the <code>trusted</code> namespace (selected by the label <code>env=trusted</code>), and verify.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# label the namespace (network policies target namespace OBJECTS, which need a label)\nkubectl create namespace trusted\nkubectl label namespace trusted env=trusted\n# add the namespace as an allowed source on the api pods\nkubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: api-allow-ingress\nspec:\n  podSelector:\n    matchLabels:\n      app: api\n  policyTypes:\n    - Ingress\n  ingress:\n    - from:\n        - podSelector:\n            matchLabels:\n              access: granted\n        - namespaceSelector:\n            matchLabels:\n              env: trusted\n      ports:\n        - protocol: TCP\n          port: 80\nEOF"
            }
          ]
        },
        {
          "type": "ref",
          "html": "Explanation: a single <code>from</code> entry may list <strong>both</strong> a <code>namespaceSelector</code> and a <code>podSelector</code> (then it means &quot;pods matching podSelector that live in namespaces matching namespaceSelector&quot;); putting them as <strong>separate list items</strong> (one <code>namespaceSelector</code>, one <code>podSelector</code>) means &quot;pods with <code>access=granted</code> in this namespace, <strong>or</strong> any pod in a namespace labelled <code>env=trusted</code>&quot;. To target a namespace <strong>by name</strong> directly, use the built-in label <code>kubernetes.io/metadata.name: &lt;ns&gt;</code>:"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "ref",
          "html": "namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: trusted}}"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Add an egress rule so <code>app=api</code> pods may only reach <code>10.0.0.0/8</code> on TCP 443, and block everything else.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: api-egress\nspec:\n  podSelector:\n    matchLabels:\n      app: api\n  policyTypes:\n    - Egress\n  egress:\n    - to:\n        - ipBlock:\n            cidr: 10.0.0.0/8\n      ports:\n        - protocol: TCP\n          port: 443\nEOF\nkubectl get netpol\nkubectl describe netpol api-egress"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>policyTypes: [Egress]</code> isolates the pod for <strong>egress</strong>; the only allowed egress is <code>10.0.0.0/8:443</code> (optionally excluding a sub-range with <code>ipBlock.except</code>). Because egress is now isolated, <strong>all other</strong> egress — including DNS to the cluster's <code>kube-dns</code> service — is denied; if the workload needs DNS, add a second egress rule for the CoreDNS ClusterIP/port 53 UDP."
        },
        {
          "type": "text",
          "html": "&gt; Note: NetworkPolicies apply only to <strong>pod IP</strong> traffic, never to traffic originating on the node where the pod runs (including <code>hostNetwork</code> pods) unless the plugin explicitly supports it."
        }
      ]
    }
  ],
  "count": 5,
  "description": "Restrict ingress and egress traffic.",
  "file": "n.network_policies.md"
};
