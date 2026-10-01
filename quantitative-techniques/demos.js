/* ==========================================================================
   Quantitative Techniques — interactive demos
   ========================================================================== */
(function () {
  "use strict";
  const D = window.DEMOS;
  const f = (x, d) => K.num(x, d === undefined ? 2 : d);
  const tbl = (head, rows, cls) =>
    `<div class="tbl-wrap"><table class="num ${cls || ""}"><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ""}>${(r.cells || r).map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
  const ok = b => b ? '<span class="ok">✓ divisible</span>' : '<span class="no">✗ not divisible</span>';

  /* --------------------------------------------------------------- Unit I */
  D.divcheck = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Number<input type="text" id="n" value="918082" size="16"></label></div><div id="o"></div>`;
    function go() {
      const s = K.q(host, "#n").value.replace(/\D/g, ""); if (!s) return;
      const n = BigInt(s), d = [...s].map(Number), sum = d.reduce((a, b) => a + b, 0), last = d[d.length - 1];
      const l2 = Number(s.slice(-2)), l3 = Number(s.slice(-3));
      let odd = 0, even = 0; [...s].reverse().forEach((c, i) => { if (i % 2 === 0) odd += +c; else even += +c; });
      let x = s, seven = []; while (x.length > 2) { const r = BigInt(x.slice(0, -1)) - 2n * BigInt(x.slice(-1)); seven.push(`${x.slice(0, -1)} − 2×${x.slice(-1)} = ${r}`); x = (r < 0n ? -r : r).toString(); }
      const by = k => n % BigInt(k) === 0n;
      const rows = [
        [2, `last digit ${last} is ${last % 2 ? "odd" : "even"}`, ok(by(2))],
        [3, `digit sum ${sum}`, ok(by(3))],
        [4, `last two digits ${l2}`, ok(by(4))],
        [5, `last digit ${last}`, ok(by(5))],
        [6, "divisible by 2 and 3?", ok(by(6))],
        [7, seven.join("; ") || `${s} (small — divide directly)`, ok(by(7))],
        [8, `last three digits ${l3}`, ok(by(8))],
        [9, `digit sum ${sum}`, ok(by(9))],
        [10, `last digit ${last}`, ok(by(10))],
        [11, `odd places (from right) ${odd} − even places ${even} = ${odd - even}`, ok(by(11))],
        [12, "divisible by 3 and 4?", ok(by(12))],
        [25, `last two digits ${l2}`, ok(by(25))]
      ];
      K.q(host, "#o").innerHTML = tbl(["Divisor", "Rule applied", "Result"], rows);
    }
    K.q(host, "#n").addEventListener("input", go); go();
  };

  D.hcflcm = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Numbers (comma separated)<input type="text" id="n" value="36, 84" class="wide"></label></div><div id="o"></div>`;
    function go() {
      const ns = K.parseList(K.q(host, "#n").value).filter(x => x > 0 && Number.isInteger(x) && x < 1e9);
      if (ns.length < 2) return;
      const facs = ns.map(n => K.factorize(n)), primes = [...new Set(facs.flat().map(x => x[0]))].sort((a, b) => a - b);
      const pw = (fa, p) => (fa.find(x => x[0] === p) || [p, 0])[1];
      let hcf = 1, lcm = 1; const hp = [], lp = [];
      primes.forEach(p => { const mn = Math.min(...facs.map(fa => pw(fa, p))), mx = Math.max(...facs.map(fa => pw(fa, p))); if (mn) { hcf *= p ** mn; hp.push(p + (mn > 1 ? `<sup>${mn}</sup>` : "")); } lcm *= p ** mx; lp.push(p + (mx > 1 ? `<sup>${mx}</sup>` : "")); });
      // Euclid on first two
      let a = Math.max(ns[0], ns[1]), b = Math.min(ns[0], ns[1]); const steps = [];
      while (b) { steps.push(`${a} = ${Math.floor(a / b)} × ${b} + ${a % b}`); [a, b] = [b, a % b]; }
      K.q(host, "#o").innerHTML = `<div class="out">${ns.map((n, i) => `${n} = ${K.factStr(facs[i])}`).join("<br>")}</div>
        <div class="out" style="margin-top:8px"><b>HCF</b> = common primes, lowest powers = ${hp.join(" × ") || "1"} = <b class="big-out">${hcf}</b><br><b>LCM</b> = all primes, highest powers = ${lp.join(" × ")} = <b class="big-out">${lcm}</b></div>
        <div class="out" style="margin-top:8px"><b>Division (Euclid) method</b> for ${ns[0]} and ${ns[1]}:<br>${steps.join("<br>")}<br>Last divisor = HCF = ${a}${ns.length === 2 ? `<br>Check: HCF × LCM = ${hcf} × ${lcm} = ${hcf * lcm}; product = ${ns[0] * ns[1]} ${hcf * lcm === ns[0] * ns[1] ? "✓" : ""}` : ""}</div>`;
    }
    K.q(host, "#n").addEventListener("input", go); go();
  };

  D.cycles = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Base a<input type="number" id="a" value="7"></label><label>Power n<input type="number" id="n" value="95"></label><label>Divisor m<input type="number" id="m" value="10"></label></div><div id="o"></div>`;
    function go() {
      const a = +K.q(host, "#a").value, n = +K.q(host, "#n").value, m = Math.max(2, +K.q(host, "#m").value);
      if (!(n >= 1)) return;
      const seq = []; let v = K.mod(a, m), seen = {}, start = -1;
      for (let i = 1; i <= 60; i++) { if (seen[v] !== undefined) { start = seen[v]; break; } seen[v] = i; seq.push(v); v = K.mod(v * a, m); }
      const cyc = start > 0 ? seq.slice(start - 1) : seq, pre = start > 0 ? start - 1 : 0, L = cyc.length;
      const idx = n <= pre ? n - 1 : pre + K.mod(n - 1 - pre, L);
      const ans = K.bpow(BigInt(a), BigInt(n), BigInt(m));
      K.q(host, "#o").innerHTML = `<div class="cells" style="grid-template-columns:repeat(${Math.min(seq.length, 12)}, 1fr);max-width:600px">${seq.slice(0, 12).map((x, i) => `<div class="cell ${i === idx ? "hl" : i >= pre ? "hl3" : ""}" title="${a}^${i + 1} mod ${m}">${x}</div>`).join("")}</div>
        <div class="out">Remainders of ${a}¹, ${a}², ${a}³, … when divided by ${m}: ${seq.slice(0, 12).join(", ")}${seq.length > 12 ? ", …" : ""}<br>Cycle length = <b>${L}</b>${pre ? ` (after ${pre} initial term${pre > 1 ? "s" : ""})` : ""}. For n = ${n}: position ${n <= pre ? n : `(${n} − ${pre} − 1) mod ${L} + 1 = ${K.mod(n - 1 - pre, L) + 1} in the cycle`} → <b class="big-out">${ans}</b>${m === 10 ? " (the unit digit)" : ""}</div>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.succpct = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Start value<input type="number" id="s" value="1000"></label><label class="grow">Successive changes in % (e.g. 10, -20, 5)<input type="text" id="c" value="10, 20" class="wide"></label></div><div id="o"></div>`;
    function go() {
      const s = +K.q(host, "#s").value, cs = K.parseList(K.q(host, "#c").value).filter(x => !isNaN(x));
      let v = s, net = 0; const rows = [["Start", "", f(v)]];
      cs.forEach((c, i) => { const nv = v * (1 + c / 100); rows.push([`Change ${i + 1}`, `${c > 0 ? "+" : ""}${c}% of ${f(v)} = ${f(nv - v)}`, f(nv)]); v = nv; net = net + c + net * c / 100; });
      K.q(host, "#o").innerHTML = tbl(["Step", "Change", "Value"], rows) + `<div class="out">Net change = <b>${f(net, 3)}%</b>${cs.length === 2 ? ` = ${cs[0]} + (${cs[1]}) + (${cs[0]})(${cs[1]})/100` : " (apply a + b + ab/100 repeatedly)"} — not the simple sum ${cs.reduce((a, b) => a + b, 0)}%.</div>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.profitcalc = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Cost price (CP)<input type="number" id="cp" value="640"></label><label>Mark-up % on CP<input type="number" id="mu" value="25"></label><label>Discount % on MP<input type="number" id="d" value="20"></label></div><div id="o"></div>`;
    function go() {
      const cp = +K.q(host, "#cp").value, mu = +K.q(host, "#mu").value, d = +K.q(host, "#d").value;
      const mp = cp * (1 + mu / 100), sp = mp * (1 - d / 100), pr = sp - cp, pp = 100 * pr / cp;
      K.q(host, "#o").innerHTML = `<div class="kpis"><div class="kpi"><div class="k">Marked price</div><div class="v">₹${f(mp)}</div></div><div class="kpi"><div class="k">Discount</div><div class="v">₹${f(mp - sp)}</div></div><div class="kpi"><div class="k">Selling price</div><div class="v">₹${f(sp)}</div></div><div class="kpi"><div class="k">${pr >= 0 ? "Profit" : "Loss"}</div><div class="v" style="color:${pr >= 0 ? "var(--good)" : "var(--bad)"}">₹${f(Math.abs(pr))} (${f(Math.abs(pp))}%)</div></div></div>
        <div class="out">MP = CP × (100 + ${mu})/100 = ${f(mp)}; SP = MP × (100 − ${d})/100 = ${f(sp)}.<br>Shortcut: net % = ${mu} − ${d} − ${mu}×${d}/100 = <b>${f(mu - d - mu * d / 100)}%</b> ${pr >= 0 ? "profit" : "loss"} (successive-change formula with +${mu} and −${d}).</div>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.train = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Train length (m)<input type="number" id="L" value="150"></label><label>Platform length (m, 0 = pole)<input type="number" id="P" value="300"></label><label>Speed (km/h)<input type="number" id="v" value="54"></label><button class="btn" id="go">▶ Run</button></div><div id="g"></div><div class="out" id="o"></div>`;
    let raf = null;
    function setup(run) {
      const L = Math.max(10, +K.q(host, "#L").value), P = Math.max(0, +K.q(host, "#P").value), v = Math.max(1, +K.q(host, "#v").value), ms = v * 5 / 18, total = L + P, T = total / ms;
      const W = 680, H = 130, scale = (W - 40) / (L * 2 + P + 40), s = K.svg(W, H);
      const px0 = 20 + L * scale;                       // platform start x
      K.s(s, "line", { x1: 0, x2: W, y1: 92, y2: 92, "class": "axis" });
      const plat = K.s(s, "rect", { x: px0, y: 92, width: Math.max(4, P * scale), height: 12 }); plat.style.fill = "var(--warn)";
      K.s(s, "text", { x: px0 + Math.max(4, P * scale) / 2, y: 122, "text-anchor": "middle" }, P ? `platform ${P} m` : "pole");
      const train = K.s(s, "rect", { x: 20, y: 62, width: L * scale, height: 26, rx: 6 }); train.style.fill = "var(--acc)";
      const lab = K.s(s, "text", { x: 20 + 6, y: 80 }, `${L} m`); lab.style.fill = "#fff"; lab.style.fontWeight = "700";
      const clock = K.s(s, "text", { x: W - 10, y: 22, "text-anchor": "end" }, "t = 0.0 s"); clock.style.fontSize = "15px";
      const g = K.q(host, "#g"); g.innerHTML = ""; g.appendChild(s);
      K.q(host, "#o").innerHTML = `Speed = ${v} × 5/18 = <b>${f(ms)} m/s</b>. Distance to cover = train + ${P ? "platform" : "pole (0)"} = ${L} + ${P} = <b>${total} m</b>. Time = ${total} ÷ ${f(ms)} = <b>${f(T)} s</b>. The crossing starts when the engine reaches the ${P ? "platform" : "pole"} and ends when the last coach leaves it.`;
      if (!run) return;
      const start = performance.now(), dur = Math.min(6000, Math.max(2500, T * 200));
      cancelAnimationFrame(raf);
      const step = now => {
        const k = Math.min(1, (now - start) / dur), front = px0 + k * total * scale; // engine x
        train.setAttribute("x", front - L * scale); lab.setAttribute("x", front - L * scale + 6);
        clock.textContent = `t = ${(k * T).toFixed(1)} s`;
        if (k < 1) raf = requestAnimationFrame(step);
      };
      train.setAttribute("x", px0 - L * scale);
      raf = requestAnimationFrame(step);
    }
    K.q(host, "#go").addEventListener("click", () => setup(true));
    K.qa(host, "input").forEach(i => i.addEventListener("input", () => setup(false)));
    setup(false);
  };

  D.tank = function (host) {
    host.innerHTML = `<p class="hint">Enter the time each pipe alone takes to fill (or, for outlets, to empty) the full tank. Tick a pipe to open it.</p>
      <div class="demo-row"><label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="ca" checked> Inlet A fills in</label><input type="number" id="a" value="20"> min
      <label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="cb" checked> Inlet B fills in</label><input type="number" id="b" value="30"> min
      <label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="cc" checked> Outlet C empties in</label><input type="number" id="c" value="15"> min</div>
      <div class="demo-row"><button class="btn" id="go">▶ Simulate</button></div><div class="two-col" style="grid-template-columns:200px 1fr;align-items:center"><div id="g"></div><div class="out" id="o"></div></div>`;
    let raf = null;
    function calc() {
      const r = (id, ch) => K.q(host, "#" + ch).checked ? 1 / Math.max(0.01, +K.q(host, "#" + id).value) : 0;
      const ra = r("a", "ca"), rb = r("b", "cb"), rc = r("c", "cc");
      return { ra, rb, rc, net: ra + rb - rc };
    }
    function draw(level, t) {
      const s = K.svg(180, 220);
      const box = K.s(s, "rect", { x: 30, y: 20, width: 120, height: 180, rx: 6 }); box.style.fill = "none"; box.style.stroke = "var(--ink-2)"; box.style.strokeWidth = "2";
      const w = K.s(s, "rect", { x: 32, y: 198 - 176 * level, width: 116, height: 176 * level }); w.style.fill = "var(--acc)"; w.style.opacity = ".6";
      K.s(s, "text", { x: 90, y: 14, "text-anchor": "middle" }, `${Math.round(100 * level)}% full · t = ${t.toFixed(1)} min`);
      const g = K.q(host, "#g"); g.innerHTML = ""; g.appendChild(s);
    }
    function explain() {
      const c = calc(), ids = ["a", "b", "c"].map(x => +K.q(host, "#" + x).value);
      const lcm = ids.filter((_, i) => K.q(host, "#c" + "abc"[i]).checked).reduce((x, y) => x * y / K.gcd(x, y), 1);
      const units = ["a", "b", "c"].map((x, i) => K.q(host, "#c" + x).checked ? lcm / ids[i] * (i === 2 ? -1 : 1) : 0);
      const net = units.reduce((a, b) => a + b, 0);
      K.q(host, "#o").innerHTML = `Total tank = LCM = <b>${lcm} units</b>.<br>A: ${units[0]}/min, B: ${units[1]}/min, C: ${units[2]}/min → net <b>${net}/min</b>.<br>${net > 0 ? `Time to fill = ${lcm} ÷ ${net} = <b>${f(lcm / net)} min</b>.` : net === 0 ? "Net rate 0 → the level never changes." : `Net rate is negative → a full tank empties in ${f(lcm / -net)} min; it can never fill.`}`;
      return c;
    }
    function run() {
      const c = explain(); cancelAnimationFrame(raf);
      if (c.net <= 0) { draw(0, 0); return; }
      const T = 1 / c.net, start = performance.now(), dur = 4000;
      const step = now => { const k = Math.min(1, (now - start) / dur); draw(k, k * T); if (k < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    }
    K.q(host, "#go").addEventListener("click", run);
    K.qa(host, "input").forEach(i => i.addEventListener("input", () => { explain(); draw(0, 0); }));
    explain(); draw(0, 0);
  };

  D.quadratic = function (host) {
    host.innerHTML = `<div class="demo-row"><label>a<input type="number" id="a" value="6"></label><label>b<input type="number" id="b" value="-7"></label><label>c<input type="number" id="c" value="-3"></label></div><div class="two-col" style="align-items:start"><div class="out" id="o"></div><div id="g"></div></div>`;
    function go() {
      const a = +K.q(host, "#a").value, b = +K.q(host, "#b").value, c = +K.q(host, "#c").value, o = K.q(host, "#o");
      if (!a) { o.innerHTML = "a must not be 0 (otherwise the equation is linear)."; return; }
      const Dd = b * b - 4 * a * c;
      let h = `<b>${a}x² ${b >= 0 ? "+" : "−"} ${Math.abs(b)}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)} = 0</b><br>D = b² − 4ac = ${b * b} − (${4 * a * c}) = <b>${Dd}</b> → `;
      if (Dd < 0) h += "D &lt; 0: <b>no real roots</b> (the parabola does not cut the x-axis).";
      else {
        const r1 = (-b + Math.sqrt(Dd)) / (2 * a), r2 = (-b - Math.sqrt(Dd)) / (2 * a);
        h += Dd === 0 ? "D = 0: two equal roots." : (Number.isInteger(Math.sqrt(Dd)) ? "perfect square → rational roots." : "not a perfect square → irrational roots.");
        h += `<br>x = (−b ± √D)/2a = (${-b} ± ${f(Math.sqrt(Dd), 4)})/${2 * a} → <b>x = ${f(r1, 4)}, ${f(r2, 4)}</b>`;
        // splitting the middle term
        const ac = a * c; let pair = null;
        if (Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c) && Math.abs(ac) <= 100000) for (let p = -Math.abs(ac) - 1; p <= Math.abs(ac) + 1; p++) { if (p !== 0 && ac % p === 0 && p + ac / p === b) { pair = [p, ac / p]; break; } if (p === 0 && ac === 0 && b === 0) { pair = [0, 0]; break; } }
        if (pair) h += `<br><br><b>Splitting the middle term:</b> a·c = ${ac}; two numbers with product ${ac} and sum ${b}: <b>${pair[0]}</b> and <b>${pair[1]}</b> → ${a}x² ${pair[0] >= 0 ? "+" : "−"} ${Math.abs(pair[0])}x ${pair[1] >= 0 ? "+" : "−"} ${Math.abs(pair[1])}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)} = 0, then group in pairs.`;
      }
      h += `<br><br>Sum of roots = −b/a = ${f(-b / a, 4)}; product = c/a = ${f(c / a, 4)}`;
      o.innerHTML = h;
      const xv = -b / (2 * a), span = Math.max(4, Dd >= 0 ? Math.abs(Math.sqrt(Dd) / a) * 1.5 : 4), x0 = xv - span, x1 = xv + span;
      const ys = []; for (let i = 0; i <= 100; i++) { const x = x0 + (x1 - x0) * i / 100; ys.push([x, a * x * x + b * x + c]); }
      const ymin = Math.min(...ys.map(p => p[1]), 0), ymax = Math.max(...ys.map(p => p[1]), 0);
      const W = 320, H = 240, X = x => 10 + (x - x0) / (x1 - x0) * (W - 20), Y = y => H - 10 - (y - ymin) / ((ymax - ymin) || 1) * (H - 20);
      const s = K.svg(W, H);
      K.s(s, "line", { x1: 0, x2: W, y1: Y(0), y2: Y(0), "class": "axis" });
      if (x0 < 0 && x1 > 0) K.s(s, "line", { x1: X(0), x2: X(0), y1: 0, y2: H, "class": "axis" });
      K.s(s, "path", { d: ys.map((p, i) => (i ? "L" : "M") + X(p[0]) + "," + Y(p[1])).join(" "), "class": "ln" });
      if (Dd >= 0) [(-b + Math.sqrt(Dd)) / (2 * a), (-b - Math.sqrt(Dd)) / (2 * a)].forEach(r => { const cc = K.s(s, "circle", { cx: X(r), cy: Y(0), r: 5 }); cc.style.fill = "var(--bad)"; K.s(s, "text", { x: X(r), y: Y(0) - 8, "text-anchor": "middle" }, f(r, 2)); });
      const g = K.q(host, "#g"); g.innerHTML = ""; g.appendChild(s);
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  /* -------------------------------------------------------------- Unit II */
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[R(0, a.length - 1)];

  D.digen = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Chart type<select id="t"><option value="bar">Bar chart</option><option value="pie">Pie chart</option><option value="line">Line graph</option><option value="table">Table</option></select></label><button class="btn" id="go">New data set</button></div><div id="g"></div><div id="q"></div>`;
    function go() {
      const t = K.q(host, "#t").value, g = K.q(host, "#g"), q = K.q(host, "#q"); g.innerHTML = "";
      const yrs = ["2019", "2020", "2021", "2022", "2023", "2024"];
      let qs = [];
      if (t === "bar" || t === "line") {
        const a = yrs.map(() => R(4, 20) * 5), b = yrs.map(() => R(4, 20) * 5);
        if (t === "bar") { g.appendChild(K.barChart({ labels: yrs, values: a, h: 230, fmt: v => K.num(v, 0) })); g.insertAdjacentHTML("beforeend", `<p class="hint" style="text-align:center">Sales of a company (₹ crore)</p>`); }
        else { g.appendChild(K.lineChart({ labels: yrs, series: [{ values: a, name: "Company X" }, { values: b, name: "Company Y" }], h: 230, yMin: 0 })); g.insertAdjacentHTML("beforeend", K.legend(["Company X", "Company Y"]) + `<p class="hint">Profit (₹ lakh). Hover the points for values.</p>`); }
        const i = R(1, 5), sum = a.reduce((x, y) => x + y, 0), avg = sum / 6;
        const growth = a.map((v, k) => k ? (v - a[k - 1]) / a[k - 1] * 100 : null), best = growth.indexOf(Math.max(...growth.slice(1)));
        qs = [[`% change from ${yrs[i - 1]} to ${yrs[i]} ${t === "line" ? "for X" : ""}?`, `(${a[i]} − ${a[i - 1]})/${a[i - 1]} × 100 = <b>${f(growth[i])}%</b>`],
          [`Average ${t === "line" ? "profit of X" : "sales"} over the six years?`, `${sum}/6 = <b>${f(avg)}</b>`],
          [`How many years were above the average?`, `<b>${a.filter(v => v > avg).length}</b> (${yrs.filter((_, k) => a[k] > avg).join(", ")})`],
          [`Which year showed the highest % growth over the previous year?`, `<b>${yrs[best]}</b> (${f(growth[best])}%)`]];
        if (t === "line") { const d = a.map((v, k) => Math.abs(v - b[k])), mx = d.indexOf(Math.max(...d)); qs.push([`In which year was the difference between X and Y the greatest?`, `<b>${yrs[mx]}</b> (difference ${d[mx]})`], [`In how many years did Y earn more than X?`, `<b>${a.filter((v, k) => b[k] > v).length}</b>`]); }
      } else if (t === "pie") {
        const cats = ["Food", "Rent", "Education", "Transport", "Savings", "Others"]; let p = cats.map(() => R(2, 12)); const s = p.reduce((x, y) => x + y, 0); p = p.map(v => Math.round(v / s * 100)); p[0] += 100 - p.reduce((x, y) => x + y, 0);
        const tot = R(4, 12) * 10000;
        const sv = K.pieChart({ labels: cats, values: p, size: 220 }); sv.style.maxWidth = "240px"; sv.style.margin = "auto"; g.appendChild(sv);
        g.insertAdjacentHTML("beforeend", K.legend(cats.map((c, i) => `${c} ${p[i]}%`)) + `<p class="hint">Monthly expenditure, total ₹${tot.toLocaleString("en-IN")}</p>`);
        const i = R(0, 5), j = (i + R(1, 5)) % 6;
        qs = [[`Central angle of ${cats[i]}?`, `${p[i]} × 3.6 = <b>${f(p[i] * 3.6, 1)}°</b>`], [`Amount spent on ${cats[j]}?`, `${p[j]}% of ${tot} = <b>₹${f(p[j] * tot / 100)}</b>`], [`${cats[i]} is what % of ${cats[j]}?`, `${p[i]}/${p[j]} × 100 = <b>${f(100 * p[i] / p[j])}%</b>`], [`Difference between ${cats[i]} and ${cats[j]} in ₹?`, `${Math.abs(p[i] - p[j])}% of ${tot} = <b>₹${f(Math.abs(p[i] - p[j]) * tot / 100)}</b>`]];
      } else {
        const prods = ["A", "B", "C", "D"], y4 = yrs.slice(2), data = prods.map(() => y4.map(() => R(5, 30) * 5));
        const tots = y4.map((_, k) => data.reduce((s, r) => s + r[k], 0));
        g.innerHTML = tbl(["Product", ...y4], prods.map((p, i) => [p, ...data[i]]).concat([{ cls: "total", cells: ["Total", ...tots] }]));
        const i = R(0, 3), first = data[i][0], last = data[i][3], ptot = data[i].reduce((x, y) => x + y, 0);
        const gr = data.map(r => (r[3] - r[0]) / r[0] * 100), bi = gr.indexOf(Math.max(...gr));
        qs = [[`% increase in ${prods[i]} from ${y4[0]} to ${y4[3]}?`, `(${last} − ${first})/${first} × 100 = <b>${f((last - first) / first * 100)}%</b>`], [`Average production of ${prods[i]}?`, `${ptot}/4 = <b>${f(ptot / 4)}</b>`], [`${prods[i]}'s share of ${y4[3]} total?`, `${last}/${tots[3]} × 100 = <b>${f(100 * last / tots[3])}%</b>`], [`Which product grew most (%) from ${y4[0]} to ${y4[3]}?`, `<b>${prods[bi]}</b> (${f(gr[bi])}%)`]];
      }
      q.innerHTML = `<ol class="qlist">${qs.map(x => `<li>${x[0]}<details class="ans"><summary>Show answer</summary><div>${x[1]}</div></details></li>`).join("")}</ol>`;
    }
    K.q(host, "#go").addEventListener("click", go); K.q(host, "#t").addEventListener("change", go); go();
  };

  D.pnc = function (host) {
    host.innerHTML = `<div class="demo-row"><label>n<input type="number" id="n" value="6" min="0" max="170"></label><label>r<input type="number" id="r" value="3" min="0"></label></div><div class="out" id="o1"></div>
      <div class="demo-row" style="margin-top:8px"><label class="grow">Word to arrange<input type="text" id="w" value="LEADER" class="wide"></label></div><div class="out" id="o2"></div>
      <details class="more"><summary>List the selections/arrangements (small n only)</summary><div id="ls"></div></details>`;
    const fact = n => { let x = 1n; for (let i = 2n; i <= BigInt(n); i++) x *= i; return x; };
    function go() {
      const n = Math.max(0, Math.min(170, +K.q(host, "#n").value || 0)), r = Math.max(0, +K.q(host, "#r").value || 0);
      if (r > n) { K.q(host, "#o1").innerHTML = "r cannot exceed n."; }
      else {
        const P = fact(n) / fact(n - r), C = P / fact(r);
        K.q(host, "#o1").innerHTML = `n! = ${n}! = ${fact(n).toLocaleString("en-IN")}<br><b>ⁿPᵣ</b> = n!/(n − r)! = ${n}!/${n - r}! = ${[...Array(r).keys()].map(i => n - i).join(" × ") || "1"} = <b>${P.toLocaleString("en-IN")}</b> (arrangements — order matters)<br><b>ⁿCᵣ</b> = ⁿPᵣ/r! = ${P.toLocaleString("en-IN")}/${fact(r)} = <b>${C.toLocaleString("en-IN")}</b> (selections — order doesn't matter)<br>With repetition allowed: nʳ = ${(BigInt(n) ** BigInt(r)).toLocaleString("en-IN")} · Circular arrangements of n: (n − 1)! = ${n ? fact(n - 1).toLocaleString("en-IN") : 0}`;
        const items = "ABCDEFGH".slice(0, n);
        if (n <= 6 && r <= 4) {
          const sel = [], arr = [];
          const comb = (s, start, cur) => { if (cur.length === r) { sel.push(cur); return; } for (let i = start; i < s.length; i++) comb(s, i + 1, cur + s[i]); };
          const perm = (s, cur) => { if (cur.length === r) { arr.push(cur); return; } for (const c of s) if (!cur.includes(c)) perm(s, cur + c); };
          comb(items, 0, ""); perm(items, "");
          K.q(host, "#ls").innerHTML = `<p><b>Combinations of {${[...items].join(", ")}} taken ${r} (${sel.length}):</b> ${sel.join(", ")}</p><p><b>Permutations (${arr.length}):</b> ${arr.join(", ")}</p><p class="hint">Each combination appears r! = ${Number(fact(r))} times among the permutations.</p>`;
        } else K.q(host, "#ls").innerHTML = `<p class="hint">Choose n ≤ 6 and r ≤ 4 to see the full list.</p>`;
      }
      const w = K.q(host, "#w").value.toUpperCase().replace(/[^A-Z]/g, "");
      if (w) {
        const cnt = {}; for (const c of w) cnt[c] = (cnt[c] || 0) + 1;
        const reps = Object.entries(cnt).filter(x => x[1] > 1);
        let den = 1n; reps.forEach(x => den *= fact(x[1]));
        const vow = [...w].filter(c => "AEIOU".includes(c)), con = [...w].filter(c => !"AEIOU".includes(c));
        const vc = {}, cc = {}; vow.forEach(c => vc[c] = (vc[c] || 0) + 1); con.forEach(c => cc[c] = (cc[c] || 0) + 1);
        const dv = Object.values(vc).reduce((a, m) => a * fact(m), 1n), dc = Object.values(cc).reduce((a, m) => a * fact(m), 1n);
        const together = vow.length ? fact(con.length + 1) / dc * (fact(vow.length) / dv) : 0n;
        K.q(host, "#o2").innerHTML = `"${w}" has ${w.length} letters${reps.length ? `; repeated: ${reps.map(x => `${x[0]}×${x[1]}`).join(", ")}` : " (all different)"}.<br>Arrangements = ${w.length}!${reps.length ? "/(" + reps.map(x => x[1] + "!").join(" ") + ")" : ""} = <b>${(fact(w.length) / den).toLocaleString("en-IN")}</b>${vow.length ? `<br>With all vowels (${vow.join("")}) together: treat them as one block → (${con.length} + 1)!${dc > 1n ? "/" + dc : ""} × ${vow.length}!${dv > 1n ? "/" + dv : ""} = <b>${together.toLocaleString("en-IN")}</b>` : ""}`;
      }
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.dicegrid = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Event<select id="e"><option value="sum">Sum equals</option><option value="ge">Sum at least</option><option value="dbl">Doublet (same number)</option><option value="one6">At least one 6</option><option value="prod">Product is even</option></select></label><label>k<input type="number" id="k" value="9" min="2" max="12"></label></div><div class="two-col" style="align-items:center"><div id="g"></div><div class="out" id="o"></div></div>`;
    function go() {
      const e = K.q(host, "#e").value, k = +K.q(host, "#k").value;
      const test = (a, b) => e === "sum" ? a + b === k : e === "ge" ? a + b >= k : e === "dbl" ? a === b : e === "one6" ? a === 6 || b === 6 : (a * b) % 2 === 0;
      let h = `<div class="cells" style="grid-template-columns:repeat(7,40px)"><div class="cell head"></div>${[1, 2, 3, 4, 5, 6].map(i => `<div class="cell head">${i}</div>`).join("")}`, n = 0;
      for (let a = 1; a <= 6; a++) { h += `<div class="cell head">${a}</div>`; for (let b = 1; b <= 6; b++) { const t = test(a, b); if (t) n++; h += `<div class="cell ${t ? "hl" : ""}" style="font-size:.7rem">${a},${b}</div>`; } }
      K.q(host, "#g").innerHTML = h + "</div>";
      const g = K.gcd(n, 36);
      K.q(host, "#o").innerHTML = `Favourable outcomes = <b>${n}</b> (highlighted) out of 36.<br>P = ${n}/36 = <b>${n / g}/${36 / g}</b> ≈ ${f(n / 36, 4)}<br><span class="hint">Rows = first die, columns = second die.</span>`;
    }
    K.qa(host, "input,select").forEach(i => i.addEventListener("input", go)); go();
  };

  D.logcalc = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Base a<input type="number" id="a" value="2"></label><label>Number N<input type="number" id="n" value="32"></label></div><div class="out" id="o"></div>
      <div class="demo-row" style="margin-top:8px"><label>Digits in a<sup>b</sup>: a<input type="number" id="x" value="2"></label><label>b<input type="number" id="y" value="50"></label></div><div class="out" id="o2"></div>`;
    function go() {
      const a = +K.q(host, "#a").value, n = +K.q(host, "#n").value;
      if (a <= 0 || a === 1 || n <= 0) K.q(host, "#o").innerHTML = `<span class="no">Need a &gt; 0, a ≠ 1 and N &gt; 0.</span>`;
      else {
        const v = Math.log(n) / Math.log(a), ri = Math.round(v), exact = Math.abs(v - ri) < 1e-9;
        K.q(host, "#o").innerHTML = `log<sub>${a}</sub> ${n} = <b>${exact ? ri : f(v, 6)}</b> because ${a}<sup>${exact ? ri : f(v, 4)}</sup> = ${n}.<br>Change of base: log ${n} / log ${a} = ${f(Math.log10(n), 4)} / ${f(Math.log10(a), 4)} = ${f(v, 4)}<br>Check a law: log(${n} × ${a}) = ${f(Math.log10(n * a), 4)} = log ${n} + log ${a} = ${f(Math.log10(n), 4)} + ${f(Math.log10(a), 4)} ✓`;
      }
      const x = +K.q(host, "#x").value, y = +K.q(host, "#y").value;
      if (x > 0 && y >= 0) { const L = y * Math.log10(x), dig = Math.floor(L) + 1; K.q(host, "#o2").innerHTML = `log(${x}<sup>${y}</sup>) = ${y} × log ${x} = ${y} × ${f(Math.log10(x), 4)} = ${f(L, 4)} → characteristic ${Math.floor(L)} → <b>${dig} digits</b>${dig <= 300 && x === Math.round(x) && y <= 1000 ? ` (check: ${(BigInt(x) ** BigInt(y)).toString().length})` : ""}`; }
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.apgp = function (host) {
    host.innerHTML = `<div class="demo-row"><div class="seg" id="t"><button class="on" data-v="ap">AP</button><button data-v="gp">GP</button></div><label>First term a<input type="number" id="a" value="3"></label><label id="dl">Common difference d<input type="number" id="d" value="4"></label><label>n<input type="number" id="n" value="10" min="1" max="30"></label></div><div id="g"></div><div class="out" id="o"></div>`;
    let t = "ap";
    K.qa(host, "#t button").forEach(b => b.addEventListener("click", () => { t = b.dataset.v; K.qa(host, "#t button").forEach(x => x.classList.toggle("on", x === b)); K.q(host, "#dl").firstChild.textContent = t === "ap" ? "Common difference d" : "Common ratio r"; K.q(host, "#d").value = t === "ap" ? 4 : 2; K.q(host, "#a").value = t === "ap" ? 3 : 2; go(); }));
    function go() {
      const a = +K.q(host, "#a").value, d = +K.q(host, "#d").value, n = Math.max(1, Math.min(30, +K.q(host, "#n").value));
      const terms = [...Array(n).keys()].map(i => t === "ap" ? a + i * d : a * d ** i), S = terms.reduce((x, y) => x + y, 0);
      const g = K.q(host, "#g"); g.innerHTML = ""; g.appendChild(K.barChart({ labels: terms.map((_, i) => "T" + (i + 1)), values: terms.map(Math.abs), h: 200, fmt: v => K.short(v), showValues: n <= 12 }));
      K.q(host, "#o").innerHTML = t === "ap"
        ? `Terms: ${terms.join(", ")}<br>T<sub>n</sub> = a + (n − 1)d = ${a} + ${n - 1} × ${d} = <b>${terms[n - 1]}</b><br>S<sub>n</sub> = n/2 × (first + last) = ${n}/2 × (${a} + ${terms[n - 1]}) = <b>${S}</b><br>The bars grow by the same amount each step (linear growth).`
        : `Terms: ${terms.map(x => K.num(x, 4)).join(", ")}<br>T<sub>n</sub> = arⁿ⁻¹ = ${a} × ${d}<sup>${n - 1}</sup> = <b>${K.num(terms[n - 1], 4)}</b><br>S<sub>n</sub> = a(rⁿ − 1)/(r − 1) = <b>${d === 1 ? a * n : K.num(a * (d ** n - 1) / (d - 1), 4)}</b>${Math.abs(d) < 1 ? `<br>Sum to infinity = a/(1 − r) = <b>${K.num(a / (1 - d), 4)}</b>` : ""}<br>The bars multiply by the same factor each step (exponential growth).`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.shapes = function (host) {
    const S = {
      "Rectangle": [["l", 10], ["b", 6]], "Square": [["a", 8]], "Triangle (3 sides, Heron)": [["a", 13], ["b", 14], ["c", 15]], "Circle": [["r", 7]], "Trapezium": [["a", 10], ["b", 6], ["h", 4]],
      "Cube": [["a", 5]], "Cuboid": [["l", 10], ["b", 8], ["h", 4]], "Cylinder": [["r", 7], ["h", 10]], "Cone": [["r", 3], ["h", 4]], "Sphere": [["r", 21]], "Hemisphere": [["r", 7]]
    };
    host.innerHTML = `<div class="demo-row"><label>Shape<select id="s">${Object.keys(S).map(k => `<option>${k}</option>`).join("")}</select></label><span id="ins" style="display:contents"></span><label>π<select id="pi"><option value="22/7">22/7</option><option value="3.1416">3.1416</option></select></label></div><div class="out" id="o"></div>`;
    function inputs() { const s = K.q(host, "#s").value; K.q(host, "#ins").innerHTML = S[s].map(p => `<label>${p[0]}<input type="number" data-p="${p[0]}" value="${p[1]}"></label>`).join(""); K.qa(host, "#ins input").forEach(i => i.addEventListener("input", go)); go(); }
    function go() {
      const s = K.q(host, "#s").value, v = {}; K.qa(host, "#ins input").forEach(i => v[i.dataset.p] = +i.value);
      const pi = K.q(host, "#pi").value === "22/7" ? 22 / 7 : 3.1416, P = K.q(host, "#pi").value;
      let h = "";
      switch (s) {
        case "Rectangle": h = `Area = l × b = <b>${f(v.l * v.b)}</b><br>Perimeter = 2(l + b) = <b>${f(2 * (v.l + v.b))}</b><br>Diagonal = √(l² + b²) = <b>${f(Math.hypot(v.l, v.b), 3)}</b>`; break;
        case "Square": h = `Area = a² = <b>${f(v.a * v.a)}</b><br>Perimeter = 4a = <b>${f(4 * v.a)}</b><br>Diagonal = a√2 = <b>${f(v.a * Math.SQRT2, 3)}</b>`; break;
        case "Triangle (3 sides, Heron)": { const s2 = (v.a + v.b + v.c) / 2, q = s2 * (s2 - v.a) * (s2 - v.b) * (s2 - v.c); h = q <= 0 ? '<span class="no">These sides do not form a triangle (each side must be less than the sum of the other two).</span>' : `s = (a + b + c)/2 = ${f(s2)}<br>Area = √[s(s − a)(s − b)(s − c)] = √(${f(s2)} × ${f(s2 - v.a)} × ${f(s2 - v.b)} × ${f(s2 - v.c)}) = √${f(q)} = <b>${f(Math.sqrt(q), 3)}</b><br>Perimeter = <b>${f(2 * s2)}</b>`; break; }
        case "Circle": h = `Area = πr² = ${P} × ${v.r}² = <b>${f(pi * v.r * v.r)}</b><br>Circumference = 2πr = <b>${f(2 * pi * v.r)}</b>`; break;
        case "Trapezium": h = `Area = ½(a + b)h = ½ × ${v.a + v.b} × ${v.h} = <b>${f((v.a + v.b) * v.h / 2)}</b>`; break;
        case "Cube": h = `Volume = a³ = <b>${f(v.a ** 3)}</b><br>TSA = 6a² = <b>${f(6 * v.a * v.a)}</b>; lateral = 4a² = ${f(4 * v.a * v.a)}<br>Diagonal = a√3 = ${f(v.a * Math.sqrt(3), 3)}`; break;
        case "Cuboid": h = `Volume = lbh = <b>${f(v.l * v.b * v.h)}</b><br>TSA = 2(lb + bh + hl) = <b>${f(2 * (v.l * v.b + v.b * v.h + v.h * v.l))}</b><br>Four walls = 2(l + b)h = ${f(2 * (v.l + v.b) * v.h)}<br>Diagonal = √(l² + b² + h²) = ${f(Math.sqrt(v.l ** 2 + v.b ** 2 + v.h ** 2), 3)}`; break;
        case "Cylinder": h = `Volume = πr²h = <b>${f(pi * v.r * v.r * v.h)}</b> (= ${f(pi * v.r * v.r * v.h / 1000, 3)} litres if cm)<br>CSA = 2πrh = <b>${f(2 * pi * v.r * v.h)}</b><br>TSA = 2πr(r + h) = <b>${f(2 * pi * v.r * (v.r + v.h))}</b>`; break;
        case "Cone": { const l = Math.hypot(v.r, v.h); h = `Slant height l = √(r² + h²) = ${f(l, 3)}<br>Volume = ⅓πr²h = <b>${f(pi * v.r * v.r * v.h / 3)}</b><br>CSA = πrl = <b>${f(pi * v.r * l)}</b><br>TSA = πr(l + r) = <b>${f(pi * v.r * (l + v.r))}</b>`; break; }
        case "Sphere": h = `Volume = (4/3)πr³ = <b>${f(4 / 3 * pi * v.r ** 3)}</b><br>Surface area = 4πr² = <b>${f(4 * pi * v.r * v.r)}</b>`; break;
        case "Hemisphere": h = `Volume = (2/3)πr³ = <b>${f(2 / 3 * pi * v.r ** 3)}</b><br>CSA = 2πr² = <b>${f(2 * pi * v.r * v.r)}</b><br>TSA = 3πr² = <b>${f(3 * pi * v.r * v.r)}</b>`; break;
      }
      K.q(host, "#o").innerHTML = h;
    }
    K.q(host, "#s").addEventListener("change", inputs); K.q(host, "#pi").addEventListener("change", go); inputs();
  };

  D.approx = function (host) {
    const gens = [
      () => { const a = R(30, 99) * 100 + R(-30, 30), b = R(11, 39) / 10 + (Math.random() < .5 ? 0.02 : -0.02); return [`${a} × ${b.toFixed(2)}`, a * b]; },
      () => { const p = pick([12.5, 25, 33.33, 37.5, 62.5, 16.66, 20, 75]) + pick([-0.04, 0.03, 0.02]), n = R(12, 96) * 25 + R(-3, 3); return [`${p.toFixed(2)}% of ${n}`, p * n / 100]; },
      () => { const s = R(15, 60); const n = s * s + R(-4, 4); return [`√${n}`, Math.sqrt(n)]; },
      () => { const a = R(200, 999), b = R(11, 49); return [`${a} ÷ ${b}`, a / b]; },
      () => { const a = R(1000, 9999), b = R(1000, 9999), c = R(100, 999); return [`${a} + ${b} − ${c}`, a + b - c]; }
    ];
    let t0 = 0, cur = null, score = 0, n = 0, timer = null;
    host.innerHTML = `<div class="demo-row"><button class="btn" id="st">Start / next question</button><span id="tm" style="padding-bottom:8px;font-family:var(--mono)"></span><span id="sc" class="hint" style="padding-bottom:8px"></span></div><div id="q"></div>`;
    function next() {
      const [expr, val] = pick(gens)();
      const opts = [val, val * (1 + pick([0.18, 0.25, 0.35])), val * (1 - pick([0.18, 0.22, 0.3])), val * (1 + pick([0.5, 0.6, -0.45]))].map(x => Math.round(x * 100) / 100).sort(() => Math.random() - .5);
      cur = { expr, val: Math.round(val * 100) / 100, opts };
      K.q(host, "#q").innerHTML = `<div class="out" style="font-size:1.2rem">≈ ? &nbsp; <b>${expr}</b></div><div class="demo-row">${opts.map(o => `<button class="btn ghost" data-v="${o}">${o.toLocaleString("en-IN")}</button>`).join("")}</div><div id="fb"></div>`;
      K.qa(host, "#q [data-v]").forEach(b => b.addEventListener("click", () => {
        if (!cur) return; const ok = +b.dataset.v === cur.val, secs = ((performance.now() - t0) / 1000).toFixed(1); n++; if (ok) score++;
        K.q(host, "#fb").innerHTML = `<div class="out">${ok ? '<span class="ok">Correct</span>' : `<span class="no">The closest is ${cur.val.toLocaleString("en-IN")}</span>`} in ${secs} s. Tip: round the numbers (and use fraction equivalents for %) — the options are far apart, so an estimate is enough.</div>`;
        K.q(host, "#sc").textContent = `Score ${score}/${n}`; cur = null; clearInterval(timer);
      }));
      t0 = performance.now(); clearInterval(timer);
      timer = setInterval(() => { K.q(host, "#tm").textContent = ((performance.now() - t0) / 1000).toFixed(1) + " s"; }, 100);
    }
    K.q(host, "#st").addEventListener("click", next);
  };
})();
