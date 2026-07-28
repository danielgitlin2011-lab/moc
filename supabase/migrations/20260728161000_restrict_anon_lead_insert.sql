-- Removes anon's direct INSERT on public.leads (audit 8, final step).
--
-- APPLY THIS ONE LAST, and only after the deployment serving your traffic
-- includes app/api/leads/route.ts and a real submission has succeeded through
-- it. Until this migration runs, both paths work and nothing can break; once it
-- runs, public.submit_lead is the only way a lead can be created, so an older
-- deployment still inserting directly would start failing.
--
-- Rollback is the commented policy at the bottom of this file.

-- The policy name differs between environments depending on how the original
-- schema was created, so drop every INSERT policy anon holds on the table.
do $$
declare
  policy_name text;
begin
  for policy_name in
    select pol.polname
    from pg_policy pol
    join pg_class cls on cls.oid = pol.polrelid
    join pg_namespace nsp on nsp.oid = cls.relnamespace
    where nsp.nspname = 'public'
      and cls.relname = 'leads'
      and pol.polcmd in ('a', '*')  -- INSERT, or ALL
  loop
    execute format('drop policy if exists %I on public.leads', policy_name);
  end loop;
end;
$$;

revoke insert on public.leads from anon;

-- Owners keep full access to their own leads; that is unchanged and is what
-- the dashboard reads and updates through.
drop policy if exists owner_all_leads on public.leads;
create policy owner_all_leads on public.leads
  for all
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Rollback, if the API route has to be taken out of the path:
--
--   grant insert on public.leads to anon;
--   create policy anon_insert_leads on public.leads
--     for insert to anon
--     with check (business_id in (select id from public.businesses where published));
