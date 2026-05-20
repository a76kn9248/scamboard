"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserData {
  nickname: string;
  title: string;
  profileColor: string;
  xp: number;
  reports: number;
  confirms: number;
  roastsWon: number;
  mood?: string;
}

export default function MyProfileCard() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          setUserData({
            nickname: data.nickname || session.user.name || "anonymous",
            title: data.title || "Fresh Degen",
            profileColor: data.profileColor || "#ff3b9a",
            xp: data.xp || 0,
            reports: data.reportCount || 0,
            confirms: data.confirmCount || 0,
            roastsWon: data.roastsWon || 0,
            mood: data.mood || "vibing",
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.name]);

  if (status === "loading" || loading) {
    return (
      <div className="card overflow-hidden">
        <div className="skeleton h-14" />
        <div className="p-3 space-y-2">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!session || !userData) {
    return (
      <div className="card overflow-hidden p-4 text-center">
        <p className="text-[var(--text-muted)] text-[12px] mb-3">
          Sign in to track your watchdog stats
        </p>
        <Link href="/login" className="btn-primary text-[11px] py-1.5 px-4 inline-block">
          Login
        </Link>
      </div>
    );
  }

  const color = userData.profileColor;
  const xpProgress = Math.min((userData.xp / 5000) * 100, 100);

  return (
    <Link href="/profile" className="block">
      <div
        className="card overflow-hidden"
        style={{ borderColor: `${color}55` }}
      >
        {/* Banner */}
        <div
          className="h-14"
          style={{
            background: `
              radial-gradient(circle at 25% 30%, ${color}66 0%, transparent 45%),
              radial-gradient(circle at 80% 70%, rgba(92, 208, 226, 0.4) 0%, transparent 50%),
              linear-gradient(135deg, ${color}22, var(--bg))
            `,
          }}
        />

        {/* Profile row */}
        <div className="flex items-center gap-3 px-3.5 -mt-8">
          <div
            className="w-14 h-14 rounded-full border-[3px] border-[var(--surface)] flex items-center justify-center font-display font-black text-[24px] text-white"
            style={{ background: color }}
          >
            {userData.nickname[0].toUpperCase()}
          </div>
          <div>
            <div className="font-display font-black text-[14px] text-[var(--text)]">
              @{userData.nickname}
            </div>
            <div className="text-[11px] font-bold" style={{ color }}>
              {userData.title}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mx-3.5 mt-2.5">
          <div className="xp-bar">
            <div
              className="xp-bar-fill"
              style={{
                width: `${xpProgress}%`,
                background: `linear-gradient(90deg, ${color}, var(--gold))`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
            <span>{userData.xp.toLocaleString()} XP</span>
            <span>next: Sentinel (5,000)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-0 px-3.5 py-3 text-center">
          <div>
            <div className="font-display font-black text-[16px] text-[var(--red)]">
              {userData.reports}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">
              reports
            </div>
          </div>
          <div>
            <div className="font-display font-black text-[16px] text-[var(--gold)]">
              {userData.confirms}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">
              confirms
            </div>
          </div>
          <div>
            <div className="font-display font-black text-[16px] text-[var(--green)]">
              {userData.roastsWon}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">
              roasts won
            </div>
          </div>
        </div>

        {/* Mood */}
        {userData.mood && (
          <div className="px-3.5 py-2 border-t border-dashed border-[var(--border)] text-[11px] text-[var(--text-secondary)] italic">
            <b style={{ color, fontStyle: "normal" }}>current mood:</b>{" "}
            {userData.mood} {"\u{1F5E1}"} {"\u00A0"}{"\u00B7"}{"\u00A0"}{" "}
            <b style={{ color, fontStyle: "normal" }}>online:</b> now
          </div>
        )}
      </div>
    </Link>
  );
}
