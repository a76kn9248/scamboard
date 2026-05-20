"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TurnstileWidget from "./TurnstileWidget";

interface Evidence {
  id: string;
  type: string;
  url: string;
  source: string;
  summary: string;
  addedByNickname: string;
  createdAt: string;
}

interface ReceiptsGalleryProps {
  reportId?: string;
  identifier?: string;
}

const tagColors: Record<string, string> = {
  tx: "#ffc547",
  screenshot: "#ff7a3a",
  contract: "#7c5cff",
  graph: "#5cd0e2",
  link: "#6ce28a",
};

const EVIDENCE_TYPES = ["tx", "screenshot", "contract", "graph", "link"];

export default function ReceiptsGallery({ reportId, identifier }: ReceiptsGalleryProps) {
  const { data: session } = useSession();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "tx",
    url: "",
    source: "",
    summary: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reportId) {
      fetchEvidence();
    } else {
      setLoading(false);
    }
  }, [reportId]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/evidence`);
      const data = await res.json();
      if (data.evidence) {
        setEvidence(data.evidence);
      }
    } catch (err) {
      console.error("Error fetching evidence:", err);
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
      const res = await fetch(`/api/reports/${reportId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add evidence");
        return;
      }

      setEvidence((prev) => [data.evidence, ...prev]);
      setFormData({ type: "tx", url: "", source: "", summary: "" });
      setShowForm(false);
      setTurnstileToken(null);
    } catch (err) {
      setError("Failed to add evidence");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
          <span>{"\u{1F9FE}"}</span>
          <span className="font-display font-black text-[14px] text-[var(--text)]">
            Receipts gallery
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
        <span>{"\u{1F9FE}"}</span>
        <span className="font-display font-black text-[14px] text-[var(--text)]">
          Receipts gallery
        </span>
        <span className="bg-[var(--border)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded-full font-mono">
          {evidence.length}
        </span>
        {session && reportId && (
          <span
            onClick={() => setShowForm(!showForm)}
            className="ml-auto text-[11px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--red)]"
          >
            {showForm ? "cancel" : "add evidence"} {"\u2192"}
          </span>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-[var(--border)] bg-[var(--surface)]">
          {error && (
            <div className="text-[var(--red)] text-sm mb-3">{error}</div>
          )}
          <div className="grid gap-3">
            <div className="flex gap-2">
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="input text-sm"
              >
                {EVIDENCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Source (e.g. solscan.io)"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="input text-sm flex-1"
                required
                maxLength={50}
              />
            </div>
            <input
              type="url"
              placeholder="Evidence URL"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="input text-sm"
              required
            />
            <input
              type="text"
              placeholder="Summary (max 120 chars)"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              className="input text-sm"
              required
              maxLength={120}
            />
            <TurnstileWidget onVerify={setTurnstileToken} />
            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Evidence"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
        {evidence.length === 0 ? (
          <div className="col-span-full text-center text-[var(--text-muted)] text-sm py-4">
            No evidence yet
          </div>
        ) : (
          evidence.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-[4/3] p-2 rounded-md border border-[var(--border)] cursor-pointer hover:border-[var(--red)] transition-colors font-mono text-[9px] flex flex-col justify-between"
              style={{
                background:
                  "repeating-linear-gradient(135deg, #1a1413 0 8px, #161110 8px 16px)",
              }}
            >
              <span
                className="self-start px-1.5 py-0.5 rounded bg-[var(--bg)]"
                style={{ color: tagColors[item.type] || "#ffc547" }}
              >
                {item.type}
              </span>
              <div>
                <div className="text-[var(--text-secondary)]">{item.source}</div>
                <div className="text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                  {item.summary}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
