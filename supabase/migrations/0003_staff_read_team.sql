-- every team member can see who's on the team, so "last edited by" can show a name. still hidden from the public
drop policy "self or admin read" on public.profiles;
create policy "staff read" on public.profiles for select to authenticated using ((select public.is_staff()));
