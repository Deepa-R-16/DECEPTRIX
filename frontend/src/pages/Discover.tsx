import { useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle,
  Search,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import {
  discoverContent,
  type DiscoverResponse,
} from "../services/api";

interface Fingerprint {
  technique: string;
  confidence: number;
  evidence_quote: string;
  reasoning: string;
}

interface AnalysisResult {
  id: string;
  model_name: string;
  model_version: string;
  risk_score: number;
  severity: string;
  confidence: number;
  explanation: string;
  fingerprints: Fingerprint[];
}

interface InvestigationResult {
  case_number: string;
  title: string;
  status: string;
  severity: string;
  threat_score: number;
  created_at: string;
  updated_at: string;
}

export default function Discover() {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState<{
    investigation: InvestigationResult;
    analysis: AnalysisResult;
    narrative: DiscoverResponse["narrative"];
    threatPrediction: DiscoverResponse["threatPrediction"];
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!content.trim()) {
      setError("Please enter content to investigate.");
      return;
    }

    setLoading(true);

    try {
      const response = await discoverContent(
        content.trim(),
        source.trim() || "Manual submission"
      );

      setResult({
        investigation: response.investigation,
        analysis: response.analysis,
        narrative: response.narrative,
        threatPrediction: response.threatPrediction,
      });

      setContent("");
      setSource("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze content"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Discovery & Ingestion
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Submit suspicious content for DECEPTRIX investigation.
        </p>
      </div>

      {/* Submission Card */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
            <Search size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              New Investigation
            </h2>

            <p className="text-xs text-zinc-500">
              Analyze suspicious text, claims, or online content.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Suspicious Content
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste suspicious text, a claim, message, or social media content here..."
              rows={8}
              className="w-full resize-none rounded-lg border border-[#2a2a2e] bg-[#0f0f12] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-500"
            />
          </div>

          {/* Source */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Source
            </label>

            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Twitter, WhatsApp, News Website, Manual submission"
              className="w-full rounded-lg border border-[#2a2a2e] bg-[#0f0f12] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Analyzing Content...
              </>
            ) : (
              <>
                <Search size={18} />
                Start Investigation
              </>
            )}
          </button>

        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">

          {/* Investigation Created */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">

            <div className="flex items-center gap-3">
              <CheckCircle
                className="text-green-400"
                size={22}
              />

              <div>
                <h2 className="font-semibold text-green-400">
                  Investigation Created
                </h2>

                <p className="text-xs text-zinc-500">
                  Content successfully analyzed by DECEPTRIX.
                </p>
              </div>
            </div>

            {/* Investigation Details */}
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">

              <div>
                <p className="text-xs text-zinc-500">
                  Case Number
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {result.investigation.case_number}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">
                  Status
                </p>

                <p className="mt-1 text-sm font-semibold text-green-400">
                  {result.investigation.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">
                  Severity
                </p>

                <p className="mt-1 text-sm font-semibold text-yellow-400">
                  {result.investigation.severity}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">
                  Threat Score
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {result.investigation.threat_score}/100
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">
                  Investigation
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  Created
                </p>
              </div>

            </div>
          </div>

          {/* AI Analysis */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                <BrainCircuit size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  DECEPTRIX AI Analysis
                </h2>

                <p className="text-xs text-zinc-500">
                  {result.analysis.model_name} · Version{" "}
                  {result.analysis.model_version}
                </p>
              </div>

            </div>

            {/* AI Metrics */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Risk Score */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Risk Score
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {result.analysis.risk_score}
                  <span className="text-sm text-zinc-600">
                    /100
                  </span>
                </p>
              </div>

              {/* Severity */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Severity
                </p>

                <p className="mt-2 text-2xl font-bold text-yellow-400">
                  {result.analysis.severity}
                </p>
              </div>

              {/* Confidence */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  AI Confidence
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {result.analysis.confidence}%
                </p>
              </div>

            </div>

            {/* Explanation */}
            <div className="mt-5 rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">

              <h3 className="text-sm font-semibold text-white">
                Analysis Explanation
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {result.analysis.explanation}
              </p>

            </div>

          </div>

          {/* Manipulation Fingerprints */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                <ShieldAlert size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Manipulation Fingerprints
                </h2>

                <p className="text-xs text-zinc-500">
                  Detected deception and psychological manipulation
                  techniques.
                </p>
              </div>

            </div>

            <div className="mt-5 space-y-3">

              {result.analysis.fingerprints.length === 0 ? (

                <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">
                  <p className="text-sm text-zinc-500">
                    No manipulation techniques detected.
                  </p>
                </div>

              ) : (

                result.analysis.fingerprints.map(
                  (fingerprint, index) => (

                    <div
                      key={`${fingerprint.technique}-${index}`}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="font-semibold text-red-400">
                            {fingerprint.technique}
                          </p>

                          <p className="mt-2 text-xs text-zinc-500">
                            Evidence:
                          </p>

                          <p className="mt-1 text-sm italic text-zinc-300">
                            "{fingerprint.evidence_quote}"
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                          {fingerprint.confidence}%
                        </span>

                      </div>

                      <div className="mt-4">

                        <p className="text-xs uppercase tracking-wide text-zinc-600">
                          Reasoning
                        </p>

                        <p className="mt-1 text-sm leading-6 text-zinc-400">
                          {fingerprint.reasoning}
                        </p>

                      </div>

                    </div>
                  )
                )

              )}

            </div>

          </div>

          {/* Narrative Intelligence */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                <Search size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Narrative Intelligence
                </h2>

                <p className="text-xs text-zinc-500">
                  Track how this suspicious narrative relates to
                  previously observed content.
                </p>
              </div>

            </div>

            {/* Narrative Metrics */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Node */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">

                <p className="text-xs text-zinc-500">
                  Narrative Node
                </p>

                <p className="mt-2 text-lg font-bold text-white">
                  {result.narrative.node.node_type}
                </p>

              </div>

              {/* Platform */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">

                <p className="text-xs text-zinc-500">
                  Platform
                </p>

                <p className="mt-2 text-lg font-bold text-blue-400">
                  {result.narrative.node.platform}
                </p>

              </div>

              {/* Related Narratives */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">

                <p className="text-xs text-zinc-500">
                  Related Narratives
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {result.narrative.relationships.length}
                </p>

              </div>

            </div>

            {/* Detected Relationships */}
            <div className="mt-5">

              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Detected Relationships
              </p>

              <div className="mt-3 space-y-3">

                {result.narrative.relationships.length === 0 ? (

                  <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">

                    <p className="text-sm text-zinc-500">
                      No related narratives detected.
                    </p>

                  </div>

                ) : (

                  result.narrative.relationships.map(
                    (relationship, index) => (

                      <div
                        key={`${relationship.source_node_id}-${relationship.target_node_id}-${index}`}
                        className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5"
                      >

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="font-semibold text-blue-400">
                              {relationship.relationship_type}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              Platform: {relationship.source_platform}
                            </p>

                          </div>

                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                            {relationship.confidence}%
                          </span>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </div>

          {/* Threat Propagation Prediction */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">
                <AlertTriangle size={22} />
              </div>

              <div>

                <h2 className="font-semibold text-white">
                  Threat Propagation Prediction
                </h2>

                <p className="text-xs text-zinc-500">
                  Predictive assessment of how this deceptive narrative
                  may spread.
                </p>

              </div>

            </div>

            {/* Prediction Metrics */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Threat Probability */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">

                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Threat Probability
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-400">
                  {result.threatPrediction.threat_probability}%
                </p>

              </div>

              {/* Propagation Velocity */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">

                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Propagation Velocity
                </p>

                <p className="mt-2 text-2xl font-bold text-red-400">
                  {result.threatPrediction.propagation_velocity}
                </p>

              </div>

              {/* Target Audience */}
              <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">

                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Target Audience
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {result.threatPrediction.target_profile.audience}
                </p>

              </div>

            </div>

            {/* Potential Platforms */}
            <div className="mt-5 rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5">

              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Potential Platforms
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                {result.threatPrediction.target_profile.platforms.map(
                  (platform, index) => (

                    <span
                      key={`${platform}-${index}`}
                      className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400"
                    >
                      {platform}
                    </span>

                  )
                )}

              </div>

            </div>

            {/* Risk Factors */}
            <div className="mt-5">

              <p className="text-xs uppercase tracking-wide text-zinc-600">
                Risk Factors
              </p>

              <div className="mt-3 space-y-2">

                {result.threatPrediction.target_profile.risk_factors.map(
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
                )}

              </div>

            </div>

            {/* Prediction Reasoning */}
            <div className="mt-5 rounded-lg border border-orange-500/20 bg-orange-500/5 p-5">

              <p className="text-xs uppercase tracking-wide text-orange-400">
                Prediction Reasoning
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {result.threatPrediction.prediction_reasoning}
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}