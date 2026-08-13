-- ============================================================
-- DECEPTRIX INITIAL DATABASE SCHEMA
-- Deception Campaign Intelligence Platform
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analyst',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- ============================================================
-- 2. INVESTIGATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS investigations (
    CREATE SEQUENCE IF NOT EXISTS investigations_case_number_seq
START WITH 1
INCREMENT BY 1;
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL DEFAULT (
    'CASE-' ||
    EXTRACT(YEAR FROM CURRENT_DATE)::text ||
    '-' ||
    LPAD(nextval('investigations_case_number_seq')::text, 6, '0')
),
    title VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    severity VARCHAR(20),
    threat_score INTEGER CHECK (threat_score >= 0 AND threat_score <= 100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. SUBMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    content_type VARCHAR(30) NOT NULL,
    original_text TEXT,
    source_url TEXT,
    file_name TEXT,
    file_path TEXT,
    sha256_hash VARCHAR(64),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. AI ANALYSES
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(100),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    severity VARCHAR(20),
    confidence NUMERIC(5,2),
    explanation TEXT,
    raw_response JSONB,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. MANIPULATION FINGERPRINTS
-- ============================================================

CREATE TABLE IF NOT EXISTS manipulation_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES ai_analyses(id) ON DELETE CASCADE,
    technique VARCHAR(100) NOT NULL,
    confidence NUMERIC(5,2),
    evidence_quote TEXT,
    reasoning TEXT
);

-- ============================================================
-- 6. EVIDENCE
-- ============================================================

CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL,
    description TEXT,
    source TEXT,
    file_path TEXT,
    sha256_hash VARCHAR(64),
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. CAMPAIGNS
-- ============================================================

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID REFERENCES investigations(id) ON DELETE SET NULL,
    campaign_name VARCHAR(255) NOT NULL,
    description TEXT,
    coordination_score NUMERIC(5,2),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. CAMPAIGN ENTITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS campaign_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_value TEXT NOT NULL,
    risk_score NUMERIC(5,2),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. NARRATIVE NODES
-- ============================================================

CREATE TABLE IF NOT EXISTS narrative_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID REFERENCES investigations(id) ON DELETE SET NULL,
    node_type VARCHAR(50) NOT NULL,
    node_value TEXT NOT NULL,
    platform VARCHAR(100),
    sha256_hash VARCHAR(64),
    first_observed_at TIMESTAMPTZ,
    metadata JSONB
);

-- ============================================================
-- 10. NARRATIVE RELATIONSHIPS
-- ============================================================

CREATE TABLE IF NOT EXISTS narrative_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_id UUID NOT NULL REFERENCES narrative_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES narrative_nodes(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    confidence NUMERIC(5,2),
    observed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. THREAT PREDICTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS threat_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    threat_probability NUMERIC(5,2),
    propagation_velocity VARCHAR(30),
    target_profile JSONB,
    prediction_reasoning TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. PROTECTION ACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS protection_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PROPOSED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 13. CHAIN OF CUSTODY
-- ============================================================

CREATE TABLE IF NOT EXISTS chain_of_custody (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 14. FORENSIC REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS forensic_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    file_path TEXT,
    report_hash VARCHAR(64),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_investigations_status
ON investigations(status);

CREATE INDEX IF NOT EXISTS idx_investigations_severity
ON investigations(severity);

CREATE INDEX IF NOT EXISTS idx_submissions_investigation
ON submissions(investigation_id);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_submission
ON ai_analyses(submission_id);

CREATE INDEX IF NOT EXISTS idx_evidence_investigation
ON evidence(investigation_id);

CREATE INDEX IF NOT EXISTS idx_campaign_entities_campaign
ON campaign_entities(campaign_id);

CREATE INDEX IF NOT EXISTS idx_narrative_relationships_source
ON narrative_relationships(source_node_id);

CREATE INDEX IF NOT EXISTS idx_narrative_relationships_target
ON narrative_relationships(target_node_id);

CREATE INDEX IF NOT EXISTS idx_chain_of_custody_investigation
ON chain_of_custody(investigation_id);