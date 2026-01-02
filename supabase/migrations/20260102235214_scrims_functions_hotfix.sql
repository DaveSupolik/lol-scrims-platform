-- ============================================
-- Confirm scrim RPC (secure version)
-- ============================================

create or replace function public.confirm_scrim(
    p_scrim_id uuid,
    p_requesting_team_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    current_status scrim_status;
begin
    -- 1️⃣ Lock scrim row and read status (atomic)
    select status
    into current_status
    from public.scrims
    where id = p_scrim_id
    for update;

    if current_status is null then
        raise exception 'Scrim not found';
    elsif current_status <> 'REQUESTED' then
        raise exception 'Scrim is not in REQUESTED state';
    end if;

    -- 1.5️⃣ Authorize caller (OWNER/ADMIN of creator team)
    perform 1
    from public.team_members tm
    join public.scrims s on s.creator_team_id = tm.team_id
    where s.id = p_scrim_id
      and tm.user_id = auth.uid()
      and tm.role in ('OWNER','ADMIN');

    if not found then
        raise exception 'Not authorized to confirm this scrim';
    end if;

    -- 2️⃣ Validate scrim request exists and belongs to requesting team
    perform 1
    from public.scrim_requests sr
    where sr.scrim_id = p_scrim_id
      and sr.requesting_team_id = p_requesting_team_id;

    if not found then
        raise exception 'Invalid scrim request';
    end if;

    -- 3️⃣ Confirm scrim
    update public.scrims
    set
        opponent_team_id = p_requesting_team_id,
        status = 'CONFIRMED',
        updated_at = now()
    where id = p_scrim_id;

    -- 4️⃣ Cleanup request
    delete from public.scrim_requests
    where scrim_id = p_scrim_id;

end;
$$;

-- ============================================
-- Permissions
-- ============================================

revoke all on function public.confirm_scrim(uuid, uuid) from public;
grant execute on function public.confirm_scrim(uuid, uuid) to authenticated;
