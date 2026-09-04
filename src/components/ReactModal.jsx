import React, { useEffect } from 'react';

export function ReactModal({ isOpen, title, children, onClose, maxWidth = '550px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ display: 'flex' }}
    >
      <div className="modal-card fade-in" style={{ maxWidth }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ marginTop: '16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default ReactModal;
