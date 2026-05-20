"use client";

interface LinkedWallet {
  address: string;
  color: string;
  relationship: string;
  confirms: number | string;
}

interface LinkedWalletsProps {
  wallets?: LinkedWallet[];
}

const mockWallets: LinkedWallet[] = [
  { address: "0x8a3F19c4b6d2E14e0b9c81f9b73a4eAaC7d2901B", color: "#ff3b6c", relationship: "PRIMARY \u00B7 this case", confirms: 287 },
  { address: "0x42aeFf09812bB1c9aA4f8d11de2C29c66E901aaA", color: "#ff7a3a", relationship: "funded primary \u00B7 9h pre-deploy", confirms: 92 },
  { address: "0x9100c441D9eC4F2b81fEd4dfBb12CE6cD401fffe", color: "#ffc547", relationship: "received drained LP", confirms: 38 },
  { address: "@moonboi_dev", color: "#7c5cff", relationship: "twitter shill account", confirms: 144 },
  { address: "0x77abEEdc119fF1b1cE2cE3441b8a2c1F71eFe211", color: "#5cd0e2", relationship: "same deploy pattern", confirms: 14 },
  { address: "+ 6 more wallets", color: "#8a7d72", relationship: "suspected \u00B7 awaiting confirmation", confirms: "\u2014" },
];

export default function LinkedWallets({ wallets = mockWallets }: LinkedWalletsProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
        <span>{"\u{1F517}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Linked wallets & aliases
        </span>
        <span className="bg-[var(--border)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded-full font-mono">
          {wallets.length}
        </span>
        <span className="ml-auto text-[11px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--red)]">
          view graph {"\u2192"}
        </span>
      </div>

      <div className="p-4">
        {wallets.map((wallet, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 py-2 border-b border-dashed border-[var(--border)] last:border-b-0"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: wallet.color, boxShadow: `0 0 8px ${wallet.color}` }}
            />
            <span className="font-mono text-[11px] text-[var(--text-secondary)] flex-1 truncate">
              {wallet.address}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
              {wallet.relationship}
            </span>
            <span className="text-[var(--red)] font-bold text-[11px]">
              {wallet.confirms}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
