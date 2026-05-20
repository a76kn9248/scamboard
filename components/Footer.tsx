"use client";

import Link from "next/link";
import ShameMessage from "./ShameMessage";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto">
      <div className="max-w-[1280px] mx-auto px-[22px] py-5">
        {/* Shame message */}
        <div className="text-center mb-4">
          <ShameMessage interval={5000} className="text-[11px] text-[var(--text-muted)]" />
        </div>

        {/* Links and info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">{"\u2620"}</span>
            <span className="font-display font-black text-[var(--red)]">SCAMBOARD</span>
            <span className="text-[var(--text-faint)] text-[11px] font-mono">
              // degen watchdog HQ
            </span>
          </div>

          <div className="flex items-center gap-5 text-[12px] text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--text)] transition-colors">
              Feed
            </Link>
            <Link href="/submit" className="hover:text-[var(--red)] transition-colors">
              Report
            </Link>
            <Link href="/hall-of-infamy" className="hover:text-[var(--text)] transition-colors">
              Hall of Infamy
            </Link>
            <Link href="/watchdogs" className="hover:text-[var(--text)] transition-colors">
              Watchdogs
            </Link>
            <Link href="/bounties" className="hover:text-[var(--gold)] transition-colors">
              Bounties
            </Link>
          </div>

          <div className="text-[10px] text-[var(--text-faint)] font-mono">
            The blockchain remembers. So do we. {"\u00B7"} {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}
