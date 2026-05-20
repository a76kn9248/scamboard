"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Roast {
  id: string;
  text: string;
  score: number;
  isWinner: boolean;
  createdAt: string;
  report: {
    id: string;
    identifier: string;
    type: string;
  };
}

interface UserRoastsListProps {
  nickname: string;
  userColor: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function UserRoastsList({ nickname, userColor }: UserRoastsListProps) {
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [wins, setWins] = useState(0);

  useEffect(() => {
    fetch(`/api/users/${nickname}/roasts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.roasts) {
          setRoasts(data.roasts);
          setTotal(data.total || data.roasts.length);
          setWins(data.wins || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nickname]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (roasts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <span className="text-4xl mb-4 block">🏆</span>
        <p className="text-[var(--text-muted)]">No roasts submitted yet.</p>
        <p className="text-[var(--text-muted)] text-sm mt-2">
          Roasts are funny titles suggested for scammers. The community votes on the best one!
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>🏆</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Roasts by @{nickname}
        </span>
        <span className="bg-[var(--border)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded-full font-mono">
          {total}
        </span>
        {wins > 0 && (
          <span className="bg-[var(--gold)] text-black text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">
            🥇 {wins} wins
          </span>
        )}
      </div>

      <div className="divide-y divide-[var(--border)]">
        {roasts.map((roast) => (
          <Link
            key={roast.id}
            href={`/report/${roast.report.id}`}
            className="block p-4 hover:bg-[var(--surface)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                  roast.isWinner
                    ? "bg-[var(--gold)] text-black"
                    : "bg-[var(--surface)] border border-[var(--border)]"
                }`}
              >
                {roast.isWinner ? "👑" : "🔥"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                  <span className="font-mono">
                    {roast.report.type === "twitter" ? "@" : ""}{roast.report.identifier.slice(0, 12)}...
                  </span>
                  <span>·</span>
                  <span>{formatTimeAgo(new Date(roast.createdAt))}</span>
                  {roast.isWinner && (
                    <span className="text-[var(--gold)] font-bold">★ WINNER</span>
                  )}
                </div>

                <p className="text-[var(--text)] text-sm font-medium">
                  &ldquo;{roast.text}&rdquo;
                </p>

                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className={roast.score > 0 ? "text-[var(--green)]" : "text-[var(--text-muted)]"}>
                    ▲ {roast.score} votes
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
