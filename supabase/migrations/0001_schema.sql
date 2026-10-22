-- tables, triggers and rpcs for the admin. run before 0002.

-- people who can sign in to /admin. role lives here (not app_metadata) so changes apply right away
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table public.school_years (
  id bigint generated always as identity primary key,
  label text not null unique,
  is_current boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);
create unique index school_years_one_current on public.school_years (is_current) where is_current;

create table public.officer_groups (
  id bigint generated always as identity primary key,
  school_year_id bigint not null references public.school_years on delete cascade,
  title text not null,
  label text not null,
  sort int not null default 0,
  breaks int[] not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.officers (
  id bigint generated always as identity primary key,
  school_year_id bigint not null references public.school_years on delete restrict,
  group_id bigint not null references public.officer_groups on delete restrict,
  name text not null,
  role text not null,
  slug text not null,
  photo text,
  quote text,
  is_adviser boolean not null default false,
  sort int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.events (
  id bigint generated always as identity primary key,
  slug text not null unique,
  event_date date, -- null shows as TBA
  done boolean not null default false,
  title text not null,
  venue text not null default '',
  summary text not null default '',
  credit text not null default 'JPCS-TSU',
  cover text,
  square boolean not null default false,
  link_href text,
  link_label text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.event_photos (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events on delete cascade,
  src text not null,
  sort int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.gallery_items (
  id bigint generated always as identity primary key,
  src text not null,
  caption text not null,
  credit text not null default 'JPCS-TSU',
  sort int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.merch_groups (
  id bigint generated always as identity primary key,
  key text not null unique, -- used for /merch#key anchors
  title text not null,
  note text,
  credit_label text,
  sort int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.merch_items (
  id bigint generated always as identity primary key,
  group_id bigint not null references public.merch_groups on delete cascade,
  name text not null,
  price int not null check (price >= 0),
  from_price boolean not null default false,
  image text not null,
  details text,
  credit text,
  sort int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.stats (
  id bigint generated always as identity primary key,
  label text not null,
  value int, -- null shows as 000
  unit text,
  sort int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

-- single-row tables: the only allowed id is true
create table public.next_event (
  id boolean primary key default true check (id),
  title text not null,
  starts_at timestamptz, -- null shows "In progress" instead of a countdown
  venue text not null default '',
  blurb text not null default '',
  photo text,
  photo_caption text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.merch_settings (
  id boolean primary key default true check (id),
  open boolean not null default false,
  form_url text,
  window_text text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.contact (
  id boolean primary key default true check (id),
  email text not null,
  facebook text not null,
  handle text not null,
  messenger text not null,
  registration text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  action text not null, -- insert, update, delete
  entity text not null, -- table name
  entity_id text not null,
  before jsonb,
  after jsonb
);
create index audit_log_at on public.audit_log (at desc);

-- "last edited by"
create function public.set_updated() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

-- audit_log has no insert policy, so this trigger is the only writer.
-- service-role writes (seed, cron) are skipped to keep the log about people
create function public.audit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
    return null;
  end if;
  insert into public.audit_log (actor_id, actor_email, action, entity, entity_id, before, after)
  values (
    auth.uid(),
    auth.jwt() ->> 'email',
    lower(tg_op),
    tg_table_name,
    coalesce(case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end ->> 'id', ''),
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end
  );
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['school_years', 'officer_groups', 'officers', 'events', 'event_photos', 'gallery_items',
                           'merch_groups', 'merch_items', 'stats', 'next_event', 'merch_settings', 'contact'] loop
    execute format('create trigger set_updated before insert or update on public.%I for each row execute function public.set_updated()', t);
    execute format('create trigger audit after insert or update or delete on public.%I for each row execute function public.audit()', t);
  end loop;
end $$;
create trigger audit after insert or update or delete on public.profiles for each row execute function public.audit();

-- also catches auth.admin.deleteUser, which cascades here
create function public.guard_last_admin() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role <> 'admin')
     and not exists (select 1 from public.profiles where role = 'admin' and id <> old.id) then
    raise exception 'There must be at least one admin.';
  end if;
  return coalesce(new, old);
end $$;
create trigger guard_last_admin before update or delete on public.profiles
for each row execute function public.guard_last_admin();

-- rpcs, since supabase-js has no transactions. invoker rights, so RLS still applies
create function public.set_current_year(year_id bigint) returns void
language sql set search_path = '' as $$
  update public.school_years set is_current = false where is_current and id <> year_id;
  update public.school_years set is_current = true where id = year_id;
$$;

create function public.copy_year_groups(from_id bigint, to_id bigint) returns void
language sql set search_path = '' as $$
  insert into public.officer_groups (school_year_id, title, label, sort, breaks)
  select to_id, title, label, sort, breaks from public.officer_groups where school_year_id = from_id;
$$;

create function public.reorder(tbl text, ids bigint[]) returns void
language plpgsql set search_path = '' as $$
begin
  if tbl not in ('officer_groups', 'officers', 'event_photos', 'gallery_items', 'merch_groups', 'merch_items', 'stats') then
    raise exception 'reorder: % is not sortable', tbl;
  end if;
  execute format(
    'update public.%I t set sort = x.ord from unnest($1) with ordinality as x(id, ord) where t.id = x.id', tbl
  ) using ids;
end $$;
