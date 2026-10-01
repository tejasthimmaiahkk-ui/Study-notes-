/* ==========================================================================
   stats-core.js — statistics used by the Data Analytics demos.
   Distribution functions are computed numerically (no lookup tables), so
   critical values are available for any degrees of freedom.
   ========================================================================== */
(function (root) {
  "use strict";
  const S = {};
  const sum = a => a.reduce((x, y) => x + y, 0);
  S.sum = sum;
  S.mean = a => sum(a) / a.length;
  S.varP = a => { const m = S.mean(a); return sum(a.map(x => (x - m) ** 2)) / a.length; };
  S.varS = a => { const m = S.mean(a); return sum(a.map(x => (x - m) ** 2)) / (a.length - 1); };
  S.sdP = a => Math.sqrt(S.varP(a));
  S.sdS = a => Math.sqrt(S.varS(a));

  /* ---- correlation & regression ---- */
  S.pearson = function (X, Y) {
    const n = X.length, mx = S.mean(X), my = S.mean(Y);
    const rows = X.map((x, i) => { const dx = x - mx, dy = Y[i] - my; return { X: x, Y: Y[i], x: dx, y: dy, x2: dx * dx, y2: dy * dy, xy: dx * dy, X2: x * x, Y2: Y[i] * Y[i], XY: x * Y[i] }; });
    const t = k => sum(rows.map(r => r[k]));
    const Sxy = t("xy"), Sx2 = t("x2"), Sy2 = t("y2");
    const r = Sxy / Math.sqrt(Sx2 * Sy2);
    const pe = 0.6745 * (1 - r * r) / Math.sqrt(n);
    return { n, mx, my, rows, Sxy, Sx2, Sy2, SX: t("X"), SY: t("Y"), SX2: t("X2"), SY2: t("Y2"), SXY: t("XY"), r, pe, se: (1 - r * r) / Math.sqrt(n), byx: Sxy / Sx2, bxy: Sxy / Sy2 };
  };
  S.rank = function (a) { // average ranks for ties, rank 1 = highest value (exam convention)
    const idx = a.map((v, i) => [v, i]).sort((p, q) => q[0] - p[0]);
    const r = Array(a.length);
    let i = 0;
    while (i < idx.length) {
      let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      const avg = (i + 1 + j + 1) / 2;
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
      i = j + 1;
    }
    return r;
  };
  S.tieGroups = function (a) { const c = {}; a.forEach(v => c[v] = (c[v] || 0) + 1); return Object.values(c).filter(m => m > 1); };
  S.spearman = function (X, Y, ranksGiven) {
    const n = X.length, R1 = ranksGiven ? X.slice() : S.rank(X), R2 = ranksGiven ? Y.slice() : S.rank(Y);
    const D = R1.map((r, i) => r - R2[i]), D2 = D.map(d => d * d), SD2 = sum(D2);
    const ties = ranksGiven ? [] : S.tieGroups(X).concat(S.tieGroups(Y));
    const cf = sum(ties.map(m => (m ** 3 - m) / 12));
    const R = 1 - 6 * (SD2 + cf) / (n * (n * n - 1));
    return { n, R1, R2, D, D2, SD2, ties, cf, R };
  };
  S.leastSquares = function (X, Y) {
    const n = X.length, SX = sum(X), SY = sum(Y), SXY = sum(X.map((x, i) => x * Y[i])), SX2 = sum(X.map(x => x * x));
    const b = (n * SXY - SX * SY) / (n * SX2 - SX * SX), a = (SY - b * SX) / n;
    return { n, SX, SY, SXY, SX2, a, b };
  };

  /* ---- special functions ---- */
  S.lgamma = function (x) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015; for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  };
  function betacf(a, b, x) {
    const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
    let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
      const del = d * c; h *= del; if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  S.ibeta = function (a, b, x) { // regularized incomplete beta I_x(a,b)
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(S.lgamma(a + b) - S.lgamma(a) - S.lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  };
  S.gammaP = function (a, x) { // regularized lower incomplete gamma
    if (x <= 0) return 0;
    if (x < a + 1) { let ap = a, s = 1 / a, del = s; for (let n = 0; n < 500; n++) { ap++; del *= x / ap; s += del; if (Math.abs(del) < Math.abs(s) * 1e-15) break; } return s * Math.exp(-x + a * Math.log(x) - S.lgamma(a)); }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break; }
    return 1 - Math.exp(-x + a * Math.log(x) - S.lgamma(a)) * h;
  };
  S.erf = function (x) { // Abramowitz–Stegun 7.1.26 refined with series for accuracy
    const sgn = x < 0 ? -1 : 1; x = Math.abs(x);
    if (x < 3) { let s = 0, term = x, n = 0; while (Math.abs(term) > 1e-16 && n < 200) { s += term / (2 * n + 1); n++; term *= -x * x / n; } return sgn * 2 / Math.sqrt(Math.PI) * s; }
    return sgn * (1 - S.gammaP(0.5, x * x) === 0 ? 1 : S.gammaP(0.5, x * x));
  };
  S.normCdf = z => 0.5 * (1 + S.erf(z / Math.SQRT2));
  S.normPdf = (x, mu, sd) => { mu = mu || 0; sd = sd || 1; return Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI)); };
  S.tCdf = function (t, df) { const x = df / (df + t * t), p = 0.5 * S.ibeta(df / 2, 0.5, x); return t >= 0 ? 1 - p : p; };
  S.chiCdf = (x, df) => S.gammaP(df / 2, x / 2);
  S.fCdf = (f, d1, d2) => f <= 0 ? 0 : S.ibeta(d1 / 2, d2 / 2, d1 * f / (d1 * f + d2));
  function invert(cdf, p, lo, hi) { for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (cdf(mid) < p) lo = mid; else hi = mid; } return (lo + hi) / 2; }
  S.zCrit = (alpha, tails) => invert(S.normCdf, 1 - alpha / (tails || 2), 0, 10);
  S.tCrit = (alpha, df, tails) => invert(t => S.tCdf(t, df), 1 - alpha / (tails || 2), 0, 1000);
  S.chiCrit = (alpha, df) => invert(x => S.chiCdf(x, df), 1 - alpha, 0, 1000);
  S.fCrit = (alpha, d1, d2) => invert(f => S.fCdf(f, d1, d2), 1 - alpha, 0, 1000);

  /* ---- discrete distributions ---- */
  S.nCr = function (n, r) { if (r < 0 || r > n) return 0; r = Math.min(r, n - r); let c = 1; for (let i = 1; i <= r; i++) c = c * (n - r + i) / i; return Math.round(c); };
  S.binom = (n, p, r) => S.nCr(n, r) * p ** r * (1 - p) ** (n - r);
  S.fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  S.poisson = (m, r) => Math.exp(-m) * m ** r / S.fact(r);

  /* ---- tests ---- */
  S.tOne = function (data, mu) { const n = data.length, m = S.mean(data), s = S.sdS(data); return { n, m, s, t: (m - mu) * Math.sqrt(n) / s, df: n - 1 }; };
  S.tTwo = function (a, b) {
    const n1 = a.length, n2 = b.length, m1 = S.mean(a), m2 = S.mean(b);
    const ss1 = sum(a.map(x => (x - m1) ** 2)), ss2 = sum(b.map(x => (x - m2) ** 2));
    const sp = Math.sqrt((ss1 + ss2) / (n1 + n2 - 2));
    return { n1, n2, m1, m2, ss1, ss2, sp, t: (m1 - m2) / (sp * Math.sqrt(1 / n1 + 1 / n2)), df: n1 + n2 - 2 };
  };
  S.tPaired = function (a, b) { const d = a.map((x, i) => b[i] - x), n = d.length, m = S.mean(d), s = S.sdS(d); return { d, n, m, s, t: m * Math.sqrt(n) / s, df: n - 1 }; };
  S.anova1 = function (groups) {
    const all = [].concat(...groups), N = all.length, k = groups.length, T = sum(all);
    const CF = T * T / N, SST = sum(all.map(x => x * x)) - CF;
    const SSC = sum(groups.map(g => sum(g) ** 2 / g.length)) - CF, SSE = SST - SSC;
    const df1 = k - 1, df2 = N - k, MSC = SSC / df1, MSE = SSE / df2, F = MSC / MSE;
    return { N, k, T, CF, SST, SSC, SSE, df1, df2, MSC, MSE, F };
  };
  S.chiTable = function (obs) {
    const r = obs.length, c = obs[0].length, rowT = obs.map(row => sum(row)), colT = obs[0].map((_, j) => sum(obs.map(row => row[j]))), N = sum(rowT);
    const E = obs.map((row, i) => row.map((_, j) => rowT[i] * colT[j] / N));
    let chi = 0; obs.forEach((row, i) => row.forEach((o, j) => chi += (o - E[i][j]) ** 2 / E[i][j]));
    return { rowT, colT, N, E, chi, df: (r - 1) * (c - 1) };
  };

  if (typeof module !== "undefined" && module.exports) module.exports = S;
  else root.ST = S;
})(this);
