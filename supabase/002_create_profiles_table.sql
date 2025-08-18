-- Create profiles table with user-owned data and RLS

create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    email text not null,
    full_name text,
    timezone text default 'UTC',
    working_hours text default '9:00 AM - 6:00 PM',
    focus_goal text default '4 hours',
    theme text default 'dark',

    -- Flags
    onboarding_completed boolean not null default false,
    is_premium boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint profiles_user_unique unique (user_id)
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Indexes
create index if not exists profiles_user_id_idx on public.profiles (user_id);

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "Profiles insert own" on public.profiles;
create policy "Profiles insert own"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Profiles delete own" on public.profiles;
create policy "Profiles delete own"
on public.profiles for delete
using (auth.uid() = user_id);


