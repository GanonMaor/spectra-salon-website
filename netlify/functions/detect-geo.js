// Lightweight Geo detection for dialing code inference
// Sources:
// - Netlify header: x-nf-geo (if available)
// - Accept-Language region hint
// - External fallback: ipapi.co (best-effort, short timeout)

const COUNTRY_TO_DIAL = {
  IL: "+972",
  US: "+1",
  CA: "+1",
  GB: "+44",
  DE: "+49",
  FR: "+33",
  ES: "+34",
  IT: "+39",
  AU: "+61",
  NL: "+31",
};

const pickDial = (iso) => COUNTRY_TO_DIAL[iso] || "+1";

const parseAcceptLanguageForRegion = (al) => {
  try {
    if (!al) return null;
    // Examples: "en-US,en;q=0.9", "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7"
    const first = String(al).split(',')[0];
    const parts = first.trim().split('-');
    if (parts.length >= 2) {
      const region = parts[1].toUpperCase();
      if (/^[A-Z]{2}$/.test(region)) return region;
    }
    return null;
  } catch {
    return null;
  }
};

const fetchWithTimeout = async (url, ms = 800) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

exports.handler = async function (event) {
  try {
    let country = null;

    // 1) Netlify Geo header
    const geoHeader = event.headers && (event.headers["x-nf-geo"] || event.headers["X-Nf-Geo"]);
    if (geoHeader) {
      try {
        const geo = JSON.parse(geoHeader);
        if (geo && geo.country && /^[A-Za-z]{2}$/.test(geo.country)) {
          country = String(geo.country).toUpperCase();
        }
      } catch {
        // ignore JSON errors
      }
    }

    // 2) Accept-Language fallback
    if (!country) {
      const al = event.headers && (event.headers["accept-language"] || event.headers["Accept-Language"]);
      country = parseAcceptLanguageForRegion(al);
    }

    // 3) External fallback (best-effort)
    if (!country) {
      try {
        const res = await fetchWithTimeout("https://ipapi.co/json/");
        if (res.ok) {
          const json = await res.json();
          if (json && json.country_code) country = String(json.country_code).toUpperCase();
        }
      } catch {
        // ignore network failures
      }
    }

    country = country || "US";
    const dial_code = pickDial(country);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, dial_code }),
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "US", dial_code: "+1" }),
    };
  }
};


