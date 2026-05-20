"use client";

import { getScammerAvatar } from "@/lib/scammer-avatar";

interface ScammerAvatarProps {
  identifier: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function ScammerAvatar({
  identifier,
  size = "md",
  className = "",
}: ScammerAvatarProps) {
  const { emoji, bgColor } = getScammerAvatar(identifier);

  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
    xl: "w-24 h-24 text-5xl",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {emoji}
    </div>
  );
}
