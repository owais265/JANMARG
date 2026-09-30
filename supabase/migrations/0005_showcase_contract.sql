-- Contract sketch for a later Supabase project.
-- The live rehearsal does not require this database.
-- Do not store real Aadhaar, bank accounts, or beneficiary rows.

create table if not exists public.showcase_notes (
  id text primary key,
  title text not null,
  canonical_url text not null,
  excerpt text not null,
  reviewed_on date not null
);
