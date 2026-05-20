"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
      <h3 className="text-lg font-mono text-white border-b border-gray-800 pb-2">
        COMMENTS ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-gray-600 font-mono text-sm">
            No comments yet. Be the first to add intel.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#0d0d12] border border-gray-800 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 font-mono text-sm">
                  @{comment.authorNickname}
                </span>
                <span className="text-gray-600 font-mono text-xs">
                  {formatDistanceToNow(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add intel or evidence..."
            maxLength={500}
            rows={3}
            className="w-full bg-[#12121a] border border-gray-800 focus:border-green-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none resize-none transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-mono text-xs">
              {text.length}/500
            </span>
          </div>

          <TurnstileWidget
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
          />

          {error && (
            <p className="text-red-400 font-mono text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={!text.trim() || !turnstileToken || isSubmitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 font-mono text-sm transition-colors"
          >
            {isSubmitting ? "POSTING..." : "POST COMMENT"}
          </button>
        </form>
      ) : (
        <p className="text-gray-500 font-mono text-sm">
          <a href="/login" className="text-green-400 hover:underline">
            Login
          </a>{" "}
          to add a comment.
        </p>
      )}
    </div>
  );
}
