"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Subscammer {
  slug: string;
  name: string;
  reportCount?: number;
}

export default function SubscammerChips() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSub = searchParams.get("sub") || "all";
  const [communities, setCommunities] = useState<Subscammer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch communities from API
  useEffect(() => {
    fetch("/api/subscammers")
      .then((res) => res.json())
      .then((data) => {
        if (data.subscammers) {
          setCommunities(data.subscammers);
        }
      })
      .catch((err) => console.error("Error fetching communities:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChipClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("sub");
    } else {
      params.set("sub", slug);
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-1.5 px-[22px] bg-[var(--surface)] border-b border-[var(--border)] scrollbar-hide">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* All chip - always first */}
      <button
        onClick={() => handleChipClick("all")}
        className={`chip ${currentSub === "all" ? "active" : ""} flex-shrink-0`}
      >
        r/all
      </button>

      {loading ? (
        <span className="chip flex-shrink-0 text-[var(--text-faint)]">Loading...</span>
      ) : (
        communities.map((sub) => {
          const isActive = currentSub === sub.slug;
          return (
            <button
              key={sub.slug}
              onClick={() => handleChipClick(sub.slug)}
              className={`chip ${isActive ? "active" : ""} flex-shrink-0`}
            >
              r/{sub.slug}
              {sub.reportCount !== undefined && sub.reportCount > 0 && (
                <span className="ml-1 opacity-60">
                  {"\u00B7"} {sub.reportCount >= 1000 ? `${(sub.reportCount / 1000).toFixed(1)}k` : sub.reportCount}
                </span>
              )}
            </button>
          );
        })
      )}

      {/* Link to submit page to create new community */}
      <Link
        href="/submit"
        className="chip flex-shrink-0 text-[var(--text-faint)] hover:text-[var(--text-muted)]"
      >
        + new
      </Link>
    </div>
  );
}
