-- the old single "next round" becomes an upcoming event in the events list. run after 0005, right before deploying the code that reads it.
insert into public.events (slug, title, venue, summary, cover, starts_at)
select trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')), title, venue, blurb, photo, starts_at
from public.next_event
where not tba and title <> '';
