-- Owner/admin operational controls.
create policy "Admins can read all profiles"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Admins can update profiles"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create or replace function public.admin_set_driver_status(
  p_driver_id uuid,
  p_status text,
  p_verified boolean
)
returns public.driver_profiles
set search_path = ''
language plpgsql
security definer
as $$
declare v public.driver_profiles;
begin
  if not public.is_admin() then raise exception 'Acesso restrito ao administrador'; end if;
  if p_status not in ('pending','active','suspended','blocked') then raise exception 'Status inválido'; end if;
  update public.driver_profiles
    set status=p_status, verified=p_verified, updated_at=now()
    where id=p_driver_id
    returning * into v;
  if not found then raise exception 'Motorista não encontrado'; end if;
  return v;
end;
$$;

grant execute on function public.admin_set_driver_status(uuid,text,boolean) to authenticated;
