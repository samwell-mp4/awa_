revoke execute on function public.has_premium_access(uuid) from anon, public;
grant execute on function public.has_premium_access(uuid) to authenticated;