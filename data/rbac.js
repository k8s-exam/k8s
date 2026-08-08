window.CKAD_TOPIC = {
  "slug": "rbac",
  "title": "RBAC",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Reference &gt; API Access Control &gt; <a href=\"https://kubernetes.io/docs/reference/access-authn-authz/rbac/\" target=\"_blank\" rel=\"noopener\">Using RBAC Authorization</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Concepts &gt; Security &gt; <a href=\"https://kubernetes.io/docs/concepts/security/service-accounts/\" target=\"_blank\" rel=\"noopener\">Service Accounts</a>"
    },
    {
      "type": "text",
      "html": "RBAC is the authorization layer; a <strong>ServiceAccount</strong> is the identity a pod runs as. A <strong>Role</strong>/ClusterRole says <em>what verbs</em> apply to <em>what resources</em>; a <strong>RoleBinding</strong>/<strong>ClusterRoleBinding</strong> ties a role to a subject (User, Group, or ServiceAccount). All RBAC objects are <code>apiGroup: rbac.authorization.k8s.io</code> and the current API is <code>rbac.authorization.k8s.io/v1</code> (the older <code>v1beta1</code>/<code>v1alpha1</code> are removed). Original names: <code>builder</code>, <code>pod-reader</code>, <code>read-pods</code>, <code>deployer</code>, <code>runner</code>, <code>secret-reader</code>, <code>secret-reader-global</code>, user <code>auditor</code>."
    }
  ],
  "sections": [
    {
      "heading": "ServiceAccounts",
      "id": "serviceaccounts",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a ServiceAccount <code>builder</code> and inspect the identity Kubernetes gives it.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl create serviceaccount builder\nkubectl get sa builder -o yaml\n# secret at /var/run/secrets/kubernetes.io/serviceaccount/ is a projected, auto-rotated token\n# (default SA in each namespace is auto-created and gets only default API-discovery rights)"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "# declarative form\nkubectl apply -f - <<EOF\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: builder\nEOF"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: every pod that does not set <code>serviceAccountName</code> is bound to the namespace's <code>default</code> ServiceAccount. Tokens are short-lived and rotated via the <code>TokenRequest</code> API (mounted as a projected volume), not the old long-lived secret."
        }
      ]
    },
    {
      "heading": "Roles and RoleBindings (namespaced)",
      "id": "roles-and-rolebindings-namespaced",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Grant the <code>builder</code> ServiceAccount permission to <code>get</code>, <code>list</code>, and <code>watch</code> pods in the <code>default</code> namespace, using a Role <code>pod-reader</code> and a RoleBinding <code>read-pods</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# 1. define the role (verbs + resources it covers)\nkubectl create role pod-reader --verb=get,list,watch --resource=pods\n# 2. bind it to the ServiceAccount\nkubectl create rolebinding read-pods --clusterrole=pod-reader --serviceaccount=default:builder\n#   NB: --role=<role>   (namespaced)   |   --clusterrole=<clusterrole>  (binds a ClusterRole in this namespace too)\n#   NB: --serviceaccount=<namespace>:<name>   (or --user=<name> / --group=<name>)\n# 3. inspect\nkubectl get role pod-reader -o yaml\nkubectl get rolebinding read-pods -o yaml"
            }
          ]
        },
        {
          "type": "text",
          "html": "The binding subject string is <code>&lt;namespace&gt;:&lt;serviceaccount&gt;</code> (<code>default:builder</code>). A Role only grants rights inside the namespace where it lives — <code>builder</code> could <code>get pods</code> in <code>default</code> but <strong>not</strong> in <code>kube-system</code>."
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Run a pod <code>runner</code> as the <code>builder</code> ServiceAccount and confirm the identity it uses.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: runner\nspec:\n  serviceAccountName: builder\n  restartPolicy: Never\n  containers:\n  - name: runner\n    image: busybox\n    command: [\"sleep\",\"3600\"]\nEOF\nkubectl get pod runner -o jsonpath='{.spec.serviceAccountName}'   # -> builder\nkubectl exec runner -- ls /var/run/secrets/kubernetes.io/serviceaccount/   # token, ca.crt, namespace"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>kubectl run</code> has no <code>--serviceaccount</code> flag, so set <code>spec.serviceAccountName</code> in a manifest instead. The token file and CA are mounted for you; never embed credentials."
        }
      ]
    },
    {
      "heading": "ClusterRoles and verification",
      "id": "clusterroles-and-verification",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Create a ClusterRole <code>secret-reader</code> (cluster-wide <code>get</code>/<code>list</code>/<code>watch</code> on secrets) and bind it to user <code>auditor</code> with a ClusterRoleBinding <code>secret-reader-global</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# ClusterRole: cluster-scoped verb set on a resource\nkubectl create clusterrole secret-reader --verb=get,list,watch --resource=secrets\n# ClusterRoleBinding: binds a ClusterRole to a subject for the WHOLE cluster\nkubectl create clusterrolebinding secret-reader-global --clusterrole=secret-reader --user=auditor\nkubectl get clusterrole secret-reader -o yaml\nkubectl get clusterrolebinding secret-reader-global -o yaml"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: a <code>ClusterRole</code> can be bound at cluster scope (ClusterRoleBinding) <strong>or</strong> reused inside one namespace (RoleBinding) — that is why <code>kubectl create rolebinding --clusterrole=...</code> is valid above. <code>--user</code>/<code>--group</code> bind to authenticated human users/groups; <code>--serviceaccount</code> binds to a SA."
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Validate the granted abilities with <code>kubectl auth can-i</code> (no action is actually performed).",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# as the builder SA in default -> should be YES (role above grants it)\nkubectl auth can-i get pods --as=system:serviceaccount:default:builder\n# as user auditor -> should be YES (secret-reader ClusterRoleBinding)\nkubectl auth can-i list secrets --as=auditor\n# as the same SA for secrets -> should be NO\nkubectl auth can-i list secrets --as=system:serviceaccount:default:builder\n# list everything this identity may do:\nkubectl auth can-i --list --as=system:serviceaccount:default:builder"
            }
          ]
        },
        {
          "type": "text",
          "html": "<code>can-i</code> returns <code>yes</code>/<code>no</code> (plus <code>warning:</code> lines for partial access) and works with <code>--namespace</code>, <code>--as</code>, <code>--as-group</code>, and <code>--list</code> — use it to sanity-check a Role/ClusterRoleBinding before trusting it."
        },
        {
          "type": "text",
          "html": "&gt; Reminder: the legacy pod field was <code>spec.serviceAccount</code> (singular); current clusters expect <strong><code>serviceAccountName</code></strong>. Both are accepted but <code>serviceAccount</code> is deprecated."
        }
      ]
    }
  ],
  "count": 5,
  "description": "Roles, ClusterRoles, and bindings.",
  "file": "s.rbac.md"
};
