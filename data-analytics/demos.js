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

  /*__UNIT3__*/
})();
