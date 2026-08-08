/* CKAD Exercises - static renderer.
   Reads the window.CKAD_* data files and renders pages client-side.
   No build step required; works from file:// or any static server.

   Components (all are small factory functions returning DOM nodes):
     Header (hamburger + Brand + SearchBox + ThemeToggle)
     DesktopSidebar, MobileDrawer, TopicLink, SectionLink, SidebarContent
     TopicHeader, Preamble, AnswerActions, Section
     ExerciseCard, CodeBlock, BlockRenderer
     BackToTop, SearchBox (with results dropdown)
*/
(function () {
  "use strict";

  var TOPICS = window.CKAD_TOPICS || [];
  var TOPIC = window.CKAD_TOPIC || null;
  var SEARCH = window.CKAD_SEARCH || [];

  var body = document.body;
  var topicSlug = body.getAttribute("data-topic");
  var isIndex = body.hasAttribute("data-index");

  var SITE = "CKAD Exercises";
  var SITE_TITLE = "Certified Kubernetes Application Developer (CKAD)";
  var SITE_DESC =
    "A fully static set of hands-on exercises organized by curriculum domain, " +
    "converted from the CKAD-exercises repository. Read the official Kubernetes docs first, " +
    "then drill the exercises - click a question to reveal its solution.";

  var app = document.getElementById("app");

  var ICONS = {
    search:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    chev:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    up: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
    menu: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  /* ---------- tiny DOM helpers ---------- */
  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function cx() {
    return Array.prototype.slice.call(arguments).filter(Boolean).join(" ");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- lightweight syntax highlighting ---------- */
  var KWORDS = new Set(
    (
      "apiVersion kind metadata spec containers initContainers name image labels selector matchLabels " +
      "volumes volumeMounts mountPath env envFrom valueFrom configMapKeyRef secretKeyRef configMapRef " +
      "resources requests limits command args ports containerPort port protocol targetPort status replicas " +
      "template serviceAccountName serviceAccount namespace emptyDir persistentVolumeClaim claimName hostPath " +
      "accessModes storageClassName capacity storage readOnly readinessProbe livenessProbe exec httpGet path " +
      "tolerations nodeSelector nodeName restartPolicy dnsPolicy imagePullPolicy creationTimestamp " +
      "completions completionMode parallelism activeDeadlineSeconds schedule jobTemplate " +
      "successfulJobsHistoryLimit failedJobsHistoryLimit type key value operator effect min max memory cpu " +
      "secretName configMap group versions scope names plural singular shortNames openAPIV3Schema " +
      "properties version served storage service ip kind k create get delete apply run expose describe logs " +
      "exec label annotate edit set rollout undo scale autoscale pause resume top cp wait list configmap " +
      "secret cronjob job deployment ingress svc ns ep pv pvc sa quota limitrange hpa pod namespace rolebinding " +
      "node externalName loadBalancer ClusterIP NodePort host pathType backend rules ingressClassName class"
    ).split(/\s+/)
  );

  var TOKEN_RE = /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(#[^\n]*)|(\b[A-Za-z][A-Za-z0-9_.-]*\b)|(\b\d+(?:\.\d+)?(?:m|Mi|Gi|G|Ki|K)?\b)/g;

  function hl(code) {
    var esc = escapeHtml(code);
    var out = "";
    var last = 0;
    var m;
    while ((m = TOKEN_RE.exec(esc))) {
      if (m.index > last) out += esc.slice(last, m.index);
      if (m[1]) out += '<span class="token-s">' + m[1] + "</span>";
      else if (m[2]) out += '<span class="token-c">' + m[2] + "</span>";
      else if (m[3]) out += KWORDS.has(m[3]) ? '<span class="token-k">' + m[3] + "</span>" : m[3];
      else if (m[4]) out += '<span class="token-n">' + m[4] + "</span>";
      last = TOKEN_RE.lastIndex;
    }
    return out + esc.slice(last);
  }

  /* ---------- copy-to-clipboard ---------- */
  function copyToClipboard(text, btn) {
    function done() {
      btn.textContent = "Copied";
      btn.classList.add("text-emerald-600", "dark:text-emerald-400");
      setTimeout(function () {
        btn.textContent = "Copy";
        btn.classList.remove("text-emerald-600", "dark:text-emerald-400");
      }, 1500);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) { /* noop */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done)["catch"](function () {
        fallback();
      });
    } else {
      fallback();
    }
  }

  /* ---------- Header: Brand ---------- */
  function Brand() {
    var a = el("a", "group flex shrink-0 items-center gap-2.5", null);
    a.href = "index.html";
    a.appendChild(
      el(
        "span",
        "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-extrabold text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105",
        "K"
      )
    );
    a.appendChild(el("span", "hidden text-[15px] font-bold tracking-tight text-slate-900 sm:inline dark:text-white", SITE));
    return a;
  }

  /* ---------- Navigation: TopicLink ---------- */
  function TopicLink(t) {
    var active = t.slug === topicSlug;
    var a = el(
      "a",
      cx(
        "group flex items-center justify-between gap-2 rounded-lg border-l-2 px-3 py-2.5 text-[13px] leading-snug transition-colors",
        active
          ? "border-indigo-500 bg-indigo-50 font-semibold text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
          : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      ),
      t.title
    );
    a.href = t.slug + ".html";
    if (t.weight) {
      a.appendChild(el("span", "shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400", t.weight));
    }
    return a;
  }

  /* ---------- Navigation: SectionLink ---------- */
  function SectionLink(sec) {
    var n = sec.blocks.filter(function (b) {
      return b.type === "exercise";
    }).length;
    var a = el(
      "a",
      "block rounded-lg border-l-2 border-transparent px-3 py-2 text-[13px] text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
      escapeHtml(sec.heading) + ' <span class="text-slate-400 dark:text-slate-500">(' + n + ")</span>"
    );
    a.href = "#" + sec.id;
    a.setAttribute("data-section", sec.id);
    return a;
  }

  /* ---------- Navigation: shared content (topics + on-this-page) ---------- */
  function SidebarContent() {
    var box = el("div", "flex flex-col gap-8");
    var topicsGroup = el("div", "");
    topicsGroup.appendChild(el("h4", "mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500", "Topics"));
    var nav = el("nav", "flex flex-col gap-0.5");
    TOPICS.forEach(function (t) {
      nav.appendChild(TopicLink(t));
    });
    topicsGroup.appendChild(nav);
    box.appendChild(topicsGroup);

    if (!isIndex && TOPIC && TOPIC.sections.length) {
      var pageGroup = el("div", "");
      pageGroup.appendChild(el("h4", "mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500", "On this page"));
      var pageNav = el("nav", "flex flex-col gap-0.5");
      TOPIC.sections.forEach(function (sec) {
        pageNav.appendChild(SectionLink(sec));
      });
      pageGroup.appendChild(pageNav);
      box.appendChild(pageGroup);
    }
    return box;
  }

  /* ---------- Navigation: desktop rail ---------- */
  function DesktopSidebar() {
    var aside = el(
      "aside",
      "sidebar fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r border-slate-200 bg-white px-4 py-8 lg:block dark:border-slate-800 dark:bg-slate-950"
    );
    aside.appendChild(SidebarContent());
    return aside;
  }

  /* ---------- Navigation: mobile drawer ---------- */
  function MobileDrawer() {
    var overlay = el("div", "fixed inset-0 z-40 hidden bg-slate-900/50 backdrop-blur-sm");
    var panel = el(
      "aside",
      "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] -translate-x-full transform overflow-hidden bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900"
    );
    var head = el("div", "flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800");
    head.appendChild(el("span", "text-[15px] font-bold tracking-tight text-slate-900 dark:text-white", SITE));
    var closeBtn = el("button", "flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white", ICONS.close);
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close menu");
    head.appendChild(closeBtn);
    panel.appendChild(head);

    var content = el("div", "drawer-scroll h-full overflow-y-auto px-4 py-8");
    content.appendChild(SidebarContent());
    panel.appendChild(content);

    var root = el("div", "lg:hidden");
    root.appendChild(overlay);
    root.appendChild(panel);

    function open() {
      overlay.classList.remove("hidden");
      panel.classList.remove("-translate-x-full");
      document.body.style.overflow = "hidden";
    }
    function close() {
      overlay.classList.add("hidden");
      panel.classList.add("-translate-x-full");
      document.body.style.overflow = "";
    }
    overlay.addEventListener("click", close);
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    return { root: root, open: open, close: close };
  }

  /* ---------- MainShell ---------- */
  function MainShell(inner) {
    var main = el("main", "min-h-screen pb-24 lg:pl-64");
    main.appendChild(inner);
    return main;
  }

  /* ---------- Header: SearchBox ---------- */
  function SearchBox() {
    var wrap = el("div", "search-box relative w-44 sm:w-64");
    var icon = el("span", "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500", ICONS.search);
    var input = el(
      "input",
      "h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    );
    input.type = "search";
    input.placeholder = "Search exercises\u2026";
    input.setAttribute("aria-label", "Search exercises");

    var kbd = el("kbd", "pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center rounded-sm border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:flex dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400", "/");

    var results = el(
      "div",
      "search-results absolute right-0 top-full z-50 mt-2 hidden max-h-[70vh] w-[min(24rem,90vw)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
    );

    wrap.appendChild(icon);
    wrap.appendChild(input);
    wrap.appendChild(kbd);
    wrap.appendChild(results);
    setupSearch(input, results);
    return wrap;
  }

  function setupSearch(input, results) {
    var timer;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        runSearch(input.value.trim());
      }, 120);
    });
    input.addEventListener("focus", function () {
      if (input.value.trim().length >= 2) results.classList.remove("hidden");
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-box")) results.classList.add("hidden");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        results.classList.add("hidden");
        input.blur();
      }
      if (e.key === "/" && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault();
        input.focus();
      }
    });

    function runSearch(q) {
      results.innerHTML = "";
      if (q.length < 2) {
        results.classList.add("hidden");
        return;
      }
      var ql = q.toLowerCase();
      var hits = SEARCH.filter(function (item) {
        return (
          item.question.toLowerCase().indexOf(ql) !== -1 ||
          item.answer.toLowerCase().indexOf(ql) !== -1 ||
          item.title.toLowerCase().indexOf(ql) !== -1
        );
      }).slice(0, 30);

      if (!hits.length) {
        results.appendChild(el("div", "px-3 py-3 text-sm text-slate-600 dark:text-slate-300", "No matches for \u201c" + escapeHtml(q) + "\u201d."));
        results.classList.remove("hidden");
        return;
      }
      results.appendChild(
        el(
          "div",
           "px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300",
          hits.length + (hits.length === 30 ? "+" : "") + " result" + (hits.length === 1 ? "" : "s")
        )
      );
      hits.forEach(function (item) {
        var link = el(
          "a",
          "block rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
          null
        );
        link.href = item.slug + ".html#" + item.anchor;
        link.appendChild(
           el("div", "text-[11px] font-semibold text-slate-500 dark:text-slate-300", item.title + (item.weight ? " \u00b7 " + item.weight : ""))
        );
        link.appendChild(el("div", "mt-0.5 text-[13px] leading-snug text-slate-800 dark:text-slate-200", highlight(q, item.question)));
        results.appendChild(link);
      });
      results.classList.remove("hidden");
    }

    function highlight(q, text) {
      var i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i === -1) {
        return escapeHtml(text.length > 180 ? text.slice(0, 180) + "\u2026" : text);
      }
      var start = Math.max(0, i - 35);
      var prefix = start > 0 ? "\u2026" : "";
      var slice = text.slice(start, start + 180);
      var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      return (
        prefix +
        escapeHtml(slice).replace(re, '<mark class="rounded-sm bg-amber-300 px-0.5 text-slate-900 dark:bg-amber-400/80 dark:text-slate-950">$1</mark>')
      );
    }
  }

  /* ---------- Header ---------- */
  function Header(onMenu) {
    var totalCount = 0;
    TOPICS.forEach(function(t){ totalCount += t.count || 0; });
    var currentCount = 0;
    if (TOPIC && TOPIC.sections) {
      TOPIC.sections.forEach(function(sec){
        (sec.blocks || []).forEach(function(b){
          if (b.type === "exercise") currentCount++;
        });
      });
    }

    var inner = el("div", "flex h-16 w-full items-center gap-3 px-4 sm:px-6 lg:pl-[calc(16rem+1.5rem)]");
    var menu = el("button", "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white", ICONS.menu);
    menu.type = "button";
    menu.setAttribute("aria-label", "Open menu");
    if (onMenu) menu.addEventListener("click", onMenu);
    inner.appendChild(menu);
    inner.appendChild(Brand());
    if (totalCount) {
      inner.appendChild(
        el("span", "hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20",
          "Total: " + totalCount +
          (currentCount ? "  ·  " + TOPIC.title + ": " + currentCount : "")
        )
      );
    }
    inner.appendChild(el("div", "flex-1"));
    inner.appendChild(SearchBox());
    if (window.CKADTheme) inner.appendChild(window.CKADTheme.createButton());
    var header = el("header", "sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85");
    header.appendChild(inner);
    return header;
  }

  /* ---------- BlockRenderer (shared) ---------- */
  function renderBlocks(blocks, container) {
    (blocks || []).forEach(function (b) {
      if (b.type === "code") {
        container.appendChild(CodeBlock(b));
      } else if (b.type === "text") {
        container.appendChild(el("p", "my-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300", b.html || ""));
      } else if (b.type === "ref") {
        container.appendChild(
          el("p", "my-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300", b.html || "")
        );
      } else if (b.type === "quote") {
        container.appendChild(
          el("p", "my-2 rounded-r-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-400 dark:bg-amber-500/10 dark:text-amber-100", b.html || "")
        );
      } else if (b.type === "list") {
        var ul = el("ul", "my-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300");
        (b.items || []).forEach(function (item) {
          ul.appendChild(el("li", "", item));
        });
        container.appendChild(ul);
      }
    });
  }

  /* ---------- CodeBlock ---------- */
  function CodeBlock(block) {
    var head = el("div", "flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2 dark:border-slate-700 dark:bg-slate-800");
    var dots = el("div", "flex items-center gap-1.5");
    dots.appendChild(el("span", "h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600"));
    dots.appendChild(el("span", "h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600"));
    dots.appendChild(el("span", "h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600"));
    head.appendChild(dots);
    head.appendChild(
      el("span", "text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300", block.language || "text")
    );
    var copy = el(
      "button",
      "copy-btn rounded-md border border-transparent px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    );
    copy.type = "button";
    copy.textContent = "Copy";
    copy.addEventListener("click", function () {
      copyToClipboard(block.code, copy);
    });
    head.appendChild(copy);

    var code = el("code", "font-mono text-[13px] leading-relaxed text-slate-900 dark:text-slate-100");
    code.innerHTML = hl(block.code);
    var pre = el("pre", "overflow-x-auto p-5");
    pre.appendChild(code);

    var box = el("div", "code-block my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900");
    box.appendChild(head);
    box.appendChild(pre);
    return box;
  }

  /* ---------- ExerciseCard ----------
     Each question keeps its own card. Design: solid indigo accent bar on the
     left edge + soft indigo-tinted header, white body. No number badge.
     Reference-link cards are plain text (no accent bar or bg wash). */
  function ExerciseCard(block) {
    var wrap = el(
      "div",
      "exercise scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer dark:border-slate-800 dark:border-l-indigo-400 dark:bg-slate-900"
    );
    wrap.id = block.id;

    var q = el(
      "button",
      "exercise-question flex w-full items-center gap-3 bg-gradient-to-r from-indigo-50/80 to-transparent px-5 py-5 text-left transition-colors hover:from-indigo-100/80 dark:from-indigo-500/10 dark:to-transparent dark:hover:from-indigo-500/20 cursor-pointer"
    );
    q.type = "button";
    q.setAttribute("aria-expanded", "false");
    q.appendChild(el("span", "flex-1 font-semibold leading-snug text-slate-900 dark:text-slate-100", block.question || ""));
    var chev = el("span", "chev flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-white text-indigo-500 transition-all duration-200 dark:border-indigo-500/30 dark:bg-slate-900 dark:text-indigo-400", ICONS.chev);
    q.appendChild(chev);
    q.addEventListener("click", function () {
      setOpen(wrap, !wrap.classList.contains("open"));
    });
    wrap.appendChild(q);

    var body = el("div", "px-5");
    if (block.setup && block.setup.length) {
      var setup = el("div", "exercise-setup pb-5 pt-4");
      setup.appendChild(el("div", "mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300", "Task context"));
      renderBlocks(block.setup, setup);
      body.appendChild(setup);
    }

    var answer = el("div", "exercise-answer mt-3 hidden border-t border-slate-100 pb-5 pt-3 dark:border-slate-800");
    answer.appendChild(el("div", "mb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400", "Solution"));
    if (block.answer && block.answer.length) {
      renderBlocks(block.answer, answer);
    } else {
      answer.appendChild(el("p", "text-sm italic text-slate-400 dark:text-slate-500", "No solution provided."));
    }
    body.appendChild(answer);
    wrap.appendChild(body);
    return wrap;
  }

  function setOpen(ex, open) {
    ex.classList.toggle("open", open);
    var q = ex.querySelector(".exercise-question");
    if (q) q.setAttribute("aria-expanded", open ? "true" : "false");
    var chev = ex.querySelector(".chev");
    if (chev) chev.classList.toggle("rotate-180", open);
    var ans = ex.querySelector(".exercise-answer");
    if (ans) ans.classList.toggle("hidden", !open);
  }

  function setActiveSection(id) {
    var links = document.querySelectorAll(".sidebar a[data-section]");
    links.forEach(function (a) {
      a.classList.toggle("border-transparent", a.getAttribute("data-section") !== id);
      a.classList.toggle("border-indigo-500", a.getAttribute("data-section") === id);
      a.classList.toggle("bg-indigo-50", a.getAttribute("data-section") === id);
      a.classList.toggle("text-indigo-700", a.getAttribute("data-section") === id);
      a.classList.toggle("dark:bg-indigo-500/10", a.getAttribute("data-section") === id);
      a.classList.toggle("dark:text-indigo-300", a.getAttribute("data-section") === id);
      a.classList.toggle("dark:border-indigo-400", a.getAttribute("data-section") === id);
    });
  }

  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".sidebar a[data-section]"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var sections = links
      .map(function (a) {
        return document.getElementById(a.getAttribute("data-section"));
      })
      .filter(Boolean);
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    sections.forEach(function (s) {
      observer.observe(s);
    });
  }

  /* ---------- topic page ---------- */
  function renderTopic() {
    if (!TOPIC) {
      app.appendChild(el("div", "p-10 text-center text-slate-400", "Topic data not found."));
      return;
    }
    document.title = TOPIC.title + " \u00b7 " + SITE;

    var content = el("div", "mx-auto max-w-5xl px-4 pt-10 sm:px-6");

    /* header */
    var header = el("div", "topic-header mb-8");
    header.appendChild(
      el(
        "div",
        "mb-2 text-[13px] text-slate-500 dark:text-slate-400",
        '<a href="index.html" class="hover:text-slate-600 dark:hover:text-slate-300">' + SITE + '</a> \u00b7 ' + escapeHtml(TOPIC.title)
      )
    );
    header.appendChild(el("h1", "text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white", TOPIC.title));
    if (TOPIC.description) {
      header.appendChild(el("p", "mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400", escapeHtml(TOPIC.description)));
    }
    var meta = el("div", "mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400");
    if (TOPIC.weight) {
      meta.appendChild(el("span", "rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30", TOPIC.weight));
    }
    meta.appendChild(el("span", "", TOPIC.count + " exercises"));
    header.appendChild(meta);
    content.appendChild(header);

    /* preamble / docs */
    if (TOPIC.preamble && TOPIC.preamble.length) {
      var intro = el("div", "mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60");
      intro.appendChild(el("div", "mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500", "Reference docs"));
      renderBlocks(TOPIC.preamble, intro);
      content.appendChild(intro);
    }

    /* expand/collapse actions */
    var actions = el("div", "mb-8 flex flex-wrap gap-2");
    var expandBtn = el("button", "rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400", "Expand all answers");
    var collapseBtn = el("button", "rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400", "Collapse all answers");
    expandBtn.type = "button";
    collapseBtn.type = "button";
    expandBtn.addEventListener("click", function () {
      document.querySelectorAll(".exercise").forEach(function (e) {
        setOpen(e, true);
      });
    });
    collapseBtn.addEventListener("click", function () {
      document.querySelectorAll(".exercise").forEach(function (e) {
        setOpen(e, false);
      });
    });
    actions.appendChild(expandBtn);
    actions.appendChild(collapseBtn);
    content.appendChild(actions);

    /* sections + exercises */
    TOPIC.sections.forEach(function (sec) {
      var section = el("div", "section mb-12 scroll-mt-24 space-y-5");
      var exCount = sec.blocks.filter(function (b) {
        return b.type === "exercise";
      }).length;
      var h2 = el("h2", "mb-4 flex items-baseline gap-2 border-b border-slate-200 pb-3 text-xl font-bold tracking-tight text-slate-900 dark:border-slate-800 dark:text-white");
      h2.appendChild(el("span", "shrink-0 self-center h-5 w-1 rounded-full bg-indigo-500 dark:bg-indigo-400"));
      h2.appendChild(el("span", "", escapeHtml(sec.heading) + ' <span class="text-sm font-normal text-slate-400 dark:text-slate-500">(' + exCount + " exercises)</span>"));
      h2.id = sec.id;
      section.appendChild(h2);

      sec.blocks.forEach(function (block) {
        if (block.type === "exercise") {
          section.appendChild(ExerciseCard(block));
        } else {
          var wrap = el("div", "section-block");
          renderBlocks([block], wrap);
          section.appendChild(wrap);
        }
      });
      content.appendChild(section);
    });

    app.appendChild(MainShell(content));

    setupScrollSpy();
    handleHash();
    window.addEventListener("hashchange", handleHash);
  }

  /* ---------- index page ---------- */
  function renderIndex() {
    document.title = SITE_TITLE + " - " + SITE;

    var totalExercises = TOPICS.reduce(function (sum, t) {
      return sum + (t.count || 0);
    }, 0);
    var weighted = TOPICS.filter(function (t) {
      return t.weight;
    });

    var page = el("div", "mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6");

    var hero = el("div", "mx-auto max-w-2xl text-center");
    hero.appendChild(
      el(
        "span",
        "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30 dark:from-indigo-500 dark:to-indigo-400 dark:text-white",
        "CKAD exam prep \u00b7 " + totalExercises + " exercises \u00b7 fully static"
      )
    );
    hero.appendChild(
      el(
        "h1",
        "mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white",
        SITE_TITLE
      )
    );
    hero.appendChild(el("p", "mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400", SITE_DESC));
    var stats = el(
      "div",
      "mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
    );
    stats.appendChild(el("span", "", "<b class=\"text-slate-900 dark:text-white\">" + TOPICS.length + "</b> topics"));
    stats.appendChild(el("span", "", "<b class=\"text-slate-900 dark:text-white\">" + totalExercises + "</b> exercises"));
    stats.appendChild(el("span", "", "<b class=\"text-slate-900 dark:text-white\">" + weighted.length + "</b> weighted exam domains"));
    hero.appendChild(stats);
    page.appendChild(hero);

    var grid = el("div", "mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3");
    TOPICS.forEach(function (t) {
      var card = el(
        "a",
        "group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/60",
        null
      );
      card.href = t.slug + ".html";
      var top = el("div", "flex items-start justify-between gap-3");
      top.appendChild(el("h3", "text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100", t.title));
      if (t.weight) {
        top.appendChild(el("span", "shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300", t.weight));
      }
      card.appendChild(top);
      card.appendChild(el("p", "mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400", t.description));
      var foot = el(
        "div",
        "mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500"
      );
      foot.appendChild(el("span", "", t.count + " exercise" + (t.count === 1 ? "" : "s")));
      foot.appendChild(el("span", "font-medium text-indigo-600 transition-transform group-hover:translate-x-0.5 dark:text-indigo-400", "Open \u2192"));
      card.appendChild(foot);
      grid.appendChild(card);
    });
    page.appendChild(grid);

    page.appendChild(
      el(
        "p",
        "mt-14 border-t border-slate-200 pt-6 text-center text-xs leading-relaxed text-slate-400 dark:border-slate-800 dark:text-slate-500",
        "This site is an unofficial study aid for the CNCF CKAD exam. Built with Tailwind CSS."
      )
    );
    app.appendChild(MainShell(page));
  }

  /* ---------- shared bits ---------- */
  function handleHash() {
    var hash = decodeURIComponent(location.hash || "");
    if (!hash) return;
    var node = document.getElementById(hash.slice(1));
    if (!node) return;
    if (node.classList.contains("exercise")) {
      setOpen(node, true);
    }
    setTimeout(function () {
      if (node.scrollIntoView) node.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function BackToTop() {
    var btn = el("button", "fixed bottom-6 right-6 z-50 hidden h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-600 hover:to-indigo-800", ICONS.up);
    btn.type = "button";
    btn.setAttribute("aria-label", "Back to top");
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", function () {
      btn.classList.toggle("hidden", window.scrollY <= 600);
      btn.classList.toggle("flex", window.scrollY > 600);
    });
    return btn;
  }

  /* ---------- overlay scrollbars ---------- */
  function showScrollbar(el, wait) {
    var timer;
    el.addEventListener("scroll", function () {
      el.classList.add("is-scrolling");
      clearTimeout(timer);
      timer = setTimeout(function () {
        el.classList.remove("is-scrolling");
      }, wait || 400);
    });
  }

  /* ---------- boot ---------- */
  document.body.className =
    "min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100";
  var drawer = MobileDrawer();
  app.appendChild(Header(drawer.open));
  app.appendChild(drawer.root);
  app.appendChild(DesktopSidebar());

  if (isIndex) {
    renderIndex();
  } else {
    renderTopic();
  }
  app.appendChild(BackToTop());

  /* overlay scrollbars: sidebar, search results, drawer, page window */
  showScrollbar(document.querySelector(".sidebar"), 500);
  var resultsBox = document.querySelector(".search-results");
  if (resultsBox) showScrollbar(resultsBox, 500);
  var drawerContent = document.querySelector(".drawer-scroll");
  if (drawerContent) showScrollbar(drawerContent, 500);
  showScrollbar(document.documentElement, 500);
})();
