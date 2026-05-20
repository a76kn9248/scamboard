"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SubscammerChips from "@/components/SubscammerChips";
import HeroStats from "@/components/HeroStats";
import TopEightWanted from "@/components/TopEightWanted";
import SortTabs from "@/components/SortTabs";
import ReportCard from "@/components/ReportCard";
import IconRail from "@/components/IconRail";
import MyProfileCard from "@/components/MyProfileCard";
import Top8Watchdogs from "@/components/Top8Watchdogs";
import LiveFeed from "@/components/LiveFeed";
import TopWatchdogsLeaderboard from "@/components/TopWatchdogsLeaderboard";
import RoastOfTheWeek from "@/components/RoastOfTheWeek";

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

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get("sort") || "hot";
  const sub = searchParams.get("sub") || "";
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
    if (sub) params.set("sub", sub);

    fetch(`/api/reports?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort, sub, search, page]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Subscammer chips bar */}
      <SubscammerChips />

      {/* Main three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[56px_1fr_320px] gap-[18px] px-[22px] py-5 max-w-[1280px] mx-auto">
        {/* Left Icon Rail - hidden on mobile */}
        <div className="hidden lg:block">
          <IconRail />
        </div>

        {/* Main Feed Column */}
        <div>
          {/* Hero Stats */}
          <HeroStats />

          {/* Top 8 Most Wanted Section */}
          <div className="mt-5">
            <div className="flex items-baseline gap-2.5 mb-2.5">
              <span className="font-display text-[17px] font-black text-[#f5e7d8]">
                {"\u{1F6A8}"} Top 8 Most Wanted
              </span>
              <span className="text-[var(--text-muted)] text-[11px]">
                refreshed every confirm
              </span>
              <span className="ml-auto text-[var(--text-muted)] text-[11px] cursor-pointer hover:text-[var(--red)]">
                see all 2,847 {"\u2192"}
              </span>
            </div>
            <TopEightWanted />
          </div>

          {/* All Reports Section */}
          <div className="mt-6">
            <div className="flex items-baseline gap-2.5 mb-2.5">
              <span className="font-display text-[17px] font-black text-[#f5e7d8]">
                {"\u{1F4CB}"} All reports
              </span>
              <span className="text-[var(--text-muted)] text-[11px]">
                filtered: r/{sub || "all"} {"\u00B7"} 24h
              </span>
            </div>

            <SortTabs showDensity />

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton h-32 rounded-[10px]" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                {search
                  ? "No reports match your search."
                  : "No reports yet. Be the first watchdog!"}
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
                      onClick={() =>
                        page < pagination.totalPages && handlePageChange(page + 1)
                      }
                    >
                      next {"\u2192"}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar - hidden on mobile */}
        <div className="hidden lg:flex flex-col gap-4">
          {/* My Profile Card */}
          <MyProfileCard />

          {/* Top 8 Watchdogs */}
          <Top8Watchdogs editable />

          {/* Live Feed */}
          <div className="card overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse-dot" />
              <span className="font-display font-black text-[12px] text-[var(--text)]">
                Live feed
              </span>
            </div>
            <div className="p-3">
              <LiveFeed limit={7} />
            </div>
          </div>

          {/* Top Watchdogs Leaderboard */}
          <TopWatchdogsLeaderboard limit={5} />

          {/* Roast of the Week */}
          <RoastOfTheWeek />
        </div>
      </div>

      {/* Mobile-only: sidebar content at bottom */}
      <div className="lg:hidden px-[22px] pb-8 space-y-4">
        <MyProfileCard />
        <Top8Watchdogs editable />

        <div className="card overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse-dot" />
            <span className="font-display font-black text-[12px] text-[var(--text)]">
              Live feed
            </span>
          </div>
          <div className="p-3">
            <LiveFeed limit={5} />
          </div>
        </div>

        <TopWatchdogsLeaderboard limit={5} />
        <RoastOfTheWeek />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">{"\u2620"}</div>
            <div className="text-[var(--text-muted)]">Loading the wall of shame...</div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
