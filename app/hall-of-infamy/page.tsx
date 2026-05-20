"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import ThreatBadge from "@/components/ThreatBadge";
import ScammerAvatar from "@/components/ScammerAvatar";
import ShameMessage from "@/components/ShameMessage";

interface InfamousScammer {
  rank: number;
  identifier: string;
  type: string;
  totalConfirms: number;
  reportCount: number;
  roastTitle: string | null;
  primaryReportId: string;
  firstReportDate: string;
}

export default function HallOfInfamyPage() {
  const [scammers, setScammers] = useState<InfamousScammer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        // Filter to only those with 25+ confirms
        const infamous = (data.leaderboard || []).filter(
          (s: InfamousScammer) => s.totalConfirms >= 25
        );
        setScammers(infamous);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-6xl mb-4 block">&#x1F3C6;</span>
          <h1
            className="text-4xl md:text-5xl font-black text-[var(--gold-primary)] mb-4"
            style={{ fontFamily: "var(--font-display), var(--font-mono), monospace" }}
          >
            HALL OF INFAMY
          </h1>
          <p className="text-lg text-[var(--foreground-muted)] mb-6">
            These legends of the rug will never be forgotten.
          </p>
          <p className="text-sm text-[var(--foreground-dimmed)]">
            Scammers with 25+ community confirms earn their place here forever.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
        ) : scammers.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">&#x1F389;</span>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Hall is Empty!
            </h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              No scammers have reached 25 confirms yet. Keep confirming those reports!
            </p>
            <Link href="/" className="btn-primary">
              View All Reports
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {scammers.map((scammer, index) => (
              <Link
                key={scammer.identifier}
                href={`/scammer/${encodeURIComponent(scammer.identifier)}`}
                className="block"
              >
                <div
                  className={`card p-6 transition-all hover-glow ${
                    index === 0
                      ? "border-[var(--gold-primary)] border-2 bg-gradient-to-r from-[rgba(255,214,0,0.1)] to-transparent"
                      : index === 1
                      ? "border-gray-400"
                      : index === 2
                      ? "border-amber-700"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div
                      className={`text-4xl font-black ${
                        index === 0
                          ? "text-[var(--gold-primary)]"
                          : index === 1
                          ? "text-gray-300"
                          : index === 2
                          ? "text-amber-600"
                          : "text-[var(--red-primary)]"
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Avatar */}
                    <ScammerAvatar identifier={scammer.identifier} size="lg" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h2 className="text-xl font-bold text-[var(--foreground)]">
                          {scammer.type === "twitter" ? "@" : ""}
                          {scammer.identifier.length > 20
                            ? `${scammer.identifier.slice(0, 10)}...${scammer.identifier.slice(-6)}`
                            : scammer.identifier}
                        </h2>
                        <ThreatBadge confirmCount={scammer.totalConfirms} size="md" />
                      </div>

                      {scammer.roastTitle && (
                        <p className="roast-title text-lg mb-2 animate-gold-shimmer text-transparent bg-clip-text">
                          {scammer.roastTitle}
                        </p>
                      )}

                      <div className="flex gap-4 text-sm text-[var(--foreground-muted)]">
                        <span>
                          <strong className="text-[var(--red-primary)]">
                            {scammer.totalConfirms}
                          </strong>{" "}
                          confirms
                        </span>
                        <span>
                          <strong>{scammer.reportCount}</strong> reports
                        </span>
                        <span>
                          Since {formatDistanceToNow(new Date(scammer.firstReportDate))}
                        </span>
                      </div>
                    </div>

                    {/* Trophy for top 3 */}
                    {index < 3 && (
                      <div className="text-4xl">
                        {index === 0 ? "\u{1F947}" : index === 1 ? "\u{1F948}" : "\u{1F949}"}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Shame message */}
        <div className="text-center mt-12">
          <ShameMessage />
        </div>
      </div>
    </div>
  );
}
