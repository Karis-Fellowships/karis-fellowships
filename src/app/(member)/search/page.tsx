"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Fuse, { type FuseResult } from "fuse.js";
import { type SearchEntry, getSnippet, FUSE_OPTIONS } from "@/components/SearchBar";

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  doc: "DOC",
  page: "Page",
};

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState<FuseResult<SearchEntry>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/search-index")
      .then((r) => {
        if (!r.ok) throw new Error("Search index unavailable");
        return r.json();
      })
      .then((data: SearchEntry[]) => {
        const fuse = new Fuse(data, FUSE_OPTIONS);
        setResults(fuse.search(q, { limit: 50 }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  const isDocument = (type: string) => type !== "page";

  const grouped = results.reduce<Record<string, FuseResult<SearchEntry>[]>>((acc, r) => {
    const section = r.item.section;
    if (!acc[section]) acc[section] = [];
    acc[section].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#4a5568]">
      <section className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/kf" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-teal-light">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to KF Weekly Meetings
          </Link>

          <h1 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            Search Results
          </h1>
          {q && (
            <p className="mt-2 text-sm text-white/40">
              {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""} for`}{" "}
              <span className="font-medium text-teal-light">&ldquo;{q}&rdquo;</span>
            </p>
          )}

          {loading ? (
            <div className="mt-12 text-center text-sm text-white/30">Loading...</div>
          ) : results.length === 0 ? (
            <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-sm text-white/40">
                {q ? `No results found for "${q}". Try a different search term.` : "Enter a search term to get started."}
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {Object.entries(grouped).map(([section, sectionResults]) => (
                <div key={section}>
                  <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-white/30">
                    {section} ({sectionResults.length})
                  </h2>
                  <div className="space-y-2">
                    {sectionResults.map(({ item }) => {
                      const snippet = getSnippet(item.content, q);

                      const icon = isDocument(item.type) ? (
                        <svg className="h-4 w-4 text-teal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-teal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                        </svg>
                      );

                      const body = (
                        <>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/15 mt-0.5">
                            {icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-semibold text-white">{item.title}</p>
                              {TYPE_LABELS[item.type] && (
                                <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/40">
                                  {TYPE_LABELS[item.type]}
                                </span>
                              )}
                            </div>
                            {snippet && (
                              <p className="mt-2 text-xs leading-relaxed text-white/30 italic">
                                &ldquo;{snippet.before}
                                <span className="font-semibold text-teal-light not-italic">{snippet.match}</span>
                                {snippet.after}&rdquo;
                              </p>
                            )}
                          </div>
                        </>
                      );

                      const cls = "flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-colors hover:border-teal/30 hover:bg-white/[0.05]";

                      if (isDocument(item.type)) {
                        return (
                          <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer" className={cls}>
                            {body}
                          </a>
                        );
                      }

                      return (
                        <Link key={item.path} href={item.path} className={cls}>
                          {body}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#4a5568] flex items-center justify-center text-white/30">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
