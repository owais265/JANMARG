# JANMARG

Mobile app for the five Ministry of Tribal Affairs scholarships: Pre-Matric, Post-Matric, Top Class, National Fellowship, and National Overseas.

A student sees one dashboard instead of three separate portals (NSP, DBT, and Canara SFMP).

## In the app

- Dashboard for all five schemes, from submission through verification, sanction, and disbursement
- Document wallet, with an optional DigiLocker connect
- Verify once, then reuse a checked document on the other schemes
- Payments list for DBT status and the Canara SFMP step
- Alerts for a deficiency or a document that needs review
- JAGO, a chat guide for schemes, documents, and the connected file

JANMARG does not submit an application, does not decide eligibility, and does not show a bank credit. A name mismatch goes to review. It is not an automatic rejection. One scheme can be availed at a time.

Official rules stay on [tribal.nic.in/ScholarshiP.aspx](https://tribal.nic.in/ScholarshiP.aspx).

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:8080`.

```bash
npm test
npm run typecheck
```

Copy `.env.example` if you need local keys. `XAI_API_KEY` is optional and stays on the server. JAGO still answers from the reviewed notes when that key is absent.
