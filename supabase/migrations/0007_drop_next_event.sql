-- cleanup once the events-based next round is live: the old table and the columns it replaced. run after 0006 is deployed.
drop table public.next_event;
alter table public.events drop column event_date, drop column done;
