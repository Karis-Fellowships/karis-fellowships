import { createAdminClient } from "@/lib/supabase-admin";
import { kfContentOpen, type MemberProfile } from "@/lib/require-tier";
import { createServerClient } from "@/lib/supabase-server";
import { todayCentral } from "@/lib/today-central";

// Shared logic for the NHG facilitator sign-up (KF-members-only).
// Both facilitator tables are RLS-enabled with no member policies, so every read
// and write here goes through the service-role admin client AFTER a server-side
// tier check — mirroring the kf-register pattern.

export interface FacilitatorSlot {
  id: string;
  role_label: string;
  part: string | null;
  slot_index: number;
  sort: number;
  display_name: string | null; // null = open
  mine: boolean; // is this the current viewer's claim
}

export interface FacilitatorSession {
  id: string;
  section: string;
  content: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  sort: number;
  slots: FacilitatorSlot[];
}

export interface FacilitatorBoard {
  cycleYear: number | null;
  sessions: FacilitatorSession[];
}

// The acting user, only if they are an active KF/admin member. null otherwise.
export async function getKFActor(): Promise<{ userId: string; email: string | null; name: string | null } | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users")
    .select("tier, active, name, kf_invited, kf_registered_year")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.active) return null;
  const membership: MemberProfile = {
    userId: user.id,
    tier: profile.tier,
    nhgPaid: false,
    kfInvited: !!profile.kf_invited,
    kfRegisteredYear: (profile.kf_registered_year as number | null) ?? null,
  };
  if (!kfContentOpen(membership)) return null;
  return { userId: user.id, email: user.email ?? null, name: profile.name ?? null };
}

// Load the upcoming cycle's sessions + slots. Never returns other members'
// user_id — only their display_name and whether a slot is the viewer's own.
export async function getFacilitatorBoard(userId: string | null): Promise<FacilitatorBoard> {
  const admin = createAdminClient();
  const today = todayCentral();

  // Upcoming cycle = the earliest cycle that still has a session today or later;
  // if everything is past, fall back to the most recent cycle.
  const { data: upcoming } = await admin
    .from("nhg_facilitator_sessions")
    .select("cycle_year")
    .gte("session_date", today)
    .order("session_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  let cycleYear = upcoming?.cycle_year ?? null;
  if (cycleYear == null) {
    const { data: latest } = await admin
      .from("nhg_facilitator_sessions")
      .select("cycle_year")
      .order("cycle_year", { ascending: false })
      .limit(1)
      .maybeSingle();
    cycleYear = latest?.cycle_year ?? null;
  }
  if (cycleYear == null) return { cycleYear: null, sessions: [] };

  const { data: sessions } = await admin
    .from("nhg_facilitator_sessions")
    .select("id, section, content, session_date, start_time, end_time, duration_minutes, sort")
    .eq("cycle_year", cycleYear)
    .order("sort", { ascending: true });

  const ids = (sessions ?? []).map((s) => s.id);
  const { data: slots } = ids.length
    ? await admin
        .from("nhg_facilitator_slots")
        .select("id, session_id, role_label, part, slot_index, sort, user_id, display_name")
        .in("session_id", ids)
        .order("sort", { ascending: true })
    : { data: [] as Record<string, unknown>[] };

  const bySession = new Map<string, FacilitatorSlot[]>();
  for (const sl of (slots ?? []) as {
    id: string; session_id: string; role_label: string; part: string | null;
    slot_index: number; sort: number; user_id: string | null; display_name: string | null;
  }[]) {
    const arr = bySession.get(sl.session_id) ?? [];
    arr.push({
      id: sl.id,
      role_label: sl.role_label,
      part: sl.part,
      slot_index: sl.slot_index,
      sort: sl.sort,
      display_name: sl.display_name,
      mine: !!userId && sl.user_id === userId,
    });
    bySession.set(sl.session_id, arr);
  }

  return {
    cycleYear,
    sessions: (sessions ?? []).map((s) => ({ ...s, slots: bySession.get(s.id) ?? [] })),
  };
}

// --- display helpers (shared by the page and the emails) ---------------------
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export function formatSessionDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatTime(hhmm: string | null): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return "";
  const s = formatTime(start);
  const e = end ? ` – ${formatTime(end)}` : "";
  return `${s}${e} CT`;
}

export function slotRoleText(slot: { role_label: string; part: string | null }): string {
  return slot.part ? `${slot.role_label} (${slot.part})` : slot.role_label;
}
