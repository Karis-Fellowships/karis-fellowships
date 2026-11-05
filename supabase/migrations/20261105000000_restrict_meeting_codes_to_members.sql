-- Meeting codes are member content. The previous policy let any authenticated
-- role read every row, so a Supabase Auth account created outside registration
-- (no paid membership) could select the table directly with the anon key.
--
-- This matches the app:
--   admin                         -> every section
--   kf, registration current      -> every section
--     (invited KF members must have kf_registered_year = this UTC year,
--      the same boundary as new Date().getFullYear() on Vercel)
--   kf, registration still due    -> nhg + general (phone) only
--   nhg and nhg_paid              -> nhg + general only
--   anyone else                   -> no rows
--
-- Writes stay service-role only (no insert/update/delete policy).
-- The app's hardcoded fallback is not returned to callers who fail this check.
-- Apply this file to the live project (SQL editor or supabase db push).
-- Repo migrations are not applied automatically.

drop policy if exists "meeting_codes_read" on public.meeting_codes;

create policy "meeting_codes_read" on public.meeting_codes
  for select to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = (select auth.uid())
        and u.active is true
        and (
          u.tier = 'admin'
          or (
            u.tier = 'kf'
            and (
              coalesce(u.kf_invited, false) = false
              or u.kf_registered_year = extract(year from timezone('utc', now()))::integer
            )
          )
          or (
            u.tier = 'kf'
            and coalesce(u.kf_invited, false) = true
            and u.kf_registered_year is distinct from extract(year from timezone('utc', now()))::integer
            and meeting_codes.section in ('nhg', 'general')
          )
          or (
            u.tier = 'nhg'
            and u.nhg_paid is true
            and meeting_codes.section in ('nhg', 'general')
          )
        )
    )
  );
