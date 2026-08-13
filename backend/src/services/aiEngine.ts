export interface ManipulationFingerprint {
  technique: string;
  confidence: number;
  evidence_quote: string;
  reasoning: string;
}

export interface AIAnalysisResult {
  model_name: string;
  model_version: string;
  risk_score: number;
  severity: string;
  confidence: number;
  explanation: string;
  fingerprints: ManipulationFingerprint[];
  raw_response: Record<string, unknown>;
}

export function analyzeContent(content: string): AIAnalysisResult {
  const text = content.toLowerCase();

  let riskScore = 10;

  const fingerprints: ManipulationFingerprint[] = [];

  /*
   * Urgency / pressure
   */
  const urgencyPatterns = [
    "immediately",
    "urgent",
    "act now",
    "right now",
    "within 24 hours",
    "last chance",
    "don't wait",
  ];

  const urgencyMatch = urgencyPatterns.find((pattern) =>
    text.includes(pattern)
  );

  if (urgencyMatch) {
    riskScore += 20;

    fingerprints.push({
      technique: "URGENCY_PRESSURE",
      confidence: 88,
      evidence_quote: urgencyMatch,
      reasoning:
        "The content creates time pressure intended to reduce deliberate decision-making.",
    });
  }

  /*
   * Authority impersonation
   */
  const authorityPatterns = [
    "government",
    "government official",
    "police",
    "bank",
    "reserve bank",
    "official notice",
    "tax department",
    "ministry",
  ];

  const authorityMatch = authorityPatterns.find((pattern) =>
    text.includes(pattern)
  );

  if (authorityMatch) {
    riskScore += 20;

    fingerprints.push({
      technique: "AUTHORITY_IMPERSONATION",
      confidence: 82,
      evidence_quote: authorityMatch,
      reasoning:
        "The content invokes an authority or institution to increase perceived legitimacy.",
    });
  }

  /*
   * Financial manipulation
   */
  const financialPatterns = [
    "bank details",
    "account number",
    "credit card",
    "debit card",
    "otp",
    "password",
    "send money",
    "transfer money",
    "payment",
    "financial benefit",
  ];

  const financialMatch = financialPatterns.find((pattern) =>
    text.includes(pattern)
  );

  if (financialMatch) {
    riskScore += 25;

    fingerprints.push({
      technique: "FINANCIAL_MANIPULATION",
      confidence: 94,
      evidence_quote: financialMatch,
      reasoning:
        "The content requests or encourages disclosure of financial information or financial action.",
    });
  }

  /*
   * Fear / threat
   */
  const fearPatterns = [
    "account will be blocked",
    "account will be suspended",
    "legal action",
    "police action",
    "arrest",
    "penalty",
    "fine",
    "you will lose",
  ];

  const fearMatch = fearPatterns.find((pattern) =>
    text.includes(pattern)
  );

  if (fearMatch) {
    riskScore += 20;

    fingerprints.push({
      technique: "FEAR_AND_THREAT",
      confidence: 86,
      evidence_quote: fearMatch,
      reasoning:
        "The content uses fear, punishment, or negative consequences to influence the recipient.",
    });
  }

  /*
   * Reward / bait
   */
  const rewardPatterns = [
    "you won",
    "winner",
    "free money",
    "special benefit",
    "cash prize",
    "reward",
    "bonus",
    "claim your",
  ];

  const rewardMatch = rewardPatterns.find((pattern) =>
    text.includes(pattern)
  );

  if (rewardMatch) {
    riskScore += 15;

    fingerprints.push({
      technique: "REWARD_BAIT",
      confidence: 84,
      evidence_quote: rewardMatch,
      reasoning:
        "The content uses a reward or benefit to encourage the target to take an action.",
    });
  }

  /*
   * Suspicious links
   */
  const urlPattern = /(https?:\/\/|www\.)/i;

  if (urlPattern.test(content)) {
    riskScore += 15;

    fingerprints.push({
      technique: "SUSPICIOUS_LINK",
      confidence: 80,
      evidence_quote: "URL detected in submitted content",
      reasoning:
        "The presence of an external URL may indicate an attempt to redirect the target to another destination.",
    });
  }

  /*
   * Cap score
   */
  riskScore = Math.min(riskScore, 100);

  /*
   * Severity
   */
  let severity = "LOW";

  if (riskScore >= 75) {
    severity = "CRITICAL";
  } else if (riskScore >= 50) {
    severity = "HIGH";
  } else if (riskScore >= 30) {
    severity = "MEDIUM";
  }

  /*
   * Confidence
   */
  const confidence =
    fingerprints.length === 0
      ? 62
      : Math.min(
          95,
          Math.round(
            fingerprints.reduce(
              (sum, fingerprint) => sum + fingerprint.confidence,
              0
            ) / fingerprints.length
          )
        );

  /*
   * Explanation
   */
  let explanation =
    "The submitted content contains limited detectable deception indicators.";

  if (fingerprints.length > 0) {
    explanation =
      `The content exhibits ${fingerprints.length} detectable manipulation indicator(s), ` +
      `including ${fingerprints
        .map((fingerprint) => fingerprint.technique)
        .join(", ")}.`;
  }

  return {
    model_name: "DECEPTRIX-Local-Analyzer",
    model_version: "1.0",
    risk_score: riskScore,
    severity,
    confidence,
    explanation,
    fingerprints,
    raw_response: {
      engine: "DECEPTRIX Local Rule Analyzer",
      indicators_detected: fingerprints.length,
      techniques: fingerprints.map(
        (fingerprint) => fingerprint.technique
      ),
    },
  };
}