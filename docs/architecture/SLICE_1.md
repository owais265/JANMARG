# JANMARG — Slice 1

Foundation, navigation, theme, English/Hindi, demo mode.

Slice 2 does not start until this checklist is accepted.

## Assumptions

- The student app is mobile-first. A desktop frame is only a stage around the phone.
- English and Hindi are first-class. No screen ships with one language.
- Demo mode is visible wherever a connector is a mock. The label is “Demo Mode — Synthetic / Mock Integration”.
- Eligibility stays deterministic. JAGO does not decide a match.
- The Flutter client may hold only `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_ENV`, and public flags.
- Service role, LLM, and OAuth secrets stay in Edge Functions.
- Official connectors are interfaces. Without credentials they return “credentials not configured”, never a fake live session.
- No scraping of logged-in portals, Aadhaar, bank data, or private dashboards.
- This preview session has no Flutter or Dart toolchain, so `flutter analyze` cannot be the gate here. The running app already has the Slice 1 surfaces. The tree below is the production Flutter target, not a second app to merge at random.

## File tree (production target)

```text
lib/
  main.dart
  core/
    constants/demo_mode.dart
    theme/janmarg_theme.dart
    router/app_router.dart
    localization/app_en.arb
    localization/app_hi.arb
    errors/app_failure.dart
    network/api_client.dart
    security/secret_policy.dart
    logging/app_log.dart
    config/env.dart
  features/
    auth/
    consent/
    onboarding/
    profile/
    dashboard/
    schemes/
    eligibility/
    document_passport/
    verification/
    applications/
    payments/
    notifications/
    jago/
    outreach_insights/
    officer_review/
    offline/
    integrations/
  shared/
    models/
    widgets/
    repositories/
    usecases/
supabase/
  migrations/
  functions/
  tests/
docs/
  architecture/
  api_contracts/
  data_dictionary/
  security/
  qa/
  demo_script/
  source_register/
```

Slice 1 files only: `main.dart`, `core/theme`, `core/router`, `core/localization`, `core/constants/demo_mode.dart`, `core/config/env.dart`. Feature folders stay empty until their slice.

## Dependencies (Slice 1)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  flutter_riverpod: ^2.6.1
  go_router: ^14.8.1
  intl: any
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0
```

Not in Slice 1: Dio, Hive, Supabase, embeddings.

## Initialize (production machine)

```bash
flutter create --org in.gov.motta.janmarg --platforms=android,web janmarg
cd janmarg
flutter pub add flutter_riverpod go_router intl
flutter pub add flutter_localizations --sdk=flutter
flutter gen-l10n
flutter analyze
flutter test
```

Do not run these inside the preview session. Flutter is not installed there, and replacing the running app would take the preview down.

## Slice 1 acceptance

- [ ] App opens on a phone-width layout
- [ ] Routes exist for home, schemes, documents, journey, JAGO, more
- [ ] Theme is Material 3, high contrast, large tap targets
- [ ] Language toggle switches every visible string between English and Hindi
- [ ] Demo mode badge is on screen when connectors are mocks
- [ ] `flutter analyze` is clean
- [ ] One widget test covers the language toggle and the demo badge
- [ ] No API key, service role, or OAuth secret in `lib/`

## Known limit

The preview already has navigation, the forest theme, English/Hindi, and the demo badge. It is not a Flutter binary. Slice 1 of the Dart tree is specified here and is not compiled in this session.
