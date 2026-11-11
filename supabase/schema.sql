-- Free Supabase project. Paste this into the SQL editor once.
-- The app keeps working in the browser if this database is not connected.
-- This policy is open on purpose for the demo. Do not put real parent numbers here.

create table if not exists public.registers (
  school_id text primary key,
  phones jsonb not null default '{}'::jsonb,
  attendance jsonb not null default '{}'::jsonb,
  staff jsonb not null default '{}'::jsonb,
  cover jsonb not null default '{}'::jsonb,
  alerts jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.registers enable row level security;

grant select, insert, update on public.registers to anon, authenticated;

drop policy if exists "demo read" on public.registers;
drop policy if exists "demo insert" on public.registers;
drop policy if exists "demo update" on public.registers;

create policy "demo read" on public.registers
  for select to anon, authenticated using (true);

create policy "demo insert" on public.registers
  for insert to anon, authenticated with check (true);

create policy "demo update" on public.registers
  for update to anon, authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.registers;
exception
  when duplicate_object then null;
end $$;
