import { parseCSVQuestions, parseJSONQuestions } from '../services/csvJsonParser.js';
import { apiRequest, cache } from '../services/api.js';
import { copyAiPromptToClipboard } from '../services/aiPromptGenerator.js';

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

  const sampleCSVTemplate = `category_name,tag_names,passage_en,passage_bn,passage_image_url,question_en,question_bn,image_url,optionA_en,optionB_en,optionC_en,optionD_en,optionA_bn,optionB_bn,optionC_bn,optionD_bn,answer,explanation_en,explanation_bn,explanation_image_url,difficulty
"General Science","Physics,SSC CGL","Read the passage on Newton's Laws.","নিউটন এর গতির সূত্র বিষয়ক বিবরণটি পড়ো।","https://example.com/passage.jpg","Identify the synonym of 'Abundant'.","'Abundant' শব্দের সমার্থক শব্দ চিহ্নিত করো।","","Scarce","Plentiful","Meager","Lacking","দুর্লভ","প্রচুর","অল্প","ঘাটতি",1,"Plentiful means existing in large quantities.","Plentiful শব্দের অর্থ বিপুল পরিমানে থাকা।","",medium
"Mathematics","Algebra,Equations","","","","Solve $E = mc^2$ for $m$.","সমিবকরণ $E = mc^2$ এ $m$ এর মান বের করো।","","m = E/c^2","m = Ec^2","m = c^2/E","m = E - c^2","m = E/c^2","m = Ec^2","m = c^2/E","m = E - c^2",0,"Dividing both sides by c^2.","উভয় দিক c^2 দিয়ে ভাগ করে।","",hard`;

  const sampleJSONTemplate = JSON.stringify([
    {
      "available_languages": ["en", "bn"],
      "primary_language": "en",
      "translations": {
        "en": {
          "question_text": "Consider the following statements regarding Rule 32:\n1. Question Hour is the first hour.\n2. Speaker can direct otherwise.",
          "options": ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
          "explanation": "Both statements correctly reflect Rule 32 (Question Hour)."
        },
        "bn": {
          "question_text": "নিয়ম ৩২ সম্পর্কিত নিচের উক্তিগুলি বিবেচনা করুন:\n১. প্রশ্ন কাল হল প্রথম ঘণ্টা।\n২. অধ্যক্ষ অন্য নির্দেশ দিতে পারেন।",
          "options": ["শুধুমাত্র ১", "শুধুমাত্র ২", "১ এবং ২ উভয়ই", "১ বা ২ কোনোটিই নয়"],
          "explanation": "উভয় উক্তিতেই নিয়ম ৩২ সঠিক প্রতিফলিত হয়েছে।"
        }
      },
      "category_name": "General Science",
      "tag_names": ["Physics", "Polity"],
      "passage_text_en": "Rule 32: Unless the Speaker otherwise directs, the first hour of every sitting shall be available for questions.",
      "passage_image_url": "https://example.com/passage_diagram.png",
      "image_url": "https://example.com/question_diagram.png",
      "correct_option_index": 2,
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
        <h4 style="font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: var(--primary);">📥 Download Templates & AI Question Creation:</h4>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
          <button id="dl-csv-sample" class="btn btn-outline btn-sm"><i class="ri-file-excel-line"></i> Download CSV Template</button>
          <button id="dl-json-sample" class="btn btn-outline btn-sm"><i class="ri-code-s-slash-line"></i> Download JSON Template</button>
          <button id="btn-copy-ai-prompt" class="btn btn-outline btn-ai-prompt btn-sm">
            <i class="ri-sparkling-fill"></i> 📋 Copy AI Prompt for Bulk Questions
          </button>
        </div>

        <div id="ai-prompt-instructions" style="display: none; background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: 10px; padding: 14px; margin-top: 10px; font-size: 0.83rem; color: var(--text-main);">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: var(--primary); margin-bottom: 6px; font-size: 0.9rem;">
            <i class="ri-checkbox-circle-fill"></i> Prompt Copied to Clipboard! How to use with ChatGPT / Claude / Gemini / DeepSeek:
          </div>
          <ol style="margin: 0; padding-left: 18px; line-height: 1.6;">
            <li>Open your preferred AI tool (ChatGPT, Claude, Gemini, or DeepSeek).</li>
            <li>Paste the copied prompt into the AI chat prompt box.</li>
            <li>Fill in the <strong>[FILL-IN-THE-BLANK]</strong> parameters with your source notes, preferred languages (e.g. <code>English and Hindi</code> or <code>Bengali</code>), total question count, category & difficulty.</li>
            <li>Copy the AI's JSON output response and save it on your computer as a <code>.json</code> file (e.g. <code>my_questions.json</code>).</li>
            <li>Upload the saved <code>.json</code> file right here in Step 1!</li>
          </ol>
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
                <th>Languages</th>
                <th>Category</th>
                <th>Question Statement</th>
                <th>Options</th>
                <th>Ans</th>
                <th>Passage</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              ${parsedQuestions.map((q, i) => {
                const langs = q.available_languages || (q.translations_json ? q.translations_json.available_languages : ['en']);
                const prim = q.primary_language || (q.translations_json ? q.translations_json.primary_language : langs[0]);
                const qText = q.question_text || q.question_text_en || (q.translations_json?.translations?.[prim]?.question_text) || 'Question Statement';
                const opts = q.options || q.options_en || (q.translations_json?.translations?.[prim]?.options) || [];
                const pText = q.passage_text_en || q.passage_text_hi || q.passage_text;
                
                return `
                  <tr>
                    <td style="font-weight: 700;">${i + 1}</td>
                    <td>
                      <div style="display:flex; gap:3px; flex-wrap:wrap;">
                        ${langs.map(l => `<span class="badge-tag" style="font-size:0.7rem; font-weight:800; background:var(--primary-light); color:var(--primary);">${l.toUpperCase()}</span>`).join('')}
                      </div>
                    </td>
                    <td><span class="badge-tag" style="font-size:0.75rem;">${q.category_name || 'General'}</span></td>
                    <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${qText}">${qText}</td>
                    <td>${opts.length} Choices (${prim})</td>
                    <td style="font-weight: 700; color: var(--primary);">${q.correct_option_index}</td>
                    <td>${pText ? '📖 Yes' : '-'}</td>
                    <td>${(q.image_url || q.passage_image_url || q.explanation_image_url) ? '🖼️ Yes' : '-'}</td>
                  </tr>
                `;
              }).join('')}
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
      
      container.querySelector('#btn-copy-ai-prompt')?.addEventListener('click', async () => {
        const btn = container.querySelector('#btn-copy-ai-prompt');
        const instructionsBox = container.querySelector('#ai-prompt-instructions');
        await copyAiPromptToClipboard();
        if (btn) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="ri-check-line"></i> Copied to Clipboard!';
          btn.style.background = 'var(--success-light, #dcfce7)';
          btn.style.color = 'var(--success, #16a34a)';
          btn.style.borderColor = 'var(--success, #16a34a)';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 3000);
        }
        if (instructionsBox) {
          instructionsBox.style.display = 'block';
          instructionsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
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
