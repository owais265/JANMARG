-- Retrieval shell. Vectors are demoHash until an xAI embedding model is available.

create table if not exists janmarg.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  official_domain text not null,
  base_url text not null,
  source_type text not null default 'manual',
  active boolean not null default true,
  requires_manual_approval boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists janmarg.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references janmarg.knowledge_sources (id) on delete cascade,
  canonical_url text not null,
  title text not null,
  language text not null,
  content_hash text not null,
  approval_status text not null default 'approved',
  created_at timestamptz not null default now()
);

create table if not exists janmarg.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references janmarg.knowledge_documents (id) on delete cascade,
  chunk_key text not null unique,
  chunk_index integer not null default 0,
  content text not null,
  next_step text,
  embedding vector(64),
  embedding_provider text not null default 'demoHash',
  created_at timestamptz not null default now()
);

create table if not exists janmarg.rag_runtime (
  id text primary key,
  retrieval_mode text not null,
  embedding_provider text not null,
  dimensions integer not null,
  note text not null
);

alter table janmarg.knowledge_sources enable row level security;
alter table janmarg.knowledge_documents enable row level security;
alter table janmarg.knowledge_chunks enable row level security;
alter table janmarg.rag_runtime enable row level security;

grant select on janmarg.knowledge_sources, janmarg.knowledge_documents, janmarg.knowledge_chunks, janmarg.rag_runtime to anon, authenticated;

drop policy if exists sources_read on janmarg.knowledge_sources;
create policy sources_read on janmarg.knowledge_sources for select to anon, authenticated using (active);

drop policy if exists docs_read on janmarg.knowledge_documents;
create policy docs_read on janmarg.knowledge_documents for select to anon, authenticated using (approval_status = 'approved');

drop policy if exists chunks_read on janmarg.knowledge_chunks;
create policy chunks_read on janmarg.knowledge_chunks for select to anon, authenticated using (embedding_provider in ('demoHash', 'xai'));

drop policy if exists rag_read on janmarg.rag_runtime;
create policy rag_read on janmarg.rag_runtime for select to anon, authenticated using (true);

insert into janmarg.rag_runtime (id, retrieval_mode, embedding_provider, dimensions, note)
values (
  'current',
  'demo',
  'demoHash',
  64,
  'xAI embedding models were not available for this key. Retrieval uses a temporary hash plus curated passages. Not a live semantic model.'
)
on conflict (id) do update set retrieval_mode = excluded.retrieval_mode, embedding_provider = excluded.embedding_provider, note = excluded.note;

insert into janmarg.knowledge_sources (id, source_name, official_domain, base_url)
values ('11111111-1111-4111-8111-111111111111', 'Ministry of Tribal Affairs — demo extract', 'tribal.nic.in', 'https://tribal.nic.in/ScholarshiP.aspx')
on conflict (id) do nothing;

create or replace function public.match_demo_chunks(
  query_embedding vector(64),
  match_count integer default 3,
  filter_language text default null
)
returns table (
  chunk_key text,
  title text,
  content text,
  next_step text,
  source_title text,
  source_url text,
  similarity double precision,
  embedding_provider text
)
language sql
stable
security definer
set search_path = janmarg, public
as $$
  select
    c.chunk_key,
    d.title,
    c.content,
    c.next_step,
    s.source_name,
    d.canonical_url,
    1 - (c.embedding <=> query_embedding),
    c.embedding_provider
  from janmarg.knowledge_chunks c
  join janmarg.knowledge_documents d on d.id = c.document_id
  join janmarg.knowledge_sources s on s.id = d.source_id
  where d.approval_status = 'approved'
    and c.embedding is not null
    and (filter_language is null or d.language = filter_language)
  order by c.embedding <=> query_embedding
  limit greatest(1, least(match_count, 5));
$$;

revoke all on function public.match_demo_chunks(vector, integer, text) from public;
grant execute on function public.match_demo_chunks(vector, integer, text) to anon, authenticated;
