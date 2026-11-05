import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { kfContentOpen, readMembership, type MemberProfile } from "@/lib/require-tier";

export const dynamic = "force-dynamic";

const BUCKET = "documents";
const SIGNED_URL_TTL_SECONDS = 60;

// Mirrors the route gating in src/proxy.ts, plus the yearly KF registration
// gate (kfContentOpen) so a middleware bypass cannot sign lesson files:
// - nhg/facilitator/ material is current KF/admin only.
// - Other nhg/ material is paid NHG, any active KF, or admin.
// - Everything else (lessons, questions, toolbox, kf-resources, facilitator,
//   other-studies) is current KF or admin.
function isAllowed(pathSegments: string[], profile: MemberProfile): boolean {
  // KF files also require this year's registration when the member was invited.
  // A bare or unpaid NHG profile gets neither NHG nor KF files.
  const kf = kfContentOpen(profile);
  const nhgMaterials =
    kf || profile.tier === "kf" || profile.tier === "admin" || (profile.tier === "nhg" && profile.nhgPaid);
  if (pathSegments[0] === "nhg" && pathSegments[1] === "facilitator") return kf;
  if (pathSegments[0] === "nhg") return nhgMaterials;
  return kf;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path || path.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const gate = await readMembership();
  if (gate.status === "anonymous") {
    // Member-only content: send unauthenticated requests to log in.
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (gate.status !== "ok") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Each hit mints a service-role signed URL against private Storage. Cap per
  // member so a logged-in account can't script bulk signing/enumeration; the
  // limit is generous enough for normal lesson/document browsing.
  if (!(await checkRateLimit(`docs:${gate.profile.userId}`, 120, 600))) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  if (!isAllowed(path, gate.profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Sign the object with the service-role client (the bucket is private, so the
  // anon/SSR client cannot read it). Short TTL: the link is used immediately.
  const objectPath = path.join("/");
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const response = NextResponse.redirect(data.signedUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
