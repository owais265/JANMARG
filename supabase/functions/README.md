# Edge functions

Privileged work belongs here, never in the client.

```
app → user JWT → edge function → secret in the function environment → connector
```

Planned functions, not deployed with live keys in this demo:

- `verify-otp` — identity mock or future gateway
- `import-document` — DigiLocker only after consent
- `academic-record` — registry lookup, mismatch returned as data not a decision
- `submit-application` — scheme gateway
- `jago-answer` — retrieval over `knowledge_chunks` only; refusal when confidence is low

The service role key stays in the function environment. The app stores only the user session.
