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

  /* -------------------------------------------------------------- Unit III */
  const bigOr = (v, d) => { try { return BigInt(String(v).trim()); } catch (e) { return d; } };
  const crtBig = (as, ms) => { const M = ms.reduce((a, b) => a * b, 1n); let x = 0n; as.forEach((a, i) => { const Mi = M / ms[i]; x += a * Mi * K.binv(Mi, ms[i]); }); return K.bmod(x, M); };

  D.ecbpenguin = function (host) {
    host.innerHTML = `<p class="hint">A 32×32 picture (1 byte per pixel) is encrypted with <b>real AES-128</b>. Each 4×4 tile of pixels (16 bytes) is one AES block; each ciphertext block is painted in one colour taken from its first three bytes. Identical colours = identical ciphertext blocks.</p>
      <div class="demo-row"><label>Picture<select id="pic"><option value="lock">Padlock</option><option value="smile">Smiley</option><option value="stripes">Stripes</option></select></label><button class="btn ghost" id="key">New random key</button></div>
      <div class="three-col" id="g"></div>`;
    let key = "000102030405060708090a0b0c0d0e0f";
    const N = 32;
    function picture(kind) {
      const px = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let v = 230;
        if (kind === "smile") { const d = Math.hypot(x - 15.5, y - 15.5); if (d < 14 && d > 11.5) v = 30; if (Math.hypot(x - 10.5, y - 11) < 2.2 || Math.hypot(x - 20.5, y - 11) < 2.2) v = 30; if (y > 18 && y < 22 && Math.abs(Math.hypot(x - 15.5, y - 12) - 9) < 1.4) v = 30; if (d < 11.5 && v === 230) v = 200; }
        else if (kind === "stripes") v = Math.floor(x / 8) % 2 ? 40 : 220;
        else { if (y >= 16 && y < 28 && x >= 4 && x < 28) v = 40; if (y >= 4 && y < 16 && ((x >= 8 && x < 12) || (x >= 20 && x < 24))) v = 40; if (y >= 4 && y < 8 && x >= 8 && x < 24) v = 40; if (y >= 20 && y < 24 && x >= 12 && x < 20) v = 230; }
        px.push(v);
      }
      return px;
    }
    function draw(bytes, title) {
      const c = document.createElement("canvas"); c.width = N; c.height = N;
      c.style.width = "100%"; c.style.imageRendering = "pixelated"; c.style.borderRadius = "8px"; c.style.border = "1px solid var(--line)";
      const ctx = c.getContext("2d"), img = ctx.createImageData(N, N);
      bytes.forEach((v, i) => { const c = Array.isArray(v) ? v : [v, v, v]; img.data[4 * i] = c[0]; img.data[4 * i + 1] = c[1]; img.data[4 * i + 2] = c[2]; img.data[4 * i + 3] = 255; });
      ctx.putImageData(img, 0, 0);
      const d = document.createElement("div"); d.innerHTML = `<b>${title}</b>`; d.appendChild(c); return d;
    }
    // each AES block = one 4×4 tile of pixels, so equal tiles stay equal under ECB
    function enc(px, mode) {
      const out = Array(px.length).fill(0); let prev = CC.parseHex("a1b2c3d4e5f60718293a4b5c6d7e8f90");
      for (let ty = 0; ty < N; ty += 4) for (let tx = 0; tx < N; tx += 4) {
        const idx = []; for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) idx.push((ty + dy) * N + tx + dx);
        let blk = idx.map(i => px[i]);
        if (mode === "cbc") blk = blk.map((b, j) => b ^ prev[j]);
        const c = CC.parseHex(CC.aes(blk.map(CC.hx).join(""), key).out);
        idx.forEach(i => out[i] = [c[0], c[1], c[2]]); prev = c;
      }
      return out;
    }
    function go() {
      const px = picture(K.q(host, "#pic").value), g = K.q(host, "#g"); g.innerHTML = "";
      g.appendChild(draw(px, "Plaintext image")); g.appendChild(draw(enc(px, "ecb"), "AES-ECB")); g.appendChild(draw(enc(px, "cbc"), "AES-CBC (random IV)"));
    }
    K.q(host, "#pic").addEventListener("change", go);
    K.q(host, "#key").addEventListener("click", () => { key = [...crypto.getRandomValues(new Uint8Array(16))].map(CC.hx).join(""); go(); });
    go();
  };

  D.lfsr = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Length m<input type="number" id="m" value="4" min="2" max="12"></label><label>Taps (cell indices XORed, e.g. "1 0")<input type="text" id="t" value="1 0"></label><label>Seed (bits, b(m−1)…b0)<input type="text" id="s" value="0001"></label><button class="btn" id="go">Run</button></div><div id="o"></div>`;
    function go() {
      const m = Math.max(2, Math.min(12, +K.q(host, "#m").value || 4));
      const taps = K.q(host, "#t").value.trim().split(/[\s,]+/).map(Number).filter(x => x >= 0 && x < m);
      let st = K.q(host, "#s").value.replace(/[^01]/g, "").padStart(m, "0").slice(-m).split("").map(Number); // index 0 = b(m-1)
      const start = st.join(""), rows = [], out = [];
      let period = null;
      for (let k = 0; k < Math.min(70, 2 ** m + 2); k++) {
        const bit = (i) => st[m - 1 - i];
        const fb = taps.reduce((a, i) => a ^ bit(i), 0), o = bit(0);
        rows.push([k, st.join(""), o, taps.map(i => `b${i}=${bit(i)}`).join(" ⊕ ") + ` = ${fb}`]);
        out.push(o);
        st = [fb].concat(st.slice(0, m - 1));
        if (st.join("") === start && period === null) { period = k + 1; rows.push({ cls: "total", cells: [k + 1, st.join(""), "", "back to the seed"] }); break; }
        if (!st.includes(1)) { rows.push({ cls: "total", cells: [k + 1, st.join(""), "", "all zeros – stuck"] }); break; }
      }
      K.q(host, "#o").innerHTML = tbl(["Tick", "Register b" + (m - 1) + "…b0", "Output b0", "Feedback new b" + (m - 1)], rows) +
        `<div class="out">Key stream: <span class="mono">${out.join("")}</span><br>${period ? `Period = <b>${period}</b> ${period === 2 ** m - 1 ? `= 2<sup>${m}</sup> − 1 → maximum length (primitive polynomial) ✓` : `(maximum possible is ${2 ** m - 1})`}` : "Period longer than shown."}</div>`;
    }
    K.q(host, "#go").addEventListener("click", go); go();
  };

  D.rc4 = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Key (text)<input type="text" id="k" value="Key"></label><label class="grow">Plaintext<input type="text" id="p" value="Plaintext" class="wide"></label></div><div id="o"></div>`;
    function go() {
      const k = CC.utf8(K.q(host, "#k").value || "K"), p = CC.utf8(K.q(host, "#p").value).slice(0, 32);
      const ks = CC.rc4(k, p.length);
      const S = [...Array(256).keys()]; let j = 0;
      for (let i = 0; i < 256; i++) { j = (j + S[i] + k[i % k.length]) & 255;[S[i], S[j]] = [S[j], S[i]]; }
      K.q(host, "#o").innerHTML = `<div class="out mono">S after key scheduling (first 32 of 256): ${S.slice(0, 32).map(CC.hx).join(" ")} …</div>` +
        tbl(["Byte", "Plain", "Key stream", "Cipher = P ⊕ k"], p.map((b, i) => [i, `${CC.hx(b)} '${String.fromCharCode(b)}'`, CC.hx(ks[i]), `<b>${CC.hx(b ^ ks[i])}</b>`]), "compact mono") +
        `<div class="out">Ciphertext: <b class="mono">${p.map((b, i) => CC.hx(b ^ ks[i])).join("")}</b></div>`;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go)); go();
  };

  D.sieve = function (host) {
    host.innerHTML = `<div class="demo-row"><label>Up to n<input type="number" id="n" value="100" min="10" max="400"></label><button class="btn" id="step">Next prime ▶</button><button class="btn ghost" id="all">Finish</button><button class="btn ghost" id="rst">Reset</button></div><div id="g" class="cells" style="grid-template-columns:repeat(10,1fr)"></div><div class="out" id="o"></div>`;
    let n, crossed, cur, primes;
    function reset() { n = Math.max(10, Math.min(400, +K.q(host, "#n").value || 100)); crossed = new Set([1]); cur = 1; primes = []; draw(); K.q(host, "#o").textContent = "Press 'Next prime': the next uncrossed number is prime; all its multiples get crossed out."; }
    function draw(hi) { K.q(host, "#g").innerHTML = [...Array(n).keys()].map(i => i + 1).map(v => `<div class="cell ${primes.includes(v) ? "hl" : crossed.has(v) ? "dim" : ""} ${hi === v ? "hl2" : ""}" style="height:30px">${v}</div>`).join(""); }
    function step() {
      let p = cur + 1; while (p <= n && crossed.has(p)) p++;
      if (p > n) return false;
      cur = p; primes.push(p);
      if (p * p > n) { for (let v = p + 1; v <= n; v++) if (!crossed.has(v)) primes.push(v); for (const v of primes) crossed.delete(v); cur = n; draw(); K.q(host, "#o").innerHTML = `${p}² = ${p * p} > ${n}, so every remaining number is prime. <b>${primes.length}</b> primes ≤ ${n}: ${primes.join(", ")}`; return false; }
      const xs = []; for (let m = p * p; m <= n; m += p) { if (!crossed.has(m)) xs.push(m); crossed.add(m); }
      draw(p); K.q(host, "#o").innerHTML = `<b>${p}</b> is prime. Cross out its multiples from ${p}² = ${p * p}: ${xs.join(", ") || "(none new)"}`;
      return true;
    }
    K.q(host, "#step").addEventListener("click", step);
    K.q(host, "#all").addEventListener("click", () => { while (step()); });
    K.q(host, "#rst").addEventListener("click", reset);
    K.q(host, "#n").addEventListener("change", reset);
    reset();
  };

  D.phi = function (host) {
    host.innerHTML = `<div class="demo-row"><label>n<input type="number" id="n" value="240" min="2"></label><label>a (for Fermat / Euler)<input type="number" id="a" value="7"></label></div><div class="out" id="o"></div>`;
    function go() {
      const n = Math.max(2, Math.min(1e9, +K.q(host, "#n").value || 2)), a = +K.q(host, "#a").value || 2;
      const f = K.factorize(n);
      let phi = n; f.forEach(([p]) => phi = phi / p * (p - 1));
      const terms = f.map(([p, e]) => e > 1 ? `(${p}<sup>${e}</sup> − ${p}<sup>${e - 1}</sup>)` : `(${p} − 1)`).join(" × ");
      const g = K.gcd(a, n), pw = K.bpow(BigInt(a), BigInt(phi), BigInt(n));
      let list = "";
      if (n <= 60) { const l = []; for (let i = 1; i < n; i++) if (K.gcd(i, n) === 1) l.push(i); list = `<br>ℤ<sub>${n}</sub>* = {${l.join(", ")}}`; }
      K.q(host, "#o").innerHTML = `n = ${K.factStr(f)}<br>φ(${n}) = ${terms} = <b>${phi}</b>${K.isPrime(n) ? " (n is prime: φ = n − 1)" : ""}${list}<br><br>
        ${g === 1 ? `Euler: ${a}<sup>φ(${n})</sup> = ${a}<sup>${phi}</sup> mod ${n} = <b>${pw}</b> ${pw === 1n ? "✓ (= 1 as the theorem says)" : ""}${K.isPrime(n) ? ` — this is Fermat's little theorem since ${n} is prime.` : ""}<br>Inverse via Euler: ${a}<sup>−1</sup> ≡ ${a}<sup>${phi - 1}</sup> ≡ <b>${K.bpow(BigInt(a), BigInt(phi - 1), BigInt(n))}</b> (mod ${n})`
          : `gcd(${a}, ${n}) = ${g} ≠ 1, so Euler's theorem does not apply to this a.`}`;
    }
    K.qa(host, "input").forEach(e => e.addEventListener("input", go)); go();
  };

  D.millerrabin = function (host) {
    host.innerHTML = `<div class="demo-row"><label>n (odd)<input type="text" id="n" value="561" size="12"></label><label>base a<input type="text" id="a" value="2" size="6"></label><button class="btn" id="go">Test</button></div><div id="o"></div>`;
    function go() {
      const n = bigOr(K.q(host, "#n").value, 561n), a = bigOr(K.q(host, "#a").value, 2n);
      if (n < 5n || n % 2n === 0n) { K.q(host, "#o").innerHTML = `<div class="out">Enter an odd n ≥ 5.</div>`; return; }
      const fer = K.bpow(a, n - 1n, n);
      let m = n - 1n, k = 0; while (m % 2n === 0n) { m /= 2n; k++; }
      let T = K.bpow(a, m, n); const rows = [["a<sup>m</sup>", `${a}<sup>${m}</sup> mod ${n}`, T]]; let verdict;
      if (T === 1n || T === n - 1n) verdict = "probably prime";
      else {
        verdict = "composite";
        for (let i = 1; i < k; i++) { T = T * T % n; rows.push([`square ${i}`, "T² mod n", T]); if (T === n - 1n) { verdict = "probably prime"; break; } if (T === 1n) { verdict = "composite (non-trivial √1 found)"; break; } }
      }
      K.q(host, "#o").innerHTML = `<div class="out"><b>Fermat test:</b> ${a}<sup>${n - 1n}</sup> mod ${n} = ${fer} → ${fer === 1n ? '<span class="ok">probably prime</span>' : '<span class="no">composite</span>'}</div>
        <div class="out" style="margin-top:8px"><b>Miller–Rabin:</b> n − 1 = ${n - 1n} = ${m} × 2<sup>${k}</sup> (m = ${m}, k = ${k})</div>` +
        tbl(["Step", "Computation", "T"], rows.map(r => [r[0], r[1], `<b>${r[2]}</b>${r[2] === n - 1n ? " (= n − 1 = −1)" : r[2] === 1n ? " (= 1)" : ""}`])) +
        `<div class="out">Miller–Rabin verdict: ${verdict.startsWith("probably") ? `<span class="ok">${verdict}</span>` : `<span class="no">${verdict}</span>`} &nbsp; (true answer: ${n < 10n ** 12n ? (K.isPrime(Number(n)) ? "prime" : "composite") : "?"})</div>`;
    }
    K.q(host, "#go").addEventListener("click", go); go();
  };

  D.fermatfact = function (host) {
    host.innerHTML = `<div class="demo-row"><label>n (odd)<input type="number" id="n" value="5959"></label><button class="btn" id="go">Factor</button></div><div id="o"></div>`;
    function go() {
      const n = +K.q(host, "#n").value;
      if (!(n > 3) || n % 2 === 0) { K.q(host, "#o").innerHTML = `<div class="out">Enter an odd composite n.</div>`; return; }
      let x = Math.ceil(Math.sqrt(n)); const rows = [];
      for (let i = 0; i < 40; i++, x++) {
        const y2 = x * x - n, y = Math.round(Math.sqrt(y2)), sq = y * y === y2;
        rows.push([x, `${x}² − ${n} = ${y2}`, sq ? `<b>${y}² ✓</b>` : "not a square"]);
        if (sq) { K.q(host, "#o").innerHTML = tbl(["x", "x² − n", "perfect square?"], rows) + `<div class="out">n = (x − y)(x + y) = (${x} − ${y})(${x} + ${y}) = <b>${x - y} × ${x + y}</b>${x - y === 1 ? " (trivial — n is prime or the factors are far apart)" : ""}</div>`; return; }
      }
      K.q(host, "#o").innerHTML = tbl(["x", "x² − n", "perfect square?"], rows) + `<div class="out">No square found in 40 tries — the factors are far apart, so Fermat's method is slow here.</div>`;
    }
    K.q(host, "#go").addEventListener("click", go); go();
  };

  D.crt = function (host) {
    host.innerHTML = `<p class="hint">Enter one congruence per line as "a m" meaning x ≡ a (mod m).</p><div class="demo-row"><label class="grow"><textarea id="t" rows="3">2 3\n3 5\n2 7</textarea></label><button class="btn" id="go">Solve</button></div><div id="o"></div>`;
    function go() {
      const eqs = K.q(host, "#t").value.trim().split(/\n+/).map(l => l.trim().split(/[\s,]+/).map(Number)).filter(e => e.length >= 2 && e[1] > 1);
      for (let i = 0; i < eqs.length; i++) for (let j = i + 1; j < eqs.length; j++) if (K.gcd(eqs[i][1], eqs[j][1]) !== 1) { K.q(host, "#o").innerHTML = `<div class="out no">Moduli ${eqs[i][1]} and ${eqs[j][1]} are not coprime — CRT does not apply.</div>`; return; }
      const M = eqs.reduce((p, e) => p * e[1], 1); let sum = 0;
      const rows = eqs.map(([a, m]) => { const Mi = M / m, inv = K.modInv(Mi % m, m); sum += a * Mi * inv; return [`x ≡ ${a} (mod ${m})`, Mi, `${Mi} mod ${m} = ${Mi % m}`, inv, a * Mi * inv]; });
      const x = K.mod(sum, M);
      K.q(host, "#o").innerHTML = `<div class="out">M = ${eqs.map(e => e[1]).join(" × ")} = <b>${M}</b></div>` + tbl(["Equation", "Mᵢ = M/mᵢ", "reduce", "Mᵢ⁻¹ (mod mᵢ)", "aᵢ·Mᵢ·Mᵢ⁻¹"], rows) +
        `<div class="out">x = ${rows.map(r => r[4]).join(" + ")} = ${sum} mod ${M} = <b class="big-out">${x}</b><br>Check: ${eqs.map(([a, m]) => `${x} mod ${m} = ${x % m}`).join(", ")}</div>`;
    }
    K.q(host, "#go").addEventListener("click", go); go();
  };

  D.rsa = function (host) {
    host.innerHTML = `<div class="demo-row"><label>p (prime)<input type="text" id="p" value="17" size="10"></label><label>q (prime)<input type="text" id="q" value="11" size="10"></label><label>e<input type="text" id="e" value="7" size="8"></label><label>Message P (number &lt; n)<input type="text" id="m" value="88" size="10"></label>
      <button class="btn ghost" id="big">Use bigger primes</button></div><div id="o"></div>`;
    const isP = b => { if (b < 2n) return false; if (b < 4n) return true; if (b % 2n === 0n) return false; for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) { if (a >= b) break; let d = b - 1n, s = 0; while (d % 2n === 0n) { d /= 2n; s++; } let x = K.bpow(a, d, b); if (x === 1n || x === b - 1n) continue; let comp = true; for (let i = 1; i < s; i++) { x = x * x % b; if (x === b - 1n) { comp = false; break; } } if (comp) return false; } return true; };
    function go() {
      const p = bigOr(K.q(host, "#p").value, 0n), q = bigOr(K.q(host, "#q").value, 0n), e = bigOr(K.q(host, "#e").value, 0n), m = bigOr(K.q(host, "#m").value, 0n);
      const o = K.q(host, "#o");
      if (!isP(p) || !isP(q) || p === q) { o.innerHTML = `<div class="out no">p and q must be two different primes.</div>`; return; }
      const n = p * q, phi = (p - 1n) * (q - 1n), g = K.bgcd(e, phi);
      let h = `<ol class="steps"><li>n = p × q = ${p} × ${q} = <b>${n}</b></li><li>φ(n) = (p − 1)(q − 1) = ${p - 1n} × ${q - 1n} = <b>${phi}</b></li>`;
      if (e <= 1n || e >= phi || g !== 1n) { o.innerHTML = h + `<li><span class="no">gcd(e, φ(n)) = ${g}; e must satisfy 1 &lt; e &lt; φ(n) and be coprime to φ(n).</span></li></ol>`; return; }
      const d = K.binv(e, phi);
      h += `<li>gcd(${e}, ${phi}) = 1 ✓ → d = e⁻¹ mod φ(n) = <b>${d}</b> (check ${e} × ${d} mod ${phi} = ${e * d % phi})</li><li>Public key (e, n) = (${e}, ${n}); private key d = ${d}</li>`;
      if (m < 0n || m >= n) { o.innerHTML = h + `<li><span class="no">Message must be 0 ≤ P &lt; n.</span></li></ol>`; return; }
      const c = K.bpow(m, e, n), back = K.bpow(c, d, n);
      const dp = d % (p - 1n), dq = d % (q - 1n), mp = K.bpow(c, dp, p), mq = K.bpow(c, dq, q);
      h += `<li>Encrypt: C = ${m}<sup>${e}</sup> mod ${n} = <b>${c}</b></li><li>Decrypt: P = ${c}<sup>${d}</sup> mod ${n} = <b>${back}</b> ${back === m ? '<span class="ok">✓</span>' : ""}</li></ol>
        <details class="more"><summary>Faster decryption with CRT (how real RSA libraries do it)</summary><div>P mod p = C<sup>d mod (p−1)</sup> mod p = ${c}<sup>${dp}</sup> mod ${p} = ${mp}<br>P mod q = C<sup>d mod (q−1)</sup> mod q = ${c}<sup>${dq}</sup> mod ${q} = ${mq}<br>CRT combine → P = <b>${crtBig([mp, mq], [p, q])}</b> (two small exponentiations instead of one big one ≈ 4× faster)</div></details>`;
      o.innerHTML = h;
    }
    K.q(host, "#big").addEventListener("click", () => { K.q(host, "#p").value = "1000000007"; K.q(host, "#q").value = "998244353"; K.q(host, "#e").value = "65537"; K.q(host, "#m").value = "123456789012345"; go(); });
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.rabin = function (host) {
    host.innerHTML = `<div class="demo-row"><label>p (≡ 3 mod 4)<input type="number" id="p" value="23"></label><label>q (≡ 3 mod 4)<input type="number" id="q" value="7"></label><label>Plaintext P<input type="number" id="m" value="24"></label></div><div id="o"></div>`;
    function go() {
      const p = BigInt(+K.q(host, "#p").value || 23), q = BigInt(+K.q(host, "#q").value || 7), m = BigInt(+K.q(host, "#m").value || 0), o = K.q(host, "#o");
      if (!K.isPrime(Number(p)) || !K.isPrime(Number(q)) || p % 4n !== 3n || q % 4n !== 3n || p === q) { o.innerHTML = `<div class="out no">p and q must be distinct primes with p ≡ q ≡ 3 (mod 4), e.g. 7, 11, 19, 23, 31, 43.</div>`; return; }
      const n = p * q; if (m >= n) { o.innerHTML = `<div class="out no">P must be less than n = ${n}.</div>`; return; }
      const C = m * m % n, a1 = K.bpow(C, (p + 1n) / 4n, p), a2 = K.bmod(-a1, p), b1 = K.bpow(C, (q + 1n) / 4n, q), b2 = K.bmod(-b1, q);
      const cands = [[a1, b1], [a1, b2], [a2, b1], [a2, b2]].map(([a, b]) => [a, b, crtBig([a, b], [p, q])]);
      o.innerHTML = `<ol class="steps"><li>n = ${p} × ${q} = ${n}</li><li>Encrypt: C = ${m}² mod ${n} = <b>${C}</b></li>
        <li>a₁ = C<sup>(p+1)/4</sup> mod p = ${C}<sup>${(p + 1n) / 4n}</sup> mod ${p} = ${a1}; a₂ = −a₁ = ${a2}</li>
        <li>b₁ = C<sup>(q+1)/4</sup> mod q = ${C}<sup>${(q + 1n) / 4n}</sup> mod ${q} = ${b1}; b₂ = −b₁ = ${b2}</li></ol>` +
        tbl(["mod p", "mod q", "CRT result", "square mod n"], cands.map(c => [c[0], c[1], c[2] === m ? `<b>${c[2]}</b> ← original` : c[2], c[2] * c[2] % n])) +
        `<div class="out">All four candidates square to C = ${C}; the receiver needs redundancy in the message to pick the right one.</div>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.elgamal = function (host) {
    host.innerHTML = `<div class="demo-row"><label>prime p<input type="number" id="p" value="11"></label><label>e₁ (primitive root)<input type="number" id="g" value="2"></label><label>private d<input type="number" id="d" value="3"></label><label>random r<input type="number" id="r" value="4"></label><label>Plaintext P<input type="number" id="m" value="7"></label></div><div id="o"></div>`;
    function go() {
      const [p, g, d, r, m] = ["p", "g", "d", "r", "m"].map(x => BigInt(+K.q(host, "#" + x).value || 0)), o = K.q(host, "#o");
      if (!K.isPrime(Number(p))) { o.innerHTML = `<div class="out no">p must be prime.</div>`; return; }
      let ord = 0, x = 1n; do { x = x * g % p; ord++; } while (x !== 1n && ord < Number(p));
      const e2 = K.bpow(g, d, p), c1 = K.bpow(g, r, p), s = K.bpow(e2, r, p), c2 = m * s % p, s2 = K.bpow(c1, d, p), si = K.binv(s2, p), back = c2 * si % p;
      o.innerHTML = `${ord !== Number(p) - 1 ? `<div class="out">Note: order of ${g} is ${ord}, so it is not a primitive root of ${p} (still works, but weaker).</div>` : ""}
        <ol class="steps"><li>Public: e₂ = e₁<sup>d</sup> mod p = ${g}<sup>${d}</sup> mod ${p} = <b>${e2}</b> → public key (${g}, ${e2}, ${p})</li>
        <li>C₁ = e₁<sup>r</sup> mod p = ${g}<sup>${r}</sup> mod ${p} = <b>${c1}</b></li>
        <li>C₂ = P × e₂<sup>r</sup> mod p = ${m} × ${s} mod ${p} = <b>${c2}</b></li>
        <li>Decrypt: C₁<sup>d</sup> = ${c1}<sup>${d}</sup> mod ${p} = ${s2}; its inverse = ${si}; P = ${c2} × ${si} mod ${p} = <b>${back}</b> ${back === m % p ? '<span class="ok">✓</span>' : ""}</li></ol>
        <p class="hint">Change r: the ciphertext changes but decryption still gives the same P — ElGamal is randomised.</p>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.eccreal = function (host) {
    host.innerHTML = `<div class="demo-row"><label>a<input type="number" id="a" value="-1" step="0.5"></label><label>b<input type="number" id="b" value="1" step="0.5"></label><label>x of P<input type="number" id="px" value="-1" step="0.1"></label><label>x of Q<input type="number" id="qx" value="0.6" step="0.1"></label><div class="seg" id="md"><button class="on" data-v="add">P + Q</button><button data-v="dbl">2P</button></div></div><div id="g"></div><div class="out" id="o"></div>`;
    let mode = "add";
    K.qa(host, "#md button").forEach(b => b.addEventListener("click", () => { mode = b.dataset.v; K.qa(host, "#md button").forEach(x => x.classList.toggle("on", x === b)); go(); }));
    function go() {
      const a = +K.q(host, "#a").value, b = +K.q(host, "#b").value, o = K.q(host, "#o");
      if (4 * a ** 3 + 27 * b ** 2 === 0) { o.innerHTML = `<span class="no">4a³ + 27b² = 0: singular curve, not allowed.</span>`; return; }
      const f = x => x ** 3 + a * x + b;
      const pt = (x, sign) => { const v = f(x); return v < 0 ? null : [x, sign * Math.sqrt(v)]; };
      const P = pt(+K.q(host, "#px").value, 1), Q = pt(+K.q(host, "#qx").value, 1);
      const W = 560, H = 380, X0 = -3, X1 = 3.5, Y0 = -5, Y1 = 5;
      const sx = x => (x - X0) / (X1 - X0) * W, sy = y => H - (y - Y0) / (Y1 - Y0) * H;
      const s = K.svg(W, H);
      K.s(s, "line", { x1: 0, x2: W, y1: sy(0), y2: sy(0), "class": "axis" }); K.s(s, "line", { y1: 0, y2: H, x1: sx(0), x2: sx(0), "class": "axis" });
      ["top", "bot"].forEach(side => {
        let d = "", pen = false;
        for (let i = 0; i <= 800; i++) { const x = X0 + (X1 - X0) * i / 800, v = f(x); if (v < 0) { pen = false; continue; } const y = (side === "top" ? 1 : -1) * Math.sqrt(v); if (Math.abs(y) > 6) { pen = false; continue; } d += (pen ? "L" : "M") + sx(x).toFixed(1) + "," + sy(y).toFixed(1); pen = true; }
        K.s(s, "path", { d, "class": "ln" });
      });
      if (!P || (mode === "add" && !Q)) { const c = K.q(host, "#g"); c.innerHTML = ""; c.appendChild(s); o.innerHTML = `Choose x values where x³ + ax + b ≥ 0 (the curve exists there).`; return; }
      let lam, R;
      if (mode === "dbl") lam = (3 * P[0] ** 2 + a) / (2 * P[1]);
      else { if (Math.abs(P[0] - Q[0]) < 1e-9) { o.innerHTML = "P and Q have the same x → vertical line → P + Q = O (or use 2P)."; return; } lam = (Q[1] - P[1]) / (Q[0] - P[0]); }
      const x3 = lam * lam - P[0] - (mode === "dbl" ? P[0] : Q[0]), y3 = lam * (P[0] - x3) - P[1]; R = [x3, y3];
      const line = K.s(s, "line", { x1: sx(X0), y1: sy(P[1] + lam * (X0 - P[0])), x2: sx(X1), y2: sy(P[1] + lam * (X1 - P[0])) }); line.style.stroke = "var(--warn)"; line.style.strokeWidth = "1.5";
      const v = K.s(s, "line", { x1: sx(x3), x2: sx(x3), y1: sy(-y3), y2: sy(y3), "class": "dg-dash" }); void v;
      const dot = (p, col, lab) => { const c = K.s(s, "circle", { cx: sx(p[0]), cy: sy(p[1]), r: 6 }); c.style.fill = col; K.s(s, "text", { x: sx(p[0]) + 9, y: sy(p[1]) - 8 }, lab).style.fontWeight = "700"; };
      dot(P, "var(--acc)", "P"); if (mode === "add") dot(Q, "var(--acc)", "Q");
      dot([x3, -y3], "var(--ink-3)", "R′"); dot(R, "var(--good)", mode === "add" ? "P+Q" : "2P");
      const c = K.q(host, "#g"); c.innerHTML = ""; c.appendChild(s);
      o.innerHTML = `λ = ${mode === "add" ? `(y₂ − y₁)/(x₂ − x₁)` : `(3x₁² + a)/(2y₁)`} = <b>${K.num(lam, 3)}</b>; x₃ = λ² − x₁ − x₂ = <b>${K.num(x3, 3)}</b>; y₃ = λ(x₁ − x₃) − y₁ = <b>${K.num(y3, 3)}</b>.<br>The ${mode === "add" ? "line through P and Q" : "tangent at P"} (orange) meets the curve again at R′; reflecting R′ in the x-axis gives the result (green).`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.eccfp = function (host) {
    host.innerHTML = `<div class="demo-row"><label>p (prime)<input type="number" id="p" value="23"></label><label>a<input type="number" id="a" value="1"></label><label>b<input type="number" id="b" value="1"></label><label>Base point G = (x,y)<input type="text" id="g" value="3,10" size="7"></label><label>k (scalar)<input type="range" id="k" min="1" max="30" value="1"></label><span id="kv" style="padding-bottom:8px"></span></div><div class="two-col" style="align-items:start"><div id="pl"></div><div id="o"></div></div>`;
    function go() {
      const p = +K.q(host, "#p").value, a = +K.q(host, "#a").value, b = +K.q(host, "#b").value, o = K.q(host, "#o");
      if (!K.isPrime(p) || p > 211) { o.innerHTML = `<div class="out no">Use a prime p ≤ 211.</div>`; return; }
      if (K.mod(4 * a ** 3 + 27 * b ** 2, p) === 0) { o.innerHTML = `<div class="out no">Singular curve.</div>`; return; }
      const pts = []; for (let x = 0; x < p; x++) for (let y = 0; y < p; y++) if (K.mod(y * y - (x ** 3 + a * x + b), p) === 0) pts.push([x, y]);
      const add = (P, Q) => { if (!P) return Q; if (!Q) return P; let l; if (P[0] === Q[0] && K.mod(P[1] + Q[1], p) === 0) return null; if (P[0] === Q[0] && P[1] === Q[1]) l = K.mod((3 * P[0] * P[0] + a) * K.modInv(2 * P[1], p), p); else l = K.mod((Q[1] - P[1]) * K.modInv(Q[0] - P[0], p), p); const x = K.mod(l * l - P[0] - Q[0], p); return [x, K.mod(l * (P[0] - x) - P[1], p)]; };
      const gv = K.q(host, "#g").value.split(/[\s,]+/).map(Number);
      const G = pts.find(q => q[0] === gv[0] && q[1] === gv[1]) || pts[0];
      const mult = []; let cur = null; for (let i = 1; i <= 60; i++) { cur = add(cur, G); mult.push(cur); if (!cur) break; }
      const order = mult.length; const ks = K.q(host, "#k"); ks.max = order; const k = Math.min(+ks.value, order);
      K.q(host, "#kv").innerHTML = `k = ${k}`;
      const W = 360, S = W / p, s = K.svg(W + 30, W + 30);
      for (let i = 0; i <= p; i += Math.ceil(p / 10)) { K.s(s, "text", { x: 24 + i * S, y: W + 26, "text-anchor": "middle" }, i); K.s(s, "text", { x: 18, y: W - i * S + 4, "text-anchor": "end" }, i); }
      K.s(s, "rect", { x: 24, y: 0, width: W, height: W, fill: "none", "class": "gridl" });
      const kP = mult[k - 1];
      pts.forEach(q => { const c = K.s(s, "circle", { cx: 24 + (q[0] + 0.5) * S, cy: W - (q[1] + 0.5) * S, r: Math.max(2.5, Math.min(6, S / 2.5)) }); c.style.fill = q === G ? "var(--warn)" : (kP && q[0] === kP[0] && q[1] === kP[1]) ? "var(--good)" : "var(--acc)"; K.s(c, "title", {}, `(${q[0]}, ${q[1]})`); });
      const pl = K.q(host, "#pl"); pl.innerHTML = ""; pl.appendChild(s);
      o.innerHTML = `<div class="out">E<sub>${p}</sub>(${a}, ${b}): y² ≡ x³ + ${a}x + ${b} (mod ${p}) has <b>${pts.length}</b> points + O = ${pts.length + 1}.<br>G = (${G[0]}, ${G[1]}) (orange) has order <b>${order}</b>.<br><b>${k}G = ${kP ? `(${kP[0]}, ${kP[1]})` : "O (point at infinity)"}</b> (green)</div>
        <div class="out mono" style="max-height:220px;overflow:auto;margin-top:8px">${mult.slice(0, k).map((q, i) => `${String(i + 1).padStart(2)}G = ${q ? `(${q[0]}, ${q[1]})` : "O"}`).join("\n")}</div>
        <p class="hint">Easy: k → kG. Hard (ECDLP): given kG, find k — on a 256-bit curve the points look completely scattered, as here.</p>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.hashlive = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Message<input type="text" id="m" value="Pay Ravi Rs 500" class="wide"></label></div><div class="demo-row"><label class="grow">Changed message<input type="text" id="m2" value="Pay Ravi Rs 501" class="wide"></label></div><div id="o"></div>`;
    const bitsDiff = (h1, h2) => { let n = 0; for (let i = 0; i < h1.length; i++) { let x = parseInt(h1[i], 16) ^ parseInt(h2[i], 16); while (x) { n += x & 1; x >>= 1; } } return n; };
    const showDiff = (h1, h2) => [...h2].map((c, i) => c === h1[i] ? c : `<span style="color:var(--bad);font-weight:700">${c}</span>`).join("");
    function go() {
      const a = K.q(host, "#m").value, b = K.q(host, "#m2").value;
      const m1 = CC.md5(CC.utf8(a)), m2 = CC.md5(CC.utf8(b)), s1 = CC.sha512(CC.utf8(a)), s2 = CC.sha512(CC.utf8(b));
      K.q(host, "#o").innerHTML = `<div class="out mono">MD5 (128 bits)\n  ${m1}\n  ${showDiff(m1, m2)}\n  → ${bitsDiff(m1, m2)} of 128 bits differ\n\nSHA-512 (512 bits)\n  ${s1}\n  ${showDiff(s1, s2)}\n  → ${bitsDiff(s1, s2)} of 512 bits differ (≈ half: avalanche)</div>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.birthday = function (host) {
    host.innerHTML = `<div class="demo-row"><label>People in the room: <b id="kv"></b><input type="range" id="k" min="2" max="80" value="23"></label><button class="btn ghost" id="sim">Simulate 1000 rooms</button></div><div id="ch"></div><div class="out" id="o"></div>`;
    const prob = k => { let q = 1; for (let i = 0; i < k; i++) q *= (365 - i) / 365; return 1 - q; };
    function go(sim) {
      const k = +K.q(host, "#k").value; K.q(host, "#kv").textContent = k;
      const xs = [...Array(79).keys()].map(i => i + 2);
      const ch = K.lineChart({ labels: xs.map(String), series: [{ values: xs.map(prob), name: "P(shared birthday)" }], yMax: 1, h: 220 });
      const c = K.q(host, "#ch"); c.innerHTML = ""; c.appendChild(ch);
      let simTxt = "";
      if (sim) { let hit = 0; for (let t = 0; t < 1000; t++) { const s = new Set(); for (let i = 0; i < k; i++) { const d = Math.floor(Math.random() * 365); if (s.has(d)) { hit++; break; } s.add(d); } } simTxt = `<br>Simulation: <b>${hit}</b> of 1000 random rooms had a shared birthday (${(hit / 10).toFixed(1)}%).`; }
      K.q(host, "#o").innerHTML = `With ${k} people, P(at least two share a birthday) = <b>${(100 * prob(k)).toFixed(1)}%</b>.${simTxt}<br>Hash analogy: an n-bit hash has 2<sup>n</sup> "birthdays"; a collision is expected after ≈ 2<sup>n/2</sup> messages → MD5: 2<sup>64</sup>, SHA-512: 2<sup>256</sup>.`;
    }
    K.q(host, "#k").addEventListener("input", () => go(false)); K.q(host, "#sim").addEventListener("click", () => go(true)); go(false);
  };

  D.sha512 = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Message<input type="text" id="m" value="abc" class="wide"></label><label>Show round<input type="range" id="r" min="0" max="79" value="0"></label><span id="rv" style="padding-bottom:8px"></span></div><div id="o"></div>`;
    function go() {
      const msg = CC.utf8(K.q(host, "#m").value), res = CC.sha512(msg, true), t = res.trace, L = msg.length * 8;
      const zeros = K.mod(-L - 129, 1024), r = +K.q(host, "#r").value; K.q(host, "#rv").textContent = `t = ${r}`;
      const blk = t.blocks[0], hexBlock = t.padded.slice(0, 128).map(CC.hx).join("");
      const h = CC.h64;
      K.q(host, "#o").innerHTML = `<div class="out">Length |M| = ${L} bits → zeros = (−${L} − 129) mod 1024 = <b>${zeros}</b> → total ${L + 1 + zeros + 128} bits = <b>${t.padded.length / 128}</b> block(s) of 1024 bits.</div>
        <details class="more" open><summary>Block 1 after padding (hex) and its 16 words W₀…W₁₅</summary><div class="mono" style="word-break:break-all;font-size:.8rem">${hexBlock.replace(/(.{16})/g, "$1 ")}</div></details>
        <details class="more"><summary>Message schedule W₀ … W₇₉</summary><div class="mono" style="font-size:.8rem;white-space:pre-wrap">${blk.W.map((w, i) => `W${String(i).padStart(2, "0")} = ${h(w)}`).join("\n")}</div></details>
        <div class="out mono" style="font-size:.82rem">Working variables after round ${r} (block 1):\n${["A", "B", "C", "D", "E", "F", "G", "H"].map((n, i) => `${n} = ${h(blk.rounds[r][i])}`).join("\n")}</div>
        <div class="out mono" style="font-size:.82rem;margin-top:8px">Digest (${t.blocks.length} block${t.blocks.length > 1 ? "s" : ""}):\n${res.hex.replace(/(.{64})/g, "$1\n")}</div>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  /* --------------------------------------------------------------- Unit IV */

  /* Generic protocol stepper: actors across the top, messages as arrows. */
  function seqDemo(host, cfg) {
    host.innerHTML = `<div class="demo-row"><button class="btn ghost" id="pv">◀ Back</button><button class="btn" id="nx">Next message ▶</button><button class="btn ghost" id="al">Show all</button><span id="ct" style="padding-bottom:8px"></span></div><div id="sv"></div><div class="out" id="ex"></div>`;
    let i = 0, all = false;
    const A = cfg.actors, n = cfg.steps.length, W = 680, colW = W / A.length, rowH = 44, H = 60 + n * rowH;
    const X = name => colW * A.indexOf(name) + colW / 2;
    function draw() {
      const s = K.svg(W, H);
      A.forEach(a => {
        const r = K.s(s, "rect", { x: X(a) - 62, y: 6, width: 124, height: 30, rx: 7, "class": "dg-acc" }); void r;
        K.s(s, "text", { x: X(a), y: 26, "text-anchor": "middle", "class": "dg-tb" }, a);
        K.s(s, "line", { x1: X(a), x2: X(a), y1: 36, y2: H - 4, "class": "dg-dash" });
      });
      cfg.steps.forEach((st, k) => {
        if (!all && k > i) return;
        const y = 64 + k * rowH, x1 = X(st.from), x2 = X(st.to), cur = k === i && !all;
        const ln = K.s(s, "line", { x1, x2: x2 + (x2 > x1 ? -6 : 6), y1: y, y2: y, "marker-end": cur ? "url(#arrA)" : "url(#arr)" });
        ln.setAttribute("class", cur ? "dg-accline" : "dg-line");
        const t = K.s(s, "text", { x: (x1 + x2) / 2, y: y - 7, "text-anchor": "middle", "class": cur ? "dg-ta" : "dg-ts" }, `${k + 1}. ${st.label}`);
        void t;
      });
      const sv = K.q(host, "#sv"); sv.innerHTML = ""; sv.appendChild(s);
      K.q(host, "#ct").textContent = all ? `all ${n} messages` : `message ${i + 1} / ${n}`;
      const st = cfg.steps[all ? n - 1 : i];
      K.q(host, "#ex").innerHTML = all ? (cfg.summary || "") : `<b>${i + 1}. ${st.from} → ${st.to}:</b> ${st.text}`;
    }
    K.q(host, "#nx").addEventListener("click", () => { all = false; if (i < n - 1) i++; draw(); });
    K.q(host, "#pv").addEventListener("click", () => { all = false; if (i > 0) i--; draw(); });
    K.q(host, "#al").addEventListener("click", () => { all = !all; draw(); });
    draw();
  }

  D.rsasign = function (host) {
    host.innerHTML = `<div class="demo-row"><label>p<input type="number" id="p" value="61"></label><label>q<input type="number" id="q" value="53"></label><label>e<input type="number" id="e" value="17"></label></div>
      <div class="demo-row"><label class="grow">Message Alice signs<input type="text" id="m" value="Transfer 500 to Bob" class="wide"></label></div>
      <div class="demo-row"><label class="grow">Message Bob receives (edit to tamper)<input type="text" id="m2" value="Transfer 500 to Bob" class="wide"></label></div><div id="o"></div>`;
    const h = (txt, n) => { const hx = CC.sha512(CC.utf8(txt)); return BigInt("0x" + hx.slice(0, 12)) % n; }; // toy: hash reduced mod n
    function go() {
      const p = BigInt(+K.q(host, "#p").value), q = BigInt(+K.q(host, "#q").value), e = BigInt(+K.q(host, "#e").value), o = K.q(host, "#o");
      if (!K.isPrime(Number(p)) || !K.isPrime(Number(q)) || p === q) { o.innerHTML = `<div class="out no">p and q must be distinct primes.</div>`; return; }
      const n = p * q, phi = (p - 1n) * (q - 1n);
      if (K.bgcd(e, phi) !== 1n) { o.innerHTML = `<div class="out no">e must be coprime to φ(n) = ${phi}.</div>`; return; }
      const d = K.binv(e, phi), hm = h(K.q(host, "#m").value, n), S = K.bpow(hm, d, n), hm2 = h(K.q(host, "#m2").value, n), V = K.bpow(S, e, n);
      o.innerHTML = `<div class="out">Keys: n = ${n}, public e = ${e}, private d = ${d}.<br>
        <b>Alice:</b> h(M) mod n = ${hm} → S = h(M)<sup>d</sup> mod n = <b>${S}</b><br>
        <b>Bob:</b> recomputes h(M′) mod n = ${hm2}; verifies S<sup>e</sup> mod n = ${V}<br>
        ${V === hm2 ? '<span class="ok">✓ Signature valid — message authentic and unchanged.</span>' : '<span class="no">✗ Signature INVALID — the message was altered (or not signed by Alice).</span>'}</div>
        <p class="hint">Toy hash: first 48 bits of SHA-512 reduced mod n. Real systems use 2048-bit n and padded full hashes.</p>`;
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.needham = function (host) {
    seqDemo(host, {
      actors: ["Alice", "KDC", "Bob"],
      steps: [
        { from: "Alice", to: "KDC", label: "R_A, Alice, Bob", text: "Alice asks the KDC for a session key to talk to Bob, including a fresh nonce R<sub>A</sub>." },
        { from: "KDC", to: "Alice", label: "K_A[R_A, Bob, K_AB, ticket]", text: "Encrypted with Alice's long-term key. Contains her nonce (proves freshness), the session key K<sub>AB</sub> and a ticket = K<sub>B</sub>[Alice, K<sub>AB</sub>] that only Bob can open." },
        { from: "Alice", to: "Bob", label: "ticket = K_B[Alice, K_AB]", text: "Alice forwards the ticket. Bob decrypts it with his key and learns K<sub>AB</sub> and that it is for Alice." },
        { from: "Bob", to: "Alice", label: "K_AB[R_B]", text: "Bob challenges Alice with a new nonce encrypted under the session key." },
        { from: "Alice", to: "Bob", label: "K_AB[R_B − 1]", text: "Alice proves she holds K<sub>AB</sub> by returning R<sub>B</sub> − 1. Both now share K<sub>AB</sub>. (Weakness: a replayed old ticket with a stolen old K<sub>AB</sub> fools Bob — Kerberos adds timestamps.)" }
      ],
      summary: "Five messages: the KDC delivers a fresh session key to both parties; nonces prevent replay of KDC answers to Alice."
    });
  };

  D.kerberos = function (host) {
    seqDemo(host, {
      actors: ["Alice", "AS", "TGS", "Bob (server)"],
      steps: [
        { from: "Alice", to: "AS", label: "Alice's ID", text: "Alice types her username. Only her identity is sent — <b>never the password</b>." },
        { from: "AS", to: "Alice", label: "K_A-AS[K_A-TGS, TGS ticket]", text: "AS looks up Alice's password-derived key K<sub>A-AS</sub> and returns a session key for the TGS plus a ticket for the TGS (encrypted with the AS–TGS key). Alice's workstation now asks for her password, derives K<sub>A-AS</sub> and decrypts. Wrong password → cannot decrypt." },
        { from: "Alice", to: "TGS", label: "TGS ticket, Bob, K_A-TGS[T]", text: "Alice asks for access to Bob, sending the TGS ticket and an authenticator (timestamp T encrypted with K<sub>A-TGS</sub>) — prevents replay." },
        { from: "TGS", to: "Alice", label: "K_A-TGS[Bob, K_A-B], K_TGS-B[Alice, K_A-B]", text: "TGS issues a session key K<sub>A-B</sub> for Alice and a ticket for Bob containing the same key, encrypted with Bob's key." },
        { from: "Alice", to: "Bob (server)", label: "Bob's ticket, K_A-B[T]", text: "Alice presents Bob's ticket and a fresh timestamp encrypted with K<sub>A-B</sub>." },
        { from: "Bob (server)", to: "Alice", label: "K_A-B[T + 1]", text: "Bob proves his identity by returning T + 1 under K<sub>A-B</sub> — mutual authentication. Alice can now use the service; for another server she repeats from message 3 (single sign-on)." }
      ],
      summary: "Login once (messages 1–2), then get service tickets from the TGS (3–4) and use them with servers (5–6). Tickets expire, timestamps stop replay."
    });
  };

  D.tlshandshake = function (host) {
    seqDemo(host, {
      actors: ["Client (browser)", "Server (website)"],
      steps: [
        { from: "Client (browser)", to: "Server (website)", label: "ClientHello", text: "<b>Phase I.</b> Highest version supported, client random (32 bytes), session ID, list of cipher suites, compression methods." },
        { from: "Server (website)", to: "Client (browser)", label: "ServerHello", text: "<b>Phase I.</b> Chosen version and cipher suite (e.g. TLS_RSA_WITH_AES_128_CBC_SHA), server random, session ID." },
        { from: "Server (website)", to: "Client (browser)", label: "Certificate", text: "<b>Phase II.</b> Server's X.509 certificate chain. The browser checks the CA signature, validity dates and that the name matches the URL." },
        { from: "Server (website)", to: "Client (browser)", label: "ServerKeyExchange (if DHE)", text: "<b>Phase II.</b> For ephemeral Diffie–Hellman: the server's DH parameters, signed with its private key. (Skipped for plain RSA key exchange.)" },
        { from: "Server (website)", to: "Client (browser)", label: "ServerHelloDone", text: "<b>Phase II.</b> End of the server's hello messages. (A CertificateRequest may come before it if client authentication is needed.)" },
        { from: "Client (browser)", to: "Server (website)", label: "ClientKeyExchange", text: "<b>Phase III.</b> RSA: a random 48-byte pre-master secret encrypted with the server's public key. DHE: the client's DH value. Both sides now compute master secret = PRF(pre-master, client random, server random) → key material." },
        { from: "Client (browser)", to: "Server (website)", label: "ChangeCipherSpec", text: "<b>Phase IV.</b> \"Switch to the new keys now.\"" },
        { from: "Client (browser)", to: "Server (website)", label: "Finished (encrypted)", text: "<b>Phase IV.</b> First encrypted message: a MAC/hash of all handshake messages. Detects any tampering (e.g. a downgrade of the cipher list)." },
        { from: "Server (website)", to: "Client (browser)", label: "ChangeCipherSpec", text: "<b>Phase IV.</b> The server switches too." },
        { from: "Server (website)", to: "Client (browser)", label: "Finished (encrypted)", text: "<b>Phase IV.</b> Server's hash of the handshake. Handshake complete — the padlock appears; application data (HTTP) now flows through the Record protocol." }
      ],
      summary: "Phase I hello · Phase II server authentication · Phase III key exchange · Phase IV ChangeCipherSpec + Finished."
    });
  };

  D.dh = function (host) {
    host.innerHTML = `<div class="demo-row"><label>prime p<input type="number" id="p" value="23"></label><label>generator g<input type="number" id="g" value="7"></label><label>Alice's secret x<input type="number" id="x" value="3"></label><label>Bob's secret y<input type="number" id="y" value="6"></label>
      <label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="mitm"> Eve in the middle (secret z)</label><label>z<input type="number" id="z" value="5"></label></div><div id="o"></div>`;
    const sw = (c, t) => `<span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${c};vertical-align:-2px;margin-right:4px"></span>${t}`;
    function hue(v, p) { return `hsl(${Math.round(360 * Number(v) / Number(p))},70%,55%)`; }
    function go() {
      const [p, g, x, y, z] = ["p", "g", "x", "y", "z"].map(k => BigInt(+K.q(host, "#" + k).value || 2)), m = K.q(host, "#mitm").checked, o = K.q(host, "#o");
      if (!K.isPrime(Number(p))) { o.innerHTML = `<div class="out no">p must be prime.</div>`; return; }
      const R1 = K.bpow(g, x, p), R2 = K.bpow(g, y, p);
      if (!m) {
        const KA = K.bpow(R2, x, p), KB = K.bpow(R1, y, p);
        o.innerHTML = `<div class="two-col"><div class="out"><b>Alice</b><br>secret x = ${x}<br>sends R₁ = ${g}<sup>${x}</sup> mod ${p} = <b>${R1}</b><br>receives R₂ = ${R2}<br>K = R₂<sup>x</sup> mod p = ${R2}<sup>${x}</sup> mod ${p} = ${sw(hue(KA, p), "<b>" + KA + "</b>")}</div>
          <div class="out"><b>Bob</b><br>secret y = ${y}<br>sends R₂ = ${g}<sup>${y}</sup> mod ${p} = <b>${R2}</b><br>receives R₁ = ${R1}<br>K = R₁<sup>y</sup> mod p = ${R1}<sup>${y}</sup> mod ${p} = ${sw(hue(KB, p), "<b>" + KB + "</b>")}</div></div>
          <div class="out" style="margin-top:8px">${KA === KB ? '<span class="ok">Same key on both sides ✓</span>' : ""} Eve sees only p = ${p}, g = ${g}, R₁ = ${R1}, R₂ = ${R2}. To get K she must find x from ${g}<sup>x</sup> ≡ ${R1} (mod ${p}) — the discrete log problem.<br><i>Paint analogy:</i> common yellow + Alice's secret colour → mixture sent; mixing is easy, "un-mixing" is hard.</div>`;
      } else {
        const Rz = K.bpow(g, z, p), KA = K.bpow(Rz, x, p), KB = K.bpow(Rz, y, p), KEA = K.bpow(R1, z, p), KEB = K.bpow(R2, z, p);
        o.innerHTML = `<div class="three-col"><div class="out"><b>Alice</b><br>sends R₁ = ${R1} (intercepted)<br>receives Eve's ${Rz}<br>K = ${sw(hue(KA, p), "<b>" + KA + "</b>")}</div>
          <div class="out" style="border-color:var(--bad)"><b style="color:var(--bad)">Eve</b><br>sends g<sup>z</sup> = ${Rz} to both<br>key with Alice = R₁<sup>z</sup> = ${sw(hue(KEA, p), "<b>" + KEA + "</b>")}<br>key with Bob = R₂<sup>z</sup> = ${sw(hue(KEB, p), "<b>" + KEB + "</b>")}</div>
          <div class="out"><b>Bob</b><br>sends R₂ = ${R2} (intercepted)<br>receives Eve's ${Rz}<br>K = ${sw(hue(KB, p), "<b>" + KB + "</b>")}</div></div>
          <div class="out" style="margin-top:8px"><span class="no">Man-in-the-middle:</span> Alice shares ${KA} with Eve, Bob shares ${KB} with Eve. Eve decrypts, reads and re-encrypts every message; Alice and Bob notice nothing. Defence: sign R₁ and R₂ (station-to-station protocol, authenticated TLS/IKE).</div>`;
      }
    }
    K.qa(host, "input").forEach(i => i.addEventListener("input", go)); go();
  };

  D.radix64 = function (host) {
    host.innerHTML = `<div class="demo-row"><label class="grow">Text (or bytes) to convert<input type="text" id="t" value="Man" class="wide"></label></div><div id="o"></div>`;
    const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function go() {
      const b = CC.utf8(K.q(host, "#t").value).slice(0, 12);
      const bits = b.map(x => K.bin(x, 8)).join("");
      const groups = []; for (let i = 0; i < bits.length; i += 6) groups.push(bits.slice(i, i + 6).padEnd(6, "0"));
      let out = groups.map(g => B64[parseInt(g, 2)]).join(""); while (out.length % 4) out += "=";
      K.q(host, "#o").innerHTML = `<div class="out mono">bytes : ${b.map(x => CC.hx(x)).join("       ")}\nbits  : ${b.map(x => K.bin(x, 8)).join(" ")}\n6-bit : ${groups.join("  ")}\nvalue : ${groups.map(g => String(parseInt(g, 2)).padStart(2)).join("      ")}\nchar  : ${groups.map(g => B64[parseInt(g, 2)]).join("       ")}</div>
        <div class="out">Radix-64: <b class="big-out">${out}</b> &nbsp; (${b.length} bytes → ${out.length} characters; every 3 bytes become 4 printable characters, "=" pads the last group). Browser check: ${(() => { try { return btoa(String.fromCharCode(...b)); } catch (e) { return "-"; } })()}</div>`;
    }
    K.q(host, "#t").addEventListener("input", go); go();
  };

  D.ipsec = function (host) {
    host.innerHTML = `<div class="demo-row"><div class="seg" id="mode"><button class="on" data-v="t">Transport mode</button><button data-v="u">Tunnel mode</button></div><div class="seg" id="prot"><button class="on" data-v="esp">ESP</button><button data-v="ah">AH</button></div></div><div id="o"></div>`;
    let mode = "t", prot = "esp";
    const seg = (id, setter) => K.qa(host, `#${id} button`).forEach(b => b.addEventListener("click", () => { setter(b.dataset.v); K.qa(host, `#${id} button`).forEach(x => x.classList.toggle("on", x === b)); go(); }));
    seg("mode", v => mode = v); seg("prot", v => prot = v);
    function go() {
      const parts = [];
      if (mode === "u") parts.push(["New IP header", "acc", "gateway → gateway"]);
      else parts.push(["IP header", "box", "original addresses"]);
      parts.push([prot === "esp" ? "ESP header" : "AH header", "warn", "SPI, seq. no."]);
      if (mode === "u") parts.push(["Original IP header", "good", "real host addresses"]);
      parts.push(["TCP/UDP + data", "good", ""]);
      if (prot === "esp") { parts.push(["ESP trailer", "warn", "pad, next hdr"]); parts.push(["ESP auth", "warn", "HMAC"]); }
      const firstEnc = 2, lastEnc = parts.length - (prot === "esp" ? 2 : 1);
      const authStart = prot === "esp" ? 1 : 0, authEnd = prot === "esp" ? parts.length - 2 : parts.length - 1;
      const W = 680, s = K.svg(W, 150); let x = 4; const w = (W - 8) / parts.length;
      parts.forEach((pt, i) => {
        K.s(s, "rect", { x: x + 1, y: 40, width: w - 2, height: 44, rx: 5, "class": "dg-" + pt[1] });
        K.s(s, "text", { x: x + w / 2, y: 60, "text-anchor": "middle", "class": "dg-t" }, pt[0].length > 18 ? pt[0].slice(0, 17) + "…" : pt[0]).style.fontSize = "11px";
        if (pt[2]) K.s(s, "text", { x: x + w / 2, y: 76, "text-anchor": "middle", "class": "dg-ts" }, pt[2]);
        x += w;
      });
      const bracket = (a, b, y, cls, label) => { const x1 = 4 + a * w + 3, x2 = 4 + (b + 1) * w - 3; const pth = K.s(s, "path", { d: `M${x1} ${y + (y < 40 ? 8 : -8)} V${y} H${x2} V${y + (y < 40 ? 8 : -8)}` }); pth.setAttribute("class", cls); K.s(s, "text", { x: (x1 + x2) / 2, y: y < 40 ? y - 4 : y + 14, "text-anchor": "middle", "class": "dg-ts" }, label); };
      if (prot === "esp") bracket(firstEnc, lastEnc, 100, "dg-badline", "encrypted");
      bracket(authStart, authEnd, 22, "dg-goodline", prot === "ah" ? "authenticated (except mutable IP fields)" : "authenticated");
      const o = K.q(host, "#o"); o.innerHTML = ""; o.appendChild(s);
      const d = document.createElement("div"); d.className = "out";
      d.innerHTML = `<b>${mode === "t" ? "Transport" : "Tunnel"} mode + ${prot.toUpperCase()}</b>: ${prot === "esp" ? "confidentiality + integrity + authentication" : "integrity + authentication only (no encryption)"}. ${mode === "u" ? "The real source/destination are hidden inside — typical site-to-site VPN." : "The original IP header is visible — typical host-to-host protection."} ${prot === "ah" && mode === "t" ? "AH covers the IP header too, so it breaks through NAT." : ""}`;
      o.appendChild(d);
    }
    go();
  };
})();
