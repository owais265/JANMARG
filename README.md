# JANMARG

**Jan Accessible Network for Mobilization, Accountability, Reform and Governance**

A working mobile-first Scholarship Module for SIH 2026, Problem Statement **SIH26238**, Ministry of Tribal Affairs.

One student view across five schemes that today live on three portals: NSP, DBT, and Canara SFMP.

Official scheme pages stay on [tribal.nic.in/ScholarshiP.aspx](https://tribal.nic.in/ScholarshiP.aspx).

---

## The problem judges should see first

MoTA runs five ST schemes: Pre-Matric, Post-Matric, Top Class, National Fellowship (NFST), and National Overseas (NOS).

A student, or a family with children on different schemes, must track application, verification, sanction and disbursement in three places. There is no single answer to “where is my file?” or “which scheme am I already on?” That matters because a student can avail only one scheme at a time.

Verification is still repeated by hand: identity, ST/PVTG, income, institution, and scheme papers. The same document is asked again on the next portal. A name mismatch often feels like a rejection instead of a review.

Coverage is also incomplete. Students can be enrolled in school or college and still not be on a scholarship file. Matching registration with UDISE+, APAAR and OTR is how the ministry finds that gap. This app shows that idea as a student-facing track, not as a live ministry census.

---

## What is built

A phone app a first-time student can open without a briefing.

1. Sign in on a full screen. Logo and authentication only.
2. Optional guide cards, or skip straight to the dashboard.
3. One home for all five schemes, from submission through verification, sanction and disbursement.
4. Document wallet. Optional DigiLocker connect uses a **practice file**. No Aadhaar number, bank page, or OTP.
5. Verify once, then reuse a checked document on the other schemes.
6. Payments list for DBT status and the Canara SFMP step. No bank credit is shown as money sent.
7. Alerts for a deficiency or a document that needs review.
8. JAGO: locker-first hybrid retrieval chat. History in a left drawer. Clear chat. Save text or PNG. Picture and voice sit on `+`, like a modern assistant. The assistant does not speak over the reply.

JANMARG does not submit an application, does not decide eligibility, and does not show a bank credit. A name mismatch goes to review. It is not an automatic rejection.

---

## Why this is not “three websites in one tab”

| Existing system | What a student does today | What JANMARG adds |
|---|---|---|
| NSP | Apply and wait on one portal | Same journey next to the other four schemes |
| DBT | Check credit on a second site | Payment status in the same list |
| Canara SFMP | Fellowship / overseas step on a third site | That step is a row, not a new login |
| DigiLocker | Re-upload papers on every form | Practice pull, then reuse on the other schemes |
| Helpdesk / PDF | Hunt the rule in a circular | JAGO answers from reviewed notes, then the student’s file |

The unusual piece is the **verify-once + review-not-reject** rule plus a **locker-first** chatbot. Most scholarship UIs either dump scheme text or invent an eligibility score. JAGO does neither. If the question is personal, the practice file comes first. If the question is a scheme rule, retrieved notes come first. If the model would invent a number, the safe fallback is returned.

---

## Architecture (what actually runs)

```
Phone shell (TanStack Start + React)
  ├─ Dashboard / Schemes / Wallet / Payments / Alerts / Settings
  ├─ JAGO composer + history drawer
  │
  ├─ Browser store (journey, threads, language)
  │
  ├─ Server functions
  │     ├─ Hybrid retrieve (notes + locker brief + chat history)
  │     ├─ Policy gate (no eligibility, payment, Aadhaar, OTP, invented figures)
  │     └─ Optional xAI compose when XAI_API_KEY is set
  │
  └─ Supabase (mankmitra3.0)
        ├─ Scheme notes and official extracts
        ├─ Practice student registry
        └─ pull_student_file RPC (practice locker, not live DigiLocker)
```

Adapters for NSP, DBT, Canara SFMP, UIDAI, APAAR, UDISE+, AISHE and UGC-NTA are **shaped like the real systems and filled with practice data**. They are not live government APIs. A mismatch is routed to review. That is the same design the ministry asked for, without pretending the pipes are already signed.

**Why this stack.** The student app has to stay on one phone column. Server functions keep the xAI key off the client. Supabase holds the practice file so a judge can connect locker data without a ministry VPN. Vercel is the deploy target already used by the team.

---

## How judges can score the nine criteria

| Criterion | Where it shows in this repo |
|---|---|
| Problem understanding | Three portals, one-scheme-at-a-time rule, repeated papers, coverage gap |
| Innovation | Verify-once, review-not-reject, locker-first JAGO, one payment list |
| Technical depth | Hybrid retrieval, history expansion, policy scrub, practice RPC |
| Feasibility | Running MVP. Roadmap below. No fake live ministry call |
| Architecture | Modular student shell, server JAGO, Supabase practice layer |
| Implementation | Polished phone UI, tests, typecheck, Vercel build |
| UX | Login → guide or skip → dashboard. Four tabs. JAGO like a chat app |
| Impact | One file instead of three logins. Faster review. Outreach list is designed, not invented |
| Scalability | Vercel + Supabase. Key on the server. Same app grows when official APIs are issued |

---

## Impact, stated without invented census numbers

- A student stops opening three portals to answer one question.
- A parent with two children sees both tracks on one home screen.
- A deficiency is an alert, not a vanished application.
- A name mismatch is a review card, not a silent reject.
- JAGO answers in the student’s language from reviewed notes, then from the connected file.
- When UDISE+ / APAAR / OTR matching is authorised, the same module can list enrolled students who are not yet on a scholarship file. That list is not live in this build.

---

## Roadmap (what is MVP vs what needs ministry access)

**Now, in this repository**

- Unified five-scheme dashboard
- Practice document wallet and DigiLocker connect
- Verify-once reuse
- Payments and deficiency alerts
- Conversational JAGO with history
- Email sign-in; Google / X when the visitor is not already signed in

**Next, when official APIs exist**

- Read-only NSP / SFMP / NOS status, not a new application form
- Real DigiLocker pull under the student’s consent
- AISHE / UDISE+ / APAAR / UGC-NTA checks through the same verification layer
- Coverage matching for outreach

**Not in scope for the MVP, on purpose**

- Submitting an application
- Declaring a student eligible or ineligible
- Showing a rupee credit as if DBT sent it
- Capturing Aadhaar, bank account, or OTP

---

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

## Deploy on Vercel

The build already targets Vercel (`nitro` preset).

1. Vercel project → **Settings** → **Environment Variables**.
2. Name: `XAI_API_KEY`
3. Value: the key from the xAI console. Do not commit it.
4. Production, then **Redeploy**.

Do not name it `VITE_XAI_API_KEY`. A `VITE_` name is bundled into the public site.

Do not set `DATABASE_URL` if you want the same behaviour as the published preview. That variable switches the server store off the local fallback.

---

## Team notes

- GitHub: [owais265/JANMARG](https://github.com/owais265/JANMARG)
- Vercel team: prograckers, project jnmarg
- Supabase project: mankmitra3.0
