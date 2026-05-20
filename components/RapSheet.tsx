"use client";

interface RapSheetItem {
  key: string;
  value: string;
  valueColor?: string;
}

interface RapSheetProps {
  items?: RapSheetItem[];
}

const defaultItems: RapSheetItem[] = [
  { key: "first seen", value: "Mar 14, 2026" },
  { key: "tokens deployed", value: "14", valueColor: "#ff3b6c" },
  { key: "est. stolen", value: "$1.2M", valueColor: "#ff3b6c" },
  { key: "chain(s)", value: "SOL \u00B7 ETH" },
  { key: "linked twitters", value: "3" },
  { key: "pattern", value: "stealth-LP migration" },
  { key: "avg time-to-rug", value: "37 min" },
  { key: "status", value: "still active", valueColor: "#ffc547" },
];

export default function RapSheet({ items = defaultItems }: RapSheetProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>{"\u{1F4D1}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Rap sheet
        </span>
      </div>

      <div className="p-4 pt-1">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-baseline gap-2 py-2 border-b border-dashed border-[var(--border)] last:border-b-0 text-[12px]"
          >
            <span className="text-[var(--text-muted)] uppercase text-[11px] tracking-wide flex-shrink-0 w-[100px]">
              {item.key}
            </span>
            <span
              className="text-right flex-1 font-semibold"
              style={{ color: item.valueColor || "var(--text)" }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
