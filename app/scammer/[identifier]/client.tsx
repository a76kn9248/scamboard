"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "@/lib/utils";
import ThreatBadge from "@/components/ThreatBadge";
import ReceiptsGallery from "@/components/ReceiptsGallery";
import LinkedWallets from "@/components/LinkedWallets";
import BountyPool from "@/components/BountyPool";
import RapSheet from "@/components/RapSheet";
import Timeline from "@/components/Timeline";
import CommentThread from "@/components/CommentThread";
import { getThreatLevel } from "@/lib/threat-levels";

interface Report {
  id: string;
  reason: string;
  evidence: string | null;
  authorNickname: string;
  authorColor?: string;
  authorTitle?: string;
  createdAt: string;
  confirmCount: number;
  commentCount: number;
}

interface Comment {
  id: string;
  text: string;
  authorNickname: string;
  authorColor: string;
  authorTitle: string;
  createdAt: string;
  score: number;
}

interface ScammerData {
  identifier: string;
  type: string;
  chain: string;
  totalConfirms: number;
  victimCount: number;
  reportCount: number;
  reports: Report[];
  roastTitle: string | null;
  shameLocked: boolean;
  firstReportDate: string;
  latestReportDate: string;
  primaryReportId: string;
}

export default function ScammerProfileClient({ identifier }: { identifier: string }) {
  const { data: session } = useSession();
  const [scammer, setScammer] = useState<ScammerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentSort, setCommentSort] = useState("top");
  const [watching, setWatching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reports?search=${encodeURIComponent(identifier)}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reports && data.reports.length > 0) {
          const matchingReports = data.reports.filter(
            (r: { identifier: string }) => r.identifier.toLowerCase() === identifier.toLowerCase()
          );

          if (matchingReports.length > 0) {
            const totalConfirms = matchingReports.reduce(
              (sum: number, r: { confirmCount: number }) => sum + r.confirmCount,
              0
            );
            const victimCount = matchingReports.reduce(
              (sum: number, r: { victimCount?: number }) => sum + (r.victimCount || 0),
              0
            );
            const dates = matchingReports.map((r: { createdAt: string }) => new Date(r.createdAt));

            fetch(`/api/reports/${matchingReports[0].id}/roasts`)
              .then((res) => res.json())
              .then((roastData) => {
                setScammer({
                  identifier: matchingReports[0].identifier,
                  type: matchingReports[0].type,
                  chain: matchingReports[0].chain || "ETH",
                  totalConfirms,
                  victimCount,
                  reportCount: matchingReports.length,
                  primaryReportId: matchingReports[0].id,
                  reports: matchingReports.map((r: {
                    id: string;
                    reason: string;
                    evidence?: string | null;
                    authorNickname: string;
                    authorColor?: string;
                    authorTitle?: string;
                    createdAt: string;
                    confirmCount: number;
                    commentCount: number;
                  }) => ({
                    id: r.id,
                    reason: r.reason,
                    evidence: r.evidence || null,
                    authorNickname: r.authorNickname,
                    authorColor: r.authorColor || "#ff3b9a",
                    authorTitle: r.authorTitle || "Watchdog",
                    createdAt: r.createdAt,
                    confirmCount: r.confirmCount,
                    commentCount: r.commentCount,
                  })),
                  roastTitle: roastData.lockedRoastTitle || null,
                  shameLocked: roastData.shameLocked || false,
                  firstReportDate: new Date(Math.min(...dates.map((d: Date) => d.getTime()))).toISOString(),
                  latestReportDate: new Date(Math.max(...dates.map((d: Date) => d.getTime()))).toISOString(),
                });
                setLoading(false);
              })
              .catch(() => setLoading(false));
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));

    // Check if watching
    if (session) {
      fetch("/api/watch/mine")
        .then((res) => res.json())
        .then((data) => {
          if (data.scammers?.includes(identifier)) {
            setWatching(true);
          }
        })
        .catch(() => {});
    }
  }, [identifier, session]);

  const handleWatch = async () => {
    if (!session) return;
    setActionLoading("watch");

    try {
      const res = await fetch("/api/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "scammer",
          targetId: identifier,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWatching(data.watching);
      }
    } catch (err) {
      console.error("Error toggling watch:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVictimConfirm = async () => {
    if (!session || !scammer) return;
    setActionLoading("victim");

    try {
      const res = await fetch(`/api/reports/${scammer.primaryReportId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isVictim: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScammer((prev) =>
          prev
            ? {
                ...prev,
                totalConfirms: data.confirmCount,
                victimCount: data.victimCount,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error confirming as victim:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-[var(--surface)] border-b border-[var(--border)] px-[22px] py-2.5">
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-[200px]" />
        <div className="max-w-[1280px] mx-auto px-[22px] py-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <div className="space-y-4">
              <div className="skeleton h-40 rounded-[10px]" />
              <div className="skeleton h-32 rounded-[10px]" />
            </div>
            <div className="space-y-4">
              <div className="skeleton h-40 rounded-[10px]" />
              <div className="skeleton h-48 rounded-[10px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scammer) {
    return (
      <div className="min-h-screen py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <span className="text-6xl mb-4 block">{"\u{1F914}"}</span>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-4">
            Scammer Not Found
          </h1>
          <p className="text-[var(--text-muted)] mb-6">
            No reports found for this identifier. Maybe they&apos;re not on the radar yet.
          </p>
          <Link href="/submit" className="btn-primary">
            Report This Scammer
          </Link>
        </div>
      </div>
    );
  }

  const threatInfo = getThreatLevel(scammer.totalConfirms);
  const shortId = scammer.identifier.length > 12
    ? `${scammer.identifier.slice(0, 6)}...${scammer.identifier.slice(-4)}`
    : scammer.identifier;
  const displayId = scammer.type === "twitter" ? `@${scammer.identifier}` : scammer.identifier;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb nav */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] px-[22px] py-2.5 flex items-center gap-3.5 text-[12px] text-[var(--text-muted)]">
        <Link href="/" className="text-[var(--red)] hover:underline">
          {"\u2190"} back
        </Link>
        <span className="text-[var(--text-secondary)]">
          r/{scammer.type === "twitter" ? "twitterscams" : "rugpulls"}
        </span>
        <span className="text-[var(--text-faint)]">/</span>
        <span className="font-mono text-[var(--text-secondary)]">{shortId}</span>
        <span className="text-[var(--text-faint)]">/</span>
        <span className="text-[var(--text)]">case file</span>
      </div>

      {/* Hero / Mugshot Block */}
      <div
        className="relative px-[22px] py-6 border-b border-[var(--border)] overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 12% 0%, rgba(255, 59, 108, 0.2) 0%, transparent 45%),
            radial-gradient(circle at 90% 100%, rgba(255, 197, 71, 0.15) 0%, transparent 40%),
            linear-gradient(180deg, var(--surface), var(--bg))
          `,
        }}
      >
        {/* WANTED watermark */}
        <div
          className="absolute right-[-20px] top-[-10px] font-display font-black text-[200px] tracking-[-8px] leading-none pointer-events-none select-none"
          style={{ color: "rgba(255, 59, 108, 0.03)", transform: "rotate(8deg)" }}
        >
          WANTED
        </div>

        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center relative z-10">
          {/* Left: Mugshot + ID block */}
          <div className="flex gap-5 items-center">
            {/* Mug frame */}
            <div
              className="w-[110px] h-[130px] flex-shrink-0 relative flex items-center justify-center font-display font-black text-[56px] text-white"
              style={{
                background: `
                  repeating-linear-gradient(0deg, var(--border) 0 2px, transparent 2px 12px),
                  linear-gradient(135deg, rgba(255, 59, 108, 0.2), rgba(124, 92, 255, 0.2))
                `,
                border: `2px solid ${threatInfo.color}`,
                boxShadow: `0 0 30px ${threatInfo.color}44`,
              }}
            >
              {scammer.type === "twitter" ? "@" : "\u2699"}
              <div className="absolute -bottom-[22px] left-0 right-0 font-mono text-[9px] text-[var(--text-muted)] text-center tracking-wide">
                CASE# {String(Date.now()).slice(-4)}-RUG
              </div>
            </div>

            {/* ID block */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {scammer.type === "twitter" ? "TWITTER HANDLE" : "DEPLOYER ADDRESS"} {"\u00B7"} {scammer.chain}
              </div>
              <div className="font-mono text-[22px] text-[var(--text)] mt-0.5 flex items-center gap-2">
                {displayId}
                <span className="text-[var(--red)] text-[10px] cursor-pointer hover:underline">
                  copy
                </span>
              </div>

              {scammer.roastTitle && (
                <div className="font-display font-black text-[26px] text-[var(--gold)] italic tracking-tight mt-3 leading-tight">
                  &quot;{scammer.roastTitle}&quot;
                </div>
              )}

              {/* Also seen as */}
              <div className="flex items-center gap-1.5 mt-3 flex-wrap text-[11px]">
                <span className="text-[var(--text-muted)]">also seen as:</span>
                <span className="bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded font-mono text-[var(--text-secondary)]">
                  @jeetcoin_dev
                </span>
                <span className="bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded font-mono text-[var(--text-secondary)]">
                  moonboi_dev
                </span>
                <span className="bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded font-mono text-[var(--red)]">
                  +11 more
                </span>
              </div>
            </div>
          </div>

          {/* Right: Threat badge + confirms + actions */}
          <div className="text-right">
            <ThreatBadge confirmCount={scammer.totalConfirms} size="lg" showTier />

            <div className="font-display font-black text-[64px] text-[var(--red)] leading-none mt-3 tracking-tight">
              {scammer.totalConfirms}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">
              {scammer.totalConfirms} confirms {"\u00B7"} {scammer.victimCount} victims {"\u00B7"} {scammer.reportCount} reports
            </div>

            <div className="flex gap-2 mt-[18px] justify-end flex-wrap">
              {session && (
                <button
                  onClick={handleWatch}
                  disabled={actionLoading === "watch"}
                  className={`btn-secondary text-[12px] py-2 px-3.5 disabled:opacity-50 ${watching ? "border-[var(--red)] text-[var(--red)]" : ""}`}
                >
                  {"\u{1F441}"} {watching ? "Watching" : "Watch"}
                </button>
              )}
              <Link href={`/report/${scammer.primaryReportId}#evidence`} className="btn-secondary text-[12px] py-2 px-3.5">
                {"\u{1F4CE}"} Add evidence
              </Link>
              <Link href={`/report/${scammer.primaryReportId}#roasts`} className="btn-secondary text-[12px] py-2 px-3.5">
                {"\u{1F525}"} Roast
              </Link>
              {session && (
                <button
                  onClick={handleVictimConfirm}
                  disabled={actionLoading === "victim"}
                  className="btn-primary text-[12px] py-2 px-3.5 disabled:opacity-50"
                >
                  {actionLoading === "victim" ? "..." : "\u2713"} I was rugged too
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body - Two columns */}
      <div className="max-w-[1280px] mx-auto px-[22px] py-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Main Column */}
        <div className="space-y-4">
          {/* Original Report */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
              <span>{"\u{1F4CB}"}</span>
              <span className="font-display font-black text-[14px] text-[var(--text)]">
                Original report
              </span>
              <span className="ml-auto text-[11px] text-[var(--text-muted)]">
                submitted by{" "}
                <Link
                  href={`/profile/${scammer.reports[0]?.authorNickname}`}
                  style={{ color: scammer.reports[0]?.authorColor || "#ff3b9a" }}
                  className="font-bold hover:underline"
                >
                  @{scammer.reports[0]?.authorNickname}
                </Link>{" "}
                {"\u00B7"} {formatDistanceToNow(new Date(scammer.reports[0]?.createdAt || Date.now()))}
              </span>
            </div>
            <div className="p-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {scammer.reports[0]?.reason.split("\n").map((paragraph, i) => (
                <p key={i} className="mb-2.5 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Receipts Gallery */}
          <ReceiptsGallery reportId={scammer.primaryReportId} identifier={scammer.identifier} />

          {/* Linked Wallets */}
          <LinkedWallets reportId={scammer.primaryReportId} identifier={scammer.identifier} />

          {/* Discussion */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
              <span>{"\u{1F4AC}"}</span>
              <span className="font-display font-black text-[14px] text-[var(--text)]">
                Discussion
              </span>
            </div>

            {/* Sort tabs */}
            <div className="flex items-center gap-1 px-4 py-3 border-b border-[var(--border)] text-[11px]">
              {["Top", "New", "Controversial", "Most damning"].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setCommentSort(sort.toLowerCase())}
                  className={`sort-tab ${commentSort === sort.toLowerCase() ? "active" : ""}`}
                >
                  {sort}
                </button>
              ))}
            </div>

            {/* Threaded Comments */}
            <div className="p-4">
              <CommentThread reportId={scammer.primaryReportId} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <BountyPool />
          <RapSheet identifier={scammer.identifier} />
          <Timeline identifier={scammer.identifier} />

          {/* Same Pattern */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
              <span>{"\u{1F9EC}"}</span>
              <span className="font-display font-black text-[14px] text-[var(--text)]">
                Same pattern
              </span>
            </div>
            <div className="p-4 pt-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 py-2 border-b border-dashed border-[var(--border)] last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-md bg-[var(--border)] flex items-center justify-center font-display font-black text-[14px] text-[var(--gold)]">
                    #{i + 2}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] text-[var(--text)] truncate">
                      0x{Math.random().toString(16).slice(2, 10)}...{Math.random().toString(16).slice(2, 6)}
                    </div>
                    <div className="text-[var(--text-muted)] text-[10px]">
                      {Math.floor(Math.random() * 50) + 10} confirms {"\u00B7"} SOL
                    </div>
                  </div>
                  <span className="text-[10px] font-display font-black text-[var(--orange)]">
                    EXTREME
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
