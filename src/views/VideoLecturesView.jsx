import React, { useState, useEffect, useCallback } from 'react';
import * as tus from 'tus-js-client';
import { apiRequest, getUser } from '../services/api.js';
import { SecureVideoPlayer } from '../components/SecureVideoPlayer.jsx';

export function VideoLecturesView({ navigate }) {
  const user = getUser();
  const isAdmin = user && ['institute_admin', 'super_admin', 'admin'].includes(user.role);

  const [videos, setVideos] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Video Player state
  const [activeVideoData, setActiveVideoData] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [loadingVideoId, setLoadingVideoId] = useState(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadChapter, setUploadChapter] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadIsAllBatches, setUploadIsAllBatches] = useState(false);
  const [uploadSelectedBatchIds, setUploadSelectedBatchIds] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Tus Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadError, setUploadError] = useState('');

  const fetchBatches = useCallback(async () => {
    try {
      const res = await apiRequest('/exams/batches/all');
      setBatches(res.batches || []);
    } catch (err) {
      console.warn('Could not load batches:', err);
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatchId) params.append('batchId', selectedBatchId);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (searchQuery) params.append('search', searchQuery);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest(`/videos${qs}`);
      setVideos(res.videos || []);
    } catch (err) {
      console.error('Error loading video lectures:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBatchId, selectedSubject, searchQuery]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Open Video in Player
  const handleWatchLecture = async (id) => {
    setLoadingVideoId(id);
    try {
      const res = await apiRequest(`/videos/${id}/playback`);
      setActiveVideoData(res);
      setActiveVideoId(id);
    } catch (err) {
      alert(err.message || 'Failed to open video lecture. Please verify batch enrollment.');
    } finally {
      setLoadingVideoId(null);
    }
  };

  // Delete Video (Admin)
  const handleDeleteVideo = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete lecture "${title}"?`)) return;
    try {
      await apiRequest(`/videos/${id}`, { method: 'DELETE' });
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete video lecture');
    }
  };

  // Direct Resumable Upload to Bunny.net Stream via Tus
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a video file (MP4/WebM).');
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
    setUploadProgress(5);
    setUploadStatusText('Creating video asset on Bunny.net Stream...');

    try {
      // 1. Create Video Record & Get Tus Signature from Backend
      const initRes = await apiRequest('/videos/create-upload', {
        method: 'POST',
        body: JSON.stringify({
          title: uploadTitle.trim(),
          subject: uploadSubject.trim(),
          chapter: uploadChapter.trim() || null,
          description: uploadDescription.trim() || null,
          isAllBatches: uploadIsAllBatches,
          batchIds: uploadSelectedBatchIds,
        }),
      });

      const { lectureId, tusAuth } = initRes;

      if (initRes.isMock) {
        setUploadProgress(100);
        setUploadStatusText('Mock upload complete!');
        setTimeout(() => {
          setShowUploadModal(false);
          resetUploadForm();
          fetchVideos();
        }, 1000);
        return;
      }

      // 2. Direct Browser-to-Bunny Tus Resumable Upload
      setUploadStatusText('Uploading video directly to Bunny.net...');

      const upload = new tus.Upload(selectedFile, {
        endpoint: tusAuth.endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: tusAuth.signature,
          AuthorizationExpire: tusAuth.expirationTime,
          VideoId: tusAuth.videoId,
          LibraryId: tusAuth.libraryId,
        },
        metadata: {
          filetype: selectedFile.type,
          title: uploadTitle.trim(),
        },
        onError: (error) => {
          console.error('[TUS ERROR]', error);
          setUploadError('Direct upload failed: ' + error.message);
          setUploading(false);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 90) + 5;
          setUploadProgress(percentage);
          const mbUploaded = (bytesUploaded / (1024 * 1024)).toFixed(1);
          const mbTotal = (bytesTotal / (1024 * 1024)).toFixed(1);
          setUploadStatusText(`Uploading: ${mbUploaded} MB / ${mbTotal} MB (${percentage}%)`);
        },
        onSuccess: async () => {
          setUploadProgress(98);
          setUploadStatusText('Upload complete! Confirming video processing...');
          try {
            await apiRequest(`/videos/${lectureId}/confirm-upload`, { method: 'POST' });
          } catch (cErr) {
            console.warn('Confirm upload check:', cErr);
          }
          setUploadProgress(100);
          setUploadStatusText('Video queued for HLS multi-bitrate encoding!');
          setTimeout(() => {
            setShowUploadModal(false);
            resetUploadForm();
            fetchVideos();
          }, 1200);
        },
      });

      upload.start();
    } catch (err) {
      console.error('Video upload failed:', err);
      setUploadError(err.message || 'Failed to initiate video upload');
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadSubject('');
    setUploadChapter('');
    setUploadDescription('');
    setUploadIsAllBatches(false);
    setUploadSelectedBatchIds([]);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatusText('');
    setUploadError('');
    setUploading(false);
  };

  const formatDuration = (seconds, status) => {
    if (status === 'no_broadcast') return 'No stream';
    if (status === 'processing' || !seconds || seconds === 0) return 'Processing';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs} mins`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Active Video Player Modal */}
      {activeVideoData && (
        <SecureVideoPlayer
          videoData={activeVideoData}
          videoId={activeVideoId}
          onClose={() => {
            setActiveVideoData(null);
            setActiveVideoId(null);
            fetchVideos(); // Refresh watch progress badges
          }}
        />
      )}

      {/* Header & Upload Action */}
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
            🎬 Recorded Video Lectures
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Chapter-wise on-demand video lessons with adaptive HLS streaming and progress tracking.
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
            <span>➕</span> Upload New Lecture
          </button>
        )}
      </div>

      {/* Filter Row */}
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
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          style={selectStyle}
        >
          <option value="">🎯 All Accessible Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              Batch: {b.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filter by subject (e.g. Physics)"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{ ...selectStyle, minWidth: '180px' }}
        />

        <input
          type="text"
          placeholder="Search by title or chapter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...selectStyle, flex: 1, minWidth: '220px' }}
        />
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          Loading video lectures...
        </div>
      ) : videos.length === 0 ? (
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
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📽️</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>No Video Lectures Available</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {searchQuery || selectedSubject || selectedBatchId
              ? 'No lectures match your current filters.'
              : 'Your teachers have not uploaded any video lectures for this batch yet.'}
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
          {videos.map((vid) => {
            const hasProgress = vid.last_position_seconds > 0;
            const isFinished = Boolean(vid.is_completed);

            return (
              <div
                key={vid.id}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: 'var(--radius-md, 14px)',
                  padding: '18px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div>
                  {/* Top Tags */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                        {vid.subject}
                      </span>
                      {(vid.live_class_origin_id || vid.chapter === 'Live Class Recordings' || vid.title?.includes('(Live Class Replay)')) && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            backgroundColor: '#ef444420',
                            color: '#ef4444',
                            border: '1px solid #ef444440',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>🔴</span> LIVE REPLAY
                        </span>
                      )}
                      {vid.status === 'no_broadcast' && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: '#eab30820',
                            color: '#eab308',
                            border: '1px solid #eab30840',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>⚠️</span> NO STREAM
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ⏱️ {formatDuration(vid.duration_seconds, vid.status)}
                    </span>
                  </div>

                  {/* Title & Chapter */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                    {vid.title}
                  </h3>
                  {vid.chapter && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      📖 Chapter: <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{vid.chapter}</span>
                    </div>
                  )}

                  {/* Batch Info */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    👥 {vid.is_all_batches ? 'All Batches' : vid.assigned_batches || 'Assigned Batches'}
                  </div>

                  {/* Progress Indicator */}
                  {isFinished ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, marginBottom: '12px' }}>
                      ✅ Completed
                    </div>
                  ) : hasProgress ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '12px' }}>
                      ▶ Resumes at {Math.floor(vid.last_position_seconds / 60)}:
                      {(vid.last_position_seconds % 60).toString().padStart(2, '0')}
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <button
                    onClick={() => handleWatchLecture(vid.id)}
                    disabled={loadingVideoId === vid.id || vid.status === 'processing' || vid.status === 'no_broadcast'}
                    style={{
                      flex: 1,
                      backgroundColor:
                        vid.status === 'no_broadcast'
                          ? 'var(--surface-color, #374151)'
                          : vid.status === 'processing'
                          ? 'var(--border-color)'
                          : 'var(--primary)',
                      color: vid.status === 'no_broadcast' ? 'var(--text-muted, #9ca3af)' : '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm, 8px)',
                      padding: '8px 16px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: vid.status === 'processing' || vid.status === 'no_broadcast' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                    title={
                      vid.status === 'no_broadcast'
                        ? 'No video was streamed to Bunny during this live class.'
                        : vid.status === 'processing'
                        ? 'Bunny is currently encoding this replay.'
                        : 'Watch lecture replay'
                    }
                  >
                    {loadingVideoId === vid.id
                      ? '⏳ Loading...'
                      : vid.status === 'processing'
                      ? '⚙️ Encoding...'
                      : vid.status === 'no_broadcast'
                      ? '⚠️ No Video Streamed'
                      : '▶ Watch Lecture'}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteVideo(vid.id, vid.title)}
                      style={{
                        backgroundColor: 'var(--danger-bg)',
                        color: 'var(--danger)',
                        border: '1px solid var(--danger-border)',
                        borderRadius: 'var(--radius-sm, 8px)',
                        padding: '8px 12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Delete Lecture"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Direct Tus Video Upload Modal */}
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
                Upload Video Lecture (Bunny.net Stream)
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
                <label style={labelStyle}>Lecture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laws of Motion - Lecture 01"
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
                  <label style={labelStyle}>Chapter / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Mechanics"
                    value={uploadChapter}
                    onChange={(e) => setUploadChapter(e.target.value)}
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

              {/* File Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Select Video File (MP4, MKV, WebM) *</label>
                <input
                  type="file"
                  accept="video/mp4,video/mkv,video/webm"
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

              {/* Tus Progress Bar */}
              {uploading && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>{uploadStatusText}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.2s ease' }} />
                  </div>
                </div>
              )}

              {/* Buttons */}
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
                  {uploading ? 'Uploading to Bunny...' : 'Start Resumable Upload'}
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

const selectStyle = {
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm, 8px)',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-main)',
  fontWeight: 600,
  fontSize: '0.9rem',
  outline: 'none',
};
