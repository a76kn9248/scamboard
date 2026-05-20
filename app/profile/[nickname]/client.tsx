"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import MoodWidget from "@/components/MoodWidget";
import ThemeSongPlayer from "@/components/ThemeSongPlayer";
import AchievementStickers from "@/components/AchievementStickers";
import Top8Watchdogs from "@/components/Top8Watchdogs";
import Wall from "@/components/Wall";
import ProfileCustomizer from "@/components/ProfileCustomizer";

interface UserProfile {
  nickname: string;
  bio: string | null;
  profileColor: string | null;
  title: string | null;
  xp: number;
  mood?: string;
  currentlyDoing?: string;
  specialty?: string;
  themeSongUrl?: string;
  themeSongLabel?: string;
  nextTitleProgress: {
    nextTitle: string;
    xpNeeded: number;
    progress: number;
  } | null;
  createdAt: string;
  stats: {
    reports: number;
    confirms: number;
    comments: number;
    roasts: number;
    roastWins: number;
  };
}

export default function UserProfileClient({ nickname }: { nickname: string }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  const isOwnProfile = session?.user?.name === nickname;

  useEffect(() => {
    fetch(`/api/users/${nickname}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setProfile(null);
        } else {
          setProfile(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nickname]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="skeleton h-[220px]" />
        <div className="max-w-[1280px] mx-auto px-[22px] py-5 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 -mt-20">
          <div className="skeleton h-[500px] rounded-[12px]" />
          <div className="space-y-4">
            <div className="skeleton h-12 rounded-[10px]" />
            <div className="skeleton h-40 rounded-[10px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <span className="text-6xl mb-4 block">{"\u{1F47B}"}</span>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-4">User Not Found</h1>
          <p className="text-[var(--text-muted)] mb-6">
            This watchdog doesn&apos;t exist. Maybe they got rugged too?
          </p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const color = profile.profileColor || "#ff3b9a";
  const xpProgress = profile.nextTitleProgress?.progress || Math.min((profile.xp / 5000) * 100, 100);

  const tabs = [
    { id: "about", label: "\u{1F4CB} About" },
    { id: "stats", label: "\u{1F4CA} Stats" },
    { id: "reports", label: `\u{1F3AF} Reports \u00B7 ${profile.stats.reports}` },
    { id: "wall", label: "\u{1F4AC} Wall" },
    { id: "roasts", label: `\u{1F3C6} Roasts \u00B7 ${profile.stats.roastWins}` },
    ...(isOwnProfile ? [{ id: "customize", label: "\u2699 Customize" }] : []),
  ];

  const memberSince = new Date(profile.createdAt);
  const memberSinceText = `${memberSince.toLocaleString("en-US", { month: "short" })} ${memberSince.getFullYear()}`;

  return (
    <div className="min-h-screen" style={{ "--usercolor": color } as React.CSSProperties}>
      {/* Breadcrumb nav */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] px-[22px] py-2.5 flex items-center gap-3.5 text-[12px] text-[var(--text-muted)]">
        <Link href="/" style={{ color }} className="hover:underline">
          {"\u2190"} back to feed
        </Link>
        <span className="text-[var(--text-faint)]">/</span>
        <span className="text-[var(--text-secondary)]">watchdogs</span>
        <span className="text-[var(--text-faint)]">/</span>
        <span className="text-[var(--text)]">@{nickname}</span>
        <span className="ml-auto text-[var(--text-muted)]">
          this profile is themed by its owner {"\u00B7"}{" "}
          <span style={{ color }} className="cursor-pointer hover:underline">
            change skin
          </span>
        </span>
      </div>

      {/* Banner */}
      <div
        className="h-[220px] relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, ${color}66 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(255, 197, 71, 0.27) 0%, transparent 45%),
            repeating-linear-gradient(45deg, #1a1413 0 14px, #14100f 14px 28px)
          `,
        }}
      >
        {/* Watermark */}
        <div
          className="absolute top-[30px] right-[40px] font-display font-black text-[140px] leading-none tracking-[-6px] pointer-events-none select-none"
          style={{
            color: `${color}11`,
            transform: "rotate(-6deg)",
          }}
        >
          {nickname.toUpperCase().split(".")[0]}
        </div>

        {/* Gradient fade */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 60%, #14100f)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-[22px] pb-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-[22px] -mt-[90px] relative z-10">
        {/* Identity Card (left column) */}
        <div
          className="rounded-[12px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #1a1413, #14100f)",
            border: `2px solid ${color}`,
            boxShadow: `0 0 30px ${color}33`,
          }}
        >
          {/* Avatar + Name block */}
          <div className="px-[18px] pt-[22px] pb-[14px] text-center">
            <div
              className="w-[120px] h-[120px] rounded-full mx-auto flex items-center justify-center font-display font-black text-[56px] text-white"
              style={{
                background: color,
                border: "3px solid #14100f",
                boxShadow: `0 0 0 3px ${color}, 0 0 40px ${color}99`,
              }}
            >
              {nickname[0].toUpperCase()}
            </div>

            <div className="font-display font-black text-[22px] text-[#f5e7d8] mt-3 tracking-[-0.3px]">
              {nickname.split(".")[0]}
            </div>
            <div className="text-[12px] font-bold mt-0.5" style={{ color }}>
              @{nickname}
            </div>

            <div className="mt-2.5">
              <span
                className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full"
                style={{
                  background: `${color}22`,
                  color,
                  border: `1px solid ${color}66`,
                }}
              >
                {profile.title || "Fresh Degen"}
              </span>
            </div>

            <div className="text-[10px] text-[var(--green)] mt-2 flex items-center justify-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse-dot"
                style={{ boxShadow: "0 0 6px var(--green)" }}
              />
              online {"\u00B7"} last seen 2m ago
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 px-3.5 pb-3.5">
            <button
              className="flex-1 py-[7px] px-2 text-[11px] font-bold rounded-md"
              style={{
                background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                border: `1px solid ${color}`,
                color: "#fff",
              }}
            >
              + watch
            </button>
            <button className="flex-1 py-[7px] px-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-bold rounded-md">
              message
            </button>
            <button className="w-10 py-[7px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-bold rounded-md">
              {"\u2605"}
            </button>
          </div>

          {/* Mood widget */}
          <MoodWidget
            mood={profile.mood || "vibing"}
            currentlyDoing={profile.currentlyDoing}
            specialty={profile.specialty}
            chainMain="SOL \u00B7 ETH"
            memberSince={memberSinceText}
            userColor={color}
            editable={isOwnProfile}
          />

          {/* Theme song */}
          <ThemeSongPlayer
            songUrl={profile.themeSongUrl}
            songLabel={profile.themeSongLabel}
            userColor={color}
            editable={isOwnProfile}
          />

          {/* Achievement stickers */}
          <AchievementStickers nickname={nickname} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-1.5 flex gap-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-[7px] px-3.5 rounded-md text-[12px] font-bold cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? ""
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
                style={
                  activeTab === tab.id
                    ? { background: `${color}22`, color }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "about" && (
            <div className="space-y-4">
              {/* Bio block */}
              <div
                className="rounded-[12px] p-[22px] border"
                style={{
                  background: `linear-gradient(180deg, ${color}11, #1a1413)`,
                  borderColor: `${color}55`,
                }}
              >
                <h2
                  className="font-display font-black text-[18px] tracking-[-0.3px] mb-2"
                  style={{ color }}
                >
                  About me, <em className="text-[var(--gold)]">I guess.</em>
                </h2>
                {profile.bio ? (
                  <div className="text-[var(--text)] text-[13px] leading-relaxed">
                    {profile.bio.split("\n").map((paragraph, i) => (
                      <p key={i} className="mb-2.5 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)] text-[13px]">
                    No bio yet. {isOwnProfile && "Click \"Customize\" to add one!"}
                  </p>
                )}
                <div
                  className="font-mono font-bold mt-3.5 text-[13px]"
                  style={{ color }}
                >
                  {"\u2014"} {nickname} {"\u00B7"} est. {memberSinceText.split(" ")[1]} {"\u00B7"} {"\u2620"}
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { value: profile.stats.reports, label: "reports", color: "var(--red)", delta: "+3 this week" },
                  { value: profile.stats.confirms, label: "confirms", color: "var(--gold)", delta: "+88 this week" },
                  { value: profile.stats.roastWins, label: "roasts won", color: "var(--green)", delta: "+1 this week" },
                  { value: "98%", label: "confirm rate", color: "var(--cyan)", delta: "top 1%" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-3.5"
                  >
                    <div
                      className="font-display font-black text-[28px] tracking-[-1px] leading-none"
                      style={{ color: stat.color }}
                    >
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mt-1.5">
                      {stat.label}
                    </div>
                    <div className="text-[var(--green)] text-[10px] mt-1">
                      {stat.delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* XP block */}
              <div className="bg-[linear-gradient(180deg,#1a1413,#161110)] border border-[var(--border)] rounded-[10px] p-4">
                <div className="flex justify-between items-baseline text-[12px]">
                  <span style={{ color }} className="font-bold">
                    {"\u26CF"} {profile.title || "Fresh Degen"} {"\u00B7"} {profile.xp.toLocaleString()} XP
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {"\u2192"} {profile.nextTitleProgress?.nextTitle || "Sentinel"} ({profile.nextTitleProgress?.xpNeeded || 5000} XP)
                  </span>
                </div>
                <div className="h-[10px] bg-[var(--bg)] rounded-full mt-2 overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${xpProgress}%`,
                      background: `linear-gradient(90deg, ${color}, var(--gold))`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-[var(--text-muted)]">
                  <span>{profile.nextTitleProgress?.xpNeeded ? profile.nextTitleProgress.xpNeeded - profile.xp : 180} XP to next tier</span>
                  <span>+62 today</span>
                </div>
              </div>

              {/* Top 8 Watchdogs */}
              <Top8Watchdogs
                nickname={nickname}
                ownerNickname={nickname}
                editable={isOwnProfile}
                size="md"
              />
            </div>
          )}

          {activeTab === "wall" && (
            <Wall userNickname={nickname} userColor={color} />
          )}

          {activeTab === "stats" && (
            <div className="card p-6">
              <h2 className="font-display font-black text-[18px] text-[var(--text)] mb-4">
                Detailed Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Reports", value: profile.stats.reports, color: "var(--red)" },
                  { label: "Total Confirms", value: profile.stats.confirms, color: "var(--gold)" },
                  { label: "Comments", value: profile.stats.comments, color: "var(--cyan)" },
                  { label: "Roasts Submitted", value: profile.stats.roasts, color: "var(--purple)" },
                  { label: "Roast Wins", value: profile.stats.roastWins, color: "var(--green)" },
                  { label: "Total XP", value: profile.xp, color: "var(--gold)" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 text-center">
                    <div className="font-display font-black text-[32px]" style={{ color: stat.color }}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="card p-6 text-center text-[var(--text-muted)]">
              <p>Reports tab coming soon...</p>
              <p className="mt-2">
                This user has submitted {profile.stats.reports} reports.
              </p>
            </div>
          )}

          {activeTab === "roasts" && (
            <div className="card p-6 text-center text-[var(--text-muted)]">
              <p>Roasts tab coming soon...</p>
              <p className="mt-2">
                This user has won {profile.stats.roastWins} roast competitions.
              </p>
            </div>
          )}

          {activeTab === "customize" && isOwnProfile && (
            <ProfileCustomizer
              profile={profile}
              color={color}
              onUpdate={(updates) => setProfile({ ...profile, ...updates })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
