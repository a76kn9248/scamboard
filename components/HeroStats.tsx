"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalScammers: number;
  confirmsToday: number;
  lpSaved: string;
  activeWatchdogs: number;
}

export default function HeroStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalScammers: data.totalScammers || 0,
          confirmsToday: data.confirmsToday || 0,
          lpSaved: data.lpSaved || "$0",
          activeWatchdogs: data.activeWatchdogs || 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Scammers logged",
      value: stats?.totalScammers.toLocaleString() || "0",
      colorClass: "text-[var(--red)]",
    },
    {
      label: "Confirms / 24h",
      value: stats?.confirmsToday.toLocaleString() || "0",
      colorClass: "text-[var(--gold)]",
    },
    {
      label: "LP saved (est.)",
      value: stats?.lpSaved || "$0",
      colorClass: "text-[var(--green)]",
    },
    {
      label: "Active watchdogs",
      value: stats?.activeWatchdogs.toLocaleString() || "0",
      colorClass: "text-[var(--cyan)]",
    },
  ];

  return (
    <div className="flex gap-3">
      {statCards.map((stat, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-b from-[#1f1817] to-[var(--surface)] border border-[var(--border)] rounded-[10px] p-3"
        >
          <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
            {stat.label}
          </div>
          {loading ? (
            <div className="skeleton h-7 w-16 mt-1 rounded" />
          ) : (
            <div className={`font-display text-[22px] font-black mt-1 tracking-tight ${stat.colorClass}`}>
              {stat.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
