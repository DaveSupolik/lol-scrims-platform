-- ======================================================
-- 1️⃣ Enum for scrim status
-- ======================================================
create type scrim_status as enum (
  'OPEN',
  'REQUESTED',
  'CONFIRMED',
  'CANCELED',
  'COMPLETED'
);

-- ======================================================
-- 2️⃣ Scrims table
-- ======================================================
create table public.scrims (
  id uuid primary key default gen_random_uuid(),
  creator_team_id uuid not null references public.teams(id) on delete cascade,
  opponent_team_id uuid references public.teams(id) on delete set null,
  scheduled_at timestamptz not null,
  region text not null,
  tier_min int not null,
  tier_max int not null,
  is_public boolean not null default true,
  status scrim_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tier_range_valid check (tier_min <= tier_max),
  constraint future_scrim check (scheduled_at > now())
);

-- ======================================================
-- 3️⃣ Scrim Requests table
-- ======================================================
create table public.scrim_requests (
  id uuid primary key default gen_random_uuid(),
  scrim_id uuid not null references public.scrims(id) on delete cascade,
  requesting_team_id uuid not null references public.teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (scrim_id)
);

-- ======================================================
-- 4️⃣ Indexes for performance
-- ======================================================
create index idx_scrims_public_open
  on public.scrims (scheduled_at)
  where is_public = true and status = 'OPEN';

create index idx_scrims_creator
  on public.scrims (creator_team_id);

create index idx_scrims_opponent
  on public.scrims (opponent_team_id);

-- ======================================================
-- 5️⃣ Enable Row-Level Security
-- ======================================================
alter table public.scrims enable row level security;
alter table public.scrim_requests enable row level security;

-- ======================================================
-- 6️⃣ Policies for scrims
-- ======================================================
create policy "public scrims readable"
on public.scrims
for select
using (
  is_public = true or creator_team_id in (
    select team_id from team_members where user_id = auth.uid()
  )
);

create policy "team can create scrims"
on public.scrims
for insert
with check (
  creator_team_id in (
    select team_id from team_members
    where user_id = auth.uid()
      and role in ('OWNER', 'ADMIN')
  )
);

create policy "owner can update scrim"
on public.scrims
for update
using (
  creator_team_id in (
    select team_id from team_members
    where user_id = auth.uid()
      and role in ('OWNER', 'ADMIN')
  )
);

-- ======================================================
-- 7️⃣ Policies for scrim_requests
-- ======================================================
create policy "requesting team can insert request"
on public.scrim_requests
for insert
with check (
  requesting_team_id in (
    select team_id from team_members
    where user_id = auth.uid()
      and role in ('OWNER', 'ADMIN')
  )
);

create policy "creator team can delete request"
on public.scrim_requests
for delete
using (
  scrim_id in (
    select id from public.scrims
    where creator_team_id in (
      select team_id from team_members
      where user_id = auth.uid()
        and role in ('OWNER', 'ADMIN')
    )
  )
);
