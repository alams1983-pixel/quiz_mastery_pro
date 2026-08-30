/**
 * ConsentManager.js
 * Centralized service for managing GDPR and ePrivacy consent state.
 * Categorizes storage into:
 *  - essential: Always true (auth tokens, CSRF tokens, core session state)
 *  - functional: UI preferences (theme mode, font scale, sidebar state)
 *  - analytics: User behavior metrics and performance tracking
 *  - marketing: External tracking / promotional pixels
 */

const STORAGE_KEY = 'edutor_gdpr_consent';
const CONSENT_VERSION = 'v1.0';

const DEFAULT_PREFERENCES = {
  version: CONSENT_VERSION,
  timestamp: null,
  decided: false,
  essential: true, // Always true & immutable
  functional: false,
  analytics: false,
  marketing: false
};

class ConsentManagerService {
  constructor() {
    this.preferences = this._loadConsent();
  }

  /**
   * Internal helper to load consent from localStorage safely
   */
  _loadConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === CONSENT_VERSION) {
          return {
            ...DEFAULT_PREFERENCES,
            ...parsed,
            essential: true // Enforce essential is always true
          };
        }
      }
    } catch (e) {
      console.warn('[ConsentManager] Failed to read stored consent preferences:', e);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Check if a consent decision has been recorded
   * @returns {boolean}
   */
  hasDecided() {
    return !!this.preferences.decided;
  }

  /**
   * Check if consent is granted for a specific category
   * @param {'essential' | 'functional' | 'analytics' | 'marketing'} category 
   * @returns {boolean}
   */
  hasConsent(category) {
    if (category === 'essential') return true;
    return !!this.preferences[category];
  }

  /**
   * Retrieve all current consent preferences
   */
  getPreferences() {
    return { ...this.preferences };
  }

  /**
   * Save updated consent preferences
   * @param {Object} prefs - { functional?: boolean, analytics?: boolean, marketing?: boolean }
   */
  saveConsent(prefs = {}) {
    const updated = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      decided: true,
      essential: true, // Immutable
      functional: !!prefs.functional,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing
    };

    this.preferences = updated;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[ConsentManager] Failed to persist consent choices:', e);
    }

    // Broadcast change event across application
    window.dispatchEvent(new CustomEvent('gdprConsentChanged', { detail: updated }));

    return updated;
  }

  /**
   * Quick action: Accept all cookies & storage categories
   */
  acceptAll() {
    return this.saveConsent({
      functional: true,
      analytics: true,
      marketing: true
    });
  }

  /**
   * Quick action: Reject non-essential cookies & storage categories
   */
  rejectAll() {
    return this.saveConsent({
      functional: false,
      analytics: false,
      marketing: false
    });
  }

  /**
   * Reset stored consent decision to allow testing or forced re-prompting
   */
  resetConsent() {
    this.preferences = { ...DEFAULT_PREFERENCES };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('[ConsentManager] Failed to reset consent choice:', e);
    }
    window.dispatchEvent(new CustomEvent('gdprConsentChanged', { detail: this.preferences }));
  }
}

export const ConsentManager = new ConsentManagerService();
