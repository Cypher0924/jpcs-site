-- "No upcoming round": the site shows "To be announced" instead of a countdown. run after 0003.
alter table public.next_event add column tba boolean not null default false;
