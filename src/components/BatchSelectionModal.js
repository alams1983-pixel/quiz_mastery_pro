import { apiRequest } from '../services/api.js';
import { createModal } from './Modal.js';

export async function promptJoinInstituteModal(onSuccess) {
  const content = document.createElement('div');
  content.innerHTML = `
    <div style="margin-bottom: 18px;">
      <label class="form-label" style="font-weight:700;">Coaching Institute Code *</label>
      <div style="display:flex; gap:10px;">
        <input type="text" id="instCodeInput" class="form-control" placeholder="e.g. EDU-A8F1" style="text-transform:uppercase; font-weight:700; letter-spacing:0.05em;" required />
        <button type="button" id="btnVerifyCode" class="btn btn-primary" style="white-space:nowrap; font-weight:700;">
          Verify Code
        </button>
      </div>
      <div id="verifyMessage" style="font-size:0.85rem; margin-top:6px;"></div>
    </div>

    <!-- Dynamic Batch Selection Section (Hidden until verified) -->
    <div id="batchSection" style="display:none; background:var(--bg-color); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; margin-bottom:18px;">
      <label class="form-label" style="font-weight:700; color:var(--primary); margin-bottom:8px; display:block;">
        🏫 Select your Class / Batch / Standard *
      </label>
      <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:12px;">
        Exams and tests will be tailored specifically to your enrolled batch.
      </p>
      <div id="batchListContainer" style="display:flex; flex-direction:column; gap:8px;"></div>
    </div>

    <button type="button" id="btnConfirmEnroll" class="btn btn-primary" style="width:100%; font-weight:800; padding:12px;" disabled>
      Complete Institute Enrollment →
    </button>
  `;

  const modal = createModal({ title: '🏛️ Join Coaching Institute', content });

  const instCodeInput = content.querySelector('#instCodeInput');
  const btnVerifyCode = content.querySelector('#btnVerifyCode');
  const verifyMessage = content.querySelector('#verifyMessage');
  const batchSection = content.querySelector('#batchSection');
  const batchListContainer = content.querySelector('#batchListContainer');
  const btnConfirmEnroll = content.querySelector('#btnConfirmEnroll');

  let verifiedInstitute = null;
  let selectedBatchId = null;

  async function verifyCode() {
    const code = instCodeInput.value.trim().toUpperCase();
    if (!code) {
      verifyMessage.innerHTML = '<span style="color:var(--danger)">Please enter an institute code.</span>';
      return;
    }

    try {
      verifyMessage.innerHTML = '<span style="color:var(--text-muted)">Verifying institute code...</span>';
      const res = await apiRequest(`/auth/institute-batches/${code}`);
      verifiedInstitute = res.institute;
      const batches = res.batches || [];

      verifyMessage.innerHTML = `<span style="color:var(--success); font-weight:700;">✅ Found Institute: ${verifiedInstitute.name} (${verifiedInstitute.code})</span>`;
      batchSection.style.display = 'block';

      if (batches.length === 0) {
        batchListContainer.innerHTML = `
          <div style="font-size:0.88rem; color:var(--text-muted); padding:10px; background:var(--card-bg); border-radius:6px;">
            No specific batches created yet. You will be assigned to the General Batch.
          </div>
        `;
        selectedBatchId = null;
        btnConfirmEnroll.disabled = false;
      } else {
        batchListContainer.innerHTML = batches.map((b, idx) => `
          <label style="display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--card-bg); border:1.5px solid var(--border-color); border-radius:8px; cursor:pointer; font-weight:600;">
            <input type="radio" name="selected_batch" value="${b.id}" ${idx === 0 ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
            <div>
              <div style="font-weight:700; color:var(--text-main);">${b.name}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);">${b.description || 'Active Coaching Batch'}</div>
            </div>
          </label>
        `).join('');

        selectedBatchId = batches[0].id;
        btnConfirmEnroll.disabled = false;

        batchListContainer.querySelectorAll('input[name="selected_batch"]').forEach(radio => {
          radio.addEventListener('change', (e) => {
            selectedBatchId = parseInt(e.target.value, 10);
          });
        });
      }
    } catch (err) {
      verifiedInstitute = null;
      btnConfirmEnroll.disabled = true;
      batchSection.style.display = 'none';
      verifyMessage.innerHTML = `<span style="color:var(--danger)">${err.message || 'Invalid institute code.'}</span>`;
    }
  }

  btnVerifyCode.addEventListener('click', verifyCode);
  instCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyCode();
    }
  });

  btnConfirmEnroll.addEventListener('click', async () => {
    if (!verifiedInstitute) return;
    try {
      btnConfirmEnroll.disabled = true;
      btnConfirmEnroll.textContent = 'Enrolling...';

      const res = await apiRequest('/auth/join-institute', {
        method: 'POST',
        body: JSON.stringify({
          code: verifiedInstitute.code,
          batch_id: selectedBatchId
        })
      });

      alert(res.message);
      modal.close();
      if (onSuccess) onSuccess(res);
    } catch (err) {
      alert(err.message || 'Error completing enrollment.');
      btnConfirmEnroll.disabled = false;
      btnConfirmEnroll.textContent = 'Complete Institute Enrollment →';
    }
  });
}
