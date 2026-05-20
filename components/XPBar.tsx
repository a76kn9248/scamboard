"use client";

import { getNextTitleThreshold, TITLE_THRESHOLDS } from "@/lib/xp";

interface XPBarProps {
  xp: number;
  title: string;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function XPBar({
  xp,
  title,
  showDetails = true,
  size = "md",
}: XPBarProps) {
  const nextThreshold = getNextTitleThreshold(xp);

  const heightClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  // If at max level
  if (!nextThreshold) {
    return (
      <div className="space-y-1">
        {showDetails && (
          <div className="flex justify-between text-xs">
            <span className="text-[var(--gold-primary)] font-bold">{title}</span>
            <span className="text-[var(--foreground-muted)]">{xp} XP - MAX LEVEL</span>
          </div>
        )}
        <div className={`xp-bar ${heightClasses[size]}`}>
          <div
            className="xp-bar-fill"
            style={{
              width: "100%",
              background: "linear-gradient(90deg, var(--gold-primary), #fff176)",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {showDetails && (
        <div className="flex justify-between text-xs">
          <span className="text-[var(--green-primary)] font-medium">{title}</span>
          <span className="text-[var(--foreground-muted)]">
            {xp} XP / {nextThreshold.xpNeeded + xp} ({nextThreshold.nextTitle})
          </span>
        </div>
      )}
      <div className={`xp-bar ${heightClasses[size]}`}>
        <div
          className="xp-bar-fill"
          style={{ width: `${nextThreshold.progress}%` }}
        />
      </div>
    </div>
  );
}
