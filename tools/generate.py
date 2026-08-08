#!/usr/bin/env python3
"""Generate static reference data files for the CKAD Exercises website.

Parses the markdown files from https://github.com/dgkanatsios/CKAD-exercises
into JS data files (window.CKAD_*) so the site is fully static and works
even when opened directly from disk (no fetch/CORS issues).
"""

import json
import os
import re
import sys

SRC = os.path.join(os.path.dirname(__file__), "..", "_ckad")
OUT = os.path.join(os.path.dirname(__file__), "..", "data")

TOPICS = [
    ("a.core_concepts.md", "core-concepts", "Core Concepts", "13%",
     "Namespaces, pods, and kubectl basics."),
    ("b.multi_container_pods.md", "multi-container-pods", "Multi-container Pods", "10%",
     "Sidecars, init containers, and shared volumes."),
    ("c.pod_design.md", "pod-design", "Pod Design", "20%",
     "Labels, deployments, jobs, and cron jobs."),
    ("d.configuration.md", "configuration", "Configuration", "18%",
     "ConfigMaps, secrets, resources, and quotas."),
    ("e.observability.md", "observability", "Observability", "18%",
     "Probes, logging, and debugging."),
    ("f.services.md", "services-networking", "Services & Networking", "13%",
     "Services, endpoints, and NodePorts."),
    ("g.state.md", "state-persistence", "State Persistence", "8%",
     "Volumes, PVs, and PVCs."),
    ("h.helm.md", "helm", "Helm", None,
     "Charts and repositories."),
    ("i.crd.md", "crd", "CRDs", None,
     "Custom resource definitions."),
    ("j.podman.md", "podman", "Podman", None,
     "Build and modify container images."),
    ("k.etcd_backup_restore.md", "etcd-backup-restore", "ETCD Backup", None,
     "Back up and restore the etcd datastore."),
    ("l.cluster_upgrade.md", "cluster-upgrade", "Cluster Upgrade", None,
     "Upgrade control-plane and worker nodes."),
    ("m.pv_pvc.md", "pv-pvc", "PV & PVC", None,
     "Static and dynamic volume provisioning."),
    ("n.network_policies.md", "network-policies", "Network Policies", None,
     "Restrict ingress and egress traffic."),
    ("o.ingress.md", "ingress", "Ingress", None,
     "HTTP routing with TLS secrets."),
    ("p.jsonpath.md", "jsonpath-custom-columns", "Jsonpath", None,
     "Extract fields from command output."),
    ("q.monitoring.md", "monitoring-logging", "Monitoring & Logging", None,
     "kubectl top and logs for nodes and pods."),
    ("r.vim_nano.md", "vim-nano", "VIM & Nano", None,
     "Edit manifests in vi and nano."),
    ("s.rbac.md", "rbac", "RBAC", None,
     "Roles, ClusterRoles, and bindings."),
]

TAG_RE = re.compile(r"</?(?:details|p|summary|br|br/)\s*>", re.IGNORECASE)


def parse_inline(text):
    text = html_escape(text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", text)

    def link_repl(m):
        label, url = m.group(1), html_escape(m.group(2))
        if url.startswith("#"):
            return '<a href="%s">%s</a>' % (url, label)
        return '<a href="%s" target="_blank" rel="noopener">%s</a>' % (url, label)

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link_repl, text)
    return text


def html_escape(text):
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;"))


def slugify(text):
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug


def strip_tags(line):
    line = re.sub(r"<summary>.*?</summary>", "", line, flags=re.I | re.DOTALL)
    return TAG_RE.sub("", line)


def parse_blocks(lines):
    """Convert raw markdown-ish lines (already collected from an answer/setup) to blocks."""
    blocks = []
    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i].rstrip()
        s = raw.strip()

        if s.startswith("```"):
            lang = s[3:].strip() or "text"
            code = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1  # skip closing fence
            blocks.append({"type": "code", "language": lang, "code": "\n".join(code)})
            continue

        stripped = strip_tags(raw).strip()
        if stripped == "" and ("<details>" in s or "<summary>" in s or "<p>" in s or "<br" in s):
            i += 1
            continue

        if stripped == "":
            i += 1
            continue

        if stripped.startswith("> "):
            quotes = [stripped[2:]]
            i += 1
            while i < n:
                t = lines[i].strip()
                if t.startswith("> "):
                    quotes.append(t[2:])
                    i += 1
                elif t == "":
                    i += 1
                    break
                else:
                    break
            blocks.append({"type": "quote", "html": parse_inline(" ".join(quotes))})
            continue

        if re.match(r"^[-*] ", stripped) or re.match(r"^\d+\. ", stripped):
            items = []
            i += 1
            while i < n:
                t = lines[i].strip()
                m = re.match(r"^([-*]|\d+\.) (.*)$", t)
                if m:
                    items.append(parse_inline(m.group(2)))
                    i += 1
                elif t == "":
                    i += 1
                else:
                    break
            blocks.append({"type": "list", "items": items})
            continue

        is_ref = "kubernetes.io" in stripped or stripped.startswith("http://") or stripped.startswith("https://")
        blocks.append({
            "type": "ref" if is_ref else "text",
            "html": parse_inline(stripped),
        })
        i += 1

    return blocks


def parse_file(path, slug):
    with open(path, "r", encoding="utf-8") as fh:
        lines = fh.read().splitlines()

    topic = {
        "slug": slug,
        "title": "",
        "weight": None,
        "preamble": [],
        "sections": [],
    }

    current_section = None
    current_exercise = None
    ex_buffer = []
    ex_in_details = False
    ans_buffer = []
    exercise_count = 0

    def flush_exercise():
        nonlocal current_exercise, ex_buffer, ans_buffer, ex_in_details, current_section
        if current_exercise is None:
            return
        setup = parse_blocks(ex_buffer)
        answer = parse_blocks(ans_buffer)
        if not setup and not answer:
            current_exercise = None
            ex_buffer, ans_buffer = [], []
            ex_in_details = False
            return
        current_exercise["setup"] = setup
        current_exercise["answer"] = answer
        if current_section is None:
            current_section = {"heading": "Exercises", "blocks": []}
            topic["sections"].append(current_section)
        current_section["blocks"].append(current_exercise)
        current_exercise = None
        ex_buffer, ans_buffer = [], []
        ex_in_details = False

    def new_section(heading):
        nonlocal current_section, current_exercise
        current_section = {"heading": heading, "id": slugify(heading), "blocks": []}
        topic["sections"].append(current_section)

    def open_exercise(question):
        nonlocal current_exercise, ex_buffer, ans_buffer, ex_in_details, exercise_count
        current_exercise = {
            "type": "exercise",
            "id": "ex-" + str(exercise_count),
            "question": parse_inline(question),
            "setup": [],
            "answer": [],
        }
        exercise_count += 1
        ex_buffer, ans_buffer = [], []
        ex_in_details = False

    for line in lines:
        s = line.strip()

        if s.startswith("!["):
            continue

        if current_exercise is not None:
            if not ex_in_details:
                if "<details>" in s:
                    ex_in_details = True
                    rest = strip_tags(line).strip()
                    if rest:
                        ans_buffer.append(rest)
                elif s.startswith("### "):
                    flush_exercise()
                    open_exercise(s[4:].strip())
                else:
                    ex_buffer.append(line)
            else:
                if "</details>" in s:
                    flush_exercise()
                else:
                    if strip_tags(line).strip() or s.startswith("```"):
                        ans_buffer.append(line)
            continue

        if s.startswith("# "):
            if not topic["title"]:
                title = s[2:].strip()
                m = re.search(r"\((\d+%)\)\s*$", title)
                if m:
                    topic["weight"] = m.group(1)
                    title = title[: m.start()].strip()
                topic["title"] = title
            continue

        if s.startswith("## "):
            flush_exercise()
            new_section(s[3:].strip())
            continue

        if s.startswith("### "):
            flush_exercise()
            open_exercise(s[4:].strip())
            continue

        if "<details>" in s:
            q = "Exercise"
            if current_section is not None and current_section["blocks"]:
                last = current_section["blocks"][-1]
                if isinstance(last, dict) and last.get("type") == "text":
                    q = re.sub(r"<[^>]+>", "", last.get("html", "")).strip() or q
                    current_section["blocks"].pop()
            open_exercise(q)
            ex_in_details = True
            rest = strip_tags(line).strip()
            if rest:
                ans_buffer.append(rest)
            continue

        cleaned = strip_tags(line).strip()
        if not cleaned:
            continue
        block = {"type": "text", "html": parse_inline(cleaned)}
        if "kubernetes.io" in s or s.startswith("http://") or s.startswith("https://"):
            block["type"] = "ref"
        if current_section is not None:
            current_section["blocks"].append(block)
        else:
            topic["preamble"].append(block)

    flush_exercise()
    topic["count"] = exercise_count
    return topic


def main():
    os.makedirs(OUT, exist_ok=True)

    topics_meta = []
    search = []

    for fname, slug, title, weight, description in TOPICS:
        path = os.path.join(SRC, fname)
        if not os.path.exists(path):
            print("missing", path)
            sys.exit(1)
        topic = parse_file(path, slug)
        topic["title"] = topic["title"] or title
        topic["weight"] = topic["weight"] or weight
        topic["description"] = description
        topic["file"] = fname

        for section in topic["sections"]:
            for block in section["blocks"]:
                if block.get("type") != "exercise":
                    continue
                q_text = re.sub(r"<[^>]+>", "", block["question"])
                answer_text = " ".join(
                    b.get("code", "") or re.sub(r"<[^>]+>", "", b.get("html", ""))
                    for b in block["setup"] + block["answer"]
                    if isinstance(b, dict)
                )
                search.append({
                    "slug": slug,
                    "title": topic["title"],
                    "question": q_text,
                    "answer": answer_text[:3000],
                    "anchor": block["id"],
                })

        with open(os.path.join(OUT, slug + ".js"), "w", encoding="utf-8") as fh:
            fh.write("window.CKAD_TOPIC = ")
            json.dump(topic, fh, ensure_ascii=False, indent=2)
            fh.write(";\n")

        topics_meta.append({
            "slug": slug,
            "title": topic["title"],
            "weight": topic["weight"],
            "description": description,
            "file": fname,
            "count": topic["count"],
        })
        print("generated", slug, "(%d exercises)" % topic["count"])

    with open(os.path.join(OUT, "topics.js"), "w", encoding="utf-8") as fh:
        fh.write("window.CKAD_TOPICS = ")
        json.dump(topics_meta, fh, ensure_ascii=False, indent=2)
        fh.write(";\n")

    with open(os.path.join(OUT, "search.js"), "w", encoding="utf-8") as fh:
        fh.write("window.CKAD_SEARCH = ")
        json.dump(search, fh, ensure_ascii=False, indent=2)
        fh.write(";\n")

    print("total exercises:", sum(t["count"] for t in topics_meta))


if __name__ == "__main__":
    main()
