import { getMemberProfile, meetingCodeSections } from "./require-tier";
import { createServerClient } from "./supabase-server";

export interface MeetingCode {
  id: string;
  section: string;
  label: string;
  timeLabel: string | null;
  code: string;
  sort: number;
}

// Graceful-degradation fallback only (mirrors src/lib/date-engine.ts). The live
// source of truth is the meeting_codes table, edited from the admin panel.
const FALLBACK: Omit<MeetingCode, "id">[] = [
  { section: "general", label: "Phone", timeLabel: null, code: "(701) 801-1220", sort: 0 },
  { section: "kf", label: "Sunday", timeLabel: "8:00 am CST", code: "548-008-425#", sort: 1 },
  { section: "kf", label: "Monday", timeLabel: "10:00 am CST", code: "591-492-083#", sort: 2 },
  { section: "kf", label: "Tuesday", timeLabel: "7:30 pm CST", code: "209-466-826#", sort: 3 },
  { section: "nhg", label: "Saturday AM", timeLabel: null, code: "226-621-530#", sort: 1 },
  { section: "nhg", label: "Weekend Intensive", timeLabel: null, code: "546-213-115#", sort: 2 },
  { section: "romans", label: "Access Code", timeLabel: null, code: "158-890-796#", sort: 1 },
  { section: "hpkp", label: "Access Code", timeLabel: null, code: "903-351-258#", sort: 1 },
];

function fallback(): MeetingCode[] {
  return FALLBACK.map((r, i) => ({ id: `fallback-${i}`, ...r }));
}

function visibleCodes(codes: MeetingCode[], allowed: string[] | null): MeetingCode[] {
  if (allowed === null) return codes;
  const ok = new Set(allowed);
  return codes.filter((c) => ok.has(c.section));
}

// The dial-in number used to be filled in by phoneNumber() even when the caller
// had no codes. Keep that stand-in only for members who are allowed to see it.
function withPhone(codes: MeetingCode[], allowed: string[] | null): MeetingCode[] {
  const visible = visibleCodes(codes, allowed);
  const maySeePhone = allowed === null || allowed.includes("general");
  if (!maySeePhone) return visible;
  if (visible.some((c) => c.section === "general" && c.label === "Phone")) return visible;
  const phone = fallback().find((c) => c.section === "general" && c.label === "Phone");
  return phone ? [phone, ...visible] : visible;
}

export async function getMeetingCodes(): Promise<MeetingCode[]> {
  // A session is not enough. Unpaid or unknown callers get nothing — including
  // the hardcoded fallback, which is only for entitled members when the table
  // cannot be read.
  const allowed = meetingCodeSections(await getMemberProfile());
  if (allowed && allowed.length === 0) return [];

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("meeting_codes")
      .select("id, section, label, time_label, code, sort")
      .order("section", { ascending: true })
      .order("sort", { ascending: true });

    const rows: MeetingCode[] =
      error || !data || data.length === 0
        ? fallback()
        : data.map((r) => ({
            id: r.id as string,
            section: r.section as string,
            label: r.label as string,
            timeLabel: (r.time_label as string | null) ?? null,
            code: r.code as string,
            sort: (r.sort as number) ?? 0,
          }));

    return withPhone(rows, allowed);
  } catch {
    return withPhone(fallback(), allowed);
  }
}

export function phoneNumber(codes: MeetingCode[]): string {
  // No hardcoded stand-in. Entitled members receive the phone row from the
  // table or from the member-only fallback inside getMeetingCodes(). An empty
  // list (unpaid or signed-out) must not surface the number.
  return codes.find((c) => c.section === "general" && c.label === "Phone")?.code ?? "";
}

export function sectionCodes(codes: MeetingCode[], section: string): MeetingCode[] {
  return codes.filter((c) => c.section === section).sort((a, b) => a.sort - b.sort);
}

// KF weekly meetings shaped for the existing day/time/code UI.
export function kfMeetings(codes: MeetingCode[]): { day: string; time: string; code: string }[] {
  return sectionCodes(codes, "kf").map((c) => ({
    day: c.label,
    time: c.timeLabel ?? "",
    code: c.code,
  }));
}

export function firstCode(codes: MeetingCode[], section: string): string {
  return sectionCodes(codes, section)[0]?.code ?? "";
}
