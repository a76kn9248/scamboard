"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    title: string;
    xp: number;
    profileColor: string;
  } | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.title) {
            setUserInfo({
              title: data.title,
              xp: data.xp,
              profileColor: data.profileColor || "#ff3b9a",
            });
          }
        })
        .catch(console.error);
    }
  }, [session?.user?.id]);

  const navLinks = [
    { href: "/", label: "Feed" },
    { href: "/hall-of-infamy", label: "Hall of Infamy" },
    { href: "/watchdogs", label: "Watchdogs" },
    { href: "/bounties", label: "Bounties" },
  ];

  const profileColor = userInfo?.profileColor || "#ff3b9a";

  return (
    <nav className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50">
      <div className="px-[22px] py-2.5 flex items-center gap-[22px]">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[22px] text-[var(--red)]">{"\u2620"}</span>
          <span className="font-display text-[22px] font-black tracking-tight text-[#f5e7d8]">
            scam<span className="text-[var(--red)]">board</span>
          </span>
          <span className="hidden lg:inline text-[var(--text-muted)] text-[11px] italic">
            {"\u2014"} a community-verified wall of shame
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-[18px] ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13px] transition-colors ${
                pathname === link.href
                  ? "text-[var(--red)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search Box */}
        <div className="hidden lg:flex ml-auto items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-md px-2.5 py-1.5 w-[320px]">
          <span className="text-[var(--text-faint)] text-[14px]">{"\u2315"}</span>
          <input
            type="text"
            placeholder="paste a wallet, contract, or @handle"
            className="flex-1 bg-transparent border-0 outline-none text-[var(--text-secondary)] text-[12px] placeholder:text-[var(--text-muted)]"
          />
          <span className="text-[var(--text-faint)] text-[10px]">{"\u2318"}K</span>
        </div>

        {/* User Chip / Auth */}
        <div className="ml-auto md:ml-0 flex items-center gap-3">
          {status === "loading" ? (
            <div className="skeleton h-8 w-24 rounded-md" />
          ) : session ? (
            <div className="flex items-center gap-3">
              {/* Report button - mobile hidden */}
              <Link
                href="/submit"
                className="hidden sm:inline-flex btn-primary text-[11px] py-1.5 px-3"
              >
                {"\u{1F6A9}"} REPORT
              </Link>

              {/* User chip */}
              <Link
                href="/profile"
                className="flex items-center gap-2 bg-[#1f1817] px-2.5 py-1.5 rounded-md text-[12px]"
                style={{ borderColor: `${profileColor}44`, border: `1px solid ${profileColor}44` }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: profileColor,
                    boxShadow: `0 0 8px ${profileColor}`,
                  }}
                />
                <span style={{ color: profileColor, fontWeight: "bold" }}>
                  @{session.user.name}
                </span>
                {userInfo && (
                  <>
                    <span className="text-[var(--text-muted)]">{"\u00B7"}</span>
                    <span className="text-[var(--gold)] font-bold">
                      {userInfo.xp.toLocaleString()}
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px]">XP</span>
                  </>
                )}
              </Link>

              {/* Logout - desktop only */}
              <button
                onClick={() => signOut()}
                className="hidden md:block text-[var(--text-muted)] hover:text-[var(--red)] text-[11px] transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-[var(--text-secondary)] hover:text-[var(--text)] text-[12px] transition-colors"
              >
                Login
              </Link>
              <Link href="/register" className="btn-secondary text-[11px] py-1.5 px-3">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--text)] p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] px-[22px] py-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] transition-colors ${
                  pathname === link.href
                    ? "text-[var(--red)]"
                    : "text-[var(--text-secondary)]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {session && (
              <>
                <Link
                  href="/submit"
                  className="text-[var(--red)] text-[13px]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {"\u{1F6A9}"} Report a Scammer
                </Link>
                <Link
                  href="/profile"
                  className="text-[var(--text-secondary)] text-[13px]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="text-[var(--text-muted)] text-[13px] text-left"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
