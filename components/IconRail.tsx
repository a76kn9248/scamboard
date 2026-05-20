"use client";

import Link from "next/link";

const railButtons = [
  { icon: "\u{1F6A9}", label: "Report", href: "/submit", primary: true },
  { icon: "\u{1F4B0}", label: "Bounty", href: "/bounties", primary: false },
  { icon: "\u{1F3C6}", label: "Infamy", href: "/hall-of-infamy", primary: false },
  { icon: "\u{1F43A}", label: "Watch", href: "/watchdogs", primary: false },
];

export default function IconRail() {
  return (
    <div className="flex flex-col gap-2 sticky top-24">
      {railButtons.map((btn, i) => (
        <Link
          key={i}
          href={btn.href}
          className={`
            w-14 h-14 rounded-[10px] flex flex-col items-center justify-center gap-0.5
            text-[9px] uppercase tracking-wide cursor-pointer transition-all
            ${
              btn.primary
                ? "bg-gradient-to-b from-[var(--red)] to-[var(--red-dark)] text-white border border-[var(--red)] shadow-[0_0_20px_rgba(255,59,108,0.3)]"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
            }
          `}
        >
          <span className="text-[18px] leading-none">{btn.icon}</span>
          <span>{btn.label}</span>
        </Link>
      ))}
    </div>
  );
}
