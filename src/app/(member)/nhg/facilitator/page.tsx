import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import FacilitatorSection from "@/components/FacilitatorSection";
import { getKFActor } from "@/lib/facilitator";
import { requireKF } from "@/lib/require-tier";

// NHG Facilitator Resources — its own KF-members-only page: general facilitator
// guides + the meeting sign-up board. Gated server-side via getKFActor (active
// KF/admin only); anyone else is sent back to /nhg. Middleware also lists
// /nhg/facilitator as a KF-only route (defense in depth), and the claim/release
// API routes re-check KF as well.
export default async function FacilitatorPage() {
  await requireKF();
  const actor = await getKFActor();
  if (!actor) redirect("/nhg");

  return (
    <div className="min-h-screen bg-[#4a5568]">
      <PageHeader
        title="NHG Facilitator Resources"
        subtitle="Everything for facilitating the NHG Book Study — general guides, each week's facilitator guide, and the meeting sign-up."
        accent="amber"
        image="/forest-path.jpg"
        imageAlt="A path winding through a sunlit forest"
        payg
      />
      <section className="relative z-10 -mt-20 px-6 pb-16 sm:-mt-24">
        <div className="mx-auto max-w-7xl">
          <FacilitatorSection userId={actor.userId} myName={actor.name ?? ""} />
        </div>
      </section>
    </div>
  );
}
