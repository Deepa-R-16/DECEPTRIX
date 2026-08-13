import { useEffect, useState } from "react";
import {
  FileText,
  ShieldAlert,
  Hash,
  Clock,
  Brain,
  Network,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import {
  getInvestigations,
  getReport,
  downloadForensicReport,
  generateForensicReport,
} from "../services/api";

import type {
  InvestigationSummary,
  ReportData,
} from "../services/api";

export default function Reports() {
  const [investigations, setInvestigations] = useState<
    InvestigationSummary[]
  >([]);

  const [selectedCase, setSelectedCase] = useState("");

  const [report, setReport] = useState<ReportData | null>(null);

  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const [generatingReport, setGeneratingReport] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const [error, setError] = useState("");

  /*
   * =========================================================
   * LOAD INVESTIGATIONS
   * =========================================================
   */
  useEffect(() => {
    async function loadCases() {
      try {
        setError("");

        const response = await getInvestigations();

        setInvestigations(response.data);

        if (response.data.length > 0) {
          setSelectedCase(response.data[0].case_number);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load investigations"
        );
      } finally {
        setLoadingCases(false);
      }
    }

    loadCases();
  }, []);

  /*
   * =========================================================
   * LOAD REPORT WHEN CASE CHANGES
   * =========================================================
   */
  useEffect(() => {
    if (!selectedCase) return;

    async function loadReport() {
      try {
        setLoadingReport(true);
        setError("");
        setReport(null);

        const response = await getReport(selectedCase);

        setReport(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load report"
        );
      } finally {
        setLoadingReport(false);
      }
    }

    loadReport();
  }, [selectedCase]);

  /*
   * =========================================================
   * GENERATE FORENSIC REPORT
   * =========================================================
   */
  async function generateReport() {
    if (!selectedCase) {
      setError("Please select an investigation case.");
      return;
    }

    try {
      setGeneratingReport(true);
      setError("");

      await generateForensicReport(selectedCase);

      /*
       * Reload report so the newly generated report
       * appears in the Generated Reports section.
       */
      const response = await getReport(selectedCase);

      setReport(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate forensic report"
      );
    } finally {
      setGeneratingReport(false);
    }
  }

  /*
   * =========================================================
   * DOWNLOAD FORENSIC REPORT
   * =========================================================
   */
  async function exportReport() {
    if (!selectedCase) {
      setError("Please select an investigation case.");
      return;
    }

    try {
      setDownloadingReport(true);
      setError("");

      await downloadForensicReport(selectedCase);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to download forensic report"
      );
    } finally {
      setDownloadingReport(false);
    }
  }

  /*
   * =========================================================
   * INITIAL LOADING
   * =========================================================
   */
  if (loadingCases) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Loader2
          size={20}
          className="animate-spin"
        />
        Loading investigations...
      </div>
    );
  }

  /*
   * =========================================================
   * NO INVESTIGATIONS
   * =========================================================
   */
  if (!loadingCases && investigations.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-400">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} />
          No investigations found.
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR WITHOUT REPORT
   * =========================================================
   */
  if (error && !report) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            {error}
          </div>
        </div>

        <button
          onClick={() => {
            if (selectedCase) {
              setSelectedCase("");
              setTimeout(() => {
                setSelectedCase(
                  investigations[0]?.case_number || ""
                );
              }, 0);
            }
          }}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Investigation Reports
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Generate incident-ready forensic reports from
            DECEPTRIX investigations.
          </p>
        </div>

        {report && (
          <div className="flex flex-wrap items-center gap-3">

            {/* Generate Report */}
            <button
              onClick={generateReport}
              disabled={generatingReport || downloadingReport}
              className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generatingReport ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={17} />
                  Generate Report
                </>
              )}
            </button>

            {/* Export Report */}
            <button
              onClick={exportReport}
              disabled={
                downloadingReport ||
                generatingReport ||
                report.reports.length === 0
              }
              title={
                report.reports.length === 0
                  ? "Generate a forensic report first"
                  : "Download the latest forensic report"
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-[#2a2a2e] bg-[#16161a] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-purple-500 hover:text-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingReport ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={17} />
                  Export Report
                </>
              )}
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}
      {error && report && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        </div>
      )}

      {/* =====================================================
          CASE SELECTOR
      ===================================================== */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">

        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Investigation Case
        </label>

        <select
          value={selectedCase}
          onChange={(e) =>
            setSelectedCase(e.target.value)
          }
          className="mt-2 w-full rounded-lg border border-[#2a2a2e] bg-[#0f0f12] px-4 py-3 text-sm text-white outline-none focus:border-purple-500 md:w-96"
        >
          {investigations.map((item) => (
            <option
              key={item.id}
              value={item.case_number}
            >
              {item.case_number} — {item.severity}
            </option>
          ))}
        </select>

      </div>

      {/* =====================================================
          REPORT LOADING
      ===================================================== */}
      {loadingReport ? (
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading forensic report...
        </div>
      ) : report ? (
        <>

          {/* =================================================
              INVESTIGATION OVERVIEW
          ================================================= */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Case Number
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  {report.investigation.case_number}
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  {report.investigation.title}
                </p>
              </div>

              <FileText
                size={28}
                className="text-purple-400"
              />

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

              {/* Status */}
              <div>
                <p className="text-xs text-zinc-500">
                  Status
                </p>

                <p className="mt-1 flex items-center gap-2 font-semibold text-green-400">
                  <CheckCircle size={15} />
                  {report.investigation.status}
                </p>
              </div>

              {/* Severity */}
              <div>
                <p className="text-xs text-zinc-500">
                  Severity
                </p>

                <p className="mt-1 font-semibold text-red-400">
                  {report.investigation.severity}
                </p>
              </div>

              {/* Threat Score */}
              <div>
                <p className="text-xs text-zinc-500">
                  Threat Score
                </p>

                <p className="mt-1 font-semibold text-white">
                  {report.investigation.threat_score}/100
                </p>
              </div>

              {/* Created */}
              <div>
                <p className="text-xs text-zinc-500">
                  Created
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm text-zinc-300">
                  <Clock size={14} />

                  {new Date(
                    report.investigation.created_at
                  ).toLocaleString()}
                </p>
              </div>

            </div>
          </div>

          {/* =================================================
              EVIDENCE INTEGRITY
          ================================================= */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

            <div className="flex items-center gap-3">

              <Hash
                size={20}
                className="text-purple-400"
              />

              <div>
                <h2 className="font-semibold text-white">
                  Evidence Integrity
                </h2>

                <p className="text-xs text-zinc-500">
                  Cryptographic evidence verification
                </p>
              </div>

            </div>

            <div className="mt-5 space-y-3">

              {report.evidence.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No evidence recorded for this investigation.
                </p>
              ) : (
                report.evidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div>
                        <p className="text-xs text-zinc-500">
                          {evidence.evidence_type}
                        </p>

                        <p className="mt-1 text-sm text-white">
                          {evidence.description}
                        </p>

                        <p className="mt-2 text-xs text-zinc-500">
                          Source: {evidence.source}
                        </p>

                        <p className="mt-2 text-xs text-zinc-600">
                          Collected:{" "}
                          {new Date(
                            evidence.collected_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="max-w-md text-right">

                        <p className="text-xs text-zinc-500">
                          SHA-256
                        </p>

                        <p className="mt-1 break-all font-mono text-xs text-purple-300">
                          {evidence.sha256_hash ||
                            "Not available"}
                        </p>

                      </div>

                    </div>

                  </div>
                ))
              )}

            </div>
          </div>

          {/* =================================================
              AI ANALYSIS
          ================================================= */}
          {report.analysis && (
            <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

              <div className="flex items-center gap-3">

                <Brain
                  size={20}
                  className="text-purple-400"
                />

                <div>
                  <h2 className="font-semibold text-white">
                    DECEPTRIX AI Analysis
                  </h2>

                  <p className="text-xs text-zinc-500">
                    {report.analysis.model_name}
                    {" · "}
                    Version {report.analysis.model_version}
                  </p>
                </div>

              </div>

              {/* AI Metrics */}
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Risk Score
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {report.analysis.risk_score}/100
                  </p>
                </div>

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Severity
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-400">
                    {report.analysis.severity}
                  </p>
                </div>

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    AI Confidence
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {Number(
                      report.analysis.confidence
                    ).toFixed(2)}
                    %
                  </p>
                </div>

              </div>

              {/* Explanation */}
              <div className="mt-5 rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">

                <p className="text-xs text-zinc-500">
                  Analysis Explanation
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {report.analysis.explanation}
                </p>

              </div>

              {/* Fingerprints */}
              <div className="mt-5">

                <p className="text-sm font-semibold text-white">
                  Manipulation Fingerprints
                </p>

                {report.analysis.fingerprints.length === 0 ? (
                  <p className="mt-3 text-sm text-zinc-500">
                    No manipulation fingerprints detected.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-3 md:grid-cols-3">

                    {report.analysis.fingerprints.map(
                      (fingerprint) => (
                        <div
                          key={fingerprint.id}
                          className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4"
                        >

                          <p className="font-semibold text-purple-300">
                            {fingerprint.technique}
                          </p>

                          <p className="mt-2 text-xs text-zinc-500">
                            Confidence
                          </p>

                          <p className="font-semibold text-white">
                            {fingerprint.confidence}%
                          </p>

                          <p className="mt-3 text-xs text-zinc-500">
                            Evidence
                          </p>

                          <p className="mt-1 text-sm text-zinc-300">
                            "{fingerprint.evidence_quote}"
                          </p>

                          <p className="mt-3 text-xs text-zinc-500">
                            Reasoning
                          </p>

                          <p className="mt-1 text-xs leading-5 text-zinc-400">
                            {fingerprint.reasoning}
                          </p>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>
          )}

          {/* =================================================
              THREAT PROPAGATION
          ================================================= */}
          {report.threatPrediction && (
            <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

              <div className="flex items-center gap-3">

                <ShieldAlert
                  size={20}
                  className="text-red-400"
                />

                <div>
                  <h2 className="font-semibold text-white">
                    Threat Propagation Prediction
                  </h2>

                  <p className="text-xs text-zinc-500">
                    Predictive deception campaign assessment
                  </p>
                </div>

              </div>

              {/* Threat Metrics */}
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Threat Probability
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-400">
                    {Number(
                      report.threatPrediction
                        .threat_probability
                    ).toFixed(2)}
                    %
                  </p>
                </div>

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Propagation Velocity
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {
                      report.threatPrediction
                        .propagation_velocity
                    }
                  </p>
                </div>

                <div className="rounded-lg bg-[#0f0f12] p-4">
                  <p className="text-xs text-zinc-500">
                    Related Narratives
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {report.narrative.relationships.length}
                  </p>
                </div>

              </div>

              {/* Target Profile */}
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">

                  <p className="text-xs text-zinc-500">
                    Target Audience
                  </p>

                  <p className="mt-2 text-sm text-white">
                    {
                      report.threatPrediction
                        .target_profile.audience
                    }
                  </p>

                </div>

                <div className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">

                  <p className="text-xs text-zinc-500">
                    Platforms
                  </p>

                  <p className="mt-2 text-sm text-white">
                    {report.threatPrediction.target_profile.platforms.join(
                      ", "
                    ) || "N/A"}
                  </p>

                </div>

              </div>

              {/* Reasoning */}
              <div className="mt-5 rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4">

                <p className="text-xs text-zinc-500">
                  Prediction Reasoning
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {
                    report.threatPrediction
                      .prediction_reasoning
                  }
                </p>

              </div>

            </div>
          )}

          {/* =================================================
              NARRATIVE INTELLIGENCE
          ================================================= */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

            <div className="flex items-center gap-3">

              <Network
                size={20}
                className="text-purple-400"
              />

              <div>
                <h2 className="font-semibold text-white">
                  Narrative Intelligence
                </h2>

                <p className="text-xs text-zinc-500">
                  Deception narrative and relationship analysis
                </p>
              </div>

            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="rounded-lg bg-[#0f0f12] p-4">

                <p className="text-xs text-zinc-500">
                  Narrative Nodes
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {report.narrative.nodes.length}
                </p>

              </div>

              <div className="rounded-lg bg-[#0f0f12] p-4">

                <p className="text-xs text-zinc-500">
                  Relationships
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {report.narrative.relationships.length}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              CHAIN OF CUSTODY
          ================================================= */}
          <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

            <div className="flex items-center gap-3">

              <Network
                size={20}
                className="text-purple-400"
              />

              <div>
                <h2 className="font-semibold text-white">
                  Chain of Custody
                </h2>

                <p className="text-xs text-zinc-500">
                  Evidence handling audit trail
                </p>
              </div>

            </div>

            <div className="mt-5 space-y-3">

              {report.chainOfCustody.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No chain-of-custody events recorded.
                </p>
              ) : (
                report.chainOfCustody.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4"
                  >

                    <div className="flex flex-wrap justify-between gap-3">

                      <div>
                        <p className="font-semibold text-purple-300">
                          {event.action}
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                          {event.details}
                        </p>
                      </div>

                      <div className="text-right">

                        <p className="text-xs text-zinc-500">
                          Actor
                        </p>

                        <p className="text-sm text-white">
                          {event.actor}
                        </p>

                        <p className="mt-2 text-xs text-zinc-500">
                          {new Date(
                            event.timestamp
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>

                  </div>
                ))
              )}

            </div>

          </div>

          {/* =================================================
              GENERATED REPORTS
          ================================================= */}
          {report.reports.length > 0 && (
            <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

              <div className="flex items-center gap-3">

                <FileText
                  size={20}
                  className="text-purple-400"
                />

                <div>
                  <h2 className="font-semibold text-white">
                    Generated Reports
                  </h2>

                  <p className="text-xs text-zinc-500">
                    Previously generated forensic reports
                  </p>
                </div>

              </div>

              <div className="mt-5 space-y-3">

                {report.reports.map((generatedReport) => (
                  <div
                    key={generatedReport.id}
                    className="flex flex-col gap-3 rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4 md:flex-row md:items-center md:justify-between"
                  >

                    <div>
                      <p className="font-semibold text-white">
                        {generatedReport.report_type}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Generated:{" "}
                        {new Date(
                          generatedReport.generated_at
                        ).toLocaleString()}
                      </p>

                      {generatedReport.report_hash && (
                        <p className="mt-2 break-all font-mono text-xs text-purple-300">
                          Hash: {generatedReport.report_hash}
                        </p>
                      )}
                    </div>

                    <CheckCircle
                      size={18}
                      className="text-green-400"
                    />

                  </div>
                ))}

              </div>

            </div>
          )}

        </>
      ) : (
        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6 text-sm text-zinc-500">
          Select an investigation to generate its forensic report.
        </div>
      )}

    </div>
  );
}