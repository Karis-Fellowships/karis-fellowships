# HANDOFF — shared status between AI assistants

This file is how the assistants working on this repo (Claude Code, and Grok/Cursor
agents) leave each other notes. **Read this before starting. Update it before you stop.**
Newest entry on top. Keep entries short and factual.

## Ground rules (both assistants)

1. **Project rules live in `CLAUDE.md`** (mirrored in `.cursor/rules/*.mdc`). The big
   ones: never change any lesson/site wording; program dates come only from
   `content/KF Date Projection.xlsx`; meeting codes only from the code-generator sheet.
2. **One assistant per branch.** Never push to a branch the other assistant is working
   on. Name branches by owner: `claude/...` or `cursor/...`.
3. **Nothing goes to `main` without the other assistant's review** and Sarah's OK.
   `main` auto-deploys to the live site.
4. **Database changes:** put them in `supabase/migrations/` and note them here. Do not
   apply to the live Supabase project without Sarah's OK. Record here when one is applied.

---

## 2026-11-12 — Claude Code

**Working on:** review of `cursor/prelaunch-security-blockers-ecb1` (PR #1).
**Branch I'm using:** none pushed yet; reviewing in a local copy.
**Unpushed changes:** none.

### Live site status (production = `main` @ f2ae762)
- Up and healthy at karis-fellowships.vercel.app. Public pages load; member pages
  redirect logged-out visitors to `/login`.
- Runtime errors, last 7 days: one expired-refresh-token message, one client "Load
  failed". Both benign.
- **Open security gap on production:** `/search-index.json` serves the full text of all
  64 lessons to anyone, no login. PR #1 fixes this.
- **Open security gap in the database:** `meeting_codes` RLS policy is
  `using (true)` for every authenticated user, so any self-signup account can read all
  codes. PR #1's migration fixes this. **Not applied yet** (live migrations end at
  `20261009185924_kf_joined_at`).

### Vercel error seen
- Preview deploy for PR #1 (`dpl_F82Hihxb1BH6uth9fm7bNXoeUJ12`) failed with
  **`git_info_fail`** — Vercel could not fetch the commit from GitHub. No build ran;
  this is not a code problem.
- Cause (likely): the GitHub org was renamed `KarisFellowships` → `Karis-Fellowships`.
  All successful deploys came from the old name. Fix needs Sarah in the Vercel
  dashboard: Project → Settings → Git → disconnect, reconnect
  `Karis-Fellowships/karis-fellowships`. Until then, pushes to `main` may also fail to
  deploy (production would stay on the last good build, not break).

### Review of PR #1 — verdict: approve, merge after the Vercel reconnect
- Logic checked against live DB: all columns it reads exist (`tier, active, nhg_paid,
  kf_invited, kf_registered_year`); meeting-code sections match
  (`general, hpkp, kf, nhg, romans`). No lesson wording, dates, codes, or images touched.
- Local checks on 09b6153: `npm ci` ok · `eslint` 0 errors (7 pre-existing warnings) ·
  `tsc --noEmit` ok · `next build` ok (Next 16.4.5).
- Logged-out smoke test of the built app: `/search-index.json` 404 · `/api/search-index`
  401 · `/kf`, `/nhg`, `/api/documents/...` → `/login` · public pages 200.
- **Not tested:** signed-in flows (paid NHG, KF registered/unregistered, admin). Need a
  test login or Sarah clicking through on the preview URL once Vercel reconnects.
- No code changes requested.

### Merge order (for whoever does it, with Sarah's OK)
1. Sarah reconnects Vercel ↔ GitHub (see above); confirm PR #1 preview builds.
2. Click through the preview signed in as a KF member and an NHG member.
3. Merge PR #1 to `main`.
4. Apply `supabase/migrations/20261105000000_restrict_meeting_codes_to_members.sql`
   to the live project **after** step 3 (it is safe either order; app code filters too).
   Record it here.

### Heads-up (not caused by PR #1)
- On **Jan 1, 2027**, invited KF members with `kf_registered_year = 2026` (currently 2
  people) will be redirected to `/kf/register` until they register for 2027. This is the
  existing `proxy.ts` rule; PR #1 matches it. The invite banner that tells them is not
  built yet.
