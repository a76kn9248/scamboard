"use client";

import { ReactNode } from "react";

interface TimelineEvent {
  when: string;
  what: ReactNode;
}

interface TimelineProps {
  events?: TimelineEvent[];
}

const defaultEvents: TimelineEvent[] = [
  { when: "3h ago", what: <><b>@rugslayer.eth</b> reported as scammer.</> },
  { when: "2h ago", what: <><b>14 confirms</b> in the first hour.</> },
  { when: "2h ago", what: <><b>@soliditysnitch</b> dropped contract evidence.</> },
  { when: "1h ago", what: <>auto-promoted to <b style={{ color: "var(--red)" }}>LEGENDARY</b>.</> },
  { when: "52m ago", what: <>bounty pool opened by <b>@etherdetective</b>.</> },
  { when: "38m ago", what: <>2 linked wallets identified.</> },
  { when: "14m ago", what: <><b>&quot;the Rugnarok&quot;</b> won roast of the week.</> },
];

export default function Timeline({ events = defaultEvents }: TimelineProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>{"\u{1F550}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Timeline
        </span>
      </div>

      <div className="p-4 pt-3">
        {events.map((event, index) => (
          <div
            key={index}
            className="grid grid-cols-[50px_1fr] gap-3 py-1.5 text-[11.5px]"
          >
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              {event.when}
            </span>
            <span className="text-[var(--text-secondary)]">
              {event.what}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
