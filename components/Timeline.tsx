"use client";

import { useState, useEffect, ReactNode } from "react";

interface TimelineEvent {
  type: string;
  message: string;
  createdAt: string;
  actorNickname?: string;
}

interface TimelineProps {
  identifier?: string;
  events?: { when: string; what: ReactNode }[];
}

const getEventIcon = (type: string): string => {
  switch (type) {
    case "report":
      return "\u{1F6A8}";
    case "evidence":
      return "\u{1F4CE}";
    case "linked_wallet":
      return "\u{1F517}";
    case "bounty":
      return "\u{1F4B0}";
    case "roast_win":
      return "\u{1F525}";
    case "milestone":
      return "\u{1F3AF}";
    case "threat_level":
      return "\u26A0\uFE0F";
    default:
      return "\u2022";
  }
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function Timeline({ identifier, events: propEvents }: TimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(!propEvents && !!identifier);

  useEffect(() => {
    if (identifier && !propEvents) {
      fetchTimeline();
    }
  }, [identifier, propEvents]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/scammer/${encodeURIComponent(identifier!)}/timeline`);
      const data = await res.json();

      if (res.ok && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Error fetching timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  // If using prop events (legacy format)
  if (propEvents) {
    return (
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
          <span>{"\u{1F550}"}</span>
          <span className="font-display font-black text-[14px] text-[var(--text)]">
            Timeline
          </span>
        </div>
        <div className="p-4 pt-3">
          {propEvents.map((event, index) => (
            <div
              key={index}
              className="grid grid-cols-[50px_1fr] gap-3 py-1.5 text-[11.5px]"
            >
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {event.when}
              </span>
              <span className="text-[var(--text-secondary)]">{event.what}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
          <span>{"\u{1F550}"}</span>
          <span className="font-display font-black text-[14px] text-[var(--text)]">
            Timeline
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
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>{"\u{1F550}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Timeline
        </span>
      </div>

      <div className="p-4 pt-3">
        {events.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] text-sm py-4">
            No events yet
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className="grid grid-cols-[50px_1fr] gap-3 py-1.5 text-[11.5px]"
            >
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {formatTimeAgo(event.createdAt)}
              </span>
              <span className="text-[var(--text-secondary)]">
                {getEventIcon(event.type)} {event.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
