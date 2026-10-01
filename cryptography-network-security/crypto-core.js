/* ==========================================================================
   crypto-core.js — small, readable reference implementations used by the
   demos. They are written for learning (with step traces), not for real
   security. Verified against published test vectors (see comments).
   ========================================================================== */
(function (root) {
  "use strict";
  const CC = {};
  const A2Z = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const mod = (a, n) => ((a % n) + n) % n;
  const clean = s => String(s).toUpperCase().replace(/[^A-Z]/g, "");
  const n2c = n => A2Z[mod(n, 26)];
  const c2n = c => c.charCodeAt(0) - 65;
  function inv(a, n) { a = mod(a, n); for (let x = 1; x < n; x++) if ((a * x) % n === 1) return x; return null; }
  CC.clean = clean; CC.mod = mod; CC.inv = inv;

  /* ---------------- Classical substitution ---------------- */
  CC.affineEnc = (p, a, b) => [...clean(p)].map(c => n2c(c2n(c) * a + b)).join("");
  CC.affineDec = (c, a, b) => { const ai = inv(a, 26); return ai === null ? null : [...clean(c)].map(ch => n2c((c2n(ch) - b) * ai)).join(""); };
  CC.monoEnc = (p, key) => [...clean(p)].map(c => key[c2n(c)]).join("");
  CC.monoDec = (c, key) => [...clean(c)].map(ch => A2Z[key.indexOf(ch)]).join("");
  CC.vigenere = (p, k, dec) => { p = clean(p); k = clean(k); return [...p].map((c, i) => n2c(c2n(c) + (dec ? -1 : 1) * c2n(k[i % k.length]))).join(""); };
  CC.autokeyEnc = (p, k1) => { p = clean(p); let key = k1, out = ""; for (const c of p) { out += n2c(c2n(c) + key); key = c2n(c); } return out; };
  CC.autokeyDec = (c, k1) => { c = clean(c); let key = k1, out = ""; for (const ch of c) { const pn = mod(c2n(ch) - key, 26); out += A2Z[pn]; key = pn; } return out; };

  /* Playfair (I/J share a cell). Returns {matrix, pairs, out} */
  CC.playfairMatrix = function (key) {
    const seen = new Set(), m = [];
    for (const c of (clean(key) + A2Z).replace(/J/g, "I")) if (!seen.has(c)) { seen.add(c); m.push(c); }
    return m; // 25 letters, row-major
  };
  CC.playfairPairs = function (p, filler) {
    filler = filler || "X";
    p = clean(p).replace(/J/g, "I");
    const pairs = [];
    let i = 0;
    while (i < p.length) {
      const a = p[i], b = p[i + 1];
      if (b === undefined) { pairs.push(a + (a === filler ? "Z" : filler)); i += 1; }
      else if (a === b) { pairs.push(a + (a === filler ? "Z" : filler)); i += 1; }
      else { pairs.push(a + b); i += 2; }
    }
    return pairs;
  };
  CC.playfair = function (text, key, dec) {
    const m = CC.playfairMatrix(key), pos = {};
    m.forEach((c, i) => pos[c] = [Math.floor(i / 5), i % 5]);
    const pairs = dec ? (clean(text).replace(/J/g, "I").match(/.{1,2}/g) || []) : CC.playfairPairs(text);
    const s = dec ? -1 : 1, steps = [];
    const out = pairs.map(pr => {
      const [r1, c1] = pos[pr[0]], [r2, c2] = pos[pr[1]];
      let x, y, rule;
      if (r1 === r2) { x = m[r1 * 5 + mod(c1 + s, 5)]; y = m[r2 * 5 + mod(c2 + s, 5)]; rule = "same row → " + (dec ? "left" : "right"); }
      else if (c1 === c2) { x = m[mod(r1 + s, 5) * 5 + c1]; y = m[mod(r2 + s, 5) * 5 + c2]; rule = "same column → " + (dec ? "up" : "down"); }
      else { x = m[r1 * 5 + c2]; y = m[r2 * 5 + c1]; rule = "rectangle → swap columns"; }
      steps.push({ pair: pr, out: x + y, rule });
      return x + y;
    }).join("");
    return { matrix: m, pairs, out, steps };
  };

  /* Hill 2x2 with row vectors: C = P × K (mod 26) */
  CC.hill2 = function (text, K, dec) {
    let p = clean(text); if (p.length % 2) p += "X";
    let M = K;
    if (dec) {
      const det = mod(K[0][0] * K[1][1] - K[0][1] * K[1][0], 26), di = inv(det, 26);
      if (di === null) return null;
      M = [[mod(K[1][1] * di, 26), mod(-K[0][1] * di, 26)], [mod(-K[1][0] * di, 26), mod(K[0][0] * di, 26)]];
    }
    let out = ""; const steps = [];
    for (let i = 0; i < p.length; i += 2) {
      const x = c2n(p[i]), y = c2n(p[i + 1]);
      const a = x * M[0][0] + y * M[1][0], b = x * M[0][1] + y * M[1][1];
      steps.push({ blk: p[i] + p[i + 1], v: [x, y], raw: [a, b], r: [mod(a, 26), mod(b, 26)] });
      out += n2c(a) + n2c(b);
    }
    return { out, steps, M };
  };

  /* Transposition */
  CC.railEnc = function (p, rails) {
    p = clean(p); const rows = Array.from({ length: rails }, () => []);
    let r = 0, d = 1; const path = [];
    for (let i = 0; i < p.length; i++) { rows[r].push(p[i]); path.push(r); if (rails > 1) { if (r === 0) d = 1; else if (r === rails - 1) d = -1; r += d; } }
    return { out: rows.map(x => x.join("")).join(""), path, rows };
  };
  CC.railDec = function (c, rails) {
    c = clean(c); const { path } = CC.railEnc("A".repeat(c.length), rails);
    const counts = Array(rails).fill(0); path.forEach(r => counts[r]++);
    const rows = []; let k = 0;
    for (let r = 0; r < rails; r++) { rows.push(c.slice(k, k + counts[r]).split("")); k += counts[r]; }
    return path.map(r => rows[r].shift()).join("");
  };
  /* Keyed columnar: key like "4312567" (column read order) or a word */
  CC.colOrder = function (key) {
    if (/^\d+$/.test(key)) return [...key].map(Number); // position i gets rank key[i]
    const k = clean(key), idx = [...k].map((c, i) => [c, i]).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1]);
    const rank = Array(k.length); idx.forEach((x, r) => rank[x[1]] = r + 1); return rank;
  };
  CC.colEnc = function (p, key, pad) {
    p = clean(p); const rank = CC.colOrder(key), w = rank.length;
    while (p.length % w) p += (pad || "Z");
    const rows = []; for (let i = 0; i < p.length; i += w) rows.push(p.slice(i, i + w));
    let out = "";
    for (let r = 1; r <= w; r++) { const col = rank.indexOf(r); rows.forEach(row => out += row[col]); }
    return { out, rows, rank };
  };
  CC.colDec = function (c, key) {
    c = clean(c); const rank = CC.colOrder(key), w = rank.length, h = Math.ceil(c.length / w);
    const grid = Array.from({ length: h }, () => Array(w).fill("")); let k = 0;
    for (let r = 1; r <= w; r++) { const col = rank.indexOf(r); for (let i = 0; i < h; i++) grid[i][col] = c[k++] || ""; }
    return grid.map(r => r.join("")).join("");
  };

  /* ---------------- DES ---------------- */
  const IP = [58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7];
  const FP = [40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25];
  const E = [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1];
  const P = [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25];
  const PC1 = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4];
  const PC2 = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32];
  const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
  const S = [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7, 0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8, 4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0, 15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10, 3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5, 0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15, 13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8, 13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1, 13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7, 1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15, 13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9, 10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4, 3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9, 14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6, 4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14, 11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11, 10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8, 9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6, 4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1, 13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6, 1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2, 6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7, 1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2, 7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8, 2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
  ];
  CC.DES_TABLES = { IP, FP, E, P, PC1, PC2, SHIFTS, S };
  const hexToBits = h => [...h.padStart(16, "0")].flatMap(c => parseInt(c, 16).toString(2).padStart(4, "0").split("").map(Number));
  const bitsToHex = b => { let s = ""; for (let i = 0; i < b.length; i += 4) s += parseInt(b.slice(i, i + 4).join(""), 2).toString(16); return s.toUpperCase(); };
  const perm = (bits, t) => t.map(i => bits[i - 1]);
  const xor = (a, b) => a.map((x, i) => x ^ b[i]);
  const rotl = (a, n) => a.slice(n).concat(a.slice(0, n));
  CC.hexToBits = hexToBits; CC.bitsToHex = bitsToHex;
  CC.desSbox = function (box, six) { // six: array of 6 bits
    const row = six[0] * 2 + six[5], col = six[1] * 8 + six[2] * 4 + six[3] * 2 + six[4];
    return { row, col, val: S[box][row * 16 + col] };
  };
  CC.desKeys = function (keyHex) {
    const k56 = perm(hexToBits(keyHex), PC1);
    let C = k56.slice(0, 28), Dd = k56.slice(28);
    const keys = [], trace = [];
    for (let r = 0; r < 16; r++) {
      C = rotl(C, SHIFTS[r]); Dd = rotl(Dd, SHIFTS[r]);
      const k = perm(C.concat(Dd), PC2);
      keys.push(k); trace.push({ C: bitsToHex([0, 0, 0, 0].concat(C)), D: bitsToHex([0, 0, 0, 0].concat(Dd)), K: bitsToHex(k) });
    }
    return { keys, trace, k56: bitsToHex(k56) };
  };
  CC.des = function (blockHex, keyHex, decrypt) {
    const ks = CC.desKeys(keyHex).keys;
    const keys = decrypt ? ks.slice().reverse() : ks;
    const ip = perm(hexToBits(blockHex), IP);
    let L = ip.slice(0, 32), R = ip.slice(32);
    const rounds = [];
    for (let r = 0; r < 16; r++) {
      const e = perm(R, E), x = xor(e, keys[r]);
      let sOut = [];
      for (let b = 0; b < 8; b++) sOut = sOut.concat(CC.desSbox(b, x.slice(b * 6, b * 6 + 6)).val.toString(2).padStart(4, "0").split("").map(Number));
      const f = perm(sOut, P);
      const newR = xor(L, f);
      rounds.push({ r: r + 1, E: bitsToHex(e), K: bitsToHex(keys[r]), X: bitsToHex(x), S: bitsToHex(sOut), F: bitsToHex(f), L: bitsToHex(R), R: bitsToHex(newR) });
      L = R; R = newR;
    }
    const pre = R.concat(L); // final swap
    const out = bitsToHex(perm(pre, FP));
    return { ip: bitsToHex(ip), rounds, out };
  };

  /* ---------------- AES (128/192/256) ---------------- */
  const SBOX = [], INV = [];
  (function buildSbox() {
    // multiplicative inverse in GF(2^8) followed by the affine transformation
    const exp = [], log = [];
    let x = 1;
    for (let i = 0; i < 255; i++) { exp[i] = x; log[x] = i; x ^= (x << 1) ^ ((x & 0x80) ? 0x11b : 0); x &= 0xff; }
    for (let i = 0; i < 256; i++) {
      const invb = i === 0 ? 0 : exp[(255 - log[i]) % 255];
      let s = invb;
      for (let k = 1; k <= 4; k++) s ^= ((invb << k) | (invb >> (8 - k))) & 0xff;
      s ^= 0x63;
      SBOX[i] = s; INV[s] = i;
    }
  })();
  const xtime = b => ((b << 1) ^ ((b & 0x80) ? 0x1b : 0)) & 0xff;
  function gmul(a, b) { let p = 0; while (b) { if (b & 1) p ^= a; a = xtime(a); b >>= 1; } return p; }
  CC.SBOX = SBOX; CC.INV_SBOX = INV; CC.xtime = xtime; CC.gmul = gmul;
  CC.gmulTrace = function (a, b) {
    // returns steps of multiplying a by b using xtime decomposition
    const steps = []; let cur = a, acc = 0, pow = 1;
    for (let i = 0; i < 8 && (b >> i); i++) {
      if (i > 0) { const before = cur; cur = xtime(cur); steps.push({ k: pow << 0, note: `xtime(${hx(before)}) = ${hx(cur)}${before & 0x80 ? " (MSB was 1 → XOR 1B)" : ""}` }); }
      if ((b >> i) & 1) acc ^= cur;
      pow <<= 1;
    }
    return { steps, result: acc };
  };
  const hx = b => b.toString(16).padStart(2, "0").toUpperCase();
  CC.hx = hx;
  const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d];
  CC.RCON = RCON;
  const parseHex = h => (h.replace(/[^0-9a-fA-F]/g, "").match(/../g) || []).map(x => parseInt(x, 16));
  CC.parseHex = parseHex;
  CC.aesExpand = function (keyBytes) {
    const Nk = keyBytes.length / 4, Nr = Nk + 6, w = [], trace = [];
    for (let i = 0; i < Nk; i++) w.push(keyBytes.slice(4 * i, 4 * i + 4));
    for (let i = Nk; i < 4 * (Nr + 1); i++) {
      let t = w[i - 1].slice(); const tr = { i, prev: t.map(hx).join("") };
      if (i % Nk === 0) {
        t = t.slice(1).concat(t[0]); tr.rot = t.map(hx).join("");
        t = t.map(b => SBOX[b]); tr.sub = t.map(hx).join("");
        t[0] ^= RCON[i / Nk - 1]; tr.rcon = hx(RCON[i / Nk - 1]) + "000000"; tr.afterRcon = t.map(hx).join("");
      } else if (Nk > 6 && i % Nk === 4) { t = t.map(b => SBOX[b]); tr.sub = t.map(hx).join(""); }
      const nw = w[i - Nk].map((b, j) => b ^ t[j]);
      tr.wNk = w[i - Nk].map(hx).join(""); tr.w = nw.map(hx).join("");
      w.push(nw); trace.push(tr);
    }
    return { w, Nr, Nk, trace };
  };
  // state as 16-byte array in column-major order (index = r + 4c), same as input byte order
  const subBytes = s => s.map(b => SBOX[b]);
  const invSubBytes = s => s.map(b => INV[b]);
  const shiftRows = s => { const o = s.slice(); for (let r = 1; r < 4; r++) for (let c = 0; c < 4; c++) o[r + 4 * c] = s[r + 4 * ((c + r) % 4)]; return o; };
  const invShiftRows = s => { const o = s.slice(); for (let r = 1; r < 4; r++) for (let c = 0; c < 4; c++) o[r + 4 * ((c + r) % 4)] = s[r + 4 * c]; return o; };
  const mixCol = (c, m) => [0, 1, 2, 3].map(r => gmul(m[r][0], c[0]) ^ gmul(m[r][1], c[1]) ^ gmul(m[r][2], c[2]) ^ gmul(m[r][3], c[3]));
  const MIX = [[2, 3, 1, 1], [1, 2, 3, 1], [1, 1, 2, 3], [3, 1, 1, 2]];
  const IMIX = [[14, 11, 13, 9], [9, 14, 11, 13], [13, 9, 14, 11], [11, 13, 9, 14]];
  const mixColumns = (s, m) => { let o = []; for (let c = 0; c < 4; c++) o = o.concat(mixCol(s.slice(4 * c, 4 * c + 4), m || MIX)); return o; };
  const addRoundKey = (s, w, r) => s.map((b, i) => b ^ w[4 * r + Math.floor(i / 4)][i % 4]);
  CC.aesOps = { subBytes, shiftRows, mixColumns, addRoundKey, invSubBytes, invShiftRows, MIX, IMIX, mixCol };
  CC.aes = function (ptHex, keyHex) {
    const key = parseHex(keyHex), pt = parseHex(ptHex);
    const { w, Nr } = CC.aesExpand(key);
    const steps = [];
    let s = pt.slice();
    steps.push({ round: 0, name: "Input (plaintext)", s: s.slice() });
    s = addRoundKey(s, w, 0); steps.push({ round: 0, name: "AddRoundKey (pre-round, key w0–w3)", s: s.slice(), k: 0 });
    for (let r = 1; r <= Nr; r++) {
      s = subBytes(s); steps.push({ round: r, name: "SubBytes", s: s.slice() });
      s = shiftRows(s); steps.push({ round: r, name: "ShiftRows", s: s.slice() });
      if (r !== Nr) { s = mixColumns(s); steps.push({ round: r, name: "MixColumns", s: s.slice() }); }
      s = addRoundKey(s, w, r); steps.push({ round: r, name: "AddRoundKey", s: s.slice(), k: r });
    }
    return { out: s.map(hx).join(""), steps, w, Nr };
  };
  CC.aesDecrypt = function (ctHex, keyHex) {
    const key = parseHex(keyHex), ct = parseHex(ctHex);
    const { w, Nr } = CC.aesExpand(key);
    let s = addRoundKey(ct, w, Nr);
    for (let r = Nr - 1; r >= 0; r--) {
      s = invShiftRows(s); s = invSubBytes(s); s = addRoundKey(s, w, r);
      if (r > 0) s = mixColumns(s, IMIX);
    }
    return s.map(hx).join("");
  };

  /* ---------------- RC4 (test: key "Key", "Plaintext" → BBF316E8D940AF0AD3) ---------------- */
  CC.rc4 = function (keyBytes, n) {
    const S = [...Array(256).keys()];
    let j = 0;
    for (let i = 0; i < 256; i++) { j = (j + S[i] + keyBytes[i % keyBytes.length]) & 255; [S[i], S[j]] = [S[j], S[i]]; }
    const ks = []; let i = 0; j = 0;
    for (let k = 0; k < n; k++) { i = (i + 1) & 255; j = (j + S[i]) & 255; [S[i], S[j]] = [S[j], S[i]]; ks.push(S[(S[i] + S[j]) & 255]); }
    return ks;
  };

  /* ---------------- SHA-512 (test: "abc" → ddaf35a1…a54ca49f) ---------------- */
  const K512 = ["428a2f98d728ae22", "7137449123ef65cd", "b5c0fbcfec4d3b2f", "e9b5dba58189dbbc", "3956c25bf348b538", "59f111f1b605d019", "923f82a4af194f9b", "ab1c5ed5da6d8118", "d807aa98a3030242", "12835b0145706fbe", "243185be4ee4b28c", "550c7dc3d5ffb4e2", "72be5d74f27b896f", "80deb1fe3b1696b1", "9bdc06a725c71235", "c19bf174cf692694", "e49b69c19ef14ad2", "efbe4786384f25e3", "0fc19dc68b8cd5b5", "240ca1cc77ac9c65", "2de92c6f592b0275", "4a7484aa6ea6e483", "5cb0a9dcbd41fbd4", "76f988da831153b5", "983e5152ee66dfab", "a831c66d2db43210", "b00327c898fb213f", "bf597fc7beef0ee4", "c6e00bf33da88fc2", "d5a79147930aa725", "06ca6351e003826f", "142929670a0e6e70", "27b70a8546d22ffc", "2e1b21385c26c926", "4d2c6dfc5ac42aed", "53380d139d95b3df", "650a73548baf63de", "766a0abb3c77b2a8", "81c2c92e47edaee6", "92722c851482353b", "a2bfe8a14cf10364", "a81a664bbc423001", "c24b8b70d0f89791", "c76c51a30654be30", "d192e819d6ef5218", "d69906245565a910", "f40e35855771202a", "106aa07032bbd1b8", "19a4c116b8d2d0c8", "1e376c085141ab53", "2748774cdf8eeb99", "34b0bcb5e19b48a8", "391c0cb3c5c95a63", "4ed8aa4ae3418acb", "5b9cca4f7763e373", "682e6ff3d6b2b8a3", "748f82ee5defb2fc", "78a5636f43172f60", "84c87814a1f0ab72", "8cc702081a6439ec", "90befffa23631e28", "a4506cebde82bde9", "bef9a3f7b2c67915", "c67178f2e372532b", "ca273eceea26619c", "d186b8c721c0c207", "eada7dd6cde0eb1e", "f57d4f7fee6ed178", "06f067aa72176fba", "0a637dc5a2c898a6", "113f9804bef90dae", "1b710b35131c471b", "28db77f523047d84", "32caab7b40c72493", "3c9ebe0a15c9bebc", "431d67c49c100d4c", "4cc5d4becb3e42b6", "597f299cfc657e2a", "5fcb6fab3ad6faec", "6c44198c4a475817"].map(h => BigInt("0x" + h));
  const H512 = ["6a09e667f3bcc908", "bb67ae8584caa73b", "3c6ef372fe94f82b", "a54ff53a5f1d36f1", "510e527fade682d1", "9b05688c2b3e6c1f", "1f83d9abfb41bd6b", "5be0cd19137e2179"].map(h => BigInt("0x" + h));
  const M64 = (1n << 64n) - 1n;
  const rotr = (x, n) => ((x >> BigInt(n)) | (x << BigInt(64 - n))) & M64;
  CC.sha512Pad = function (bytes) {
    const L = bytes.length * 8, out = bytes.slice();
    out.push(0x80);
    while ((out.length % 128) !== 112) out.push(0);
    const len = BigInt(L);
    for (let i = 15; i >= 0; i--) out.push(Number((len >> BigInt(8 * i)) & 255n));
    return out;
  };
  CC.sha512 = function (bytes, wantTrace) {
    const m = CC.sha512Pad(bytes), H = H512.slice(), trace = { padded: m, blocks: [] };
    for (let off = 0; off < m.length; off += 128) {
      const W = [];
      for (let t = 0; t < 16; t++) { let w = 0n; for (let b = 0; b < 8; b++) w = (w << 8n) | BigInt(m[off + 8 * t + b]); W.push(w); }
      for (let t = 16; t < 80; t++) {
        const s0 = rotr(W[t - 15], 1) ^ rotr(W[t - 15], 8) ^ (W[t - 15] >> 7n);
        const s1 = rotr(W[t - 2], 19) ^ rotr(W[t - 2], 61) ^ (W[t - 2] >> 6n);
        W.push((W[t - 16] + s0 + W[t - 7] + s1) & M64);
      }
      let [a, b, c, d, e, f, g, h] = H;
      const rounds = [];
      for (let t = 0; t < 80; t++) {
        const S1 = rotr(e, 14) ^ rotr(e, 18) ^ rotr(e, 41), ch = (e & f) ^ (~e & M64 & g);
        const T1 = (h + S1 + ch + K512[t] + W[t]) & M64;
        const S0 = rotr(a, 28) ^ rotr(a, 34) ^ rotr(a, 39), maj = (a & b) ^ (a & c) ^ (b & c);
        const T2 = (S0 + maj) & M64;
        h = g; g = f; f = e; e = (d + T1) & M64; d = c; c = b; b = a; a = (T1 + T2) & M64;
        if (wantTrace) rounds.push([a, b, c, d, e, f, g, h]);
      }
      const prev = H.slice();
      [a, b, c, d, e, f, g, h].forEach((v, i) => H[i] = (H[i] + v) & M64);
      if (wantTrace) trace.blocks.push({ W, rounds, prev, H: H.slice() });
    }
    const hex = H.map(x => x.toString(16).padStart(16, "0")).join("");
    return wantTrace ? { hex, trace } : hex;
  };
  CC.h64 = x => x.toString(16).padStart(16, "0");

  /* ---------------- MD5 (test: "abc" → 900150983cd24fb0d6963f7d28e17f72) ---------------- */
  CC.md5 = function (bytes) {
    const s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
    const T = [...Array(64).keys()].map(i => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0);
    const m = bytes.slice(), L = bytes.length * 8;
    m.push(0x80); while (m.length % 64 !== 56) m.push(0);
    for (let i = 0; i < 8; i++) m.push(i < 4 ? (L >>> (8 * i)) & 255 : 0);
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    for (let off = 0; off < m.length; off += 64) {
      const M = []; for (let i = 0; i < 16; i++) M.push((m[off + 4 * i]) | (m[off + 4 * i + 1] << 8) | (m[off + 4 * i + 2] << 16) | (m[off + 4 * i + 3] << 24));
      let A = a0, B = b0, C = c0, Dd = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) { F = (B & C) | (~B & Dd); g = i; } else if (i < 32) { F = (Dd & B) | (~Dd & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ Dd; g = (3 * i + 5) % 16; } else { F = C ^ (B | ~Dd); g = (7 * i) % 16; }
        F = (F + A + T[i] + M[g]) >>> 0; A = Dd; Dd = C; C = B; B = (B + ((F << s[i]) | (F >>> (32 - s[i])))) >>> 0;
      }
      a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + Dd) >>> 0;
    }
    return [a0, b0, c0, d0].map(x => [0, 1, 2, 3].map(i => ((x >>> (8 * i)) & 255).toString(16).padStart(2, "0")).join("")).join("");
  };
  CC.utf8 = s => [...new TextEncoder().encode(s)];

  if (typeof module !== "undefined" && module.exports) module.exports = CC;
  else root.CC = CC;
})(this);
