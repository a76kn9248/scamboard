"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface WallPost {
  id: string;
  body: string;
  authorNickname: string;
  authorColor: string;
  authorTitle: string;
  createdAt: string;
}

interface WallProps {
  userNickname: string;
  userColor: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function Wall({ userNickname, userColor }: WallProps) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/users/${userNickname}/wall?limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.wallPosts || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userNickname]);

  const handleSubmit = async () => {
    if (!postText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${userNickname}/wall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: postText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts([data.wallPost, ...posts]);
        setPostText("");
        setTotal(total + 1);
      }
    } catch (error) {
      console.error("Error posting to wall:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>{"\u{1F4AC}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          The wall
        </span>
        <span className="bg-[var(--border)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded-full font-mono">
          {total}
        </span>
      </div>

      {/* Post input */}
      {session && (
        <div className="flex gap-2.5 p-4 border-b border-[var(--border)] items-start">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-[14px] text-white flex-shrink-0"
            style={{ background: userColor }}
          >
            {session.user.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value.slice(0, 280))}
              placeholder={`Leave something on @${userNickname}'s wall...`}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md p-2.5 text-[12px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] resize-none"
              rows={2}
            />
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[10px] text-[var(--text-muted)]">
                {postText.length}/280
              </span>
              <button
                onClick={handleSubmit}
                disabled={!postText.trim() || submitting}
                className="btn-primary text-[11px] py-1.5 px-3 disabled:opacity-50"
              >
                {submitting ? "..." : "post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="p-6 text-center text-[var(--text-muted)] text-[12px]">
          No wall posts yet. Be the first to leave a message!
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex gap-2.5 p-4 border-b border-dashed border-[var(--border)] last:border-b-0"
            >
              <Link href={`/profile/${post.authorNickname}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-[14px] text-white flex-shrink-0 cursor-pointer"
                  style={{ background: post.authorColor }}
                >
                  {post.authorNickname[0].toUpperCase()}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] mb-1">
                  <Link
                    href={`/profile/${post.authorNickname}`}
                    className="font-bold hover:underline"
                    style={{ color: post.authorColor }}
                  >
                    @{post.authorNickname}
                  </Link>
                  <span className="text-[var(--text-muted)]">
                    {" "}{"\u00B7"} {post.authorTitle}
                  </span>
                </div>
                <p className="text-[var(--text)] text-[12.5px] leading-relaxed">
                  {post.body}
                </p>
                <div className="text-[10px] text-[var(--text-muted)] mt-1.5">
                  {formatTimeAgo(new Date(post.createdAt))} {"\u00B7"} {"\u25B2"} 0 {"\u00B7"} reply
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
