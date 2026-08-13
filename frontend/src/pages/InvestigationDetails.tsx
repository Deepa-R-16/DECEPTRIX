import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldAlert,
  FileSearch,
  BrainCircuit,
  AlertTriangle,
  Loader2,
  Activity,
  Network,
  TrendingUp,
  Users,
  Globe,
  Zap,
} from "lucide-react";

import { getInvestigation } from "../services/api";
import type { InvestigationDetails as InvestigationDetailsType } from "../services/api";

export default function InvestigationDetails() {
  const { caseNumber } = useParams<{ caseNumber: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<InvestigationDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvestigation() {
      if (!caseNumber) {
        setError("Invalid investigation case");
        setLoading(false);
        return;
      }

      try {
        const response = await getInvestigation(caseNumber);
        setData(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load investigation"
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvestigation();
  }, [caseNumber]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Loader2 size={20} className="animate-spin" />
        Loading investigation...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/investigations")}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Investigations
        </button>

        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            {error || "Investigation not found"}
          </div>
        </div>
      </div>
    );
  }

  const { investigation, evidence, analysis } = data;

  const narrative = data.narrative;
  const threatPrediction = data.threatPrediction;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/investigations")}
        className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to Investigations
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-purple-400" size={26} />

          <div>
            <h1 className="text-2xl font-bold text-white">
              {investigation.case_number}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              {investigation.title}
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <p className="text-xs text-zinc-500">Status</p>

          <p className="mt-2 font-semibold text-green-400">
            {investigation.status}
          </p>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <p className="text-xs text-zinc-500">Severity</p>

          <p className="mt-2 font-semibold text-yellow-400">
            {investigation.severity || "UNKNOWN"}
          </p>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <p className="text-xs text-zinc-500">Threat Score</p>

          <p className="mt-2 text-2xl font-bold text-white">
            {investigation.threat_score ?? 0}/100
          </p>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <p className="text-xs text-zinc-500">Created</p>

          <p className="mt-2 text-sm text-zinc-300">
            {new Date(investigation.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Evidence */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">
        <div className="flex items-center gap-3">
          <FileSearch className="text-blue-400" size={22} />

          <div>
            <h2 className="font-semibold text-white">Evidence</h2>

            <p className="mt-1 text-xs text-zinc-500">
              Evidence collected for this investigation.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {evidence.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No evidence available.
            </p>
          ) : (
            evidence.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5"
              >
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-zinc-500">Type</p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {item.evidence_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Source</p>

                    <p className="mt-1 text-sm text-zinc-300">
                      {item.source || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#2a2a2e] pt-4">
                  <p className="text-xs text-zinc-500">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {item.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">
        <div className="flex items-center gap-3">
          <BrainCircuit
            className="text-purple-400"
            size={22}
          />

          <div>
            <h2 className="font-semibold text-white">
              DECEPTRIX AI Analysis
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Automated deception analysis for this investigation.
            </p>
          </div>
        </div>

        {!analysis ? (
          <p className="mt-5 text-sm text-zinc-500">
            No AI analysis available.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {/* AI Metrics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">
                <p className="text-xs text-zinc-500">
                  Model
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {analysis.model_name}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Version {analysis.model_version}
                </p>
              </div>

              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">
                <p className="text-xs text-zinc-500">
                  Risk Score
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {analysis.risk_score}/100
                </p>
              </div>

              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">
                <p className="text-xs text-zinc-500">
                  Confidence
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {Number(analysis.confidence).toFixed(2)}%
                </p>
              </div>

              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">
                <p className="text-xs text-zinc-500">
                  Severity
                </p>

                <p className="mt-2 font-semibold text-yellow-400">
                  {analysis.severity}
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">
              <div className="flex items-center gap-2">
                <Activity
                  size={18}
                  className="text-red-400"
                />

                <p className="font-semibold text-white">
                  Analysis Explanation
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {analysis.explanation}
              </p>
            </div>

            {/* Fingerprints */}
            <div>
              <h3 className="font-semibold text-white">
                Manipulation Fingerprints
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                Detected deception and psychological manipulation techniques.
              </p>

              <div className="mt-4 space-y-3">
                {analysis.fingerprints.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No manipulation fingerprints detected.
                  </p>
                ) : (
                  analysis.fingerprints.map((fingerprint) => (
                    <div
                      key={fingerprint.id}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-red-400">
                            {fingerprint.technique}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            Confidence
                          </p>

                          <p className="font-semibold text-white">
                            {Number(
                              fingerprint.confidence
                            ).toFixed(2)}
                            %
                          </p>
                        </div>

                        <div className="md:max-w-xl">
                          <p className="text-xs uppercase tracking-wide text-zinc-600">
                            Evidence
                          </p>

                          <p className="mt-1 text-sm italic text-zinc-300">
                            "{fingerprint.evidence_quote}"
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-red-500/10 pt-4">
                        <p className="text-xs uppercase tracking-wide text-zinc-600">
                          Reasoning
                        </p>

                        <p className="mt-1 text-sm leading-6 text-zinc-400">
                          {fingerprint.reasoning}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Narrative Intelligence */}
      {narrative && (
        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Network size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Narrative Intelligence
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Identify related narratives and trace how deceptive content
                propagates across investigations.
              </p>
            </div>
          </div>

          {/* Narrative Metrics */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Narrative Node
              </p>

              <p className="mt-2 text-xl font-bold text-white">
                {narrative.node.node_type}
              </p>
            </div>

            <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Platform
              </p>

              <p className="mt-2 text-xl font-bold text-blue-400">
                {narrative.node.platform || "Unknown"}
              </p>
            </div>

            <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Related Narratives
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {narrative.relationships.length}
              </p>
            </div>
          </div>

          {/* Original Narrative */}
          <div className="mt-5 rounded-lg border border-blue-500/10 bg-blue-500/5 p-5">
            <p className="text-xs uppercase tracking-wide text-blue-400">
              Narrative Content
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {narrative.node.node_value}
            </p>
          </div>

          {/* Relationships */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <Network size={18} className="text-blue-400" />

              <h3 className="font-semibold text-white">
                Detected Relationships
              </h3>
            </div>

            <p className="mt-1 text-xs text-zinc-500">
              Connections discovered between this narrative and previously
              observed content.
            </p>

            <div className="mt-4 space-y-3">
              {narrative.relationships.length === 0 ? (
                <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">
                  <p className="text-sm text-zinc-500">
                    No related narratives detected.
                  </p>
                </div>
              ) : (
                narrative.relationships.map(
                  (relationship, index) => (
                    <div
                      key={`${relationship.source_node_id}-${relationship.target_node_id}-${index}`}
                      className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-blue-400">
                            {relationship.relationship_type}
                          </p>

                          <p className="mt-2 text-xs text-zinc-500">
                            Source Platform
                          </p>

                          <p className="mt-1 text-sm text-zinc-300">
                            {relationship.source_platform ||
                              "Unknown"}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-xs text-zinc-500">
                            Confidence
                          </p>

                          <p className="mt-1 text-xl font-bold text-white">
                            {Number(
                              relationship.confidence
                            ).toFixed(2)}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Threat Propagation Prediction */}
      {threatPrediction && (
        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">
              <TrendingUp size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Threat Propagation Prediction
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Predictive assessment of how this deceptive narrative may
                spread.
              </p>
            </div>
          </div>

          {/* Prediction Metrics */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-5">
              <div className="flex items-center gap-2">
                <Zap
                  size={17}
                  className="text-orange-400"
                />

                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Threat Probability
                </p>
              </div>

              <p className="mt-2 text-3xl font-bold text-orange-400">
                {Number(
                  threatPrediction.threat_probability
                ).toFixed(2)}
                %
              </p>
            </div>

            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-center gap-2">
                <Activity
                  size={17}
                  className="text-red-400"
                />

                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Propagation Velocity
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-red-400">
                {threatPrediction.propagation_velocity}
              </p>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-5">
              <div className="flex items-center gap-2">
                <Users
                  size={17}
                  className="text-purple-400"
                />

                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Target Audience
                </p>
              </div>

              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {threatPrediction.target_profile?.audience ||
                  "Unknown"}
              </p>
            </div>
          </div>

          {/* Platforms */}
          <div className="mt-5 rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">
            <div className="flex items-center gap-2">
              <Globe
                size={18}
                className="text-blue-400"
              />

              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Potential Platforms
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {threatPrediction.target_profile?.platforms
                ?.length ? (
                threatPrediction.target_profile.platforms.map(
                  (platform, index) => (
                    <span
                      key={`${platform}-${index}`}
                      className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400"
                    >
                      {platform}
                    </span>
                  )
                )
              ) : (
                <span className="text-sm text-zinc-500">
                  No platforms identified.
                </span>
              )}
            </div>
          </div>

          {/* Risk Factors */}
          <div className="mt-5">
            <div className="flex items-center gap-2">
              <AlertTriangle
                size={18}
                className="text-red-400"
              />

              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Risk Factors
              </p>
            </div>

            <div className="mt-3 space-y-2">
              {threatPrediction.target_profile?.risk_factors
                ?.length ? (
                threatPrediction.target_profile.risk_factors.map(
                  (factor, index) => (
                    <div
                      key={`${factor}-${index}`}
                      className="flex items-start gap-3 rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3"
                    >
                      <AlertTriangle
                        size={16}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <p className="text-sm text-zinc-300">
                        {factor}
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-zinc-500">
                  No additional risk factors identified.
                </p>
              )}
            </div>
          </div>

          {/* Prediction Reasoning */}
          <div className="mt-5 rounded-lg border border-orange-500/20 bg-orange-500/5 p-5">
            <p className="text-xs uppercase tracking-wide text-orange-400">
              Prediction Reasoning
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {threatPrediction.prediction_reasoning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}