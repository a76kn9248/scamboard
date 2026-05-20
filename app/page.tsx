"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ShameMessage from "@/components/ShameMessage";
import StatsBar from "@/components/StatsBar";
import TopTenBoard from "@/components/TopTenBoard";
import LiveFeed from "@/components/LiveFeed";
import ReportCard from "@/components/ReportCard";
import SearchBar from "@/components/SearchBar";

interface Report {
  id: string;
  type: string;
  identifier: string;
  reason: string;
  authorNickname: string;
  confirmCount: number;
  commentCount: number;
  createdAt: string;
  rank: number;
  roastTitle?: string | null;
  bountyCount?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get("sort") || "confirms";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      sort,
      search,
      page: page.toString(),
      limit: "20",
    });

    fetch(`/api/reports?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort, search, page]);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 text-center bg-gradient-to-b from-[var(--background-secondary)] to-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-6xl font-black text-[var(--red-primary)] mb-4"
            style={{ fontFamily: "var(--font-display), var(--font-mono), monospace" }}
          >
            &#x2620; SCAMBOARD
          </h1>
          <p className="text-lg md:text-xl text-[var(--foreground-muted)] mb-6">
            The community-powered wall of shame for memecoin scammers
          </p>
          <div className="mb-8">
            <ShameMessage interval={5000} className="text-base" />
          </div>
          <div className="mb-8">
            <StatsBar />
          </div>
          <Link href="/submit" className="btn-primary text-lg py-3 px-8 inline-block">
            &#x1F6A9; REPORT A SCAMMER
          </Link>
        </div>
      </section>

      {/* Top 10 Most Wanted Section */}
      <section className="py-12 px-4 bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">&#x1F6A8;</span>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">
              TOP 10 MOST WANTED
            </h2>
          </div>
          <TopTenBoard />
        </div>
      </section>

      {/* Live Feed & All Reports Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feed */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">&#x1F4E1;</span>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">LIVE FEED</h2>
                </div>
                <div className="card p-4 max-h-[600px] overflow-y-auto">
                  <LiveFeed limit={15} />
                </div>
              </div>
            </div>

            {/* All Reports */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">&#x1F4CB;</span>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">ALL REPORTS</h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSortChange("confirms")}
                    className={`px-4 py-2 rounded text-sm transition-colors ${
                      sort === "confirms"
                        ? "bg-[var(--red-primary)] text-white"
                        : "bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Top Confirmed
                  </button>
                  <button
                    onClick={() => handleSortChange("recent")}
                    className={`px-4 py-2 rounded text-sm transition-colors ${
                      sort === "recent"
                        ? "bg-[var(--red-primary)] text-white"
                        : "bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Recent
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <SearchBar />
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton h-32 rounded-lg" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[var(--foreground-muted)] mb-4">
                    {search ? "No reports match your search." : "No reports yet. Be the first!"}
                  </p>
                  <ShameMessage />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <ReportCard key={report.id} report={report} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded bg-[var(--background-card)] text-[var(--foreground-muted)] disabled:opacity-50 transition-colors hover:bg-[var(--background-tertiary)]"
                      >
                        Prev
                      </button>
                      <span className="px-4 py-2 text-[var(--foreground-muted)]">
                        Page {page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, page + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 rounded bg-[var(--background-card)] text-[var(--foreground-muted)] disabled:opacity-50 transition-colors hover:bg-[var(--background-tertiary)]"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">&#x2620;</div>
            <ShameMessage />
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
