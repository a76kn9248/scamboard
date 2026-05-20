"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import ShameMessage from "./ShameMessage";

interface FeedEvent {
  type: "report" | "confirm_milestone" | "roast_locked" | "bounty";
  message: string;
  timestamp: string;
  link: string;
  icon: string;
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
      setEvents(data.events?.slice(0, limit) || []);
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
          <div key={i} className="skeleton h-10 rounded" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--foreground-muted)] mb-2">No activity yet.</p>
        <ShameMessage />
      </div>
    );
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "report":
        return "text-[var(--red-primary)]";
      case "confirm_milestone":
        return "text-[var(--orange-primary)]";
      case "roast_locked":
        return "text-[var(--gold-primary)]";
      case "bounty":
        return "text-[var(--green-primary)]";
      default:
        return "text-[var(--foreground)]";
    }
  };

  return (
    <div className="space-y-1">
      {events.map((event, index) => (
        <Link
          key={`${event.type}-${event.timestamp}-${index}`}
          href={event.link}
          className={`flex items-center gap-3 p-2 rounded hover:bg-[var(--background-card)] transition-colors animate-slide-in-left`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="text-lg flex-shrink-0">{event.icon}</span>
          <span className={`flex-1 text-sm ${getEventColor(event.type)}`}>
            {event.message}
          </span>
          <span className="text-xs text-[var(--foreground-dimmed)] flex-shrink-0">
            {formatDistanceToNow(new Date(event.timestamp))}
          </span>
        </Link>
      ))}
    </div>
  );
}
