import React, { useState, useEffect } from 'react';
import { apiRequest, getUser } from '../services/api.js';

function getSubdomainURL(slugOrCode) {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    return `${protocol}//${slugOrCode}.localhost${port}`;
  }

  const parts = hostname.split('.');
  let rootDomain = hostname;
  if (parts.length >= 2) {
    rootDomain = parts.slice(-2).join('.');
  }
  return `${protocol}//${slugOrCode}.${rootDomain}${port}`;
}

export function CoachingBrandingView({ navigate }) {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    code: '',
    logo_url: '',
    theme_color: '#4f46e5',
    portal_title: '',
    portal_subtitle: '',
    banner_url: '',
    allow_global_content: true
  });

  const [copySubText, setCopySubText] = useState('Copy');
  const [copyFallbackText, setCopyFallbackText] = useState('Copy');

  useEffect(() => {
    if (!user || (user.role !== 'institute_admin' && user.role !== 'admin' && user.role !== 'super_admin')) {
      navigate('dashboard');
      return;
    }

    async function fetchBrandingData() {
      try {
        const instId = user.institute_id;
        if (!instId) return;

        const res = await apiRequest(`/institutes/${instId}`);
        const inst = res.institute;

        if (inst) {
          setFormData({
            name: inst.name || '',
            slug: inst.slug || inst.code?.toLowerCase() || '',
            code: inst.code || '',
            logo_url: inst.logo_url || '',
            theme_color: inst.theme_color || '#4f46e5',
            portal_title: inst.portal_title || `Welcome to ${inst.name}`,
            portal_subtitle: inst.portal_subtitle || 'Sign in to access your batch tests and practice quizzes.',
            banner_url: inst.banner_url || '',
            allow_global_content: inst.allow_global_content === undefined ? true : Boolean(inst.allow_global_content)
          });
        }
      } catch (err) {
        console.error('Fetch Branding Error:', err);
        setAlert({ show: true, type: 'danger', message: 'Failed loading institute branding settings.' });
      } finally {
        setLoading(false);
      }
    }

    fetchBrandingData();
  }, [user, navigate]);

  const subdomainUrl = formData.slug ? getSubdomainURL(formData.slug) : getSubdomainURL('your-coaching');
  const fallbackUrl = `${window.location.origin}/?inst=${formData.code || 'CODE'}`;

  const handleCopySubdomain = () => {
    navigator.clipboard.writeText(subdomainUrl);
    setCopySubText('Copied! ✓');
    setTimeout(() => setCopySubText('Copy'), 2000);
  };

  const handleCopyFallback = () => {
    navigator.clipboard.writeText(fallbackUrl);
    setCopyFallbackText('Copied! ✓');
    setTimeout(() => setCopyFallbackText('Copy'), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const instId = user.institute_id;
      const slugVal = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await apiRequest(`/institutes/${instId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          slug: slugVal,
          logo_url: formData.logo_url,
          theme_color: formData.theme_color,
          portal_title: formData.portal_title,
          portal_subtitle: formData.portal_subtitle,
          banner_url: formData.banner_url,
          allow_global_content: formData.allow_global_content ? 1 : 0
        })
      });

      setAlert({ show: true, type: 'success', message: '✅ Portal Branding & Customization updated successfully!' });
    } catch (err) {
      setAlert({ show: true, type: 'danger', message: err.message || 'Error updating branding.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-view" style={{ maxWidth: '1050px', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Coaching Branding Settings...
      </div>
    );
  }

  return (
    <div className="container page-view fade-in" style={{ maxWidth: '1050px', padding: '2rem 1rem' }}>
      {/* Header */}
      <div className="responsive-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            🌐 Coaching Portal Branding & Customization
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Customize your student login portal, theme colors, and share your unique coaching URL with students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('student-settings')}
          className="btn btn-secondary"
          title="Back to Account Settings"
          aria-label="Back to Account Settings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <i className="ri-arrow-left-line"></i> <span className="btn-text-desktop">Back to Settings</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="settings-grid">
        {/* Left Column: Shareable URLs & Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Shareable Links Card */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔗 Shareable Student Login URLs
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Share these unique URLs with your students so they can access your customized student login page.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Subdomain URL (Recommended):
              </label>
              <div className="copy-url-group">
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  value={subdomainUrl}
                  style={{ flex: 1, fontWeight: 600, background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <button
                  type="button"
                  onClick={handleCopySubdomain}
                  className="btn btn-primary"
                  style={{ flexShrink: 0, padding: '0.65rem 1rem' }}
                >
                  {copySubText}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                Fallback Shareable Link:
              </label>
              <div className="copy-url-group">
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  value={fallbackUrl}
                  style={{ flex: 1, background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <button
                  type="button"
                  onClick={handleCopyFallback}
                  className="btn btn-secondary"
                  style={{ flexShrink: 0, padding: '0.65rem 1rem' }}
                >
                  {copyFallbackText}
                </button>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--primary-light)', borderRadius: '10px', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>💡 How Subdomains Work:</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                When students open your unique URL, your custom logo, institute name, banner, and theme colors will load automatically on their login screen!
              </p>
            </div>
          </div>

          {/* Portal Preview Card */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👀 Live Branding Preview
            </h3>

            <div style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 0.75rem', overflow: 'hidden' }}>
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  '🎓'
                )}
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem 0' }}>
                {formData.portal_title || formData.name || 'Welcome to Your Institute'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                {formData.portal_subtitle || 'Sign in to access your batch tests and practice quizzes.'}
              </p>
              <button
                type="button"
                className="btn"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', fontWeight: 600, background: formData.theme_color, color: '#ffffff' }}
              >
                Sample Student Button
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Customization Form */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎨 Customize Portal Settings
          </h3>

          <form onSubmit={handleSubmit}>
            {alert.show && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                background: alert.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: alert.type === 'success' ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${alert.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
              }}>
                {alert.message}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>Institute Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex IAS Academy"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>URL Subdomain Slug *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. apex-academy"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)' }}
              />
              <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                Unique subdomain prefix. Auto-slugified from institute name if blank.
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>Institute Logo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/logo.png"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>Primary Theme Color</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  style={{ width: '44px', height: '38px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="#4f46e5"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  style={{ flex: 1, fontFamily: 'monospace', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>Login Welcome Heading</label>
              <input
                type="text"
                className="form-input"
                placeholder="Welcome to Apex IAS Academy"
                value={formData.portal_title}
                onChange={(e) => setFormData({ ...formData, portal_title: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>Login Subtitle / Description</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Sign in to access your batch tests and practice quizzes."
                value={formData.portal_subtitle}
                onChange={(e) => setFormData({ ...formData, portal_subtitle: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block', color: 'var(--text-main)' }}>Login Banner Image URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/banner.jpg"
                value={formData.banner_url}
                onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                <input
                  type="checkbox"
                  checked={formData.allow_global_content}
                  onChange={(e) => setFormData({ ...formData, allow_global_content: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Show Super Admin Global Public Quizzes
              </label>
              <small style={{ display: 'block', marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                When checked, students can attempt global public mock tests alongside institute tests. Uncheck to restrict students strictly to your coaching content.
              </small>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontWeight: 700 }}
            >
              {saving ? 'Saving Portal Branding...' : '💾 Save Portal Branding'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CoachingBrandingView;
