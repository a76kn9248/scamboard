"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import TurnstileWidget from "./TurnstileWidget";

interface Comment {
  id: string;
  text: string;
  authorNickname: string;
  createdAt: string;
}

interface CommentThreadProps {
  reportId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
}

export default function CommentThread({
  reportId,
  comments,
  onCommentAdded,
}: CommentThreadProps) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !turnstileToken || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add comment");
        return;
      }

      onCommentAdded(data.comment);
      setText("");
      setTurnstileToken("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
        <span>&#x1F4AC;</span>
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-[var(--foreground-muted)] text-sm text-center py-4">
            No comments yet. Be the first to add intel.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[var(--background-tertiary)] rounded-lg p-4 animate-fade-in"
            >
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/profile/${comment.authorNickname}`}
                  className="text-[var(--green-primary)] text-sm hover:underline"
                >
                  @{comment.authorNickname}
                </Link>
                <span className="text-[var(--foreground-dimmed)] text-xs">
                  {formatDistanceToNow(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="text-[var(--foreground)] text-sm whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-[var(--border)]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add intel or evidence..."
            maxLength={500}
            rows={3}
            className="input resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[var(--foreground-dimmed)] text-xs">
              {text.length}/500
            </span>
          </div>

          <TurnstileWidget
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
          />

          {error && (
            <p className="text-[var(--red-primary)] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={!text.trim() || !turnstileToken || isSubmitting}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-[var(--foreground-muted)] text-sm pt-4 border-t border-[var(--border)]">
          <Link href="/login" className="text-[var(--green-primary)] hover:underline">
            Login
          </Link>{" "}
          to add a comment.
        </p>
      )}
    </div>
  );
}
