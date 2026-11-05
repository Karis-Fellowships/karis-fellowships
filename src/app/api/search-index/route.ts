import { NextResponse } from "next/server";
import searchIndex from "@/data/search-index.json";
import { kfContentOpen, readMembership } from "@/lib/require-tier";

export const dynamic = "force-dynamic";

// Full lesson text for member search. This file used to be served from
// public/search-index.json with no auth. It must stay out of public/.
export async function GET() {
  const gate = await readMembership();
  if (gate.status === "anonymous") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (gate.status !== "ok" || !kfContentOpen(gate.profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(searchIndex, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
