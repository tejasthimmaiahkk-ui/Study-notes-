/* ==========================================================================
   AI Perception for Drones — question bank renderer, mock exam engine and
   certificate calculator. Needs ../assets/js/app.js and qbank.js loaded first.
   Question format (qbank.js):
     { id, w: week, s: "A" (assignment) | "P" (practice), n: number,
       q: html, o: [html options], a: [correct indices], e: html explanation,
       k: "official" | "submitted" | "worked" | "mine", note: html (optional) }
   ========================================================================== */
(function () {
  "use strict";
  var store = window.SNStore || { get: function (k, d) { return d; }, set: function () { } };
  var HIST = "sn:aiq";            // { id: 1 (right) | 0 (wrong) }  — last attempt per question
  var LETTERS = "abcdef";

  function hist() { return store.get(HIST, {}) || {}; }
  function record(id, ok) { var h = hist(); h[id] = ok ? 1 : 0; store.set(HIST, h); }
  function bank() { return window.QB || []; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function same(a, b) { if (a.length !== b.length) return false; var x = a.slice().sort(), y = b.slice().sort(); for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false; return true; }

  var KEYTXT = {
    official: "Official answer key",
    submitted: "Your submitted answer (not graded yet) · checked",
    worked: "Key not shown in screenshot · worked out",
    mine: "Unanswered in assignment · worked out from the lecture topic"
  };

  /* Build one question element.
     mode "practice": instant feedback.  mode "exam": select only; grade() later.
     order: array of original option indices in display order. */
  function build(q, num, mode, order) {
    order = order || q.o.map(function (_, i) { return i; });
    var multi = q.a.length > 1 || q.m;
    var el = document.createElement("div");
    el.className = "mcq aq " + mode + (multi ? " msq" : "");
    el.id = mode === "practice" ? "q-" + q.id : "";
    var h = '<div class="aq-head">';
    h += '<span class="chip ' + (q.s === "A" ? "src-A" : "") + '">W' + q.w + " · " + (q.s === "A" ? "Assignment Q" + q.n : "Practice") + "</span>";
    if (multi) h += '<span class="kind">Multiple correct · select all</span>';
    if (q.s === "A" && mode === "practice") h += '<span class="keytag">' + (KEYTXT[q.k || "official"]) + "</span>";
    h += "</div>";
    h += '<p class="q">' + (num ? num + ". " : "") + q.q + "</p><ol>";
    order.forEach(function (oi) { h += '<li data-i="' + oi + '"' + (mode === "practice" && q.a.indexOf(oi) >= 0 ? " data-c" : "") + ">" + q.o[oi] + "</li>"; });
    h += "</ol>";
    if (mode === "practice") {
      h += '<div class="aq-actions">' + (multi ? '<button class="btn small chk">Check answer</button>' : "") + '<span class="aq-res"></span><a href="#" class="aq-retry" style="display:none;font-size:.82rem">try again</a></div>';
    }
    h += '<div class="why">' + correctLine(q) + (q.e || "") + (q.note ? '<span class="keynote">' + q.note + "</span>" : "") + "</div>";
    el.innerHTML = h;
    el._q = q; el._sel = [];
    var lis = Array.prototype.slice.call(el.querySelectorAll("ol > li"));
    lis.forEach(function (li) {
      li.addEventListener("click", function () {
        if (el.classList.contains("answered")) return;
        var i = +li.getAttribute("data-i");
        if (multi) {
          var p = el._sel.indexOf(i);
          if (p >= 0) el._sel.splice(p, 1); else el._sel.push(i);
          li.classList.toggle("sel", p < 0);
        } else {
          el._sel = [i];
          lis.forEach(function (x) { x.classList.toggle("sel", x === li); });
          if (mode === "practice") grade(el, true);
        }
        if (el._onchange) el._onchange();
      });
    });
    var chk = el.querySelector(".chk");
    if (chk) chk.addEventListener("click", function () { if (!el._sel.length) { el.querySelector(".aq-res").textContent = "Select at least one option."; return; } grade(el, true); });
    var retry = el.querySelector(".aq-retry");
    if (retry) retry.addEventListener("click", function (e) { e.preventDefault(); reset(el); });
    return el;
  }

  function correctLine(q) {
    var t = q.a.map(function (i) { return q.o[i]; });
    return '<b class="k">Correct: </b>' + (t.length > 1 ? "<ul style=\"margin:4px 0 8px\"><li>" + t.join("</li><li>") + "</li></ul>" : t[0] + "<br>");
  }

  /* Grade a question element; returns 1, 0 or a fraction for partial MSQ. */
  function grade(el, save) {
    var q = el._q, sel = el._sel;
    el.classList.add("answered");
    var lis = el.querySelectorAll("ol > li");
    lis.forEach(function (li) {
      var i = +li.getAttribute("data-i"), c = q.a.indexOf(i) >= 0, s = sel.indexOf(i) >= 0;
      if (c && s) li.classList.add("right");
      else if (!c && s) li.classList.add("wrong");
      else if (c && !s) li.classList.add(q.a.length > 1 ? "missed" : "right");
    });
    var ok = same(sel, q.a), score = ok ? 1 : 0;
    if (!ok && q.a.length > 1) {
      var wrongPick = sel.some(function (i) { return q.a.indexOf(i) < 0; });
      var hits = sel.filter(function (i) { return q.a.indexOf(i) >= 0; }).length;
      if (!wrongPick && hits) score = hits / q.a.length;
    }
    var res = el.querySelector(".aq-res");
    if (res) {
      res.className = "aq-res " + (ok ? "ok" : score > 0 ? "part" : "no");
      res.textContent = ok ? "✓ Correct" : score > 0 ? "◐ Partly correct — you missed an option (dashed)" : sel.length ? "✗ Not quite — read why below" : "— Not answered";
    }
    var r = el.querySelector(".aq-retry"); if (r) r.style.display = "";
    if (save && sel.length) record(q.id, ok);
    el._score = score;
    if (el._ongrade) el._ongrade();
    return score;
  }
  function reset(el) {
    el.classList.remove("answered"); el._sel = []; el._score = undefined;
    el.querySelectorAll("ol > li").forEach(function (li) { li.classList.remove("right", "wrong", "missed", "sel"); });
    var res = el.querySelector(".aq-res"); if (res) { res.textContent = ""; res.className = "aq-res"; }
    var r = el.querySelector(".aq-retry"); if (r) r.style.display = "none";
    if (el._ongrade) el._ongrade();
  }

  /* <div class="qb" data-week="3" data-src="A"></div>  → renders that week's questions */
  function renderBlocks() {
    document.querySelectorAll(".qb").forEach(function (box) {
      var w = +box.getAttribute("data-week"), src = box.getAttribute("data-src") || "A";
      var qs = bank().filter(function (q) { return q.w === w && q.s === src; });
      var score = document.createElement("div");
      score.className = "quiz-score qb-score";
      box.appendChild(score);
      var els = qs.map(function (q, i) {
        var el = build(q, i + 1, "practice");
        el._ongrade = upd;
        box.appendChild(el);
        return el;
      });
      function upd() {
        var done = 0, right = 0;
        els.forEach(function (e) { if (e._score !== undefined) { done++; right += e._score; } });
        score.innerHTML = "Score: " + (Math.round(right * 100) / 100) + " / " + done + " answered · " + els.length + " questions" +
          (done ? ' · <a href="#" class="rs">reset all</a>' : "");
        var rs = score.querySelector(".rs");
        if (rs) rs.addEventListener("click", function (e) { e.preventDefault(); els.forEach(reset); });
      }
      upd();
      if (!qs.length) box.innerHTML = '<p class="muted">No questions found.</p>';
    });
    // counts like <span data-qcount="3:A"></span>
    document.querySelectorAll("[data-qcount]").forEach(function (s) {
      var p = s.getAttribute("data-qcount").split(":");
      s.textContent = bank().filter(function (q) { return (p[0] === "*" || q.w === +p[0]) && (!p[1] || q.s === p[1]); }).length;
    });
  }

  /* Eye button: reveal answers of practice questions too */
  function hookReveal() {
    var b = document.getElementById("revealBtn");
    if (!b) return;
    b.addEventListener("click", function () {
      var on = !document.body.classList.contains("reveal-aq");
      document.body.classList.toggle("reveal-aq", on);
    });
    var st = document.createElement("style");
    st.textContent = "body.reveal-aq .aq.practice .why{display:block} body.reveal-aq .aq.practice li[data-c]{background:var(--good-soft);border-color:var(--good)}";
    document.head.appendChild(st);
  }

  /* ---------------- Mock exam ---------------- */
  function examApp(host) {
    var weeks = []; for (var w = 1; w <= 12; w++) weeks.push(w);
    var h = '<div class="demo-row" style="align-items:flex-start">';
    h += '<div><div style="font-weight:600;font-size:.85rem;margin-bottom:4px">Weeks</div><div class="wk-grid">' +
      weeks.map(function (w) { return '<label><input type="checkbox" class="wk" value="' + w + '" checked> Week ' + w + "</label>"; }).join("") +
      '</div><div style="margin-top:6px"><a href="#" id="wkAll">all</a> · <a href="#" id="wkNone">none</a></div></div></div>';
    h += '<div class="demo-row">' +
      '<label>Questions from<select id="exSrc"><option value="AP">Assignments + practice</option><option value="A">Assignments only</option><option value="P">Practice only</option></select></label>' +
      '<label>Number of questions<select id="exN"><option>25</option><option selected>50</option><option>75</option><option>120</option><option value="0">All matching</option></select></label>' +
      '<label>Time limit<select id="exT"><option value="1">1 min / question</option><option value="0.75">45 s / question</option><option value="0">No timer</option></select></label>' +
      '<label>Focus<select id="exF"><option value="all">All questions</option><option value="wrong">Only ones I got wrong before</option><option value="new">Only ones I have never tried</option></select></label>' +
      '<button class="btn" id="exGo">Start mock exam</button></div>' +
      '<div class="out" id="exInfo"></div>';
    host.innerHTML = h;
    var info = host.querySelector("#exInfo");
    function chosen() {
      var ws = Array.prototype.slice.call(host.querySelectorAll(".wk:checked")).map(function (c) { return +c.value; });
      var src = host.querySelector("#exSrc").value, f = host.querySelector("#exF").value, hs = hist();
      return bank().filter(function (q) {
        if (ws.indexOf(q.w) < 0 || src.indexOf(q.s) < 0) return false;
        if (f === "wrong") return hs[q.id] === 0;
        if (f === "new") return hs[q.id] === undefined;
        return true;
      });
    }
    function showInfo() {
      var c = chosen(), hs = hist(), tried = 0, right = 0;
      bank().forEach(function (q) { if (hs[q.id] !== undefined) { tried++; right += hs[q.id]; } });
      info.innerHTML = "<b>" + c.length + "</b> questions match your choice. Bank: <b>" + bank().length + "</b> questions (" +
        bank().filter(function (q) { return q.s === "A"; }).length + " assignment, " + bank().filter(function (q) { return q.s === "P"; }).length + " practice). " +
        "You have tried <b>" + tried + "</b>, last attempt correct on <b>" + right + "</b>" + (tried ? " (" + Math.round(100 * right / tried) + " %)" : "") +
        '. <a href="#" id="clrH">clear history</a>';
      var c2 = info.querySelector("#clrH");
      c2.addEventListener("click", function (e) { e.preventDefault(); if (confirm("Clear your saved answer history?")) { store.set(HIST, {}); showInfo(); } });
    }
    host.querySelectorAll("input,select").forEach(function (i) { i.addEventListener("change", showInfo); });
    host.querySelector("#wkAll").addEventListener("click", function (e) { e.preventDefault(); host.querySelectorAll(".wk").forEach(function (c) { c.checked = true; }); showInfo(); });
    host.querySelector("#wkNone").addEventListener("click", function (e) { e.preventDefault(); host.querySelectorAll(".wk").forEach(function (c) { c.checked = false; }); showInfo(); });
    showInfo();
    host.querySelector("#exGo").addEventListener("click", function () {
      var pool = shuffle(chosen().slice()), n = +host.querySelector("#exN").value;
      if (!pool.length) { info.innerHTML = '<span class="no">No questions match — tick more weeks or change the focus.</span>'; return; }
      if (n) pool = pool.slice(0, n);
      runExam(pool, +host.querySelector("#exT").value);
    });
  }

  function runExam(pool, perQ) {
    var area = document.getElementById("examArea");
    area.innerHTML = "";
    var bar = document.createElement("div");
    bar.className = "exam-bar";
    bar.innerHTML = '<b>Mock exam · ' + pool.length + ' questions</b><span id="exProg">0 answered</span><span class="timer" id="exTimer"></span><span class="spacer" style="flex:1"></span><button class="btn" id="exSubmit">Submit &amp; grade</button>';
    area.appendChild(bar);
    var els = pool.map(function (q, i) {
      var el = build(q, i + 1, "exam", shuffle(q.o.map(function (_, j) { return j; })));
      el._onchange = prog;
      area.appendChild(el);
      return el;
    });
    var res = document.createElement("div");
    area.appendChild(res);
    area.scrollIntoView({ behavior: "smooth" });
    function prog() { bar.querySelector("#exProg").textContent = els.filter(function (e) { return e._sel.length; }).length + " / " + els.length + " answered"; }
    var left = Math.round(perQ * 60 * pool.length), tm = null, tEl = bar.querySelector("#exTimer");
    function tick() {
      if (left <= 0) { finish(true); return; }
      left--;
      var m = Math.floor(left / 60), s = left % 60;
      tEl.textContent = "⏱ " + m + ":" + (s < 10 ? "0" : "") + s;
      tEl.classList.toggle("low", left < 120);
    }
    if (perQ) { tick(); tm = setInterval(tick, 1000); } else tEl.textContent = "No timer";
    bar.querySelector("#exSubmit").addEventListener("click", function () {
      var un = els.filter(function (e) { return !e._sel.length; }).length;
      if (un && !confirm(un + " question(s) unanswered. Submit anyway?")) return;
      finish(false);
    });
    var done = false;
    function finish(timeout) {
      if (done) return; done = true;
      if (tm) clearInterval(tm);
      var total = 0, byW = {};
      els.forEach(function (e) {
        var sc = grade(e, true); total += sc;
        var w = e._q.w; byW[w] = byW[w] || [0, 0]; byW[w][0] += sc; byW[w][1]++;
      });
      bar.querySelector("#exSubmit").disabled = true;
      var pct = Math.round(100 * total / els.length);
      var rows = Object.keys(byW).sort(function (a, b) { return a - b; }).map(function (w) {
        var p = Math.round(100 * byW[w][0] / byW[w][1]);
        return "<tr><td>Week " + w + '</td><td>' + (Math.round(byW[w][0] * 100) / 100) + " / " + byW[w][1] + '</td><td><div class="mark-bar"><i style="width:' + p + '%"></i></div></td><td>' + p + ' %</td><td><a href="week' + (w < 10 ? "0" : "") + w + '.html">revise</a></td></tr>';
      }).join("");
      res.innerHTML = '<div class="box ' + (pct >= 60 ? "tip" : "warn") + '" data-title="Result' + (timeout ? " — time up" : "") + '"><p style="font-size:1.15rem"><b>' +
        (Math.round(total * 100) / 100) + " / " + els.length + " (" + pct + " %)</b> — " +
        (pct >= 90 ? "Gold-level performance." : pct >= 75 ? "Silver-level — tighten the weak weeks below." : pct >= 60 ? "Elite range — good, now push the weak weeks." : pct >= 40 ? "Pass range — revise the weeks below 60 %." : "Below the pass line — revise the weeks below, then retry.") +
        '</p><table class="res-table"><tr><th>Week</th><th>Score</th><th></th><th>%</th><th></th></tr>' + rows + "</table>" +
        "<p>Each question is now marked: green = correct option, red = your wrong pick, dashed = a correct option you missed. Read the explanations, then try <b>Focus → only ones I got wrong</b>.</p></div>";
      bar.querySelector("#exProg").textContent = "Graded";
      if (window.SNDecorate) window.SNDecorate();
      decorate(res);
      res.scrollIntoView({ behavior: "smooth" });
    }
  }
  function decorate(root) {
    root.querySelectorAll(".box").forEach(function (b) {
      if (b.querySelector(".box-h")) return;
      var t = b.getAttribute("data-title"); if (!t) return;
      var h = document.createElement("div"); h.className = "box-h"; h.innerHTML = '<span class="ic">★</span><span>' + t + "</span>";
      b.insertBefore(h, b.firstChild);
    });
  }

  /* ---------------- Certificate calculator ---------------- */
  function certCalc(host) {
    var h = '<p style="margin:0">Enter your score (out of 100) for each weekly assignment. Leave blank if not yet released.</p><div class="wk-grid">';
    for (var w = 1; w <= 12; w++) h += '<label>Week ' + w + '<input type="number" min="0" max="100" class="as" data-w="' + w + '" style="width:80px"></label>';
    h += '</div><div class="demo-row"><label>Expected exam score (out of 100)<input type="number" id="exS" min="0" max="100" value="70"></label></div><div class="out" id="ccOut"></div>';
    host.innerHTML = h;
    var saved = store.get("sn:ai:cert", {});
    host.querySelectorAll(".as").forEach(function (i) { if (saved[i.getAttribute("data-w")] !== undefined) i.value = saved[i.getAttribute("data-w")]; });
    if (saved.exam !== undefined) host.querySelector("#exS").value = saved.exam;
    function calc() {
      var sv = {}, vals = [];
      host.querySelectorAll(".as").forEach(function (i) { if (i.value !== "") { var v = Math.max(0, Math.min(100, +i.value)); vals.push(v); sv[i.getAttribute("data-w")] = v; } });
      var ex = Math.max(0, Math.min(100, +host.querySelector("#exS").value || 0)); sv.exam = ex;
      store.set("sn:ai:cert", sv);
      var best = vals.slice().sort(function (a, b) { return b - a; }).slice(0, 8);
      while (best.length < 8) best.push(0);
      var avg = best.reduce(function (a, b) { return a + b; }, 0) / 8;
      var A = avg * 0.25, E = ex * 0.75, F = A + E;
      var needE = Math.max(30, 40 - A) / 0.75;
      var tier = F >= 90 ? "Elite + Gold" : F >= 75 ? "Elite + Silver" : F >= 60 ? "Elite" : F >= 40 ? "Successfully completed" : "No certificate";
      var okA = A >= 10, okE = E >= 30;
      host.querySelector("#ccOut").innerHTML =
        "Best 8 assignments average = <b>" + avg.toFixed(1) + "</b>/100 → assignment component <b>" + A.toFixed(2) + " / 25</b> " + (okA ? '<span class="ok">✓ ≥ 10</span>' : '<span class="no">✗ needs ≥ 10</span>') + "<br>" +
        "Exam " + ex + "/100 → exam component <b>" + E.toFixed(2) + " / 75</b> " + (okE ? '<span class="ok">✓ ≥ 30</span>' : '<span class="no">✗ needs ≥ 30</span>') + "<br>" +
        "Final score <b>" + F.toFixed(2) + " / 100</b> → <b>" + (okA && okE ? tier : "No certificate (a minimum is not met)") + "</b><br>" +
        (okA ? "Minimum exam mark you need for a certificate with these assignments: <b>" + Math.ceil(needE) + " / 100</b>. " :
          "<b>The assignment component is below 10/25, and no exam mark can make up for it.</b> Raise your remaining assignment scores (blank weeks count as 0 here). Once it reaches 10, these are the exam marks you would need: ") +
        "For Elite (60): <b>" + Math.max(Math.ceil(needE), Math.ceil((60 - A) / 0.75)) + "</b> · Silver (75): <b>" + Math.ceil((75 - A) / 0.75) + "</b> · Gold (90): <b>" + Math.ceil((90 - A) / 0.75) + "</b>" + ((90 - A) / 0.75 > 100 ? " (not reachable)" : "");
    }
    host.querySelectorAll("input").forEach(function (i) { i.addEventListener("input", calc); });
    calc();
  }

  window.DEMOS = window.DEMOS || {};
  window.DEMOS.mockExam = examApp;
  window.DEMOS.certCalc = certCalc;
  window.AIQ = { build: build, grade: grade, reset: reset };

  document.addEventListener("DOMContentLoaded", function () { renderBlocks(); hookReveal(); });
})();
