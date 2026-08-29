import { getUser, setUser } from '../services/api.js';
import { getActiveInstitute, setActiveInstitute } from '../services/tenant.js';

export function renderStudentSettingsView(navigate) {
  const container = document.createElement('div');
  container.className = 'container page-view';
  container.style.maxWidth = '1000px';
  container.style.padding = '2rem 1rem';

  const user = getUser();
  if (!user) {
    navigate('login');
    return container;
  }

  const activeInst = getActiveInstitute();

  container.innerHTML = `
    <!-- Page Header -->
    <div class="responsive-page-header">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-color, #111827); margin-bottom: 0.25rem;">
          ⚙️ Account Settings & Learning Portals
        </h1>
        <p style="color: var(--muted-text, #6b7280); font-size: 0.95rem;">
          Manage your personal profile, change password, and switch active coaching portals.
        </p>
      </div>
      <button id="backToDashBtn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
        ← Back to Dashboard
      </button>
    </div>

    <!-- Layout Grid -->
    <div class="settings-grid">
      
      <!-- Left Column: Enrolled Institutes & Teacher Branding Links -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem; grid-column: span 1;">
        
        ${user && (user.role === 'institute_admin' || user.role === 'admin' || user.role === 'super_admin') ? `
          <!-- Teacher Portal Branding Settings Link Card -->
          <div class="card" style="padding: 1.5rem; border-radius: 12px; background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.1) 100%); border: 1.5 solid rgba(79, 70, 229, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                🌐 Coaching Portal Branding
              </h3>
              <span class="badge" style="background: var(--primary-color, #4f46e5); color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600; font-size: 0.75rem;">
                Teacher Admin
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--muted-text, #4b5563); margin-bottom: 1.25rem; line-height: 1.45;">
              Customize your student login portal, colors, logo, welcome messages, and copy your shareable student URLs.
            </p>
            <button id="goToCoachingBrandingBtn" class="btn btn-primary" style="width: 100%; padding: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">
              ✏️ Manage Portal Branding & URLs
            </button>
          </div>
        ` : ''}

        <!-- Enrolled Institutes Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              🏫 My Coaching Institutes
            </h3>
            <span style="font-size: 0.8rem; background: rgba(79, 70, 229, 0.1); color: var(--primary-color, #4f46e5); padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600;">
              Portal Switcher
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--muted-text, #6b7280); margin-bottom: 1.25rem;">
            Select which coaching portal you want to view active content and quizzes for.
          </p>

          <div id="institutesListContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="text-align: center; padding: 1.5rem; color: var(--muted-text, #9ca3af);">
              Loading enrolled institutes...
            </div>
          </div>
        </div>

        <!-- Institute Batches & Class Enrollments Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              📚 Class & Batch Memberships
            </h3>
            <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.1); color: #059669; padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600;">
              Teacher Approval
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--muted-text, #6b7280); margin-bottom: 1.25rem;">
            Join batches created by your active coaching institute to gain access to batch-specific CBT exams and tests.
          </p>

          <div id="studentBatchesListContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="text-align: center; padding: 1.5rem; color: var(--muted-text, #9ca3af);">
              Loading institute batches...
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Profile Details & Security -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Profile Info Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            👤 Personal Profile
          </h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted-text, #6b7280);">Full Name</label>
              <div style="font-size: 1rem; font-weight: 600; color: var(--text-color, #111827); margin-top: 0.2rem;">${user.full_name || 'Student'}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted-text, #6b7280);">Email Address</label>
              <div style="font-size: 0.95rem; color: var(--text-color, #111827); margin-top: 0.2rem;">${user.email}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted-text, #6b7280);">Account Role</label>
              <div style="margin-top: 0.2rem;">
                <span class="badge" style="background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; text-transform: capitalize;">
                  ${(user.role || 'user').replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Change Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            🔒 Security & Password Management
          </h3>

          <form id="changePasswordForm">
            <div id="passwordAlert" style="display: none; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;"></div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Current Password</label>
              <input type="password" id="currentPasswordInput" class="form-input" placeholder="••••••••" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">New Password</label>
              <input type="password" id="newPasswordInput" class="form-input" placeholder="At least 6 characters" minlength="6" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Confirm New Password</label>
              <input type="password" id="confirmPasswordInput" class="form-input" placeholder="Repeat new password" minlength="6" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            </div>

            <button type="submit" id="savePasswordBtn" class="btn btn-primary" style="width: 100%; padding: 0.75rem; border-radius: 8px;">
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  `;

  // Attach Event Listeners
  const backBtn = container.querySelector('#backToDashBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigate('dashboard'));
  }

  const goToBrandingBtn = container.querySelector('#goToCoachingBrandingBtn');
  if (goToBrandingBtn) {
    goToBrandingBtn.addEventListener('click', () => navigate('coaching-branding'));
  }

  // Load Enrolled Institutes & Batches
  loadEnrolledInstitutes(container, activeInst);
  loadInstituteBatches(container, activeInst);

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
      alertDiv.style.background = '#fef2f2';
      alertDiv.style.color = '#991b1b';
      alertDiv.textContent = 'New passwords do not match.';
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Updating...';
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ current_password: currentPass, new_password: newPass })
      });

      const data = await response.json();
      alertDiv.style.display = 'block';

      if (!response.ok) {
        alertDiv.style.background = '#fef2f2';
        alertDiv.style.color = '#991b1b';
        alertDiv.textContent = data.error || 'Failed to update password.';
      } else {
        alertDiv.style.background = '#ecfdf5';
        alertDiv.style.color = '#065f46';
        alertDiv.textContent = '✅ Password updated successfully!';
        passwordForm.reset();
      }
    } catch (err) {
      alertDiv.style.display = 'block';
      alertDiv.style.background = '#fef2f2';
      alertDiv.style.color = '#991b1b';
      alertDiv.textContent = 'Network error updating password.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Password';
    }
  });

  return container;
}

async function loadEnrolledInstitutes(container, activeInst) {
  const listContainer = container.querySelector('#institutesListContainer');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/institutes/my-enrollments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed loading enrollments');

    const data = await response.json();
    const enrollments = data.enrollments || [];

    if (enrollments.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; background: var(--bg-hover, #f9fafb); border-radius: 8px;">
          <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--muted-text, #6b7280);">
            You are not enrolled in any coaching institute yet.
          </p>
          <span style="font-size: 0.8rem; color: var(--muted-text, #9ca3af);">
            Open a teacher's portal link to join their coaching automatically.
          </span>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';

    enrollments.forEach(inst => {
      const isActive = activeInst && (activeInst.id === inst.id || activeInst.code === inst.code);
      const card = document.createElement('div');
      card.style.cssText = `
        padding: 1rem;
        border-radius: 10px;
        border: 2px solid ${isActive ? (inst.primary_color || '#4f46e5') : 'var(--border-color, #e5e7eb)'};
        background: ${isActive ? 'rgba(79, 70, 229, 0.03)' : 'var(--bg-card, #ffffff)'};
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        transition: all 0.2s ease;
      `;

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div style="width: 42px; height: 42px; border-radius: 8px; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
            ${inst.logo_url 
              ? `<img src="${inst.logo_url}" alt="${inst.name}" style="width: 100%; height: 100%; object-fit: contain;">` 
              : `<span style="font-size: 1.25rem;">🎓</span>`
            }
          </div>

          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-color, #111827); line-height: 1.3;">
              ${inst.name}
            </div>
            <div style="font-size: 0.8rem; color: var(--muted-text, #6b7280); margin-top: 0.15rem;">
              ${inst.batch_name ? `Batch: <strong>${inst.batch_name}</strong>` : `Code: <code>${inst.code}</code>`}
            </div>
          </div>
        </div>

        <button class="switch-inst-btn btn ${isActive ? 'btn-success' : 'btn-secondary'}" 
                data-id="${inst.id}" 
                style="padding: 0.4rem 0.85rem; font-size: 0.82rem; border-radius: 6px; font-weight: 600; flex-shrink: 0; ${isActive ? 'background: #10b981; border-color: #10b981; color: white;' : ''}">
          ${isActive ? '✓ Active Portal' : 'Switch Portal'}
        </button>
      `;

      const switchBtn = card.querySelector('.switch-inst-btn');
      if (!isActive) {
        switchBtn.addEventListener('click', () => {
          setActiveInstitute(inst);
          window.location.reload();
        });
      }

      listContainer.appendChild(card);
    });

  } catch (err) {
    listContainer.innerHTML = `
      <div style="color: #ef4444; font-size: 0.85rem; padding: 1rem; text-align: center;">
        Failed loading enrolled institutes.
      </div>
    `;
  }
}

async function loadInstituteBatches(container, activeInst) {
  const batchesContainer = container.querySelector('#studentBatchesListContainer');
  if (!batchesContainer) return;

  if (!activeInst || !activeInst.id) {
    batchesContainer.innerHTML = `
      <div style="text-align: center; padding: 1.2rem; background: var(--bg-hover, #f9fafb); border-radius: 8px; font-size: 0.85rem; color: var(--muted-text, #6b7280);">
        Select an active coaching institute above to view available classes & batches.
      </div>
    `;
    return;
  }

  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`/api/institutes/${activeInst.id}/batches-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed loading batches');

    const data = await response.json();
    const batches = data.batches || [];

    if (batches.length === 0) {
      batchesContainer.innerHTML = `
        <div style="text-align: center; padding: 1.2rem; background: var(--bg-hover, #f9fafb); border-radius: 8px; font-size: 0.85rem; color: var(--muted-text, #6b7280);">
          No batches or classes created yet for ${activeInst.name}.
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
        border: 1px solid var(--border-color, #e5e7eb);
        background: var(--bg-card, #ffffff);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      `;

      let statusBadge = '';
      let actionBtn = '';

      if (b.student_status === 'approved') {
        statusBadge = `<span style="font-size: 0.8rem; background: #d1fae5; color: #065f46; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">✅ Active Batch</span>`;
      } else if (b.student_status === 'pending') {
        statusBadge = `<span style="font-size: 0.8rem; background: #fef3c7; color: #92400e; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">⏳ Pending Approval</span>`;
      } else if (b.student_status === 'rejected') {
        statusBadge = `<span style="font-size: 0.8rem; background: #fee2e2; color: #991b1b; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">❌ Request Rejected</span>`;
        actionBtn = `<button class="btn btn-secondary re-request-btn" data-batch-id="${b.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">Re-Apply</button>`;
      } else {
        actionBtn = `<button class="btn btn-primary join-batch-btn" data-batch-id="${b.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 700;">Request to Join</button>`;
      }

      card.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-color, #111827);">
            ${b.name} ${b.code ? `<span style="font-size: 0.75rem; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; color: var(--muted-text); font-weight: 600;">${b.code}</span>` : ''}
          </div>
          ${b.description ? `<div style="font-size: 0.8rem; color: var(--muted-text, #6b7280); margin-top: 2px;">${b.description}</div>` : ''}
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          ${statusBadge}
          ${actionBtn}
        </div>
      `;

      const btn = card.querySelector('.join-batch-btn, .re-request-btn');
      if (btn) {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = 'Submitting...';
          try {
            const reqRes = await fetch('/api/institutes/batches/join-request', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ batch_id: b.id })
            });
            if (reqRes.ok) {
              loadInstituteBatches(container, activeInst);
            } else {
              const errData = await reqRes.json();
              alert(errData.error || 'Failed to submit batch request.');
              btn.disabled = false;
              btn.textContent = 'Request to Join';
            }
          } catch (e) {
            alert('Network error submitting request.');
            btn.disabled = false;
            btn.textContent = 'Request to Join';
          }
        });
      }

      batchesContainer.appendChild(card);
    });

  } catch (err) {
    batchesContainer.innerHTML = `
      <div style="color: #ef4444; font-size: 0.85rem; padding: 1rem; text-align: center;">
        Failed loading batches.
      </div>
    `;
  }
}
