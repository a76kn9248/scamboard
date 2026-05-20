"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "@/lib/utils";
import ThreatBadge from "@/components/ThreatBadge";
import ScammerAvatar from "@/components/ScammerAvatar";
import RoastSection from "@/components/RoastSection";
import BountyBadge from "@/components/BountyBadge";
import ShameMessage from "@/components/ShameMessage";

interface Report {
  id: string;
  reason: string;
  evidence: string | null;
  authorNickname: string;
  createdAt: string;
  confirmCount: number;
  commentCount: number;
}

interface ScammerData {
  identifier: string;
  type: string;
  totalConfirms: number;
  reportCount: number;
  reports: Report[];
  roastTitle: string | null;
  shameLocked: boolean;
  firstReportDate: string;
  latestReportDate: string;
}

interface BountyData {
  count: number;
  bounties: {
    id: string;
    message: string | null;
    authorNickname: string;
    createdAt: string;
  }[];
  userHasBounty: boolean;
}

export default function ScammerProfileClient({ identifier }: { identifier: string }) {
  const { data: session } = useSession();
  const [scammer, setScammer] = useState<ScammerData | null>(null);
  const [bountyData, setBountyData] = useState<BountyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBountyForm, setShowBountyForm] = useState(false);
  const [bountyMessage, setBountyMessage] = useState("");
  const [submittingBounty, setSubmittingBounty] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch scammer data by aggregating reports
    fetch(`/api/reports?search=${encodeURIComponent(identifier)}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reports && data.reports.length > 0) {
          // Filter to only exact matches
          const matchingReports = data.reports.filter(
            (r: { identifier: string }) => r.identifier.toLowerCase() === identifier.toLowerCase()
          );

          if (matchingReports.length > 0) {
            const totalConfirms = matchingReports.reduce(
              (sum: number, r: { confirmCount: number }) => sum + r.confirmCount,
              0
            );
            const dates = matchingReports.map((r: { createdAt: string }) => new Date(r.createdAt));

            // Find roast title from first report (if any)
            const firstReportId = matchingReports[0].id;

            // Fetch roast info from the first report
            fetch(`/api/reports/${firstReportId}/roasts`)
              .then((res) => res.json())
              .then((roastData) => {
                setScammer({
                  identifier: matchingReports[0].identifier,
                  type: matchingReports[0].type,
                  totalConfirms,
                  reportCount: matchingReports.length,
                  reports: matchingReports.map((r: {
                    id: string;
                    reason: string;
                    evidence?: string | null;
                    authorNickname: string;
                    createdAt: string;
                    confirmCount: number;
                    commentCount: number;
                  }) => ({
                    id: r.id,
                    reason: r.reason,
                    evidence: r.evidence || null,
                    authorNickname: r.authorNickname,
                    createdAt: r.createdAt,
                    confirmCount: r.confirmCount,
                    commentCount: r.commentCount,
                  })),
                  roastTitle: roastData.lockedRoastTitle || null,
                  shameLocked: roastData.shameLocked || false,
                  firstReportDate: new Date(Math.min(...dates.map((d: Date) => d.getTime()))).toISOString(),
                  latestReportDate: new Date(Math.max(...dates.map((d: Date) => d.getTime()))).toISOString(),
                });

                // Fetch bounty data for the first report
                return fetch(`/api/reports/${firstReportId}/bounty`);
              })
              .then((res) => res.json())
              .then((data) => {
                setBountyData(data);
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
  }, [identifier]);

  const handleSubmitBounty = async () => {
    if (!session || !scammer || submittingBounty) return;

    setSubmittingBounty(true);
    try {
      const res = await fetch(`/api/reports/${scammer.reports[0].id}/bounty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: bountyMessage || null }),
      });

      if (res.ok) {
        const data = await res.json();
        setBountyData((prev) =>
          prev
            ? {
                ...prev,
                count: data.count,
                bounties: [data.bounty, ...prev.bounties],
                userHasBounty: true,
              }
            : null
        );
        setShowBountyForm(false);
        setBountyMessage("");
      }
    } catch (error) {
      console.error("Error submitting bounty:", error);
    } finally {
      setSubmittingBounty(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-48 rounded-lg mb-6" />
          <div className="skeleton h-64 rounded-lg mb-6" />
          <div className="skeleton h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!scammer) {
    return (
      <div className="min-h-screen py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <span className="text-6xl mb-4 block">&#x1F914;</span>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Scammer Not Found
          </h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            No reports found for this identifier. Maybe they&apos;re not on the radar yet.
          </p>
          <Link href="/submit" className="btn-primary">
            Report This Scammer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <ScammerAvatar identifier={scammer.identifier} size="xl" />

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
                  {scammer.type === "twitter" ? "@" : ""}
                  {scammer.identifier}
                </h1>
                <ThreatBadge confirmCount={scammer.totalConfirms} size="lg" />
              </div>

              {scammer.roastTitle && (
                <p className="text-xl roast-title mb-4 animate-gold-shimmer text-transparent bg-clip-text">
                  {scammer.roastTitle}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-[var(--foreground-muted)]">
                <span>
                  <strong className="text-[var(--red-primary)]">{scammer.totalConfirms}</strong> total
                  confirms
                </span>
                <span>
                  <strong className="text-[var(--orange-primary)]">{scammer.reportCount}</strong>{" "}
                  report{scammer.reportCount !== 1 ? "s" : ""}
                </span>
                <span>
                  First reported {formatDistanceToNow(new Date(scammer.firstReportDate))}
                </span>
              </div>

              {bountyData && bountyData.count > 0 && (
                <div className="mt-4">
                  <BountyBadge count={bountyData.count} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Roast Section */}
        {scammer.reports.length > 0 && (
          <div className="mb-6">
            <RoastSection reportId={scammer.reports[0].id} identifier={scammer.identifier} />
          </div>
        )}

        {/* Bounty Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">&#x1F4B0;</span>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Evidence Bounties</h2>
            </div>
            {session && bountyData && !bountyData.userHasBounty && (
              <button
                onClick={() => setShowBountyForm(!showBountyForm)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Add Bounty
              </button>
            )}
          </div>

          {showBountyForm && (
            <div className="mb-4 p-4 bg-[var(--background-tertiary)] rounded-lg">
              <textarea
                value={bountyMessage}
                onChange={(e) => setBountyMessage(e.target.value.slice(0, 280))}
                placeholder="What evidence do you want? (optional)"
                className="input mb-3"
                rows={2}
                maxLength={280}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--foreground-dimmed)]">
                  {bountyMessage.length}/280
                </span>
                <button
                  onClick={handleSubmitBounty}
                  disabled={submittingBounty}
                  className="btn-primary text-sm py-2 px-4"
                >
                  {submittingBounty ? "..." : "Submit Bounty"}
                </button>
              </div>
            </div>
          )}

          {bountyData && bountyData.bounties.length > 0 ? (
            <div className="space-y-3">
              {bountyData.bounties.map((bounty) => (
                <div
                  key={bounty.id}
                  className="p-3 bg-[var(--background-tertiary)] rounded-lg"
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-1">
                    <Link
                      href={`/profile/${bounty.authorNickname}`}
                      className="text-[var(--green-primary)] hover:underline"
                    >
                      @{bounty.authorNickname}
                    </Link>
                    <span>wants evidence</span>
                    <span className="text-[var(--foreground-dimmed)]">
                      {formatDistanceToNow(new Date(bounty.createdAt))}
                    </span>
                  </div>
                  {bounty.message && (
                    <p className="text-[var(--foreground)]">{bounty.message}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--foreground-muted)] text-center py-4">
              No bounties yet. Be the first to request more evidence!
            </p>
          )}
        </div>

        {/* Reports */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">&#x1F4CB;</span>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Reports ({scammer.reportCount})
            </h2>
          </div>

          <div className="space-y-4">
            {scammer.reports.map((report) => (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                className="block p-4 bg-[var(--background-tertiary)] rounded-lg hover:bg-[var(--background-card)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-sm text-[var(--foreground-muted)]">
                    by{" "}
                    <span className="text-[var(--green-primary)]">
                      @{report.authorNickname}
                    </span>
                  </span>
                  <span className="text-sm text-[var(--red-primary)] font-bold">
                    {report.confirmCount} confirms
                  </span>
                </div>
                <p className="text-[var(--foreground)] line-clamp-3 mb-2">{report.reason}</p>
                {report.evidence && (
                  <p className="text-xs text-[var(--cyan-primary)] truncate">
                    Evidence: {report.evidence}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--foreground-dimmed)]">
                  <span>&#x1F4AC; {report.commentCount} comments</span>
                  <span>{formatDistanceToNow(new Date(report.createdAt))}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Shame message */}
        <div className="text-center">
          <ShameMessage />
        </div>
      </div>
    </div>
  );
}
