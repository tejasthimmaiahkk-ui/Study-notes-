/* ==========================================================================
   Data Analytics — interactive demos
   ========================================================================== */
(function () {
  "use strict";
  const D = window.DEMOS;
  const f = (x, d) => K.num(x, d === undefined ? 4 : d);
  const tbl = (head, rows, cls) =>
    `<div class="tbl-wrap"><table class="num ${cls || ""}"><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ""}>${(r.cells || r).map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
  const nums = s => K.parseList(s).filter(x => !isNaN(x));

  /* --------------------------------------------------------------- Unit I */
  D.timeline = function (host) {
    const ev = [
      ["1890", "Punched-card tabulation", "Herman Hollerith's machines process the US census in 1 year instead of 8 — the first mechanised data processing (his company later became IBM).", "Descriptive"],
      ["1920s", "Modern statistics", "Karl Pearson (correlation), R.A. Fisher (ANOVA, design of experiments), Gosset's t-test at the Guinness brewery.", "Descriptive / diagnostic"],
      ["1950s", "Computers & operations research", "Mainframes and linear programming support logistics and planning decisions.", "Prescriptive (early)"],
      ["1970", "Relational databases", "E.F. Codd's relational model; SQL follows, making it easy to query stored data.", "Descriptive"],
      ["1980s", "Data warehouses & decision support", "Separate analytical databases (Inmon, Kimball), OLAP cubes; Excel (1985) brings analysis to every desk.", "Descriptive"],
      ["1989", "\"Business Intelligence\"", "Gartner popularises the term BI for reporting tools that help managers decide.", "Descriptive / diagnostic"],
      ["1990s", "Data mining", "Knowledge discovery: association rules, clustering; CRISP-DM process (1996).", "Diagnostic / predictive"],
      ["2005", "Web analytics", "Google Analytics launches free web analytics; clickstream analysis becomes mainstream.", "Descriptive"],
      ["2006", "Big Data & Hadoop", "Distributed storage and processing of huge, varied, fast data (the 3 Vs).", "All"],
      ["2010s", "Data science & machine learning", "Python/R ecosystems, cloud platforms, predictive models in production.", "Predictive"],
      ["2015", "Self-service BI", "Power BI and Tableau let business users build interactive dashboards themselves.", "Descriptive / diagnostic"],
      ["2020s", "Augmented analytics & AI", "AutoML, natural-language queries, generative-AI copilots, real-time streaming analytics.", "Predictive / prescriptive"]
    ];
    host.innerHTML = `<input type="range" id="s" min="0" max="${ev.length - 1}" value="0" style="width:100%"><div class="cells" id="c" style="grid-template-columns:repeat(${ev.length},1fr);margin:6px 0"></div><div class="out" id="o"></div>`;
    function go() {
      const i = +K.q(host, "#s").value, e = ev[i];
      K.q(host, "#c").innerHTML = ev.map((x, j) => `<div class="cell ${j === i ? "hl" : j < i ? "hl3" : ""}" style="font-size:.66rem;cursor:pointer" data-j="${j}">${x[0]}</div>`).join("");
      K.qa(host, "#c .cell").forEach(c => c.addEventListener("click", () => { K.q(host, "#s").value = c.dataset.j; go(); }));
      K.q(host, "#o").innerHTML = `<b style="color:var(--acc)">${e[0]} — ${e[1]}</b><br>${e[2]}<br><small>Main analytics type of the era: ${e[3]}</small>`;
    }
    K.q(host, "#s").addEventListener("input", go); go();
  };

  D.classify = function (host) {
    const items = [
      ["A dashboard shows total sales by region for last quarter.", "Descriptive"],
      ["The bank estimates the probability that a loan applicant will default.", "Predictive"],
      ["Analysts drill down and find the sales drop is caused by stock-outs in Pune.", "Diagnostic"],
      ["The system recommends how many units of each product to reorder this week to minimise cost.", "Prescriptive"],
      ["Average attendance per subject is calculated for the semester.", "Descriptive"],
      ["A model forecasts electricity demand for tomorrow evening.", "Predictive"],
      ["Google Maps suggests the fastest route considering live traffic.", "Prescriptive"],
      ["A correlation study shows exam scores fall as hours on social media rise.", "Diagnostic"],
      ["Netflix decides which thumbnail to show each user to maximise clicks.", "Prescriptive"],
      ["A report lists the top 10 best-selling products of 2024.", "Descriptive"],
      ["HR identifies that most resignations came from employees with long commutes.", "Diagnostic"],
      ["An e-commerce site predicts which customers will churn next month.", "Predictive"]
    ];
    const types = ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"];
    let i = 0, score = 0, done = 0;
    host.innerHTML = `<div class="out" id="q"></div><div class="demo-row" id="b">${types.map(t => `<button class="btn ghost" data-t="${t}">${t}</button>`).join("")}</div><div id="fb"></div><div class="hint" id="sc"></div>`;
    function show() { K.q(host, "#q").innerHTML = `<b>Scenario ${i + 1}/${items.length}:</b> ${items[i][0]}`; K.q(host, "#fb").innerHTML = ""; }
    K.qa(host, "#b button").forEach(b => b.addEventListener("click", () => {
      const ok = b.dataset.t === items[i][1]; done++; if (ok) score++;
      K.q(host, "#fb").innerHTML = `<div class="out">${ok ? '<span class="ok">Correct!</span>' : `<span class="no">Not quite</span> — it is <b>${items[i][1]}</b>.`} ${{ Descriptive: "It summarises what happened.", Diagnostic: "It explains why something happened.", Predictive: "It estimates what will happen.", Prescriptive: "It recommends an action." }[items[i][1]]}</div>`;
      K.q(host, "#sc").textContent = `Score ${score}/${done}`;
      setTimeout(() => { i = (i + 1) % items.length; show(); }, 1600);
    }));
    show();
  };

  D.textan = function (host) {
    const STOP = new Set("a an the is are was were be been am i you he she it we they this that these those of in on at to for from by with and or but not no so very too as it's its my your our their me him her them do does did have has had will would can could should just than then there here what which who whom".split(" "));
    const POS = new Set("good great excellent amazing love loved awesome fast happy best nice superb fantastic perfect wonderful recommend worth smooth beautiful helpful".split(" "));
    const NEG = new Set("bad poor terrible awful hate hated slow worst broken disappointed disappointing waste useless late expensive problem issue rude damaged".split(" "));
    const stem = w => w.replace(/(ing|ed|ly|es|s)$/, "").replace(/(.)\1$/, "$1");
    host.innerHTML = `<label>Customer reviews (one per line)<textarea id="t" rows="5">The delivery was fast and the phone is amazing. Great value!
Battery life is poor and the charger was broken. Very disappointed.
Good camera, but the screen is too slow to respond.
Excellent service, I would recommend this store to friends.
Worst experience ever, the package arrived late and damaged.</textarea></label><div id="o"></div>`;
    function go() {
      const lines = K.q(host, "#t").value.split(/\n+/).filter(Boolean);
      const allTok = [], rows = [];
      lines.forEach(l => {
        const tokens = l.toLowerCase().match(/[a-z']+/g) || [];
        const kept = tokens.filter(w => !STOP.has(w));
        const stems = kept.map(stem);
        let p = 0, n = 0; kept.forEach(w => { if (POS.has(w)) p++; if (NEG.has(w)) n++; });
        const sc = p - n; allTok.push(...stems);
        rows.push([K.esc(l.length > 60 ? l.slice(0, 58) + "…" : l), tokens.length, kept.length, `+${p} / −${n}`, sc > 0 ? '<span class="ok">Positive</span>' : sc < 0 ? '<span class="no">Negative</span>' : "Neutral"]);
      });
      const freq = {}; allTok.forEach(w => freq[w] = (freq[w] || 0) + 1);
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const first = (lines[0] || "").toLowerCase().match(/[a-z']+/g) || [];
      K.q(host, "#o").innerHTML = `<div class="out mono" style="font-size:.8rem"><b>Pipeline on review 1</b>\n1. tokens    : [${first.join(", ")}]\n2. no stops  : [${first.filter(w => !STOP.has(w)).join(", ")}]\n3. stemmed   : [${first.filter(w => !STOP.has(w)).map(stem).join(", ")}]</div>` +
        tbl(["Review", "Tokens", "After stop-words", "Lexicon hits", "Sentiment"], rows) +
        `<div id="ch"></div><p class="hint">Lexicon-based sentiment: count positive words minus negative words. Real systems use machine learning and handle negation ("not good") and sarcasm.</p>`;
      const c = K.barChart({ labels: top.map(x => x[0]), values: top.map(x => x[1]), h: 200, fmt: v => K.num(v, 0) });
      K.q(host, "#ch").appendChild(c);
    }
    K.q(host, "#t").addEventListener("input", go); go();
  };

  D.webmetrics = function (host) {
    host.innerHTML = `<p class="hint">Each line is one session: <code>pages_viewed, seconds_on_site, converted(1/0), source</code>. Edit the log and watch the metrics update.</p>
      <textarea id="t" rows="7" style="width:100%">1, 12, 0, social
5, 340, 1, organic
3, 180, 0, direct
1, 8, 0, paid
7, 610, 1, organic
2, 95, 0, social
1, 20, 0, organic
4, 260, 1, paid
1, 5, 0, social
6, 420, 0, direct</textarea><div class="kpis" id="k" style="margin-top:10px"></div><div id="ch"></div>`;
    function go() {
      const rows = K.q(host, "#t").value.split(/\n+/).map(l => l.split(",").map(s => s.trim())).filter(r => r.length >= 3 && !isNaN(+r[0]));
      const n = rows.length || 1, pv = rows.reduce((a, r) => a + +r[0], 0), tsec = rows.reduce((a, r) => a + +r[1], 0);
      const bounces = rows.filter(r => +r[0] === 1).length, conv = rows.filter(r => +r[2] === 1).length;
      const kp = [["Sessions", rows.length], ["Page views", pv], ["Pages / session", f(pv / n, 2)], ["Avg. duration", f(tsec / n, 0) + " s"], ["Bounce rate", f(100 * bounces / n, 1) + "%"], ["Conversion rate", f(100 * conv / n, 1) + "%"]];
      K.q(host, "#k").innerHTML = kp.map(x => `<div class="kpi"><div class="k">${x[0]}</div><div class="v">${x[1]}</div></div>`).join("");
      const src = {}; rows.forEach(r => { const s = r[3] || "other"; src[s] = src[s] || [0, 0]; src[s][0]++; src[s][1] += +r[2]; });
      const keys = Object.keys(src);
      const ch = K.q(host, "#ch"); ch.innerHTML = `<p style="margin:12px 0 4px"><b>Sessions by traffic source</b> (hover for conversions)</p>`;
      ch.appendChild(K.barChart({ labels: keys, values: keys.map(k => src[k][0]), h: 190, fmt: v => K.num(v, 0) }));
      ch.insertAdjacentHTML("beforeend", `<div class="out">Bounce rate = ${bounces} single-page sessions ÷ ${rows.length} sessions × 100. Conversion rate = ${conv} converting sessions ÷ ${rows.length} × 100. Best converting source: <b>${keys.sort((a, b) => src[b][1] / src[b][0] - src[a][1] / src[a][0])[0]}</b>.</div>`);
    }
    K.q(host, "#t").addEventListener("input", go); go();
  };

  /* -------------------------------------------------------------- Unit II */

  // Scatter plot helper: points [[x,y]], optional lines [{m,c,cls}] (y = m x + c) or x-on-y lines
  function scatterSvg(pts, opts) {
    opts = opts || {};
    const W = opts.w || 520, H = opts.h || 340, pad = 40;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    let x0 = opts.x0 !== undefined ? opts.x0 : Math.min(...xs), x1 = opts.x1 !== undefined ? opts.x1 : Math.max(...xs);
    let y0 = opts.y0 !== undefined ? opts.y0 : Math.min(...ys), y1 = opts.y1 !== undefined ? opts.y1 : Math.max(...ys);
    const dx = (x1 - x0) || 1, dy = (y1 - y0) || 1; x0 -= dx * 0.1; x1 += dx * 0.1; y0 -= dy * 0.1; y1 += dy * 0.1;
    const s = K.svg(W, H);
    const X = v => pad + (v - x0) / (x1 - x0) * (W - pad - 10), Y = v => H - pad + 10 - (v - y0) / (y1 - y0) * (H - pad - 10);
    for (let i = 0; i <= 4; i++) {
      const gx = x0 + (x1 - x0) * i / 4, gy = y0 + (y1 - y0) * i / 4;
      K.s(s, "line", { x1: X(gx), x2: X(gx), y1: 10, y2: H - pad + 10, "class": "gridl" });
      K.s(s, "line", { x1: pad, x2: W - 10, y1: Y(gy), y2: Y(gy), "class": "gridl" });
      K.s(s, "text", { x: X(gx), y: H - pad + 26, "text-anchor": "middle" }, K.num(gx, 1));
      K.s(s, "text", { x: pad - 6, y: Y(gy) + 4, "text-anchor": "end" }, K.num(gy, 1));
    }
    (opts.lines || []).forEach(l => {
      let a, b;
      if (l.xOnY) { a = [l.m * y0 + l.c, y0]; b = [l.m * y1 + l.c, y1]; } else { a = [x0, l.m * x0 + l.c]; b = [x1, l.m * x1 + l.c]; }
      const ln = K.s(s, "line", { x1: X(a[0]), y1: Y(a[1]), x2: X(b[0]), y2: Y(b[1]) }); ln.style.stroke = l.color; ln.style.strokeWidth = "2.2";
      if (l.dash) ln.style.strokeDasharray = "6 4";
    });
    (opts.resid || []).forEach(r => { const ln = K.s(s, "line", { x1: X(r[0]), x2: X(r[0]), y1: Y(r[1]), y2: Y(r[2]) }); ln.style.stroke = "var(--bad)"; ln.style.strokeDasharray = "3 3"; });
    const circles = pts.map((p, i) => { const c = K.s(s, "circle", { cx: X(p[0]), cy: Y(p[1]), r: 6, "class": "pt" }); K.s(c, "title", {}, `(${p[0]}, ${p[1]})`); c.dataset.i = i; return c; });
    if (opts.mean) { const m = K.s(s, "circle", { cx: X(opts.mean[0]), cy: Y(opts.mean[1]), r: 5 }); m.style.fill = "var(--warn)"; K.s(m, "title", {}, "(X̄, Ȳ)"); }
    s._inv = (px, py) => [x0 + (px - pad) / (W - pad - 10) * (x1 - x0), y0 + (H - pad + 10 - py) / (H - pad - 10) * (y1 - y0)];
    s._circles = circles;
    return s;
  }

  D.scatterR = function (host) {
    let pts = [[1, 2], [2, 3.2], [3, 3.8], [4, 5.4], [5, 5.6], [6, 7.1], [7, 7.4], [8, 9.2]];
    host.innerHTML = `<div class="demo-row"><button class="btn ghost" data-p="pos">High positive</button><button class="btn ghost" data-p="neg">High negative</button><button class="btn ghost" data-p="none">No correlation</button><button class="btn ghost" data-p="curve">U-shape (non-linear)</button><button class="btn ghost" data-p="outlier">Add an outlier</button></div><div id="g" style="touch-action:none"></div><div class="out" id="o"></div><p class="hint">Drag any point. Notice how a U-shape gives r ≈ 0 even though X and Y are strongly related, and how one outlier can change r a lot.</p>`;
    const presets = {
      pos: () => [[1, 2], [2, 3.2], [3, 3.8], [4, 5.4], [5, 5.6], [6, 7.1], [7, 7.4], [8, 9.2]],
      neg: () => [[1, 9], [2, 8.1], [3, 7.4], [4, 5.2], [5, 5.5], [6, 3.6], [7, 3.1], [8, 1.5]],
      none: () => [[1, 5], [2, 2], [3, 8], [4, 4.5], [5, 7.5], [6, 2.5], [7, 6], [8, 4]],
      curve: () => [[1, 9], [2, 5], [3, 2.5], [4, 1], [5, 1], [6, 2.5], [7, 5], [8, 9]],
      outlier: () => pts.concat([[8, 0.5]])
    };
    K.qa(host, "[data-p]").forEach(b => b.addEventListener("click", () => { pts = presets[b.dataset.p](); draw(); }));
    let drag = null, svg = null;
    function draw() {
      const P = ST.pearson(pts.map(p => p[0]), pts.map(p => p[1]));
      const ls = ST.leastSquares(pts.map(p => p[0]), pts.map(p => p[1]));
      svg = scatterSvg(pts, { x0: 0, x1: 9, y0: 0, y1: 10, lines: [{ m: ls.b, c: ls.a, color: "var(--warn)", dash: true }] });
      const g = K.q(host, "#g"); g.innerHTML = ""; g.appendChild(svg);
      svg._circles.forEach(c => { c.style.cursor = "grab"; c.addEventListener("pointerdown", e => { drag = +c.dataset.i; svg.setPointerCapture && svg.setPointerCapture(e.pointerId); e.preventDefault(); }); });
      svg.addEventListener("pointermove", e => {
        if (drag === null) return;
        const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
        const px = (e.clientX - r.left) * vb.width / r.width, py = (e.clientY - r.top) * vb.height / r.height;
        const v = svg._inv(px, py); pts[drag] = [Math.max(0, Math.min(9, +v[0].toFixed(1))), Math.max(0, Math.min(10, +v[1].toFixed(1)))];
        const keep = drag; draw(); drag = keep;
      });
      svg.addEventListener("pointerup", () => drag = null);
      svg.addEventListener("pointerleave", () => drag = null);
      const r = P.r, deg = Math.abs(r) === 1 ? "perfect" : Math.abs(r) >= 0.75 ? "high" : Math.abs(r) >= 0.5 ? "moderate" : Math.abs(r) > 0.05 ? "low" : "no";
      K.q(host, "#o").innerHTML = `r = <b class="big-out">${f(r, 3)}</b> → ${deg} ${deg === "no" ? "linear correlation" : (r > 0 ? "positive" : "negative") + " correlation"}. r² = ${f(r * r, 3)} (${f(100 * r * r, 1)}% of variation in Y explained by X). Dashed line = least-squares line Y = ${f(ls.a, 2)} + ${f(ls.b, 2)}X.`;
    }
    draw();
  };

  D.pearson = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">X values<input type="text" id="x" class="wide" value="12, 9, 8, 10, 11, 13, 7"></label></div><div class="demo-row"><label class="grow">Y values<input type="text" id="y" class="wide" value="14, 8, 6, 9, 11, 12, 3"></label></div>
      <div class="demo-row"><div class="seg" id="m"><button class="on" data-v="1">Actual mean</button><button data-v="2">Direct</button><button data-v="3">Assumed mean</button></div><label>A (for X)<input type="number" id="A" value="11"></label><label>B (for Y)<input type="number" id="B" value="10"></label></div><div id="o"></div>`;
    let m = "1";
    K.qa(host, "#m button").forEach(b => b.addEventListener("click", () => { m = b.dataset.v; K.qa(host, "#m button").forEach(x => x.classList.toggle("on", x === b)); go(); }));
    function go() {
      const X = nums(K.q(host, "#x").value), Y = nums(K.q(host, "#y").value), o = K.q(host, "#o");
      if (X.length !== Y.length || X.length < 3) { o.innerHTML = `<div class="out no">Enter the same number (≥ 3) of X and Y values.</div>`; return; }
      const P = ST.pearson(X, Y), N = X.length; let h = "";
      if (m === "1") {
        h = `<div class="out">X̄ = ${P.SX}/${N} = <b>${f(P.mx)}</b>, Ȳ = ${P.SY}/${N} = <b>${f(P.my)}</b></div>` +
          tbl(["X", "Y", "x = X − X̄", "y = Y − Ȳ", "x²", "y²", "xy"], P.rows.map(r => [r.X, r.Y, f(r.x), f(r.y), f(r.x2), f(r.y2), f(r.xy)]).concat([{ cls: "total", cells: [P.SX, P.SY, "0", "0", f(P.Sx2), f(P.Sy2), f(P.Sxy)] }])) +
          `<div class="out">r = Σxy / √(Σx² Σy²) = ${f(P.Sxy)} / √(${f(P.Sx2)} × ${f(P.Sy2)}) = ${f(P.Sxy)} / ${f(Math.sqrt(P.Sx2 * P.Sy2))} = <b>${f(P.r)}</b></div>`;
      } else if (m === "2") {
        const num = N * P.SXY - P.SX * P.SY, d1 = N * P.SX2 - P.SX ** 2, d2 = N * P.SY2 - P.SY ** 2;
        h = tbl(["X", "Y", "X²", "Y²", "XY"], P.rows.map(r => [r.X, r.Y, r.X2, r.Y2, r.XY]).concat([{ cls: "total", cells: [P.SX, P.SY, P.SX2, P.SY2, P.SXY] }])) +
          `<div class="out">r = (NΣXY − ΣXΣY) / √[(NΣX² − (ΣX)²)(NΣY² − (ΣY)²)]<br>= (${N}×${P.SXY} − ${P.SX}×${P.SY}) / √[(${N}×${P.SX2} − ${P.SX}²)(${N}×${P.SY2} − ${P.SY}²)]<br>= ${f(num)} / √(${f(d1)} × ${f(d2)}) = <b>${f(P.r)}</b></div>`;
      } else {
        const A = +K.q(host, "#A").value, B = +K.q(host, "#B").value;
        const rows = X.map((x, i) => { const dx = x - A, dy = Y[i] - B; return [x, Y[i], dx, dy, dx * dx, dy * dy, dx * dy]; });
        const S = k => rows.reduce((a, r) => a + r[k], 0), Sdx = S(2), Sdy = S(3), Sdx2 = S(4), Sdy2 = S(5), Sdxdy = S(6);
        const num = N * Sdxdy - Sdx * Sdy, d1 = N * Sdx2 - Sdx ** 2, d2 = N * Sdy2 - Sdy ** 2;
        h = tbl(["X", "Y", `dx = X − ${A}`, `dy = Y − ${B}`, "dx²", "dy²", "dxdy"], rows.map(r => r.map(v => f(v))).concat([{ cls: "total", cells: ["", "", f(Sdx), f(Sdy), f(Sdx2), f(Sdy2), f(Sdxdy)] }])) +
          `<div class="out">r = (NΣdxdy − ΣdxΣdy) / √[(NΣdx² − (Σdx)²)(NΣdy² − (Σdy)²)]<br>= (${N}×${f(Sdxdy)} − (${f(Sdx)})(${f(Sdy)})) / √[(${N}×${f(Sdx2)} − ${f(Sdx ** 2)})(${N}×${f(Sdy2)} − ${f(Sdy ** 2)})] = <b>${f(num / Math.sqrt(d1 * d2))}</b></div>`;
      }
      const sig = P.r > 6 * P.pe ? "significant (r > 6 P.E.)" : Math.abs(P.r) < P.pe ? "not significant (r < P.E.)" : "not definitely significant (P.E. < r < 6 P.E.)";
      h += `<div class="out">Probable error = 0.6745 × (1 − r²)/√N = 0.6745 × ${f(1 - P.r ** 2)}/${f(Math.sqrt(N))} = <b>${f(P.pe)}</b>; 6 P.E. = ${f(6 * P.pe)} → ${sig}. Limits: ${f(P.r - P.pe)} to ${f(P.r + P.pe)}.</div>`;
      o.innerHTML = h;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.spearman = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Series 1<input type="text" id="x" class="wide" value="48, 33, 40, 9, 16, 16, 65, 24, 16, 57"></label></div><div class="demo-row"><label class="grow">Series 2<input type="text" id="y" class="wide" value="13, 13, 24, 6, 15, 4, 20, 9, 6, 19"></label></div>
      <div class="demo-row"><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="rg"> These are already ranks</label></div><div id="o"></div>`;
    function go() {
      const X = nums(K.q(host, "#x").value), Y = nums(K.q(host, "#y").value), given = K.q(host, "#rg").checked, o = K.q(host, "#o");
      if (X.length !== Y.length || X.length < 3) { o.innerHTML = `<div class="out no">Enter the same number (≥ 3) of values in both series.</div>`; return; }
      const R = ST.spearman(X, Y, given), N = X.length;
      let h = tbl(given ? ["R₁", "R₂", "D", "D²"] : ["X", "R₁", "Y", "R₂", "D = R₁ − R₂", "D²"],
        X.map((x, i) => given ? [x, Y[i], f(R.D[i]), f(R.D2[i])] : [x, R.R1[i], Y[i], R.R2[i], f(R.D[i]), f(R.D2[i])]).concat([{ cls: "total", cells: given ? ["", "", f(R.D.reduce((a, b) => a + b, 0)), f(R.SD2)] : ["", "", "", "", f(R.D.reduce((a, b) => a + b, 0)), f(R.SD2)] }]));
      if (R.ties.length) h += `<div class="out">Tied groups (m): ${R.ties.join(", ")} → correction Σ(m³ − m)/12 = ${R.ties.map(m => `(${m}³−${m})/12`).join(" + ")} = <b>${f(R.cf)}</b></div>`;
      h += `<div class="out">R = 1 − 6(ΣD²${R.ties.length ? " + CF" : ""}) / [N(N² − 1)] = 1 − 6(${f(R.SD2)}${R.ties.length ? " + " + f(R.cf) : ""}) / (${N} × ${N * N - 1}) = 1 − ${f(6 * (R.SD2 + R.cf))}/${N * (N * N - 1)} = <b class="big-out">${f(R.R)}</b></div>
        ${given ? "" : `<p class="hint">Ranks: 1 = highest value; tied values get the average of the positions they occupy.</p>`}`;
      o.innerHTML = h;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.regression = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">X values<input type="text" id="x" class="wide" value="12, 9, 8, 10, 11, 13, 7"></label></div><div class="demo-row"><label class="grow">Y values<input type="text" id="y" class="wide" value="14, 8, 6, 9, 11, 12, 3"></label></div>
      <div class="demo-row"><label>Predict Y for X =<input type="number" id="px" value="15"></label><label>Predict X for Y =<input type="number" id="py" value="10"></label><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="res" checked> show residuals</label></div><div id="g"></div><div class="legend"><span><i style="background:var(--acc)"></i>Y on X</span><span><i style="background:var(--oos)"></i>X on Y (dashed)</span><span><i style="background:var(--warn)"></i>(X̄, Ȳ)</span><span><i style="background:var(--bad)"></i>residuals (errors of Y on X)</span></div><div class="out" id="o"></div>`;
    function go() {
      const X = nums(K.q(host, "#x").value), Y = nums(K.q(host, "#y").value), o = K.q(host, "#o");
      if (X.length !== Y.length || X.length < 3) { o.innerHTML = `<span class="no">Enter the same number (≥ 3) of X and Y values.</span>`; return; }
      const P = ST.pearson(X, Y), byx = P.byx, bxy = P.bxy, cY = P.my - byx * P.mx, cX = P.mx - bxy * P.my;
      const px = +K.q(host, "#px").value, py = +K.q(host, "#py").value;
      const resid = K.q(host, "#res").checked ? X.map((x, i) => [x, Y[i], cY + byx * x]) : [];
      const svg = scatterSvg(X.map((x, i) => [x, Y[i]]), { lines: [{ m: byx, c: cY, color: "var(--acc)" }, { m: bxy, c: cX, color: "var(--oos)", xOnY: true, dash: true }], resid, mean: [P.mx, P.my] });
      const g = K.q(host, "#g"); g.innerHTML = ""; g.appendChild(svg);
      const sse = X.reduce((a, x, i) => a + (Y[i] - cY - byx * x) ** 2, 0);
      o.innerHTML = `X̄ = ${f(P.mx)}, Ȳ = ${f(P.my)}, Σx² = ${f(P.Sx2)}, Σy² = ${f(P.Sy2)}, Σxy = ${f(P.Sxy)}<br>
        b<sub>yx</sub> = Σxy/Σx² = <b>${f(byx)}</b>; &nbsp; b<sub>xy</sub> = Σxy/Σy² = <b>${f(bxy)}</b>; &nbsp; r = ±√(b<sub>yx</sub>b<sub>xy</sub>) = <b>${f(P.r)}</b><br>
        <b>Y on X:</b> Y − ${f(P.my, 2)} = ${f(byx)}(X − ${f(P.mx, 2)}) → <b>Y = ${f(byx)}X ${cY >= 0 ? "+" : "−"} ${f(Math.abs(cY))}</b><br>
        <b>X on Y:</b> X − ${f(P.mx, 2)} = ${f(bxy)}(Y − ${f(P.my, 2)}) → <b>X = ${f(bxy)}Y ${cX >= 0 ? "+" : "−"} ${f(Math.abs(cX))}</b><br>
        Estimate: Y at X = ${px} → <b>${f(cY + byx * px, 2)}</b> (use Y on X); X at Y = ${py} → <b>${f(cX + bxy * py, 2)}</b> (use X on Y)<br>
        Sum of squared residuals Σ(Y − Ŷ)² = ${f(sse, 3)} — the least-squares line makes this as small as possible.`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  /* ------------------------------------------------------------- Unit III */
  const segSetup = (host, id, cb) => K.qa(host, `#${id} button`).forEach(b => b.addEventListener("click", () => { K.qa(host, `#${id} button`).forEach(x => x.classList.toggle("on", x === b)); cb(b.dataset.v); }));

  D.dicesim = function (host) {
    host.innerHTML = `<div class="demo-row"><button class="btn" data-n="1">Roll once</button><button class="btn" data-n="10">Roll 10</button><button class="btn" data-n="100">Roll 100</button><button class="btn" data-n="1000">Roll 1000</button><button class="btn ghost" id="r">Reset</button></div><div id="ch"></div><div class="out" id="o"></div>`;
    let c = [0, 0, 0, 0, 0, 0], n = 0, hist = [];
    function draw() {
      const ch = K.q(host, "#ch"); ch.innerHTML = "";
      ch.appendChild(K.barChart({ labels: ["1", "2", "3", "4", "5", "6"], values: c.map(v => n ? v / n : 0), yMax: 0.4, h: 200, fmt: v => K.num(v, 3) }));
      if (hist.length > 1) ch.appendChild(K.lineChart({ labels: hist.map(h => String(h[0])), series: [{ values: hist.map(h => h[1]), name: "relative freq of 6" }, { values: hist.map(() => 1 / 6), name: "1/6", color: "#f08c00" }], yMax: 0.4, h: 180 }));
      K.q(host, "#o").innerHTML = `Rolls: <b>${n}</b>. Relative frequency of a six = ${c[5]}/${n || 1} = <b>${f(n ? c[5] / n : 0, 3)}</b> (theory 1/6 = 0.167). With more rolls the bars level out at 1/6 — the relative-frequency definition in action.`;
    }
    K.qa(host, "[data-n]").forEach(b => b.addEventListener("click", () => { const k = +b.dataset.n; for (let i = 0; i < k; i++) { c[Math.floor(Math.random() * 6)]++; n++; } hist.push([n, c[5] / n]); if (hist.length > 40) hist.shift(); draw(); }));
    K.q(host, "#r").addEventListener("click", () => { c = [0, 0, 0, 0, 0, 0]; n = 0; hist = []; draw(); });
    draw();
  };

  D.bayes = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Prevalence P(D) %<input type="number" id="p" value="1" step="0.1"></label><label>Sensitivity P(+|D) %<input type="number" id="s" value="99" step="0.5"></label><label>False-positive rate P(+|no D) %<input type="number" id="fp" value="5" step="0.5"></label></div><div id="g"></div><div class="out" id="o"></div>`;
    function go() {
      const p = +K.q(host, "#p").value / 100, s = +K.q(host, "#s").value / 100, fp = +K.q(host, "#fp").value / 100;
      const tp = p * s, fpos = (1 - p) * fp, post = tp / (tp + fpos);
      // 1000-person grid
      const N = 1000, sick = Math.round(N * p), tpN = Math.round(sick * s), fpN = Math.round((N - sick) * fp);
      let h = `<div style="display:grid;grid-template-columns:repeat(50,1fr);gap:1px;max-width:600px">`;
      for (let i = 0; i < N; i++) {
        let col = "var(--line)";
        if (i < tpN) col = "var(--bad)"; else if (i < sick) col = "#f4a3a3"; else if (i < sick + fpN) col = "var(--warn)";
        h += `<i style="display:block;aspect-ratio:1;background:${col};border-radius:2px"></i>`;
      }
      K.q(host, "#g").innerHTML = h + `</div><div class="legend" style="margin-top:6px"><span><i style="background:var(--bad)"></i>sick &amp; test + (${tpN})</span><span><i style="background:#f4a3a3"></i>sick &amp; test − (${sick - tpN})</span><span><i style="background:var(--warn)"></i>healthy but test + (${fpN})</span><span><i style="background:var(--line)"></i>healthy &amp; test −</span></div>`;
      K.q(host, "#o").innerHTML = `P(D | +) = P(D)P(+|D) / [P(D)P(+|D) + P(D′)P(+|D′)] = ${f(p)}×${f(s)} / (${f(tp)} + ${f(1 - p)}×${f(fp)}) = ${f(tp)} / ${f(tp + fpos)} = <b class="big-out">${f(post, 4)}</b><br>In the picture of 1000 people: ${tpN} true positives out of ${tpN + fpN} positives ≈ ${f(100 * tpN / Math.max(1, tpN + fpN), 1)}%. Try raising the prevalence and watch the posterior jump.`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.binomial = function (host) {
    host.innerHTML = `<div class="demo-row"><label>n (trials): <b id="nv"></b><input type="range" id="n" min="1" max="40" value="10"></label><label>p (success): <b id="pv"></b><input type="range" id="p" min="0.01" max="0.99" step="0.01" value="0.5"></label><label>r from<input type="number" id="a" value="8"></label><label>to<input type="number" id="b" value="10"></label></div><div id="ch"></div><div class="out" id="o"></div>`;
    function go() {
      const n = +K.q(host, "#n").value, p = +K.q(host, "#p").value, a = +K.q(host, "#a").value, b = +K.q(host, "#b").value;
      K.q(host, "#nv").textContent = n; K.q(host, "#pv").textContent = p;
      const pr = [...Array(n + 1).keys()].map(r => ST.binom(n, p, r));
      const ch = K.q(host, "#ch"); ch.innerHTML = "";
      ch.appendChild(K.barChart({ labels: pr.map((_, r) => String(r)), values: pr, h: 220, fmt: v => K.num(v, 3), active: r => r >= a && r <= b, showValues: n <= 12 }));
      let sum = 0; for (let r = Math.max(0, a); r <= Math.min(n, b); r++) sum += pr[r];
      const one = Math.max(0, Math.min(n, a));
      K.q(host, "#o").innerHTML = `P(X = ${one}) = ${n}C${one} (${p})<sup>${one}</sup> (${f(1 - p, 2)})<sup>${n - one}</sup> = ${ST.nCr(n, one)} × ${f(p ** one, 6)} × ${f((1 - p) ** (n - one), 6)} = <b>${f(pr[one], 4)}</b><br>P(${a} ≤ X ≤ ${b}) = <b>${f(sum, 4)}</b> (highlighted bars)<br>Mean np = ${f(n * p, 3)}, variance npq = ${f(n * p * (1 - p), 3)}, SD = ${f(Math.sqrt(n * p * (1 - p)), 3)}. ${p === 0.5 ? "p = ½ → symmetric." : p < 0.5 ? "p &lt; ½ → positively skewed." : "p &gt; ½ → negatively skewed."}`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.poisson = function (host) {
    host.innerHTML = `<div class="demo-row"><label>mean m: <b id="mv"></b><input type="range" id="m" min="0.2" max="12" step="0.1" value="2"></label><label>P(X ≤ k), k =<input type="number" id="k" value="2"></label><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="cmp"> compare with Binomial n = 100, p = m/100</label></div><div id="ch"></div><div class="out" id="o"></div>`;
    function go() {
      const m = +K.q(host, "#m").value, k = +K.q(host, "#k").value, cmp = K.q(host, "#cmp").checked; K.q(host, "#mv").textContent = m;
      const R = Math.max(10, Math.ceil(m + 4 * Math.sqrt(m))), pr = [...Array(R + 1).keys()].map(r => ST.poisson(m, r));
      const ch = K.q(host, "#ch"); ch.innerHTML = "";
      const series = [{ values: pr, name: "Poisson" }]; if (cmp) series.push({ values: pr.map((_, r) => ST.binom(100, m / 100, r)), name: "Binomial", color: "#f08c00" });
      ch.appendChild(cmp ? K.lineChart({ labels: pr.map((_, r) => String(r)), series, h: 220 }) : K.barChart({ labels: pr.map((_, r) => String(r)), values: pr, h: 220, fmt: v => K.num(v, 3), active: r => r <= k, showValues: R <= 12 }));
      let cum = 0; const steps = []; for (let r = 0; r <= k && r <= R; r++) { cum += pr[r]; steps.push(`P(${r}) = ${f(pr[r], 4)}`); }
      K.q(host, "#o").innerHTML = `e<sup>−${m}</sup> = ${f(Math.exp(-m), 4)}. ${steps.join("; ")}<br>P(X ≤ ${k}) = <b>${f(cum, 4)}</b>; P(X ≥ ${k + 1}) = ${f(1 - cum, 4)}<br>Mean = variance = ${m}. ${cmp ? "With n large and p small the two curves almost coincide — Poisson approximates Binomial." : ""}`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.normal = function (host) {
    host.innerHTML = `<div class="demo-row"><label>μ<input type="number" id="mu" value="60"></label><label>σ<input type="number" id="sd" value="10"></label><label>from x₁<input type="number" id="a" value="50"></label><label>to x₂<input type="number" id="b" value="70"></label><button class="btn ghost" id="above">P(X &gt; x₁)</button><button class="btn ghost" id="below">P(X &lt; x₂)</button></div><div id="ch"></div><div class="out" id="o"></div>`;
    let mode = "between";
    K.q(host, "#above").addEventListener("click", () => { mode = "above"; go(); });
    K.q(host, "#below").addEventListener("click", () => { mode = "below"; go(); });
    K.qa(host, "input").forEach(i => i.addEventListener("input", () => { mode = "between"; go(); }));
    function go() {
      const mu = +K.q(host, "#mu").value, sd = Math.max(0.0001, +K.q(host, "#sd").value), a = +K.q(host, "#a").value, b = +K.q(host, "#b").value;
      const lo = mode === "below" ? mu - 4.5 * sd : a, hi = mode === "above" ? mu + 4.5 * sd : b;
      const W = 600, H = 240, s = K.svg(W, H), X = x => 20 + (x - (mu - 4 * sd)) / (8 * sd) * (W - 40), Y = y => H - 30 - y / ST.normPdf(mu, mu, sd) * (H - 50);
      let area = `M${X(Math.max(lo, mu - 4 * sd))},${Y(0)}`;
      for (let i = 0; i <= 200; i++) { const x = Math.max(lo, mu - 4 * sd) + (Math.min(hi, mu + 4 * sd) - Math.max(lo, mu - 4 * sd)) * i / 200; area += ` L${X(x)},${Y(ST.normPdf(x, mu, sd))}`; }
      area += ` L${X(Math.min(hi, mu + 4 * sd))},${Y(0)} Z`;
      K.s(s, "path", { d: area, "class": "area" });
      let d = ""; for (let i = 0; i <= 300; i++) { const x = mu - 4 * sd + 8 * sd * i / 300; d += (i ? "L" : "M") + X(x) + "," + Y(ST.normPdf(x, mu, sd)); }
      K.s(s, "path", { d, "class": "ln" });
      K.s(s, "line", { x1: 20, x2: W - 20, y1: Y(0), y2: Y(0), "class": "axis" });
      for (let k = -3; k <= 3; k++) { K.s(s, "line", { x1: X(mu + k * sd), x2: X(mu + k * sd), y1: Y(0), y2: Y(0) + 5, "class": "axis" }); K.s(s, "text", { x: X(mu + k * sd), y: Y(0) + 18, "text-anchor": "middle" }, `${K.num(mu + k * sd, 2)}`); }
      const ch = K.q(host, "#ch"); ch.innerHTML = ""; ch.appendChild(s);
      const z1 = (a - mu) / sd, z2 = (b - mu) / sd;
      let txt, p;
      if (mode === "above") { p = 1 - ST.normCdf(z1); txt = `P(X &gt; ${a}): z = (${a} − ${mu})/${sd} = ${f(z1, 2)}; P = 0.5 ${z1 >= 0 ? "−" : "+"} A(${f(Math.abs(z1), 2)}) = 0.5 ${z1 >= 0 ? "−" : "+"} ${f(Math.abs(ST.normCdf(z1) - 0.5), 4)}`; }
      else if (mode === "below") { p = ST.normCdf(z2); txt = `P(X &lt; ${b}): z = (${b} − ${mu})/${sd} = ${f(z2, 2)}; P = 0.5 ${z2 >= 0 ? "+" : "−"} A(${f(Math.abs(z2), 2)}) = 0.5 ${z2 >= 0 ? "+" : "−"} ${f(Math.abs(ST.normCdf(z2) - 0.5), 4)}`; }
      else { p = ST.normCdf(z2) - ST.normCdf(z1); txt = `P(${a} &lt; X &lt; ${b}): z₁ = ${f(z1, 2)}, z₂ = ${f(z2, 2)}; areas from 0: ${f(Math.abs(ST.normCdf(z1) - 0.5), 4)} and ${f(Math.abs(ST.normCdf(z2) - 0.5), 4)} → ${z1 * z2 < 0 ? "opposite sides: add" : "same side: subtract"}`; }
      K.q(host, "#o").innerHTML = `${txt}<br>Probability = <b class="big-out">${f(p, 4)}</b> (shaded area)`;
    }
    go();
  };

  D.ttest = function (host) {
    host.innerHTML = `<div class="demo-row"><div class="seg" id="ty"><button class="on" data-v="one">One sample</button><button data-v="two">Two samples</button><button data-v="pair">Paired</button></div><label>α<select id="al"><option>0.05</option><option>0.01</option><option>0.10</option></select></label></div>
      <div class="demo-row"><label class="grow" id="l1">Sample<input type="text" id="a" class="wide" value="70, 120, 110, 101, 88, 83, 95, 98, 107, 100"></label></div>
      <div class="demo-row"><label class="grow" id="l2">Hypothesised mean μ₀<input type="text" id="b" class="wide" value="100"></label></div><div id="o"></div>`;
    let ty = "one";
    const presets = { one: ["70, 120, 110, 101, 88, 83, 95, 98, 107, 100", "100", "Sample", "Hypothesised mean μ₀"], two: ["49, 53, 51, 52, 47, 50, 52, 53", "52, 55, 52, 53, 50, 54, 54, 53", "Sample 1", "Sample 2"], pair: ["110, 120, 123, 132, 125", "120, 118, 125, 136, 121", "Before", "After"] };
    segSetup(host, "ty", v => { ty = v; const p = presets[v]; K.q(host, "#a").value = p[0]; K.q(host, "#b").value = p[1]; K.q(host, "#l1").firstChild.textContent = p[2]; K.q(host, "#l2").firstChild.textContent = p[3]; go(); });
    function go() {
      const al = +K.q(host, "#al").value, A = nums(K.q(host, "#a").value), B = nums(K.q(host, "#b").value), o = K.q(host, "#o");
      let r, steps;
      if (ty === "one") {
        if (A.length < 2 || !B.length) return; r = ST.tOne(A, B[0]);
        steps = `H₀: μ = ${B[0]}; H₁: μ ≠ ${B[0]}<br>n = ${r.n}, x̄ = ${f(r.m)}, S = √[Σ(X − x̄)²/(n − 1)] = ${f(r.s)}<br>t = (x̄ − μ)/(S/√n) = (${f(r.m)} − ${B[0]})/(${f(r.s)}/√${r.n}) = <b>${f(r.t)}</b>`;
      } else if (ty === "two") {
        if (A.length < 2 || B.length < 2) return; r = ST.tTwo(A, B);
        steps = `H₀: μ₁ = μ₂; H₁: μ₁ ≠ μ₂<br>x̄₁ = ${f(r.m1)}, x̄₂ = ${f(r.m2)}; Σ(X₁ − x̄₁)² = ${f(r.ss1)}, Σ(X₂ − x̄₂)² = ${f(r.ss2)}<br>S = √[(${f(r.ss1)} + ${f(r.ss2)})/(${r.n1} + ${r.n2} − 2)] = ${f(r.sp)}<br>t = (x̄₁ − x̄₂)/(S√(1/n₁ + 1/n₂)) = <b>${f(r.t)}</b>`;
      } else {
        if (A.length !== B.length || A.length < 2) { o.innerHTML = `<div class="out no">Paired data need equal numbers of before/after values.</div>`; return; }
        r = ST.tPaired(A, B);
        steps = `H₀: mean difference = 0<br>d = after − before = ${r.d.join(", ")}; d̄ = ${f(r.m)}; S<sub>d</sub> = ${f(r.s)}<br>t = d̄/(S<sub>d</sub>/√n) = ${f(r.m)}/(${f(r.s)}/√${r.n}) = <b>${f(r.t)}</b>`;
      }
      const crit = ST.tCrit(al, r.df), pv = 2 * (1 - ST.tCdf(Math.abs(r.t), r.df)), rej = Math.abs(r.t) > crit;
      o.innerHTML = `<div class="out">${steps}<br>df = ${r.df}; table t<sub>${al}</sub> (two-tailed) = <b>${f(crit, 3)}</b>; p-value = ${f(pv, 4)}<br>Decision: |t| = ${f(Math.abs(r.t), 3)} ${rej ? "&gt;" : "&lt;"} ${f(crit, 3)} → ${rej ? '<span class="no">reject H₀ — the difference is significant.</span>' : '<span class="ok">accept H₀ — the difference is not significant.</span>'}</div>`;
    }
    K.qa(host, "input,select").forEach(i => i.addEventListener("input", go)); go();
  };

  D.anova = function (host) {
    host.innerHTML = `<p class="hint">One group per line (values separated by commas).</p><textarea id="t" rows="4" style="width:100%">6, 7, 3, 8
5, 5, 3, 7
5, 4, 3, 4</textarea><div class="demo-row"><label>α<select id="al"><option>0.05</option><option>0.01</option></select></label></div><div id="o"></div>`;
    function go() {
      const groups = K.q(host, "#t").value.split(/\n+/).map(nums).filter(g => g.length), al = +K.q(host, "#al").value, o = K.q(host, "#o");
      if (groups.length < 2 || groups.some(g => g.length < 2)) { o.innerHTML = `<div class="out no">Enter at least two groups with two or more values each.</div>`; return; }
      const r = ST.anova1(groups), SX2 = [].concat(...groups).reduce((a, x) => a + x * x, 0), crit = ST.fCrit(al, r.df1, r.df2), rej = r.F > crit;
      o.innerHTML = `<div class="out">T = ${r.T}, N = ${r.N}, CF = T²/N = ${f(r.CF)}<br>SST = ΣX² − CF = ${SX2} − ${f(r.CF)} = <b>${f(r.SST)}</b><br>SSC = Σ(Tⱼ²/nⱼ) − CF = ${groups.map(g => `${g.reduce((a, b) => a + b, 0)}²/${g.length}`).join(" + ")} − ${f(r.CF)} = <b>${f(r.SSC)}</b><br>SSE = SST − SSC = <b>${f(r.SSE)}</b></div>` +
        tbl(["Source", "SS", "df", "MS", "F"], [["Between groups", f(r.SSC), r.df1, f(r.MSC), `<b>${f(r.F)}</b>`], ["Within groups (error)", f(r.SSE), r.df2, f(r.MSE), ""], { cls: "total", cells: ["Total", f(r.SST), r.N - 1, "", ""] }]) +
        `<div class="out">F<sub>${al}</sub>(${r.df1}, ${r.df2}) = <b>${f(crit, 3)}</b>; p-value = ${f(1 - ST.fCdf(r.F, r.df1, r.df2), 4)}. ${rej ? '<span class="no">F &gt; table → reject H₀: the group means differ.</span>' : '<span class="ok">F &lt; table → accept H₀: no significant difference among means.</span>'}</div>`;
    }
    K.qa(host, "textarea,select").forEach(i => i.addEventListener("input", go)); go();
  };

  D.chisq = function (host) {
    host.innerHTML = `<p class="hint">Observed frequencies — one row per line.</p><textarea id="t" rows="3" style="width:100%">60, 40
30, 70</textarea><div class="demo-row"><label>α<select id="al"><option>0.05</option><option>0.01</option></select></label></div><div id="o"></div>`;
    function go() {
      const obs = K.q(host, "#t").value.split(/\n+/).map(nums).filter(r => r.length), al = +K.q(host, "#al").value, o = K.q(host, "#o");
      if (obs.length < 2 || obs.some(r => r.length !== obs[0].length) || obs[0].length < 2) { o.innerHTML = `<div class="out no">Enter a rectangular table with at least 2 rows and 2 columns.</div>`; return; }
      const r = ST.chiTable(obs), rows = [];
      obs.forEach((row, i) => row.forEach((O, j) => { const E = r.E[i][j]; rows.push([`(${i + 1}, ${j + 1})`, O, `${r.rowT[i]}×${r.colT[j]}/${r.N} = ${f(E, 2)}`, f(O - E, 2), f((O - E) ** 2, 2), f((O - E) ** 2 / E, 4)]); }));
      rows.push({ cls: "total", cells: ["", "", "", "", "χ² =", `<b>${f(r.chi, 4)}</b>`] });
      const crit = ST.chiCrit(al, r.df), small = r.E.flat().some(e => e < 5);
      o.innerHTML = tbl(["Cell", "O", "E = RT×CT/N", "O − E", "(O − E)²", "(O − E)²/E"], rows) +
        `<div class="out">df = (${obs.length} − 1)(${obs[0].length} − 1) = ${r.df}; χ²<sub>${al}</sub> = <b>${f(crit, 3)}</b>; p-value = ${f(1 - ST.chiCdf(r.chi, r.df), 4)}<br>${r.chi > crit ? '<span class="no">χ² &gt; table → reject H₀: the attributes are associated.</span>' : '<span class="ok">χ² &lt; table → accept H₀: the attributes are independent.</span>'}${small ? '<br><span class="no">Warning: some expected frequencies are below 5 — pool classes or use Yates\' correction.</span>' : ""}</div>`;
    }
    K.qa(host, "textarea,select").forEach(i => i.addEventListener("input", go)); go();
  };

  /* -------------------------------------------------------------- Unit IV */
  const inr = v => "₹" + Math.round(v).toLocaleString("en-IN");

  D.pbiui = function (host) {
    const R = {
      ribbon: ["Ribbon", "Tabs: File, Home, Insert, Modeling, View, Optimize, Help. <b>Home</b> holds Get data, Transform data (opens Power Query), Refresh, New visual and <b>Publish</b>. <b>Insert</b> adds visuals, buttons, text boxes, shapes and images. <b>Modeling</b> creates measures, columns, tables and relationships. <b>View</b> has themes and panes such as Bookmarks, Selection, Sync slicers and Performance analyzer."],
      views: ["View switcher (left bar)", "<b>Report view</b> — design pages of visuals. <b>Table view</b> (formerly Data view) — see loaded rows, change formats and data types. <b>Model view</b> — tables and relationships (star schema). Newer versions add <b>DAX query view</b>."],
      canvas: ["Report canvas", "The page area where you place, resize and arrange visuals. Click empty space before choosing a new visual type."],
      pages: ["Page tabs", "Add (+), rename, duplicate, hide or reorder report pages. Drill-through and tooltip pages also appear here."],
      filters: ["Filters pane", "Filters on this visual, on this page, and on all pages (report level). Supports basic, advanced, Top N and relative-date filters. Authors can lock or hide filters."],
      viz: ["Visualizations pane", "Choose the visual type. Three tabs: <b>Build</b> (field wells such as X-axis, Y-axis, Legend, Values, Tooltips and Drill through), <b>Format</b> (paintbrush: colours, titles, labels, background), <b>Analytics</b> (constant, average, trend and forecast lines)."],
      data: ["Data pane (formerly Fields)", "Lists every table with its columns and measures. Tick a field or drag it to a field well. Σ = numeric column (auto-summarised); calculator icon = DAX measure; calendar = date hierarchy."]
    };
    host.innerHTML = `<div id="g"></div><div class="out" id="o">Click a region of the window.</div>`;
    const s = K.svg(760, 440);
    const box = (k, x, y, w, h, label, cls) => {
      const g = K.s(s, "g", {}); g.style.cursor = "pointer"; g.dataset.k = k;
      K.s(g, "rect", { x, y, width: w, height: h, rx: 6, "class": cls || "dg-box" });
      const t = K.s(g, "text", { x: x + w / 2, y: y + h / 2 + 4, "text-anchor": "middle", "class": "dg-tb" }, label); void t;
      g.addEventListener("click", () => { K.qa(s, "g rect").forEach(r => r.style.strokeWidth = ""); g.querySelector("rect").style.strokeWidth = "3.5"; K.q(host, "#o").innerHTML = `<b>${R[k][0]}</b><br>${R[k][1]}`; });
      return g;
    };
    K.s(s, "rect", { x: 2, y: 2, width: 756, height: 436, rx: 10, "class": "dg-plain" });
    K.s(s, "text", { x: 14, y: 20, "class": "dg-ts" }, "Sales Report.pbix — Power BI Desktop");
    box("ribbon", 8, 28, 744, 58, "Ribbon  ·  File  Home  Insert  Modeling  View  Optimize  Help", "dg-acc");
    box("views", 8, 92, 40, 300, "", "dg-warn");
    ["Report", "Table", "Model"].forEach((v, i) => K.s(s, "text", { x: 28, y: 140 + i * 70, "text-anchor": "middle", "class": "dg-ts", transform: `rotate(-90 28 ${140 + i * 70})` }, v));
    box("canvas", 54, 92, 430, 300, "Report canvas", "dg-box");
    const v1 = K.s(s, "rect", { x: 70, y: 110, width: 190, height: 110, rx: 4, "class": "dg-good" }); v1.style.pointerEvents = "none";
    const v2 = K.s(s, "rect", { x: 275, y: 110, width: 190, height: 110, rx: 4, "class": "dg-good" }); v2.style.pointerEvents = "none";
    box("pages", 54, 398, 430, 34, "Page tabs:  Overview | Details | +", "dg-found");
    box("filters", 490, 92, 70, 340, "Filters", "dg-oos");
    box("viz", 566, 92, 92, 340, "Visual-", "dg-acc");
    K.s(s, "text", { x: 612, y: 280, "text-anchor": "middle", "class": "dg-tb" }, "izations").style.pointerEvents = "none";
    box("data", 664, 92, 88, 340, "Data", "dg-good");
    K.q(host, "#g").appendChild(s);
  };

  D.pq = function (host) {
    const SRC = {
      cols: [["Order ID", "text"], ["Order Date", "text"], ["Region", "text"], ["Product", "text"], ["Units", "text"], ["Unit Price", "text"], ["Notes", "text"]],
      rows: [["1001", "05-01-2024", " north ", "Laptop", "2", "55000", ""], ["1002", "07-01-2024", "South", "Mouse", "10", "450", "promo"], ["1003", "07-01-2024", "south ", "Keyboard", "5", "1200", ""],
        ["1002", "07-01-2024", "South", "Mouse", "10", "450", "promo"], ["", "", "", "", "", "", ""], ["1004", "12-01-2024", "EAST", "Monitor", "3", "9500", ""],
        ["1005", "15-01-2024", "West", "Laptop", "1", "56000", "urgent"], ["1006", "18-01-2024", "north", "Mouse", "", "450", ""], ["1007", "20-01-2024", "East", "Printer", "2", "12000", ""]]
    };
    const ERR = { err: true };
    let steps = [], view = -1;
    const isEmpty = v => v === null || v === "";
    const ops = {
      remove: (st, a) => { const i = st.cols.findIndex(c => c[0] === a.col); return { cols: st.cols.filter((_, j) => j !== i), rows: st.rows.map(r => r.filter((_, j) => j !== i)) }; },
      rename: (st, a) => ({ cols: st.cols.map(c => c[0] === a.col ? [a.to, c[1]] : c), rows: st.rows }),
      distinct: st => { const seen = new Set(); return { cols: st.cols, rows: st.rows.filter(r => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; }) }; },
      blank: st => ({ cols: st.cols, rows: st.rows.filter(r => !r.every(isEmpty)) }),
      trim: (st, a) => { const i = st.cols.findIndex(c => c[0] === a.col); return { cols: st.cols, rows: st.rows.map(r => r.map((v, j) => j === i && typeof v === "string" ? v.trim().toLowerCase().replace(/\b\w/g, m => m.toUpperCase()) : v)) }; },
      type: (st, a) => {
        const i = st.cols.findIndex(c => c[0] === a.col);
        const conv = v => {
          if (v && v.err) return v; if (isEmpty(v)) return null;
          if (a.t === "text") return String(v);
          if (a.t === "int" || a.t === "dec") { const n = Number(v); if (isNaN(n)) return ERR; return a.t === "int" ? Math.round(n) : n; }
          if (a.t === "date") { const m = String(v).match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/); if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ERR; }
        };
        return { cols: st.cols.map((c, j) => j === i ? [c[0], a.t] : c), rows: st.rows.map(r => r.map((v, j) => j === i ? conv(v) : v)) };
      },
      replace: (st, a) => { const i = st.cols.findIndex(c => c[0] === a.col); const find = a.find === "null" ? null : a.find; const num = ["int", "dec"].includes(st.cols[i][1]); const rep = a.rep === "null" ? null : num && !isNaN(+a.rep) ? +a.rep : a.rep; return { cols: st.cols, rows: st.rows.map(r => r.map((v, j) => j === i && (v === find || (v !== null && String(v) === String(find))) ? rep : v)) }; },
      filter: (st, a) => { const i = st.cols.findIndex(c => c[0] === a.col); const num = ["int", "dec"].includes(st.cols[i][1]); return { cols: st.cols, rows: st.rows.filter(r => { const v = r[i]; if (v && v.err) return false; const x = num ? +a.val : a.val; if (a.op === "=") return String(v) === String(a.val); if (a.op === "≠") return String(v) !== String(a.val); if (v === null) return false; return a.op === ">" ? v > x : v < x; }) }; },
      custom: (st, a) => { const i = st.cols.findIndex(c => c[0] === a.c1), j = st.cols.findIndex(c => c[0] === a.c2); const numT = t => ["int", "dec"].includes(t); return { cols: st.cols.concat([[a.name, numT(st.cols[i][1]) && numT(st.cols[j][1]) ? "dec" : "any"]]), rows: st.rows.map(r => { const x = r[i], y = r[j]; let v; if (x === null || y === null) v = null; else if (typeof x !== "number" || typeof y !== "number") v = ERR; else v = x * y; return r.concat([v]); }) }; }
    };
    function stateAt(k) { let st = { cols: SRC.cols.map(c => c.slice()), rows: SRC.rows.map(r => r.slice()) }; for (let i = 0; i <= k; i++) st = ops[steps[i].op](st, steps[i].a); return st; }
    const ICON = { text: "ABC", int: "123", dec: "1.2", date: "📅", any: "ABC123" };
    host.innerHTML = `<div class="two-col" style="grid-template-columns:1fr 220px;align-items:start"><div>
      <div class="demo-row"><label>Column<select id="col"></select></label>
        <button class="btn ghost" data-op="remove">Remove column</button><button class="btn ghost" data-op="trim">Trim + Capitalize</button>
        <label>Change type<select id="ty"><option value="">—</option><option value="int">Whole number</option><option value="dec">Decimal number</option><option value="date">Date</option><option value="text">Text</option></select></label></div>
      <div class="demo-row"><button class="btn ghost" data-op="distinct">Remove duplicates</button><button class="btn ghost" data-op="blank">Remove blank rows</button>
        <label>Rename to<input type="text" id="nn" size="10"></label><button class="btn ghost" data-op="rename">Rename</button></div>
      <div class="demo-row"><label>Replace<input type="text" id="rf" size="6" value="null"></label><label>with<input type="text" id="rt" size="6" value="0"></label><button class="btn ghost" data-op="replace">Replace values</button>
        <label>Filter<select id="fo"><option>=</option><option>≠</option><option>&gt;</option><option>&lt;</option></select></label><input type="text" id="fv" size="8" placeholder="value"><button class="btn ghost" data-op="filter">Filter rows</button></div>
      <div class="demo-row"><button class="btn ghost" data-op="custom">Add custom column: Revenue = [Units] × [Unit Price]</button></div>
      <div class="out mono" id="fx" style="font-size:.78rem"></div><div id="tb"></div><div class="hint" id="msg"></div></div>
      <div><b>Query Settings</b><div class="hint">APPLIED STEPS (click to view)</div><div id="st"></div><button class="btn ghost" id="del" style="margin-top:8px">✕ Delete last step</button></div></div>`;
    function names() { return stateAt(steps.length - 1).cols.map(c => c[0]); }
    function stepName(op, a) { return { remove: `Removed Columns (${a.col})`, rename: `Renamed Columns (${a.col} → ${a.to})`, distinct: "Removed Duplicates", blank: "Removed Blank Rows", trim: `Trimmed & Capitalized (${a.col})`, type: `Changed Type (${a.col})`, replace: `Replaced Value (${a.col})`, filter: `Filtered Rows (${a.col} ${a.op} ${a.val})`, custom: "Added Custom (Revenue)" }[op]; }
    function mCode(op, a, prev) {
      const P = `#"${prev}"`, T = { int: "Int64.Type", dec: "type number", date: "type date", text: "type text" };
      return { remove: `Table.RemoveColumns(${P}, {"${a.col}"})`, rename: `Table.RenameColumns(${P}, {{"${a.col}", "${a.to}"}})`, distinct: `Table.Distinct(${P})`, blank: `Table.SelectRows(${P}, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))`, trim: `Table.TransformColumns(${P}, {{"${a.col}", each Text.Proper(Text.Trim(_)), type text}})`, type: `Table.TransformColumnTypes(${P}, {{"${a.col}", ${T[a.t]}}})`, replace: `Table.ReplaceValue(${P}, ${a.find === "null" ? "null" : `"${a.find}"`}, ${a.rep === "null" ? "null" : isNaN(+a.rep) ? `"${a.rep}"` : a.rep}, Replacer.ReplaceValue, {"${a.col}"})`, filter: `Table.SelectRows(${P}, each [${a.col}] ${a.op === "≠" ? "<>" : a.op} ${isNaN(+a.val) ? `"${a.val}"` : a.val})`, custom: `Table.AddColumn(${P}, "Revenue", each [Units] * [Unit Price])` }[op];
    }
    function add(op, a) { if (op === "custom" && !(names().includes("Units") && names().includes("Unit Price"))) { K.q(host, "#msg").innerHTML = '<span class="no">Needs columns named "Units" and "Unit Price".</span>'; return; } steps.push({ op, a, name: stepName(op, a) }); view = steps.length - 1; render(); }
    function cell(v) { if (v === null) return '<i style="color:var(--ink-3)">null</i>'; if (v && v.err) return '<span class="no">Error</span>'; if (v === "") return ""; return K.esc(typeof v === "number" ? K.num(v, 2) : v); }
    function render() {
      const st = stateAt(view), cs = K.q(host, "#col"), keep = cs.value;
      const nm = stateAt(steps.length - 1).cols.map(c => c[0]); cs.innerHTML = nm.map(n => `<option${n === keep ? " selected" : ""}>${K.esc(n)}</option>`).join("");
      const qual = st.cols.map((_, i) => { const n = st.rows.length || 1, e = st.rows.filter(r => r[i] && r[i].err).length, em = st.rows.filter(r => isEmpty(r[i])).length; return `<span style="color:var(--good)">${Math.round(100 * (n - e - em) / n)}%</span> · <span style="color:var(--bad)">${Math.round(100 * e / n)}%</span> · ${Math.round(100 * em / n)}%`; });
      K.q(host, "#tb").innerHTML = `<div class="tbl-wrap"><table class="compact"><tr>${st.cols.map(c => `<th><span style="color:var(--acc);font-family:var(--mono);font-size:.72rem">${ICON[c[1]]}</span> ${K.esc(c[0])}</th>`).join("")}</tr><tr>${qual.map(q => `<td style="font-size:.68rem">${q}</td>`).join("")}</tr>${st.rows.map(r => `<tr>${r.map(v => `<td>${cell(v)}</td>`).join("")}</tr>`).join("")}</table></div>`;
      K.q(host, "#msg").innerHTML = `${st.rows.length} rows, ${st.cols.length} columns. Quality row: <span style="color:var(--good)">valid</span> · <span style="color:var(--bad)">error</span> · empty. ${view < steps.length - 1 ? "<b>Viewing an earlier step.</b>" : ""}`;
      const all = [{ name: "Source" }].concat(steps);
      K.q(host, "#st").innerHTML = all.map((s, i) => `<div class="cell ${i - 1 === view ? "hl" : ""}" data-i="${i - 1}" style="justify-content:start;height:auto;padding:5px 8px;margin:3px 0;cursor:pointer;font-family:var(--sans);font-size:.78rem">${i ? "⚙ " : ""}${K.esc(s.name)}</div>`).join("");
      K.qa(host, "#st .cell").forEach(c => c.addEventListener("click", () => { view = +c.dataset.i; render(); }));
      K.q(host, "#fx").textContent = view < 0 ? `= Csv.Document(File.Contents("C:\\Data\\sales.csv"), [Delimiter=","])` : "= " + mCode(steps[view].op, steps[view].a, view ? steps[view - 1].name : "Source");
    }
    K.qa(host, "[data-op]").forEach(b => b.addEventListener("click", () => {
      const col = K.q(host, "#col").value, op = b.dataset.op;
      if (op === "rename") { const to = K.q(host, "#nn").value.trim(); if (!to) return; add(op, { col, to }); }
      else if (op === "replace") add(op, { col, find: K.q(host, "#rf").value, rep: K.q(host, "#rt").value });
      else if (op === "filter") { const val = K.q(host, "#fv").value.trim(); if (!val) return; add(op, { col, op: K.q(host, "#fo").value, val }); }
      else if (op === "custom") add(op, { c1: "Units", c2: "Unit Price", name: "Revenue" });
      else add(op, { col });
    }));
    K.q(host, "#ty").addEventListener("change", e => { if (!e.target.value) return; add("type", { col: K.q(host, "#col").value, t: e.target.value }); e.target.value = ""; });
    K.q(host, "#del").addEventListener("click", () => { steps.pop(); view = steps.length - 1; render(); });
    render();
    K.q(host, "#msg").insertAdjacentHTML("afterend", `<p class="hint">Suggested sequence: Remove blank rows → Remove duplicates → Trim + Capitalize "Region" → change "Order Date" to Date, "Units" and "Unit Price" to Whole number → Replace null with 0 in Units → Remove "Notes" → Add custom column. Try adding the custom column <i>before</i> changing types to see why types matter.</p>`);
  };

  D.merge = function (host) {
    const orders = [[1, "C1", 500], [2, "C2", 300], [3, "C1", 200], [4, "C9", 150]];
    const custs = [["C1", "Asha", "Pune"], ["C2", "Ravi", "Delhi"], ["C3", "Meena", "Chennai"]];
    const kinds = ["Left outer", "Right outer", "Full outer", "Inner", "Left anti", "Right anti"];
    host.innerHTML = `<div class="two-col"><div><b>Orders</b> (first table)${tbl(["OrderID", "CustID", "Amount"], orders)}</div><div><b>Customers</b> (second table)${tbl(["ID", "Name", "City"], custs)}</div></div>
      <div class="demo-row"><label>Join kind<select id="k">${kinds.map(k => `<option>${k}</option>`).join("")}</select></label><span id="venn"></span></div><div id="o"></div>`;
    function venn(k) {
      const L = /Left outer|Full|Left anti/.test(k), Rr = /Right outer|Full|Right anti/.test(k), M = /outer|Inner/.test(k);
      const s = K.svg(130, 60);
      const c1 = K.s(s, "circle", { cx: 48, cy: 30, r: 24 }), c2 = K.s(s, "circle", { cx: 82, cy: 30, r: 24 });
      c1.style.fill = L ? "var(--acc)" : "transparent"; c2.style.fill = Rr ? "var(--acc)" : "transparent";
      [c1, c2].forEach(c => { c.style.stroke = "var(--ink-2)"; c.style.fillOpacity = ".45"; });
      const lens = K.s(s, "path", { d: "M65 12 A24 24 0 0 1 65 48 A24 24 0 0 1 65 12 Z" }); lens.style.fill = M ? "var(--acc)" : "var(--card)"; lens.style.fillOpacity = M ? ".9" : "1"; lens.style.stroke = "var(--ink-2)";
      return s;
    }
    function go() {
      const k = K.q(host, "#k").value, rows = [];
      const cmap = {}; custs.forEach(c => cmap[c[0]] = c);
      if (k !== "Right anti" && k !== "Right outer") orders.forEach(o => { const c = cmap[o[1]]; if (k === "Left anti") { if (!c) rows.push([...o, "null", "null"]); } else if (c || k !== "Inner") rows.push([...o, c ? c[1] : "null", c ? c[2] : "null"]); });
      if (k === "Right outer") custs.forEach(c => { const os = orders.filter(o => o[1] === c[0]); if (os.length) os.forEach(o => rows.push([...o, c[1], c[2]])); else rows.push(["null", "null", "null", c[1], c[2]]); });
      if (k === "Full outer") custs.forEach(c => { if (!orders.some(o => o[1] === c[0])) rows.push(["null", "null", "null", c[1], c[2]]); });
      if (k === "Right anti") custs.forEach(c => { if (!orders.some(o => o[1] === c[0])) rows.push(["null", "null", "null", c[1], c[2]]); });
      const v = K.q(host, "#venn"); v.innerHTML = ""; v.appendChild(venn(k));
      const expl = { "Left outer": "All 4 orders; order 4 (C9) has no matching customer → null.", "Right outer": "All 3 customers; Meena (C3) has no orders → nulls on the order side.", "Full outer": "Everything from both tables.", "Inner": "Only orders whose customer exists (orders 1–3).", "Left anti": "Orders with no matching customer — data-quality check (C9 is unknown).", "Right anti": "Customers who never ordered — a marketing list!" };
      K.q(host, "#o").innerHTML = `<b>Result: Orders ⋈ Customers (${k})</b> — after expanding Name and City` + tbl(["OrderID", "CustID", "Amount", "Name", "City"], rows.map(r => r.map(x => x === "null" ? '<i style="color:var(--ink-3)">null</i>' : x))) + `<div class="out">${expl[k]}</div>`;
    }
    K.q(host, "#k").addEventListener("change", go); go();
  };

  D.append = function (host) {
    host.innerHTML = `<div class="demo-row"><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="bad"> February file uses "Amt" instead of "Amount"</label></div><div class="two-col" id="src"></div><div id="o"></div>`;
    function go() {
      const bad = K.q(host, "#bad").checked;
      const jan = { cols: ["Date", "Product", "Amount"], rows: [["03-Jan", "Pen", 120], ["11-Jan", "Book", 450], ["25-Jan", "Bag", 900]] };
      const feb = { cols: ["Date", "Product", bad ? "Amt" : "Amount", "Discount"], rows: [["02-Feb", "Pen", 150, 10], ["19-Feb", "Lamp", 700, 50]] };
      K.q(host, "#src").innerHTML = `<div><b>Sales_Jan</b>${tbl(jan.cols, jan.rows)}</div><div><b>Sales_Feb</b>${tbl(feb.cols, feb.rows)}</div>`;
      const cols = [...new Set(jan.cols.concat(feb.cols))];
      const rows = [jan, feb].flatMap(t => t.rows.map(r => cols.map(c => { const i = t.cols.indexOf(c); return i < 0 ? '<i style="color:var(--ink-3)">null</i>' : r[i]; })));
      K.q(host, "#o").innerHTML = `<b>Appended result (Home → Append Queries as New)</b>` + tbl(cols, rows) + `<div class="out">${bad ? '<span class="no">Column names differ, so "Amount" and "Amt" became two half-empty columns. Fix: rename "Amt" to "Amount" in the Feb query before appending.</span>' : "Rows are stacked; columns are matched by name. Jan has no Discount column, so those cells are null."}</div>`;
    }
    K.q(host, "#bad").addEventListener("change", go); go();
  };

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], REGIONS = ["North", "South", "East", "West"];
  const SALES = REGIONS.map((r, i) => MONTHS.map((m, j) => Math.round(120 + 40 * i + 18 * j + 25 * Math.sin(i * 2 + j))));

  D.visuals = function (host) {
    const kinds = ["Clustered column", "Stacked column", "Line", "Pie", "Donut", "Card", "Gauge", "Table", "Matrix"];
    host.innerHTML = `<div class="demo-row"><label>Visual type<select id="k">${kinds.map(k => `<option>${k}</option>`).join("")}</select></label><span class="hint" id="h"></span></div><div id="g"></div>`;
    const tips = { "Clustered column": "Compare regions side by side for each month.", "Stacked column": "Show monthly totals and each region's contribution.", "Line": "Trends over time — best for months.", "Pie": "Share of total by region (few categories only).", "Donut": "Same as pie with space for a label in the middle.", "Card": "One headline number.", "Gauge": "Progress towards a target.", "Table": "Exact values.", "Matrix": "Pivot: regions × quarters with totals." };
    function go() {
      const k = K.q(host, "#k").value, g = K.q(host, "#g"); g.innerHTML = ""; K.q(host, "#h").textContent = tips[k];
      const totR = SALES.map(r => r.reduce((a, b) => a + b, 0)), total = totR.reduce((a, b) => a + b, 0);
      if (k === "Clustered column" || k === "Stacked column") {
        const W = 620, H = 260, pad = 44, s = K.svg(W, H), max = k === "Stacked column" ? K.niceMax(Math.max(...MONTHS.map((_, j) => SALES.reduce((a, r) => a + r[j], 0)))) : K.niceMax(Math.max(...SALES.flat()));
        const gw = (W - pad - 10) / MONTHS.length;
        for (let t = 0; t <= 4; t++) { const y = H - 30 - (H - 50) * t / 4; K.s(s, "line", { x1: pad, x2: W - 10, y1: y, y2: y, "class": "gridl" }); K.s(s, "text", { x: pad - 6, y: y + 4, "text-anchor": "end" }, K.short(max * t / 4)); }
        MONTHS.forEach((m, j) => {
          let acc = 0;
          REGIONS.forEach((r, i) => {
            const v = SALES[i][j], h = (H - 50) * v / max;
            const x = k === "Stacked column" ? pad + j * gw + gw * 0.2 : pad + j * gw + gw * 0.1 + i * gw * 0.2;
            const w = k === "Stacked column" ? gw * 0.6 : gw * 0.18, y = H - 30 - h - (k === "Stacked column" ? (H - 50) * acc / max : 0);
            const rc = K.s(s, "rect", { x, y, width: w, height: h, rx: 2 }); rc.style.fill = K.PALETTE[i]; K.s(rc, "title", {}, `${r}, ${m}: ${v}`);
            acc += v;
          });
          K.s(s, "text", { x: pad + j * gw + gw / 2, y: H - 12, "text-anchor": "middle" }, m);
        });
        g.appendChild(s); g.insertAdjacentHTML("beforeend", K.legend(REGIONS));
      } else if (k === "Line") { g.appendChild(K.lineChart({ labels: MONTHS, series: REGIONS.map((r, i) => ({ values: SALES[i], name: r })), h: 260, yMin: 0 })); g.insertAdjacentHTML("beforeend", K.legend(REGIONS)); }
      else if (k === "Pie" || k === "Donut") { const s = K.pieChart({ labels: REGIONS, values: totR, donut: k === "Donut", size: 240 }); s.style.maxWidth = "260px"; s.style.margin = "auto"; g.appendChild(s); g.insertAdjacentHTML("beforeend", K.legend(REGIONS)); }
      else if (k === "Card") g.innerHTML = `<div class="kpis" style="max-width:520px"><div class="kpi"><div class="k">Total sales (₹ '000)</div><div class="v">${total.toLocaleString("en-IN")}</div></div><div class="kpi"><div class="k">Best region</div><div class="v">${REGIONS[totR.indexOf(Math.max(...totR))]}</div></div><div class="kpi"><div class="k">Avg / month</div><div class="v">${Math.round(total / 6)}</div></div></div>`;
      else if (k === "Gauge") {
        const target = 5000, s = K.svg(320, 190), cx = 160, cy = 160, r = 120, frac = Math.min(1, total / target);
        const arc = (a0, a1, cls) => { const p = a => [cx + r * Math.cos(Math.PI * (1 - a)), cy - r * Math.sin(Math.PI * (1 - a))]; const [x0, y0] = p(a0), [x1, y1] = p(a1); const e = K.s(s, "path", { d: `M${x0},${y0} A${r},${r} 0 0,1 ${x1},${y1}` }); e.style.fill = "none"; e.style.strokeWidth = "26"; e.style.stroke = cls; };
        arc(0, 1, "var(--line)"); arc(0, frac, "var(--acc)");
        K.s(s, "text", { x: cx, y: cy - 20, "text-anchor": "middle" }, total.toLocaleString("en-IN")).style.fontSize = "26px";
        K.s(s, "text", { x: cx - r, y: cy + 22, "text-anchor": "middle" }, "0"); K.s(s, "text", { x: cx + r, y: cy + 22, "text-anchor": "middle" }, `${target} (target)`);
        s.style.maxWidth = "360px"; g.appendChild(s); g.insertAdjacentHTML("beforeend", `<p class="hint">${Math.round(100 * frac)}% of the target achieved.</p>`);
      } else if (k === "Table") g.innerHTML = tbl(["Region", "Total sales", "Avg / month", "Best month"], REGIONS.map((r, i) => [r, totR[i], Math.round(totR[i] / 6), MONTHS[SALES[i].indexOf(Math.max(...SALES[i]))]]).concat([{ cls: "total", cells: ["Total", total, Math.round(total / 6), ""] }]));
      else { const q = r => [r.slice(0, 3), r.slice(3)].map(a => a.reduce((x, y) => x + y, 0)); g.innerHTML = tbl(["Region", "Q1", "Q2", "Total"], REGIONS.map((r, i) => [r, ...q(SALES[i]), totR[i]]).concat([{ cls: "total", cells: ["Total", q(MONTHS.map((_, j) => SALES.reduce((a, rr) => a + rr[j], 0)))[0], q(MONTHS.map((_, j) => SALES.reduce((a, rr) => a + rr[j], 0)))[1], total] }])); }
    }
    K.q(host, "#k").addEventListener("change", go); go();
  };

  D.dashboard = function (host) {
    const CATS = ["Electronics", "Furniture", "Clothing"];
    const data = [];
    REGIONS.forEach((r, i) => MONTHS.forEach((m, j) => CATS.forEach((c, k) => {
      const sales = Math.round((60 + 25 * k + 12 * i + 9 * j + 20 * Math.abs(Math.sin(i + 2 * j + 3 * k))) * (k === 0 ? 1.8 : 1)) * 1000;
      data.push({ region: r, month: m, cat: c, sales, profit: Math.round(sales * (0.08 + 0.05 * k + 0.02 * Math.cos(i + j))) });
    })));
    let st = { regions: new Set(REGIONS), cat: "All", cross: null, page: "main", detail: null };
    let marks = [];
    host.innerHTML = `<div id="dash"></div>`;
    const filt = (ignoreCross) => data.filter(d => st.regions.has(d.region) && (st.cat === "All" || d.cat === st.cat) && (ignoreCross || !st.cross || d.cat === st.cross));
    const sum = (a, k) => a.reduce((x, d) => x + d[k], 0);
    function render() {
      const el = K.q(host, "#dash");
      if (st.page === "detail") {
        const rows = data.filter(d => d.cat === st.detail && st.regions.has(d.region));
        el.innerHTML = `<div class="demo-row"><button class="btn ghost" id="back">← Back</button><b>Drill-through page: ${st.detail} details</b> <span class="hint">(filtered to ${st.detail}${st.regions.size < 4 ? ", regions: " + [...st.regions].join(", ") : ""})</span></div>
          <div class="kpis"><div class="kpi"><div class="k">${st.detail} sales</div><div class="v">${inr(sum(rows, "sales"))}</div></div><div class="kpi"><div class="k">Profit</div><div class="v">${inr(sum(rows, "profit"))}</div></div><div class="kpi"><div class="k">Margin</div><div class="v">${K.num(100 * sum(rows, "profit") / sum(rows, "sales"), 1)}%</div></div></div>
          ${tbl(["Region", ...MONTHS, "Total"], [...st.regions].map(r => { const v = MONTHS.map(m => sum(rows.filter(d => d.region === r && d.month === m), "sales") / 1000); return [r, ...v.map(x => K.num(x, 0)), `<b>${K.num(v.reduce((a, b) => a + b, 0), 0)}</b>`]; }))}<p class="hint">Values in ₹ thousand. Power BI adds the Back button automatically on drill-through pages.</p>`;
        K.q(el, "#back").addEventListener("click", () => { st.page = "main"; render(); });
        return;
      }
      const f = filt(false), fNoCross = filt(true);
      el.innerHTML = `
        <div class="demo-row" style="align-items:center"><b style="font-size:.8rem">Region slicer (tiles, multi-select):</b>${REGIONS.map(r => `<button class="btn ${st.regions.has(r) ? "" : "ghost"}" data-r="${r}">${r}</button>`).join("")}
          <label>Category slicer<select id="cs"><option>All</option>${CATS.map(c => `<option${st.cat === c ? " selected" : ""}>${c}</option>`).join("")}</select></label></div>
        <div class="kpis"><div class="kpi"><div class="k">Total sales</div><div class="v">${inr(sum(f, "sales"))}</div></div><div class="kpi"><div class="k">Profit</div><div class="v">${inr(sum(f, "profit"))}</div></div><div class="kpi"><div class="k">Margin</div><div class="v">${K.num(100 * sum(f, "profit") / Math.max(1, sum(f, "sales")), 1)}%</div></div><div class="kpi"><div class="k">Filter context</div><div class="v" style="font-size:.85rem">${st.cross ? "Cross-filter: " + st.cross : "none"}</div></div></div>
        <div class="two-col"><div><b style="font-size:.85rem">Sales by category</b> <span class="hint">click = cross-filter · right-click = drill through</span><div id="cat"></div></div><div><b style="font-size:.85rem">Sales trend by month</b><div id="trend"></div></div></div>
        <div class="demo-row" style="align-items:center"><b style="font-size:.8rem">Bookmarks:</b><input type="text" id="bn" placeholder="bookmark name" size="14"><button class="btn ghost" id="addb">＋ Add bookmark</button><span id="bl"></span><button class="btn ghost" id="reset">Reset all filters</button></div>`;
      const catVals = CATS.map(c => sum(fNoCross.filter(d => d.cat === c), "sales") / 1000);
      const cs = K.barChart({ labels: CATS, values: catVals, h: 210, fmt: v => K.num(v, 0) + "k", active: i => !st.cross || CATS[i] === st.cross, onClick: i => { st.cross = st.cross === CATS[i] ? null : CATS[i]; render(); } });
      K.qa(cs, "rect.bar").forEach((r, i) => {
        const rows = fNoCross.filter(d => d.cat === CATS[i]);
        r.querySelector("title").textContent = `${CATS[i]}\nSales: ${inr(sum(rows, "sales"))}\nProfit: ${inr(sum(rows, "profit"))}\nMargin: ${K.num(100 * sum(rows, "profit") / Math.max(1, sum(rows, "sales")), 1)}%`;
        r.addEventListener("contextmenu", e => { e.preventDefault(); st.page = "detail"; st.detail = CATS[i]; render(); });
      });
      K.q(el, "#cat").appendChild(cs);
      K.q(el, "#trend").appendChild(K.lineChart({ labels: MONTHS, series: [{ values: MONTHS.map(m => sum(f.filter(d => d.month === m), "sales") / 1000), name: "Sales (₹k)" }], h: 210, yMin: 0 }));
      K.q(el, "#bl").innerHTML = marks.map((b, i) => `<button class="btn ghost" data-b="${i}">🔖 ${K.esc(b.name)}</button>`).join(" ");
      K.qa(el, "[data-r]").forEach(b => b.addEventListener("click", () => { const r = b.dataset.r; if (st.regions.has(r)) { if (st.regions.size > 1) st.regions.delete(r); } else st.regions.add(r); render(); }));
      K.q(el, "#cs").addEventListener("change", e => { st.cat = e.target.value; st.cross = null; render(); });
      K.q(el, "#addb").addEventListener("click", () => { const n = K.q(el, "#bn").value.trim() || `View ${marks.length + 1}`; marks.push({ name: n, regions: [...st.regions], cat: st.cat, cross: st.cross }); render(); });
      K.qa(el, "[data-b]").forEach(b => b.addEventListener("click", () => { const m = marks[+b.dataset.b]; st.regions = new Set(m.regions); st.cat = m.cat; st.cross = m.cross; render(); }));
      K.q(el, "#reset").addEventListener("click", () => { st.regions = new Set(REGIONS); st.cat = "All"; st.cross = null; render(); });
    }
    render();
    host.insertAdjacentHTML("beforeend", `<p class="hint">Try it: select only South and West, click "Electronics" to cross-filter the trend, hover a bar for its tooltip, save a bookmark, reset, then click the bookmark to restore the view. Right-click a category bar to drill through to its detail page.</p>`);
  };
})();
