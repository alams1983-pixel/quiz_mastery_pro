import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api.js';
import { RichText } from '../components/RichText.jsx';
import { renderLeaderboardModal } from '../components/LeaderboardModal.js';

export function ExamAnalysisView({ attemptId, navigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'correct' | 'wrong' | 'unattempted'
  const [secGraphicMode, setSecGraphicMode] = useState('score'); // 'score' | 'accuracy' | 'time'
  const [currentLang, setCurrentLang] = useState('en'); // 'en' | 'hi'

  useEffect(() => {
    async function loadAnalysis() {
      if (!attemptId) return;
      setLoading(true);
      try {
        const res = await apiRequest(`/exams/attempts/${attemptId}/analysis`);
        setData(res);
      } catch (err) {
        console.error('Error loading analysis:', err);
        setError(err.message || 'Failed to load analysis.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="view-container fade-in" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Loading Detailed Candidate Scorecard & Solution Analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="view-container fade-in" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
        Failed to load analysis: {error || 'Attempt not found'}
      </div>
    );
  }

  const { attempt, rank, percentile, totalCandidates, itemAnalysis = [], sectionAnalysis = [] } = data;

  let correctCount = 0, wrongCount = 0, unattemptedCount = 0;
  itemAnalysis.forEach(item => {
    if (item.is_correct === 1 || item.is_correct === true) correctCount++;
    else if (item.is_correct === 0 || item.is_correct === false) wrongCount++;
    else unattemptedCount++;
  });

  const filteredItems = itemAnalysis.filter(item => {
    if (activeFilter === 'correct') return item.is_correct === 1 || item.is_correct === true;
    if (activeFilter === 'wrong') return item.is_correct === 0 || item.is_correct === false;
    if (activeFilter === 'unattempted') return item.is_correct === null;
    return true;
  });

  const optLabels = ['(A)', '(B)', '(C)', '(D)', '(E)'];

  return (
    <div className="view-container fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="btn btn-outline btn-sm"
        >
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Language:</label>
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '4px 10px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>

          <button
            type="button"
            onClick={() => renderLeaderboardModal(attempt.exam_id)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            🏆 View Exam Leaderboard
          </button>
        </div>
      </div>

      {/* Scorecard Summary Header */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--primary-light) 100%)', border: '2px solid var(--primary-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <span className="badge-tag" style={{ marginBottom: '6px', display: 'inline-block' }}>{attempt.exam_type}</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{attempt.exam_title}</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Candidate: {attempt.candidate_name} • {attempt.institute_name || 'Independent'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Rank</span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>
              #{rank} / {totalCandidates}
            </div>
          </div>
        </div>

        {/* Stats Metric Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', textAlign: 'center' }}>
          <div style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL SCORE</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{parseFloat(attempt.total_score).toFixed(2)}</div>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACCURACY</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{Math.round(attempt.accuracy_pct)}%</div>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PERCENTILE</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>{percentile} %ile</div>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CORRECT / WRONG</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
              <span style={{ color: 'var(--success)' }}>{attempt.correct_count}</span> / <span style={{ color: 'var(--danger)' }}>{attempt.wrong_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphical Section-Wise Performance Analysis Card */}
      {sectionAnalysis.length > 0 && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Section-Wise Comparative Analysis
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Graphical breakdown comparing your score, accuracy, and time against cohort average and topper performance across sections.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-outline btn-sm ${secGraphicMode === 'score' ? 'active' : ''}`}
                onClick={() => setSecGraphicMode('score')}
                title="View Score Comparison Analytics"
                aria-label="View Score Comparison Analytics"
              >
                <i className="ri-bar-chart-box-line"></i> <span className="btn-text-desktop">Score</span>
              </button>
              <button
                type="button"
                className={`btn btn-outline btn-sm ${secGraphicMode === 'accuracy' ? 'active' : ''}`}
                onClick={() => setSecGraphicMode('accuracy')}
                title="View Section Accuracy %"
                aria-label="View Section Accuracy %"
              >
                <i className="ri-pie-chart-line"></i> <span className="btn-text-desktop">Accuracy %</span>
              </button>
              <button
                type="button"
                className={`btn btn-outline btn-sm ${secGraphicMode === 'time' ? 'active' : ''}`}
                onClick={() => setSecGraphicMode('time')}
                title="View Section Time Distribution"
                aria-label="View Section Time Distribution"
              >
                <i className="ri-time-line"></i> <span className="btn-text-desktop">Time</span>
              </button>
            </div>
          </div>

          {/* Legend Indicator */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.82rem', fontWeight: 700, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#4f46e5', borderRadius: '3px', display: 'inline-block' }}></span>
              👤 My Performance
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '3px', display: 'inline-block' }}></span>
              👥 Cohort Average
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px', display: 'inline-block' }}></span>
              🏆 Topper Benchmark
            </span>
          </div>

          {/* Graphical Section List Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sectionAnalysis.map(sec => {
              const maxVal = secGraphicMode === 'score' ? Math.max(sec.max_score || 1, 1) : secGraphicMode === 'accuracy' ? 100 : Math.max(sec.time_spent_sec, sec.cohort_avg_time_sec, 60);

              const studentVal = secGraphicMode === 'score' ? sec.score : secGraphicMode === 'accuracy' ? sec.accuracy_pct : sec.time_spent_sec;
              const avgVal = secGraphicMode === 'score' ? sec.cohort_avg_score : secGraphicMode === 'accuracy' ? sec.cohort_avg_accuracy : sec.cohort_avg_time_sec;
              const topVal = secGraphicMode === 'score' ? sec.top_score : secGraphicMode === 'accuracy' ? 100 : sec.time_spent_sec;

              const studentPct = Math.min(100, Math.max(0, (studentVal / maxVal) * 100));
              const avgPct = Math.min(100, Math.max(0, (avgVal / maxVal) * 100));
              const topPct = Math.min(100, Math.max(0, (topVal / maxVal) * 100));

              return (
                <div key={sec.section_id} style={{ background: 'var(--bg-color)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--primary)' }}>📁 {sec.section_name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Score: {sec.score} / {sec.max_score} | Acc: {sec.accuracy_pct}% | Qs: {sec.correct_count}✓ / {sec.wrong_count}✕ / {sec.unattempted_count}-
                    </span>
                  </div>

                  {/* Graphical Bar Trackers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '100px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>My Performance:</span>
                      <div style={{ flex: 1, background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${studentPct}%`, background: '#4f46e5', height: '100%', borderRadius: '5px', transition: 'width 0.3s' }}></div>
                      </div>
                      <span style={{ width: '60px', fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', textAlign: 'right' }}>
                        {secGraphicMode === 'time' ? `${studentVal}s` : secGraphicMode === 'accuracy' ? `${studentVal}%` : studentVal}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '100px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort Average:</span>
                      <div style={{ flex: 1, background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${avgPct}%`, background: '#f59e0b', height: '100%', borderRadius: '5px', transition: 'width 0.3s' }}></div>
                      </div>
                      <span style={{ width: '60px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', textAlign: 'right' }}>
                        {secGraphicMode === 'time' ? `${avgVal}s` : secGraphicMode === 'accuracy' ? `${avgVal}%` : avgVal}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '100px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Topper Score:</span>
                      <div style={{ flex: 1, background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${topPct}%`, background: '#10b981', height: '100%', borderRadius: '5px', transition: 'width 0.3s' }}></div>
                      </div>
                      <span style={{ width: '60px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textAlign: 'right' }}>
                        {secGraphicMode === 'time' ? `${topVal}s` : secGraphicMode === 'accuracy' ? `${topVal}%` : topVal}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-outline btn-sm ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
          title="Filter all questions"
          aria-label="Filter all questions"
        >
          <i className="ri-list-check"></i> <span className="btn-text-desktop">All</span> ({itemAnalysis.length})
        </button>
        <button
          type="button"
          className={`btn btn-outline btn-sm ${activeFilter === 'correct' ? 'active' : ''}`}
          onClick={() => setActiveFilter('correct')}
          title="Filter correct questions"
          aria-label="Filter correct questions"
          style={{ color: 'var(--success)' }}
        >
          <i className="ri-checkbox-circle-line"></i> <span className="btn-text-desktop">Correct</span> ({correctCount})
        </button>
        <button
          type="button"
          className={`btn btn-outline btn-sm ${activeFilter === 'wrong' ? 'active' : ''}`}
          onClick={() => setActiveFilter('wrong')}
          title="Filter incorrect questions"
          aria-label="Filter incorrect questions"
          style={{ color: 'var(--danger)' }}
        >
          <i className="ri-close-circle-line"></i> <span className="btn-text-desktop">Wrong</span> ({wrongCount})
        </button>
        <button
          type="button"
          className={`btn btn-outline btn-sm ${activeFilter === 'unattempted' ? 'active' : ''}`}
          onClick={() => setActiveFilter('unattempted')}
          title="Filter unattempted questions"
          aria-label="Filter unattempted questions"
        >
          <i className="ri-question-line"></i> <span className="btn-text-desktop">Unattempted</span> ({unattemptedCount})
        </button>
      </div>

      {/* Item-Level Question List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No questions match this filter.
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isCorrect = item.is_correct === 1 || item.is_correct === true;
            const isWrong = item.is_correct === 0 || item.is_correct === false;

            const marksAwarded = parseFloat(item.marks_awarded || 0).toFixed(2);
            let statusBadge = <span className="status-badge" style={{ background: '#e2e8f0', color: '#475569' }}>Unattempted ({marksAwarded})</span>;
            if (isCorrect) statusBadge = <span className="status-badge status-active">✓ Correct (+{marksAwarded})</span>;
            else if (isWrong) statusBadge = <span className="status-badge status-inactive">✕ Wrong ({marksAwarded})</span>;

            const passageText = currentLang === 'hi' ? (item.passage_text_hi || item.passage_text_en) : item.passage_text_en;
            const qText = currentLang === 'hi' ? (item.question_text_hi || item.question_text_en) : item.question_text_en;
            const opts = currentLang === 'hi' ? (item.options_hi || item.options_en || []) : (item.options_en || []);
            const explanation = currentLang === 'hi' ? (item.explanation_hi || item.explanation_en) : item.explanation_en;

            return (
              <div key={item.question_id || index} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>Q{index + 1}.</span>
                    <span className="badge-tag">{item.section_name}</span>
                    <span style={{ fontSize: '0.8rem', background: 'var(--bg-color)', padding: '4px 10px', borderRadius: '6px', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border-color)' }}>
                      ⏱ Time Spent: <strong>{item.time_spent_sec || 0}s</strong> (Cohort Avg: {item.avg_time_sec || 0}s)
                    </span>
                  </div>
                  <div>{statusBadge}</div>
                </div>

                {/* Comprehension Reading Passage Box if present */}
                {passageText && (
                  <div style={{ background: 'var(--bg-color)', border: '1px solid var(--primary-border)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>📖 Reading Comprehension / Passage:</strong>
                    <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      <RichText content={passageText} />
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px', lineHeight: 1.5 }}>
                  <RichText content={qText} />
                </div>

                {/* Diagram Image if present */}
                {item.image_url && (
                  <div style={{ margin: '12px 0' }}>
                    <img src={item.image_url} alt="Question Diagram" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                )}

                {/* Options List */}
                <div style={{ marginBottom: '16px' }}>
                  {opts.map((optText, optIdx) => {
                    const isCorrectOpt = optIdx === item.correct_option_index;
                    const isSelectedOpt = optIdx === item.selected_option;

                    let optStyle = { padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '8px' };
                    if (isCorrectOpt) {
                      optStyle = { ...optStyle, background: '#e8f5e9', border: '1.5px solid #2ecc71' };
                    } else if (isSelectedOpt && !isCorrectOpt) {
                      optStyle = { ...optStyle, background: '#ffebee', border: '1.5px solid #e74c3c' };
                    }

                    return (
                      <div key={optIdx} style={optStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                          <span>
                            <strong>{optLabels[optIdx]}</strong> <RichText content={optText} />
                          </span>
                          {isCorrectOpt && <strong style={{ color: '#27ae60' }}>✓ Correct Option</strong>}
                          {isSelectedOpt && !isCorrectOpt && <strong style={{ color: '#c0392b' }}>✕ Your Choice</strong>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation */}
                {explanation && (
                  <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: '8px', padding: '14px', marginTop: '14px' }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '6px', fontSize: '0.95rem' }}>
                      💡 Solution & Detailed Explanation:
                    </strong>
                    <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      <RichText content={explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ExamAnalysisView;
