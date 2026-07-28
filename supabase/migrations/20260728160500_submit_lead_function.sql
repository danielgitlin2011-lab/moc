-- Lead capture moves behind a validating function (audit 8).
--
-- Until now the browser inserted straight into public.leads with the anon key,
-- which means the honeypot and the submit-timing check in the form were the
-- only spam controls — and both are trivially skipped by posting to PostgREST
-- directly. This function is the server-side gate: it checks the business is
-- real and published, enforces its own ceiling, and is the only path that
-- remains once the companion migration removes anon's INSERT policy.
--
-- It is still callable by anon, because /api/leads reaches Supabase with the
-- same anon key. That is deliberate and bounded: the function accepts nothing
-- but lead fields, cannot read anything back, and rate-limits per business.
-- The API route in front of it adds the checks that need a trustworthy client
-- address (per-IP limiting) and request shape (honeypot, timing). A CAPTCHA or
-- Turnstile token verified inside this function is the remaining upgrade, and
-- it is documented as such in the README.

create table if not exists public.lead_submission_rate (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  hits integer not null default 0
);

-- RLS on with no policies: only the security-definer function below can read
-- or write this table.
alter table public.lead_submission_rate enable row level security;

create or replace function public.submit_lead(
  p_business_id uuid,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_event_date date,
  p_event_time text,
  p_event_location text,
  p_event_type text,
  p_guest_count integer,
  p_budget text,
  p_service_style text,
  p_preferred_menu text,
  p_dietary_requirements text,
  p_details text,
  p_preferred_contact text,
  p_hear_about_us text,
  p_source text,
  p_referrer text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
  v_id uuid;
  -- Generous for a caterer having a good week, and far below what a script
  -- would produce. Per business, so one target cannot deny service to others.
  v_limit constant integer := 30;
begin
  -- An unpublished or non-existent business has no inquiry form to submit, so
  -- there is nothing legitimate to accept here.
  if not exists (select 1 from public.businesses where id = p_business_id and published) then
    raise exception 'business_not_available' using errcode = 'check_violation';
  end if;

  insert into public.lead_submission_rate as rate (business_id, window_started_at, hits)
  values (p_business_id, now(), 1)
  on conflict (business_id) do update
    set window_started_at = case
          when rate.window_started_at < now() - interval '1 hour' then now()
          else rate.window_started_at
        end,
        hits = case
          when rate.window_started_at < now() - interval '1 hour' then 1
          else rate.hits + 1
        end
  returning rate.hits into v_hits;

  if v_hits > v_limit then
    raise exception 'rate_limited' using errcode = 'check_violation';
  end if;

  -- Trimmed and truncated rather than rejected: a real person who pasted too
  -- much should still reach the caterer. The CHECK constraints added in the
  -- companion migration are the hard boundary behind this.
  insert into public.leads (
    business_id, customer_name, email, phone, event_date, event_time,
    event_location, event_type, guest_count, budget, service_style,
    preferred_menu, dietary_requirements, details, preferred_contact,
    hear_about_us, source, referrer, status
  ) values (
    p_business_id,
    left(btrim(p_customer_name), 120),
    left(btrim(lower(p_email)), 254),
    left(btrim(p_phone), 40),
    p_event_date,
    left(btrim(coalesce(p_event_time, '')), 40),
    left(btrim(p_event_location), 200),
    left(btrim(p_event_type), 80),
    greatest(1, least(p_guest_count, 100000)),
    left(btrim(p_budget), 80),
    left(btrim(coalesce(p_service_style, '')), 120),
    left(btrim(coalesce(p_preferred_menu, '')), 300),
    left(btrim(coalesce(p_dietary_requirements, '')), 500),
    left(btrim(p_details), 4000),
    left(btrim(p_preferred_contact), 40),
    left(btrim(coalesce(p_hear_about_us, '')), 120),
    left(btrim(coalesce(p_source, '')), 200),
    left(btrim(coalesce(p_referrer, '')), 300),
    'New'
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_lead(
  uuid, text, text, text, date, text, text, text, integer, text, text, text,
  text, text, text, text, text, text
) from public;

grant execute on function public.submit_lead(
  uuid, text, text, text, date, text, text, text, integer, text, text, text,
  text, text, text, text, text, text
) to anon, authenticated;
