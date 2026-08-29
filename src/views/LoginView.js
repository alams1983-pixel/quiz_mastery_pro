import { api, setToken, setUser } from '../services/api.js';
import { getTenantFromURL, fetchTenantBranding, applyTenantTheme } from '../services/tenant.js';
import { renderEnrollmentModal } from '../components/EnrollmentModal.js';
import {
  loginWithEmailPassword,
  registerWithEmailPassword,
  loginWithGoogle,
  setupRecaptcha,
  sendPhoneOtp,
  confirmPhoneOtp
} from '../services/firebaseClient.js';

export function renderLoginView(navigate, activeTenantBranding = null) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.minHeight = '100vh';
  container.style.boxSizing = 'border-box';
  container.style.padding = '20px 16px';

  // Determine if URL or active context belongs to a dedicated Coaching Student Portal
  const urlSlug = getTenantFromURL();
  const isStudentPortal = !!(activeTenantBranding || urlSlug);

  // State
  let currentBranding = activeTenantBranding;
  let selectedAccountType = isStudentPortal ? 'student' : 'teacher'; // Locked by portal context
  let phoneConfirmationResult = null;

  container.innerHTML = `
    <div class="auth-card" style="max-width: 480px; width: 100%;">
      <!-- Header / Logo -->
      <div id="authHeader" style="text-align: center; margin-bottom: 24px;">
        <div id="authLogoWrapper" class="auth-logo-badge" style="margin: 0 auto 12px;">
          ${isStudentPortal ? '<span style="font-size: 2rem;">🎓</span>' : '<i class="ri-building-line" style="font-size: 1.8rem; color: var(--primary);"></i>'}
        </div>
        <h1 id="authTitle" style="font-size: 1.65rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; margin-bottom: 6px;">
          ${isStudentPortal ? 'Student Portal' : 'Coaching Admin & Teacher Portal'}
        </h1>
        <p id="authSubtitle" style="color: var(--text-muted); font-size: 0.88rem; font-weight: 500; margin: 0; line-height: 1.4;">
          ${isStudentPortal ? 'Sign in to access quizzes and CBT mock exams' : 'Sign in to manage your coaching institute, CBT exams, question bank & batches'}
        </p>
      </div>

      <!-- Segmented Tab Switcher -->
      <div class="auth-segmented-tab" style="margin-bottom: 20px;">
        <button id="tabLogin" class="auth-tab-btn active">Sign In</button>
        <button id="tabRegister" class="auth-tab-btn">${isStudentPortal ? 'Create Account' : 'Register Coaching'}</button>
      </div>

      <!-- Invisible Recaptcha Container for Firebase Phone Auth -->
      <div id="recaptcha-container"></div>

      <!-- Email/Password Login Form -->
      <form id="loginForm">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Email Address</label>
          <input type="email" id="loginEmail" class="form-control" placeholder="${isStudentPortal ? 'e.g. student@example.com' : 'e.g. teacher@academy.com'}" required />
        </div>
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Password</label>
          <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required />
        </div>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 22px;">
          <a href="#" id="forgotPassLink" style="font-size: 0.85rem; color: var(--primary); text-decoration: none; font-weight: 600;">
            Forgot password?
          </a>
        </div>
        <button type="submit" id="loginSubmitBtn" class="btn btn-auth-submit">
          Sign In <i class="ri-arrow-right-line"></i>
        </button>
      </form>

      <!-- Registration Form (Isolated per Portal Context) -->
      <form id="registerForm" style="display: none;">
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Full Name *</label>
          <input type="text" id="regFullName" class="form-control" placeholder="${isStudentPortal ? 'e.g. Student Name' : 'e.g. Prof. Rahul Sharma'}" required />
        </div>
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Email Address *</label>
          <input type="email" id="regEmail" class="form-control" placeholder="${isStudentPortal ? 'e.g. student@example.com' : 'e.g. admin@coaching.com'}" required />
        </div>
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Password *</label>
          <input type="password" id="regPassword" class="form-control" placeholder="••••••••" required />
        </div>

        ${!isStudentPortal ? `
          <!-- Teacher / Coaching Registration Fields -->
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Coaching / Institute Name *</label>
            <input type="text" id="regCoachingName" class="form-control" placeholder="e.g. Apex IAS Academy" required />
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label">Contact Phone Number (Optional)</label>
            <input type="tel" id="regPhone" class="form-control" placeholder="e.g. +91 9876543210" />
          </div>
        ` : ''}

        <button type="submit" id="btn-reg-submit" class="btn btn-auth-submit">
          ${isStudentPortal ? 'Create Student Account <i class="ri-user-add-line"></i>' : 'Register Coaching Institute <i class="ri-building-line"></i>'}
        </button>
      </form>

      <!-- Phone OTP Form (Hidden by default) -->
      <form id="phoneForm" style="display: none;">
        <div style="padding: 10px 14px; background: rgba(52, 168, 83, 0.08); border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem; color: #2e7d32; font-weight: 600; text-align: center; border: 1px solid rgba(52, 168, 83, 0.2);">
          📲 Mobile OTP Sign-In (${isStudentPortal ? 'Student Portal' : 'Teacher Portal'})
        </div>

        <div id="phoneStep1">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Mobile Phone Number (with Country Code)</label>
            <input type="tel" id="phoneInput" class="form-control" placeholder="e.g. +919876543210" required />
            <small style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">Include country code (e.g. +91 for India, +1 for US)</small>
          </div>
          <button type="button" id="btnSendOtp" class="btn btn-auth-submit" style="background: #2e7d32; border-color: #2e7d32;">
            Send Verification SMS OTP <i class="ri-send-plane-fill"></i>
          </button>
        </div>

        <div id="phoneStep2" style="display: none;">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Enter 6-Digit Verification Code</label>
            <input type="text" id="otpInput" class="form-control" placeholder="e.g. 123456" maxlength="6" />
          </div>
          <button type="button" id="btnVerifyOtp" class="btn btn-auth-submit" style="background: #1b5e20; border-color: #1b5e20;">
            Verify OTP & Sign In <i class="ri-shield-check-fill"></i>
          </button>
        </div>
      </form>

      <!-- Alternative Social & Phone Sign-In -->
      <div style="margin-top: 24px; text-align: center;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <hr style="flex: 1; border: none; border-top: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">OR SIGN IN WITH</span>
          <hr style="flex: 1; border: none; border-top: 1px solid var(--border-color);">
        </div>

        <div style="display: flex; gap: 10px;">
          <button type="button" id="btnGoogleAuth" class="btn-social-placeholder" style="flex: 1; cursor: pointer; justify-content: center; display: flex; align-items: center; gap: 6px; padding: 10px 14px; font-size: 0.88rem; font-weight: 600;" title="Firebase Google OAuth Sign-In">
            <i class="ri-google-fill" style="color: #ea4335; font-size: 1.2rem;"></i> Google
          </button>
          <button type="button" id="btnTogglePhoneMode" class="btn-social-placeholder" style="flex: 1; cursor: pointer; justify-content: center; display: flex; align-items: center; gap: 6px; padding: 10px 14px; font-size: 0.88rem; font-weight: 600;" title="Sign in with Phone OTP">
            <i class="ri-phone-fill" style="color: #2e7d32; font-size: 1.2rem;"></i> Phone OTP
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const tabLogin = container.querySelector('#tabLogin');
  const tabRegister = container.querySelector('#tabRegister');
  const loginForm = container.querySelector('#loginForm');
  const registerForm = container.querySelector('#registerForm');
  const phoneForm = container.querySelector('#phoneForm');
  const forgotLink = container.querySelector('#forgotPassLink');

  const btnGoogleAuth = container.querySelector('#btnGoogleAuth');
  const btnTogglePhoneMode = container.querySelector('#btnTogglePhoneMode');
  const btnSendOtp = container.querySelector('#btnSendOtp');
  const btnVerifyOtp = container.querySelector('#btnVerifyOtp');
  const phoneStep1 = container.querySelector('#phoneStep1');
  const phoneStep2 = container.querySelector('#phoneStep2');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    phoneForm.style.display = 'none';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    phoneForm.style.display = 'none';
  });

  if (btnTogglePhoneMode) {
    btnTogglePhoneMode.addEventListener('click', () => {
      tabLogin.classList.remove('active');
      tabRegister.classList.remove('active');
      phoneForm.style.display = 'block';
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
    });
  }

  const redirectUserByRole = (user) => {
    if (user.role === 'super_admin') {
      navigate('super-admin');
    } else if (user.role === 'institute_admin') {
      navigate('institute-admin');
    } else {
      navigate('dashboard');
    }
  };

  const handleLoginResponse = (data) => {
    if (data.requires_enrollment_confirmation) {
      renderEnrollmentModal({
        previousInstituteName: data.previous_institute_name,
        targetInstitute: data.target_institute,
        onConfirm: async () => {
          const token = localStorage.getItem('token');
          await fetch('/api/institutes/enroll', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ institute_id: data.target_institute.id })
          });
          window.location.reload();
        },
        onCancel: () => {}
      });
      return;
    }

    setToken(data.token);
    setUser(data.user);

    redirectUserByRole(data.user);
  };

  // Check URL tenant context asynchronously
  const checkTenant = async () => {
    const slug = getTenantFromURL();
    if (slug) {
      const branding = await fetchTenantBranding(slug);
      if (branding) {
        currentBranding = branding;
        applyTenantTheme(branding);

        const logoWrapper = container.querySelector('#authLogoWrapper');
        const authTitle = container.querySelector('#authTitle');
        const authSubtitle = container.querySelector('#authSubtitle');

        if (branding.logo_url) {
          logoWrapper.innerHTML = `<img src="${branding.logo_url}" alt="${branding.name}" style="width: 54px; height: 54px; object-fit: contain; border-radius: 50%;">`;
        } else {
          logoWrapper.innerHTML = `<span style="font-size: 2rem;">🎓</span>`;
        }

        authTitle.textContent = branding.welcome_title || `Welcome to ${branding.name}`;
        authSubtitle.textContent = branding.welcome_subtitle || `Sign in to access quizzes and study materials for ${branding.name}`;

        const roleSelector = container.querySelector('#roleSelectorContainer');
        const studentNotice = container.querySelector('#studentPortalNotice');
        const studentCodeField = container.querySelector('#field-student-code');

        if (roleSelector) roleSelector.style.display = 'none';
        if (studentCodeField) studentCodeField.style.display = 'none';
        if (studentNotice) {
          studentNotice.style.display = 'block';
          studentNotice.textContent = `🎓 Student Account Registration for ${branding.name}`;
        }
        selectedAccountType = 'student';
      }
    }
  };
  checkTenant();

  // Handle Firebase / Local Email Password Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = container.querySelector('#loginSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const email = container.querySelector('#loginEmail').value.trim();
      const password = container.querySelector('#loginPassword').value;
      const tenantSlug = currentBranding ? (currentBranding.slug || currentBranding.code) : getTenantFromURL();

      let authData = null;

      // Step 1: Try Firebase Email/Password Auth
      try {
        const { idToken } = await loginWithEmailPassword(email, password);
        authData = await api.firebaseLogin({
          idToken,
          institute_slug: tenantSlug
        });
      } catch (fbErr) {
        console.warn('Firebase Login attempt fallback:', fbErr.message);
        // Step 2: Fallback to local auth if Firebase account not created yet or credentials not active
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, institute_slug: tenantSlug })
        });
        authData = await response.json();
        if (!response.ok) {
          throw new Error(authData.error || 'Login failed.');
        }
      }

      handleLoginResponse(authData);
    } catch (err) {
      alert(err.message || 'Error signing in.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In <i class="ri-arrow-right-line"></i>';
    }
  });

  // Handle Firebase / Local Register Submit
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = container.querySelector('#btn-reg-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const full_name = container.querySelector('#regFullName').value.trim();
      const email = container.querySelector('#regEmail').value.trim();
      const password = container.querySelector('#regPassword').value;
      const regCodeEl = container.querySelector('#regInstCode');
      const regCoachingEl = container.querySelector('#regCoachingName');
      const regPhoneEl = container.querySelector('#regPhone');

      const institute_code = regCodeEl ? regCodeEl.value : '';
      const coaching_name = regCoachingEl ? regCoachingEl.value : '';
      const phone_number = regPhoneEl ? regPhoneEl.value : '';
      const tenantSlug = currentBranding ? (currentBranding.slug || currentBranding.code) : getTenantFromURL();

      let authData = null;

      // Try Firebase Registration
      try {
        const { idToken } = await registerWithEmailPassword(email, password);
        authData = await api.firebaseLogin({
          idToken,
          full_name,
          account_type: selectedAccountType,
          coaching_name,
          phone_number,
          institute_code,
          institute_slug: tenantSlug
        });
      } catch (fbErr) {
        console.warn('Firebase Register attempt fallback:', fbErr.message);
        const payload = {
          full_name,
          email,
          password,
          account_type: selectedAccountType,
          institute_code,
          institute_slug: tenantSlug,
          coaching_name,
          phone_number
        };
        authData = await api.register(payload);
      }

      handleLoginResponse(authData);
    } catch (err) {
      alert(err.message || 'Registration failed.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = selectedAccountType === 'teacher' 
        ? 'Register Coaching Institute <i class="ri-building-line"></i>' 
        : 'Create Student Account <i class="ri-user-add-line"></i>';
    }
  });

  // Google OAuth Sign In Button
  if (btnGoogleAuth) {
    btnGoogleAuth.addEventListener('click', async () => {
      btnGoogleAuth.disabled = true;
      btnGoogleAuth.innerHTML = '<i class="ri-loader-4-line spin"></i> Authenticating with Google...';
      try {
        const { idToken } = await loginWithGoogle();
        const tenantSlug = currentBranding ? (currentBranding.slug || currentBranding.code) : getTenantFromURL();
        const authData = await api.firebaseLogin({
          idToken,
          account_type: selectedAccountType,
          institute_slug: tenantSlug
        });
        handleLoginResponse(authData);
      } catch (err) {
        alert(err.message || 'Google Sign-In failed.');
      } finally {
        btnGoogleAuth.disabled = false;
        btnGoogleAuth.innerHTML = '<i class="ri-google-fill" style="color: #ea4335; font-size: 1.2rem;"></i> Sign in with Google';
      }
    });
  }

  // Phone OTP Flow: Send Verification Code
  if (btnSendOtp) {
    btnSendOtp.addEventListener('click', async () => {
      const phoneVal = container.querySelector('#phoneInput').value.trim();
      if (!phoneVal) {
        alert('Please enter a valid phone number including country code (e.g. +919876543210)');
        return;
      }

      btnSendOtp.disabled = true;
      btnSendOtp.textContent = 'Sending SMS...';

      try {
        const appVerifier = setupRecaptcha('recaptcha-container');
        phoneConfirmationResult = await sendPhoneOtp(phoneVal, appVerifier);
        phoneStep1.style.display = 'none';
        phoneStep2.style.display = 'block';
        alert(`Verification OTP sent successfully to ${phoneVal}!`);
      } catch (err) {
        alert('Failed to send OTP: ' + (err.message || 'Check phone number format and country code.'));
      } finally {
        btnSendOtp.disabled = false;
        btnSendOtp.innerHTML = 'Send Verification SMS OTP <i class="ri-send-plane-fill"></i>';
      }
    });
  }

  // Phone OTP Flow: Confirm Code
  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', async () => {
      const otpCode = container.querySelector('#otpInput').value.trim();
      const phoneVal = container.querySelector('#phoneInput').value.trim();
      if (!otpCode || otpCode.length < 6) {
        alert('Please enter the 6-digit verification code received on your mobile.');
        return;
      }

      if (!phoneConfirmationResult) {
        alert('OTP session expired. Please request a new OTP code.');
        return;
      }

      btnVerifyOtp.disabled = true;
      btnVerifyOtp.textContent = 'Verifying OTP...';

      try {
        const { idToken } = await confirmPhoneOtp(phoneConfirmationResult, otpCode);
        const tenantSlug = currentBranding ? (currentBranding.slug || currentBranding.code) : getTenantFromURL();

        const authData = await api.firebaseLogin({
          idToken,
          phone_number: phoneVal,
          account_type: selectedAccountType,
          institute_slug: tenantSlug
        });

        handleLoginResponse(authData);
      } catch (err) {
        alert('OTP Verification Failed: ' + (err.message || 'Incorrect code.'));
      } finally {
        btnVerifyOtp.disabled = false;
        btnVerifyOtp.innerHTML = 'Verify OTP & Sign In <i class="ri-shield-check-fill"></i>';
      }
    });
  }

  forgotLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt('Enter your registered email address for password reset:');
    if (!email) return;
    try {
      const res = await api.forgotPassword({ email });
      alert(res.message);
    } catch (err) {
      alert(err.message);
    }
  });

  return container;
}

