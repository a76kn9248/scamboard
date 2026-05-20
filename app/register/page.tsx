"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TurnstileWidget from "@/components/TurnstileWidget";

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
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#0d0d12] border border-gray-800 p-8">
        <h1 className="text-2xl font-bold text-green-500 mb-2 text-center">
          REGISTER
        </h1>
        <p className="text-gray-500 font-mono text-sm text-center mb-8">
          Join the SCAMBOARD community
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 font-mono mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#12121a] border border-gray-800 focus:border-green-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 font-mono mb-2">
              NICKNAME
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="3-20 chars, alphanumeric + underscores"
              required
              className="w-full bg-[#12121a] border border-gray-800 focus:border-green-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 font-mono mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              className="w-full bg-[#12121a] border border-gray-800 focus:border-green-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 font-mono mb-2">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#12121a] border border-gray-800 focus:border-green-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          <TurnstileWidget
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
          />

          {error && (
            <p className="text-red-400 font-mono text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !turnstileToken}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 font-mono text-sm transition-colors"
          >
            {isLoading ? "REGISTERING..." : "REGISTER"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600 font-mono text-sm">
            Already have an account?{" "}
          </span>
          <Link
            href="/login"
            className="text-red-400 hover:underline font-mono text-sm"
          >
            LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}
