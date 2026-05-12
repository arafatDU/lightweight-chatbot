"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      router.push("/chat");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-[#0f0f0f]">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">LightChat</h1>
          <p className="text-zinc-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-zinc-300 hover:text-white transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
