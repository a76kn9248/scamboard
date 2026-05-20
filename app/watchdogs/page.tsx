"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TopWatchdogsLeaderboard from "@/components/TopWatchdogsLeaderboard";
import ShameMessage from "@/components/ShameMessage";

interface Watchdog {
  nickname: string;
  profileColor: string;
  title: string;
  xp: number;
  stats: {
    reports: number;
    confirms: number;
    roastWins: number;
  };
}

export default function WatchdogsPage() {
  const [watchdogs, setWatchdogs] = useState<Watchdog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?type=watchdogs&limit=50")
      .then((res) => res.json())
      .then((data) => {
        setWatchdogs(data.watchdogs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-6xl mb-4 block">{"\u{1F43A}"}</span>
          <h1
            className="text-4xl md:text-5xl font-black text-[var(--green)] mb-4"
            style={{ fontFamily: "var(--font-display), var(--font-mono), monospace" }}
          >
            WATCHDOGS
          </h1>
          <p className="text-lg text-[var(--text-muted)] mb-6">
            The community&apos;s finest scam hunters.
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Earn XP by reporting scammers, confirming reports, and winning roast competitions.
          </p>
        </div>

        {/* Leaderboard */}
        <div className="mb-8">
          <TopWatchdogsLeaderboard limit={20} showFull />
        </div>

        {/* Empty state */}
        {!loading && watchdogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)] mb-6">
              No watchdogs have earned XP yet. Start hunting!
            </p>
            <Link href="/submit" className="btn-primary">
              Report a Scammer
            </Link>
          </div>
        )}

        {/* Shame message */}
        <div className="text-center mt-12">
          <ShameMessage />
        </div>
      </div>
    </div>
  );
}
