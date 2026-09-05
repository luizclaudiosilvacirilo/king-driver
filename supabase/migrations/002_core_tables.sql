-- King Driver core domain schema.
-- Runs before 002_profile_auth_trigger_and_permissions.sql alphabetically.

create extension if not exists pgcrypto;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('passenger','driver','admin'));

create table if not exists public.driver_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  license_number text,
  status text not null default 'pending' check (status in ('pending','active','suspended','blocked')),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.driver_profiles(id) on delete cascade,
  make text not null,
  model text not null,
  color text,
  plate text not null unique,
  category text not null default 'economy' check (category in ('economy','comfort','premium')),
  year integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.profiles(id),
  driver_id uuid references public.profiles(id),
  vehicle_id uuid references public.vehicles(id),
  category text not null default 'economy' check (category in ('economy','comfort','premium')),
  status text not null default 'requested' check (status in ('requested','searching','accepted','arriving','in_progress','completed','cancelled','expired','disputed')),
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  destination_address text not null,
  destination_lat double precision,
  destination_lng double precision,
  offered_fare numeric(12,2),
  final_fare numeric(12,2),
  requested_at timestamptz not null default now(),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ride_offers (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'offered' check (status in ('offered','accepted','declined','expired')),
  offered_fare numeric(12,2),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (ride_id, driver_id)
);

create table if not exists public.driver_locations (
  driver_id uuid primary key references public.profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision,
  speed double precision,
  accuracy double precision,
  updated_at timestamptz not null default now()
);

create table if not exists public.ride_events (
  id bigint generated always as identity primary key,
  ride_id uuid not null references public.rides(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null unique references public.rides(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'BRL',
  status text not null default 'pending' check (status in ('pending','authorized','paid','failed','refunded','cancelled')),
  provider text,
  provider_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  rater_id uuid not null references public.profiles(id),
  rated_user_id uuid not null references public.profiles(id),
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (ride_id, rater_id)
);

create index if not exists rides_passenger_status_idx on public.rides(passenger_id, status, created_at desc);
create index if not exists rides_driver_status_idx on public.rides(driver_id, status, created_at desc);
create index if not exists rides_status_requested_idx on public.rides(status, requested_at desc);
create index if not exists ride_offers_driver_status_idx on public.ride_offers(driver_id, status, created_at desc);
create index if not exists ride_events_ride_created_idx on public.ride_events(ride_id, created_at);
create index if not exists locations_updated_idx on public.driver_locations(updated_at desc);

alter table public.driver_profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.rides enable row level security;
alter table public.ride_offers enable row level security;
alter table public.driver_locations enable row level security;
alter table public.ride_events enable row level security;
alter table public.payments enable row level security;
alter table public.ratings enable row level security;

create or replace function public.is_admin()
returns boolean
set search_path = ''
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create policy "Drivers manage own driver profile"
  on public.driver_profiles for all
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "Drivers manage own vehicles"
  on public.vehicles for all
  using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid() or public.is_admin());

create policy "Ride participants and admins can read rides"
  on public.rides for select
  using (passenger_id = auth.uid() or driver_id = auth.uid() or public.is_admin());

create policy "Passengers create own rides"
  on public.rides for insert
  with check (passenger_id = auth.uid());

create policy "Drivers see own offers"
  on public.ride_offers for select
  using (driver_id = auth.uid() or public.is_admin());

create policy "Drivers create own offers"
  on public.ride_offers for insert
  with check (driver_id = auth.uid());

create policy "Drivers update own offers"
  on public.ride_offers for update
  using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid() or public.is_admin());

create policy "Drivers manage own location"
  on public.driver_locations for all
  using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid() or public.is_admin());

create policy "Participants read ride events"
  on public.ride_events for select
  using (
    public.is_admin() or exists (
      select 1 from public.rides r
      where r.id = ride_id and (r.passenger_id = auth.uid() or r.driver_id = auth.uid())
    )
  );

create policy "Authenticated users create own ride events"
  on public.ride_events for insert
  with check (actor_id = auth.uid() or public.is_admin());

create policy "Participants read payments"
  on public.payments for select
  using (passenger_id = auth.uid() or public.is_admin());

create policy "Passengers create own payment"
  on public.payments for insert
  with check (passenger_id = auth.uid());

create policy "Participants read ratings"
  on public.ratings for select
  using (rater_id = auth.uid() or rated_user_id = auth.uid() or public.is_admin());

create policy "Participants create ratings"
  on public.ratings for insert
  with check (rater_id = auth.uid());
