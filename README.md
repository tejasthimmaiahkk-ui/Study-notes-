# Study Notes — BCA Semester V

Interactive, exam-focused study books for three subjects, built from the syllabus:

| Folder | Subject | Code | Units |
|---|---|---|---|
| [`cryptography-network-security/`](cryptography-network-security/) | Cryptography & Network Security | 24BCA54 | I–IV + revision kit |
| [`data-analytics/`](data-analytics/) | Data Analytics | 24BCA52 | I–IV + revision kit |
| [`quantitative-techniques/`](quantitative-techniques/) | Quantitative Techniques | 24BCASE2 | I–II + formula sheet & mock test |

## How to open

No installation or internet connection is needed — it is plain HTML, CSS and JavaScript.

1. Download or clone this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).

To put it online for free, enable **GitHub Pages** (Settings → Pages → deploy from branch, root folder) and open the URL it gives you.

## What every page contains

- **Concept cards** with four parts: *Explanation*, *Use case*, *Implementation / how it works*, *Limitations*.
- **Foundation** boxes that fill gaps from earlier years before a topic needs them.
- **Beyond the syllabus** boxes (clearly marked, optional) for deeper understanding.
- **Worked examples** showing every step and the method behind it.
- **Practice questions** with a hidden *Show answer* button; the eye icon in the top bar reveals all answers for quick revision.
- **Interactive demos** — e.g. DES and AES round by round, RSA/ElGamal/ECC calculators, SHA-512 internals, Kerberos and TLS handshake steppers, Pearson/Spearman/regression calculators, Bayes, t-test/ANOVA/χ² calculators, a Power Query simulator and a mini Power BI dashboard, train and tank animations, P&C and DI generators.
- **Self-test MCQs** with scoring, likely exam questions, and per-subject revision pages (random problem generators, model paper, timed mock test).
- Progress tracking ("Mark section as understood"), dark mode, mobile layout, and **print to PDF** as a book chapter (answers expanded, demos hidden).

## Structure

```
index.html                       home page
assets/css/style.css             shared design
assets/js/app.js                 page framework (contents, progress, quizzes, helpers)
cryptography-network-security/   unit1–4.html, revision.html, crypto-core.js, demos.js
data-analytics/                  unit1–4.html, revision.html, stats-core.js, demos.js
quantitative-techniques/         unit1–2.html, revision.html, demos.js
```

The cipher implementations in `crypto-core.js` (classical ciphers, DES, AES, RC4, MD5, SHA-512) are written for learning and are checked against published test vectors; do not use them to protect real data. The statistics engine in `stats-core.js` computes t, χ² and F critical values numerically, so its tables match the standard printed tables.
