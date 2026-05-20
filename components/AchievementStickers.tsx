"use client";

interface Sticker {
  text: string;
  colorClass: "gold" | "red" | "green" | "purple" | "cyan";
}

interface AchievementStickersProps {
  stickers?: Sticker[];
}

const defaultStickers: Sticker[] = [
  { text: "\u{1F947} Top hunter, Q1", colorClass: "gold" },
  { text: "\u{1F480} Caught a legendary", colorClass: "red" },
  { text: "\u{1F3AF} 100% confirm rate", colorClass: "gold" },
  { text: "\u{1F525} 14-day streak", colorClass: "green" },
  { text: "\u2728 Roast champion \u00B7 17\u00D7", colorClass: "purple" },
  { text: "\u{1F6E1} Saved $400k (est.)", colorClass: "red" },
  { text: "\u{1F441} First to spot \u00B7 8\u00D7", colorClass: "gold" },
  { text: "\u{1F9EC} Pattern detector", colorClass: "green" },
];

const colorMap = {
  gold: { color: "#ffc547", bg: "#2a2010" },
  red: { color: "#ff3b6c", bg: "#2c1418" },
  green: { color: "#6ce28a", bg: "#102a1c" },
  purple: { color: "#b58aff", bg: "#1f1430" },
  cyan: { color: "#5cd0e2", bg: "#0f2028" },
};

export default function AchievementStickers({ stickers = defaultStickers }: AchievementStickersProps) {
  return (
    <div className="border-t border-dashed border-[var(--border)] py-3 px-4 flex flex-wrap gap-1.5">
      {stickers.map((sticker, index) => {
        const colors = colorMap[sticker.colorClass];
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 font-display font-black text-[9px] rounded border-[1.5px] border-current uppercase tracking-wide"
            style={{
              color: colors.color,
              background: colors.bg,
              transform: `rotate(${index % 2 === 0 ? -2 : 1}deg)`,
            }}
          >
            {sticker.text}
          </span>
        );
      })}
    </div>
  );
}
