import Navbar from "@/components/Navbar";
import type { NavTier } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMemberProfile } from "@/lib/require-tier";
import { redirect } from "next/navigation";

// Member areas should never be indexed — defense-in-depth alongside robots.txt.
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  // An Auth session with no active membership row is not a member. Do not
  // default that case to an NHG view.
  const profile = await getMemberProfile();
  if (!profile) redirect("/login");

  const tier: NavTier =
    profile.tier === "nhg" || profile.tier === "kf" || profile.tier === "admin"
      ? profile.tier
      : null;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-teal focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white">
        Skip to content
      </a>
      <Navbar isLoggedIn={true} tier={tier} />
      <main id="main" className="min-h-screen bg-slate-dark">{children}</main>
      <Footer />
    </>
  );
}
