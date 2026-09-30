# Adapter contract

All privileged calls stop at an adapter. The demo implements `DataMode = demoMock`.
`productionAdapterReserved` returns `{ outcome: "reserved" }`.

## IdentityAdapter

- `sendOtp` → success | reserved
- `verifyOtp` → success | invalidOtp | reserved

## DocumentAdapter

- `startConsent` → success | consentDenied | reserved
- `listDocuments` → success | sourceUnavailable | reserved
- `importDocument` → success | consentDenied | sourceUnavailable | reserved
- `revokeConsent` → success | reserved

## AcademicAdapter

- `getStudentRecord` → success | mismatch | sourceUnavailable | reserved

## SchemeGateway

- `submitApplication` → success | validationFailure | offline | sourceUnavailable | reserved
- `getTimeline` / `pollPortal` → delayed | success | sourceUnavailable | reserved

## NotificationAdapter

- schedule, list, markRead — local to the signed-in demo persona

## KnowledgeAdapter

- `search` / `answer` — retrieval over the checked extract set only
- low confidence → no generated policy text

Validation codes: offline, sourceUnavailable, schemeClosed, readinessOnly, alreadySubmitted, instituteUnconfirmed, expiredDoc, mismatch, missingDoc, consent, notReady.
