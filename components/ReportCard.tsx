"use client";

import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import ThreatBadge from "./ThreatBadge";
import KarmaGutter from "./KarmaGutter";
import { getThreatLevel } from "@/lib/threat-levels";

interface ReportCardProps {
  report: {
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
    userVote?: "up" | "down" | null;
  };
  compact?: boolean;
}

function truncateIdentifier(identifier: string, type: string): string {
  if (type === "twitter") {
    return `@${identifier}`;
  }
  if (identifier.length > 20) {
    return `${identifier.slice(0, 12)}...${identifier.slice(-8)}`;
  }
  return identifier;
}

export default function ReportCard({ report, compact = false }: ReportCardProps) {
  const threatInfo = getThreatLevel(report.confirmCount);
  const authorColor = report.authorColor || "#ff3b9a";
  const subscammer = report.subscammer || (report.type === "twitter" ? "twitterscams" : "rugpulls");

  return (
    <div className="card overflow-hidden mb-2 hover:border-[var(--border-hover)] transition-all group">
      {/* Left accent in author's color */}
      <div
        className="absolute inset-y-0 left-0 w-[3px] transition-all group-hover:brightness-115"
        style={{
          background: authorColor,
          boxShadow: `0 0 12px ${authorColor}88`,
        }}
      />

      <div className="grid grid-cols-[48px_1fr] gap-0">
        {/* Karma Gutter */}
        <KarmaGutter
          reportId={report.id}
          score={report.confirmCount}
          rank={report.rank}
          initialVoted={report.userVote || null}
        />

        {/* Main Content */}
        <Link href={`/report/${report.id}`} className="block">
          <div className="p-3 pl-4">
            {/* Meta header */}
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-1.5 flex-wrap">
              <span className="font-display font-bold text-[var(--text-secondary)] hover:text-[var(--red)]">
                r/{subscammer}
              </span>
              <span className="text-[var(--text-faint)]">{"\u00B7"}</span>
              <span>posted {formatDistanceToNow(new Date(report.createdAt))} by</span>

              {/* Author chip */}
              <span
                className="author-chip"
                style={{
                  background: `${authorColor}22`,
                  color: authorColor,
                  border: `1px solid ${authorColor}44`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: authorColor }}
                />
                @{report.authorNickname}
                {report.authorTitle && (
                  <span className="opacity-70 font-normal">
                    {" "}{"\u00B7"} {report.authorTitle}
                  </span>
                )}
              </span>

              <span className="text-[var(--text-faint)]">{"\u00B7"}</span>
              <span>chain {report.chain || "ETH"}</span>

              {/* Right side: flairs + threat badge */}
              <span className="ml-auto flex items-center gap-1.5">
                <span className={`flair flair-${report.type}`}>{report.type}</span>
                <ThreatBadge confirmCount={report.confirmCount} size="sm" />
                {report.bountyCount && report.bountyCount > 0 && (
                  <span className="flair flair-bounty">
                    {"\u{1F4B0}"} {report.bountyCount}
                  </span>
                )}
              </span>
            </div>

            {/* Title row: identifier + roast title */}
            <div className="font-display text-[17px] font-black tracking-tight text-[var(--text)] leading-tight mb-1.5 flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-[14px] font-semibold tracking-normal">
                {truncateIdentifier(report.identifier, report.type)}
              </span>
              {report.roastTitle && (
                <>
                  <span className="text-[var(--text-faint)]">{"\u2014"}</span>
                  <span className="roast-title font-display font-semibold">
                    {report.roastTitle}
                  </span>
                </>
              )}
            </div>

            {/* Reason text */}
            {!compact && (
              <p className="text-[var(--text-secondary)] text-[12.5px] leading-relaxed line-clamp-2 mb-2.5">
                {report.reason}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
              <span className="hover:text-[var(--text)] cursor-pointer">
                {"\u{1F4AC}"} {report.commentCount} comments
              </span>
              <span className="hover:text-[var(--text)] cursor-pointer">
                {"\u{1F4CE}"} evidence (3)
              </span>
              <span className="hover:text-[var(--text)] cursor-pointer">
                {"\u{1F4B0}"} add bounty
              </span>
              <span className="hover:text-[var(--text)] cursor-pointer">
                {"\u{1F525}"} roast it
              </span>
              <span className="hover:text-[var(--text)] cursor-pointer">
                {"\u{1F517}"} linked wallets (4)
              </span>
              <span className="hover:text-[var(--text)] cursor-pointer">
                {"\u2197"} share
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
