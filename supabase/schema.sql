-- Run this once in the Supabase project's SQL editor (Dashboard > SQL Editor > New query).

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  category text not null default 'any',
  cuisine text not null default '',
  tags text[] not null default '{}',
  ingredients jsonb not null default '[]',
  instructions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists week_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start date not null,
  plan jsonb not null default '{}',
  checked jsonb not null default '{}',
  stores jsonb not null default '{}',
  unique (user_id, week_start)
);
alter table week_plans add column if not exists stores jsonb not null default '{}';

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  email text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;
alter table week_plans enable row level security;
alter table stores enable row level security;
alter table contacts enable row level security;

drop policy if exists "recipes are owned by their user" on recipes;
create policy "recipes are owned by their user" on recipes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "week_plans are owned by their user" on week_plans;
create policy "week_plans are owned by their user" on week_plans
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "stores are owned by their user" on stores;
create policy "stores are owned by their user" on stores
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "contacts are owned by their user" on contacts;
create policy "contacts are owned by their user" on contacts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
