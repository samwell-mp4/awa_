
-- 1) profiles: restringir leitura ao dono + admin
drop policy if exists "profiles readable by all" on public.profiles;
revoke select on public.profiles from anon;
create policy "profiles readable by owner"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

-- 2) storage.objects (bucket videos): dono ou admin
drop policy if exists "Authenticated can read videos bucket" on storage.objects;
drop policy if exists "Authenticated can upload to videos bucket" on storage.objects;
drop policy if exists "Authenticated can update own files in videos bucket" on storage.objects;
drop policy if exists "Authenticated can delete own files in videos bucket" on storage.objects;

create policy "videos read owner or admin"
  on storage.objects for select to authenticated
  using (bucket_id = 'videos' and (owner = auth.uid() or public.has_role(auth.uid(),'admin')));

create policy "videos insert owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and owner = auth.uid());

create policy "videos update owner or admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'videos' and (owner = auth.uid() or public.has_role(auth.uid(),'admin')))
  with check (bucket_id = 'videos' and (owner = auth.uid() or public.has_role(auth.uid(),'admin')));

create policy "videos delete owner or admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and (owner = auth.uid() or public.has_role(auth.uid(),'admin')));

-- 3) has_premium_access: forçar checagem apenas do próprio usuário (ou admin)
create or replace function public.has_premium_access(_user_id uuid)
returns boolean
language plpgsql
stable security definer
set search_path = public
as $$
begin
  if _user_id is null or (auth.uid() <> _user_id and not public.has_role(auth.uid(),'admin')) then
    return false;
  end if;
  return exists (select 1 from public.user_roles where user_id = _user_id and role in ('premium','admin'))
      or exists (
        select 1 from public.subscriptions
        where user_id = _user_id
          and (
            (status in ('active','trialing','past_due') and (current_period_end is null or current_period_end > now()))
            or (status = 'canceled' and current_period_end > now())
          )
      );
end;
$$;
