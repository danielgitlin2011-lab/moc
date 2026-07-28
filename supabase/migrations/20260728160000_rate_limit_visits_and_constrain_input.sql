-- Server-side hardening for everything reachable with the public anon key.
--
-- The anon key is, by design, in every visitor's browser. Anything it can do
-- through PostgREST, an attacker can do in a loop — so the API routes in front
-- of these operations are a convenience, never a control. The controls have to
-- live here.

----------------------------------------------------------------------
-- 1. Rate-limit site visits inside the function itself (audit 6, 7)
----------------------------------------------------------------------
-- `record_site_visit` is callable by anon over RPC, so /api/track's bot filter
-- can simply be skipped. A per-business sliding window caps how fast a single
-- counter can grow no matter who calls it or how.

create table if not exists public.site_visit_rate (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  hits integer not null default 0
);

-- No policies and no grants: only the security-definer function below reaches
-- this table, and RLS with zero policies denies everyone else by default.
alter table public.site_visit_rate enable row level security;

create or replace function public.record_site_visit(p_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
  -- A real catering site does not receive two views per second, sustained.
  -- Anything past this is a loop, and dropping it costs a genuine visitor
  -- nothing because their view was already counted this minute.
  v_limit constant integer := 120;
begin
  if not exists (select 1 from public.businesses where id = p_business_id and published) then
    return;
  end if;

  insert into public.site_visit_rate as rate (business_id, window_started_at, hits)
  values (p_business_id, now(), 1)
  on conflict (business_id) do update
    set window_started_at = case
          when rate.window_started_at < now() - interval '1 minute' then now()
          else rate.window_started_at
        end,
        hits = case
          when rate.window_started_at < now() - interval '1 minute' then 1
          else rate.hits + 1
        end
  returning rate.hits into v_hits;

  -- Silently drop the overflow. Returning an error would tell a script exactly
  -- where the ceiling is, and the caller has nothing useful to do with it.
  if v_hits > v_limit then
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

----------------------------------------------------------------------
-- 2. Bound what a lead row may contain (audit 9, 10)
----------------------------------------------------------------------
-- Client-side zod is a UX affordance, not a constraint: the same insert can be
-- made directly against PostgREST. Without these, any text column accepts
-- megabytes.
--
-- Added NOT VALID throughout: the constraint applies in full to every future
-- insert and update, while existing rows are grandfathered so deploying this
-- can never fail on data that predates it. Run
--   alter table public.leads validate constraint <name>;
-- once the existing rows are known to comply.

alter table public.leads drop constraint if exists leads_text_lengths_check;
alter table public.leads add constraint leads_text_lengths_check check (
  char_length(customer_name) between 1 and 120
  and char_length(email) <= 254
  and char_length(phone) <= 40
  and char_length(event_location) <= 200
  and char_length(event_type) <= 80
  and char_length(event_time) <= 40
  and char_length(budget) <= 80
  and char_length(service_style) <= 120
  and char_length(preferred_menu) <= 300
  and char_length(dietary_requirements) <= 500
  and char_length(details) <= 4000
  and char_length(preferred_contact) <= 40
  and char_length(hear_about_us) <= 120
  and char_length(source) <= 200
  and char_length(referrer) <= 300
) not valid;

alter table public.leads drop constraint if exists leads_guest_count_check;
alter table public.leads add constraint leads_guest_count_check
  check (guest_count between 1 and 100000) not valid;

-- Deliberately loose: this rejects obvious junk and anything with whitespace or
-- a missing domain, without pretending to decide which addresses are real.
alter table public.leads drop constraint if exists leads_email_format_check;
alter table public.leads add constraint leads_email_format_check
  check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[A-Za-z]{2,}$') not valid;

----------------------------------------------------------------------
-- 3. Constrain the slug (audit 21)
----------------------------------------------------------------------
-- The settings page normalises the slug in the browser only, so a direct
-- update could publish a business at an empty or reserved address. The slug is
-- a public URL segment, so its shape belongs in the database.

alter table public.businesses drop constraint if exists businesses_slug_format_check;
alter table public.businesses add constraint businesses_slug_format_check
  check (slug ~ '^[a-z0-9-]{2,60}$') not valid;

alter table public.businesses drop constraint if exists businesses_slug_reserved_check;
alter table public.businesses add constraint businesses_slug_reserved_check
  check (slug not in ('api', 'www', 'site', 'dashboard', 'login', 'signup')) not valid;
