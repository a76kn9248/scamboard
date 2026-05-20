"use client";

import { getThreatLevel, type ThreatLevel } from "@/lib/threat-levels";

interface ThreatBadgeProps {
  confirmCount: number;
  showFire?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ThreatBadge({
  confirmCount,
  showFire = true,
  size = "md",
}: ThreatBadgeProps) {
  const threatInfo = getThreatLevel(confirmCount);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  const threatClasses: Record<ThreatLevel, string> = {
    LOW: "threat-low",
    MEDIUM: "threat-medium",
    HIGH: "threat-high",
    EXTREME: "threat-extreme",
    LEGENDARY: "threat-legendary",
  };

  return (
    <span
      className={`badge ${threatClasses[threatInfo.level]} ${sizeClasses[size]} ${
        threatInfo.animated ? "animate-legendary-glow" : ""
      }`}
    >
      {showFire && threatInfo.fireEmojis && (
        <span className="mr-1">{threatInfo.fireEmojis}</span>
      )}
      {threatInfo.level}
    </span>
  );
}
