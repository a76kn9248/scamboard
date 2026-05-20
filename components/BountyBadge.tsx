"use client";

interface BountyBadgeProps {
  count: number;
  onClick?: () => void;
  interactive?: boolean;
}

export default function BountyBadge({
  count,
  onClick,
  interactive = false,
}: BountyBadgeProps) {
  if (count === 0) return null;

  const Component = interactive ? "button" : "div";

  return (
    <Component
      onClick={interactive ? onClick : undefined}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
        bg-[rgba(255,145,0,0.2)] text-[var(--orange-primary)] border border-[rgba(255,145,0,0.3)]
        ${interactive ? "cursor-pointer hover:bg-[rgba(255,145,0,0.3)] transition-colors" : ""}`}
    >
      <span>&#x1F4B0;</span>
      <span>{count} want{count === 1 ? "s" : ""} evidence</span>
    </Component>
  );
}
