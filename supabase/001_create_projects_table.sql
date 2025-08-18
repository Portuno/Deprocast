-- Create projects table and RLS policies for Deprocast

-- Extensions (Supabase usually has pgcrypto enabled, keep for portability)
create extension if not exists pgcrypto;

-- Table: public.projects
create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,

    -- Essential information
    title text not null,
    description text not null,
    target_completion_date date not null,

    -- Optional (recommended)
    category text check (category in ('Professional','Personal','Learning','Other')),
    motivation text,
    perceived_difficulty int check (perceived_difficulty between 1 and 10),
    known_obstacles text,
    skills_resources_needed text[] default '{}',

    -- Meta
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.projects enable row level security;

-- Policies: only owner can access their rows
drop policy if exists "Projects select own" on public.projects;
create policy "Projects select own"
on public.projects for select
using (auth.uid() = user_id);

drop policy if exists "Projects insert own" on public.projects;
create policy "Projects insert own"
on public.projects for insert
with check (auth.uid() = user_id);

drop policy if exists "Projects update own" on public.projects;
create policy "Projects update own"
on public.projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Projects delete own" on public.projects;
create policy "Projects delete own"
on public.projects for delete
using (auth.uid() = user_id);

-- Helpful index for user scoping and deadline queries
create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_target_date_idx on public.projects (target_completion_date);


