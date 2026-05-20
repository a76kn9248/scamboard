"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Watchdog {
  nickname: string;
  color: string;
  title: string;
  xp: number;
  mood?: string;
}

interface TopWatchdogsLeaderboardProps {
  limit?: number;
  showFull?: boolean;
}

export default function TopWatchdogsLeaderboard({ limit = 5 }: TopWatchdogsLeaderboardProps) {
  const [watchdogs, setWatchdogs] = useState<Watchdog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch top users from leaderboard API with type=watchdogs
    fetch(`/api/leaderboard?type=watchdogs&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        // API returns topUsers array with color field
        const users = data.topUsers || data.watchdogs || [];
        setWatchdogs(users);
        setLoading(false);
      })
      .catch(() => {
        setWatchdogs([]);
        setLoading(false);
      });
  }, [limit]);

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-[var(--border)]">
          <span className="font-display font-black text-[12px] text-[var(--text)]">
            {"\u{1F6E1}"} Top watchdogs {"\u00B7"} this week
          </span>
        </div>
        <div className="p-3 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-[var(--border)]">
        <span className="font-display font-black text-[12px] text-[var(--text)]">
          {"\u{1F6E1}"} Top watchdogs {"\u00B7"} this week
        </span>
      </div>
      <div className="p-3">
        {watchdogs.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] text-xs py-4">
            No watchdogs yet. Start reporting!
          </div>
        ) : (
          watchdogs.map((watchdog, index) => (
            <Link
              key={watchdog.nickname}
              href={`/profile/${watchdog.nickname}`}
              className="flex items-center gap-2.5 py-1.5 border-b border-dashed border-[var(--border)] last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <span className="font-display font-black text-[var(--text-muted)] w-3.5 text-center">
                {index + 1}
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-black text-[12px] text-white"
                style={{ background: watchdog.color }}
              >
                {watchdog.nickname[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-bold text-[12px] truncate"
                  style={{ color: watchdog.color }}
                >
                  @{watchdog.nickname}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {watchdog.title}
                  {watchdog.mood && (
                    <span className="italic"> {"\u00B7"} mood: {watchdog.mood}</span>
                  )}
                </div>
              </div>
              <div className="font-display font-black text-[12px] text-[var(--gold)]">
                {watchdog.xp.toLocaleString()}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
