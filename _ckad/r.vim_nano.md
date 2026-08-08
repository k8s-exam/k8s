# VIM & Nano

kubernetes.io > Documentation > Reference > Command line tool (kubectl) > [kubectl Quick Reference](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

https://vimhelp.org/

https://www.nano-editor.org/dist/v7.9/

During the exam the default editor is `vi` (`$EDITOR`/`KUBE_EDITOR` override it). The workflow is always the same: scaffold a YAML with `--dry-run=client -o yaml`, open it in the editor, tweak fields, then `kubectl apply -f`. Original name: `editor`.

## Scaffolding manifests you then edit

### Generate a Pod manifest `pod.yaml` for a busybox pod, then open it in `vi` and rename the pod to `editor`.

<details><summary>show</summary>
<p>

```bash
kubectl run editor --image=busybox --restart=Never --dry-run=client -o yaml > pod.yaml
vi pod.yaml
```

</p>
</details>

In `vi`:

```
press i            # enter insert mode
# navigate to "name: editor", change the image or add fields like spec.restartPolicy: Never
press Esc
:wq                # write (save) and quit
# or: :x  (save + quit),  :q!  (quit without saving)
```

After saving, apply the manifest:

```bash
kubectl apply -f pod.yaml
```

> Alternate scaffolds: `kubectl create deployment editor --image=nginx --dry-run=client -o yaml > deploy.yaml`, or dump the full schema tree of a resource with `kubectl explain pods --recursive > pod.yaml`.

## `kubectl explain` — finding the field you need to add

### Use `kubectl explain` to confirm the exact name of `restartPolicy`, then set it to `Never` on `pod.yaml`.

<details><summary>show</summary>
<p>

```bash
kubectl explain pod.spec.restartPolicy        # prints: "Restart policy ... default: Always"
kubectl explain pod.spec.containers.resources # shows requests/limits schema

# inside pod.yaml add under spec:
#   restartPolicy: Never
```

</p>
</details>

Explanation: `kubectl explain pod.spec.containers.resources` lists `limits` and `requests`; `--recursive` dumps every nested field in one shot (`kubectl explain pod.spec.containers --recursive`). These are the official, stable field names — never guess them.

## Editing live objects

### Open a live object in your editor and change one value (e.g. scale an image tag), using `nano` instead of `vi`.

<details><summary>show</summary>
<p>

```bash
kubectl expose deployment editor --port=80 --name=editor-svc 2>/dev/null || \
kubectl create deployment editor --image=nginx --port=80

KUBE_EDITOR=nano kubectl edit deploy editor
```

</p>
</details>

In `nano` the bottom **two lines are the shortcut bar**; the editor opens already in insert mode:

```
Ctrl-O  Enter            # ^O  write the file  (Enter confirms the filename)
Ctrl-X                   # ^X  exit
Ctrl-W  <pattern>  Enter # ^W  search
Ctrl-\ <regexp>           # replace
Ctrl-G                    # help
```

Explanation: `KUBE_EDITOR=nano` overrides the default `vi`; `kubectl edit` is the quickest way to change **one** field without re-applying a whole manifest — Kubernetes rejects the edit atomically if the YAML is invalid, so it is safe. Every change spawns a new pod (the deployment rolls out), which doubles as a live verification.

## Scaffolding a Deployment you then edit

### Scaffold a Deployment manifest with `kubectl run` + `--dry-run`, open it in `vi`, and add a readiness probe by consulting `kubectl explain`.

<details><summary>show</summary>
<p>

```bash
# 1. scaffold and open in vi
kubectl create deployment editor --image=nginx --port=80 --dry-run=client -o yaml > deploy.yaml
vi deploy.yaml
```

In `vi`:

```
press i
# (the manifest is already open; add under spec.template.spec.containers[0]:)
readinessProbe:
  httpGet:
    path: /
    port: 80
press Esc
:wq
```

Then apply it:

```bash
kubectl apply -f deploy.yaml
```

<details><summary>Need to check a field name first?</summary>

```bash
kubectl explain deploy.spec.template.spec.containers.readinessProbe
kubectl explain deploy.spec.template.spec.containers.readinessProbe.httpGet --recursive
```

</details>

</p>
</details>

Explanation: `kubectl create deployment` has no `--edit` flag, so scaffold to a file with `--dry-run -o yaml` and edit it in `$EDITOR` instead. `kubectl explain` works on **live** objects too (`kubectl explain deploy.spec...`), so you never have to leave the editor to check a field name — and the probe you add is exactly what the readiness probe exercises need.

## Quick reference

### What keystrokes do I need to save and quit in each editor?

<details><summary>show</summary>
<p>

| Operation | vim / vi | nano |
|---|---|---|
| open a file | `vi file.yaml` | `nano file.yaml` |
| enter editing | `i` (insert) | already in insert mode |
| leave insert mode | `Esc` | n/a |
| save | `:w` + `Enter` | `Ctrl-O` `Enter` |
| save + quit | `:wq` (or `ZZ`) | `Ctrl-X` (prompts to save) |
| quit without saving | `:q!` | `Ctrl-X` then `N` |
| search | `/pattern` `Enter` `n` | `Ctrl-W` |

To make one of them your editor everywhere: `export KUBE_EDITOR=nano` (or `vi`/`vim`).

</p>
</details>
