-- reorder only touches rows whose position changes, so the audit log lists just the items that moved
create or replace function public.reorder(tbl text, ids bigint[]) returns void
language plpgsql set search_path = '' as $$
begin
  if tbl not in ('officer_groups', 'officers', 'event_photos', 'gallery_items', 'merch_groups', 'merch_items', 'stats') then
    raise exception 'reorder: % is not sortable', tbl;
  end if;
  execute format(
    'update public.%I t set sort = x.ord from unnest($1) with ordinality as x(id, ord) where t.id = x.id and t.sort is distinct from x.ord', tbl
  ) using ids;
end $$;
