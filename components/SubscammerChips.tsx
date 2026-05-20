"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Subscammer {
  slug: string;
  name: string;
  count?: number;
}

interface SubscammerChipsProps {
  subscammers?: Subscammer[];
}

const defaultSubscammers: Subscammer[] = [
  { slug: "all", name: "all", count: undefined },
  { slug: "rugpulls", name: "rugpulls", count: 1200 },
  { slug: "honeypots", name: "honeypots", count: 482 },
  { slug: "twitterscams", name: "twitterscams", count: 891 },
  { slug: "alphafrauds", name: "alphafrauds", count: 214 },
  { slug: "bridgehacks", name: "bridgehacks", count: 67 },
  { slug: "discord_scams", name: "discord_scams", count: 309 },
  { slug: "under_investigation", name: "under_investigation", count: 41 },
];

export default function SubscammerChips({ subscammers = defaultSubscammers }: SubscammerChipsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSub = searchParams.get("sub") || "all";
  const [showSuggestMessage, setShowSuggestMessage] = useState(false);

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

      {subscammers.map((sub) => {
        const isActive = currentSub === sub.slug;
        return (
          <button
            key={sub.slug}
            onClick={() => handleChipClick(sub.slug)}
            className={`chip ${isActive ? "active" : ""} flex-shrink-0`}
          >
            r/{sub.name}
            {sub.count !== undefined && (
              <span className="ml-1 opacity-60">
                {"\u00B7"} {sub.count >= 1000 ? `${(sub.count / 1000).toFixed(1)}k` : sub.count}
              </span>
            )}
          </button>
        );
      })}

      <div className="relative">
        <button
          onClick={() => setShowSuggestMessage(!showSuggestMessage)}
          className="chip flex-shrink-0 text-[var(--text-faint)] hover:text-[var(--text-muted)]"
        >
          + suggest
        </button>
        {showSuggestMessage && (
          <div className="absolute top-full right-0 mt-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-50 w-64 text-xs text-[var(--text-muted)]">
            <p className="mb-2">
              <strong className="text-[var(--text)]">Want a new category?</strong>
            </p>
            <p>
              Suggest it in the comments of any report. If enough people agree, we&apos;ll add it!
            </p>
            <button
              onClick={() => setShowSuggestMessage(false)}
              className="mt-2 text-[var(--red)] hover:underline"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
