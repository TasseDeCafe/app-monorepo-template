alter table public.users
add column topics text[] default '{}';