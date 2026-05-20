"use client";

interface Receipt {
  id: string;
  tag: string;
  source: string;
  summary: string;
}

interface ReceiptsGalleryProps {
  receipts?: Receipt[];
}

const mockReceipts: Receipt[] = [
  { id: "1", tag: "tx", source: "solscan.io", summary: "LP migration \u00B7 1,247 SOL out" },
  { id: "2", tag: "screenshot", source: "twitter", summary: "@jeetcoin_dev \u2014 \"lol\"" },
  { id: "3", tag: "tx", source: "solscan.io", summary: "Tornado in \u00B7 9h pre-deploy" },
  { id: "4", tag: "screenshot", source: "discord", summary: "\"buy now, locked LP\"" },
  { id: "5", tag: "graph", source: "arkham", summary: "wallet cluster \u00B7 11 EOAs" },
  { id: "6", tag: "tx", source: "solscan.io", summary: "BAGRUG drain \u00B7 412 SOL" },
  { id: "7", tag: "screenshot", source: "telegram", summary: "pre-launch shill group" },
  { id: "8", tag: "contract", source: "solscan.io", summary: "hidden mint fn line 218" },
];

export default function ReceiptsGallery({ receipts = mockReceipts }: ReceiptsGalleryProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>{"\u{1F9FE}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Receipts gallery
        </span>
        <span className="bg-[var(--border)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded-full font-mono">
          {receipts.length}
        </span>
        <span className="ml-auto text-[11px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--red)]">
          add evidence {"\u2192"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            className="aspect-[4/3] p-2 rounded-md border border-[var(--border)] cursor-pointer hover:border-[var(--red)] transition-colors font-mono text-[9px] flex flex-col justify-between"
            style={{
              background: "repeating-linear-gradient(135deg, #1a1413 0 8px, #161110 8px 16px)",
            }}
          >
            <span
              className="self-start px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--gold)]"
            >
              {receipt.tag}
            </span>
            <div>
              <div className="text-[var(--text-secondary)]">{receipt.source}</div>
              <div className="text-[var(--text-secondary)] mt-0.5">{receipt.summary}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
