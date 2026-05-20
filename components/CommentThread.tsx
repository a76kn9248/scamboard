"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

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

type SortOption = "hot" | "new" | "top" | "oldest";

interface CommentThreadProps {
  reportId: string;
  comments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
}

// Calculate "hot" score with time decay
function getHotScore(comment: Comment): number {
  const ageInHours = (Date.now() - new Date(comment.createdAt).getTime()) / (1000 * 60 * 60);
  // Simple decay formula: score / (age + 2)^1.5
  return comment.score / Math.pow(ageInHours + 2, 1.5);
}

// Build comment tree from flat array
function buildCommentTree(flatComments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create map and initialize replies
  flatComments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  flatComments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parentId && commentMap.has(comment.parentId)) {
      const parent = commentMap.get(comment.parentId)!;
      parent.replies = parent.replies || [];
      parent.replies.push(commentWithReplies);
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  // Sort replies chronologically (oldest first) within each thread
  const sortRepliesChronologically = (comments: Comment[]): Comment[] => {
    return comments.map((comment) => ({
      ...comment,
      replies: comment.replies
        ? sortRepliesChronologically(
            [...comment.replies].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          )
        : [],
    }));
  };

  return sortRepliesChronologically(rootComments);
}


function CommentItem({
  comment,
  reportId,
  depth = 0,
  parentColor,
  onReply,
  onVote,
}: {
  comment: Comment;
  reportId: string;
  depth?: number;
  parentColor?: string;
  onReply: (parentId: string, newComment: Comment) => void;
  onVote: (commentId: string, score: number, userVote: number) => void;
}) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: replyText.trim(),
          parentId: comment.id,
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
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (value: number) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/comments/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
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

  // Use parent's author color for the left border when nested
  const borderColor = depth > 0 ? (parentColor || "var(--border)") : undefined;

  return (
    <div
      className={depth > 0 ? "ml-4 pl-4 border-l-2" : ""}
      style={depth > 0 ? { borderLeftColor: borderColor } : undefined}
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
              {"\u25B2"}
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
              {"\u25BC"}
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
                {error && (
                  <p className="text-[var(--red)] text-xs">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSubmitting}
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
              parentColor={comment.authorColor || "#7c5cff"}
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
  const [rawComments, setRawComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!initialComments);
  const [sortOption, setSortOption] = useState<SortOption>("hot");

  useEffect(() => {
    if (initialComments) {
      // Initial comments might be pre-fetched, use directly
      setRawComments(initialComments);
      setLoading(false);
    } else {
      fetchComments();
    }
  }, [reportId, initialComments]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/comments`);
      const data = await res.json();
      if (data.comments) {
        // API now returns flat array with parentId preserved
        setRawComments(data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Build tree and apply sorting to top-level comments only
  const sortedComments = useMemo(() => {
    const tree = buildCommentTree(rawComments);

    // Sort only top-level comments based on sortOption
    const sortedTree = [...tree].sort((a, b) => {
      switch (sortOption) {
        case "hot":
          return getHotScore(b) - getHotScore(a);
        case "new":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "top":
          return b.score - a.score;
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sortedTree;
  }, [rawComments, sortOption]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add comment");
        return;
      }

      // Add to raw comments array
      setRawComments((prev) => [data.comment, ...prev]);
      onCommentAdded?.(data.comment);
      setText("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentId: string, newComment: Comment) => {
    // Add new comment with parentId to raw comments
    setRawComments((prev) => [...prev, { ...newComment, parentId }]);
  };

  const handleVote = (commentId: string, score: number, userVote: number) => {
    setRawComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, score, userVote } : c
      )
    );
  };

  const countTotalComments = (comments: Comment[]): number => {
    return comments.reduce((count, c) => {
      return count + 1 + (c.replies ? countTotalComments(c.replies) : 0);
    }, 0);
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "hot", label: "Hot" },
    { value: "new", label: "New" },
    { value: "top", label: "Top" },
    { value: "oldest", label: "Oldest" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
          <span>{"\u{1F4AC}"}</span>
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
        <span>{"\u{1F4AC}"}</span>
        Comments ({countTotalComments(sortedComments)})
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

          {error && (
            <p className="text-[var(--red)] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
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

      {/* Sort tabs */}
      {rawComments.length > 0 && (
        <div className="flex items-center gap-1 pt-2">
          <span className="text-[var(--text-muted)] text-xs mr-2">Sort by:</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortOption(option.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                sortOption === option.value
                  ? "bg-[var(--red)] text-white"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Comment list */}
      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        {sortedComments.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm text-center py-4">
            No comments yet. Be the first to add intel.
          </p>
        ) : (
          sortedComments.map((comment) => (
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
