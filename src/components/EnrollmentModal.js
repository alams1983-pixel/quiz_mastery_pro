/**
 * Enrollment Confirmation Modal Component
 * Prompts students when joining a new coaching institute while already enrolled elsewhere.
 */
export function renderEnrollmentModal({ previousInstituteName, targetInstitute, onConfirm, onCancel }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.style.zIndex = '9999';

  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 500px; text-align: center; padding: 2rem;">
      <div style="width: 70px; height: 70px; background: rgba(79, 70, 229, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
        ${targetInstitute.logo_url 
          ? `<img src="${targetInstitute.logo_url}" alt="Logo" style="width: 48px; height: 48px; object-fit: contain; border-radius: 50%;">` 
          : `<span style="font-size: 2rem;">🎓</span>`
        }
      </div>

      <h2 style="margin-bottom: 0.5rem; color: var(--text-main); font-size: 1.5rem; font-weight: 700;">
        Enroll in ${targetInstitute.name}?
      </h2>

      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5;">
        You are currently enrolled with <strong>${previousInstituteName}</strong>. 
        Would you like to enroll with <strong>${targetInstitute.name}</strong> as well?
      </p>

      <div style="background: var(--bg-color); padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.85rem; color: var(--text-main); text-align: left; border: 1px solid var(--border-color);">
        <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: var(--primary);">✨ What happens when you enroll?</p>
        <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.4;">
          <li>You will get access to quizzes and exams from <strong>${targetInstitute.name}</strong>.</li>
          <li>You can access tests and batches for <strong>${targetInstitute.name}</strong> on their coaching portal domain.</li>
        </ul>
      </div>

      <div style="display: flex; gap: 0.75rem; justify-content: center;">
        <button id="cancelEnrollBtn" class="btn btn-secondary" style="flex: 1; padding: 0.75rem;">
          Cancel
        </button>
        <button id="confirmEnrollBtn" class="btn btn-primary" style="flex: 1; padding: 0.75rem; background-color: ${targetInstitute.primary_color || 'var(--primary-color, #4f46e5)'}; border-color: ${targetInstitute.primary_color || 'var(--primary-color, #4f46e5)'};">
          Yes, Enroll Me
        </button>
      </div>
    </div>
  `;

  const cancelBtn = overlay.querySelector('#cancelEnrollBtn');
  const confirmBtn = overlay.querySelector('#confirmEnrollBtn');

  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    if (onCancel) onCancel();
  });

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = 'Enrolling...';
    if (onConfirm) await onConfirm();
    document.body.removeChild(overlay);
  });

  document.body.appendChild(overlay);
}
