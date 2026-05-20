"use client";

import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  label: string;
  emoji: string;
  color: "gold" | "red" | "green" | "purple" | "cyan";
  earned: boolean;
  earnedAt?: string;
}

interface Sticker {
  text: string;
  colorClass: "gold" | "red" | "green" | "purple" | "cyan";
}

interface AchievementStickersProps {
  nickname?: string;
  stickers?: Sticker[];
  showAll?: boolean;
}

const colorMap = {
  gold: { color: "#ffc547", bg: "#2a2010" },
  red: { color: "#ff3b6c", bg: "#2c1418" },
  green: { color: "#6ce28a", bg: "#102a1c" },
  purple: { color: "#b58aff", bg: "#1f1430" },
  cyan: { color: "#5cd0e2", bg: "#0f2028" },
};

export default function AchievementStickers({
  nickname,
  stickers: propStickers,
  showAll = false,
}: AchievementStickersProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(!propStickers && !!nickname);

  useEffect(() => {
    if (nickname && !propStickers) {
      fetchAchievements();
    }
  }, [nickname, propStickers]);

  const fetchAchievements = async () => {
    try {
      const res = await fetch(`/api/users/${nickname}/achievements`);
      const data = await res.json();

      if (res.ok) {
        setAchievements(showAll ? data.allAchievements : data.achievements);
      }
    } catch (err) {
      console.error("Error fetching achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  // If using prop stickers (legacy format)
  if (propStickers) {
    return (
      <div className="border-t border-dashed border-[var(--border)] py-3 px-4 flex flex-wrap gap-1.5">
        {propStickers.map((sticker, index) => {
          const colors = colorMap[sticker.colorClass];
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-0.5 font-display font-black text-[9px] rounded border-[1.5px] border-current uppercase tracking-wide"
              style={{
                color: colors.color,
                background: colors.bg,
                transform: `rotate(${index % 2 === 0 ? -2 : 1}deg)`,
              }}
            >
              {sticker.text}
            </span>
          );
        })}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-t border-dashed border-[var(--border)] py-3 px-4 text-center text-[var(--text-muted)] text-sm">
        Loading achievements...
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="border-t border-dashed border-[var(--border)] py-3 px-4 text-center text-[var(--text-muted)] text-sm">
        No achievements yet
      </div>
    );
  }

  return (
    <div className="border-t border-dashed border-[var(--border)] py-3 px-4 flex flex-wrap gap-1.5">
      {achievements.map((achievement, index) => {
        const colors = colorMap[achievement.color];
        return (
          <span
            key={achievement.id}
            className={`inline-flex items-center gap-1 px-2 py-0.5 font-display font-black text-[9px] rounded border-[1.5px] border-current uppercase tracking-wide ${!achievement.earned ? "opacity-30" : ""}`}
            style={{
              color: colors.color,
              background: colors.bg,
              transform: `rotate(${index % 2 === 0 ? -2 : 1}deg)`,
            }}
            title={achievement.earned ? `Earned: ${achievement.label}` : `Not yet earned: ${achievement.label}`}
          >
            {achievement.emoji} {achievement.label}
          </span>
        );
      })}
    </div>
  );
}
