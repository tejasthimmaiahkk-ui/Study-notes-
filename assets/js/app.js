/* ==========================================================================
   Study Notes — shared page framework
   Builds the top bar, sidebar table of contents, progress tracking,
   callout headers, MCQ quizzes and boots the interactive demos.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Site map ---------- */
  var SITE = {
    crypto: {
      name: "Cryptography & Network Security", code: "24BCA54", dir: "cryptography-network-security",
      pages: [
        { f: "unit1.html", pill: "Unit I", t: "Fundamentals & Mathematical Foundations" },
        { f: "unit2.html", pill: "Unit II", t: "Symmetric Key Cryptography" },
        { f: "unit3.html", pill: "Unit III", t: "Public Key Cryptography & Hashing" },
        { f: "unit4.html", pill: "Unit IV", t: "Digital Signatures, Key Management & Network Security" },
        { f: "revision.html", pill: "Revision", t: "Revision & Exam Kit" }
      ]
    },
    quant: {
      name: "Quantitative Techniques", code: "24BCASE2", dir: "quantitative-techniques",
      pages: [
        { f: "unit1.html", pill: "Unit I", t: "Core Arithmetic & Algebra" },
        { f: "unit2.html", pill: "Unit II", t: "Data Interpretation & Advanced Aptitude" },
        { f: "revision.html", pill: "Revision", t: "Formula Sheet & Mock Test" }
      ]
    },
    da: {
      name: "Data Analytics", code: "24BCA52", dir: "data-analytics",
      pages: [
        { f: "unit1.html", pill: "Unit I", t: "Introduction to Data Analytics" },
        { f: "unit2.html", pill: "Unit II", t: "Correlation & Regression" },
        { f: "unit3.html", pill: "Unit III", t: "Probability, Distributions & Hypothesis Testing" },
        { f: "unit4.html", pill: "Unit IV", t: "Power BI & Business Intelligence" },
        { f: "revision.html", pill: "Revision", t: "Revision & Exam Kit" }
      ]
    }
  };
  window.SITE = SITE;

  /* ---------- Safe storage ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  window.SNStore = store;

  /* ---------- Theme ---------- */
  var savedTheme = store.get("sn:theme", null);
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function toggleTheme() {
    var next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store.set("sn:theme", next);
    document.dispatchEvent(new CustomEvent("themechange"));
  }

  var ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
  };

  function slug(s) {
    return s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var subjKey = body.getAttribute("data-subject");
    var pageFile = body.getAttribute("data-page");
    var root = body.getAttribute("data-root") || "../";
    var subj = SITE[subjKey];

    buildTopbar(subj, subjKey, pageFile, root);
    addArrowDefs();
    decorateBoxes();
    wrapTables();
    initMCQs();
    var hasSidebar = !!document.getElementById("toc");
    if (hasSidebar) buildTOC(subjKey, pageFile, subj);
    if (subj && pageFile) buildUnitNav(subj, pageFile);
    initProgressCards();
    initToTop();
    bootDemos();

    window.addEventListener("beforeprint", function () {
      document.querySelectorAll("details").forEach(function (d) { d.setAttribute("data-was", d.open ? "1" : "0"); d.open = true; });
    });
    window.addEventListener("afterprint", function () {
      document.querySelectorAll("details[data-was]").forEach(function (d) { d.open = d.getAttribute("data-was") === "1"; });
    });
  });

  function buildTopbar(subj, subjKey, pageFile, root) {
    var bar = document.createElement("header");
    bar.className = "topbar";
    var html = "";
    if (subj && pageFile) html += '<button class="icon-btn" id="menuBtn" aria-label="Open contents">' + ICONS.menu + "</button>";
    html += '<a class="brand" href="' + root + 'index.html">Study<span>Notes</span></a>';
    if (subj) {
      html += '<div class="crumb">/ <a href="index.html">' + esc(subj.name) + "</a>";
      var cur = subj.pages.filter(function (p) { return p.f === pageFile; })[0];
      if (cur) html += " / " + esc(cur.pill);
      html += "</div>";
    }
    html += '<div class="spacer"></div>';
    if (subj) {
      html += '<nav class="unit-pills">';
      subj.pages.forEach(function (p) {
        html += '<a href="' + p.f + '" class="' + (p.f === pageFile ? "on" : "") + '" title="' + esc(p.t) + '">' + esc(p.pill) + "</a>";
      });
      html += "</nav>";
    }
    html += '<button class="icon-btn" id="revealBtn" title="Reveal / hide all answers" aria-label="Reveal all answers">' + ICONS.eye + "</button>";
    html += '<button class="icon-btn" id="themeBtn" title="Toggle dark mode" aria-label="Toggle dark mode">' + ICONS.sun + "</button>";
    bar.innerHTML = html;
    document.body.insertBefore(bar, document.body.firstChild);

    document.getElementById("themeBtn").addEventListener("click", toggleTheme);
    var revealed = false;
    document.getElementById("revealBtn").addEventListener("click", function () {
      revealed = !revealed;
      document.querySelectorAll("details.ans").forEach(function (d) { d.open = revealed; });
      this.style.color = revealed ? "var(--acc)" : "";
    });
    var mb = document.getElementById("menuBtn");
    if (mb) mb.addEventListener("click", function () { document.body.classList.toggle("side-open"); });
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("side-open") && !e.target.closest(".sidebar") && !e.target.closest("#menuBtn")) {
        document.body.classList.remove("side-open");
      }
    });
  }

  function addArrowDefs() {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", "0"); s.setAttribute("height", "0"); s.setAttribute("aria-hidden", "true");
    s.style.position = "absolute";
    s.innerHTML =
      '<defs>' +
      '<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-head"/></marker>' +
      '<marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-fill-acc"/></marker>' +
      '<marker id="arrR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--bad)"/></marker>' +
      '<marker id="arrG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--good)"/></marker>' +
      "</defs>";
    document.body.insertBefore(s, document.body.firstChild);
  }

  var BOX_LABELS = {
    def: ["◆", "Definition"], found: ["▣", "Foundation — read this first"], oos: ["✦", "Beyond the syllabus · optional, for deeper understanding"],
    tip: ["★", "Exam tip"], warn: ["!", "Common mistake"], example: ["✎", "Worked example"], practice: ["?", "Practice — solve it yourself first"],
    demo: ["▶", "Interactive demo"], summary: ["↺", "Quick recap"], formula: ["Σ", "Formula"]
  };
  function decorateBoxes() {
    document.querySelectorAll(".box").forEach(function (b) {
      if (b.querySelector(":scope > .box-h")) return;
      var type = Object.keys(BOX_LABELS).filter(function (k) { return b.classList.contains(k); })[0];
      var lab = BOX_LABELS[type] || ["•", ""];
      var title = b.getAttribute("data-title") || lab[1];
      if (!title) return;
      var h = document.createElement("div");
      h.className = "box-h";
      h.innerHTML = '<span class="ic">' + lab[0] + "</span><span>" + title + "</span>";
      b.insertBefore(h, b.firstChild);
    });
  }

  function wrapTables() {
    document.querySelectorAll(".content table").forEach(function (t) {
      if (t.parentElement.classList.contains("tbl-wrap")) return;
      var w = document.createElement("div");
      w.className = "tbl-wrap";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  function initMCQs() {
    document.querySelectorAll(".quiz").forEach(function (qz) {
      var s = document.createElement("div");
      s.className = "quiz-score";
      qz.insertBefore(s, qz.firstChild);
      qz._score = s;
      updateScore(qz);
    });
    document.querySelectorAll(".mcq").forEach(function (m) {
      var ans = (m.getAttribute("data-ans") || "a").charCodeAt(0) - 97;
      var items = m.querySelectorAll("ol > li");
      items.forEach(function (li, i) {
        li.addEventListener("click", function () {
          if (m.classList.contains("answered")) return;
          m.classList.add("answered");
          items[ans].classList.add("right");
          if (i !== ans) li.classList.add("wrong");
          m._correct = i === ans;
          var qz = m.closest(".quiz");
          if (qz) updateScore(qz);
        });
      });
    });
  }
  function updateScore(qz) {
    var all = qz.querySelectorAll(".mcq"), done = 0, right = 0;
    all.forEach(function (m) { if (m.classList.contains("answered")) { done++; if (m._correct) right++; } });
    qz._score.innerHTML = "Score: " + right + " / " + done + " answered (" + all.length + " questions)" +
      (done ? ' · <a href="#" class="quiz-reset">reset</a>' : "");
    var r = qz._score.querySelector(".quiz-reset");
    if (r) r.addEventListener("click", function (e) {
      e.preventDefault();
      all.forEach(function (m) { m.classList.remove("answered"); m._correct = false; m.querySelectorAll("li").forEach(function (li) { li.classList.remove("right", "wrong"); }); });
      updateScore(qz);
    });
  }

  /* ---------- Sidebar TOC + progress ---------- */
  function buildTOC(subjKey, pageFile, subj) {
    var side = document.getElementById("toc");
    var main = document.querySelector("main");
    var pageInfo = subj ? subj.pages.filter(function (p) { return p.f === pageFile; })[0] : null;
    var key = "sn:done:" + subjKey + "/" + pageFile;
    var done = store.get(key, []);
    var sections = Array.prototype.slice.call(main.querySelectorAll("section.topic"));
    store.set("sn:total:" + subjKey + "/" + pageFile, sections.length);

    var html = "";
    if (pageInfo) html += '<div class="side-title">' + esc(pageInfo.pill + " · " + pageInfo.t) + '</div><div class="side-sub">' + esc(subj.code + " · " + subj.name) + "</div>";
    html += '<div class="progress"><i id="progBar"></i></div><div class="progress-label" id="progLbl"></div>';
    html += '<input class="toc-filter" id="tocFilter" type="search" placeholder="Filter topics…" aria-label="Filter topics">';
    html += '<ul class="toc" id="tocList">';
    sections.forEach(function (sec) {
      var h2 = sec.querySelector("h2");
      if (!sec.id) sec.id = slug(h2 ? h2.textContent : "section");
      var isOOS = sec.classList.contains("oos-sec");
      html += '<li><a href="#' + sec.id + '" data-sec="' + sec.id + '"><span class="tick">' + (done.indexOf(sec.id) >= 0 ? "✓" : "") + "</span><span>" +
        esc(h2 ? h2.textContent.replace(/\s*Beyond syllabus\s*/i, "") : sec.id) + (isOOS ? ' <span class="oos-dot">✦</span>' : "") + "</span></a>";
      var subs = sec.querySelectorAll("h3");
      if (subs.length) {
        html += "<ul>";
        subs.forEach(function (h3) {
          if (!h3.id) h3.id = sec.id + "--" + slug(h3.textContent);
          var o = h3.querySelector(".oos-badge") ? ' <span class="oos-dot">✦</span>' : "";
          var txt = h3.cloneNode(true);
          txt.querySelectorAll(".oos-badge,.syl-badge").forEach(function (b) { b.remove(); });
          html += '<li><a href="#' + h3.id + '"><span>' + esc(txt.textContent.trim()) + o + "</span></a></li>";
        });
        html += "</ul>";
      }
      html += "</li>";

      // done button
      var row = document.createElement("div");
      row.className = "done-row";
      var b = document.createElement("button");
      b.className = "done-btn" + (done.indexOf(sec.id) >= 0 ? " on" : "");
      b.innerHTML = done.indexOf(sec.id) >= 0 ? "✓ Understood" : "Mark section as understood";
      b.addEventListener("click", function () {
        var i = done.indexOf(sec.id);
        if (i >= 0) done.splice(i, 1); else done.push(sec.id);
        store.set(key, done);
        var on = done.indexOf(sec.id) >= 0;
        b.classList.toggle("on", on);
        b.innerHTML = on ? "✓ Understood" : "Mark section as understood";
        var tk = side.querySelector('a[data-sec="' + sec.id + '"] .tick');
        if (tk) tk.textContent = on ? "✓" : "";
        updateProg();
      });
      row.appendChild(b);
      sec.appendChild(row);
    });
    html += "</ul>";
    side.innerHTML = html;

    function updateProg() {
      var n = sections.length || 1, d = sections.filter(function (s) { return done.indexOf(s.id) >= 0; }).length;
      document.getElementById("progBar").style.width = (100 * d / n) + "%";
      document.getElementById("progLbl").textContent = d + " of " + sections.length + " sections understood";
    }
    updateProg();

    // filter
    document.getElementById("tocFilter").addEventListener("input", function () {
      var q = this.value.trim().toLowerCase();
      side.querySelectorAll("#tocList > li").forEach(function (li) {
        var any = false;
        li.querySelectorAll("li").forEach(function (sub) {
          var m = !q || sub.textContent.toLowerCase().indexOf(q) >= 0;
          sub.style.display = m ? "" : "none";
          if (m) any = true;
        });
        var top = li.querySelector("a").textContent.toLowerCase().indexOf(q) >= 0;
        li.style.display = !q || top || any ? "" : "none";
        if (top && q) li.querySelectorAll("li").forEach(function (sub) { sub.style.display = ""; });
      });
    });

    // close menu on mobile when navigating
    side.addEventListener("click", function (e) { if (e.target.closest("a")) document.body.classList.remove("side-open"); });

    // scroll spy
    var links = side.querySelectorAll(".toc a");
    var targets = [];
    links.forEach(function (a) { var t = document.getElementById(a.getAttribute("href").slice(1)); if (t) targets.push([t, a]); });
    var ticking = false;
    function spy() {
      ticking = false;
      var y = window.scrollY + 120, cur = null;
      for (var i = 0; i < targets.length; i++) { if (targets[i][0].getBoundingClientRect().top + window.scrollY <= y) cur = targets[i]; }
      links.forEach(function (a) { a.classList.remove("active"); });
      if (cur) {
        cur[1].classList.add("active");
        var sec = cur[0].closest("section.topic");
        if (sec) { var top = side.querySelector('a[data-sec="' + sec.id + '"]'); if (top && top !== cur[1]) top.classList.add("active"); }
        var r = cur[1].getBoundingClientRect(), sr = side.getBoundingClientRect();
        if (r.top < sr.top + 60 || r.bottom > sr.bottom - 20) side.scrollTop += r.top - sr.top - sr.height / 3;
      }
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  }

  function buildUnitNav(subj, pageFile) {
    var idx = -1;
    subj.pages.forEach(function (p, i) { if (p.f === pageFile) idx = i; });
    if (idx < 0) return;
    var main = document.querySelector("main");
    var nav = document.createElement("nav");
    nav.className = "unit-nav";
    var h = "";
    if (idx > 0) h += '<a class="prev" href="' + subj.pages[idx - 1].f + '"><small>← Previous</small>' + esc(subj.pages[idx - 1].pill + " · " + subj.pages[idx - 1].t) + "</a>";
    else h += '<a class="prev" href="index.html"><small>← Back</small>Subject overview</a>';
    if (idx < subj.pages.length - 1) h += '<a class="next" href="' + subj.pages[idx + 1].f + '"><small>Next →</small>' + esc(subj.pages[idx + 1].pill + " · " + subj.pages[idx + 1].t) + "</a>";
    else h += '<a class="next" href="index.html"><small>Done →</small>Subject overview</a>';
    nav.innerHTML = h;
    main.appendChild(nav);
  }

  // Progress bars on index pages: <div class="progress" data-prog="crypto/unit1.html"><i></i></div>
  function initProgressCards() {
    document.querySelectorAll("[data-prog]").forEach(function (p) {
      var keys = p.getAttribute("data-prog").split(",");
      var d = 0, t = 0;
      keys.forEach(function (k) {
        k = k.trim();
        d += (store.get("sn:done:" + k, []) || []).length;
        t += store.get("sn:total:" + k, 0) || 0;
      });
      var pct = t ? Math.round(100 * d / t) : 0;
      var bar = p.querySelector("i");
      if (bar) bar.style.width = pct + "%";
      var lbl = p.nextElementSibling;
      if (lbl && lbl.classList.contains("progress-label")) lbl.textContent = t ? (d + " / " + t + " sections understood · " + pct + "%") : "Not started yet";
    });
  }

  function initToTop() {
    var b = document.createElement("button");
    b.className = "icon-btn toTop";
    b.setAttribute("aria-label", "Back to top");
    b.innerHTML = ICONS.up;
    b.addEventListener("click", function () { window.scrollTo({ top: 0 }); });
    document.body.appendChild(b);
    window.addEventListener("scroll", function () { b.classList.toggle("show", window.scrollY > 900); }, { passive: true });
  }

  function bootDemos() {
    var D = window.DEMOS || {};
    document.querySelectorAll("[data-demo]").forEach(function (el) {
      var name = el.getAttribute("data-demo");
      if (typeof D[name] !== "function") { console.warn("Missing demo:", name); return; }
      var host = document.createElement("div");
      host.className = "demo-body";
      el.appendChild(host);
      try { D[name](host, el); } catch (e) { host.innerHTML = '<div class="out">Demo failed to load: ' + esc(e.message) + "</div>"; console.error(e); }
    });
  }
})();

/* ==========================================================================
   K — tiny helper kit shared by all demos
   ========================================================================== */
window.DEMOS = window.DEMOS || {};
window.K = (function () {
  "use strict";
  var K = {};
  K.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  /* Build DOM from an HTML string and return the root element */
  K.html = function (host, str) { host.innerHTML = str; return host; };
  K.q = function (host, sel) { return host.querySelector(sel); };
  K.qa = function (host, sel) { return Array.prototype.slice.call(host.querySelectorAll(sel)); };
  K.on = function (els, ev, fn) { (els.length !== undefined ? els : [els]).forEach(function (e) { e.addEventListener(ev, fn); }); };
  K.num = function (x, d) {
    if (!isFinite(x)) return String(x);
    d = d === undefined ? 4 : d;
    var r = Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
    return String(r);
  };
  K.parseList = function (s) {
    return String(s).split(/[\s,;]+/).filter(function (x) { return x !== ""; }).map(Number);
  };

  /* --- integer number theory (Number, safe for small values) --- */
  K.mod = function (a, n) { return ((a % n) + n) % n; };
  K.gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; };
  K.egcd = function (a, b) { // returns [g, s, t] with s*a + t*b = g
    var r1 = a, r2 = b, s1 = 1, s2 = 0, t1 = 0, t2 = 1;
    while (r2 !== 0) { var q = Math.floor(r1 / r2), r = r1 - q * r2, s = s1 - q * s2, t = t1 - q * t2; r1 = r2; r2 = r; s1 = s2; s2 = s; t1 = t2; t2 = t; }
    return [r1, s1, t1];
  };
  K.modInv = function (a, n) { var e = K.egcd(K.mod(a, n), n); return e[0] === 1 ? K.mod(e[1], n) : null; };
  /* --- BigInt versions --- */
  K.B = function (x) { return BigInt(x); };
  K.bmod = function (a, n) { var r = a % n; return r < 0n ? r + n : r; };
  K.bpow = function (b, e, m) {
    b = K.bmod(b, m); var r = 1n;
    while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; }
    return r;
  };
  K.bgcd = function (a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { var t = a % b; a = b; b = t; } return a; };
  K.binv = function (a, n) { // extended Euclid on (n, a), tracking the coefficient of a
    var A = n, B = K.bmod(a, n), t1 = 0n, t2 = 1n;
    while (B !== 0n) { var q = A / B, r = A - q * B, t = t1 - q * t2; A = B; B = r; t1 = t2; t2 = t; }
    return A === 1n ? K.bmod(t1, n) : null;
  };
  K.isPrime = function (n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0) return false;
    for (var i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
    return true;
  };
  K.factorize = function (n) {
    var f = [], p = 2;
    while (n > 1 && p * p <= n) { var c = 0; while (n % p === 0) { n /= p; c++; } if (c) f.push([p, c]); p += p === 2 ? 1 : 2; }
    if (n > 1) f.push([n, 1]);
    return f;
  };
  K.factStr = function (f) {
    return f.map(function (x) { return x[0] + (x[1] > 1 ? "<sup>" + x[1] + "</sup>" : ""); }).join(" × ") || "1";
  };
  K.fact = function (n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; };
  K.nCr = function (n, r) { if (r < 0 || r > n) return 0; r = Math.min(r, n - r); var c = 1; for (var i = 1; i <= r; i++) c = c * (n - r + i) / i; return Math.round(c); };
  K.nPr = function (n, r) { if (r < 0 || r > n) return 0; var c = 1; for (var i = 0; i < r; i++) c *= (n - i); return c; };

  /* --- bit / hex helpers --- */
  K.hex = function (n, w) { var s = n.toString(16); while (s.length < (w || 2)) s = "0" + s; return s; };
  K.bin = function (n, w) { var s = (n >>> 0).toString(2); while (s.length < (w || 8)) s = "0" + s; return s; };

  /* --- small SVG chart helpers --- */
  var NS = "http://www.w3.org/2000/svg";
  K.svg = function (w, h, cls) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 " + w + " " + h);
    s.setAttribute("class", cls || "chart-svg");
    return s;
  };
  K.s = function (parent, tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  K.niceMax = function (v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
    var n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return n * p;
  };
  K.PALETTE = ["#4c6ef5", "#f08c00", "#12b886", "#e64980", "#7950f2", "#15aabf", "#82c91e", "#fa5252"];

  /* Bar chart. opts: {labels, values, w, h, colors, fmt, onClick(i), active(i)->bool|null, yMax, horizontal} */
  K.barChart = function (opts) {
    var w = opts.w || 560, h = opts.h || 260, pad = { l: 48, r: 12, t: 14, b: 42 };
    var s = K.svg(w, h);
    var max = opts.yMax || K.niceMax(Math.max.apply(null, opts.values.concat([0])));
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, n = opts.values.length, bw = iw / n;
    for (var g = 0; g <= 4; g++) {
      var y = pad.t + ih - ih * g / 4;
      K.s(s, "line", { x1: pad.l, x2: w - pad.r, y1: y, y2: y, "class": "gridl" });
      K.s(s, "text", { x: pad.l - 6, y: y + 4, "text-anchor": "end" }, (opts.fmt || K.short)(max * g / 4));
    }
    opts.values.forEach(function (v, i) {
      var bh = ih * v / max, x = pad.l + i * bw + bw * 0.16;
      var r = K.s(s, "rect", { x: x, y: pad.t + ih - bh, width: bw * 0.68, height: Math.max(0, bh), rx: 3, "class": "bar" });
      var col = opts.colors ? opts.colors[i % opts.colors.length] : null;
      if (col) r.style.fill = col;
      if (opts.active) { var a = opts.active(i); if (a === false) r.classList.add("dim"); }
      if (opts.onClick) { r.style.cursor = "pointer"; r.addEventListener("click", function () { opts.onClick(i); }); }
      var tt = K.s(r, "title", {}, opts.labels[i] + ": " + (opts.fmt || K.short)(v));
      void tt;
      if (opts.showValues !== false && n <= 14) K.s(s, "text", { x: x + bw * 0.34, y: pad.t + ih - bh - 4, "text-anchor": "middle" }, (opts.fmt || K.short)(v));
      K.s(s, "text", { x: pad.l + i * bw + bw / 2, y: h - pad.b + 16, "text-anchor": "middle" }, opts.labels[i]);
    });
    K.s(s, "line", { x1: pad.l, x2: w - pad.r, y1: pad.t + ih, y2: pad.t + ih, "class": "axis" });
    return s;
  };
  K.short = function (v) {
    var a = Math.abs(v);
    if (a >= 1e7) return K.num(v / 1e6, 1) + "M";
    if (a >= 1e4) return K.num(v / 1e3, 1) + "k";
    return K.num(v, 2);
  };
  /* Line chart. opts: {labels, series:[{values, color, name}], w, h, yMin, yMax} */
  K.lineChart = function (opts) {
    var w = opts.w || 560, h = opts.h || 260, pad = { l: 48, r: 14, t: 14, b: 42 };
    var s = K.svg(w, h);
    var all = []; opts.series.forEach(function (se) { all = all.concat(se.values); });
    var yMin = opts.yMin !== undefined ? opts.yMin : 0, yMax = opts.yMax || K.niceMax(Math.max.apply(null, all));
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, n = opts.labels.length;
    function X(i) { return pad.l + (n === 1 ? iw / 2 : iw * i / (n - 1)); }
    function Y(v) { return pad.t + ih - ih * (v - yMin) / (yMax - yMin); }
    for (var g = 0; g <= 4; g++) {
      var val = yMin + (yMax - yMin) * g / 4, y = Y(val);
      K.s(s, "line", { x1: pad.l, x2: w - pad.r, y1: y, y2: y, "class": "gridl" });
      K.s(s, "text", { x: pad.l - 6, y: y + 4, "text-anchor": "end" }, K.short(val));
    }
    opts.labels.forEach(function (l, i) { if (n <= 16 || i % Math.ceil(n / 12) === 0) K.s(s, "text", { x: X(i), y: h - pad.b + 16, "text-anchor": "middle" }, l); });
    opts.series.forEach(function (se, k) {
      var d = se.values.map(function (v, i) { return (i ? "L" : "M") + X(i) + "," + Y(v); }).join(" ");
      var p = K.s(s, "path", { d: d, "class": "ln" });
      p.style.stroke = se.color || K.PALETTE[k];
      se.values.forEach(function (v, i) {
        var c = K.s(s, "circle", { cx: X(i), cy: Y(v), r: 3.5, "class": "pt" });
        c.style.fill = se.color || K.PALETTE[k];
        K.s(c, "title", {}, (se.name ? se.name + " · " : "") + opts.labels[i] + ": " + K.short(v));
      });
    });
    K.s(s, "line", { x1: pad.l, x2: w - pad.r, y1: pad.t + ih, y2: pad.t + ih, "class": "axis" });
    return s;
  };
  /* Pie / donut. opts: {labels, values, colors, size, donut, onClick, active} */
  K.pieChart = function (opts) {
    var size = opts.size || 240, r = size / 2 - 6, cx = size / 2, cy = size / 2;
    var s = K.svg(size, size);
    var total = opts.values.reduce(function (a, b) { return a + b; }, 0) || 1, ang = -Math.PI / 2;
    opts.values.forEach(function (v, i) {
      var a2 = ang + 2 * Math.PI * v / total;
      var large = a2 - ang > Math.PI ? 1 : 0;
      var x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang), x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      var d = v / total >= 0.9999 ? "M" + cx + "," + (cy - r) + " A" + r + "," + r + " 0 1,1 " + (cx - 0.01) + "," + (cy - r) + " Z"
        : "M" + cx + "," + cy + " L" + x1 + "," + y1 + " A" + r + "," + r + " 0 " + large + ",1 " + x2 + "," + y2 + " Z";
      var p = K.s(s, "path", { d: d });
      p.style.fill = (opts.colors || K.PALETTE)[i % (opts.colors || K.PALETTE).length];
      p.style.stroke = "var(--card)"; p.style.strokeWidth = "2";
      if (opts.active && opts.active(i) === false) p.style.opacity = ".3";
      if (opts.onClick) { p.style.cursor = "pointer"; p.addEventListener("click", function () { opts.onClick(i); }); }
      K.s(p, "title", {}, opts.labels[i] + ": " + K.short(v) + " (" + K.num(100 * v / total, 1) + "%)");
      var mid = (ang + a2) / 2;
      if (v / total > 0.06) {
        var t = K.s(s, "text", { x: cx + r * 0.66 * Math.cos(mid), y: cy + r * 0.66 * Math.sin(mid) + 4, "text-anchor": "middle" }, K.num(100 * v / total, 0) + "%");
        t.style.fill = "#fff"; t.style.fontWeight = "700";
      }
      ang = a2;
    });
    if (opts.donut) { var c = K.s(s, "circle", { cx: cx, cy: cy, r: r * 0.5 }); c.style.fill = "var(--card)"; }
    return s;
  };
  K.legend = function (labels, colors) {
    return '<div class="legend">' + labels.map(function (l, i) {
      return '<span><i style="background:' + (colors || K.PALETTE)[i % (colors || K.PALETTE).length] + '"></i>' + K.esc(l) + "</span>";
    }).join("") + "</div>";
  };
  return K;
})();
