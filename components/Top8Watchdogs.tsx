"use client";

import Link from "next/link";

interface Watchdog {
  nickname: string;
  color: string;
  title: string;
  mood?: string;
}

interface Top8WatchdogsProps {
  watchdogs?: Watchdog[];
  title?: string;
  ownerNickname?: string;
  editable?: boolean;
  size?: "sm" | "md";
}

const defaultWatchdogs: Watchdog[] = [
  { nickname: "etherdetective", color: "#7c5cff", title: "Watchdog", mood: "caffeinated" },
  { nickname: "soliditysnitch", color: "#34d399", title: "Code Auditor", mood: "smug" },
  { nickname: "0xforensics", color: "#22d3ee", title: "Bounty Hunter", mood: "patient" },
  { nickname: "botbusterella", color: "#f472b6", title: "Watchdog", mood: "tired" },
  { nickname: "groupchatgremlin", color: "#fb923c", title: "Fresh Degen", mood: "feral" },
  { nickname: "honeypot_hunter", color: "#facc15", title: "Code Auditor", mood: "amused" },
  { nickname: "txn_diver", color: "#60a5fa", title: "Fresh Degen", mood: "curious" },
  { nickname: "rugslayer", color: "#ff3b9a", title: "Bounty Hunter", mood: "vengeful" },
];

export default function Top8Watchdogs({
  watchdogs = defaultWatchdogs,
  title = "My Top 8 Watchdogs",
  ownerNickname,
  editable = false,
  size = "sm",
}: Top8WatchdogsProps) {
  const displayedWatchdogs = watchdogs.slice(0, 8);
  const displayTitle = ownerNickname ? `${ownerNickname}'s Top 8 Watchdogs` : title;

  const avatarSize = size === "sm" ? "w-[44px] h-[44px]" : "w-[64px] h-[64px]";
  const avatarFontSize = size === "sm" ? "text-[18px]" : "text-[26px]";
  const avatarRadius = size === "sm" ? "rounded-lg" : "rounded-xl";

  return (
    <div className="card overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
        <span>{"\u2B50"}</span>
        <span className="font-display font-black text-[12px] text-[var(--text)]">
          {displayTitle}
        </span>
        {editable && (
          <span className="ml-auto text-[var(--text-muted)] text-[10px] cursor-pointer hover:text-[var(--text)]">
            edit
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 p-3">
        {displayedWatchdogs.map((watchdog) => (
          <Link
            key={watchdog.nickname}
            href={`/profile/${watchdog.nickname}`}
            className="text-center group"
          >
            <div
              className={`${avatarSize} ${avatarRadius} mx-auto flex items-center justify-center font-display font-black ${avatarFontSize} text-white transition-transform group-hover:scale-105 group-hover:rotate-[-3deg]`}
              style={{
                background: watchdog.color,
                boxShadow: `0 0 12px ${watchdog.color}55`,
              }}
            >
              {watchdog.nickname[0].toUpperCase()}
            </div>
            <div
              className="text-[9.5px] text-[var(--text-secondary)] mt-1 truncate"
              style={{ color: watchdog.color }}
            >
              @{watchdog.nickname.split(".")[0]}
            </div>
            {size === "md" && (
              <>
                <div className="text-[9px] text-[var(--text-muted)]">
                  {watchdog.title}
                </div>
                {watchdog.mood && (
                  <div className="text-[8px] text-[var(--gold)] italic">
                    &quot;{watchdog.mood}&quot;
                  </div>
                )}
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
