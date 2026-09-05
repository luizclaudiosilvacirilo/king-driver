-- Drivers may discover requested rides, while keeping non-participant rides hidden otherwise.
drop policy if exists "Ride participants and admins can read rides" on public.rides;

create policy "Ride participants admins and active drivers can read rides"
  on public.rides for select
  using (
    passenger_id = auth.uid()
    or driver_id = auth.uid()
    or public.is_admin()
    or (
      status = 'requested'
      and exists (
        select 1
        from public.driver_profiles dp
        where dp.id = auth.uid()
          and dp.status = 'active'
          and dp.verified = true
      )
    )
  );

create or replace function public.accept_ride(p_ride_id uuid)
returns public.rides
set search_path = ''
language plpgsql
security definer
as $$
declare
  v_ride public.rides;
  v_role text;
  v_driver_ok boolean;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role <> 'driver' then
    raise exception 'Somente motoristas podem aceitar corridas';
  end if;

  select exists (
    select 1 from public.driver_profiles
    where id = auth.uid() and status = 'active' and verified = true
  ) into v_driver_ok;

  if not v_driver_ok then
    raise exception 'Motorista ainda não foi aprovado';
  end if;

  select * into v_ride from public.rides where id = p_ride_id for update;
  if not found then raise exception 'Corrida não encontrada'; end if;
  if v_ride.status <> 'requested' then raise exception 'Corrida não está disponível'; end if;

  update public.rides
  set driver_id = auth.uid(), status = 'accepted', accepted_at = now(), updated_at = now()
  where id = p_ride_id
  returning * into v_ride;

  insert into public.ride_events (ride_id, actor_id, event_type, payload)
  values (p_ride_id, auth.uid(), 'ride_accepted', jsonb_build_object('driver_id', auth.uid()));

  return v_ride;
end;
$$;

grant execute on function public.accept_ride(uuid) to authenticated;
