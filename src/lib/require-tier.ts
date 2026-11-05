import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "./supabase-server";

// Server-side membership enforcement (defense-in-depth). Middleware (proxy.ts)
// gates routes too, but pages and API routes must independently verify — a
// session alone is not a membership. A Supabase Auth user with no active
// profile, an unpaid NHG profile, or a KF member who still owes this year's
// registration is not treated as entitled to paid content.

export interface MemberProfile {
  userId: string;
  tier: string;
  nhgPaid: boolean;
  kfInvited: boolean;
  kfRegisteredYear: number | null;
}

export type MembershipGate =
  | { status: "anonymous" }
  | { status: "inactive" }
  | { status: "ok"; profile: MemberProfile };

// Same year boundary as src/proxy.ts (the host's local year; UTC on Vercel).
export function membershipYear(now = new Date()): number {
  return now.getFullYear();
}

// KF lessons, KF documents, and KF meeting codes.
// Admins always qualify. Invited KF members must have registered for this year.
// KF members who were not invited are not on that yearly gate (matches proxy.ts).
export function kfContentOpen(profile: MemberProfile, now = new Date()): boolean {
  if (profile.tier === "admin") return true;
  if (profile.tier !== "kf") return false;
  if (!profile.kfInvited) return true;
  return profile.kfRegisteredYear === membershipYear(now);
}

// meeting_codes sections this member may see. null = every section.
export function meetingCodeSections(profile: MemberProfile | null, now = new Date()): string[] | null {
  if (!profile) return [];
  if (profile.tier === "admin") return null;
  if (profile.tier === "kf") {
    if (kfContentOpen(profile, now)) return null;
    // Still an active KF member, so NHG call info stays available while this
    // year's KF registration is outstanding. KF codes do not.
    return ["nhg", "general"];
  }
  if (profile.tier === "nhg" && profile.nhgPaid) return ["nhg", "general"];
  return [];
}

export const readMembership = cache(async (): Promise<MembershipGate> => {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: profile } = await supabase
    .from("users")
    .select("tier, active, nhg_paid, kf_invited, kf_registered_year")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.active) return { status: "inactive" };

  return {
    status: "ok",
    profile: {
      userId: user.id,
      tier: profile.tier as string,
      nhgPaid: !!profile.nhg_paid,
      kfInvited: !!profile.kf_invited,
      kfRegisteredYear: (profile.kf_registered_year as number | null) ?? null,
    },
  };
});

export async function getMemberProfile(): Promise<MemberProfile | null> {
  const gate = await readMembership();
  return gate.status === "ok" ? gate.profile : null;
}

async function requireActiveProfile(): Promise<MemberProfile> {
  const gate = await readMembership();
  if (gate.status !== "ok") redirect("/login");
  return gate.profile;
}

export async function requireTier(
  allowed: string[]
): Promise<{ userId: string; tier: string }> {
  const profile = await requireActiveProfile();
  if (!allowed.includes(profile.tier)) {
    redirect(profile.tier === "nhg" ? "/nhg" : "/kf");
  }
  return { userId: profile.userId, tier: profile.tier };
}

export const requireAdmin = () => requireTier(["admin"]);

export async function requireKF(): Promise<{ userId: string; tier: string }> {
  const profile = await requireActiveProfile();
  if (profile.tier !== "kf" && profile.tier !== "admin") {
    redirect(profile.tier === "nhg" ? "/nhg" : "/kf");
  }
  if (!kfContentOpen(profile)) {
    redirect("/kf/register");
  }
  return { userId: profile.userId, tier: profile.tier };
}

// Paid NHG study, plus KF and admin (they already completed it). An unpaid NHG
// profile — including one auto-created for a raw Auth signup — is sent to the
// payment page. Do not call this from a layout that also wraps that page.
export async function requirePaidNHG(): Promise<{ userId: string; tier: string }> {
  const profile = await requireActiveProfile();
  if (profile.tier === "kf" || profile.tier === "admin" || (profile.tier === "nhg" && profile.nhgPaid)) {
    return { userId: profile.userId, tier: profile.tier };
  }
  if (profile.tier === "nhg") redirect("/nhg/payment-required");
  redirect("/login");
}
