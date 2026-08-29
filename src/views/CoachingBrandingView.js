import { getUser } from '../services/api.js';

export function renderCoachingBrandingView(navigate) {
  const container = document.createElement('div');
  container.className = 'container page-view';
  container.style.maxWidth = '1050px';
  container.style.padding = '2rem 1rem';

  const user = getUser();
  if (!user || (user.role !== 'institute_admin' && user.role !== 'admin' && user.role !== 'super_admin')) {
    alert('Access denied. Coaching Institute Admin privileges required.');
    navigate('dashboard');
    return container;
  }

  container.innerHTML = `
    <!-- Header -->
    <div class="responsive-page-header">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-color, #111827); margin-bottom: 0.25rem;">
          🌐 Coaching Portal Branding & Customization
        </h1>
        <p style="color: var(--muted-text, #6b7280); font-size: 0.95rem;">
          Customize your student login portal, theme colors, and share your unique coaching URL with students.
        </p>
      </div>
      <button id="backToSettingsBtn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
        ← Back to Settings
      </button>
    </div>

    <!-- Main Grid -->
    <div class="settings-grid">
      
      <!-- Left Column: Shareable URLs & How it Works -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Shareable Links Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            🔗 Shareable Student Login URLs
          </h3>
          <p style="font-size: 0.85rem; color: var(--muted-text, #6b7280); margin-bottom: 1.25rem;">
            Share these unique URLs with your students so they can access your customized student login page.
          </p>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-color, #111827);">
              Subdomain URL (Recommended):
            </label>
            <div class="copy-url-group">
              <input type="text" id="branding-subdomain-url" class="form-input" readonly style="flex: 1; font-weight: 600; background: var(--bg-hover, #f3f4f6); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);" value="Loading...">
              <button type="button" id="btn-copy-subdomain" class="btn btn-primary" style="flex-shrink: 0; padding: 0.65rem 1rem;">Copy</button>
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-color, #111827);">
              Fallback Shareable Link:
            </label>
            <div class="copy-url-group">
              <input type="text" id="branding-fallback-url" class="form-input" readonly style="flex: 1; background: var(--bg-hover, #f3f4f6); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);" value="Loading...">
              <button type="button" id="btn-copy-fallback" class="btn btn-secondary" style="flex-shrink: 0; padding: 0.65rem 1rem;">Copy</button>
            </div>
          </div>

          <div style="padding: 1rem; background: rgba(79, 70, 229, 0.05); border-radius: 10px; border-left: 4px solid var(--primary-color, #4f46e5);">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary-color, #4f46e5); margin-bottom: 0.25rem;">💡 How Subdomains Work:</div>
            <p style="font-size: 0.82rem; color: var(--muted-text, #4b5563); margin: 0; line-height: 1.45;">
              When students open your unique URL, your custom logo, institute name, banner, and theme colors will load automatically on their login screen!
            </p>
          </div>
        </div>

        <!-- Portal Preview Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            👀 Live Branding Preview
          </h3>
          
          <div id="previewCard" style="padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color, #e5e7eb); background: var(--bg-card, #ffffff); text-align: center;">
            <div id="previewLogo" style="width: 50px; height: 50px; border-radius: 50%; background: #e0e7ff; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; overflow: hidden;">
              🎓
            </div>
            <h4 id="previewTitle" style="font-size: 1.1rem; font-weight: 800; color: var(--text-color, #111827); margin: 0 0 0.35rem 0;">
              Welcome to Your Institute
            </h4>
            <p id="previewSubtitle" style="font-size: 0.85rem; color: var(--muted-text, #6b7280); margin: 0 0 1rem 0;">
              Sign in to access your batch quizzes and study materials.
            </p>
            <button id="previewBtn" class="btn btn-primary" style="width: 100%; padding: 0.65rem; border-radius: 8px; font-weight: 600;">
              Sample Student Button
            </button>
          </div>
        </div>

      </div>

      <!-- Right Column: Portal Customization Form -->
      <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          🎨 Customize Portal Settings
        </h3>

        <form id="form-branding-page">
          <div id="brandingAlert" style="display: none; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;"></div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Institute Name *</label>
            <input type="text" id="brand-name" class="form-input" placeholder="e.g. Apex IAS Academy" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">URL Subdomain Slug *</label>
            <input type="text" id="brand-slug" class="form-input" placeholder="e.g. apex-academy" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            <small style="font-size: 0.75rem; color: var(--muted-text, #6b7280); display: block; margin-top: 0.25rem;">
              Unique subdomain prefix. Auto-slugified from institute name if blank.
            </small>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Institute Logo URL</label>
            <input type="url" id="brand-logo" class="form-input" placeholder="https://example.com/logo.png" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Primary Theme Color</label>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <input type="color" id="brand-color-picker" value="#4f46e5" style="width: 44px; height: 38px; border: none; border-radius: 6px; cursor: pointer;">
              <input type="text" id="brand-color" class="form-input" placeholder="#4f46e5" value="#4f46e5" style="flex: 1; font-family: monospace; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Login Welcome Heading</label>
            <input type="text" id="brand-title" class="form-input" placeholder="Welcome to Apex IAS Academy" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Login Subtitle / Description</label>
            <textarea id="brand-subtitle" class="form-input" rows="2" placeholder="Sign in to access your batch tests and practice quizzes." style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);"></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Login Banner Image URL (Optional)</label>
            <input type="url" id="brand-banner" class="form-input" placeholder="https://example.com/banner.jpg" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
          </div>

          <div style="padding: 1rem; background: var(--bg-hover, #f9fafb); border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border-color, #e5e7eb);">
            <label style="display: flex; align-items: center; gap: 0.75rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; color: var(--text-color, #111827);">
              <input type="checkbox" id="brand-allow-global" checked style="width: 18px; height: 18px;">
              Show Super Admin Global Public Quizzes
            </label>
            <small style="display: block; margin-top: 0.35rem; color: var(--muted-text, #6b7280); font-size: 0.78rem; line-height: 1.4;">
              When checked, students can attempt global public mock tests alongside institute tests. Uncheck to restrict students strictly to your coaching content.
            </small>
          </div>

          <button type="submit" id="btn-save-branding" class="btn btn-primary" style="width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: 700;">
            💾 Save Portal Branding
          </button>
        </form>
      </div>

    </div>
  `;

  // Attach Event Handlers
  const backBtn = container.querySelector('#backToSettingsBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigate('student-settings'));
  }

  // Copy Buttons
  const btnCopySub = container.querySelector('#btn-copy-subdomain');
  const btnCopyFallback = container.querySelector('#btn-copy-fallback');
  const subInput = container.querySelector('#branding-subdomain-url');
  const fallbackInput = container.querySelector('#branding-fallback-url');

  if (btnCopySub && subInput) {
    btnCopySub.addEventListener('click', () => {
      navigator.clipboard.writeText(subInput.value);
      btnCopySub.textContent = 'Copied! ✓';
      setTimeout(() => btnCopySub.textContent = 'Copy', 2000);
    });
  }

  if (btnCopyFallback && fallbackInput) {
    btnCopyFallback.addEventListener('click', () => {
      navigator.clipboard.writeText(fallbackInput.value);
      btnCopyFallback.textContent = 'Copied! ✓';
      setTimeout(() => btnCopyFallback.textContent = 'Copy', 2000);
    });
  }

  // Color picker sync & live preview
  const colorPicker = container.querySelector('#brand-color-picker');
  const colorInput = container.querySelector('#brand-color');
  const previewBtn = container.querySelector('#previewBtn');
  const previewLogo = container.querySelector('#previewLogo');
  const previewTitle = container.querySelector('#previewTitle');
  const previewSubtitle = container.querySelector('#previewSubtitle');
  const nameInput = container.querySelector('#brand-name');
  const titleInput = container.querySelector('#brand-title');
  const subtitleInput = container.querySelector('#brand-subtitle');
  const logoInput = container.querySelector('#brand-logo');

  const updatePreview = () => {
    const color = colorInput.value || '#4f46e5';
    previewBtn.style.backgroundColor = color;
    previewBtn.style.borderColor = color;

    const title = titleInput.value || nameInput.value || 'Welcome to Your Institute';
    previewTitle.textContent = title;

    const sub = subtitleInput.value || 'Sign in to access your batch quizzes and study materials.';
    previewSubtitle.textContent = sub;

    const logo = logoInput.value;
    if (logo) {
      previewLogo.innerHTML = `<img src="${logo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`;
    } else {
      previewLogo.innerHTML = '🎓';
    }
  };

  if (colorPicker && colorInput) {
    colorPicker.addEventListener('input', (e) => {
      colorInput.value = e.target.value;
      updatePreview();
    });
    colorInput.addEventListener('input', (e) => {
      colorPicker.value = e.target.value;
      updatePreview();
    });
  }

  [nameInput, titleInput, subtitleInput, logoInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updatePreview);
  });

  // Load Existing Branding Data
  loadBrandingData(container, user, updatePreview);

  // Form Submit
  const form = container.querySelector('#form-branding-page');
  const alertDiv = container.querySelector('#brandingAlert');
  const saveBtn = container.querySelector('#btn-save-branding');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      const token = localStorage.getItem('token');

      const payload = {
        name: container.querySelector('#brand-name').value,
        slug: container.querySelector('#brand-slug').value,
        logo_url: container.querySelector('#brand-logo').value,
        primary_color: container.querySelector('#brand-color').value,
        welcome_title: container.querySelector('#brand-title').value,
        welcome_subtitle: container.querySelector('#brand-subtitle').value,
        banner_url: container.querySelector('#brand-banner').value,
        allow_global_content: container.querySelector('#brand-allow-global').checked
      };

      const response = await fetch('/api/institutes/my-branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      alertDiv.style.display = 'block';

      if (!response.ok) {
        alertDiv.style.background = '#fef2f2';
        alertDiv.style.color = '#991b1b';
        alertDiv.textContent = data.error || 'Failed to update portal branding.';
      } else {
        alertDiv.style.background = '#ecfdf5';
        alertDiv.style.color = '#065f46';
        alertDiv.textContent = '✅ Portal branding updated successfully!';
        if (data.institute) {
          container.querySelector('#brand-slug').value = data.institute.slug;
          const origin = window.location.origin;
          const port = window.location.port ? `:${window.location.port}` : '';
          const slugOrCode = data.institute.slug || data.institute.code;
          if (subInput) subInput.value = `http://${slugOrCode}.localhost${port}`;
          if (fallbackInput) fallbackInput.value = `${origin}/?institute=${slugOrCode}`;
        }
      }
    } catch (err) {
      alertDiv.style.display = 'block';
      alertDiv.style.background = '#fef2f2';
      alertDiv.style.color = '#991b1b';
      alertDiv.textContent = 'Network error updating portal branding.';
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Portal Branding';
    }
  });

  return container;
}

async function loadBrandingData(container, user, updatePreview) {
  const token = localStorage.getItem('token');
  const instId = user.institute_id;
  if (!instId) return;

  try {
    const response = await fetch(`/api/institutes/${instId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return;

    const data = await response.json();
    const inst = data.institute;
    if (!inst) return;

    const origin = window.location.origin;
    const port = window.location.port ? `:${window.location.port}` : '';
    const slugOrCode = inst.slug || inst.code;

    const subInput = container.querySelector('#branding-subdomain-url');
    const fallbackInput = container.querySelector('#branding-fallback-url');
    if (subInput) subInput.value = `http://${slugOrCode}.localhost${port}`;
    if (fallbackInput) fallbackInput.value = `${origin}/?institute=${slugOrCode}`;

    container.querySelector('#brand-name').value = inst.name || '';
    container.querySelector('#brand-slug').value = inst.slug || '';
    container.querySelector('#brand-logo').value = inst.logo_url || '';
    container.querySelector('#brand-color').value = inst.primary_color || '#4f46e5';
    container.querySelector('#brand-color-picker').value = inst.primary_color || '#4f46e5';
    container.querySelector('#brand-title').value = inst.welcome_title || '';
    container.querySelector('#brand-subtitle').value = inst.welcome_subtitle || '';
    container.querySelector('#brand-banner').value = inst.banner_url || '';
    container.querySelector('#brand-allow-global').checked = inst.allow_global_content !== 0;

    updatePreview();
  } catch (err) {
    console.error('Error loading branding data:', err);
  }
}
