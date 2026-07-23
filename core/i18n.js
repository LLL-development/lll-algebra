/* ============================================================
   LLL Algebra — core i18n engine
   Reused from lll-chem as-is — the engine itself is generic.
   Game-specific strings are passed in from index.html via
   LLL_I18N.init(toolStrings) and merged with these COMMON ones.
   ============================================================ */
(function (global) {
  "use strict";

  // Scoped to EN/JA only for now — add the rest back (zh-Hans, zh-Hant,
  // ko, ms) once Philip asks for full language coverage. Keeping the
  // COMMON dict structure the same shape so re-adding them later is just
  // uncommenting entries from lll-chem's version, not rewriting anything.
  var LANGS = [
    { code: "ja",      label: "\u65e5\u672c\u8a9e" },
    { code: "en",      label: "English" }
  ];

  var COMMON = {
    "ja": { dropHint: "\u307e\u305f\u306f\u3053\u3053\u306b\u30d5\u30a1\u30a4\u30eb\u3092\u30c9\u30ed\u30c3\u30d7", loading: "\u8aad\u307f\u8fbc\u307f\u4e2d\u2026", themeAria: "\u30c6\u30fc\u30de\u3092\u5207\u308a\u66ff\u3048", chooseBtn: "\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u629e", back: "\u623b\u308b", newTab: "\u65b0\u3057\u3044\u30bf\u30d6", backAria: "\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u753b\u9762\u306b\u623b\u308b", newTabAria: "\u65b0\u3057\u3044\u30bf\u30d6\u3067\u958b\u304f", langAria: "\u8a00\u8a9e" },
    "en": { dropHint: "or drop a file here", loading: "Loading\u2026", themeAria: "Toggle theme", chooseBtn: "Choose file", back: "Back", newTab: "New tab", backAria: "Back to upload", newTabAria: "Open in a new tab", langAria: "Language" }
  };

  var DEFAULT_LANG = "ja";
  var STORAGE_KEY = "lll_lang";

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var dicts = {};
  var current = {};
  var selectEl = null;
  var onChangeCb = null;

  function apply(code) {
    var dict = dicts[code] || dicts[DEFAULT_LANG];
    current = dict;

    document.documentElement.lang = code;
    if (dict.brand) document.title = dict.brand;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (dict[key] != null) el.setAttribute("aria-label", dict[key]);
    });

    if (selectEl) selectEl.value = code;
    safeSet(STORAGE_KEY, code);
    if (typeof onChangeCb === "function") onChangeCb(current, code);
  }

  function buildSwitcher(host) {
    var wrap = document.createElement("div");
    wrap.className = "lang-switch" + (host.getAttribute("data-fixed") === "true" ? " fixed" : "");
    wrap.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>' +
      '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' +
      '</svg>';
    var sel = document.createElement("select");
    sel.setAttribute("data-i18n-aria", "langAria");
    sel.setAttribute("aria-label", "Language");
    LANGS.forEach(function (l) {
      var o = document.createElement("option");
      o.value = l.code;
      o.textContent = l.label;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function (e) { apply(e.target.value); });
    wrap.appendChild(sel);
    host.appendChild(wrap);
    selectEl = sel;
  }

  var API = {
    langs: LANGS,
    t: function (key) { return current[key]; },
    lang: function () { return document.documentElement.lang; },
    init: function (toolStrings, opts) {
      opts = opts || {};
      onChangeCb = opts.onChange || null;

      LANGS.forEach(function (l) {
        var c = l.code;
        var merged = {};
        var base = COMMON[c] || {};
        for (var k in base) merged[k] = base[k];
        var extra = (toolStrings && toolStrings[c]) || {};
        for (var k2 in extra) merged[k2] = extra[k2];
        dicts[c] = merged;
      });

      if (opts.switcherHost) buildSwitcher(opts.switcherHost);

      var stored = safeGet(STORAGE_KEY);
      apply(stored && dicts[stored] ? stored : DEFAULT_LANG);
    }
  };

  global.LLL_I18N = API;
})(window);