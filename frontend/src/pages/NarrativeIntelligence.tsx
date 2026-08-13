import { useEffect, useState } from "react";

interface NarrativeNode {
  id: string;
  investigation_id: string | null;
  node_type: string;
  node_value: string;
  platform: string | null;
  first_observed_at: string | null;
}

interface NarrativeRelationship {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: string;
  confidence: number;
  observed_at: string;
  source_case_number?: string;
  target_case_number?: string;
  source_platform?: string;
  target_platform?: string;
}

interface NarrativeResponse {
  nodes: NarrativeNode[];
  relationships: NarrativeRelationship[];
}

export default function NarrativeIntelligence() {
  const [data, setData] = useState<NarrativeResponse>({
    nodes: [],
    relationships: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/narrative")
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "ok") {
          setData(result.data);
        }
      })
      .catch((error) => {
        console.error("Narrative intelligence error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-zinc-400">
        Loading narrative intelligence...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Narrative Intelligence
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Trace how suspicious narratives spread, repeat, and mutate
          across investigations and platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-500">Narrative Nodes</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {data.nodes.length}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-500">Relationships</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {data.relationships.length}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-500">Same Narratives</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {
              data.relationships.filter(
                (relationship) =>
                  relationship.relationship_type === "SAME_NARRATIVE"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">
          Narrative Relationships
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Connections detected between suspicious content.
        </p>

        <div className="mt-6 space-y-4">
          {data.relationships.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No narrative relationships detected yet.
            </p>
          ) : (
            data.relationships.map((relationship) => (
              <div
                key={relationship.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
                    {relationship.relationship_type}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {relationship.confidence}%
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-zinc-600">
                      Source
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {relationship.source_case_number ||
                        relationship.source_node_id}
                    </p>

                    {relationship.source_platform && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Platform: {relationship.source_platform}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs uppercase text-zinc-600">
                      Related Content
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {relationship.target_case_number ||
                        relationship.target_node_id}
                    </p>

                    {relationship.target_platform && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Platform: {relationship.target_platform}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">
          Narrative Nodes
        </h2>

        <div className="mt-5 space-y-4">
          {data.nodes.map((node) => (
            <div
              key={node.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase text-zinc-600">
                    {node.node_type}
                  </p>

                  <p className="mt-1 text-sm text-zinc-300">
                    {node.node_value}
                  </p>
                </div>

                {node.platform && (
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                    {node.platform}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}