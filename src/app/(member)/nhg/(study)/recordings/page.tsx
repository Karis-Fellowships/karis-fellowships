import PageHeader from "@/components/PageHeader";
import { requirePaidNHG } from "@/lib/require-tier";

export default async function NHGRecordingsPage() {
  await requirePaidNHG();
  return (
    <div className="min-h-screen bg-[#4a5568]">
      <PageHeader title="NHG Recordings" subtitle="Recordings from past NHG sessions for review and catch-up." accent="sky" image="/waterfall.jpg" imageAlt="Waterfall in nature" payg />
      <section className="px-6 py-10 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
            <p className="text-white/50">
              Listen to past NHG conference call recordings. Links to recordings from StartMeeting will appear here.
            </p>
          </div>
          <p className="mt-6 text-sm text-white/30 italic">
            Recordings will be linked here once StartMeeting URLs are provided.
          </p>
        </div>
      </section>
    </div>
  );
}
