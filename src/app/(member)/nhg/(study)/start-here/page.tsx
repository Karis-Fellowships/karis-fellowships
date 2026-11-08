import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { requirePaidNHG } from "@/lib/require-tier";

export default async function NHGStartHerePage() {
  await requirePaidNHG();
  return (
    <div className="min-h-screen bg-[#4a5568]">
      <PageHeader title="NHG — Start Here" subtitle="Welcome to the Neurosis and Human Growth book study." accent="coral" image="/forest-light.jpg" imageAlt="Light breaking through the forest" payg />
      <section className="px-6 py-10 sm:py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
            <p className="leading-relaxed text-white/55">
              Your first step is to participate in the Neurosis and Human Growth
              (NHG) book study. You read the first 11 chapters of Karen
              Horney&apos;s masterpiece, complete a study guide for each chapter,
              and attend live conference calls to hear additional material, check
              your answers, and ask questions.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">What to Expect</h2>
            <p className="mt-3 leading-relaxed text-white/50">
              Focusing as you read on the Christian struggle to walk by the
              Spirit and no longer fulfill the desires of the flesh (Galatians
              5:16-25), you will find solid answers to questions about what traps
              you in legalism, what really drives you, and why your life so lacks
              the peace and joy the Bible describes.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/nhg/schedules" className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-all hover:bg-coral/90 hover:-translate-y-0.5">
              View Schedules
            </Link>
            <Link href="/nhg/meetings" className="rounded-full border-2 border-coral px-6 py-3 text-sm font-bold text-coral-light transition-colors hover:bg-coral/20">
              Meeting Info
            </Link>
          </div>
          <p className="text-sm text-white/30 italic">
            Content for this page will be expanded from your NHG materials.
          </p>
        </div>
      </section>
    </div>
  );
}
