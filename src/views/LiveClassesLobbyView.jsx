import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest, getUser } from '../services/api.js';
import { LiveClassStudentView } from './LiveClassStudentView.jsx';
import { LiveClassTeacherStudio } from './LiveClassTeacherStudio.jsx';

export function LiveClassesLobbyView({ navigate }) {
  const user = getUser();
  const isAdmin = user && ['institute_admin', 'super_admin', 'admin'].includes(user.role);

  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Session State
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isInstructorMode, setIsInstructorMode] = useState(false);

  // Filter
  const [selectedBatchId, setSelectedBatchId] = useState('');

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedSubject, setSchedSubject] = useState('');
  const [schedDesc, setSchedDesc] = useState('');
  const [schedStartTime, setSchedStartTime] = useState('');
  const [schedEndTime, setSchedEndTime] = useState('');
  const [schedIsAllBatches, setSchedIsAllBatches] = useState(false);
  const [schedSelectedBatchIds, setSchedSelectedBatchIds] = useState([]);
  const [scheduling, setScheduling] = useState(false);
  const [schedError, setSchedError] = useState('');

  const fetchBatches = useCallback(async () => {
    try {
      const res = await apiRequest('/exams/batches/all');
      setBatches(res.batches || []);
    } catch (err) {
      console.warn('Could not load batches:', err);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatchId) params.append('batchId', selectedBatchId);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest(`/live-classes${qs}`);
      setClasses(res.classes || []);
    } catch (err) {
      console.error('Error fetching live classes:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBatchId]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedTitle.trim() || !schedSubject.trim() || !schedStartTime || !schedEndTime) {
      setSchedError('Please fill in all required fields.');
      return;
    }

    setScheduling(true);
    setSchedError('');

    try {
      await apiRequest('/live-classes', {
        method: 'POST',
        body: JSON.stringify({
          title: schedTitle.trim(),
          subject: schedSubject.trim(),
          description: schedDesc.trim() || null,
          scheduledStartTime: schedStartTime,
          scheduledEndTime: schedEndTime,
          isAllBatches: schedIsAllBatches,
          batchIds: schedSelectedBatchIds,
        }),
      });

      setShowScheduleModal(false);
      resetScheduleForm();
      fetchClasses();
    } catch (err) {
      setSchedError(err.message || 'Failed to schedule class');
    } finally {
      setScheduling(false);
    }
  };

  const resetScheduleForm = () => {
    setSchedTitle('');
    setSchedSubject('');
    setSchedDesc('');
    setSchedStartTime('');
    setSchedEndTime('');
    setSchedIsAllBatches(false);
    setSchedSelectedBatchIds([]);
    setSchedError('');
  };

  // If in active live session, render full-screen view
  if (activeSessionId) {
    if (isInstructorMode) {
      return (
        <LiveClassTeacherStudio
          classId={activeSessionId}
          onLeave={() => {
            setActiveSessionId(null);
            fetchClasses();
          }}
        />
      );
    }
    return (
      <LiveClassStudentView
        classId={activeSessionId}
        onLeave={() => {
          setActiveSessionId(null);
          fetchClasses();
        }}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            📡 Interactive Live Classes
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Join real-time lectures equipped with interactive chat, live MCQ polls, and audio hand-raise.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowScheduleModal(true)}
            style={{
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-pill, 9999px)',
              padding: '10px 22px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px var(--danger-border)',
            }}
          >
            <span>📹</span> Schedule Live Class
          </button>
        )}
      </div>

      {/* Batch Filter */}
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          padding: '16px',
          borderRadius: 'var(--radius-md, 14px)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by Batch:</label>
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm, 8px)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-color)',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--text-main)',
            outline: 'none',
          }}
        >
          <option value="">🎯 All Accessible Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📡</div>
          Loading scheduled classes...
        </div>
      ) : classes.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-md, 14px)',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎙️</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>No Live Classes Scheduled</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {selectedBatchId
              ? 'No classes found for this specific batch.'
              : 'There are no active or upcoming live classes at this moment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {classes.map((cls) => {
            const isCurrentlyLive = cls.status === 'live';
            const isCompleted = cls.status === 'completed';

            return (
              <div
                key={cls.id}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: 'var(--radius-md, 14px)',
                  padding: '20px',
                  border: isCurrentlyLive ? '2px solid var(--danger)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isCurrentlyLive ? '0 4px 16px var(--danger-border)' : 'var(--shadow-sm)',
                }}
              >
                <div>
                  {/* Status Banner */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: isCurrentlyLive ? 'var(--danger)' : isCompleted ? 'var(--card-hover-bg)' : 'var(--primary)',
                        color: isCompleted ? 'var(--text-muted)' : '#ffffff',
                        border: isCompleted ? '1px solid var(--border-color)' : 'none',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      {isCurrentlyLive && <span style={{ animation: 'pulse 1s infinite' }}>●</span>}
                      {isCurrentlyLive ? 'LIVE NOW' : isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '3px 8px', borderRadius: '4px' }}>
                      {cls.subject}
                    </span>
                  </div>

                  {/* Title & Instructor */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                    {cls.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    👨‍🏫 Instructor: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cls.instructor_name}</span>
                  </div>

                  {/* Time Info */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                    <div>📅 {new Date(cls.scheduled_start_time).toLocaleDateString()}</div>
                    <div style={{ marginTop: '2px', fontWeight: 600, color: 'var(--text-main)' }}>
                      🕒 {new Date(cls.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(cls.scheduled_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Batch Info */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    👥 {cls.is_all_batches ? 'All Batches' : cls.assigned_batches || 'Assigned Batches'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', gap: '8px' }}>
                  {isCurrentlyLive ? (
                    <button
                      onClick={() => {
                        setActiveSessionId(cls.id);
                        setIsInstructorMode(isAdmin);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--danger)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-sm, 8px)',
                        padding: '10px 16px',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px var(--danger-border)',
                      }}
                    >
                      <span>▶</span> {isAdmin ? 'Enter Teacher Studio' : 'Join Live Stream Now'}
                    </button>
                  ) : isCompleted ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600 }}>
                        ✅ Class Concluded • Replay Saved
                      </div>
                      <button
                        onClick={() => navigate ? navigate('videos') : (window.location.hash = '#videos')}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid var(--primary)',
                          borderRadius: 'var(--radius-sm, 8px)',
                          padding: '8px 14px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>📹</span> Watch Replay in Video Lectures
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSessionId(cls.id);
                        setIsInstructorMode(isAdmin);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: isAdmin ? 'var(--primary)' : 'var(--card-hover-bg)',
                        color: isAdmin ? '#ffffff' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 8px)',
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {isAdmin ? '🎙️ Open Studio & Prepare' : 'Scheduled (Starts soon)'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal (Admin) */}
      {showScheduleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius-lg, 20px)',
              maxWidth: '540px',
              width: '100%',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--text-main)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Schedule Live Class
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                disabled={scheduling}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {schedError && (
              <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', padding: '10px 14px', borderRadius: 'var(--radius-sm, 8px)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {schedError}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Class Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Electrostatics Problem Solving Live"
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Physics"
                  value={schedSubject}
                  onChange={(e) => setSchedSubject(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={schedStartTime}
                    onChange={(e) => setSchedStartTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={schedEndTime}
                    onChange={(e) => setSchedEndTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Batch Assignment Selector */}
              <div
                style={{
                  backgroundColor: 'var(--bg-color)',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Assign to Batches
                  </span>
                  <label style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={schedIsAllBatches}
                      onChange={(e) => setSchedIsAllBatches(e.target.checked)}
                    />
                    All Batches in Institute
                  </label>
                </div>

                {!schedIsAllBatches && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {batches.map((b) => (
                      <label key={b.id} style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={schedSelectedBatchIds.includes(b.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSchedSelectedBatchIds([...schedSelectedBatchIds, b.id]);
                            } else {
                              setSchedSelectedBatchIds(schedSelectedBatchIds.filter((id) => id !== b.id));
                            }
                          }}
                        />
                        {b.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  disabled={scheduling}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-hover-bg, transparent)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    border: 'none',
                    backgroundColor: 'var(--danger)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: scheduling ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px var(--danger-border)',
                  }}
                >
                  {scheduling ? 'Scheduling...' : 'Create Live Class Stream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm, 8px)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-main)',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none',
};
