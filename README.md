# JANMARG

**Jan Accessible Network for Mobilization, Accountability, Reform and Governance**

A working mobile-first Scholarship Module for Smart India Hackathon 2026.

| Field | Value |
|---|---|
| Problem statement | SIH26238 |
| Ministry | Ministry of Tribal Affairs |
| Category | Software |
| Theme | Smart Automation |
| Official scheme pages | [tribal.nic.in/ScholarshiP.aspx](https://tribal.nic.in/ScholarshiP.aspx) |
| Repository | [owais265/JANMARG](https://github.com/owais265/JANMARG) |

JANMARG gives one student one screen for five schemes that today live on three portals: the National Scholarship Portal (NSP), Direct Benefit Transfer (DBT), and the Canara Scholarship Fellowship Management Portal (SFMP), plus the standalone National Overseas Scholarship portal.

It is a **working prototype**. It is **not** an official government portal. It does not submit an application, does not decide eligibility, and does not show a bank credit as money sent.

---

## 1. Problem understanding

### 1.1 The five schemes and the three systems

MoTA administers five scholarship and fellowship schemes for Scheduled Tribe students:

| Scheme | Typical student | Where it lives today |
|---|---|
| Pre-Matric | Classes IX–X | NSP |
| Post-Matric | Class XI and above | NSP |
| Top Class | Selected higher-education institutes | NSP |
| National Fellowship (NFST) | M.Phil. / Ph.D. | Canara SFMP |
| National Overseas Scholarship (NOS) | Study abroad | Standalone NOS portal |

A student, or a family with children on different schemes, must open three logins to answer one question: *where is the file, and has any money moved?*

That split is not a UI inconvenience. Under the existing rule a student can avail **only one scheme at a time**. Without a unified view, a family can prepare a second application while the first is still live.

### 1.2 What the student actually does today

1. Find the correct portal for the scheme.
2. Re-enter identity, ST/PVTG status, income, institution and academic details.
3. Upload the same papers again because the last portal does not share a wallet.
4. Wait through verification with no single list of deficiencies.
5. Check sanction on one site and DBT status on another.
6. For NFST or NOS, start again on Canara SFMP or the overseas portal.
7. If a name or date does not match, the file often feels rejected instead of sent to review.

Verification is still mostly manual. The reform note already names the systems that could take that work: DigiLocker, AISHE, UDISE+, APAAR, UIDAI, State e-District systems and UGC-NTA. Those pipes are not issued to a student app today. The architecture has to look like them without pretending they are live.

### 1.3 The coverage gap

Students can be enrolled in school or college and still not be on a scholarship file. Matching registration with UDISE+, APAAR and OTR is how the ministry finds unreached beneficiaries. This repository designs that match as a coverage register. It does **not** run a live ministry census.

### 1.4 Who feels the cost

- The student who cannot see one journey from submission to disbursement.
- The parent tracking two children on two portals.
- The institute officer who asks for the same certificate a second time.
- The ministry desk that cannot see who is enrolled and not availing.

---

## 2. Expected solution mapped to this build

The problem statement asks for three products. This repository implements all three at prototype fidelity.

### 2.1 Scholarship Module

Unified dashboard covering all five schemes. The student tracks a file from **submission → verification → sanction → disbursement**.

Also in the module:

- Digital document wallet, with an optional DigiLocker connect
- Reuse of a document that has already been checked (verify once)
- Consolidated payments and DBT status
- Pending actions and deficiencies as alerts
- Profile and settings on the same phone column

### 2.2 JAGO chatbot

JAGO answers eligibility *information*, application status on the practice file, required documents, deficiencies and disbursement *status*. It is multilingual. It does not invent a sanction or a credit.

Student-specific answers come from the connected practice file first. Scheme rules come from reviewed public notes. If those two sources are silent, the model may compose a short reply and a policy gate still drops invented figures.

### 2.3 Unified verification and integration layer

Each source system is an adapter with the same shape: input, result, mismatch. A mismatch is routed to **manual review**, not treated as a reject. In this build the adapters are filled with practice data. The contract is the same one a live API would keep.

---

## 3. What a first-time user sees

The product is a phone app. On a desktop judge screen it sits as a 430px column on the right, with the JANMARG mark on the left.

| Step | Screen | What happens |
|---|---|---|
| 1 | Authentication | Full deep-green page. Logo and sign-in only. Guest continue, email, or Google / X when the visitor is not already signed in. |
| 2 | Guide | Six tap-anywhere cards: Dashboard, Schemes, Readiness, JAGO, Settings, DigiLocker. Skip is one tap. |
| 3 | Home | All five schemes as one track. Each scheme shows Submission, Verification, Sanction, Disbursement. Empty state is “Not submitted”, not a marketing card. |
| 4 | Documents | Wallet of papers on the practice file. Status: reusable, needs review, missing. |
| 5 | Payments | DBT row and Canara SFMP row. Amount is never shown as a credit that left a bank. |
| 6 | Alerts | Deficiency, name mismatch, document due. Bell on the header. |
| 7 | Settings | Profile, language, DigiLocker connect, account deletion request. |
| 8 | JAGO | Empty state is the wordmark. After the first message, two short follow-ups appear. History is a left drawer. New chat, delete thread, save text, save PNG. Picture and voice sit behind `+`. The assistant does not speak the reply. |

Bottom tabs: **Home · Schemes · JAGO · Settings**.

---

## 4. Feature design, in depth

### 4.1 One journey across five schemes

`src/lib/beta/module.ts` builds a track per scheme from the connected file and the local journey store.

A scheme that has not been started is **Not submitted**. A scheme that has started shows the four ministry stages the problem statement named. The student can open pending actions, the wallet, payments and alerts from the same home list. There is no separate “load a practice file” card on the dashboard. DigiLocker lives in Settings, which is where a real connect belongs.

### 4.2 Document wallet and verify-once

The wallet is the student’s papers for the five schemes, not an upload dump.

- A document that has already been checked can be reused on another scheme.
- A document that does not match (name, year, institute) goes to review.
- The app never asks for Aadhaar number, bank account, IFSC, or an OTP.

Reuse is the product answer to “why do I upload the same ST certificate on NSP and again on SFMP?”

### 4.3 Payments and DBT

Payments are a **status list**:

- sanctioned
- pending
- credited (practice flag only)

The row also carries the Canara SFMP step so fellowship and overseas are not a second app. The copy never says the ministry sent money through this screen.

### 4.4 Alerts and pending actions

Alerts are generated from the same track: a missing paper, a mismatch waiting for review, a payment still pending. They sit behind the header bell and on the home list so the student does not hunt a third portal for “what is stuck?”

### 4.5 Settings and profile

Settings holds the profile the student already typed, language, and DigiLocker connect. Connect pulls a practice student file through `pull_student_file`. It does not open UIDAI or a bank.

### 4.6 Coverage register (designed, not live)

`coverage_register` holds tokens a ministry desk could match against UDISE+, APAAR and OTR later. The student app does not pretend that match already runs.

---

## 5. JAGO, in depth

JAGO is the technically dense part of the repository. It is not a wrapper around a single model call.

### 5.1 Locker-first hybrid retrieval

```
question
   |
   |- hard refuse?  (Aadhaar, OTP, bank page, “am I eligible?”, “when will money come?”)
   |     +- fixed honest line. No model.
   |
   |- greeting / “what is this app?”
   |     +- short product reply. Model still allowed if the key is present.
   |
   |- retrieve reviewed notes (BM25-style over the public corpus)
   |- expand with last turns of this thread
   +- if the question is personal and a practice file is connected
         prepend practiceBrief (name, course, documents, portals — no income, no mobile)

   compose with xAI when XAI_API_KEY is set
   acceptModelAnswer
         keep only if numbers look grounded in the retrieved blob
   else
         return the reviewed notes or the safe fallback
```

Personal questions are answered from the locker brief first. Scheme-rule questions are answered from retrieved notes first. That order is the difference between a generic chatbot and a scholarship assistant.

### 5.2 Policy gate

The model is not allowed to:

- declare a student eligible or ineligible
- name a rupee figure that is not in the notes
- ask for Aadhaar, OTP, or a bank page
- treat a name mismatch as a rejection
- speak as if JANMARG were NSP, DBT or Canara SFMP

`acceptModelAnswer` only checks decimal amounts or integers ≥ 50 against the retrieved blob. Small integers in ordinary conversation are left alone so “class 10” or “two documents” do not kill a reply.

### 5.3 Conversation, not one-shot FAQ

Threads live in the Zustand store (`janmarg-public-beta`, persist version 5).

- Left icon opens the history drawer
- Each thread has a title taken from the first user line
- New chat starts an empty thread
- Delete removes that thread
- Clear chat empties the open thread
- Follow-up chips appear only after the first exchange: “Documents for that?” and “What next?”
- Save text downloads the thread
- Save PNG draws the thread onto a guidance card

The assistant voice-over path is off. Speech-to-text can still sit behind `+` for the student’s own question.

### 5.4 Multilingual copy

Student-facing strings ship in twelve languages: English, Hindi, Hinglish, Bengali, Odia, Telugu, Tamil, Marathi, Gujarati, Assamese, Kannada and Santali. JAGO is asked to answer in the language the student is using. Official rules still have to be checked on the ministry page.

### 5.5 Picture questions

A student can attach a scheme poster or an instruction page. Identity cards and bank pages are refused in copy and in the media server. The image is read only on the server, and only when `XAI_API_KEY` is present.

---

## 6. Verification layer

The problem statement wants one layer in front of many sources. This repository uses a common adapter shape.

```
source adapter
   input: student field or document token
   output: match | mismatch | unavailable
   on mismatch: open a review card
   on unavailable: say the source is not live
```

| Source the PS names | Role in the design | Live in this build |
|---|---|---|
| NSP | Application and school / college schemes | Practice status only |
| DBT | Disbursement visibility | Practice status only |
| Canara SFMP | NFST / fellowship step | Practice status only |
| NOS portal | Overseas step | Practice status only |
| DigiLocker | Document pull | Practice RPC `pull_student_file` |
| AISHE | Institute recognition | Adapter stub |
| UDISE+ | School enrolment / coverage | Coverage register, not a live pull |
| APAAR | Student identity token | Coverage register, not a live pull |
| UIDAI | Identity | Not called. No Aadhaar field |
| UGC-NTA | NET / JRF | Adapter stub |
| State e-District | Income / domicile / ST certificate | Adapter stub |

The important product rule is already implemented: **a mismatch is review, not reject.**

---

## 7. Architecture

```
+----------------------------------------------------------+
|  Phone column · TanStack Start · React 19 · Tailwind     |
|  shell.tsx · module-pages · settings · jago-panel        |
|  Zustand persist · i18n packs                            |
+--------------+---------------------------+---------------+
               | server functions          | REST + RPC
               v                           v
+-----------------------------+   +------------------------+
|  guide-server               |   |  Supabase mankmitra3.0 |
|  knowledge.server           |   |  schemes               |
|  media-server               |   |  demo_students         |
|  retrieve + corpus          |   |  demo_documents        |
|  policy gate                |   |  jago_passages         |
|  optional xAI compose       |   |  official_extracts     |
|  XAI_API_KEY never leaves   |   |  scheme_routes         |
|  the server                 |   |  coverage_register     |
+-----------------------------+   |  locker_pulls          |
                                  |  pull_student_file     |
                                  +------------------------+
```

### 7.1 Why this stack

| Choice | Reason |
|---|---|
| Phone column, max 430px | The PS asks for a mobile application. Desktop judges still see a phone. |
| TanStack Start file routes | One tree for pages and server functions. No separate API process. |
| Zustand persist | Journey and chat survive a refresh without a ministry login. |
| Server functions for JAGO | The model key never ships to the browser. |
| Supabase practice registry | Judges can connect a file without a VPN or a live DigiLocker tenant. |
| Vercel + Nitro `vercel` preset | Same artefact the team already deploys. |
| PGLite fallback | Preview and local `npm run dev` work when `DATABASE_URL` is unset. |

### 7.2 Request path for a JAGO question

1. `jago-panel` posts the question and the last turns through `askGuidance`.
2. `guide-server` loads `knowledge.server` only inside the handler.
3. Retrieval runs on the reviewed corpus, then the locker brief if the question is personal.
4. If `XAI_API_KEY` is set, the server calls `https://api.x.ai/v1/chat/completions`.
5. The gate accepts or drops the model text.
6. The client appends the turn to the open thread.

`media-server.ts` is imported by the client because it exports `createServerFn` RPC stubs. It must not import other `*.server.ts` modules or the Vercel client build fails import-protection.

### 7.3 Auth

Email and password run through Better Auth. Google and X are offered when the visitor is not already signed in. Guest continue is for a judge who should not create an account. Session cookies stay on the server side of the Start app. There is no Aadhaar e-KYC in this build.

---

## 8. Data the prototype already holds

Connected project: **mankmitra3.0** (`https://ftszmxzdwqlgtrgridng.supabase.co`).

| Table | What it stores | Typical rows in the seed |
|---|---|---|
| `schemes` | Five scheme records | 5 |
| `scheme_routes` | Which portal owns the scheme | 5 |
| `demo_students` | Practice registry | 5 |
| `demo_documents` | Papers on those files | 20 |
| `official_extracts` | Short quotes with a source URL | 6 |
| `jago_passages` | Reviewed guidance notes | 14 |
| `knowledge_passages` | Versioned corpus mirror | 2+ |
| `coverage_register` | Outreach tokens | 8 |
| `locker_pulls` | Audit of practice pulls | grows on connect |
| `accounts` | Optional linked profile | 2 |

`POST /rest/v1/rpc/pull_student_file` with `{ "p_student_id": "random" }` returns a student, five documents and five portals. That is the DigiLocker connect a judge will see.

Row Level Security is on. The anon key can read public scheme notes. Student rows are not listed as a table dump. The RPC is the intended read path.

The client also ships an in-memory corpus in `src/lib/beta/corpus.ts`. JAGO still answers when the network is down.

---

## 9. Repository map

```
src/components/beta/     student app UI
src/lib/beta/            store, locker, retrieve, JAGO, i18n
src/lib/janmarg/         adapters, eligibility rules, coverage, accounts
src/lib/auth/            Better Auth, gates, tests
src/routes/              file routes for every screen
supabase/migrations/     practice schema and locker RPC
migrations/              local PGLite / auth schema
docs/                    architecture notes and acceptance
```

Screens a judge will actually open:

- `/` authentication
- `/dashboard` home track
- `/schemes` scheme list
- `/documents` wallet
- `/payments` DBT / SFMP list
- `/notifications` alerts
- `/jago` chatbot
- `/settings` profile and DigiLocker
- `/connect` practice locker pull

---

## 10. Honesty boundary

JANMARG will not do these things, in this build or in a later one, without an official mandate and a live API:

- Submit an application to NSP, SFMP or NOS
- Tell a student they are eligible or ineligible
- Show a rupee figure as a credit that left a government bank
- Collect Aadhaar, a bank account, IFSC, or an OTP
- Call UIDAI, live DigiLocker, live PFMS, or live Canara SFMP

If a later integration is signed, the same adapter and the same review-not-reject rule stay. Only the transport changes.

---

## 11. How this repository scores the nine judging criteria

| # | Criterion | Weight | Where the evidence is |
|---|---|---|---|
| 1 | Problem understanding | ★★★★ | Three portals, one-scheme rule, repeated papers, coverage gap. Section 1. |
| 2 | Innovation | ★★★★★ | Verify-once. Review-not-reject. Locker-first JAGO. One payment list instead of a portal mash-up. |
| 3 | Technical complexity | ★★★★★ | Hybrid retrieval, history expansion, policy scrub, practice RPC, server-only model key. |
| 4 | Technical feasibility | ★★★★★ | Running MVP. Roadmap that waits for official APIs instead of faking them. |
| 5 | Architecture | ★★★★ | Modular phone shell, server JAGO, Supabase practice layer. Section 7. |
| 6 | Implementation quality | ★★★★★ | Polished phone UI, tests, typecheck, Vercel production build. |
| 7 | UX / UI | ★★★★ | Login → guide or skip → dashboard. Four tabs. Chat that behaves like a chat app. |
| 8 | Impact | ★★★★★ | One file instead of three logins. Faster review. Outreach designed, not invented. |
| 9 | Scalability | ★★★★ | Vercel + Supabase. Key on the server. Same module grows when APIs are issued. |

### Questions judges usually ask

**Why does this problem exist?**  
Because five schemes were stood up on three systems, and a student is still allowed only one scheme at a time.

**What is new?**  
The student does not get another form. They get one track, one wallet, one payment list, and a chatbot that reads the file before it reads the model.

**What is hard?**  
Grounding a conversational assistant in reviewed notes and a locker file without letting it invent eligibility or money.

**Can this actually be built?**  
This repository is the working MVP. Live ministry APIs are a contract change, not a rewrite.

**Why this architecture?**  
The phone column is the product. The server is where retrieval and the model key live. Supabase is the practice registry until official tenants exist.

**Is it built or only a slide?**  
Open `/dashboard`, `/documents`, `/payments`, `/jago`. The path is implemented.

**Can a first-time user understand it?**  
Yes. Authentication, optional guide, then four tabs.

**Who benefits?**  
The student, the parent, the institute desk, and later the ministry outreach cell.

**Will it scale?**  
The web tier is already on Vercel. The registry is already on Supabase. Official APIs replace adapters, they do not replace the student module.

---

## 12. Impact, without invented census numbers

- One question (“where is my file?”) stops requiring three portals.
- A parent with two children sees both tracks on one home screen.
- A deficiency is an alert, not a vanished application.
- A name mismatch is a review card, not a silent reject.
- JAGO answers in the student’s language from reviewed notes, then from the connected file.
- When UDISE+ / APAAR / OTR matching is authorised, the same module can list enrolled students who are not yet on a scholarship file. That list is not live here.

Time saved is the number of repeat uploads and the number of “please check the other portal” trips. Those are the measurable outcomes this design is built to cut.

---

## 13. Roadmap

**In this repository now**

- Unified five-scheme dashboard
- Practice document wallet and DigiLocker connect
- Verify-once reuse
- Payments and deficiency alerts
- Conversational JAGO with history
- Email sign-in; Google / X when the visitor is not already signed in
- Twelve-language UI copy

**When official APIs exist**

- Read-only NSP / SFMP / NOS status. Not a new application form.
- Real DigiLocker pull under the student’s consent.
- AISHE / UDISE+ / APAAR / UGC-NTA checks through the same verification layer.
- Coverage matching for outreach.

**Not in the MVP, on purpose**

- Submitting an application
- Declaring a student eligible or ineligible
- Showing a rupee credit as if DBT sent it
- Capturing Aadhaar, bank account, or OTP

---

## 14. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:8080`.

```bash
npm test
npm run typecheck
```

Copy `.env.example` for local keys.

`XAI_API_KEY` is optional and stays on the server. JAGO still answers from the reviewed notes when that key is absent.

---

## 15. Deploy on Vercel

The production build uses the Nitro `vercel` preset.

1. Import [owais265/JANMARG](https://github.com/owais265/JANMARG).
2. Vercel → Settings → Environment Variables.
3. Name: `XAI_API_KEY`
4. Value: the key from the xAI console. Do not commit it.
5. Environment: Production. Then Redeploy.

Do not name it `VITE_XAI_API_KEY`. A `VITE_` name is bundled into the public site.

Do not set `DATABASE_URL` if you want the same behaviour as the published preview. That variable switches the server store off the local PGLite fallback.

Team notes for this entry:

- Vercel team: **prograckers**
- Vercel project: **jnmarg**
- Supabase project: **mankmitra3.0**

Turn off Vercel Deployment Protection if evaluators must open the URL without a Vercel login.

---

## 16. Licence and use

This repository is a student prototype for SIH 2026. It is not affiliated with or endorsed by the Ministry of Tribal Affairs unless an official communication says so. Confirm every scheme rule on the official page before anyone applies.
