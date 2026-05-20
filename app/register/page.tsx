"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TurnstileWidget from "@/components/TurnstileWidget";
import ShameMessage from "@/components/ShameMessage";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the verification");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          nickname,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Auto login after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Registered but login failed. Please try logging in.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">&#x1F43A;</span>
            <h1 className="text-2xl font-bold text-[var(--green-primary)] mb-2">
              JOIN THE PACK
            </h1>
            <p className="text-[var(--foreground-muted)] text-sm">
              Become a SCAMBOARD watchdog
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="3-20 chars, alphanumeric + underscores"
                required
                className="input"
              />
              <p className="text-xs text-[var(--foreground-dimmed)] mt-1">
                This will be your public display name
              </p>
            </div>

            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
            />

            {error && (
              <p className="text-[var(--red-primary)] text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !turnstileToken}
              className="btn-secondary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[var(--foreground-muted)] text-sm">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="text-[var(--red-primary)] hover:underline text-sm"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <ShameMessage />
        </div>
      </div>
    </div>
  );
}
