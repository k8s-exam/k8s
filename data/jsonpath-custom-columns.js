window.CKAD_TOPIC = {
  "slug": "jsonpath-custom-columns",
  "title": "Jsonpath",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Reference &gt; Command line tool (kubectl) &gt; <a href=\"https://kubernetes.io/docs/reference/kubectl/jsonpath/\" target=\"_blank\" rel=\"noopener\">JSONPath Support</a>"
    },
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Reference &gt; Command line tool (kubectl) &gt; <a href=\"https://kubernetes.io/docs/reference/kubectl/cheatsheet/\" target=\"_blank\" rel=\"noopener\">kubectl Quick Reference</a>"
    },
    {
      "type": "text",
      "html": "<code>kubectl -o jsonpath</code> and <code>-o custom-columns</code> let you extract exactly the columns you want. JSONPath operators supported by kubectl: <code>$</code> / <code>.name</code> / <code>['name']</code> / <code>[n]</code> / <code>[start:end:step]</code> / <code>[*]</code> / <code>[?(expr)]</code> / <code>..</code> / <code>@</code>. <strong>Regex is not supported</strong> — pipe through <code>jq</code>/<code>grep</code> instead. Custom columns live in <code>kubectl get</code> and accept <code>NAME:.metadata.name</code>."
    }
  ],
  "sections": [
    {
      "heading": "JSONPath queries (`-o jsonpath`)",
      "id": "jsonpath-queries-o-jsonpath",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a busybox pod <code>walker</code> so there is data to query, plus list the objects you will inspect.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run walker --image=busybox --restart=Never -- sleep 3600\nkubectl get pods -n kube-system                   # there should also be kube-system pods\nkubectl get nodes"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Print just the names of every pod in the default namespace (no <code>NAME</code> header, no <code>STATUS</code> noise).",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -o jsonpath='{.items[*].metadata.name}'"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "text",
              "html": "one name per line:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{\"\\n\"}{end}'"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>.items[*].metadata.name</code> maps over all items. The <code>{range …}{…}{&quot;\\n&quot;}{end}</code> form is the standard k8s way to get one-field-per-line output; it is the idiom most CKAD/CKA answers look for."
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Show each pod's name and IP, tab-separated, for every pod in the cluster.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{\".\"}{.metadata.name}{\"\\t\"}{.status.podIP}{\"\\n\"}{end}'\n# or just the default namespace:\nkubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.podIP}{\"\\n\"}{end}'"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "List only the pods that are <code>Running</code> (use a JSONPath filter).",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -o jsonpath='{range .items[?(@.status.phase==\"Running\")]}{.metadata.name}{\"\\n\"}{end}'\n# the same as a one-liner (no newline between names):\nkubectl get pods -o jsonpath='{.items[?(@.status.phase==\"Running\")].metadata.name}'"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>[?(@.status.phase==&quot;Running&quot;)]</code> is a filter; <code>@</code> is the current item. (k8s JSONPath supports comparisons inside <code>[?()]</code> but <strong>not</strong> regex like <code>[?(@.metadata.name=~/^walker/)]</code>.)"
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Print the control-plane role label of every node, plus its kubelet version.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.nodeInfo.kubeletVersion}{\"\\t\"}{.metadata.labels.node-role\\.kubernetes\\.io/control-plane}{\"\\n\"}{end}'"
            },
            {
              "type": "ref",
              "html": "Note: because the label key <code>node-role.kubernetes.io/control-plane</code> contains dots, the bracket form <code>labels[&quot;node-role.kubernetes.io/control-plane&quot;]</code> is <strong>not</strong> valid here (kubectl errors with <code>invalid array index</code>) — escape the dots as <code>labels.node-role\\.kubernetes\\.io/control-plane</code>. On a control-plane node the value is the empty string, so nothing prints after the version; a worker node simply has no such label."
            }
          ]
        }
      ]
    },
    {
      "heading": "Custom columns (`-o custom-columns`)",
      "id": "custom-columns-o-custom-columns",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Show a pods table with <code>NAME</code>, the node it runs on, its IP, and restart count.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP,RESTARTS:.status.containerStatuses[0].restartCount"
            },
            {
              "type": "text",
              "html": "or"
            },
            {
              "type": "text",
              "html": "the same with a single quoted expression:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -o=custom-columns='NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP,RESTARTS:.status.containerStatuses[0].restartCount'"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: custom-columns takes <code>HEADER:JSONPATH</code> pairs separated by commas. Field paths starting with <code>.</code> are relative to each item in <code>.items;</code> you can also index (<code>.containerStatuses[0]</code>)."
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Show a nodes table with <code>NAME</code>, Kubernetes version, OS image, and internal IP.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get nodes -o custom-columns='NAME:.metadata.name,VERSION:.status.nodeInfo.kubeletVersion,OS-IMAGE:.status.nodeInfo.osImage,INTERNAL-IP:.status.addresses[?(@.type==\"InternalIP\")].address'"
            },
            {
              "type": "text",
              "html": "Note: a node's IP-address entries use the field <code>.address</code> (not <code>.ip</code> — <code>.ip</code> yields <code>&lt;none&gt;</code>), and because custom-columns evaluates each expression relative to a single item, quote the whole <code>-o custom-columns=...</code> argument in single quotes so your shell does not glob-expand the <code>[?()]</code> filter."
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Use a custom-columns <strong>file</strong> instead of an inline expression.",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "First create <code>columns.txt</code> (one header line, one field-path line, whitespace separated):"
            },
            {
              "type": "code",
              "language": "text",
              "code": "NAME  IP\nmetadata.name  status.podIP"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get pods -o custom-columns-file=columns.txt"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>-o custom-columns-file=&lt;file&gt;</code> reads the <code>NAME</code> → <code>path</code> mapping from a file, which is handy for long column lists. The field paths use the <strong>same</strong> JSONPath notation as <code>-o jsonpath</code>, just without the surrounding <code>{ … }</code>."
        },
        {
          "type": "text",
          "html": "&gt; Tip: <code>kubectl get --sort-by=.metadata.name</code> is the lightweight sort equivalent and does <strong>not</strong> go through custom-columns."
        }
      ]
    }
  ],
  "count": 8,
  "description": "Extract fields from command output.",
  "file": "p.jsonpath.md"
};
