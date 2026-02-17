const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const databaseUrl = process.env.NEON_DATABASE_URL;
    if (!databaseUrl) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database URL not configured' }) };
    }

    const sql = neon(databaseUrl);
    const results = [];

    // ── Migration 08: Schedule domain tables ───────────────────────────

    await sql`CREATE TABLE IF NOT EXISTS schedule_appointments (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      employee_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      service_name TEXT NOT NULL,
      service_category TEXT NOT NULL DEFAULT 'Other',
      status TEXT NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`;
    results.push('schedule_appointments');

    await sql`CREATE TABLE IF NOT EXISTS schedule_segments (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      appointment_id TEXT NOT NULL REFERENCES schedule_appointments(id) ON DELETE CASCADE,
      segment_type TEXT NOT NULL DEFAULT 'service',
      label TEXT,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      product_grams REAL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      CONSTRAINT segment_time_valid CHECK (end_time > start_time)
    )`;
    results.push('schedule_segments');

    await sql`CREATE TABLE IF NOT EXISTS schedule_split_templates (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Color',
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS schedule_split_template_steps (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      template_id TEXT NOT NULL REFERENCES schedule_split_templates(id) ON DELETE CASCADE,
      step_type TEXT NOT NULL DEFAULT 'service',
      label TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_gap BOOLEAN NOT NULL DEFAULT false
    )`;
    results.push('templates + steps tables');

    await sql`CREATE INDEX IF NOT EXISTS idx_sched_appt_employee ON schedule_appointments(employee_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sched_seg_appt ON schedule_segments(appointment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sched_seg_time ON schedule_segments(start_time, end_time)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sched_tmpl_steps ON schedule_split_template_steps(template_id, sort_order)`;

    await sql`INSERT INTO schedule_split_templates (id, name, category, description) VALUES
      ('tmpl-color-basic','Basic Color','Color','Apply -> Wait -> Wash -> Dry'),
      ('tmpl-highlights','Highlights','Highlights','Apply -> Wait -> Toner -> Wash -> Dry'),
      ('tmpl-balayage','Balayage','Highlights','Bleach -> Wait -> Color Wash -> Blow Dry'),
      ('tmpl-keratin','Keratin Treatment','Straightening','Apply -> Process -> Flat Iron -> Rinse')
    ON CONFLICT DO NOTHING`;

    await sql`INSERT INTO schedule_split_template_steps (id, template_id, step_type, label, duration_minutes, sort_order, is_gap) VALUES
      ('s01','tmpl-color-basic','apply','Apply Color',20,1,false),
      ('s02','tmpl-color-basic','wait','Processing',30,2,true),
      ('s03','tmpl-color-basic','wash','Color Wash',15,3,false),
      ('s04','tmpl-color-basic','dry','Blow Dry',20,4,false),
      ('s05','tmpl-highlights','apply','Apply Foils',40,1,false),
      ('s06','tmpl-highlights','wait','Processing',35,2,true),
      ('s07','tmpl-highlights','apply','Toner',10,3,false),
      ('s08','tmpl-highlights','wash','Wash',15,4,false),
      ('s09','tmpl-highlights','dry','Blow Dry',20,5,false),
      ('s10','tmpl-balayage','apply','Bleach',30,1,false),
      ('s11','tmpl-balayage','wait','Processing',45,2,true),
      ('s12','tmpl-balayage','wash','Color Wash',15,3,false),
      ('s13','tmpl-balayage','dry','Blow Dry',20,4,false),
      ('s14','tmpl-keratin','apply','Apply Keratin',25,1,false),
      ('s15','tmpl-keratin','wait','Process',30,2,true),
      ('s16','tmpl-keratin','service','Flat Iron',45,3,false),
      ('s17','tmpl-keratin','wash','Rinse',10,4,false)
    ON CONFLICT DO NOTHING`;
    results.push('template seed data');

    // ── Migration 09: Multi-Tenant CRM Schema ──────────────────────────

    await sql`CREATE TABLE IF NOT EXISTS salons (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      phone TEXT, email TEXT, address TEXT, city TEXT, state TEXT,
      timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
      status TEXT NOT NULL DEFAULT 'active',
      logo_url TEXT,
      source_salon_user_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_salons_status ON salons(status)`;
    results.push('salons table');

    await sql`CREATE TABLE IF NOT EXISTS crm_users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT UNIQUE,
      display_name TEXT NOT NULL,
      phone TEXT, avatar_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS salon_memberships (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      salon_id TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'stylist',
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(salon_id, user_id)
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_memberships_salon ON salon_memberships(salon_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_memberships_user ON salon_memberships(user_id)`;
    results.push('crm_users + memberships');

    await sql`CREATE TABLE IF NOT EXISTS crm_customers (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      salon_id TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT, phone TEXT, email TEXT, notes TEXT,
      tags TEXT[],
      avatar_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_customers_salon ON crm_customers(salon_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_customers_phone ON crm_customers(salon_id, phone)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crm_customers_name ON crm_customers(salon_id, first_name, last_name)`;
    results.push('crm_customers');

    await sql`CREATE TABLE IF NOT EXISTS customer_visits (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      salon_id TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES crm_customers(id) ON DELETE CASCADE,
      appointment_id TEXT,
      visit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      service_name TEXT, service_category TEXT,
      employee_name TEXT, employee_id TEXT,
      duration_minutes INTEGER,
      price NUMERIC(10,2),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_visits_customer ON customer_visits(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_visits_salon_date ON customer_visits(salon_id, visit_date)`;
    results.push('customer_visits');

    await sql`ALTER TABLE schedule_appointments ADD COLUMN IF NOT EXISTS salon_id TEXT`;
    await sql`ALTER TABLE schedule_appointments ADD COLUMN IF NOT EXISTS customer_id TEXT`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sched_appt_salon ON schedule_appointments(salon_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sched_appt_customer ON schedule_appointments(customer_id)`;
    await sql`ALTER TABLE schedule_split_templates ADD COLUMN IF NOT EXISTS salon_id TEXT`;
    results.push('tenant columns added');

    await sql`INSERT INTO salons (id, name, slug, timezone, status)
      VALUES ('salon-look', 'Salon Look', 'salon-look', 'Asia/Jerusalem', 'active')
      ON CONFLICT (id) DO NOTHING`;
    await sql`UPDATE schedule_appointments SET salon_id = 'salon-look' WHERE salon_id IS NULL`;
    await sql`UPDATE schedule_split_templates SET salon_id = 'salon-look' WHERE salon_id IS NULL`;
    results.push('salon-look + backfill');

    await sql`INSERT INTO salons (name, slug, phone, state, city, status, source_salon_user_id)
      SELECT DISTINCT ON (LOWER(TRIM(su.salon_name)))
        TRIM(su.salon_name),
        LOWER(REGEXP_REPLACE(TRIM(su.salon_name), '[^a-zA-Z0-9]+', '-', 'g')),
        su.phone_number, su.state, su.city, 'active', su.id
      FROM salon_users su
      WHERE su.salon_name IS NOT NULL AND TRIM(su.salon_name) != ''
        AND LOWER(TRIM(su.salon_name)) != 'salon look'
      ORDER BY LOWER(TRIM(su.salon_name)), su.id
      ON CONFLICT (slug) DO NOTHING`;
    results.push('salon_users imported');

    await sql`INSERT INTO crm_users (id, email, display_name, phone, status)
      VALUES ('demo-user', 'demo@salonos.ai', 'Demo Manager', '+972500000000', 'active')
      ON CONFLICT (id) DO NOTHING`;
    await sql`INSERT INTO salon_memberships (id, salon_id, user_id, role, is_default)
      VALUES ('mem-demo-look', 'salon-look', 'demo-user', 'owner', true)
      ON CONFLICT (salon_id, user_id) DO NOTHING`;
    results.push('demo user');

    // Original 20 demo customers
    await sql`INSERT INTO crm_customers (id, salon_id, first_name, last_name, phone, email, tags, status) VALUES
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
    ON CONFLICT (id) DO NOTHING`;
    results.push('20 original customers');

    // Original visits
    await sql`INSERT INTO customer_visits (id, salon_id, customer_id, visit_date, service_name, service_category, employee_name, employee_id, duration_minutes, price, notes) VALUES
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
    ON CONFLICT (id) DO NOTHING`;
    results.push('16 original visits');

    // ── Migration 10: 120 additional customers ─────────────────────────

    await sql`INSERT INTO crm_customers (id, salon_id, first_name, last_name, phone, email, tags, notes, status) VALUES
      ('c-s001','salon-look','נועה','כהן','+972521234501','noa.cohen@gmail.com','{"regular"}','לקוחה קבועה, צבע כל 5 שבועות','active'),
      ('c-s002','salon-look','יעל','לוי','+972531234502','yael.levi@gmail.com','{}',NULL,'active'),
      ('c-s003','salon-look','שירה','מזרחי','+972541234503','shira.mizrahi@gmail.com','{"vip"}','לקוחה VIP, מעדיפה תורים בבוקר','active'),
      ('c-s004','salon-look','מיכל','ברק','+972501234504','michal.barak@gmail.com','{}',NULL,'active'),
      ('c-s005','salon-look','רונית','אביב','+972581234505','ronit.aviv@walla.co.il','{"sensitive-scalp"}','רגישה לצבע, להשתמש רק באורגני','active'),
      ('c-s006','salon-look','טלי','גולן','+972521234506','tali.golan@gmail.com','{}',NULL,'active'),
      ('c-s007','salon-look','אורלי','דהן','+972531234507','orly.dahan@hotmail.com','{"regular"}',NULL,'active'),
      ('c-s008','salon-look','דנה','פרידמן','+972541234508','dana.friedman@gmail.com','{}','מגיעה עם הבת שלה','active'),
      ('c-s009','salon-look','הדס','רוזנברג','+972501234509','hadas.rosenberg@gmail.com','{"vip","regular"}','לקוחה מהיום הראשון של הסלון','active'),
      ('c-s010','salon-look','ליאת','שמיר','+972581234510','liat.shamir@gmail.com','{}',NULL,'active'),
      ('c-s011','salon-look','ענת','ביטון','+972521234511','anat.biton@yahoo.com','{}',NULL,'active'),
      ('c-s012','salon-look','רחל','אזולאי','+972531234512','rachel.azoulay@gmail.com','{"regular"}','מעדיפה את אדל','active'),
      ('c-s013','salon-look','סיגל','חדד','+972541234513','sigal.hadad@gmail.com','{}',NULL,'active'),
      ('c-s014','salon-look','מורן','אלון','+972501234514','moran.alon@gmail.com','{"vip"}','תמיד מביאה חברות','active'),
      ('c-s015','salon-look','אפרת','נחום','+972581234515','efrat.nahum@walla.co.il','{}',NULL,'active'),
      ('c-s016','salon-look','קרן','שפירא','+972521234516','keren.shapira@gmail.com','{}',NULL,'active'),
      ('c-s017','salon-look','גלית','ויס','+972531234517','galit.weiss@gmail.com','{"sensitive-scalp"}','אלרגיה לאמוניה','active'),
      ('c-s018','salon-look','אילנה','הרשקוביץ','+972541234518','ilana.hersh@gmail.com','{}',NULL,'active'),
      ('c-s019','salon-look','תמר','סגל','+972501234519','tamar.segal@gmail.com','{"regular"}',NULL,'active'),
      ('c-s020','salon-look','עדי','גרינברג','+972581234520','adi.greenberg@gmail.com','{}',NULL,'active'),
      ('c-s021','salon-look','לירון','מלכה','+972521234521','liron.malka@gmail.com','{}','מתארחת, גרה בחיפה','active'),
      ('c-s022','salon-look','נעמה','בן שלום','+972531234522','naama.benshalom@gmail.com','{"vip"}','עושה קרטין כל 4 חודשים','active'),
      ('c-s023','salon-look','רויטל','אברהם','+972541234523','revital.avraham@gmail.com','{}',NULL,'active'),
      ('c-s024','salon-look','הילה','צור','+972501234524','hila.tsur@gmail.com','{"regular"}',NULL,'active'),
      ('c-s025','salon-look','אורית','פינטו','+972581234525','orit.pinto@walla.co.il','{}',NULL,'active'),
      ('c-s026','salon-look','שלומית','סויסה','+972521234526','shlomit.swissa@gmail.com','{}','שיער מתולתל, צריך מוצרים ספציפיים','active'),
      ('c-s027','salon-look','מעיין','זילבר','+972531234527','maayan.zilber@gmail.com','{"vip"}',NULL,'active'),
      ('c-s028','salon-look','יפית','עמרני','+972541234528','yafit.amrani@gmail.com','{}',NULL,'active'),
      ('c-s029','salon-look','אסתר','מימון','+972501234529','ester.maimon@gmail.com','{"regular"}','מעדיפה תורים אחה״צ','active'),
      ('c-s030','salon-look','חן','ברוך','+972581234530','chen.baruch@gmail.com','{}',NULL,'active'),
      ('c-s031','salon-look','שרון','קליין','+972521234531','sharon.klein@gmail.com','{}',NULL,'active'),
      ('c-s032','salon-look','דפנה','רווח','+972531234532','dafna.revach@gmail.com','{"regular"}',NULL,'active'),
      ('c-s033','salon-look','ליאור','בכר','+972541234533','lior.bachar@gmail.com','{}','גבר, תספורת כל 3 שבועות','active'),
      ('c-s034','salon-look','עומר','דוד','+972501234534','omer.david@gmail.com','{}',NULL,'active'),
      ('c-s035','salon-look','איתי','גבע','+972581234535','itay.geva@gmail.com','{}','גבר, פייד + זקן','active'),
      ('c-s036','salon-look','נופר','אליהו','+972521234536','nofar.eliyahu@gmail.com','{"vip","regular"}','מגיעה כל שבועיים לפן','active'),
      ('c-s037','salon-look','אביגיל','סלע','+972531234537','avigail.sela@gmail.com','{}',NULL,'active'),
      ('c-s038','salon-look','מאיה','לביא','+972541234538','maya.lavia@gmail.com','{}',NULL,'active'),
      ('c-s039','salon-look','רינת','ירושלמי','+972501234539','rinat.yerushalmi@gmail.com','{"sensitive-scalp"}','רגישה, לבדוק לפני כל טיפול','active'),
      ('c-s040','salon-look','סתיו','ניסים','+972581234540','stav.nissim@gmail.com','{}',NULL,'active')
    ON CONFLICT (id) DO NOTHING`;
    results.push('batch 1: c-s001–c-s040');

    await sql`INSERT INTO crm_customers (id, salon_id, first_name, last_name, phone, email, tags, notes, status) VALUES
      ('c-s041','salon-look','יובל','שרביט','+972521234541','yuval.sharvit@gmail.com','{}','גבר, רק תספורת','active'),
      ('c-s042','salon-look','גיא','מור','+972531234542','guy.mor@gmail.com','{}',NULL,'active'),
      ('c-s043','salon-look','טל','חיים','+972541234543','tal.haim@gmail.com','{"regular"}',NULL,'active'),
      ('c-s044','salon-look','עינב','אורן','+972501234544','einav.oren@gmail.com','{}',NULL,'active'),
      ('c-s045','salon-look','שני','פלד','+972581234545','shani.peled@gmail.com','{"vip"}','כלה בקרוב, חבילת כלות','active'),
      ('c-s046','salon-look','לימור','יוסף','+972521234546','limor.yosef@gmail.com','{}',NULL,'active'),
      ('c-s047','salon-look','סופיה','קפלן','+972531234547','sofia.kaplan@gmail.com','{}','עלתה חדשה, מדברת רוסית','active'),
      ('c-s048','salon-look','אנה','ברקוביץ','+972541234548','anna.berkovich@gmail.com','{}',NULL,'active'),
      ('c-s049','salon-look','מריה','גולדשטיין','+972501234549','maria.goldstein@gmail.com','{"regular"}',NULL,'active'),
      ('c-s050','salon-look','ויקטוריה','פישמן','+972581234550','victoria.fishman@gmail.com','{}',NULL,'active'),
      ('c-s051','salon-look','נטלי','שטרן','+972521234551','natali.stern@gmail.com','{"vip"}','לקוחה ותיקה, מביאה הפניות','active'),
      ('c-s052','salon-look','גל','כץ','+972531234552','gal.katz@gmail.com','{}',NULL,'active'),
      ('c-s053','salon-look','רומי','עזרא','+972541234553','romi.ezra@gmail.com','{}',NULL,'active'),
      ('c-s054','salon-look','מיטל','בן חיים','+972501234554','meital.benhaim@gmail.com','{"regular"}','תמיד מביאה עוגה','active'),
      ('c-s055','salon-look','ליהיא','תורג׳מן','+972581234555','lihia.tourjman@gmail.com','{}',NULL,'active'),
      ('c-s056','salon-look','הדר','אוחיון','+972521234556','hadar.ohana@walla.co.il','{}',NULL,'active'),
      ('c-s057','salon-look','נגה','רייס','+972531234557','noga.reiss@gmail.com','{"sensitive-scalp"}','משתמשת רק במוצרי קרסטס','active'),
      ('c-s058','salon-look','יסמין','חלבי','+972541234558','yasmin.halabi@gmail.com','{}',NULL,'active'),
      ('c-s059','salon-look','רננה','פוגל','+972501234559','renana.fogel@gmail.com','{}',NULL,'active'),
      ('c-s060','salon-look','שושנה','טל','+972581234560','shoshana.tal@gmail.com','{"regular"}','מעל 60, שיער דק','active'),
      ('c-s061','salon-look','בת אל','נתן','+972521234561','batel.natan@gmail.com','{}',NULL,'active'),
      ('c-s062','salon-look','אלה','מנדל','+972531234562','ella.mandel@gmail.com','{}',NULL,'active'),
      ('c-s063','salon-look','ירדן','שגב','+972541234563','yarden.segev@gmail.com','{"regular"}',NULL,'active'),
      ('c-s064','salon-look','עמית','רם','+972501234564','amit.ram@gmail.com','{}','גבר, עושה צבע','active'),
      ('c-s065','salon-look','דור','חזן','+972581234565','dor.hazan@gmail.com','{}',NULL,'active'),
      ('c-s066','salon-look','בר','שלום','+972521234566','bar.shalom@gmail.com','{"vip"}','יש הנחת לקוח VIP 15%','active'),
      ('c-s067','salon-look','נוי','זכריה','+972531234567','noy.zecharia@gmail.com','{}',NULL,'active'),
      ('c-s068','salon-look','עדן','ממן','+972541234568','eden.maman@gmail.com','{}',NULL,'active'),
      ('c-s069','salon-look','שקד','חורי','+972501234569','shaked.khouri@gmail.com','{}','שיער ארוך מאוד, טיפול אורך זמן','active'),
      ('c-s070','salon-look','צליל','שטיינברג','+972581234570','tslil.steinberg@gmail.com','{"regular"}',NULL,'active'),
      ('c-s071','salon-look','אריאל','סבג','+972521234571','ariel.sabag@gmail.com','{}',NULL,'active'),
      ('c-s072','salon-look','נריה','אדרי','+972531234572','neria.adari@gmail.com','{}','עושה החלקה יפנית','active'),
      ('c-s073','salon-look','אופיר','תבור','+972541234573','ofir.tavor@gmail.com','{}',NULL,'active'),
      ('c-s074','salon-look','עלמה','רגב','+972501234574','alma.regev@gmail.com','{"vip"}','מנהלת, דורשת שקט','active'),
      ('c-s075','salon-look','תהל','יעקובי','+972581234575','tehel.yakobi@gmail.com','{}',NULL,'active'),
      ('c-s076','salon-look','אגם','בלום','+972521234576','agam.bloom@gmail.com','{}',NULL,'active'),
      ('c-s077','salon-look','מילה','שוורץ','+972531234577','mila.schwartz@gmail.com','{"regular"}','מעדיפה תור באמצע השבוע','active'),
      ('c-s078','salon-look','רעות','זהבי','+972541234578','reut.zahavi@gmail.com','{}',NULL,'active'),
      ('c-s079','salon-look','יהל','אסרף','+972501234579','yahel.assaraf@gmail.com','{}',NULL,'active'),
      ('c-s080','salon-look','נעם','חביב','+972581234580','noam.haviv@gmail.com','{}','גבר, סגנון פומפדור','active')
    ON CONFLICT (id) DO NOTHING`;
    results.push('batch 2: c-s041–c-s080');

    await sql`INSERT INTO crm_customers (id, salon_id, first_name, last_name, phone, email, tags, notes, status) VALUES
      ('c-s081','salon-look','אלון','סער','+972521234581','alon.saar@gmail.com','{}',NULL,'active'),
      ('c-s082','salon-look','תומר','ליברמן','+972531234582','tomer.lieberman@gmail.com','{}','גבר, כל 4 שבועות','active'),
      ('c-s083','salon-look','ניצן','אדלר','+972541234583','nitzan.adler@gmail.com','{"sensitive-scalp"}','להימנע מפרבנים','active'),
      ('c-s084','salon-look','שגיא','אלפסי','+972501234584','sagi.alfasi@gmail.com','{}',NULL,'active'),
      ('c-s085','salon-look','מתן','אופנהיימר','+972581234585','matan.oppenheimer@gmail.com','{}',NULL,'active'),
      ('c-s086','salon-look','פיי','דגן','+972521234586','pei.dagan@gmail.com','{"regular"}',NULL,'active'),
      ('c-s087','salon-look','אלין','סרוסי','+972531234587','elin.saroussi@gmail.com','{}',NULL,'active'),
      ('c-s088','salon-look','אמילי','פרנקל','+972541234588','emily.frenkel@gmail.com','{}','בת 16, מגיעה עם אמא','active'),
      ('c-s089','salon-look','לנה','רותם','+972501234589','lena.rotem@gmail.com','{"vip"}','כוכבת רשת, דיסקרטיות','active'),
      ('c-s090','salon-look','שלי','ארד','+972581234590','sheli.arad@gmail.com','{}',NULL,'active'),
      ('c-s091','salon-look','אופל','ניר','+972521234591','opal.nir@gmail.com','{}',NULL,'active'),
      ('c-s092','salon-look','מור','אטיאס','+972531234592','mor.atias@gmail.com','{"regular"}','מגיעה תמיד ביום ג׳','active'),
      ('c-s093','salon-look','שיר','אבוטבול','+972541234593','shir.aboutboul@gmail.com','{}',NULL,'active'),
      ('c-s094','salon-look','דניאל','ונטורה','+972501234594','daniel.ventura@gmail.com','{}','גבר, שיער מתולתל','active'),
      ('c-s095','salon-look','ניסים','גבאי','+972581234595','nissim.gabay@gmail.com','{}',NULL,'active'),
      ('c-s096','salon-look','סהר','עוז','+972521234596','sahar.oz@gmail.com','{"vip"}','יולדת חדשה, שיער נושר','active'),
      ('c-s097','salon-look','ורד','זוהר','+972531234597','vered.zohar@gmail.com','{}',NULL,'active'),
      ('c-s098','salon-look','מיכאל','אנגל','+972541234598','michael.angel@gmail.com','{}','גבר, צובע שיער שיבה','active'),
      ('c-s099','salon-look','יונתן','רז','+972501234599','yonatan.raz@gmail.com','{}',NULL,'active'),
      ('c-s100','salon-look','עדה','חפץ','+972581234600','ada.hefetz@gmail.com','{"regular"}','לקוחה ותיקה 10+ שנים','active'),
      ('c-s101','salon-look','קורין','אשכנזי','+972521234601','corin.ashkenazi@gmail.com','{}',NULL,'active'),
      ('c-s102','salon-look','שלום','ביטון','+972531234602','shalom.biton@gmail.com','{}','גבר, זקן ארוך','active'),
      ('c-s103','salon-look','אביה','טובול','+972541234603','aviya.tobol@gmail.com','{"vip"}',NULL,'active'),
      ('c-s104','salon-look','רעיה','אילת','+972501234604','raya.eilat@gmail.com','{}','מורה, מגיעה בחופשות','active'),
      ('c-s105','salon-look','אריאלה','פניני','+972581234605','ariela.pnini@gmail.com','{}',NULL,'active'),
      ('c-s106','salon-look','ליזה','ברגמן','+972521234606','liza.bergman@gmail.com','{"regular"}',NULL,'active'),
      ('c-s107','salon-look','רויטל','ג׳רבי','+972531234607','revital.djerbi@gmail.com','{}','שיער צבוע שחור עמוק','active'),
      ('c-s108','salon-look','מירב','ולנסי','+972541234608','meirav.valensi@gmail.com','{}',NULL,'active'),
      ('c-s109','salon-look','הגר','אריאלי','+972501234609','hagar.arieli@gmail.com','{"sensitive-scalp"}','עור ראש רגיש, בדיקת אלרגיה','active'),
      ('c-s110','salon-look','פנינה','צדיק','+972581234610','pnina.tzadik@gmail.com','{}',NULL,'active'),
      ('c-s111','salon-look','נור','חמדי','+972521234611','nour.hamdi@gmail.com','{"regular"}',NULL,'active'),
      ('c-s112','salon-look','סנדרה','ממן','+972531234612','sandra.maman@gmail.com','{}',NULL,'active'),
      ('c-s113','salon-look','אניטה','שרף','+972541234613','anita.sharaf@gmail.com','{"vip"}','מבקשת תמיד קפה','active'),
      ('c-s114','salon-look','ג׳ניה','אוסטרובסקי','+972501234614','jenia.ostrovsky@gmail.com','{}','מדברת רוסית ואנגלית','active'),
      ('c-s115','salon-look','קטיה','וולקוב','+972581234615','katia.volkov@gmail.com','{}',NULL,'active'),
      ('c-s116','salon-look','יוליה','פטרוב','+972521234616','yulia.petrov@gmail.com','{"regular"}','מגיעה עם התינוק','active'),
      ('c-s117','salon-look','אלינור','חייט','+972531234617','elinor.hayat@gmail.com','{}',NULL,'active'),
      ('c-s118','salon-look','אביבית','שוהם','+972541234618','avivit.shoham@gmail.com','{}','מעדיפה שישי בבוקר','active'),
      ('c-s119','salon-look','עליזה','פרץ','+972501234619','aliza.peretz@gmail.com','{"regular"}',NULL,'active'),
      ('c-s120','salon-look','לוסי','חדאד','+972581234620','lucy.haddad@gmail.com','{}',NULL,'active')
    ON CONFLICT (id) DO NOTHING`;
    results.push('batch 3: c-s081–c-s120');

    // Visits for new customers (split into 2 batches)
    await sql`INSERT INTO customer_visits (id, salon_id, customer_id, visit_date, service_name, service_category, employee_name, employee_id, duration_minutes, price, notes) VALUES
      ('vs001','salon-look','c-s001', now() - interval '3 days','Root Color','Color','Adele Cooper','e1',90,350,'צבע שורש רגיל'),
      ('vs002','salon-look','c-s001', now() - interval '38 days','Full Color + Cut','Color','Adele Cooper','e1',120,520,NULL),
      ('vs003','salon-look','c-s003', now() - interval '5 days','Balayage','Highlights','Maya Goldstein','e3',150,680,'VIP treatment'),
      ('vs004','salon-look','c-s003', now() - interval '60 days','Balayage Touch Up','Highlights','Maya Goldstein','e3',120,520,NULL),
      ('vs005','salon-look','c-s005', now() - interval '10 days','Organic Color','Color','Adele Cooper','e1',100,420,'מוצרים אורגניים בלבד'),
      ('vs006','salon-look','c-s009', now() - interval '7 days','Keratin Treatment','Straightening','Noa Berkovich','e5',180,850,NULL),
      ('vs007','salon-look','c-s009', now() - interval '120 days','Keratin Treatment','Straightening','Noa Berkovich','e5',180,850,'חידוש קרטין'),
      ('vs008','salon-look','c-s014', now() - interval '2 days','Full Highlights','Highlights','Maya Goldstein','e3',180,720,'הביאה 2 חברות'),
      ('vs009','salon-look','c-s022', now() - interval '14 days','Keratin','Straightening','Noa Berkovich','e5',180,800,NULL),
      ('vs010','salon-look','c-s027', now() - interval '1 day','Root Color + Toner','Color','Adele Cooper','e1',110,480,'VIP'),
      ('vs011','salon-look','c-s033', now() - interval '21 days','Mens Cut','Cut','Liam Navarro','e2',30,80,NULL),
      ('vs012','salon-look','c-s035', now() - interval '18 days','Mens Fade + Beard','Cut','Liam Navarro','e2',45,120,NULL),
      ('vs013','salon-look','c-s036', now() - interval '4 days','Blowout','Styling','Adele Cooper','e1',45,150,'כל שבועיים'),
      ('vs014','salon-look','c-s036', now() - interval '18 days','Blowout','Styling','Adele Cooper','e1',45,150,NULL),
      ('vs015','salon-look','c-s039', now() - interval '30 days','Patch Test + Color','Color','Adele Cooper','e1',120,380,'בדיקת רגישות עברה בהצלחה'),
      ('vs016','salon-look','c-s045', now() - interval '8 days','Bridal Package Trial','Styling','Maya Goldstein','e3',120,600,'ניסיון לחתונה'),
      ('vs017','salon-look','c-s051', now() - interval '6 days','Full Head Color','Color','Adele Cooper','e1',120,450,'לקוחה ותיקה'),
      ('vs018','salon-look','c-s051', now() - interval '42 days','Root Touch Up','Color','Adele Cooper','e1',90,320,NULL),
      ('vs019','salon-look','c-s054', now() - interval '15 days','Balayage','Highlights','Maya Goldstein','e3',150,650,NULL),
      ('vs020','salon-look','c-s057', now() - interval '9 days','Kerastase Treatment','Treatment','Noa Berkovich','e5',60,280,'מוצרי קרסטס בלבד')
    ON CONFLICT (id) DO NOTHING`;

    await sql`INSERT INTO customer_visits (id, salon_id, customer_id, visit_date, service_name, service_category, employee_name, employee_id, duration_minutes, price, notes) VALUES
      ('vs021','salon-look','c-s060', now() - interval '12 days','Gentle Color','Color','Adele Cooper','e1',90,300,'שיער דק, צבע עדין'),
      ('vs022','salon-look','c-s064', now() - interval '20 days','Mens Color','Color','Liam Navarro','e2',60,200,NULL),
      ('vs023','salon-look','c-s066', now() - interval '3 days','Full Highlights','Highlights','Maya Goldstein','e3',180,720,'VIP 15% discount applied'),
      ('vs024','salon-look','c-s072', now() - interval '45 days','Japanese Straightening','Straightening','Noa Berkovich','e5',240,1200,'החלקה יפנית מלאה'),
      ('vs025','salon-look','c-s074', now() - interval '11 days','Root Color + Blowout','Color','Adele Cooper','e1',100,400,NULL),
      ('vs026','salon-look','c-s077', now() - interval '5 days','Cut + Color','Color','Adele Cooper','e1',120,480,'יום ג׳ כרגיל'),
      ('vs027','salon-look','c-s080', now() - interval '25 days','Mens Pompadour Style','Cut','Liam Navarro','e2',40,100,NULL),
      ('vs028','salon-look','c-s089', now() - interval '2 days','Private Session Color','Color','Adele Cooper','e1',150,800,'דיסקרטיות מלאה'),
      ('vs029','salon-look','c-s092', now() - interval '7 days','Balayage','Highlights','Maya Goldstein','e3',150,650,'כל יום ג׳'),
      ('vs030','salon-look','c-s096', now() - interval '16 days','Scalp Treatment','Treatment','Noa Berkovich','e5',45,200,'טיפול בנשירה לאחר לידה'),
      ('vs031','salon-look','c-s098', now() - interval '22 days','Grey Blending','Color','Liam Navarro','e2',60,220,NULL),
      ('vs032','salon-look','c-s100', now() - interval '4 days','Root Color','Color','Adele Cooper','e1',90,350,'לקוחה 10+ שנים'),
      ('vs033','salon-look','c-s100', now() - interval '40 days','Root Color','Color','Adele Cooper','e1',90,350,NULL),
      ('vs034','salon-look','c-s103', now() - interval '13 days','Full Highlights + Toner','Highlights','Maya Goldstein','e3',180,750,NULL),
      ('vs035','salon-look','c-s109', now() - interval '28 days','Allergy Test','Treatment','Adele Cooper','e1',30,0,'בדיקת אלרגיה - עבר'),
      ('vs036','salon-look','c-s109', now() - interval '25 days','Gentle Organic Color','Color','Adele Cooper','e1',100,420,'לאחר בדיקת אלרגיה'),
      ('vs037','salon-look','c-s113', now() - interval '6 days','Balayage + Toner','Highlights','Maya Goldstein','e3',180,720,'VIP, הגישו קפה'),
      ('vs038','salon-look','c-s116', now() - interval '19 days','Quick Root Touch Up','Color','Adele Cooper','e1',60,280,NULL),
      ('vs039','salon-look','c-s119', now() - interval '8 days','Full Color','Color','Adele Cooper','e1',120,420,NULL),
      ('vs040','salon-look','c-s120', now() - interval '35 days','Cut + Blowout','Cut','Maya Goldstein','e3',60,200,NULL)
    ON CONFLICT (id) DO NOTHING`;
    results.push('40 new visits');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'All migrations (08+09+10) completed',
        steps: results
      })
    };

  } catch (error) {
    console.error('Migration failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Migration failed', details: error.message })
    };
  }
};
