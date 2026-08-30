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

export function renderBulkUploadModal(targetId, targetType = 'exam_section', onComplete, onClose) {
  if (typeof targetType === 'function') {
    onClose = onComplete;
    onComplete = targetType;
    targetType = 'exam_section';
  }

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
  let taxonomyError = null;

  const sampleCSVTemplate = `category_name,tag_names,passage_en,passage_hi,passage_image_url,question_en,question_hi,image_url,optionA_en,optionB_en,optionC_en,optionD_en,optionA_hi,optionB_hi,optionC_hi,optionD_hi,answer,explanation_en,explanation_hi,explanation_image_url,difficulty
"General Science","Physics,SSC CGL","Read the passage on Newton's Laws.","न्यूटन के नियमों पर गद्यांश पढ़ें।","https://example.com/passage.jpg","Identify the synonym of 'Abundant'.","'Abundant' का पर्यायवाची शब्द पहचानें।","","Scarce","Plentiful","Meager","Lacking","दुर्लभ","प्रचुर","अल्प","कमी",1,"Plentiful means existing in large quantities.","Plentiful का अर्थ है बड़ी मात्रा में मौजूद।","",medium
"Mathematics","Algebra,Equations","","Solve $E = mc^2$ for $m$.","समीकरण $E = mc^2$ में $m$ का मान बताएं।","","m = E/c^2","m = Ec^2","m = c^2/E","m = E - c^2","","","","",0,"Dividing both sides by c^2.","दोनों पक्षों को c^2 से विभाजित करना।","",hard`;

  const sampleJSONTemplate = JSON.stringify([
    {
      "category_name": "General Science",
      "tag_names": ["Physics", "SSC CGL"],
      "passage_text_en": "Rule 32: Unless the Speaker otherwise directs, the first hour of every sitting shall be available for questions.",
      "passage_text_hi": "नियम 32: जब तक अध्यक्ष अन्यथा निर्देश न दें, प्रत्येक बैठक का प्रथम घंटा प्रश्नों के लिए उपलब्ध होगा।",
      "passage_image_url": "https://example.com/passage_diagram.png",
      "question_text_en": "Consider the following statements regarding Rule 32:\n1. Question Hour is the first hour.\n2. Speaker can direct otherwise.",
      "question_text_hi": "नियम 32 के संबंध में कथनों पर विचार कीजिए:\n1. प्रश्न काल पहला घंटा है।\n2. अध्यक्ष अन्यथा निर्देश दे सकते हैं।",
      "image_url": "https://example.com/question_diagram.png",
      "options_en": ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
      "options_hi": ["केवल 1", "केवल 2", "1 और 2 दोनों", "न तो 1 और न ही 2"],
      "options_images": ["", "", "", ""],
      "correct_option_index": 2,
      "explanation_en": "Both statements correctly reflect Rule 32 (Question Hour).",
      "explanation_hi": "दोनों कथन नियम 32 (प्रश्न काल) को सही रूप से दर्शाते हैं।",
      "explanation_image_url": "https://example.com/explanation_chart.png",
      "difficulty": "medium"
    }
  ], null, 2);

  const container = document.createElement('div');
  container.className = 'card';
  container.style.width = '100%';
  container.style.maxWidth = '820px';
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
            <i class="ri-file-upload-line" style="color: var(--primary);"></i> Multi-Language Bulk Question Wizard
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Step ${currentStep} of 3 — Import KaTeX Math, Images & Passages</p>
        </div>
        <button id="close-wizard-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
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
        <label class="form-label" style="margin-bottom: 8px; display: block;">Select or Drag CSV / JSON Question File:</label>
        <div id="drop-zone" style="border: 2px dashed var(--primary); border-radius: 14px; padding: 36px 20px; text-align: center; background: var(--primary-light); cursor: pointer; transition: all 0.2s;">
          <i class="ri-cloud-upload-line" style="font-size: 2.8rem; color: var(--primary); display: block; margin-bottom: 8px;"></i>
          <p style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 4px;">Click to Browse or Drag & Drop File</p>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Supports .csv and .json formats with 2-6 options, category, tags & image URLs</p>
          <input type="file" id="file-input" accept=".csv,.json" style="display: none;" />
        </div>
        ${fileError ? `<div style="color: var(--danger); font-size: 0.85rem; margin-top: 10px; font-weight: 600;">⚠️ ${fileError}</div>` : ''}
      </div>

      <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h4 style="font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: var(--primary);">📥 Download Sample Templates:</h4>
        <div style="display: flex; gap: 12px;">
          <button id="dl-csv-sample" class="btn btn-outline btn-sm"><i class="ri-file-excel-line"></i> Download CSV Template</button>
          <button id="dl-json-sample" class="btn btn-outline btn-sm"><i class="ri-code-s-slash-line"></i> Download JSON Template</button>
        </div>
      </div>
    `;
  }

  function renderStep2() {
    const missingCats = (taxonomyError && taxonomyError.missingCategories) || [];
    const missingTags = (taxonomyError && (taxonomyError.missingTags || taxonomyError.newTagsToCreate)) || [];
    const hasCategoryError = missingCats.length > 0;

    return `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-weight: 800; font-size: 1rem; color: var(--text-main);">
            Parsed Preview (${parsedQuestions.length} Questions Found)
          </h4>
          <span class="status-badge ${hasCategoryError ? 'status-inactive' : 'status-active'}">
            ${hasCategoryError ? '⚠️ Category Action Required' : 'Valid & Ready'}
          </span>
        </div>

        ${hasCategoryError ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1.5px solid var(--danger); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="display:flex; align-items:center; gap:8px; color:var(--danger); font-weight:800; font-size:0.95rem; margin-bottom:6px;">
              <i class="ri-alert-line" style="font-size:1.2rem;"></i> Missing Category Warning
            </div>
            <p style="font-size:0.85rem; color:var(--text-main); margin-bottom:10px; line-height:1.4;">
              The uploaded file references categories that <strong>do not exist</strong> in your institute taxonomy. Please create these categories first in the <strong>Taxonomy Manager</strong> before proceeding.
            </p>

            <div style="margin-bottom:8px;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--danger); display:block; margin-bottom:4px;">Missing Categories (${missingCats.length}):</span>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${missingCats.map(c => `<span class="badge-tag" style="background:rgba(239, 68, 68, 0.15); color:var(--danger); font-weight:700;">📂 ${c}</span>`).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        ${missingTags.length > 0 ? `
          <div style="background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <div style="display:flex; align-items:center; gap:8px; color:var(--primary); font-weight:800; font-size:0.9rem; margin-bottom:4px;">
              <i class="ri-price-tag-3-line"></i> New Tags Auto-Creation
            </div>
            <p style="font-size:0.82rem; color:var(--text-main); margin-bottom:6px;">
              The following custom tags were found in your upload file and will be <strong>automatically added</strong> to your institute tags:
            </p>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${missingTags.map(t => `<span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color); font-weight:700;">🏷️ ${t}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div style="overflow-x: auto; max-height: 280px; border: 1px solid var(--border-color); border-radius: 10px;">
          <table class="custom-table" style="width: 100%; font-size: 0.85rem;">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Question (EN)</th>
                <th>Options</th>
                <th>Ans</th>
                <th>Passage</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              ${parsedQuestions.map((q, i) => `
                <tr>
                  <td style="font-weight: 700;">${i + 1}</td>
                  <td><span class="badge-tag" style="font-size:0.75rem;">${q.category_name || 'General'}</span></td>
                  <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${q.question_text_en}</td>
                  <td>${(q.options_en || []).length} Choices</td>
                  <td style="font-weight: 700; color: var(--primary);">${q.correct_option_index}</td>
                  <td>${q.passage_text_en ? '📖 Yes' : '-'}</td>
                  <td>${(q.image_url || q.passage_image_url || q.explanation_image_url) ? '🖼️ Yes' : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step1" class="btn btn-outline">← Back</button>
        <button id="btn-next-step3" class="btn btn-primary" ${hasCategoryError ? 'disabled title="Please create missing categories first"' : ''}>
          ${hasCategoryError ? '⚠️ Fix Missing Categories First' : 'Proceed to Import →'}
        </button>
      </div>
    `;
  }

  function renderStep3() {
    let targetLabel = 'Exam Section';
    if (targetType === 'quiz') targetLabel = 'Practice Quiz';
    if (targetType === 'question_bank') targetLabel = 'Master Question Repository';

    return `
      <div style="text-align: center; padding: 20px 0; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 12px;">
          <i class="ri-check-double-line"></i>
        </div>
        <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">Ready to Import ${parsedQuestions.length} Questions</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Questions will be added into ${targetLabel} ${targetId ? `#${targetId}` : ''} with multi-language support, KaTeX math & embedded image URLs.</p>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step2" class="btn btn-outline">← Back</button>
        <button id="btn-confirm-import" class="btn btn-primary" style="flex: 1;">Execute Bulk Import 🚀</button>
      </div>
    `;
  }

  function setupStepEvents() {
    container.querySelector('#close-wizard-btn')?.addEventListener('click', () => {
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

      container.querySelector('#dl-csv-sample').addEventListener('click', () => downloadTemplate('ssc_questions_template.csv', sampleCSVTemplate));
      container.querySelector('#dl-json-sample').addEventListener('click', () => downloadTemplate('ssc_questions_template.json', sampleJSONTemplate));
    }

    if (currentStep === 2) {
      container.querySelector('#btn-back-step1').addEventListener('click', () => { currentStep = 1; renderStep(); });
      const nextBtn = container.querySelector('#btn-next-step3');
      if (nextBtn && !nextBtn.disabled) {
        nextBtn.addEventListener('click', () => { currentStep = 3; renderStep(); });
      }
    }

    if (currentStep === 3) {
      container.querySelector('#btn-back-step2').addEventListener('click', () => { currentStep = 2; renderStep(); });
      container.querySelector('#btn-confirm-import').addEventListener('click', async () => {
        const btn = container.querySelector('#btn-confirm-import');
        btn.disabled = true;
        btn.innerHTML = 'Importing Base64 Payload... ⏳';
        try {
          const endpoint = targetType === 'quiz'
            ? `/quizzes/${targetId}/questions/bulk`
            : (targetType === 'question_bank'
              ? `/exams/questions/bulk`
              : `/exams/sections/${targetId}/questions/bulk`);

          const payload = {
            questions: parsedQuestions,
            encodedPayload: toBase64Utf8(parsedQuestions),
            section_id: targetType === 'question_bank' ? targetId : null
          };

          console.log('[DEBUG CLIENT] Sending Base64 bulk import request:', { endpoint, targetId, targetType, payloadLength: payload.encodedPayload.length });

          const res = await apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          console.log('[DEBUG CLIENT] Bulk import response:', res);
          cache.invalidate(`questions_${targetId}`);
          cache.invalidate('quizzes');
          cache.invalidate('questions');
          alert(res.message);
          document.body.removeChild(modalOverlay);
          if (onComplete) onComplete(res);
        } catch (err) {
          console.error('[DEBUG CLIENT] Bulk import error:', err);
          alert(err.message || 'Bulk import failed.');
          btn.disabled = false;
          btn.innerHTML = 'Execute Bulk Import (Base64 Encoded) 🚀';
        }
      });
    }
  }

  async function handleFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
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
        taxonomyError = null;

        // Perform Pre-Validation of Categories & Tags against DB
        try {
          const valRes = await apiRequest('/exams/questions/validate-bulk', {
            method: 'POST',
            body: JSON.stringify({ encodedPayload: toBase64Utf8(parsedQuestions) })
          });

          if (!valRes.valid) {
            taxonomyError = {
              missingCategories: valRes.missingCategories || [],
              missingTags: valRes.missingTags || []
            };
          }
        } catch (vErr) {
          console.warn('Pre-validation failed:', vErr);
        }

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

export function openBulkUploadModal(targetId, targetType = 'quiz', onComplete) {
  if (typeof targetType === 'function') {
    onComplete = targetType;
    targetType = 'quiz';
  }
  renderBulkUploadModal(targetId, targetType, onComplete, null);
}
