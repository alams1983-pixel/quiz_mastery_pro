import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest, getUser } from '../services/api.js';
import { SecurePdfViewer } from '../components/SecurePdfViewer.jsx';

export function StudyMaterialsView({ navigate }) {
  const user = getUser();
  const isAdmin = user && ['institute_admin', 'super_admin', 'admin'].includes(user.role);

  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Document Viewer state
  const [activeDocData, setActiveDocData] = useState(null);
  const [openingDocId, setOpeningDocId] = useState(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadChapter, setUploadChapter] = useState('');
  const [uploadCategory, setUploadCategory] = useState('notes');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadIsAllBatches, setUploadIsAllBatches] = useState(false);
  const [uploadSelectedBatchIds, setUploadSelectedBatchIds] = useState([]);
  const [uploadIsDownloadable, setUploadIsDownloadable] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch batches for filter / assignment
  const fetchBatches = useCallback(async () => {
    try {
      const res = await apiRequest('/exams/batches/all');
      setBatches(res.batches || []);
    } catch (err) {
      console.warn('Could not load batches:', err);
    }
  }, []);

  // Fetch study materials with active filters
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatchId) params.append('batchId', selectedBatchId);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest(`/study-materials${qs}`);
      setMaterials(res.materials || []);
    } catch (err) {
      console.error('Error loading study materials:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBatchId, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Open Document in Secure Viewer
  const handleOpenDocument = async (id) => {
    setOpeningDocId(id);
    try {
      const res = await apiRequest(`/study-materials/${id}/view`);
      setActiveDocData(res);
    } catch (err) {
      alert(err.message || 'Failed to open document. Please verify your batch enrollment.');
    } finally {
      setOpeningDocId(null);
    }
  };

  // Delete Document (Admin)
  const handleDeleteDocument = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiRequest(`/study-materials/${id}`, { method: 'DELETE' });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete study material');
    }
  };

  // Handle Direct Upload to Cloudflare R2
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a PDF file to upload.');
      return;
    }
    if (!uploadTitle.trim() || !uploadSubject.trim()) {
      setUploadError('Title and Subject are required.');
      return;
    }
    if (!uploadIsAllBatches && uploadSelectedBatchIds.length === 0) {
      setUploadError('Please select at least one batch or enable "All Batches".');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress(10);

    try {
      // 1. Get Pre-Signed Upload URL from backend
      const presignedRes = await apiRequest('/study-materials/presigned-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'application/pdf',
          category: uploadCategory,
        }),
      });

      setUploadProgress(35);

      // 2. Upload file directly to Cloudflare R2
      if (presignedRes.isMock) {
        console.log('[MOCK UPLOAD] Mocking file transfer');
      } else {
        const uploadXhr = await fetch(presignedRes.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type || 'application/pdf',
          },
          body: selectedFile,
        });

        if (!uploadXhr.ok) {
          throw new Error('Cloudflare R2 storage upload failed');
        }
      }

      setUploadProgress(75);

      // 3. Save metadata to MySQL
      await apiRequest('/study-materials', {
        method: 'POST',
        body: JSON.stringify({
          title: uploadTitle.trim(),
          subject: uploadSubject.trim(),
          chapter: uploadChapter.trim() || null,
          category: uploadCategory,
          description: uploadDescription.trim() || null,
          fileR2Key: presignedRes.fileKey,
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
          mimeType: selectedFile.type || 'application/pdf',
          isAllBatches: uploadIsAllBatches,
          batchIds: uploadSelectedBatchIds,
          isDownloadable: uploadIsDownloadable,
        }),
      });

      setUploadProgress(100);
      setShowUploadModal(false);
      resetUploadForm();
      fetchMaterials();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Upload failed. Please check storage credentials.');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadSubject('');
    setUploadChapter('');
    setUploadCategory('notes');
    setUploadDescription('');
    setUploadIsAllBatches(false);
    setUploadSelectedBatchIds([]);
    setUploadIsDownloadable(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError('');
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Active Secure PDF Viewer Modal */}
      {activeDocData && (
        <SecurePdfViewer
          docData={activeDocData}
          onClose={() => setActiveDocData(null)}
        />
      )}

      {/* Header & Action Row */}
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
            📚 E-Library & Study Materials
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Access curated lecture notes, formula sheets, assignments, and previous year papers.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-pill, 9999px)',
              padding: '10px 22px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px var(--primary-light)',
            }}
          >
            <span>➕</span> Upload Study Material
          </button>
        )}
      </div>

      {/* Filter Row: Batch Selector + Category Pills + Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          backgroundColor: 'var(--card-bg)',
          padding: '16px',
          borderRadius: 'var(--radius-md, 14px)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
        }}
      >
        {/* Batch Dropdown */}
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
              Batch: {b.name}
            </option>
          ))}
        </select>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          {[
            { id: '', label: 'All Categories' },
            { id: 'notes', label: '📖 Notes' },
            { id: 'formula_sheet', label: '⚡ Formulas' },
            { id: 'assignment', label: '📝 Assignments' },
            { id: 'pyq', label: '🎯 PYQs' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill, 9999px)',
                border: '1px solid',
                borderColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-color)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by title or chapter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm, 8px)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            minWidth: '220px',
            outline: 'none',
          }}
        />
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          Loading study materials...
        </div>
      ) : materials.length === 0 ? (
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
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📂</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>No Study Materials Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {searchQuery || selectedCategory || selectedBatchId
              ? 'Try changing your filters or search query.'
              : 'Your teachers have not uploaded any study material for this batch yet.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {materials.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--radius-md, 14px)',
                padding: '20px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)',
              }}
            >
              <div>
                {/* Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    {item.subject}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--card-hover-bg)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    {item.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Title & Chapter */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  {item.title}
                </h3>
                {item.chapter && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    📖 Chapter: <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{item.chapter}</span>
                  </div>
                )}

                {/* Batch & Meta Info */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <div>
                    👥 {item.is_all_batches ? 'All Batches' : item.assigned_batches || 'Assigned Batches'}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    📦 {formatFileSize(item.file_size_bytes)} • 📅 {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  onClick={() => handleOpenDocument(item.id)}
                  disabled={openingDocId === item.id}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm, 8px)',
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {openingDocId === item.id ? '⏳ Opening...' : '📖 Read Document'}
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteDocument(item.id, item.title)}
                    style={{
                      backgroundColor: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger-border)',
                      borderRadius: 'var(--radius-sm, 8px)',
                      padding: '8px 12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Delete Material"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Upload Modal */}
      {showUploadModal && (
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
              maxWidth: '560px',
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
                Upload Study Material (R2 Cloud)
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div
                style={{
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  border: '1px solid var(--danger-border)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kinematics Formula Cheat Sheet"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics"
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Chapter / Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Motion in 1D"
                    value={uploadChapter}
                    onChange={(e) => setUploadChapter(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  style={inputStyle}
                >
                  <option value="notes">Notes / Modules</option>
                  <option value="formula_sheet">Formula Cheat Sheet</option>
                  <option value="assignment">Assignment / Practice Problem Sheet</option>
                  <option value="pyq">Previous Year Questions (PYQ)</option>
                  <option value="other">Other Material</option>
                </select>
              </div>

              {/* Batch Assignment Selector */}
              <div
                style={{
                  backgroundColor: 'var(--bg-color)',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Assign to Batches
                  </span>
                  <label style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={uploadIsAllBatches}
                      onChange={(e) => setUploadIsAllBatches(e.target.checked)}
                    />
                    All Batches in Institute
                  </label>
                </div>

                {!uploadIsAllBatches && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {batches.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No batches found. Toggle "All Batches".</span>
                    ) : (
                      batches.map((b) => (
                        <label key={b.id} style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={uploadSelectedBatchIds.includes(b.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUploadSelectedBatchIds([...uploadSelectedBatchIds, b.id]);
                              } else {
                                setUploadSelectedBatchIds(uploadSelectedBatchIds.filter((id) => id !== b.id));
                              }
                            }}
                          />
                          {b.name}
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Downloadable Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={uploadIsDownloadable}
                  onChange={(e) => setUploadIsDownloadable(e.target.checked)}
                />
                Allow students to download original file (uncheck to force view-only with watermark)
              </label>

              {/* File Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Select Document (PDF) *</label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-sm, 8px)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Uploading directly to Cloudflare R2...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
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
                  disabled={uploading}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    border: 'none',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px var(--primary-light)',
                  }}
                >
                  {uploading ? 'Uploading...' : 'Publish to E-Library'}
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
