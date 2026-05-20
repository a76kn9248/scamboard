"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
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
        <h1 className="text-2xl font-bold text-red-500 mb-2 text-center">
          LOGIN
        </h1>
        <p className="text-gray-500 font-mono text-sm text-center mb-8">
          Access your SCAMBOARD account
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
              className="w-full bg-[#12121a] border border-gray-800 focus:border-red-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
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
              required
              className="w-full bg-[#12121a] border border-gray-800 focus:border-red-500 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 font-mono text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 font-mono text-sm transition-colors"
          >
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600 font-mono text-sm">
            No account?{" "}
          </span>
          <Link
            href="/register"
            className="text-green-400 hover:underline font-mono text-sm"
          >
            REGISTER
          </Link>
        </div>
      </div>
    </div>
  );
}
