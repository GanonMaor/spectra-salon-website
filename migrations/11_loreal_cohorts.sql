-- Migration 11: L'Oréal Cohort Analysis Tables
-- Persistent cohort "cells" for market analysis in L'Oréal Analytics dashboard.

-- ── 1. Cohorts (analysis cells) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS loreal_cohorts (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    start_month     TEXT NOT NULL,   -- e.g. "Jan 2025"
    end_month       TEXT NOT NULL,   -- e.g. "Jan 2026"
    created_by      TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loreal_cohorts_range ON loreal_cohorts(start_month, end_month);

-- ── 2. Cohort members (selected users per cell) ─────────────────────
CREATE TABLE IF NOT EXISTS loreal_cohort_members (
    cohort_id       INTEGER NOT NULL REFERENCES loreal_cohorts(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL,
    added_at        TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (cohort_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_loreal_cohort_members_user ON loreal_cohort_members(user_id);
