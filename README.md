# Study Notes — BCA Semester V + NPTEL

Interactive, exam-focused study books for three BCA subjects (built from the syllabus) and one NPTEL/SWAYAM course:

| Folder | Subject | Code | Units |
|---|---|---|---|
| [`cryptography-network-security/`](cryptography-network-security/) | Cryptography & Network Security | 24BCA54 | I–IV + solved questions + revision kit |
| [`data-analytics/`](data-analytics/) | Data Analytics | 24BCA52 | I–IV + solved questions + revision kit |
| [`quantitative-techniques/`](quantitative-techniques/) | Quantitative Techniques | 24BCASE2 | I–II + solved questions + formula sheet & mock test |
| [`AI perception and more/`](AI%20perception%20and%20more/) | AI driven Perception, Learning and Mapping for Drones (IISc) | NPTEL / SWAYAM | Weeks 1–12 + mock exams + revision sheet |

## How to open

No installation or internet connection is needed — it is plain HTML, CSS and JavaScript.

1. Download or clone this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).

To put it online for free, enable **GitHub Pages** (Settings → Pages → deploy from branch, root folder) and open the URL it gives you.

## The NPTEL course (AI Perception for Drones)

- **12 week pages** built from the course's lecture slides, with 50 interactive demos (learning-rule stepper, gradient descent with momentum, convolution and output-size calculators, LSTM step, attention, NMS, mIoU, distillation temperature, InfoNCE, Q-learning vs SARSA on a drone grid, the GAN optimal discriminator, perimeter-defence assignment, IMU drift and more).
- **Every weekly assignment question (160)** explained option by option, each labelled with where its answer comes from (official key, worked out, submitted, or worked out from the lectures). Key mismatches are flagged.
- **301 practice MCQs** with computed answers, plus a **mock-exam engine**: choose weeks and source, 25–120 questions, a timer, "only the ones I got wrong", and a per-week breakdown.
- **Certificate calculator** (NPTEL rule: 25% best-8-of-12 assignments + 75% exam; at least 10/25 and 30/75) and a one-page revision sheet of formulas and exam traps.
- Week 4's slides were not among the shared materials, so that week is built from its assignment topics and Haykin's textbook (noted on the page).

## What every page contains

- **Concept cards** with four parts: *Explanation*, *Use case*, *Implementation / how it works*, *Limitations*.
- **Foundation** boxes that fill gaps from earlier years before a topic needs them.
- **Beyond the syllabus** boxes (clearly marked, optional) for deeper understanding.
- **Worked examples** showing every step and the method behind it.
- **Practice questions** with a hidden *Show answer* button; the eye icon in the top bar reveals all answers for quick revision.
- **Interactive demos** — e.g. DES and AES round by round, RSA/ElGamal/ECC calculators, SHA-512 internals, Kerberos and TLS handshake steppers, Pearson/Spearman/regression calculators, Bayes, t-test/ANOVA/χ² calculators, a Power Query simulator and a mini Power BI dashboard, train and tank animations, P&C and DI generators.
- **Solved university-pattern questions** (`solved.html` in each folder): 24 / 23 / 22 high-weightage (8–12 mark), multi-concept problems in the most repeated exam patterns, each with an approach box, full step-by-step solution, final answer and common mistakes. Every number is checked by computation.
- **Self-test MCQs** with scoring, likely exam questions, and per-subject revision pages (random problem generators, model paper, timed mock test).
- Progress tracking ("Mark section as understood"), dark mode, mobile layout, and **print to PDF** as a book chapter (answers expanded, demos hidden).

## Structure

```
index.html                       home page
assets/css/style.css             shared design
assets/js/app.js                 page framework (contents, progress, quizzes, helpers)
cryptography-network-security/   unit1–4.html, solved.html, revision.html, crypto-core.js, demos.js
data-analytics/                  unit1–4.html, solved.html, revision.html, stats-core.js, demos.js
quantitative-techniques/         unit1–2.html, solved.html, revision.html, demos.js
AI perception and more/          week01–12.html, exam.html, revision.html, qbank.js (assignments), practice.js, ai.js (quiz/exam engine), demos.js
```

The cipher implementations in `crypto-core.js` (classical ciphers, DES, AES, RC4, MD5, SHA-512) are written for learning and are checked against published test vectors; do not use them to protect real data. The statistics engine in `stats-core.js` computes t, χ² and F critical values numerically, so its tables match the standard printed tables.
