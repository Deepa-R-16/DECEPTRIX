import { useEffect, useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Search,
} from "lucide-react";

import { getInvestigations } from "../services/api";
import type { InvestigationSummary } from "../services/api";

export default function Investigations() {
  const [investigations, setInvestigations] = useState<
    InvestigationSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvestigations() {
      try {
        const response = await getInvestigations();
        setInvestigations(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load investigations"
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvestigations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Loader2 size={20} className="animate-spin" />
        Loading investigations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} />
          {error}
        </div>
      </div>
    );
  }

  const activeCount = investigations.filter(
    (item) => item.status?.toUpperCase() === "ACTIVE"
  ).length;

  const criticalCount = investigations.filter(
    (item) => item.severity?.toUpperCase() === "CRITICAL"
  ).length;

  const averageScore =
    investigations.length > 0
      ? (
          investigations.reduce(
            (sum, item) => sum + Number(item.threat_score || 0),
            0
          ) / investigations.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Investigations
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Review suspicious content cases analyzed by DECEPTRIX.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <ShieldAlert size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Total Investigations
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {investigations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
              <CheckCircle size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Active Investigations
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {activeCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Critical Threats
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {criticalCount}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Investigation Cases */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Investigation Cases
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Latest suspicious content investigations.
            </p>
          </div>

          <Search size={20} className="text-zinc-500" />
        </div>

        <div className="mt-5 space-y-3">

          {investigations.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No investigations found.
            </p>
          ) : (
            investigations.map((item) => (
              <div
  key={item.id}
  onClick={() =>
    window.location.href = `/investigations/${item.case_number}`
  }
  className="cursor-pointer rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5 transition hover:border-purple-500/40 hover:bg-[#141419]"
>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  {/* Case information */}
                  <div>
                    <p className="font-semibold text-white">
                      {item.case_number}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {item.title}
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                      <Clock size={13} />

                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-6">

                    <div>
                      <p className="text-xs text-zinc-500">
                        Status
                      </p>

                      <p className="mt-1 font-semibold text-green-400">
                        {item.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">
                        Severity
                      </p>

                      <p className="mt-1 font-semibold text-yellow-400">
                        {item.severity || "UNKNOWN"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">
                        Threat Score
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {item.threat_score ?? 0}/100
                      </p>
                    </div>

                    {item.confidence !== null && (
                      <div>
                        <p className="text-xs text-zinc-500">
                          AI Confidence
                        </p>

                        <p className="mt-1 font-semibold text-white">
                          {Number(item.confidence).toFixed(2)}%
                        </p>
                      </div>
                    )}

                  </div>
                </div>

                {/* AI explanation */}
                {item.explanation && (
                  <div className="mt-4 border-t border-[#2a2a2e] pt-4">
                    <p className="text-sm leading-6 text-zinc-400">
                      {item.explanation}
                    </p>
                  </div>
                )}

              </div>
            ))
          )}

        </div>
      </div>

      {/* Average Threat Score */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
        <p className="text-xs text-zinc-500">
          Average Threat Score
        </p>

        <p className="mt-1 text-2xl font-bold text-white">
          {averageScore}/100
        </p>
      </div>

    </div>
  );
}