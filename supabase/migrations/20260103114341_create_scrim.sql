-- ============================================
-- Create scrim RPC
-- ============================================

create or replace function public.create_scrim(
    p_team_id uuid,
    p_scheduled_at timestamptz,
    p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    new_scrim_id uuid;
begin
    -- 1️⃣ Require authentication
    if auth.uid() is null then
        raise exception 'Authentication required';
    end if;

    -- 2️⃣ Authorize caller (OWNER / ADMIN of team)
    perform 1
    from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
      and role in ('OWNER','ADMIN');

    if not found then
        raise exception 'Not authorized to create scrim for this team';
    end if;

    -- 3️⃣ Insert scrim (forced initial state)
    insert into public.scrims (
        creator_team_id,
        scheduled_at,
        status,
        notes
    )
    values (
        p_team_id,
        p_scheduled_at,
        'OPEN',
        p_notes
    )
    returning id into new_scrim_id;

    return new_scrim_id;
end;
$$;

-- ============================================
-- Permissions
-- ============================================

revoke all on function public.create_scrim(uuid, timestamptz, text) from public;
grant execute on function public.create_scrim(uuid, timestamptz, text) to authenticated;
