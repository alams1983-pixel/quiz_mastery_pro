import { renderMath } from '../services/katexRenderer.js';

export function renderMathLiveEditor({ initialQuestion, onSave, onCancel }) {
  const container = document.createElement('div');
  container.className = 'math-editor-grid';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = '1fr 1fr';
  container.style.gap = '20px';

  const q = initialQuestion || {
    question_text: '',
    options: ['', '', '', ''],
    correct_answer_index: 0,
    explanation: '',
    tags: []
  };

  container.innerHTML = `
    <!-- Left Pane: Inputs -->
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="font-weight:700; font-size:1.1rem;">✍️ Question Editor</h3>
      
      <div class="form-group">
        <label>Question Text (supports LaTeX math like $E=mc^2$)</label>
        <textarea id="editQText" class="form-textarea" rows="4">${q.question_text || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Options (A, B, C, D...)</label>
        <div id="optionsInputs" style="display:flex; flex-direction:column; gap:8px;">
          ${[0, 1, 2, 3, 4].map(idx => `
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="radio" name="correctRadio" value="${idx}" ${q.correct_answer_index === idx ? 'checked' : ''} />
              <span style="font-weight:bold; font-size:0.85rem; width:16px;">${String.fromCharCode(65 + idx)}</span>
              <input type="text" class="form-input opt-input" data-idx="${idx}" value="${q.options && q.options[idx] ? q.options[idx] : ''}" placeholder="Option ${String.fromCharCode(65 + idx)}" />
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label>Explanation</label>
        <textarea id="editExplanation" class="form-textarea" rows="2">${q.explanation || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Question Image (optional)</label>
        <input type="file" id="editImage" class="form-input" accept="image/*" />
      </div>

      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="btn" id="saveQuestionBtn">Save Question</button>
        <button class="btn btn-secondary" id="cancelQuestionBtn">Cancel</button>
      </div>
    </div>

    <!-- Right Pane: Real-time Live Preview -->
    <div style="background:var(--card-bg); border:1px solid var(--glass-border); border-radius:var(--radius-md); padding:20px;">
      <h3 style="font-weight:700; font-size:1.1rem; color:var(--primary); margin-bottom:14px;">👁️ Real-time KaTeX Live Preview</h3>
      
      <div id="previewCard" class="question-card" style="margin-bottom:0;">
        <div id="prevQText" class="q-text">Type a question above...</div>
        <img id="prevImg" class="question-img" style="display:none;" />
        <div id="prevOptions" class="options-grid"></div>
        <div id="prevExplanation" style="margin-top:14px; font-size:0.9rem; color:var(--text-muted); background:var(--primary-light); padding:10px; border-radius:var(--radius-sm); display:none;"></div>
      </div>
    </div>
  `;

  // Live preview update logic
  const editQText = container.querySelector('#editQText');
  const editExplanation = container.querySelector('#editExplanation');
  const editImage = container.querySelector('#editImage');
  const prevQText = container.querySelector('#prevQText');
  const prevImg = container.querySelector('#prevImg');
  const prevOptions = container.querySelector('#prevOptions');
  const prevExplanation = container.querySelector('#prevExplanation');

  function updatePreview() {
    prevQText.textContent = editQText.value || 'Question text preview...';
    
    // Options preview
    prevOptions.innerHTML = '';
    const radios = container.querySelectorAll('input[name="correctRadio"]');
    let correctIdx = 0;
    radios.forEach(r => { if (r.checked) correctIdx = parseInt(r.value, 10); });

    const optInputs = container.querySelectorAll('.opt-input');
    optInputs.forEach((input, idx) => {
      if (input.value.trim().length > 0) {
        const div = document.createElement('div');
        div.className = `option-btn ${idx === correctIdx ? 'correct-opt' : ''}`;
        div.innerHTML = `<span class="opt-label">${String.fromCharCode(65 + idx)}</span><span class="opt-text">${input.value}</span>`;
        prevOptions.appendChild(div);
      }
    });

    if (editExplanation.value.trim().length > 0) {
      prevExplanation.style.display = 'block';
      prevExplanation.textContent = `Explanation: ${editExplanation.value}`;
    } else {
      prevExplanation.style.display = 'none';
    }

    renderMath(container.querySelector('#previewCard'));
  }

  editQText.addEventListener('input', updatePreview);
  editExplanation.addEventListener('input', updatePreview);
  container.querySelectorAll('.opt-input').forEach(i => i.addEventListener('input', updatePreview));
  container.querySelectorAll('input[name="correctRadio"]').forEach(r => r.addEventListener('change', updatePreview));

  editImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      prevImg.src = URL.createObjectURL(file);
      prevImg.style.display = 'block';
    } else {
      prevImg.style.display = 'none';
    }
  });

  // Initial trigger
  updatePreview();

  container.querySelector('#saveQuestionBtn').addEventListener('click', () => {
    const radios = container.querySelectorAll('input[name="correctRadio"]');
    let correctIdx = 0;
    radios.forEach(r => { if (r.checked) correctIdx = parseInt(r.value, 10); });

    const options = [];
    container.querySelectorAll('.opt-input').forEach(i => {
      if (i.value.trim()) options.push(i.value.trim());
    });

    const formData = new FormData();
    formData.append('question_text', editQText.value.trim());
    formData.append('options', JSON.stringify(options));
    formData.append('correct_answer_index', correctIdx);
    formData.append('explanation', editExplanation.value.trim());

    if (editImage.files[0]) {
      formData.append('image', editImage.files[0]);
    }

    onSave(formData);
  });

  container.querySelector('#cancelQuestionBtn').addEventListener('click', onCancel);

  return container;
}
