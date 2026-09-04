import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api.js';

export function StudentExamsView({ navigate }) {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'attended' | 'expired'
  const [loading, setLoading] = useState(true);
  const [allExams, setAllExams] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ hasNextPage: false });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const currentLimit = 12;

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        apiRequest(`/exams?page=1&limit=${currentLimit}`).catch(() => ({ exams: [] })),
        apiRequest('/exams/my-attempts/history').catch(() => ({ attempts: [] }))
      ]);

      setAllExams(examsRes.exams || []);
      setPaginationMeta(examsRes.pagination || { hasNextPage: false });
      setMyAttempts(attemptsRes.attempts || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading exams data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentLimit]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadMoreExams = useCallback(async () => {
    if (isLoadingMore || !paginationMeta.hasNextPage) return;
    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const examsRes = await apiRequest(`/exams?page=${nextPage}&limit=${currentLimit}`).catch(() => ({ exams: [] }));
      const newExams = examsRes.exams || [];

      if (newExams.length > 0) {
        setCurrentPage(nextPage);
        setAllExams(prev => [...prev, ...newExams]);
        setPaginationMeta(examsRes.pagination || { hasNextPage: false });
      } else {
        setPaginationMeta({ hasNextPage: false });
      }
    } catch (err) {
      console.error('Error lazy loading more exams:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, paginationMeta.hasNextPage, currentPage, currentLimit]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !paginationMeta.hasNextPage || activeTab !== 'live') return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
        loadMoreExams();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, paginationMeta.hasNextPage, activeTab, loadMoreExams]);

  const now = new Date();

  const liveExams = allExams.filter(e => {
    if (!e.is_published) return false;
    if (e.scheduled_end && new Date(e.scheduled_end) < now) return false;
    return true;
  });

  const expiredExams = allExams.filter(e => e.scheduled_end && new Date(e.scheduled_end) < now);

  return (
    <div className="view-container fade-in">
      {/* Top Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #1e1b4b 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
            💻 Online CBT Mock Examination Center
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.98rem' }}>
            Take timed, multi-section proctored mock tests with real-time scorecards and rank analysis.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="status-badge status-active" style={{ padding: '8px 16px', fontWeight: 700 }}>
            ⚡ Exam Engine Active
          </span>
        </div>
      </div>

      {/* Exam Section Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-color)', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn-text ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
          style={{ fontWeight: 700, padding: '10px 18px', borderBottom: activeTab === 'live' ? '3px solid var(--primary)' : 'none' }}
        >
          🔴 Live & Scheduled Exams
        </button>
        <button
          type="button"
          className={`btn-text ${activeTab === 'attended' ? 'active' : ''}`}
          onClick={() => setActiveTab('attended')}
          style={{ fontWeight: 700, padding: '10px 18px', color: activeTab === 'attended' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: activeTab === 'attended' ? '3px solid var(--success)' : 'none' }}
        >
          ✅ Completed & Attended Exams
        </button>
        <button
          type="button"
          className={`btn-text ${activeTab === 'expired' ? 'active' : ''}`}
          onClick={() => setActiveTab('expired')}
          style={{ fontWeight: 700, padding: '10px 18px', color: activeTab === 'expired' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: activeTab === 'expired' ? '3px solid var(--danger)' : 'none' }}
        >
          ⏳ Expired Exams
        </button>
      </div>

      {/* Main Content Container */}
      <div>
        {loading ? (
          <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading CBT exams...
          </div>
        ) : activeTab === 'live' ? (
          liveExams.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="ri-computer-line" style={{ fontSize: '2.5rem', color: 'var(--primary)', display: 'block', marginBottom: '12px' }}></i>
              <h3>No Live or Scheduled Exams Currently Available</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Check back later or contact your Coaching Institute admin.</p>
            </div>
          ) : (
            <div className="grid">
              {liveExams.map(e => (
                <div key={e.id} className="card" style={{ border: '2px solid var(--primary-border)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className="badge-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>{e.exam_type}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'capitalize' }}>{e.mode} Mode</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>{e.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', flex: 1, lineHeight: 1.4 }}>
                    {e.description || 'Official Online CBT Mock Examination.'}
                  </p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', background: 'var(--bg-color)', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>⏱ {e.total_duration_mins} Mins</span>
                    <span>Marks: +{parseFloat(e.positive_marks).toFixed(1)} / -{parseFloat(e.negative_marks).toFixed(1)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('exam-lobby', { examId: e.id })}
                    className="btn btn-primary"
                    title="Enter Examination Instructions Lobby"
                    aria-label="Enter Examination Instructions Lobby"
                    style={{ width: '100%', fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <i className="ri-login-box-line"></i> <span className="btn-text-desktop">Enter Exam Lobby</span>
                  </button>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'attended' ? (
          myAttempts.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="ri-task-line" style={{ fontSize: '2.5rem', color: 'var(--success)', display: 'block', marginBottom: '12px' }}></i>
              <h3>No Completed Exams Found</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>You haven't completed any exam submissions yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myAttempts.map(a => (
                <div key={a.id} className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', borderLeft: '4px solid var(--success)', background: 'var(--card-bg)', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                      <i className="ri-checkbox-circle-fill"></i>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-main)' }}>{a.exam_title || 'CBT Mock Test'}</h4>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.84rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>📅 Submitted: {new Date(a.submitted_at || a.created_at).toLocaleString()}</span>
                        <span className="badge-tag" style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success)', fontWeight: 700 }}>Completed</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginLeft: 'auto' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{parseFloat(a.total_score || 0).toFixed(1)} Marks</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>{parseFloat(a.accuracy_pct || 0).toFixed(1)}% Accuracy</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('exam-analysis', { attemptId: a.id })}
                      className="btn btn-primary btn-sm"
                      title="View Detailed Scorecard & Analysis"
                      aria-label="View Detailed Scorecard & Analysis"
                      style={{ fontWeight: 700, padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="ri-bar-chart-fill"></i> <span className="btn-text-desktop">View Scorecard</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          expiredExams.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="ri-time-line" style={{ fontSize: '2.5rem', color: 'var(--danger)', display: 'block', marginBottom: '12px' }}></i>
              <h3>No Expired Exams</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>All available exam series are currently active.</p>
            </div>
          ) : (
            <div className="grid">
              {expiredExams.map(e => (
                <div key={e.id} className="card" style={{ padding: '20px', opacity: 0.8 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{e.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 700 }}>Expired on: {new Date(e.scheduled_end).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Infinite Scroll Loader */}
      {isLoadingMore && (
        <div style={{ textAlign: 'center', padding: '20px', fontWeight: 700, color: 'var(--primary)' }}>
          ⏳ Loading more exam series...
        </div>
      )}
    </div>
  );
}

export default StudentExamsView;
