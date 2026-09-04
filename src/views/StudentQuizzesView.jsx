import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api.js';
import { downloadQuizBookletPDF, generateQuizPDFReport } from '../services/pdfGenerator.js';
import { ReactModal } from '../components/ReactModal.jsx';

export function StudentQuizzesView({ navigate, startQuizSession }) {
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue' | 'analytics'
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Practice Attempts State
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Custom Quiz Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCatId, setCustomCatId] = useState('');
  const [customCount, setCustomCount] = useState(10);
  const [customBuilding, setCustomBuilding] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiRequest('/categories');
      setCategories(res.categories || []);
    } catch (err) {
      console.warn('Could not load categories:', err);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    setLoadingQuizzes(true);
    try {
      let queryParams = [];
      if (selectedCategoryId) queryParams.push(`category_id=${selectedCategoryId}`);
      if (searchQuery) queryParams.push(`q=${encodeURIComponent(searchQuery)}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await apiRequest(`/quizzes${queryString}`);
      setQuizzes(res.quizzes || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [selectedCategoryId, searchQuery]);

  const fetchAttempts = useCallback(async () => {
    setLoadingAttempts(true);
    try {
      const res = await apiRequest('/analytics/history');
      setAttempts(res.attempts || []);
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (activeTab === 'catalogue') {
      fetchQuizzes();
    } else {
      fetchAttempts();
    }
  }, [activeTab, fetchQuizzes, fetchAttempts]);

  const handleBuildCustomQuiz = async (e) => {
    e.preventDefault();
    if (customCount < 1 || customCount > 50) {
      alert('Please enter a question count between 1 and 50.');
      return;
    }

    setCustomBuilding(true);
    try {
      const res = await apiRequest('/quizzes/custom-quiz', {
        method: 'POST',
        body: JSON.stringify({
          title: customTitle || 'Custom Practice Quiz',
          category_id: customCatId ? parseInt(customCatId, 10) : null,
          question_count: parseInt(customCount, 10)
        })
      });

      setShowCustomModal(false);
      if (startQuizSession) {
        startQuizSession(res.quiz.id, res.customData);
      } else {
        navigate('quiz', { quizId: res.quiz.id, customData: res.customData });
      }
    } catch (err) {
      alert(err.message || 'Could not build custom quiz.');
    } finally {
      setCustomBuilding(false);
    }
  };

  return (
    <div className="view-container fade-in">
      {/* Top Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, #312e81 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            📝 Student Practice Quiz Hub
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.98rem' }}>
            Self-paced practice quizzes. Select any quiz to build active memory retention or view your attempt analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="btn"
            style={{ background: '#ffffff', color: 'var(--accent)', fontWeight: 700, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
          >
            ✨ Create Custom Quiz
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          type="button"
          className={`btn-text ${activeTab === 'catalogue' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogue')}
          style={{ fontWeight: 700, padding: '10px 18px', borderBottom: activeTab === 'catalogue' ? '3px solid var(--accent)' : 'none', color: activeTab === 'catalogue' ? 'var(--text-main)' : 'var(--text-muted)' }}
        >
          📚 Practice Quiz Catalogue
        </button>
        <button
          type="button"
          className={`btn-text ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          style={{ fontWeight: 700, padding: '10px 18px', borderBottom: activeTab === 'analytics' ? '3px solid var(--accent)' : 'none', color: activeTab === 'analytics' ? 'var(--text-main)' : 'var(--text-muted)' }}
        >
          📊 Quiz Analytics & Practice Attempts
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'catalogue' ? (
        <div>
          {/* Horizontal Category Pill Toolbar + Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div className="cat-pill-bar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', scrollbarWidth: 'thin' }}>
              <button
                type="button"
                className={`cat-pill-item ${selectedCategoryId === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryId('')}
              >
                All Categories
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`cat-pill-item ${selectedCategoryId == c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryId(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search quizzes by title, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Quiz Grid */}
          <div className="grid">
            {loadingQuizzes ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Loading practice quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No quizzes available matching your filters.
              </div>
            ) : (
              quizzes.map(q => (
                <div key={q.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className="badge-tag">{q.category_name || 'General Practice'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱ {q.duration_mins || 15} mins</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>{q.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', flex: 1, lineHeight: 1.4 }}>
                    {q.description || 'Interactive self-paced practice quiz.'}
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (startQuizSession) startQuizSession(q.id);
                        else navigate('quiz', { quizId: q.id });
                      }}
                      className="btn btn-primary"
                      title="Start Self-Paced Practice Quiz Session"
                      aria-label="Start Self-Paced Practice Quiz Session"
                      style={{ flex: 1, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <i className="ri-play-circle-line"></i> <span className="btn-text-desktop">Start Practice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadQuizBookletPDF(q.id)}
                      className="btn btn-outline btn-icon-only"
                      title="Download Printable PDF Booklet"
                      aria-label="Download Printable PDF Booklet"
                    >
                      <i className="ri-file-pdf-2-line" style={{ color: 'var(--danger)', fontSize: '1.1rem' }}></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Analytics Tab */
        <div>
          {loadingAttempts ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading practice attempt history...
            </div>
          ) : attempts.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No Practice Attempts Found</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Take a practice quiz to view your score breakdown and solution explanations!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attempts.map(a => (
                <div key={a.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>{a.quiz_title || 'Practice Quiz'}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Attempted on: {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{a.score} / {a.total_questions}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Score</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => generateQuizPDFReport(a)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontWeight: 700 }}
                    >
                      Download Solution PDF 📄
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Quiz Modal */}
      <ReactModal
        isOpen={showCustomModal}
        title="✨ Build Custom Practice Quiz"
        onClose={() => setShowCustomModal(false)}
      >
        <form onSubmit={handleBuildCustomQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Quiz Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. My Daily Revision Quiz"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Category Filter (Optional)</label>
            <select
              value={customCatId}
              onChange={(e) => setCustomCatId(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>Number of Questions</label>
            <input
              type="number"
              className="form-control"
              min={1}
              max={50}
              value={customCount}
              onChange={(e) => setCustomCount(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={customBuilding}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
          >
            {customBuilding ? 'Building Quiz...' : '🚀 Generate Custom Quiz'}
          </button>
        </form>
      </ReactModal>
    </div>
  );
}

export default StudentQuizzesView;
