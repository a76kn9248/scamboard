"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Report {
  id: string;
  type: string;
  identifier: string;
  reason: string;
  confirmCount: number;
  commentCount: number;
  createdAt: string;
  subscammer?: string;
}

interface UserReportsListProps {
  nickname: string;
  userColor: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function UserReportsList({ nickname, userColor }: UserReportsListProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/users/${nickname}/reports`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reports) {
          setReports(data.reports);
          setTotal(data.total || data.reports.length);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nickname]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="card p-8 text-center">
        <span className="text-4xl mb-4 block">🎯</span>
        <p className="text-[var(--text-muted)]">No reports submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>🎯</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Reports by @{nickname}
        </span>
        <span className="bg-[var(--border)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded-full font-mono">
          {total}
        </span>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/report/${report.id}`}
            className="block p-4 hover:bg-[var(--surface)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: report.type === "deployer" ? "var(--purple)" : "var(--cyan)" }}
              >
                {report.type === "deployer" ? "💰" : "🐦"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                  {report.subscammer && (
                    <span className="text-[var(--text-secondary)]">r/{report.subscammer}</span>
                  )}
                  <span>·</span>
                  <span>{formatTimeAgo(new Date(report.createdAt))}</span>
                </div>

                <div className="font-mono text-[var(--text)] text-sm truncate mb-1">
                  {report.type === "twitter" ? "@" : ""}{report.identifier}
                </div>

                <p className="text-[var(--text-muted)] text-xs line-clamp-2">
                  {report.reason}
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                  <span className="text-[var(--red)]">🔥 {report.confirmCount} confirms</span>
                  <span>💬 {report.commentCount} comments</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
