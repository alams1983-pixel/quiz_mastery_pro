import React, { useState, useEffect, useRef } from 'react';

/**
 * Secure In-App PDF / Document Viewer
 * Includes dynamic anti-piracy canvas watermarking and print/save restriction shields
 */
export function SecurePdfViewer({ docData, onClose }) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const { viewUrl, title, isDownloadable, watermark } = docData;

  // Keyboard shortcut protection (Ctrl+P, Ctrl+S, Cmd+P, Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
        alert('Printing and saving protected course materials is disabled.');
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0f172a',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Top Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          color: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <span style={{ fontSize: '1.25rem' }}>📄</span>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '450px',
            }}
          >
            {title}
          </h2>
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: '#3b82f620',
              color: '#60a5fa',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #3b82f640',
            }}
          >
            Protected E-Library
          </span>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setZoom((prev) => Math.max(50, prev - 15))}
            style={buttonStyle}
            title="Zoom Out"
          >
            🔍 -
          </button>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', minWidth: '45px', textAlign: 'center' }}>
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((prev) => Math.min(200, prev + 15))}
            style={buttonStyle}
            title="Zoom In"
          >
            🔍 +
          </button>

          <button onClick={toggleFullscreen} style={buttonStyle} title="Toggle Fullscreen">
            {isFullscreen ? '⤢ Exit Fullscreen' : '⤢ Fullscreen'}
          </button>

          {isDownloadable && (
            <a
              href={viewUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...buttonStyle,
                backgroundColor: '#2563eb',
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ⬇ Download
            </a>
          )}

          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              backgroundColor: '#ef444420',
              color: '#f87171',
              borderColor: '#ef444440',
              fontWeight: 700,
              marginLeft: '12px',
            }}
            title="Close Viewer"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Main Document Frame with Dynamic Watermark Overlay */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#090d16',
        }}
      >
        {/* PDF Frame */}
        <iframe
          src={`${viewUrl}#toolbar=0&navpanes=0`}
          title={title}
          style={{
            width: `${zoom}%`,
            height: '100%',
            minHeight: '100%',
            border: 'none',
            backgroundColor: '#ffffff',
            transition: 'width 0.2s ease',
          }}
        />

        {/* Dynamic Canvas Watermark Protection Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            alignContent: 'space-around',
            overflow: 'hidden',
            opacity: 0.18,
            zIndex: 10,
          }}
        >
          {Array.from({ length: 16 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                transform: 'rotate(-30deg)',
                padding: '40px 60px',
                color: '#1e293b',
                fontFamily: 'monospace',
                fontSize: '15px',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              <div>{watermark?.text || 'STUDENT VERIFIED'}</div>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>{watermark?.subText}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  backgroundColor: '#334155',
  color: '#f1f5f9',
  border: '1px solid #475569',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
