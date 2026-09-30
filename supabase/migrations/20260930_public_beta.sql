-- JANMARG public beta. Guidance data only. No documents, bank, or identity numbers.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  preferred_language text not null default 'hinglish',
  state text,
  district text,
  education_stage text,
  institution_type text,
  broad_income_band text,
  category_self_declared text,
  consent_given_at timestamptz,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_checklists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  scheme_code text not null,
  checklist_json jsonb not null default '[]'::jsonb,
  completion_percent int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_guidance (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  scheme_code text not null,
  title text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  consent_type text not null,
  consent_text_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata_json jsonb not null default '{}'::jsonb
);

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  canonical_url text not null,
  source_domain text not null,
  reviewed_on date,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_checklists enable row level security;
alter table public.saved_guidance enable row level security;
alter table public.consents enable row level security;
alter table public.knowledge_sources enable row level security;

create policy profiles_own on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy checklists_own on public.user_checklists
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy saved_own on public.saved_guidance
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy consents_own on public.consents
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy knowledge_read_approved on public.knowledge_sources
  for select using (status = 'approved');
