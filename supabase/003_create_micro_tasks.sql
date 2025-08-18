create extension if not exists pgcrypto;

-- Tabla de micro-tareas
create table if not exists public.micro_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,

  -- ID externo opcional (p.ej., generado por Mabot)
  task_id_external text,

  -- Core
  title text not null,
  description text,
  status text not null check (status in ('pending','in-progress','completed','skipped')),
  priority text not null check (priority in ('low','medium','high')),

  -- Métricas de tiempo
  estimated_minutes int check (estimated_minutes >= 0),
  actual_minutes int check (actual_minutes >= 0),
  completion_date date,

  -- Señales para AI
  dopamine_score int check (dopamine_score between 1 and 10),
  task_type text,            -- e.g., 'Deep Work','Admin','Quick Win','Creative'
  resistance_level text,     -- e.g., 'low','medium','high'

  -- Dependencias
  dependency_task_external_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger (reutiliza la función si ya existe)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_micro_tasks_updated_at on public.micro_tasks;
create trigger set_micro_tasks_updated_at
before update on public.micro_tasks
for each row execute function public.set_updated_at();

-- RLS
alter table public.micro_tasks enable row level security;

drop policy if exists "MicroTasks select own" on public.micro_tasks;
create policy "MicroTasks select own"
on public.micro_tasks for select
using (auth.uid() = user_id);

drop policy if exists "MicroTasks insert own" on public.micro_tasks;
create policy "MicroTasks insert own"
on public.micro_tasks for insert
with check (auth.uid() = user_id);

drop policy if exists "MicroTasks update own" on public.micro_tasks;
create policy "MicroTasks update own"
on public.micro_tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "MicroTasks delete own" on public.micro_tasks;
create policy "MicroTasks delete own"
on public.micro_tasks for delete
using (auth.uid() = user_id);

-- Índices útiles
create index if not exists micro_tasks_user_project_idx on public.micro_tasks (user_id, project_id);
create index if not exists micro_tasks_status_idx       on public.micro_tasks (status);
create index if not exists micro_tasks_priority_idx     on public.micro_tasks (priority);
create index if not exists micro_tasks_completion_idx   on public.micro_tasks (completion_date);
create index if not exists micro_tasks_external_id_idx  on public.micro_tasks (task_id_external);

-- (Opcional) Validación rápida: mantener prioridad consistente
-- ALTER TABLE public.micro_tasks ADD CONSTRAINT priority_lower_chk CHECK (priority = lower(priority));