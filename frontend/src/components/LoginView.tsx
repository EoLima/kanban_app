"use client";

import { useState, type FormEvent } from "react";

type LoginViewProps = {
  onLoginSuccess: () => void;
};

export const LoginView = ({ onLoginSuccess }: LoginViewProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        onLoginSuccess();
      } else {
        const data = await res.json();
        setError(data.message || "Invalid credentials. Try 'user' and 'password'.");
      }
    } catch (err) {
      setError("Network error. Make sure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--surface)] px-4">
      {/* Dynamic ambient backgrounds */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.18)_0%,_rgba(32,157,215,0.02)_60%,_transparent_75%)]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.12)_0%,_rgba(117,57,145,0.02)_60%,_transparent_75%)]" />

      <main className="relative w-full max-w-[420px] rounded-[32px] border border-[var(--stroke)] bg-white/85 p-10 shadow-[var(--shadow)] backdrop-blur-xl transition duration-300 hover:shadow-[0_24px_50px_rgba(3,33,71,0.16)]">
        <header className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] font-display text-2xl font-bold">
            KS
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-[var(--navy-dark)]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[var(--gray-text)]">
            Sign in to access your Kanban Studio project
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--navy-dark)]/70">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full rounded-2xl border border-[var(--stroke)] bg-white/70 px-4 py-3.5 text-sm text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)] focus:bg-white focus:ring-2 focus:ring-[var(--primary-blue)]/15"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--navy-dark)]/70">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-[var(--stroke)] bg-white/70 px-4 py-3.5 text-sm text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)] focus:bg-white focus:ring-2 focus:ring-[var(--primary-blue)]/15"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[var(--secondary-purple)] py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition duration-200 hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <footer className="mt-8 text-center text-xs text-[var(--gray-text)]">
          Demo Account: <span className="font-semibold">user</span> / <span className="font-semibold">password</span>
        </footer>
      </main>
    </div>
  );
};
