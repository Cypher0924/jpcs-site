-- events get a start, an optional end and a status, so the site can work out the next round by itself. run after 0004.
alter table public.events
  add column starts_at timestamptz,
  add column ends_at timestamptz,
  add column status text not null default 'scheduled' check (status in ('scheduled', 'postponed', 'cancelled')),
  add constraint events_end_after_start check (ends_at is null or starts_at is null or ends_at >= starts_at);

-- existing dates become 9 AM Manila on that day
update public.events
set starts_at = (event_date + time '09:00') at time zone 'Asia/Manila'
where event_date is not null;
