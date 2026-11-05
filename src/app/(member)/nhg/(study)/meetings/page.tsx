import PageHeader from "@/components/PageHeader";
import { requirePaidNHG } from "@/lib/require-tier";

export default async function NHGMeetingsPage() {
  await requirePaidNHG();
  return (
    <div className="min-h-screen bg-[#4a5568]">
      <PageHeader title="Attend NHG Meetings" subtitle="Conference call information and meeting details." accent="teal" image="/sunlight-nature.jpg" imageAlt="Sunlight through nature" payg />
      <section className="px-6 py-10 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
            <h2 className="font-bold text-white">Meeting Information</h2>
            <p className="mt-2 text-white/50">
              All of our programs are online, so you can attend from anywhere in the world.
              Conference call details and instructions will be provided here.
            </p>
          </div>
          <p className="mt-6 text-sm text-white/30 italic">
            Meeting details and call-in information will be populated from your NHG materials.
          </p>
        </div>
      </section>
    </div>
  );
}
