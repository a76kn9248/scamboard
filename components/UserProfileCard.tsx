"use client";

import Link from "next/link";
import XPBar from "./XPBar";

interface UserProfileCardProps {
  nickname: string;
  bio?: string | null;
  profileColor?: string | null;
  title?: string | null;
  xp?: number;
  stats?: {
    reports: number;
    confirms: number;
    comments: number;
    roasts?: number;
    roastWins?: number;
  };
  compact?: boolean;
  linkToProfile?: boolean;
}

export default function UserProfileCard({
  nickname,
  bio,
  profileColor = "#ff1744",
  title = "Fresh Degen",
  xp = 0,
  stats,
  compact = false,
  linkToProfile = true,
}: UserProfileCardProps) {
  const content = (
    <div
      className={`bg-[var(--background-card)] rounded-lg border-2 p-4 transition-all ${
        linkToProfile ? "hover:bg-[var(--background-tertiary)] cursor-pointer" : ""
      }`}
      style={{ borderColor: profileColor || "#ff1744" }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar placeholder with profile color */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
          style={{ backgroundColor: `${profileColor}33`, color: profileColor || "#ff1744" }}
        >
          {nickname.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[var(--foreground)] truncate">
              {nickname}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${profileColor}22`,
                color: profileColor || "#ff1744",
                border: `1px solid ${profileColor}44`,
              }}
            >
              {title}
            </span>
          </div>

          {!compact && bio && (
            <p className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2">
              {bio}
            </p>
          )}

          {!compact && (
            <div className="mt-2">
              <XPBar xp={xp} title={title || "Fresh Degen"} size="sm" showDetails={false} />
            </div>
          )}
        </div>
      </div>

      {!compact && stats && (
        <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--border)]">
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--red-primary)]">
              {stats.reports}
            </div>
            <div className="text-xs text-[var(--foreground-muted)]">Reports</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--orange-primary)]">
              {stats.confirms}
            </div>
            <div className="text-xs text-[var(--foreground-muted)]">Confirms</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--green-primary)]">
              {stats.comments}
            </div>
            <div className="text-xs text-[var(--foreground-muted)]">Comments</div>
          </div>
          {stats.roastWins !== undefined && stats.roastWins > 0 && (
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--gold-primary)]">
                {stats.roastWins}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Roast Wins</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (linkToProfile) {
    return <Link href={`/profile/${nickname}`}>{content}</Link>;
  }

  return content;
}
