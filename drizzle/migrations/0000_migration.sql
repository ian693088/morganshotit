create type public.app_role as enum ('admin', 'approver');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles visible" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'approver'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'approver'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.admin_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert on public.admin_requests to authenticated;
grant all on public.admin_requests to service_role;
alter table public.admin_requests enable row level security;
create policy "see own or approver" on public.admin_requests for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'approver'));
create policy "request own" on public.admin_requests for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');

create or replace function public.decide_admin_request(_request_id uuid, _approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare _uid uuid;
begin
  if not public.has_role(auth.uid(), 'approver') then raise exception 'Not allowed'; end if;
  select user_id into _uid from public.admin_requests where id = _request_id;
  if _uid is null then raise exception 'Request not found'; end if;
  update public.admin_requests set status = case when _approve then 'approved' else 'rejected' end where id = _request_id;
  if _approve then
    insert into public.user_roles (user_id, role) values (_uid, 'admin') on conflict do nothing;
  else
    delete from public.user_roles where user_id = _uid and role = 'admin';
  end if;
end; $$;

create or replace function public.set_user_role(_user_id uuid, _role app_role, _grant boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'approver') then raise exception 'Not allowed'; end if;
  if _grant then insert into public.user_roles (user_id, role) values (_user_id, _role) on conflict do nothing;
  else delete from public.user_roles where user_id = _user_id and role = _role; end if;
end; $$;

create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'image',
  url text not null,
  title text,
  category text not null default 'Others',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;
alter table public.media enable row level security;
create policy "public read media" on public.media for select to anon, authenticated using (true);
create policy "admins manage media" on public.media for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admins manage settings" on public.site_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null,
  phone text not null,
  package text not null,
  amount integer not null,
  session_date date not null,
  notes text,
  mpesa_code text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "own or admin read bookings" on public.bookings for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "create own booking" on public.bookings for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy "admin update bookings" on public.bookings for update to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "public read media files" on storage.objects for select using (bucket_id = 'media');
create policy "admins upload media files" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "admins delete media files" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));