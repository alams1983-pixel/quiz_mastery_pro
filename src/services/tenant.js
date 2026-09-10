/**
 * Tenant Resolution & Context Management Service
 */


/**
 * Extracts institute slug/code from URL subdomain or query parameters.
 * Supports:
 * - Subdomain: abcacademy.myapp.com or abcacademy.localhost
 * - Query param: myapp.com/?institute=abcacademy
 */
export function getTenantFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramInstitute = urlParams.get('institute') || urlParams.get('slug') || urlParams.get('code');
  if (paramInstitute && paramInstitute.trim()) {
    return paramInstitute.trim();
  }

  const hostname = window.location.hostname;
  // Ignore standard hostnames (localhost, IP addresses, main app domains)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  ) {
    return null;
  }

  // Split subdomain (e.g., abcacademy.myapp.com -> ['abcacademy', 'myapp', 'com'])
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const sub = parts[0].toLowerCase();
    if (sub !== 'www' && sub !== 'app' && sub !== 'api') {
      return sub;
    }
  }

  // Handle localhost subdomains (e.g. abcacademy.localhost:5173 -> ['abcacademy', 'localhost'])
  if (parts.length === 2 && parts[1] === 'localhost') {
    const sub = parts[0].toLowerCase();
    if (sub !== 'www') {
      return sub;
    }
  }

  return null;
}

const tenantBrandingCache = new Map();
const BRANDING_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches public institute branding by slug/code/id (with client-side caching)
 */
export async function fetchTenantBranding(slugOrCode) {
  if (!slugOrCode) return null;
  const key = String(slugOrCode).toLowerCase().trim();

  // Check in-memory cache
  const cached = tenantBrandingCache.get(key);
  if (cached && (Date.now() - cached.timestamp < BRANDING_CACHE_TTL)) {
    return cached.data;
  }

  try {
    const response = await fetch(`/api/institutes/public-branding/${encodeURIComponent(slugOrCode)}`);
    if (!response.ok) return null;
    const data = await response.json();
    const inst = data.institute || null;
    if (inst) {
      tenantBrandingCache.set(key, { data: inst, timestamp: Date.now() });
    }
    return inst;
  } catch (err) {
    console.error('[TENANT] Failed fetching tenant branding:', err);
    return null;
  }
}

export function invalidateTenantBrandingCache(slugOrCode) {
  if (slugOrCode) {
    tenantBrandingCache.delete(String(slugOrCode).toLowerCase().trim());
  } else {
    tenantBrandingCache.clear();
  }
}

/**
 * Applies institute theme colors & CSS variables dynamically to the document
 */
export function applyTenantTheme(institute) {
  if (!institute) {
    // Reset to default
    document.documentElement.style.removeProperty('--primary-color');
    document.documentElement.style.removeProperty('--primary-hover');
    return;
  }

  if (institute.primary_color) {
    document.documentElement.style.setProperty('--primary-color', institute.primary_color);
    // Generate a slightly darker hover shade
    document.documentElement.style.setProperty('--primary-hover', institute.primary_color + 'dd');
  }

  if (institute.name) {
    document.title = `${institute.name} - Mastery Portal`;
  }
}


