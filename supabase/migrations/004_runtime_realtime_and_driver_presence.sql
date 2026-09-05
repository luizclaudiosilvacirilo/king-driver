-- King Driver runtime compatibility: driver presence, driver onboarding and Realtime.

alter table public.driver_locations
  add column if not exists is_online boolean not null default false;

create index if not exists driver_locations_online_idx
  on public.driver_locations(is_online, updated_at desc);

create or replace function public.handle_new_user()
returns trigger
set search_path = ''
language plpgsql
security definer
as $$
declare
  v_role text;
begin
  v_role := case
    when new.raw_user_meta_data->>'role' in ('driver','passenger')
      then new.raw_user_meta_data->>'role'
    else 'passenger'
  end;

  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    v_role
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        role = excluded.role;

  if v_role = 'driver' then
    insert into public.driver_profiles (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant select, insert, update on public.driver_locations to authenticated;
grant select, insert, update on public.driver_profiles to authenticated;

-- Enable Postgres changes for the tables used by the live ride experience.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rides'
  ) then
    alter publication supabase_realtime add table public.rides;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'driver_locations'
  ) then
    alter publication supabase_realtime add table public.driver_locations;
  end if;
end
$$;
