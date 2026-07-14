const {
  resolveSalonContext,
  SalonAuthError,
  PermissionError,
  requireContextPermission,
  enforceSessionStatus,
} = require('./_salon-context');
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

    try {
      await enforceSessionStatus(client, salonCtx);
      requireContextPermission(
        salonCtx,
        'settings',
        event.httpMethod === 'PATCH' ? 'update' : 'view',
        'salon',
      );
    } catch (err) {
      if (err instanceof SalonAuthError || err instanceof PermissionError) {
        return res(err.statusCode, { code: err.code || 'UNAUTHORIZED', message: err.message }, true);
      }
      throw err;
    }

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
      // The settings API is the only writer for these salon-level values. Keep
      // an actor-attributed record without trusting any actor/tenant identifier
      // from the browser.
      await client.query(
        `INSERT INTO salon_audit_events
           (salon_id, actor_user_id, action, entity_type, entity_id, after_state, metadata)
         VALUES ($1, $2, 'settings_update', 'salon', $1, $3::jsonb, $4::jsonb)`,
        [
          salonId,
          salonCtx.userId,
          JSON.stringify(rowToSalon(result.rows[0])),
          JSON.stringify({ updatedFields: update.fields.map((field) => field.column) }),
        ],
      );
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

const SUPPORTED_FIELDS = new Set([
  'name', 'businessName', 'address', 'city', 'phone', 'timezone', 'currency',
  'description', 'logoUrl', 'whatsappPhone', 'email', 'website', 'instagramUrl',
  'facebookUrl', 'primaryContactName', 'countryCode', 'region', 'street',
  'streetNumber', 'floor', 'unit', 'postalCode', 'addressNotes', 'latitude',
  'longitude', 'locale', 'defaultLanguage', 'dateFormat', 'timeFormat',
  'weekStartsOn', 'businessRegistrationNumber', 'taxId', 'businessType',
  'isTaxRegistered', 'defaultTaxRate', 'pricesIncludeTax', 'invoicePrefix',
  'receiptPrefix', 'onboardingStatus', 'onboardingCurrentStep',
]);
const CURRENCIES = new Set(['ILS', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']);
const COUNTRIES = new Set(['IL', 'US', 'GB', 'FR', 'DE', 'CA', 'AU']);
const TIMEZONES = new Set([
  'Asia/Jerusalem', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'America/Toronto',
  'Australia/Sydney',
]);
const LOCALES = new Set(['he-IL', 'en-US', 'en-GB', 'fr-FR', 'de-DE', 'en-CA', 'en-AU']);

function enumValue(value, allowed) {
  if (value === undefined) return undefined;
  return allowed.has(value) ? value : null;
}

function validUrlOrNull(value) {
  const normalized = nullableText(value);
  if (normalized === undefined || normalized === null) return normalized;
  try {
    const url = new URL(normalized);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function validNumberOrNull(value, min, max) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function normalizeSalonPatch(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: { code: 'INVALID_BODY', message: 'Settings payload must be an object.' } };
  }
  const unsupported = Object.keys(body).filter((field) => !SUPPORTED_FIELDS.has(field));
  if (unsupported.length > 0) {
    return { error: { code: 'UNSUPPORTED_FIELD', message: `Unsupported salon settings: ${unsupported.join(', ')}` } };
  }
  const fields = [];
  const add = (column, value) => {
    if (value !== undefined) fields.push({ column, value });
  };
  const name = requiredText(body.name);
  if (name === null) return { error: { code: 'INVALID_NAME', message: 'Salon name is required.' } };
  if (name && name.length > 120) return { error: { code: 'INVALID_NAME', message: 'Salon name is too long.' } };
  add('name', name);
  add('business_name', nullableText(body.businessName));
  add('address', nullableText(body.address));
  add('city', nullableText(body.city));
  add('phone', nullableText(body.phone));
  const email = nullableText(body.email);
  if (email !== undefined && email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: { code: 'INVALID_EMAIL', message: 'Email must be valid.' } };
  }
  add('email', email);
  const timezone = enumValue(body.timezone, TIMEZONES);
  if (timezone === null) return { error: { code: 'INVALID_TIMEZONE', message: 'Timezone is not supported.' } };
  add('timezone', timezone);
  const currency = enumValue(body.currency, CURRENCIES);
  if (currency === null) return { error: { code: 'INVALID_CURRENCY', message: 'Currency is not supported.' } };
  add('currency', currency);
  const countryCode = enumValue(body.countryCode, COUNTRIES);
  if (countryCode === null) return { error: { code: 'INVALID_COUNTRY', message: 'Country is not supported.' } };
  add('country_code', countryCode);
  const locale = enumValue(body.locale, LOCALES);
  if (locale === null) return { error: { code: 'INVALID_LOCALE', message: 'Locale is not supported.' } };
  add('locale', locale);
  const defaultLanguage = enumValue(body.defaultLanguage, new Set(['he', 'en', 'fr', 'de']));
  if (defaultLanguage === null) return { error: { code: 'INVALID_LANGUAGE', message: 'Language is not supported.' } };
  add('default_language', defaultLanguage);
  const dateFormat = enumValue(body.dateFormat, new Set(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']));
  if (dateFormat === null) return { error: { code: 'INVALID_DATE_FORMAT', message: 'Date format is not supported.' } };
  add('date_format', dateFormat);
  const timeFormat = enumValue(body.timeFormat, new Set(['12h', '24h']));
  if (timeFormat === null) return { error: { code: 'INVALID_TIME_FORMAT', message: 'Time format must be 12h or 24h.' } };
  add('time_format', timeFormat);
  const weekStartsOn = validNumberOrNull(body.weekStartsOn, 0, 6);
  if (weekStartsOn === null && body.weekStartsOn !== null && body.weekStartsOn !== undefined) {
    return { error: { code: 'INVALID_WEEK_START', message: 'Week start must be between 0 and 6.' } };
  }
  add('week_starts_on', weekStartsOn);
  const latitude = validNumberOrNull(body.latitude, -90, 90);
  if (latitude === null && body.latitude !== null && body.latitude !== undefined) {
    return { error: { code: 'INVALID_LATITUDE', message: 'Latitude must be between -90 and 90.' } };
  }
  add('latitude', latitude);
  const longitude = validNumberOrNull(body.longitude, -180, 180);
  if (longitude === null && body.longitude !== null && body.longitude !== undefined) {
    return { error: { code: 'INVALID_LONGITUDE', message: 'Longitude must be between -180 and 180.' } };
  }
  add('longitude', longitude);
  const taxRate = validNumberOrNull(body.defaultTaxRate, 0, 100);
  if (taxRate === null && body.defaultTaxRate !== null && body.defaultTaxRate !== undefined) {
    return { error: { code: 'INVALID_TAX_RATE', message: 'Tax rate must be between 0 and 100.' } };
  }
  add('default_tax_rate', taxRate);
  const businessType = enumValue(body.businessType, new Set(['sole_proprietor', 'licensed_business', 'limited_company', 'partnership', 'other']));
  if (businessType === null && body.businessType !== null && body.businessType !== undefined) {
    return { error: { code: 'INVALID_BUSINESS_TYPE', message: 'Business type is not supported.' } };
  }
  add('business_type', businessType);
  const urlFields = [
    ['logo_url', 'logoUrl'], ['website', 'website'], ['instagram_url', 'instagramUrl'], ['facebook_url', 'facebookUrl'],
  ];
  for (const [column, field] of urlFields) {
    const value = validUrlOrNull(body[field]);
    if (value === null && body[field] !== null && body[field] !== undefined) {
      return { error: { code: 'INVALID_URL', message: `${field} must be a valid HTTPS or HTTP URL.` } };
    }
    add(column, value);
  }
  add('description', nullableText(body.description));
  add('whatsapp_phone', nullableText(body.whatsappPhone));
  add('primary_contact_name', nullableText(body.primaryContactName));
  add('region', nullableText(body.region));
  add('street', nullableText(body.street));
  add('street_number', nullableText(body.streetNumber));
  add('floor', nullableText(body.floor));
  add('unit', nullableText(body.unit));
  add('postal_code', nullableText(body.postalCode));
  add('address_notes', nullableText(body.addressNotes));
  add('business_registration_number', nullableText(body.businessRegistrationNumber));
  add('tax_id', nullableText(body.taxId));
  add('is_tax_registered', typeof body.isTaxRegistered === 'boolean' ? body.isTaxRegistered : undefined);
  add('prices_include_tax', typeof body.pricesIncludeTax === 'boolean' ? body.pricesIncludeTax : undefined);
  add('invoice_prefix', nullableText(body.invoicePrefix));
  add('receipt_prefix', nullableText(body.receiptPrefix));
  const onboardingStatus = enumValue(body.onboardingStatus, new Set(['incomplete', 'completed']));
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
    description: row.description || null,
    logoUrl: row.logo_url || null,
    whatsappPhone: row.whatsapp_phone || null,
    website: row.website || null,
    instagramUrl: row.instagram_url || null,
    facebookUrl: row.facebook_url || null,
    primaryContactName: row.primary_contact_name || null,
    countryCode: row.country_code || 'IL',
    region: row.region || null,
    street: row.street || null,
    streetNumber: row.street_number || null,
    floor: row.floor || null,
    unit: row.unit || null,
    postalCode: row.postal_code || null,
    addressNotes: row.address_notes || null,
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
    locale: row.locale || 'he-IL',
    defaultLanguage: row.default_language || 'he',
    dateFormat: row.date_format || 'DD/MM/YYYY',
    timeFormat: row.time_format || '24h',
    weekStartsOn: row.week_starts_on ?? 0,
    businessRegistrationNumber: row.business_registration_number || null,
    taxId: row.tax_id || null,
    businessType: row.business_type || null,
    isTaxRegistered: Boolean(row.is_tax_registered),
    defaultTaxRate: row.default_tax_rate === null || row.default_tax_rate === undefined ? null : String(row.default_tax_rate),
    pricesIncludeTax: row.prices_include_tax ?? true,
    invoicePrefix: row.invoice_prefix || null,
    receiptPrefix: row.receipt_prefix || null,
    status: row.status || 'active',
    onboardingStatus: row.onboarding_status || 'completed',
    onboardingCurrentStep: row.onboarding_current_step || null,
    onboardingCompletedAt: row.onboarding_completed_at || null,
    onboardingUpdatedAt: row.onboarding_updated_at || null,
  };
}
