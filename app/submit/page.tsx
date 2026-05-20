"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TurnstileWidget from "@/components/TurnstileWidget";
import ShameMessage from "@/components/ShameMessage";
import ThreatBadge from "@/components/ThreatBadge";
import ScammerAvatar from "@/components/ScammerAvatar";

interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  reportCount: number;
}

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [type, setType] = useState<"deployer" | "twitter">("deployer");
  const [identifier, setIdentifier] = useState("");
  const [chain, setChain] = useState("ETH");
  const [selectedCommunity, setSelectedCommunity] = useState("general");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Community state
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [communityError, setCommunityError] = useState("");

  const CHAINS = [
    { value: "ETH", label: "Ethereum" },
    { value: "SOL", label: "Solana" },
    { value: "BSC", label: "BNB Chain" },
    { value: "BASE", label: "Base" },
    { value: "ARB", label: "Arbitrum" },
    { value: "MATIC", label: "Polygon" },
    { value: "AVAX", label: "Avalanche" },
    { value: "OTHER", label: "Other" },
  ];

  // Fetch communities on mount
  useEffect(() => {
    fetch("/api/subscammers")
      .then((res) => res.json())
      .then((data) => {
        if (data.subscammers) {
          setCommunities(data.subscammers);
        }
      })
      .catch((err) => console.error("Error fetching communities:", err))
      .finally(() => setLoadingCommunities(false));
  }, []);

  const handleCommunityChange = (value: string) => {
    if (value === "__create_new__") {
      setShowCreateNew(true);
      setSelectedCommunity("");
    } else {
      setShowCreateNew(false);
      setSelectedCommunity(value);
      setNewCommunityName("");
      setCommunityError("");
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunityName.trim()) return;

    setCreatingCommunity(true);
    setCommunityError("");

    try {
      const res = await fetch("/api/subscammers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCommunityName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCommunityError(data.error || "Failed to create community");
        return;
      }

      // Add to list and select it
      setCommunities((prev) => [...prev, { ...data.subscammer, reportCount: 0 }].sort((a, b) => a.slug.localeCompare(b.slug)));
      setSelectedCommunity(data.subscammer.slug);
      setShowCreateNew(false);
      setNewCommunityName("");
    } catch {
      setCommunityError("Network error. Please try again.");
    } finally {
      setCreatingCommunity(false);
    }
  };

  // Validate new community name input
  const handleNewCommunityInput = (value: string) => {
    // Only allow alphanumeric, spaces, and underscores, max 30 chars
    const cleaned = value.replace(/[^a-zA-Z0-9_\s]/g, "").slice(0, 30);
    setNewCommunityName(cleaned);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">&#x2620;</div>
          <ShameMessage />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">&#x1F512;</span>
          <h1 className="text-2xl font-bold text-[var(--red-primary)] mb-4">
            ACCESS DENIED
          </h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            You must be logged in to report a scammer.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="btn-primary">
              Login
            </Link>
            <Link href="/register" className="btn-secondary">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !reason || !turnstileToken) {
      setError("Please fill in all required fields and complete verification.");
      return;
    }

    if (!selectedCommunity && !showCreateNew) {
      setError("Please select a community.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          identifier: identifier.trim(),
          chain,
          category: selectedCommunity || "general",
          reason: reason.trim(),
          evidence: evidence.trim() || null,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit report");
        return;
      }

      router.push(`/report/${data.report.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display identifier for preview
  const displayIdentifier = type === "twitter" && identifier && !identifier.startsWith("@")
    ? `@${identifier}`
    : identifier || (type === "twitter" ? "@username" : "0x...");

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[var(--red-primary)] mb-2">
                &#x1F6A9; REPORT SCAMMER
              </h1>
              <p className="text-[var(--foreground-muted)]">
                Another scammer? Let&apos;s get &apos;em.
              </p>
              <div className="mt-2">
                <ShameMessage />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type toggle */}
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("deployer")}
                    className={`flex-1 py-3 rounded text-sm transition-colors ${
                      type === "deployer"
                        ? "bg-[rgba(170,0,255,0.2)] text-[var(--purple-primary)] border border-[var(--purple-primary)]"
                        : "bg-[var(--background-card)] text-[var(--foreground-muted)] border border-[var(--border)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    &#x1F4B0; DEPLOYER
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("twitter")}
                    className={`flex-1 py-3 rounded text-sm transition-colors ${
                      type === "twitter"
                        ? "bg-[rgba(41,121,255,0.2)] text-[var(--blue-primary)] border border-[var(--blue-primary)]"
                        : "bg-[var(--background-card)] text-[var(--foreground-muted)] border border-[var(--border)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    &#x1F426; TWITTER
                  </button>
                </div>
              </div>

              {/* Identifier */}
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  {type === "deployer" ? "Wallet Address" : "Twitter Handle"}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    type === "deployer"
                      ? "0x... or Solana address"
                      : "@scammer_handle"
                  }
                  className="input"
                />
              </div>

              {/* Chain */}
              {type === "deployer" && (
                <div>
                  <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                    Chain
                  </label>
                  <select
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    className="input"
                  >
                    {CHAINS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Community Selection */}
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  Community
                </label>
                {loadingCommunities ? (
                  <div className="input bg-[var(--background-card)] text-[var(--foreground-muted)]">
                    Loading communities...
                  </div>
                ) : (
                  <>
                    <select
                      value={showCreateNew ? "__create_new__" : selectedCommunity}
                      onChange={(e) => handleCommunityChange(e.target.value)}
                      className="input"
                    >
                      <option value="" disabled>Select a community</option>
                      {communities.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          r/{c.slug} - {c.name} ({c.reportCount})
                        </option>
                      ))}
                      <option value="__create_new__">+ Create new community</option>
                    </select>

                    {/* Create new community inline form */}
                    {showCreateNew && (
                      <div className="mt-3 p-4 border border-[var(--border)] rounded-lg bg-[var(--background-card)]">
                        <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                          New Community Name
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">r/</span>
                            <input
                              type="text"
                              value={newCommunityName}
                              onChange={(e) => handleNewCommunityInput(e.target.value)}
                              placeholder="community_name"
                              className="input pl-8"
                              maxLength={30}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleCreateCommunity}
                            disabled={!newCommunityName.trim() || creatingCommunity}
                            className="btn-secondary px-4 disabled:opacity-50"
                          >
                            {creatingCommunity ? "Creating..." : "Create"}
                          </button>
                        </div>
                        <p className="text-xs text-[var(--foreground-dimmed)] mt-2">
                          2-30 characters. Letters, numbers, and underscores only.
                        </p>
                        {communityError && (
                          <p className="text-[var(--red-primary)] text-sm mt-2">{communityError}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateNew(false);
                            setSelectedCommunity("general");
                            setNewCommunityName("");
                            setCommunityError("");
                          }}
                          className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] mt-2"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  Reason / Description
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the scam. What happened? Who was affected? Be specific."
                  rows={5}
                  className="input resize-none"
                />
                <div className="text-right text-xs text-[var(--foreground-dimmed)] mt-1">
                  {reason.length}/2000
                </div>
              </div>

              {/* Evidence */}
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  Evidence URL (optional)
                </label>
                <input
                  type="url"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="https://twitter.com/... or archive link"
                  className="input"
                />
              </div>

              {/* Turnstile */}
              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
              />

              {/* Error */}
              {error && (
                <p className="text-[var(--red-primary)] text-sm">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!identifier || !reason || !turnstileToken || isSubmitting || (!selectedCommunity && !showCreateNew)}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "SUBMITTING..." : "&#x1F6A9; SUBMIT REPORT"}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
              Preview
            </h2>
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl font-black text-[var(--foreground-dimmed)]">
                    #?
                  </div>
                  <ScammerAvatar
                    identifier={identifier || "preview"}
                    size="sm"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-[var(--foreground-muted)]">
                      r/{selectedCommunity || "general"}
                    </span>
                    <span
                      className={`badge ${
                        type === "deployer" ? "badge-purple" : "badge-success"
                      }`}
                    >
                      {type}
                    </span>
                    {type === "deployer" && (
                      <span className="badge bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
                        {chain}
                      </span>
                    )}
                    <ThreatBadge confirmCount={0} size="sm" />
                  </div>

                  <div className="text-lg font-bold text-[var(--foreground)] mb-2 truncate">
                    {displayIdentifier}
                  </div>

                  <p className="text-[var(--foreground-muted)] text-sm line-clamp-3 mb-3">
                    {reason || "Your reason will appear here..."}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[var(--foreground-dimmed)]">
                    <span className="text-[var(--green-primary)]">
                      @{session.user.name}
                    </span>
                    <span>just now</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[var(--red-primary)] text-lg font-bold">
                    &#x1F525; 0
                  </span>
                  <span className="text-xs text-[var(--foreground-dimmed)]">confirms</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--foreground-dimmed)] mt-4 text-center">
              This is how your report will appear on the board.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
