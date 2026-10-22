-- row level security and storage buckets. run after 0001.

-- security definer so policies can read profiles without recursing into its own RLS
create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()));
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

-- content: anyone can read, staff can write
do $$
declare t text;
begin
  foreach t in array array['school_years', 'officer_groups', 'officers', 'events', 'event_photos', 'gallery_items',
                           'merch_groups', 'merch_items', 'stats', 'next_event', 'merch_settings', 'contact'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "staff insert" on public.%I for insert to authenticated with check ((select public.is_staff()))', t);
    execute format('create policy "staff update" on public.%I for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()))', t);
    execute format('create policy "staff delete" on public.%I for delete to authenticated using ((select public.is_staff()))', t);
  end loop;
end $$;

-- team: you can see yourself, admins see and manage everyone
alter table public.profiles enable row level security;
create policy "self or admin read" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "admin insert" on public.profiles for insert to authenticated with check ((select public.is_admin()));
create policy "admin update" on public.profiles for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin delete" on public.profiles for delete to authenticated using ((select public.is_admin()));

-- audit log: admins read, nobody inserts directly (the trigger does)
alter table public.audit_log enable row level security;
create policy "admin read" on public.audit_log for select to authenticated using ((select public.is_admin()));

-- storage. site-media only ever holds the server's WebP output
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880, array['image/webp']),
       ('backups', 'backups', false, null, null)
on conflict (id) do nothing;

create policy "staff upload site-media" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and (select public.is_staff()));
create policy "staff update site-media" on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and (select public.is_staff()));
create policy "staff delete site-media" on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and (select public.is_staff()));
-- backups has no policies: only the secret key (cron) can touch it
