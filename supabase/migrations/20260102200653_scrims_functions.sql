-- ======================================================
-- Function: confirm_scrim
-- ======================================================
create or replace function public.confirm_scrim(
    p_scrim_id uuid,
    p_requesting_team_id uuid
)
returns void language plpgsql as
$$
declare
    current_status scrim_status;
begin
    -- 1️⃣ Kontrola, že volající je OWNER/ADMIN creator týmu
    perform 1
    from public.team_members tm
    join public.scrims s on s.creator_team_id = tm.team_id
    where s.id = p_scrim_id
      and tm.user_id = auth.uid()
      and tm.role in ('OWNER','ADMIN');

    if not found then
        raise exception 'Not authorized to confirm this scrim';
    end if;

    -- 2️⃣ Zámek řádku pro bezpečnost (prevence race conditions)
    select status
    into current_status
    from public.scrims
    where id = p_scrim_id
    for update;

    -- 3️⃣ Kontrola stavu scrimu
    if current_status is null then
        raise exception 'Scrim not found';
    elsif current_status != 'REQUESTED' then
        raise exception 'Scrim status must be REQUESTED to confirm';
    end if;

    -- 4️⃣ Aktualizace scrimu
    update public.scrims
    set
        opponent_team_id = p_requesting_team_id,
        status = 'CONFIRMED',
        updated_at = now()
    where id = p_scrim_id;

    -- 5️⃣ Smazání requestu
    delete from public.scrim_requests
    where scrim_id = p_scrim_id;
end;
$$;
