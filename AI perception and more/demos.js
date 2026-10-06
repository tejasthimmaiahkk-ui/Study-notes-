/* ==========================================================================
   Interactive demos — AI driven Perception, Learning and Mapping for Drones
   Each demo: DEMOS.name = function (host) { ... }  (booted by app.js)
   ========================================================================== */
(function () {
  "use strict";
  var D = window.DEMOS = window.DEMOS || {};
  var K = window.K;
  function f(x, d) { if (!isFinite(x)) return x > 0 ? "∞" : x < 0 ? "−∞" : "—"; var s = (+x).toFixed(d === undefined ? 3 : d); return s.replace(/^-/, "−"); }
  function nums(s) { return String(s).split(/[\s,;]+/).filter(function (t) { return t !== ""; }).map(Number); }
  function el(host, sel) { return host.querySelector(sel); }
  function on(host, sel, ev, fn) { host.querySelectorAll(sel).forEach(function (e) { e.addEventListener(ev, fn); }); }
  function svgEl(w, h) { return K.svg(w, h); }
  function S(p, t, a, txt) { return K.s(p, t, a, txt); }
  function css(e, o) { for (var k in o) e.style[k] = o[k]; return e; }
  var COL = { acc: "var(--acc)", good: "var(--good)", bad: "var(--bad)", warn: "var(--warn)", ink: "var(--ink)", ink2: "var(--ink-2)", ink3: "var(--ink-3)", line: "var(--line)" };
  window.AID = { f: f, nums: nums, S: S, css: css, COL: COL };

  /* ===================================================================
     WEEK 1
     =================================================================== */

  /* Confusion matrix → metrics */
  D.confmat = function (host) {
    host.innerHTML =
      '<div class="demo-row"><label>True positives (TP)<input type="number" id="tp" value="40" min="0"></label>' +
      '<label>False negatives (FN)<input type="number" id="fn" value="10" min="0"></label>' +
      '<label>False positives (FP)<input type="number" id="fp" value="30" min="0"></label>' +
      '<label>True negatives (TN)<input type="number" id="tn" value="120" min="0"></label></div>' +
      '<div class="demo-row"><span class="seg" id="pre"><button data-p="40,10,30,120" class="on">Spam (assignment Q8)</button><button data-p="0,10,0,990">Lazy "always negative"</button><button data-p="9,1,90,900">Fire alarm (sensitive)</button><button data-p="5,5,0,990">Cautious detector</button></span></div>' +
      '<div class="two-col"><div id="cm"></div><div class="out" id="mt"></div></div>';
    function draw() {
      var tp = +el(host, "#tp").value || 0, fn = +el(host, "#fn").value || 0, fp = +el(host, "#fp").value || 0, tn = +el(host, "#tn").value || 0;
      var n = tp + fn + fp + tn, P = tp + fn, PP = tp + fp;
      var acc = n ? (tp + tn) / n : NaN, pre = PP ? tp / PP : NaN, rec = P ? tp / P : NaN, spec = (tn + fp) ? tn / (tn + fp) : NaN;
      var f1 = (pre + rec) ? 2 * pre * rec / (pre + rec) : NaN;
      el(host, "#cm").innerHTML = '<table class="num compact"><tr><th></th><th>Predicted +</th><th>Predicted −</th><th>Total</th></tr>' +
        '<tr><th>Actual +</th><td style="background:var(--good-soft)">TP ' + tp + '</td><td style="background:var(--bad-soft)">FN ' + fn + "<br><small>Type II</small></td><td>" + P + "</td></tr>" +
        '<tr><th>Actual −</th><td style="background:var(--bad-soft)">FP ' + fp + '<br><small>Type I</small></td><td style="background:var(--good-soft)">TN ' + tn + "</td><td>" + (fp + tn) + "</td></tr>" +
        "<tr><th>Total</th><td>" + PP + "</td><td>" + (fn + tn) + "</td><td>" + n + "</td></tr></table>";
      el(host, "#mt").innerHTML =
        "<b>Accuracy</b> = (TP+TN)/N = (" + tp + "+" + tn + ")/" + n + " = <b>" + f(acc) + "</b><br>" +
        "<b>Precision</b> = TP/(TP+FP) = " + tp + "/" + PP + " = <b>" + f(pre) + "</b> <small>(of the alarms raised, how many were real)</small><br>" +
        "<b>Recall</b> (sensitivity) = TP/(TP+FN) = " + tp + "/" + P + " = <b>" + f(rec) + "</b> <small>(of the real positives, how many were caught)</small><br>" +
        "<b>Specificity</b> = TN/(TN+FP) = <b>" + f(spec) + "</b><br>" +
        "<b>F1</b> = 2PR/(P+R) = <b>" + f(f1) + "</b> <small>(harmonic mean)</small><br><br>" +
        (rec > pre + 0.1 ? "→ Recall is higher than precision: it <b>catches most positives</b> but raises many <b>false alarms</b>." :
          pre > rec + 0.1 ? "→ Precision is higher than recall: its alarms are trustworthy but it <b>misses</b> many positives." : "→ Precision and recall are balanced.") +
        (acc > 0.9 && rec < 0.5 ? "<br>⚠ High accuracy but low recall — accuracy is misleading on <b>imbalanced</b> data." : "");
    }
    on(host, "input", "input", function () { host.querySelectorAll("#pre button").forEach(function (b) { b.classList.remove("on"); }); draw(); });
    on(host, "#pre button", "click", function () {
      var v = this.getAttribute("data-p").split(",");
      ["#tp", "#fn", "#fp", "#tn"].forEach(function (id, i) { el(host, id).value = v[i]; });
      host.querySelectorAll("#pre button").forEach(function (b) { b.classList.remove("on"); }); this.classList.add("on"); draw();
    });
    draw();
  };

  /* Regression metrics: MSE, RMSE, R² step by step */
  D.regmetrics = function (host) {
    host.innerHTML = '<div class="demo-row"><label class="grow">Ground truth y<input class="wide" id="y" value="3, 5, 7, 9, 11"></label><label class="grow">Prediction ŷ<input class="wide" id="yh" value="2.5, 5.5, 7, 8, 12"></label></div><div class="out" id="o"></div>';
    function run() {
      var y = nums(el(host, "#y").value), p = nums(el(host, "#yh").value), n = Math.min(y.length, p.length);
      if (!n) { el(host, "#o").textContent = "Enter numbers."; return; }
      var m = 0, i; for (i = 0; i < n; i++) m += y[i] / n;
      var ssr = 0, sst = 0, rows = "";
      for (i = 0; i < n; i++) { var e = y[i] - p[i]; ssr += e * e; sst += (y[i] - m) * (y[i] - m); rows += "<tr><td>" + y[i] + "</td><td>" + p[i] + "</td><td>" + f(e, 2) + "</td><td>" + f(e * e, 2) + "</td><td>" + f((y[i] - m) * (y[i] - m), 2) + "</td></tr>"; }
      var mse = ssr / n;
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th>y</th><th>ŷ</th><th>e = y − ŷ</th><th>e²</th><th>(y − ȳ)²</th></tr>' + rows +
        '<tr class="total"><td colspan="3">Σ</td><td>' + f(ssr, 2) + "</td><td>" + f(sst, 2) + "</td></tr></table>" +
        "ȳ = " + f(m, 3) + "<br>MSE = Σe²/n = " + f(ssr, 3) + "/" + n + " = <b>" + f(mse) + "</b><br>RMSE = √MSE = <b>" + f(Math.sqrt(mse)) + "</b> <small>(same unit as y)</small><br>" +
        "R² = 1 − SS<sub>res</sub>/SS<sub>tot</sub> = 1 − " + f(ssr, 2) + "/" + f(sst, 2) + " = <b>" + f(sst ? 1 - ssr / sst : NaN) + "</b> <small>(1 = perfect; 0 = no better than predicting ȳ; negative = worse)</small>";
    }
    on(host, "input", "input", run); run();
  };

  /* Linear independence / span checker */
  function rref(M) {
    var A = M.map(function (r) { return r.slice(); }), rows = A.length, cols = A[0].length, lead = 0, piv = [];
    for (var r = 0; r < rows && lead < cols; r++) {
      var i = r;
      while (Math.abs(A[i][lead]) < 1e-9) { i++; if (i === rows) { i = r; lead++; if (lead === cols) return { A: A, piv: piv }; } }
      var t = A[i]; A[i] = A[r]; A[r] = t;
      var lv = A[r][lead]; A[r] = A[r].map(function (x) { return x / lv; });
      for (var j = 0; j < rows; j++) if (j !== r) { var c = A[j][lead]; A[j] = A[j].map(function (x, k) { return x - c * A[r][k]; }); }
      piv.push(lead); lead++;
    }
    return { A: A, piv: piv };
  }
  window.AID.rref = rref;
  D.linindep = function (host) {
    host.innerHTML = '<p style="margin:0">Type one vector per line (same length). They become the columns of X.</p>' +
      '<div class="demo-row"><label class="grow">Vectors<textarea id="v" rows="4">1, 2\n3, 1\n2, 4</textarea></label></div>' +
      '<div class="demo-row"><span class="seg" id="pre"><button data-v="1, 2\n3, 1\n2, 4">3 vectors in ℝ²</button><button data-v="1, 0, 0\n0, 1, 0\n0, 0, 1">Standard basis ℝ³</button><button data-v="1, 2, 3\n2, 4, 6">Parallel pair</button><button data-v="1, 0, 1\n0, 1, 1\n1, 1, 2">Hidden dependence</button></span></div>' +
      '<div class="two-col"><div class="out" id="o"></div><div id="pl"></div></div>';
    function run() {
      var vs = el(host, "#v").value.split("\n").map(nums).filter(function (r) { return r.length; });
      var out = el(host, "#o");
      if (!vs.length || vs.some(function (r) { return r.length !== vs[0].length; })) { out.innerHTML = "Every vector must have the same number of entries."; el(host, "#pl").innerHTML = ""; return; }
      var n = vs[0].length, k = vs.length, X = [];
      for (var i = 0; i < n; i++) { X.push(vs.map(function (v) { return v[i]; })); }
      var R = rref(X), rank = R.piv.length;
      var h = "k = " + k + " vectors in ℝ<sup>" + n + "</sup> · <b>rank = " + rank + "</b><br>";
      if (rank === k) h += '<span class="ok">Linearly independent</span>: the only solution of Xw = 0 is w = 0.';
      else {
        var free = -1; for (var c = 0; c < k; c++) if (R.piv.indexOf(c) < 0) { free = c; break; }
        var w = new Array(k).fill(0); w[free] = 1;
        R.piv.forEach(function (pc, r) { w[pc] = -R.A[r][free]; });
        h += '<span class="no">Linearly dependent</span>: a non-zero w solves Xw = 0, e.g. w = [' + w.map(function (x) { return f(x, 2); }).join(", ") + "]<br>";
        h += "→ v<sub>" + (free + 1) + "</sub> is a combination of the others, so removing it leaves the span unchanged (Linear Dependence Lemma).";
        if (k > n) h += "<br><small>Any " + k + " vectors in ℝ<sup>" + n + "</sup> are dependent, because k &gt; n.</small>";
      }
      h += "<br>Span = " + (rank === n ? "all of ℝ<sup>" + n + "</sup> → Xw = b solvable for every b" : rank === 0 ? "{0}" : "a " + rank + "-dimensional subspace (" + (rank === 1 ? "a line" : rank === 2 ? "a plane" : "subspace") + " through 0)");
      out.innerHTML = h;
      var pl = el(host, "#pl"); pl.innerHTML = "";
      if (n === 2) {
        var s = svgEl(240, 240), sc = 0; vs.forEach(function (v) { sc = Math.max(sc, Math.abs(v[0]), Math.abs(v[1])); }); sc = 100 / (sc || 1);
        S(s, "line", { x1: 0, x2: 240, y1: 120, y2: 120, "class": "gridl" }); S(s, "line", { y1: 0, y2: 240, x1: 120, x2: 120, "class": "gridl" });
        vs.forEach(function (v, i) {
          var l = S(s, "line", { x1: 120, y1: 120, x2: 120 + v[0] * sc, y2: 120 - v[1] * sc }); css(l, { stroke: K.PALETTE[i % 8], strokeWidth: 3 - i * 0.6 });
          css(S(s, "circle", { cx: 120 + v[0] * sc, cy: 120 - v[1] * sc, r: 4 }), { fill: K.PALETTE[i % 8] });
          var t = S(s, "text", { x: 124 + v[0] * sc, y: 116 - v[1] * sc }, "v" + (i + 1)); css(t, { fill: K.PALETTE[i % 8] });
        });
        pl.appendChild(s);
      }
    }
    on(host, "textarea", "input", run);
    on(host, "#pre button", "click", function () { el(host, "#v").value = this.getAttribute("data-v"); run(); });
    run();
  };

  /* ===================================================================
     WEEK 2
     =================================================================== */
  var ACT = {
    uni: { n: "Unipolar step", g: function (v) { return v > 0 ? 1 : 0; }, d: null },
    bip: { n: "Bipolar step (sgn)", g: function (v) { return v > 0 ? 1 : -1; }, d: null },
    lin: { n: "Linear", g: function (v) { return v; }, d: function () { return 1; } },
    relu: { n: "ReLU", g: function (v) { return v > 0 ? v : 0; }, d: function (v) { return v > 0 ? 1 : 0; } },
    sig: { n: "Sigmoid", g: function (v) { return 1 / (1 + Math.exp(-v)); }, d: function (v) { var s = 1 / (1 + Math.exp(-v)); return s * (1 - s); } },
    tanh: { n: "tanh", g: function (v) { return Math.tanh(v); }, d: function (v) { var t = Math.tanh(v); return 1 - t * t; } }
  };
  window.AID.ACT = ACT;
  function vec(a) { return "[" + a.map(function (x) { return f(x, Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 3); }).join(", ") + "]"; }
  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

  /* Learning-rule stepper: Hebbian / perceptron (delta) / gradient descent */
  D.rulestep = function (host) {
    var PRE = {
      heb: { rule: "heb", act: "bip", x0: "none", eta: 1, w: "1, -1, 0, 0.5", S: "1, -2, 1.5, 0\n1, -0.5, -2, -1.5\n0, 1, -1, 1.5", d: "", note: "Lecture 3 Hebbian example (no bias, bipolar sgn). Final w after 3 samples = [1, −3.5, 4.5, 0.5]." },
      per: { rule: "per", act: "bip", x0: "-1", eta: 1, w: "1, -1, 0, 0.5", S: "1, -2, 0\n0, 1.5, -0.5\n-1, 1, 0.5", d: "-1, 1, -1", note: "Lecture 4a perceptron example (x₀ = −1, w₀ listed first). After one pass w = [1, 1, 1, −1.5]." },
      gd: { rule: "gd", act: "tanh", x0: "-1", eta: 1, w: "1, -1, 0, 0.5", S: "1, -2, 0\n0, 1.5, -0.5\n-1, 1, 0.5", d: "-1, 1, -1", note: "Lecture 4b example with tanh, using the error-reducing sign Δw = +η(d − y)g′(v)x (see the warning box above)." },
      asg: { rule: "per", act: "bip", x0: "-1", eta: 1, w: "1, -1, 0, 0.5", S: "1, -2, 1\n1, 1.5, -0.5\n-1, 1, 0.5", d: "-1, -1, 1", note: "Week 2 assignment Q19–20: every sample is already classified correctly, so w never changes." }
    };
    host.innerHTML = '<div class="demo-row"><span class="seg" id="pre"><button data-k="heb">Hebbian (Lec 3)</button><button data-k="per" class="on">Perceptron (Lec 4a)</button><button data-k="gd">Gradient descent tanh (Lec 4b)</button><button data-k="asg">Assignment Q19–20</button></span></div>' +
      '<div class="demo-row"><label>Rule<select id="rule"><option value="heb">Hebbian Δw = ηyx</option><option value="per">Perceptron / delta Δw = η(d − y)x</option><option value="gd">Gradient descent Δw = η(d − y)g′(v)x</option></select></label>' +
      '<label>Activation<select id="act"><option value="bip">Bipolar step (sgn)</option><option value="uni">Unipolar step</option><option value="lin">Linear</option><option value="sig">Sigmoid</option><option value="tanh">tanh</option></select></label>' +
      '<label>Bias input x₀<select id="x0"><option value="-1">x₀ = −1 (course)</option><option value="1">x₀ = +1</option><option value="none">no bias</option></select></label>' +
      '<label>η<input type="number" id="eta" step="0.1" value="1"></label><label>Epochs<input type="number" id="ep" value="1" min="1" max="20"></label></div>' +
      '<div class="demo-row"><label class="grow">Initial w (w₀ first if bias)<input class="wide" id="w"></label><label class="grow">Targets d (one per sample)<input class="wide" id="d"></label></div>' +
      '<div class="demo-row"><label class="grow">Samples (one per line, without x₀)<textarea id="S" rows="3"></textarea></label></div>' +
      '<div class="out" id="o" style="overflow-x:auto"></div>';
    function load(k) { var p = PRE[k]; ["rule", "act", "x0", "eta", "w", "S", "d"].forEach(function (id) { el(host, "#" + id).value = p[id]; }); host._note = p.note; run(); }
    function run() {
      var rule = el(host, "#rule").value, act = ACT[el(host, "#act").value], x0 = el(host, "#x0").value, eta = +el(host, "#eta").value, ep = Math.max(1, Math.min(20, +el(host, "#ep").value || 1));
      var w = nums(el(host, "#w").value), S = el(host, "#S").value.split("\n").map(nums).filter(function (r) { return r.length; }), d = nums(el(host, "#d").value);
      var out = el(host, "#o");
      if (rule === "gd" && !act.d) { out.innerHTML = '<span class="no">Gradient descent needs a differentiable activation — choose sigmoid, tanh or linear. (That is why the perceptron rule drops g′(v).)</span>'; return; }
      if (rule !== "heb" && d.length < S.length) { out.innerHTML = "Give one target d per sample."; return; }
      var rows = "", changes = 0;
      for (var e = 0; e < ep; e++) {
        var chg = 0;
        S.forEach(function (s, i) {
          var x = x0 === "none" ? s.slice() : [+x0].concat(s);
          if (x.length !== w.length) { rows += '<tr><td colspan="9" class="no">Sample ' + (i + 1) + " has " + x.length + " inputs but w has " + w.length + " entries.</td></tr>"; return; }
          var v = dot(w, x), y = act.g(v), dw, extra = "";
          if (rule === "heb") dw = x.map(function (xi) { return eta * y * xi; });
          else if (rule === "per") dw = x.map(function (xi) { return eta * (d[i] - y) * xi; });
          else { var gp = act.d(v); extra = f(gp, 3); dw = x.map(function (xi) { return eta * (d[i] - y) * gp * xi; }); }
          var nz = dw.some(function (q) { return Math.abs(q) > 1e-12; }); if (nz) chg++;
          w = w.map(function (wi, j) { return wi + dw[j]; });
          rows += "<tr><td>" + (ep > 1 ? (e + 1) + "." : "") + (i + 1) + "</td><td>" + vec(x) + "</td><td>" + f(v, 3) + "</td><td>" + f(y, 3) + "</td><td>" + (rule === "heb" ? "—" : f(d[i], 0)) + "</td><td>" + (rule === "gd" ? extra : "—") + "</td><td>" + (nz ? vec(dw) : "0 (no change)") + "</td><td><b>" + vec(w) + "</b></td></tr>";
        });
        changes = chg;
      }
      out.innerHTML = '<table class="num compact"><tr><th>#</th><th>x (augmented)</th><th>v = wᵀx</th><th>y = g(v)</th><th>d</th><th>g′(v)</th><th>Δw</th><th>new w</th></tr>' + rows + "</table>" +
        (host._note ? "<small>" + host._note + "</small><br>" : "") +
        (rule === "per" ? (changes ? "Last epoch still changed w → not yet converged (run more epochs)." : '<span class="ok">No update in the last epoch → converged.</span>') : rule === "heb" ? "Hebbian learning ignores d — it only strengthens input–output correlation (unsupervised), and |w| can grow without bound." : "");
    }
    host.querySelectorAll("select,input,textarea").forEach(function (i) { i.addEventListener("input", function () { host._note = ""; host.querySelectorAll("#pre button").forEach(function (b) { b.classList.remove("on"); }); run(); }); });
    on(host, "#pre button", "click", function () { host.querySelectorAll("#pre button").forEach(function (b) { b.classList.remove("on"); }); this.classList.add("on"); load(this.getAttribute("data-k")); });
    load("per");
  };

  /* Perceptron on Boolean gates — boundary, training, XOR failure */
  D.gates = function (host) {
    var GATES = { AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], NAND: [1, 1, 1, 0], NOR: [1, 0, 0, 0], XOR: [0, 1, 1, 0], XNOR: [1, 0, 0, 1] };
    var P = [[0, 0], [0, 1], [1, 0], [1, 1]];
    host.innerHTML = '<div class="demo-row"><label>Gate<select id="g">' + Object.keys(GATES).map(function (k) { return "<option>" + k + "</option>"; }).join("") + '</select></label>' +
      '<label>w₁ <span id="l1"></span><input type="range" id="w1" min="-3" max="3" step="0.1" value="1"></label>' +
      '<label>w₂ <span id="l2"></span><input type="range" id="w2" min="-3" max="3" step="0.1" value="1"></label>' +
      '<label>bias b <span id="lb"></span><input type="range" id="b" min="-3" max="3" step="0.1" value="-1.5"></label></div>' +
      '<div class="demo-row"><button class="btn" id="tr1">Train 1 epoch (perceptron rule, η = 0.5)</button><button class="btn ghost" id="tr20">Train 20 epochs</button><button class="btn ghost" id="rnd">Random weights</button></div>' +
      '<div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    var log = "";
    function W() { return [+el(host, "#w1").value, +el(host, "#w2").value, +el(host, "#b").value]; }
    function setW(w) { el(host, "#w1").value = w[0]; el(host, "#w2").value = w[1]; el(host, "#b").value = w[2]; }
    function draw() {
      var g = GATES[el(host, "#g").value], w = W();
      el(host, "#l1").textContent = f(w[0], 1); el(host, "#l2").textContent = f(w[1], 1); el(host, "#lb").textContent = f(w[2], 1);
      var s = svgEl(260, 260), M = 40, Z = 180;
      function X(x) { return M + x * Z; } function Y(y) { return 260 - M - y * Z; }
      // shade the half-plane where w·x + b > 0
      var poly = [], grid = [];
      for (var gx = -0.2; gx <= 1.2001; gx += 0.05) for (var gy = -0.2; gy <= 1.2001; gy += 0.05) if (w[0] * gx + w[1] * gy + w[2] > 0) grid.push([gx, gy]);
      grid.forEach(function (p) { css(S(s, "rect", { x: X(p[0]) - 4.5, y: Y(p[1]) - 4.5, width: 9, height: 9 }), { fill: "var(--acc-soft)" }); });
      S(s, "line", { x1: X(0), y1: Y(-0.2), x2: X(0), y2: Y(1.2), "class": "gridl" }); S(s, "line", { x1: X(-0.2), y1: Y(0), x2: X(1.2), y2: Y(0), "class": "gridl" });
      // boundary w1 x + w2 y + b = 0
      var pts = [];
      [[-0.2, null], [1.2, null], [null, -0.2], [null, 1.2]].forEach(function (c) {
        if (c[0] !== null && Math.abs(w[1]) > 1e-9) { var yy = -(w[0] * c[0] + w[2]) / w[1]; if (yy >= -0.2 && yy <= 1.2) pts.push([c[0], yy]); }
        if (c[1] !== null && Math.abs(w[0]) > 1e-9) { var xx = -(w[1] * c[1] + w[2]) / w[0]; if (xx >= -0.2 && xx <= 1.2) pts.push([xx, c[1]]); }
      });
      if (pts.length >= 2) css(S(s, "line", { x1: X(pts[0][0]), y1: Y(pts[0][1]), x2: X(pts[1][0]), y2: Y(pts[1][1]) }), { stroke: "var(--acc)", strokeWidth: 2.5 });
      var ok = 0;
      P.forEach(function (p, i) {
        var y = w[0] * p[0] + w[1] * p[1] + w[2] > 0 ? 1 : 0, good = y === g[i]; if (good) ok++;
        var c = S(s, "circle", { cx: X(p[0]), cy: Y(p[1]), r: 11 }); css(c, { fill: g[i] ? "var(--ink)" : "var(--card)", stroke: good ? "var(--good)" : "var(--bad)", strokeWidth: 3 });
        css(S(s, "text", { x: X(p[0]), y: Y(p[1]) + 26, "text-anchor": "middle" }, "(" + p[0] + "," + p[1] + ")→" + g[i]), {});
      });
      var pl = el(host, "#pl"); pl.innerHTML = ""; pl.appendChild(s);
      el(host, "#o").innerHTML = "Filled dot = target 1, hollow = target 0. Shaded side: w₁x₁ + w₂x₂ + b &gt; 0 → output 1.<br>Boundary: " + f(w[0], 1) + "x₁ + " + f(w[1], 1) + "x₂ + " + f(w[2], 1) + " = 0<br><b>" + ok + "/4 correct</b>" +
        (ok === 4 ? ' <span class="ok">✓ separates the gate</span>' : "") + (log ? "<br>" + log : "") +
        "<br><small>Weights <b>tilt</b> the line; the bias <b>shifts</b> it away from the origin.</small>";
    }
    function train(n) {
      var g = GATES[el(host, "#g").value], w = W(), eta = 0.5, ep, errs = 0;
      for (ep = 0; ep < n; ep++) {
        errs = 0;
        P.forEach(function (p, i) { var y = w[0] * p[0] + w[1] * p[1] + w[2] > 0 ? 1 : 0, e = g[i] - y; if (e) { errs++; w = [w[0] + eta * e * p[0], w[1] + eta * e * p[1], w[2] + eta * e]; } });
        if (!errs) break;
      }
      w = w.map(function (q) { return Math.max(-3, Math.min(3, Math.round(q * 10) / 10)); });
      setW(w);
      log = errs ? "Still " + errs + " mistake(s) in the last epoch" + (el(host, "#g").value.indexOf("X") === 0 ? " — <b>XOR/XNOR are not linearly separable, so the perceptron never converges</b>; you need a hidden layer." : " — keep training.") : '<span class="ok">Converged: an epoch with no mistakes.</span>';
      draw();
    }
    on(host, "input,select", "input", function () { log = ""; draw(); });
    el(host, "#tr1").addEventListener("click", function () { train(1); });
    el(host, "#tr20").addEventListener("click", function () { train(20); });
    el(host, "#rnd").addEventListener("click", function () { setW([Math.round((Math.random() * 4 - 2) * 10) / 10, Math.round((Math.random() * 4 - 2) * 10) / 10, Math.round((Math.random() * 4 - 2) * 10) / 10]); log = ""; draw(); });
    draw();
  };

  /* Backpropagation through x → hidden → y → E with the chain rule */
  D.backprop = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Input x<input type="number" id="x" value="1" step="0.1"></label><label>Target d<input type="number" id="d" value="0.8" step="0.1"></label>' +
      '<label>w₁ (input→hidden)<input type="number" id="w1" value="0.5" step="0.1"></label><label>w₂ (hidden→output)<input type="number" id="w2" value="-0.4" step="0.1"></label><label>η<input type="number" id="eta" value="1" step="0.1"></label>' +
      '<label>Hidden φ<select id="ha"><option value="sig">Sigmoid</option><option value="tanh">tanh</option><option value="relu">ReLU</option></select></label><label>Output<select id="oa"><option value="sig">Sigmoid</option><option value="lin">Linear</option></select></label></div>' +
      '<div class="demo-row"><button class="btn" id="step">Apply this update</button><button class="btn ghost" id="run">Run 50 steps</button><button class="btn ghost" id="rs">Reset</button></div><div class="out" id="o"></div>';
    var hist = [];
    function calc() {
      var x = +el(host, "#x").value, d = +el(host, "#d").value, w1 = +el(host, "#w1").value, w2 = +el(host, "#w2").value, eta = +el(host, "#eta").value;
      var ha = ACT[el(host, "#ha").value], oa = ACT[el(host, "#oa").value];
      var v1 = w1 * x, h = ha.g(v1), v2 = w2 * h, y = oa.g(v2), e = d - y, E = 0.5 * e * e;
      var dEdy = -e, dydv2 = oa.d(v2), d2 = e * dydv2;              // output local gradient δ₂ = (d − y)·g′(v₂)
      var d1 = ha.d(v1) * w2 * d2;                                   // hidden local gradient δ₁ = φ′(v₁)·w₂·δ₂
      return { x: x, d: d, w1: w1, w2: w2, eta: eta, v1: v1, h: h, v2: v2, y: y, e: e, E: E, dEdy: dEdy, dydv2: dydv2, d2: d2, d1: d1, g2: -d2 * h, g1: -d1 * x, ha: ha, oa: oa };
    }
    function show() {
      var c = calc();
      el(host, "#o").innerHTML =
        "<b>Forward pass</b><br>v₁ = w₁x = " + f(c.v1) + " → h = φ(v₁) = " + f(c.h) + " → v₂ = w₂h = " + f(c.v2) + " → y = " + f(c.y) + "<br>e = d − y = " + f(c.e) + ", E = ½e² = <b>" + f(c.E, 5) + "</b><br><br>" +
        "<b>Backward pass (chain rule, read right to left)</b><br>" +
        "∂E/∂w₂ = (∂E/∂y)(∂y/∂v₂)(∂v₂/∂w₂) = (" + f(c.dEdy) + ")(" + f(c.dydv2) + ")(" + f(c.h) + ") = <b>" + f(c.g2, 5) + "</b><br>" +
        "∂E/∂w₁ = (∂E/∂y)(∂y/∂v₂)(∂v₂/∂h)(∂h/∂v₁)(∂v₁/∂w₁) = (" + f(c.dEdy) + ")(" + f(c.dydv2) + ")(" + f(c.w2) + ")(" + f(c.ha.d(c.v1)) + ")(" + f(c.x) + ") = <b>" + f(c.g1, 5) + "</b><br>" +
        "Local gradients: δ₂ = (d − y)g′(v₂) = " + f(c.d2, 5) + ";  δ₁ = φ′(v₁)·w₂·δ₂ = " + f(c.d1, 5) + "<br>" +
        "Updates: Δw₂ = ηδ₂h = " + f(c.eta * c.d2 * c.h, 5) + ", Δw₁ = ηδ₁x = " + f(c.eta * c.d1 * c.x, 5) +
        (hist.length ? "<br><br>Error history: " + hist.map(function (q) { return f(q, 4); }).slice(-8).join(" → ") : "");
    }
    function step(n) {
      for (var i = 0; i < n; i++) { var c = calc(); hist.push(c.E); el(host, "#w1").value = +(c.w1 + c.eta * c.d1 * c.x).toFixed(5); el(host, "#w2").value = +(c.w2 + c.eta * c.d2 * c.h).toFixed(5); }
      show();
    }
    on(host, "input,select", "input", function () { hist = []; show(); });
    el(host, "#step").addEventListener("click", function () { step(1); });
    el(host, "#run").addEventListener("click", function () { step(50); });
    el(host, "#rs").addEventListener("click", function () { el(host, "#w1").value = 0.5; el(host, "#w2").value = -0.4; hist = []; show(); });
    show();
  };

  /* ===================================================================
     WEEK 3
     =================================================================== */
  /* generic function plot: fns = [{f, color, name, dash}], x range, y range */
  function plot(fns, xr, yr, opt) {
    opt = opt || {};
    var W = opt.w || 420, H = opt.h || 260, L = 36, R = 10, T = 10, B = 26;
    var s = svgEl(W, H);
    function X(x) { return L + (x - xr[0]) / (xr[1] - xr[0]) * (W - L - R); }
    function Y(y) { return T + (yr[1] - y) / (yr[1] - yr[0]) * (H - T - B); }
    var gx = opt.gx || niceStep(xr[1] - xr[0]), gy = opt.gy || niceStep(yr[1] - yr[0]);
    for (var a = Math.ceil(xr[0] / gx) * gx; a <= xr[1] + 1e-9; a += gx) { S(s, "line", { x1: X(a), x2: X(a), y1: T, y2: H - B, "class": Math.abs(a) < 1e-9 ? "axis" : "gridl" }); S(s, "text", { x: X(a), y: H - 8, "text-anchor": "middle" }, +a.toFixed(2)); }
    for (var b = Math.ceil(yr[0] / gy) * gy; b <= yr[1] + 1e-9; b += gy) { S(s, "line", { y1: Y(b), y2: Y(b), x1: L, x2: W - R, "class": Math.abs(b) < 1e-9 ? "axis" : "gridl" }); S(s, "text", { x: L - 4, y: Y(b) + 4, "text-anchor": "end" }, +b.toFixed(2)); }
    fns.forEach(function (fn, k) {
      var d = "", pen = false, n = 300;
      for (var i = 0; i <= n; i++) {
        var x = xr[0] + (xr[1] - xr[0]) * i / n, y = fn.f(x);
        if (!isFinite(y) || y < yr[0] - (yr[1] - yr[0]) || y > yr[1] + (yr[1] - yr[0])) { pen = false; continue; }
        y = Math.max(yr[0] - 0.05 * (yr[1] - yr[0]), Math.min(yr[1] + 0.05 * (yr[1] - yr[0]), y));
        d += (pen ? "L" : "M") + X(x).toFixed(1) + "," + Y(y).toFixed(1); pen = true;
      }
      var p = S(s, "path", { d: d }); css(p, { fill: "none", stroke: fn.color || K.PALETTE[k % 8], strokeWidth: fn.wd || 2.2, strokeDasharray: fn.dash || "" });
    });
    s._X = X; s._Y = Y;
    return s;
  }
  function niceStep(r) { var p = Math.pow(10, Math.floor(Math.log10(r / 5))), m = r / 5 / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
  function legend(items) { return '<div style="display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.82rem">' + items.map(function (it, k) { return '<span><i style="display:inline-block;width:14px;height:3px;vertical-align:middle;margin-right:4px;background:' + (it.color || K.PALETTE[k % 8]) + '"></i>' + it.name + "</span>"; }).join("") + "</div>"; }
  window.AID.plot = plot; window.AID.legend = legend;

  /* Activation functions and derivatives */
  D.actplot = function (host) {
    var A = {
      sig: { n: "Sigmoid σ(v)", g: ACT.sig.g, d: ACT.sig.d, yr: [-0.2, 1.1] },
      tanh: { n: "tanh(v)", g: ACT.tanh.g, d: ACT.tanh.d, yr: [-1.1, 1.1] },
      relu: { n: "ReLU max(0, v)", g: ACT.relu.g, d: ACT.relu.d, yr: [-0.5, 4] },
      step: { n: "Binary step", g: ACT.uni.g, d: function () { return 0; }, yr: [-0.2, 1.2] },
      bip: { n: "Bipolar step (sgn)", g: ACT.bip.g, d: function () { return 0; }, yr: [-1.2, 1.2] },
      leaky: { n: "Leaky ReLU (0.1v for v<0)", g: function (v) { return v > 0 ? v : 0.1 * v; }, d: function (v) { return v > 0 ? 1 : 0.1; }, yr: [-0.6, 4] }
    };
    host.innerHTML = '<div class="demo-row"><label>Function<select id="fn">' + Object.keys(A).map(function (k) { return '<option value="' + k + '">' + A[k].n + "</option>"; }).join("") + '</select></label><label>Input v = <span id="vl"></span><input type="range" id="v" min="-6" max="6" step="0.1" value="2"></label><label><span><input type="checkbox" id="cmp" checked> compare sigmoid vs tanh</span></label></div><div id="pl"></div><div class="out" id="o"></div>';
    function draw() {
      var k = el(host, "#fn").value, a = A[k], v = +el(host, "#v").value, cmp = el(host, "#cmp").checked;
      el(host, "#vl").textContent = f(v, 1);
      var fns = [{ f: a.g, name: a.n }, { f: a.d, name: "derivative", dash: "5 4" }];
      if (cmp && (k === "sig" || k === "tanh")) fns = [{ f: ACT.sig.g, name: "σ(v)", color: K.PALETTE[0] }, { f: ACT.sig.d, name: "σ′(v) (max 0.25)", color: K.PALETTE[0], dash: "5 4" }, { f: ACT.tanh.g, name: "tanh(v)", color: K.PALETTE[1] }, { f: ACT.tanh.d, name: "tanh′(v) (max 1)", color: K.PALETTE[1], dash: "5 4" }];
      var yr = cmp && (k === "sig" || k === "tanh") ? [-1.1, 1.1] : a.yr;
      var s = plot(fns, [-6, 6], yr, { w: 520, h: 260 });
      css(S(s, "line", { x1: s._X(v), x2: s._X(v), y1: 10, y2: 234 }), { stroke: "var(--warn)", strokeWidth: 1.5 });
      css(S(s, "circle", { cx: s._X(v), cy: s._Y(Math.max(yr[0], Math.min(yr[1], a.g(v)))), r: 5 }), { fill: "var(--warn)" });
      var pl = el(host, "#pl"); pl.innerHTML = legend(fns); pl.appendChild(s);
      var gd = a.d(v);
      el(host, "#o").innerHTML = a.n + " at v = " + f(v, 1) + ": output <b>" + f(a.g(v), 4) + "</b>, derivative <b>" + f(gd, 5) + "</b>" +
        (k === "sig" || k === "tanh" ? (Math.abs(v) > 4 ? '<br><span class="no">Saturated</span>: the derivative is almost 0, so almost no gradient flows back (vanishing gradient). At v = 10: σ′ ≈ 4.5×10⁻⁵, tanh′ ≈ 8×10⁻⁹.' : "") +
          "<br>σ outputs lie in (0, 1) — <b>not zero-centred</b>; tanh outputs lie in (−1, 1) — zero-centred with a steeper slope at 0." : "") +
        (k === "step" || k === "bip" ? "<br>Derivative is 0 everywhere (undefined at 0) → gradient descent cannot train it; use the perceptron rule." : "") +
        (k === "relu" ? "<br>Gradient 1 for v &gt; 0 (no saturation on the positive side); 0 for v &lt; 0 (a neuron stuck there is \"dead\")." : "");
    }
    on(host, "select,input", "input", draw); draw();
  };

  /* Gradient descent on a 1-D cost with learning rate and momentum */
  D.gdball = function (host) {
    var F = {
      quad: { n: "J(w) = w² − 6w + 10 (assignment Q22)", J: function (w) { return w * w - 6 * w + 10; }, g: function (w) { return 2 * w - 6; }, xr: [-1, 8], yr: [0, 30], w0: 7 },
      dbl: { n: "Two valleys: J(w) = w⁴ − 4w² + w + 5", J: function (w) { return Math.pow(w, 4) - 4 * w * w + w + 5; }, g: function (w) { return 4 * w * w * w - 8 * w + 1; }, xr: [-2.4, 2.4], yr: [0, 14], w0: 2.2 },
      flat: { n: "Plateau then valley: J(w) = 0.05w² + 3/(1+e^(4(w−2)))", J: function (w) { return 0.05 * w * w + 3 / (1 + Math.exp(4 * (w - 2))); }, g: function (w) { var e = Math.exp(4 * (w - 2)); return 0.1 * w - 12 * e / Math.pow(1 + e, 2); }, xr: [-1, 8], yr: [0, 5], w0: -0.5 }
    };
    host.innerHTML = '<div class="demo-row"><label>Cost<select id="fn">' + Object.keys(F).map(function (k) { return '<option value="' + k + '">' + F[k].n + "</option>"; }).join("") + '</select></label>' +
      '<label>Learning rate η = <span id="el"></span><input type="range" id="eta" min="0.005" max="1.1" step="0.005" value="0.1"></label>' +
      '<label>Momentum α = <span id="al"></span><input type="range" id="al2" min="0" max="0.99" step="0.01" value="0"></label>' +
      '<label>Start w₀<input type="number" id="w0" step="0.1"></label><label>Steps<input type="number" id="n" value="20" min="1" max="200"></label></div>' +
      '<div class="demo-row"><span class="seg" id="pre"><button data-p="0.1,0">η = 0.1 (good)</button><button data-p="0.01,0">η = 0.01 (too small)</button><button data-p="0.95,0">η = 0.95 (oscillates)</button><button data-p="1.05,0">η = 1.05 (diverges)</button><button data-p="0.02,0.9">η = 0.02 + momentum 0.9</button></span></div>' +
      '<div class="two-col"><div id="pl"></div><div id="pl2"></div></div><div class="out" id="o"></div>';
    function run() {
      var k = el(host, "#fn").value, fn = F[k], eta = +el(host, "#eta").value, al = +el(host, "#al2").value, n = Math.max(1, Math.min(200, +el(host, "#n").value || 20));
      el(host, "#el").textContent = f(eta, 3); el(host, "#al").textContent = f(al, 2);
      var w = +el(host, "#w0").value, vel = 0, path = [w], Js = [fn.J(w)], rows = "";
      for (var i = 0; i < n; i++) {
        var g = fn.g(w); vel = al * vel - eta * g;
        if (i < 6) rows += "<tr><td>" + (i + 1) + "</td><td>" + f(w, 4) + "</td><td>" + f(g, 4) + "</td><td>" + f(vel, 4) + "</td><td>" + f(w + vel, 4) + "</td></tr>";
        w = w + vel; path.push(w); Js.push(fn.J(w));
        if (!isFinite(w) || Math.abs(w) > 1e6) break;
      }
      var s = plot([{ f: fn.J, name: fn.n }], fn.xr, fn.yr, { w: 420, h: 260 });
      for (var j = 0; j < path.length - 1; j++) {
        var a = path[j], b = path[j + 1]; if (!isFinite(b)) break;
        var ya = Math.min(fn.yr[1], fn.J(a)), yb = Math.min(fn.yr[1], fn.J(b));
        css(S(s, "line", { x1: s._X(Math.max(fn.xr[0], Math.min(fn.xr[1], a))), y1: s._Y(ya), x2: s._X(Math.max(fn.xr[0], Math.min(fn.xr[1], b))), y2: s._Y(yb) }), { stroke: "var(--warn)", strokeWidth: 1.6, opacity: 0.9 });
      }
      path.forEach(function (p, j) { if (isFinite(p) && p >= fn.xr[0] && p <= fn.xr[1]) css(S(s, "circle", { cx: s._X(p), cy: s._Y(Math.min(fn.yr[1], fn.J(p))), r: j === 0 ? 5 : 3 }), { fill: j === 0 ? "var(--bad)" : "var(--warn)" }); });
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(s);
      var Jm = Js.filter(isFinite), top = Math.min(Math.max.apply(null, Jm), fn.yr[1] * 3);
      var s2 = plot([], [0, Js.length - 1 || 1], [0, top || 1], { w: 420, h: 260 });
      var d = ""; Js.forEach(function (J, j) { if (isFinite(J)) d += (j ? "L" : "M") + s2._X(j) + "," + s2._Y(Math.min(top, J)); });
      css(S(s2, "path", { d: d }), { fill: "none", stroke: "var(--acc)", strokeWidth: 2 });
      el(host, "#pl2").innerHTML = '<div style="font-size:.8rem;color:var(--ink-2)">Cost J vs iteration</div>'; el(host, "#pl2").appendChild(s2);
      var last = path[path.length - 1];
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th>step</th><th>w</th><th>gradient J′(w)</th><th>Δw = αΔw<sub>prev</sub> − ηJ′(w)</th><th>new w</th></tr>' + rows + "</table>" +
        "After " + (path.length - 1) + " steps: w = <b>" + f(last, 4) + "</b>, J = <b>" + f(fn.J(last), 4) + "</b>" +
        (!isFinite(last) || Math.abs(last) > 1e3 ? ' — <span class="no">diverged</span> (η too large: each step overshoots further).' : "") +
        "<br><small>Arrow length = η × gradient (plus the momentum carry-over). For J = w² − 6w + 10, plain GD multiplies the distance to the minimum (w = 3) by |1 − 2η| each step: η &lt; 0.5 smooth, 0.5–1 oscillating but converging, η = 1 bouncing forever, η &gt; 1 diverging.</small>";
    }
    on(host, "select", "input", function () { el(host, "#w0").value = F[el(host, "#fn").value].w0; run(); });
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { var p = this.getAttribute("data-p").split(","); el(host, "#eta").value = p[0]; el(host, "#al2").value = p[1]; run(); });
    el(host, "#w0").value = F.quad.w0; run();
  };

  /* Polynomial curve fitting: degree M, regularisation ln λ, N points */
  function solve(A, b) { // Gaussian elimination with partial pivoting
    var n = A.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var t = M[c]; M[c] = M[p]; M[p] = t;
      if (Math.abs(M[c][c]) < 1e-300) continue;
      for (r = c + 1; r < n; r++) { var q = M[r][c] / M[c][c]; for (var k = c; k <= n; k++) M[r][k] -= q * M[c][k]; }
    }
    var x = new Array(n).fill(0);
    for (var i = n - 1; i >= 0; i--) { var sum = M[i][n]; for (var j = i + 1; j < n; j++) sum -= M[i][j] * x[j]; x[i] = Math.abs(M[i][i]) < 1e-300 ? 0 : sum / M[i][i]; }
    return x;
  }
  window.AID.solve = solve;
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function gauss(r) { var u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  D.polyfit = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Degree M = <span id="ml"></span><input type="range" id="M" min="0" max="9" step="1" value="3"></label>' +
      '<label>Data points N<select id="N"><option>10</option><option>15</option><option>100</option></select></label>' +
      '<label>Regularisation<select id="lam"><option value="none">λ = 0 (none)</option><option value="-18">ln λ = −18 (moderate)</option><option value="-10">ln λ = −10</option><option value="0">ln λ = 0 (large)</option></select></label>' +
      '<button class="btn ghost" id="rs">New noise sample</button></div>' +
      '<div class="demo-row"><span class="seg" id="pre"><button data-p="0,10,none">M = 0</button><button data-p="1,10,none">M = 1</button><button data-p="3,10,none">M = 3</button><button data-p="9,10,none">M = 9</button><button data-p="9,10,-18">M = 9, ln λ = −18</button><button data-p="9,10,0">M = 9, ln λ = 0</button><button data-p="9,100,none">M = 9, N = 100</button></span></div>' +
      '<div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    var seed = 7;
    function run() {
      var M = +el(host, "#M").value, N = +el(host, "#N").value, lv = el(host, "#lam").value, lam = lv === "none" ? 0 : Math.exp(+lv);
      el(host, "#ml").textContent = M;
      var r = rng(seed), xs = [], ts = [], i, j;
      for (i = 0; i < N; i++) { var x = N === 1 ? 0 : i / (N - 1); xs.push(x); ts.push(Math.sin(2 * Math.PI * x) + 0.3 * gauss(r)); }
      var P = M + 1, A = [], b = [];
      for (i = 0; i < P; i++) { A.push(new Array(P).fill(0)); b.push(0); }
      xs.forEach(function (x, n) { var phi = []; for (var k = 0; k < P; k++) phi.push(Math.pow(x, k)); for (i = 0; i < P; i++) { b[i] += phi[i] * ts[n]; for (j = 0; j < P; j++) A[i][j] += phi[i] * phi[j]; } });
      for (i = 0; i < P; i++) A[i][i] += lam;
      var w = solve(A, b);
      function y(x) { var s = 0; for (var k = P - 1; k >= 0; k--) s = s * x + w[k]; return s; }
      var tr = 0; xs.forEach(function (x, n) { tr += Math.pow(y(x) - ts[n], 2); }); tr = Math.sqrt(tr / N);
      var r2 = rng(seed + 999), te = 0; for (i = 0; i < 100; i++) { var xt = r2(); var tt = Math.sin(2 * Math.PI * xt) + 0.3 * gauss(r2); te += Math.pow(y(xt) - tt, 2); } te = Math.sqrt(te / 100);
      var s = plot([{ f: function (x) { return Math.sin(2 * Math.PI * x); }, name: "true sin(2πx)", color: "var(--good)", dash: "5 4" }, { f: y, name: "fit", color: "var(--bad)" }], [0, 1], [-1.6, 1.6], { w: 420, h: 280 });
      xs.forEach(function (x, n) { css(S(s, "circle", { cx: s._X(x), cy: s._Y(Math.max(-1.6, Math.min(1.6, ts[n]))), r: N > 20 ? 2.5 : 4.5 }), { fill: "none", stroke: "var(--acc)", strokeWidth: 2 }); });
      el(host, "#pl").innerHTML = legend([{ name: "true sin(2πx)", color: "var(--good)" }, { name: "fitted y(x, w)", color: "var(--bad)" }, { name: "noisy training points", color: "var(--acc)" }]); el(host, "#pl").appendChild(s);
      var wmax = Math.max.apply(null, w.map(Math.abs));
      el(host, "#o").innerHTML = "M = " + M + " → " + P + " parameters, N = " + N + " points" + (lam ? ", λ = e<sup>" + lv + "</sup>" : "") + "<br>Training RMS error: <b>" + f(tr, 3) + "</b><br>Test RMS error (100 new points): <b>" + f(te, 3) + "</b><br>Largest |w<sub>j</sub>|: <b>" + (wmax > 1e4 ? wmax.toExponential(2) : f(wmax, 2)) + "</b><br><br>" +
        (M <= 1 && !lam ? "Too simple: high error on both sets → <b>underfitting (high bias)</b>." :
          M >= 9 && N <= 10 && !lam ? "Passes (almost) through every point: training error ≈ 0 but large oscillations and huge coefficients → <b>overfitting (high variance)</b>." :
            lv === "0" ? "λ too large: weights forced towards 0, the curve flattens → <b>underfitting</b>." :
              lv === "-18" ? "Moderate λ: coefficients shrink, curve is smooth and close to sin(2πx)." :
                N === 100 && M === 9 ? "Same M = 9 but 10× more data: the oscillations disappear. Rule of thumb: N ≈ 5–10 × parameters." : "Reasonable fit.") +
        "<br><small>Fit solves (ΦᵀΦ + λI)w = Φᵀt, minimising ½Σ(y − t)² + (λ/2)‖w‖².</small>";
    }
    on(host, "select,input", "input", run);
    el(host, "#rs").addEventListener("click", function () { seed = Math.floor(Math.random() * 1e6); run(); });
    on(host, "#pre button", "click", function () { var p = this.getAttribute("data-p").split(","); el(host, "#M").value = p[0]; el(host, "#N").value = p[1]; el(host, "#lam").value = p[2]; run(); });
    run();
  };

  /* Loss functions of the course for target d = +1 */
  D.lossplot = function (host) {
    var gam = 2;
    var L = [
      { k: "ls", name: "LS (y − d)²", f: function (y) { return Math.pow(y - 1, 2); }, g: function (y) { return 2 * (y - 1); } },
      { k: "mls", name: "MLS max(0, 1 − yd)²", f: function (y) { return Math.pow(Math.max(0, 1 - y), 2); }, g: function (y) { return -2 * Math.max(0, 1 - y); } },
      { k: "fpe", name: "FPE (y − d)⁴", f: function (y) { return Math.pow(y - 1, 4); }, g: function (y) { return 4 * Math.pow(y - 1, 3); } },
      { k: "ce", name: "Cross-entropy −log((1 + y)/2)", f: function (y) { return y <= -1 || y >= 1 ? NaN : -Math.log((1 + y) / 2); }, g: function (y) { return -1 / (1 + y); } },
      { k: "fl", name: "Focal ((1 − y)/2)^γ · CE, γ = 2", f: function (y) { return y <= -1 || y >= 1 ? NaN : Math.pow((1 - y) / 2, gam) * -Math.log((1 + y) / 2); }, g: function () { return NaN; } }
    ];
    host.innerHTML = '<div class="demo-row">' + L.map(function (l, i) { return '<label style="flex-direction:row;align-items:center;gap:5px"><input type="checkbox" class="lc" data-i="' + i + '" checked>' + l.name + "</label>"; }).join("") + "</div>" +
      '<div class="demo-row"><label>Network output y (target d = +1) = <span id="yl"></span><input type="range" id="y" min="-1.5" max="2.5" step="0.01" value="2.5"></label><label>Focal γ<input type="number" id="g" value="2" min="0" max="5" step="0.5"></label></div>' +
      '<div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      gam = +el(host, "#g").value; L[4].name = "Focal ((1 − y)/2)^γ · CE, γ = " + gam;
      var y = +el(host, "#y").value; el(host, "#yl").textContent = f(y, 2);
      var act = L.filter(function (l, i) { return el(host, '.lc[data-i="' + i + '"]').checked; });
      var s = plot(act.map(function (l) { return { f: l.f, name: l.name, color: K.PALETTE[L.indexOf(l)] }; }), [-1.5, 2.5], [0, 4], { w: 440, h: 270 });
      css(S(s, "line", { x1: s._X(y), x2: s._X(y), y1: 10, y2: 244 }), { stroke: "var(--ink-3)", strokeDasharray: "3 3" });
      css(S(s, "line", { x1: s._X(1), x2: s._X(1), y1: 10, y2: 244 }), { stroke: "var(--good)", strokeDasharray: "2 4" });
      el(host, "#pl").innerHTML = legend(act.map(function (l) { return { name: l.name, color: K.PALETTE[L.indexOf(l)] }; })); el(host, "#pl").appendChild(s);
      var e = 1 - y;
      el(host, "#o").innerHTML = "<b>At y = " + f(y, 2) + " (d = 1, margin yd = " + f(y, 2) + ")</b><br>" + L.map(function (l) { var v = l.f(y); return l.name.split(" ")[0] + ": loss " + (isFinite(v) ? f(v, 4) : "— (needs −1 &lt; y &lt; 1)") + (isFinite(l.g(y)) ? ", ∂/∂y = " + f(l.g(y), 4) : ""); }).join("<br>") +
        "<br><br>" + (y > 1 ? "y is <b>\"too correct\"</b>: LS and FPE still penalise it and push y back to 1; <b>MLS is 0</b> (zero-loss plateau beyond the margin)." :
          Math.abs(e) < 0.05 ? "Nearly converged (error " + f(e, 3) + "): LS gradient ∝ e but FPE gradient ∝ e³ — FPE's gradient <b>vanishes</b>." :
            y < 0 ? "Misclassified (wrong sign): every loss is large; FPE penalises it most strongly." : "Inside the margin: all losses still push y towards 1.") +
        '<br><br><small>Sigmoid output, y = 0.99, d = 0 (confidently wrong): LS gives ∂E/∂v = (y − d)σ′(v) = 0.99 × 0.0099 ≈ 0.0098 (tiny), BCE gives ∂E/∂v = y − d = 0.99 (σ′ cancels).</small>';
    }
    on(host, "input", "input", run); run();
  };

  /* ===================================================================
     WEEK 4
     =================================================================== */
  /* Tensor explorer: rank, size, strides, index → flat offset, reshape/permute */
  D.tensor = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Shape<input id="sh" value="2, 3, 4, 5"></label><label>Index<input id="ix" value="1, 2, 0, 3"></label><label>Reshape to<input id="rs" value="6, 20"></label><label>Permute axes<input id="pm" value="3, 1, 2, 0"></label></div>' +
      '<div class="demo-row"><span class="seg" id="pre"><button data-p="|||">Scalar</button><button data-p="5|2|5|0">Vector (5)</button><button data-p="3, 2|2, 0|2, 3|1, 0">Matrix [[1,2],[3,4],[5,6]]</button><button data-p="224, 224, 3|10, 20, 1|50176, 3|2, 0, 1">RGB image H×W×C</button><button data-p="32, 3, 224, 224|0, 2, 100, 50|32, 150528|0, 2, 3, 1">Batch N×C×H×W</button><button data-p="3, 2, 4, 5|2, 1, 3, 4|5, 2, 4, 3|3, 1, 2, 0">Assignment (3,2,4,5)</button></span></div><div class="out" id="o"></div>';
    function run() {
      var sh = nums(el(host, "#sh").value), ix = nums(el(host, "#ix").value), rs = nums(el(host, "#rs").value), pm = nums(el(host, "#pm").value);
      var size = sh.reduce(function (a, b) { return a * b; }, 1), st = [], acc = 1, i;
      for (i = sh.length - 1; i >= 0; i--) { st[i] = acc; acc *= sh[i]; }
      var h = "<b>Rank (number of axes, ndim) = " + sh.length + "</b> → you need " + sh.length + " index" + (sh.length === 1 ? "" : "es") + " to locate one value." +
        "<br>Shape (" + sh.join(", ") + ") → <b>size = " + (sh.length ? sh.join(" × ") + " = " : "") + size + "</b> elements" + (sh.length ? "; row-major strides (" + st.join(", ") + ")" : " (a scalar holds 1 value)");
      if (sh.length) {
        if (ix.length !== sh.length) h += "<br>Index must have " + sh.length + " entries.";
        else if (ix.some(function (v, k) { return v < 0 || v >= sh[k] || v % 1; })) h += '<br><span class="no">Index out of range</span> (axis k runs 0 … shape[k] − 1).';
        else h += "<br>Element [" + ix.join(", ") + "] is at flat position Σ index × stride = " + ix.map(function (v, k) { return v + "×" + st[k]; }).join(" + ") + " = <b>" + ix.reduce(function (a, v, k) { return a + v * st[k]; }, 0) + "</b>";
        var rsz = rs.reduce(function (a, b) { return a * b; }, 1);
        if (rs.length) h += "<br>Reshape to (" + rs.join(", ") + "): " + (rsz === size ? '<span class="ok">valid</span> — rank ' + rs.length + ", same " + size + " elements" : '<span class="no">invalid</span> — needs ' + size + " elements, gives " + rsz);
        if (pm.length === sh.length && pm.slice().sort().join() === sh.map(function (_, k) { return k; }).join()) h += "<br>Permute (" + pm.join(", ") + ") → new shape (" + pm.map(function (a) { return sh[a]; }).join(", ") + "): still rank " + sh.length + " and " + size + " elements; only which axis holds which size changes.";
      }
      h += "<br><small>Do not confuse tensor rank (number of axes) with the matrix rank of linear algebra (number of independent columns).</small>";
      el(host, "#o").innerHTML = h;
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { var p = this.getAttribute("data-p").split("|"); ["#sh", "#ix", "#rs", "#pm"].forEach(function (id, k) { el(host, id).value = p[k]; }); run(); });
    run();
  };

  /* Least-squares line: raw sum vs SSE vs SAE, your line vs the LS line */
  D.lsline = function (host) {
    host.innerHTML = '<div class="demo-row"><label class="grow">x values<input class="wide" id="x" value="1, 2, 3, 4, 5, 6"></label><label class="grow">y values<input class="wide" id="y" value="2.1, 3.9, 6.2, 7.8, 10.1, 18"></label></div>' +
      '<div class="demo-row"><label>Your slope m = <span id="ml"></span><input type="range" id="m" min="-1" max="5" step="0.05" value="2"></label><label>Your intercept c = <span id="cl"></span><input type="range" id="c" min="-5" max="8" step="0.05" value="0"></label><button class="btn ghost" id="fit">Snap to least squares</button><button class="btn ghost" id="out">Toggle outlier</button></div>' +
      '<div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function ls(x, y) { var n = x.length, mx = 0, my = 0, i; for (i = 0; i < n; i++) { mx += x[i] / n; my += y[i] / n; } var sxy = 0, sxx = 0; for (i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); } var m = sxx ? sxy / sxx : 0; return [m, my - m * mx, mx, my]; }
    function run() {
      var x = nums(el(host, "#x").value), y = nums(el(host, "#y").value), n = Math.min(x.length, y.length); x = x.slice(0, n); y = y.slice(0, n);
      var m = +el(host, "#m").value, c = +el(host, "#c").value; el(host, "#ml").textContent = f(m, 2); el(host, "#cl").textContent = f(c, 2);
      var L = ls(x, y);
      function stats(mm, cc) { var r = 0, s2 = 0, a = 0; for (var i = 0; i < n; i++) { var e = y[i] - (mm * x[i] + cc); r += e; s2 += e * e; a += Math.abs(e); } return [r, s2, a]; }
      var A = stats(m, c), B = stats(L[0], L[1]);
      var xr = [Math.min.apply(null, x) - 0.5, Math.max.apply(null, x) + 0.5], ymin = Math.min.apply(null, y), ymax = Math.max.apply(null, y), pad = (ymax - ymin) * 0.15 + 0.5;
      var s = plot([{ f: function (t) { return L[0] * t + L[1]; }, name: "least squares", color: "var(--good)" }, { f: function (t) { return m * t + c; }, name: "your line", color: "var(--warn)", dash: "6 4" }], xr, [ymin - pad, ymax + pad], { w: 420, h: 260 });
      for (var i = 0; i < n; i++) { css(S(s, "line", { x1: s._X(x[i]), x2: s._X(x[i]), y1: s._Y(y[i]), y2: s._Y(m * x[i] + c) }), { stroke: "var(--warn)", strokeDasharray: "2 2" }); css(S(s, "circle", { cx: s._X(x[i]), cy: s._Y(y[i]), r: 4.5 }), { fill: "var(--acc)" }); }
      el(host, "#pl").innerHTML = legend([{ name: "least-squares line", color: "var(--good)" }, { name: "your line (residuals dashed)", color: "var(--warn)" }]); el(host, "#pl").appendChild(s);
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th></th><th>Your line</th><th>Least squares</th></tr><tr><td>Raw sum Σe</td><td>' + f(A[0], 3) + "</td><td>" + f(B[0], 3) + "</td></tr><tr><td>SSE Σe²</td><td>" + f(A[1], 3) + "</td><td><b>" + f(B[1], 3) + "</b></td></tr><tr><td>SAE Σ|e|</td><td>" + f(A[2], 3) + "</td><td>" + f(B[2], 3) + "</td></tr></table>" +
        "LS line: m = Σ(x − x̄)(y − ȳ)/Σ(x − x̄)² = <b>" + f(L[0], 4) + "</b>, c = ȳ − m x̄ = <b>" + f(L[1], 4) + "</b><br>" +
        "<small>The least-squares line always has raw residual sum 0 (with an intercept) — so a raw sum of 0 says nothing about fit quality. Squaring stops cancellation and punishes big errors hardest, which also makes LS sensitive to outliers (toggle the outlier).</small>";
    }
    on(host, "input", "input", run);
    el(host, "#fit").addEventListener("click", function () { var x = nums(el(host, "#x").value), y = nums(el(host, "#y").value), L = ls(x, y); el(host, "#m").value = L[0]; el(host, "#c").value = L[1]; run(); });
    el(host, "#out").addEventListener("click", function () { var yv = nums(el(host, "#y").value); yv[yv.length - 1] = Math.abs(yv[yv.length - 1] - 12) < 0.5 ? 18 : 12; el(host, "#y").value = yv.join(", "); run(); });
    run();
  };

  /* RBF network: Gaussian basis functions + least-squares output weights (1-D) and XOR feature map */
  D.rbf = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Centres K = <span id="kl"></span><input type="range" id="k" min="1" max="12" value="5"></label><label>Width σ = <span id="sl"></span><input type="range" id="s" min="0.02" max="0.6" step="0.01" value="0.12"></label><label>Training points N<select id="n"><option>8</option><option selected>12</option><option>20</option></select></label><label><span><input type="checkbox" id="ex"> exact interpolation (K = N, centres = data)</span></label></div>' +
      '<div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var K = +el(host, "#k").value, sg = +el(host, "#s").value, N = +el(host, "#n").value, exact = el(host, "#ex").checked;
      var r = rng(3), xs = [], ts = [], i, j;
      for (i = 0; i < N; i++) { var x = (i + 0.5) / N; xs.push(x); ts.push(Math.sin(2 * Math.PI * x) + 0.15 * gauss(r)); }
      var C = []; if (exact) { C = xs.slice(); K = N; } else for (i = 0; i < K; i++) C.push(K === 1 ? 0.5 : i / (K - 1));
      el(host, "#kl").textContent = K; el(host, "#sl").textContent = f(sg, 2);
      function phi(x, c) { return Math.exp(-(x - c) * (x - c) / (2 * sg * sg)); }
      var P = K + 1, A = [], b = [];
      for (i = 0; i < P; i++) { A.push(new Array(P).fill(0)); b.push(0); }
      xs.forEach(function (x, n) { var h = [1].concat(C.map(function (c) { return phi(x, c); })); for (i = 0; i < P; i++) { b[i] += h[i] * ts[n]; for (j = 0; j < P; j++) A[i][j] += h[i] * h[j]; } });
      for (i = 0; i < P; i++) A[i][i] += 1e-9;
      var w = solve(A, b);
      function y(x) { var s = w[0]; for (var k = 0; k < K; k++) s += w[k + 1] * phi(x, C[k]); return s; }
      var fns = C.map(function (c, k) { return { f: function (x) { return w[k + 1] * phi(x, c); }, color: "var(--ink-3)", wd: 1, dash: "3 3" }; });
      fns.push({ f: function (x) { return Math.sin(2 * Math.PI * x); }, color: "var(--good)", dash: "6 4" }, { f: y, color: "var(--bad)", wd: 2.6 });
      var s = plot(fns, [0, 1], [-2, 2], { w: 420, h: 270 });
      xs.forEach(function (x, n) { css(S(s, "circle", { cx: s._X(x), cy: s._Y(ts[n]), r: 4 }), { fill: "var(--acc)" }); });
      C.forEach(function (c) { css(S(s, "path", { d: "M" + s._X(c) + "," + (s._Y(-2) + 2) + " l-5,8 l10,0 z" }), { fill: "var(--warn)" }); });
      var tr = 0; xs.forEach(function (x, n) { tr += Math.pow(y(x) - ts[n], 2); });
      el(host, "#pl").innerHTML = legend([{ name: "network output", color: "var(--bad)" }, { name: "weighted Gaussian units w·φ", color: "var(--ink-3)" }, { name: "true sin(2πx)", color: "var(--good)" }, { name: "centres ▲", color: "var(--warn)" }]); el(host, "#pl").appendChild(s);
      el(host, "#o").innerHTML = "y(x) = w₀ + Σ<sub>k</sub> w<sub>k</sub> exp(−(x − c<sub>k</sub>)²/(2σ²))<br>Hidden layer: " + K + " Gaussian units (fixed centres, width σ). Output layer: linear — weights found in one shot by <b>linear least squares</b>.<br>Training RMS error: <b>" + f(Math.sqrt(tr / N), 4) + "</b><br><br>" +
        (exact ? "Exact interpolation: K = N, so the interpolation matrix Φ is square and (for distinct points, Micchelli's theorem) invertible → the curve passes through every noisy point (risk of overfitting)." :
          sg < 0.05 ? "σ very small → each unit is a narrow spike; gaps between centres are not covered (poor generalisation)." :
            sg > 0.4 ? "σ very large → units overlap almost completely, the matrix becomes ill-conditioned and the fit stiff." : "A moderate σ (about the centre spacing) gives a smooth approximation.");
    }
    on(host, "input", "input", run); run();
  };

  D.rbfxor = function (host) {
    var pts = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
    host.innerHTML = '<div class="demo-row"><label>Centre t₁<input id="c1" value="1, 1"></label><label>Centre t₂<input id="c2" value="0, 0"></label><label>Width σ² (φ = exp(−‖x − t‖²/σ²))<input type="number" id="s" value="1" step="0.1" min="0.1"></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var c1 = nums(el(host, "#c1").value), c2 = nums(el(host, "#c2").value), s2 = +el(host, "#s").value || 1;
      function phi(p, c) { return Math.exp(-((p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1])) / s2); }
      var F = pts.map(function (p) { return [phi(p, c1), phi(p, c2), p[2]]; });
      var s = plot([], [0, 1.05], [0, 1.05], { w: 300, h: 280, gx: 0.2, gy: 0.2 });
      F.forEach(function (q, i) { css(S(s, "circle", { cx: s._X(q[0]), cy: s._Y(q[1]), r: 8 }), { fill: q[2] ? "var(--ink)" : "var(--card)", stroke: "var(--acc)", strokeWidth: 2.5 }); S(s, "text", { x: s._X(q[0]) + 10, y: s._Y(q[1]) - 8 }, "(" + pts[i][0] + "," + pts[i][1] + ")"); });
      el(host, "#pl").innerHTML = '<div style="font-size:.8rem;color:var(--ink-2)">Hidden space (φ₁, φ₂): filled = XOR 1, hollow = XOR 0</div>'; el(host, "#pl").appendChild(s);
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th>x</th><th>XOR</th><th>φ₁</th><th>φ₂</th></tr>' + F.map(function (q, i) { return "<tr><td>(" + pts[i][0] + ", " + pts[i][1] + ")</td><td>" + q[2] + "</td><td>" + f(q[0], 4) + "</td><td>" + f(q[1], 4) + "</td></tr>"; }).join("") + "</table>" +
        "With centres (1, 1) and (0, 0), the two XOR-1 inputs map to the <b>same</b> point (0.368, 0.368) and the XOR-0 inputs to (1, 0.135) and (0.135, 1): now a single straight line (e.g. φ₁ + φ₂ = 0.9) separates them. <b>Cover's theorem</b>: a nonlinear map into a (higher-dimensional) hidden space makes patterns more likely to be linearly separable.";
    }
    on(host, "input", "input", run); run();
  };

  /*__WEEK5__*/
})();
