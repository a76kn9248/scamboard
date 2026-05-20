"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TopRoast {
  text: string;
  authorNickname: string;
  authorColor: string;
  targetIdentifier: string;
  voteCount: number;
}

export default function RoastOfTheWeek() {
  const [roast, setRoast] = useState<TopRoast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch from API
    // For now, use mock data
    setRoast({
      text: "Schr\u00F6dinger's Locked LP",
      authorNickname: "etherdetective",
      authorColor: "#7c5cff",
      targetIdentifier: "0x77ab...e211",
      voteCount: 412,
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-[var(--border)]">
          <span className="font-display font-black text-[12px] text-[var(--text)]">
            {"\u2728"} Roast of the week
          </span>
        </div>
        <div className="p-4">
          <div className="skeleton h-12 rounded" />
        </div>
      </div>
    );
  }

  if (!roast) {
    return null;
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-[var(--border)]">
        <span className="font-display font-black text-[12px] text-[var(--text)]">
          {"\u2728"} Roast of the week
        </span>
      </div>
      <div
        className="p-[18px] text-center"
        style={{
          background: "radial-gradient(circle at center, rgba(255, 197, 71, 0.1), transparent 60%)",
        }}
      >
        <div className="font-display font-black text-[18px] text-[var(--gold)] italic tracking-tight leading-tight">
          &quot;{roast.text}&quot;
        </div>
        <div className="text-[var(--text-muted)] text-[11px] mt-2">
          by{" "}
          <Link
            href={`/profile/${roast.authorNickname}`}
            style={{ color: roast.authorColor }}
            className="font-bold hover:underline"
          >
            @{roast.authorNickname}
          </Link>{" "}
          {"\u00B7"} on{" "}
          <span className="font-mono">{roast.targetIdentifier}</span> {"\u00B7"}{" "}
          {roast.voteCount} {"\u2B50"}
        </div>
      </div>
    </div>
  );
}
