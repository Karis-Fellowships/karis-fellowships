import { requireTier } from "@/lib/require-tier";

// Defense-in-depth: the NHG area must not rely on middleware (proxy.ts) alone.
// Re-verify server-side that the caller is signed in, active, and an allowed
// tier. This layout also wraps /nhg/payment-required, so the nhg_paid gate
// lives in (study)/layout.tsx (and on each study page) rather than here.
// Document files are independently protected by /api/documents.
export default async function NHGLayout({ children }: { children: React.ReactNode }) {
  await requireTier(["nhg", "kf", "admin"]);
  return <>{children}</>;
}
