"use client";

interface Contributor {
  nickname: string;
  color: string;
}

interface BountyPoolProps {
  amount?: number;
  currency?: string;
  contributors?: Contributor[];
  onContribute?: () => void;
}

const defaultContributors: Contributor[] = [
  { nickname: "rugslayer.eth", color: "#ff3b9a" },
  { nickname: "etherdetective", color: "#7c5cff" },
  { nickname: "soliditysnitch", color: "#34d399" },
  { nickname: "0xforensics", color: "#22d3ee" },
  { nickname: "botbusterella", color: "#f472b6" },
];

export default function BountyPool({
  amount = 2180,
  currency = "USDC",
  contributors = defaultContributors,
  onContribute,
}: BountyPoolProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>{"\u{1F4B0}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Bounty pool
        </span>
        <span className="bg-[var(--border)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded-full font-mono">
          {contributors.length}
        </span>
      </div>

      <div
        className="p-[18px] text-center"
        style={{
          background: "radial-gradient(circle at center, rgba(255, 197, 71, 0.15), transparent 60%)",
        }}
      >
        <div className="font-display font-black text-[32px] text-[var(--gold)] tracking-tight">
          ${amount.toLocaleString()}
        </div>
        <div className="text-[var(--text-muted)] text-[11px] mt-0.5">
          {currency} {"\u00B7"} payable on legal action
        </div>

        {/* Stacked contributor avatars */}
        <div className="flex justify-center mt-3">
          {contributors.slice(0, 5).map((contributor, index) => (
            <div
              key={contributor.nickname}
              className="w-7 h-7 rounded-full border-2 border-[var(--surface)] flex items-center justify-center font-display font-black text-[11px] text-white"
              style={{
                background: contributor.color,
                marginLeft: index > 0 ? "-8px" : 0,
                zIndex: 5 - index,
              }}
            >
              {contributor.nickname[0].toUpperCase()}
            </div>
          ))}
          {contributors.length > 5 && (
            <div
              className="w-7 h-7 rounded-full border-2 border-[var(--surface)] flex items-center justify-center text-[10px] text-[var(--text-muted)] bg-[var(--border)]"
              style={{ marginLeft: "-8px" }}
            >
              +{contributors.length - 5}
            </div>
          )}
        </div>

        <button
          onClick={onContribute}
          className="mt-3.5 bg-[var(--gold)] text-[#2a1c00] px-[18px] py-2 rounded-md font-bold text-[12px] cursor-pointer hover:brightness-110 transition-all"
        >
          + contribute
        </button>
      </div>
    </div>
  );
}
