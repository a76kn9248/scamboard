"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreatBadge from "./ThreatBadge";
import ScammerAvatar from "./ScammerAvatar";
import ShameMessage from "./ShameMessage";

interface LeaderboardEntry {
  rank: number;
  identifier: string;
  type: string;
  totalConfirms: number;
  reportCount: number;
  roastTitle: string | null;
  shameLocked: boolean;
  threatLevel: string;
  fireEmojis: string;
  animated: boolean;
  primaryReportId: string;
}

export default function TopTenBoard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="skeleton h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-[var(--foreground-muted)] mb-4">
          No scammers reported yet. Be the first watchdog!
        </p>
        <ShameMessage />
      </div>
    );
  }

  const formatIdentifier = (identifier: string, type: string) => {
    if (type === "twitter") {
      return `@${identifier}`;
    }
    if (identifier.length > 12) {
      return `${identifier.slice(0, 6)}...${identifier.slice(-4)}`;
    }
    return identifier;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {leaderboard.map((entry, index) => {
        const isFeatured = index === 0;

        return (
          <Link
            key={entry.identifier}
            href={`/scammer/${encodeURIComponent(entry.identifier)}`}
            className={`card p-4 hover-glow hover-scale transition-all ${
              isFeatured ? "featured-card md:col-span-2 lg:col-span-1" : ""
            } ${entry.animated ? "animate-border-glow" : ""}`}
            style={
              isFeatured
                ? {
                    borderColor: "var(--red-primary)",
                    boxShadow: "0 0 30px rgba(255, 23, 68, 0.3)",
                  }
                : {}
            }
          >
            {/* Rank Badge */}
            <div className="flex items-start justify-between mb-3">
              <div
                className={`text-3xl font-black ${
                  index === 0
                    ? "text-[var(--gold-primary)]"
                    : index === 1
                    ? "text-gray-300"
                    : index === 2
                    ? "text-amber-600"
                    : "text-[var(--red-primary)]"
                }`}
              >
                #{entry.rank}
              </div>
              <ThreatBadge confirmCount={entry.totalConfirms} size="sm" />
            </div>

            {/* Avatar & Identifier */}
            <div className="flex items-center gap-3 mb-3">
              <ScammerAvatar identifier={entry.identifier} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--foreground)] truncate">
                  {formatIdentifier(entry.identifier, entry.type)}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {entry.type === "twitter" ? "Twitter" : "Deployer"}
                </p>
              </div>
            </div>

            {/* Roast Title */}
            {entry.roastTitle && (
              <p className="roast-title text-sm mb-3 line-clamp-2">
                {entry.roastTitle}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--foreground-muted)]">
                {entry.fireEmojis} {entry.totalConfirms} confirms
              </span>
              <span className="text-[var(--foreground-dimmed)]">
                {entry.reportCount} report{entry.reportCount !== 1 ? "s" : ""}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
