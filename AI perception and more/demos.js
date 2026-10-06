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

  /* ===================================================================
     WEEK 5
     =================================================================== */
  function gridHTML(M, opt) {
    opt = opt || {};
    var h = '<table class="cnn-grid" style="border-collapse:collapse;font-family:var(--mono);font-size:.8rem">';
    M.forEach(function (row, i) {
      h += "<tr>" + row.map(function (v, j) {
        var hl = opt.hl && opt.hl(i, j), pad = opt.pad && opt.pad(i, j);
        var bg = hl ? "var(--acc-soft)" : pad ? "var(--line)" : opt.heat ? "rgba(112,72,232," + Math.min(0.85, Math.abs(v) / (opt.heat || 1) * 0.85).toFixed(2) + ")" : "var(--card)";
        return '<td data-i="' + i + '" data-j="' + j + '" style="width:26px;height:26px;text-align:center;border:1px solid var(--line);padding:0;cursor:' + (opt.click ? "pointer" : "default") + ";background:" + bg + ";" + (hl ? "outline:2px solid var(--acc);outline-offset:-2px;" : "") + '">' + (typeof v === "number" ? +v.toFixed(2) : v) + "</td>";
      }).join("") + "</tr>";
    });
    return h + "</table>";
  }
  window.AID.gridHTML = gridHTML;

  D.convdemo = function (host) {
    var I = [[1, 1, 0, 1, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 1, 0, 0], [0, 1, 1, 1, 0]];
    var KER = { x: { n: "Lecture \"X\" filter", k: [[1, 0, 1], [0, 1, 0], [1, 0, 1]] }, v: { n: "Vertical edge", k: [[1, 0, -1], [1, 0, -1], [1, 0, -1]] }, h: { n: "Horizontal edge", k: [[1, 1, 1], [0, 0, 0], [-1, -1, -1]] }, b: { n: "Box blur (÷9)", k: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]] }, id: { n: "Identity", k: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] } };
    var pos = 0;
    host.innerHTML = '<div class="demo-row"><label>Filter<select id="kf">' + Object.keys(KER).map(function (k) { return '<option value="' + k + '">' + KER[k].n + "</option>"; }).join("") + '</select></label><label>Padding p<select id="p"><option>0</option><option>1</option><option>2</option></select></label><label>Stride s<select id="s"><option>1</option><option>2</option></select></label><label>Input size<select id="n"><option value="5">5 × 5 (lecture)</option><option value="7">7 × 7</option></select></label><button class="btn ghost" id="prev">◀ step</button><button class="btn ghost" id="next">step ▶</button></div>' +
      '<p style="margin:0;font-size:.85rem">Click input cells to toggle 0/1.</p><div class="three-col" style="align-items:start"><div><b>Input</b><div id="in"></div></div><div><b>Filter F</b><div id="kk"></div></div><div><b>Feature map</b><div id="out"></div></div></div><div class="out" id="o"></div>';
    function cur() { var n = +el(host, "#n").value; if (I.length !== n) { var J = []; for (var i = 0; i < n; i++) { J.push([]); for (var j = 0; j < n; j++) J[i].push(I[i] && I[i][j] !== undefined ? I[i][j] : (i * 3 + j * 5) % 4 === 0 ? 1 : 0); } I = J; } return I; }
    function run() {
      var A = cur(), K = KER[el(host, "#kf").value].k, p = +el(host, "#p").value, s = +el(host, "#s").value, n = A.length, k = 3;
      var Pd = []; for (var i = 0; i < n + 2 * p; i++) { Pd.push([]); for (var j = 0; j < n + 2 * p; j++) { var a = i - p, b = j - p; Pd[i].push(a >= 0 && b >= 0 && a < n && b < n ? A[a][b] : 0); } }
      var m = Math.floor((n + 2 * p - k) / s) + 1, O = [];
      for (i = 0; i < m; i++) { O.push([]); for (j = 0; j < m; j++) { var sum = 0; for (var u = 0; u < k; u++) for (var v = 0; v < k; v++) sum += Pd[i * s + u][j * s + v] * K[u][v]; O[i].push(sum); } }
      pos = ((pos % (m * m)) + m * m) % (m * m);
      var oi = Math.floor(pos / m), oj = pos % m, r0 = oi * s, c0 = oj * s;
      el(host, "#in").innerHTML = gridHTML(Pd, { click: true, hl: function (i, j) { return i >= r0 && i < r0 + k && j >= c0 && j < c0 + k; }, pad: function (i, j) { return i < p || j < p || i >= n + p || j >= n + p; } });
      el(host, "#kk").innerHTML = gridHTML(K.map(function (r) { return r.map(function (v) { return Math.abs(v - 1 / 9) < 1e-9 ? "1/9" : v; }); }));
      el(host, "#out").innerHTML = gridHTML(O, { hl: function (i, j) { return i === oi && j === oj; } });
      var terms = []; for (var u2 = 0; u2 < k; u2++) for (var v2 = 0; v2 < k; v2++) if (K[u2][v2]) terms.push(Pd[r0 + u2][c0 + v2] + "×" + (Math.abs(K[u2][v2] - 1 / 9) < 1e-9 ? "1/9" : K[u2][v2]));
      el(host, "#o").innerHTML = "Output size = ⌊(n + 2p − f)/s⌋ + 1 = ⌊(" + n + " + " + 2 * p + " − 3)/" + s + "⌋ + 1 = <b>" + m + " × " + m + "</b><br>Highlighted output (" + oi + ", " + oj + ") = Σ I(i + m, j + n)F(m, n) = " + (terms.length ? terms.join(" + ") : "0") + " = <b>" + +O[oi][oj].toFixed(3) + "</b>" +
        (el(host, "#kf").value === "x" && n === 5 && p === 0 && s === 1 ? "<br><small>Lecture example. Its slide shows the bottom row as 2 2 2, but the middle value is 3 (window rows 2–4, columns 1–3 hits three 1s).</small>" : "");
      el(host, "#in").querySelectorAll("td").forEach(function (td) {
        td.addEventListener("click", function () { var i = +td.getAttribute("data-i") - p, j = +td.getAttribute("data-j") - p; if (i >= 0 && j >= 0 && i < n && j < n) { A[i][j] = A[i][j] ? 0 : 1; run(); } });
      });
    }
    on(host, "select", "input", function () { pos = 0; run(); });
    el(host, "#next").addEventListener("click", function () { pos++; run(); });
    el(host, "#prev").addEventListener("click", function () { pos--; run(); });
    run();
  };

  D.convsize = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Input n (H = W)<input type="number" id="n" value="32"></label><label>Input channels C<input type="number" id="c" value="3"></label><label>Filter f<input type="number" id="f" value="5"></label><label>Padding p<input type="number" id="p" value="0"></label><label>Stride s<input type="number" id="s" value="1"></label><label>Number of filters K<input type="number" id="k" value="16"></label></div>' +
      '<div class="demo-row"><span class="seg" id="pre"><button data-p="32,1,5,0,1,6">32×32, 5×5</button><button data-p="32,1,5,2,1,6">+ pad 2 (same)</button><button data-p="64,3,3,1,1,16">64×64×3, 16 × 3×3</button><button data-p="227,3,11,0,4,96">AlexNet conv1</button><button data-p="224,3,7,3,2,64">ResNet stem</button></span></div><div class="out" id="o"></div>';
    function run() {
      var n = +el(host, "#n").value, c = +el(host, "#c").value, fz = +el(host, "#f").value, p = +el(host, "#p").value, s = +el(host, "#s").value || 1, k = +el(host, "#k").value;
      var raw = (n + 2 * p - fz) / s + 1, m = Math.floor(raw);
      var params = k * (fz * fz * c + 1);
      el(host, "#o").innerHTML = "Output size = ⌊(n + 2p − f)/s⌋ + 1 = ⌊(" + n + " + " + 2 * p + " − " + fz + ")/" + s + "⌋ + 1 = <b>" + m + " × " + m + " × " + k + "</b>" + (raw !== m ? " <small>(not an integer before flooring — the last positions don't fit)</small>" : "") +
        "<br>Each filter is <b>" + fz + " × " + fz + " × " + c + "</b> (always spans all input channels) → produces one map; " + k + " filters → " + k + " maps." +
        "<br>Parameters = K × (f·f·C + 1 bias) = " + k + " × (" + fz * fz * c + " + 1) = <b>" + params.toLocaleString() + "</b>" +
        "<br>Multiply–accumulates ≈ output pixels × f·f·C × K = " + (m * m * fz * fz * c * k).toLocaleString() +
        "<br>A fully connected layer from the same input to the same output would need " + (n * n * c * m * m * k).toLocaleString() + " weights — that is why convolution (local + shared weights) matters." +
        "<br><small>\"Same\" padding for stride 1: p = (f − 1)/2 (radius) — 3×3 → 1, 5×5 → 2, 7×7 → 3.</small>";
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { var v = this.getAttribute("data-p").split(","); ["#n", "#c", "#f", "#p", "#s", "#k"].forEach(function (id, i) { el(host, id).value = v[i]; }); run(); });
    run();
  };

  D.pooldemo = function (host) {
    var base = [[0, 0, 0, 0, 0, 0], [0, 9, 2, 0, 0, 0], [0, 3, 7, 1, 0, 0], [0, 0, 1, 8, 0, 0], [0, 0, 0, 2, 0, 0], [0, 0, 0, 0, 0, 0]];
    var shift = 0;
    host.innerHTML = '<div class="demo-row"><label>Pooling<select id="t"><option value="max">Max</option><option value="avg">Average</option></select></label><label>Window / stride<select id="w"><option value="2">2 × 2, stride 2</option><option value="3">3 × 3, stride 3</option></select></label><button class="btn ghost" id="sh">Shift feature right by 1 pixel</button><button class="btn ghost" id="lec">Lecture example (3×3, 2×2 window, stride 1)</button></div><div class="two-col"><div><b>Feature map</b><div id="in"></div></div><div><b>Pooled</b><div id="out"></div></div></div><div class="out" id="o"></div>';
    var lec = false;
    function run() {
      var t = el(host, "#t").value, w = +el(host, "#w").value, s = w, M;
      if (lec) { M = [[4, 3, 0], [5, 4, 1], [2, 1, 1]]; w = 2; s = 1; }
      else M = base.map(function (r) { var z = r.slice(); for (var q = 0; q < shift; q++) { z.pop(); z.unshift(0); } return z; });
      var n = M.length, m = Math.floor((n - w) / s) + 1, O = [];
      for (var i = 0; i < m; i++) { O.push([]); for (var j = 0; j < m; j++) { var vals = []; for (var u = 0; u < w; u++) for (var v = 0; v < w; v++) vals.push(M[i * s + u][j * s + v]); O[i].push(t === "max" ? Math.max.apply(null, vals) : vals.reduce(function (a, b) { return a + b; }, 0) / vals.length); } }
      el(host, "#in").innerHTML = gridHTML(M, { heat: 9 }); el(host, "#out").innerHTML = gridHTML(O, { heat: 9 });
      el(host, "#o").innerHTML = (lec ? "Lecture example: max-pool = [[5, 4], [5, 4]]; average-pool = [[4, 2], [3, 1.75]] (the slide rounds 1.75 to 2). " : "Shifted by " + shift + " pixel(s). ") +
        "Pooling has <b>no learnable parameters</b>. It shrinks the map and keeps whether a feature is present; small shifts inside a window barely change the max → local translation invariance. Price: it <b>loses spatial precision</b>. Max-pooling is nonlinear; average pooling is linear.";
    }
    on(host, "select", "input", function () { lec = false; run(); });
    el(host, "#sh").addEventListener("click", function () { lec = false; shift = (shift + 1) % 3; run(); });
    el(host, "#lec").addEventListener("click", function () { lec = true; run(); });
    run();
  };

  D.augment = function (host) {
    var SIX = ["0011100", "0100000", "1000000", "1011100", "1100010", "1000010", "0111100"];
    var SEVEN = ["1111110", "0000010", "0000100", "0001000", "0010000", "0010000", "0010000"];
    var CAR = ["0000000", "0011100", "0111110", "0101010", "0111110", "0011100", "0000000"];
    var SRC = { six: { g: SIX, n: "digit 6" }, seven: { g: SEVEN, n: "digit 7" }, car: { g: CAR, n: "car seen from a drone" } };
    host.innerHTML = '<div class="demo-row"><label>Image<select id="im"><option value="six">Digit 6</option><option value="seven">Digit 7</option><option value="car">Car (top-down drone view)</option></select></label></div>' +
      '<div class="demo-row"><span class="seg" id="ops"><button data-o="id" class="on">Original</button><button data-o="hf">Horizontal flip</button><button data-o="vf">Vertical flip</button><button data-o="r90">Rotate 90°</button><button data-o="r180">Rotate 180°</button><button data-o="tr">Shift right</button><button data-o="br">Brightness −</button><button data-o="no">Noise</button></span></div>' +
      '<div class="two-col"><div id="g"></div><div class="out" id="o"></div></div>';
    var op = "id";
    function run() {
      var k = el(host, "#im").value, G = SRC[k].g.map(function (r) { return r.split("").map(Number); }), n = G.length, H, i, j;
      H = G.map(function (r) { return r.slice(); });
      if (op === "hf") H = G.map(function (r) { return r.slice().reverse(); });
      if (op === "vf") H = G.slice().reverse();
      if (op === "r180") H = G.slice().reverse().map(function (r) { return r.slice().reverse(); });
      if (op === "r90") { H = []; for (i = 0; i < n; i++) { H.push([]); for (j = 0; j < n; j++) H[i].push(G[n - 1 - j][i]); } }
      if (op === "tr") H = G.map(function (r) { return [0].concat(r.slice(0, n - 1)); });
      if (op === "br") H = G.map(function (r) { return r.map(function (v) { return v * 0.45; }); });
      if (op === "no") { var rr = rng(5); H = G.map(function (r) { return r.map(function (v) { return Math.max(0, Math.min(1, v + (rr() - 0.5) * 0.7)); }); }); }
      var s = svgEl(7 * 30, 7 * 30);
      H.forEach(function (r, a) { r.forEach(function (v, b) { css(S(s, "rect", { x: b * 30, y: a * 30, width: 29, height: 29, rx: 3 }), { fill: "var(--ink)", opacity: (0.08 + 0.92 * v).toFixed(2) }); }); });
      s.style.maxWidth = "210px"; el(host, "#g").innerHTML = ""; el(host, "#g").appendChild(s);
      var digit = k !== "car", kind = { id: "", hf: "geometric", vf: "geometric", r90: "geometric", r180: "geometric", tr: "geometric", br: "photometric", no: "photometric" }[op];
      var verdict = op === "id" ? "Original image." :
        digit && (op === "r180") && k === "six" ? '<span class="no">Label broken:</span> a 6 rotated by 180° looks like a <b>9</b>, but it keeps the label "6" — label noise.' :
          digit && (op === "vf" || op === "hf" || op === "r90" || op === "r180") ? '<span class="no">Risky for digits:</span> flips and large rotations can change a symbol\'s meaning or create shapes that never occur.' :
            !digit && kind === "geometric" ? '<span class="ok">Safe:</span> from a top-down drone view a car can point in any direction, so flips and rotations are realistic.' :
              '<span class="ok">Label-preserving:</span> small shifts, brightness and noise mimic real variation.';
      el(host, "#o").innerHTML = verdict + (kind ? "<br>Type: <b>" + kind + "</b> augmentation — " + (kind === "geometric" ? "improves spatial invariance (viewpoint, orientation, scale, pose)." : "improves appearance robustness (illumination, weather, sensor noise, blur).") : "") +
        "<br><small>Rule: an augmentation is valid only if it preserves the label — validity depends on the task's semantics.</small>";
    }
    on(host, "select", "input", run);
    on(host, "#ops button", "click", function () { host.querySelectorAll("#ops button").forEach(function (b) { b.classList.remove("on"); }); this.classList.add("on"); op = this.getAttribute("data-o"); run(); });
    run();
  };

  /* ===================================================================
     WEEK 6
     =================================================================== */
  D.normviz = function (host) {
    var N = 4, C = 6;
    host.innerHTML = '<div class="demo-row"><label>Method<select id="m"><option value="bn">Batch Norm</option><option value="ln">Layer Norm</option><option value="in">Instance Norm</option><option value="gn">Group Norm</option></select></label><label>Groups G (GN)<select id="g"><option>1</option><option selected>2</option><option>3</option><option>6</option></select></label><label>Pick sample n<select id="n">' + [0, 1, 2, 3].map(function (i) { return "<option>" + i + "</option>"; }).join("") + '</select></label><label>Pick channel c<select id="c">' + [0, 1, 2, 3, 4, 5].map(function (i) { return "<option>" + i + "</option>"; }).join("") + '</select></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var m = el(host, "#m").value, G = +el(host, "#g").value, n0 = +el(host, "#n").value, c0 = +el(host, "#c").value, gs = C / G;
      function inSet(n, c) {
        if (m === "bn") return c === c0;
        if (m === "ln") return n === n0;
        if (m === "in") return n === n0 && c === c0;
        return n === n0 && Math.floor(c / gs) === Math.floor(c0 / gs);
      }
      var s = svgEl(330, 250), cw = 44, ch = 46, X0 = 50, Y0 = 30;
      S(s, "text", { x: X0 + C * cw / 2, y: 16, "text-anchor": "middle" }, "channels C →");
      for (var n = 0; n < N; n++) {
        S(s, "text", { x: X0 - 8, y: Y0 + n * ch + ch / 2 + 4, "text-anchor": "end" }, "n=" + n);
        for (var c = 0; c < C; c++) {
          var on = inSet(n, c);
          var r = S(s, "rect", { x: X0 + c * cw + 2, y: Y0 + n * ch + 2, width: cw - 4, height: ch - 4, rx: 4 });
          css(r, { fill: on ? "var(--acc)" : "var(--card)", stroke: n === n0 && c === c0 ? "var(--warn)" : "var(--line)", strokeWidth: n === n0 && c === c0 ? 3 : 1 });
          for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) css(S(s, "rect", { x: X0 + c * cw + 8 + b * 10, y: Y0 + n * ch + 8 + a * 10, width: 8, height: 8 }), { fill: on ? "#fff" : "var(--line)", opacity: on ? 0.55 : 1 });
        }
      }
      S(s, "text", { x: 10, y: Y0 + N * ch + 18 }, "each block = one H × W map; samples N ↓");
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(s);
      var txt = { bn: "<b>Batch Norm</b>: μ, σ per <b>channel</b>, computed over (N, H, W) — across the whole mini-batch. Training uses batch statistics; inference uses running averages (then BN is just a fixed linear map). Breaks down for very small batches.",
        ln: "<b>Layer Norm</b>: μ, σ per <b>sample</b>, over (C, H, W). Independent of batch size; same computation at train and test time (used in RNNs/Transformers). Assumes all channels contribute similarly.",
        "in": "<b>Instance Norm</b>: μ, σ per <b>sample and per channel</b>, over (H, W) only. Removes each image's own contrast/brightness statistics — ideal for style transfer, but cannot exploit channel dependence.",
        gn: "<b>Group Norm</b>: channels split into G groups (paper default G = 32); μ, σ per sample per group over (C/G, H, W). <b>G = 1 → Layer Norm; G = C → Instance Norm.</b> Batch-size independent." }[m];
      el(host, "#o").innerHTML = txt + "<br><br>Highlighted: all values that share one mean and variance with the chosen (n = " + n0 + ", c = " + c0 + ").<br>Each method then applies a learnable per-channel affine map: y = γ x̂ + β, with x̂ = (x − μ)/√(σ² + ε).";
    }
    on(host, "select", "input", run); run();
  };

  D.archcalc = function (host) {
    var PRE = {
      alex: "227, 3\nconv 96 11 4 0\npool 3 2\nconv 256 5 1 2\npool 3 2\nconv 384 3 1 1\nconv 384 3 1 1\nconv 256 3 1 1\npool 3 2\nfc 4096\nfc 4096\nfc 1000",
      lenet: "32, 1\nconv 6 5 1 0\npool 2 2\nconv 16 5 1 0\npool 2 2\nfc 120\nfc 84\nfc 10",
      vgg: "224, 3\nconv 64 3 1 1\nconv 64 3 1 1\npool 2 2\nconv 128 3 1 1\nconv 128 3 1 1\npool 2 2\nconv 256 3 1 1\nconv 256 3 1 1\nconv 256 3 1 1\npool 2 2\nconv 512 3 1 1\nconv 512 3 1 1\nconv 512 3 1 1\npool 2 2\nconv 512 3 1 1\nconv 512 3 1 1\nconv 512 3 1 1\npool 2 2\nfc 4096\nfc 4096\nfc 1000",
      gap: "224, 3\nconv 64 3 1 1\npool 2 2\nconv 128 3 1 1\npool 2 2\nconv 512 3 1 1\npool 2 2\ngap\nfc 1000"
    };
    host.innerHTML = '<div class="demo-row"><span class="seg" id="pre"><button data-k="lenet">LeNet-5</button><button data-k="alex" class="on">AlexNet (single-GPU view)</button><button data-k="vgg">VGG-16</button><button data-k="gap">Small net with global average pooling</button></span></div>' +
      '<div class="demo-row"><label class="grow">Layers — first line "input size, channels"; then conv K f s p | pool f s | fc units | gap<textarea id="L" rows="6"></textarea></label></div><div class="out" id="o" style="overflow-x:auto"></div>';
    function run() {
      var lines = el(host, "#L").value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      var first = nums(lines[0] || ""), H = first[0], Cc = first[1], flat = null, total = 0, rows = "", convP = 0, fcP = 0;
      for (var i = 1; i < lines.length; i++) {
        var t = lines[i].split(/\s+/), k = t[0], v = t.slice(1).map(Number), p = 0, out;
        if (k === "conv") { var K = v[0], fz = v[1], s = v[2] || 1, pd = v[3] || 0; H = Math.floor((H + 2 * pd - fz) / s) + 1; p = K * (fz * fz * Cc + 1); Cc = K; convP += p; out = H + "×" + H + "×" + Cc; }
        else if (k === "pool") { H = Math.floor((H - v[0]) / (v[1] || v[0])) + 1; out = H + "×" + H + "×" + Cc; }
        else if (k === "gap") { flat = Cc; H = 1; out = "1×1×" + Cc + " (global average pool)"; }
        else if (k === "fc") { var nin = flat !== null ? flat : H * H * Cc; p = nin * v[0] + v[0]; flat = v[0]; fcP += p; out = String(v[0]); }
        else { out = "?"; }
        total += p;
        rows += "<tr><td>" + K_esc(lines[i]) + "</td><td>" + out + "</td><td>" + (p ? p.toLocaleString() : "0") + "</td></tr>";
      }
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th>Layer</th><th>Output</th><th>Parameters (weights + biases)</th></tr>' + rows + '<tr class="total"><td>Total</td><td></td><td>' + total.toLocaleString() + "</td></tr></table>" +
        "Conv layers: " + convP.toLocaleString() + " · FC layers: " + fcP.toLocaleString() + " (" + (total ? Math.round(100 * fcP / total) : 0) + " % of all parameters)<br><small>Output size ⌊(W − F + 2P)/S⌋ + 1; conv parameters (F·F·C<sub>in</sub> + 1)·K; FC parameters N<sub>in</sub>·N<sub>out</sub> + N<sub>out</sub>; pooling has none. Global average pooling replaces the huge first FC layer — the main reason GoogLeNet has ~5 M parameters vs VGG-16's ~138 M.</small>";
    }
    function K_esc(s) { return K.esc(s); }
    on(host, "textarea", "input", run);
    on(host, "#pre button", "click", function () { host.querySelectorAll("#pre button").forEach(function (b) { b.classList.remove("on"); }); this.classList.add("on"); el(host, "#L").value = PRE[this.getAttribute("data-k")]; run(); });
    el(host, "#L").value = PRE.alex; run();
  };

  D.bottleneck = function (host) {
    host.innerHTML = '<div class="demo-row"><span class="seg" id="pre"><button data-k="vgg" class="on">VGG: 3 × (3×3) vs 1 × (7×7)</button><button data-k="inc">Inception: 1×1 before 5×5</button><button data-k="res">ResNet bottleneck</button></span><label>Channels C<input type="number" id="c" value="64"></label></div><div class="out" id="o"></div>';
    var mode = "vgg";
    function run() {
      var C = +el(host, "#c").value || 64, h = "";
      if (mode === "vgg") {
        h = "<b>Receptive field</b> of L stacked k × k convs (stride 1): R<sub>L</sub> = R<sub>L−1</sub> + (k − 1), R<sub>0</sub> = 1 → 3×3: 3 → 5 → <b>7</b>.<br>" +
          "<b>Parameters</b> (C in, C out, no bias): one 7×7 = 49C² = " + (49 * C * C).toLocaleString() + "; three 3×3 = 3 × 9C² = 27C² = " + (27 * C * C).toLocaleString() + " (" + Math.round(100 * (1 - 27 / 49)) + " % fewer).<br>" +
          "Plus: three ReLUs instead of one → more nonlinearity, deeper block. Same spatial size (stride 1, pad 1) — it does not downsample faster.";
      } else if (mode === "inc") {
        var Hh = 28, Cin = 192, out = 32, red = 16;
        var direct = Hh * Hh * out * 5 * 5 * Cin, b1 = Hh * Hh * red * Cin, b2 = Hh * Hh * out * 5 * 5 * red;
        h = "Input 28 × 28 × 192 → 5 × 5 conv with 32 filters.<br>Direct: 28·28·32 × (5·5·192) = <b>" + (direct / 1e6).toFixed(1) + " M</b> multiplications.<br>" +
          "With a 1 × 1 bottleneck to 16 channels first: 28·28·16 × 192 + 28·28·32 × (5·5·16) = " + (b1 / 1e6).toFixed(1) + " M + " + (b2 / 1e6).toFixed(1) + " M = <b>" + ((b1 + b2) / 1e6).toFixed(1) + " M</b> (" + (direct / (b1 + b2)).toFixed(1) + "× cheaper).<br>" +
          "A 1 × 1 conv mixes channels at each pixel (cross-channel mixing) and can reduce their number; it does not enlarge the receptive field or downsample. Branch outputs (1×1, 3×3, 5×5, pool) are <b>concatenated along depth</b>.";
      } else {
        var W = 4 * C;
        var p1 = W * C, p2 = 9 * C * C, p3 = C * W, basic = 2 * 9 * W * W;
        h = "Bottleneck block on " + W + " channels (ResNet-50/101/152): 1×1 (" + W + "→" + C + ") → 3×3 (" + C + "→" + C + ") → 1×1 (" + C + "→" + W + ").<br>Parameters ≈ " + p1.toLocaleString() + " + " + p2.toLocaleString() + " + " + p3.toLocaleString() + " = <b>" + (p1 + p2 + p3).toLocaleString() + "</b>.<br>Two plain 3×3 convs on " + W + " channels would need " + basic.toLocaleString() + " (" + (basic / (p1 + p2 + p3)).toFixed(1) + "× more).<br>" +
          "The 3×3 works on the <b>reduced</b> channels; the identity shortcut adds 0 parameters when dimensions match, and a 1×1 projection (or zero-padding) is used when they don't. ResNet-18/34 use the <b>basic block</b> (two 3×3 convs) instead.";
      }
      el(host, "#o").innerHTML = h;
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { host.querySelectorAll("#pre button").forEach(function (b) { b.classList.remove("on"); }); this.classList.add("on"); mode = this.getAttribute("data-k"); run(); });
    run();
  };

  D.gradcam = function (host) {
    host.innerHTML = '<p style="margin:0">Two 3 × 3 feature maps A¹, A² from the last conv layer and the gradients ∂y<sup>c</sup>/∂A of the class score. Edit any number.</p>' +
      '<div class="demo-row"><label class="grow">A¹<input class="wide" id="a1" value="0 1 0, 1 3 1, 0 1 0"></label><label class="grow">∂y/∂A¹<input class="wide" id="g1" value="0.2 0.2 0.2, 0.2 0.4 0.2, 0.2 0.2 0.2"></label></div>' +
      '<div class="demo-row"><label class="grow">A²<input class="wide" id="a2" value="2 0 0, 0 0 0, 0 0 1"></label><label class="grow">∂y/∂A²<input class="wide" id="g2" value="-0.3 -0.1 -0.1, -0.1 -0.1 -0.1, -0.1 -0.1 -0.1"></label></div>' +
      '<div class="two-col"><div id="m"></div><div class="out" id="o"></div></div>';
    function mat(s) { return s.split(",").map(nums); }
    function run() {
      var A = [mat(el(host, "#a1").value), mat(el(host, "#a2").value)], Gd = [mat(el(host, "#g1").value), mat(el(host, "#g2").value)];
      var al = Gd.map(function (g) { var s = 0, z = 0; g.forEach(function (r) { r.forEach(function (v) { s += v; z++; }); }); return s / z; });
      var L = A[0].map(function (r, i) { return r.map(function (_, j) { var v = al[0] * A[0][i][j] + al[1] * A[1][i][j]; return Math.max(0, v); }); });
      el(host, "#m").innerHTML = "<b>Grad-CAM map</b>" + gridHTML(L.map(function (r) { return r.map(function (v) { return +v.toFixed(3); }); }), { heat: Math.max.apply(null, L.map(function (r) { return Math.max.apply(null, r); })) || 1 });
      el(host, "#o").innerHTML = "Step 1 — importance weights by global average pooling of the gradients: α₁ = " + f(al[0], 4) + ", α₂ = " + f(al[1], 4) + "<br>Step 2 — weighted sum Σ α<sub>k</sub>A<sup>k</sup>, then <b>ReLU</b> keeps only regions with a positive influence on class c.<br>Step 3 — upsample to the image size and overlay as a heat map.<br><small>Feature map 2 has a negative weight (it argues against the class), so its strong top-left value is suppressed. A saliency map instead takes ∂y<sup>c</sup>/∂(image pixels) in one backward pass.</small>";
    }
    on(host, "input", "input", run); run();
  };

  /* ===================================================================
     WEEK 7
     =================================================================== */
  function seqPlot(series, T, yr, opt) {
    var s = plot([], [0, T - 1], yr, opt || { w: 460, h: 230 });
    series.forEach(function (se, k) {
      var d = ""; se.v.forEach(function (v, t) { d += (t ? "L" : "M") + s._X(t) + "," + s._Y(Math.max(yr[0], Math.min(yr[1], v))); });
      css(S(s, "path", { d: d }), { fill: "none", stroke: se.color || K.PALETTE[k], strokeWidth: 2.2, strokeDasharray: se.dash || "" });
      se.v.forEach(function (v, t) { css(S(s, "circle", { cx: s._X(t), cy: s._Y(Math.max(yr[0], Math.min(yr[1], v))), r: 2.5 }), { fill: se.color || K.PALETTE[k] }); });
    });
    return s;
  }
  D.memneuron = function (host) {
    var SIG = { pulse: function (t) { return t === 2 ? 1 : 0; }, step: function (t) { return t >= 3 ? 1 : 0; }, sq: function (t) { return Math.floor(t / 5) % 2 ? 1 : 0; }, rnd: function (t) { return [0.2, 0.9, 0.1, 0.5, 1, 0, 0.3, 0.8, 0.4, 0.6, 0.1, 0.9, 0.7, 0.2, 0.5, 0.3, 0.9, 0, 0.6, 0.4][t % 20]; } };
    host.innerHTML = '<div class="demo-row"><label>Input s(k)<select id="sg"><option value="pulse">Single pulse at k = 2</option><option value="step">Step at k = 3</option><option value="sq">Square wave</option><option value="rnd">Irregular</option></select></label><label>Memory coefficient α = <span id="al"></span><input type="range" id="a" min="0.05" max="1" step="0.05" value="0.3"></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var a = +el(host, "#a").value, fn = SIG[el(host, "#sg").value], T = 20, s = [], v = [0];
      el(host, "#al").textContent = f(a, 2);
      for (var k = 0; k < T; k++) s.push(fn(k));
      for (k = 1; k < T; k++) v.push(a * s[k - 1] + (1 - a) * v[k - 1]);
      el(host, "#pl").innerHTML = legend([{ name: "network-neuron output s(k)", color: K.PALETTE[0] }, { name: "memory-neuron output v(k)", color: K.PALETTE[1] }]);
      el(host, "#pl").appendChild(seqPlot([{ v: s }, { v: v }], T, [-0.05, 1.1]));
      var w = [0, 1, 2, 3, 4].map(function (j) { return a * Math.pow(1 - a, j); });
      el(host, "#o").innerHTML = "v(k) = α·s(k − 1) + (1 − α)·v(k − 1)<br>Unrolled: v(k) = α Σ<sub>j≥0</sub> (1 − α)<sup>j</sup> s(k − 1 − j) — an <b>exponentially fading</b> summary of the neuron's past outputs.<br>Weights on s(k−1), s(k−2), …: " + w.map(function (x) { return f(x, 3); }).join(", ") + " …<br><br>" +
        (a > 0.8 ? "α close to 1: memory ≈ last output only (short memory)." : a < 0.2 ? "α small: long, slowly fading memory." : "Moderate α: balances the current contribution and accumulated history.") +
        "<br><small>α is one scalar for all time steps (learned, but the same whatever the input) — the decay rate is <b>content-blind</b>. LSTM gates instead compute a forget/keep factor from the current input at every step.</small>";
    }
    on(host, "select,input", "input", run); run();
  };

  D.rnnunroll = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Recurrent weight W = <span id="wl"></span><input type="range" id="w" min="0" max="3" step="0.05" value="0.9"></label><label>Input weight U = <span id="ul"></span><input type="range" id="u" min="0" max="2" step="0.05" value="1"></label><label>Sequence length T<select id="T"><option>10</option><option selected>20</option><option>40</option></select></label><label><span><input type="checkbox" id="lin"> linear activation (no tanh)</span></label></div><div class="two-col"><div id="pl"></div><div id="pl2"></div></div><div class="out" id="o"></div>';
    function run() {
      var W = +el(host, "#w").value, U = +el(host, "#u").value, T = +el(host, "#T").value, lin = el(host, "#lin").checked;
      el(host, "#wl").textContent = f(W, 2); el(host, "#ul").textContent = f(U, 2);
      var x = [], s = [], prev = 0, z = [];
      for (var t = 0; t < T; t++) { x.push(t === 0 ? 1 : 0.1 * Math.sin(t)); var a = U * x[t] + W * prev; z.push(a); prev = lin ? a : Math.tanh(a); s.push(prev); }
      var g = [], lg = [];
      for (var k = 0; k < T; k++) { var p = 1; for (var j = k + 1; j < T; j++) p *= W * (lin ? 1 : 1 - Math.tanh(z[j]) * Math.tanh(z[j])); g.push(Math.abs(p)); lg.push(Math.log10(Math.max(1e-12, Math.abs(p)))); }
      var ymin = Math.min.apply(null, s.concat([-1])), ymax = Math.max.apply(null, s.concat([1]));
      el(host, "#pl").innerHTML = '<div style="font-size:.8rem;color:var(--ink-2)">Hidden state s<sub>t</sub> (input: a spike at t = 0)</div>';
      el(host, "#pl").appendChild(seqPlot([{ v: s.map(function (q) { return Math.max(-50, Math.min(50, q)); }) }], T, [Math.max(-50, ymin), Math.min(50, ymax)], { w: 420, h: 220 }));
      var lmin = Math.min.apply(null, lg), lmax = Math.max.apply(null, lg);
      el(host, "#pl2").innerHTML = '<div style="font-size:.8rem;color:var(--ink-2)">log₁₀ |∂s<sub>T</sub>/∂s<sub>k</sub>| — how much step k can still influence the last step</div>';
      el(host, "#pl2").appendChild(seqPlot([{ v: lg, color: "var(--bad)" }], T, [Math.min(-1, Math.floor(lmin)), Math.max(1, Math.ceil(lmax))], { w: 420, h: 220 }));
      el(host, "#o").innerHTML = "s<sub>t</sub> = " + (lin ? "" : "tanh(") + "U·x<sub>t</sub> + W·s<sub>t−1</sub>" + (lin ? "" : ")") + " — the <b>same</b> U and W at every step (parameter sharing).<br>" +
        "BPTT: ∂E<sub>T</sub>/∂W sums over every earlier step k, each term containing ∂s<sub>T</sub>/∂s<sub>k</sub> = Π<sub>j=k+1</sub><sup>T</sup> W·tanh′(z<sub>j</sub>).<br>Gradient reaching the first step: <b>" + (g[0] < 1e-6 ? g[0].toExponential(1) : f(g[0], 4)) + "</b> → " +
        (g[0] < 1e-3 ? '<span class="no">vanishing</span> — the network cannot learn long-range dependencies.' : g[0] > 1e3 ? '<span class="no">exploding</span> — use gradient clipping.' : "still usable.") +
        "<br><small>tanh′ ≤ 1, so with |W| &lt; 1 the product shrinks geometrically; with large W and a linear activation it explodes. LSTMs keep an additive cell-state path whose factor is the forget gate (≈ 1 when remembering).</small>";
    }
    on(host, "select,input", "input", run); run();
  };

  D.lstmcell = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Previous cell C<sub>t−1</sub><input type="number" id="c" value="2" step="0.1"></label><label>Forget gate f<sub>t</sub> = <span id="fl"></span><input type="range" id="f" min="0" max="1" step="0.01" value="0.5"></label><label>Input gate i<sub>t</sub> = <span id="il"></span><input type="range" id="i" min="0" max="1" step="0.01" value="0.8"></label><label>Candidate C̃<sub>t</sub> = <span id="ccl"></span><input type="range" id="cc" min="-1" max="1" step="0.01" value="0.5"></label><label>Output gate o<sub>t</sub> = <span id="ol"></span><input type="range" id="o2" min="0" max="1" step="0.01" value="0.9"></label></div>' +
      '<div class="demo-row"><span class="seg" id="pre"><button data-p="2,0.5,0.8,0.5,0.9">Mixed</button><button data-p="2,1,0,0.5,0.9">Remember (f = 1, i = 0)</button><button data-p="2,0,1,-0.7,0.9">Overwrite (f = 0, i = 1)</button><button data-p="2,1,1,0.5,0.9">Keep and add (f = 1, i = 1)</button><button data-p="2,1,0,0.5,0">Hide output (o = 0)</button></span></div><div class="out" id="out"></div>';
    function run() {
      var C = +el(host, "#c").value, fg = +el(host, "#f").value, ig = +el(host, "#i").value, cc = +el(host, "#cc").value, og = +el(host, "#o2").value;
      el(host, "#fl").textContent = f(fg, 2); el(host, "#il").textContent = f(ig, 2); el(host, "#ccl").textContent = f(cc, 2); el(host, "#ol").textContent = f(og, 2);
      var Cn = fg * C + ig * cc, h = og * Math.tanh(Cn);
      var keep = []; var cc2 = C; for (var t = 0; t < 30; t++) cc2 = fg * cc2; keep = cc2;
      el(host, "#out").innerHTML = "<b>Cell state</b> C<sub>t</sub> = f<sub>t</sub>·C<sub>t−1</sub> + i<sub>t</sub>·C̃<sub>t</sub> = " + f(fg, 2) + "×" + f(C, 2) + " + " + f(ig, 2) + "×" + f(cc, 2) + " = <b>" + f(Cn, 4) + "</b><br>" +
        "<b>Hidden output</b> h<sub>t</sub> = o<sub>t</sub>·tanh(C<sub>t</sub>) = " + f(og, 2) + " × tanh(" + f(Cn, 3) + ") = <b>" + f(h, 4) + "</b><br><br>" +
        "Gates are sigmoid layers (values 0…1) multiplied point-wise: f<sub>t</sub> = σ(W<sub>f</sub>[h<sub>t−1</sub>, x<sub>t</sub>] + b<sub>f</sub>), i<sub>t</sub> = σ(W<sub>i</sub>[h<sub>t−1</sub>, x<sub>t</sub>] + b<sub>i</sub>), C̃<sub>t</sub> = tanh(W<sub>C</sub>[h<sub>t−1</sub>, x<sub>t</sub>] + b<sub>C</sub>), o<sub>t</sub> = σ(W<sub>o</sub>[h<sub>t−1</sub>, x<sub>t</sub>] + b<sub>o</sub>).<br>" +
        "With this forget gate held for 30 steps, C<sub>t−1</sub> would shrink to " + f(keep, 4) + " — with f = 1 the memory passes unchanged (∂C<sub>t</sub>/∂C<sub>t−1</sub> = f<sub>t</sub>): the additive \"memory highway\".<br><small>Two separate gates: \"how much to keep\" and \"how much to write\" are independent decisions — e.g. keep and add (f = 1, i = 1) is impossible with one gate g and (1 − g).</small>";
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { var p = this.getAttribute("data-p").split(","); ["#c", "#f", "#i", "#cc", "#o2"].forEach(function (id, k) { el(host, id).value = p[k]; }); run(); });
    run();
  };

  D.attention = function (host) {
    var WORDS = ["The", "animal", "didn't", "cross", "it", "tired"];
    var EMB = [[0.1, 0.0, 0.2], [1.0, 0.9, 0.1], [0.0, 0.2, 0.8], [0.1, 0.1, 1.0], [0.9, 1.0, 0.2], [0.8, 0.6, 0.3]];
    host.innerHTML = '<div class="demo-row"><label>Query word<select id="q">' + WORDS.map(function (w, i) { return '<option value="' + i + '"' + (i === 4 ? " selected" : "") + ">" + w + "</option>"; }).join("") + '</select></label><label>Key dimension d<sub>k</sub><select id="dk"><option value="3">3 (toy)</option><option value="64">64 (Transformer: √64 = 8)</option></select></label><label><span><input type="checkbox" id="sc" checked> divide scores by √d<sub>k</sub></span></label><label>Score scale (sharpness) <input type="range" id="t" min="1" max="12" value="4"></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var qi = +el(host, "#q").value, dk = +el(host, "#dk").value, sc = el(host, "#sc").checked, mul = +el(host, "#t").value;
      var q = EMB[qi], scores = EMB.map(function (k) { return mul * dot(q, k) * (dk === 64 ? 8 : 1); });
      var div = sc ? Math.sqrt(dk) : 1, z = scores.map(function (s) { return s / div; }), mx = Math.max.apply(null, z);
      var e = z.map(function (v) { return Math.exp(v - mx); }), sum = e.reduce(function (a, b) { return a + b; }, 0), a = e.map(function (v) { return v / sum; });
      var s = svgEl(420, 40 + WORDS.length * 30);
      WORDS.forEach(function (w, i) {
        S(s, "text", { x: 80, y: 30 + i * 30, "text-anchor": "end" }, w);
        css(S(s, "rect", { x: 90, y: 16 + i * 30, width: 300 * a[i], height: 20, rx: 3 }), { fill: "var(--acc)", opacity: (0.25 + 0.75 * a[i]).toFixed(2) });
        S(s, "text", { x: 96 + 300 * a[i], y: 31 + i * 30 }, f(a[i], 3));
      });
      S(s, "text", { x: 90, y: 10 }, "attention weights of \"" + WORDS[qi] + "\" (softmax, sum = 1)");
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(s);
      el(host, "#o").innerHTML = "Scaled dot-product attention: <b>Attention(Q, K, V) = softmax(QK<sup>T</sup>/√d<sub>k</sub>) V</b><br>1. Make query, key and value vectors from each word embedding (×W<sup>Q</sup>, W<sup>K</sup>, W<sup>V</sup>).<br>2. Score = q·k for every word.<br>3. Divide by √d<sub>k</sub> (= 8 for d<sub>k</sub> = 64) → stable gradients.<br>4. Softmax → weights all positive, &lt; 1, summing to 1.<br>5. Output = Σ weight × value vector: relevant words kept, irrelevant ones drowned out.<br><br>" +
        (!sc && dk === 64 ? '<span class="no">Without scaling</span> the large scores push softmax to an almost one-hot output (saturated → tiny gradients).' : "Here \"" + WORDS[qi] + "\" attends most to \"" + WORDS[a.indexOf(Math.max.apply(null, a))] + "\".") +
        "<br><small>Multi-head attention repeats this with several W<sup>Q</sup>, W<sup>K</sup>, W<sup>V</sup> sets (different representation subspaces) and concatenates the heads; positional encodings add word order.</small>";
    }
    on(host, "select,input", "input", run); run();
  };

  /* ===================================================================
     WEEK 8
     =================================================================== */
  function iou(a, b) { // boxes [x1, y1, x2, y2]
    var ix = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])), iy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
    var inter = ix * iy, ua = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter;
    return { i: inter, u: ua, v: ua > 0 ? inter / ua : 0 };
  }
  window.AID.iou = iou;
  function boxSvg(boxes, W, H, sc) {
    var s = svgEl(W * sc + 20, H * sc + 20);
    css(S(s, "rect", { x: 10, y: 10, width: W * sc, height: H * sc }), { fill: "var(--card)", stroke: "var(--line)" });
    boxes.forEach(function (b) {
      var r = S(s, "rect", { x: 10 + b.b[0] * sc, y: 10 + b.b[1] * sc, width: (b.b[2] - b.b[0]) * sc, height: (b.b[3] - b.b[1]) * sc });
      css(r, { fill: b.fill || "none", stroke: b.color, strokeWidth: b.w || 2.5, strokeDasharray: b.dash || "", opacity: b.op || 1 });
      if (b.label) css(S(s, "text", b.lpos === "b" ? { x: 6 + b.b[2] * sc, y: 4 + b.b[3] * sc, "text-anchor": "end" } : { x: 14 + b.b[0] * sc, y: 24 + b.b[1] * sc }, b.label), { fill: b.color, fontWeight: 700 });
    });
    return s;
  }
  D.iou = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Box A [x1, y1, x2, y2]<input id="a" value="0, 0, 4, 4"></label><label>Box B<input id="b" value="2, 0, 6, 4"></label></div><div class="demo-row"><label>Move B horizontally <input type="range" id="dx" min="-6" max="6" step="0.1" value="0"></label><span class="seg" id="pre"><button data-p="0,0,2,2|1,1,3,3">Diagonal overlap</button><button data-p="0,0,4,4|2,0,6,4">Half overlap</button><button data-p="0,0,10,10|6,5,10,10">Small box inside</button><button data-p="0,0,4,4|5,5,7,7">No overlap</button></span></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var a = nums(el(host, "#a").value), b0 = nums(el(host, "#b").value), dx = +el(host, "#dx").value;
      if (a.length < 4 || b0.length < 4) return;
      var b = [b0[0] + dx, b0[1], b0[2] + dx, b0[3]], r = iou(a, b);
      var xs = [a[0], a[2], b[0], b[2], 0], ys = [a[1], a[3], b[1], b[3], 0], mx = Math.min.apply(null, xs), my = Math.min.apply(null, ys), Mx = Math.max.apply(null, xs), My = Math.max.apply(null, ys);
      var sc = 260 / Math.max(Mx - mx, My - my, 1);
      function sh(q) { return [q[0] - mx, q[1] - my, q[2] - mx, q[3] - my]; }
      var bx = [{ b: sh(a), color: "var(--acc)", label: "A" }, { b: sh(b), color: "var(--warn)", label: "B" }];
      var ix1 = Math.max(a[0], b[0]), iy1 = Math.max(a[1], b[1]), ix2 = Math.min(a[2], b[2]), iy2 = Math.min(a[3], b[3]);
      if (ix2 > ix1 && iy2 > iy1) bx.unshift({ b: sh([ix1, iy1, ix2, iy2]), color: "transparent", fill: "var(--good)", op: 0.35 });
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(boxSvg(bx, Mx - mx, My - my, sc));
      el(host, "#o").innerHTML = "Intersection area = " + f(r.i, 3) + "<br>Union = area(A) + area(B) − intersection = " + f(r.u, 3) + "<br><b>IoU = " + f(r.v, 4) + "</b><br><small>IoU = 1 for identical boxes, 0 for disjoint ones. Detection counts as correct (TP) if IoU with a ground-truth box ≥ a threshold (often 0.5); NMS treats boxes with IoU above its threshold as duplicates.</small>";
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { var p = this.getAttribute("data-p").split("|"); el(host, "#a").value = p[0]; el(host, "#b").value = p[1]; el(host, "#dx").value = 0; run(); });
    run();
  };

  D.nms = function (host) {
    var SETS = {
      asg: { n: "Assignment Q2 (one car)", W: 14, H: 12, B: [{ id: "A", s: 0.95, b: [0, 0, 10, 10] }, { id: "B", s: 0.80, b: [1.7647, 0, 11.7647, 10], lpos: "b" }, { id: "C", s: 0.75, b: [6, 5, 10, 10] }] },
      two: { n: "Two cars + duplicates", W: 24, H: 12, B: [{ id: "A", s: 0.92, b: [1, 2, 9, 9] }, { id: "B", s: 0.85, b: [2, 2.5, 10, 9.5] }, { id: "C", s: 0.30, b: [0, 1, 8, 8] }, { id: "D", s: 0.88, b: [14, 3, 22, 10] }, { id: "E", s: 0.70, b: [13, 2, 21, 9] }, { id: "F", s: 0.10, b: [9, 0, 13, 4] }] }
    };
    host.innerHTML = '<div class="demo-row"><label>Scene<select id="sc">' + Object.keys(SETS).map(function (k) { return '<option value="' + k + '">' + SETS[k].n + "</option>"; }).join("") + '</select></label><label>IoU threshold = <span id="tl"></span><input type="range" id="t" min="0.1" max="0.9" step="0.05" value="0.5"></label><label>Score threshold = <span id="sl"></span><input type="range" id="s" min="0" max="0.9" step="0.05" value="0.2"></label><button class="btn ghost" id="st">Next step</button><button class="btn ghost" id="rs">Restart</button></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    var step = 0;
    function run() {
      var set = SETS[el(host, "#sc").value], T = +el(host, "#t").value, st = +el(host, "#s").value;
      el(host, "#tl").textContent = f(T, 2); el(host, "#sl").textContent = f(st, 2);
      var boxes = set.B.slice().sort(function (a, b) { return b.s - a.s; });
      var log = ["1. Sort by score: " + boxes.map(function (b) { return b.id + " (" + b.s + ")"; }).join(", ")];
      var low = boxes.filter(function (b) { return b.s < st; }); boxes = boxes.filter(function (b) { return b.s >= st; });
      log.push("2. Discard scores below " + f(st, 2) + ": " + (low.length ? low.map(function (b) { return b.id; }).join(", ") : "none"));
      var keep = [], removed = {}, remaining = boxes.slice(), k = 0;
      while (remaining.length && k < step) {
        var top = remaining.shift(); keep.push(top);
        var msg = "3." + (k + 1) + " Keep " + top.id + " (" + top.s + ")";
        var sup = [];
        remaining = remaining.filter(function (b) { var v = iou(top.b, b.b).v; if (v > T) { sup.push(b.id + " (IoU " + f(v, 2) + ")"); removed[b.id] = top.id; return false; } return true; });
        log.push(msg + (sup.length ? "; suppress " + sup.join(", ") : "; nothing overlaps more than " + f(T, 2)));
        k++;
      }
      var done = !remaining.length;
      var vis = set.B.map(function (b) {
        var isK = keep.indexOf(b) >= 0, isR = removed[b.id] || low.indexOf(b) >= 0;
        return { b: b.b, color: isK ? "var(--good)" : isR ? "var(--bad)" : "var(--ink-3)", dash: isR ? "4 3" : "", label: b.id + " " + b.s, w: isK ? 3.5 : 2, lpos: b.lpos };
      });
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(boxSvg(vis, set.W, set.H, 300 / set.W));
      el(host, "#o").innerHTML = log.join("<br>") + "<br>" + (done ? '<b class="ok">Done.</b> Kept: ' + keep.map(function (b) { return b.id; }).join(", ") : "Press <b>Next step</b>.") +
        (el(host, "#sc").value === "asg" && done ? "<br><small>C (mirror region) survives: its IoU with A is only 0.2, so NMS does not treat it as a duplicate — NMS cannot remove every false positive.</small>" : "") +
        "<br><small>Green = kept, red dashed = suppressed/discarded.</small>";
    }
    on(host, "select,input", "input", function () { step = 0; run(); });
    el(host, "#st").addEventListener("click", function () { step++; run(); });
    el(host, "#rs").addEventListener("click", function () { step = 0; run(); });
    run();
  };

  D.bboxreg = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Proposal p (cx, cy, w, h)<input id="p" value="50, 50, 40, 20"></label><label>Ground truth g (cx, cy, w, h)<input id="g" value="56, 47, 60, 24"></label></div><div class="two-col"><div class="out" id="o"></div><div id="pl"></div></div>';
    function run() {
      var p = nums(el(host, "#p").value), g = nums(el(host, "#g").value);
      if (p.length < 4 || g.length < 4) return;
      var t = [(g[0] - p[0]) / p[2], (g[1] - p[1]) / p[3], Math.log(g[2] / p[2]), Math.log(g[3] / p[3])];
      el(host, "#o").innerHTML = "<b>Targets</b> (what the regressor learns):<br>t<sub>x</sub> = (g<sub>x</sub> − p<sub>x</sub>)/p<sub>w</sub> = " + f(t[0], 4) + "<br>t<sub>y</sub> = (g<sub>y</sub> − p<sub>y</sub>)/p<sub>h</sub> = " + f(t[1], 4) + "<br>t<sub>w</sub> = log(g<sub>w</sub>/p<sub>w</sub>) = " + f(t[2], 4) + "<br>t<sub>h</sub> = log(g<sub>h</sub>/p<sub>h</sub>) = " + f(t[3], 4) +
        "<br><br><b>Applying predictions</b> d(p) = t: ĝ<sub>x</sub> = p<sub>w</sub>d<sub>x</sub> + p<sub>x</sub>, ĝ<sub>y</sub> = p<sub>h</sub>d<sub>y</sub> + p<sub>y</sub>, ĝ<sub>w</sub> = p<sub>w</sub>e<sup>d<sub>w</sub></sup>, ĝ<sub>h</sub> = p<sub>h</sub>e<sup>d<sub>h</sub></sup> → recovers g exactly." +
        "<br><small>Centres: scale-invariant shifts (relative to box size); widths/heights: log-scale ratios. R-CNN fits these with regularised least squares on pooled CNN features; Fast/Faster R-CNN and SSD use a smooth-L1 loss. YOLOv2 instead uses b<sub>x</sub> = σ(t<sub>x</sub>) + c<sub>x</sub>, b<sub>w</sub> = p<sub>w</sub>e<sup>t<sub>w</sub></sup>.</small>";
      function bx(q) { return [q[0] - q[2] / 2, q[1] - q[3] / 2, q[0] + q[2] / 2, q[1] + q[3] / 2]; }
      var s = plot([{ f: function (x) { return Math.abs(x) < 1 ? 0.5 * x * x : Math.abs(x) - 0.5; }, name: "smooth L1", color: "var(--acc)" }, { f: function (x) { return 0.5 * x * x; }, name: "L2 (½x²)", color: "var(--bad)", dash: "5 4" }, { f: function (x) { return Math.abs(x); }, name: "L1", color: "var(--ink-3)", dash: "2 3" }], [-3, 3], [0, 4], { w: 300, h: 190 });
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(boxSvg([{ b: bx(p), color: "var(--warn)", label: "p" }, { b: bx(g), color: "var(--good)", label: "g" }], 120, 100, 2.4));
      el(host, "#pl").insertAdjacentHTML("beforeend", legend([{ name: "smooth L1", color: "var(--acc)" }, { name: "L2", color: "var(--bad)" }, { name: "L1", color: "var(--ink-3)" }]));
      el(host, "#pl").appendChild(s);
    }
    on(host, "input", "input", run); run();
  };

  D.roipool = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Region size h = w<input type="number" id="h" value="15" min="2" max="30"></label><label>Output grid H = W<input type="number" id="H" value="7" min="1" max="14"></label><label>Method<select id="m"><option value="pool">RoI Pooling (quantised)</option><option value="align">RoI Align (bilinear, no rounding)</option></select></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var h = Math.max(2, +el(host, "#h").value), Hh = Math.max(1, +el(host, "#H").value), m = el(host, "#m").value, sz = 300 / h;
      var s = svgEl(h * sz + 20, h * sz + 20), i;
      for (i = 0; i <= h; i++) { css(S(s, "line", { x1: 10 + i * sz, x2: 10 + i * sz, y1: 10, y2: 10 + h * sz }), { stroke: "var(--line)" }); css(S(s, "line", { y1: 10 + i * sz, y2: 10 + i * sz, x1: 10, x2: 10 + h * sz }), { stroke: "var(--line)" }); }
      var edges = [], sizes = [];
      for (i = 0; i <= Hh; i++) edges.push(i * h / Hh);
      if (m === "pool") {
        var st = [], en = [];
        for (i = 0; i < Hh; i++) { st.push(Math.floor(i * h / Hh)); en.push(Math.ceil((i + 1) * h / Hh)); sizes.push(en[i] - st[i]); }
        for (i = 0; i < Hh; i++) { css(S(s, "rect", { x: 10 + st[i] * sz, y: 10 + st[0] * sz, width: (en[i] - st[i]) * sz, height: 2 }), { fill: K.PALETTE[i % 8] }); }
        st.concat(en).forEach(function (e) { css(S(s, "line", { x1: 10 + e * sz, x2: 10 + e * sz, y1: 10, y2: 10 + h * sz }), { stroke: "var(--bad)", strokeWidth: 1.5 }); css(S(s, "line", { y1: 10 + e * sz, y2: 10 + e * sz, x1: 10, x2: 10 + h * sz }), { stroke: "var(--bad)", strokeWidth: 1.5 }); });
      } else {
        edges.forEach(function (e) { css(S(s, "line", { x1: 10 + e * sz, x2: 10 + e * sz, y1: 10, y2: 10 + h * sz }), { stroke: "var(--good)", strokeWidth: 1.5 }); css(S(s, "line", { y1: 10 + e * sz, y2: 10 + e * sz, x1: 10, x2: 10 + h * sz }), { stroke: "var(--good)", strokeWidth: 1.5 }); });
        for (var a = 0; a < Hh; a++) for (var b = 0; b < Hh; b++) for (var u = 0; u < 2; u++) for (var v = 0; v < 2; v++) css(S(s, "circle", { cx: 10 + (edges[b] + (v + 0.5) * h / Hh / 2) * sz, cy: 10 + (edges[a] + (u + 0.5) * h / Hh / 2) * sz, r: 1.8 }), { fill: "var(--acc)" });
      }
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(s);
      el(host, "#o").innerHTML = "Sub-window ≈ h/H = " + h + "/" + Hh + " = <b>" + f(h / Hh, 3) + "</b> cells" + (h % Hh ? " — <b>not an integer</b>." : " (integer — no rounding needed).") + "<br>" +
        (m === "pool" ? "RoI Pooling <b>rounds</b> the bin boundaries to whole cells (red lines), so bins have unequal sizes " + sizes.join(", ") + " and are shifted from the true region; then max-pool inside each bin. With stride-16 features, one cell of misalignment = 16 image pixels — harmful for precise boxes and masks." :
          "RoI Align keeps the exact fractional bin edges (green) and samples a few points per bin by <b>bilinear interpolation</b> (dots), then pools them — no quantisation, so features stay aligned with the region (introduced in Mask R-CNN).");
    }
    on(host, "input,select", "input", run); run();
  };

  D.anchors = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Ground-truth box centre x = <span id="xl"></span><input type="range" id="x" min="20" max="80" value="56"></label><label>GT width<input type="number" id="w" value="40"></label><label>GT height<input type="number" id="hh" value="30"></label><label>Feature map (H × W)<input id="fm" value="40, 60"></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var gx = +el(host, "#x").value, gw = +el(host, "#w").value, gh = +el(host, "#hh").value, fm = nums(el(host, "#fm").value);
      el(host, "#xl").textContent = gx;
      var cx = 50, cy = 50, gt = [gx - gw / 2, cy - gh / 2, gx + gw / 2, cy + gh / 2], scales = [24, 40, 64], ratios = [0.5, 1, 2], A = [], rows = "";
      scales.forEach(function (sc) { ratios.forEach(function (r) { var w = sc * Math.sqrt(1 / r), h = sc * Math.sqrt(r); var b = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], v = iou(b, gt).v; A.push({ b: b, v: v, lab: v > 0.7 ? "positive" : v < 0.3 ? "negative" : "ignored", s: sc, r: r }); }); });
      var best = A.reduce(function (m, a) { return a.v > m.v ? a : m; }, A[0]); if (best.lab !== "positive") best.lab = "positive (highest IoU)";
      var vis = A.map(function (a) { return { b: a.b, color: a.lab.indexOf("positive") === 0 ? "var(--good)" : a.lab === "negative" ? "var(--bad)" : "var(--warn)", w: 1.5, dash: a.lab === "negative" ? "3 3" : "" }; });
      vis.push({ b: gt, color: "var(--ink)", w: 3, label: "GT" });
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(boxSvg(vis, 100, 100, 2.8));
      A.forEach(function (a) { rows += "<tr><td>" + a.s + "</td><td>" + (a.r === 0.5 ? "1:2" : a.r === 1 ? "1:1" : "2:1") + "</td><td>" + f(a.v, 3) + "</td><td>" + a.lab + "</td></tr>"; });
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th>Scale</th><th>Aspect</th><th>IoU with GT</th><th>RPN label</th></tr>' + rows + "</table>k = 3 scales × 3 aspect ratios = <b>9 anchors</b> per feature-map position" + (fm.length >= 2 ? " → " + fm[0] + " × " + fm[1] + " × 9 = <b>" + (fm[0] * fm[1] * 9).toLocaleString() + "</b> anchors per image" : "") +
        ".<br>Positive: IoU &gt; 0.7 (or the highest IoU with a GT box); negative: IoU &lt; 0.3; in between: <b>ignored</b> — forcing a label on an ambiguous anchor would inject noisy, contradictory supervision.<br><small>The RPN outputs k objectness scores and 4k box corrections per position, then keeps the top ~300 boxes as proposals.</small>";
    }
    on(host, "input", "input", run); run();
  };

  D.yolo = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Grid S<input type="number" id="S" value="7" min="2" max="13"></label><label>Boxes per cell B<input type="number" id="B" value="2" min="1" max="5"></label><label>Classes C<input type="number" id="C" value="20" min="1" max="100"></label><button class="btn ghost" id="add">Move objects</button></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    var objs = [[0.30, 0.42, 0.22, 0.30, "person"], [0.34, 0.48, 0.30, 0.18, "bicycle"], [0.75, 0.62, 0.35, 0.25, "car"]];
    function run() {
      var Sg = +el(host, "#S").value, B = +el(host, "#B").value, C = +el(host, "#C").value, sz = 280;
      var s = svgEl(sz + 20, sz + 20), i;
      css(S(s, "rect", { x: 10, y: 10, width: sz, height: sz }), { fill: "var(--card)", stroke: "var(--line)" });
      for (i = 1; i < Sg; i++) { css(S(s, "line", { x1: 10 + i * sz / Sg, x2: 10 + i * sz / Sg, y1: 10, y2: 10 + sz }), { stroke: "var(--line)" }); css(S(s, "line", { y1: 10 + i * sz / Sg, y2: 10 + i * sz / Sg, x1: 10, x2: 10 + sz }), { stroke: "var(--line)" }); }
      var cells = {};
      objs.forEach(function (o, k) {
        var ci = Math.min(Sg - 1, Math.floor(o[0] * Sg)), cj = Math.min(Sg - 1, Math.floor(o[1] * Sg)), key = ci + "," + cj;
        (cells[key] = cells[key] || []).push(o[4]);
        css(S(s, "rect", { x: 10 + ci * sz / Sg, y: 10 + cj * sz / Sg, width: sz / Sg, height: sz / Sg }), { fill: K.PALETTE[k], opacity: 0.25 });
        css(S(s, "rect", { x: 10 + (o[0] - o[2] / 2) * sz, y: 10 + (o[1] - o[3] / 2) * sz, width: o[2] * sz, height: o[3] * sz }), { fill: "none", stroke: K.PALETTE[k], strokeWidth: 2.5 });
        css(S(s, "circle", { cx: 10 + o[0] * sz, cy: 10 + o[1] * sz, r: 4 }), { fill: K.PALETTE[k] });
        css(S(s, "text", { x: 12 + (o[0] - o[2] / 2) * sz, y: 22 + (o[1] - o[3] / 2) * sz }, o[4]), { fill: K.PALETTE[k], fontWeight: 700 });
      });
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(s);
      var clash = Object.keys(cells).filter(function (k) { return cells[k].length > 1; });
      el(host, "#o").innerHTML = "Output tensor: S × S × (5B + C) = " + Sg + " × " + Sg + " × (5·" + B + " + " + C + ") = <b>" + Sg + " × " + Sg + " × " + (5 * B + C) + "</b> = " + (Sg * Sg * (5 * B + C)).toLocaleString() + " numbers (YOLOv1: 7 × 7 × 30).<br>Each box: x, y, w, h + confidence = Pr(object) × IoU<sup>truth</sup><sub>pred</sub>. Each <b>cell</b>: one set of C class probabilities Pr(class | object).<br>The cell containing an object's <b>centre</b> is responsible for it." +
        (clash.length ? '<br><span class="no">Conflict:</span> ' + clash.map(function (k) { return cells[k].join(" and "); }).join("; ") + " have centres in the same cell — YOLOv1 can give that cell only one class, so one object is lost. Anchor boxes (YOLOv2) let each cell predict several boxes, each with its own class." : '<br><span class="ok">No two centres share a cell</span> at this grid size.');
    }
    on(host, "input", "input", run);
    el(host, "#add").addEventListener("click", function () { objs.forEach(function (o) { o[0] = 0.15 + Math.random() * 0.7; o[1] = 0.15 + Math.random() * 0.7; }); run(); });
    run();
  };

  /* ===================================================================
     WEEK 9
     =================================================================== */
  D.upsample = function (host) {
    host.innerHTML = '<div class="demo-row"><span class="seg" id="m"><button data-m="max" class="on">Max unpooling</button><button data-m="nn">Nearest-neighbour unpooling</button><button data-m="tc">Transposed conv (k = 2, s = 2)</button><button data-m="t1">1-D transposed conv</button></span></div><div class="out" id="o"></div><div class="demo-row"><label>Transposed-conv size calculator: input H<input type="number" id="H" value="5"></label><label>kernel K<input type="number" id="K" value="2"></label><label>stride S<input type="number" id="S" value="2"></label><label>padding P<input type="number" id="P" value="0"></label><label>output padding<input type="number" id="op" value="0"></label></div><div class="out" id="o2"></div>';
    var mode = "max";
    var src = [[1, 3, 2, 1], [4, 6, 5, 7], [3, 2, 1, 0], [1, 2, 3, 4]];
    function run() {
      var h = "";
      if (mode === "max" || mode === "nn") {
        var pooled = [[0, 0], [0, 0]], idx = [[0, 0], [0, 0]], i, j, a, b;
        for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) { var best = -1e9; for (a = 0; a < 2; a++) for (b = 0; b < 2; b++) if (src[2 * i + a][2 * j + b] > best) { best = src[2 * i + a][2 * j + b]; idx[i][j] = [a, b]; } pooled[i][j] = best; }
        var up = []; for (i = 0; i < 4; i++) { up.push([]); for (j = 0; j < 4; j++) { var pi = Math.floor(i / 2), pj = Math.floor(j / 2); up[i].push(mode === "nn" ? pooled[pi][pj] : (idx[pi][pj][0] === i % 2 && idx[pi][pj][1] === j % 2 ? pooled[pi][pj] : 0)); } }
        h = '<div class="three-col"><div><b>Encoder map</b>' + gridHTML(src, { heat: 7 }) + "</div><div><b>After 2×2 max-pool</b>" + gridHTML(pooled, { heat: 7 }) + "</div><div><b>Upsampled</b>" + gridHTML(up, { heat: 7 }) + "</div></div>" +
          (mode === "max" ? "Max unpooling puts each value back at the <b>recorded location of the maximum</b> (the pooling indices / switches) and fills the rest with 0 — the map is sparse and is then densified by trainable convolutions (SegNet). It preserves where the strongest activations were." :
            "Nearest-neighbour unpooling copies each value into its whole 2 × 2 block — simple, no dependence on the forward pass, but it <b>discards which neuron actually fired</b>.");
      } else if (mode === "tc") {
        var x = [[1, 2], [3, 4]], k = [[1, 0.5], [0.5, 0.25]], out = [];
        for (var r = 0; r < 4; r++) { out.push([]); for (var c = 0; c < 4; c++) out[r].push(x[Math.floor(r / 2)][Math.floor(c / 2)] * k[r % 2][c % 2]); }
        h = '<div class="three-col"><div><b>Input 2×2</b>' + gridHTML(x, { heat: 4 }) + "</div><div><b>Learned kernel 2×2</b>" + gridHTML(k, { heat: 1 }) + "</div><div><b>Output 4×4</b>" + gridHTML(out, { heat: 4 }) + "</div></div>Each input value <b>stamps</b> a scaled copy of the kernel onto the output; with stride 2 the copies tile without overlap, so the size doubles. The kernel weights are <b>learned</b> (unlike unpooling). With overlap (K &gt; S) contributions add up.";
      } else {
        h = "1-D convolution as a matrix (kernel k = [k₁, k₂, k₃], input x₁…x₄):<br>y₁ = k₁x₁ + k₂x₂ + k₃x₃, y₂ = k₁x₂ + k₂x₃ + k₃x₄ → <b>y = Wx</b> with W = [[k₁, k₂, k₃, 0], [0, k₁, k₂, k₃]] (2 × 4).<br>Transposed convolution multiplies by <b>Wᵀ</b> (4 × 2): z₁ = k₁y₁, z₂ = k₂y₁ + k₁y₂, z₃ = k₃y₁ + k₂y₂, z₄ = k₃y₂ — mapping 2 values back to 4 positions (the shape of the input, not its values). That is why it is also called \"deconvolution\" (a misnomer: it is not the inverse).";
      }
      el(host, "#o").innerHTML = h;
      var H = +el(host, "#H").value, Kk = +el(host, "#K").value, Sx = +el(host, "#S").value, Pp = +el(host, "#P").value, op = +el(host, "#op").value;
      el(host, "#o2").innerHTML = "Transposed-conv output = (H − 1)·S − 2P + K + output_padding = (" + H + " − 1)·" + Sx + " − " + 2 * Pp + " + " + Kk + " + " + op + " = <b>" + ((H - 1) * Sx - 2 * Pp + Kk + op) + "</b><br><small>Assignment: 5 × 5, K = 2, S = 2, P = 0 → 10 × 10. Compare ordinary conv: ⌊(H + 2P − K)/S⌋ + 1.</small>";
    }
    on(host, "input", "input", run);
    on(host, "#m button", "click", function () { host.querySelectorAll("#m button").forEach(function (b) { b.classList.remove("on"); }); this.classList.add("on"); mode = this.getAttribute("data-m"); run(); });
    run();
  };

  D.miou = function (host) {
    var PRE = { asg: "50 10 5 0\n8 40 2 0\n4 6 45 5\n0 2 8 35", two: "8 2\n1 9", imb: "900 20 0\n30 20 0\n5 0 25" };
    host.innerHTML = '<div class="demo-row"><span class="seg" id="pre"><button data-k="asg" class="on">Week 9 assignment matrix</button><button data-k="two">Small 2-class</button><button data-k="imb">Imbalanced (background-heavy)</button></span></div><div class="demo-row"><label class="grow">Confusion matrix — rows = ground truth, columns = predicted<textarea id="m" rows="4"></textarea></label></div><div class="out" id="o" style="overflow-x:auto"></div>';
    function run() {
      var M = el(host, "#m").value.split("\n").map(nums).filter(function (r) { return r.length; }), n = M.length;
      if (M.some(function (r) { return r.length !== n; })) { el(host, "#o").textContent = "The matrix must be square."; return; }
      var tot = 0, tp = 0, rows = "", sum = 0, dsum = 0;
      M.forEach(function (r) { r.forEach(function (v) { tot += v; }); });
      for (var c = 0; c < n; c++) {
        var T = M[c][c], R = M[c].reduce(function (a, b) { return a + b; }, 0), Cc = M.reduce(function (a, r) { return a + r[c]; }, 0);
        var FN = R - T, FP = Cc - T, I = T / (T + FP + FN), Dc = 2 * T / (2 * T + FP + FN);
        tp += T; sum += I; dsum += Dc;
        rows += "<tr><td>C" + (c + 1) + "</td><td>" + T + "</td><td>" + FP + "</td><td>" + FN + "</td><td>" + T + "/(" + T + " + " + FP + " + " + FN + ") = <b>" + f(I, 4) + "</b></td><td>" + f(Dc, 4) + "</td></tr>";
      }
      var asg = el(host, "#m").value.replace(/\s+/g, " ").trim() === PRE.asg.replace(/\s+/g, " ");
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th>Class</th><th>TP (diagonal)</th><th>FP (column − TP)</th><th>FN (row − TP)</th><th>IoU = TP/(TP + FP + FN)</th><th>Dice</th></tr>' + rows + "</table>" +
        "<b>mIoU = " + f(sum / n, 4) + "</b> (mean of per-class IoU) · Pixel accuracy = " + tp + "/" + tot + " = " + f(tp / tot, 4) + " · mean Dice = " + f(dsum / n, 4) +
        (asg ? '<br><span class="no">Assignment note:</span> the official key says 0.712, but this matrix gives mIoU = 0.634 (not one of the options). Learn the method; if the identical question appears, the key expects 0.712.' : "") +
        "<br><small>Pixel accuracy is dominated by large classes (try the imbalanced preset); mIoU weighs every class equally.</small>";
    }
    on(host, "textarea", "input", function () { host.querySelectorAll("#pre button").forEach(function (b) { b.classList.remove("on"); }); run(); });
    on(host, "#pre button", "click", function () { host.querySelectorAll("#pre button").forEach(function (b) { b.classList.remove("on"); }); this.classList.add("on"); el(host, "#m").value = PRE[this.getAttribute("data-k")]; run(); });
    el(host, "#m").value = PRE.asg; run();
  };

  D.dilation = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Kernel k<select id="k"><option>3</option><option>5</option></select></label><label>Atrous rate r = <span id="rl"></span><input type="range" id="r" min="1" max="6" value="2"></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var k = +el(host, "#k").value, r = +el(host, "#r").value, ke = k + (k - 1) * (r - 1), N = 19, c = 9, sz = 14;
      el(host, "#rl").textContent = r;
      var s = svgEl(N * sz + 2, N * sz + 2);
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
        var di = i - c, dj = j - c, half = (k - 1) / 2;
        var tap = di % r === 0 && dj % r === 0 && Math.abs(di / r) <= half && Math.abs(dj / r) <= half;
        var inRF = Math.abs(di) <= (ke - 1) / 2 && Math.abs(dj) <= (ke - 1) / 2;
        css(S(s, "rect", { x: 1 + j * sz, y: 1 + i * sz, width: sz - 1, height: sz - 1 }), { fill: tap ? "var(--acc)" : inRF ? "var(--acc-soft)" : "var(--card)", stroke: "var(--line)" });
      }
      el(host, "#pl").innerHTML = ""; el(host, "#pl").appendChild(s);
      el(host, "#o").innerHTML = "Atrous (dilated) convolution: y[i] = Σ<sub>k</sub> x[i + r·k] w[k] — the filter samples the input every r pixels (\"holes\" between weights).<br>Effective kernel size = k + (k − 1)(r − 1) = <b>" + ke + " × " + ke + "</b> using only <b>" + k * k + "</b> weights.<br><br>Larger field of view <b>without extra parameters, computation or downsampling</b> — dense feature maps from ImageNet backbones. DeepLabv3's <b>ASPP</b> runs parallel branches (1×1 conv, 3×3 at rates 6, 12, 18, image-level pooling), concatenates them and mixes with a 1×1 conv: multi-scale context at full feature resolution.";
    }
    on(host, "select,input", "input", run); run();
  };

  D.rfover = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Kernel k<input type="number" id="k" value="3"></label><label>Blocks<input type="number" id="n" value="5" min="2" max="8"></label></div><div class="out" id="o" style="overflow-x:auto"></div>';
    function run() {
      var k = +el(host, "#k").value, n = Math.max(2, Math.min(8, +el(host, "#n").value)), rows = "";
      for (var i = 1; i <= n; i++) { var u = Math.pow(2, 2 * (i - 1)) * k * k, o = Math.pow(0.5, 2 * (i - 1)) * k * k; rows += "<tr><td>" + i + "</td><td>" + Math.pow(2, i - 1) + "k × " + Math.pow(2, i - 1) + "k = " + u + "</td><td>" + (i === 1 ? "k × k" : "(1/" + Math.pow(2, i - 1) + ")k × (1/" + Math.pow(2, i - 1) + ")k") + " = " + f(o, 4) + "</td><td>" + f(u * o, 2) + "</td></tr>"; }
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th>Conv block i</th><th>Undercomplete (pooling ×2): 2<sup>2(i−1)</sup>·k·k</th><th>Overcomplete (upsampling ×2): (½)<sup>2(i−1)</sup>·k·k</th><th>Product</th></tr>' + rows + "</table>" +
        "The two are <b>reciprocals</b> (product = k⁴ … i.e. the scale factors cancel): pooling makes deep layers see ever larger regions (global semantics, large objects); upsampling keeps deep layers' receptive fields small (fine edges, small objects). KiU-Net and DeepMAO combine both branches.";
    }
    on(host, "input", "input", run); run();
  };

  D.spp = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Pyramid levels (n × n bins each)<input id="lv" value="1, 2, 4"></label><label>Channels<input type="number" id="c" value="256"></label><label>Input map size<input type="number" id="h" value="13"></label></div><div class="demo-row"><span class="seg" id="pre"><button data-p="1, 2, 4">SPP-net (assignment)</button><button data-p="1, 2, 3, 6">PSPNet</button></span></div><div class="out" id="o"></div>';
    function run() {
      var lv = nums(el(host, "#lv").value), C = +el(host, "#c").value, H = +el(host, "#h").value, bins = lv.reduce(function (a, n) { return a + n * n; }, 0);
      el(host, "#o").innerHTML = "Bins = " + lv.map(function (n) { return n + "²"; }).join(" + ") + " = " + lv.map(function (n) { return n * n; }).join(" + ") + " = <b>" + bins + "</b> per channel → output length " + bins + " × " + C + " = <b>" + (bins * C).toLocaleString() + "</b> values, the same for any input size (" + H + " × " + H + " or otherwise).<br>" +
        "Trap: (" + lv.join(" + ") + ") × " + C + " = " + (lv.reduce(function (a, b) { return a + b; }, 0) * C).toLocaleString() + " counts sides, not bins.<br><small>SPP-net: fixed-length vector for FC layers from any image size. PSPNet: pooled maps at 4 levels (global 1 × 1 up to 6 × 6) are upsampled bilinearly and concatenated with the original features for scene context.</small>";
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { el(host, "#lv").value = this.getAttribute("data-p"); run(); });
    run();
  };

  /* ===================================================================
     WEEK 10
     =================================================================== */
  function softmaxT(z, T) { var m = Math.max.apply(null, z), e = z.map(function (v) { return Math.exp((v - m) / T); }), s = e.reduce(function (a, b) { return a + b; }, 0); return e.map(function (v) { return v / s; }); }
  function KL(p, q) { var s = 0; for (var i = 0; i < p.length; i++) if (p[i] > 0) s += p[i] * Math.log(p[i] / Math.max(q[i], 1e-300)); return s; }
  window.AID.softmaxT = softmaxT; window.AID.KL = KL;
  function bars(labels, series, opt) {
    opt = opt || {};
    var W = opt.w || 420, H = opt.h || 200, n = labels.length, gw = (W - 40) / n, s = svgEl(W, H + 24);
    css(S(s, "line", { x1: 30, x2: W - 5, y1: H, y2: H }), { stroke: "var(--ink-3)" });
    labels.forEach(function (l, i) {
      series.forEach(function (se, k) {
        var bw = gw * 0.8 / series.length, x = 34 + i * gw + k * bw, h = Math.max(0, Math.min(1, se.v[i])) * (H - 20);
        css(S(s, "rect", { x: x, y: H - h, width: bw - 2, height: h, rx: 2 }), { fill: se.color || K.PALETTE[k] });
        S(s, "text", { x: x + bw / 2 - 1, y: H - h - 3, "text-anchor": "middle" }, f(se.v[i], 2));
      });
      S(s, "text", { x: 34 + i * gw + gw * 0.4, y: H + 16, "text-anchor": "middle" }, l);
    });
    return s;
  }
  D.kdtemp = function (host) {
    var CL = ["cat", "dog", "tiger", "car", "truck"];
    host.innerHTML = '<div class="demo-row"><label class="grow">Teacher logits (cat, dog, tiger, car, truck)<input class="wide" id="t" value="6, 3.5, 2.5, -1, -1.5"></label><label class="grow">Student logits<input class="wide" id="s" value="5, 0.5, 0.2, 0.5, 0"></label></div><div class="demo-row"><label>Temperature T = <span id="tl"></span><input type="range" id="T" min="1" max="10" step="0.5" value="1"></label><span class="seg" id="pre"><button data-p="2, 1, 0.1|1, 1, 1">Lecture softmax example [2, 1, 0.1]</button><button data-p="6, 3.5, 2.5, -1, -1.5|5, 0.5, 0.2, 0.5, 0">Cat image</button></span></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var zt = nums(el(host, "#t").value), zs = nums(el(host, "#s").value), T = +el(host, "#T").value;
      el(host, "#tl").textContent = f(T, 1);
      var n = Math.min(zt.length, zs.length); zt = zt.slice(0, n); zs = zs.slice(0, n);
      var labels = n === 5 ? CL : zt.map(function (_, i) { return "class " + (i + 1); });
      var pt = softmaxT(zt, T), ps = softmaxT(zs, T), pt1 = softmaxT(zt, 1);
      var H = -pt.reduce(function (a, p) { return a + (p > 0 ? p * Math.log(p) : 0); }, 0);
      el(host, "#pl").innerHTML = legend([{ name: "teacher P_T (at T)", color: K.PALETTE[0] }, { name: "student P_S (at T)", color: K.PALETTE[1] }]);
      el(host, "#pl").appendChild(bars(labels, [{ v: pt }, { v: ps }]));
      el(host, "#o").innerHTML = "Softmax with temperature: p<sub>i</sub> = exp(z<sub>i</sub>/T) / Σ<sub>j</sub> exp(z<sub>j</sub>/T)<br>Teacher at T = 1: [" + pt1.map(function (p) { return f(p, 3); }).join(", ") + "]<br>Teacher at T = " + f(T, 1) + ": [" + pt.map(function (p) { return f(p, 3); }).join(", ") + "] · entropy " + f(H, 3) + " nats<br><br>" +
        "KL(P<sub>T</sub> ‖ P<sub>S</sub>) = <b>" + f(KL(pt, ps), 4) + "</b> · KL(P<sub>S</sub> ‖ P<sub>T</sub>) = " + f(KL(ps, pt), 4) + " (not symmetric)<br>" +
        (T >= 3 ? "Higher T <b>softens</b> the teacher: the relative probabilities of the wrong classes (dog and tiger are cat-like, vehicles are not) become visible — the \"dark knowledge\" a one-hot label throws away." : "At T = 1 the teacher is nearly one-hot; raise T to reveal the similarity structure.") +
        "<br><small>Distillation loss (Hinton): α·CE(y, P<sub>S</sub>(T=1)) + (1 − α)·T²·KL(P<sub>T</sub><sup>(T)</sup> ‖ P<sub>S</sub><sup>(T)</sup>); the T² keeps gradient sizes comparable. Teacher first = mass-covering: the student is heavily penalised wherever it puts ~0 on a class the teacher finds plausible.</small>";
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { var p = this.getAttribute("data-p").split("|"); el(host, "#t").value = p[0]; el(host, "#s").value = p[1]; run(); });
    run();
  };

  D.infonce = function (host) {
    host.innerHTML = '<div class="demo-row"><label>sim(anchor, positive) = <span id="pl2"></span><input type="range" id="p" min="-1" max="1" step="0.05" value="0.8"></label><label>Mean sim to negatives = <span id="nl"></span><input type="range" id="n" min="-1" max="1" step="0.05" value="0.1"></label><label>Number of negatives K − 1<select id="k"><option>1</option><option>7</option><option selected>63</option><option>1023</option><option>65535</option></select></label><label>Temperature τ = <span id="tl"></span><input type="range" id="t" min="0.05" max="1" step="0.05" value="0.1"></label><label>Hard negative (one negative with sim) <input type="range" id="h" min="-1" max="1" step="0.05" value="0.1"></label></div><div class="out" id="o"></div>';
    function run() {
      var sp = +el(host, "#p").value, sn = +el(host, "#n").value, K1 = +el(host, "#k").value, t = +el(host, "#t").value, hn = +el(host, "#h").value;
      el(host, "#pl2").textContent = f(sp, 2); el(host, "#nl").textContent = f(sn, 2); el(host, "#tl").textContent = f(t, 2);
      var ep = Math.exp(sp / t), en = (K1 - 1) * Math.exp(sn / t) + Math.exp(hn / t), prob = ep / (ep + en), L = -Math.log(prob);
      el(host, "#o").innerHTML = "InfoNCE: ℒ = −log [ exp(sim(z, z<sup>+</sup>)/τ) / Σ<sub>i</sub> exp(sim(z, z<sub>i</sub>)/τ) ] — a softmax classification of the positive among " + (K1 + 1) + " candidates.<br>" +
        "Probability assigned to the positive: <b>" + f(prob, 4) + "</b> → loss <b>" + f(L, 4) + "</b> (minimum 0; chance level log " + (K1 + 1) + " = " + f(Math.log(K1 + 1), 3) + ")<br><br>" +
        "Smaller τ sharpens the softmax and concentrates the gradient on the <b>hardest</b> negatives (move the hard-negative slider). More negatives make the task harder and the representation better — why SimCLR needs huge batches and MoCo keeps a <b>queue</b> of negatives with a momentum encoder." +
        "<br><small>CPC uses this to pick the true future latent among distractors instead of reconstructing raw, high-entropy future pixels.</small>";
    }
    on(host, "input,select", "input", run); run();
  };

  D.cen = function (host) {
    var gA = [0.92, 0.05, 0.61, 0.33, 0.02, 0.77], gB = [0.10, 0.85, 0.04, 0.58, 0.69, 0.03];
    host.innerHTML = '<div class="demo-row"><label>Threshold on |γ| = <span id="tl"></span><input type="range" id="t" min="0" max="0.6" step="0.01" value="0.08"></label><label>Mode<select id="m"><option value="cen">Channel exchange (RGB ↔ IR)</option><option value="prune">Pruning (RGB network alone)</option></select></label></div><div class="out" id="o"></div>';
    function run() {
      var t = +el(host, "#t").value, m = el(host, "#m").value; el(host, "#tl").textContent = f(t, 2);
      function row(name, g, other, oname) {
        return "<tr><th>" + name + "</th>" + g.map(function (v, i) { var low = Math.abs(v) < t; return '<td style="background:' + (low ? (m === "cen" ? "var(--warn-soft)" : "var(--bad-soft)") : "var(--card)") + '">ch' + i + "<br>γ = " + v + (low ? (m === "cen" ? "<br><b>← " + oname + " ch" + i + "</b>" : "<br><b>pruned</b>") : "") + "</td>"; }).join("") + "</tr>";
      }
      var nLow = gA.filter(function (v) { return Math.abs(v) < t; }).length;
      el(host, "#o").innerHTML = '<table class="num compact">' + row("RGB branch", gA, gB, "IR") + (m === "cen" ? row("IR branch", gB, gA, "RGB") : "") + "</table>" +
        (m === "cen" ? "<b>Channel Exchange Network</b>: the two modality branches <b>share convolution weights but keep separate BatchNorm layers</b>. A channel whose BN scaling factor γ is below the threshold contributes little, so it is <b>replaced by the other modality's channel at the same position</b> — cross-modal fusion without extra parameters." :
          "<b>Network slimming</b>: train with an L1 penalty on BN γ, then remove channels with the smallest |γ| (here " + nLow + " of 6) and fine-tune. \"Smallest γ → least impact\" is only a <b>heuristic</b>: prune too many and the network loses capacity the remaining channels relied on, so accuracy eventually drops.");
    }
    on(host, "input,select", "input", run); run();
  };

  /* ===================================================================
     WEEK 11 — Reinforcement learning and GANs
     =================================================================== */
  D.discount = function (host) {
    host.innerHTML = '<div class="demo-row"><label class="grow">Rewards R<sub>t+1</sub>, R<sub>t+2</sub>, …<input class="wide" id="r" value="-1, -1, -1, -1, -1, -1, 10"></label><label>Discount γ = <span id="gl"></span><input type="range" id="g" min="0" max="1" step="0.01" value="0.9"></label></div>' +
      '<div class="demo-row"><span class="seg" id="pre"><button data-p="-1, -1, -1, -1, -1, -1, 10|0.9">Drone: 6 steps then goal</button><button data-p="1, 0, 0, 0, 100|0.1">Myopic γ = 0.1</button><button data-p="1, 0, 0, 0, 100|0.99">Far-sighted γ = 0.99</button><button data-p="5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5|0.5">Constant reward 5</button></span></div><div class="two-col"><div class="out" id="o"></div><div id="pl"></div></div>';
    function run() {
      var r = nums(el(host, "#r").value), g = +el(host, "#g").value; el(host, "#gl").textContent = f(g, 2);
      var G = 0, rows = "", w = [];
      r.forEach(function (x, k) { var gk = Math.pow(g, k); w.push(gk); G += gk * x; rows += "<tr><td>" + k + "</td><td>" + x + "</td><td>" + f(gk, 4) + "</td><td>" + f(gk * x, 4) + "</td></tr>"; });
      el(host, "#o").innerHTML = '<table class="num compact"><tr><th>k</th><th>R<sub>t+k+1</sub></th><th>γ<sup>k</sup></th><th>γ<sup>k</sup>·R</th></tr>' + rows + '<tr class="total"><td colspan="3">G<sub>t</sub> = Σ γ<sup>k</sup> R<sub>t+k+1</sub></td><td>' + f(G, 4) + "</td></tr></table>" +
        (g < 1 ? "Effective horizon ≈ 1/(1 − γ) = <b>" + f(1 / (1 - g), 1) + "</b> steps. For a constant reward c forever, G = c/(1 − γ)." : "γ = 1: no discounting; the return can diverge on non-terminating tasks.") +
        "<br><small>γ → 0 is <b>myopic</b> (only the immediate reward counts); γ → 1 is <b>far-sighted</b>. Discounting reflects an uncertain future and keeps infinite sums finite.</small>";
      var pl = el(host, "#pl"); pl.innerHTML = legend([{ name: "weight γ^k on the reward k steps ahead", color: K.PALETTE[0] }]);
      pl.appendChild(bars(w.map(function (_, k) { return String(k); }), [{ v: w }], { w: 320, h: 150 }));
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () { var p = this.getAttribute("data-p").split("|"); el(host, "#r").value = p[0]; el(host, "#g").value = p[1]; run(); });
    run();
  };

  D.qupdate = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Q(s, a)<input type="number" id="q" value="2" step="0.1"></label><label>Reward r<input type="number" id="r" value="1" step="0.1"></label><label>α<input type="number" id="a" value="0.5" step="0.05" min="0" max="1"></label><label>γ<input type="number" id="g" value="0.9" step="0.05" min="0" max="1"></label><label class="grow">Q(s′, ·) for each action<input class="wide" id="n" value="5, 3, 4"></label><label>Next action a′ actually taken (SARSA)<input type="number" id="ap" value="2" min="1"></label></div>' +
      '<div class="demo-row"><label>ε (ε-greedy)<input type="number" id="e" value="0.2" step="0.05" min="0" max="1"></label><label>Number of actions |A|<input type="number" id="na" value="4" min="1"></label><span class="seg" id="pre"><button data-p="2,1,0.5,0.9,5, 3, 4,2,0.2,4">Assignment Q9 and Q10</button><button data-p="0,-1,0.1,0.9,0, 0, 0, 0,1,0.1,4">First step on the grid</button><button data-p="6,10,0.5,0.9,0, 0, 0, 0,1,0.1,4">Reaching the goal (terminal: use Q(s′,·) = 0)</button></span></div><div class="out" id="o"></div>';
    function run() {
      var q = +el(host, "#q").value, r = +el(host, "#r").value, a = +el(host, "#a").value, g = +el(host, "#g").value, n = nums(el(host, "#n").value);
      var ap = Math.max(1, Math.min(n.length, Math.round(+el(host, "#ap").value || 1))), e = +el(host, "#e").value, na = Math.max(1, Math.round(+el(host, "#na").value || 1));
      if (!n.length) { el(host, "#o").textContent = "Enter the next-state Q-values."; return; }
      var mx = Math.max.apply(null, n), tq = r + g * mx, ts = r + g * n[ap - 1];
      el(host, "#o").innerHTML = "<b>Q-learning (off-policy)</b>: TD target = r + γ·max<sub>a′</sub> Q(s′, a′) = " + f(r, 2) + " + " + f(g, 2) + " × " + f(mx, 2) + " = <b>" + f(tq, 3) + "</b><br>" +
        "TD error = target − Q(s, a) = " + f(tq, 3) + " − " + f(q, 2) + " = " + f(tq - q, 3) + "<br>" +
        "Q(s, a) ← " + f(q, 2) + " + " + f(a, 2) + " × " + f(tq - q, 3) + " = <b>" + f(q + a * (tq - q), 3) + "</b><br><br>" +
        "<b>SARSA (on-policy)</b>, using the action actually taken next (a′ = action " + ap + ", Q = " + f(n[ap - 1], 2) + "): target = " + f(ts, 3) + " → Q(s, a) ← <b>" + f(q + a * (ts - q), 3) + "</b>" +
        (Math.abs(ts - tq) < 1e-12 ? " (same as Q-learning, because a′ is the greedy action)" : " (lower than Q-learning when a′ is not the greedy action: SARSA values its real, exploring behaviour)") + "<br><br>" +
        "<b>ε-greedy</b> with ε = " + f(e, 2) + " and " + na + " actions: P(greedy action) = (1 − ε) + ε/|A| = " + f(1 - e, 2) + " + " + f(e / na, 3) + " = <b>" + f(1 - e + e / na, 3) + "</b>; P(each other action) = ε/|A| = " + f(e / na, 3) + ".<br><small>A common trap is answering 1 − ε: random exploration can also pick the greedy action.</small>";
    }
    on(host, "input", "input", run);
    on(host, "#pre button", "click", function () {
      var p = this.getAttribute("data-p").split(","), cnt = p.length - 7;
      el(host, "#q").value = p[0]; el(host, "#r").value = p[1]; el(host, "#a").value = p[2]; el(host, "#g").value = p[3];
      el(host, "#n").value = p.slice(4, 4 + cnt).map(function (s) { return s.trim(); }).join(", ");
      el(host, "#ap").value = p[4 + cnt]; el(host, "#e").value = p[5 + cnt]; el(host, "#na").value = p[6 + cnt]; run();
    });
    run();
  };

  D.gridq = function (host) {
    var Wd = 5, Ht = 4, MV = [[0, -1], [1, 0], [0, 1], [-1, 0]], AR = ["↑", "→", "↓", "←"], CS = 64;
    var LAY = { obst: { start: [0, 3], goal: [4, 0], bad: [[1, 1], [2, 1], [3, 2]] }, cliff: { start: [0, 3], goal: [4, 3], bad: [[1, 3], [2, 3], [3, 3]] } };
    host.innerHTML = '<div class="demo-row"><label>World<select id="lay"><option value="obst">Grid with obstacles</option><option value="cliff">Cliff edge</option></select></label><label>Algorithm<select id="alg"><option value="q">Q-learning (off-policy)</option><option value="s">SARSA (on-policy)</option></select></label><label>α<input type="number" id="al" value="0.5" step="0.05" min="0.01" max="1"></label><label>γ<input type="number" id="ga" value="0.9" step="0.05" min="0" max="1"></label><label>ε<input type="number" id="ep" value="0.1" step="0.05" min="0" max="1"></label></div>' +
      '<div class="demo-row"><button class="btn" id="b1">Fly 1 episode</button><button class="btn" id="b50">Train 50 episodes</button><button class="btn" id="b300">Train 300 episodes</button><button class="btn" id="rs">Reset Q-table</button></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    var Q, R, ep, falls, last, L;
    function reset() { L = LAY[el(host, "#lay").value]; Q = []; for (var i = 0; i < Wd * Ht; i++) Q.push([0, 0, 0, 0]); R = rng(7); ep = 0; falls = 0; last = null; draw(); }
    function isBad(x, y) { return L.bad.some(function (b) { return b[0] === x && b[1] === y; }); }
    function argmax(q, rand) { var m = Math.max.apply(null, q), c = []; q.forEach(function (v, i) { if (v === m) c.push(i); }); return rand ? c[Math.floor(R() * c.length)] : c[0]; }
    function step(x, y, a) {
      var nx = x + MV[a][0], ny = y + MV[a][1]; if (nx < 0 || ny < 0 || nx >= Wd || ny >= Ht) { nx = x; ny = y; }
      if (nx === L.goal[0] && ny === L.goal[1]) return { x: nx, y: ny, r: 10, done: true };
      if (isBad(nx, ny)) return { x: nx, y: ny, r: -10, done: true };
      return { x: nx, y: ny, r: -1, done: false };
    }
    function episode() {
      var al = +el(host, "#al").value, ga = +el(host, "#ga").value, eps = +el(host, "#ep").value, alg = el(host, "#alg").value;
      function choose(s) { return R() < eps ? Math.floor(R() * 4) : argmax(Q[s], true); }
      var x = L.start[0], y = L.start[1], s = y * Wd + x, a = choose(s), path = [[x, y]], ret = 0, end = "timeout";
      for (var t = 0; t < 60; t++) {
        var o = step(x, y, a), s2 = o.y * Wd + o.x; ret += o.r; path.push([o.x, o.y]);
        if (o.done) { Q[s][a] += al * (o.r - Q[s][a]); end = o.r > 0 ? "goal" : "crash"; if (o.r < 0) falls++; break; }
        var a2 = choose(s2), tgt = alg === "q" ? o.r + ga * Math.max.apply(null, Q[s2]) : o.r + ga * Q[s2][a2];
        Q[s][a] += al * (tgt - Q[s][a]); x = o.x; y = o.y; s = s2; a = a2;
      }
      ep++; last = { path: path, ret: ret, end: end };
    }
    function cx(c) { return 4 + c[0] * CS + CS / 2; } function cy(c) { return 4 + c[1] * CS + CS / 2; }
    function poly(s, pts, color, dash, wd) { var p = S(s, "polyline", { points: pts.map(function (c) { return cx(c) + "," + cy(c); }).join(" ") }); css(p, { fill: "none", stroke: color, strokeWidth: wd, strokeOpacity: 0.7, strokeDasharray: dash || "", strokeLinejoin: "round" }); }
    function draw() {
      var s = svgEl(Wd * CS + 8, Ht * CS + 8), vals = [];
      for (var i = 0; i < Wd * Ht; i++) vals.push(Math.max.apply(null, Q[i]));
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
      for (var y = 0; y < Ht; y++) for (var x = 0; x < Wd; x++) {
        var k = y * Wd + x, g = x === L.goal[0] && y === L.goal[1], b = isBad(x, y), st = x === L.start[0] && y === L.start[1];
        css(S(s, "rect", { x: 4 + x * CS, y: 4 + y * CS, width: CS - 2, height: CS - 2, rx: 6 }), { fill: g ? "var(--good-soft)" : b ? "var(--bad-soft)" : "var(--card)", stroke: "var(--line)" });
        if (!g && !b && hi > lo) css(S(s, "rect", { x: 4 + x * CS, y: 4 + y * CS, width: CS - 2, height: CS - 2, rx: 6 }), { fill: "var(--acc)", fillOpacity: (0.35 * (vals[k] - lo) / (hi - lo)).toFixed(3) });
        if (g) S(s, "text", { x: 4 + x * CS + CS / 2, y: 4 + y * CS + CS / 2 + 4, "text-anchor": "middle" }, "GOAL +10");
        else if (b) S(s, "text", { x: 4 + x * CS + CS / 2, y: 4 + y * CS + CS / 2 + 4, "text-anchor": "middle" }, L === LAY.cliff ? "cliff −10" : "✕ −10");
        else {
          var nz = Q[k].some(function (v) { return v !== 0; });
          var t = S(s, "text", { x: 4 + x * CS + CS / 2, y: 4 + y * CS + 26, "text-anchor": "middle" }, nz ? AR[argmax(Q[k], false)] : "·"); css(t, { fontSize: "20px" });
          S(s, "text", { x: 4 + x * CS + CS / 2, y: 4 + y * CS + 50, "text-anchor": "middle" }, (st ? "S " : "") + f(vals[k], 1));
        }
      }
      if (last) poly(s, last.path, "var(--warn)", "5 4", 2.5);
      var gx = L.start[0], gy = L.start[1], gp = [[gx, gy]], reach = false;
      for (var n = 0; n < 20; n++) { var o = step(gx, gy, argmax(Q[gy * Wd + gx], false)); gp.push([o.x, o.y]); if (o.x === gx && o.y === gy) break; gx = o.x; gy = o.y; if (o.done) { reach = o.r > 0; break; } }
      if (ep) poly(s, gp, "var(--good)", "", 3.5);
      var pl = el(host, "#pl"); pl.innerHTML = legend([{ name: "greedy policy path", color: "var(--good)" }, { name: "last training episode (ε-greedy)", color: "var(--warn)" }]); pl.appendChild(s);
      var alg = el(host, "#alg").value;
      el(host, "#o").innerHTML = "Episodes trained: <b>" + ep + "</b> · crashes during training: <b>" + falls + "</b><br>" +
        (last ? "Last episode: " + (last.path.length - 1) + " moves, sum of rewards " + last.ret + " (" + (last.end === "goal" ? "reached the goal" : last.end === "crash" ? "crashed" : "ran out of time") + ")<br>" : "") +
        (ep ? "Greedy policy " + (reach ? "<b>reaches the goal in " + (gp.length - 1) + " moves</b>" : "does not reach the goal yet: keep training") + ".<br>" : "") +
        "<br>Each cell shows max<sub>a</sub> Q(s, a) and the greedy arrow. Rewards: +10 goal, −1 per move, −10 obstacle (episode ends). Each move updates one Q-entry: Q(s,a) ← Q(s,a) + α[target − Q(s,a)], with target r + γ·" + (alg === "q" ? "max<sub>a′</sub> Q(s′,a′) (Q-learning)" : "Q(s′,a′) for the action actually taken (SARSA)") + ". Value propagates back from the goal over many episodes." +
        (L === LAY.cliff ? "<br><br><b>Cliff experiment</b>: train 300 episodes with each algorithm (Reset between). Q-learning learns the <b>shortest path along the cliff edge</b> and crashes more often while exploring; SARSA accounts for its own ε-random slips and learns the <b>safer path one row away</b>." : "");
    }
    on(host, "#b1", "click", function () { episode(); draw(); });
    on(host, "#b50", "click", function () { for (var i = 0; i < 50; i++) episode(); draw(); });
    on(host, "#b300", "click", function () { for (var i = 0; i < 300; i++) episode(); draw(); });
    on(host, "#rs", "click", reset);
    on(host, "#lay,#alg", "change", reset);
    reset();
  };

  function npdf(x, m, s) { return Math.exp(-0.5 * (x - m) * (x - m) / (s * s)) / (s * Math.sqrt(2 * Math.PI)); }
  D.gand = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Real data p<sub>data</sub><select id="pd"><option value="uni">N(0, 1)</option><option value="bi">Two modes: ½N(−2, 0.6²) + ½N(2, 0.6²)</option></select></label><label>Generator mean μ = <span id="ml"></span><input type="range" id="m" min="-4" max="4" step="0.1" value="2"></label><label>Generator spread σ = <span id="sl"></span><input type="range" id="s" min="0.3" max="3" step="0.05" value="1"></label><span class="seg" id="pre"><button data-p="uni|0|1">Equilibrium p<sub>G</sub> = p<sub>data</sub></button><button data-p="bi|2|0.6">Mode collapse (one mode)</button><button data-p="uni|3.5|0.5">Early training (far apart)</button></span></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var bi = el(host, "#pd").value === "bi", m = +el(host, "#m").value, sg = +el(host, "#s").value;
      el(host, "#ml").textContent = f(m, 1); el(host, "#sl").textContent = f(sg, 2);
      var pd = bi ? function (x) { return 0.5 * npdf(x, -2, 0.6) + 0.5 * npdf(x, 2, 0.6); } : function (x) { return npdf(x, 0, 1); };
      var pg = function (x) { return npdf(x, m, sg); };
      var Ds = function (x) { var a = pd(x), b = pg(x); return a + b < 1e-12 ? NaN : a / (a + b); };
      var js = 0, dx = 0.005;
      for (var x = -12; x <= 12; x += dx) { var a = pd(x), b = pg(x), mm = (a + b) / 2; if (a > 1e-300) js += 0.5 * a * Math.log(a / mm) * dx; if (b > 1e-300) js += 0.5 * b * Math.log(b / mm) * dx; }
      var sv = plot([{ f: pd, name: "p_data" }, { f: pg, name: "p_G" }, { f: Ds, dash: "6 4", color: K.PALETTE[2] }], [-6, 6], [0, 1.05], { w: 400, h: 240 });
      var pl = el(host, "#pl"); pl.innerHTML = legend([{ name: "p<sub>data</sub>", color: K.PALETTE[0] }, { name: "p<sub>G</sub>", color: K.PALETTE[1] }, { name: "D*(x) = p<sub>data</sub>/(p<sub>data</sub> + p<sub>G</sub>)", color: K.PALETTE[2] }]); pl.appendChild(sv);
      el(host, "#o").innerHTML = "For a fixed G, the optimal discriminator is <b>D*(x) = p<sub>data</sub>(x) / (p<sub>data</sub>(x) + p<sub>G</sub>(x))</b>.<br>Substituting it: V(D*, G) = 2·JSD(p<sub>data</sub> ‖ p<sub>G</sub>) − log 4.<br><br>" +
        "JSD here = <b>" + f(js, 4) + "</b> nats (maximum log 2 = 0.6931) → V(D*, G) = <b>" + f(2 * js - Math.log(4), 4) + "</b> (global minimum −log 4 = −1.3863 when p<sub>G</sub> = p<sub>data</sub>, where D* = ½ everywhere).<br><br>" +
        (js < 0.005 ? "✓ <b>Equilibrium</b>: the generator matches the data, so the discriminator can only guess (D = ½)." :
          bi && Math.abs(Math.abs(m) - 2) < 0.4 && sg < 0.9 ? "⚠ <b>Mode collapse</b>: the generator produces convincing samples from only one mode. D* still flags the missed mode. Remedies: minibatch discrimination (let D compare samples within a batch), WGAN, unrolled GANs." :
          js > 0.6 ? "⚠ The distributions barely overlap: JSD is close to its ceiling log 2, so it hardly changes as G moves. This is where the original GAN's gradients vanish (see the WGAN demo)." : "Move μ and σ so p<sub>G</sub> covers p<sub>data</sub>: JSD falls and D* flattens towards ½.");
    }
    on(host, "input,select", "input", run);
    on(host, "#pre button", "click", function () { var p = this.getAttribute("data-p").split("|"); el(host, "#pd").value = p[0]; el(host, "#m").value = p[1]; el(host, "#s").value = p[2]; run(); });
    run();
  };

  D.gansat = function (host) {
    host.innerHTML = '<div class="demo-row"><label>D(G(z)) = <span id="dl"></span><input type="range" id="d" min="0.001" max="0.999" step="0.001" value="0.02"></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var d = +el(host, "#d").value; el(host, "#dl").textContent = f(d, 3);
      var sv = plot([{ f: function (x) { return x; } }, { f: function (x) { return 1 - x; } }], [0, 1], [0, 1.05], { w: 380, h: 220 });
      [[d, K.PALETTE[0]], [1 - d, K.PALETTE[1]]].forEach(function (p) { css(S(sv, "circle", { cx: sv._X(d), cy: sv._Y(p[0]), r: 5 }), { fill: p[1] }); });
      var pl = el(host, "#pl"); pl.innerHTML = legend([{ name: "|∂L/∂a| for L = log(1 − D) (saturating): D", color: K.PALETTE[0] }, { name: "|∂L/∂a| for L = −log D (non-saturating): 1 − D", color: K.PALETTE[1] }]); pl.appendChild(sv);
      el(host, "#o").innerHTML = "With D = σ(a) (a = discriminator logit) and ∂D/∂a = D(1 − D):<br>" +
        "• Minimax generator loss L<sub>G</sub> = log(1 − D): ∂L<sub>G</sub>/∂a = −D(1 − D)/(1 − D) = <b>−D = " + f(-d, 3) + "</b><br>" +
        "• Non-saturating loss L<sub>G</sub> = −log D: ∂L<sub>G</sub>/∂a = <b>−(1 − D) = " + f(-(1 - d), 3) + "</b><br><br>" +
        (d < 0.1 ? "Early in training the discriminator easily spots fakes, so D(G(z)) ≈ 0. The minimax gradient <b>vanishes</b> while the non-saturating one is about 1: that is why practice trains G to <b>maximise log D(G(z))</b>." : "As D(G(z)) grows, the two gradients approach each other; at D = ½ both are 0.5 in magnitude.");
    }
    on(host, "input", "input", run); run();
  };

  D.wgan = function (host) {
    host.innerHTML = '<div class="demo-row"><label>Shift x of p<sub>G</sub> = <span id="xl"></span><input type="range" id="x" min="-3" max="3" step="0.05" value="2"></label><label>Width w of each uniform distribution = <span id="wl"></span><input type="range" id="w" min="0.2" max="2" step="0.1" value="1"></label></div><div class="two-col"><div id="pl"></div><div class="out" id="o"></div></div>';
    function run() {
      var x = +el(host, "#x").value, w = +el(host, "#w").value; el(host, "#xl").textContent = f(x, 2); el(host, "#wl").textContent = f(w, 1);
      var JS = function (t) { return Math.log(2) * Math.min(1, Math.abs(t) / w); }, WD = function (t) { return Math.abs(t); };
      var sv = plot([{ f: JS }, { f: WD }], [-3, 3], [0, 3.1], { w: 380, h: 220 });
      css(S(sv, "circle", { cx: sv._X(x), cy: sv._Y(JS(x)), r: 5 }), { fill: K.PALETTE[0] }); css(S(sv, "circle", { cx: sv._X(x), cy: sv._Y(WD(x)), r: 5 }), { fill: K.PALETTE[1] });
      var pl = el(host, "#pl"); pl.innerHTML = legend([{ name: "Jensen–Shannon divergence", color: K.PALETTE[0] }, { name: "Wasserstein (earth-mover) distance", color: K.PALETTE[1] }]); pl.appendChild(sv);
      var over = Math.abs(x) < w;
      el(host, "#o").innerHTML = "p<sub>data</sub> = Uniform[0, w], p<sub>G</sub> = Uniform[x, x + w]. As functions of the shift x:<br>" +
        "JSD = log 2 · min(1, |x|/w) = <b>" + f(JS(x), 4) + "</b> · W = |x| = <b>" + f(WD(x), 3) + "</b><br><br>" +
        (over ? "The distributions still overlap, so both measures respond to x." : "<b>No overlap</b>: JSD is stuck at log 2 = 0.693 whatever x is, so every such x is \"as good\" and the generator gets <b>no gradient</b>. W still equals the distance mass must move, so it gives a useful gradient.") +
        "<br><br><small>WGAN uses the Kantorovich–Rubinstein dual: W = max over 1-Lipschitz f of E<sub>data</sub>[f(x)] − E<sub>G</sub>[f(x)]. The critic outputs an unbounded <b>score</b> (not a probability). The Lipschitz constraint is enforced by <b>weight clipping</b> or a <b>gradient penalty</b>.</small>";
    }
    on(host, "input", "input", run); run();
  };

  /*__WEEK12__*/
})();
