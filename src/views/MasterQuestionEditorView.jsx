import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api.js';
import { MultiLangQuestionForm } from '../components/questions/MultiLangQuestionForm.jsx';
import { showLoadingOverlay, hideLoadingOverlay } from '../components/LoadingOverlayModal.js';

export function MasterQuestionEditorView({ navigate, params = {} }) {
  const questionId = params.questionId || null;
  const returnView = params.returnView || 'exam-questions';

  const [categories, setCategories] = useState([]);
  const [initialQuestion, setInitialQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await apiRequest('/categories').catch(() => ({ flatCategories: [] }));
        setCategories(catRes.flatCategories || []);

        if (questionId) {
          const res = await apiRequest('/exams/questions/all');
          const allQ = res.questions || [];
          const target = allQ.find(q => q.id == questionId);
          if (target) {
            setInitialQuestion(target);
          }
        }
      } catch (err) {
        console.error('Failed initializing Question Editor:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [questionId]);

  const handleSave = async (payload) => {
    showLoadingOverlay('Saving Master Question...', 'Updating Question Bank repository...');
    try {
      if (questionId) {
        await apiRequest(`/exams/questions/${questionId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        alert('Question updated successfully!');
      } else {
        await apiRequest('/exams/questions', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        alert('Question created in Master Question Bank successfully!');
      }
      navigate(returnView);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      hideLoadingOverlay();
    }
  };

  if (loading) {
    return (
      <div className="view-container fade-in" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Loading Question Editor Workspace...
      </div>
    );
  }

  return (
    <div className="view-container fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px', background: 'var(--card-bg)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button" 
            onClick={() => navigate(returnView)} 
            className="btn btn-outline"
            style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="ri-arrow-left-line"></i> Back
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0' }}>
              {questionId ? '✏️ Edit Master Question' : '➕ Create New Master Question'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Master Question Bank Repository • Dynamic 1 to 4 Languages • AI Auto-Translation Ready
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Language React Form */}
      <MultiLangQuestionForm
        initialQuestion={initialQuestion}
        categories={categories}
        onSave={handleSave}
        onCancel={() => navigate(returnView)}
      />
    </div>
  );
}

export default MasterQuestionEditorView;
