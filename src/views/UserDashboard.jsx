import React, { useState, useEffect } from 'react';
import { apiRequest, getUser } from '../services/api.js';

export function UserDashboard({ navigate }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instStats, setInstStats] = useState(null);
  const user = getUser();

  useEffect(() => {
    async function loadSSCExams() {
      try {
        const res = await apiRequest('/exams');
        const examList = res.exams || [];
        const liveExams = examList.filter(e => e.is_published);
        setExams(liveExams.slice(0, 3));
      } catch (err) {
        console.warn('Could not load SSC exams:', err);
      } finally {
        setLoading(false);
      }
    }

    async function loadInstituteStats() {
      if (user && (user.role === 'institute_admin' || user.role === 'admin' || user.role === 'super_admin')) {
        try {
          const [examsRes, studentsRes, quizzesRes] = await Promise.all([
            apiRequest('/exams'),
            user.institute_id ? apiRequest(`/institutes/${user.institute_id}/students`).catch(() => ({ students: [] })) : Promise.resolve({ students: [] }),
            apiRequest('/quizzes')
          ]);
          setInstStats({
            students: (studentsRes.students || []).length,
            exams: (examsRes.exams || []).length,
            quizzes: (quizzesRes.quizzes || []).length
          });
        } catch (err) {
          console.warn('Failed to load institute stats:', err);
        }
      }
    }

    loadSSCExams();
    loadInstituteStats();
  }, []);

  const isCoachingAdmin = user && (user.role === 'institute_admin' || user.role === 'admin' || user.role === 'super_admin');

  return (
    <div className="view-container fade-in">
      {/* Hero Home Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #1e1b4b 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 36px',
        color: '#ffffff',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <img 
              src="/uploads/edutorai_logo.webp" 
              alt="EdutorAi Logo" 
              className="dashboard-hero-logo edutor-responsive-logo"
            />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {isCoachingAdmin
              ? `Welcome to ${user.institute_name || 'EdutorAi Pro'} Coaching Portal 🏢`
              : `Welcome to EdutorAi Pro Student Portal`
            }
          </h1>
          <p style={{ opacity: 0.9, fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.5 }}>
            {isCoachingAdmin
              ? 'Manage your coaching institute\'s student roster, target batches, CBT mock examinations, and practice quizzes.'
              : 'Access your live proctored CBT exams, take self-paced practice quizzes, or build custom self-assessment tests.'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {isCoachingAdmin ? (
            <>
              <button
                type="button"
                className="btn"
                onClick={() => navigate('institute-batches')}
                title="Manage Target Batches & Classes"
                aria-label="Manage Target Batches & Classes"
                style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 800, padding: '12px 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="ri-team-line"></i> <span className="btn-text-desktop">Batches & Classes</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate('institute-students')}
                title="View Enrolled Student Roster"
                aria-label="View Enrolled Student Roster"
                style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.35)', fontWeight: 800, padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="ri-user-search-line"></i> <span className="btn-text-desktop">Student Roster</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn"
                onClick={() => navigate('student-exams')}
                title="View Live & Scheduled Exams"
                aria-label="View Live & Scheduled Exams"
                style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 800, padding: '12px 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="ri-computer-line"></i> <span className="btn-text-desktop">Go to My Exams</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => navigate('student-quizzes')}
                title="View Self-Paced Practice Quizzes"
                aria-label="View Self-Paced Practice Quizzes"
                style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.35)', fontWeight: 800, padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="ri-task-line"></i> <span className="btn-text-desktop">Go to Practice Quizzes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Overview Cards (For Teachers / Coaching Admins on Home Page Only) */}
      {instStats && (
        <div className="saas-stats-grid" style={{ marginBottom: '28px' }}>
          <div className="saas-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('institute-students')}>
            <div className="saas-stat-icon"><i className="ri-user-follow-line"></i></div>
            <div className="saas-stat-info">
              <span className="saas-stat-value">{instStats.students}</span>
              <span className="saas-stat-label">Enrolled Students</span>
            </div>
          </div>

          <div className="saas-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('institute-admin')}>
            <div className="saas-stat-icon"><i className="ri-computer-line"></i></div>
            <div className="saas-stat-info">
              <span className="saas-stat-value">{instStats.exams}</span>
              <span className="saas-stat-label">Live Online Exams</span>
            </div>
          </div>

          <div className="saas-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('admin')}>
            <div className="saas-stat-icon"><i className="ri-file-list-3-line"></i></div>
            <div className="saas-stat-info">
              <span className="saas-stat-value">{instStats.quizzes}</span>
              <span className="saas-stat-label">Practice Quizzes</span>
            </div>
          </div>
        </div>
      )}

      {/* Live & Scheduled CBT Exams Section (Rendered for Students Only) */}
      {!isCoachingAdmin && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="ri-computer-line" style={{ color: 'var(--primary)' }}></i> Scheduled Online CBT Live Exams
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Live multi-section proctored mock examinations for your enrolled batch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('student-exams')}
              className="btn-text"
              title="View full list of scheduled CBT exams"
              aria-label="View full list of scheduled CBT exams"
              style={{ fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span className="btn-text-desktop">View All Exams</span> <i className="ri-arrow-right-line"></i>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                Loading live CBT exams...
              </div>
            ) : exams.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '36px', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                No live scheduled CBT exams currently active. Explore practice quizzes!
              </div>
            ) : (
              exams.map(e => (
                <div key={e.id} className="card" style={{ border: '2px solid var(--primary-border)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge-tag">{e.exam_type}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'capitalize' }}>{e.mode} Mode</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>{e.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', flex: 1 }}>
                    {e.description || 'Official Online CBT Mock Examination.'}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', background: 'var(--bg-color)', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>⏱ {e.total_duration_mins} Mins</span>
                    <span>Marks: +{parseFloat(e.positive_marks).toFixed(1)} / -{parseFloat(e.negative_marks).toFixed(1)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('exam-lobby', { examId: e.id })}
                    className="btn btn-primary"
                    title="Enter Examination Instructions Lobby"
                    aria-label="Enter Examination Instructions Lobby"
                    style={{ width: '100%', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <i className="ri-login-box-line"></i> <span className="btn-text-desktop">Enter Exam Lobby</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Admin / Student Guidelines */}
      <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--accent)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ri-information-line" style={{ color: 'var(--accent)' }}></i> {isCoachingAdmin ? 'Coaching Admin Portal Overview' : 'Student Exam & Practice Guidelines'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isCoachingAdmin ? (
            <>
              <div style={{ background: 'var(--bg-color)', padding: '14px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>🏷️ Batches & Classes</strong>
                Create target batches (e.g., SSC CGL Morning 2026), approve student join requests, and manage access.
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '14px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>👥 Student Roster</strong>
                Directory of all students linked to your institute code, attempt counts, and performance metrics.
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '14px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>💻 CBT Exam Engine Setup</strong>
                Build multi-section online mock exams with positive/negative marking and schedule windows.
              </div>
            </>
          ) : (
            <>
              <div style={{ background: 'var(--bg-color)', padding: '14px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>💻 Proctored CBT Engine</strong>
                Full-screen TCS iON exam engine with positive & negative marking, timer countdowns, and section navigation.
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '14px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>📝 Practice Quizzes</strong>
                Self-paced practice sessions with immediate KaTeX solution explanations and question booklet PDF downloads.
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '14px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>🏛️ Batch Target Access</strong>
                Enrolled students automatically receive mock exams assigned to their class or batch.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
