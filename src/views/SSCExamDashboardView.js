import { apiRequest, getUser } from '../services/api.js';
import { ExamSessionManager, PALETTE_STATES } from '../services/examSession.js';
import { renderRichContent } from '../services/richContent.js';

export function renderSSCExamDashboardView(attemptId, navigate, extraParams = {}) {
  const container = document.createElement('div');
  container.className = 'ssc-viewport-container';

  container.innerHTML = `
    <!-- SSC Header -->
    <header class="ssc-header">
      <div class="ssc-header-left">
        <div class="ssc-logo-box">SSC</div>
        <div>
          <h2 id="ssc-exam-title" class="ssc-exam-title">Staff Selection Commission Examination</h2>
          <span id="ssc-inst-name" class="ssc-inst-sub">Coaching Portal</span>
        </div>
      </div>

      <div class="ssc-header-center">
        <button id="btn-question-paper" class="ssc-btn-hdr" title="Question Paper" aria-label="Question Paper">
          <i class="ri-file-text-line"></i> <span class="btn-text-desktop">Question Paper</span>
        </button>
        <button id="btn-instructions" class="ssc-btn-hdr" title="Instructions" aria-label="Instructions">
          <i class="ri-information-line"></i> <span class="btn-text-desktop">Instructions</span>
        </button>
      </div>

      <div class="ssc-header-right">
        <div class="ssc-timer-box">
          <span class="ssc-timer-lbl">Time Left:</span>
          <span id="ssc-countdown" class="ssc-timer-val">00:00:00</span>
        </div>
        <div class="ssc-profile-box">
          <div class="ssc-avatar" id="ssc-avatar-initials">S</div>
          <div class="ssc-profile-info">
            <span id="ssc-candidate-name" class="ssc-cand-name">Candidate Name</span>
            <span class="ssc-cand-id">Lab ID: C215</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Section Navigation Bar -->
    <nav class="ssc-sec-bar">
      <span class="ssc-sec-lbl">Sections:</span>
      <div id="ssc-sec-tabs" class="ssc-sec-tabs">
        <!-- Dynamic Section Tabs -->
      </div>
    </nav>

    <!-- Main 2-Column Workspace -->
    <main class="ssc-workspace">
      <!-- Left Question Canvas -->
      <section class="ssc-question-canvas">
        <div class="ssc-q-hdr">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span id="ssc-q-num" class="ssc-q-num">Question No. 1</span>
            <span id="ssc-q-marks" class="ssc-q-marks">Marks: +2.00 / -0.50</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">View in:</label>
            <select id="ssc-lang-toggle" class="ssc-lang-select">
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
            </select>
          </div>
        </div>

        <!-- Scrollable Question Body -->
        <div class="ssc-q-body" id="ssc-q-body">
          <!-- Passage/Instruction Left/Top Pane -->
          <div id="ssc-passage-pane" class="ssc-passage-pane" style="display: none;">
            <div id="ssc-passage-box" class="ssc-passage-box"></div>
          </div>

          <!-- Question Statement & Options Right/Bottom Pane -->
          <div id="ssc-question-pane" class="ssc-question-pane">
            <!-- Question Text -->
            <div id="ssc-q-text" class="ssc-q-text">Loading question text...</div>

            <!-- Question Image if present -->
            <div id="ssc-q-img-box" style="margin: 12px 0; display: none;">
              <img id="ssc-q-img" src="" alt="Question Image" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color);">
            </div>

            <!-- Radio Options List -->
            <div id="ssc-options-box" class="ssc-options-box">
              <!-- Dynamic Options -->
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <footer class="ssc-action-bar">
          <div class="ssc-act-left">
            <button id="btn-mark-review" class="ssc-btn ssc-btn-purple" title="Mark for Review & Next" aria-label="Mark for Review & Next">
              <i class="ri-bookmark-fill"></i> <span class="btn-text-desktop">Mark for Review & Next</span>
            </button>
            <button id="btn-clear-resp" class="ssc-btn ssc-btn-outline" title="Clear Response" aria-label="Clear Response">
              <i class="ri-eraser-line"></i> <span class="btn-text-desktop">Clear Response</span>
            </button>
          </div>
          <div class="ssc-act-right">
            <button id="btn-toggle-palette" class="ssc-btn ssc-btn-outline" title="Question Palette" aria-label="Question Palette">
              <i class="ri-grid-fill"></i> <span class="btn-text-desktop">Palette</span>
            </button>
            <button id="btn-prev-q" class="ssc-btn ssc-btn-outline" title="Previous Question" aria-label="Previous Question">
              <i class="ri-arrow-left-s-line"></i><span class="btn-text-desktop"> Previous</span>
            </button>
            <button id="btn-save-next" class="ssc-btn ssc-btn-green" title="Save & Next" aria-label="Save & Next">
              <span class="btn-text-desktop">Save & Next </span><i class="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </footer>
      </section>

      <!-- Right Sidebar (Question Palette) -->
      <aside class="ssc-palette-sidebar" id="ssc-palette-sidebar">
        <!-- Palette Legend Summary -->
        <div class="ssc-legend-box">
          <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; color: var(--text-muted);">PALETTE LEGEND</h4>
          <div class="ssc-legend-grid">
            <div class="ssc-lg-item"><span class="ssc-badge badge-ans">0</span> Answered</div>
            <div class="ssc-lg-item"><span class="ssc-badge badge-not-ans">0</span> Not Answered</div>
            <div class="ssc-lg-item"><span class="ssc-badge badge-not-vis">0</span> Not Visited</div>
            <div class="ssc-lg-item"><span class="ssc-badge badge-review">0</span> Marked Review</div>
            <div class="ssc-lg-item" style="grid-column: 1/-1;"><span class="ssc-badge badge-ans-review">0</span> Answered & Marked (Evaluated)</div>
          </div>
        </div>

        <!-- Section Title in Palette -->
        <div id="ssc-palette-sec-title" class="ssc-palette-sec-title">Section: Reasoning</div>

        <!-- Scrollable Palette Grid -->
        <div id="ssc-palette-grid" class="ssc-palette-grid">
          <!-- Dynamic Q Palette Badges -->
        </div>

        <!-- Final Submit Exam Button -->
        <div style="padding: 14px; border-top: 1px solid var(--border-color); background: var(--card-bg);">
          <button id="btn-submit-exam" class="btn btn-primary" style="width: 100%; font-weight: 800; padding: 12px; background: #27ae60; border-color: #27ae60;" title="Submit Exam" aria-label="Submit Exam">
            <i class="ri-send-plane-fill"></i> <span class="btn-text-desktop">Submit Exam</span>
          </button>
        </div>
      </aside>

      <!-- Palette Drawer Mobile Backdrop Overlay -->
      <div id="ssc-palette-overlay" class="ssc-palette-overlay"></div>
    </main>

    <!-- Section Summary Modal -->
    <div id="ssc-summary-modal" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 2000; align-items: center; justify-content: center;">
      <div class="card" style="width: 100%; max-width: 720px; padding: 24px; background: var(--card-bg);">
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 6px;">Exam Section Summary</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 18px;">Please review your attempt summary before final submission.</p>

        <div style="overflow-x: auto; margin-bottom: 20px;">
          <table class="custom-table" style="width: 100%; font-size: 0.88rem;">
            <thead>
              <tr>
                <th>Section Name</th>
                <th>Total Qs</th>
                <th>Answered</th>
                <th>Not Answered</th>
                <th>Marked Review</th>
                <th>Ans & Marked</th>
                <th>Not Visited</th>
              </tr>
            </thead>
            <tbody id="ssc-summary-tbody">
              <!-- Dynamic Summary Rows -->
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button id="btn-summary-cancel" class="btn btn-outline">← Return to Exam</button>
          <button id="btn-summary-confirm" class="btn btn-primary" style="background: #27ae60; border-color: #27ae60; padding: 10px 24px;">
            Yes, Final Submit Exam
          </button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initSSCExamView(container, attemptId, navigate, extraParams);
  }, 0);

  return container;
}

let session = null;
let timerInterval = null;

async function initSSCExamView(container, attemptId, navigate, extraParams) {
  try {
    let startData = extraParams.startData;
    if (!startData) {
      // Re-fetch start session if direct navigation
      startData = await apiRequest(`/exams/${extraParams.examId || 1}/start`, { method: 'POST' });
    }

    const { attempt, exam, sections } = startData;
    session = new ExamSessionManager(attempt, exam, sections);

    if (extraParams.lang) {
      session.currentLanguage = extraParams.lang;
    }

    // Set Candidate Name & Header Info
    const currentUser = getUser() || { full_name: 'Candidate' };
    container.querySelector('#ssc-candidate-name').textContent = currentUser.full_name;
    container.querySelector('#ssc-avatar-initials').textContent = currentUser.full_name.charAt(0).toUpperCase();
    container.querySelector('#ssc-exam-title').textContent = exam.title;
    container.querySelector('#ssc-inst-name').textContent = exam.institute_name || 'Coaching Portal';

    container.querySelector('#ssc-q-marks').textContent = `Marks: +${parseFloat(exam.positive_marks).toFixed(2)} / -${parseFloat(exam.negative_marks).toFixed(2)}`;

    setupSSCViewEvents(container, navigate);
    renderSectionTabs(container);
    renderCurrentQuestion(container);
    renderPaletteGrid(container);

    startTimer(container, navigate);
    session.startAutoSave(30000);

  } catch (err) {
    console.error('SSC Exam view error:', err);
    alert('Could not initialize exam session.');
    navigate('dashboard');
  }
}

function startTimer(container, navigate) {
  if (timerInterval) clearInterval(timerInterval);

  const countdownEl = container.querySelector('#ssc-countdown');

  timerInterval = setInterval(() => {
    if (!session) return;

    session.remainingSeconds--;

    if (session.remainingSeconds <= 0) {
      clearInterval(timerInterval);
      countdownEl.textContent = '00:00:00';
      alert('Time is up! Your exam will be submitted automatically.');
      executeFinalSubmit(container, navigate, true);
      return;
    }

    const hrs = Math.floor(session.remainingSeconds / 3600);
    const mins = Math.floor((session.remainingSeconds % 3600) / 60);
    const secs = session.remainingSeconds % 60;

    const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    countdownEl.textContent = formatted;

    if (session.remainingSeconds < 300) {
      countdownEl.style.color = '#e74c3c';
      countdownEl.style.animation = 'pulse 1s infinite';
    }
  }, 1000);
}

function renderSectionTabs(container) {
  const tabsContainer = container.querySelector('#ssc-sec-tabs');
  tabsContainer.innerHTML = session.sections.map((sec, idx) => `
    <button class="ssc-tab ${idx === session.activeSectionIndex ? 'active' : ''}" data-idx="${idx}">
      ${sec.section_name}
    </button>
  `).join('');

  const activeTab = tabsContainer.querySelector('.ssc-tab.active');
  if (activeTab && typeof activeTab.scrollIntoView === 'function') {
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  tabsContainer.querySelectorAll('.ssc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (session.exam.allow_section_switch === false) {
        alert('Section switching is restricted in this exam.');
        return;
      }
      const idx = parseInt(tab.dataset.idx, 10);
      session.jumpToQuestion(idx, 0);
      renderSectionTabs(container);
      renderCurrentQuestion(container);
      renderPaletteGrid(container);
    });
  });
}

function renderCurrentQuestion(container) {
  if (!session) return;
  const currentQ = session.getCurrentQuestion();
  const stateObj = session.getCurrentState();
  const currentSec = session.getCurrentSection();

  if (!currentQ) return;

  container.querySelector('#ssc-q-num').textContent = `Question No. ${session.activeQuestionIndex + 1}`;
  container.querySelector('#ssc-palette-sec-title').textContent = `Section: ${currentSec.section_name}`;

  // Passage Box if comprehension
  const qBody = container.querySelector('#ssc-q-body');
  const passagePane = container.querySelector('#ssc-passage-pane');
  const passageBox = container.querySelector('#ssc-passage-box');
  const passageText = session.currentLanguage === 'hi' ? (currentQ.passage_text_hi || currentQ.passage_text_en) : currentQ.passage_text_en;

  if (passageText && passageText.trim().length > 0) {
    if (qBody) qBody.classList.add('has-passage');
    if (passagePane) passagePane.style.display = 'block';
    if (passageBox) passageBox.innerHTML = `<div style="font-weight:800; color:var(--primary); margin-bottom:6px; font-size:0.85rem;"><i class="ri-book-open-line"></i> Passage / Instructions:</div><div>${renderRichContent(passageText)}</div>`;
  } else {
    if (qBody) qBody.classList.remove('has-passage');
    if (passagePane) passagePane.style.display = 'none';
    if (passageBox) passageBox.innerHTML = '';
  }

  // Question Text (EN/HI) with KaTeX & Rich Content
  const qText = session.currentLanguage === 'hi' ? (currentQ.question_text_hi || currentQ.question_text_en) : currentQ.question_text_en;
  container.querySelector('#ssc-q-text').innerHTML = renderRichContent(qText);

  // Question Image
  const imgBox = container.querySelector('#ssc-q-img-box');
  const imgEl = container.querySelector('#ssc-q-img');
  if (currentQ.image_url) {
    imgBox.style.display = 'block';
    imgEl.src = currentQ.image_url;
  } else {
    imgBox.style.display = 'none';
  }

  // Options List with KaTeX & Rich Content
  const optsBox = container.querySelector('#ssc-options-box');
  const optionsArr = session.currentLanguage === 'hi' && currentQ.options_hi && currentQ.options_hi.length > 0
    ? currentQ.options_hi
    : (currentQ.options_en || []);

  const optLabels = ['(A)', '(B)', '(C)', '(D)', '(E)'];

  optsBox.innerHTML = optionsArr.map((optText, optIdx) => `
    <label class="ssc-opt-item ${stateObj.selectedOption === optIdx ? 'selected' : ''}">
      <input type="radio" name="ssc_opt_group" value="${optIdx}" ${stateObj.selectedOption === optIdx ? 'checked' : ''}>
      <span class="ssc-opt-label">${optLabels[optIdx] || optIdx + 1}</span>
      <span class="ssc-opt-text">${renderRichContent(optText)}</span>
    </label>
  `).join('');

  // Option change handler
  optsBox.querySelectorAll('input[name="ssc_opt_group"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      session.selectOption(idx);
      renderCurrentQuestion(container);
      renderPaletteGrid(container);
    });
  });
}

function renderPaletteGrid(container) {
  if (!session) return;

  const currentSec = session.getCurrentSection();
  const gridContainer = container.querySelector('#ssc-palette-grid');

  gridContainer.innerHTML = currentSec.questions.map((q, qIdx) => {
    const stateObj = session.stateMap.get(q.id);
    const state = stateObj ? stateObj.paletteState : PALETTE_STATES.NOT_VISITED;

    let stateClass = 'badge-not-vis';
    if (state === PALETTE_STATES.NOT_ANSWERED) stateClass = 'badge-not-ans';
    else if (state === PALETTE_STATES.ANSWERED) stateClass = 'badge-ans';
    else if (state === PALETTE_STATES.MARKED_FOR_REVIEW) stateClass = 'badge-review';
    else if (state === PALETTE_STATES.ANSWERED_AND_MARKED) stateClass = 'badge-ans-review';

    const isActive = qIdx === session.activeQuestionIndex;

    return `
      <button class="ssc-badge ${stateClass} ${isActive ? 'active-q' : ''}" data-qidx="${qIdx}">
        ${String(qIdx + 1).padStart(2, '0')}
      </button>
    `;
  }).join('');

  // Palette button jump listener
  gridContainer.querySelectorAll('.ssc-badge').forEach(badge => {
    badge.addEventListener('click', () => {
      const qIdx = parseInt(badge.dataset.qidx, 10);
      session.jumpToQuestion(session.activeSectionIndex, qIdx);
      renderCurrentQuestion(container);
      renderPaletteGrid(container);

      const paletteSidebar = container.querySelector('#ssc-palette-sidebar');
      const paletteOverlay = container.querySelector('#ssc-palette-overlay');
      if (paletteSidebar && paletteSidebar.classList.contains('mobile-open')) {
        paletteSidebar.classList.remove('mobile-open');
        if (paletteOverlay) paletteOverlay.classList.remove('active');
      }
    });
  });

  // Update Legend Badge Counters
  const summary = session.getSectionSummary();
  let totAns = 0, totNotAns = 0, totNotVis = 0, totReview = 0, totAnsReview = 0;

  summary.forEach(s => {
    totAns += s.answered;
    totNotAns += s.notAnswered;
    totNotVis += s.notVisited;
    totReview += s.marked;
    totAnsReview += s.ansAndMarked;
  });

  const legendBox = container.querySelector('.ssc-legend-grid');
  if (legendBox) {
    legendBox.querySelector('.badge-ans').textContent = totAns;
    legendBox.querySelector('.badge-not-ans').textContent = totNotAns;
    legendBox.querySelector('.badge-not-vis').textContent = totNotVis;
    legendBox.querySelector('.badge-review').textContent = totReview;
    legendBox.querySelector('.badge-ans-review').textContent = totAnsReview;
  }
}

function setupSSCViewEvents(container, navigate) {
  // Mobile Off-Canvas Palette Drawer Toggle
  const paletteSidebar = container.querySelector('#ssc-palette-sidebar');
  const paletteOverlay = container.querySelector('#ssc-palette-overlay');
  const btnTogglePalette = container.querySelector('#btn-toggle-palette');

  if (btnTogglePalette && paletteSidebar && paletteOverlay) {
    const togglePalette = () => {
      paletteSidebar.classList.toggle('mobile-open');
      paletteOverlay.classList.toggle('active');
    };
    btnTogglePalette.addEventListener('click', togglePalette);
    paletteOverlay.addEventListener('click', togglePalette);
  }

  // Action Bar Buttons
  container.querySelector('#btn-save-next').addEventListener('click', () => {
    session.saveAndNext();
    renderSectionTabs(container);
    renderCurrentQuestion(container);
    renderPaletteGrid(container);
  });

  container.querySelector('#btn-mark-review').addEventListener('click', () => {
    session.markForReviewAndNext();
    renderSectionTabs(container);
    renderCurrentQuestion(container);
    renderPaletteGrid(container);
  });

  container.querySelector('#btn-clear-resp').addEventListener('click', () => {
    session.clearResponse();
    renderCurrentQuestion(container);
    renderPaletteGrid(container);
  });

  container.querySelector('#btn-prev-q').addEventListener('click', () => {
    session.prevQuestion();
    renderSectionTabs(container);
    renderCurrentQuestion(container);
    renderPaletteGrid(container);
  });

  // Language Switcher
  const langSelect = container.querySelector('#ssc-lang-toggle');
  langSelect.value = session.currentLanguage;
  langSelect.addEventListener('change', (e) => {
    session.currentLanguage = e.target.value;
    renderCurrentQuestion(container);
  });

  // Summary Modal & Submit Handlers
  const modal = container.querySelector('#ssc-summary-modal');
  const btnSubmit = container.querySelector('#btn-submit-exam');
  const btnCancel = container.querySelector('#btn-summary-cancel');
  const btnConfirm = container.querySelector('#btn-summary-confirm');

  btnSubmit.addEventListener('click', () => {
    renderSummaryModal(container);
    modal.style.display = 'flex';
  });

  btnCancel.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  btnConfirm.addEventListener('click', () => {
    modal.style.display = 'none';
    executeFinalSubmit(container, navigate, false);
  });
}

function renderSummaryModal(container) {
  const summary = session.getSectionSummary();
  const tbody = container.querySelector('#ssc-summary-tbody');

  tbody.innerHTML = summary.map(s => `
    <tr>
      <td style="font-weight: 700;">${s.sectionName}</td>
      <td style="font-weight: 700;">${s.totalQuestions}</td>
      <td style="color: #27ae60; font-weight: 700;">${s.answered}</td>
      <td style="color: #c0392b; font-weight: 700;">${s.notAnswered}</td>
      <td style="color: #8e44ad; font-weight: 700;">${s.marked}</td>
      <td style="color: #8e44ad; font-weight: 700;">${s.ansAndMarked}</td>
      <td>${s.notVisited}</td>
    </tr>
  `).join('');
}

async function executeFinalSubmit(container, navigate, isAutoSubmit) {
  if (timerInterval) clearInterval(timerInterval);
  if (session) session.stopAutoSave();

  try {
    const payload = session.getPayloadForSubmit();
    payload.is_auto_submit = isAutoSubmit;

    const res = await apiRequest(`/exams/attempts/${session.attempt.id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    alert(`Exam Submitted Successfully!\nYour Score: ${res.totalScore} | Accuracy: ${res.accuracyPct}%\n\nOpening detailed scorecard & item-level analysis...`);
    navigate('exam-analysis', { attemptId: session.attempt.id });

  } catch (err) {
    console.error('Submission failed:', err);
    alert('Submission failed. Retrying...');
  }
}
