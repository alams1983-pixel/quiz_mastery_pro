import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

export function UserManagementView() {
  const [data, setData] = useState({
    users: [],
    totals: { totalUsers: 0, superAdmins: 0, instituteAdmins: 0, quizAdmins: 0, students: 0 },
    pagination: { total: 0, page: 1, limit: 20, totalPages: 1 }
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = `/users/all?page=${page}&limit=${limit}`;
      if (roleFilter) endpoint += `&role=${roleFilter}`;
      if (searchQuery) endpoint += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await api.getUsersAll(endpoint);
      setData({
        users: res.users || [],
        totals: res.totals || { totalUsers: 0, superAdmins: 0, instituteAdmins: 0, quizAdmins: 0, students: 0 },
        pagination: res.pagination || { total: 0, page, limit, totalPages: 1 }
      });
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, roleFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change role for user #${userId} to ${newRole.replace('_', ' ')}?`)) {
      return;
    }

    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const { totalPages } = data.pagination;
  const { totals } = data;

  return (
    <div className="view-container fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            👑 User Role Control & Access Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Platform-wide user management. Assign administrator permissions, adjust user roles, and monitor active accounts with server-side pagination.
          </p>
        </div>
        <span className="role-badge super_admin" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
          👑 Super Admin Privileged
        </span>
      </div>

      {/* User Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total User Accounts</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{totals.totalUsers || 0}</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Super Administrators</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>{totals.superAdmins || 0}</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Institute Admins</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>{totals.instituteAdmins || 0}</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Quiz Admins</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{totals.quizAdmins || 0}</div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Students / Users</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{totals.students || 0}</div>
        </div>
      </div>

      {/* User Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>User Account Directory</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="form-select"
              style={{ padding: '8px 12px', width: '160px', fontSize: '0.88rem' }}
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="institute_admin">Institute Admin</option>
              <option value="admin">Quiz Admin</option>
              <option value="user">Student / User</option>
            </select>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              style={{ width: '260px', fontSize: '0.88rem' }}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="custom-table mobile-card-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Registration Date</th>
                <th>Role Permission Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Loading user directory...</td></tr>
              ) : data.users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No user accounts found matching query.</td></tr>
              ) : (
                data.users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.full_name || 'User'}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role || 'user'}`}>
                        {(u.role || 'user').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="form-select"
                        title="Change User Access Role"
                        aria-label="Change User Access Role"
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

export default UserManagementView;
