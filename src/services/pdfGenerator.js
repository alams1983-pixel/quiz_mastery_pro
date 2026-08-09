import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateQuizPDFReport({ user, quiz, attempt, questions }) {
  // Create off-screen template
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.background = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Outfit', sans-serif, Arial";
  container.style.padding = '40px';
  container.style.boxSizing = 'border-box';

  const dateStr = new Date(attempt.created_at || Date.now()).toLocaleString();
  const reportId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;

  let tableRows = '';
  if (Array.isArray(questions)) {
    questions.forEach((q, idx) => {
      const qStats = (attempt.details_json && attempt.details_json[q.id]) || {};
      const correctChoice = q.options ? q.options[q.correct_answer_index] : '';
      const userChoice = qStats.selected_option !== undefined && q.options ? q.options[q.selected_option] : 'N/A';
      const timeSpent = qStats.time_spent || 0;
      const attemptsCount = (qStats.correct || 0) + (qStats.wrong || 0);

      tableRows += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold;">Q${idx + 1}</td>
          <td style="padding: 10px;">${q.question_text || ''}</td>
          <td style="padding: 10px; color: ${qStats.is_correct ? '#059669' : '#dc2626'};">${userChoice}</td>
          <td style="padding: 10px; font-weight: 600;">${correctChoice}</td>
          <td style="padding: 10px;">${attemptsCount > 0 ? attemptsCount : 1}</td>
          <td style="padding: 10px;">${timeSpent}s</td>
        </tr>
      `;
    });
  }

  container.innerHTML = `
    <div style="border-bottom: 3px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin: 0; color: #4f46e5; font-size: 24px;">📘 EdutorAI Quiz Portal</h1>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Official Quiz Performance & Practice Activity Report</p>
      </div>
      <div style="text-align: right;">
        <span style="background: #eef2ff; color: #4f46e5; font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${reportId}</span>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Generated: ${dateStr}</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #64748b;">👤 Student Profile</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Full Name:</strong> ${user.full_name || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${user.email || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>User Role:</strong> ${user.role || 'user'}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #64748b;">🎯 Quiz Session Info</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Quiz Title:</strong> ${quiz.title || 'Mastery Practice'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${quiz.category_name || 'General'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Selected Mode:</strong> Mastery Level ${attempt.mastery_level || 1}</p>
      </div>
    </div>

    <div style="background: #eef2ff; border-radius: 16px; padding: 20px; margin-bottom: 28px; display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 12px;">
      <div>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Accuracy</span>
        <div style="font-size: 24px; font-weight: bold; color: #047857;">${attempt.accuracy_pct}%</div>
      </div>
      <div>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Score</span>
        <div style="font-size: 24px; font-weight: bold; color: #4f46e5;">${attempt.score} / ${attempt.total_questions}</div>
      </div>
      <div>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Time Taken</span>
        <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${Math.floor((attempt.time_taken_sec || 0) / 60)}m ${(attempt.time_taken_sec || 0) % 60}s</div>
      </div>
      <div>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Mastery Status</span>
        <div style="font-size: 24px; font-weight: bold; color: #b45309;">COMPLETED</div>
      </div>
    </div>

    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">📊 Detailed Item Telemetry Table</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
      <thead>
        <tr style="background: #f1f5f9; color: #475569;">
          <th style="padding: 10px;">Item</th>
          <th style="padding: 10px;">Question</th>
          <th style="padding: 10px;">Your Choice</th>
          <th style="padding: 10px;">Correct Answer</th>
          <th style="padding: 10px;">Attempts</th>
          <th style="padding: 10px;">Time Spent</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
      EdutorAI Quiz Portal — Practice & Mastery Learning System — Confidential & Verified Report
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 size width in mm
    const pageHeight = 297; // A4 size height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const safeTitle = (quiz.title || 'Quiz').replace(/[^a-z0-9]/gi, '_');
    const safeUser = (user.full_name || 'User').replace(/[^a-z0-9]/gi, '_');
    pdf.save(`Quiz_Report_${safeTitle}_${safeUser}.pdf`);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    alert('Failed to generate PDF report. Please try again.');
  } finally {
    document.body.removeChild(container);
  }
}
