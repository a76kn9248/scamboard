"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "@/lib/utils";
import CommentThread from "@/components/CommentThread";
import TurnstileWidget from "@/components/TurnstileWidget";

interface Comment {
  id: string;
  text: string;
  authorNickname: string;
  createdAt: string;
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
}

function getThreatLevel(confirms: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (confirms >= 20) {
    return {
      label: "EXTREME",
      color: "text-red-400",
      bgColor: "bg-red-500/20 border-red-500/50",
    };
  }
  if (confirms >= 10) {
    return {
      label: "HIGH",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20 border-orange-500/50",
    };
  }
  if (confirms >= 5) {
    return {
      label: "MEDIUM",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20 border-yellow-500/50",
    };
  }
  return {
    label: "LOW",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20 border-gray-500/50",
  };
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
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="text-gray-500 font-mono">LOADING...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="text-red-400 font-mono mb-4">{error || "Report not found"}</div>
        <button
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-white font-mono text-sm"
        >
          &larr; BACK TO BOARD
        </button>
      </div>
    );
  }

  const threat = getThreatLevel(report.confirmCount);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => router.push("/")}
        className="text-gray-500 hover:text-white font-mono text-sm mb-6 block"
      >
        &larr; BACK TO BOARD
      </button>

      {/* Report header */}
      <div className="bg-[#0d0d12] border border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {/* Type badge */}
          <span
            className={`px-2 py-0.5 text-xs font-mono uppercase ${
              report.type === "deployer"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/50"
            }`}
          >
            {report.type}
          </span>

          {/* Threat level */}
          <span
            className={`px-2 py-0.5 text-xs font-mono border ${threat.bgColor} ${threat.color}`}
          >
            {threat.label} THREAT
          </span>
        </div>

        {/* Identifier */}
        <h1 className="text-2xl font-mono text-white mb-4 break-all">
          {report.type === "twitter" ? `@${report.identifier}` : report.identifier}
        </h1>

        {/* Reason */}
        <div className="mb-4">
          <h2 className="text-sm text-gray-500 font-mono mb-2">REASON</h2>
          <p className="text-gray-300 font-mono whitespace-pre-wrap">
            {report.reason}
          </p>
        </div>

        {/* Evidence */}
        {report.evidence && (
          <div className="mb-4">
            <h2 className="text-sm text-gray-500 font-mono mb-2">EVIDENCE</h2>
            <a
              href={report.evidence}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-mono text-sm break-all"
            >
              {report.evidence}
            </a>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-600 border-t border-gray-800 pt-4 mt-4">
          <span>
            Reported by{" "}
            <span className="text-green-500">@{report.authorNickname}</span>
          </span>
          <span>{formatDistanceToNow(new Date(report.createdAt))}</span>
        </div>
      </div>

      {/* Confirm section */}
      <div className="bg-[#0d0d12] border border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-3xl font-bold text-red-400 font-mono">
              {report.confirmCount}
            </span>
            <span className="text-gray-500 font-mono ml-2">CONFIRMS</span>
          </div>
          {report.userHasConfirmed && (
            <span className="text-green-400 font-mono text-sm">
              YOU CONFIRMED THIS
            </span>
          )}
        </div>

        {session ? (
          <>
            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
            />

            {confirmError && (
              <p className="text-red-400 font-mono text-sm mb-3">{confirmError}</p>
            )}

            <button
              onClick={handleConfirm}
              disabled={!turnstileToken || isConfirming}
              className={`w-full py-3 font-mono text-sm transition-colors ${
                report.userHasConfirmed
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-red-600 hover:bg-red-700 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isConfirming
                ? "PROCESSING..."
                : report.userHasConfirmed
                ? "REMOVE CONFIRM"
                : "CONFIRM SCAMMER"}
            </button>
          </>
        ) : (
          <p className="text-gray-500 font-mono text-sm">
            <a href="/login" className="text-green-400 hover:underline">
              Login
            </a>{" "}
            to confirm this report.
          </p>
        )}
      </div>

      {/* Comments */}
      <div className="bg-[#0d0d12] border border-gray-800 p-6">
        <CommentThread
          reportId={report.id}
          comments={report.comments}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </div>
  );
}
