import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api.js';

export function ExamLobbyView({ examId, navigate }) {
  const [exam, setExam] = useState(null);
  const [sections, setSections] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [declared, setDeclared] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadLobbyData() {
      if (!examId) return;
      try {
        const res = await apiRequest(`/exams/${examId}`);
        setExam(res.exam);
        setSections(res.sections || []);

        const secQRes = await apiRequest(`/exams/${examId}/sections-questions`);
        let totalQs = 0;
        (secQRes.sections || []).forEach(s => totalQs += s.questions.length);
        setTotalQuestions(totalQs);
      } catch (err) {
        console.error('Lobby error:', err);
        alert('Failed to load exam details.');
      } finally {
        setLoading(false);
      }
    }

    loadLobbyData();
  }, [examId]);

  const handleBeginExam = async () => {
    if (!declared || starting) return;
    setStarting(true);

    try {
      const startRes = await apiRequest(`/exams/${examId}/start`, { method: 'POST' });
      navigate('ssc-exam', { attemptId: startRes.attempt.id, lang: selectedLang, startData: startRes });
    } catch (err) {
      alert(err.message || 'Could not start exam session.');
      setStarting(false);
    }
  };

  if (loading || !exam) {
    return (
      <div className="view-container fade-in" style={{ maxWidth: '900px', margin: '20px auto' }}>
        <div className="card" style={{ padding: '28px', background: 'var(--card-bg)', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Exam Lobby Details...
        </div>
      </div>
    );
  }

  return (
    <div className="view-container fade-in" style={{ maxWidth: '900px', margin: '20px auto' }}>
      <div className="card" style={{ padding: '28px', background: 'var(--card-bg)' }}>
        <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="institute-badge" style={{ marginBottom: '8px' }}>
              {exam.institute_name || 'Coaching Institute'}
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {exam.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              {exam.description || 'Staff Selection Commission Computer Based Examination'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duration</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {exam.total_duration_mins || 60} Mins
            </div>
          </div>
        </div>

        {/* Key Info Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>MARKING SCHEME</span>
            <strong style={{ color: 'var(--success)' }}>
              +{parseFloat(exam.positive_marks).toFixed(2)} / -{parseFloat(exam.negative_marks).toFixed(2)}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>EXAM MODE</span>
            <strong style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{exam.mode} Mode</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>SECTIONS</span>
            <strong>{sections.length} Sections</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL QUESTIONS</span>
            <strong>{totalQuestions} Questions</strong>
          </div>
        </div>

        {/* Custom Exam Instructions if defined by teacher */}
        {exam.instructions && exam.instructions.trim() && (
          <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>📋 Specific Exam Instructions from Teacher:</strong>
            <div style={{ whiteSpace: 'pre-wrap' }}>{exam.instructions}</div>
          </div>
        )}

        {/* Language Preference Dropdown */}
        <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>Choose your default viewing language:</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>You can change language for individual questions inside the exam interface anytime.</p>
          </div>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--primary-border)', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
          >
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
        </div>

        {/* SSC Instructions Box */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>General Exam Instructions</h3>
          <div style={{ height: '240px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', background: 'var(--card-bg)', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
            <ol style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
              <li style={{ marginBottom: '8px' }}>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</li>
            </ol>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '28px', height: '24px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', lineHeight: '22px' }}>01</span>
                <span>You have not visited the question yet.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '28px', height: '24px', background: '#D9534F', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', lineHeight: '24px' }}>02</span>
                <span>You have not answered the question.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '28px', height: '24px', background: '#5CB85C', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', lineHeight: '24px' }}>03</span>
                <span>You have answered the question.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '28px', height: '24px', background: '#8E44AD', color: '#fff', borderRadius: '50%', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', lineHeight: '24px' }}>04</span>
                <span>You have NOT answered, but marked for review.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: '1/-1' }}>
                <span style={{ display: 'inline-block', width: '28px', height: '24px', background: '#8E44AD', color: '#fff', borderRadius: '50%', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', lineHeight: '24px', position: 'relative' }}>
                  05<span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', background: '#2ECC71', borderRadius: '50%' }}></span>
                </span>
                <span><strong>Answered & Marked for Review:</strong> The question will be <strong>EVALUATED</strong> in scoring.</span>
              </div>
            </div>

            <ol start="3" style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Clicking on a question number in the Question Palette will take you to that question directly.</li>
              <li style={{ marginBottom: '8px' }}>To select your answer, click on the button for one of the options. To deselect your chosen answer, click on <strong>Clear Response</strong>.</li>
              <li style={{ marginBottom: '8px' }}>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
            </ol>
          </div>
        </div>

        {/* Declaration Checkbox */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>
              I have read and understood all the instructions. All computer hardware allotted to me is in proper working condition. I declare that I am not in possession of any prohibited gadgets or smartphones inside the examination hall.
            </span>
          </label>
        </div>

        {/* Submit / Begin Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="btn btn-outline"
            title="Back to Student Dashboard"
            aria-label="Back to Student Dashboard"
          >
            <i className="ri-arrow-left-line"></i> <span className="btn-text-desktop">Back to Dashboard</span>
          </button>
          <button
            type="button"
            onClick={handleBeginExam}
            disabled={!declared || starting}
            className="btn btn-primary"
            title="Start Computer Based Test Examination"
            aria-label="Start Computer Based Test Examination"
            style={{ padding: '12px 24px', fontSize: '1rem', opacity: declared && !starting ? 1 : 0.5 }}
          >
            <i className="ri-play-circle-line"></i> <span className="btn-text-desktop">{starting ? 'Initializing Exam Session...' : 'I am ready to begin'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamLobbyView;
