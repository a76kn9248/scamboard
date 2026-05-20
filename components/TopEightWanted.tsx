"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreatBadge from "./ThreatBadge";
import { getThreatLevel } from "@/lib/threat-levels";

interface WantedEntry {
  rank: number;
  identifier: string;
  type: string;
  totalConfirms: number;
  reportCount: number;
  roastTitle: string | null;
  shameLocked: boolean;
  chain?: string;
  primaryReportId: string;
}

export default function TopEightWanted() {
  const [leaderboard, setLeaderboard] = useState<WantedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=8")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard?.slice(0, 8) || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatIdentifier = (identifier: string, type: string) => {
    if (type === "twitter") {
      return `@${identifier}`;
    }
    if (identifier.length > 12) {
      return `${identifier.slice(0, 6)}...${identifier.slice(-4)}`;
    }
    return identifier;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="skeleton h-40 rounded-[10px]" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        No scammers reported yet. Be the first watchdog!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {leaderboard.map((entry) => {
        const threatInfo = getThreatLevel(entry.totalConfirms);
        const isTop3 = entry.rank <= 3;

        return (
          <Link
            key={entry.identifier}
            href={`/scammer/${encodeURIComponent(entry.identifier)}`}
            className="card p-3 relative overflow-hidden cursor-pointer transition-all hover:translate-y-[-2px] hover:border-[var(--border-strong)]"
          >
            {/* Left accent bar */}
            <div
              className="absolute inset-y-0 left-0 w-1"
              style={{
                background: threatInfo.color,
                boxShadow: `0 0 16px ${threatInfo.color}66`,
              }}
            />

            {/* Header: rank + threat badge */}
            <div className="flex justify-between items-start mb-2">
              <span
                className={`font-display text-[28px] font-black leading-none tracking-tight ${
                  entry.rank === 1
                    ? "text-[var(--gold)]"
                    : entry.rank === 2
                    ? "text-gray-300"
                    : entry.rank === 3
                    ? "text-amber-600"
                    : "text-[var(--red)]"
                }`}
              >
                #{entry.rank}
              </span>
              <ThreatBadge confirmCount={entry.totalConfirms} size="sm" />
            </div>

            {/* Identifier */}
            <div className="font-mono text-[12px] text-[var(--text)] truncate">
              {formatIdentifier(entry.identifier, entry.type)}
            </div>

            {/* Type + chain */}
            <div className="text-[9px] uppercase text-[var(--text-muted)] tracking-wide mt-1">
              {entry.type} {entry.chain && `{"\u00B7"} ${entry.chain}`}
            </div>

            {/* Roast title */}
            {entry.roastTitle ? (
              <div className="text-[var(--gold)] italic text-[11px] mt-1.5 line-clamp-2 leading-tight min-h-[28px]">
                &quot;{entry.roastTitle}&quot;
              </div>
            ) : (
              <div className="text-[var(--text-faint)] text-[11px] mt-1.5 min-h-[28px]">
                {"\u2014"} no roast yet {"\u2014"}
              </div>
            )}

            {/* Footer: confirms + comments */}
            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="text-[var(--red)] font-bold">
                {threatInfo.fireEmojis || "\u00B7"} {entry.totalConfirms}
              </span>
              <span className="text-[var(--text-muted)]">
                {"\u{1F4AC}"} {entry.reportCount}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
