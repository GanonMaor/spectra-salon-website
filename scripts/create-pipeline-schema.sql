-- Pipeline System Schema for Spectra Salon
-- Create tables for pipeline management with glassmorphism UI

-- Pipelines
CREATE TABLE IF NOT EXISTS public.pipelines (
  id           bigserial PRIMARY KEY,
  name         text NOT NULL,
  description  text,
  is_default   boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Stages בתוך Pipeline (סדר נשלט ע"י position)
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id            bigserial PRIMARY KEY,
  pipeline_id   bigint NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name          text NOT NULL,
  position      int  NOT NULL,                    -- 1..N
  wip_limit     int  NULL,                        -- Work-in-Progress optional
  sla_hours     int  NULL,                        -- יעד SLA לשלב
  color         text NULL,                        -- תג צבע לעמודה (אופציונלי)
  created_at    timestamptz DEFAULT now(),
  UNIQUE (pipeline_id, position)
);

-- כרטיסים בפייפליין: כאן נקשר ל-Leads הקיימים
CREATE TABLE IF NOT EXISTS public.pipeline_cards (
  id              bigserial PRIMARY KEY,
  pipeline_id     bigint NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  stage_id        bigint NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  lead_email      text   NOT NULL,                 -- נזהה לידים לפי email (כבר יש לך)
  title           text   NULL,
  meta_json       jsonb  NULL,
  is_locked       boolean DEFAULT false,           -- לנעילת כרטיס (onboarding-pin)
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_cards_pipeline_stage ON public.pipeline_cards (pipeline_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_cards_lead_email ON public.pipeline_cards (lead_email);
CREATE INDEX IF NOT EXISTS idx_stages_pipeline_position ON public.pipeline_stages (pipeline_id, position);

-- לוג מעבר שלבים (לאנליטיקה)
CREATE TABLE IF NOT EXISTS public.pipeline_stage_transitions (
  id           bigserial PRIMARY KEY,
  card_id      bigint NOT NULL REFERENCES public.pipeline_cards(id) ON DELETE CASCADE,
  from_stage   bigint NULL,
  to_stage     bigint NOT NULL,
  by_user      text   NULL,                        -- אימייל המבצע
  occurred_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transitions_card ON public.pipeline_stage_transitions (card_id);
CREATE INDEX IF NOT EXISTS idx_transitions_occurred ON public.pipeline_stage_transitions (occurred_at);

-- ברירת מחדל (Seed) – Pipeline "Onboarding"
INSERT INTO public.pipelines (name, description, is_default) 
VALUES ('Onboarding', 'Default onboarding pipeline for new leads', true) 
ON CONFLICT DO NOTHING;

-- הוספת שלבי ברירת מחדל
WITH p AS (SELECT id FROM public.pipelines WHERE name='Onboarding' LIMIT 1)
INSERT INTO public.pipeline_stages (pipeline_id, name, position, sla_hours, color)
SELECT p.id, s.name, s.pos, s.sla, s.color
FROM p, (VALUES
  ('Applied',            1, 48, '#3B82F6'),
  ('Qualified',          2, 72, '#10B981'),
  ('Payment Pending',    3, 48, '#F59E0B'),
  ('Installed',          4, 72, '#8B5CF6'),
  ('Active',             5, NULL, '#06B6D4')
) AS s(name,pos,sla,color)
ON CONFLICT (pipeline_id, position) DO NOTHING;
