"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Watchdog {
  id: string;
  nickname: string;
  profileColor: string;
  title: string;
  mood?: string;
}

interface Top8WatchdogsProps {
  nickname?: string;
  title?: string;
  ownerNickname?: string;
  editable?: boolean;
  size?: "sm" | "md";
}

export default function Top8Watchdogs({
  nickname,
  title = "My Top 8 Watchdogs",
  ownerNickname,
  editable = false,
  size = "sm",
}: Top8WatchdogsProps) {
  const { data: session, status } = useSession();
  const [watchdogs, setWatchdogs] = useState<Watchdog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Watchdog[]>([]);
  const [searching, setSearching] = useState(false);

  const displayTitle = ownerNickname ? `${ownerNickname}'s Top 8 Watchdogs` : title;
  const avatarSize = size === "sm" ? "w-[44px] h-[44px]" : "w-[64px] h-[64px]";
  const avatarFontSize = size === "sm" ? "text-[18px]" : "text-[26px]";
  const avatarRadius = size === "sm" ? "rounded-lg" : "rounded-xl";

  useEffect(() => {
    if (nickname) {
      fetchTop8(`/api/users/${nickname}/top8`);
    } else if (editable && session?.user?.name) {
      // For editable mode without nickname, fetch current user's top 8
      fetchTop8("/api/users/me/top8");
    } else if (editable) {
      // Wait for session to load
      setLoading(status !== "loading");
    } else {
      setLoading(false);
    }
  }, [nickname, editable, session?.user?.name, status]);

  const fetchTop8 = async (endpoint: string) => {
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.watchdogs) {
        setWatchdogs(data.watchdogs);
      }
    } catch (err) {
      console.error("Error fetching top 8:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Simple search - in production you'd have a proper search endpoint
      const res = await fetch(`/api/users/${query}`);
      if (res.ok) {
        const user = await res.json();
        if (user.user && !watchdogs.find((w) => w.id === user.user.id)) {
          setSearchResults([
            {
              id: user.user.id,
              nickname: user.user.nickname,
              profileColor: user.user.profileColor,
              title: user.user.title,
              mood: user.user.mood,
            },
          ]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addWatchdog = async (watchdog: Watchdog) => {
    if (watchdogs.length >= 8) return;

    const newWatchdogs = [...watchdogs, watchdog];
    const watchdogIds = newWatchdogs.map((w) => w.id);

    try {
      const res = await fetch("/api/users/me/top8", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchdogIds }),
      });

      if (res.ok) {
        setWatchdogs(newWatchdogs);
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error updating top 8:", err);
    }
  };

  const removeWatchdog = async (id: string) => {
    const newWatchdogs = watchdogs.filter((w) => w.id !== id);
    const watchdogIds = newWatchdogs.map((w) => w.id);

    try {
      const res = await fetch("/api/users/me/top8", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchdogIds }),
      });

      if (res.ok) {
        setWatchdogs(newWatchdogs);
      }
    } catch (err) {
      console.error("Error updating top 8:", err);
    }
  };

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
          <span>{"\u2B50"}</span>
          <span className="font-display font-black text-[12px] text-[var(--text)]">
            {displayTitle}
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
      <div className="px-3.5 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
        <span>{"\u2B50"}</span>
        <span className="font-display font-black text-[12px] text-[var(--text)]">
          {displayTitle}
        </span>
        {editable && session && (
          <span
            onClick={() => setEditMode(!editMode)}
            className="ml-auto text-[var(--text-muted)] text-[10px] cursor-pointer hover:text-[var(--text)]"
          >
            {editMode ? "done" : "edit"}
          </span>
        )}
      </div>

      {editMode && (
        <div className="p-3 border-b border-[var(--border)] bg-[var(--surface)]">
          <input
            type="text"
            placeholder="Search by nickname..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input text-sm w-full"
          />
          {searching && (
            <div className="text-[var(--text-muted)] text-xs mt-2">
              Searching...
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => addWatchdog(user)}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-[var(--border)]"
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: user.profileColor }}
                  >
                    {user.nickname[0].toUpperCase()}
                  </div>
                  <span className="text-sm">@{user.nickname}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 p-3">
        {watchdogs.length === 0 ? (
          <div className="col-span-4 text-center text-[var(--text-muted)] text-sm py-4">
            {editable ? "Add your top 8 watchdogs!" : "No watchdogs yet"}
          </div>
        ) : (
          watchdogs.slice(0, 8).map((watchdog) => (
            <div key={watchdog.id} className="text-center group relative">
              {editMode && (
                <button
                  onClick={() => removeWatchdog(watchdog.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--red)] rounded-full text-white text-[10px] z-10 hover:scale-110"
                >
                  x
                </button>
              )}
              <Link href={`/profile/${watchdog.nickname}`}>
                <div
                  className={`${avatarSize} ${avatarRadius} mx-auto flex items-center justify-center font-display font-black ${avatarFontSize} text-white transition-transform group-hover:scale-105 group-hover:rotate-[-3deg]`}
                  style={{
                    background: watchdog.profileColor,
                    boxShadow: `0 0 12px ${watchdog.profileColor}55`,
                  }}
                >
                  {watchdog.nickname[0].toUpperCase()}
                </div>
                <div
                  className="text-[9.5px] text-[var(--text-secondary)] mt-1 truncate"
                  style={{ color: watchdog.profileColor }}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
