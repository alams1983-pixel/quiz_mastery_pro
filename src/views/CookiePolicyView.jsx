import React, { useEffect } from 'react';
import { openCookiePreferencesModal } from '../components/CookieConsentModal.js';

export function CookiePolicyView({ navigate }) {
  useEffect(() => {
    const scrollContainer = document.getElementById('legalScrollContainer') || window;
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Cookie Policy - Edutor';
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="legal-page-wrapper">
      {/* Top Legal Navigation Bar */}
      <header className="legal-nav-header">
        <div className="legal-nav-container">
          <div className="legal-brand" onClick={() => navigate('dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} title="EdutorAi Home">
            <img
              src="/uploads/edutorai_logo.webp"
              alt="EdutorAi Logo"
              className="edutor-responsive-logo"
              style={{ maxHeight: '38px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement.querySelector('.legal-brand-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="legal-brand-fallback" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
              <div className="auth-logo-badge" style={{ width: '36px', height: '36px', fontSize: '1.2rem', margin: 0 }}>
                <i className="ri-cookie-line" style={{ color: 'var(--primary, #0d9488)' }}></i>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>EdutorAi</span>
            </div>
          </div>

          <div className="legal-nav-actions">
            <button className="btn btn-secondary legal-back-btn" onClick={() => navigate('login')}>
              <i className="ri-arrow-left-line"></i> Back to Login / Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="legal-hero">
        <div className="legal-hero-content">
          <div className="legal-tag-badge">
            <i className="ri-database-2-line"></i> Storage & Tracking Disclosures
          </div>
          <h1 className="legal-hero-title">Cookie &amp; Local Storage Policy</h1>
          <p className="legal-hero-desc">
            This Cookie Policy explains how <strong>Edutor Intellect Solution</strong> uses cookies, local storage, and related web technologies to deliver secure, responsive, and customized examination experiences.
          </p>
          <div className="legal-meta-row">
            <span className="legal-meta-item"><i className="ri-calendar-line"></i> <strong>Effective Date:</strong> September 5, 2026</span>
            <span className="legal-meta-item"><i className="ri-refresh-line"></i> <strong>Last Updated:</strong> September 5, 2026</span>
            <span className="legal-meta-item"><i className="ri-shield-check-line"></i> <strong>Granular User Control:</strong> Active</span>
          </div>

          {/* Document Switcher Tabs */}
          <div className="legal-doc-tabs">
            <button className="legal-doc-tab" onClick={() => navigate('privacy-policy')}>
              <i className="ri-shield-user-line"></i> Privacy Policy
            </button>
            <button className="legal-doc-tab" onClick={() => navigate('terms-of-use')}>
              <i className="ri-file-list-3-line"></i> Terms of Use
            </button>
            <button className="legal-doc-tab active">
              <i className="ri-cookie-line"></i> Cookie Policy
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="legal-body-container">
        {/* Sticky Table of Contents */}
        <aside className="legal-toc-sidebar">
          <div className="legal-toc-card">
            <h4 className="legal-toc-title"><i className="ri-list-check-2"></i> Table of Contents</h4>
            <nav className="legal-toc-nav">
              <a href="#cookie-1" onClick={(e) => scrollToSection(e, 'cookie-1')}>1. What Are Cookies &amp; Local Storage?</a>
              <a href="#cookie-2" onClick={(e) => scrollToSection(e, 'cookie-2')}>2. Why Edutor Uses Storage</a>
              <a href="#cookie-3" onClick={(e) => scrollToSection(e, 'cookie-3')}>3. Categories of Storage We Use</a>
              <a href="#cookie-4" onClick={(e) => scrollToSection(e, 'cookie-4')}>4. Storage Keys &amp; Purposes Table</a>
              <a href="#cookie-5" onClick={(e) => scrollToSection(e, 'cookie-5')}>5. Third-Party Services</a>
              <a href="#cookie-6" onClick={(e) => scrollToSection(e, 'cookie-6')}>6. Managing Your Cookie Preferences</a>
              <a href="#cookie-7" onClick={(e) => scrollToSection(e, 'cookie-7')}>7. Browser-Level Cookie Management</a>
              <a href="#cookie-8" onClick={(e) => scrollToSection(e, 'cookie-8')}>8. Policy Updates &amp; Contact</a>
            </nav>
            <div className="legal-toc-footer">
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.85rem', padding: '9px 12px' }}
                onClick={() => openCookiePreferencesModal()}
              >
                <i className="ri-settings-4-line"></i> Open Preferences Modal
              </button>
            </div>
          </div>
        </aside>

        {/* Legal Text Document */}
        <main className="legal-article-content">
          {/* Section 1 */}
          <section id="cookie-1" className="legal-section">
            <span className="legal-section-number">Section 1</span>
            <h2>What Are Cookies and Browser Local Storage?</h2>
            <p>
              <strong>Cookies</strong> are small text files placed on your device by websites you visit. <strong>Local Storage</strong> (LocalStorage / SessionStorage) is a modern web browser capability that allows web applications to store key-value data directly on your device with greater storage capacity and security.
            </p>
            <p>
              On EdutorAi, we predominantly use client-side <strong> Local Storage</strong> alongside standard HTTP cookies to manage secure logins, prevent cheating during active tests, and remember your visual display preferences across visits.
            </p>
          </section>

          {/* Section 2 */}
          <section id="cookie-2" className="legal-section">
            <span className="legal-section-number">Section 2</span>
            <h2>Why Does Edutor Use Cookies and Local Storage?</h2>
            <p>We use these technologies for essential and beneficial educational functions:</p>
            <ul>
              <li><strong>Session Authentication:</strong> Keeping you logged in securely while navigating between quizzes, test analysis, and student dashboards.</li>
              <li><strong>CBT Exam State Recovery:</strong> Ensuring your marked answers, timer countdown, and question review status are preserved in the event of brief network drops or page reloads.</li>
              <li><strong>Customized Interface:</strong> Remembering your chosen Dark/Light theme mode, sidebar navigation status, and coaching institute custom colors.</li>
              <li><strong>Consent Management:</strong> Storing your explicit choices regarding which optional storage categories you permit under privacy regulations.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="cookie-3" className="legal-section">
            <span className="legal-section-number">Section 3</span>
            <h2>Categories of Cookies &amp; Storage We Use</h2>

            <h3 className="legal-subheading">1. Strictly Necessary / Essential Storage</h3>
            <p>
              Essential storage items are required for the technical operation, authentication, and security of the Platform. Because the website cannot function properly without them, they cannot be disabled in our preferences tool.
            </p>

            <h3 className="legal-subheading">2. Functional &amp; Preference Storage (Optional)</h3>
            <p>
              Functional items allow the Platform to remember choices you make (such as visual dark/light theme, font scale, or collapsed sidebar state) to provide a tailored, consistent experience.
            </p>

            <h3 className="legal-subheading">3. Performance &amp; Analytics Storage (Optional)</h3>
            <p>
              Performance items help us measure question load latency, client-side rendering bottlenecks, and CBT mock exam completion rates so our engineering team can optimize platform speed.
            </p>

            <h3 className="legal-subheading">4. Marketing &amp; Referral Storage (Optional)</h3>
            <p>
              Attribution storage enables coaching institutes to track student enrollment campaigns and mock exam referral links. <strong>We do not deploy third-party advertising cookies or behavioral tracking ad-networks.</strong>
            </p>
          </section>

          {/* Section 4 */}
          <section id="cookie-4" className="legal-section">
            <span className="legal-section-number">Section 4</span>
            <h2>Storage Keys &amp; Purposes Table</h2>
            <div className="legal-table-responsive">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Key / Item</th>
                    <th>Storage Type</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Purpose &amp; Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>token</code></td>
                    <td>LocalStorage</td>
                    <td><span className="legal-badge legal-badge-required">Essential</span></td>
                    <td>Session / 7 Days</td>
                    <td>Encrypted JSON Web Token (JWT) authorizing secure API requests and exam attempts.</td>
                  </tr>
                  <tr>
                    <td><code>user</code></td>
                    <td>LocalStorage</td>
                    <td><span className="legal-badge legal-badge-required">Essential</span></td>
                    <td>Session / 7 Days</td>
                    <td>Cached user identity profile (Name, Role, Enrolled Batches, Institute ID).</td>
                  </tr>
                  <tr>
                    <td><code>edutor_gdpr_consent</code></td>
                    <td>LocalStorage</td>
                    <td><span className="legal-badge legal-badge-required">Essential</span></td>
                    <td>1 Year</td>
                    <td>Stores your recorded preferences for functional, analytics, and marketing categories.</td>
                  </tr>
                  <tr>
                    <td><code>theme</code></td>
                    <td>LocalStorage</td>
                    <td><span className="legal-badge legal-badge-optional">Functional</span></td>
                    <td>Persistent</td>
                    <td>Stores your preferred UI color scheme (e.g., <code>light</code> or <code>dark</code>).</td>
                  </tr>
                  <tr>
                    <td><code>exam_attempt_*</code></td>
                    <td>SessionStorage</td>
                    <td><span className="legal-badge legal-badge-required">Essential</span></td>
                    <td>Active Exam</td>
                    <td>Caches live CBT question answers to protect candidates against transient WiFi disconnections.</td>
                  </tr>
                  <tr>
                    <td><code>_ga, _gid</code></td>
                    <td>Cookie</td>
                    <td><span className="legal-badge legal-badge-optional">Analytics</span></td>
                    <td>24h - 2 Years</td>
                    <td>Anonymized analytics telemetry (only active if Analytics category is accepted).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section id="cookie-5" className="legal-section">
            <span className="legal-section-number">Section 5</span>
            <h2>Third-Party Services &amp; Cookies</h2>
            <p>
              When utilizing social logins or embedded assets, certain third-party libraries may set essential security cookies:
            </p>
            <ul>
              <li><strong>Google Firebase / Identity Platform:</strong> Security reCAPTCHA cookies to prevent automated brute-force attacks and abuse.</li>
              <li><strong>CDN Providers (jsDelivr, Google Fonts):</strong> May utilize standard HTTP cache headers to speed up font and KaTeX math rendering delivery.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="cookie-6" className="legal-section">
            <span className="legal-section-number">Section 6</span>
            <h2>Managing Your Cookie Preferences</h2>
            <p>
              You can review, modify, or revoke your consent preferences for non-essential storage at any time by clicking the button below:
            </p>
            <div className="legal-callout legal-callout-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Interactive Preference Manager</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem' }}>Toggle Functional, Analytics, and Marketing categories on or off instantly.</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => openCookiePreferencesModal()}
              >
                <i className="ri-equalizer-line"></i> Manage Preferences
              </button>
            </div>
          </section>

          {/* Section 7 */}
          <section id="cookie-7" className="legal-section">
            <span className="legal-section-number">Section 7</span>
            <h2>Browser-Level Cookie Management</h2>
            <p>
              Most modern web browsers allow you to manage cookies and clear site data through their browser settings:
            </p>
            <ul>
              <li><strong>Google Chrome:</strong> Settings &gt; Privacy and security &gt; Third-party cookies.</li>
              <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data.</li>
              <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data.</li>
              <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &gt; Manage and delete cookies.</li>
            </ul>
            <div className="legal-callout legal-callout-warning">
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                <i className="ri-alert-line"></i> <strong>Note:</strong> Clearing or disabling essential local storage will automatically sign you out of the Platform and may disrupt in-progress CBT mock tests.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="cookie-8" className="legal-section">
            <span className="legal-section-number">Section 8</span>
            <h2>Policy Updates &amp; Organization Contact</h2>
            <p>
              We may revise this Cookie Policy to reflect technical changes in our storage mechanisms. If you have any inquiries regarding our use of cookies and local storage, please reach out to us:
            </p>

            <div className="legal-callout legal-callout-info">
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <strong>Edutor Intellect Solution</strong><br />
                Building No./Flat No. DPT 808B, F-79 &amp; 80, DLF Prime Tower, Industrial Area, Okhla Phase-1<br />
                New Delhi, South East Delhi, Delhi - 110020, India<br />
                <strong>Email:</strong> <a href="mailto:support@edutorai.com">support@edutorai.com</a>
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* Legal Footer */}
      <footer className="legal-page-footer">
        <div className="legal-footer-container">
          <div className="legal-footer-links">
            <a href="#/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('privacy-policy'); }}>Privacy Policy</a>
            <span className="legal-footer-sep">•</span>
            <a href="#/terms-of-use" onClick={(e) => { e.preventDefault(); navigate('terms-of-use'); }}>Terms of Use</a>
            <span className="legal-footer-sep">•</span>
            <span className="legal-footer-active">Cookie Policy</span>
            <span className="legal-footer-sep">•</span>
            <a href="#manage-cookies" onClick={(e) => { e.preventDefault(); openCookiePreferencesModal(); }}>Cookie Settings</a>
          </div>
          <p className="legal-footer-copy">
            © {new Date().getFullYear()} <strong>Edutor Intellect Solution</strong>. All Rights Reserved. DLF Prime Tower, Okhla Phase-1, New Delhi - 110020, India.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default CookiePolicyView;
