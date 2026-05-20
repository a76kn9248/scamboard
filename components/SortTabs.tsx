"use client";

import { useSearchParams, useRouter } from "next/navigation";

const sortOptions = [
  { value: "hot", label: "Hot", icon: "\u{1F525}" },
  { value: "new", label: "New", icon: "\u{1F195}" },
  { value: "confirms", label: "Top confirmed", icon: "\u2B06" },
  { value: "controversial", label: "Controversial", icon: "\u{1F608}" },
  { value: "roasted", label: "Most roasted", icon: "\u{1F480}" },
  { value: "bountied", label: "Recently bountied", icon: "\u{1F4B0}" },
];

interface SortTabsProps {
  showDensity?: boolean;
}

export default function SortTabs({ showDensity = false }: SortTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get("sort") || "hot";

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 mb-3">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSortChange(option.value)}
          className={`sort-tab ${currentSort === option.value ? "active" : ""}`}
        >
          <span className="mr-1">{option.icon}</span>
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}

      {showDensity && (
        <span className="ml-auto text-[11px] text-[var(--text-muted)]">
          density: <u className="cursor-pointer">compact</u> {"\u00B7"} card
        </span>
      )}
    </div>
  );
}
