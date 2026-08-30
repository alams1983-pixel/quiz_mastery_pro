import { api, getUser } from '../services/api.js';
import { renderMath } from '../services/katexRenderer.js';
import { renderRichContent } from '../services/richContent.js';
import { generateQuizPDFReport } from '../services/pdfGenerator.js';

export function renderQuizView(quizId, customData, navigate) {
  const container = document.createElement('div');
  container.className = 'view-container';

  container.innerHTML = `
    <div class="quiz-wrapper" id="quizWrapper">
      <!-- 1. START SCREEN -->
      <div id="startScreen" style="text-align:center; padding: 20px 0;">
        <div style="font-size:3rem; margin-bottom:8px; color:var(--primary);">📘</div>
        <h1 id="quizTitleHeader" style="font-size:2rem; font-weight:700; margin-bottom:8px;">Mastery Quiz</h1>
        <p id="quizDescHeader" style="color:var(--text-muted); font-size:1rem; margin-bottom:24px;">
          Learn by repetition — master each question by answering correctly multiple times.
        </p>

        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; margin-bottom:24px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Total Questions</span>
            <div id="totalQtyDisplay" style="font-size:1.6rem; font-weight:700; color:var(--primary);">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Quiz Mode</span>
            <div style="font-size:1.1rem; font-weight:600; color:var(--text-main);">Mastery Repetition</div>
          </div>
        </div>

        <!-- Mastery required selector -->
        <div style="background:var(--primary-light); border:1px solid var(--primary-border); border-radius:var(--radius-md); padding:20px; margin-bottom:28px; text-align:left;">
          <label style="font-weight:700; color:var(--primary); display:block; margin-bottom:12px;">
            🎯 Select Mastery required (correct answers needed per question):
          </label>
          <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
            ${[1, 2, 3, 4, 5].map(lvl => `
              <label style="background:var(--card-bg); padding:8px 18px; border-radius:var(--radius-pill); border:1.5px solid var(--border-color); cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px;">
                <input type="radio" name="mastery" value="${lvl}" ${lvl === 1 ? 'checked' : ''} /> ${lvl} ${lvl === 1 ? '(Standard)' : ''}
              </label>
            `).join('')}
          </div>
        </div>

        <button class="btn" id="startQuizBtn" style="min-width:240px;">Start Mastery Session</button>
      </div>

      <!-- 2. QUIZ ACTIVE SCREEN -->
      <div id="activeScreen" style="display:none;">
        <div class="quiz-header">
          <div class="mastery-status" id="masteryStatus">Mastered: 0 / 0</div>
          <div class="timer-badge" id="timerDisplay">00:00</div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" id="progressFill"></div>
        </div>

        <div class="question-card" id="questionCard">
          <div class="q-text" id="qText">Loading question...</div>
          <img id="qImg" class="question-img" style="display:none;" />
          <div class="options-grid" id="optionsContainer"></div>

          <!-- Feedback block -->
          <div class="feedback" id="feedback">
            <div class="fb-head" id="fbHead"></div>
            <div class="fb-correct" id="fbCorrectAnswer"></div>
            <div class="fb-explain" id="fbExplain"></div>
          </div>

          <div id="nextBtnContainer" style="display:none; margin-top:20px; text-align:right;">
            <button class="btn" id="nextQuestionBtn" title="Next Question" aria-label="Next Question"><span class="btn-text-desktop">Next Question </span><i class="ri-arrow-right-line"></i></button>
          </div>
        </div>
      </div>

      <!-- 3. COMPLETION SCREEN -->
      <div id="completionScreen" style="display:none; text-align:center; padding:20px 0;">
        <div style="font-size:3.5rem; margin-bottom:8px;">🎉</div>
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:6px;">EdutorAi Pro Practice Complete!</h2>
        <p style="color:var(--text-muted); font-size:1rem; margin-bottom:20px;">
          You have mastered every question according to your required repetition target.
        </p>

        <!-- Guest Notice Banner -->
        <div id="guestNoticeBanner" style="display:none; background:var(--primary-light); border:1px solid var(--primary-border); border-radius:var(--radius-md); padding:14px 20px; margin-bottom:24px; text-align:center;">
          <span style="font-size:0.92rem; font-weight:600; color:var(--primary);">
            💡 You took this quiz as a Guest. Sign in or register to save your attempt history & track analytics!
          </span>
          <button class="btn btn-sm" id="guestSignInBtn" style="margin-left:12px;">Sign In to Track Analytics</button>
        </div>

        <!-- Stats Grid -->
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; margin-bottom:28px; display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:12px;">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Total Qs</span>
            <div id="statTotal" style="font-size:1.5rem; font-weight:700; color:var(--primary);">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Attempts</span>
            <div id="statAttempts" style="font-size:1.5rem; font-weight:700;">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Correct</span>
            <div id="statCorrect" style="font-size:1.5rem; font-weight:700; color:var(--success);">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Wrong</span>
            <div id="statWrong" style="font-size:1.5rem; font-weight:700; color:var(--danger);">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Accuracy</span>
            <div id="statAccuracy" style="font-size:1.5rem; font-weight:700; color:var(--success);">0%</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Time</span>
            <div id="statTime" style="font-size:1.5rem; font-weight:700;">00:00</div>
          </div>
        </div>

        <!-- Summary Table -->
        <div style="margin-bottom:28px; text-align:left;">
          <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:12px;">📊 Question Performance Summary</h3>
          <div class="table-wrap">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Question Item</th>
                  <th>Required Mastery</th>
                  <th>Total Attempts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="summaryTableBody"></tbody>
            </table>
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
          <button class="btn" id="downloadPdfBtn" style="background:#047857;" title="Download PDF Report" aria-label="Download PDF Report">
            <i class="ri-file-pdf-2-line"></i> <span class="btn-text-desktop">Download PDF Report</span>
          </button>
          <button class="btn btn-secondary" id="restartQuizBtn" title="Restart Session" aria-label="Restart Session">
            <i class="ri-refresh-line"></i> <span class="btn-text-desktop">Restart Session</span>
          </button>
          <button class="btn btn-secondary" id="backCatalogBtn" title="Back to Catalogue" aria-label="Back to Catalogue">
            <i class="ri-arrow-left-line"></i> <span class="btn-text-desktop">Back to Catalogue</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // State
  let quizData = { title: 'Mastery Practice', description: '' };
  let questions = [];
  let pool = [];
  let masteryLevel = 1;
  let correctCounts = {};
  let wrongCounts = {};
  let totalCorrect = 0;
  let totalWrong = 0;
  let timerSeconds = 0;
  let timerInterval = null;
  let isAnswered = false;
  let currentQuestion = null;
  let currentShuffledOptions = [];
  let itemStartTime = 0;
  let questionTimings = {};
  let lastAttemptPayload = null;

  // DOM elements
  const startScreen = container.querySelector('#startScreen');
  const activeScreen = container.querySelector('#activeScreen');
  const completionScreen = container.querySelector('#completionScreen');
  const startBtn = container.querySelector('#startQuizBtn');

  const timerDisplay = container.querySelector('#timerDisplay');
  const masteryStatus = container.querySelector('#masteryStatus');
  const progressFill = container.querySelector('#progressFill');

  const qText = container.querySelector('#qText');
  const qImg = container.querySelector('#qImg');
  const optionsContainer = container.querySelector('#optionsContainer');

  const feedback = container.querySelector('#feedback');
  const fbHead = container.querySelector('#fbHead');
  const fbCorrectAnswer = container.querySelector('#fbCorrectAnswer');
  const fbExplain = container.querySelector('#fbExplain');

  const nextBtnContainer = container.querySelector('#nextBtnContainer');
  const nextQuestionBtn = container.querySelector('#nextQuestionBtn');

  const guestNoticeBanner = container.querySelector('#guestNoticeBanner');
  const guestSignInBtn = container.querySelector('#guestSignInBtn');

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async function loadQuizData() {
    try {
      if (customData && customData.isWeakArea) {
        quizData = { title: 'Weak Areas Targeted Quiz', description: 'Personalized practice focusing on weak questions' };
        questions = customData.questions;
      } else {
        const qRes = await api.getQuiz(quizId);
        quizData = qRes.quiz;
        const qstRes = await api.getQuestions(quizId);
        questions = qstRes.questions;
      }

      container.querySelector('#quizTitleHeader').textContent = quizData.title;
      container.querySelector('#quizDescHeader').textContent = quizData.description || 'Practice & repetition quiz mode.';
      container.querySelector('#totalQtyDisplay').textContent = questions.length;
    } catch (err) {
      alert('Error loading quiz: ' + err.message);
      navigate('dashboard');
    }
  }

  function initSession() {
    const radio = container.querySelector('input[name="mastery"]:checked');
    masteryLevel = radio ? parseInt(radio.value, 10) : 1;

    correctCounts = {};
    wrongCounts = {};
    questionTimings = {};
    totalCorrect = 0;
    totalWrong = 0;
    timerSeconds = 0;
    isAnswered = false;

    questions.forEach(q => {
      correctCounts[q.id] = 0;
      wrongCounts[q.id] = 0;
      questionTimings[q.id] = 0;
    });

    pool = questions.map(q => q.id);
    shuffle(pool);
  }

  startBtn.addEventListener('click', () => {
    initSession();
    startScreen.style.display = 'none';
    activeScreen.style.display = 'block';

    timerSeconds = 0;
    timerDisplay.textContent = '00:00';
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timerSeconds++;
      timerDisplay.textContent = formatTime(timerSeconds);
    }, 1000);

    updateProgress();
    loadNextQuestion();
  });

  function loadNextQuestion() {
    if (pool.length === 0) {
      finishQuiz();
      return;
    }

    const poolIdx = Math.floor(Math.random() * pool.length);
    const qId = pool[poolIdx];
    currentQuestion = questions.find(q => q.id === qId);

    if (!currentQuestion) {
      pool.splice(poolIdx, 1);
      loadNextQuestion();
      return;
    }

    isAnswered = false;
    itemStartTime = Date.now();

    qText.innerHTML = renderRichContent(currentQuestion.question_text);

    if (currentQuestion.image_path) {
      qImg.src = `/api/images/${currentQuestion.image_path}`;
      qImg.style.display = 'block';
    } else {
      qImg.style.display = 'none';
    }

    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    optionsContainer.innerHTML = '';
    const rawOpts = (currentQuestion.options || []).map((text, origIdx) => ({ text, origIdx }));
    currentShuffledOptions = shuffle([...rawOpts]);

    currentShuffledOptions.forEach((optObj, displayIdx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="opt-label">${labels[displayIdx]}</span><span class="opt-text">${renderRichContent(optObj.text)}</span>`;
      btn.addEventListener('click', () => handleChoice(displayIdx));
      optionsContainer.appendChild(btn);
    });

    feedback.className = 'feedback';
    fbCorrectAnswer.textContent = '';
    fbExplain.innerHTML = '';
    nextBtnContainer.style.display = 'none';

    renderMath(container.querySelector('#questionCard'));
  }

  async function handleChoice(displayIdx) {
    if (isAnswered) return;
    isAnswered = true;

    const timeSpentSec = Math.max(1, Math.round((Date.now() - itemStartTime) / 1000));
    questionTimings[currentQuestion.id] = (questionTimings[currentQuestion.id] || 0) + timeSpentSec;

    const optionBtns = optionsContainer.querySelectorAll('.option-btn');
    optionBtns.forEach(b => b.classList.add('disabled-opt'));

    const selectedOpt = currentShuffledOptions[displayIdx];
    const isCorrect = (selectedOpt && selectedOpt.origIdx === currentQuestion.correct_answer_index);
    const correctOptText = currentQuestion.options[currentQuestion.correct_answer_index];

    optionBtns.forEach((b, idx) => {
      const opt = currentShuffledOptions[idx];
      if (opt && opt.origIdx === currentQuestion.correct_answer_index) b.classList.add('correct-opt');
      if (idx === displayIdx && !isCorrect) b.classList.add('wrong-opt');
    });

    if (isCorrect) {
      correctCounts[currentQuestion.id] = (correctCounts[currentQuestion.id] || 0) + 1;
      totalCorrect++;
      if (correctCounts[currentQuestion.id] >= masteryLevel) {
        const idxInPool = pool.indexOf(currentQuestion.id);
        if (idxInPool !== -1) pool.splice(idxInPool, 1);
      }
    } else {
      wrongCounts[currentQuestion.id] = (wrongCounts[currentQuestion.id] || 0) + 1;
      totalWrong++;
      shuffle(pool); // Shuffle pool on mistake
    }

    // Feedback
    feedback.className = `feedback visible ${isCorrect ? 'correct' : 'wrong'}`;
    fbHead.textContent = isCorrect ? '✅ Correct!' : '❌ Incorrect';
    fbCorrectAnswer.textContent = isCorrect ? '' : `Correct Answer: ${correctOptText}`;
    fbExplain.innerHTML = renderRichContent(currentQuestion.explanation || '');
    renderMath(feedback);

    updateProgress();

    // Show prominent manual Next Question button
    nextBtnContainer.style.display = 'block';

    // Log telemetry ONLY IF user is authenticated
    const user = getUser();
    if (user) {
      api.logQuestion({
        question_id: currentQuestion.id,
        quiz_id: quizId || currentQuestion.quiz_id,
        is_correct: isCorrect,
        time_spent_sec: timeSpentSec,
        selected_option_index: selectedOpt ? selectedOpt.origIdx : 0
      }).catch(console.error);
    }
  }

  nextQuestionBtn.addEventListener('click', () => {
    loadNextQuestion();
  });

  function updateProgress() {
    const total = questions.length;
    let mastered = 0;
    questions.forEach(q => {
      if ((correctCounts[q.id] || 0) >= masteryLevel) mastered++;
    });
    const pct = total > 0 ? (mastered / total) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    masteryStatus.textContent = `Mastered: ${mastered} / ${total}`;
  }

  async function finishQuiz() {
    if (timerInterval) clearInterval(timerInterval);

    const totalQuestions = questions.length;
    const totalAttempts = totalCorrect + totalWrong;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    container.querySelector('#statTotal').textContent = totalQuestions;
    container.querySelector('#statAttempts').textContent = totalAttempts;
    container.querySelector('#statCorrect').textContent = totalCorrect;
    container.querySelector('#statWrong').textContent = totalWrong;
    container.querySelector('#statAccuracy').textContent = accuracy + '%';
    container.querySelector('#statTime').textContent = formatTime(timerSeconds);

    // Render Summary Table
    const tbody = container.querySelector('#summaryTableBody');
    tbody.innerHTML = '';

    const detailsJson = {};
    questions.forEach((q, idx) => {
      const c = correctCounts[q.id] || 0;
      const w = wrongCounts[q.id] || 0;
      const totalQAttempts = c + w;

      detailsJson[q.id] = {
        correct: c,
        wrong: w,
        time_spent: questionTimings[q.id] || 0
      };

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">Q${idx + 1}: ${q.question_text.substring(0, 45)}...</td>
        <td>${masteryLevel}</td>
        <td><span class="role-badge user">${totalQAttempts} attempts</span></td>
        <td><span style="color:var(--success); font-weight:bold;">✅ Mastered</span></td>
      `;
      tbody.appendChild(tr);
    });

    renderMath(tbody);

    lastAttemptPayload = {
      quiz_id: quizId || (questions[0] ? questions[0].quiz_id : 1),
      score: totalQuestions,
      total_questions: totalQuestions,
      accuracy_pct: accuracy,
      time_taken_sec: timerSeconds,
      mastery_level: masteryLevel,
      details_json: detailsJson
    };

    const user = getUser();
    if (user) {
      // Authenticated User: Save attempt telemetry to database
      guestNoticeBanner.style.display = 'none';
      try {
        await api.saveQuizAttempt(lastAttemptPayload);
      } catch (e) {
        console.error('Failed to save quiz attempt:', e);
      }
    } else {
      // Unauthenticated Guest: Do not save analytics to DB, but show guest prompt
      guestNoticeBanner.style.display = 'block';
    }

    activeScreen.style.display = 'none';
    completionScreen.style.display = 'block';
  }

  // Guest Sign In Button Handler
  if (guestSignInBtn) {
    guestSignInBtn.addEventListener('click', () => {
      navigate('login');
    });
  }

  // Event Listeners for Completion Buttons
  container.querySelector('#downloadPdfBtn').addEventListener('click', async () => {
    const user = getUser() || { full_name: 'Guest Student', email: 'guest@example.com', role: 'user' };
    await generateQuizPDFReport({
      user,
      quiz: quizData,
      attempt: lastAttemptPayload,
      questions
    });
  });

  container.querySelector('#restartQuizBtn').addEventListener('click', () => {
    completionScreen.style.display = 'none';
    startScreen.style.display = 'block';
  });

  container.querySelector('#backCatalogBtn').addEventListener('click', () => {
    navigate('dashboard');
  });

  loadQuizData();

  return container;
}
