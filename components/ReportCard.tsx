"use client";

import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

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
  };
}

function getThreatLevel(confirms: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (confirms >= 20) {
    return {
      label: "EXTREME",
      color: "text-red-400",
      bgColor: "bg-red-500/20 border-red-500/50",
    };
  }
  if (confirms >= 10) {
    return {
      label: "HIGH",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20 border-orange-500/50",
    };
  }
  if (confirms >= 5) {
    return {
      label: "MEDIUM",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20 border-yellow-500/50",
    };
  }
  return {
    label: "LOW",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20 border-gray-500/50",
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
  const threat = getThreatLevel(report.confirmCount);

  return (
    <Link href={`/report/${report.id}`}>
      <div className="bg-[#0d0d12] border border-gray-800 hover:border-red-900/50 p-4 transition-all cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="text-2xl font-bold text-gray-700 font-mono w-8 text-right">
            #{report.rank}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {/* Type badge */}
              <span
                className={`px-2 py-0.5 text-xs font-mono uppercase ${
                  report.type === "deployer"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                }`}
              >
                {report.type}
              </span>

              {/* Threat level */}
              <span
                className={`px-2 py-0.5 text-xs font-mono border ${threat.bgColor} ${threat.color}`}
              >
                {threat.label}
              </span>
            </div>

            {/* Identifier */}
            <div className="text-lg font-mono text-white group-hover:text-red-400 transition-colors mb-2 truncate">
              {truncateIdentifier(report.identifier, report.type)}
            </div>

            {/* Reason preview */}
            <p className="text-gray-500 text-sm font-mono line-clamp-2 mb-3">
              {report.reason}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs font-mono text-gray-600">
              <span className="text-green-500">@{report.authorNickname}</span>
              <span>{formatDistanceToNow(new Date(report.createdAt))}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-mono text-lg font-bold">
                {report.confirmCount}
              </span>
              <span className="text-gray-600 text-xs font-mono">CONFIRMS</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 font-mono">
                {report.commentCount}
              </span>
              <span className="text-gray-600 text-xs font-mono">COMMENTS</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
