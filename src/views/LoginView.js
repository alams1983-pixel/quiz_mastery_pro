import { api, setToken, setUser } from '../services/api.js';

export function renderLoginView(navigate) {
  const container = document.createElement('div');
  container.className = 'view-container';
  container.style.maxWidth = '460px';
  container.style.margin = '40px auto';
  container.style.width = '100%';

  container.innerHTML = `
    <div style="text-align:center; margin-bottom: 24px;">
      <div style="font-size:3.5rem; margin-bottom:8px;">📘</div>
      <h1 style="font-size:2rem; font-weight:700;">Welcome to EdutorAI</h1>
      <p style="color:var(--text-muted); font-size:0.95rem;">Mastery & Active Repetition Quiz Portal</p>
    </div>

    <div style="display:flex; border-bottom: 2px solid var(--glass-border); margin-bottom: 20px;">
      <button id="tabLogin" class="nav-btn active" style="flex:1; border-radius:0; border-bottom: 3px solid var(--primary);">Login</button>
      <button id="tabRegister" class="nav-btn" style="flex:1; border-radius:0;">Register</button>
    </div>

    <!-- Login Form -->
    <form id="loginForm">
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" id="loginEmail" class="form-input" placeholder="e.g. student@example.com" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="loginPassword" class="form-input" placeholder="••••••••" required />
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <a href="#" id="forgotPassLink" style="font-size:0.85rem; color:var(--primary); text-decoration:none;">Forgot password?</a>
      </div>
      <button type="submit" class="btn" style="width:100%;">Sign In</button>
    </form>

    <!-- Register Form (Hidden by default) -->
    <form id="registerForm" style="display:none;">
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="regFullName" class="form-input" placeholder="e.g. Alice Smith" required />
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" id="regEmail" class="form-input" placeholder="e.g. alice@example.com" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="regPassword" class="form-input" placeholder="••••••••" required />
      </div>
      <button type="submit" class="btn" style="width:100%;">Create Account</button>
    </form>
  `;

  const tabLogin = container.querySelector('#tabLogin');
  const tabRegister = container.querySelector('#tabRegister');
  const loginForm = container.querySelector('#loginForm');
  const registerForm = container.querySelector('#registerForm');
  const forgotLink = container.querySelector('#forgotPassLink');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabLogin.style.borderBottom = '3px solid var(--primary)';
    tabRegister.classList.remove('active');
    tabRegister.style.borderBottom = 'none';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabRegister.style.borderBottom = '3px solid var(--primary)';
    tabLogin.classList.remove('active');
    tabLogin.style.borderBottom = 'none';
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const email = container.querySelector('#loginEmail').value;
      const password = container.querySelector('#loginPassword').value;
      const data = await api.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      navigate('dashboard');
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
      const data = await api.register({ full_name, email, password });
      setToken(data.token);
      setUser(data.user);
      navigate('dashboard');
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
