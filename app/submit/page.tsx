"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [type, setType] = useState<"deployer" | "twitter">("deployer");
  const [identifier, setIdentifier] = useState("");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="text-gray-500 font-mono">LOADING...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">ACCESS DENIED</h1>
        <p className="text-gray-500 font-mono mb-4">
          You must be logged in to submit a report.
        </p>
        <a
          href="/login"
          className="text-green-400 hover:underline font-mono"
        >
          LOGIN
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !reason || !turnstileToken) {
      setError("Please fill in all required fields and complete verification.");
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-red-500 mb-2">REPORT SCAMMER</h1>
      <p className="text-gray-500 font-mono text-sm mb-8">
        Submit a deployer wallet address or Twitter handle. Provide evidence and
        let the community verify.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type toggle */}
        <div>
          <label className="block text-sm text-gray-500 font-mono mb-2">
            TYPE
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("deployer")}
              className={`flex-1 py-3 font-mono text-sm transition-colors ${
                type === "deployer"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500"
                  : "bg-[#12121a] text-gray-500 border border-gray-800 hover:border-gray-600"
              }`}
            >
              DEPLOYER
            </button>
            <button
              type="button"
              onClick={() => setType("twitter")}
              className={`flex-1 py-3 font-mono text-sm transition-colors ${
                type === "twitter"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500"
                  : "bg-[#12121a] text-gray-500 border border-gray-800 hover:border-gray-600"
              }`}
            >
              TWITTER
            </button>
          </div>
        </div>

        {/* Identifier */}
        <div>
          <label className="block text-sm text-gray-500 font-mono mb-2">
            {type === "deployer" ? "WALLET ADDRESS" : "TWITTER HANDLE"}
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
            className="w-full bg-[#12121a] border border-gray-800 focus:border-red-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm text-gray-500 font-mono mb-2">
            REASON / DESCRIPTION
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the scam. What happened? Who was affected? Be specific."
            rows={5}
            className="w-full bg-[#12121a] border border-gray-800 focus:border-red-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none resize-none transition-colors"
          />
          <div className="text-right text-gray-600 font-mono text-xs mt-1">
            {reason.length}/2000
          </div>
        </div>

        {/* Evidence */}
        <div>
          <label className="block text-sm text-gray-500 font-mono mb-2">
            EVIDENCE URL (optional)
          </label>
          <input
            type="url"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="https://twitter.com/... or archive link"
            className="w-full bg-[#12121a] border border-gray-800 focus:border-red-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
          />
        </div>

        {/* Turnstile */}
        <TurnstileWidget
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
        />

        {/* Error */}
        {error && (
          <p className="text-red-400 font-mono text-sm">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!identifier || !reason || !turnstileToken || isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 font-mono text-sm transition-colors"
        >
          {isSubmitting ? "SUBMITTING..." : "SUBMIT REPORT"}
        </button>
      </form>
    </div>
  );
}
