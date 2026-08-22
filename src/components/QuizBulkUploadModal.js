import { parseCSVQuestions, parseJSONQuestions } from '../services/csvJsonParser.js';
import { apiRequest, cache } from '../services/api.js';

function toBase64Utf8(obj) {
  try {
    const jsonStr = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  } catch (e) {
    return '';
  }
}

export function renderQuizBulkUploadModal(quizId, onComplete, onClose) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay fade-in';
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.inset = '0';
  modalOverlay.style.background = 'rgba(0, 0, 0, 0.6)';
  modalOverlay.style.backdropFilter = 'blur(4px)';
  modalOverlay.style.zIndex = '10000';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.padding = '20px';

  let currentStep = 1;
  let parsedQuestions = [];
  let fileError = null;

  const sampleCSVTemplate = `question_text,optionA,optionB,optionC,optionD,correct_answer_index,explanation,tags
"What is the capital of France?","London","Berlin","Paris","Madrid",2,"Paris is the capital of France.","Geography,General Knowledge"
"Which element has atomic number 1?","Hydrogen","Helium","Lithium","Beryllium",0,"Hydrogen is the first element in the periodic table.","Chemistry,Science"`;

  const sampleJSONTemplate = JSON.stringify([
    {
      "question_text": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correct_answer_index": 2,
      "explanation": "Paris is the capital of France.",
      "tags": ["Geography", "General Knowledge"]
    },
    {
      "question_text": "Which element has atomic number 1?",
      "options": ["Hydrogen", "Helium", "Lithium", "Beryllium"],
      "correct_answer_index": 0,
      "explanation": "Hydrogen is the first element in the periodic table.",
      "tags": ["Chemistry", "Science"]
    }
  ], null, 2);

  const container = document.createElement('div');
  container.className = 'card';
  container.style.width = '100%';
  container.style.maxWidth = '780px';
  container.style.maxHeight = '90vh';
  container.style.overflowY = 'auto';
  container.style.padding = '28px';
  container.style.background = 'var(--card-bg)';
  container.style.borderRadius = '20px';
  container.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

  function renderStep() {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">
            <i class="ri-lightbulb-line" style="color: var(--primary);"></i> Practice Quiz Bulk Question Wizard
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Step ${currentStep} of 3 — Dedicated Practice Quiz Bulk Import</p>
        </div>
        <button id="close-quiz-wizard-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <!-- Step Indicator Bar -->
      <div style="display: flex; gap: 8px; margin-bottom: 24px;">
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${currentStep >= 1 ? 'var(--primary)' : 'var(--border-color)'};"></div>
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${currentStep >= 2 ? 'var(--primary)' : 'var(--border-color)'};"></div>
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${currentStep >= 3 ? 'var(--primary)' : 'var(--border-color)'};"></div>
      </div>

      ${currentStep === 1 ? renderStep1() : ''}
      ${currentStep === 2 ? renderStep2() : ''}
      ${currentStep === 3 ? renderStep3() : ''}
    `;

    setupStepEvents();
  }

  function renderStep1() {
    return `
      <div style="margin-bottom: 20px;">
        <label class="form-label" style="margin-bottom: 8px; display: block;">Select or Drag Practice Quiz Question File (CSV / JSON):</label>
        <div id="drop-zone" style="border: 2px dashed var(--primary); border-radius: 14px; padding: 36px 20px; text-align: center; background: var(--primary-light); cursor: pointer; transition: all 0.2s;">
          <i class="ri-file-code-line" style="font-size: 2.8rem; color: var(--primary); display: block; margin-bottom: 8px;"></i>
          <p style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 4px;">Click to Browse or Drag & Drop Practice Quiz File</p>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Supports .csv and .json question files for practice quizzes</p>
          <input type="file" id="file-input" accept=".csv,.json" style="display: none;" />
        </div>
        ${fileError ? `<div style="color: var(--danger); font-size: 0.85rem; margin-top: 10px; font-weight: 600;">⚠️ ${fileError}</div>` : ''}
      </div>

      <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h4 style="font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: var(--primary);">📥 Download Practice Quiz Sample Templates:</h4>
        <div style="display: flex; gap: 12px;">
          <button id="dl-csv-sample" class="btn btn-outline btn-sm"><i class="ri-file-excel-line"></i> Download CSV Template</button>
          <button id="dl-json-sample" class="btn btn-outline btn-sm"><i class="ri-code-s-slash-line"></i> Download JSON Template</button>
        </div>
      </div>
    `;
  }

  function renderStep2() {
    return `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-weight: 800; font-size: 1rem; color: var(--text-main);">
            Parsed Preview (${parsedQuestions.length} Questions Found)
          </h4>
          <span class="status-badge status-active">Ready for Quiz #${quizId}</span>
        </div>

        <div style="overflow-x: auto; max-height: 280px; border: 1px solid var(--border-color); border-radius: 10px;">
          <table class="custom-table" style="width: 100%; font-size: 0.85rem;">
            <thead>
              <tr>
                <th>#</th>
                <th>Question Statement</th>
                <th>Options Count</th>
                <th>Ans Index</th>
                <th>Explanation</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              ${parsedQuestions.map((q, i) => `
                <tr>
                  <td style="font-weight: 700;">${i + 1}</td>
                  <td style="max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${q.question_text_en || q.question_text}</td>
                  <td>${(q.options_en || q.options || []).length} Options</td>
                  <td style="font-weight: 700; color: var(--primary);">${q.correct_option_index !== undefined ? q.correct_option_index : q.correct_answer_index}</td>
                  <td style="max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted);">${q.explanation_en || q.explanation || '-'}</td>
                  <td>${Array.isArray(q.tag_names || q.tags) ? (q.tag_names || q.tags).join(', ') : (q.tag_names || q.tags || '-')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step1" class="btn btn-outline">← Back</button>
        <button id="btn-next-step3" class="btn btn-primary">Proceed to Import →</button>
      </div>
    `;
  }

  function renderStep3() {
    return `
      <div style="text-align: center; padding: 20px 0; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 12px;">
          <i class="ri-check-double-line"></i>
        </div>
        <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">Ready to Import ${parsedQuestions.length} Questions</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Questions will be added into Practice Quiz #${quizId}.</p>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step2" class="btn btn-outline">← Back</button>
        <button id="btn-confirm-import" class="btn btn-primary" style="flex: 1;">Execute Quiz Bulk Import 🚀</button>
      </div>
    `;
  }

  function setupStepEvents() {
    container.querySelector('#close-quiz-wizard-btn')?.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
      if (onClose) onClose();
    });

    if (currentStep === 1) {
      const dropZone = container.querySelector('#drop-zone');
      const fileInput = container.querySelector('#file-input');

      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.background = 'var(--primary-border)'; });
      dropZone.addEventListener('dragleave', () => { dropZone.style.background = 'var(--primary-light)'; });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = 'var(--primary-light)';
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
      });

      container.querySelector('#dl-csv-sample').addEventListener('click', () => downloadTemplate('quiz_questions_template.csv', sampleCSVTemplate));
      container.querySelector('#dl-json-sample').addEventListener('click', () => downloadTemplate('quiz_questions_template.json', sampleJSONTemplate));
    }

    if (currentStep === 2) {
      container.querySelector('#btn-back-step1').addEventListener('click', () => { currentStep = 1; renderStep(); });
      container.querySelector('#btn-next-step3').addEventListener('click', () => { currentStep = 3; renderStep(); });
    }

    if (currentStep === 3) {
      container.querySelector('#btn-back-step2').addEventListener('click', () => { currentStep = 2; renderStep(); });
      container.querySelector('#btn-confirm-import').addEventListener('click', async () => {
        const btn = container.querySelector('#btn-confirm-import');
        btn.disabled = true;
        btn.innerHTML = 'Importing Quiz Questions... ⏳';
        try {
          const endpoint = `/quizzes/${quizId}/questions/bulk`;

          const payload = {
            questions: parsedQuestions,
            encodedPayload: toBase64Utf8(parsedQuestions)
          };

          const res = await apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          cache.invalidate(`quiz_${quizId}`);
          cache.invalidate('quizzes');

          alert(res.message || 'Practice quiz questions imported successfully!');
          document.body.removeChild(modalOverlay);
          if (onComplete) onComplete(res);
        } catch (err) {
          console.error('[DEBUG CLIENT] Quiz bulk import error:', err);
          alert(err.message || 'Quiz bulk import failed.');
          btn.disabled = false;
          btn.innerHTML = 'Execute Quiz Bulk Import 🚀';
        }
      });
    }
  }

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        if (file.name.endsWith('.json')) {
          parsedQuestions = parseJSONQuestions(text);
        } else {
          parsedQuestions = parseCSVQuestions(text);
        }

        if (parsedQuestions.length === 0) {
          fileError = 'No valid questions could be extracted from the file.';
          renderStep();
          return;
        }

        fileError = null;
        currentStep = 2;
        renderStep();
      } catch (err) {
        fileError = err.message;
        renderStep();
      }
    };
    reader.readAsText(file);
  }

  function downloadTemplate(filename, text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  modalOverlay.appendChild(container);
  document.body.appendChild(modalOverlay);

  renderStep();
}

export function openQuizBulkUploadModal(quizId, onComplete) {
  renderQuizBulkUploadModal(quizId, onComplete, null);
}
