create or replace function public.handle_new_user()
returns trigger
set search_path = ''
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    case when new.raw_user_meta_data->>'role' in ('driver','passenger') then new.raw_user_meta_data->>'role' else 'passenger' end
  )
  on conflict (id) do update set full_name = excluded.full_name, phone = excluded.phone, role = excluded.role;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.rides to authenticated;
grant select, insert, update on public.driver_locations to authenticated;
grant select, insert on public.ride_events to authenticated;

create or replace function public.set_updated_at()
returns trigger
set search_path = ''
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
