"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import TurnstileWidget from "./TurnstileWidget";

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

interface CommentThreadProps {
  reportId: string;
  comments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
}

function CommentItem({
  comment,
  reportId,
  depth = 0,
  onReply,
  onVote,
}: {
  comment: Comment;
  reportId: string;
  depth?: number;
  onReply: (parentId: string, newComment: Comment) => void;
  onVote: (commentId: string, score: number, userVote: number) => void;
}) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !turnstileToken || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: replyText.trim(),
          parentId: comment.id,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add reply");
        return;
      }

      onReply(comment.id, data.comment);
      setReplyText("");
      setShowReplyForm(false);
      setTurnstileToken("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (value: number) => {
    if (!turnstileToken) return;

    try {
      const res = await fetch(`/api/comments/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, turnstileToken }),
      });

      if (res.ok) {
        const data = await res.json();
        onVote(comment.id, data.score, data.userVote);
      }
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const maxDepth = 3;
  const canReply = depth < maxDepth;

  return (
    <div
      className={depth > 0 ? "ml-4 pl-4 border-l-2 border-[var(--border)]" : ""}
    >
      <div className="bg-[var(--surface)] rounded-lg p-4 animate-fade-in">
        <div className="flex gap-3">
          {/* Voting */}
          <div className="flex flex-col items-center gap-1 text-xs">
            <button
              onClick={() => session && handleVote(1)}
              className={`${comment.userVote === 1 ? "text-[var(--green)]" : "text-[var(--text-muted)]"} hover:text-[var(--green)] disabled:opacity-50`}
              disabled={!session}
            >
              ▲
            </button>
            <span
              className={`font-bold ${comment.score > 0 ? "text-[var(--green)]" : comment.score < 0 ? "text-[var(--red)]" : "text-[var(--text-muted)]"}`}
            >
              {comment.score}
            </span>
            <button
              onClick={() => session && handleVote(-1)}
              className={`${comment.userVote === -1 ? "text-[var(--red)]" : "text-[var(--text-muted)]"} hover:text-[var(--red)] disabled:opacity-50`}
              disabled={!session}
            >
              ▼
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: comment.authorColor || "#7c5cff" }}
              >
                {comment.authorNickname[0].toUpperCase()}
              </div>
              <Link
                href={`/profile/${comment.authorNickname}`}
                className="text-sm hover:underline"
                style={{ color: comment.authorColor || "var(--green)" }}
              >
                @{comment.authorNickname}
              </Link>
              <span className="text-[var(--text-muted)] text-xs">
                {formatDistanceToNow(new Date(comment.createdAt))}
              </span>
            </div>
            <p className="text-[var(--text)] text-sm whitespace-pre-wrap">
              {comment.text}
            </p>

            {/* Actions */}
            <div className="flex gap-4 mt-2 text-xs text-[var(--text-muted)]">
              {canReply && session && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="hover:text-[var(--text)]"
                >
                  reply
                </button>
              )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
              <form onSubmit={handleReply} className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  maxLength={500}
                  rows={2}
                  className="input resize-none text-sm"
                />
                <TurnstileWidget
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken("")}
                />
                {error && (
                  <p className="text-[var(--red)] text-xs">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!replyText.trim() || !turnstileToken || isSubmitting}
                    className="btn-secondary text-xs py-1 px-3 disabled:opacity-50"
                  >
                    {isSubmitting ? "Posting..." : "Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              reportId={reportId}
              depth={depth + 1}
              onReply={onReply}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThread({
  reportId,
  comments: initialComments,
  onCommentAdded,
}: CommentThreadProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [text, setText] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!initialComments);

  useEffect(() => {
    if (!initialComments) {
      fetchComments();
    }
  }, [reportId, initialComments]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/comments`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

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

      setComments((prev) => [data.comment, ...prev]);
      onCommentAdded?.(data.comment);
      setText("");
      setTurnstileToken("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentId: string, newComment: Comment) => {
    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newComment],
          };
        }
        if (c.replies) {
          return {
            ...c,
            replies: addReplyToComment(c.replies),
          };
        }
        return c;
      });
    };

    setComments(addReplyToComment(comments));
  };

  const handleVote = (commentId: string, score: number, userVote: number) => {
    const updateVoteInComments = (comments: Comment[]): Comment[] => {
      return comments.map((c) => {
        if (c.id === commentId) {
          return { ...c, score, userVote };
        }
        if (c.replies) {
          return {
            ...c,
            replies: updateVoteInComments(c.replies),
          };
        }
        return c;
      });
    };

    setComments(updateVoteInComments(comments));
  };

  const countTotalComments = (comments: Comment[]): number => {
    return comments.reduce((count, c) => {
      return count + 1 + (c.replies ? countTotalComments(c.replies) : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
          <span>&#x1F4AC;</span>
          Comments
        </h3>
        <div className="text-center text-[var(--text-muted)] py-4">
          Loading comments...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
        <span>&#x1F4AC;</span>
        Comments ({countTotalComments(comments)})
      </h3>

      {/* Add comment form */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add intel or evidence..."
            maxLength={500}
            rows={3}
            className="input resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-xs">
              {text.length}/500
            </span>
          </div>

          <TurnstileWidget
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
          />

          {error && (
            <p className="text-[var(--red)] text-sm">{error}</p>
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
        <p className="text-[var(--text-muted)] text-sm">
          <Link href="/login" className="text-[var(--green)] hover:underline">
            Login
          </Link>{" "}
          to add a comment.
        </p>
      )}

      {/* Comment list */}
      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        {comments.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm text-center py-4">
            No comments yet. Be the first to add intel.
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              reportId={reportId}
              onReply={handleReply}
              onVote={handleVote}
            />
          ))
        )}
      </div>
    </div>
  );
}
