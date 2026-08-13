import { useEffect, useState } from "react";
import {
  ShieldAlert,
  BrainCircuit,
  AlertTriangle,
  Activity,
  Loader2,
} from "lucide-react";

import { getThreatIntelligence } from "../services/api";

import type {
  ThreatTechnique,
  SeverityDistribution,
  RecentAnalysis,
} from "../services/api";

export default function ThreatIntelligence() {
  const [techniques, setTechniques] = useState<ThreatTechnique[]>([]);
  const [severity, setSeverity] = useState<SeverityDistribution[]>([]);
  const [recent, setRecent] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadThreatIntelligence() {
      try {
        const response = await getThreatIntelligence();

        setTechniques(response.data.techniques);
        setSeverity(response.data.severityDistribution);
        setRecent(response.data.recentAnalyses);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load threat intelligence"
        );
      } finally {
        setLoading(false);
      }
    }

    loadThreatIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Loader2 size={20} className="animate-spin" />
        Loading threat intelligence...
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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Threat Intelligence
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Analyze deception indicators, threat levels, and manipulation tactics.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <ShieldAlert size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Detected Techniques
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {techniques.length}
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
                Total Detections
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {techniques.reduce(
                  (total, item) => total + item.detections,
                  0
                )}
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
              <BrainCircuit size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                AI Engine
              </p>

              <p className="mt-1 text-lg font-bold text-green-400">
                ONLINE
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Manipulation Techniques */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

        <div className="flex items-center gap-3">

          <Activity
            className="text-red-400"
            size={22}
          />

          <div>
            <h2 className="font-semibold text-white">
              Manipulation Techniques
            </h2>

            <p className="text-xs text-zinc-500">
              Frequently detected deception patterns.
            </p>
          </div>

        </div>

        <div className="mt-5 space-y-3">

          {techniques.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No manipulation techniques detected yet.
            </p>
          ) : (
            techniques.map((item) => (
              <div
                key={item.technique}
                className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p className="font-semibold text-red-400">
                      {item.technique}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {item.detections} detection
                      {item.detections !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-500">
                      Average Confidence
                    </p>

                    <p className="font-semibold text-white">
                      {Number(item.average_confidence).toFixed(2)}%
                    </p>
                  </div>

                </div>

                <div className="mt-4 border-t border-[#2a2a2e] pt-4">

                  <p className="text-xs uppercase tracking-wide text-zinc-600">
                    Example Evidence
                  </p>

                  <p className="mt-1 text-sm italic text-zinc-300">
                    "{item.example_evidence}"
                  </p>

                </div>

              </div>
            ))
          )}

        </div>
      </div>

      {/* Severity Distribution */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

        <h2 className="font-semibold text-white">
          Threat Severity Distribution
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          Current investigation severity levels.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">

          {severity.map((item) => (
            <div
              key={item.severity}
              className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5"
            >

              <p className="text-xs text-zinc-500">
                {item.severity}
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {item.count}
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                investigations
              </p>

            </div>
          ))}

        </div>
      </div>

      {/* Recent AI Analyses */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

        <div className="flex items-center gap-3">

          <BrainCircuit
            className="text-purple-400"
            size={22}
          />

          <div>
            <h2 className="font-semibold text-white">
              Recent AI Analyses
            </h2>

            <p className="text-xs text-zinc-500">
              Latest deception detections generated by DECEPTRIX.
            </p>
          </div>

        </div>

        <div className="mt-5 space-y-3">

          {recent.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No AI analyses available.
            </p>
          ) : (
            recent.map((item) => (
              <div
                key={item.case_number}
                className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5"
              >

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>
                    <p className="font-semibold text-white">
                      {item.case_number}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {item.model_name}
                    </p>
                  </div>

                  <div className="flex gap-6">

                    <div>
                      <p className="text-xs text-zinc-500">
                        Risk
                      </p>

                      <p className="font-semibold text-white">
                        {item.threat_score}/100
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">
                        Confidence
                      </p>

                      <p className="font-semibold text-white">
                        {item.confidence}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">
                        Severity
                      </p>

                      <p className="font-semibold text-yellow-400">
                        {item.severity}
                      </p>
                    </div>

                  </div>

                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  {item.explanation}
                </p>

              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
}