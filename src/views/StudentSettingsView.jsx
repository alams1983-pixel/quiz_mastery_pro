import React, { useState, useEffect } from 'react';
import { getUser } from '../services/api.js';
import { ConsentManager } from '../services/ConsentManager.js';
import { openCookiePreferencesModal } from '../components/CookieConsentModal.js';

export function StudentSettingsView({ navigate }) {
  const user = getUser();
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [batchError, setBatchError] = useState(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passAlert, setPassAlert] = useState({ show: false, type: '', message: '' });
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('login');
      return;
    }

    async function loadBatches() {
      const instId = user.institute_id;
      const token = localStorage.getItem('token');
      if (!instId || !token || user.role !== 'user') {
        setLoadingBatches(false);
        return;
      }

      try {
        const response = await fetch(`/api/institutes/${instId}/batches-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed loading batches');

        const data = await response.json();
        setBatches(data.batches || []);
      } catch (err) {
        console.error('Error loading institute batches:', err);
        setBatchError('Failed loading institute batches.');
      } finally {
        setLoadingBatches(false);
      }
    }

    loadBatches();
  }, [user, navigate]);

  const handleJoinBatchRequest = async (batchId) => {
    const token = localStorage.getItem('token');
    try {
      const reqRes = await fetch('/api/institutes/batches/join-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ batch_id: batchId })
      });
      const data = await reqRes.json();
      if (reqRes.ok) {
        // Refresh batches
        setBatches(prev => prev.map(b => b.id === batchId ? { ...b, student_status: 'pending' } : b));
      } else {
        alert(data.error || 'Failed to submit batch request.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassAlert({ show: true, type: 'danger', message: 'New password and confirmation password do not match.' });
      return;
    }

    setPassSaving(true);
    setPassAlert({ show: false, type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPassAlert({ show: true, type: 'success', message: data.message || 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassAlert({ show: true, type: 'danger', message: data.error || 'Failed to change password.' });
      }
    } catch (err) {
      setPassAlert({ show: true, type: 'danger', message: 'Error connecting to server. Please try again.' });
    } finally {
      setPassSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container page-view fade-in" style={{ maxWidth: '1400px', padding: '2rem 1rem' }}>
      {/* Page Header */}
      <div className="responsive-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            ⚙️ Account Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your personal profile, change password, and view enrolled class & batch memberships.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="btn btn-secondary"
          title="Back to Student Dashboard"
          aria-label="Back to Student Dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <i className="ri-arrow-left-line"></i> <span className="btn-text-desktop">Back to Dashboard</span>
        </button>
      </div>

      {/* Layout Grid */}
      <div className="settings-grid">
        {/* Left Column: Teacher Branding Links & Class Enrollments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 1' }}>
          {user && (user.role === 'institute_admin' || user.role === 'admin' || user.role === 'super_admin') && (
            <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🌐 Coaching Portal Branding
                </h3>
                <span className="badge" style={{ background: 'var(--primary)', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.75rem' }}>
                  Teacher Admin
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.45 }}>
                Customize your student login portal, colors, logo, welcome messages, and copy your shareable student URLs.
              </p>
              <button
                type="button"
                onClick={() => navigate('coaching-branding')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                ✏️ Manage Portal Branding & URLs
              </button>
            </div>
          )}

          {(!user || user.role === 'user') && (
            <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📚 Class & Batch Memberships
                </h3>
                <span style={{ fontSize: '0.8rem', background: 'var(--success-bg)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600, border: '1px solid var(--success-border)' }}>
                  Teacher Approval
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Join batches created by your coaching institute to gain access to batch-specific CBT exams and tests.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loadingBatches && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    Loading institute batches...
                  </div>
                )}

                {batchError && (
                  <div style={{ textAlign: 'center', padding: '1.2rem', background: 'var(--app-bg)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--danger)', border: '1px solid var(--border-color)' }}>
                    {batchError}
                  </div>
                )}

                {!loadingBatches && !batchError && batches.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.2rem', background: 'var(--app-bg)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    No batches or classes created yet for your institute.
                  </div>
                )}

                {!loadingBatches && !batchError && batches.map(b => {
                  const batchName = b.batch_name || b.name || 'Unnamed Batch';
                  const batchCode = b.batch_code || b.code || '';

                  let statusBadge = null;
                  let actionBtn = null;

                  if (b.student_status === 'approved') {
                    statusBadge = <span style={{ fontSize: '0.8rem', background: 'var(--success-bg)', color: 'var(--success)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontWeight: 700, border: '1px solid var(--success-border)' }}>✅ Active Batch</span>;
                  } else if (b.student_status === 'pending') {
                    statusBadge = <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', padding: '0.25rem 0.65rem', borderRadius: '20px', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.35)' }}>⏳ Pending Approval</span>;
                  } else if (b.student_status === 'rejected') {
                    statusBadge = <span style={{ fontSize: '0.8rem', background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontWeight: 700, border: '1px solid var(--danger-border)' }}>❌ Request Rejected</span>;
                    actionBtn = <button type="button" onClick={() => handleJoinBatchRequest(b.id)} className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>Re-Apply</button>;
                  } else {
                    actionBtn = <button type="button" onClick={() => handleJoinBatchRequest(b.id)} className="btn btn-primary btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>Request to Join</button>;
                  }

                  return (
                    <div key={b.id} style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{batchName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {b.target_exam ? `Exam: ${b.target_exam} ` : ''} {batchCode ? `(Code: ${batchCode})` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {statusBadge}
                        {actionBtn}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Profile Details & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Profile Info Card */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👤 Personal Profile
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>{user.full_name || 'Student'}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address</label>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{user.email}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--text-muted)' }}>Account Role</label>
                <div style={{ marginTop: '0.2rem' }}>
                  <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize' }}>
                    {(user.role || 'user').replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Card */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔒 Security & Password Management
            </h3>

            <form onSubmit={handlePasswordSubmit}>
              {passAlert.show && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  background: passAlert.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: passAlert.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${passAlert.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`
                }}>
                  {passAlert.message}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  minLength={6}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px' }}
                />
              </div>

              <button
                type="submit"
                disabled={passSaving}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontWeight: 700 }}
              >
                {passSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* GDPR Privacy & Cookie Storage Settings Card */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🛡️ Privacy & Cookie Storage Controls
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.45 }}>
              Control your data privacy preferences under GDPR & ePrivacy regulations. View and manage optional storage categories (functional UI choices, performance metrics, and marketing tags).
            </p>

            <div style={{ background: 'var(--app-bg)', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>Consent Decision Status</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {ConsentManager.hasDecided() ? '✓ Preferences Configured' : '⚠️ Pending Decision'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openCookiePreferencesModal()}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="ri-settings-4-line"></i> Manage Preferences
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default StudentSettingsView;
