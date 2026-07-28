-- 1. Track when a site was last published so the dashboard can stop guessing.
alter table public.businesses add column if not exists published_at timestamptz;
update public.businesses set published_at = updated_at where published = true and published_at is null;

-- 2. Record where a lead came from.
alter table public.leads add column if not exists source text not null default '';
alter table public.leads add column if not exists referrer text not null default '';

-- 3. Daily, aggregated website view counters (one row per business per day).
create table if not exists public.site_visit_days (
  business_id uuid not null references public.businesses(id) on delete cascade,
  visited_on date not null,
  views integer not null default 0,
  primary key (business_id, visited_on)
);

alter table public.site_visit_days enable row level security;

drop policy if exists owner_select_site_visit_days on public.site_visit_days;
create policy owner_select_site_visit_days on public.site_visit_days
  for select using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create index if not exists site_visit_days_business_day_idx
  on public.site_visit_days (business_id, visited_on desc);

-- Visits are only ever written through this function, so anonymous visitors
-- never get direct write access to the counter table. It is intentionally
-- callable by anon: it accepts nothing but a business id, ignores unpublished
-- businesses, and can do nothing except increment a daily counter.
create or replace function public.record_site_visit(p_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.businesses where id = p_business_id and published) then
    return;
  end if;

  insert into public.site_visit_days (business_id, visited_on, views)
  values (p_business_id, (now() at time zone 'utc')::date, 1)
  on conflict (business_id, visited_on)
  do update set views = public.site_visit_days.views + 1;
end;
$$;

revoke all on function public.record_site_visit(uuid) from public;
grant execute on function public.record_site_visit(uuid) to anon, authenticated;
