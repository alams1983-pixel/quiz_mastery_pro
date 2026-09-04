import React, { useState, useEffect } from 'react';
import ReactModal from '../ReactModal.jsx';
import RichText from '../RichText.jsx';
import { ImagePickerWidget } from '../ImagePickerWidget.jsx';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAME_MAP, autoTranslateQuestion, translateText } from '../../services/aiTranslationService.js';
import { apiRequest } from '../../services/api.js';

export function MultiLangQuestionForm({ initialQuestion = null, onSave, onCancel, categories = [], tags = [] }) {
  // Initial state extraction
  const [activeTab, setActiveTab] = useState('en');
  const [primaryLang, setPrimaryLang] = useState('en');
  const [activeLangs, setActiveLangs] = useState(['en']);
  
  // Translations state map: { en: { question_text: '', options: ['', '', '', ''], explanation: '' }, ... }
  const [translationsMap, setTranslationsMap] = useState({
    en: { question_text: '', options: ['', '', '', ''], explanation: '' }
  });

  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  
  // Image URL state variables
  const [imageUrl, setImageUrl] = useState('');
  const [explanationImageUrl, setExplanationImageUrl] = useState('');
  const [passageText, setPassageText] = useState('');
  const [passageImageUrl, setPassageImageUrl] = useState('');
  const [optionsImages, setOptionsImages] = useState(['', '', '', '']);

  // Pending file objects map for deferred upload
  const [pendingFiles, setPendingFiles] = useState({});

  const [isTranslating, setIsTranslating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Initialize from question prop if editing
  useEffect(() => {
    if (initialQuestion) {
      setCategoryId(initialQuestion.category_id || '');
      setDifficulty(initialQuestion.difficulty || 'medium');
      setCorrectOptionIndex(initialQuestion.correct_option_index || 0);
      setImageUrl(initialQuestion.image_url || '');
      setExplanationImageUrl(initialQuestion.explanation_image_url || '');
      setPassageText(initialQuestion.passage_text_en || initialQuestion.passage_text || '');
      setPassageImageUrl(initialQuestion.passage_image_url || '');

      const optImgs = Array.isArray(initialQuestion.options_images) ? initialQuestion.options_images : ['', '', '', ''];
      setOptionsImages(optImgs);

      if (initialQuestion.translations_json) {
        const tj = typeof initialQuestion.translations_json === 'string'
          ? JSON.parse(initialQuestion.translations_json)
          : initialQuestion.translations_json;

        if (tj && tj.translations) {
          setTranslationsMap(tj.translations);
          const langs = tj.available_languages || Object.keys(tj.translations);
          setActiveLangs(langs.length > 0 ? langs : ['en']);
          setPrimaryLang(tj.primary_language || langs[0] || 'en');
          setActiveTab(tj.primary_language || langs[0] || 'en');
          return;
        }
      }

      // Legacy fallback initialization
      const qEn = initialQuestion.question_text_en || initialQuestion.question_text || '';
      const qHi = initialQuestion.question_text_hi || '';
      const optsEn = initialQuestion.options_en || initialQuestion.options || ['', '', '', ''];
      const optsHi = initialQuestion.options_hi || [];

      const map = {
        en: {
          question_text: qEn,
          options: Array.isArray(optsEn) && optsEn.length > 0 ? optsEn : ['', '', '', ''],
          explanation: initialQuestion.explanation_en || initialQuestion.explanation || ''
        }
      };

      const langs = ['en'];
      if (qHi || (Array.isArray(optsHi) && optsHi.length > 0)) {
        langs.push('hi');
        map.hi = {
          question_text: qHi,
          options: Array.isArray(optsHi) && optsHi.length > 0 ? optsHi : ['', '', '', ''],
          explanation: initialQuestion.explanation_hi || ''
        };
      }

      setTranslationsMap(map);
      setActiveLangs(langs);
      setPrimaryLang('en');
      setActiveTab('en');
    }
  }, [initialQuestion]);

  // Current active translation object
  const currentContent = translationsMap[activeTab] || { question_text: '', options: ['', '', '', ''], explanation: '' };

  const handleTextChange = (field, val) => {
    setTranslationsMap(prev => ({
      ...prev,
      [activeTab]: {
        ...currentContent,
        [field]: val
      }
    }));
  };

  const handleOptionChange = (index, val) => {
    const newOpts = [...(currentContent.options || ['', '', '', ''])];
    newOpts[index] = val;
    setTranslationsMap(prev => ({
      ...prev,
      [activeTab]: {
        ...currentContent,
        options: newOpts
      }
    }));
  };

  const addOption = () => {
    if ((currentContent.options || []).length >= 6) return;
    setTranslationsMap(prev => ({
      ...prev,
      [activeTab]: {
        ...currentContent,
        options: [...(currentContent.options || []), '']
      }
    }));
    setOptionsImages(prev => [...prev, '']);
  };

  const removeOption = (index) => {
    if ((currentContent.options || []).length <= 2) return;
    const newOpts = (currentContent.options || []).filter((_, i) => i !== index);
    setTranslationsMap(prev => ({
      ...prev,
      [activeTab]: {
        ...currentContent,
        options: newOpts
      }
    }));
    setOptionsImages(prev => prev.filter((_, i) => i !== index));

    if (correctOptionIndex >= newOpts.length) {
      setCorrectOptionIndex(0);
    }
  };

  const addLanguageTab = (langCode) => {
    if (activeLangs.includes(langCode) || activeLangs.length >= 4) return;
    setActiveLangs(prev => [...prev, langCode]);
    setTranslationsMap(prev => ({
      ...prev,
      [langCode]: prev[langCode] || { question_text: '', options: ['', '', '', ''], explanation: '' }
    }));
    setActiveTab(langCode);
  };

  const removeLanguageTab = (langCode, e) => {
    e.stopPropagation();
    if (activeLangs.length <= 1) return;
    const filtered = activeLangs.filter(l => l !== langCode);
    setActiveLangs(filtered);
    
    const newMap = { ...translationsMap };
    delete newMap[langCode];
    setTranslationsMap(newMap);

    if (primaryLang === langCode) {
      setPrimaryLang(filtered[0]);
    }
    if (activeTab === langCode) {
      setActiveTab(filtered[0]);
    }
  };

  const handleAutoTranslateCurrentTab = async () => {
    if (activeTab === primaryLang) {
      alert('Current tab is already the Primary Language source. Select a target language tab to auto-translate.');
      return;
    }
    const sourceObj = translationsMap[primaryLang];
    if (!sourceObj || (!sourceObj.question_text && sourceObj.options.every(o => !o))) {
      alert(`Primary language (${LANGUAGE_NAME_MAP[primaryLang] || primaryLang}) is empty. Please author primary content first.`);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await autoTranslateQuestion(sourceObj, activeTab);
      if (translated) {
        setTranslationsMap(prev => ({
          ...prev,
          [activeTab]: translated
        }));
      }
    } catch (err) {
      alert('AI Translation failed: ' + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFieldAiTranslate = async (field, index = null) => {
    let sourceText = '';
    const sourceObj = translationsMap[primaryLang];
    if (field === 'question_text') sourceText = sourceObj?.question_text || '';
    else if (field === 'explanation') sourceText = sourceObj?.explanation || '';
    else if (field === 'option' && index !== null) sourceText = sourceObj?.options?.[index] || '';

    if (!sourceText) {
      alert(`Source text in ${LANGUAGE_NAME_MAP[primaryLang]} is empty.`);
      return;
    }

    setIsTranslating(true);
    try {
      const translatedStr = await translateText(sourceText, activeTab);
      if (field === 'option' && index !== null) {
        handleOptionChange(index, translatedStr);
      } else {
        handleTextChange(field, translatedStr);
      }
    } catch (e) {
      alert('Field translation error: ' + e.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const setPendingFile = (key, file, previewUrl) => {
    setPendingFiles(prev => {
      const updated = { ...prev };
      if (file) {
        updated[key] = file;
      } else {
        delete updated[key];
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const primaryObj = translationsMap[primaryLang] || translationsMap[activeLangs[0]] || {};
    
    if (!primaryObj.question_text || !primaryObj.question_text.trim()) {
      alert('Question text is required in primary language.');
      return;
    }

    let finalPassageImg = passageImageUrl;
    let finalQuestionImg = imageUrl;
    let finalExplanationImg = explanationImageUrl;
    let finalOptionsImgs = [...optionsImages];

    // Upload pending local files if present
    const pendingKeys = Object.keys(pendingFiles);
    if (pendingKeys.length > 0) {
      try {
        for (const key of pendingKeys) {
          const file = pendingFiles[key];
          const formData = new FormData();
          formData.append('image', file);
          const uploadRes = await apiRequest('/images/upload', { method: 'POST', body: formData });
          const uploadedUrl = uploadRes.imageUrl || uploadRes.fullUrl;

          if (key === 'passage') finalPassageImg = uploadedUrl;
          else if (key === 'question') finalQuestionImg = uploadedUrl;
          else if (key === 'explanation') finalExplanationImg = uploadedUrl;
          else if (key.startsWith('option_')) {
            const optIdx = parseInt(key.replace('option_', ''), 10);
            if (!isNaN(optIdx) && optIdx < finalOptionsImgs.length) {
              finalOptionsImgs[optIdx] = uploadedUrl;
            }
          }
        }
      } catch (err) {
        alert('Image upload failed: ' + err.message);
        return;
      }
    }

    const payload = {
      category_id: categoryId ? parseInt(categoryId, 10) : null,
      correct_option_index: correctOptionIndex,
      difficulty,
      image_url: finalQuestionImg,
      explanation_image_url: finalExplanationImg,
      passage_text_en: passageText,
      passage_image_url: finalPassageImg,
      options_images: finalOptionsImgs,
      primary_language: primaryLang,
      available_languages: activeLangs,
      translations_json: {
        available_languages: activeLangs,
        primary_language: primaryLang,
        translations: translationsMap
      }
    };

    onSave(payload);
  };

  return (
    <div className="card fade-in" style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '16px' }}>
      
      {/* 1. Multi-Language Authoring Instruction Banner */}
      <div style={{ background: 'var(--primary-light)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ri-global-line" style={{ fontSize: '1.2rem' }}></i> Multi-Language & AI Authoring Guide
          </h4>
          <button 
            type="button" 
            onClick={() => setShowInstructions(!showInstructions)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
          >
            {showInstructions ? 'Hide Guide ▲' : 'Show Guide ▼'}
          </button>
        </div>

        {showInstructions && (
          <ul style={{ fontSize: '0.83rem', color: 'var(--text-main)', marginTop: '10px', paddingLeft: '20px', lineHeight: 1.5, margin: '10px 0 0 0' }}>
            <li>Author questions in <strong>1 single language</strong> or up to <strong>4 dynamic languages</strong> (e.g. English, Hindi, Bengali, Gujarati, Marathi, Tamil, etc.).</li>
            <li>Attach images to <strong>Passage</strong>, <strong>Question Text</strong>, <strong>Option Choices</strong>, and <strong>Explanation</strong> with instant offline previews.</li>
            <li>Star ⭐ a tab to set it as the <strong>Primary Language</strong> (fallback for candidates if a translation isn't available).</li>
            <li>Click <strong>"✨ Auto-Translate with AI"</strong> to automatically draft missing translations for the active tab.</li>
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* 2. Dynamic Language Tabs Header & Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Active Language Tabs */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {activeLangs.map(code => {
              const isPrimary = code === primaryLang;
              const isActive = code === activeTab;
              return (
                <div
                  key={code}
                  onClick={() => setActiveTab(code)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1.5px solid',
                    borderColor: isActive ? 'var(--primary)' : 'var(--border-color)',
                    background: isActive ? 'var(--primary)' : 'var(--card-bg)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span 
                    onClick={(e) => { e.stopPropagation(); setPrimaryLang(code); }} 
                    title="Set as Primary Language" 
                    style={{ cursor: 'pointer', fontSize: '0.95rem' }}
                  >
                    {isPrimary ? '⭐' : '☆'}
                  </span>
                  <span>{LANGUAGE_NAME_MAP[code] || code.toUpperCase()}</span>
                  {activeLangs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => removeLanguageTab(code, e)} 
                      title="Remove Language Tab"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: isActive ? 'rgba(255,255,255,0.85)' : '#ef4444', 
                        cursor: 'pointer', 
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '0.9rem'
                      }}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Language Selector Dropdown */}
            {activeLangs.length < 4 && (
              <select
                onChange={(e) => { if (e.target.value) { addLanguageTab(e.target.value); e.target.value = ''; } }}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  border: '1.5px dashed var(--primary)', 
                  background: 'var(--primary-light)', 
                  color: 'var(--primary)', 
                  fontWeight: 800, 
                  fontSize: '0.82rem', 
                  cursor: 'pointer' 
                }}
                defaultValue=""
              >
                <option value="" disabled>+ Add Language ▾</option>
                {SUPPORTED_LANGUAGES.filter(l => !activeLangs.includes(l.code)).map(l => (
                  <option key={l.code} value={l.code}>
                    + {l.name} ({l.native})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Header: Live Preview & AI Auto-Translate Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            
            {/* Live Question Preview Button */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
              title="Preview Question in active language"
            >
              <i className="ri-eye-line" style={{ color: 'var(--primary)' }}></i>
              <span>Preview Question ({LANGUAGE_NAME_MAP[activeTab] || activeTab.toUpperCase()})</span>
            </button>

            {/* AI Auto-Translate Action Button */}
            <button
              type="button"
              onClick={handleAutoTranslateCurrentTab}
              disabled={isTranslating || activeTab === primaryLang}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
            >
              <i className="ri-sparkling-fill"></i>
              <span>{isTranslating ? 'AI Translating...' : `✨ Auto-Translate to ${LANGUAGE_NAME_MAP[activeTab] || activeTab}`}</span>
            </button>

          </div>
        </div>

        {/* 3. Passage Section */}
        <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <label className="form-label" style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '6px', display: 'block' }}>
            📖 Comprehension Passage / Statement (Optional):
          </label>
          <textarea
            rows="2"
            value={passageText}
            onChange={(e) => setPassageText(e.target.value)}
            placeholder="Passage text statement (supports newlines)..."
            className="form-input"
            style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }}
          ></textarea>
          
          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
            Passage Diagram / Image:
          </label>
          <ImagePickerWidget
            label="Passage Diagram Image URL or Upload File"
            value={passageImageUrl}
            fieldKey="passage"
            onUrlChange={(url) => setPassageImageUrl(url)}
            onFileSelect={(file, previewUrl) => {
              setPassageImageUrl(previewUrl);
              setPendingFile('passage', file, previewUrl);
            }}
          />
        </div>

        {/* 4. Question Text Controls */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
              Question Text ({LANGUAGE_NAME_MAP[activeTab] || activeTab}):
            </label>
            {activeTab !== primaryLang && (
              <button 
                type="button" 
                onClick={() => handleFieldAiTranslate('question_text')}
                className="btn btn-xs btn-outline"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <i className="ri-sparkling-line"></i> AI Fill Field
              </button>
            )}
          </div>
          <textarea
            rows="4"
            value={currentContent.question_text || ''}
            onChange={(e) => handleTextChange('question_text', e.target.value)}
            placeholder={`Enter question text in ${LANGUAGE_NAME_MAP[activeTab] || activeTab}... (Supports KaTeX math $E=mc^2$)`}
            className="form-input"
            style={{ width: '100%', borderRadius: '10px', marginBottom: '10px' }}
          ></textarea>

          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
            Question Main Diagram / Image:
          </label>
          <ImagePickerWidget
            label="Question Main Image URL or Upload File"
            value={imageUrl}
            fieldKey="question"
            onUrlChange={(url) => setImageUrl(url)}
            onFileSelect={(file, previewUrl) => {
              setImageUrl(previewUrl);
              setPendingFile('question', file, previewUrl);
            }}
          />
        </div>

        {/* 5. Options Editor with Per-Option Image Uploaders */}
        <div style={{ marginBottom: '24px', background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label className="form-label" style={{ fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
              Options & Choice Selection ({LANGUAGE_NAME_MAP[activeTab] || activeTab}):
            </label>
            {(currentContent.options || []).length < 6 && (
              <button type="button" onClick={addOption} className="btn btn-sm btn-outline">
                <i className="ri-add-line"></i> Add Option
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(currentContent.options || ['', '', '', '']).map((opt, idx) => (
              <div key={idx} style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <input
                    type="radio"
                    name="correct_option"
                    checked={correctOptionIndex === idx}
                    onChange={() => setCorrectOptionIndex(idx)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    title="Mark as correct answer"
                  />
                  <span style={{ fontWeight: 800, width: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    ({String.fromCharCode(65 + idx)})
                  </span>
                  <input
                    type="text"
                    value={opt || ''}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} text in ${LANGUAGE_NAME_MAP[activeTab] || activeTab}`}
                    className="form-input"
                    style={{ flex: 1, borderRadius: '8px' }}
                  />
                  {activeTab !== primaryLang && (
                    <button 
                      type="button" 
                      onClick={() => handleFieldAiTranslate('option', idx)}
                      className="btn btn-xs btn-outline"
                      title="AI Translate this option"
                    >
                      <i className="ri-sparkling-line"></i>
                    </button>
                  )}
                  {(currentContent.options || []).length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="icon-action-btn btn-danger"
                      title="Remove option"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>

                {/* Option Image Attachment Widget */}
                <div style={{ paddingLeft: '34px' }}>
                  <ImagePickerWidget
                    label={`Option (${String.fromCharCode(65 + idx)}) Image URL or Upload File`}
                    value={optionsImages[idx] || ''}
                    fieldKey={`option_${idx}`}
                    onUrlChange={(url) => {
                      setOptionsImages(prev => {
                        const copy = [...prev];
                        copy[idx] = url;
                        return copy;
                      });
                    }}
                    onFileSelect={(file, previewUrl) => {
                      setOptionsImages(prev => {
                        const copy = [...prev];
                        copy[idx] = previewUrl;
                        return copy;
                      });
                      setPendingFile(`option_${idx}`, file, previewUrl);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Solution Explanation Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
              Explanation ({LANGUAGE_NAME_MAP[activeTab] || activeTab}):
            </label>
            {activeTab !== primaryLang && (
              <button 
                type="button" 
                onClick={() => handleFieldAiTranslate('explanation')}
                className="btn btn-xs btn-outline"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <i className="ri-sparkling-line"></i> AI Fill Field
              </button>
            )}
          </div>
          <textarea
            rows="3"
            value={currentContent.explanation || ''}
            onChange={(e) => handleTextChange('explanation', e.target.value)}
            placeholder={`Enter solution explanation in ${LANGUAGE_NAME_MAP[activeTab] || activeTab}...`}
            className="form-input"
            style={{ width: '100%', borderRadius: '10px', marginBottom: '8px' }}
          ></textarea>

          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
            Explanation Diagram / Image:
          </label>
          <ImagePickerWidget
            label="Explanation Diagram Image URL or Upload File"
            value={explanationImageUrl}
            fieldKey="explanation"
            onUrlChange={(url) => setExplanationImageUrl(url)}
            onFileSelect={(file, previewUrl) => {
              setExplanationImageUrl(previewUrl);
              setPendingFile('explanation', file, previewUrl);
            }}
          />
        </div>

        {/* 7. Metadata Settings (Category & Difficulty) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block' }}>Category:</label>
            <select 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)} 
              className="form-input" 
              style={{ width: '100%', borderRadius: '8px' }}
            >
              <option value="">-- Select Category --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block' }}>Difficulty:</label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)} 
              className="form-input" 
              style={{ width: '100%', borderRadius: '8px' }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* 8. Action Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" onClick={onCancel} className="btn btn-outline" style={{ borderRadius: '8px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 800 }}>
            Save Question
          </button>
        </div>

      </form>

      {/* 9. Live Question Preview Modal */}
      <ReactModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`👁️ Question Live Preview — ${LANGUAGE_NAME_MAP[activeTab] || activeTab.toUpperCase()}`}
      >
        <div style={{ padding: '4px' }}>
          
          {/* Difficulty & Language Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px' }}>
              Language: {LANGUAGE_NAME_MAP[activeTab] || activeTab.toUpperCase()} {activeTab === primaryLang ? '⭐ (Primary)' : ''}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              Difficulty: {difficulty}
            </span>
          </div>

          {/* Passage Preview if present */}
          {passageText && (
            <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
              <strong style={{ color: 'var(--primary)', fontSize: '0.82rem', display: 'block', marginBottom: '4px' }}>📖 Comprehension Passage:</strong>
              <RichText content={passageText} />
              {passageImageUrl && <img src={passageImageUrl} alt="Passage diagram" style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '8px' }} />}
            </div>
          )}

          {/* Question Text */}
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              <RichText content={currentContent.question_text || '*(Question text empty)*'} />
            </div>
            {imageUrl && <img src={imageUrl} alt="Question diagram" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }} />}
          </div>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {(currentContent.options || []).map((opt, idx) => {
              const isCorrect = correctOptionIndex === idx;
              const optImg = optionsImages[idx];
              return (
                <div 
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isCorrect ? 'var(--success, #27ae60)' : 'var(--border-color)',
                    background: isCorrect ? 'rgba(39, 174, 96, 0.1)' : 'var(--bg-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontWeight: isCorrect ? 700 : 500
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, color: isCorrect ? 'var(--success, #27ae60)' : 'var(--text-muted)' }}>
                      ({String.fromCharCode(65 + idx)})
                    </span>
                    <div style={{ flex: 1 }}>
                      <RichText content={opt || '*(Empty option)*'} />
                    </div>
                    {isCorrect && (
                      <span style={{ fontSize: '0.78rem', background: '#27ae60', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                        ✓ Correct Answer
                      </span>
                    )}
                  </div>
                  {optImg && <img src={optImg} alt={`Option ${String.fromCharCode(65 + idx)} diagram`} style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '6px', marginTop: '4px' }} />}
                </div>
              );
            })}
          </div>

          {/* Solution Explanation */}
          {currentContent.explanation && (
            <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: '10px', padding: '12px', fontSize: '0.88rem' }}>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>💡 Solution Explanation:</strong>
              <RichText content={currentContent.explanation} />
              {explanationImageUrl && <img src={explanationImageUrl} alt="Explanation chart" style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '8px' }} />}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" onClick={() => setShowPreviewModal(false)} className="btn btn-primary btn-sm">
              Close Preview
            </button>
          </div>

        </div>
      </ReactModal>

    </div>
  );
}
