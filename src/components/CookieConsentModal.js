/**
 * CookieConsentModal.js
 * Renders GDPR Cookie & Storage Banner and Preferences Modal.
 * Provides granular toggles for Essential, Functional, Analytics, and Marketing categories.
 */

import { ConsentManager } from '../services/ConsentManager.js';

let bannerElement = null;
let modalElement = null;

/**
 * Render and mount the floating consent banner if not already present
 */
export function initCookieBanner() {
  if (bannerElement) return;

  // If user already recorded consent decision, don't auto-show banner
  if (ConsentManager.hasDecided()) return;

  bannerElement = document.createElement('div');
  bannerElement.id = 'gdpr-cookie-banner';
  bannerElement.className = 'gdpr-banner-container slide-up';

  bannerElement.innerHTML = `
    <div class="gdpr-banner-content">
      <div class="gdpr-banner-header">
        <div class="gdpr-icon-badge">
          <i class="ri-shield-keyhole-line"></i>
        </div>
        <div class="gdpr-text-box">
          <h4 class="gdpr-banner-title">Cookie & Data Privacy Notice</h4>
          <p class="gdpr-banner-desc">
            We use cookies and local storage to keep you logged in, save your test preferences, and improve your quiz learning experience. You can choose which optional storage categories to allow under GDPR & ePrivacy regulations.
          </p>
        </div>
      </div>
      <div class="gdpr-banner-actions">
        <button id="gdpr-btn-reject" class="gdpr-btn gdpr-btn-secondary">
          Reject Optional
        </button>
        <button id="gdpr-btn-customize" class="gdpr-btn gdpr-btn-outline">
          <i class="ri-settings-4-line"></i> Customize
        </button>
        <button id="gdpr-btn-accept-all" class="gdpr-btn gdpr-btn-primary">
          <i class="ri-checkbox-circle-line"></i> Accept All
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(bannerElement);

  // Bind Events
  bannerElement.querySelector('#gdpr-btn-accept-all').addEventListener('click', () => {
    ConsentManager.acceptAll();
    removeBanner();
  });

  bannerElement.querySelector('#gdpr-btn-reject').addEventListener('click', () => {
    ConsentManager.rejectAll();
    removeBanner();
  });

  bannerElement.querySelector('#gdpr-btn-customize').addEventListener('click', () => {
    removeBanner();
    openCookiePreferencesModal();
  });
}

/**
 * Remove banner from DOM
 */
function removeBanner() {
  if (bannerElement && bannerElement.parentNode) {
    bannerElement.classList.add('fade-out');
    setTimeout(() => {
      if (bannerElement && bannerElement.parentNode) {
        bannerElement.parentNode.removeChild(bannerElement);
      }
      bannerElement = null;
    }, 300);
  }
}

/**
 * Open full Cookie & Data Storage Preferences Modal (Granular Control)
 */
export function openCookiePreferencesModal() {

  const prefs = ConsentManager.getPreferences();

  // Remove existing modal if open
  if (modalElement && modalElement.parentNode) {
    modalElement.parentNode.removeChild(modalElement);
  }

  modalElement = document.createElement('div');
  modalElement.className = 'modal-overlay active';
  modalElement.style.zIndex = '10005';

  modalElement.innerHTML = `
    <div class="modal-card gdpr-modal-card fade-in">
      <div class="modal-header">
        <h3 style="display: flex; align-items: center; gap: 8px;">
          <i class="ri-shield-check-line" style="color: var(--primary-color);"></i>
          Privacy & Storage Preferences
        </h3>
        <button class="modal-close-btn" id="gdpr-modal-close">&times;</button>
      </div>

      <div class="modal-body gdpr-modal-body">
        <p class="gdpr-modal-intro">
          Under GDPR and regional privacy laws, you have full control over the local storage and cookie categories enabled for your user account. Essential data is required for security and core app functionality.
        </p>

        <div class="gdpr-categories-list">
          <!-- Essential Category -->
          <div class="gdpr-cat-card">
            <div class="gdpr-cat-header">
              <div class="gdpr-cat-info">
                <span class="gdpr-cat-title">
                  Strictly Necessary (Essential)
                  <span class="gdpr-badge gdpr-badge-required">Always Active</span>
                </span>
                <span class="gdpr-cat-desc">
                  Authentication JWT tokens, security headers, and essential login credentials required for quiz attempts and account access. Cannot be turned off.
                </span>
              </div>
              <div class="gdpr-toggle-wrapper">
                <input type="checkbox" id="gdpr-toggle-essential" class="gdpr-toggle-checkbox" checked disabled />
                <label for="gdpr-toggle-essential" class="gdpr-toggle-label disabled"></label>
              </div>
            </div>
          </div>

          <!-- Functional Category -->
          <div class="gdpr-cat-card">
            <div class="gdpr-cat-header">
              <div class="gdpr-cat-info">
                <span class="gdpr-cat-title">
                  Functional Preferences
                  <span class="gdpr-badge gdpr-badge-optional">Optional</span>
                </span>
                <span class="gdpr-cat-desc">
                  Saves your chosen visual theme (Light/Dark mode), interface scaling, sidebar collapsed state, and coaching portal choices locally on your browser.
                </span>
              </div>
              <div class="gdpr-toggle-wrapper">
                <input type="checkbox" id="gdpr-toggle-functional" class="gdpr-toggle-checkbox" ${prefs.functional ? 'checked' : ''} />
                <label for="gdpr-toggle-functional" class="gdpr-toggle-label"></label>
              </div>
            </div>
          </div>

          <!-- Analytics Category -->
          <div class="gdpr-cat-card">
            <div class="gdpr-cat-header">
              <div class="gdpr-cat-info">
                <span class="gdpr-cat-title">
                  Performance & Analytics
                  <span class="gdpr-badge gdpr-badge-optional">Optional</span>
                </span>
                <span class="gdpr-cat-desc">
                  Helps us measure quiz load times, question response latency, and usage patterns so we can optimize performance for thousands of test candidates.
                </span>
              </div>
              <div class="gdpr-toggle-wrapper">
                <input type="checkbox" id="gdpr-toggle-analytics" class="gdpr-toggle-checkbox" ${prefs.analytics ? 'checked' : ''} />
                <label for="gdpr-toggle-analytics" class="gdpr-toggle-label"></label>
              </div>
            </div>
          </div>

          <!-- Marketing Category -->
          <div class="gdpr-cat-card">
            <div class="gdpr-cat-header">
              <div class="gdpr-cat-info">
                <span class="gdpr-cat-title">
                  Targeted Marketing & Referrals
                  <span class="gdpr-badge gdpr-badge-optional">Optional</span>
                </span>
                <span class="gdpr-cat-desc">
                  Enables coaching institute referral attribution and customized promotion notifications for upcoming competitive exam mock tests.
                </span>
              </div>
              <div class="gdpr-toggle-wrapper">
                <input type="checkbox" id="gdpr-toggle-marketing" class="gdpr-toggle-checkbox" ${prefs.marketing ? 'checked' : ''} />
                <label for="gdpr-toggle-marketing" class="gdpr-toggle-label"></label>
              </div>
            </div>
          </div>
        </div>

        <div class="gdpr-privacy-footer-note">
          <i class="ri-lock-line"></i> We do not sell your personal assessment data. Learn more in our Privacy Policy.
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px;">
        <button id="gdpr-modal-reset-btn" class="gdpr-btn gdpr-btn-link" style="color: var(--text-muted); font-size: 0.85rem;">
          <i class="ri-refresh-line"></i> Reset Choices
        </button>
        <div style="display: flex; gap: 10px;">
          <button id="gdpr-modal-reject-btn" class="gdpr-btn gdpr-btn-secondary">
            Reject Optional
          </button>
          <button id="gdpr-modal-save-btn" class="gdpr-btn gdpr-btn-primary">
            <i class="ri-save-line"></i> Save Preferences
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalElement);

  // Close handlers
  const closeModal = () => {
    if (modalElement && modalElement.parentNode) {
      modalElement.parentNode.removeChild(modalElement);
      modalElement = null;
    }
  };

  modalElement.querySelector('#gdpr-modal-close').addEventListener('click', closeModal);
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) closeModal();
  });

  // Save Preferences Handler
  modalElement.querySelector('#gdpr-modal-save-btn').addEventListener('click', () => {
    const functional = modalElement.querySelector('#gdpr-toggle-functional').checked;
    const analytics = modalElement.querySelector('#gdpr-toggle-analytics').checked;
    const marketing = modalElement.querySelector('#gdpr-toggle-marketing').checked;

    ConsentManager.saveConsent({ functional, analytics, marketing });
    closeModal();
    removeBanner();
  });

  // Reject Optional Handler
  modalElement.querySelector('#gdpr-modal-reject-btn').addEventListener('click', () => {
    ConsentManager.rejectAll();
    closeModal();
    removeBanner();
  });

  // Reset Handler
  modalElement.querySelector('#gdpr-modal-reset-btn').addEventListener('click', () => {
    ConsentManager.resetConsent();
    closeModal();
    initCookieBanner();
  });
}
