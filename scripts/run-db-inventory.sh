#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [[ ! -f .env ]]; then
  echo "❌ .env not found at $PROJECT_ROOT/.env"
  echo "Please create .env with: NEON_DATABASE_URL=postgresql://user:pass@host/db"
  exit 1
fi

# Extract ONLY NEON_DATABASE_URL from .env safely, without sourcing the entire file
NEON_DATABASE_URL=$(awk -F'=' 'BEGIN{OFS="="} $1 ~ /^\s*NEON_DATABASE_URL\s*$/ || $1 ~ /^\s*NEON_DATABASE_URL\s*/ {sub(/^\s*NEON_DATABASE_URL\s*=\s*/,"",
$0); print $0; exit}' .env)

# Trim surrounding quotes if present
NEON_DATABASE_URL="${NEON_DATABASE_URL%\r}"
NEON_DATABASE_URL="${NEON_DATABASE_URL%\n}"
if [[ "${NEON_DATABASE_URL}" == '"'*'"' ]]; then
  NEON_DATABASE_URL=${NEON_DATABASE_URL:1:${#NEON_DATABASE_URL}-2}
fi

if [[ -z "${NEON_DATABASE_URL}" ]]; then
  echo "❌ NEON_DATABASE_URL is empty or not set in .env"
  exit 1
fi

# Resolve psql
if command -v psql >/dev/null 2>&1; then
  PSQL_BIN="$(command -v psql)"
elif [[ -x "/opt/homebrew/opt/libpq/bin/psql" ]]; then
  PSQL_BIN="/opt/homebrew/opt/libpq/bin/psql"
else
  echo "❌ psql not found. Install via Homebrew: brew install libpq && brew link --force libpq"
  exit 1
fi

mkdir -p reports

echo "▶️ Running SQL pack: sql/db_inventory.sql"
"$PSQL_BIN" "$NEON_DATABASE_URL" -f sql/db_inventory.sql | tee reports/db_inventory_raw.txt

echo "▶️ Collecting summary metrics"
DATE_STR=$(date "+%Y-%m-%d %H:%M")
NUM_TABLES=$("$PSQL_BIN" -At "$NEON_DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

TOP5_RAW=$("$PSQL_BIN" -At -F $'\t' "$NEON_DATABASE_URL" -c "SELECT c.relname, pg_size_pretty(pg_total_relation_size(c.oid)) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname='public' ORDER BY pg_total_relation_size(c.oid) DESC LIMIT 5;")
TOP5_FMT=$(echo "$TOP5_RAW" | awk -F '\t' '{print $1 " (" $2 ")"}' | paste -sd ', ' -)

read HAS_LANDING HAS_CTA HAS_SIGNUP HAS_UTM HAS_GCLID HAS_FBCLID < <(
  "$PSQL_BIN" -At -F $'\t' "$NEON_DATABASE_URL" -c "
    SELECT
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='landing_path'),
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='cta_path'),
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='signup_path'),
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='utm_campaign'),
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='gclid'),
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='leads' AND column_name='fbclid');
  "
)

EXISTS_FLAGS="landing/cta/signup: ${HAS_LANDING}/${HAS_CTA}/${HAS_SIGNUP}; utm_campaign:${HAS_UTM}; gclid:${HAS_GCLID}; fbclid:${HAS_FBCLID}"

DUP_COUNT=$({ "$PSQL_BIN" -At "$NEON_DATABASE_URL" -c "SELECT COUNT(*) FROM (SELECT email FROM public.leads GROUP BY email HAVING COUNT(*)>1) t;" || echo 0; })

RECENT_COUNT=$({ "$PSQL_BIN" -At "$NEON_DATABASE_URL" -c "SELECT COUNT(*) FROM public.v_leads_recent;" || echo 0; })

SIGNUP_TABLE=$({ "$PSQL_BIN" -At -F $',' "$NEON_DATABASE_URL" -c "SELECT signup_path, COUNT(*) AS leads FROM public.v_leads_by_signup_path_30d GROUP BY signup_path ORDER BY leads DESC NULLS LAST;" | head -n 20 || true; })
CTA_TABLE=$({ "$PSQL_BIN" -At -F $',' "$NEON_DATABASE_URL" -c "SELECT cta_path, COUNT(*) AS leads FROM public.v_leads_by_cta_path_30d GROUP BY cta_path ORDER BY leads DESC NULLS LAST;" | head -n 20 || true; })

echo "▶️ Exporting CSVs (best-effort)"
"$PSQL_BIN" "$NEON_DATABASE_URL" -c "\\copy (SELECT * FROM public.v_leads_recent ORDER BY created_at DESC) TO 'reports/v_leads_recent.csv' CSV HEADER" || true
"$PSQL_BIN" "$NEON_DATABASE_URL" -c "\\copy (SELECT * FROM public.v_leads_by_signup_path_30d) TO 'reports/v_leads_by_signup_path_30d.csv' CSV HEADER" || true
"$PSQL_BIN" "$NEON_DATABASE_URL" -c "\\copy (SELECT * FROM public.v_leads_by_cta_path_30d) TO 'reports/v_leads_by_cta_path_30d.csv' CSV HEADER" || true

echo "▶️ Building Markdown report: reports/db_inventory_report.md"

# Pre-format top lists
SIGNUP_LINES=$(echo "$SIGNUP_TABLE" | awk -F',' '{printf "  - %s: %s\n", $1, $2}')
CTA_LINES=$(echo "$CTA_TABLE" | awk -F',' '{printf "  - %s: %s\n", $1, $2}')

export DATE_STR NUM_TABLES TOP5_FMT HAS_LANDING HAS_CTA HAS_SIGNUP DUP_COUNT EXISTS_FLAGS RECENT_COUNT SIGNUP_LINES CTA_LINES

cat > reports/db_inventory_report.tmpl <<'EOF'
# DB Snapshot – Neon (תאריך: ${DATE_STR})

## תקציר מנהלים
- סה״כ טבלאות: ${NUM_TABLES}
- טבלאות גדולות בולטות: ${TOP5_FMT}
- האם לשולחן leads יש שדות אטריביושן חיוניים? landing/cta/signup: ${HAS_LANDING}/${HAS_CTA}/${HAS_SIGNUP}
- דופליקציות אימייל בלידים (top): ${DUP_COUNT}

---

## [1] מלאי טבלאות (גודל ושורות מוערכות)
(ראה `reports/db_inventory_raw.txt`, קטע [1])

## [2] עמודות לכל טבלה
(ראה `reports/db_inventory_raw.txt`, קטע [2])

## [3] אילוצים (PK/FK/Unique)
(ראה `reports/db_inventory_raw.txt`, קטע [3])

## [4] מועמדים לארכוב/מחיקה (תמיכה/צ׳אט)
(ראה `reports/db_inventory_raw.txt`, קטע [4])

## [5] דופליקציות בלידים
(ראה `reports/db_inventory_raw.txt`, קטע [5] – Top 20)

## [6] קיום שדות אטריביושן בלידים
${EXISTS_FLAGS}

## [7] תצוגות לדשבורד – בדיקות מיידיות
- v_leads_recent: ${RECENT_COUNT} שורות
- v_leads_by_signup_path_30d (Top 20):
${SIGNUP_LINES}
- v_leads_by_cta_path_30d (Top 20):
${CTA_LINES}

## [8] טריגרים/פונקציות DB
(ראה `reports/db_inventory_raw.txt`, קטע [8])

---

### החלטות נדרשות (כן/לא)
1) האם לידים ייחודיים לפי **email**?  ☐ כן ☐ לא  
2) ארכוב טבלאות תמיכה לשבועיים לפני DROP?  ☐ כן ☐ לא  
3) להשאיר `signup_users` כטיוטות נפרדות או למזג ל־leads+lead_events?  ☐ טיוטות ☐ למזג
EOF

if command -v envsubst >/dev/null 2>&1; then
  envsubst < reports/db_inventory_report.tmpl > reports/db_inventory_report.md
else
  # Fallback to Node-based template rendering
  DATE_STR="$DATE_STR" \
  NUM_TABLES="$NUM_TABLES" \
  TOP5_FMT="$TOP5_FMT" \
  HAS_LANDING="$HAS_LANDING" \
  HAS_CTA="$HAS_CTA" \
  HAS_SIGNUP="$HAS_SIGNUP" \
  DUP_COUNT="$DUP_COUNT" \
  EXISTS_FLAGS="$EXISTS_FLAGS" \
  RECENT_COUNT="$RECENT_COUNT" \
  SIGNUP_LINES="$SIGNUP_LINES" \
  CTA_LINES="$CTA_LINES" \
  node -e '
    const fs = require("fs");
    const input = fs.readFileSync("reports/db_inventory_report.tmpl", "utf8");
    const out = input.replace(/\$\{(\w+)\}/g, (_, k) => process.env[k] ?? "");
    fs.writeFileSync("reports/db_inventory_report.md", out);
  '
fi
rm -f reports/db_inventory_report.tmpl

echo "✅ Done. Files generated under reports/:\n - db_inventory_raw.txt\n - db_inventory_report.md\n - v_leads_recent.csv (if any)\n - v_leads_by_signup_path_30d.csv (if any)\n - v_leads_by_cta_path_30d.csv (if any)"


