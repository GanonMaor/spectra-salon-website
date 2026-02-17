-- Migration 09: Multi-Tenant CRM Schema
-- Creates salons, crm_users, memberships, customers, visits, and extends schedule tables.

-- ── 1. Salons (tenants) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salons (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    phone           TEXT,
    email           TEXT,
    address         TEXT,
    city            TEXT,
    state           TEXT,
    timezone        TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
    status          TEXT NOT NULL DEFAULT 'active',  -- active | suspended | demo
    logo_url        TEXT,
    source_salon_user_id INTEGER,  -- FK back to legacy salon_users.id (nullable)
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug);
CREATE INDEX IF NOT EXISTS idx_salons_status ON salons(status);

-- ── 2. CRM Users (operators / staff with login) ────────────────────
CREATE TABLE IF NOT EXISTS crm_users (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email           TEXT UNIQUE,
    display_name    TEXT NOT NULL,
    phone           TEXT,
    avatar_url      TEXT,
    status          TEXT NOT NULL DEFAULT 'active',  -- active | inactive
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Salon memberships (user <-> salon + role) ───────────────────
CREATE TABLE IF NOT EXISTS salon_memberships (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    salon_id        TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'stylist',  -- owner | manager | stylist | viewer
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(salon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_salon ON salon_memberships(salon_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON salon_memberships(user_id);

-- ── 4. CRM Customers (per salon) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_customers (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    salon_id        TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    first_name      TEXT NOT NULL,
    last_name       TEXT,
    phone           TEXT,
    email           TEXT,
    notes           TEXT,
    tags            TEXT[],            -- e.g. {'vip','sensitive-scalp'}
    avatar_url      TEXT,
    status          TEXT NOT NULL DEFAULT 'active',  -- active | inactive | archived
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_customers_salon ON crm_customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_crm_customers_phone ON crm_customers(salon_id, phone);
CREATE INDEX IF NOT EXISTS idx_crm_customers_name ON crm_customers(salon_id, first_name, last_name);

-- ── 5. Customer visits / history ───────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_visits (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    salon_id        TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    customer_id     TEXT NOT NULL REFERENCES crm_customers(id) ON DELETE CASCADE,
    appointment_id  TEXT,  -- optional link back to appointment
    visit_date      TIMESTAMPTZ NOT NULL DEFAULT now(),
    service_name    TEXT,
    service_category TEXT,
    employee_name   TEXT,
    employee_id     TEXT,
    duration_minutes INTEGER,
    price           NUMERIC(10,2),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visits_customer ON customer_visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_salon_date ON customer_visits(salon_id, visit_date);

-- ── 6. Extend schedule_appointments for tenancy + customer link ────
ALTER TABLE schedule_appointments ADD COLUMN IF NOT EXISTS salon_id TEXT;
ALTER TABLE schedule_appointments ADD COLUMN IF NOT EXISTS customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_sched_appt_salon ON schedule_appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_sched_appt_customer ON schedule_appointments(customer_id);

-- ── 7. Extend schedule_split_templates for tenancy ─────────────────
ALTER TABLE schedule_split_templates ADD COLUMN IF NOT EXISTS salon_id TEXT;

-- ── 8. Bootstrap: Create "Salon Look" as primary salon ─────────────
INSERT INTO salons (id, name, slug, timezone, status)
VALUES ('salon-look', 'Salon Look', 'salon-look', 'Asia/Jerusalem', 'active')
ON CONFLICT (id) DO NOTHING;

-- ── 9. Backfill existing appointments to Salon Look ────────────────
UPDATE schedule_appointments SET salon_id = 'salon-look' WHERE salon_id IS NULL;

-- ── 10. Backfill existing templates to Salon Look ──────────────────
UPDATE schedule_split_templates SET salon_id = 'salon-look' WHERE salon_id IS NULL;

-- ── 11. Import salon_users into salons table ───────────────────────
INSERT INTO salons (name, slug, phone, state, city, status, source_salon_user_id)
SELECT DISTINCT ON (LOWER(TRIM(su.salon_name)))
    TRIM(su.salon_name),
    LOWER(REGEXP_REPLACE(TRIM(su.salon_name), '[^a-zA-Z0-9]+', '-', 'g')),
    su.phone_number,
    su.state,
    su.city,
    'active',
    su.id
FROM salon_users su
WHERE su.salon_name IS NOT NULL
  AND TRIM(su.salon_name) != ''
  AND LOWER(TRIM(su.salon_name)) != 'salon look'
ORDER BY LOWER(TRIM(su.salon_name)), su.id
ON CONFLICT (slug) DO NOTHING;

-- ── 12. Create mock CRM user for demo ──────────────────────────────
INSERT INTO crm_users (id, email, display_name, phone, status)
VALUES ('demo-user', 'demo@salonos.ai', 'Demo Manager', '+972500000000', 'active')
ON CONFLICT (id) DO NOTHING;

-- ── 13. Give demo user owner access to Salon Look ──────────────────
INSERT INTO salon_memberships (id, salon_id, user_id, role, is_default)
VALUES ('mem-demo-look', 'salon-look', 'demo-user', 'owner', true)
ON CONFLICT (salon_id, user_id) DO NOTHING;

-- ── 14. Seed demo customers for Salon Look ─────────────────────────
INSERT INTO crm_customers (id, salon_id, first_name, last_name, phone, email, tags, status) VALUES
  ('c01','salon-look','Michaela','Stone','+972501111111','michaela@email.com','{"vip"}','active'),
  ('c02','salon-look','Rachel','Levi','+972502222222','rachel@email.com','{}','active'),
  ('c03','salon-look','Shira','Alon','+972503333333','shira@email.com','{}','active'),
  ('c04','salon-look','Tom','Hadad','+972504444444','tom@email.com','{}','active'),
  ('c05','salon-look','Dana','Peretz','+972505555555','dana@email.com','{"regular"}','active'),
  ('c06','salon-look','Yael','Mizrahi','+972506666666','yael@email.com','{}','active'),
  ('c07','salon-look','Liyla','Cavaliny','+972507777777','liyla@email.com','{"vip"}','active'),
  ('c08','salon-look','Neta','Gertiog','+972508888888','neta@email.com','{}','active'),
  ('c09','salon-look','Orly','Shapira','+972509999999','orly@email.com','{}','active'),
  ('c10','salon-look','Ron','Elkayam','+972510000000','ron@email.com','{}','active'),
  ('c11','salon-look','Sapir','Cohen','+972510000001','sapir@email.com','{"regular"}','active'),
  ('c12','salon-look','Tamar','Levy','+972510000002','tamar@email.com','{}','active'),
  ('c13','salon-look','Hila','Ben David','+972510000003','hila@email.com','{}','active'),
  ('c14','salon-look','Noa','Friedman','+972510000004','noa@email.com','{"vip"}','active'),
  ('c15','salon-look','Rina','Katz','+972510000005','rina@email.com','{}','active'),
  ('c16','salon-look','Efrat','Dahan','+972510000006','efrat@email.com','{}','active'),
  ('c17','salon-look','Dikla','Mor','+972510000007','dikla@email.com','{}','active'),
  ('c18','salon-look','Ayelet','Bar','+972510000008','ayelet@email.com','{"regular"}','active'),
  ('c19','salon-look','Zohar','Stein','+972510000009','zohar@email.com','{}','active'),
  ('c20','salon-look','Romema','Green','+972510000010','romema@email.com','{}','active')
ON CONFLICT (id) DO NOTHING;

-- ── 15. Seed visit history for demo customers ──────────────────────
INSERT INTO customer_visits (id, salon_id, customer_id, visit_date, service_name, service_category, employee_name, employee_id, duration_minutes, price, notes) VALUES
  ('v01','salon-look','c01', now() - interval '7 days','Root Color','Color','Adele Cooper','e1',90,350,'Regular appointment'),
  ('v02','salon-look','c01', now() - interval '35 days','Full Color + Toner','Color','Adele Cooper','e1',120,480,'Color correction needed'),
  ('v03','salon-look','c01', now() - interval '63 days','Balayage','Highlights','Adele Cooper','e1',150,650,'First balayage'),
  ('v04','salon-look','c02', now() - interval '14 days','Balayage','Highlights','Adele Cooper','e1',150,620,NULL),
  ('v05','salon-look','c02', now() - interval '42 days','Highlights Half','Highlights','Maya Goldstein','e3',120,480,NULL),
  ('v06','salon-look','c03', now() - interval '3 days','Toner Fix','Toner','Adele Cooper','e1',45,180,NULL),
  ('v07','salon-look','c04', now() - interval '10 days','Mens Cut','Cut','Liam Navarro','e2',30,80,NULL),
  ('v08','salon-look','c05', now() - interval '5 days','Full Head Color','Color','Liam Navarro','e2',120,420,'Wants darker next time'),
  ('v09','salon-look','c05', now() - interval '33 days','Root Touch Up','Color','Adele Cooper','e1',90,320,NULL),
  ('v10','salon-look','c07', now() - interval '2 days','Highlights Half','Highlights','Maya Goldstein','e3',120,480,'VIP - offer 10% next visit'),
  ('v11','salon-look','c07', now() - interval '30 days','Full Highlights','Highlights','Maya Goldstein','e3',180,720,NULL),
  ('v12','salon-look','c09', now() - interval '1 day','Keratin Treatment','Straightening','Maya Goldstein','e3',180,850,NULL),
  ('v13','salon-look','c12', now() - interval '8 days','Keratin','Straightening','Noa Berkovich','e5',180,800,NULL),
  ('v14','salon-look','c14', now() - interval '6 days','Full Head Color','Color','Adele Cooper','e1',120,450,NULL),
  ('v15','salon-look','c14', now() - interval '34 days','Balayage','Highlights','Adele Cooper','e1',150,650,'VIP client'),
  ('v16','salon-look','c20', now() - interval '4 days','Full Head Highlights','Highlights','Maya Goldstein','e3',180,720,NULL)
ON CONFLICT (id) DO NOTHING;
