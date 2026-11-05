import Image from "next/image";
import StudyDonationBanner from "@/components/StudyDonationBanner";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { docUrl } from "@/lib/storage-url";
import { getMeetingCodes, phoneNumber, firstCode } from "@/lib/meeting-codes";
import { requireKF } from "@/lib/require-tier";

const readingGuides = [
  { label: "Chapters 1 & 2 Reading Guide (PDF)", href: "/docs/other-studies/hpkp/1-pdf-Rdg-Gd-Ch-1-2-HPKP-2025z.pdf" },
  { label: "Chapters 1 & 2 Reading Guide (Typed)", href: "/docs/other-studies/hpkp/1-typd-Rdg-Gd-Ch-1-2-HPKP-2025z.docx", type: "docx" },
  { label: "Chapters 3 & 4 Reading Guide (PDF)", href: "/docs/other-studies/hpkp/2-pdf-Rdg-Gd-Ch-3-4-HPKP-2025z.pdf" },
  { label: "Chapters 3 & 4 Reading Guide (Typed)", href: "/docs/other-studies/hpkp/2-typd-Rdg-Gd-Ch-3-4-HPKP-2025z.docx", type: "docx" },
  { label: "Chapters 5 & 6 Reading Guide (PDF)", href: "/docs/other-studies/hpkp/3-pdf-Rdg-Gd-Ch-5-6-HPKP-2025z.pdf" },
  { label: "Chapters 5 & 6 Reading Guide (Typed)", href: "/docs/other-studies/hpkp/3-typd-Rdg-Gd-Ch-5-6-HPKP-2025z.docx", type: "docx" },
  { label: "Chapters 7 & 8 Reading Guide (PDF)", href: "/docs/other-studies/hpkp/4-pdf-Rdg-Gd-Ch-7-8-HPKP-2025z.pdf" },
  { label: "Chapters 7 & 8 Reading Guide (Typed)", href: "/docs/other-studies/hpkp/4-typd-Rdg-Gd-Ch-7-8-HPKP-2025z.docx", type: "docx" },
];

const furtherViewing = [
  { label: "Lecture 1: Honor and Shame", href: "https://youtu.be/o1Xt0RZgHmw" },
  { label: "Lecture 2: 1 Peter – Honor and Shame", href: "https://youtu.be/MmxdoOve4Kg" },
  { label: "Lecture 3: Patronage and Reciprocity", href: "https://youtu.be/GrZRxlzQTS4" },
  { label: "Lecture 4: Hebrews – Patronage and Reciprocity", href: "https://youtu.be/mz12NFDQyZQ" },
  { label: "Lecture 5: Family and Household", href: "https://youtu.be/aj5DAH8ffYg" },
  { label: "Lecture 6: 1 Peter and Kinship", href: "https://youtu.be/CRD4muWOwPA" },
  { label: "Lecture 7: Purity and Pollution", href: "https://youtu.be/b3gZXGW7dX4" },
];

const furtherReading = [
  { label: "Theo Geek: 'Grace', a mistranslated word and misunderstood concept", href: "http://theogeek.blogspot.com/2008/02/grace-mistranslated-word-and.html" },
  { label: "Wikipedia: New Perspective on Paul", href: "https://en.wikipedia.org/wiki/New_Perspective_on_Paul" },
];

export default async function HPKPPage() {
  await requireKF();
  const codes = await getMeetingCodes();
  const callPhone = phoneNumber(codes);
  const accessCode = firstCode(codes, "hpkp");
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  let hasDonated = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("hpkp_donated")
      .eq("id", user.id)
      .single();
    hasDonated = profile?.hpkp_donated ?? false;
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
            <h1 className="font-serif text-3xl font-semibold text-white drop-shadow-lg sm:text-4xl">Honor, Patronage, Kinship &amp; Purity</h1>
            <p className="mt-2 text-sm font-medium text-white/85 drop-shadow sm:text-base">A 4 week study offered each Spring</p>
          </div>
        </section>
        <section className="px-6 pb-16 pt-10">
          <div className="mx-auto max-w-3xl">
          <StudyDonationBanner
            studyName="Honor, Patronage, Kinship & Purity"
            type="hpkp"
            hasDonated={hasDonated}
            userId={user?.id ?? ""}
            userEmail={user?.email ?? ""}
          />
          {/* Call Info */}
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 mb-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/40">Meeting Call Info</h3>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-white/35 uppercase tracking-wide">Phone</p>
                <p className="mt-0.5 text-lg font-bold text-amber">{callPhone}</p>
              </div>
              <div>
                <p className="text-xs text-white/35 uppercase tracking-wide">Access Code</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-amber/80">{accessCode}</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-8 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white">What is HPKP?</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-white/60">
              <p>
                A 4 week study offered each Spring on the book{" "}
                <a href="https://smile.amazon.com/Honor-Patronage-Kinship-Purity-Unlocking/dp/0830815724/" target="_blank" rel="noopener noreferrer" className="text-amber underline hover:text-amber/80">
                  Honor, Patronage, Kinship and Purity: Unlocking New Testament Culture by David A. deSilva
                </a>.
              </p>
              <p className="font-semibold text-white/80">!Please purchase the 1st edition (printed in 2000)</p>
              <p>
                Have you ever wondered if there is any evidence for the KF interpretation of &ldquo;grace&rdquo; (karis)? Have you wondered if the KF interpretation of glory has any scholarly foundation? What did those reading the New Testament for the first time understand when they read about grace, glory, the Christian community, and holy living? What can we learn for our Christian life today?
              </p>
              <p>
                I asked myself those same questions when I first picked up this book. I often wondered if recent scholarship supports what we are learning in KF. What if my understanding was all wrong? What if my translations were adding incorrect interpretations to the Bible? Oh, me of little faith! I found that this book, Honor, Patronage, Kinship and Purity, was exactly what we needed to fill in the historical and academic background for all that KF teaches about grace, glory, orientation, and community.
              </p>
              <p>
                David deSilva is a professor of New Testament and Greek at Ashland Theological Seminary. He says, &ldquo;Without taking some care to recover the culture of the first century Greco-Roman writers and addressees, we will simply read the texts from the perspective of our cultural norms and codes.&rdquo; And also, &ldquo;To immerse ourselves in the cultural context of the New Testament authors and hearers is to open ourselves up to hear the New Testament with the fuller resonances it would have had for authors and addressees alike.&rdquo;
              </p>
              <p>
                What does he mean? He means that when we read the New Testament we often interpret it according to our own culture and lose much of the original meaning, and even misinterpret the meaning! If we really want to understand the New Testament we must learn what those first century Christians were understanding when they first heard the good news of Jesus Christ. I studied first century culture at the University of Oklahoma and am delighted to revisit that world with you as we go through this book together.
              </p>
              <p className="italic text-white/50">Nancy Diven</p>
              <p>
                You can purchase the book{" "}
                <a href="https://smile.amazon.com/Honor-Patronage-Kinship-Purity-Unlocking/dp/0830815724/" target="_blank" rel="noopener noreferrer" className="text-amber underline hover:text-amber/80">
                  Honor, Patronage, Kinship and Purity
                </a>{" "}
                at your local bookstore or on Amazon.com. Please purchase the 1st edition (Published in 2000) and not the new edition (printed in 2022.)
              </p>
            </div>
          </div>

          {/* Reading Guides */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white">Reading Guides</h2>
            <div className="mt-4 grid gap-2">
              {readingGuides.map(({ label, href, type }) => (
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
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{label}</span>
                  {type === "docx" && (
                    <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/40">DOCX</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Further Viewing */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white">Further Viewing</h2>
            <p className="mt-2 text-sm text-white/50">
              These seven lectures by Dr. David deSilva entitled Cultural World of the New Testament can be watched on YouTube.
            </p>
            <div className="mt-4 grid gap-2">
              {furtherViewing.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coral/15">
                    <svg className="h-4 w-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-white/80 group-hover:text-coral transition-colors">{label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Further Reading */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white">Further Reading</h2>
            <div className="mt-4 grid gap-2">
              {furtherReading.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/15">
                    <svg className="h-4 w-4 text-teal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-white/80 group-hover:text-teal-light transition-colors">{label}</span>
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
