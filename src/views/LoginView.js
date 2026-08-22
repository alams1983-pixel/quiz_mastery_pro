import { api, setToken, setUser } from '../services/api.js';

export function renderLoginView(navigate) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.minHeight = 'calc(100vh - 120px)';
  container.style.padding = '20px 16px';

  container.innerHTML = `
    <div class="auth-card">
      <!-- Header / Logo -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="auth-logo-badge">
          <i class="ri-book-open-line"></i>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; margin-bottom: 4px;">
          Welcome to EdutorAI
        </h1>
        <p style="color: var(--text-muted); font-size: 0.9rem; font-weight: 500;">
          Multi-Tenant Quiz & SSC Exam SaaS Portal
        </p>
      </div>

      <!-- Segmented Tab Switcher (Sign In vs Register) -->
      <div class="auth-segmented-tab">
        <button id="tabLogin" class="auth-tab-btn active">Sign In</button>
        <button id="tabRegister" class="auth-tab-btn">Create Account</button>
      </div>

      <!-- Login Form -->
      <form id="loginForm">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Email Address</label>
          <input type="email" id="loginEmail" class="form-control" placeholder="e.g. student@example.com" required />
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
        <button type="submit" class="btn btn-auth-submit">
          Sign In <i class="ri-arrow-right-line"></i>
        </button>
      </form>

      <!-- Register Form (Hidden by default) -->
      <form id="registerForm" style="display: none;">
        <!-- Account Type Selector (Student vs Teacher/Coaching) -->
        <div style="margin-bottom: 18px;">
          <label class="form-label" style="display: block; margin-bottom: 6px;">I am registering as: *</label>
          <div style="display: flex; gap: 8px; background: var(--bg-color); padding: 4px; border-radius: 10px; border: 1px solid var(--border-color);">
            <button type="button" id="role-type-student" class="role-type-btn active" style="flex: 1; padding: 8px; border-radius: 8px; border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer; background: var(--card-bg); color: var(--primary); box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
              🎓 Student
            </button>
            <button type="button" id="role-type-teacher" class="role-type-btn" style="flex: 1; padding: 8px; border-radius: 8px; border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer; background: transparent; color: var(--text-muted);">
              🏫 Teacher / Coaching Owner
            </button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Full Name *</label>
          <input type="text" id="regFullName" class="form-control" placeholder="e.g. Alice Smith" required />
        </div>
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Email Address *</label>
          <input type="email" id="regEmail" class="form-control" placeholder="e.g. alice@example.com" required />
        </div>
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Password *</label>
          <input type="password" id="regPassword" class="form-control" placeholder="••••••••" required />
        </div>

        <!-- Student Specific Field -->
        <div id="field-student-code" class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">Institute Code (Optional)</label>
          <input type="text" id="regInstCode" class="form-control" placeholder="e.g. EDU-A8F1 (If joining coaching)" />
          <small style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: block;">
            Enter code provided by your coaching institute to auto-link your account.
          </small>
        </div>

        <!-- Teacher / Coaching Specific Fields (Hidden by default) -->
        <div id="fields-teacher" style="display: none;">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Coaching / Institute Name *</label>
            <input type="text" id="regCoachingName" class="form-control" placeholder="e.g. Apex IAS Academy" />
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label">Contact Phone Number (Optional)</label>
            <input type="tel" id="regPhone" class="form-control" placeholder="e.g. +91 9876543210" />
          </div>
        </div>

        <button type="submit" id="btn-reg-submit" class="btn btn-auth-submit">
          Create Student Account <i class="ri-user-add-line"></i>
        </button>
      </form>

      <!-- Phase 5 Social Auth Placeholders -->
      <div style="margin-top: 28px; text-align: center;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
          <hr style="flex: 1; border: none; border-top: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">OR SIGN IN WITH</span>
          <hr style="flex: 1; border: none; border-top: 1px solid var(--border-color);">
        </div>

        <div style="display: flex; gap: 12px;">
          <button type="button" class="btn-social-placeholder" title="Firebase Google Authentication coming in Phase 5" onclick="alert('Google Sign-In will be activated in Phase 5 authentication module!')">
            <i class="ri-google-fill" style="color: #ea4335; font-size: 1.1rem;"></i> Google <span class="badge-phase">Phase 5</span>
          </button>
          <button type="button" class="btn-social-placeholder" title="Phone OTP Authentication coming in Phase 5" onclick="alert('Phone OTP Sign-In will be activated in Phase 5 authentication module!')">
            <i class="ri-phone-line" style="color: #34a853; font-size: 1.1rem;"></i> Phone OTP <span class="badge-phase">Phase 5</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const tabLogin = container.querySelector('#tabLogin');
  const tabRegister = container.querySelector('#tabRegister');
  const loginForm = container.querySelector('#loginForm');
  const registerForm = container.querySelector('#registerForm');
  const forgotLink = container.querySelector('#forgotPassLink');

  let selectedAccountType = 'student'; // 'student' or 'teacher'

  const btnRoleStudent = container.querySelector('#role-type-student');
  const btnRoleTeacher = container.querySelector('#role-type-teacher');
  const fieldStudentCode = container.querySelector('#field-student-code');
  const fieldsTeacher = container.querySelector('#fields-teacher');
  const regCoachingInput = container.querySelector('#regCoachingName');
  const btnRegSubmit = container.querySelector('#btn-reg-submit');

  btnRoleStudent.addEventListener('click', () => {
    selectedAccountType = 'student';
    btnRoleStudent.style.background = 'var(--card-bg)';
    btnRoleStudent.style.color = 'var(--primary)';
    btnRoleStudent.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
    btnRoleTeacher.style.background = 'transparent';
    btnRoleTeacher.style.color = 'var(--text-muted)';
    btnRoleTeacher.style.boxShadow = 'none';

    fieldStudentCode.style.display = 'block';
    fieldsTeacher.style.display = 'none';
    regCoachingInput.required = false;
    btnRegSubmit.innerHTML = 'Create Student Account <i class="ri-user-add-line"></i>';
  });

  btnRoleTeacher.addEventListener('click', () => {
    selectedAccountType = 'teacher';
    btnRoleTeacher.style.background = 'var(--card-bg)';
    btnRoleTeacher.style.color = 'var(--primary)';
    btnRoleTeacher.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
    btnRoleStudent.style.background = 'transparent';
    btnRoleStudent.style.color = 'var(--text-muted)';
    btnRoleStudent.style.boxShadow = 'none';

    fieldStudentCode.style.display = 'none';
    fieldsTeacher.style.display = 'block';
    regCoachingInput.required = true;
    btnRegSubmit.innerHTML = 'Register Coaching Institute <i class="ri-building-line"></i>';
  });

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  });

  const redirectUserByRole = (user) => {
    if (user.role === 'super_admin') {
      navigate('super-admin');
    } else if (user.role === 'institute_admin') {
      navigate('institute-admin');
    } else {
      navigate('dashboard');
    }
  };

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const email = container.querySelector('#loginEmail').value;
      const password = container.querySelector('#loginPassword').value;
      const data = await api.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      redirectUserByRole(data.user);
    } catch (err) {
      alert(err.message);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const full_name = container.querySelector('#regFullName').value;
      const email = container.querySelector('#regEmail').value;
      const password = container.querySelector('#regPassword').value;
      const institute_code = container.querySelector('#regInstCode').value;
      const coaching_name = container.querySelector('#regCoachingName').value;
      const phone_number = container.querySelector('#regPhone').value;

      const payload = {
        full_name,
        email,
        password,
        account_type: selectedAccountType,
        institute_code,
        coaching_name,
        phone_number
      };

      const data = await api.register(payload);
      setToken(data.token);
      setUser(data.user);
      redirectUserByRole(data.user);
    } catch (err) {
      alert(err.message);
    }
  });

  forgotLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt('Enter your registered email address for password reset:');
    if (!email) return;
    try {
      const res = await api.forgotPassword({ email });
      alert(res.message + (res.resetToken ? `\n(Mock Reset Token: ${res.resetToken})` : ''));
    } catch (err) {
      alert(err.message);
    }
  });

  return container;
}
