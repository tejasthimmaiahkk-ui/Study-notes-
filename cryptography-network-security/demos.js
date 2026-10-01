/* ==========================================================================
   Cryptography & Network Security — interactive demos
   Every demo receives (host, box). host is an empty .demo-body div.
   ========================================================================== */
(function () {
  "use strict";
  const D = window.DEMOS;
  const esc = K.esc;
  const A2Z = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letters = s => s.toUpperCase().replace(/[^A-Z]/g, "");
  const tbl = (head, rows, cls) =>
    `<div class="tbl-wrap"><table class="num ${cls || ""}"><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ""}>${(r.cells || r).map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
  window.CTbl = tbl;

  /* ---------------------------------------------------------------- Unit I */

  D.bruteforce = function (host) {
    host.innerHTML = `
      <div class="demo-row">
        <label>Cipher preset<select id="p">
          <option value="4.64">Caesar cipher (25 keys)</option>
          <option value="88.4">Monoalphabetic substitution (26! keys)</option>
          <option value="56" selected>DES (56-bit)</option>
          <option value="112">Triple DES, 2-key (112-bit)</option>
          <option value="128">AES-128</option>
          <option value="256">AES-256</option></select></label>
        <label>Key length (bits): <b id="kv"></b><input type="range" id="k" min="4" max="256" step="0.01"></label>
        <label>Attacker speed<select id="r">
          <option value="1e6">10⁶ keys/s (a laptop, slow cipher)</option>
          <option value="1e9">10⁹ keys/s (GPU)</option>
          <option value="1e12" selected>10¹² keys/s (large cluster)</option>
          <option value="1e15">10¹⁵ keys/s (nation-state)</option></select></label>
      </div>
      <div class="out" id="o"></div>`;
    const p = K.q(host, "#p"), k = K.q(host, "#k"), r = K.q(host, "#r"), o = K.q(host, "#o"), kv = K.q(host, "#kv");
    function fmtTime(sec) {
      const units = [["years", 31557600], ["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1]];
      if (sec < 1) return (sec * 1000).toPrecision(3) + " milliseconds";
      for (const [u, s] of units) if (sec >= s) {
        const v = sec / s;
        return (v >= 1e6 ? v.toExponential(2).replace("e+", " × 10^") : v.toLocaleString(undefined, { maximumFractionDigits: 1 })) + " " + u;
      }
    }
    function go() {
      const bits = +k.value, rate = +r.value;
      kv.textContent = (+bits).toFixed(bits % 1 ? 2 : 0);
      const log10keys = bits * Math.log10(2);
      const avgSec = Math.pow(2, bits - 1) / rate;
      const universe = 1.38e10 * 31557600;
      o.innerHTML = `Number of keys = 2<sup>${(+bits).toFixed(bits % 1 ? 2 : 0)}</sup> ≈ 10<sup>${log10keys.toFixed(1)}</sup><br>
        Average time to find the key (half the key space): <b>${fmtTime(avgSec)}</b><br>
        ${avgSec > universe ? `<span class="ok">That is ${(avgSec / universe).toExponential(1).replace("e+", " × 10^")} times the age of the universe → brute force is hopeless.</span>`
          : avgSec > 31557600 * 100 ? `<span class="ok">Longer than a human lifetime — but computers get faster every year.</span>`
            : `<span class="no">Breakable in practice — this key length is not safe.</span>`}`;
    }
    p.addEventListener("change", () => { k.value = p.value; go(); });
    k.addEventListener("input", go); r.addEventListener("change", go);
    k.value = 56; go();
  };

  D.stego = function (host) {
    host.innerHTML = `
      <div class="demo-row"><label class="grow">Secret message (up to 8 characters)<input type="text" id="m" maxlength="8" value="HI" class="wide"></label>
      <button class="btn" id="go">Hide it</button></div>
      <p class="hint">Each square is a pixel's grey value (0–255). The message's bits replace the <b>last bit</b> of each value. Changed pixels are outlined — can you see a colour difference?</p>
      <div class="two-col"><div><b>Cover image (original)</b><div id="a" class="cells" style="grid-template-columns:repeat(8,1fr)"></div></div>
      <div><b>Stego image (with hidden message)</b><div id="b" class="cells" style="grid-template-columns:repeat(8,1fr)"></div></div></div>
      <div class="out mono" id="o"></div>`;
    const seed = [];
    for (let i = 0; i < 64; i++) seed.push(110 + Math.round(60 * Math.sin(i / 5) + 30 * Math.cos(i / 3)));
    const cell = (v, changed) => `<div class="cell" title="${v}" style="background:rgb(${v},${v},${v});color:${v > 128 ? "#000" : "#fff"};font-size:.62rem;${changed ? "outline:2px solid var(--bad);outline-offset:-2px" : ""}">${v}</div>`;
    function go() {
      const msg = K.q(host, "#m").value.slice(0, 8);
      const bits = [...msg].map(c => K.bin(c.charCodeAt(0) & 255, 8)).join("");
      const stego = seed.map((v, i) => i < bits.length ? (v & 254) | +bits[i] : v);
      K.q(host, "#a").innerHTML = seed.map(v => cell(v)).join("");
      K.q(host, "#b").innerHTML = stego.map((v, i) => cell(v, v !== seed[i])).join("");
      let back = "";
      for (let i = 0; i + 8 <= bits.length; i += 8) back += String.fromCharCode(parseInt(stego.slice(i, i + 8).map(v => v & 1).join(""), 2));
      const changed = stego.filter((v, i) => v !== seed[i]).length;
      o.textContent = `Message bits (${bits.length}): ${bits.replace(/(.{8})/g, "$1 ")}\nPixels changed: ${changed} of 64, each by at most 1 out of 255\nReceiver reads the last bit of each pixel → "${back}"`;
    }
    const o = K.q(host, "#o");
    K.q(host, "#go").addEventListener("click", go);
    K.q(host, "#m").addEventListener("input", go);
    go();
  };

  D.euclid = function (host) {
    host.innerHTML = `<div class="demo-row"><label>a<input type="number" id="a" value="2740"></label><label>b<input type="number" id="b" value="1760"></label><button class="btn" id="go">Compute gcd</button></div><div id="o"></div>`;
    function go() {
      let r1 = Math.abs(parseInt(K.q(host, "#a").value)), r2 = Math.abs(parseInt(K.q(host, "#b").value));
      if (isNaN(r1) || isNaN(r2)) return;
      const rows = [];
      let guard = 0;
      while (r2 > 0 && guard++ < 100) {
        const q = Math.floor(r1 / r2), r = r1 - q * r2;
        rows.push([q, r1, r2, r, `${r1} = ${q} × ${r2} + ${r}`]);
        r1 = r2; r2 = r;
      }
      rows.push({ cls: "total", cells: ["", r1, r2, "", `r2 = 0 ⇒ gcd = <b>${r1}</b>`] });
      K.q(host, "#o").innerHTML = tbl(["q", "r1", "r2", "r", "Equation"], rows) +
        `<div class="out">gcd = <b>${r1}</b>${r1 === 1 ? " — the numbers are <b>relatively prime</b>." : ""} (${rows.length - 1} division steps)</div>`;
    }
    K.q(host, "#go").addEventListener("click", go);
    K.qa(host, "input").forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") go(); }));
    go();
  };

  D.egcd = function (host) {
    host.innerHTML = `<div class="demo-row"><label>a<input type="number" id="a" value="161"></label><label>b<input type="number" id="b" value="28"></label>
      <button class="btn" id="go">Run extended Euclid</button></div>
      <p class="hint">Tip: to find <b>x⁻¹ mod n</b>, put a = n and b = x. The inverse is the final t (made positive).</p><div id="o"></div>`;
    function go() {
      const a = parseInt(K.q(host, "#a").value), b = parseInt(K.q(host, "#b").value);
      if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return;
      let r1 = a, r2 = b, s1 = 1, s2 = 0, t1 = 0, t2 = 1;
      const rows = [];
      let guard = 0;
      while (r2 > 0 && guard++ < 100) {
        const q = Math.floor(r1 / r2), r = r1 - q * r2, s = s1 - q * s2, t = t1 - q * t2;
        rows.push([q, r1, r2, r, s1, s2, s, t1, t2, t]);
        r1 = r2; r2 = r; s1 = s2; s2 = s; t1 = t2; t2 = t;
      }
      rows.push({ cls: "total", cells: ["", r1, r2, "", s1, s2, "", t1, t2, ""] });
      let extra = "";
      if (r1 === 1 && a > 1) extra = `<br>Since gcd = 1, <b>${b}⁻¹ mod ${a} = ${t1} mod ${a} = ${K.mod(t1, a)}</b>. Check: ${b} × ${K.mod(t1, a)} = ${b * K.mod(t1, a)} ≡ ${K.mod(b * K.mod(t1, a), a)} (mod ${a}) ✓`;
      else if (a > 1) extra = `<br>gcd ≠ 1, so ${b} has <b>no</b> multiplicative inverse modulo ${a}.`;
      K.q(host, "#o").innerHTML = tbl(["q", "r1", "r2", "r", "s1", "s2", "s", "t1", "t2", "t"], rows) +
        `<div class="out">gcd(${a}, ${b}) = <b>${r1}</b>, s = <b>${s1}</b>, t = <b>${t1}</b>.<br>Check: (${s1})(${a}) + (${t1})(${b}) = ${s1 * a + t1 * b} ✓${extra}</div>`;
    }
    K.q(host, "#go").addEventListener("click", go);
    go();
  };

  D.modclock = function (host) {
    host.innerHTML = `
      <div class="demo-row">
        <label>Modulus n<input type="number" id="n" value="10" min="2" max="36"></label>
        <label>a<input type="number" id="a" value="7"></label>
        <label>Operation<select id="op"><option value="+">a + b</option><option value="-">a − b</option><option value="*" selected>a × b</option><option value="inv">a⁻¹ (multiplicative inverse)</option><option value="neg">−a (additive inverse)</option></select></label>
        <label>b<input type="number" id="b" value="3"></label>
      </div>
      <div class="two-col" style="align-items:center"><div id="clock"></div><div><div class="out" id="o"></div><div class="out" id="inv" style="margin-top:10px"></div></div></div>`;
    const N = K.q(host, "#n"), A = K.q(host, "#a"), B = K.q(host, "#b"), OP = K.q(host, "#op");
    function go() {
      const n = Math.max(2, Math.min(36, parseInt(N.value) || 2)), a = parseInt(A.value) || 0, b = parseInt(B.value) || 0, op = OP.value;
      let res = null, text = "";
      const am = K.mod(a, n), bm = K.mod(b, n);
      if (op === "+") { res = K.mod(a + b, n); text = `(${a} + ${b}) mod ${n} = ${a + b} mod ${n} = <b>${res}</b>`; }
      if (op === "-") { res = K.mod(a - b, n); text = `(${a} − ${b}) mod ${n} = ${a - b} mod ${n} = <b>${res}</b>`; }
      if (op === "*") { res = K.mod(a * b, n); text = `(${a} × ${b}) mod ${n} = ${a * b} mod ${n} = <b>${res}</b>`; }
      if (op === "neg") { res = K.mod(-a, n); text = `Additive inverse of ${am}: ${n} − ${am} = <b>${res}</b>, since ${am} + ${res} = ${am + res} ≡ 0 (mod ${n})`; }
      if (op === "inv") {
        const g = K.gcd(am, n); res = K.modInv(am, n);
        text = res === null ? `gcd(${am}, ${n}) = ${g} ≠ 1 ⇒ <span class="no">${am} has no multiplicative inverse in ℤ<sub>${n}</sub></span>`
          : `gcd(${am}, ${n}) = 1 ⇒ inverse exists: <b>${am}⁻¹ = ${res}</b>, since ${am} × ${res} = ${am * res} ≡ 1 (mod ${n})`;
      }
      K.q(host, "#o").innerHTML = `a mod n = ${a} mod ${n} = ${am}${op === "+" || op === "-" || op === "*" ? `; b mod n = ${bm}` : ""}<br>${text}`;
      // clock
      const S = 260, c = S / 2, R = 104, s = K.svg(S, S, "chart-svg");
      K.s(s, "circle", { cx: c, cy: c, r: R, "class": "gridl", fill: "none" });
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + 2 * Math.PI * i / n, x = c + R * Math.cos(ang), y = c + R * Math.sin(ang);
        const isA = i === am, isR = i === res;
        const circ = K.s(s, "circle", { cx: x, cy: y, r: n > 24 ? 9 : 12 });
        circ.style.fill = isR ? "var(--acc)" : isA ? "var(--warn)" : "var(--card)";
        circ.style.stroke = "var(--ink-3)";
        const t = K.s(s, "text", { x: x, y: y + 4, "text-anchor": "middle" }, i);
        t.style.fill = isR || isA ? "#fff" : "var(--ink)"; t.style.fontWeight = "600";
        if (res !== null && isR) {
          const l = K.s(s, "line", { x1: c, y1: c, x2: c + (R - 16) * Math.cos(ang), y2: c + (R - 16) * Math.sin(ang), "marker-end": "url(#arrA)" });
          l.style.stroke = "var(--acc)"; l.style.strokeWidth = "2.5";
        }
      }
      K.s(s, "text", { x: c, y: c + 4, "text-anchor": "middle" }, "ℤ" + n).style.fontSize = "16px";
      const cl = K.q(host, "#clock"); cl.innerHTML = ""; cl.appendChild(s);
      const leg = document.createElement("div"); leg.className = "legend"; leg.style.justifyContent = "center";
      leg.innerHTML = `<span><i style="background:var(--warn)"></i>a mod n</span><span><i style="background:var(--acc)"></i>result</span>`;
      cl.appendChild(leg);
      // inverse table
      const pairs = [], star = [];
      for (let i = 1; i < n; i++) { const v = K.modInv(i, n); if (v !== null) { star.push(i); if (i <= v) pairs.push(`(${i}, ${v})`); } }
      K.q(host, "#inv").innerHTML = `<b>ℤ<sub>${n}</sub>*</b> = {${star.join(", ")}} — ${star.length} elements have inverses${K.isPrime(n) ? ` (n is prime, so all non-zero elements do)` : ""}<br><b>Inverse pairs:</b> ${pairs.join(" ")}`;
    }
    [N, A, B, OP].forEach(e => e.addEventListener("input", go));
    go();
  };

  D.modpow = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Base a<input type="text" id="a" value="5" size="10"></label><label>Exponent e<input type="text" id="e" value="13" size="10"></label><label>Modulus n<input type="text" id="n" value="23" size="10"></label><button class="btn" id="go">Compute aᵉ mod n</button></div><div id="o"></div>`;
    function go() {
      let a, e, n;
      try { a = BigInt(K.q(host, "#a").value.trim()); e = BigInt(K.q(host, "#e").value.trim()); n = BigInt(K.q(host, "#n").value.trim()); }
      catch (x) { K.q(host, "#o").innerHTML = `<div class="out no">Please enter whole numbers.</div>`; return; }
      if (n < 2n || e < 0n) return;
      const bits = e.toString(2);
      let y = 1n; const base = K.bmod(a, n);
      const rows = [];
      for (const bit of bits) {
        const before = y;
        y = y * y % n;
        const sq = y;
        if (bit === "1") y = y * base % n;
        rows.push([bit, `${before}² mod ${n} = ${sq}`, bit === "1" ? `${sq} × ${base} mod ${n} = <b>${y}</b>` : "—", y]);
      }
      if (rows.length > 64) rows.splice(32, rows.length - 64, ["…", "…", "…", "…"]);
      K.q(host, "#o").innerHTML = `<div class="out">e = ${e} = <span class="mono">${bits.length > 80 ? bits.slice(0, 80) + "…" : bits}</span><sub>2</sub> (${bits.length} bits)</div>` +
        tbl(["bit", "square", "multiply (bit = 1)", "y"], rows) + `<div class="out">${a}<sup>${e}</sup> mod ${n} = <b>${y}</b> &nbsp;(${bits.length} squarings, ${[...bits].filter(b => b === "1").length} multiplications)</div>`;
    }
    K.q(host, "#go").addEventListener("click", go); go();
  };

  D.matinv = function (host) {
    host.innerHTML = `<div class="demo-row">
      <label>a<input type="number" id="a" value="3"></label><label>b<input type="number" id="b" value="3"></label>
      <label>c<input type="number" id="c" value="2"></label><label>d<input type="number" id="d" value="5"></label>
      <label>mod n<input type="number" id="n" value="26"></label><button class="btn" id="go">Find inverse</button></div><div class="out" id="o"></div>`;
    const M = (a, b, c, d) => `<span class="mat c2"><span>${a}</span><span>${b}</span><span>${c}</span><span>${d}</span></span>`;
    function go() {
      const [a, b, c, d, n] = ["a", "b", "c", "d", "n"].map(x => parseInt(K.q(host, "#" + x).value));
      if ([a, b, c, d, n].some(isNaN) || n < 2) return;
      const det = a * d - b * c, dm = K.mod(det, n), g = K.gcd(dm, n), di = K.modInv(dm, n);
      let h = `<p><b>Step 1.</b> det = (${a})(${d}) − (${b})(${c}) = ${det} ≡ <b>${dm}</b> (mod ${n})</p>`;
      if (di === null) { K.q(host, "#o").innerHTML = h + `<p><b>Step 2.</b> gcd(${dm}, ${n}) = ${g} ≠ 1 ⇒ <span class="no">the matrix is NOT invertible mod ${n}.</span></p>`; return; }
      const adj = [d, -b, -c, a], inv = adj.map(x => K.mod(x * di, n));
      const chk = [K.mod(a * inv[0] + b * inv[2], n), K.mod(a * inv[1] + b * inv[3], n), K.mod(c * inv[0] + d * inv[2], n), K.mod(c * inv[1] + d * inv[3], n)];
      h += `<p><b>Step 2.</b> gcd(${dm}, ${n}) = 1 ⇒ det⁻¹ = <b>${di}</b> (since ${dm} × ${di} = ${dm * di} ≡ 1)</p>
        <p><b>Step 3.</b> Adjugate (swap a, d; negate b, c): ${M(...adj)}</p>
        <p><b>Step 4.</b> Multiply by ${di} and reduce mod ${n}: ${M(...adj.map(x => x * di))} ≡ <b>${M(...inv)}</b></p>
        <p><b>Step 5.</b> Check: K × K⁻¹ ≡ ${M(...chk)} ${chk.join() === "1,0,0,1" ? '<span class="ok">= I ✓</span>' : ""}</p>`;
      K.q(host, "#o").innerHTML = h;
    }
    K.q(host, "#go").addEventListener("click", go); go();
  };

  D.lincong = function (host) {
    host.innerHTML = `<div class="demo-row"><label>a<input type="number" id="a" value="14"></label><span style="padding-bottom:8px">x ≡</span><label>b<input type="number" id="b" value="12"></label><span style="padding-bottom:8px">(mod</span><label>n<input type="number" id="n" value="18"></label><span style="padding-bottom:8px">)</span><button class="btn" id="go">Solve</button></div><div class="out" id="o"></div>`;
    function go() {
      const a = parseInt(K.q(host, "#a").value), b = parseInt(K.q(host, "#b").value), n = parseInt(K.q(host, "#n").value);
      if ([a, b, n].some(isNaN) || n < 2) return;
      const am = K.mod(a, n), bm = K.mod(b, n), d = K.gcd(am, n);
      let h = `<p><b>Step 1.</b> Reduce: ${am}x ≡ ${bm} (mod ${n}). d = gcd(${am}, ${n}) = <b>${d}</b>.</p>`;
      if (am === 0) { h += bm === 0 ? `<p>Every x is a solution.</p>` : `<p class="no">0 ≡ ${bm} is impossible — no solution.</p>`; K.q(host, "#o").innerHTML = h; return; }
      if (bm % d !== 0) { h += `<p><b>Step 2.</b> Does ${d} divide ${bm}? <span class="no">No ⇒ no solution.</span></p>`; K.q(host, "#o").innerHTML = h; return; }
      const a1 = am / d, b1 = bm / d, n1 = n / d, inv = K.modInv(a1, n1);
      const x0 = n1 === 1 ? 0 : K.mod(b1 * inv, n1);
      const sols = []; for (let k = 0; k < d; k++) sols.push(x0 + k * n1);
      h += `<p><b>Step 2.</b> ${d} | ${bm} ✓ ⇒ exactly <b>${d}</b> solution${d > 1 ? "s" : ""}.</p>`;
      if (d > 1) h += `<p><b>Step 3.</b> Divide by ${d}: ${a1}x ≡ ${b1} (mod ${n1}).</p>`;
      h += `<p><b>Step ${d > 1 ? 4 : 3}.</b> ${a1}⁻¹ mod ${n1} = ${n1 === 1 ? 0 : inv}; x₀ = ${b1} × ${n1 === 1 ? 0 : inv} mod ${n1} = <b>${x0}</b>.</p>`;
      if (d > 1) h += `<p><b>Step 5.</b> x = x₀ + k·(n/d) = ${x0} + ${n1}k, k = 0…${d - 1}.</p>`;
      h += `<p>Solutions: <b>x ∈ {${sols.join(", ")}}</b><br>Check: ${sols.map(x => `${am}·${x} = ${am * x} ≡ ${K.mod(am * x, n)}`).join("; ")} ✓</p>`;
      K.q(host, "#o").innerHTML = h;
    }
    K.q(host, "#go").addEventListener("click", go); go();
  };

  /*__UNIT2__*/
})();
