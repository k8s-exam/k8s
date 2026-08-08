# CKAD Exercises — Study Site

A fully static, self-contained study site for the [Certified Kubernetes Application Developer (CKAD)](https://www.cncf.io/certification/ckad/) exam.

The exercise content is derived from the open-source [`dgkanatsios/CKAD-exercises`](https://github.com/dgkanatsios/CKAD-exercises) repository, with every exercise and solution **verified against a live Kubernetes cluster** (kind, v1.36) and corrected where the original instructions were outdated or wrong. Each question links back to the relevant page of the [official Kubernetes documentation](https://kubernetes.io/docs/) so you can check the source of truth.

**229 exercises across 19 curriculum domains.**

---

## Contents

| Domain | Exercises | File |
| ------ | --------- | ---- |
| Core Concepts | 30 | `_ckad/a.core_concepts.md` |
| Multi-container Pods | 9 | `_ckad/b.multi_container_pods.md` |
| Pod Design | 52 | `_ckad/c.pod_design.md` |
| Configuration | 30 | `_ckad/d.configuration.md` |
| Observability | 8 | `_ckad/e.observability.md` |
| Services & Networking | 10 | `_ckad/f.services.md` |
| State Persistence | 6 | `_ckad/g.state.md` |
| Helm | 10 | `_ckad/h.helm.md` |
| CRDs | 4 | `_ckad/i.crd.md` |
| Podman | 13 | `_ckad/j.podman.md` |
| ETCD Backup | 5 | `_ckad/k.etcd_backup_restore.md` |
| Cluster Upgrade | 6 | `_ckad/l.cluster_upgrade.md` |
| PV & PVC | 9 | `_ckad/m.pv_pvc.md` |
| Network Policies | 5 | `_ckad/n.network_policies.md` |
| Ingress | 5 | `_ckad/o.ingress.md` |
| Jsonpath | 8 | `_ckad/p.jsonpath.md` |
| Monitoring & Logging | 9 | `_ckad/q.monitoring.md` |
| VIM & Nano | 5 | `_ckad/r.vim_nano.md` |
| RBAC | 5 | `_ckad/s.rbac.md` |

> **Total: 229 exercises** (all 19 source files regenerated and verified).

---

## Features

- **Fully static & offline** — no server, no build step, no network calls at runtime. Open `index.html` directly from disk and it just works (all data ships as plain JS files in `data/`).
- **19 topic pages** — one per curriculum domain, generated from the markdown sources.
- **Click-to-reveal answers** — every exercise is wrapped in a `<details>` disclosure; use "expand all" to open everything at once.
- **Search** — instant full-text search across all 229 questions and answers.
- **Dark / light theme** — respects your OS preference and remembers your choice.
- **Responsive layout** — desktop sidebar plus a mobile drawer.
- **Official docs breadcrumbs** — each exercise links to the exact `kubernetes.io` page it references (the only resource allowed in the exam).

---

## Getting started

There is no install step for using the site:

```bash
# just open it
open index.html
```

### Local dev server (optional)

```bash
# serve the directory so you can review it in a browser
python3 -m http.server 8000
# -> http://localhost:8000
```

### Rebuilding the CSS (only needed after editing `css/input.css`)

```bash
npm install
npm run build:css   # compiles css/input.css -> css/style.css (minified)
```

### Regenerating the site from the markdown sources

After editing any `_ckad/*.md` file, regenerate the `data/*.js` bundles:

```bash
python3 tools/generate.py
```

This parses all 19 markdown files and writes `window.CKAD_*` JS data files under `data/` (and refreshes `data/topics.js` / `data/search.js`).

---

## Project layout

```
.
├── index.html              # home page (topic cards + search)
├── <topic>.html            # one page per topic (19 pages)
├── _ckad/                  # markdown exercise sources (one file per domain)
├── data/                   # generated JS data (window.CKAD_*)
│   ├── topics.js           # topic metadata (title, weight, count)
│   ├── search.js           # search index
│   └── <slug>.js           # per-topic exercises
├── js/
│   ├── app.js              # UI: cards, answers, search, drawer, theme
│   └── theme.js            # theme bootstrapping (avoids FOUC)
├── css/
│   ├── input.css           # Tailwind v4 source
│   └── style.css           # compiled/minified output
└── tools/
    └── generate.py         # md -> data/*.js generator
```

---

## Verifying the content

Every exercise was executed against a real cluster (kind, Kubernetes v1.36, containerd runtime) and the commands in the answers were corrected where the original upstream text no longer matched current behavior — for example:

- `kubectl set image deploy <name> <container>=<image>` now uses the real container name instead of a name that kubectl rejects.
- Node-address JSONPath filters use the correct `.address` field (the documented `.ip` produced `<none>`).
- Pods in a shared process namespace: the answer no longer claims signals "don't kill `sleep`" (busybox `sleep`/`tail` do terminate), and the demo uses a name-based restart-count query.
- Cluster-upgrade and custom-columns commands are quoted so they work from zsh.
- Notes added for environment-specific caveats (e.g. `standard` StorageClass collisions, bitnami chart image tags that were removed from Docker Hub, plain-HTTP registries with podman).

> Everything still refers back to the official Kubernetes documentation; these are corrections to the *commands*, not to Kubernetes behavior.

---

## Acknowledgements

- [CKAD Exercises](https://github.com/dgkanatsios/CKAD-exercises) by [Dimitris-Ilias Gkanatsios](https://github.com/dgkanatsios) — the original exercise content and per-domain format.
- [Kubernetes documentation](https://kubernetes.io/docs/) — the official reference every answer links to.
- [Tailwind CSS](https://tailwindcss.com/) — styling.

---

## License

The exercise content is MIT-licensed (see [`_ckad/LICENSE`](_ckad/LICENSE)); the site code in this repository is provided under the same terms.
