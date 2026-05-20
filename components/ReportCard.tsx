"use client";

import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import ThreatBadge from "./ThreatBadge";
import ScammerAvatar from "./ScammerAvatar";
import BountyBadge from "./BountyBadge";
import { getThreatLevel } from "@/lib/threat-levels";

interface ReportCardProps {
  report: {
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
  };
}

function truncateIdentifier(identifier: string, type: string): string {
  if (type === "twitter") {
    return `@${identifier}`;
  }
  if (identifier.length > 16) {
    return `${identifier.slice(0, 8)}...${identifier.slice(-6)}`;
  }
  return identifier;
}

export default function ReportCard({ report }: ReportCardProps) {
  const threatInfo = getThreatLevel(report.confirmCount);

  return (
    <Link href={`/report/${report.id}`}>
      <div
        className={`card p-4 hover-glow transition-all cursor-pointer group ${
          threatInfo.animated ? "animate-border-glow" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Rank & Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`text-2xl font-black ${
                report.rank === 1
                  ? "text-[var(--gold-primary)]"
                  : report.rank === 2
                  ? "text-gray-300"
                  : report.rank === 3
                  ? "text-amber-600"
                  : "text-[var(--red-primary)]"
              }`}
            >
              #{report.rank}
            </div>
            <ScammerAvatar identifier={report.identifier} size="sm" />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Type badge */}
              <span
                className={`badge ${
                  report.type === "deployer" ? "badge-purple" : "badge-success"
                }`}
              >
                {report.type}
              </span>

              {/* Threat level */}
              <ThreatBadge confirmCount={report.confirmCount} size="sm" />

              {/* Bounty badge */}
              {report.bountyCount && report.bountyCount > 0 && (
                <BountyBadge count={report.bountyCount} />
              )}
            </div>

            {/* Identifier */}
            <div className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--red-primary)] transition-colors mb-1 truncate">
              {truncateIdentifier(report.identifier, report.type)}
            </div>

            {/* Roast Title */}
            {report.roastTitle && (
              <p className="roast-title text-sm mb-2 line-clamp-1">
                {report.roastTitle}
              </p>
            )}

            {/* Reason preview */}
            <p className="text-[var(--foreground-muted)] text-sm line-clamp-2 mb-3">
              {report.reason}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-[var(--foreground-dimmed)]">
              <Link
                href={`/profile/${report.authorNickname}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[var(--green-primary)] hover:underline"
              >
                @{report.authorNickname}
              </Link>
              <span>{formatDistanceToNow(new Date(report.createdAt))}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-[var(--red-primary)] text-lg font-bold">
                {threatInfo.fireEmojis || "\u{1F525}"} {report.confirmCount}
              </span>
            </div>
            <span className="text-xs text-[var(--foreground-dimmed)]">confirms</span>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[var(--foreground-muted)]">
                &#x1F4AC; {report.commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
