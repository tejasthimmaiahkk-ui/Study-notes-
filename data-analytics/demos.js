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

  /*__UNIT4__*/
})();
