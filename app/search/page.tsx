"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReportCard from "@/components/ReportCard";

interface Report {
  id: string;
  type: string;
  identifier: string;
  reason: string;
  authorNickname: string;
  authorColor?: string;
  authorTitle?: string;
  confirmCount: number;
  commentCount: number;
  createdAt: string;
  rank: number;
  roastTitle?: string | null;
  bountyCount?: number;
  chain?: string;
  subscammer?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (!query) {
      setReports([]);
      setPagination(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/reports?search=${encodeURIComponent(query)}&page=${page}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch(() => {
        setReports([]);
        setLoading(false);
      });
  }, [query, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <Link href="/" className="text-[var(--text-muted)] text-sm hover:text-[var(--text)] mb-4 inline-block">
            {"\u2190"} Back to Feed
          </Link>
          <h1 className="text-2xl font-black text-[var(--text)] mb-4">
            {"\u{1F50D}"} Search Reports
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by wallet, @handle, reason, or author..."
              className="input flex-1"
            />
            <button type="submit" className="btn-primary px-6">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {query && (
          <div className="mb-4">
            <p className="text-[var(--text-muted)] text-sm">
              {loading ? (
                "Searching..."
              ) : pagination ? (
                <>
                  Found <span className="text-[var(--text)] font-bold">{pagination.total}</span> results for &quot;
                  <span className="text-[var(--green)]">{query}</span>&quot;
                </>
              ) : (
                "No results found"
              )}
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-32 rounded-[10px]" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            {query ? (
              <div>
                <p className="text-[var(--text-muted)] text-lg mb-2">
                  No reports found for &quot;{query}&quot;
                </p>
                <p className="text-[var(--text-muted)] text-sm">
                  Try searching for a wallet address, Twitter handle, or scam description
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[var(--text-muted)] text-lg mb-2">
                  Enter a search term to find scammer reports
                </p>
                <p className="text-[var(--text-muted)] text-sm">
                  Search by wallet address, @handle, reason text, or author nickname
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="text-center mt-4 py-3 text-[var(--text-muted)] text-[12px]">
                <span
                  className={`cursor-pointer ${page === 1 ? "opacity-50" : "hover:text-[var(--text)]"}`}
                  onClick={() => page > 1 && handlePageChange(page - 1)}
                >
                  {"\u2190"} prev
                </span>
                <span className="mx-4">
                  page <b className="text-[var(--text)]">{page}</b> of {pagination.totalPages}
                </span>
                <span
                  className={`cursor-pointer ${
                    page === pagination.totalPages
                      ? "opacity-50"
                      : "text-[var(--red)] hover:underline"
                  }`}
                  onClick={() => page < pagination.totalPages && handlePageChange(page + 1)}
                >
                  next {"\u2192"}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">{"\u{1F50D}"}</div>
            <div className="text-[var(--text-muted)]">Loading search...</div>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
