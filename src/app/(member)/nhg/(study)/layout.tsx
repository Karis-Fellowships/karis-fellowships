import { requirePaidNHG } from "@/lib/require-tier";

// Paid NHG study pages. /nhg/payment-required stays outside this group so an
// unpaid member can open it without a redirect loop. Each page also calls
// requirePaidNHG() before it loads data, so a middleware bypass cannot render
// the study even if this layout is skipped.
export default async function NHGStudyLayout({ children }: { children: React.ReactNode }) {
  await requirePaidNHG();
  return <>{children}</>;
}
