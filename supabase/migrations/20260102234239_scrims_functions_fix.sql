-- ============================================
-- Confirm scrim RPC
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
begin
    -- 1️⃣ Lock scrim row (prevent race conditions)
    perform 1
    from public.scrims
    where id = p_scrim_id
    for update;

    if not found then
        raise exception 'Scrim not found';
    end if;

    -- 2️⃣ Validate scrim is in REQUESTED state
    if (select status from public.scrims where id = p_scrim_id) <> 'REQUESTED' then
        raise exception 'Scrim is not in REQUESTED state';
    end if;

    -- 3️⃣ Validate scrim request exists AND belongs to this team
    perform 1
    from public.scrim_requests sr
    where sr.scrim_id = p_scrim_id
      and sr.requesting_team_id = p_requesting_team_id;

    if not found then
        raise exception 'Invalid scrim request';
    end if;

    -- 4️⃣ Confirm scrim
    update public.scrims
    set
        opponent_team_id = p_requesting_team_id,
        status = 'CONFIRMED',
        updated_at = now()
    where id = p_scrim_id;

    -- 5️⃣ Cleanup request
    delete from public.scrim_requests
    where scrim_id = p_scrim_id;

end;
$$;

-- ============================================
-- Permissions
-- ============================================

revoke all on function public.confirm_scrim(uuid, uuid) from public;
grant execute on function public.confirm_scrim(uuid, uuid) to authenticated;
