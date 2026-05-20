"use client";

interface MoodWidgetProps {
  mood: string;
  currentlyDoing?: string;
  specialty?: string;
  chainMain?: string;
  memberSince?: string;
  userColor: string;
  editable?: boolean;
  onEdit?: () => void;
}

export default function MoodWidget({
  mood,
  currentlyDoing,
  specialty,
  chainMain,
  memberSince,
  userColor,
  editable = false,
  onEdit,
}: MoodWidgetProps) {
  const rows = [
    { key: "mood", value: mood || "vibing" },
    { key: "currently", value: currentlyDoing || "lurking" },
    { key: "specialty", value: specialty || "general degen" },
    { key: "chain main", value: chainMain || "ETH" },
    { key: "member since", value: memberSince || "recent" },
  ];

  return (
    <div className="border-t border-dashed border-[var(--border)] py-3 px-4">
      {editable && (
        <button
          onClick={onEdit}
          className="text-[var(--text-muted)] text-[10px] cursor-pointer hover:text-[var(--text)] float-right"
        >
          edit
        </button>
      )}

      {rows.map((row, index) => (
        <div
          key={index}
          className="flex justify-between py-1.5 text-[12px]"
        >
          <span className="text-[var(--text-muted)]">{row.key}</span>
          <span
            className="text-[var(--text)] font-bold"
            style={{ color: index === 0 ? userColor : undefined }}
          >
            {row.value}
            {index === 0 && " \u{1F5E1}"}
          </span>
        </div>
      ))}
    </div>
  );
}
