"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TurnstileWidget from "./TurnstileWidget";
import ShameMessage from "./ShameMessage";

interface Roast {
  id: string;
  text: string;
  authorNickname: string;
  voteCount: number;
  createdAt: string;
  userHasVoted: boolean;
}

interface RoastSectionProps {
  reportId: string;
  identifier: string;
}

export default function RoastSection({ reportId, identifier }: RoastSectionProps) {
  const { data: session } = useSession();
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [shameLocked, setShameLocked] = useState(false);
  const [lockedRoastTitle, setLockedRoastTitle] = useState<string | null>(null);
  const [totalConfirms, setTotalConfirms] = useState(0);
  const [roastsUnlocked, setRoastsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newRoast, setNewRoast] = useState("");
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const fetchRoasts = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/roasts`);
      const data = await res.json();
      setRoasts(data.roasts || []);
      setShameLocked(data.shameLocked);
      setLockedRoastTitle(data.lockedRoastTitle);
      setTotalConfirms(data.totalConfirms);
      setRoastsUnlocked(data.roastsUnlocked);
    } catch (err) {
      console.error("Error fetching roasts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoasts();
  }, [reportId]);

  const handleSubmitRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !turnstileToken || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reports/${reportId}/roasts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newRoast, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit roast");
      }

      setNewRoast("");
      setTurnstileToken(null);
      setTurnstileKey((k) => k + 1);
      fetchRoasts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit roast");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (roastId: string) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/reports/${reportId}/roasts/${roastId}/vote`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to vote");
      }

      // Update local state
      setRoasts((prev) =>
        prev.map((r) =>
          r.id === roastId
            ? { ...r, voteCount: data.voteCount, userHasVoted: data.voted }
            : r
        )
      );

      if (data.shameLocked) {
        setShameLocked(true);
        setLockedRoastTitle(data.winningRoast);
      }
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-20" />
        <div className="skeleton h-20" />
      </div>
    );
  }

  // Show locked roast title
  if (shameLocked && lockedRoastTitle) {
    return (
      <div className="bg-[var(--background-card)] rounded-lg p-6 border border-[var(--gold-primary)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">&#x1F3C6;</span>
          <h3 className="text-lg font-bold text-[var(--gold-primary)]">
            Winning Roast Title
          </h3>
        </div>
        <p className="text-2xl font-bold animate-gold-shimmer text-transparent bg-clip-text">
          &ldquo;{lockedRoastTitle}&rdquo;
        </p>
        <p className="text-sm text-[var(--foreground-muted)] mt-4">
          This roast title has been permanently locked for this scammer.
        </p>
      </div>
    );
  }

  // Show unlock requirement
  if (!roastsUnlocked) {
    return (
      <div className="bg-[var(--background-card)] rounded-lg p-6 border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">&#x1F512;</span>
          <h3 className="text-lg font-bold text-[var(--foreground-muted)]">
            Roasts Locked
          </h3>
        </div>
        <p className="text-[var(--foreground-muted)]">
          This scammer needs <span className="text-[var(--red-primary)] font-bold">5 confirms</span> before
          the community can submit roast titles.
        </p>
        <p className="text-sm text-[var(--foreground-dimmed)] mt-2">
          Currently at {totalConfirms} confirm{totalConfirms !== 1 ? "s" : ""}.
        </p>
        <div className="mt-4">
          <ShameMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-card)] rounded-lg p-6 border border-[var(--border)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">&#x1F525;</span>
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          Roast Titles
        </h3>
        <span className="text-xs text-[var(--foreground-muted)]">
          ({roasts.length} submitted)
        </span>
      </div>

      {/* Info about locking */}
      <p className="text-xs text-[var(--foreground-muted)] mb-4">
        At 10+ confirms, the top-voted roast becomes this scammer&apos;s permanent title.
        Currently at {totalConfirms} confirms.
      </p>

      {/* Submit form */}
      {session ? (
        <form onSubmit={handleSubmitRoast} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoast}
              onChange={(e) => setNewRoast(e.target.value.slice(0, 60))}
              placeholder="Submit a roast title (max 60 chars)..."
              className="input flex-1"
              maxLength={60}
            />
            <button
              type="submit"
              disabled={!turnstileToken || submitting || newRoast.length < 3}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "..." : "Submit"}
            </button>
          </div>
          <div className="text-xs text-[var(--foreground-dimmed)] mt-1">
            {newRoast.length}/60 characters
          </div>
          {error && (
            <p className="text-[var(--red-primary)] text-sm mt-2">{error}</p>
          )}
          <div className="mt-3">
            <TurnstileWidget
              key={turnstileKey}
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>
        </form>
      ) : (
        <p className="text-[var(--foreground-muted)] text-sm mb-6">
          Login to submit and vote on roast titles.
        </p>
      )}

      {/* Roasts list */}
      {roasts.length === 0 ? (
        <p className="text-[var(--foreground-muted)] text-center py-4">
          No roasts submitted yet. Be the first!
        </p>
      ) : (
        <div className="space-y-2">
          {roasts.map((roast, index) => (
            <div
              key={roast.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                index === 0 && roast.voteCount > 0
                  ? "bg-[rgba(255,214,0,0.1)] border border-[var(--gold-primary)]"
                  : "bg-[var(--background-tertiary)]"
              }`}
            >
              <button
                onClick={() => handleVote(roast.id)}
                disabled={!session}
                className={`flex flex-col items-center px-2 py-1 rounded transition-colors ${
                  roast.userHasVoted
                    ? "text-[var(--gold-primary)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--gold-primary)]"
                } ${!session ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <span className="text-lg">&#x2B06;</span>
                <span className="text-xs font-bold">{roast.voteCount}</span>
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium ${
                    index === 0 && roast.voteCount > 0
                      ? "text-[var(--gold-primary)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  &ldquo;{roast.text}&rdquo;
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  by {roast.authorNickname}
                </p>
              </div>
              {index === 0 && roast.voteCount > 0 && (
                <span className="text-lg">&#x1F451;</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
