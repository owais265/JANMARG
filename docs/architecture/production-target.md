# JANMARG production target

The interactive preview is the student desk: mobile-first, synthetic personas, deterministic rules, and labelled mocks.

Production shape, not wired to live credentials in this demo:

```
Flutter app
  → authenticated Supabase Edge Function
    → server-side secret
      → third-party connector
```

No DigiLocker, UIDAI, DBT, APAAR, UDISE+, AISHE, NSP, NFST, or NOS live call is made.
No service-role key, LLM key, or client secret belongs in the app binary.

Data mode in this build is `demoMock`. `productionAdapterReserved` returns `reserved` and does not call out.

Eligibility is a versioned rule function. JAGO only returns a stored official extract or the refusal sentence. It does not decide a scholarship.

Officer views are aggregates. They cannot sanction or reject.
