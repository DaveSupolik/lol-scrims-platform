-- =====================================================
-- Scrims: critical security & integrity fixes
-- =====================================================

-- =====================================================
-- ISSUE 1: RLS read policy bug
-- Allow opponent team members to read confirmed scrims
-- =====================================================

drop policy if exists "public scrims readable" on public.scrims;

create policy "scrims readable by involved teams or public"
on public.scrims
for select
using (
  is_public = true
  OR creator_team_id IN (
    select team_id
    from public.team_members
    where user_id = auth.uid()
  )
  OR opponent_team_id IN (
    select team_id
    from public.team_members
    where user_id = auth.uid()
  )
);

-- =====================================================
-- ISSUE 2: updated_at never updates
-- Add generic trigger
-- =====================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_scrims_updated_at on public.scrims;

create trigger set_scrims_updated_at
before update on public.scrims
for each row
execute function public.set_updated_at();


-- =====================================================
-- ISSUE 3: Opponent team cannot update scrim
-- Allow opponent OWNER / ADMIN to update
-- =====================================================

create policy "opponent team can update scrim"
on public.scrims
for update
using (
  opponent_team_id IN (
    select team_id
    from public.team_members
    where user_id = auth.uid()
      and role in ('OWNER', 'ADMIN')
  )
);
