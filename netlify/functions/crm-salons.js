const { resolveSalonContext, SalonAuthError } = require('./_salon-context');
const { createClient, hasDatabaseUrl } = require('./_db');

function res(statusCode, data, isError = false) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    },
    body: JSON.stringify(isError ? { error: data } : data),
  };
}

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return res(200, '');
  if (!['GET', 'PATCH'].includes(event.httpMethod)) return res(405, 'Method not allowed', true);

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) return res(err.statusCode, err.message, true);
    return res(401, 'Unauthorized', true);
  }
  const salonId = salonCtx.salonId;

  if (!hasDatabaseUrl()) {
    return res(503, 'Database not configured. Contact administrator.', true);
  }

  let client;
  try {
    client = await getClient();

    if (event.httpMethod === 'PATCH') {
      let body = {};
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return res(400, 'Invalid JSON body', true);
      }
      const forbiddenTenantFields = ['id', 'salonId', 'salon_id'];
      if (forbiddenTenantFields.some((field) => Object.prototype.hasOwnProperty.call(body, field))) {
        return res(400, { code: 'TENANT_FIELD_FORBIDDEN', message: 'Salon identity is derived from the session.' }, true);
      }
      const update = normalizeSalonPatch(body);
      if (update.error) return res(400, update.error, true);
      if (update.fields.length === 0) {
        return res(400, { code: 'EMPTY_PATCH', message: 'No supported salon fields were provided.' }, true);
      }
      const assignments = update.fields.map((field, index) => `${field.column} = $${index + 2}`);
      const values = [salonId, ...update.fields.map((field) => field.value)];
      const result = await client.query(
        `UPDATE salons
         SET ${assignments.join(', ')}, updated_at = now(), onboarding_updated_at = now()
         WHERE id = $1 AND status = 'active'
         RETURNING *`,
        values,
      );
      if (result.rows.length === 0) return res(404, 'Salon not found', true);
      return res(200, { salon: rowToSalon(result.rows[0]) });
    }

    const result = await client.query(
      `SELECT *
       FROM salons
       WHERE id = $1 AND status = 'active'
       LIMIT 1`,
      [salonId]
    );
    if (result.rows.length === 0) return res(404, 'Salon not found', true);
    return res(200, { salon: rowToSalon(result.rows[0]) });
  } catch (err) {
    console.error('CRM Salons function error:', err);
    return res(500, err.message || 'Internal server error', true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};

function nullableText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredText(value) {
  if (value === undefined) return undefined;
  const trimmed = String(value || '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCurrency(value) {
  if (value === undefined) return undefined;
  return ['ILS', 'USD', 'EUR'].includes(value) ? value : null;
}

function normalizeOnboardingStatus(value) {
  if (value === undefined) return undefined;
  return ['incomplete', 'completed'].includes(value) ? value : null;
}

function normalizeSalonPatch(body) {
  const fields = [];
  const add = (column, value) => {
    if (value !== undefined) fields.push({ column, value });
  };
  const name = requiredText(body.name);
  if (name === null) return { error: { code: 'INVALID_NAME', message: 'Salon name is required.' } };
  add('name', name);
  add('business_name', nullableText(body.businessName));
  add('address', nullableText(body.address));
  add('city', nullableText(body.city));
  add('phone', nullableText(body.phone));
  add('timezone', requiredText(body.timezone));
  const currency = normalizeCurrency(body.currency);
  if (currency === null) return { error: { code: 'INVALID_CURRENCY', message: 'Currency must be ILS, USD, or EUR.' } };
  add('currency', currency);
  const onboardingStatus = normalizeOnboardingStatus(body.onboardingStatus);
  if (onboardingStatus === null) {
    return { error: { code: 'INVALID_ONBOARDING_STATUS', message: 'Onboarding status must be incomplete or completed.' } };
  }
  if (onboardingStatus) {
    add('onboarding_status', onboardingStatus);
    add('onboarding_completed_at', onboardingStatus === 'completed' ? new Date().toISOString() : null);
  }
  add('onboarding_current_step', onboardingStatus === 'completed' ? null : nullableText(body.onboardingCurrentStep));
  return { fields };
}

function rowToSalon(row) {
  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name || null,
    slug: row.slug,
    phone: row.phone || null,
    email: row.email || null,
    address: row.address || null,
    city: row.city || null,
    state: row.state || null,
    timezone: row.timezone || 'Asia/Jerusalem',
    currency: row.currency || 'ILS',
    status: row.status || 'active',
    onboardingStatus: row.onboarding_status || 'completed',
    onboardingCurrentStep: row.onboarding_current_step || null,
    onboardingCompletedAt: row.onboarding_completed_at || null,
    onboardingUpdatedAt: row.onboarding_updated_at || null,
  };
}
