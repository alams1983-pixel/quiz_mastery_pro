import React, { useState, useEffect } from 'react';
import { normalizeImageUrl } from '../services/csvJsonParser.js';

export function ImagePickerWidget({ label = 'Image URL or Upload File', value = '', onFileSelect, onUrlChange, fieldKey = 'img' }) {
  const [currentUrl, setCurrentUrl] = useState(value || '');
  const [blobUrl, setBlobUrl] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (value && !value.startsWith('blob:')) {
      setCurrentUrl(normalizeImageUrl(value));
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      const newBlobUrl = URL.createObjectURL(file);
      setBlobUrl(newBlobUrl);
      setFileName(file.name);
      if (onFileSelect) onFileSelect(file, newBlobUrl);
    }
  };

  const handleUrlInputChange = (e) => {
    const val = e.target.value;
    setCurrentUrl(val);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }
    if (onUrlChange) onUrlChange(val);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }
    setCurrentUrl('');
    setFileName('');
    if (onFileSelect) onFileSelect(null, '');
    if (onUrlChange) onUrlChange('');
  };

  const activeDisplayUrl = blobUrl || currentUrl;

  return (
    <div style={{ marginTop: '6px' }}>
      {activeDisplayUrl ? (
        <div className="img-thumb-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
          <img 
            src={activeDisplayUrl} 
            alt="Preview" 
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)' }}>
              {blobUrl ? '📁 Local File (Pending Upload)' : '🌐 Image URL Attached'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {blobUrl ? fileName : activeDisplayUrl}
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleRemove}
            className="icon-action-btn btn-danger" 
            title="Remove Image" 
            aria-label="Remove Image"
            style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={currentUrl}
            onChange={handleUrlInputChange}
            placeholder={label}
            className="form-input"
            style={{ flex: 1, fontSize: '0.85rem', borderRadius: '8px' }}
          />
          <label 
            className="icon-action-btn" 
            title="Upload Local File" 
            style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}
          >
            <i className="ri-image-add-line" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}></i>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      )}
    </div>
  );
}
