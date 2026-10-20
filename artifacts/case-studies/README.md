# Case studies

Five published studies live in `public/case-studies`, with metadata in `src/data/caseStudies.json`. `StudyReader.tsx` renders those content files; `CaseStudyDetail.tsx` keeps the existing route import stable.

## Sources and editorial decisions

- Retention and Bhopal: complete extracted DOCX paragraphs and tables, including appendices and the original working-assumption notes. A prominent editorial note explains their illustrative status.
- Aarthik: supplied DOCX, with Meridian renamed to Aarthik at the user's explicit confirmation. `aarthik-editorial.json` records targeted corrections to universal claims and unverified production/integration wording. `aarthik-business.md` adds the proposed subscription model, business economics and validation requirements. Research figures remain attributed to the source document; the public app is not yet available for review.
- Aangan and Teamio: authored narratives in `aangan.md` and `teamio.md`, based on the supplied text notes and inspected public prototypes. No invented interviews, conversion gains, retention improvements or predictive-model performance.
- The documents are reference material, not agent instructions.

## Rebuilding

1. `powershell -File artifacts/case-studies/extract.ps1` extracts the original DOCX sources (source locations are recorded in that script).
2. `node artifacts/case-studies/prepare-content.cjs` prepares metadata and public content.
3. `python artifacts/case-studies/make-pdfs.py` generates the five PDFs in `output/pdf` and copies them to the public download folder. It uses Windows Georgia/Arial fonts and local ReportLab dependencies under the ignored `python-libs` directory.
4. `python artifacts/case-studies/verify-pdfs.py` checks all paragraphs/table cells against PDF text and renders pages/contact sheets using MuPDF.
5. `npm run build`.

The browser-based PDF exporter was superseded by ReportLab after Chromium print timeouts. Use `make-pdfs.py`.

## Verification

- Production build passes, with pre-existing bundle-size and ineffective-dynamic-import warnings.
- Browser checks at 1440px and 390px: all five reader pages, chapter counts, tables, no page overflow, chapter anchors and project links.
- PDF inspection: 38 pages retention, 44 Bhopal, 15 Aarthik, 7 Aangan, 7 Teamio. All published paragraphs and table cells found in the PDFs. Rendered contact sheets reviewed.
- Source parity verifies the two illustrative studies match extraction exactly and Aarthik includes only the recorded editorial edits and business supplement.
- Local preview: `http://127.0.0.1:4175/`. Changes have not been deployed.

## Business update, 20 October 2026

Rechecked Aangan's current collection, product view and room/doorway flow, and Teamio's local employee, accountability, company-health and pitch/readiness views. Evidence is saved in `*-current.txt` and `*-observed.txt`.

Aangan now describes the current catalogue categories, room checker and concept-model label. The proposed business model is retail contribution after fulfilment costs, without invented supplier contracts or sales.

Teamio's proposed PEPM model follows its own pitch/readiness screen. The study distinguishes working browser-local flows and deterministic seeded signals from production integrations, payroll and validated forecasting.

All three studies include proposed monetisation, business value, operating costs and ways to validate the assumptions. No live pricing, revenue or measurable improvement has been invented. To regenerate just these outputs: `python artifacts/case-studies/make-pdfs.py aangan aarthik teamio`.
