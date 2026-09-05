import React, { useEffect } from 'react';
import { openCookiePreferencesModal } from '../components/CookieConsentModal.js';

export function PrivacyPolicyView({ navigate }) {
  useEffect(() => {
    const scrollContainer = document.getElementById('legalScrollContainer') || window;
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Privacy Policy - Edutor';
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
                <i className="ri-shield-keyhole-line" style={{ color: 'var(--primary, #0d9488)' }}></i>
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
            <i className="ri-file-shield-2-line"></i> Privacy & Data Protection
          </div>
          <h1 className="legal-hero-title">Privacy Policy</h1>
          <p className="legal-hero-desc">
            This Privacy Policy governs how <strong>Edutor Intellect Solution</strong> collects, uses, processes, stores, protects, and discloses personal data and academic information across the Edutor assessment and practice platform.
          </p>
          <div className="legal-meta-row">
            <span className="legal-meta-item"><i className="ri-calendar-line"></i> <strong>Effective Date:</strong> September 5, 2026</span>
            <span className="legal-meta-item"><i className="ri-refresh-line"></i> <strong>Last Updated:</strong> September 5, 2026</span>
            <span className="legal-meta-item"><i className="ri-map-pin-2-line"></i> <strong>Jurisdiction:</strong> New Delhi, India</span>
          </div>

          {/* Document Switcher Tabs */}
          <div className="legal-doc-tabs">
            <button className="legal-doc-tab active">
              <i className="ri-shield-user-line"></i> Privacy Policy
            </button>
            <button className="legal-doc-tab" onClick={() => navigate('terms-of-use')}>
              <i className="ri-file-list-3-line"></i> Terms of Use
            </button>
            <button className="legal-doc-tab" onClick={() => navigate('cookie-policy')}>
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
              <a href="#section-1" onClick={(e) => scrollToSection(e, 'section-1')}>1. Introduction</a>
              <a href="#section-2" onClick={(e) => scrollToSection(e, 'section-2')}>2. Who We Are & Data Controller</a>
              <a href="#section-3" onClick={(e) => scrollToSection(e, 'section-3')}>3. Scope & User Roles</a>
              <a href="#section-4" onClick={(e) => scrollToSection(e, 'section-4')}>4. Information We Collect</a>
              <a href="#section-5" onClick={(e) => scrollToSection(e, 'section-5')}>5. Educational & Academic Data</a>
              <a href="#section-6" onClick={(e) => scrollToSection(e, 'section-6')}>6. AI Features & Data Processing</a>
              <a href="#section-7" onClick={(e) => scrollToSection(e, 'section-7')}>7. Legal Basis & Consent (DPDP Act)</a>
              <a href="#section-8" onClick={(e) => scrollToSection(e, 'section-8')}>8. Data Sharing & Third-Party Processors</a>
              <a href="#section-9" onClick={(e) => scrollToSection(e, 'section-9')}>9. Children & Student Privacy</a>
              <a href="#section-10" onClick={(e) => scrollToSection(e, 'section-10')}>10. Data Retention & Deletion</a>
              <a href="#section-11" onClick={(e) => scrollToSection(e, 'section-11')}>11. Data Security & Incident Handling</a>
              <a href="#section-12" onClick={(e) => scrollToSection(e, 'section-12')}>12. User Rights & Access Requests</a>
              <a href="#section-13" onClick={(e) => scrollToSection(e, 'section-13')}>13. Cookie Preferences</a>
              <a href="#section-14" onClick={(e) => scrollToSection(e, 'section-14')}>14. Policy Updates</a>
              <a href="#section-15" onClick={(e) => scrollToSection(e, 'section-15')}>15. Contact & Grievance Redressal</a>
            </nav>
            <div className="legal-toc-footer">
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '0.82rem', padding: '8px 12px' }}
                onClick={() => openCookiePreferencesModal()}
              >
                <i className="ri-settings-4-line"></i> Cookie Preferences
              </button>
            </div>
          </div>
        </aside>

        {/* Legal Text Document */}
        <main className="legal-article-content">
          {/* Section 1 */}
          <section id="section-1" className="legal-section">
            <span className="legal-section-number">Section 1</span>
            <h2>Introduction</h2>
            <p>
              Welcome to <strong>EdutorAi</strong> (the "Platform", "Service", "we", "us", or "our"), operated by <strong>Edutor Intellect Solution</strong>. We provide an online education technology platform designed for competitive exam coaching institutes, teachers, educators, and students to create, deliver, manage, and undertake Computer-Based Test (CBT) mock exams, practice quizzes, multi-lingual assessments, and educational analytics.
            </p>
            <p>
              We are deeply committed to protecting the privacy, integrity, and confidentiality of the personal and academic data entrusted to us by educators, students, parents/guardians, and educational institutions. This Privacy Policy details our practices concerning data collection, processing, storage, AI integration, security, and your privacy rights under applicable laws.
            </p>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="legal-section">
            <span className="legal-section-number">Section 2</span>
            <h2>Who We Are & Data Controller</h2>
            <p>
              The legal entity responsible for the collection and processing of personal data under this Privacy Policy is:
            </p>
            <div className="legal-callout legal-callout-info">
              <div className="legal-callout-header">
                <i className="ri-building-4-line"></i> <strong>Edutor Intellect Solution</strong>
              </div>
              <p style={{ margin: '8px 0 0 0', lineHeight: 1.6 }}>
                <strong>Building No./Flat No.:</strong> DPT 808B, F-79 &amp; 80<br />
                <strong>Premises/Building:</strong> DLF Prime Tower<br />
                <strong>Road/Street:</strong> Industrial Area<br />
                <strong>Locality/Sub Locality:</strong> Okhla Phase-1<br />
                <strong>City:</strong> New Delhi, <strong>District:</strong> South East Delhi<br />
                <strong>State:</strong> Delhi — <strong>PIN:</strong> 110020, <strong>Country:</strong> India<br />
                <strong>Official Grievance Email:</strong> <span className="legal-highlight">support@edutorai.com</span>
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="legal-section">
            <span className="legal-section-number">Section 3</span>
            <h2>Scope & Types of Users</h2>
            <p>This Privacy Policy applies to all individuals and entities who access or interact with Edutor:</p>
            <ul>
              <li><strong>Teachers &amp; Educators:</strong> Instructors who author questions, assemble mock exam sets, manage batches, and analyze student test results.</li>
              <li><strong>Coaching Institute Administrators:</strong> Authorized personnel who set up institutional branding, configure student batches, and monitor overall performance.</li>
              <li><strong>Students / Candidates:</strong> Learners who enroll in quizzes, take computer-based mock tests, review answer explanations, and track academic progress.</li>
              <li><strong>Parents / Legal Guardians:</strong> Guardians who oversee or authorize student accounts for learners under the age of majority.</li>
              <li><strong>Platform Visitors:</strong> Anyone browsing public portal pages, informational landing sections, or documentation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="legal-section">
            <span className="legal-section-number">Section 4</span>
            <h2>Information We Collect</h2>
            <p>We only collect information necessary to provide reliable educational services and ensure platform security:</p>

            <h3 className="legal-subheading">A. Information You Provide Directly</h3>
            <ul>
              <li><strong>Account Credentials:</strong> Full name, email address, password hash, and optional profile avatar.</li>
              <li><strong>Phone Number &amp; OTP Verification:</strong> When utilizing Phone SMS OTP sign-in/verification.</li>
              <li><strong>Institutional Affiliation:</strong> Coaching institute name, sub-domain slug, batch assignments, and roll numbers.</li>
              <li><strong>Educator Content:</strong> Multiple-choice questions (MCQs), comprehension passages, LaTeX math formulas, translations, answer keys, subject taxonomies, and difficulty tags.</li>
              <li><strong>Uploaded Files:</strong> Question diagrams, exam passage imagery, and bulk question CSV/JSON files.</li>
            </ul>

            <h3 className="legal-subheading">B. Information Collected Automatically</h3>
            <ul>
              <li><strong>Device &amp; Network Information:</strong> Browser type and version, operating system, IP address, screen resolution, and time zone.</li>
              <li><strong>Usage &amp; Diagnostic Logs:</strong> Page response latency, API error logs, test countdown timestamps, and section switching activity.</li>
              <li><strong>Cookies &amp; Local Storage:</strong> Authentication tokens (JWT), active theme preferences (light/dark mode), and GDPR consent preferences.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="legal-section">
            <span className="legal-section-number">Section 5</span>
            <h2>Educational and Academic Data</h2>
            <p>
              When students participate in quizzes or CBT mock tests, Edutor records specific assessment data:
            </p>
            <ul>
              <li>Selected option indices, question review flags ("Marked for Review"), and question visit sequences.</li>
              <li>Time spent per question, section completion durations, and total test submission timestamps.</li>
              <li>Automated scoring results, section-wise marks, accuracy percentages, and performance percentiles.</li>
            </ul>
            <p>
              <strong>Academic Data Ownership:</strong> Academic test submissions are processed on behalf of the respective coaching institute or teacher to deliver test results and performance insights to the candidate and their authorized educators.
            </p>
          </section>

          {/* Section 6 - AI Specific Section */}
          <section id="section-6" className="legal-section">
            <span className="legal-section-number">Section 6</span>
            <div className="legal-badge-pill" style={{ background: 'rgba(67, 97, 238, 0.1)', color: 'var(--primary)' }}>
              <i className="ri-sparkling-fill"></i> AI Transparency Disclosure
            </div>
            <h2>AI-Powered Features &amp; AI Data Processing</h2>
            <p>
              Edutor incorporates Artificial Intelligence (AI) technologies to assist educators and enrich learning experiences. We maintain strict transparency regarding how AI processes data:
            </p>

            <div className="legal-callout legal-callout-warning">
              <div className="legal-callout-header">
                <i className="ri-error-warning-line"></i> <strong>Important AI Notice</strong>
              </div>
              <p style={{ margin: '6px 0 0 0' }}>
                AI-generated questions, translations, and explanations are computational drafts. They may occasionally contain factual errors or translation nuances. Educators and students are advised to review and verify AI-generated content before treating it as definitive curriculum material.
              </p>
            </div>

            <h3 className="legal-subheading">1. Scope of AI Features</h3>
            <ul>
              <li><strong>Multi-Language Question Translation:</strong> Automated translation of educational questions, options, and explanations across supported Indian regional languages (e.g., Hindi, Bengali, Gujarati, Marathi, Tamil, Telugu, etc.).</li>
              <li><strong>AI Prompt Assistance for Question Authoring:</strong> Structured prompt generation helping teachers format source study notes into standardized MCQ schemas.</li>
            </ul>

            <h3 className="legal-subheading">2. Information Submitted to AI Systems</h3>
            <p>
              Only the specific educational text, question stems, study notes, or language translation prompts input by teachers are transmitted for AI processing. <strong>We do not transmit student personal identifiable information (PII), student passwords, or private individual identity data to AI models.</strong>
            </p>

            <h3 className="legal-subheading">3. Third-Party AI Service Providers</h3>
            <p>
              AI features may connect via secure APIs to enterprise AI processors such as Google Gemini API or OpenAI API. Data submitted via these enterprise API endpoints is processed in accordance with enterprise terms of service and is <strong>not used by foundational model providers to train public models</strong> without explicit institutional agreement.
            </p>

            <h3 className="legal-subheading">4. AI Output Disclaimer &amp; Human Oversight</h3>
            <ul>
              <li>AI outputs do not constitute formal legal, medical, academic, or financial counsel.</li>
              <li>Teachers retain final authority to edit, accept, or reject AI drafts in the Master Question Bank Editor.</li>
              <li>Users can flag inaccurate or problematic question content directly to our review desk at <code>support@edutorai.com</code>.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="legal-section">
            <span className="legal-section-number">Section 7</span>
            <h2>Legal Basis for Processing (Indian DPDP Act &amp; IT Act)</h2>
            <p>
              We process personal data in compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000</strong>, and other applicable Indian laws under the following legal bases:
            </p>
            <ul>
              <li><strong>Consent:</strong> When you register an account, sign in via phone OTP or social OAuth, and explicitly accept platform terms and cookie preferences.</li>
              <li><strong>Contractual Performance:</strong> To deliver assessment services, compute test scores, and provide student dashboards requested by you or your institution.</li>
              <li><strong>Legitimate Educational &amp; Security Interests:</strong> To protect exam integrity, prevent fraudulent multi-account quiz submissions, and ensure server stability.</li>
              <li><strong>Legal Compliance:</strong> To comply with lawful government directives, tax records, or dispute resolutions.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="legal-section">
            <span className="legal-section-number">Section 8</span>
            <h2>Data Sharing and Third-Party Processors</h2>
            <p>
              We never sell, rent, or trade your personal data to third-party data brokers or advertisers. Data is shared exclusively with vetted operational processors under strict confidentiality contracts:
            </p>
            <div className="legal-table-responsive">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Service Category</th>
                    <th>Processor / Technology</th>
                    <th>Purpose &amp; Scope</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Authentication &amp; Security</strong></td>
                    <td>Firebase Authentication (Google)</td>
                    <td>Secure Phone SMS OTP verification and Google OAuth identity tokens.</td>
                  </tr>
                  <tr>
                    <td><strong>Database &amp; Hosting</strong></td>
                    <td>Cloud Infrastructure (PostgreSQL / Node.js)</td>
                    <td>Secure storage of user profiles, exam records, questions, and test scores.</td>
                  </tr>
                  <tr>
                    <td><strong>AI Translation &amp; Authoring</strong></td>
                    <td>Google Gemini / OpenAI Enterprise APIs</td>
                    <td>Translating question text and formatting study notes upon teacher request.</td>
                  </tr>
                  <tr>
                    <td><strong>Coaching Institutes</strong></td>
                    <td>Your Enrolled Coaching Institute</td>
                    <td>Sharing test scores, mock rankings, and attendance with your designated coaching faculty.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="legal-section">
            <span className="legal-section-number">Section 9</span>
            <h2>Children and Student Privacy</h2>
            <p>
              As an EdTech platform catering to competitive exam candidates, our users may include minors preparing for secondary, higher secondary, or university entrance examinations.
            </p>
            <ul>
              <li><strong>Institutional / Parental Consent:</strong> Where a student is a minor under applicable law, registration and participation is conducted under the supervision and authorization of their parent/guardian or their educational institution.</li>
              <li><strong>Minimal Data Collection:</strong> We collect only the data strictly necessary for examination evaluation and account administration.</li>
              <li><strong>No Targeted Behavioral Advertising:</strong> We do not serve commercial third-party behavioral ads or track minors for marketing profiling.</li>
              <li><strong>Parent / Guardian Inquiries:</strong> Parents or guardians seeking to review, update, or request the deletion of their child's account may contact our Grievance Desk.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="legal-section">
            <span className="legal-section-number">Section 10</span>
            <h2>Data Retention and Account Deletion</h2>
            <p>
              We retain personal and academic data for as long as your account remains active or as needed to provide educational services.
            </p>
            <ul>
              <li><strong>Account Deletion:</strong> You may request the deletion of your account and associated quiz attempt history by submitting a request through the platform settings or via email to <code>support@edutorai.com</code>.</li>
              <li><strong>Post-Deletion Handling:</strong> Upon verified deletion, personal identifiers are permanently scrubbed from active databases within 30 days, except where retention is mandated by statutory legal, financial, or security audit requirements.</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section id="section-11" className="legal-section">
            <span className="legal-section-number">Section 11</span>
            <h2>Data Security &amp; Incident Handling</h2>
            <p>
              We employ industry-standard technical, organizational, and physical safeguards to prevent unauthorized access, alteration, disclosure, or destruction of your information:
            </p>
            <ul>
              <li><strong>Encryption:</strong> Transport Layer Security (TLS 1.3 / HTTPS) encryption for all data in transit; encrypted storage for passwords (bcrypt/Argon2 hashing).</li>
              <li><strong>Role-Based Access Controls (RBAC):</strong> Strict administrative access barriers ensuring only authorized educators and system administrators can view designated batch records.</li>
              <li><strong>Incident Protocol:</strong> In the event of a confirmed security incident affecting personal data, we will notify affected users and regulatory authorities in accordance with applicable Indian cybersecurity regulations (including CERT-In directives).</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section id="section-12" className="legal-section">
            <span className="legal-section-number">Section 12</span>
            <h2>Your Rights (DPDP Act &amp; Privacy Standards)</h2>
            <p>Under applicable Indian data protection laws, users (Data Principals) possess the following rights:</p>
            <ul>
              <li><strong>Right to Access &amp; Summary:</strong> Request a summary of your personal data processed by Edutor.</li>
              <li><strong>Right to Correction &amp; Erasure:</strong> Request the rectification of inaccurate data or the deletion of obsolete personal data.</li>
              <li><strong>Right of Grievance Redressal:</strong> Submit inquiries, concerns, or complaints regarding data processing directly to our Grievance Officer.</li>
              <li><strong>Right to Nominate:</strong> Nominate an individual to exercise privacy rights in the event of incapacity or death.</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section id="section-13" className="legal-section">
            <span className="legal-section-number">Section 13</span>
            <h2>Cookie &amp; Local Storage Preferences</h2>
            <p>
              Edutor uses cookies and browser local storage to maintain authenticated sessions, secure CBT exams, and remember your visual theme. For full details on cookie categories, expiration, and management, please consult our dedicated <a href="#/cookie-policy" onClick={(e) => { e.preventDefault(); navigate('cookie-policy'); }}>Cookie Policy</a>.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '8px' }}
              onClick={() => openCookiePreferencesModal()}
            >
              <i className="ri-settings-4-line"></i> Manage My Storage Preferences
            </button>
          </section>

          {/* Section 14 */}
          <section id="section-14" className="legal-section">
            <span className="legal-section-number">Section 14</span>
            <h2>Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect technological changes, new platform features, or evolving legal frameworks. When updates occur, the "Last Updated" date at the top of this page will be revised. Continued use of the platform following notification of changes constitutes acknowledgment of the revised terms.
            </p>
          </section>

          {/* Section 15 */}
          <section id="section-15" className="legal-section">
            <span className="legal-section-number">Section 15</span>
            <h2>Contact Us &amp; Grievance Redressal Desk</h2>
            <p>
              In accordance with the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023, if you have any questions, concerns, or grievances regarding our privacy practices, please contact our designated Grievance Officer:
            </p>

            <div className="legal-callout legal-callout-info">
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                <i className="ri-customer-service-2-line"></i> Privacy &amp; Grievance Officer
              </h4>
              <p style={{ margin: 0, lineHeight: 1.65 }}>
                <strong>Organization:</strong> Edutor Intellect Solution<br />
                <strong>Address:</strong> DPT 808B, F-79 &amp; 80, DLF Prime Tower, Industrial Area, Okhla Phase-1, New Delhi, South East Delhi, Delhi - 110020, India<br />
                <strong>Email:</strong> <a href="mailto:support@edutorai.com">support@edutorai.com</a><br />
                <strong>Working Hours:</strong> Monday – Friday, 10:00 AM – 6:00 PM IST<br />
                <strong>Response Window:</strong> We acknowledge all grievances within 48 hours and strive for complete resolution within the statutory 30-day period.
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* Legal Footer */}
      <footer className="legal-page-footer">
        <div className="legal-footer-container">
          <div className="legal-footer-links">
            <span className="legal-footer-active">Privacy Policy</span>
            <span className="legal-footer-sep">•</span>
            <a href="#/terms-of-use" onClick={(e) => { e.preventDefault(); navigate('terms-of-use'); }}>Terms of Use</a>
            <span className="legal-footer-sep">•</span>
            <a href="#/cookie-policy" onClick={(e) => { e.preventDefault(); navigate('cookie-policy'); }}>Cookie Policy</a>
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

export default PrivacyPolicyView;
