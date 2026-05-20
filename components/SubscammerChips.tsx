"use client";

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

      <button className="chip flex-shrink-0 text-[var(--text-faint)]">+ new</button>
    </div>
  );
}
