"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  type: string;
  identifier: string;
  reason: string;
  authorNickname: string;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    title: string;
    xp: number;
    profileColor: string;
  } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/reports?search=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSearchResults(data.reports || []);
      setShowDropdown(true);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div ref={searchRef} className="hidden lg:flex ml-auto relative w-[320px]">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-md px-2.5 py-1.5 w-full">
            <span className="text-[var(--text-faint)] text-[14px]">{"\u2315"}</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
              onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
              placeholder="paste a wallet, contract, or @handle"
              className="flex-1 bg-transparent border-0 outline-none text-[var(--text-secondary)] text-[12px] placeholder:text-[var(--text-muted)]"
            />
            {isSearching ? (
              <span className="text-[var(--text-faint)] text-[10px] animate-pulse">...</span>
            ) : (
              <span className="text-[var(--text-faint)] text-[10px]">{"\u21B5"}</span>
            )}
          </form>

          {/* Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/report/${result.id}`}
                  onClick={() => setShowDropdown(false)}
                  className="block px-3 py-2 hover:bg-[var(--border)] border-b border-[var(--border)] last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${result.type === "twitter" ? "bg-[#1DA1F2]/20 text-[#1DA1F2]" : "bg-[var(--purple)]/20 text-[var(--purple)]"}`}>
                      {result.type === "twitter" ? "@" : "0x"}
                    </span>
                    <span className="text-[var(--text)] text-[12px] font-medium truncate">
                      {result.type === "twitter" ? `@${result.identifier}` : `${result.identifier.slice(0, 10)}...`}
                    </span>
                  </div>
                  <div className="text-[var(--text-muted)] text-[11px] truncate mt-0.5">
                    {result.reason.slice(0, 60)}...
                  </div>
                </Link>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                onClick={() => setShowDropdown(false)}
                className="block px-3 py-2 text-center text-[var(--green)] text-[11px] hover:bg-[var(--border)]"
              >
                View all results for &quot;{searchQuery}&quot; {"\u2192"}
              </Link>
            </div>
          )}
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
