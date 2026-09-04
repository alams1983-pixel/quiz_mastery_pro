import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest, getUser } from '../services/api.js';
import { ExamSessionManager, PALETTE_STATES } from '../services/examSession.js';
import { RichText } from '../components/RichText.jsx';
import { ReactModal } from '../components/ReactModal.jsx';
import { LANGUAGE_NAME_MAP } from '../services/aiTranslationService.js';

export function SSCExamDashboardView({ attemptId, navigate, extraParams = {} }) {
  const user = getUser() || { full_name: 'Candidate' };
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [currentLang, setCurrentLang] = useState(extraParams.lang || 'en');
  const [paletteMobileOpen, setPaletteMobileOpen] = useState(false);
  const [isTimeLapsed, setIsTimeLapsed] = useState(false);

  // Time remaining formatted string
  const [timerText, setTimerText] = useState('00:00:00');
  const timerIntervalRef = useRef(null);

  // Modals state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initSessionData = useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);

    try {
      let startData = extraParams.startData;
      if (!startData) {
        startData = await apiRequest(`/exams/attempts/${attemptId}/session`);
      }

      const mgr = new ExamSessionManager(startData.attempt, startData.exam, startData.sections);
      setSession(mgr);

      if (mgr.sections && mgr.sections.length > 0) {
        const curSec = mgr.getCurrentSection();
        if (curSec) setActiveSectionId(curSec.id);
        const curQ = mgr.getCurrentQuestion();
        if (curQ) setActiveQuestionId(curQ.id);
      }
    } catch (err) {
      console.error('Session init error:', err);
      alert('Failed initializing exam session.');
      navigate('dashboard');
    } finally {
      setLoading(false);
    }
  }, [attemptId, extraParams, navigate]);

  useEffect(() => {
    initSessionData();
  }, [initSessionData]);

  // Timer Countdown logic
  useEffect(() => {
    if (!session) return;

    function updateTimer() {
      const remainingSec = session.tickTimer();
      if (remainingSec <= 0) {
        setTimerText('00:00:00');
        setIsTimeLapsed(true);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setShowSubmitModal(true);
        return;
      }

      const hrs = Math.floor(remainingSec / 3600);
      const mins = Math.floor((remainingSec % 3600) / 60);
      const secs = remainingSec % 60;
      setTimerText(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }

    updateTimer();
    timerIntervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [session]);

  const handleSelectSection = (secId) => {
    if (!session || isTimeLapsed) return;
    session.switchSection(secId);
    setActiveSectionId(secId);
    const secQs = session.getCurrentSectionQuestions();
    if (secQs.length > 0) {
      setActiveQuestionId(secQs[0].id);
    }
  };

  const handleSelectQuestion = (qId) => {
    if (!session || isTimeLapsed) return;
    session.switchQuestion(qId);
    setActiveQuestionId(qId);
  };

  const handleOptionSelect = (optIndex) => {
    if (!session || isTimeLapsed) return;
    session.selectOption(optIndex);
    setSession(Object.assign(Object.create(Object.getPrototypeOf(session)), session));
  };

  const handleClearResponse = () => {
    if (!session || isTimeLapsed) return;
    session.clearResponse();
    setSession(Object.assign(Object.create(Object.getPrototypeOf(session)), session));
  };

  const handleSaveAndNext = async () => {
    if (!session || isTimeLapsed) return;
    await session.saveAndNext();
    setActiveSectionId(session.currentSectionId);
    setActiveQuestionId(session.currentQuestionId);
    setSession(Object.assign(Object.create(Object.getPrototypeOf(session)), session));
  };

  const handleMarkForReviewAndNext = async () => {
    if (!session || isTimeLapsed) return;
    await session.markForReviewAndNext();
    setActiveSectionId(session.currentSectionId);
    setActiveQuestionId(session.currentQuestionId);
    setSession(Object.assign(Object.create(Object.getPrototypeOf(session)), session));
  };

  const handleFinalSubmit = async (autoSubmitted = false) => {
    if (!session || submitting) return;
    setSubmitting(true);

    try {
      const summaryPayload = session.generateSubmissionPayload();
      summaryPayload.status = autoSubmitted ? 'auto_submitted' : 'completed';

      await apiRequest(`/exams/attempts/${attemptId}/submit`, {
        method: 'POST',
        body: JSON.stringify(summaryPayload)
      });

      setShowSubmitModal(false);
      navigate('exam-analysis', { attemptId });
    } catch (err) {
      alert(err.message || 'Error submitting exam.');
      setSubmitting(false);
    }
  };

  if (loading || !session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-muted)', fontWeight: 700 }}>
        Initializing TCS iON Proctored CBT Exam Session...
      </div>
    );
  }

  const currentQ = session.getCurrentQuestion();
  const currentQIndex = session.getCurrentQuestionIndex();
  const currentSecQs = session.getCurrentSectionQuestions();

  let tj = currentQ?.translations_json;
  if (typeof tj === 'string') {
    try { tj = JSON.parse(tj); } catch (e) {}
  }

  const availableLangs = tj?.available_languages || (currentQ?.question_text_hi ? ['en', 'hi'] : ['en']);
  const translationsMap = tj?.translations || {
    en: { question_text: currentQ?.question_text_en || currentQ?.question_text || '', options: currentQ?.options_en || [] },
    hi: { question_text: currentQ?.question_text_hi || '', options: currentQ?.options_hi || [] }
  };

  const activeLangKey = availableLangs.includes(currentLang) ? currentLang : (tj?.primary_language || availableLangs[0] || 'en');
  const activeContent = translationsMap[activeLangKey] || translationsMap[availableLangs[0]] || {};
  const isLanguageFallback = !availableLangs.includes(currentLang) && availableLangs.length > 0;

  const passageText = currentLang === 'hi'
    ? (currentQ?.passage_text_hi || currentQ?.passage_text_en)
    : currentQ?.passage_text_en;

  const questionText = activeContent.question_text || currentQ?.question_text_en || currentQ?.question_text || '';
  const optionsList = activeContent.options || currentQ?.options_en || [];

  const optLabels = ['(A)', '(B)', '(C)', '(D)', '(E)'];
  const pCounts = session.getPaletteSummaryCounts();

  return (
    <div className="ssc-viewport-container fade-in">
      {/* SSC Header */}
      <header className="ssc-header">
        <div className="ssc-header-left">
          <div className="ssc-logo-box">SSC</div>
          <div>
            <h2 className="ssc-exam-title">{session.exam.title}</h2>
            <span className="ssc-inst-sub">{session.exam.institute_name || 'Coaching Portal'}</span>
          </div>
        </div>

        <div className="ssc-header-center">
          <button type="button" onClick={() => setShowInstructionsModal(true)} className="ssc-btn-hdr" title="Instructions">
            <i className="ri-information-line"></i> <span className="btn-text-desktop">Instructions</span>
          </button>
        </div>

        <div className="ssc-header-right">
          <div className="ssc-timer-box">
            <span className="ssc-timer-lbl">Time Left:</span>
            <span className="ssc-timer-val">{timerText}</span>
          </div>
          <div className="ssc-profile-box">
            <div className="ssc-avatar">
              {(user.full_name || 'Candidate').charAt(0).toUpperCase()}
            </div>
            <div className="ssc-profile-info">
              <span className="ssc-cand-name">{user.full_name || 'Candidate'}</span>
              <span className="ssc-cand-id">Lab ID: C215</span>
            </div>
          </div>
        </div>
      </header>

      {/* Section Navigation Bar */}
      <nav className="ssc-sec-bar">
        <span className="ssc-sec-lbl">Sections:</span>
        <div className="ssc-sec-tabs">
          {session.sections.map(sec => {
            const curSec = session.getCurrentSection();
            const isSecActive = curSec && curSec.id === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSelectSection(sec.id)}
                className={`ssc-tab ${isSecActive ? 'active' : ''}`}
              >
                {sec.section_name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="ssc-workspace">
        {/* Left Question Canvas */}
        <section className="ssc-question-canvas">
          <div className="ssc-q-hdr">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="ssc-q-num">Question No. {currentQIndex + 1}</span>
              <span className="ssc-q-marks">
                Marks: +{parseFloat(session.exam.positive_marks).toFixed(2)} / -{parseFloat(session.exam.negative_marks).toFixed(2)}
              </span>
              {isLanguageFallback && (
                <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  ℹ️ Available in {LANGUAGE_NAME_MAP[activeLangKey] || activeLangKey.toUpperCase()} only
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>View in:</label>
              {availableLangs.length <= 1 ? (
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '6px' }}>
                  {LANGUAGE_NAME_MAP[availableLangs[0]] || availableLangs[0].toUpperCase()}
                </span>
              ) : (
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value)}
                  className="ssc-lang-select"
                >
                  {availableLangs.map(code => (
                    <option key={code} value={code}>
                      {LANGUAGE_NAME_MAP[code] || code.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Scrollable Question Body */}
          <div className={`ssc-q-body ${passageText ? 'has-passage' : ''}`}>
            {passageText && (
              <div className="ssc-passage-pane">
                <div className="ssc-passage-box">
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '6px' }}>Reading Comprehension / Passage:</strong>
                  <RichText content={passageText} />
                </div>
              </div>
            )}

            <div className="ssc-question-pane">
              <div className="ssc-q-text">
                <RichText content={questionText} />
              </div>

              {currentQ?.image_url && (
                <div style={{ margin: '12px 0' }}>
                  <img src={currentQ.image_url} alt="Question Diagram" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                </div>
              )}

              {/* Options */}
              <div className="ssc-options-box">
                {optionsList.map((optText, optIdx) => {
                  const currentQState = session.getCurrentState();
                  const isSelected = currentQState && currentQState.selectedOption === optIdx;
                  return (
                    <label key={optIdx} className={`ssc-opt-item ${isSelected ? 'selected' : ''}`} style={{ opacity: isTimeLapsed ? 0.6 : 1, cursor: isTimeLapsed ? 'not-allowed' : 'pointer' }}>
                      <input
                        type="radio"
                        name="ssc-opt-group"
                        checked={!!isSelected}
                        disabled={isTimeLapsed}
                        onChange={() => handleOptionSelect(optIdx)}
                      />
                      <span className="ssc-opt-lbl">{optLabels[optIdx]}</span>
                      <span className="ssc-opt-txt"><RichText content={optText} /></span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer Bar */}
          <footer className="ssc-action-bar">
            <div className="ssc-act-left">
              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                disabled={isTimeLapsed}
                className="ssc-btn ssc-btn-purple"
                title="Mark for Review & Next Question"
                aria-label="Mark for Review & Next Question"
                style={{ opacity: isTimeLapsed ? 0.5 : 1 }}
              >
                <i className="ri-bookmark-fill"></i> <span className="btn-text-desktop">Mark Review</span>
              </button>
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={isTimeLapsed}
                className="ssc-btn ssc-btn-outline"
                title="Clear Response"
                aria-label="Clear Response"
                style={{ opacity: isTimeLapsed ? 0.5 : 1 }}
              >
                <i className="ri-eraser-line"></i> <span className="btn-text-desktop">Clear</span>
              </button>
              <button
                type="button"
                onClick={() => setPaletteMobileOpen(!paletteMobileOpen)}
                className="ssc-btn ssc-btn-outline"
                title="Question Palette Drawer"
                aria-label="Question Palette Drawer"
              >
                <i className="ri-grid-fill"></i> <span className="btn-text-desktop">Palette</span>
              </button>
            </div>
            <div className="ssc-act-right">
              <button
                type="button"
                onClick={handleSaveAndNext}
                disabled={isTimeLapsed}
                className="ssc-btn ssc-btn-green"
                title="Save & Next Question"
                aria-label="Save & Next Question"
                style={{ opacity: isTimeLapsed ? 0.5 : 1 }}
              >
                <span className="btn-text-desktop">Save & Next</span> <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </footer>
        </section>

        {/* Right Palette Drawer Sidebar */}
        <aside className={`ssc-palette-sidebar ${paletteMobileOpen ? 'mobile-open' : ''}`}>
          {/* Palette Legend Box */}
          <div className="ssc-legend-box">
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PALETTE LEGEND</h4>
            <div className="ssc-legend-grid">
              <div className="ssc-lg-item"><span className="ssc-badge badge-ans">{pCounts.answered}</span> Answered</div>
              <div className="ssc-lg-item"><span className="ssc-badge badge-not-ans">{pCounts.not_answered}</span> Not Answered</div>
              <div className="ssc-lg-item"><span className="ssc-badge badge-not-vis">{pCounts.not_visited}</span> Not Visited</div>
              <div className="ssc-lg-item"><span className="ssc-badge badge-review">{pCounts.marked_for_review}</span> Marked Review</div>
              <div className="ssc-lg-item" style={{ gridColumn: '1/-1' }}><span className="ssc-badge badge-ans-review">{pCounts.ans_and_marked}</span> Answered & Marked (Evaluated)</div>
            </div>
          </div>

          <div className="ssc-palette-sec-title">
            Section: {session.getCurrentSection()?.section_name || 'Exam'}
          </div>

          {/* Grid of Question Palette Badges */}
          <div className="ssc-palette-grid">
            {currentSecQs.map((q, idx) => {
              const qState = session.stateMap.get(q.id);
              const state = qState ? qState.paletteState : PALETTE_STATES.NOT_VISITED;
              const isCurrent = currentQ && q.id === currentQ.id;

              let badgeClass = 'badge-not-vis';
              if (state === PALETTE_STATES.NOT_ANSWERED) badgeClass = 'badge-not-ans';
              else if (state === PALETTE_STATES.ANSWERED) badgeClass = 'badge-ans';
              else if (state === PALETTE_STATES.MARKED_FOR_REVIEW) badgeClass = 'badge-review';
              else if (state === PALETTE_STATES.ANSWERED_AND_MARKED) badgeClass = 'badge-ans-review';

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    handleSelectQuestion(q.id);
                    setPaletteMobileOpen(false);
                  }}
                  className={`ssc-badge ${badgeClass} ${isCurrent ? 'active-q' : ''}`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              );
            })}
          </div>

          <div style={{ padding: '14px', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
            <button
              type="button"
              onClick={() => {
                setPaletteMobileOpen(false);
                setShowSubmitModal(true);
              }}
              className="btn btn-primary"
              style={{ width: '100%', fontWeight: 800, padding: '12px', background: '#27ae60', borderColor: '#27ae60' }}
            >
              <i className="ri-send-plane-fill"></i> Submit Exam
            </button>
          </div>
        </aside>

        {/* Palette Drawer Mobile Backdrop Overlay */}
        <div
          className={`ssc-palette-overlay ${paletteMobileOpen ? 'active' : ''}`}
          onClick={() => setPaletteMobileOpen(false)}
        ></div>
      </main>

      {/* Submit Confirmation Modal */}
      <ReactModal
        isOpen={showSubmitModal}
        title={isTimeLapsed ? "⏱ Exam Time Expired - Final Submission" : "📝 Exam Section Summary & Final Submission"}
        onClose={() => { if (!isTimeLapsed) setShowSubmitModal(false); }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isTimeLapsed ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="ri-alarm-warning-fill" style={{ fontSize: '1.4rem', color: '#dc2626' }}></i>
              <span>Your exam duration has ended. Question responses are now locked. Click <strong>Submit Exam</strong> below to generate your scorecard.</span>
            </div>
          ) : (
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Please review your attempt breakdown across all sections before final submission. Once submitted, your scorecard will be generated immediately.
            </p>
          )}

          {/* Detailed Section-Wise Attempt Table */}
          <div style={{ overflowX: 'auto', maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
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
              <tbody>
                {session.getSectionSummary().map(s => (
                  <tr key={s.sectionId}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.sectionName}</td>
                    <td style={{ fontWeight: 700 }}>{s.totalQuestions}</td>
                    <td style={{ color: '#27ae60', fontWeight: 800 }}>{s.answered}</td>
                    <td style={{ color: '#c0392b', fontWeight: 800 }}>{s.notAnswered}</td>
                    <td style={{ color: '#8e44ad', fontWeight: 800 }}>{s.marked}</td>
                    <td style={{ color: '#8e44ad', fontWeight: 800 }}>{s.ansAndMarked}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.notVisited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: isTimeLapsed ? 'flex-end' : 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
            {!isTimeLapsed && (
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-outline"
              >
                ← Return to Exam
              </button>
            )}
            <button
              type="button"
              onClick={() => handleFinalSubmit(isTimeLapsed)}
              disabled={submitting}
              className="btn btn-primary"
              style={{ background: '#27ae60', borderColor: '#27ae60', padding: '10px 24px', fontWeight: 800 }}
            >
              {submitting ? 'Submitting...' : 'Yes, Final Submit Exam →'}
            </button>
          </div>
        </div>
      </ReactModal>

      {/* General Instructions Modal */}
      <ReactModal
        isOpen={showInstructionsModal}
        title="ℹ️ General Exam Instructions"
        onClose={() => setShowInstructionsModal(false)}
      >
        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
          <ol style={{ paddingLeft: '20px' }}>
            <li>The clock will be set at the server. The countdown timer in the top right corner displays remaining time.</li>
            <li>Clicking on a question number in the Question Palette will take you to that question directly.</li>
            <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
          </ol>
        </div>
      </ReactModal>
    </div>
  );
}

export default SSCExamDashboardView;
