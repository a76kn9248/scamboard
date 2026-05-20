"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-red-900/30 bg-[#0d0d12]">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-500 font-mono tracking-tight">
              SCAMBOARD
            </span>
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">
              // COMMUNITY WATCHLIST
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white font-mono text-sm transition-colors"
            >
              BOARD
            </Link>

            {status === "loading" ? (
              <span className="text-gray-600 font-mono text-sm">...</span>
            ) : session ? (
              <>
                <Link
                  href="/submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-mono text-sm transition-colors"
                >
                  + REPORT
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-mono text-sm">
                    @{session.user.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-500 hover:text-red-400 font-mono text-sm transition-colors"
                  >
                    LOGOUT
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-white font-mono text-sm transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  className="border border-green-500 text-green-400 hover:bg-green-500/10 px-4 py-2 font-mono text-sm transition-colors"
                >
                  REGISTER
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
