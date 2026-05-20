"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import ReportCard from "@/components/ReportCard";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const sort = searchParams.get("sort") || "confirms";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("sort", sort);
        params.set("page", page.toString());
        if (search) params.set("search", search);

        const res = await fetch(`/api/reports?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch reports");
          return;
        }

        setReports(data.reports);
        setPagination(data.pagination);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-500 mb-2">
          SCAMMER WATCHLIST
        </h1>
        <p className="text-gray-500 text-sm">
          Community-verified deployer addresses and Twitter handles. Report
          scammers, confirm reports, add intel.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Sort tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-800">
        <button
          onClick={() => handleSortChange("confirms")}
          className={`pb-2 px-1 text-sm font-mono transition-colors ${
            sort === "confirms"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          TOP CONFIRMED
        </button>
        <button
          onClick={() => handleSortChange("recent")}
          className={`pb-2 px-1 text-sm font-mono transition-colors ${
            sort === "recent"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          RECENT
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500 font-mono">LOADING...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-400 font-mono">{error}</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 font-mono mb-2">NO REPORTS FOUND</div>
          <p className="text-gray-700 text-sm">
            {search
              ? "Try a different search term."
              : "Be the first to report a scammer."}
          </p>
        </div>
      ) : (
        <>
          {/* Report list */}
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 font-mono text-sm border border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-gray-500 transition-colors"
              >
                PREV
              </button>
              <span className="text-gray-500 font-mono text-sm">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 font-mono text-sm border border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-gray-500 transition-colors"
              >
                NEXT
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="text-gray-500 font-mono">LOADING...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
