"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

interface FeedEvent {
  type: "report" | "confirm" | "roast_locked" | "bounty" | "comment";
  who: string;
  whoColor?: string;
  what: string;
  target: string;
  timestamp: string;
  link: string;
}

interface LiveFeedProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function LiveFeed({
  limit = 10,
  autoRefresh = true,
  refreshInterval = 30000,
}: LiveFeedProps) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await fetch("/api/feed");
      const data = await res.json();

      // Transform old format to new format
      const transformed = (data.events || []).slice(0, limit).map((event: {
        type: string;
        message: string;
        timestamp: string;
        link: string;
        authorNickname?: string;
        authorColor?: string;
        target?: string;
      }) => {
        // Parse message to extract who/what/target
        const parts = event.message.split(" ");
        const who = event.authorNickname || parts[0]?.replace("@", "") || "anonymous";
        const what = getWhatFromType(event.type);
        const target = event.target || extractTarget(event.message);

        return {
          type: event.type,
          who,
          whoColor: event.authorColor || getDefaultColor(who),
          what,
          target,
          timestamp: event.timestamp,
          link: event.link,
        };
      });

      setEvents(transformed);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    if (autoRefresh) {
      const timer = setInterval(fetchFeed, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [limit, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-8 rounded" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-[var(--text-muted)] text-[12px]">
        No activity yet. Be the first!
      </div>
    );
  }

  return (
    <div>
      {events.map((event, index) => (
        <Link
          key={`${event.type}-${event.timestamp}-${index}`}
          href={event.link}
          className="flex items-baseline gap-1.5 py-1.5 border-b border-dashed border-[var(--border)] last:border-b-0 text-[11.5px] leading-relaxed hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        >
          <span
            className="font-bold flex-shrink-0"
            style={{ color: event.whoColor }}
          >
            @{event.who.split(".")[0]}
          </span>
          <span className="text-[var(--text-muted)]">{event.what}</span>
          <span className="font-mono text-[10px] text-[var(--text-secondary)] truncate">
            {event.target}
          </span>
          <span className="ml-auto text-[var(--text-faint)] text-[10px] flex-shrink-0">
            {formatDistanceToNowShort(new Date(event.timestamp))}
          </span>
        </Link>
      ))}
    </div>
  );
}

function getWhatFromType(type: string): string {
  switch (type) {
    case "report":
      return "reported";
    case "confirm":
    case "confirm_milestone":
      return "confirmed";
    case "roast_locked":
      return "roasted";
    case "bounty":
      return "added bounty to";
    case "comment":
      return "commented on";
    default:
      return "interacted with";
  }
}

function extractTarget(message: string): string {
  // Try to find wallet address or @handle in message
  const addressMatch = message.match(/0x[a-fA-F0-9]+/);
  if (addressMatch) {
    const addr = addressMatch[0];
    return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  }
  const handleMatch = message.match(/@\w+/);
  if (handleMatch) return handleMatch[0];
  return "";
}

function getDefaultColor(name: string): string {
  // Generate a consistent color from name
  const colors = ["#ff3b9a", "#7c5cff", "#34d399", "#22d3ee", "#f472b6", "#fb923c", "#facc15"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatDistanceToNowShort(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
}
