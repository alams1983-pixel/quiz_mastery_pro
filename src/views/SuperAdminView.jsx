import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api.js';
import { ReactModal } from '../components/ReactModal.jsx';

export function SuperAdminView() {
  const [activeTab, setActiveTab] = useState('institutes'); // 'institutes' | 'users'
  const [stats, setStats] = useState({ total_institutes: 0, total_students: 0, total_quizzes: 0, total_users: 0 });
  const [institutes, setInstitutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchInst, setSearchInst] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Institute Modal State
  const [showInstModal, setShowInstModal] = useState(false);
  const [instName, setInstName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instAddress, setInstAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [instSaving, setInstSaving] = useState(false);

  const loadSuperAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, instsRes, usersRes] = await Promise.all([
        apiRequest('/super-admin/stats').catch(() => ({ stats: {} })),
        apiRequest('/super-admin/institutes').catch(() => ({ institutes: [] })),
        apiRequest('/super-admin/users').catch(() => ({ users: [] }))
      ]);

      setStats(statsRes.stats || {});
      setInstitutes(instsRes.institutes || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Error loading super admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuperAdminData();
  }, [loadSuperAdminData]);

  const handleCreateInstitute = async (e) => {
    e.preventDefault();
    if (!instName || !instEmail) return;

    setInstSaving(true);
    try {
      await apiRequest('/institutes', {
        method: 'POST',
        body: JSON.stringify({
          name: instName,
          contact_email: instEmail,
          address: instAddress,
          admin_name: adminName,
          admin_email: adminEmail,
          admin_password: adminPassword
        })
      });

      setShowInstModal(false);
      setInstName('');
      setInstEmail('');
      setInstAddress('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      loadSuperAdminData();
    } catch (err) {
      alert(err.message || 'Error creating institute.');
    } finally {
      setInstSaving(false);
    }
  };

  const handleDeleteInstitute = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await apiRequest(`/institutes/${id}`, { method: 'DELETE' });
      loadSuperAdminData();
    } catch (err) {
      alert(err.message || 'Error deleting institute.');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await apiRequest(`/super-admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      loadSuperAdminData();
    } catch (err) {
      alert(err.message || 'Error updating role.');
    }
  };

  const filteredInstitutes = institutes.filter(i =>
    (i.name && i.name.toLowerCase().includes(searchInst.toLowerCase())) ||
    (i.code && i.code.toLowerCase().includes(searchInst.toLowerCase()))
  );

  const filteredUsers = users.filter(u =>
    (u.full_name && u.full_name.toLowerCase().includes(searchUser.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchUser.toLowerCase()))
  );

  return (
    <div className="view-container fade-in">
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Super Admin Console 👑</h1>
          <p>Global multi-tenant platform oversight, coaching institute administration, and system metrics.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowInstModal(true)}
            className="btn btn-primary"
          >
            <i className="ri-add-line"></i> Create Coaching Institute
          </button>
        </div>
      </div>

      {/* Platform Stats Cards */}
      <div className="saas-stats-grid">
        <div className="saas-stat-card">
          <div className="saas-stat-icon"><i className="ri-building-4-line"></i></div>
          <div className="saas-stat-info">
            <span className="saas-stat-value">{stats.total_institutes || 0}</span>
            <span className="saas-stat-label">Coaching Institutes</span>
          </div>
        </div>

        <div className="saas-stat-card">
          <div className="saas-stat-icon"><i className="ri-user-star-line"></i></div>
          <div className="saas-stat-info">
            <span className="saas-stat-value">{stats.total_students || 0}</span>
            <span className="saas-stat-label">Enrolled Students</span>
          </div>
        </div>

        <div className="saas-stat-card">
          <div className="saas-stat-icon"><i className="ri-questionnaire-line"></i></div>
          <div className="saas-stat-info">
            <span className="saas-stat-value">{stats.total_quizzes || 0}</span>
            <span className="saas-stat-label">Active Quizzes</span>
          </div>
        </div>

        <div className="saas-stat-card">
          <div className="saas-stat-icon"><i className="ri-shield-user-line"></i></div>
          <div className="saas-stat-info">
            <span className="saas-stat-value">{stats.total_users || 0}</span>
            <span className="saas-stat-label">Total Accounts</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          type="button"
          className={`btn-text ${activeTab === 'institutes' ? 'active' : ''}`}
          onClick={() => setActiveTab('institutes')}
          style={{ fontWeight: 700, padding: '10px 16px', borderBottom: activeTab === 'institutes' ? '3px solid var(--primary)' : 'none', color: activeTab === 'institutes' ? 'var(--text-main)' : 'var(--text-muted)' }}
        >
          Coaching Institutes
        </button>
        <button
          type="button"
          className={`btn-text ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ fontWeight: 700, padding: '10px 16px', borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : 'none', color: activeTab === 'users' ? 'var(--text-main)' : 'var(--text-muted)' }}
        >
          Users & Roles
        </button>
      </div>

      {/* Tab 1: Institutes Table */}
      {activeTab === 'institutes' ? (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Coaching Institutes Directory</h3>
            <input
              type="text"
              placeholder="Search institute name or code..."
              value={searchInst}
              onChange={(e) => setSearchInst(e.target.value)}
              style={{ padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', width: '280px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Institute Name</th>
                  <th>Institute Code</th>
                  <th>Contact Email</th>
                  <th>Students</th>
                  <th>Quizzes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>Loading institutes...</td></tr>
                ) : filteredInstitutes.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No coaching institutes found.</td></tr>
                ) : (
                  filteredInstitutes.map(inst => (
                    <tr key={inst.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inst.name}</td>
                      <td><span className="code-pill">{inst.code}</span></td>
                      <td>{inst.contact_email}</td>
                      <td>{inst.student_count || 0}</td>
                      <td>{inst.quiz_count || 0}</td>
                      <td>
                        <span className={`status-badge ${inst.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-icon-group">
                          <button
                            type="button"
                            onClick={() => handleDeleteInstitute(inst.id, inst.name)}
                            className="btn btn-danger btn-icon-only btn-sm"
                            title="Delete Coaching Institute"
                            aria-label="Delete Coaching Institute"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Users & Roles Table */
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>User Accounts & Role Permissions</h3>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', width: '280px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Institute</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No user accounts found.</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.full_name || 'User'}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role || 'user'}`}>
                          {(u.role || 'user').replace('_', ' ')}
                        </span>
                      </td>
                      <td>{u.institute_name || 'Global Platform'}</td>
                      <td>
                        <select
                          value={u.role || 'user'}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          <option value="user">Student / User</option>
                          <option value="admin">Quiz Admin</option>
                          <option value="institute_admin">Institute Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Institute Modal */}
      <ReactModal
        isOpen={showInstModal}
        title="🏫 Register New Coaching Institute"
        onClose={() => setShowInstModal(false)}
      >
        <form onSubmit={handleCreateInstitute} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Institute Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Apex IAS Academy"
              required
              value={instName}
              onChange={(e) => setInstName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Contact Email *</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. contact@apex.com"
              required
              value={instEmail}
              onChange={(e) => setInstEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Delhi, India"
              value={instAddress}
              onChange={(e) => setInstAddress(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)' }}>Initial Institute Admin Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Admin Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Director Sharma"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Admin Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. director@apex.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Admin Initial Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={instSaving}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontWeight: 700, marginTop: '8px' }}
          >
            {instSaving ? 'Creating Institute...' : '🚀 Create Institute'}
          </button>
        </form>
      </ReactModal>
    </div>
  );
}

export default SuperAdminView;
