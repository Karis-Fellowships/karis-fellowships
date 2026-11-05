import PageHeader from "@/components/PageHeader";
import { requirePaidNHG } from "@/lib/require-tier";

export default async function NHGSchedulesPage() {
  await requirePaidNHG();
  return (
    <div className="min-h-screen bg-[#4a5568]">
      <PageHeader title="Schedules & Reading Guides" subtitle="Study schedules, chapter guides, and study plan options for the NHG book study." accent="amber" image="/path-nature.jpg" imageAlt="Path through nature" payg />
      <section className="px-6 py-10 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
            <p className="text-white/50">
              We offer the Weekly Study and Weekend Intensive Study formats,
              both 8 weeks in length, once a year beginning in January and
              ending in March.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white">Reading Guides</h3>
              <p className="mt-2 text-sm text-white/40">Your NHG reading guide documents will be available here once uploaded.</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white">Study Schedule</h3>
              <p className="mt-2 text-sm text-white/40">Current year schedule and dates will appear here.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
