"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  category: string;
  count: number;
};

type DemandSummary = {
  status: string;
  total_requests: number;
  categories: Category[];
};

export default function GovernmentDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DemandSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("civora_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const loadDemandData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/demand/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.detail || "Unable to load demand data."
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to CIVORA AI backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDemandData();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("civora_token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">
            CIVORA AI
          </div>

          <p className="mt-3 text-slate-400">
            Loading Government Demand Intelligence...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <header className="border-b border-slate-800 bg-[#020617]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-cyan-400">
              CIVORA AI
            </h1>

            <p className="text-sm text-slate-400">
              Government Demand Intelligence
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-red-400 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wider text-cyan-400">
            Government Intelligence Dashboard
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Citizen Assistance Demand
          </h2>

          <p className="mt-3 max-w-3xl text-lg text-slate-400">
            An anonymized view of the types of government assistance
            citizens are searching for through CIVORA AI.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-cyan-500/30 bg-[#0f172a] p-6">
                <p className="text-sm uppercase tracking-wider text-slate-500">
                  Total Requests
                </p>

                <p className="mt-3 text-4xl font-bold text-cyan-400">
                  {data.total_requests}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Assistance analyses recorded
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-[#0f172a] p-6">
                <p className="text-sm uppercase tracking-wider text-slate-500">
                  Assistance Categories
                </p>

                <p className="mt-3 text-4xl font-bold text-emerald-400">
                  {data.categories.length}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Different demand areas
                </p>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-[#0f172a] p-6">
                <p className="text-sm uppercase tracking-wider text-slate-500">
                  Intelligence Status
                </p>

                <p className="mt-3 text-2xl font-bold text-purple-400">
                  Active
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Data connected to CIVORA AI
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
              <div>
                <h3 className="text-2xl font-bold">
                  Assistance Demand by Category
                </h3>

                <p className="mt-2 text-slate-400">
                  Categories represent citizen assistance requests
                  processed by CIVORA AI.
                </p>
              </div>

              {data.categories.length === 0 ? (
                <div className="mt-6 rounded-xl border border-slate-700 bg-[#020617] p-6 text-center text-slate-400">
                  No demand data available yet.
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {data.categories.map((item) => {
                    const percentage =
                      data.total_requests > 0
                        ? Math.round(
                            (item.count / data.total_requests) * 100
                          )
                        : 0;

                    return (
                      <div
                        key={item.category}
                        className="rounded-xl border border-slate-700 bg-[#020617] p-5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {item.category}
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                              {percentage}% of total requests
                            </p>
                          </div>

                          <div className="text-3xl font-bold text-cyan-400">
                            {item.count}
                          </div>
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-cyan-400 transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6">
              <h3 className="text-xl font-bold text-yellow-300">
                Privacy & Data Note
              </h3>

              <p className="mt-3 leading-7 text-yellow-100/80">
                This dashboard displays aggregated assistance demand.
                Individual citizen situations and personal information
                are not displayed here.
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}