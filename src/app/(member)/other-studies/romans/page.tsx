import Image from "next/image";
import StudyDonationBanner from "@/components/StudyDonationBanner";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { docUrl } from "@/lib/storage-url";
import { getMeetingCodes, phoneNumber, firstCode } from "@/lib/meeting-codes";
import { requireKF } from "@/lib/require-tier";

const studyGuides = [
  { label: "Chapter 1 Study Guide", href: "/docs/other-studies/romans/1-Chap.-Study-Guide-Romans-2014-v3n.docx", type: "docx" },
  { label: "Chapter 2 Study Guide", href: "/docs/other-studies/romans/2-Chap.-Study-guide-2013-v3n.doc", type: "doc" },
  { label: "Chapter 3 Study Guide", href: "/docs/other-studies/romans/3-Ch.-study-guide-Romans-2013.doc", type: "doc" },
  { label: "Chapter 4 Study Guide", href: "/docs/other-studies/romans/4_Ch.-study-guide-Romans-2014.docx", type: "docx" },
  { label: "Chapter 5 Study Guide", href: "/docs/other-studies/romans/5-Ch.-Study-Guide-Romans-2014.docx", type: "docx" },
  { label: "Chapter 6 Study Guide", href: "/docs/other-studies/romans/6-Ch.-Study-Guide-Romans-2013.doc.docx", type: "docx" },
  { label: "Chapter 7 Study Guide", href: "/docs/other-studies/romans/7-Ch.-Study-Guide-Romans-2013.docx", type: "docx" },
  { label: "Chapter 8 Study Guide", href: "/docs/other-studies/romans/8-Ch.-Study-Guide-Romans-2014.docx", type: "docx" },
  { label: "Chapter 9 Study Guide", href: "/docs/other-studies/romans/9-Ch.-Study-Guide-Romans-2014.docx", type: "docx" },
  { label: "Chapter 10 Study Guide", href: "/docs/other-studies/romans/10-Ch-Study-Guide-Romans-2014.docx", type: "docx" },
  { label: "Chapter 11 Study Guide", href: "/docs/other-studies/romans/11-Ch.-Study-Guide-Romans-2014.docx", type: "docx" },
  { label: "Chapter 12 Study Guide", href: "/docs/other-studies/romans/Rom-12-Study-Guide-2014.docx", type: "docx" },
];

const summaries = [
  { label: "Chapter 1 Summary", href: "/docs/other-studies/romans/Ch.-1-Summary-Romans.pdf" },
  { label: "Chapter 2 Summary", href: "/docs/other-studies/romans/Summary-Ch.-2.docx", type: "docx" },
  { label: "Chapter 3 Summary", href: "/docs/other-studies/romans/Summary-3.docx", type: "docx" },
  { label: "Chapter 4 Summary", href: "/docs/other-studies/romans/Summary-Ch.-4.docx", type: "docx" },
  { label: "Chapter 5 Summary", href: "/docs/other-studies/romans/Summary-Ch.-5-2014.docx", type: "docx" },
  { label: "Chapter 6 Summary", href: "/docs/other-studies/romans/Summary-of-Chapter-6.docx", type: "docx" },
  { label: "Chapter 7 Summary", href: "/docs/other-studies/romans/Summary-Chapter-7.docx", type: "docx" },
  { label: "Chapter 8 Summary", href: "/docs/other-studies/romans/Summary-Chapter-8.docx", type: "docx" },
  { label: "Chapter 9 Summary", href: "/docs/other-studies/romans/Summary-Ch.-9.docx", type: "docx" },
];

export default async function RomansPage() {
  await requireKF();
  const codes = await getMeetingCodes();
  const callPhone = phoneNumber(codes);
  const accessCode = firstCode(codes, "romans");
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  let hasDonated = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("romans_donated")
      .eq("id", user.id)
      .single();
    hasDonated = profile?.romans_donated ?? false;
  }

  return (
    <div className="relative min-h-screen bg-[#4a5568]">
      <div className="absolute inset-x-0 top-0 h-[38rem]">
        <Image src="/mountain-dawn.jpg" alt="Mountains at dawn" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-[#4a5568] sm:from-black/45 sm:via-black/25" />
      </div>
      <div className="relative z-10">
        <section className="px-6 pt-32 sm:pt-44">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-serif text-3xl font-semibold text-white drop-shadow-lg sm:text-4xl">Romans Bible Study</h1>
            <p className="mt-2 text-sm font-medium text-white/85 drop-shadow sm:text-base">A study through the book of Romans</p>
          </div>
        </section>
        <section className="px-6 pb-16 pt-10">
          <div className="mx-auto max-w-3xl">
          <StudyDonationBanner
            studyName="Romans"
            type="romans"
            hasDonated={hasDonated}
            userId={user?.id ?? ""}
            userEmail={user?.email ?? ""}
          />
          {/* Call Info */}
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 mb-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-teal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/40">Meeting Call Info</h3>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-white/35 uppercase tracking-wide">Phone</p>
                <p className="mt-0.5 text-lg font-bold text-teal-light">{callPhone}</p>
              </div>
              <div>
                <p className="text-xs text-white/35 uppercase tracking-wide">Access Code</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-teal-light/80">{accessCode}</p>
              </div>
            </div>
          </div>

          {/* Overview */}
          <a
            href={docUrl("/docs/other-studies/romans/2016-KF-Overview-of-Romans.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl bg-teal/10 ring-1 ring-teal/20 p-6 transition-all hover:bg-teal/15 hover:-translate-y-0.5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/20">
              <svg className="h-5 w-5 text-teal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div>
              <h3 className="font-bold text-white group-hover:text-teal-light transition-colors">KF Overview of Romans</h3>
              <p className="mt-0.5 text-xs text-white/40">PDF</p>
            </div>
          </a>

          {/* Study Guides */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white">Chapter Study Guides</h2>
            <div className="mt-4 grid gap-2">
              {studyGuides.map(({ label, href, type }) => (
                <a
                  key={href}
                  href={docUrl(href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/15">
                    <svg className="h-4 w-4 text-teal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span className="flex-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors">{label}</span>
                  {type && (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/40 uppercase">{type}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Chapter Summaries */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white">Chapter Summaries</h2>
            <div className="mt-4 grid gap-2">
              {summaries.map(({ label, href, type }) => (
                <a
                  key={href}
                  href={docUrl(href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber/15">
                    <svg className="h-4 w-4 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span className="flex-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors">{label}</span>
                  {type && (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/40 uppercase">{type}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Link href="/other-studies" className="text-sm font-medium text-teal-light hover:text-teal transition-colors">
              &larr; Back to Other Studies
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
