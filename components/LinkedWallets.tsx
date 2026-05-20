"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TurnstileWidget from "./TurnstileWidget";

interface LinkedWallet {
  id: string;
  identifier: string;
  type: string;
  relationship: string;
  confirms: number;
  addedByNickname: string;
  createdAt: string;
}

interface LinkedWalletsProps {
  reportId?: string;
  identifier?: string;
}

const typeColors: Record<string, string> = {
  deployer: "#ff3b6c",
  twitter: "#7c5cff",
};

export default function LinkedWallets({ reportId, identifier }: LinkedWalletsProps) {
  const { data: session } = useSession();
  const [wallets, setWallets] = useState<LinkedWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    type: "deployer",
    relationship: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reportId) {
      fetchWallets();
    } else {
      setLoading(false);
    }
  }, [reportId]);

  const fetchWallets = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/linked-wallets`);
      const data = await res.json();
      if (data.linkedWallets) {
        setWallets(data.linkedWallets);
      }
    } catch (err) {
      console.error("Error fetching linked wallets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken || !reportId) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reports/${reportId}/linked-wallets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add linked wallet");
        return;
      }

      setWallets((prev) => [data.linkedWallet, ...prev]);
      setFormData({ identifier: "", type: "deployer", relationship: "" });
      setShowForm(false);
      setTurnstileToken(null);
    } catch (err) {
      setError("Failed to add linked wallet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (walletId: string) => {
    if (!turnstileToken) return;

    try {
      const res = await fetch(
        `/api/reports/${reportId}/linked-wallets/${walletId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ turnstileToken }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setWallets((prev) =>
          prev.map((w) =>
            w.id === walletId ? { ...w, confirms: data.confirms } : w
          )
        );
      }
    } catch (err) {
      console.error("Error confirming wallet:", err);
    }
  };

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
          <span>{"\u{1F517}"}</span>
          <span className="font-display font-black text-[14px] text-[var(--text)]">
            Linked wallets & aliases
          </span>
        </div>
        <div className="p-4 text-center text-[var(--text-muted)] text-sm">
          Loading...
        </div>
      </div>
    );
  }

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
        {session && reportId && (
          <span
            onClick={() => setShowForm(!showForm)}
            className="ml-auto text-[11px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--red)]"
          >
            {showForm ? "cancel" : "add linked wallet"} {"\u2192"}
          </span>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-[var(--border)] bg-[var(--surface)]">
          {error && (
            <div className="text-[var(--red)] text-sm mb-3">{error}</div>
          )}
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Wallet address or @handle"
              value={formData.identifier}
              onChange={(e) =>
                setFormData({ ...formData, identifier: e.target.value })
              }
              className="input text-sm"
              required
              minLength={3}
            />
            <div className="flex gap-2">
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="input text-sm flex-1"
              >
                <option value="deployer">Deployer Wallet</option>
                <option value="twitter">Twitter Handle</option>
              </select>
              <input
                type="text"
                placeholder="Relationship (e.g. funded primary)"
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value })
                }
                className="input text-sm flex-[2]"
                required
                maxLength={100}
              />
            </div>
            <TurnstileWidget onVerify={setTurnstileToken} />
            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Linked Wallet"}
            </button>
          </div>
        </form>
      )}

      <div className="p-4">
        {wallets.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] text-sm py-4">
            No linked wallets yet
          </div>
        ) : (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center gap-2.5 py-2 border-b border-dashed border-[var(--border)] last:border-b-0"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: typeColors[wallet.type] || "#8a7d72",
                  boxShadow: `0 0 8px ${typeColors[wallet.type] || "#8a7d72"}`,
                }}
              />
              <span className="font-mono text-[11px] text-[var(--text-secondary)] flex-1 truncate">
                {wallet.identifier}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                {wallet.relationship}
              </span>
              <span
                onClick={() => session && handleConfirm(wallet.id)}
                className={`text-[var(--red)] font-bold text-[11px] ${session ? "cursor-pointer hover:underline" : ""}`}
              >
                {wallet.confirms}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
