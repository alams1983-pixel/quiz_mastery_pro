import { getUser, setUser } from '../services/api.js';
import { ConsentManager } from '../services/ConsentManager.js';
import { openCookiePreferencesModal } from '../components/CookieConsentModal.js';
import { setupPasswordToggles } from '../services/passwordToggle.js';

export function renderStudentSettingsView(navigate) {
  const container = document.createElement('div');
  container.className = 'container page-view';
  container.style.maxWidth = '1400px';
  container.style.padding = '2rem 1rem';

  const user = getUser();
  if (!user) {
    navigate('login');
    return container;
  }

  container.innerHTML = `
    <!-- Page Header -->
    <div class="responsive-page-header">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
          ⚙️ Account Settings
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Manage your personal profile, change password, and view enrolled class & batch memberships.
        </p>
      </div>
      <button id="backToDashBtn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
        ← Back to Dashboard
      </button>
    </div>

    <!-- Layout Grid -->
    <div class="settings-grid">
      
      <!-- Left Column: Teacher Branding Links & Class Enrollments -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem; grid-column: span 1;">
        
        ${user && (user.role === 'institute_admin' || user.role === 'admin' || user.role === 'super_admin') ? `
          <!-- Teacher Portal Branding Settings Link Card -->
          <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--primary-light); border: 1px solid var(--primary-border); box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                🌐 Coaching Portal Branding
              </h3>
              <span class="badge" style="background: var(--primary); color: #ffffff; padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600; font-size: 0.75rem;">
                Teacher Admin
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.45;">
              Customize your student login portal, colors, logo, welcome messages, and copy your shareable student URLs.
            </p>
            <button id="goToCoachingBrandingBtn" class="btn btn-primary" style="width: 100%; padding: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">
              ✏️ Manage Portal Branding & URLs
            </button>
          </div>
        ` : ''}

        ${!user || user.role === 'user' ? `
          <!-- Institute Batches & Class Enrollments Card (Students Only) -->
          <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                📚 Class & Batch Memberships
              </h3>
              <span style="font-size: 0.8rem; background: var(--success-bg); color: var(--success); padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600; border: 1px solid var(--success-border);">
                Teacher Approval
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Join batches created by your coaching institute to gain access to batch-specific CBT exams and tests.
            </p>

            <div id="studentBatchesListContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
                Loading institute batches...
              </div>
            </div>
          </div>
        ` : ''}

      </div>

      <!-- Right Column: Profile Details & Security -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Profile Info Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            👤 Personal Profile
          </h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--text-muted);">Full Name</label>
              <div style="font-size: 1rem; font-weight: 600; color: var(--text-main); margin-top: 0.2rem;">${user.full_name || 'Student'}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--text-muted);">Email Address</label>
              <div style="font-size: 0.95rem; color: var(--text-main); margin-top: 0.2rem;">${user.email}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--text-muted);">Account Role</label>
              <div style="margin-top: 0.2rem;">
                <span class="badge" style="background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-border); padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem; text-transform: capitalize;">
                  ${(user.role || 'user').replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Change Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            🔒 Security & Password Management
          </h3>

          <form id="changePasswordForm">
            <div id="passwordAlert" style="display: none; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;"></div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Current Password</label>
              <input type="password" id="currentPasswordInput" class="form-control" placeholder="••••••••" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px;">
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">New Password</label>
              <input type="password" id="newPasswordInput" class="form-control" placeholder="At least 6 characters" minlength="6" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px;">
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Confirm New Password</label>
              <input type="password" id="confirmPasswordInput" class="form-control" placeholder="Repeat new password" minlength="6" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px;">
            </div>

            <button type="submit" id="savePasswordBtn" class="btn btn-primary" style="width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: 700;">
              Update Password
            </button>
          </form>
        </div>

        <!-- GDPR Privacy & Cookie Storage Settings Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); margin-top: 1.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            🛡️ Privacy & Cookie Storage Controls
          </h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.45;">
            Control your data privacy preferences under GDPR & ePrivacy regulations. View and manage optional storage categories (functional UI choices, performance metrics, and marketing tags).
          </p>

          <div style="background: var(--app-bg); padding: 12px 16px; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); display: block;">Consent Decision Status</span>
              <span id="consent-status-pill" style="font-size: 0.78rem; color: var(--primary); font-weight: 600;">
                ${ConsentManager.hasDecided() ? '✓ Preferences Configured' : '⚠️ Pending Decision'}
              </span>
            </div>
            <button id="btnOpenGdprSettings" class="btn btn-secondary" style="font-size: 0.85rem; padding: 6px 14px; border-radius: 6px; display: flex; align-items: center; gap: 6px;">
              <i class="ri-settings-4-line"></i> Manage Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach Event Listeners
  const backBtn = container.querySelector('#backToDashBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigate('dashboard'));
  }

  const btnManageGdpr = container.querySelector('#btnOpenGdprSettings');
  if (btnManageGdpr) {
    btnManageGdpr.addEventListener('click', () => {
      openCookiePreferencesModal();
    });
  }

  const goToBrandingBtn = container.querySelector('#goToCoachingBrandingBtn');
  if (goToBrandingBtn) {
    goToBrandingBtn.addEventListener('click', () => navigate('coaching-branding'));
  }

  // Load Batches for user's institute
  loadInstituteBatches(container, user);

  // Handle Password Change Form
  const passwordForm = container.querySelector('#changePasswordForm');
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPass = container.querySelector('#currentPasswordInput').value;
    const newPass = container.querySelector('#newPasswordInput').value;
    const confirmPass = container.querySelector('#confirmPasswordInput').value;
    const alertDiv = container.querySelector('#passwordAlert');
    const submitBtn = container.querySelector('#savePasswordBtn');

    if (newPass !== confirmPass) {
      alertDiv.style.display = 'block';
      alertDiv.style.background = 'var(--danger-bg)';
      alertDiv.style.color = 'var(--danger)';
      alertDiv.style.border = '1px solid var(--danger-border)';
      alertDiv.textContent = 'New password and confirmation password do not match.';
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Updating...';

      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass
        })
      });

      const data = await response.json();

      alertDiv.style.display = 'block';
      if (response.ok) {
        alertDiv.style.background = 'var(--success-bg)';
        alertDiv.style.color = 'var(--success)';
        alertDiv.style.border = '1px solid var(--success-border)';
        alertDiv.textContent = data.message || 'Password changed successfully.';
        passwordForm.reset();
      } else {
        alertDiv.style.background = 'var(--danger-bg)';
        alertDiv.style.color = 'var(--danger)';
        alertDiv.style.border = '1px solid var(--danger-border)';
        alertDiv.textContent = data.error || 'Failed to change password.';
      }
    } catch (err) {
      alertDiv.style.display = 'block';
      alertDiv.style.background = 'var(--danger-bg)';
      alertDiv.style.color = 'var(--danger)';
      alertDiv.style.border = '1px solid var(--danger-border)';
      alertDiv.textContent = 'Error connecting to server. Please try again.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Password';
    }
  });

  setupPasswordToggles(container);

  return container;
}

async function loadInstituteBatches(container, user) {
  const batchesContainer = container.querySelector('#studentBatchesListContainer');
  if (!batchesContainer) return;

  const token = localStorage.getItem('token');
  let instId = user ? user.institute_id : null;

  if (!instId) {
    try {
      const res = await fetch('/api/institutes/my-enrollments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enrollments && data.enrollments.length > 0) {
          instId = data.enrollments[0].id;
        }
      }
    } catch (e) { }
  }

  if (!instId) {
    batchesContainer.innerHTML = `
      <div style="text-align: center; padding: 1.2rem; background: var(--app-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-muted); border: 1px solid var(--border-color);">
        You are not enrolled in any coaching institute yet.
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`/api/institutes/${instId}/batches-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed loading batches');

    const data = await response.json();
    const batches = data.batches || [];

    if (batches.length === 0) {
      batchesContainer.innerHTML = `
        <div style="text-align: center; padding: 1.2rem; background: var(--app-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-muted); border: 1px solid var(--border-color);">
          No batches or classes created yet for your institute.
        </div>
      `;
      return;
    }

    batchesContainer.innerHTML = '';

    batches.forEach(b => {
      const card = document.createElement('div');
      card.style.cssText = `
        padding: 0.85rem 1rem;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      `;

      let statusBadge = '';
      let actionBtn = '';

      if (b.student_status === 'approved') {
        statusBadge = `<span style="font-size: 0.8rem; background: var(--success-bg); color: var(--success); padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700; border: 1px solid var(--success-border);">✅ Active Batch</span>`;
      } else if (b.student_status === 'pending') {
        statusBadge = `<span style="font-size: 0.8rem; background: rgba(245, 158, 11, 0.15); color: #d97706; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.35);">⏳ Pending Approval</span>`;
      } else if (b.student_status === 'rejected') {
        statusBadge = `<span style="font-size: 0.8rem; background: var(--danger-bg); color: var(--danger); padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700; border: 1px solid var(--danger-border);">❌ Request Rejected</span>`;
        actionBtn = `<button class="btn btn-outline btn-sm btn-reapply" data-id="${b.id}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">Re-Apply</button>`;
      } else {
        actionBtn = `<button class="btn btn-primary btn-sm btn-request-join" data-id="${b.id}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">Request to Join</button>`;
      }

      const batchName = b.batch_name || b.name || 'Unnamed Batch';
      const batchCode = b.batch_code || b.code || '';

      card.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">${batchName}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.1rem;">
            ${b.target_exam ? `Exam: ${b.target_exam}` : ''} ${batchCode ? `(Code: <code>${batchCode}</code>)` : ''}
          </div>
        </div>
        <div>
          ${statusBadge}
          ${actionBtn}
        </div>
      `;

      const reqBtn = card.querySelector('.btn-request-join') || card.querySelector('.btn-reapply');
      if (reqBtn) {
        reqBtn.addEventListener('click', async () => {
          try {
            reqBtn.disabled = true;
            reqBtn.textContent = 'Submitting...';
            const reqRes = await fetch('/api/institutes/batches/join-request', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ batch_id: b.id })
            });
            if (reqRes.ok) {
              loadInstituteBatches(container, user);
            } else {
              const errData = await reqRes.json();
              alert(errData.error || 'Failed to submit batch request.');
              reqBtn.disabled = false;
              reqBtn.textContent = 'Request to Join';
            }
          } catch (err) {
            alert('Error submitting request.');
            reqBtn.disabled = false;
            reqBtn.textContent = 'Request to Join';
          }
        });
      }

      batchesContainer.appendChild(card);
    });

  } catch (err) {
    batchesContainer.innerHTML = `
      <div style="color: var(--danger); font-size: 0.85rem; padding: 1rem; text-align: center; background: var(--danger-bg); border-radius: 8px; border: 1px solid var(--danger-border);">
        Failed loading institute batches.
      </div>
    `;
  }
}
