import React, { useState } from 'react';
import ReactModal from './ReactModal.jsx';
import { parseCSVQuestions, parseJSONQuestions } from '../services/csvJsonParser.js';
import { apiRequest } from '../services/api.js';
import { copyAiPromptToClipboard } from '../services/aiPromptGenerator.js';

export function ReactBulkUploadModal({ isOpen, onClose, onComplete, targetId = null, targetType = 'exam_section' }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showAiInstructions, setShowAiInstructions] = useState(false);

  const sampleCSVTemplate = `category_name,tag_names,question_en,question_bn,optionA_en,optionB_en,optionC_en,optionD_en,optionA_bn,optionB_bn,optionC_bn,optionD_bn,answer,explanation_en,explanation_bn,difficulty
"General Science","Physics,SSC CGL","Identify the synonym of 'Abundant'.","'Abundant' শব্দের সমার্থক শব্দ কোনটি?","Scarce","Plentiful","Meager","Lacking","দুর্লভ","প্রচুর","অল্প","ঘাটতি",1,"Plentiful means existing in large quantities.","প্রচুর মানে বিপুল পরিমাণে বিদ্যমান।",medium
"Mathematics","Algebra","Solve $E = mc^2$ for $m$.","সমিবকরণ $E = mc^2$ এ $m$ এর মান নির্ণয় করো।","m = E/c^2","m = Ec^2","m = c^2/E","m = E - c^2","m = E/c^2","m = Ec^2","m = c^2/E","m = E - c^2",0,"Dividing both sides by c^2.","উভয় পক্ষকে c^2 দ্বারা ভাগ করে।",hard`;

  const sampleJSONTemplate = JSON.stringify([
    {
      "available_languages": ["en", "bn"],
      "primary_language": "en",
      "translations": {
        "en": {
          "question_text": "Consider the following statements regarding Question Hour:\n1. Question Hour is the first hour.\n2. Speaker can direct otherwise.",
          "options": ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
          "explanation": "Both statements are correct."
        },
        "bn": {
          "question_text": "প্রশ্নকাল সম্পর্কে নিচের তথ্যগুলি বিবেচনা করো:\n১. প্রশ্নকাল হলো প্রথম ঘন্টা।\n২. স্পিকার অন্য নির্দেশ দিতে পারেন।",
          "options": ["শুধুমাত্র ১", "শুধুমাত্র ২", "১ এবং ২ উভয়ই", "কোনোটিই নয়"],
          "explanation": "উভয় তথ্যই সঠিক।"
        }
      },
      "category_name": "General Science",
      "tag_names": ["Physics", "Polity"],
      "correct_option_index": 2,
      "difficulty": "medium"
    }
  ], null, 2);

  const handleDownloadSample = (type) => {
    const text = type === 'csv' ? sampleCSVTemplate : sampleJSONTemplate;
    const filename = `sample_multi_language_questions.${type}`;
    const blob = new Blob([text], { type: type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAiPrompt = async () => {
    await copyAiPromptToClipboard();
    setCopiedPrompt(true);
    setShowAiInstructions(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let questions = [];
        if (file.name.endsWith('.json')) {
          questions = parseJSONQuestions(content);
        } else if (file.name.endsWith('.csv')) {
          questions = parseCSVQuestions(content);
        } else {
          throw new Error('Unsupported file extension. Please select a .csv or .json file.');
        }

        if (!questions || questions.length === 0) {
          throw new Error('No valid questions found in the file.');
        }

        setParsedQuestions(questions);
        setCurrentStep(2);
      } catch (err) {
        setFileError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (parsedQuestions.length === 0) return;
    setIsUploading(true);
    try {
      const endpoint = targetId ? `/exams/sections/${targetId}/questions/bulk` : '/exams/questions/bulk';
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          questions: parsedQuestions,
          section_id: targetType === 'exam_section' ? targetId : null
        })
      });

      alert(`Successfully imported ${response.insertedCount || parsedQuestions.length} questions into Master Question Bank!`);
      if (onComplete) onComplete(response);
      onClose();
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ReactModal isOpen={isOpen} onClose={onClose} title="📥 Multi-Language Bulk Question Import Wizard">
      <div style={{ padding: '4px' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: currentStep >= 1 ? 'var(--primary)' : 'var(--border-color)' }}></div>
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: currentStep >= 2 ? 'var(--primary)' : 'var(--border-color)' }}></div>
        </div>

        {/* Step 1: File Select */}
        {currentStep === 1 && (
          <div>
            <div 
              style={{ 
                border: '2px dashed var(--primary)', 
                borderRadius: '14px', 
                padding: '32px 20px', 
                textAlign: 'center', 
                background: 'var(--primary-light)', 
                marginBottom: '20px',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('react-bulk-file-input').click()}
            >
              <i className="ri-cloud-upload-line" style={{ fontSize: '2.5rem', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}></i>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', margin: '0 0 4px 0' }}>Click or Drag CSV / JSON File</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Supports 1 to 4 dynamic languages per question</p>
              <input type="file" id="react-bulk-file-input" accept=".csv,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>

            {fileError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 700 }}>
                ⚠️ {fileError}
              </div>
            )}

            <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '8px' }}>📥 Download Templates & AI Question Creation:</strong>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <button type="button" onClick={() => handleDownloadSample('csv')} className="btn btn-outline btn-sm">
                  <i className="ri-file-excel-line"></i> Download CSV Template
                </button>
                <button type="button" onClick={() => handleDownloadSample('json')} className="btn btn-outline btn-sm">
                  <i className="ri-code-s-slash-line"></i> Download JSON Template
                </button>
                <button 
                  type="button" 
                  onClick={handleCopyAiPrompt} 
                  className={`btn btn-outline btn-ai-prompt btn-sm ${copiedPrompt ? 'btn-copied' : ''}`}
                  style={copiedPrompt ? {
                    color: 'var(--success, #16a34a)',
                    borderColor: 'var(--success, #16a34a)',
                    background: 'var(--success-light, #dcfce7)'
                  } : {}}
                >
                  <i className={copiedPrompt ? "ri-check-line" : "ri-sparkling-fill"}></i> {copiedPrompt ? 'Copied to Clipboard!' : '📋 Copy AI Prompt for Bulk Questions'}
                </button>
              </div>

              {showAiInstructions && (
                <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: '10px', padding: '14px', marginTop: '10px', fontSize: '0.83rem', color: 'var(--text-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <i className="ri-checkbox-circle-fill"></i> Prompt Copied to Clipboard! How to use with ChatGPT / Claude / Gemini / DeepSeek:
                  </div>
                  <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                    <li>Open your preferred AI tool (ChatGPT, Claude, Gemini, or DeepSeek).</li>
                    <li>Paste the copied prompt into the AI chat prompt box.</li>
                    <li>Fill in the <strong>[FILL-IN-THE-BLANK]</strong> parameters with your source notes, preferred languages (e.g. <code>English and Hindi</code> or <code>Bengali</code>), total question count, category & difficulty.</li>
                    <li>Copy the AI's JSON output response and save it on your computer as a <code>.json</code> file (e.g. <code>my_questions.json</code>).</li>
                    <li>Upload the saved <code>.json</code> file right here in Step 1!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Parsed Preview */}
        {currentStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.98rem', margin: 0 }}>
                Parsed Questions Preview ({parsedQuestions.length} Found)
              </h4>
              <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-xs btn-outline">
                ← Change File
              </button>
            </div>

            <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px', marginBottom: '20px' }}>
              <table className="custom-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Languages</th>
                    <th>Question Text (Primary)</th>
                    <th>Category</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedQuestions.map((q, idx) => {
                    const tj = q.translations_json || {};
                    const langs = q.available_languages || tj.available_languages || ['en'];
                    const prim = q.primary_language || tj.primary_language || langs[0];
                    const text = q.question_text || q.question_text_en || (tj.translations?.[prim]?.question_text) || 'Question Text';
                    const opts = q.options || q.options_en || (tj.translations?.[prim]?.options) || [];

                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {langs.map(l => (
                              <span key={l} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                                {l.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={text}>
                          {text}
                        </td>
                        <td>{q.category_name || 'General'}</td>
                        <td>{opts.length} Choices ({prim})</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
              <button 
                type="button" 
                onClick={handleImportSubmit} 
                disabled={isUploading} 
                className="btn btn-primary" 
                style={{ padding: '10px 24px', fontWeight: 800 }}
              >
                {isUploading ? 'Importing Questions...' : `Confirm & Import ${parsedQuestions.length} Questions →`}
              </button>
            </div>
          </div>
        )}

      </div>
    </ReactModal>
  );
}
