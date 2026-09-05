import React, { useEffect } from 'react';
import { openCookiePreferencesModal } from '../components/CookieConsentModal.js';

export function TermsOfUseView({ navigate }) {
  useEffect(() => {
    const scrollContainer = document.getElementById('legalScrollContainer') || window;
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Terms of Use - Edutor';
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
                <i className="ri-scales-3-line" style={{ color: 'var(--primary, #0d9488)' }}></i>
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
            <i className="ri-file-text-line"></i> User Agreement & Terms
          </div>
          <h1 className="legal-hero-title">Terms of Use</h1>
          <p className="legal-hero-desc">
            These Terms of Use constitute a legally binding agreement between you and <strong>Edutor Intellect Solution</strong> governing your access and use of the Edutor online examination, mock test, and practice platform.
          </p>
          <div className="legal-meta-row">
            <span className="legal-meta-item"><i className="ri-calendar-line"></i> <strong>Effective Date:</strong> September 5, 2026</span>
            <span className="legal-meta-item"><i className="ri-refresh-line"></i> <strong>Last Updated:</strong> September 5, 2026</span>
            <span className="legal-meta-item"><i className="ri-map-pin-2-line"></i> <strong>Jurisdiction:</strong> New Delhi, India</span>
          </div>

          {/* Document Switcher Tabs */}
          <div className="legal-doc-tabs">
            <button className="legal-doc-tab" onClick={() => navigate('privacy-policy')}>
              <i className="ri-shield-user-line"></i> Privacy Policy
            </button>
            <button className="legal-doc-tab active">
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
              <a href="#tou-1" onClick={(e) => scrollToSection(e, 'tou-1')}>1. Acceptance of Terms</a>
              <a href="#tou-2" onClick={(e) => scrollToSection(e, 'tou-2')}>2. Definitions</a>
              <a href="#tou-3" onClick={(e) => scrollToSection(e, 'tou-3')}>3. Organization & Eligibility</a>
              <a href="#tou-4" onClick={(e) => scrollToSection(e, 'tou-4')}>4. Account Registration & Security</a>
              <a href="#tou-5" onClick={(e) => scrollToSection(e, 'tou-5')}>5. Teacher & Institute Responsibilities</a>
              <a href="#tou-6" onClick={(e) => scrollToSection(e, 'tou-6')}>6. Student Responsibilities & Ethics</a>
              <a href="#tou-7" onClick={(e) => scrollToSection(e, 'tou-7')}>7. Acceptable Use & Prohibited Acts</a>
              <a href="#tou-8" onClick={(e) => scrollToSection(e, 'tou-8')}>8. Academic Integrity & CBT Exam Conduct</a>
              <a href="#tou-9" onClick={(e) => scrollToSection(e, 'tou-9')}>9. User Content & Uploaded Files</a>
              <a href="#tou-10" onClick={(e) => scrollToSection(e, 'tou-10')}>10. Intellectual Property Rights</a>
              <a href="#tou-11" onClick={(e) => scrollToSection(e, 'tou-11')}>11. AI-Powered Features & Limitations</a>
              <a href="#tou-12" onClick={(e) => scrollToSection(e, 'tou-12')}>12. Educational Disclaimers</a>
              <a href="#tou-13" onClick={(e) => scrollToSection(e, 'tou-13')}>13. Third-Party Integrations</a>
              <a href="#tou-14" onClick={(e) => scrollToSection(e, 'tou-14')}>14. Service Availability & Maintenance</a>
              <a href="#tou-15" onClick={(e) => scrollToSection(e, 'tou-15')}>15. Suspension & Account Termination</a>
              <a href="#tou-16" onClick={(e) => scrollToSection(e, 'tou-16')}>16. Limitation of Liability & Indemnity</a>
              <a href="#tou-17" onClick={(e) => scrollToSection(e, 'tou-17')}>17. Governing Law & Dispute Resolution</a>
              <a href="#tou-18" onClick={(e) => scrollToSection(e, 'tou-18')}>18. General Provisions & Contact</a>
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
          <section id="tou-1" className="legal-section">
            <span className="legal-section-number">Section 1</span>
            <h2>Introduction &amp; Acceptance of Terms</h2>
            <p>
              Please read these Terms of Use ("Terms", "Agreement") carefully before accessing or using the <strong>EdutorAi</strong> web application, Computer-Based Testing (CBT) portal, mobile interfaces, question bank editor, or related services (collectively, the "Platform"), owned and operated by <strong>Edutor Intellect Solution</strong>.
            </p>
            <p>
              By accessing, browsing, registering an account, or participating in quizzes and mock tests on the Platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our companion <a href="#/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('privacy-policy'); }}>Privacy Policy</a> and <a href="#/cookie-policy" onClick={(e) => { e.preventDefault(); navigate('cookie-policy'); }}>Cookie Policy</a>. If you do not agree to these Terms, you must immediately discontinue using the Platform.
            </p>
          </section>

          {/* Section 2 */}
          <section id="tou-2" className="legal-section">
            <span className="legal-section-number">Section 2</span>
            <h2>Definitions</h2>
            <ul>
              <li><strong>"Platform"</strong> refers to the software application, websites, sub-domains, and services hosted under the Edutor ecosystem.</li>
              <li><strong>"Edutor Intellect Solution"</strong> ("We", "Us", "Our") refers to the business entity operating the Platform.</li>
              <li><strong>"User"</strong> ("You", "Your") refers to any individual or entity accessing the Platform, including Teachers, Institute Admins, Students, and Visitors.</li>
              <li><strong>"Coaching Institute / Organization"</strong> refers to any tutorial center, school, college, or education provider utilizing Edutor to host tests.</li>
              <li><strong>"Assessment / Mock Test"</strong> refers to CBT exams, multi-lingual quizzes, timed practice tests, and question banks administered through the Platform.</li>
              <li><strong>"AI Output"</strong> refers to computer-generated text translations, question templates, and suggestions generated via integrated AI models.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="tou-3" className="legal-section">
            <span className="legal-section-number">Section 3</span>
            <h2>Organization Details &amp; Eligibility</h2>
            <p>The Platform is operated by:</p>
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
                <strong>State:</strong> Delhi — <strong>PIN:</strong> 110020, <strong>Country:</strong> India
              </p>
            </div>
            <p>
              <strong>Eligibility Criteria:</strong> You must be at least the age of majority in your jurisdiction (18 years in India) to register as an independent Educator or Coaching Administrator. Minors (students under 18) may use the Platform solely with the consent, guidance, and supervision of a parent, legal guardian, or an authorized educational institution.
            </p>
          </section>

          {/* Section 4 */}
          <section id="tou-4" className="legal-section">
            <span className="legal-section-number">Section 4</span>
            <h2>Account Registration, Authentication &amp; Security</h2>
            <ul>
              <li><strong>Accurate Registration:</strong> You agree to provide true, accurate, and current information during registration (including full name, valid email, and phone number where required).</li>
              <li><strong>Credential Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your account password, Phone OTP codes, and JWT access tokens.</li>
              <li><strong>Unauthorized Activity:</strong> You must immediately notify Edutor Intellect Solution at <code>support@edutorai.com</code> if you discover any breach of security or unauthorized use of your account.</li>
              <li><strong>Single-User License:</strong> User accounts may not be shared, transferred, or leased to third parties without prior written approval.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="tou-5" className="legal-section">
            <span className="legal-section-number">Section 5</span>
            <h2>Teacher and Coaching Institute Responsibilities</h2>
            <p>Educators and Coaching Institute Administrators using Edutor agree to:</p>
            <ul>
              <li>Ensure all uploaded question banks, test content, and passage images comply with copyright and intellectual property laws.</li>
              <li>Maintain appropriate oversight over student batches, test schedules, and marking schemes.</li>
              <li>Independently verify AI-assisted multi-language translations and question drafts before assigning high-stakes exams.</li>
              <li>Uphold the confidentiality of student test scores and comply with applicable student data privacy obligations.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="tou-6" className="legal-section">
            <span className="legal-section-number">Section 6</span>
            <h2>Student Responsibilities &amp; Code of Conduct</h2>
            <p>Students and examination candidates agree to:</p>
            <ul>
              <li>Engage with the Platform honestly and ethically for genuine learning and assessment preparation.</li>
              <li>Refrain from attempting unauthorized modifications to client-side test timers, question scripts, or score calculations.</li>
              <li>Respect fellow candidates and coaching faculty in all interactions and discussions.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="tou-7" className="legal-section">
            <span className="legal-section-number">Section 7</span>
            <h2>Acceptable Use Policy &amp; Prohibited Activities</h2>
            <p>When using the Platform, you strictly agree NOT to:</p>
            <ul>
              <li>Violate any applicable local, state, national, or international law, including the Information Technology Act, 2000, and DPDP Act, 2023.</li>
              <li>Upload or distribute content that is defamatory, obscene, harassing, infringing, invasive of privacy, or racially/ethnically hateful.</li>
              <li>Reverse engineer, decompile, disassemble, or extract source code from the Platform.</li>
              <li>Launch automated scrapers, spiders, bot swarms, or denial-of-service (DoS) traffic against our servers.</li>
              <li>Bypass or tamper with security controls, rate limiters, or token authentication mechanisms.</li>
              <li>Impersonate any person, coaching academy, or educational board.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="tou-8" className="legal-section">
            <span className="legal-section-number">Section 8</span>
            <h2>Academic Integrity &amp; CBT Examination Conduct</h2>
            <p>
              Edutor is designed to simulate authentic Computer-Based Test (CBT) environments (e.g. SSC, Banking, Railways, State PSC, and competitive entrance exams). To maintain fair evaluation:
            </p>
            <ul>
              <li>Candidates must not use external assistance, unauthorized browser tabs, or automated script solvers during timed mock tests.</li>
              <li>Institutes reserve the right to disqualify or invalidate test attempts where suspicious timing anomalies or multiple simultaneous sessions are detected.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="tou-9" className="legal-section">
            <span className="legal-section-number">Section 9</span>
            <h2>User-Generated Content &amp; Uploaded Files</h2>
            <ul>
              <li><strong>Content Ownership:</strong> Teachers and institutes retain copyright in their original question sets, custom passage notes, and instructional materials uploaded to their coaching portals.</li>
              <li><strong>Operational License:</strong> By uploading content, you grant Edutor Intellect Solution a non-exclusive, worldwide, royalty-free license to store, process, display, format, and translate that content solely for the purpose of operating the Platform.</li>
              <li><strong>Takedown of Infringing Content:</strong> If you believe any question or passage on the Platform infringes your intellectual property, please submit a notice to <code>support@edutorai.com</code> for prompt review and takedown under applicable intermediary guidelines.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="tou-10" className="legal-section">
            <span className="legal-section-number">Section 10</span>
            <h2>Intellectual Property Rights of the Platform</h2>
            <p>
              The Edutor software, application architecture, CBT exam engine, layout design, visual interfaces, algorithms, logos, trademarks, and documentation are the exclusive intellectual property of <strong>Edutor Intellect Solution</strong> and are protected under Indian and international copyright and trademark laws.
            </p>
          </section>

          {/* Section 11 - AI Terms */}
          <section id="tou-11" className="legal-section">
            <span className="legal-section-number">Section 11</span>
            <div className="legal-badge-pill" style={{ background: 'rgba(67, 97, 238, 0.1)', color: 'var(--primary)' }}>
              <i className="ri-sparkling-fill"></i> AI Features Terms &amp; Conditions
            </div>
            <h2>AI-Powered Features, Disclaimers &amp; Limitations</h2>
            <p>
              Edutor provides AI-powered authoring tools, dynamic multi-language question translations, and prompt generation aids. Your use of AI features is subject to the following terms:
            </p>
            <div className="legal-callout legal-callout-warning">
              <div className="legal-callout-header">
                <i className="ri-information-line"></i> <strong>Non-Authoritative Output Disclosure</strong>
              </div>
              <p style={{ margin: '6px 0 0 0' }}>
                AI-generated questions, translations, and explanations are synthetic computational aids. Edutor Intellect Solution does not guarantee that AI outputs are error-free, mathematically infallible, or fully compliant with specific exam syllabus standards without human educator review.
              </p>
            </div>
            <ul>
              <li><strong>Human Review Required:</strong> Educators are strictly required to review, verify, and validate all AI-translated questions and answer keys prior to conducting live exams.</li>
              <li><strong>No High-Stakes Reliance:</strong> AI output must not be relied upon as the sole basis for high-stakes certification or legal/academic determinations.</li>
              <li><strong>Prohibited AI Submissions:</strong> Users must NOT submit sensitive personal identifiers (PII), biometric data, classified test papers, or unlawful material into AI prompt fields.</li>
              <li><strong>Service Modifications:</strong> We reserve the right to throttle, modify, suspend, or discontinue AI features based on API quotas, performance upgrades, or provider policy revisions.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section id="tou-12" className="legal-section">
            <span className="legal-section-number">Section 12</span>
            <h2>Educational &amp; Score Disclaimers</h2>
            <p>
              Edutor is an educational practice and assessment tool. While mock exams are designed around official patterns (such as SSC, Banking, or State exams), we make no warranty that completing practice tests on Edutor guarantees selection, ranking, or success in any official recruitment examination.
            </p>
          </section>

          {/* Section 13 */}
          <section id="tou-13" className="legal-section">
            <span className="legal-section-number">Section 13</span>
            <h2>Third-Party Services &amp; Integrations</h2>
            <p>
              The Platform integrates third-party services, including Firebase Authentication, KaTeX math typesetting, and cloud hosting APIs. We are not responsible for the independent availability, downtime, or policy changes of these external service providers.
            </p>
          </section>

          {/* Section 14 */}
          <section id="tou-14" className="legal-section">
            <span className="legal-section-number">Section 14</span>
            <h2>Service Availability &amp; Maintenance</h2>
            <p>
              We endeavor to maintain high uptime and seamless performance. However, access to the Platform may be temporarily interrupted for scheduled maintenance, server updates, emergency repairs, or telecommunication failures. We provide the Platform on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of uninterrupted service.
            </p>
          </section>

          {/* Section 15 */}
          <section id="tou-15" className="legal-section">
            <span className="legal-section-number">Section 15</span>
            <h2>Account Suspension &amp; Termination</h2>
            <ul>
              <li><strong>Termination by You:</strong> You may cease using the Platform and request account closure at any time.</li>
              <li><strong>Termination by Us:</strong> We reserve the right to suspend or permanently terminate access without prior notice if you violate these Terms, engage in fraudulent activity, or compromise platform integrity.</li>
              <li><strong>Survival:</strong> Sections relating to Intellectual Property, Disclaimers, Limitation of Liability, and Governing Law shall survive any account termination.</li>
            </ul>
          </section>

          {/* Section 16 */}
          <section id="tou-16" className="legal-section">
            <span className="legal-section-number">Section 16</span>
            <h2>Limitation of Liability &amp; Indemnification</h2>
            <p>
              To the maximum extent permitted by Indian law, in no event shall <strong>Edutor Intellect Solution</strong>, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages (including loss of data, loss of exam preparation time, or academic disputes) arising from your use of the Platform.
            </p>
            <p>
              You agree to indemnify and hold harmless Edutor Intellect Solution from and against any claims, liabilities, damages, and expenses arising out of your violation of these Terms or your infringement of third-party intellectual property.
            </p>
          </section>

          {/* Section 17 */}
          <section id="tou-17" className="legal-section">
            <span className="legal-section-number">Section 17</span>
            <h2>Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>, without regard to its conflict of law principles.
            </p>
            <p>
              Any dispute, controversy, or claim arising out of or relating to these Terms or the Platform shall be subject to the exclusive jurisdiction of the competent courts located in <strong>New Delhi, Delhi, India</strong>.
            </p>
          </section>

          {/* Section 18 */}
          <section id="tou-18" className="legal-section">
            <span className="legal-section-number">Section 18</span>
            <h2>General Provisions &amp; Contact Information</h2>
            <ul>
              <li><strong>Severability:</strong> If any provision of these Terms is held invalid or unenforceable, that provision shall be modified to the minimum extent necessary, and the remaining provisions shall remain in full force.</li>
              <li><strong>Entire Agreement:</strong> These Terms, along with the Privacy Policy and Cookie Policy, constitute the entire agreement between you and Edutor Intellect Solution.</li>
              <li><strong>Contact Desk:</strong> For inquiries concerning these Terms, please reach out to:</li>
            </ul>

            <div className="legal-callout legal-callout-info">
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <strong>Edutor Intellect Solution</strong><br />
                DLF Prime Tower, DPT 808B, F-79 &amp; 80, Industrial Area, Okhla Phase-1, New Delhi - 110020, India<br />
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
            <span className="legal-footer-active">Terms of Use</span>
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

export default TermsOfUseView;
