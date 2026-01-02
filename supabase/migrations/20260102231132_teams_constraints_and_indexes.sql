-- ===========================
-- Teams constraints & indexes
-- ===========================

-- 1️⃣ Team name must be unique
alter table public.teams
add constraint teams_name_unique unique (name);


-- 2️⃣ Enforce exactly one OWNER per team
-- Allows unlimited ADMIN / MEMBER
-- Prevents multiple OWNERS

create unique index one_owner_per_team
on public.team_members (team_id)
where role = 'OWNER';


-- 3️⃣ Performance index for permission checks
-- Used constantly by RLS & API

create index idx_team_members_user
on public.team_members (user_id);
