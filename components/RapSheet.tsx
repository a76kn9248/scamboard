"use client";

import { useState, useEffect } from "react";

interface RapSheetItem {
  key: string;
  value: string;
  valueColor?: string;
}

interface RapSheetProps {
  identifier?: string;
  items?: RapSheetItem[];
}

export default function RapSheet({ identifier, items }: RapSheetProps) {
  const [stats, setStats] = useState<RapSheetItem[]>(items || []);
  const [loading, setLoading] = useState(!items && !!identifier);

  useEffect(() => {
    if (identifier && !items) {
      fetchStats();
    }
  }, [identifier, items]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/scammer/${encodeURIComponent(identifier!)}/stats`);
      const data = await res.json();

      if (res.ok) {
        const formattedStats: RapSheetItem[] = [
          {
            key: "first seen",
            value: new Date(data.firstSeen).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          },
          {
            key: "reports",
            value: String(data.reportCount),
            valueColor: "#ff3b6c",
          },
          {
            key: "total confirms",
            value: String(data.totalConfirms),
            valueColor: "#ff3b6c",
          },
          {
            key: "victims",
            value: String(data.victimCount),
            valueColor: "#ff3b6c",
          },
          {
            key: "chain(s)",
            value: data.chains.join(" · "),
          },
          {
            key: "evidence",
            value: String(data.evidenceCount),
          },
          {
            key: "linked wallets",
            value: String(data.linkedWalletCount),
          },
          {
            key: "status",
            value: data.status,
            valueColor:
              data.status === "active"
                ? "#ff3b6c"
                : data.status === "dormant"
                  ? "#ffc547"
                  : "#8a7d72",
          },
        ];

        setStats(formattedStats);
      }
    } catch (err) {
      console.error("Error fetching scammer stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
          <span>{"\u{1F4D1}"}</span>
          <span className="font-display font-black text-[14px] text-[var(--text)]">
            Rap sheet
          </span>
        </div>
        <div className="p-4 text-center text-[var(--text-muted)] text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>{"\u{1F4D1}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Rap sheet
        </span>
      </div>

      <div className="p-4 pt-1">
        {stats.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] text-sm py-4">
            No stats available
          </div>
        ) : (
          stats.map((item, index) => (
            <div
              key={index}
              className="flex items-baseline gap-2 py-2 border-b border-dashed border-[var(--border)] last:border-b-0 text-[12px]"
            >
              <span className="text-[var(--text-muted)] uppercase text-[11px] tracking-wide flex-shrink-0 w-[100px]">
                {item.key}
              </span>
              <span
                className="text-right flex-1 font-semibold"
                style={{ color: item.valueColor || "var(--text)" }}
              >
                {item.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
