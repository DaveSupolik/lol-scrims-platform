-- ============================================
-- Create scrim RPC (with future time validation)
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
    -- Require authentication
    if auth.uid() is null then
        raise exception 'Authentication required';
    end if;

    -- Validate scheduled time
    if p_scheduled_at <= now() then
        raise exception 'Scrim must be scheduled in the future';
    end if;

    -- Authorize caller (OWNER / ADMIN)
    perform 1
    from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
      and role in ('OWNER','ADMIN');

    if not found then
        raise exception 'Not authorized to create scrim for this team';
    end if;

    -- Insert scrim
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

-- Permissions (idempotent)
revoke all on function public.create_scrim(uuid, timestamptz, text) from public;
grant execute on function public.create_scrim(uuid, timestamptz, text) to authenticated;
