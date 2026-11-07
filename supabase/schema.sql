
-- MARKETBRIDGE DATABASE SETUP

create extension if not exists "pgcrypto";

-- USER PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'member',
  verification_status text default 'pending',
  created_at timestamptz default now()
);

-- PROJECTS
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  company_name text not null,
  category text not null,
  description text not null,
  budget numeric default 0,
  duration text,
  work_mode text,
  status text default 'open',
  created_at timestamptz default now()
);

-- PROPOSALS
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  marketer_id uuid references auth.users(id) on delete cascade,
  cover_letter text,
  proposed_budget numeric default 0,
  delivery_days integer,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ENABLE SECURITY
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.proposals enable row level security;

-- PROFILE POLICIES
create policy "Users can view profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Users can create own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- PROJECT POLICIES
create policy "Authenticated users can view open projects"
on public.projects for select
to authenticated
using (status = 'open' or auth.uid() = user_id);

create policy "Users can post projects"
on public.projects for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Owners can update projects"
on public.projects for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- PROPOSAL POLICIES
create policy "Users can view relevant proposals"
on public.proposals for select
to authenticated
using (
  auth.uid() = marketer_id
  or exists (
    select 1 from public.projects
    where projects.id = proposals.project_id
    and projects.user_id = auth.uid()
  )
);

create policy "Marketers can submit proposals"
on public.proposals for insert
to authenticated
with check (auth.uid() = marketer_id);
