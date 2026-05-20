"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalScammers: number;
  totalReports: number;
  totalConfirms: number;
  totalComments: number;
  totalUsers: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center gap-8 py-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="skeleton w-16 h-8 mb-1 mx-auto" />
            <div className="skeleton w-20 h-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: "Scammers Reported", value: stats.totalScammers, icon: "\u{2620}" },
    { label: "Total Confirms", value: stats.totalConfirms, icon: "\u{1F525}" },
    { label: "Comments", value: stats.totalComments, icon: "\u{1F4AC}" },
    { label: "Watchdogs", value: stats.totalUsers, icon: "\u{1F43A}" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-12 py-4 px-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
      {statItems.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            <span className="mr-2">{item.icon}</span>
            {item.value.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
