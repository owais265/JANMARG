-- Applied on the connected Supabase project as locker_pull_gateway.
-- Reads the student registry already stored in public.demo_students.
-- No live DigiLocker or scholarship-portal credential is used.

create table if not exists public.locker_pulls (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.locker_pulls enable row level security;

-- Function body is maintained in the live project.
-- Clients call: POST /rest/v1/rpc/pull_student_file { "p_student_id": "random" | "<id>" }
