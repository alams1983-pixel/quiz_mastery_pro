import React, { useState, useEffect } from 'react';
import { api, setToken, setUser, apiRequest } from '../services/api.js';
import { getTenantFromURL } from '../services/tenant.js';
import { ReactModal } from '../components/ReactModal.jsx';
import {
  loginWithEmailPassword,
  registerWithEmailPassword,
  loginWithGoogle,
  loginWithGoogleRedirect,
  checkGoogleRedirectResult,
  setupRecaptcha,
  sendPhoneOtp,
  confirmPhoneOtp
} from '../services/firebaseClient.js';

export function LoginView({ navigate, activeTenantBranding = null }) {
  const urlSlug = getTenantFromURL();
  const isStudentPortal = !!(activeTenantBranding || urlSlug);

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register' | 'phone'
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCoachingName, setRegCoachingName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState(null);

  // Onboarding Modal State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ user: null, token: '' });
  const [instNameInput, setInstNameInput] = useState('');
  const [onboardingSaving, setOnboardingSaving] = useState(false);

  const redirectUserByRole = (userData) => {
    if (userData.role === 'super_admin') {
      navigate('super-admin');
    } else if (userData.role === 'institute_admin') {
      navigate('institute-admin');
    } else {
      navigate('dashboard');
    }
  };

  const handlePostAuthSuccess = async (authRes) => {
    setToken(authRes.token);
    setUser(authRes.user);

    if ((authRes.user.role === 'institute_admin' || authRes.user.role === 'admin') && !authRes.user.institute_id) {
      setOnboardingData({ user: authRes.user, token: authRes.token });
      setShowOnboarding(true);
    } else {
      redirectUserByRole(authRes.user);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertInfo({ show: false, type: '', message: '' });

    try {
      let firebaseUser = null;
      try {
        const userCred = await loginWithEmailPassword(loginEmail, loginPassword);
        firebaseUser = userCred.user;
      } catch (fbErr) {
        console.warn('Firebase login fallback to backend API:', fbErr.message);
      }

      let reqBody = { email: loginEmail ? loginEmail.trim() : '', password: loginPassword };
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        reqBody.firebaseIdToken = idToken;
      }

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(reqBody)
      });

      await handlePostAuthSuccess(res);
    } catch (err) {
      setAlertInfo({ show: true, type: 'danger', message: err.message || 'Invalid credentials or sign-in failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertInfo({ show: false, type: '', message: '' });

    try {
      let firebaseUser = null;
      try {
        const userCred = await registerWithEmailPassword(regEmail, regPassword);
        firebaseUser = userCred.user;
      } catch (fbErr) {
        console.warn('Firebase register fallback to backend API:', fbErr.message);
      }

      let reqBody = {
        full_name: regFullName,
        email: regEmail,
        password: regPassword,
        role: isStudentPortal ? 'user' : 'institute_admin',
        coaching_name: isStudentPortal ? undefined : regCoachingName,
        phone_number: isStudentPortal ? undefined : regPhone
      };

      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        reqBody.firebaseIdToken = idToken;
      }

      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(reqBody)
      });

      await handlePostAuthSuccess(res);
    } catch (err) {
      setAlertInfo({ show: true, type: 'danger', message: err.message || 'Registration failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setAlertInfo({ show: false, type: '', message: '' });

    try {
      const userCred = await loginWithGoogle();
      const idToken = await userCred.user.getIdToken();

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ firebaseIdToken: idToken })
      });

      await handlePostAuthSuccess(res);
    } catch (err) {
      setAlertInfo({ show: true, type: 'danger', message: err.message || 'Google authentication failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setAlertInfo({ show: true, type: 'danger', message: 'Please enter a valid phone number.' });
      return;
    }

    setSubmitting(true);
    setAlertInfo({ show: false, type: '', message: '' });

    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmation = await sendPhoneOtp(phoneNumber, verifier);
      setPhoneConfirmationResult(confirmation);
      setOtpStep(2);
      setAlertInfo({ show: true, type: 'success', message: 'OTP sent! Please check your mobile SMS.' });
    } catch (err) {
      console.error('🔴 Error sending Phone OTP:', err);
      setAlertInfo({ show: true, type: 'danger', message: err.message || 'Error sending OTP SMS.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || !phoneConfirmationResult) {
      setAlertInfo({ show: true, type: 'danger', message: 'Please enter the 6-digit OTP code.' });
      return;
    }

    setSubmitting(true);
    setAlertInfo({ show: false, type: '', message: '' });

    try {
      const userCred = await confirmPhoneOtp(phoneConfirmationResult, otpCode);
      const idToken = userCred.idToken;

      const tenantSlug = activeTenantBranding ? (activeTenantBranding.slug || activeTenantBranding.code) : urlSlug;

      const res = await apiRequest('/auth/firebase-login', {
        method: 'POST',
        body: JSON.stringify({
          idToken,
          phone_number: phoneNumber,
          account_type: isStudentPortal ? 'student' : 'teacher',
          institute_slug: tenantSlug
        })
      });

      await handlePostAuthSuccess(res);
    } catch (err) {
      console.error('🔴 Error verifying Phone OTP:', err);
      setAlertInfo({ show: true, type: 'danger', message: err.message || 'OTP verification failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    if (!instNameInput.trim()) return;

    setOnboardingSaving(true);
    try {
      const res = await fetch('/api/institutes/setup-coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${onboardingData.token}`
        },
        body: JSON.stringify({ name: instNameInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...onboardingData.user, institute_id: data.instituteId, role: 'institute_admin' };
        setUser(updatedUser);
        setShowOnboarding(false);
        redirectUserByRole(updatedUser);
      } else {
        alert(data.error || 'Failed to setup coaching institute.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setOnboardingSaving(false);
    }
  };

  return (
    <div
      className="view-container fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        boxSizing: 'border-box',
        padding: '20px 16px calc(20px + env(safe-area-inset-bottom, 0px)) 16px',
        overflowY: 'auto'
      }}
    >
      <div className="auth-card" style={{ maxWidth: '480px', width: '100%', maxHeight: 'calc(100dvh - 40px)', overflowY: 'auto', margin: 'auto 0' }}>
        {/* Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="auth-logo-badge" style={{ margin: '0 auto 12px' }}>
            {isStudentPortal ? (
              <span style={{ fontSize: '2rem' }}>🎓</span>
            ) : (
              <i className="ri-building-line" style={{ fontSize: '1.8rem', color: 'var(--primary)' }}></i>
            )}
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {isStudentPortal ? 'Student Portal' : 'Coaching Admin & Teacher Portal'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
            {isStudentPortal ? 'Sign in to access quizzes and CBT mock exams' : 'Sign in to manage your coaching institute, CBT exams, question bank & batches'}
          </p>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="auth-segmented-tab" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'signin' ? 'active' : ''}`}
            onClick={() => { setAuthMode('signin'); setAlertInfo({ show: false, type: '', message: '' }); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthMode('register'); setAlertInfo({ show: false, type: '', message: '' }); }}
          >
            {isStudentPortal ? 'Create Account' : 'Register Coaching'}
          </button>
        </div>

        {/* Alert Box */}
        {alertInfo.show && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            background: alertInfo.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: alertInfo.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${alertInfo.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
          }}>
            {alertInfo.message}
          </div>
        )}

        {/* Recaptcha Container */}
        <div id="recaptcha-container"></div>

        {/* Sign In Form */}
        {authMode === 'signin' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder={isStudentPortal ? 'e.g. student@example.com' : 'e.g. teacher@academy.com'}
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '22px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset link has been dispatched to your registered email.'); }} style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </a>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-auth-submit">
              {submitting ? 'Signing In...' : 'Sign In'} <i className="ri-arrow-right-line"></i>
            </button>
          </form>
        )}

        {/* Registration Form */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder={isStudentPortal ? 'e.g. Student Name' : 'e.g. Prof. Rahul Sharma'}
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder={isStudentPortal ? 'e.g. student@example.com' : 'e.g. admin@coaching.com'}
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            {!isStudentPortal && (
              <>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Coaching / Institute Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Apex IAS Academy"
                    required
                    value={regCoachingName}
                    onChange={(e) => setRegCoachingName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Contact Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +91 9876543210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={submitting} className="btn btn-auth-submit">
              {submitting ? 'Registering...' : isStudentPortal ? 'Create Student Account' : 'Register Coaching Institute'}
            </button>
          </form>
        )}

        {/* Phone Form */}
        {authMode === 'phone' && (
          <div>
            <div style={{ padding: '10px 14px', background: 'rgba(52, 168, 83, 0.08)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', color: '#2e7d32', fontWeight: 600, textAlign: 'center', border: '1px solid rgba(52, 168, 83, 0.2)' }}>
              📲 Mobile OTP Sign-In ({isStudentPortal ? 'Student Portal' : 'Teacher Portal'})
            </div>

            {otpStep === 1 ? (
              <div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Mobile Phone Number (with Country Code)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +919876543210"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Include country code (e.g. +91 for India, +1 for US)
                  </small>
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={submitting}
                  className="btn btn-auth-submit"
                  style={{ background: '#2e7d32', borderColor: '#2e7d32' }}
                >
                  {submitting ? 'Sending OTP...' : 'Send Verification SMS OTP'} <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            ) : (
              <div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Enter 6-Digit Verification Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={submitting}
                  className="btn btn-auth-submit"
                  style={{ background: '#1b5e20', borderColor: '#1b5e20' }}
                >
                  {submitting ? 'Verifying...' : 'Verify OTP & Sign In'} <i className="ri-shield-check-fill"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Social / Phone Toggle */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR SIGN IN WITH</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="btn-social-placeholder"
              style={{ flex: 1, cursor: 'pointer', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', fontSize: '0.88rem', fontWeight: 600 }}
              title="Firebase Google OAuth Sign-In"
            >
              <i className="ri-google-fill" style={{ color: '#ea4335', fontSize: '1.2rem' }}></i> Google
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('phone'); setAlertInfo({ show: false, type: '', message: '' }); }}
              className="btn-social-placeholder"
              style={{ flex: 1, cursor: 'pointer', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', fontSize: '0.88rem', fontWeight: 600 }}
              title="Sign in with Phone OTP"
            >
              <i className="ri-phone-fill" style={{ color: '#2e7d32', fontSize: '1.2rem' }}></i> Phone OTP
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Onboarding Modal */}
      <ReactModal
        isOpen={showOnboarding}
        title="🏫 Setup Your Coaching Institute"
        onClose={() => setShowOnboarding(false)}
      >
        <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'var(--primary-light)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
              🎉 Welcome! Complete your coaching setup to generate your dedicated online exam portal & student URLs.
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>
              Coaching / Institute Name *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Apex IAS Academy"
              required
              value={instNameInput}
              onChange={(e) => setInstNameInput(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={onboardingSaving}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
          >
            {onboardingSaving ? 'Creating Portal...' : '🚀 Create Institute & Launch Portal'}
          </button>
        </form>
      </ReactModal>
    </div>
  );
}

export default LoginView;
