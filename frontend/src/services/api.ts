const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  user: AuthUser;
  token: string;
}

/* =========================
   AUTH
========================= */

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

/* =========================
   DISCOVERY
========================= */

export interface Fingerprint {
  technique: string;
  confidence: number;
  evidence_quote: string;
  reasoning: string;
}

export interface InvestigationResult {
  id: string;
  case_number: string;
  title: string;
  status: string;
  severity: string;
  threat_score: number;
  created_at: string;
  updated_at: string;
}

export interface EvidenceResult {
  id: string;
  investigation_id: string;
  evidence_type: string;
  description: string;
  source: string;
}

export interface AnalysisResult {
  id: string;
  model_name: string;
  model_version: string;
  risk_score: number;
  severity: string;
  confidence: number;
  explanation: string;
  fingerprints: Fingerprint[];
}

export interface NarrativeNode {
  id: string;
  investigation_id: string;
  node_type: string;
  node_value: string;
  platform: string;
  first_observed_at: string;
}

export interface NarrativeRelationship {
  source_node_id: string;
  target_node_id: string;
  relationship_type: string;
  confidence: number;
  source_platform: string;
}

export interface NarrativeResult {
  node: NarrativeNode;
  relationships: NarrativeRelationship[];
}

export interface ThreatPrediction {
  id: string;
  investigation_id: string;
  threat_probability: number;
  propagation_velocity: string;
  target_profile: {
    audience: string;
    platforms: string[];
    risk_factors: string[];
  };
  prediction_reasoning: string;
  created_at: string;
}

export interface DiscoverResponse {
  status: string;
  message: string;
  investigation: InvestigationResult;
  evidence: EvidenceResult;
  narrative: NarrativeResult;
  threatPrediction: ThreatPrediction;
  analysis: AnalysisResult;
}

export async function discoverContent(
  content: string,
  source: string
): Promise<DiscoverResponse> {
  const response = await fetch(`${API_BASE_URL}/discover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      source,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Discovery failed");
  }

  return data;
}

export interface InvestigationSummary {
  id: string;
  case_number: string;
  title: string;
  status: string;
  severity: string;
  threat_score: number;
  created_at: string;
  updated_at: string;
  analysis_id: string | null;
  model_name: string | null;
  model_version: string | null;
  risk_score: number | null;
  confidence: number | null;
  explanation: string | null;
}

export interface InvestigationDetails {
  investigation: {
    id: string;
    case_number: string;
    title: string;
    status: string;
    severity: string;
    threat_score: number;
    created_at: string;
    updated_at: string;
  };

  evidence: {
    id: string;
    evidence_type: string;
    description: string;
    source: string;
    collected_at: string;
  }[];

  analysis: {
    id: string;
    model_name: string;
    model_version: string;
    risk_score: number;
    severity: string;
    confidence: number;
    explanation: string;
    analyzed_at: string;

    fingerprints: {
      id: string;
      technique: string;
      confidence: number;
      evidence_quote: string;
      reasoning: string;
    }[];
  } | null;

  narrative: NarrativeResult | null;

  threatPrediction: ThreatPrediction | null;
}

export async function getInvestigations(): Promise<{
  status: string;
  data: InvestigationSummary[];
}> {
  const response = await fetch(
    `${API_BASE_URL}/investigations`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load investigations"
    );
  }

  return data;
}

export async function getInvestigation(
  caseNumber: string
): Promise<{
  status: string;
  data: InvestigationDetails;
}> {
  const response = await fetch(
    `${API_BASE_URL}/investigations/${caseNumber}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load investigation"
    );
  }

  return data;
}


export interface ThreatTechnique {
  technique: string;
  detections: number;
  average_confidence: number;
  example_evidence: string;
}

export interface SeverityDistribution {
  severity: string;
  count: number;
}

export interface RecentAnalysis {
  case_number: string;
  severity: string;
  threat_score: number;
  confidence: number;
  model_name: string;
  explanation: string;
  created_at: string;
}

export interface ThreatIntelligenceResponse {
  status: string;
  data: {
    techniques: ThreatTechnique[];
    severityDistribution: SeverityDistribution[];
    recentAnalyses: RecentAnalysis[];
  };
}

export async function getThreatIntelligence(): Promise<ThreatIntelligenceResponse> {
  const response = await fetch(
    `${API_BASE_URL}/threat-intelligence`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load threat intelligence"
    );
  }

  return data;
}

export interface ForensicEvidence {
  id: string;
  investigation_id?: string;
  case_number?: string;
  title?: string;
  evidence_type: string;
  description: string;
  source: string;
  file_path?: string;
  sha256_hash?: string;
  collected_at: string;
}

export interface ChainOfCustodyRecord {
  id: string;
  investigation_id?: string;
  case_number?: string;
  evidence_id?: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface ForensicsResponse {
  status: string;
  data: {
    evidence: ForensicEvidence[];
    chainOfCustody: ChainOfCustodyRecord[];
  };
}

export async function getForensics(): Promise<ForensicsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/forensics`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load forensic data"
    );
  }

  return data;
}

export interface ReportFingerprint {
  id: string;
  technique: string;
  confidence: number;
  evidence_quote: string;
  reasoning: string;
}

export interface ReportData {
  investigation: {
    id: string;
    case_number: string;
    title: string;
    status: string;
    severity: string;
    threat_score: number;
    created_at: string;
    updated_at: string;
  };

  evidence: {
    id: string;
    evidence_type: string;
    description: string;
    source: string;
    file_path: string | null;
    sha256_hash: string | null;
    collected_at: string;
  }[];

  analysis: {
    id: string;
    model_name: string;
    model_version: string;
    risk_score: number;
    severity: string;
    confidence: number;
    explanation: string;
    analyzed_at: string;
    fingerprints: ReportFingerprint[];
  } | null;

  narrative: {
    nodes: {
      id: string;
      node_type: string;
      node_value: string;
      platform: string;
      sha256_hash: string | null;
      first_observed_at: string;
      metadata: Record<string, unknown> | null;
    }[];

    relationships: {
      id: string;
      source_node_id: string;
      target_node_id: string;
      relationship_type: string;
      confidence: number;
      observed_at: string;
    }[];
  };

  threatPrediction: {
    id: string;
    threat_probability: number;
    propagation_velocity: string;
    target_profile: {
      audience: string;
      platforms: string[];
      risk_factors: string[];
    };
    prediction_reasoning: string;
    created_at: string;
  } | null;

  chainOfCustody: {
    id: string;
    evidence_id: string;
    action: string;
    actor: string;
    details: string;
    timestamp: string;
  }[];

  reports: {
    id: string;
    report_type: string;
    file_path: string | null;
    report_hash: string | null;
    generated_at: string;
  }[];
}

export async function getReport(
  caseNumber: string
): Promise<{
  status: string;
  data: ReportData;
}> {
  const response = await fetch(
    `${API_BASE_URL}/reports/${caseNumber}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load report"
    );
  }

  return data;
}

export async function generateForensicReport(
  caseNumber: string
): Promise<{
  status: string;
  message: string;
  report: {
    metadata: {
      id: string;
      investigation_id: string;
      report_type: string;
      file_path: string;
      report_hash: string;
      generated_at: string;
    };
    content: ReportData;
  };
}> {
  const response = await fetch(
    `${API_BASE_URL}/reports/${caseNumber}/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to generate forensic report"
    );
  }

  return data;
}

export async function downloadForensicReport(
  caseNumber: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/reports/${caseNumber}/download`
  );

  if (!response.ok) {
    let message = "Failed to download forensic report";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${caseNumber}-forensic-report.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}