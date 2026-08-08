/* Theme management for CKAD Exercises.
   Adds/removes the `dark` class on <html>, persists the choice in
   localStorage, falls back to the OS preference, and exposes a reusable
   toggle button component. The no-flash init happens in an inline script
   in each page's <head>. */
(function () {
  "use strict";

  var KEY = "ckad-theme";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function prefersDark() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (e) { return false; }
  }

  function current() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }

  function apply(theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem(KEY, theme); } catch (e) { /* private mode */ }
  }

  function toggle() {
    apply(current() === "dark" ? "light" : "dark");
  }

  var ICONS = {
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  };

  /* Reusable toggle-button component. */
  function createButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.title = "Toggle color theme";
    btn.className =
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 " +
      "bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 " +
      "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white";

    function sync() {
      var dark = current() === "dark";
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.innerHTML = dark ? ICONS.sun : ICONS.moon;
    }

    sync();
    btn.addEventListener("click", function () {
      toggle();
      sync();
    });
    return btn;
  }

  window.CKADTheme = {
    current: current,
    apply: apply,
    toggle: toggle,
    createButton: createButton
  };
})();
