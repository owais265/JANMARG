-- Curated public-source notes and per-user guidance history.
-- Passages are public guidance, not government records.
-- Messages are scoped by the signed-in user id in server functions.

create table if not exists knowledge_passages (
  id text primary key,
  scheme text not null,
  topic text not null,
  lang text not null,
  title text not null,
  body text not null,
  source_title text not null,
  source_url text not null,
  reviewed_on text not null,
  keywords text not null default '',
  version text not null
);

create index if not exists knowledge_passages_scheme_idx on knowledge_passages (scheme, lang);

create table if not exists guidance_messages (
  id text primary key,
  user_id text not null,
  role text not null,
  body text not null,
  cites_json text not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists guidance_messages_user_idx on guidance_messages (user_id, created_at);
