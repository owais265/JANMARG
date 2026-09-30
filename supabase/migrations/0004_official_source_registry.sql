-- Phase 1: official source registry and ingestion tables. No page content.

alter table janmarg.knowledge_sources
  add column if not exists owner_organization text,
  add column if not exists allowed_url_patterns text[] not null default '{}',
  add column if not exists disallowed_url_patterns text[] not null default '{}',
  add column if not exists robots_url text,
  add column if not exists crawl_frequency text not null default 'manual',
  add column if not exists max_pages integer not null default 30,
  add column if not exists max_requests_per_minute integer not null default 10,
  add column if not exists updated_at timestamptz not null default now();

alter table janmarg.knowledge_documents
  add column if not exists scheme_id text,
  add column if not exists content_type text not null default 'html',
  add column if not exists content_class text not null default 'curated_demo_extract',
  add column if not exists publication_date date,
  add column if not exists effective_date date,
  add column if not exists fetched_at timestamptz,
  add column if not exists raw_storage_path text,
  add column if not exists extracted_text text,
  add column if not exists extraction_status text not null default 'not_fetched',
  add column if not exists approved_by text,
  add column if not exists approved_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table janmarg.knowledge_chunks
  add column if not exists section_title text,
  add column if not exists page_number integer,
  add column if not exists token_estimate integer,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table janmarg.knowledge_chunks
  add column if not exists search_vector tsvector
  generated always as (to_tsvector('simple', coalesce(content, ''))) stored;

create index if not exists knowledge_chunks_fts on janmarg.knowledge_chunks using gin (search_vector);
create unique index if not exists knowledge_sources_domain on janmarg.knowledge_sources (official_domain);

create table if not exists janmarg.ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references janmarg.knowledge_sources (id),
  job_type text not null,
  status text not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  pages_discovered integer not null default 0,
  pages_fetched integer not null default 0,
  pages_skipped integer not null default 0,
  documents_created integer not null default 0,
  chunks_created integer not null default 0,
  error_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.ingestion_fetch_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references janmarg.ingestion_jobs (id),
  url text not null,
  http_status integer,
  robots_allowed boolean,
  response_hash text,
  duration_ms integer,
  fetch_status text not null,
  error_message text,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists janmarg.content_review_queue (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references janmarg.knowledge_documents (id),
  review_reason text not null,
  priority text not null default 'normal',
  status text not null default 'pending',
  assigned_to uuid,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists janmarg.source_facts (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references janmarg.knowledge_documents (id),
  scheme_id text,
  fact_type text not null,
  fact_key text not null,
  fact_value jsonb not null,
  exact_quote text not null,
  page_or_section text,
  source_url text not null,
  confidence text not null default 'low',
  needs_human_review boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table janmarg.ingestion_jobs enable row level security;
alter table janmarg.ingestion_fetch_logs enable row level security;
alter table janmarg.content_review_queue enable row level security;
alter table janmarg.source_facts enable row level security;

drop policy if exists chunks_read on janmarg.knowledge_chunks;
create policy chunks_read on janmarg.knowledge_chunks
  for select to anon, authenticated
  using (
    exists (
      select 1 from janmarg.knowledge_documents d
      where d.id = document_id and d.approval_status = 'approved'
    )
  );

update janmarg.rag_runtime
set retrieval_mode = 'DEMO_FTS_FALLBACK',
    embedding_provider = 'none',
    note = 'xAI returned no embedding model. Vectors are not fabricated. Retrieval uses PostgreSQL full text until an embedding model is available.'
where id = 'current';

update janmarg.knowledge_sources
set owner_organization = 'Ministry of Tribal Affairs',
    source_type = 'ministry',
    robots_url = 'https://tribal.nic.in/robots.txt',
    allowed_url_patterns = array['https://tribal.nic.in/'],
    disallowed_url_patterns = array['login', 'signin', 'otp', 'captcha', 'dashboard'],
    max_pages = 30,
    max_requests_per_minute = 10,
    requires_manual_approval = true,
    updated_at = now()
where official_domain = 'tribal.nic.in';
