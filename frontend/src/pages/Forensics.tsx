import { useEffect, useState } from "react";
import {
  ShieldCheck,
  FileSearch,
  Hash,
  Clock,
  User,
  Activity,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import {
  getForensics,
  type ForensicEvidence,
  type ChainOfCustodyRecord,
} from "../services/api";

export default function Forensics() {
  const [evidence, setEvidence] = useState<ForensicEvidence[]>([]);
  const [custody, setCustody] = useState<ChainOfCustodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadForensics() {
      try {
        const response = await getForensics();

        setEvidence(response.data.evidence);
        setCustody(response.data.chainOfCustody);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load forensic data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadForensics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Loader2 size={20} className="animate-spin" />
        Loading forensic evidence...
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
          Forensic Reconstruction
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Review evidence, timelines, hashes, and chain-of-custody records.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <FileSearch size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Evidence Items
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {evidence.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
              <Hash size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Hashed Evidence
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {evidence.filter((item) => item.sha256_hash).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Activity size={20} />
            </div>

            <div>
              <p className="text-xs text-zinc-500">
                Custody Events
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {custody.length}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Evidence */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

        <div className="flex items-center gap-3">
          <ShieldCheck className="text-purple-400" size={20} />

          <div>
            <h2 className="font-semibold text-white">
              Evidence Registry
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Evidence collected during investigations.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">

          {evidence.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No forensic evidence found.
            </p>
          ) : (
            evidence.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">

                  <div>
                    <p className="font-semibold text-white">
                      {item.evidence_type}
                    </p>

                    {item.case_number && (
                      <p className="mt-1 text-xs text-purple-400">
                        {item.case_number}
                      </p>
                    )}

                    <p className="mt-3 text-sm text-zinc-400">
                      {item.description || "No description available"}
                    </p>

                    <p className="mt-2 text-xs text-zinc-600">
                      Source: {item.source || "Unknown"}
                    </p>
                  </div>

                  <div className="min-w-[280px]">

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Hash size={13} />
                      SHA-256
                    </div>

                    <p className="mt-1 break-all font-mono text-xs text-zinc-400">
                      {item.sha256_hash || "Not available"}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
                      <Clock size={13} />
                      {new Date(
                        item.collected_at
                      ).toLocaleString()}
                    </div>

                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

      {/* Chain of Custody */}
      <div className="rounded-xl border border-[#2a2a2e] bg-[#16161a] p-6">

        <div className="flex items-center gap-3">
          <User className="text-blue-400" size={20} />

          <div>
            <h2 className="font-semibold text-white">
              Chain of Custody
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Audit trail of forensic evidence handling.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">

          {custody.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No chain-of-custody records found.
            </p>
          ) : (
            custody.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[#2a2a2e] bg-[#0f0f12] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>
                    <p className="font-semibold text-white">
                      {item.action}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {item.details || "No details available"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-500">
                      Actor
                    </p>

                    <p className="text-sm text-zinc-300">
                      {item.actor || "Unknown"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {new Date(
                        item.timestamp
                      ).toLocaleString()}
                    </p>
                  </div>

                </div>
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
}