"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface KarmaGutterProps {
  reportId: string;
  score: number;
  rank: number;
  initialVoted?: "up" | "down" | null;
  onVote?: (direction: "up" | "down") => void;
}

export default function KarmaGutter({
  reportId,
  score,
  rank,
  initialVoted = null,
}: KarmaGutterProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [voted] = useState<"up" | "down" | null>(initialVoted);
  const [currentScore] = useState(score);

  const handleVote = (direction: "up" | "down") => {
    // Navigate to the report page where user can confirm/dispute with full context
    // This avoids the turnstile requirement issue for inline voting
    router.push(`/report/${reportId}#${direction === "up" ? "confirm" : "dispute"}`);
  };

  const isPositive = currentScore > 0;

  return (
    <div className="flex flex-col items-center gap-1 bg-[var(--bg)] py-2 px-1 border-r border-[var(--border)]">
      {/* Up arrow */}
      <button
        onClick={() => handleVote("up")}
        disabled={!session}
        className={`karma-arrow ${voted === "up" ? "voted-up" : ""}`}
        title={session ? "Confirm this report" : "Login to confirm"}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 4L16 12H12V16H8V12H4L10 4Z" />
        </svg>
      </button>

      {/* Score */}
      <span
        className={`font-display text-[13px] font-black ${
          isPositive ? "text-[var(--red)]" : "text-[var(--text)]"
        }`}
      >
        {currentScore}
      </span>

      {/* Down arrow */}
      <button
        onClick={() => handleVote("down")}
        disabled={!session}
        className={`karma-arrow ${voted === "down" ? "voted-down" : ""}`}
        title={session ? "Dispute this report" : "Login to dispute"}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 16L4 8H8V4H12V8H16L10 16Z" />
        </svg>
      </button>

      {/* Rank */}
      <span className="font-display text-[10px] text-[var(--text-muted)] mt-1 font-bold">
        #{rank}
      </span>
    </div>
  );
}
