-- ======================================================
-- 1️⃣ Teams table
-- ======================================================
create table public.teams (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now()
);

-- ======================================================
-- 2️⃣ Team Members table
-- ======================================================
create table public.team_members (
    id uuid primary key default gen_random_uuid(),
    team_id uuid not null references public.teams(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('OWNER','ADMIN','MEMBER')),
    created_at timestamptz not null default now(),
    unique(team_id, user_id) -- user can be in team only once
);
