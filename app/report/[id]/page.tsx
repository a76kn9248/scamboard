"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import CommentThread from "@/components/CommentThread";
import TurnstileWidget from "@/components/TurnstileWidget";
import ThreatBadge from "@/components/ThreatBadge";
import ScammerAvatar from "@/components/ScammerAvatar";
import RoastSection from "@/components/RoastSection";
import BountyBadge from "@/components/BountyBadge";
import ShameMessage from "@/components/ShameMessage";

interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorNickname: string;
  authorColor?: string;
  parentId?: string | null;
  score: number;
  userVote: number;
  createdAt: string;
  replies?: Comment[];
}

interface Report {
  id: string;
  type: string;
  identifier: string;
  reason: string;
  evidence: string | null;
  authorNickname: string;
  confirmCount: number;
  userHasConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  roastTitle?: string | null;
  shameLocked?: boolean;
}

interface BountyData {
  count: number;
  userHasBounty: boolean;
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [bountyData, setBountyData] = useState<BountyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/reports/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch report");
          return;
        }

        setReport(data.report);

        // Fetch bounty data
        const bountyRes = await fetch(`/api/reports/${id}/bounty`);
        if (bountyRes.ok) {
          const bountyData = await bountyRes.json();
          setBountyData(bountyData);
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleConfirm = async () => {
    if (!session || !turnstileToken || isConfirming) return;

    setIsConfirming(true);
    setConfirmError("");

    try {
      const res = await fetch(`/api/reports/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setConfirmError(data.error || "Failed to confirm");
        return;
      }

      setReport((prev) =>
        prev
          ? {
              ...prev,
              confirmCount: data.confirmCount,
              userHasConfirmed: data.confirmed,
            }
          : null
      );
      setTurnstileToken("");
    } catch {
      setConfirmError("Network error. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCommentAdded = (comment: Comment) => {
    setReport((prev) =>
      prev ? { ...prev, comments: [...prev.comments, comment] } : null
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-64 rounded-lg mb-6" />
          <div className="skeleton h-32 rounded-lg mb-6" />
          <div className="skeleton h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">&#x1F6AB;</span>
          <h1 className="text-2xl font-bold text-[var(--red-primary)] mb-4">
            {error || "Report Not Found"}
          </h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            This report may have been removed or never existed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm mb-6 block transition-colors"
        >
          &larr; Back
        </button>

        {/* Report header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <ScammerAvatar identifier={report.identifier} size="xl" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span
                  className={`badge ${
                    report.type === "deployer" ? "badge-purple" : "badge-success"
                  }`}
                >
                  {report.type}
                </span>
                <ThreatBadge confirmCount={report.confirmCount} size="md" />
                {bountyData && bountyData.count > 0 && (
                  <BountyBadge count={bountyData.count} />
                )}
              </div>

              {/* Identifier */}
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2 break-all">
                {report.type === "twitter" ? "@" : ""}
                {report.identifier}
              </h1>

              {/* Roast Title */}
              {report.roastTitle && (
                <p className="roast-title text-xl mb-4 animate-gold-shimmer text-transparent bg-clip-text">
                  {report.roastTitle}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                <span>
                  Reported by{" "}
                  <Link
                    href={`/profile/${report.authorNickname}`}
                    className="text-[var(--green-primary)] hover:underline"
                  >
                    @{report.authorNickname}
                  </Link>
                </span>
                <span>{formatDistanceToNow(new Date(report.createdAt))}</span>
              </div>
            </div>

            {/* View scammer profile */}
            <Link
              href={`/scammer/${encodeURIComponent(report.identifier)}`}
              className="btn-secondary text-sm py-2 px-4 flex-shrink-0"
            >
              View Full Profile
            </Link>
          </div>
        </div>

        {/* Reason & Evidence */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
            &#x1F4DD; Report Details
          </h2>
          <div className="mb-4">
            <h3 className="text-sm text-[var(--foreground-muted)] mb-2">Reason</h3>
            <p className="text-[var(--foreground)] whitespace-pre-wrap">
              {report.reason}
            </p>
          </div>

          {report.evidence && (
            <div>
              <h3 className="text-sm text-[var(--foreground-muted)] mb-2">Evidence</h3>
              <a
                href={report.evidence}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--cyan-primary)] hover:underline break-all"
              >
                {report.evidence}
              </a>
            </div>
          )}
        </div>

        {/* Confirm section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-[var(--red-primary)]">
                {report.confirmCount}
              </span>
              <div>
                <div className="text-[var(--foreground)]">Confirms</div>
                {report.userHasConfirmed && (
                  <div className="text-sm text-[var(--green-primary)]">
                    &#x2705; You confirmed this
                  </div>
                )}
              </div>
            </div>
          </div>

          {session ? (
            <>
              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
              />

              {confirmError && (
                <p className="text-[var(--red-primary)] text-sm mb-3">{confirmError}</p>
              )}

              <button
                onClick={handleConfirm}
                disabled={!turnstileToken || isConfirming}
                className={`w-full py-3 rounded font-medium transition-all ${
                  report.userHasConfirmed
                    ? "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-card)]"
                    : "btn-primary"
                } disabled:opacity-50 disabled:cursor-not-allowed ${
                  !report.userHasConfirmed && turnstileToken ? "animate-pulse-red" : ""
                }`}
              >
                {isConfirming
                  ? "Processing..."
                  : report.userHasConfirmed
                  ? "Remove Confirm"
                  : "&#x1F525; CONFIRM SCAMMER"}
              </button>
            </>
          ) : (
            <p className="text-[var(--foreground-muted)]">
              <Link href="/login" className="text-[var(--green-primary)] hover:underline">
                Login
              </Link>{" "}
              to confirm this report.
            </p>
          )}
        </div>

        {/* Roast Section */}
        <div className="mb-6">
          <RoastSection reportId={report.id} identifier={report.identifier} />
        </div>

        {/* Comments */}
        <div className="card p-6">
          <CommentThread
            reportId={report.id}
            comments={report.comments}
            onCommentAdded={handleCommentAdded}
          />
        </div>

        {/* Shame message */}
        <div className="text-center mt-8">
          <ShameMessage />
        </div>
      </div>
    </div>
  );
}
