"use client";

import { getThreatLevel, type ThreatLevel } from "@/lib/threat-levels";

interface ThreatBadgeProps {
  confirmCount: number;
  showFire?: boolean;
  size?: "sm" | "md" | "lg";
  showTier?: boolean;
}

export default function ThreatBadge({
  confirmCount,
  showFire = true,
  size = "md",
  showTier = false,
}: ThreatBadgeProps) {
  const threatInfo = getThreatLevel(confirmCount);
  const isLegendary = threatInfo.level === "LEGENDARY";

  // Size-specific styles
  const sizeStyles = {
    sm: "text-[9px] px-2 py-[2px]",
    md: "text-[10px] px-2 py-[2px]",
    lg: "text-[12px] px-3 py-1",
  };

  // Tier number based on threat level
  const tierNumber: Record<ThreatLevel, string> = {
    LOW: "1",
    MEDIUM: "2",
    HIGH: "3",
    EXTREME: "4",
    LEGENDARY: "5",
  };

  return (
    <span
      className={`
        threat-sticker ${threatInfo.level}
        ${sizeStyles[size]}
        ${isLegendary ? "" : ""}
      `}
      style={{
        color: threatInfo.color,
        background: threatInfo.bgColor,
        borderColor: threatInfo.color,
        boxShadow: isLegendary ? `0 0 12px ${threatInfo.glowColor}` : `2px 2px 0 #14100f`,
      }}
    >
      {showFire && threatInfo.fireEmojis && (
        <span>{threatInfo.fireEmojis}</span>
      )}
      <span>{threatInfo.level}</span>
      {showTier && (
        <span className="opacity-70">
          {" "}
          {"\u00B7"} TIER {tierNumber[threatInfo.level]}
        </span>
      )}
    </span>
  );
}
