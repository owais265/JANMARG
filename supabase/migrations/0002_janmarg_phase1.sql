-- Phase 1. Additive. Does not drop public.schemes, accounts, or jago_passages.
-- Optional extensions are not required for this phase.

create schema if not exists janmarg;

grant usage on schema janmarg to anon, authenticated, service_role;

do $$ begin
  create type janmarg.app_role as enum ('student', 'guardian', 'officer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.consent_status as enum ('granted', 'denied', 'revoked', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.approval_status as enum ('draft', 'approved', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.verification_status as enum ('verified', 'pending', 'expired', 'mismatch', 'unavailable', 'consentDenied');
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.eligibility_status as enum ('likelyEligible', 'needsEvidence', 'notMatched', 'unavailable');
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.document_source as enum ('userUpload', 'digilockerMock', 'academicRegistryMock', 'institutionMock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.data_mode as enum ('demoMock', 'productionAdapterReserved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.application_status as enum (
    'draft', 'submitted', 'documentsPending', 'instituteVerification', 'stateVerification',
    'ministryReview', 'sanctioned', 'pfmsProcessing', 'disbursed', 'returnedForCorrection', 'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.review_status as enum ('open', 'assigned', 'awaiting_student', 'resolved', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type janmarg.reason_outcome as enum ('matched', 'unmet', 'missingEvidence', 'unavailable');
exception when duplicate_object then null; end $$;

create or replace function janmarg.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create table if not exists janmarg.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role janmarg.app_role not null default 'student',
  full_name text not null default '',
  preferred_language text not null default 'en',
  phone_masked text,
  state text,
  district text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references janmarg.profiles (id) on delete cascade,
  full_name text not null,
  date_of_birth date,
  gender text,
  tribe_category text,
  state text,
  district text,
  education_level text,
  class_or_program text,
  institution_name text,
  institution_code text,
  annual_family_income integer,
  apaar_id_masked text,
  data_mode janmarg.data_mode not null default 'demoMock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  source_system text not null,
  consent_type text not null,
  purpose text not null,
  requested_fields jsonb not null default '[]'::jsonb,
  status janmarg.consent_status not null,
  granted_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.guardians (
  id uuid primary key default gen_random_uuid(),
  guardian_user_id uuid not null references janmarg.profiles (id) on delete cascade,
  student_user_id uuid not null references janmarg.profiles (id) on delete cascade,
  relationship text not null,
  consent_id uuid references janmarg.consent_records (id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.schemes (
  id uuid primary key default gen_random_uuid(),
  scheme_code text not null unique,
  scheme_name text not null,
  short_name text not null,
  scheme_category text not null,
  description text not null,
  source_url text,
  active boolean not null default true,
  data_mode janmarg.data_mode not null default 'demoMock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.scheme_rule_versions (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references janmarg.schemes (id) on delete cascade,
  version_name text not null,
  effective_from date not null,
  effective_to date,
  source_url text,
  source_title text,
  last_verified_at timestamptz,
  approval_status janmarg.approval_status not null default 'draft',
  approved_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.scheme_rules (
  id uuid primary key default gen_random_uuid(),
  rule_version_id uuid not null references janmarg.scheme_rule_versions (id) on delete cascade,
  rule_key text not null,
  field_name text not null,
  operator text not null,
  expected_value jsonb not null,
  evidence_type text,
  severity text not null,
  human_reason_en text not null,
  human_reason_hi text not null,
  source_reference text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.scheme_required_documents (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references janmarg.schemes (id) on delete cascade,
  document_type text not null,
  required boolean not null default true,
  conditional_rule jsonb,
  description_en text not null,
  description_hi text not null,
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.scheme_institutes (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references janmarg.schemes (id) on delete cascade,
  institute_name text not null,
  institute_code text not null,
  state text,
  city text,
  is_active boolean not null default true,
  source_url text,
  version text not null default 'demo-sample',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  document_type text not null,
  document_name text not null,
  storage_path text,
  source janmarg.document_source not null,
  verification_status janmarg.verification_status not null default 'pending',
  issued_on date,
  expires_on date,
  masked_identifier text,
  extracted_metadata jsonb not null default '{}'::jsonb,
  reusable_for jsonb not null default '[]'::jsonb,
  consent_id uuid references janmarg.consent_records (id),
  data_mode janmarg.data_mode not null default 'demoMock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references janmarg.documents (id) on delete cascade,
  storage_path text not null,
  version_number integer not null,
  is_current boolean not null default true,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists janmarg.document_permissions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references janmarg.documents (id) on delete cascade,
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  scheme_id uuid references janmarg.schemes (id),
  purpose text not null,
  allowed boolean not null default false,
  granted_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists janmarg.eligibility_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  scheme_id uuid not null references janmarg.schemes (id),
  rule_version_id uuid references janmarg.scheme_rule_versions (id),
  status janmarg.eligibility_status not null,
  profile_snapshot jsonb not null default '{}'::jsonb,
  result_summary_en text,
  result_summary_hi text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.eligibility_reasons (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references janmarg.eligibility_assessments (id) on delete cascade,
  rule_id uuid references janmarg.scheme_rules (id),
  outcome janmarg.reason_outcome not null,
  reason_en text not null,
  reason_hi text not null,
  required_action_en text,
  required_action_hi text,
  severity text,
  created_at timestamptz not null default now()
);

create table if not exists janmarg.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  scheme_id uuid not null references janmarg.schemes (id),
  external_application_reference text,
  status janmarg.application_status not null default 'draft',
  form_snapshot jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  last_synced_at timestamptz,
  data_mode janmarg.data_mode not null default 'demoMock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references janmarg.applications (id) on delete cascade,
  previous_status janmarg.application_status,
  current_status janmarg.application_status not null,
  actor_type text not null,
  actor_id uuid,
  source_system text not null,
  reason_code text,
  reason_en text,
  reason_hi text,
  correlation_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists janmarg.verification_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  scheme_id uuid references janmarg.schemes (id),
  application_id uuid references janmarg.applications (id),
  source_system text not null,
  check_type text not null,
  status janmarg.verification_status not null,
  result jsonb not null default '{}'::jsonb,
  reason_code text,
  reason_en text,
  reason_hi text,
  correlation_id uuid not null default gen_random_uuid(),
  checked_at timestamptz not null default now(),
  expires_at timestamptz,
  data_mode janmarg.data_mode not null default 'demoMock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.mismatch_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  verification_check_id uuid references janmarg.verification_checks (id),
  field_name text not null,
  profile_value_masked text,
  source_value_masked text,
  severity text not null,
  explanation_en text not null,
  explanation_hi text not null,
  recommended_action text not null,
  manual_review_required boolean not null default true,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.manual_review_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  scheme_id uuid references janmarg.schemes (id),
  application_id uuid references janmarg.applications (id),
  mismatch_case_id uuid references janmarg.mismatch_cases (id),
  issue_type text not null,
  description text not null,
  status janmarg.review_status not null default 'open',
  assigned_officer_id uuid references janmarg.profiles (id),
  resolution_note text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.payment_status_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references janmarg.applications (id) on delete cascade,
  payment_status text not null,
  amount numeric(12, 2),
  currency text not null default 'INR',
  source_system text not null,
  reference_masked text,
  event_date date,
  message_en text not null,
  message_hi text not null,
  data_mode janmarg.data_mode not null default 'demoMock',
  created_at timestamptz not null default now()
);

create table if not exists janmarg.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references janmarg.profiles (id) on delete cascade,
  notification_type text not null,
  title_en text not null,
  title_hi text not null,
  body_en text not null,
  body_hi text not null,
  action_url text,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists janmarg.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  purpose text,
  correlation_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists janmarg.integration_health_events (
  id uuid primary key default gen_random_uuid(),
  connector_name text not null,
  adapter_mode text not null,
  status text not null,
  latency_ms integer,
  correlation_id uuid,
  error_code text,
  error_message text,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists student_profiles_user_idx on janmarg.student_profiles (user_id);
create index if not exists documents_user_idx on janmarg.documents (user_id, verification_status);
create index if not exists applications_user_status_idx on janmarg.applications (user_id, status, created_at desc);
create index if not exists application_events_app_idx on janmarg.application_events (application_id, created_at);
create index if not exists notifications_user_idx on janmarg.notifications (user_id, is_read, created_at desc);
create index if not exists reviews_officer_idx on janmarg.manual_review_requests (assigned_officer_id, status);
create index if not exists scheme_rules_version_idx on janmarg.scheme_rules (rule_version_id, sort_order);
