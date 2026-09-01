import { apiRequest } from '../services/api.js';
import { renderMath } from '../services/katexRenderer.js';
import { normalizeImageUrl } from '../services/csvJsonParser.js';
import { showLoadingOverlay, hideLoadingOverlay } from '../components/LoadingOverlayModal.js';

export function renderMasterQuestionEditorView(navigate, params = {}) {
  const container = document.createElement('div');
  container.className = 'view-container fade-in';

  const questionId = params.questionId || null;
  const returnView = params.returnView || 'exam-questions';

  container.innerHTML = `
    <!-- Top Action Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:14px; background:var(--card-bg); padding:16px 24px; border-radius:var(--radius-md); border:1px solid var(--border-color); box-shadow:var(--shadow-sm);">
      <div style="display:flex; align-items:center; gap:12px;">
        <button id="btn-editor-back" class="btn btn-outline" style="font-size:0.9rem; padding:8px 14px; display:inline-flex; align-items:center; gap:6px;">
          <i class="ri-arrow-left-line"></i> Back
        </button>
        <div>
          <h1 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-bottom:2px;" id="editor-page-title">
            ${questionId ? '✏️ Edit Master Question' : '➕ Create New Master Question'}
          </h1>
          <p style="font-size:0.85rem; color:var(--text-muted);">
            Dedicated Master Question Workspace • Dynamic 2-6 Options • Line Breaks & Deferred Image Upload
          </p>
        </div>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button id="btn-save-question" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
          <i class="ri-save-3-line"></i> Save Master Question
        </button>
        <button id="btn-save-next-question" class="btn btn-secondary" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
          <i class="ri-add-line"></i> Save & Add Another
        </button>
      </div>
    </div>

    <!-- Main Workspace Grid (Left: Form Controls | Right: Live Preview) -->
    <div class="editor-grid-container" id="editor-main-grid">
      
      <!-- Left Column: Form Controls -->
      <div class="card" style="padding:24px;">
        <!-- Metadata Header -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label" style="font-weight:700;">Category</label>
            <select id="form-q-section" class="form-control" style="padding:10px;">
              <option value="">-- Select Category --</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight:700;">Difficulty Level</label>
            <select id="form-q-diff" class="form-control" style="padding:10px;">
              <option value="easy">Easy</option>
              <option value="medium" selected>Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:16px; background:var(--bg-color); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
          <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-weight:700; font-size:0.92rem; color:var(--text-main);">
            <input type="checkbox" id="form-q-global" style="width:18px; height:18px; cursor:pointer;" />
            🌐 Publish Globally (Make visible to all coaching institutes in Question Bank)
          </label>
        </div>

        <!-- Question Tags Input -->
        <div class="form-group" style="margin-bottom:18px; background:var(--card-bg); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
          <label class="form-label" style="font-weight:700; margin-bottom:6px; display:block;">🏷️ Question Tags (Array)</label>
          <div id="tags-chips-container" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; min-height:28px;"></div>
          <div style="display:flex; gap:8px;">
            <input type="text" id="input-new-tag" class="form-control" placeholder="Type tag and press Enter or comma (e.g. Physics, SSC CGL 2026)..." style="font-size:0.88rem; flex:1;" />
            <button type="button" id="btn-add-tag-chip" class="btn btn-outline btn-sm" style="font-weight:700;">+ Add Tag</button>
          </div>
        </div>

        <!-- Language Tabs -->
        <div style="display:flex; gap:10px; border-bottom:2px solid var(--border-color); margin-bottom:18px;">
          <button id="tab-lang-en" class="btn-text active" style="font-weight:700; padding:8px 14px; border-bottom:3px solid var(--primary);">
            🇬🇧 English Language
          </button>
          <button id="tab-lang-hi" class="btn-text" style="font-weight:700; padding:8px 14px; color:var(--text-muted);">
            🇮🇳 Hindi Language (हिंदी)
          </button>
        </div>

        <form id="form-master-q">
          <!-- Passage Controls -->
          <div style="background:var(--bg-color); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:16px;">
            <label class="form-label" style="font-weight:700; color:var(--primary); margin-bottom:8px; display:block;">
              📖 Comprehension Passage / Statement (Optional)
            </label>
            <div id="section-passage-en" class="lang-pane">
              <textarea id="form-p-text-en" class="form-control" rows="2" placeholder="Passage text in English (supports newlines \\n)..."></textarea>
            </div>
            <div id="section-passage-hi" class="lang-pane" style="display:none;">
              <textarea id="form-p-text-hi" class="form-control" rows="2" placeholder="गद्यांश पाठ (हिंदी)..."></textarea>
            </div>
            <div style="margin-top:10px;">
              <label class="form-label" style="font-size:0.8rem; font-weight:700;">Passage Image</label>
              <div id="passage-img-picker-container"></div>
            </div>
          </div>

          <!-- Question Text Controls -->
          <div id="section-lang-en" class="lang-pane">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:700;">Question Statement (English) *</label>
              <textarea id="form-q-text-en" class="form-control" rows="4" placeholder="Enter question statement (e.g. Solve $x^2 + 5x + 6 = 0$)" required></textarea>
            </div>
          </div>

          <div id="section-lang-hi" class="lang-pane" style="display:none;">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:700;">प्रश्न कथन (Hindi Question Statement)</label>
              <textarea id="form-q-text-hi" class="form-control" rows="4" placeholder="हिंदी में प्रश्न दर्ज करें..."></textarea>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-size:0.82rem; font-weight:700;">Question Main Diagram / Image</label>
            <div id="question-img-picker-container"></div>
          </div>

          <!-- Dynamic Options Section (2 to 6 Options) -->
          <div style="background:var(--bg-color); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <label class="form-label" style="font-weight:700; margin-bottom:0; color:var(--primary);">
                Options & Correct Choice Selection
              </label>
              <div style="display:flex; gap:6px;">
                <button type="button" id="btn-add-opt" class="icon-action-btn btn-primary-accent" data-tooltip="Add Option (+)" aria-label="Add Option"><i class="ri-add-line"></i></button>
                <button type="button" id="btn-rem-opt" class="icon-action-btn btn-danger" data-tooltip="Remove Option (-)" aria-label="Remove Option"><i class="ri-subtract-line"></i></button>
              </div>
            </div>

            <div id="options-list-builder" style="display:flex; flex-direction:column; gap:12px;">
              <!-- Option Rows built dynamically -->
            </div>
          </div>

          <!-- Solution Explanation -->
          <div id="explanation-pane-en" class="lang-pane">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:700;">Solution Explanation (English)</label>
              <textarea id="form-q-exp-en" class="form-control" rows="3" placeholder="Step-by-step solution details..."></textarea>
            </div>
          </div>

          <div id="explanation-pane-hi" class="lang-pane" style="display:none;">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:700;">व्याख्या / विवरण (Hindi Explanation)</label>
              <textarea id="form-q-exp-hi" class="form-control" rows="3" placeholder="चरणबद्ध समाधान विवरण..."></textarea>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-size:0.82rem; font-weight:700;">Explanation Diagram / Image</label>
            <div id="explanation-img-picker-container"></div>
          </div>
        </form>
      </div>

      <!-- Right Column: Real-time Live KaTeX & Card Preview -->
      <div class="card" style="padding:24px; position:sticky; top:84px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
          <h3 style="font-size:1.15rem; font-weight:800; color:var(--primary); display:flex; align-items:center; gap:8px;">
            <i class="ri-eye-line"></i> Live Preview (<span id="prev-lang-label">English</span>)
          </h3>
          <span class="badge-tag" id="preview-diff-badge" style="text-transform:capitalize;">Medium</span>
        </div>

        <div id="previewCard" style="background:var(--bg-color); border:1.5px solid var(--border-color); border-radius:var(--radius-lg); padding:20px;">
          <!-- Passage Preview -->
          <div id="prevPassageBox" style="display:none; background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:14px;">
            <div style="font-weight:700; font-size:0.8rem; color:var(--primary); margin-bottom:4px;">📖 Comprehension Passage</div>
            <div id="prevPassageText" style="white-space:pre-line;" class="katex-render"></div>
            <img id="prevPassageImg" style="display:none; max-width:100%; max-height:180px; margin-top:8px; border-radius:6px;" />
          </div>

          <!-- Question Statement -->
          <div id="prevQText" style="font-size:1.05rem; font-weight:700; color:var(--text-main); margin-bottom:12px; line-height:1.5; white-space:pre-line;" class="katex-render">
            Type a question in the editor to see real-time KaTeX preview...
          </div>
          <img id="prevQImg" style="display:none; max-width:100%; max-height:220px; margin-bottom:14px; border-radius:6px;" />

          <!-- Options Preview -->
          <div id="prevOptionsContainer" style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
            <!-- Dynamic Live Options -->
          </div>

          <!-- Solution Explanation -->
          <div id="prevExplanationBox" style="display:none; background:var(--primary-light); border:1px solid var(--primary-border); border-radius:var(--radius-sm); padding:12px; font-size:0.88rem; color:var(--text-main);">
            <strong>💡 Solution:</strong>
            <div id="prevExplanationText" style="white-space:pre-line; margin-top:4px;" class="katex-render"></div>
            <img id="prevExpImg" style="display:none; max-width:100%; max-height:180px; margin-top:8px; border-radius:6px;" />
          </div>
        </div>
      </div>

    </div>
  `;

  // Attach Event Logic
  setTimeout(() => {
    setupMasterQuestionEditor(container, navigate, questionId, returnView);
  }, 0);

  return container;
}

async function setupMasterQuestionEditor(container, navigate, questionId, returnView) {
  let activeLang = 'en'; // 'en' or 'hi'
  let optionsCount = 4; // Default 4 options (can range 2 to 6)
  let correctOptionIndex = 0;

  // Local state for deferred file uploads & blob previews
  const pendingImageFiles = new Map(); // fieldKey => File object
  const activeBlobUrls = new Map();    // fieldKey => blobUrl string

  const btnBack = container.querySelector('#btn-editor-back');
  const btnSave = container.querySelector('#btn-save-question');
  const btnSaveNext = container.querySelector('#btn-save-next-question');

  const tabEn = container.querySelector('#tab-lang-en');
  const tabHi = container.querySelector('#tab-lang-hi');

  const secEn = container.querySelector('#section-lang-en');
  const secHi = container.querySelector('#section-lang-hi');
  const passEn = container.querySelector('#section-passage-en');
  const passHi = container.querySelector('#section-passage-hi');
  const expEn = container.querySelector('#explanation-pane-en');
  const expHi = container.querySelector('#explanation-pane-hi');

  const pTextEn = container.querySelector('#form-p-text-en');
  const pTextHi = container.querySelector('#form-p-text-hi');

  const qTextEn = container.querySelector('#form-q-text-en');
  const qTextHi = container.querySelector('#form-q-text-hi');

  const qExpEn = container.querySelector('#form-q-exp-en');
  const qExpHi = container.querySelector('#form-q-exp-hi');

  const qDiff = container.querySelector('#form-q-diff');
  const qSec = container.querySelector('#form-q-section');
  const qGlobal = container.querySelector('#form-q-global');

  const prevLangLabel = container.querySelector('#prev-lang-label');
  const prevDiffBadge = container.querySelector('#preview-diff-badge');

  const optionsBuilder = container.querySelector('#options-list-builder');
  const btnAddOpt = container.querySelector('#btn-add-opt');
  const btnRemOpt = container.querySelector('#btn-rem-opt');

  // Helper component to construct Thumbnail Image Picker Widgets
  function createImagePickerWidget(fieldKey, labelText, initialUrl = '', onUpdateCallback) {
    const widgetBox = document.createElement('div');
    widgetBox.className = 'image-picker-widget-box';
    widgetBox.dataset.field = fieldKey;

    const normalizedInitUrl = normalizeImageUrl(initialUrl);

    widgetBox.innerHTML = `
      <div class="img-thumb-card" style="display:${normalizedInitUrl ? 'flex' : 'none'}; align-items:center; gap:12px; background:var(--bg-color); padding:8px 12px; border-radius:8px; border:1.5px solid var(--primary-border);">
        <img class="img-thumb-preview" src="${normalizedInitUrl}" style="width:52px; height:52px; object-fit:contain; background:#ffffff; border-radius:6px; border:1px solid var(--border-color); flex-shrink:0;" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><rect width=%2218%22 height=%2218%22 x=%223%22 y=%223%22 rx=%222%22/><circle cx=%229%22 cy=%229%22 r=%222%22/><path d=%22m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21%22/></svg>';" />
        <div style="flex:1; min-width:0;">
          <div class="img-type-badge" style="font-size:0.78rem; font-weight:700; color:var(--primary);">
            ${normalizedInitUrl.startsWith('blob:') ? '📁 Local File (Pending Upload)' : '🌐 Image URL Attached'}
          </div>
          <div class="img-path-txt" style="font-size:0.75rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${normalizedInitUrl.startsWith('blob:') ? 'Selected from local disk' : normalizedInitUrl}
          </div>
        </div>
        <button type="button" class="btn-remove-picker-img icon-action-btn btn-danger" data-tooltip="Remove Image" aria-label="Remove Image" title="Remove Image">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>

      <div class="img-picker-controls" style="display:${normalizedInitUrl ? 'none' : 'flex'}; gap:8px; align-items:center;">
        <input type="text" class="form-control picker-url-input" placeholder="${labelText || 'Image URL'}" value="${normalizedInitUrl.startsWith('blob:') ? '' : normalizedInitUrl}" style="font-size:0.85rem; flex:1;" />
        <input type="file" class="picker-file-input" accept="image/*" style="display:none;" />
        <button type="button" class="btn-browse-file icon-action-btn" data-tooltip="Upload Local Image" title="Upload Local Image">
          <i class="ri-image-add-line"></i>
        </button>
      </div>
    `;

    const thumbCard = widgetBox.querySelector('.img-thumb-card');
    const thumbPreview = widgetBox.querySelector('.img-thumb-preview');
    const typeBadge = widgetBox.querySelector('.img-type-badge');
    const pathTxt = widgetBox.querySelector('.img-path-txt');
    const btnRemove = widgetBox.querySelector('.btn-remove-picker-img');

    const controlsRow = widgetBox.querySelector('.img-picker-controls');
    const urlInput = widgetBox.querySelector('.picker-url-input');
    const fileInput = widgetBox.querySelector('.picker-file-input');
    const btnBrowse = widgetBox.querySelector('.btn-browse-file');

    btnBrowse.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) {
        const file = fileInput.files[0];
        if (activeBlobUrls.has(fieldKey)) {
          URL.revokeObjectURL(activeBlobUrls.get(fieldKey));
        }

        const blobUrl = URL.createObjectURL(file);
        activeBlobUrls.set(fieldKey, blobUrl);
        pendingImageFiles.set(fieldKey, file);

        thumbPreview.src = blobUrl;
        typeBadge.textContent = '📁 Local File (Pending Upload)';
        pathTxt.textContent = file.name + ` (${(file.size / 1024).toFixed(1)} KB)`;
        thumbCard.style.display = 'flex';
        controlsRow.style.display = 'none';

        if (onUpdateCallback) onUpdateCallback(blobUrl);
      }
    });

    urlInput.addEventListener('input', () => {
      const val = urlInput.value.trim();
      if (val) {
        if (activeBlobUrls.has(fieldKey)) {
          URL.revokeObjectURL(activeBlobUrls.get(fieldKey));
          activeBlobUrls.delete(fieldKey);
        }
        pendingImageFiles.delete(fieldKey);

        thumbPreview.src = val;
        typeBadge.textContent = '🌐 Image URL Attached';
        pathTxt.textContent = val;
        thumbCard.style.display = 'flex';
        controlsRow.style.display = 'none';
      }
      if (onUpdateCallback) onUpdateCallback(val);
    });

    btnRemove.addEventListener('click', (e) => {
      e.preventDefault();
      if (activeBlobUrls.has(fieldKey)) {
        URL.revokeObjectURL(activeBlobUrls.get(fieldKey));
        activeBlobUrls.delete(fieldKey);
      }
      pendingImageFiles.delete(fieldKey);
      fileInput.value = '';
      urlInput.value = '';
      thumbCard.style.display = 'none';
      controlsRow.style.display = 'flex';

      if (onUpdateCallback) onUpdateCallback('');
    });

    widgetBox.getValue = () => {
      if (pendingImageFiles.has(fieldKey) && activeBlobUrls.has(fieldKey)) {
        return activeBlobUrls.get(fieldKey);
      }
      return urlInput.value.trim();
    };

    widgetBox.setValue = (url) => {
      const normalized = normalizeImageUrl(url);
      if (!normalized) {
        if (activeBlobUrls.has(fieldKey)) {
          URL.revokeObjectURL(activeBlobUrls.get(fieldKey));
          activeBlobUrls.delete(fieldKey);
        }
        pendingImageFiles.delete(fieldKey);
        fileInput.value = '';
        urlInput.value = '';
        thumbCard.style.display = 'none';
        controlsRow.style.display = 'flex';
      } else if (normalized.startsWith('blob:')) {
        thumbPreview.src = normalized;
        typeBadge.textContent = '📁 Local File (Pending Upload)';
        pathTxt.textContent = 'Selected from local disk';
        thumbCard.style.display = 'flex';
        controlsRow.style.display = 'none';
      } else {
        if (activeBlobUrls.has(fieldKey)) {
          URL.revokeObjectURL(activeBlobUrls.get(fieldKey));
          activeBlobUrls.delete(fieldKey);
        }
        pendingImageFiles.delete(fieldKey);
        urlInput.value = normalized;
        thumbPreview.src = normalized;
        typeBadge.textContent = '🌐 Image URL Attached';
        pathTxt.textContent = normalized;
        thumbCard.style.display = 'flex';
        controlsRow.style.display = 'none';
      }
    };

    return widgetBox;
  }

  // Initialize passage, question, explanation image widgets
  const passageImgContainer = container.querySelector('#passage-img-picker-container');
  const passageImgWidget = createImagePickerWidget('passage', 'Passage Image URL (Optional)', '', () => updatePreview());
  passageImgContainer.appendChild(passageImgWidget);

  const questionImgContainer = container.querySelector('#question-img-picker-container');
  const questionImgWidget = createImagePickerWidget('question', 'Question Image URL (Optional)', '', () => updatePreview());
  questionImgContainer.appendChild(questionImgWidget);

  const explanationImgContainer = container.querySelector('#explanation-img-picker-container');
  const explanationImgWidget = createImagePickerWidget('explanation', 'Explanation Image URL (Optional)', '', () => updatePreview());
  explanationImgContainer.appendChild(explanationImgWidget);

  // Store option image widgets in array
  let optionImgWidgets = [];

  // Render Dynamic Option Input Rows (2 to 6 Options)
  function renderOptionBuilderRows(enOpts = [], hiOpts = [], imgOpts = []) {
    optionsBuilder.innerHTML = '';
    optionImgWidgets = [];

    for (let i = 0; i < optionsCount; i++) {
      const letter = String.fromCharCode(65 + i);
      const row = document.createElement('div');
      row.style.cssText = 'background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:8px;';

      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="radio" name="correct_opt_idx" value="${i}" ${correctOptionIndex === i ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
          <span style="font-weight:800; min-width:80px; font-size:0.9rem; color:var(--text-main);">Option ${letter}:</span>
          <input type="text" class="form-control opt-en-input" data-idx="${i}" value="${enOpts[i] || ''}" placeholder="Option ${letter} text in English" style="padding:6px 10px; flex:1;" />
          <input type="text" class="form-control opt-hi-input" data-idx="${i}" value="${hiOpts[i] || ''}" placeholder="हिंदी विकल्प ${letter}" style="padding:6px 10px; flex:1;" />
        </div>
        <div class="opt-img-picker-slot" style="margin-left:110px;"></div>
      `;

      const slot = row.querySelector('.opt-img-picker-slot');
      const optWidget = createImagePickerWidget(`option_${i}`, `Option ${letter} Image URL (Optional)`, imgOpts[i] || '', () => updatePreview());
      slot.appendChild(optWidget);
      optionImgWidgets.push(optWidget);

      optionsBuilder.appendChild(row);
    }

    optionsBuilder.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', updatePreview);
      inp.addEventListener('change', updatePreview);
    });
  }

  btnAddOpt.addEventListener('click', () => {
    if (optionsCount < 6) {
      optionsCount++;
      const currentEn = Array.from(container.querySelectorAll('.opt-en-input')).map(i => i.value);
      const currentHi = Array.from(container.querySelectorAll('.opt-hi-input')).map(i => i.value);
      const currentImg = optionImgWidgets.map(w => w.getValue());
      renderOptionBuilderRows(currentEn, currentHi, currentImg);
      updatePreview();
    } else {
      alert('Maximum 6 options allowed per question.');
    }
  });

  btnRemOpt.addEventListener('click', () => {
    if (optionsCount > 2) {
      optionsCount--;
      if (correctOptionIndex >= optionsCount) correctOptionIndex = 0;
      const currentEn = Array.from(container.querySelectorAll('.opt-en-input')).map(i => i.value);
      const currentHi = Array.from(container.querySelectorAll('.opt-hi-input')).map(i => i.value);
      const currentImg = optionImgWidgets.map(w => w.getValue());
      renderOptionBuilderRows(currentEn, currentHi, currentImg);
      updatePreview();
    } else {
      alert('Minimum 2 options required per question.');
    }
  });

  // Tab Switching & Live Preview Language Switch
  tabEn.addEventListener('click', () => {
    activeLang = 'en';
    tabEn.classList.add('active'); tabHi.classList.remove('active');
    tabEn.style.borderBottom = '3px solid var(--primary)'; tabHi.style.borderBottom = 'none';
    secEn.style.display = 'block'; secHi.style.display = 'none';
    passEn.style.display = 'block'; passHi.style.display = 'none';
    expEn.style.display = 'block'; expHi.style.display = 'none';
    prevLangLabel.textContent = 'English';
    updatePreview();
  });

  tabHi.addEventListener('click', () => {
    activeLang = 'hi';
    tabHi.classList.add('active'); tabEn.classList.remove('active');
    tabHi.style.borderBottom = '3px solid var(--accent)'; tabEn.style.borderBottom = 'none';
    secHi.style.display = 'block'; secEn.style.display = 'none';
    passHi.style.display = 'block'; passEn.style.display = 'none';
    expHi.style.display = 'block'; expEn.style.display = 'none';
    prevLangLabel.textContent = 'Hindi (हिंदी)';
    updatePreview();
  });

  btnBack.addEventListener('click', () => navigate(returnView));

  // Populate Categories
  try {
    const catRes = await apiRequest('/categories').catch(() => ({ flatCategories: [] }));
    const loadedCategories = catRes.flatCategories || [];
    const globalCats = loadedCategories.filter(c => !c.institute_id || c.is_global);
    const privateCats = loadedCategories.filter(c => c.institute_id && !c.is_global);

    let optsHtml = '<option value="">-- Select Category --</option>';
    if (globalCats.length > 0) {
      optsHtml += `<optgroup label="🌐 Global Master Categories">` +
        globalCats.map(c => `<option value="${c.id}">${c.icon || '📂'} ${c.name}</option>`).join('') +
        `</optgroup>`;
    }
    if (privateCats.length > 0) {
      optsHtml += `<optgroup label="🏫 Institute Private Categories">` +
        privateCats.map(c => `<option value="${c.id}">${c.icon || '📂'} ${c.name}</option>`).join('') +
        `</optgroup>`;
    }
    qSec.innerHTML = optsHtml;
  } catch (e) { console.warn('Could not load categories:', e); }

  // Dynamic Live Preview Update
  function updatePreview() {
    prevDiffBadge.textContent = qDiff.value || 'Medium';

    // 1. Passage
    const pTextVal = activeLang === 'hi' ? (pTextHi.value || pTextEn.value) : pTextEn.value;
    const pImgVal = passageImgWidget.getValue();
    const prevPassageBox = container.querySelector('#prevPassageBox');
    const prevPassageText = container.querySelector('#prevPassageText');
    const prevPassageImg = container.querySelector('#prevPassageImg');

    if (pTextVal.trim() || pImgVal) {
      prevPassageBox.style.display = 'block';
      prevPassageText.innerHTML = pTextVal;
      if (pImgVal) { prevPassageImg.src = pImgVal; prevPassageImg.style.display = 'block'; }
      else { prevPassageImg.style.display = 'none'; }
    } else {
      prevPassageBox.style.display = 'none';
    }

    // 2. Question Text
    const qTextVal = activeLang === 'hi' ? (qTextHi.value || qTextEn.value) : qTextEn.value;
    const prevQText = container.querySelector('#prevQText');
    const prevQImg = container.querySelector('#prevQImg');
    prevQText.innerHTML = qTextVal || `Type a question statement in ${activeLang === 'hi' ? 'Hindi' : 'English'}...`;

    const qImgVal = questionImgWidget.getValue();
    if (qImgVal) { prevQImg.src = qImgVal; prevQImg.style.display = 'block'; }
    else { prevQImg.style.display = 'none'; }

    // 3. Options Grid
    const prevOpts = container.querySelector('#prevOptionsContainer');
    prevOpts.innerHTML = '';
    const radios = container.querySelectorAll('input[name="correct_opt_idx"]');
    radios.forEach(r => { if (r.checked) correctOptionIndex = parseInt(r.value, 10); });

    const enOpts = Array.from(container.querySelectorAll('.opt-en-input')).map(i => i.value);
    const hiOpts = Array.from(container.querySelectorAll('.opt-hi-input')).map(i => i.value);
    const imgOpts = optionImgWidgets.map(w => w.getValue());

    for (let idx = 0; idx < optionsCount; idx++) {
      const isSelected = idx === correctOptionIndex;
      const optVal = activeLang === 'hi' ? (hiOpts[idx] || enOpts[idx]) : enOpts[idx];
      const optImg = imgOpts[idx] || '';

      const div = document.createElement('div');
      div.className = `option-btn ${isSelected ? 'selected' : ''}`;
      div.style.cssText = `padding: 10px 14px; border: 2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}; background: ${isSelected ? 'var(--primary-light)' : 'var(--card-bg)'}; border-radius: var(--radius-md); font-weight: 600; display:flex; flex-direction:column; gap:6px;`;

      div.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="width:24px; height:24px; border-radius:50%; background:${isSelected ? 'var(--primary)' : 'var(--border-color)'}; color:${isSelected ? '#fff' : 'var(--text-main)'}; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:800;">${String.fromCharCode(65 + idx)}</span>
          <span style="white-space:pre-line;" class="katex-render">${optVal || `Option ${String.fromCharCode(65 + idx)}`}</span>
          ${isSelected ? '<span style="color:var(--success); font-weight:bold; font-size:1.1rem; margin-left:auto;">✓</span>' : ''}
        </div>
        ${optImg ? `<img src="${optImg}" style="max-width:100%; max-height:140px; border-radius:4px; margin-top:4px;" onerror="this.style.display='none'" />` : ''}
      `;
      prevOpts.appendChild(div);
    }

    // 4. Solution Explanation
    const expTextVal = activeLang === 'hi' ? (qExpHi.value || qExpEn.value) : qExpEn.value;
    const expImgVal = explanationImgWidget.getValue();
    const prevExpBox = container.querySelector('#prevExplanationBox');
    const prevExpText = container.querySelector('#prevExplanationText');
    const prevExpImg = container.querySelector('#prevExpImg');

    if (expTextVal.trim() || expImgVal) {
      prevExpBox.style.display = 'block';
      prevExpText.innerHTML = expTextVal;
      if (expImgVal) { prevExpImg.src = expImgVal; prevExpImg.style.display = 'block'; }
      else { prevExpImg.style.display = 'none'; }
    } else {
      prevExpBox.style.display = 'none';
    }

    renderMath(container.querySelector('#previewCard'));
  }

  container.addEventListener('input', updatePreview);
  container.addEventListener('change', updatePreview);

  // Dynamic Tags Chip Management
  let currentQuestionTags = [];

  function renderTagChips() {
    const tagsContainer = container.querySelector('#tags-chips-container');
    if (!tagsContainer) return;
    if (currentQuestionTags.length === 0) {
      tagsContainer.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted); font-style:italic;">No tags added yet. Add as many tags as needed.</span>';
      return;
    }

    tagsContainer.innerHTML = currentQuestionTags.map((t, idx) => `
      <span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color); font-weight:700; padding:4px 10px; display:inline-flex; align-items:center; gap:6px;">
        🏷️ ${t}
        <button type="button" class="btn-remove-tag-chip" data-idx="${idx}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-weight:bold; font-size:1.1rem; padding:0; line-height:1;" aria-label="Remove Tag">&times;</button>
      </span>
    `).join('');

    tagsContainer.querySelectorAll('.btn-remove-tag-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(btn.dataset.idx, 10);
        currentQuestionTags.splice(idx, 1);
        renderTagChips();
      });
    });
  }

  function addTagFromInput() {
    const tagInp = container.querySelector('#input-new-tag');
    if (!tagInp) return;
    const rawVal = tagInp.value.trim();
    if (!rawVal) return;

    const newTags = rawVal.split(',').map(t => t.trim()).filter(Boolean);
    newTags.forEach(t => {
      if (!currentQuestionTags.includes(t)) {
        currentQuestionTags.push(t);
      }
    });

    tagInp.value = '';
    renderTagChips();
  }

  const btnAddTag = container.querySelector('#btn-add-tag-chip');
  const inputNewTag = container.querySelector('#input-new-tag');

  if (btnAddTag) btnAddTag.addEventListener('click', addTagFromInput);
  if (inputNewTag) {
    inputNewTag.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTagFromInput();
      }
    });
  }

  renderTagChips();

  // Initialize 4 default options
  renderOptionBuilderRows();

  // Load Question Details if editing
  if (questionId) {
    try {
      const res = await apiRequest(`/exams/questions/all`);
      const allQ = res.questions || [];
      const target = allQ.find(q => q.id == questionId);
      if (target) {
        qTextEn.value = target.question_text_en || target.question_text || '';
        qTextHi.value = target.question_text_hi || '';
        qExpEn.value = target.explanation_en || target.explanation || '';
        qExpHi.value = target.explanation_hi || '';
        qDiff.value = target.difficulty || 'medium';
        if (target.category_id) qSec.value = target.category_id;
        if (qGlobal) qGlobal.checked = !!target.is_global;

        if (target.passage_text_en) pTextEn.value = target.passage_text_en;
        if (target.passage_text_hi) pTextHi.value = target.passage_text_hi;
        if (target.passage_image_url) passageImgWidget.setValue(target.passage_image_url);
        if (target.image_url) questionImgWidget.setValue(target.image_url);
        if (target.explanation_image_url) explanationImgWidget.setValue(target.explanation_image_url);

        if (Array.isArray(target.tags) && target.tags.length > 0) {
          currentQuestionTags = [...target.tags];
        } else if (target.tag_names) {
          currentQuestionTags = target.tag_names.split(',').map(t => t.trim()).filter(Boolean);
        }
        renderTagChips();

        const enOptsData = target.options_en || target.options || [];
        const hiOptsData = target.options_hi || [];
        const imgOptsData = (target.options_images || []).map(normalizeImageUrl);

        optionsCount = Math.max(2, Math.min(6, enOptsData.length || 4));
        correctOptionIndex = target.correct_option_index !== undefined ? target.correct_option_index : (target.correct_answer_index || 0);

        renderOptionBuilderRows(enOptsData, hiOptsData, imgOptsData);
        updatePreview();
      }
    } catch (err) { console.error('Failed loading question details:', err); }
  } else {
    updatePreview();
  }

  async function handleSave(keepEditing = false) {
    const enTextVal = qTextEn.value.trim();
    if (!enTextVal) {
      alert('Question Statement in English is required.');
      return;
    }

    const enOpts = Array.from(container.querySelectorAll('.opt-en-input')).map(i => i.value.trim());
    const hiOpts = Array.from(container.querySelectorAll('.opt-hi-input')).map(i => i.value.trim());
    const imgOpts = optionImgWidgets.map(w => w.getValue());

    const payload = {
      category_id: qSec.value ? parseInt(qSec.value, 10) : null,
      difficulty: qDiff.value,
      passage_text_en: pTextEn.value.trim(),
      passage_text_hi: pTextHi.value.trim(),
      passage_image_url: passageImgWidget.getValue(),
      question_text_en: enTextVal,
      question_text_hi: qTextHi.value.trim(),
      image_url: questionImgWidget.getValue(),
      options_en: enOpts,
      options_hi: hiOpts,
      options_images: imgOpts,
      correct_option_index: correctOptionIndex,
      explanation_en: qExpEn.value.trim(),
      explanation_hi: qExpHi.value.trim(),
      explanation_image_url: explanationImgWidget.getValue(),
      is_global: qGlobal ? qGlobal.checked : false,
      tags: currentQuestionTags
    };

    // DEFERRED BATCH UPLOAD: Upload any pending local files before saving question record
    if (pendingImageFiles.size > 0) {
      showLoadingOverlay('Uploading Image Assets...', `Uploading ${pendingImageFiles.size} image asset(s) to server...`);
      try {
        for (const [fieldKey, file] of pendingImageFiles.entries()) {
          const formData = new FormData();
          formData.append('image', file);
          const uploadRes = await apiRequest('/images/upload', { method: 'POST', body: formData });
          const uploadedUrl = normalizeImageUrl(uploadRes.imageUrl || uploadRes.fullUrl);

          if (fieldKey === 'passage') payload.passage_image_url = uploadedUrl;
          else if (fieldKey === 'question') payload.image_url = uploadedUrl;
          else if (fieldKey === 'explanation') payload.explanation_image_url = uploadedUrl;
          else if (fieldKey.startsWith('option_')) {
            const optIdx = parseInt(fieldKey.replace('option_', ''), 10);
            if (!isNaN(optIdx) && optIdx < payload.options_images.length) {
              payload.options_images[optIdx] = uploadedUrl;
            }
          }
        }
      } catch (uploadErr) {
        hideLoadingOverlay();
        alert('Failed to upload image assets: ' + uploadErr.message);
        return;
      } finally {
        hideLoadingOverlay();
      }
    }

    try {
      if (questionId) {
        await apiRequest(`/exams/questions/${questionId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/exams/questions', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      // Cleanup pending maps & blob URLs
      activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
      activeBlobUrls.clear();
      pendingImageFiles.clear();

      if (keepEditing) {
        alert('Master question saved successfully!');
        qTextEn.value = ''; qTextHi.value = '';
        qExpEn.value = ''; qExpHi.value = '';
        pTextEn.value = ''; pTextHi.value = '';
        passageImgWidget.setValue('');
        questionImgWidget.setValue('');
        explanationImgWidget.setValue('');
        currentQuestionTags = [];
        renderTagChips();
        optionsCount = 4; correctOptionIndex = 0;
        renderOptionBuilderRows();
        updatePreview();
      } else {
        navigate(returnView);
      }
    } catch (err) {
      alert(err.message || 'Error saving master question.');
    }
  }

  btnSave.addEventListener('click', () => handleSave(false));
  btnSaveNext.addEventListener('click', () => handleSave(true));
}
