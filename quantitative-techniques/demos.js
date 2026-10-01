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

  /*__UNIT2__*/
})();
