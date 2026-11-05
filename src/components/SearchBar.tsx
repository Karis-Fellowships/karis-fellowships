"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Fuse, { type IFuseOptions, type FuseResult } from "fuse.js";

export interface SearchEntry {
  title: string;
  path: string;
  section: string;
  content: string;
  type: string;
}

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  doc: "DOC",
  page: "Page",
};

export function getSnippet(
  content: string,
  q: string,
): { before: string; match: string; after: string } | null {
  if (!content || !q || q.length < 3) return null;

  const idx = content.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return null;

  const matchText = content.slice(idx, idx + q.length);
  const beforeStart = Math.max(0, idx - 80);
  const afterEnd = Math.min(content.length, idx + q.length + 80);
  const before = content.slice(beforeStart, idx);
  const after = content.slice(idx + q.length, afterEnd);

  return {
    before: (beforeStart > 0 ? "..." : "") + before,
    match: matchText,
    after: after + (afterEnd < content.length ? "..." : ""),
  };
}

export const FUSE_OPTIONS: IFuseOptions<SearchEntry> = {
  keys: [
    { name: "title", weight: 3 },
    { name: "section", weight: 1 },
    { name: "content", weight: 0.5 },
  ],
  threshold: 0.2,
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 3,
};

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FuseResult<SearchEntry>[]>([]);
  const [open, setOpen] = useState(false);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadIndex = useCallback(async () => {
    if (fuse || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/search-index");
      if (!res.ok) throw new Error("Search index unavailable");
      const data: SearchEntry[] = await res.json();
      setFuse(new Fuse(data, FUSE_OPTIONS));
    } catch {
      console.error("Failed to load search index");
    } finally {
      setLoading(false);
    }
  }, [fuse, loading]);

  useEffect(() => {
    if (!fuse || !query.trim()) {
      setResults([]);
      return;
    }
    setResults(fuse.search(query, { limit: 8 }));
  }, [query, fuse]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && query.trim().length >= 3) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const isDocument = (type: string) => type !== "page";

  return (
    <div ref={containerRef} className="relative z-50">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          aria-label="Search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { loadIndex(); setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search lessons, toolbox, and resources..."
          className="w-full rounded-xl border border-white/25 bg-white/15 px-5 py-4 pl-12 text-sm text-white shadow-lg shadow-black/20 backdrop-blur-md outline-none transition-all focus:border-teal focus:bg-white/20 focus:ring-2 focus:ring-teal/30 placeholder:text-white/50"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">Loading...</span>
        )}
      </div>

      {open && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-slate-dark/95 shadow-2xl backdrop-blur-xl">
          {results.length > 0 ? (
            <>
              <ul className="divide-y divide-white/5 py-1">
                {results.map(({ item }) => {
                  const snippet = getSnippet(item.content, query);
                  const cls = "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5";
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
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/15 self-start mt-0.5">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{item.title}</p>
                        <p className="truncate text-xs text-white/35">{item.section}</p>
                        {snippet && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/25 italic">
                            &ldquo;{snippet.before}
                            <span className="font-semibold text-teal-light not-italic">{snippet.match}</span>
                            {snippet.after}&rdquo;
                          </p>
                        )}
                      </div>
                      {TYPE_LABELS[item.type] && (
                        <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/40">
                          {TYPE_LABELS[item.type]}
                        </span>
                      )}
                    </>
                  );

                  return (
                    <li key={item.path}>
                      {isDocument(item.type) ? (
                        <a href={item.path} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={cls}>{body}</a>
                      ) : (
                        <Link href={item.path} onClick={() => setOpen(false)} className={cls}>{body}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }}
                className="w-full border-t border-white/5 px-4 py-3 text-center text-xs font-medium text-teal-light transition-colors hover:bg-white/5"
              >
                View all results &rarr;
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-white/30">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
