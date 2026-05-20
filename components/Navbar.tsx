"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    title: string;
    xp: number;
  } | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.title) {
            setUserInfo({ title: data.title, xp: data.xp });
          }
        })
        .catch(console.error);
    }
  }, [session?.user?.id]);

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--background-secondary)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">&#x2620;</span>
            <span
              className="text-xl md:text-2xl font-black text-[var(--red-primary)] tracking-tight"
              style={{ fontFamily: "'Rubik', var(--font-mono), monospace" }}
            >
              SCAMBOARD
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
            >
              Home
            </Link>
            <Link
              href="/submit"
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
            >
              Submit
            </Link>
            <Link
              href="/hall-of-infamy"
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
            >
              Hall of Infamy
            </Link>
            {session && (
              <Link
                href="/profile"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
              >
                My Profile
              </Link>
            )}

            {status === "loading" ? (
              <span className="text-[var(--foreground-dimmed)] text-sm">...</span>
            ) : session ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/submit"
                  className="btn-primary text-sm py-2 px-4"
                >
                  &#x1F6A9; REPORT
                </Link>
                <div className="flex items-center gap-2 bg-[var(--background-card)] px-3 py-2 rounded-lg border border-[var(--border)]">
                  <span className="text-[var(--green-primary)] text-sm font-medium">
                    {session.user.name}
                  </span>
                  {userInfo && (
                    <>
                      <span className="text-[var(--foreground-dimmed)]">|</span>
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {userInfo.title}
                      </span>
                      <span className="text-xs text-[var(--cyan-primary)]">
                        {userInfo.xp} XP
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-[var(--foreground-dimmed)] hover:text-[var(--red-primary)] text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                >
                  Login
                </Link>
                <Link href="/register" className="btn-secondary text-sm py-2 px-4">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--foreground)] p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/submit"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Submit Report
              </Link>
              <Link
                href="/hall-of-infamy"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Hall of Infamy
              </Link>

              {status !== "loading" && (
                <>
                  {session ? (
                    <>
                      <Link
                        href="/profile"
                        className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--green-primary)] text-sm">
                          {session.user.name}
                        </span>
                        {userInfo && (
                          <span className="text-xs text-[var(--foreground-muted)]">
                            ({userInfo.title} - {userInfo.xp} XP)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="text-[var(--red-primary)] text-sm text-left"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <Link
                        href="/login"
                        className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="text-[var(--green-primary)] text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
