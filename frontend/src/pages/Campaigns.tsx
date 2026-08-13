import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Users,
  Activity,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3000/api";

interface CampaignInvestigation {
  id: string;
  case_number: string;
  title: string;
  severity: string;
  threat_score: number;
  created_at: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
  technique: string;
  investigation_count: number;
  coordination_score: number;
  average_threat_score: number;
  risk_level: string;
  investigations: CampaignInvestigation[];
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const response = await fetch(`${API_BASE_URL}/campaigns`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load campaign intelligence"
          );
        }

        setCampaigns(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load campaign intelligence"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Loader2 size={20} className="animate-spin" />
        Loading campaign intelligence...
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
          Campaign Intelligence
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Detect and investigate coordinated deception campaigns.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <ShieldAlert size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Detected Campaigns
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {campaigns.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Users size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Correlated Investigations
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {campaigns.reduce(
                  (sum, campaign) =>
                    sum + campaign.investigation_count,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-400">
              <Activity size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Highest Coordination
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {campaigns.length > 0
                  ? Math.max(
                      ...campaigns.map(
                        (campaign) =>
                          campaign.coordination_score
                      )
                    )
                  : 0}
                /100
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-8 text-center">
          <ShieldAlert
            size={32}
            className="mx-auto text-zinc-600"
          />

          <p className="mt-3 text-sm text-zinc-400">
            No coordinated deception campaigns detected yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6"
            >

              {/* Campaign Header */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <p className="text-xs text-zinc-600">
                    {campaign.id}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    {campaign.campaign_name}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Shared manipulation technique detected across
                    multiple investigations.
                  </p>
                </div>

                <div
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    campaign.risk_level === "CRITICAL"
                      ? "bg-red-500/10 text-red-400"
                      : campaign.risk_level === "HIGH"
                      ? "bg-orange-500/10 text-orange-400"
                      : campaign.risk_level === "MEDIUM"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {campaign.risk_level} RISK
                </div>

              </div>

              {/* Metrics */}
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Technique
                  </p>

                  <p className="mt-2 text-sm font-semibold text-purple-400">
                    {campaign.technique}
                  </p>
                </div>

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Investigations
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {campaign.investigation_count}
                  </p>
                </div>

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Coordination
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {campaign.coordination_score}/100
                  </p>
                </div>

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Avg Threat
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {campaign.average_threat_score}/100
                  </p>
                </div>

              </div>

              {/* Correlated Cases */}
              <div className="mt-6 border-t border-[#2a2a2e] pt-5">

                <h3 className="font-semibold text-white">
                  Correlated Investigations
                </h3>

                <div className="mt-4 space-y-3">

                  {campaign.investigations.map((investigation) => (
                    <div
                      key={investigation.id}
                      className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                        <div>
                          <p className="font-semibold text-white">
                            {investigation.case_number}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {investigation.title}
                          </p>
                        </div>

                        <div className="flex gap-6">

                          <div>
                            <p className="text-xs text-zinc-600">
                              Severity
                            </p>

                            <p className="mt-1 text-sm font-semibold text-yellow-400">
                              {investigation.severity}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-600">
                              Threat
                            </p>

                            <p className="mt-1 text-sm font-semibold text-white">
                              {investigation.threat_score}/100
                            </p>
                          </div>

                        </div>

                      </div>
                    </div>
                  ))}

                </div>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}