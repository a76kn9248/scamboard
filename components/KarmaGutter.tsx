"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

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
  onVote,
}: KarmaGutterProps) {
  const { data: session } = useSession();
  const [voted, setVoted] = useState<"up" | "down" | null>(initialVoted);
  const [currentScore, setCurrentScore] = useState(score);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (direction: "up" | "down") => {
    if (!session) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (direction === "up") {
        // Confirm the report
        const res = await fetch(`/api/reports/${reportId}/confirm`, {
          method: "POST",
        });

        if (res.ok) {
          if (voted === "up") {
            // Unvote
            setVoted(null);
            setCurrentScore(currentScore - 1);
          } else {
            // Vote up (and remove down if present)
            const adjustment = voted === "down" ? 2 : 1;
            setVoted("up");
            setCurrentScore(currentScore + adjustment);
          }
        }
      } else {
        // Dispute the report
        const res = await fetch(`/api/reports/${reportId}/dispute`, {
          method: "POST",
        });

        if (res.ok) {
          if (voted === "down") {
            // Unvote
            setVoted(null);
            setCurrentScore(currentScore + 1);
          } else {
            // Vote down (and remove up if present)
            const adjustment = voted === "up" ? -2 : -1;
            setVoted("down");
            setCurrentScore(currentScore + adjustment);
          }
        }
      }

      onVote?.(direction);
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPositive = currentScore > 0;

  return (
    <div className="flex flex-col items-center gap-1 bg-[var(--bg)] py-2 px-1 border-r border-[var(--border)]">
      {/* Up arrow */}
      <button
        onClick={() => handleVote("up")}
        disabled={!session || isSubmitting}
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
        disabled={!session || isSubmitting}
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
