
create or replace function public.has_premium_access(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    -- Isenção gratuita concedida pelo admin
    exists (select 1 from public.user_roles where user_id = _user_id and role in ('premium','admin'))
    or
    -- Assinatura Paddle ativa
    exists (
      select 1 from public.subscriptions
      where user_id = _user_id
        and (
          (status in ('active','trialing','past_due') and (current_period_end is null or current_period_end > now()))
          or (status = 'canceled' and current_period_end > now())
        )
    );
$$;

grant execute on function public.has_premium_access(uuid) to authenticated, anon;
