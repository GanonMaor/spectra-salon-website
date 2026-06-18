-- ============================================================
-- Migration 024: Customer Usage Intelligence
-- ============================================================
-- Generic, tenant-isolated persistence for usage-file analysis.
-- Stores normalized facts, structured insight items, unresolved records,
-- and immutable report snapshots. No table or column is salon-specific.
-- ============================================================

CREATE TABLE IF NOT EXISTS salon_accounts (
  id                    TEXT PRIMARY KEY,
  organization_id       TEXT NOT NULL,
  customer_account_id   TEXT NOT NULL,
  display_label         TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'active',
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_accounts_status CHECK (status IN ('active','archived','deleted'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_salon_accounts_tenant
  ON salon_accounts (organization_id, customer_account_id, id);

CREATE TABLE IF NOT EXISTS usage_uploads (
  id                    TEXT PRIMARY KEY,
  organization_id       TEXT NOT NULL,
  customer_account_id   TEXT NOT NULL,
  salon_id              TEXT NOT NULL,
  parser_profile_id     TEXT NOT NULL,
  original_filename     TEXT NOT NULL,
  file_checksum         TEXT NOT NULL,
  file_size_bytes       INTEGER NOT NULL DEFAULT 0,
  uploaded_at           TIMESTAMPTZ DEFAULT now(),
  date_range_start      DATE,
  date_range_end        DATE,
  row_count             INTEGER NOT NULL DEFAULT 0,
  accepted_row_count    INTEGER NOT NULL DEFAULT 0,
  rejected_row_count    INTEGER NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'committed',
  data_quality          JSONB NOT NULL DEFAULT '{}',
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_by            TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_usage_uploads_status CHECK (
    status IN ('previewed','committed','analyzed','failed','deleted')
  )
);

CREATE INDEX IF NOT EXISTS idx_usage_uploads_salon
  ON usage_uploads (organization_id, customer_account_id, salon_id, uploaded_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_usage_uploads_checksum_tenant
  ON usage_uploads (organization_id, customer_account_id, salon_id, file_checksum);

CREATE TABLE IF NOT EXISTS usage_analysis_runs (
  id                         TEXT PRIMARY KEY,
  organization_id            TEXT NOT NULL,
  customer_account_id        TEXT NOT NULL,
  salon_id                   TEXT NOT NULL,
  upload_ids                 TEXT[] NOT NULL DEFAULT '{}',
  product_truth_version      TEXT NOT NULL DEFAULT 'unknown',
  service_classifier_version TEXT NOT NULL DEFAULT '1.0.0',
  insight_engine_version     TEXT NOT NULL DEFAULT '1.0.0',
  generated_at               TIMESTAMPTZ DEFAULT now(),
  status                     TEXT NOT NULL DEFAULT 'completed',
  report_status              TEXT NOT NULL DEFAULT 'draft',
  supersedes_analysis_run_id TEXT REFERENCES usage_analysis_runs(id),
  created_by                 TEXT,
  metadata                   JSONB NOT NULL DEFAULT '{}',
  created_at                 TIMESTAMPTZ DEFAULT now(),
  updated_at                 TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_usage_analysis_runs_status CHECK (
    status IN ('created','running','completed','failed','superseded')
  ),
  CONSTRAINT chk_usage_analysis_runs_report_status CHECK (
    report_status IN ('draft','approved','archived','superseded')
  )
);

CREATE INDEX IF NOT EXISTS idx_usage_analysis_runs_salon
  ON usage_analysis_runs (organization_id, customer_account_id, salon_id, generated_at DESC);

CREATE TABLE IF NOT EXISTS usage_analysis_facts (
  id                    TEXT PRIMARY KEY,
  organization_id       TEXT NOT NULL,
  customer_account_id   TEXT NOT NULL,
  salon_id              TEXT NOT NULL,
  upload_id             TEXT NOT NULL REFERENCES usage_uploads(id) ON DELETE CASCADE,
  analysis_run_id       TEXT NOT NULL REFERENCES usage_analysis_runs(id) ON DELETE CASCADE,
  fact_level            TEXT NOT NULL,
  source_row_index      INTEGER,
  service_event_id      TEXT,
  formula_id            TEXT,
  service_stage_id      TEXT,
  client_visit_id       TEXT,
  pseudonymous_client_id TEXT,
  event_date            DATE,
  event_time            TIME,
  service_type          TEXT,
  raw_brand             TEXT,
  raw_product_line      TEXT,
  raw_product_value     TEXT,
  normalized_product_key TEXT,
  quantity_grams        NUMERIC(12,3),
  cost_value            NUMERIC(12,3),
  canonical_product_id  TEXT,
  resolution_status     TEXT NOT NULL DEFAULT 'unresolved',
  confidence            TEXT NOT NULL DEFAULT 'none',
  payload               JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_usage_analysis_fact_level CHECK (
    fact_level IN (
      'usage_row','formula_component','formula','service_stage',
      'service','client_visit','client_timeline_event'
    )
  ),
  CONSTRAINT chk_usage_analysis_fact_resolution CHECK (
    resolution_status IN ('resolved','suggested','unresolved','not_applicable')
  ),
  CONSTRAINT chk_usage_analysis_fact_confidence CHECK (
    confidence IN ('high','medium','low','none')
  )
);

CREATE INDEX IF NOT EXISTS idx_usage_analysis_facts_run
  ON usage_analysis_facts (analysis_run_id, fact_level);

CREATE INDEX IF NOT EXISTS idx_usage_analysis_facts_upload
  ON usage_analysis_facts (upload_id);

CREATE INDEX IF NOT EXISTS idx_usage_analysis_facts_product
  ON usage_analysis_facts (canonical_product_id)
  WHERE canonical_product_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS usage_insight_packets (
  analysis_run_id          TEXT PRIMARY KEY REFERENCES usage_analysis_runs(id) ON DELETE CASCADE,
  organization_id          TEXT NOT NULL,
  customer_account_id      TEXT NOT NULL,
  salon_id                 TEXT NOT NULL,
  source_row_count         INTEGER NOT NULL DEFAULT 0,
  accepted_row_count       INTEGER NOT NULL DEFAULT 0,
  rejected_row_count       INTEGER NOT NULL DEFAULT 0,
  resolved_product_count   INTEGER NOT NULL DEFAULT 0,
  unresolved_product_count INTEGER NOT NULL DEFAULT 0,
  service_count            INTEGER NOT NULL DEFAULT 0,
  formula_count            INTEGER NOT NULL DEFAULT 0,
  visit_count              INTEGER NOT NULL DEFAULT 0,
  client_count             INTEGER NOT NULL DEFAULT 0,
  date_range               JSONB NOT NULL DEFAULT '{}',
  data_quality             JSONB NOT NULL DEFAULT '{}',
  support_statuses         JSONB NOT NULL DEFAULT '{}',
  packet_json              JSONB NOT NULL,
  generated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_insight_packets_salon
  ON usage_insight_packets (organization_id, customer_account_id, salon_id, generated_at DESC);

CREATE TABLE IF NOT EXISTS usage_insight_items (
  id                       TEXT PRIMARY KEY,
  analysis_run_id          TEXT NOT NULL REFERENCES usage_analysis_runs(id) ON DELETE CASCADE,
  organization_id          TEXT NOT NULL,
  customer_account_id      TEXT NOT NULL,
  salon_id                 TEXT NOT NULL,
  insight_type             TEXT NOT NULL,
  title                    TEXT NOT NULL,
  summary                  TEXT NOT NULL,
  metric_value             NUMERIC(14,4),
  metric_unit              TEXT,
  calculation_definition   TEXT NOT NULL,
  numerator                NUMERIC(14,4),
  denominator              NUMERIC(14,4),
  confidence               TEXT NOT NULL DEFAULT 'medium',
  support_status           TEXT NOT NULL,
  unresolved_data_effect   TEXT,
  evidence_references      JSONB NOT NULL DEFAULT '[]',
  drill_down_references    JSONB NOT NULL DEFAULT '[]',
  payload                  JSONB NOT NULL DEFAULT '{}',
  display_order            INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_usage_insight_items_confidence CHECK (
    confidence IN ('high','medium','low','none')
  ),
  CONSTRAINT chk_usage_insight_items_support CHECK (
    support_status IN ('supported','partially_supported','not_supported')
  )
);

CREATE INDEX IF NOT EXISTS idx_usage_insight_items_run_order
  ON usage_insight_items (analysis_run_id, display_order);

CREATE TABLE IF NOT EXISTS usage_unresolved_records (
  id                    TEXT PRIMARY KEY,
  organization_id       TEXT NOT NULL,
  customer_account_id   TEXT NOT NULL,
  salon_id              TEXT NOT NULL,
  upload_id             TEXT NOT NULL REFERENCES usage_uploads(id) ON DELETE CASCADE,
  analysis_run_id       TEXT NOT NULL REFERENCES usage_analysis_runs(id) ON DELETE CASCADE,
  source_row_index      INTEGER,
  raw_product_name      TEXT,
  normalized_raw_name   TEXT,
  reason                TEXT NOT NULL,
  effect                TEXT NOT NULL,
  candidate_count       INTEGER NOT NULL DEFAULT 0,
  payload               JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_unresolved_records_run
  ON usage_unresolved_records (analysis_run_id);

CREATE TABLE IF NOT EXISTS usage_report_snapshots (
  id                    TEXT PRIMARY KEY,
  organization_id       TEXT NOT NULL,
  customer_account_id   TEXT NOT NULL,
  salon_id              TEXT NOT NULL,
  analysis_run_id       TEXT NOT NULL REFERENCES usage_analysis_runs(id) ON DELETE CASCADE,
  report_title          TEXT NOT NULL,
  snapshot_json         JSONB NOT NULL,
  generated_at          TIMESTAMPTZ DEFAULT now(),
  immutable             BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_report_snapshots_run
  ON usage_report_snapshots (analysis_run_id);

CREATE INDEX IF NOT EXISTS idx_usage_report_snapshots_salon
  ON usage_report_snapshots (organization_id, customer_account_id, salon_id, generated_at DESC);
