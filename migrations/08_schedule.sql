-- Migration: Schedule domain tables
-- Description: Appointments, segments (split blocks), and split templates for the salon CRM calendar.

-- ── Master appointment record ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_appointments (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id   TEXT NOT NULL,
    client_name   TEXT NOT NULL,
    service_name  TEXT NOT NULL,
    service_category TEXT NOT NULL DEFAULT 'Other',
    status        TEXT NOT NULL DEFAULT 'confirmed',
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Time segments (each block on the timeline) ───────────────────
CREATE TABLE IF NOT EXISTS schedule_segments (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    appointment_id  TEXT NOT NULL REFERENCES schedule_appointments(id) ON DELETE CASCADE,
    segment_type    TEXT NOT NULL DEFAULT 'service',  -- service | apply | wait | wash | dry | checkin | checkout
    label           TEXT,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    product_grams   REAL,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT segment_time_valid CHECK (end_time > start_time)
);

-- ── Split templates (reusable service flows) ─────────────────────
CREATE TABLE IF NOT EXISTS schedule_split_templates (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'Color',
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedule_split_template_steps (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    template_id TEXT NOT NULL REFERENCES schedule_split_templates(id) ON DELETE CASCADE,
    step_type   TEXT NOT NULL DEFAULT 'service',
    label       TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_gap      BOOLEAN NOT NULL DEFAULT false
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sched_appt_employee ON schedule_appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_sched_seg_appt ON schedule_segments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sched_seg_time ON schedule_segments(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_sched_tmpl_steps ON schedule_split_template_steps(template_id, sort_order);

-- ── Seed: default split templates ────────────────────────────────
INSERT INTO schedule_split_templates (id, name, category, description) VALUES
  ('tmpl-color-basic',  'Basic Color',       'Color',        'Apply -> Wait -> Wash -> Dry'),
  ('tmpl-highlights',   'Highlights',        'Highlights',   'Apply -> Wait -> Toner -> Wash -> Dry'),
  ('tmpl-balayage',     'Balayage',          'Highlights',   'Bleach -> Wait -> Color Wash -> Blow Dry'),
  ('tmpl-keratin',      'Keratin Treatment', 'Straightening','Apply -> Process -> Flat Iron -> Rinse')
ON CONFLICT DO NOTHING;

INSERT INTO schedule_split_template_steps (id, template_id, step_type, label, duration_minutes, sort_order, is_gap) VALUES
  -- Basic Color
  ('s01','tmpl-color-basic','apply',   'Apply Color',   20, 1, false),
  ('s02','tmpl-color-basic','wait',    'Processing',    30, 2, true),
  ('s03','tmpl-color-basic','wash',    'Color Wash',    15, 3, false),
  ('s04','tmpl-color-basic','dry',     'Blow Dry',      20, 4, false),
  -- Highlights
  ('s05','tmpl-highlights','apply',    'Apply Foils',   40, 1, false),
  ('s06','tmpl-highlights','wait',     'Processing',    35, 2, true),
  ('s07','tmpl-highlights','apply',    'Toner',         10, 3, false),
  ('s08','tmpl-highlights','wash',     'Wash',          15, 4, false),
  ('s09','tmpl-highlights','dry',      'Blow Dry',      20, 5, false),
  -- Balayage
  ('s10','tmpl-balayage','apply',      'Bleach',        30, 1, false),
  ('s11','tmpl-balayage','wait',       'Processing',    45, 2, true),
  ('s12','tmpl-balayage','wash',       'Color Wash',    15, 3, false),
  ('s13','tmpl-balayage','dry',        'Blow Dry',      20, 4, false),
  -- Keratin
  ('s14','tmpl-keratin','apply',       'Apply Keratin', 25, 1, false),
  ('s15','tmpl-keratin','wait',        'Process',       30, 2, true),
  ('s16','tmpl-keratin','service',     'Flat Iron',     45, 3, false),
  ('s17','tmpl-keratin','wash',        'Rinse',         10, 4, false)
ON CONFLICT DO NOTHING;
