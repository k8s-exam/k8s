window.CKAD_TOPIC = {
  "slug": "vim-nano",
  "title": "VIM & Nano",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "kubernetes.io &gt; Documentation &gt; Reference &gt; Command line tool (kubectl) &gt; <a href=\"https://kubernetes.io/docs/reference/kubectl/cheatsheet/\" target=\"_blank\" rel=\"noopener\">kubectl Quick Reference</a>"
    },
    {
      "type": "ref",
      "html": "https://vimhelp.org/"
    },
    {
      "type": "ref",
      "html": "https://www.nano-editor.org/dist/v7.9/"
    },
    {
      "type": "text",
      "html": "During the exam the default editor is <code>vi</code> (<code>$EDITOR</code>/<code>KUBE_EDITOR</code> override it). The workflow is always the same: scaffold a YAML with <code>--dry-run=client -o yaml</code>, open it in the editor, tweak fields, then <code>kubectl apply -f</code>. Original name: <code>editor</code>."
    }
  ],
  "sections": [
    {
      "heading": "Scaffolding manifests you then edit",
      "id": "scaffolding-manifests-you-then-edit",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Generate a Pod manifest <code>pod.yaml</code> for a busybox pod, then open it in <code>vi</code> and rename the pod to <code>editor</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl run editor --image=busybox --restart=Never --dry-run=client -o yaml > pod.yaml\nvi pod.yaml"
            }
          ]
        },
        {
          "type": "text",
          "html": "In <code>vi</code>:"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "text",
          "html": "press i            # enter insert mode"
        },
        {
          "type": "text",
          "html": "press Esc"
        },
        {
          "type": "text",
          "html": ":wq                # write (save) and quit"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "text",
          "html": "After saving, apply the manifest:"
        },
        {
          "type": "text",
          "html": "```bash"
        },
        {
          "type": "text",
          "html": "kubectl apply -f pod.yaml"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "text",
          "html": "&gt; Alternate scaffolds: <code>kubectl create deployment editor --image=nginx --dry-run=client -o yaml &gt; deploy.yaml</code>, or dump the full schema tree of a resource with <code>kubectl explain pods --recursive &gt; pod.yaml</code>."
        }
      ]
    },
    {
      "heading": "`kubectl explain` — finding the field you need to add",
      "id": "kubectl-explain-finding-the-field-you-need-to-add",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Use <code>kubectl explain</code> to confirm the exact name of <code>restartPolicy</code>, then set it to <code>Never</code> on <code>pod.yaml</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl explain pod.spec.restartPolicy        # prints: \"Restart policy ... default: Always\"\nkubectl explain pod.spec.containers.resources # shows requests/limits schema\n# inside pod.yaml add under spec:\n#   restartPolicy: Never"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>kubectl explain pod.spec.containers.resources</code> lists <code>limits</code> and <code>requests</code>; <code>--recursive</code> dumps every nested field in one shot (<code>kubectl explain pod.spec.containers --recursive</code>). These are the official, stable field names — never guess them."
        }
      ]
    },
    {
      "heading": "Editing live objects",
      "id": "editing-live-objects",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Open a live object in your editor and change one value (e.g. scale an image tag), using <code>nano</code> instead of <code>vi</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl expose deployment editor --port=80 --name=editor-svc 2>/dev/null || \\\nkubectl create deployment editor --image=nginx --port=80\nKUBE_EDITOR=nano kubectl edit deploy editor"
            }
          ]
        },
        {
          "type": "text",
          "html": "In <code>nano</code> the bottom <strong>two lines are the shortcut bar</strong>; the editor opens already in insert mode:"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "text",
          "html": "Ctrl-O  Enter            # ^O  write the file  (Enter confirms the filename)"
        },
        {
          "type": "text",
          "html": "Ctrl-X                   # ^X  exit"
        },
        {
          "type": "text",
          "html": "Ctrl-W  &lt;pattern&gt;  Enter # ^W  search"
        },
        {
          "type": "text",
          "html": "Ctrl-\\ &lt;regexp&gt;           # replace"
        },
        {
          "type": "text",
          "html": "Ctrl-G                    # help"
        },
        {
          "type": "text",
          "html": "```"
        },
        {
          "type": "text",
          "html": "Explanation: <code>KUBE_EDITOR=nano</code> overrides the default <code>vi</code>; <code>kubectl edit</code> is the quickest way to change <strong>one</strong> field without re-applying a whole manifest — Kubernetes rejects the edit atomically if the YAML is invalid, so it is safe. Every change spawns a new pod (the deployment rolls out), which doubles as a live verification."
        }
      ]
    },
    {
      "heading": "Scaffolding a Deployment you then edit",
      "id": "scaffolding-a-deployment-you-then-edit",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Scaffold a Deployment manifest with <code>kubectl run</code> + <code>--dry-run</code>, open it in <code>vi</code>, and add a readiness probe by consulting <code>kubectl explain</code>.",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "# 1. scaffold and open in vi\nkubectl create deployment editor --image=nginx --port=80 --dry-run=client -o yaml > deploy.yaml\nvi deploy.yaml"
            },
            {
              "type": "text",
              "html": "In <code>vi</code>:"
            },
            {
              "type": "code",
              "language": "text",
              "code": "press i\n# (the manifest is already open; add under spec.template.spec.containers[0]:)\nreadinessProbe:\n  httpGet:\n    path: /\n    port: 80\npress Esc\n:wq"
            },
            {
              "type": "text",
              "html": "Then apply it:"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f deploy.yaml"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl explain deploy.spec.template.spec.containers.readinessProbe\nkubectl explain deploy.spec.template.spec.containers.readinessProbe.httpGet --recursive"
            }
          ]
        },
        {
          "type": "text",
          "html": "Explanation: <code>kubectl create deployment</code> has no <code>--edit</code> flag, so scaffold to a file with <code>--dry-run -o yaml</code> and edit it in <code>$EDITOR</code> instead. <code>kubectl explain</code> works on <strong>live</strong> objects too (<code>kubectl explain deploy.spec...</code>), so you never have to leave the editor to check a field name — and the probe you add is exactly what the readiness probe exercises need."
        }
      ]
    },
    {
      "heading": "Quick reference",
      "id": "quick-reference",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "What keystrokes do I need to save and quit in each editor?",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "| Operation | vim / vi | nano |"
            },
            {
              "type": "text",
              "html": "|---|---|---|"
            },
            {
              "type": "text",
              "html": "| open a file | <code>vi file.yaml</code> | <code>nano file.yaml</code> |"
            },
            {
              "type": "text",
              "html": "| enter editing | <code>i</code> (insert) | already in insert mode |"
            },
            {
              "type": "text",
              "html": "| leave insert mode | <code>Esc</code> | n/a |"
            },
            {
              "type": "text",
              "html": "| save | <code>:w</code> + <code>Enter</code> | <code>Ctrl-O</code> <code>Enter</code> |"
            },
            {
              "type": "text",
              "html": "| save + quit | <code>:wq</code> (or <code>ZZ</code>) | <code>Ctrl-X</code> (prompts to save) |"
            },
            {
              "type": "text",
              "html": "| quit without saving | <code>:q!</code> | <code>Ctrl-X</code> then <code>N</code> |"
            },
            {
              "type": "text",
              "html": "| search | <code>/pattern</code> <code>Enter</code> <code>n</code> | <code>Ctrl-W</code> |"
            },
            {
              "type": "text",
              "html": "To make one of them your editor everywhere: <code>export KUBE_EDITOR=nano</code> (or <code>vi</code>/<code>vim</code>)."
            }
          ]
        }
      ]
    }
  ],
  "count": 5,
  "description": "Edit manifests in vi and nano.",
  "file": "r.vim_nano.md"
};
