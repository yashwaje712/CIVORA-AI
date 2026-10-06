"use client";

import { useEffect, useState } from "react";

type DemandCategory = {
  category: string;
  count: number;
};

type DemandSummary = {
  status: string;
  total_requests: number;
  categories: DemandCategory[];
};

export default function AdminPage() {
  const [data, setData] = useState<DemandSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDemandData() {
      try {
        const response = await fetch(
          "https://civora-ai-bdwf.onrender.com/api/demand/summary"
        );

        if (!response.ok) {
          throw new Error("Unable to load demand data.");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load demand data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDemandData();
  }, []);

  const getCategoryName = (category: string) =>
    category.replace(" Assistance", "");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            CIVORA AI
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Government Demand Intelligence
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Anonymous aggregate demand from citizen assistance requests.
            No personal situation text is displayed here.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
            Loading demand intelligence...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-6 text-red-300">
            {error}
          </div>
        )}

        {/* Dashboard */}
        {!loading && !error && data && (
          <>
            {/* Summary Cards */}
            <section className="mb-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-6">
                <p className="text-sm font-medium text-slate-400">
                  Total Citizen Requests
                </p>

                <p className="mt-3 text-5xl font-bold text-cyan-400">
                  {data.total_requests}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm font-medium text-slate-400">
                  Assistance Categories
                </p>

                <p className="mt-3 text-5xl font-bold">
                  {data.categories.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm font-medium text-slate-400">
                  Data Type
                </p>

                <p className="mt-3 text-2xl font-bold text-emerald-400">
                  Anonymous
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Category-level demand only
                </p>
              </div>
            </section>

            {/* Category Demand */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Demand by Assistance Category
                </h2>

                <p className="mt-2 text-slate-400">
                  Aggregate citizen demand received by CIVORA AI.
                </p>
              </div>

              {data.categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
                  No demand data available yet.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
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
                        className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold">
                              {getCategoryName(item.category)}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {percentage}% of recorded requests
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-3xl font-bold text-cyan-400">
                              {item.count}
                            </p>

                            <p className="text-xs text-slate-500">
                              requests
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{
                              width: `${Math.max(percentage, 2)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Privacy Section */}
            <section className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">
              <h2 className="text-xl font-bold text-cyan-400">
                Privacy-Aware Intelligence
              </h2>

              <p className="mt-2 leading-7 text-slate-400">
                CIVORA AI records only the assistance category and timestamp
                for demand intelligence. Citizen situation text is not stored
                in the demand records used by this dashboard.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
