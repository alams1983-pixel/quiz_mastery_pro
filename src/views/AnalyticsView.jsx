import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest, getUser } from '../services/api.js';

export function AnalyticsView({ navigate }) {
  const user = getUser() || { role: 'user' };

  if (user.role === 'super_admin') {
    return <SuperAdminAnalyticsView navigate={navigate} />;
  } else if (user.role === 'institute_admin' || user.role === 'admin') {
    return <InstituteAdminAnalyticsView navigate={navigate} />;
  } else {
    return <StudentAnalyticsView navigate={navigate} />;
  }
}

// 1. Student Exam Analytics Component
function StudentAnalyticsView({ navigate }) {
  const [stats, setStats] = useState({ totalExams: 0, avgAccuracy: 0, avgScore: '0.00', avgPercentile: 0, attempts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentStats() {
      try {
        const res = await apiRequest('/analytics/student-exam-stats');
        setStats({
          totalExams: res.totalExams || 0,
          avgAccuracy: res.avgAccuracy || 0,
          avgScore: res.avgScore || '0.00',
          avgPercentile: res.avgPercentile || 0,
          attempts: res.attempts || []
        });
      } catch (err) {
        console.error('Student Exam Analytics Error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentStats();
  }, []);

  return (
    <div className="view-container fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>📊 My CBT Exam Analytics & Performance</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Track your online mock exam attempts, percentiles, institute rankings, and detailed solution scorecards.
        </p>
      </div>

      {/* Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Exams Attempted</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{stats.totalExams}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Average Accuracy</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{stats.avgAccuracy}%</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Average Score</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>{stats.avgScore}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Average Percentile</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{stats.avgPercentile}%</div>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📜 Online CBT Exam Attempt History</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Exam Title</th>
                <th>Mode</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Percentile</th>
                <th>Rank</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>Loading CBT exam performance history...</td></tr>
              ) : stats.attempts.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No online exam attempt logs found yet. Start an exam from your dashboard!</td></tr>
              ) : (
                stats.attempts.map(att => (
                  <tr key={att.id}>
                    <td>{new Date(att.submit_time || att.created_at).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{att.exam_title}</td>
                    <td><span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{att.mode}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{parseFloat(att.total_score).toFixed(2)}</td>
                    <td><span style={{ fontWeight: 700, color: att.accuracy_pct >= 70 ? 'var(--success)' : 'var(--text-main)' }}>{Math.round(att.accuracy_pct)}%</span></td>
                    <td><span style={{ fontWeight: 700, color: '#f59e0b' }}>{att.percentile ? Math.round(att.percentile) + '%ile' : '-'}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--accent)' }}>{att.institute_rank ? '#' + att.institute_rank : '-'}</span></td>
                    <td>
                      <button
                        type="button"
                        onClick={() => navigate('exam-analysis', { attemptId: att.id })}
                        className="btn btn-outline btn-sm"
                        style={{ fontWeight: 700 }}
                      >
                        Scorecard 📊
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. Coaching Institute Admin Analytics Component
function InstituteAdminAnalyticsView() {
  const [data, setData] = useState({
    totalStudents: 0,
    totalExamAttempts: 0,
    classAvgAccuracy: 0,
    classAvgScore: '0.00',
    students: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 1 }
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/analytics/institute-student-analytics?page=${page}&limit=${limit}`);
      setData({
        totalStudents: res.totalStudents || 0,
        totalExamAttempts: res.totalExamAttempts || 0,
        classAvgAccuracy: res.classAvgAccuracy || 0,
        classAvgScore: res.classAvgScore || '0.00',
        students: res.students || [],
        pagination: res.pagination || { total: (res.students || []).length, page, limit, totalPages: 1 }
      });
    } catch (err) {
      console.error('Fetch Institute Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const { totalPages } = data.pagination;

  return (
    <div className="view-container fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>🏫 Institute Student Performance Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Comprehensive student roster, accuracy percentiles, total CBT test attempts, and overall class performance metrics.
        </p>
      </div>

      {/* Overview Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Enrolled Students</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{data.totalStudents.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Student Attempts</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>{data.totalExamAttempts.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Class Average Accuracy</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{data.classAvgAccuracy}%</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Class Average Score</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{data.classAvgScore}</div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>👥 Student Performance Roster</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Exams Attempted</th>
                <th>Average Accuracy</th>
                <th>Max Score</th>
                <th>Best Percentile</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading student performance roster...</td></tr>
              ) : data.students.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No student attempt records found in your institute yet.</td></tr>
              ) : (
                data.students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td style={{ fontWeight: 700 }}>{s.exams_completed || 0}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: s.avg_accuracy >= 70 ? 'var(--success)' : 'var(--text-main)' }}>
                        {s.avg_accuracy ? Math.round(s.avg_accuracy) + '%' : '-'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.max_score ? parseFloat(s.max_score).toFixed(2) : '-'}</td>
                    <td><span style={{ fontWeight: 700, color: '#f59e0b' }}>{s.max_percentile ? Math.round(s.max_percentile) + '%' : '-'}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.last_active ? new Date(s.last_active).toLocaleString() : 'Never'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing Page {page} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="btn btn-outline btn-sm"
            >
              First
            </button>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="btn btn-outline btn-sm"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="btn btn-outline btn-sm"
            >
              Last
            </button>
            <select
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
              className="form-control"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
            >
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Super Admin Platform Analytics Component
function SuperAdminAnalyticsView() {
  const [platformData, setPlatformData] = useState({ totals: {}, institutes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlatformStats() {
      try {
        const res = await apiRequest('/analytics/platform-analytics');
        setPlatformData({ totals: res.totals || {}, institutes: res.institutes || [] });
      } catch (err) {
        console.error('Platform Analytics Error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlatformStats();
  }, []);

  const { totals, institutes } = platformData;

  return (
    <div className="view-container fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>👑 Platform-Wide Super Admin Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Comprehensive platform metrics across all registered coaching tenants, users, and exam activity.
        </p>
      </div>

      {/* Totals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Users</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{totals.total_users || 0}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Students</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{totals.total_students || 0}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Coaching Institutes</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>{totals.total_institutes || 0}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total CBT Attempts</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{totals.total_exam_attempts || 0}</div>
        </div>
      </div>

      {/* Multi-Tenant Comparative Matrix Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>🏫 Multi-Tenant Institute Comparative Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Institute Name</th>
                <th>Code</th>
                <th>Enrolled Students</th>
                <th>Total Exams</th>
                <th>Total CBT Attempts</th>
                <th>Avg Student Accuracy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading platform comparative matrix...</td></tr>
              ) : institutes.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No institutes registered yet.</td></tr>
              ) : (
                institutes.map(i => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{i.name}</td>
                    <td><span className="code-pill">{i.code}</span></td>
                    <td style={{ fontWeight: 700 }}>{i.student_count || 0}</td>
                    <td>{i.exam_count || 0}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{i.attempt_count || 0}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: i.avg_student_accuracy >= 70 ? 'var(--success)' : 'var(--text-main)' }}>
                        {i.avg_student_accuracy ? Math.round(i.avg_student_accuracy) + '%' : '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${i.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;
