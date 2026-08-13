import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  ShieldCheck,
  Clock,
  Fingerprint,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3000/api";

interface ThreatDistribution {
  severity: string;
  count: number;
}

interface RecentInvestigation {
  id: string;
  case_number: string;
  title: string;
  status: string;
  severity: string;
  threat_score: number;
  created_at: string;
}

interface ManipulationTechnique {
  technique: string;
  count: number;
  average_confidence: number;
}

interface DashboardStats {
  activeInvestigations: number;
  criticalThreats: number;
  averageThreatScore: number;
  aiEngine: string;
  aiProvider: string;
  analysisRequests: number;
  threatDistribution: ThreatDistribution[];
  recentInvestigations: RecentInvestigation[];
  manipulationTechniques: ManipulationTechnique[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/dashboard/stats`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard"
          );
        }

        setStats(data.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const metrics = [
    {
      title: "Active Investigations",
      value: loading
        ? "..."
        : stats?.activeInvestigations ?? 0,
      change: "Currently active",
      icon: Activity,
    },
    {
      title: "Critical Threats",
      value: loading
        ? "..."
        : stats?.criticalThreats ?? 0,
      change: "Requires attention",
      icon: AlertTriangle,
    },
    {
      title: "Average Threat Score",
      value: loading
        ? "..."
        : stats?.averageThreatScore ?? 0,
      change: "Across investigations",
      icon: ShieldCheck,
    },
    {
      title: "AI Analysis Requests",
      value: loading
        ? "..."
        : stats?.analysisRequests ?? 0,
      change: "Total analyses",
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Operational Dashboard
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Real-time deception campaign intelligence and
          threat monitoring.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    {metric.title}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-white">
                    {metric.value}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {metric.change}
                  </p>
                </div>

                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                  <Icon size={20} />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Threat Distribution + AI Engine */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Threat Distribution */}
        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5 xl:col-span-2">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-white">
                Threat Distribution
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Current investigation severity distribution
              </p>
            </div>

            <span className="text-xs text-green-400">
              LIVE
            </span>

          </div>

          <div className="mt-6 space-y-4">

            {loading ? (
              <p className="text-sm text-zinc-600">
                Loading threat data...
              </p>
            ) : stats?.threatDistribution.length === 0 ? (
              <p className="text-sm text-zinc-600">
                No threat data available.
              </p>
            ) : (
              stats?.threatDistribution.map((item) => {

                const total =
                  stats.threatDistribution.reduce(
                    (sum, threat) => sum + threat.count,
                    0
                  );

                const percentage =
                  total > 0
                    ? (item.count / total) * 100
                    : 0;

                return (
                  <div key={item.severity}>

                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-zinc-300">
                        {item.severity}
                      </span>

                      <span className="text-zinc-500">
                        {item.count} investigation
                        {item.count !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#0f0f12]">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* AI Engine */}
        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">

          <h2 className="font-semibold text-white">
            AI Engine Status
          </h2>

          <div className="mt-6 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">

            <span className="h-3 w-3 rounded-full bg-green-400" />

            <div>
              <p className="text-sm font-medium text-green-400">
                {stats?.aiEngine || "Checking..."}
              </p>

              <p className="text-xs text-zinc-500">
                {stats?.aiProvider || "AI analysis engine"}
              </p>
            </div>

          </div>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-zinc-500">
                Analysis requests
              </span>

              <span className="text-white">
                {loading
                  ? "..."
                  : stats?.analysisRequests ?? 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">
                Database
              </span>

              <span className="text-green-400">
                CONNECTED
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Recent Investigations */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
            <Clock size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Recent Investigations
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Latest suspicious content analyzed by DECEPTRIX
            </p>
          </div>

        </div>

        <div className="mt-5 overflow-x-auto">

          {loading ? (
            <p className="text-sm text-zinc-600">
              Loading investigations...
            </p>
          ) : stats?.recentInvestigations.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No investigations found.
            </p>
          ) : (
            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-[#2a2a2e] text-xs uppercase tracking-wide text-zinc-600">

                  <th className="pb-3">
                    Case
                  </th>

                  <th className="pb-3">
                    Status
                  </th>

                  <th className="pb-3">
                    Severity
                  </th>

                  <th className="pb-3">
                    Threat Score
                  </th>

                  <th className="pb-3">
                    Created
                  </th>

                </tr>
              </thead>

              <tbody>

                {stats?.recentInvestigations.map(
                  (investigation) => (
                    <tr
                      key={investigation.id}
                      className="border-b border-[#2a2a2e] last:border-0"
                    >

                      <td className="py-4">
                        <p className="text-sm font-medium text-white">
                          {investigation.case_number}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {investigation.title}
                        </p>
                      </td>

                      <td className="py-4 text-sm text-green-400">
                        {investigation.status}
                      </td>

                      <td className="py-4">

                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                          {investigation.severity}
                        </span>

                      </td>

                      <td className="py-4 text-sm font-semibold text-white">
                        {investigation.threat_score}/100
                      </td>

                      <td className="py-4 text-xs text-zinc-500">
                        {new Date(
                          investigation.created_at
                        ).toLocaleString()}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>
      </div>

      {/* Manipulation Techniques */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">

        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
            <Fingerprint size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Manipulation Techniques
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Most frequently detected deception patterns
            </p>
          </div>

        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          {loading ? (
            <p className="text-sm text-zinc-600">
              Loading techniques...
            </p>
          ) : stats?.manipulationTechniques.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No manipulation techniques detected yet.
            </p>
          ) : (
            stats?.manipulationTechniques.map((technique) => (
              <div
                key={technique.technique}
                className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
              >

                <div className="flex items-center justify-between">

                  <p className="text-sm font-semibold text-red-400">
                    {technique.technique}
                  </p>

                  <span className="text-xs text-zinc-500">
                    {technique.count} detected
                  </span>

                </div>

                <div className="mt-3">

                  <p className="text-xs text-zinc-600">
                    Average confidence
                  </p>

                  <p className="mt-1 text-xl font-bold text-white">
                    {Number(
                      technique.average_confidence
                    ).toFixed(2)}
                    %
                  </p>

                </div>

              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
}