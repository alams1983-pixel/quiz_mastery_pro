import { createModal } from './Modal.js';
import { parseJSONQuestions, parseCSVQuestions } from '../services/csvJsonParser.js';
import { api } from '../services/api.js';
import { renderMath } from '../services/katexRenderer.js';

export function openBulkUploadModal(quizId, onSuccess) {
  const container = document.createElement('div');
  container.innerHTML = `
    <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">
      Upload a <strong>JSON</strong> file or a <strong>CSV</strong> file to bulk import questions into this quiz.
    </p>

    <!-- Template Downloads -->
    <div style="background:var(--primary-light); border:1px solid var(--primary-border); border-radius:var(--radius-md); padding:14px 18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <span style="font-weight:600; font-size:0.88rem; color:var(--primary);">Need a sample file format?</span>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-sm btn-secondary" id="downloadJsonTplBtn">📥 JSON Template</button>
        <button class="btn btn-sm btn-secondary" id="downloadCsvTplBtn">📥 CSV Template</button>
      </div>
    </div>

    <div class="form-group">
      <label>Select Question File (.json or .csv)</label>
      <input type="file" id="bulkFileInput" accept=".json,.csv" class="form-input" />
    </div>

    <div id="filePreviewArea" style="margin-top:16px; display:none;">
      <h4 style="font-weight:700; font-size:0.95rem; margin-bottom:8px;">Parsed Preview (<span id="previewCount">0</span> questions)</h4>
      <div style="max-height: 200px; overflow-y: auto; border:1px solid var(--border-color); border-radius: var(--radius-sm); padding:10px; background:var(--card-bg);">
        <table class="custom-table" style="font-size:0.82rem;">
          <thead>
            <tr><th>#</th><th>Question</th><th>Options</th><th>Correct Index</th></tr>
          </thead>
          <tbody id="previewTableBody"></tbody>
        </table>
      </div>
      <div style="margin-top: 16px; display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn" id="confirmUploadBtn">Upload Questions</button>
      </div>
    </div>
  `;

  let parsedQuestions = [];

  const modal = createModal({ title: 'Bulk Question Upload', content: container });

  const fileInput = container.querySelector('#bulkFileInput');
  const previewArea = container.querySelector('#filePreviewArea');
  const previewCount = container.querySelector('#previewCount');
  const previewBody = container.querySelector('#previewTableBody');
  const confirmBtn = container.querySelector('#confirmUploadBtn');

  // Template Download Handlers
  container.querySelector('#downloadJsonTplBtn').addEventListener('click', () => {
    const jsonSample = [
      {
        "question": "What is the SI unit of Force?",
        "options": ["Joule", "Newton", "Pascal", "Watt"],
        "answer": 1,
        "explanation": "Newton is the SI unit of force ($F = ma$).",
        "tags": ["Physics", "Units"]
      },
      {
        "question": "Which gas is absorbed by plants during photosynthesis?",
        "options": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        "answer": 2,
        "explanation": "Plants absorb $CO_2$ to generate glucose and oxygen.",
        "tags": ["Biology", "Botany"]
      }
    ];

    const blob = new Blob([JSON.stringify(jsonSample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_upload_template.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  container.querySelector('#downloadCsvTplBtn').addEventListener('click', () => {
    const csvSample = `Question,Option A,Option B,Option C,Option D,Correct Index,Explanation,Tags
"SI unit of Force is?","Joule","Newton","Pascal","Watt",1,"Newton is the SI unit of force.","Physics;Units"
"Which planet is known as Red Planet?","Venus","Mars","Jupiter","Saturn",1,"Mars appears reddish due to iron oxide.","Astronomy;Planets"`;

    const blob = new Blob([csvSample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        if (file.name.endsWith('.json')) {
          parsedQuestions = parseJSONQuestions(text);
        } else if (file.name.endsWith('.csv')) {
          parsedQuestions = parseCSVQuestions(text);
        } else {
          alert('Unsupported file type. Please upload a .json or .csv file.');
          return;
        }

        previewCount.textContent = parsedQuestions.length;
        previewBody.innerHTML = '';
        parsedQuestions.forEach((q, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${q.question_text}</td>
            <td>${q.options ? q.options.join(', ') : ''}</td>
            <td>${q.correct_answer_index}</td>
          `;
          previewBody.appendChild(tr);
        });
        renderMath(previewBody);
        previewArea.style.display = 'block';
      } catch (err) {
        alert(err.message);
        previewArea.style.display = 'none';
      }
    };
    reader.readAsText(file);
  });

  confirmBtn.addEventListener('click', async () => {
    if (parsedQuestions.length === 0) return;
    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Uploading...';
      const res = await api.bulkUploadQuestions(quizId, parsedQuestions);
      alert(res.message);
      modal.close();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Upload Questions';
    }
  });
}
