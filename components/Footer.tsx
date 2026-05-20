"use client";

import Link from "next/link";
import ShameMessage from "./ShameMessage";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background-secondary)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Shame message */}
        <div className="text-center mb-4">
          <ShameMessage interval={5000} className="text-sm" />
        </div>

        {/* Links and info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">&#x2620;</span>
            <span className="text-[var(--red-primary)] font-bold">SCAMBOARD</span>
            <span className="text-[var(--foreground-dimmed)] text-sm">
              // degen watchdog HQ
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-[var(--foreground-muted)]">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
              Home
            </Link>
            <Link href="/submit" className="hover:text-[var(--foreground)] transition-colors">
              Report
            </Link>
            <Link href="/hall-of-infamy" className="hover:text-[var(--foreground)] transition-colors">
              Hall of Infamy
            </Link>
          </div>

          <div className="text-xs text-[var(--foreground-dimmed)]">
            The blockchain remembers. So do we.
          </div>
        </div>
      </div>
    </footer>
  );
}
