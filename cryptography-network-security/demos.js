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

  /* --------------------------------------------------------------- Unit II */
  const letterRow = (label, arr, cls) => `<tr><th>${label}</th>${arr.map(x => `<td${cls ? ` class="${cls}"` : ""}>${x}</td>`).join("")}</tr>`;

  D.affine = function (host) {
    const Zs = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
    host.innerHTML = `
      <div class="demo-row">
        <label class="grow">Text<input type="text" id="t" value="hello" class="wide"></label>
        <label>Cipher<select id="m"><option value="add">Additive (Caesar)</option><option value="mul">Multiplicative</option><option value="aff" selected>Affine</option></select></label>
        <label>k₁ (multiplier)<select id="k1">${Zs.map(z => `<option${z === 7 ? " selected" : ""}>${z}</option>`).join("")}</select></label>
        <label>k₂ (shift)<input type="number" id="k2" value="2" min="0" max="25"></label>
        <div class="seg" id="dir"><button class="on" data-v="e">Encrypt</button><button data-v="d">Decrypt</button></div>
      </div>
      <div id="o"></div>
      <details class="more"><summary>Brute-force attack: try every key on the ciphertext</summary><div id="bf"></div></details>`;
    let dir = "e";
    K.qa(host, "#dir button").forEach(b => b.addEventListener("click", () => { dir = b.dataset.v; K.qa(host, "#dir button").forEach(x => x.classList.toggle("on", x === b)); go(); }));
    function go() {
      const m = K.q(host, "#m").value;
      let k1 = +K.q(host, "#k1").value, k2 = K.mod(parseInt(K.q(host, "#k2").value) || 0, 26);
      K.q(host, "#k1").disabled = m === "add"; K.q(host, "#k2").disabled = m === "mul";
      if (m === "add") k1 = 1; if (m === "mul") k2 = 0;
      const t = CC.clean(K.q(host, "#t").value).slice(0, 40);
      const k1i = CC.inv(k1, 26);
      const vals = [...t].map(c => c.charCodeAt(0) - 65);
      const outV = vals.map(v => dir === "e" ? K.mod(v * k1 + k2, 26) : K.mod((v - k2) * k1i, 26));
      const formula = dir === "e" ? `C = (P × ${k1} + ${k2}) mod 26` : `P = (C − ${k2}) × ${k1}⁻¹ mod 26 = (C − ${k2}) × ${k1i} mod 26`;
      K.q(host, "#o").innerHTML = `<div class="out">${formula}</div>` + (t ? `<div class="tbl-wrap"><table class="num compact">${letterRow(dir === "e" ? "Plain" : "Cipher", [...t])}${letterRow("value", vals)}${letterRow("raw", vals.map(v => dir === "e" ? v * k1 + k2 : (v - k2) * k1i))}${letterRow("mod 26", outV)}${letterRow(dir === "e" ? "Cipher" : "Plain", outV.map(v => A2Z[v]), "hl2")}</table></div>
        <div class="out big-out">${outV.map(v => A2Z[v]).join("")}</div>` : "");
      // brute force on ciphertext
      const ct = dir === "e" ? outV.map(v => A2Z[v]).join("") : t;
      let rows = [];
      const k1s = m === "add" ? [1] : Zs, k2s = m === "mul" ? [0] : [...Array(26).keys()];
      for (const a of k1s) for (const b of k2s) { rows.push([a, b, CC.affineDec(ct, a, b)]); }
      const shown = rows.slice(0, 340);
      K.q(host, "#bf").innerHTML = `<p class="hint">${rows.length} keys tried on "${ct}". Scan for readable English — that is how brute force works.</p><div class="out mono" style="max-height:260px;overflow:auto">${shown.map(r => `(${r[0]},${String(r[1]).padStart(2)}) ${r[2]}${r[0] === k1 && r[1] === k2 ? "   ← correct key" : ""}`).join("\n")}</div>`;
    }
    K.qa(host, "input,select").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.freq = function (host) {
    const EN = { A: 8.2, B: 1.5, C: 2.8, D: 4.3, E: 12.7, F: 2.2, G: 2.0, H: 6.1, I: 7.0, J: 0.15, K: 0.8, L: 4.0, M: 2.4, N: 6.7, O: 7.5, P: 1.9, Q: 0.1, R: 6.0, S: 6.3, T: 9.1, U: 2.8, V: 1.0, W: 2.4, X: 0.15, Y: 2.0, Z: 0.07 };
    const sample = CC.affineEnc("It was the best of times it was the worst of times it was the age of wisdom it was the age of foolishness it was the epoch of belief it was the epoch of incredulity it was the season of light it was the season of darkness", 1, 7);
    host.innerHTML = `<label>Ciphertext to analyse<textarea id="t" rows="3">${sample}</textarea></label>
      <div class="legend"><span><i style="background:var(--acc)"></i>Ciphertext frequency %</span><span><i style="background:var(--warn)"></i>Normal English %</span></div>
      <div id="ch"></div><div class="out" id="o"></div>
      <div class="demo-row"><label>Try a shift (guess)<input type="range" id="s" min="0" max="25" value="0"></label><span id="sv" class="mono"></span></div><div class="out mono" id="dec"></div>`;
    function go() {
      const t = CC.clean(K.q(host, "#t").value), n = t.length || 1, cnt = {};
      for (const c of A2Z) cnt[c] = 0; for (const c of t) cnt[c]++;
      const w = 640, h = 220, s = K.svg(w, h), bw = (w - 30) / 26, max = Math.max(13, ...Object.values(cnt).map(v => 100 * v / n));
      [...A2Z].forEach((c, i) => {
        const x = 20 + i * bw, f = 100 * cnt[c] / n, e = EN[c];
        const r1 = K.s(s, "rect", { x: x + 1, y: 190 - 170 * f / max, width: bw / 2 - 1, height: 170 * f / max, "class": "bar" });
        K.s(r1, "title", {}, `${c}: ${f.toFixed(1)}%`);
        const r2 = K.s(s, "rect", { x: x + bw / 2, y: 190 - 170 * e / max, width: bw / 2 - 2, height: 170 * e / max, "class": "bar alt" });
        K.s(r2, "title", {}, `English ${c}: ${e}%`);
        K.s(s, "text", { x: x + bw / 2, y: 206, "text-anchor": "middle" }, c);
      });
      const ch = K.q(host, "#ch"); ch.innerHTML = ""; ch.appendChild(s);
      const top = [...A2Z].sort((a, b) => cnt[b] - cnt[a]).slice(0, 5);
      const guess = K.mod(top[0].charCodeAt(0) - 69, 26);
      K.q(host, "#o").innerHTML = `Most frequent ciphertext letters: <b>${top.join(", ")}</b>. If <b>${top[0]}</b> stands for <b>E</b>, the shift is ${top[0]} − E = <b>${guess}</b>.`;
      upd();
    }
    function upd() {
      const k = +K.q(host, "#s").value, t = CC.clean(K.q(host, "#t").value);
      K.q(host, "#sv").textContent = "shift = " + k;
      K.q(host, "#dec").textContent = CC.affineDec(t, 1, k).toLowerCase().slice(0, 300);
    }
    K.q(host, "#t").addEventListener("input", go); K.q(host, "#s").addEventListener("input", upd);
    go();
  };

  D.playfair = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Keyword<input type="text" id="k" value="MONARCHY" class="wide"></label><label class="grow">Text<input type="text" id="t" value="instruments" class="wide"></label>
      <div class="seg" id="dir"><button class="on" data-v="e">Encrypt</button><button data-v="d">Decrypt</button></div></div>
      <div class="two-col" style="align-items:start"><div><div id="mx" class="cells" style="grid-template-columns:repeat(5,40px)"></div><p class="hint" id="cap">Click a row in the table to highlight that pair.</p></div><div id="st"></div></div>
      <div class="out big-out" id="o"></div>`;
    let dir = "e", res = null;
    K.qa(host, "#dir button").forEach(b => b.addEventListener("click", () => { dir = b.dataset.v; K.qa(host, "#dir button").forEach(x => x.classList.toggle("on", x === b)); go(); }));
    function draw(hiIn, hiOut) {
      K.q(host, "#mx").innerHTML = res.matrix.map(c => `<div class="cell ${hiIn && hiIn.includes(c) ? "hl" : hiOut && hiOut.includes(c) ? "hl3" : ""}" style="height:40px">${c === "I" ? "I/J" : c}</div>`).join("");
    }
    function go() {
      res = CC.playfair(K.q(host, "#t").value, K.q(host, "#k").value, dir === "d");
      draw();
      K.q(host, "#st").innerHTML = `<div class="tbl-wrap"><table class="compact"><tr><th>Pair</th><th>Rule</th><th>Result</th></tr>${res.steps.map((s, i) => `<tr data-i="${i}" style="cursor:pointer"><td class="mono">${s.pair}</td><td>${s.rule}</td><td class="mono"><b>${s.out}</b></td></tr>`).join("")}</table></div>`;
      K.qa(host, "#st tr[data-i]").forEach(tr => tr.addEventListener("click", () => { const s = res.steps[+tr.dataset.i]; draw(s.pair, s.out); K.q(host, "#cap").innerHTML = `<b>${s.pair}</b> (blue) → <b>${s.out}</b> (green): ${s.rule}`; }));
      if (res.steps[0]) { draw(res.steps[0].pair, res.steps[0].out); K.q(host, "#cap").innerHTML = `<b>${res.steps[0].pair}</b> (blue) → <b>${res.steps[0].out}</b> (green): ${res.steps[0].rule}. Click other rows.`; }
      K.q(host, "#o").textContent = res.out;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.vigenere = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Plaintext<input type="text" id="t" value="she is listening" class="wide"></label><label>Keyword<input type="text" id="k" value="PASCAL"></label>
      <label>Step<input type="range" id="i" min="0" value="0"></label></div>
      <div class="out" id="o"></div>
      <div class="tbl-wrap" style="max-height:420px;overflow:auto"><table class="grid compact" id="tab"></table></div>`;
    function go() {
      const t = CC.clean(K.q(host, "#t").value).slice(0, 40), k = CC.clean(K.q(host, "#k").value) || "A";
      const sl = K.q(host, "#i"); sl.max = Math.max(0, t.length - 1); const i = Math.min(+sl.value, t.length - 1);
      const c = CC.vigenere(t, k);
      const kc = k[i % k.length], pc = t[i] || "A", r = kc.charCodeAt(0) - 65, col = pc.charCodeAt(0) - 65;
      K.q(host, "#o").innerHTML = `<div class="mono">Plain : ${[...t].map((x, j) => j === i ? `<b style="color:var(--acc)">${x}</b>` : x).join("")}<br>Key   : ${[...t].map((x, j) => j === i ? `<b style="color:var(--warn)">${k[j % k.length]}</b>` : k[j % k.length]).join("")}<br>Cipher: ${[...c].map((x, j) => j === i ? `<b style="color:var(--good)">${x}</b>` : j < i ? x : "·").join("")}</div>
        Step ${i + 1}: ${pc} (${col}) + ${kc} (${r}) = ${col + r} mod 26 = ${(col + r) % 26} → <b>${c[i] || ""}</b>. In the tableau: row <b>${kc}</b>, column <b>${pc}</b>.`;
      let h = `<tr><th></th>${[...A2Z].map((x, j) => `<th${j === col ? ' class="hl"' : ""}>${x}</th>`).join("")}</tr>`;
      for (let rr = 0; rr < 26; rr++) {
        h += `<tr><th${rr === r ? ' class="hl"' : ""}>${A2Z[rr]}</th>`;
        for (let cc = 0; cc < 26; cc++) {
          const cls = rr === r && cc === col ? "hl" : (rr === r || cc === col) ? "hl2" : "";
          h += `<td${cls ? ` class="${cls}"` : ""}>${A2Z[(rr + cc) % 26]}</td>`;
        }
        h += "</tr>";
      }
      K.q(host, "#tab").innerHTML = h;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.hill = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Text<input type="text" id="t" value="HELP" class="wide"></label>
      <label>k11<input type="number" id="a" value="3"></label><label>k12<input type="number" id="b" value="3"></label><label>k21<input type="number" id="c" value="2"></label><label>k22<input type="number" id="d" value="5"></label>
      <div class="seg" id="dir"><button class="on" data-v="e">Encrypt</button><button data-v="d">Decrypt</button></div></div><div id="o"></div>`;
    let dir = "e";
    const M = m => `<span class="mat c2"><span>${m[0][0]}</span><span>${m[0][1]}</span><span>${m[1][0]}</span><span>${m[1][1]}</span></span>`;
    K.qa(host, "#dir button").forEach(b => b.addEventListener("click", () => { dir = b.dataset.v; K.qa(host, "#dir button").forEach(x => x.classList.toggle("on", x === b)); go(); }));
    function go() {
      const [a, b, c, d] = ["a", "b", "c", "d"].map(x => K.mod(parseInt(K.q(host, "#" + x).value) || 0, 26));
      const Km = [[a, b], [c, d]], det = K.mod(a * d - b * c, 26);
      if (K.gcd(det, 26) !== 1) { K.q(host, "#o").innerHTML = `<div class="out">det K = ${det}; gcd(${det}, 26) ≠ 1 → <span class="no">this key matrix is not invertible, choose another.</span></div>`; return; }
      const r = CC.hill2(K.q(host, "#t").value, Km, dir === "d");
      K.q(host, "#o").innerHTML = `<div class="out">K = ${M(Km)}, det = ${det}, det⁻¹ = ${CC.inv(det, 26)}${dir === "d" ? `, K⁻¹ = ${M(r.M)}` : ""}. Using ${dir === "e" ? "C = P × K" : "P = C × K⁻¹"} (mod 26).</div>` +
        tbl(["Block", "Vector", "× matrix", "mod 26", "Result"], r.steps.map(s => [s.blk, `(${s.v.join(", ")})`, `(${s.raw.join(", ")})`, `(${s.r.join(", ")})`, `<b>${s.r.map(v => A2Z[v]).join("")}</b>`])) +
        `<div class="out big-out">${r.out}</div>`;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.otp = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Message 1<input type="text" id="m1" value="ATTACK" class="wide"></label><label class="grow">Message 2 (encrypted with the SAME key)<input type="text" id="m2" value="DEFEND" class="wide"></label><button class="btn ghost" id="nk">New random key</button></div><div id="o"></div>`;
    let key = [];
    const rnd = n => { const a = new Uint8Array(n); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.random() * 256 | 0); return [...a]; };
    const b8 = x => K.bin(x, 8);
    function go() {
      const m1 = K.q(host, "#m1").value.slice(0, 8), m2 = K.q(host, "#m2").value.slice(0, 8), n = Math.max(m1.length, m2.length);
      while (key.length < n) key = key.concat(rnd(1));
      const p1 = [...m1].map(c => c.charCodeAt(0) & 255), p2 = [...m2].map(c => c.charCodeAt(0) & 255);
      const c1 = p1.map((x, i) => x ^ key[i]), c2 = p2.map((x, i) => x ^ key[i]);
      const x12 = c1.map((x, i) => x ^ (c2[i] || 0)), pp = p1.map((x, i) => x ^ (p2[i] || 0));
      const row = (l, arr) => `${l.padEnd(14)}${arr.map(b8).join(" ")}`;
      K.q(host, "#o").innerHTML = `<div class="out mono">${[row("P1", p1), row("Key", key.slice(0, p1.length)), row("C1 = P1⊕K", c1), "", row("C1 ⊕ K", c1.map((x, i) => x ^ key[i])) + "  → \"" + c1.map((x, i) => String.fromCharCode(x ^ key[i])).join("") + "\"  (decryption)"].join("\n")}</div>
        <div class="out mono" style="margin-top:8px">${[row("C2 = P2⊕K", c2), row("C1 ⊕ C2", x12), row("P1 ⊕ P2", pp)].join("\n")}\n<span class="no">C1 ⊕ C2 = P1 ⊕ P2 — the key has cancelled out!</span> An attacker who guesses one message (e.g. "ATTACK") recovers the other.</div>`;
    }
    K.q(host, "#nk").addEventListener("click", () => { key = []; go(); });
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.rail = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Plaintext<input type="text" id="t" value="meet me after the toga party" class="wide"></label><label>Rails<input type="number" id="r" value="2" min="2" max="6"></label></div><div id="g" style="overflow-x:auto"></div><div class="out" id="o"></div>`;
    function go() {
      const t = CC.clean(K.q(host, "#t").value).slice(0, 40), r = Math.max(2, Math.min(6, +K.q(host, "#r").value || 2));
      const res = CC.railEnc(t, r);
      let h = `<div class="cells" style="grid-template-columns:repeat(${t.length},28px)">`;
      for (let row = 0; row < r; row++) for (let i = 0; i < t.length; i++) h += res.path[i] === row ? `<div class="cell hl" style="height:28px;min-width:28px">${t[i]}</div>` : `<div class="cell dim" style="height:28px;min-width:28px;border-style:dashed"></div>`;
      K.q(host, "#g").innerHTML = h + "</div>";
      K.q(host, "#o").innerHTML = res.rows.map((x, i) => `Rail ${i + 1}: <span class="mono">${x.join("")}</span>`).join("<br>") + `<br>Ciphertext (read rails in order): <b class="mono">${res.out}</b><br>Decrypt check: ${CC.railDec(res.out, r)}`;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.columnar = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Plaintext<input type="text" id="t" value="attack postponed until two am" class="wide"></label><label>Key (digits or a word)<input type="text" id="k" value="4312567"></label></div><div id="g"></div><div class="out" id="o"></div>`;
    function go() {
      const key = K.q(host, "#k").value.trim() || "312";
      const res = CC.colEnc(K.q(host, "#t").value.slice(0, 60), key, "X");
      const w = res.rank.length;
      let h = `<div class="cells" style="grid-template-columns:repeat(${w},34px)">` + res.rank.map(r => `<div class="cell head">${r}</div>`).join("");
      res.rows.forEach(row => [...row].forEach((ch, j) => { h += `<div class="cell" style="background:color-mix(in srgb, var(--acc) ${10 + 60 * (res.rank[j] - 1) / Math.max(1, w - 1)}%, var(--card))">${ch}</div>`; }));
      K.q(host, "#g").innerHTML = h + "</div>";
      const cols = []; for (let r = 1; r <= w; r++) { const c = res.rank.indexOf(r); cols.push(res.rows.map(x => x[c]).join("")); }
      K.q(host, "#o").innerHTML = `Written row by row (padded with X). Read column <b>1</b> first, then 2, 3, …:<br><span class="mono">${cols.join(" ")}</span><br>Ciphertext: <b class="mono">${res.out}</b><br>Decrypt check: ${CC.colDec(res.out, key)}`;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.feistel = function (host) {
    host.innerHTML = `<p class="hint">Block = 16 bits (two 8-bit halves). Round function f(R, K) = (R × K + R) mod 256 — clearly <b>not</b> invertible, yet the Feistel structure decrypts perfectly with reversed keys.</p>
      <div class="demo-row"><label>Plaintext (hex, 4 digits)<input type="text" id="p" value="A53C"></label><label>Round keys (hex bytes)<input type="text" id="k" value="1F 9A 3B 77"></label></div><div id="o"></div>`;
    const f = (r, k) => (r * k + r) & 255;
    const hx = x => K.hex(x, 2).toUpperCase();
    function run(L, R, keys) {
      const rows = [];
      keys.forEach((k, i) => { const fv = f(R, k), nL = R, nR = L ^ fv; rows.push([i + 1, hx(k), hx(L) + " " + hx(R), `f(${hx(R)}, ${hx(k)}) = ${hx(fv)}`, `${hx(nL)} ${hx(nR)}`]); L = nL; R = nR; });
      return { L: R, R: L, rows }; // final swap undone
    }
    function go() {
      const p = parseInt(K.q(host, "#p").value, 16) || 0, keys = K.q(host, "#k").value.trim().split(/\s+/).map(x => parseInt(x, 16) & 255).filter(x => !isNaN(x));
      const e = run(p >> 8 & 255, p & 255, keys), c = (e.L << 8) | e.R;
      const d = run(c >> 8 & 255, c & 255, keys.slice().reverse()), back = (d.L << 8) | d.R;
      K.q(host, "#o").innerHTML = `<b>Encryption</b>` + tbl(["Round", "Key", "L R in", "f", "L R out"], e.rows) +
        `<div class="out">After undoing the last swap: ciphertext = <b class="mono">${K.hex(c, 4).toUpperCase()}</b></div><b>Decryption (same rounds, keys reversed)</b>` +
        tbl(["Round", "Key", "L R in", "f", "L R out"], d.rows) + `<div class="out">Recovered plaintext = <b class="mono">${K.hex(back, 4).toUpperCase()}</b> ${back === (p & 0xffff) ? '<span class="ok">✓ matches</span>' : ""}</div>`;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.dessbox = function (host) {
    host.innerHTML = `<div class="demo-row"><label>S-box<select id="b">${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `<option>${i}</option>`).join("")}</select></label><label>6-bit input<input type="text" id="x" value="100011" maxlength="6"></label></div><div class="out" id="o"></div><div id="t"></div>`;
    function go() {
      const b = +K.q(host, "#b").value - 1, x = K.q(host, "#x").value.replace(/[^01]/g, "").padEnd(6, "0").slice(0, 6);
      const r = CC.desSbox(b, [...x].map(Number));
      K.q(host, "#o").innerHTML = `Input <b class="mono"><span style="color:var(--warn)">${x[0]}</span>${x.slice(1, 5)}<span style="color:var(--warn)">${x[5]}</span></b>: row = outer bits ${x[0]}${x[5]} = <b>${r.row}</b>, column = middle bits ${x.slice(1, 5)} = <b>${r.col}</b> → S${b + 1}[${r.row}][${r.col}] = <b>${r.val}</b> = <b class="mono">${K.bin(r.val, 4)}</b>`;
      const S = CC.DES_TABLES.S[b];
      let h = `<tr><th></th>${[...Array(16).keys()].map(c => `<th${c === r.col ? ' class="hl"' : ""}>${c}</th>`).join("")}</tr>`;
      for (let rr = 0; rr < 4; rr++) h += `<tr><th${rr === r.row ? ' class="hl"' : ""}>${rr}</th>${[...Array(16).keys()].map(c => `<td class="${rr === r.row && c === r.col ? "hl" : (rr === r.row || c === r.col) ? "hl2" : ""}">${S[rr * 16 + c]}</td>`).join("")}</tr>`;
      K.q(host, "#t").innerHTML = `<div class="tbl-wrap"><table class="grid compact">${h}</table></div>`;
    }
    K.qa(host, "input,select").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.des = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Plaintext (16 hex)<input type="text" id="p" value="0123456789ABCDEF" size="18" class="mono"></label><label>Key (16 hex)<input type="text" id="k" value="133457799BBCDFF1" size="18" class="mono"></label>
      <div class="seg" id="tab"><button class="on" data-v="r">Rounds</button><button data-v="k">Key schedule</button><button data-v="a">Avalanche</button></div></div><div id="o"></div>`;
    let tab = "r";
    K.qa(host, "#tab button").forEach(b => b.addEventListener("click", () => { tab = b.dataset.v; K.qa(host, "#tab button").forEach(x => x.classList.toggle("on", x === b)); go(); }));
    const ok = h => /^[0-9a-fA-F]{16}$/.test(h);
    const popc = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { n += x & 1; x >>= 1; } } return n; };
    function go() {
      const p = K.q(host, "#p").value.trim(), k = K.q(host, "#k").value.trim();
      if (!ok(p) || !ok(k)) { K.q(host, "#o").innerHTML = `<div class="out no">Enter exactly 16 hexadecimal digits for both.</div>`; return; }
      const r = CC.des(p, k);
      let h = "";
      if (tab === "r") {
        h = `<div class="out">After IP: <span class="mono">${r.ip}</span> → L₀ = <span class="mono">${r.ip.slice(0, 8)}</span>, R₀ = <span class="mono">${r.ip.slice(8)}</span></div>` +
          tbl(["Round", "E(R) 48-bit", "Kᵢ", "E ⊕ K", "S-box out", "f = P(S)", "Lᵢ", "Rᵢ"], r.rounds.map(x => [x.r, x.E, x.K, x.X, x.S, x.F, x.L, `<b>${x.R}</b>`]), "compact mono") +
          `<div class="out">Swap → R₁₆L₁₆ = <span class="mono">${r.rounds[15].R}${r.rounds[15].L}</span> → final permutation → ciphertext <b class="big-out">${r.out}</b><br>Decryption with reversed keys gives: <span class="mono">${CC.des(r.out, k, true).out}</span> ✓</div>`;
      } else if (tab === "k") {
        const ks = CC.desKeys(k);
        h = `<div class="out">After parity drop (PC-1, 56 bits): <span class="mono">${ks.k56}</span></div>` + tbl(["Round", "Shift", "C (28 bits, hex)", "D (28 bits, hex)", "Kᵢ = PC-2(C‖D), 48 bits"], ks.trace.map((t, i) => [i + 1, CC.DES_TABLES.SHIFTS[i], t.C, t.D, `<b>${t.K}</b>`]), "compact mono");
      } else {
        const bits = CC.hexToBits(p); bits[63] ^= 1; const p2 = CC.bitsToHex(bits);
        const r2 = CC.des(p2, k);
        h = `<div class="out">Plaintext 2 differs from plaintext 1 in only the <b>last bit</b>: <span class="mono">${p} → ${p2}</span></div>` +
          tbl(["Round", "LR (plaintext 1)", "LR (plaintext 2)", "Bits different (of 64)"], r.rounds.map((x, i) => { const d = popc(x.L + x.R, r2.rounds[i].L + r2.rounds[i].R); return [x.r, x.L + x.R, r2.rounds[i].L + r2.rounds[i].R, `<b>${d}</b> ${"▮".repeat(Math.round(d / 2))}`]; }), "compact mono") +
          `<div class="out">Ciphertexts: <span class="mono">${r.out}</span> vs <span class="mono">${r2.out}</span> → <b>${popc(r.out, r2.out)}</b> of 64 bits differ — about half, as the avalanche effect predicts.</div>`;
      }
      K.q(host, "#o").innerHTML = h;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.gfmul = function (host) {
    host.innerHTML = `<div class="demo-row"><label>a (hex byte)<input type="text" id="a" value="57" size="4"></label><span style="padding-bottom:8px">×</span><label>b (hex byte)<input type="text" id="b" value="13" size="4"></label></div><div class="out" id="o"></div>`;
    const H = CC.hx, poly = x => { const t = []; for (let i = 7; i >= 0; i--) if (x >> i & 1) t.push(i === 0 ? "1" : i === 1 ? "x" : `x<sup>${i}</sup>`); return t.join(" + ") || "0"; };
    function go() {
      const a = parseInt(K.q(host, "#a").value, 16) & 255, b = parseInt(K.q(host, "#b").value, 16) & 255;
      if (isNaN(a) || isNaN(b)) return;
      let cur = a, acc = 0, lines = [], used = [];
      for (let i = 0; i < 8; i++) {
        if (i > 0) { const prev = cur; cur = CC.xtime(cur); lines.push(`${H(a)} × ${H(1 << i)} = xtime(${H(prev)}) = ${K.bin(prev, 8)} ≪ 1 ${prev & 0x80 ? "→ MSB was 1 → ⊕ 1B" : ""} = <b>${H(cur)}</b>`); }
        if (b >> i & 1) { acc ^= cur; used.push(`${H(a)}×${H(1 << i)} = ${H(cur)}`); }
        if (!(b >> (i + 1))) break;
      }
      K.q(host, "#o").innerHTML = `a = ${H(a)} = ${K.bin(a, 8)} = ${poly(a)}<br>b = ${H(b)} = ${K.bin(b, 8)} = ${[...Array(8).keys()].filter(i => b >> i & 1).map(i => H(1 << i)).reverse().join(" ⊕ ")}<br><br>${lines.join("<br>") || "(no doubling needed)"}<br><br>
        Product = ${used.join(" ⊕ ")}<br>= <b class="big-out">${H(acc)}</b> &nbsp;(check: ${H(CC.gmul(a, b))})`;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go));
    go();
  };

  D.aessbox = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Byte (hex)<input type="text" id="x" value="53" size="4"></label><div class="seg" id="w"><button class="on" data-v="s">S-box</button><button data-v="i">Inverse S-box</button></div></div><div class="out" id="o"></div><div class="tbl-wrap"><table class="grid compact" id="t"></table></div>`;
    let which = "s";
    K.qa(host, "#w button").forEach(b => b.addEventListener("click", () => { which = b.dataset.v; K.qa(host, "#w button").forEach(x => x.classList.toggle("on", x === b)); go(); }));
    function go() {
      const x = parseInt(K.q(host, "#x").value, 16) & 255, T = which === "s" ? CC.SBOX : CC.INV_SBOX, r = x >> 4, c = x & 15;
      K.q(host, "#o").innerHTML = `${which === "s" ? "S-box" : "Inverse S-box"}(${CC.hx(x)}): row <b>${r.toString(16).toUpperCase()}</b>, column <b>${c.toString(16).toUpperCase()}</b> → <b class="big-out">${CC.hx(T[x])}</b>. Check: ${which === "s" ? "InvS" : "S"}(${CC.hx(T[x])}) = ${CC.hx((which === "s" ? CC.INV_SBOX : CC.SBOX)[T[x]])} ✓ <span class="hint">Click any cell.</span>`;
      let h = `<tr><th></th>${[...Array(16).keys()].map(j => `<th${j === c ? ' class="hl"' : ""}>${j.toString(16).toUpperCase()}</th>`).join("")}</tr>`;
      for (let i = 0; i < 16; i++) h += `<tr><th${i === r ? ' class="hl"' : ""}>${i.toString(16).toUpperCase()}</th>${[...Array(16).keys()].map(j => `<td data-b="${i * 16 + j}" style="cursor:pointer" class="${i === r && j === c ? "hl" : (i === r || j === c) ? "hl2" : ""}">${CC.hx(T[i * 16 + j])}</td>`).join("")}</tr>`;
      K.q(host, "#t").innerHTML = h;
      K.qa(host, "#t td").forEach(td => td.addEventListener("click", () => { K.q(host, "#x").value = CC.hx(+td.dataset.b); go(); }));
    }
    K.q(host, "#x").addEventListener("input", go);
    go();
  };

  D.aes = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Plaintext (32 hex)<input type="text" id="p" value="3243F6A8885A308D313198A2E0370734" class="wide mono"></label>
      <label class="grow">Key (32 / 48 / 64 hex)<input type="text" id="k" value="2B7E151628AED2A6ABF7158809CF4F3C" class="wide mono"></label></div>
      <div class="demo-row"><button class="btn ghost" id="prev">◀ Prev</button><button class="btn" id="next">Next step ▶</button><button class="btn ghost" id="end">Jump to end</button><span id="lbl" style="padding-bottom:8px"></span></div>
      <div class="two-col" style="align-items:start"><div><b id="sname"></b><div id="st" class="cells" style="grid-template-columns:repeat(4,46px);margin-top:6px"></div><p class="hint" id="note"></p></div><div><b>Round key used</b><div id="rk" class="cells" style="grid-template-columns:repeat(4,46px);margin-top:6px"></div></div></div>
      <div class="out" id="o"></div>
      <details class="more"><summary>Key expansion table (all words)</summary><div id="kx"></div></details>`;
    let res = null, idx = 0;
    const NOTES = {
      "SubBytes": "Each byte replaced independently through the S-box (orange = changed bytes).",
      "ShiftRows": "Row r rotated left by r positions.",
      "MixColumns": "Each column multiplied by the fixed matrix in GF(2⁸).",
      "AddRoundKey": "State XOR round key (column by column).",
      "AddRoundKey (pre-round, key w0–w3)": "Whitening: plaintext XOR the original key.",
      "Input (plaintext)": "Bytes loaded column by column into the 4×4 state."
    };
    function grid(bytes, prev) {
      let h = "";
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const i = r + 4 * c; h += `<div class="cell ${prev && prev[i] !== bytes[i] ? "hl2" : ""}" style="height:38px">${CC.hx(bytes[i])}</div>`; }
      return h;
    }
    function show() {
      const s = res.steps[idx], prev = idx ? res.steps[idx - 1].s : null;
      K.q(host, "#sname").textContent = `Round ${s.round}: ${s.name}`;
      K.q(host, "#lbl").textContent = `step ${idx + 1} / ${res.steps.length}`;
      K.q(host, "#st").innerHTML = grid(s.s, prev);
      K.q(host, "#note").textContent = NOTES[s.name] || "";
      if (s.k !== undefined) { const rk = []; for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) rk[r + 4 * c] = res.w[4 * s.k + c][r]; K.q(host, "#rk").innerHTML = grid(rk); }
      else K.q(host, "#rk").innerHTML = `<div class="hint" style="grid-column:span 4">— (no key in this step)</div>`;
      K.q(host, "#o").innerHTML = idx === res.steps.length - 1 ? `Ciphertext = <b class="big-out">${res.out}</b><br>Decrypting it gives back: <span class="mono">${CC.aesDecrypt(res.out, K.q(host, "#k").value)}</span>` : `State as hex (column order): <span class="mono">${s.s.map(CC.hx).join("")}</span>`;
    }
    function go() {
      const p = K.q(host, "#p").value.replace(/\s/g, ""), k = K.q(host, "#k").value.replace(/\s/g, "");
      if (!/^[0-9a-fA-F]{32}$/.test(p) || !/^([0-9a-fA-F]{32}|[0-9a-fA-F]{48}|[0-9a-fA-F]{64})$/.test(k)) { K.q(host, "#o").innerHTML = `<span class="no">Plaintext must be 32 hex digits; key 32, 48 or 64 hex digits.</span>`; return; }
      res = CC.aes(p, k); idx = Math.min(idx, res.steps.length - 1);
      const ex = CC.aesExpand(CC.parseHex(k));
      const kxRows = ex.w.map((w, i) => {
        const t = ex.trace.find(x => x.i === i);
        return [i, t ? (t.rot ? `RotWord ${t.rot} → SubWord ${t.sub} → ⊕ RCon ${t.rcon} = ${t.afterRcon}` : t.sub ? `SubWord ${t.sub}` : `w${i - 1} = ${t.prev}`) : "original key", t ? `⊕ w${i - ex.Nk} (${t.wNk})` : "", `<b>${w.map(CC.hx).join("")}</b>`];
      });
      K.q(host, "#kx").innerHTML = `<p class="hint">${ex.Nk * 32}-bit key → Nk = ${ex.Nk}, Nr = ${ex.Nr}, ${ex.w.length} words.</p>` + tbl(["i", "temp", "", "w[i]"], kxRows, "compact mono");
      show();
    }
    K.q(host, "#next").addEventListener("click", () => { if (res && idx < res.steps.length - 1) { idx++; show(); } });
    K.q(host, "#prev").addEventListener("click", () => { if (res && idx > 0) { idx--; show(); } });
    K.q(host, "#end").addEventListener("click", () => { if (res) { idx = res.steps.length - 1; show(); } });
    K.qa(host, "input").forEach(e => e.addEventListener("input", () => { idx = 0; go(); }));
    go();
  };

  /*__UNIT3__*/
})();
