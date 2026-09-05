drop policy if exists "rides_update_participants" on public.rides;

create or replace function public.accept_ride(p_ride_id uuid)
returns public.rides
set search_path = ''
language plpgsql
security definer
as $$
declare v_ride public.rides; v_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role <> 'driver' then raise exception 'Somente motoristas podem aceitar corridas'; end if;
  select * into v_ride from public.rides where id = p_ride_id for update;
  if not found then raise exception 'Corrida não encontrada'; end if;
  if v_ride.status <> 'requested' then raise exception 'Corrida não está disponível'; end if;
  update public.rides set driver_id = auth.uid(), status = 'accepted', updated_at = now() where id = p_ride_id returning * into v_ride;
  insert into public.ride_events (ride_id, actor_id, event_type, payload) values (p_ride_id, auth.uid(), 'ride_accepted', jsonb_build_object('driver_id', auth.uid()));
  return v_ride;
end;
$$;

create or replace function public.update_ride_status(p_ride_id uuid, p_status text)
returns public.rides
set search_path = ''
language plpgsql
security definer
as $$
declare v_ride public.rides; v_allowed boolean := false;
begin
  if p_status not in ('arriving','in_progress','completed','cancelled') then raise exception 'Status inválido'; end if;
  select * into v_ride from public.rides where id = p_ride_id for update;
  if not found then raise exception 'Corrida não encontrada'; end if;
  if auth.uid() = v_ride.passenger_id and p_status = 'cancelled' and v_ride.status in ('requested','accepted','arriving') then v_allowed := true; end if;
  if auth.uid() = v_ride.driver_id and p_status in ('arriving','in_progress','completed') then v_allowed := true; end if;
  if not v_allowed then raise exception 'Ação não permitida para este usuário/status'; end if;
  update public.rides set status = p_status, updated_at = now() where id = p_ride_id returning * into v_ride;
  insert into public.ride_events (ride_id, actor_id, event_type, payload) values (p_ride_id, auth.uid(), 'status_changed', jsonb_build_object('status', p_status));
  return v_ride;
end;
$$;

grant execute on function public.accept_ride(uuid) to authenticated;
grant execute on function public.update_ride_status(uuid,text) to authenticated;
revoke update on public.rides from authenticated;
