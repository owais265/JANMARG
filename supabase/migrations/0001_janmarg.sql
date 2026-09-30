-- Production contract for a future Supabase project.
-- Not applied by the interactive demo. No service-role key ships with the app.

create table student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  legal_name text not null,
  birth_year int,
  st_status text not null,
  state_name text,
  district text,
  study_level text,
  institution_name text,
  family_income_inr int,
  created_at timestamptz not null default now()
);

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null,
  granted boolean not null,
  version text not null,
  created_at timestamptz not null default now()
);

create table schemes (
  id text primary key,
  processing text not null
);

create table scheme_rule_versions (
  id text primary key,
  scheme_id text not null references schemes (id),
  version text not null,
  definition jsonb not null
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  source text not null,
  status text not null,
  expiry date,
  reference_masked text not null,
  consent text not null
);

create table verification_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table mismatch_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  field_name text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scheme_id text not null,
  status text not null,
  receipt_id text,
  updated_at timestamptz not null default now()
);

create table application_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references applications (id) on delete cascade,
  status text not null,
  owner_role text not null,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title_key text not null,
  body_key text not null,
  read_at timestamptz
);

create table knowledge_documents (
  id text primary key,
  title text not null,
  source_label text not null,
  source_url text not null
);

create table knowledge_chunks (
  id text primary key,
  document_id text not null references knowledge_documents (id),
  lang text not null,
  body text not null
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  body text not null,
  confident boolean not null,
  created_at timestamptz not null default now()
);

create table outreach_signals (
  id text primary key,
  district text not null,
  state_name text not null,
  enrolled_estimate int not null,
  registered_estimate int not null,
  gap_estimate int not null
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action_key text not null,
  created_at timestamptz not null default now()
);

alter table student_profiles enable row level security;
alter table consent_records enable row level security;
alter table documents enable row level security;
alter table verification_checks enable row level security;
alter table mismatch_cases enable row level security;
alter table applications enable row level security;
alter table application_events enable row level security;
alter table notifications enable row level security;
alter table chat_messages enable row level security;
alter table audit_logs enable row level security;

create policy student_profiles_own on student_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy consent_own on consent_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy documents_own on documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy checks_own on verification_checks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy mismatch_own on mismatch_cases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy applications_own on applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy events_own on application_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy notes_own on notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy chat_own on chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy audit_own on audit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Officers do not receive student rows. They read this aggregate only.
create view officer_application_counts as
  select scheme_id, status, count(*)::int as total
  from applications
  group by scheme_id, status;
