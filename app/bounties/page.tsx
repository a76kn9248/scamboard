"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ShameMessage from "@/components/ShameMessage";
import ThreatBadge from "@/components/ThreatBadge";

interface BountyReport {
  id: string;
  identifier: string;
  type: string;
  reason: string;
  confirmCount: number;
  bountyCount: number;
  authorNickname: string;
}

export default function BountiesPage() {
  const [reports, setReports] = useState<BountyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reports sorted by bounty count
    fetch("/api/reports?sort=confirms&limit=50")
      .then((res) => res.json())
      .then((data) => {
        // Filter to only show reports with bounties (mock: all for now)
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-6xl mb-4 block">{"\u{1F4B0}"}</span>
          <h1
            className="text-4xl md:text-5xl font-black text-[var(--gold)] mb-4"
            style={{ fontFamily: "var(--font-display), var(--font-mono), monospace" }}
          >
            BOUNTIES
          </h1>
          <p className="text-lg text-[var(--text-muted)] mb-6">
            Community-funded rewards for bringing scammers to justice.
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Contribute to bounty pools on high-profile scammer cases.
          </p>
        </div>

        {/* Bounty list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">{"\u{1F389}"}</span>
            <h2 className="text-xl font-bold text-[var(--text)] mb-4">
              No Bounties Yet
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              Be the first to add a bounty to a scammer report!
            </p>
            <Link href="/" className="btn-primary">
              View Reports
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report, index) => (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                className="block"
              >
                <div className="card p-4 hover:border-[var(--gold)] transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="text-2xl font-black text-[var(--gold)]">
                      #{index + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${report.type === "deployer" ? "badge-purple" : "badge-success"}`}>
                          {report.type}
                        </span>
                        <ThreatBadge confirmCount={report.confirmCount} size="sm" />
                      </div>
                      <div className="font-mono text-[var(--text)] truncate">
                        {report.type === "twitter" ? "@" : ""}{report.identifier}
                      </div>
                      <div className="text-[var(--text-muted)] text-sm truncate">
                        {report.reason.slice(0, 100)}...
                      </div>
                    </div>

                    {/* Bounty amount (placeholder) */}
                    <div className="text-right">
                      <div className="font-display font-black text-[24px] text-[var(--gold)]">
                        $0
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        bounty pool
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Coming soon notice */}
        <div className="text-center mt-8 p-6 card border-[var(--gold)] border-dashed">
          <span className="text-2xl mb-2 block">{"\u{1F6A7}"}</span>
          <h3 className="font-bold text-[var(--gold)] mb-2">Bounty System Coming Soon</h3>
          <p className="text-[var(--text-muted)] text-sm">
            Full bounty contributions and payouts are under development.
            For now, browse reports with the highest confirm counts.
          </p>
        </div>

        {/* Shame message */}
        <div className="text-center mt-12">
          <ShameMessage />
        </div>
      </div>
    </div>
  );
}
