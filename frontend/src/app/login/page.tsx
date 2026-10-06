"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "https://civora-ai-bdwf.onrender.com";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const cleanEmail = email.trim();

      if (!cleanEmail || !password) {
        setMessage("Please enter your email and password.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(
          data?.detail ||
            "Login failed. Please check your email and password."
        );
        return;
      }

      /*
       * IMPORTANT:
       * Dashboard uses:
       * localStorage.getItem("access_token")
       *
       * Therefore login must save the token
       * using the SAME key.
       */

      if (!data?.access_token) {
        setMessage(
          "Login response did not contain an access token."
        );
        return;
      }

      // Remove old token formats if they exist
      localStorage.removeItem("civora_token");

      // Save the correct token for the dashboard
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      setMessage(
        "Login successful! Opening CIVORA AI..."
      );

      // Open dashboard
      router.replace("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Backend server connect होत नाही. कृपया backend चालू आहे का ते check करा."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-8 text-center">
            <a href="/" className="inline-block">
              <h1 className="text-3xl font-bold">
                CIVORA{" "}
                <span className="text-cyan-400">
                  AI
                </span>
              </h1>
            </a>

            <p className="mt-2 text-sm text-slate-400">
              Citizen Assistance Intelligence
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

            <div className="mb-8">
              <h2 className="text-2xl font-bold">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Login to continue to your CIVORA AI
                account.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>

                  <a
                    href="/forgot-password"
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-20 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`rounded-xl border px-4 py-3 text-center text-sm ${
                    message
                      .toLowerCase()
                      .includes("successful")
                      ? "border-green-800 bg-green-950 text-green-300"
                      : "border-slate-700 bg-slate-950 text-slate-300"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-400 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Logging in..."
                  : "Login to CIVORA AI"}
              </button>
            </form>

            {/* Register */}
            <div className="mt-8 border-t border-slate-800 pt-6 text-center">
              <p className="text-sm text-slate-400">
                Don&apos;t have an account?
              </p>

              <a
                href="/register"
                className="mt-2 inline-block font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Create a new account
              </a>
            </div>
          </div>

          {/* Back */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              ← Back to CIVORA AI
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
