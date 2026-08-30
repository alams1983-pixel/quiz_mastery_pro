import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { renderMath } from './katexRenderer.js';

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
        <h1 style="margin: 0; color: #4f46e5; font-size: 24px;">📘 EdutorAi Pro Portal</h1>
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
      EdutorAi Pro Portal — Practice & Mastery Learning System — Confidential & Verified Report
    </div>
  `;

  document.body.appendChild(container);

  try {
    renderMath(container);
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

export async function downloadQuizBookletPDF({ quiz, questions }) {
  if (!Array.isArray(questions) || questions.length === 0) {
    alert('No questions available in this quiz to generate a PDF booklet.');
    return;
  }

  const dateStr = new Date().toLocaleDateString();
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Root wrapper offscreen
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '-9999px';
  wrapper.style.width = '800px';

  // Helper to create a single A4 page container (210mm x 297mm ratio = 800px x 1131px)
  const createPage = () => {
    const pageEl = document.createElement('div');
    pageEl.className = 'pdf-page';
    pageEl.style.width = '800px';
    pageEl.style.height = '1130px';
    pageEl.style.padding = '32px 36px';
    pageEl.style.boxSizing = 'border-box';
    pageEl.style.background = '#ffffff';
    pageEl.style.color = '#0f172a';
    pageEl.style.fontFamily = "'Outfit', sans-serif, Arial";
    pageEl.style.position = 'relative';
    pageEl.style.display = 'flex';
    pageEl.style.flexDirection = 'column';
    pageEl.style.justifyContent = 'space-between';
    return pageEl;
  };

  const pageElements = [];

  // Helper to build a question card HTML
  const createQuestionCardHTML = (q, idx) => {
    const opts = q.options || [];
    let optionsHTML = '';
    opts.forEach((optText, optIdx) => {
      optionsHTML += `
        <div style="display: flex; gap: 6px; align-items: baseline;">
          <strong style="color: #0d9488; min-width: 22px;">(${labels[optIdx]})</strong>
          <span>${optText}</span>
        </div>
      `;
    });

    let imgHTML = '';
    if (q.image_path) {
      imgHTML = `<div style="margin: 6px 0;"><img src="/api/images/${q.image_path}" style="max-width: 100%; max-height: 110px; border-radius: 6px; border: 1px solid #e2e8f0;" /></div>`;
    }

    return `
      <div style="margin-bottom: 14px; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; box-sizing: border-box;">
        <div style="font-weight: 700; font-size: 12.5px; margin-bottom: 5px; color: #0f172a; line-height: 1.35;">
          Q${idx + 1}. ${q.question_text}
        </div>
        ${imgHTML}
        <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; margin-top: 5px; color: #334155;">
          ${optionsHTML}
        </div>
      </div>
    `;
  };

  // ─── Dynamic Question Pagination — 2-Column Shadow Measurement ───────────
  // Strategy (mirrors the answer key approach):
  //  1. Render each question card into a hidden shadow column (width = one column = 356px)
  //  2. Measure the card's true pixel height with getBoundingClientRect()
  //  3. Pack cards into LEFT column, then RIGHT column until accumulated height > PAGE_Q_HEIGHT
  //  4. When either column overflows, flush the current page and start a new one
  //
  // This ensures:
  //  - Short questions → more cards per page (no wasted white space)
  //  - Long questions with images or many options → fewer cards, never cut off

  const PAGE_Q_HEIGHT = 930; // usable px per column (1130 - 32*2 padding - ~120px header - ~30px footer)
  const FIRST_PAGE_HEADER_COST = 120; // taller header on page 1
  const OTHER_PAGE_HEADER_COST = 45;  // smaller header on subsequent pages

  // Build hidden shadow column for measuring question card heights
  const qShadowContainer = document.createElement('div');
  qShadowContainer.style.cssText = `
    position: fixed; left: -9999px; top: -9999px;
    width: 356px; height: auto; visibility: hidden;
    font-family: 'Outfit', sans-serif, Arial; font-size: 12px;
    box-sizing: border-box;
  `;
  document.body.appendChild(qShadowContainer);

  // Measure all question card heights up-front
  const qCardEls = [];   // DOM elements
  const qCardHeights = [];

  questions.forEach((q, idx) => {
    const wrapper2 = document.createElement('div');
    wrapper2.style.cssText = 'margin-bottom: 14px; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; box-sizing: border-box;';

    const opts = q.options || [];
    let optionsHTML = '';
    opts.forEach((optText, optIdx) => {
      optionsHTML += `
        <div style="display: flex; gap: 6px; align-items: baseline;">
          <strong style="color: #0d9488; min-width: 22px;">(${labels[optIdx]})</strong>
          <span>${optText}</span>
        </div>
      `;
    });

    let imgHTML = '';
    if (q.image_path) {
      imgHTML = `<div style="margin: 6px 0;"><img src="/api/images/${q.image_path}" style="max-width: 100%; max-height: 110px; border-radius: 6px; border: 1px solid #e2e8f0;" /></div>`;
    }

    wrapper2.innerHTML = `
      <div style="font-weight: 700; font-size: 12.5px; margin-bottom: 5px; color: #0f172a; line-height: 1.35;">
        Q${idx + 1}. ${q.question_text}
      </div>
      ${imgHTML}
      <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; margin-top: 5px; color: #334155;">
        ${optionsHTML}
      </div>
    `;

    qShadowContainer.appendChild(wrapper2);
    renderMath(wrapper2);
    const cardH = wrapper2.getBoundingClientRect().height || wrapper2.offsetHeight;
    qShadowContainer.removeChild(wrapper2);

    qCardEls.push(wrapper2);
    qCardHeights.push(cardH + 14); // +14 for margin-bottom
  });

  document.body.removeChild(qShadowContainer);

  // Bin cards into pages with 2 columns per page
  // Each page has: leftCol and rightCol, both capped at PAGE_Q_HEIGHT
  const questionPages = []; // [{left: [idxs], right: [idxs]}]
  let leftCol = [], rightCol = [];
  let leftH = 0, rightH = 0;
  let isFirstQPage = true;

  const getPageHeaderCost = (isFirst) => isFirst ? FIRST_PAGE_HEADER_COST : OTHER_PAGE_HEADER_COST;
  const getColLimit = (isFirst) => PAGE_Q_HEIGHT - getPageHeaderCost(isFirst);

  const flushQPage = () => {
    questionPages.push({ left: leftCol, right: rightCol });
    leftCol = []; rightCol = [];
    leftH = 0; rightH = 0;
    isFirstQPage = false;
  };

  questions.forEach((q, idx) => {
    const cardH = qCardHeights[idx];
    const colLimit = getColLimit(isFirstQPage);

    if (leftH + cardH <= colLimit) {
      // Fits in left column
      leftCol.push(idx);
      leftH += cardH;
    } else if (rightH + cardH <= colLimit) {
      // Fits in right column
      rightCol.push(idx);
      rightH += cardH;
    } else {
      // Both columns full — flush and start new page
      flushQPage();
      const newLimit = getColLimit(isFirstQPage);
      if (cardH <= newLimit) {
        leftCol.push(idx);
        leftH += cardH;
      } else {
        // Single card taller than column — place it anyway (edge case: image+long question)
        leftCol.push(idx);
        leftH += cardH;
      }
    }
  });
  if (leftCol.length > 0 || rightCol.length > 0) flushQPage();

  const totalQuestionPages = questionPages.length;

  // Render question pages
  questionPages.forEach((page, pageIdx) => {
    const pageEl = createPage();
    const isFirstPage = (pageIdx === 0);

    const headerHTML = isFirstPage ? `
      <div style="border-bottom: 3px solid #0d9488; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="margin: 0; color: #0d9488; font-size: 21px; font-weight: 800;">📘 EdutorAI Question Booklet</h1>
          <p style="margin: 3px 0 0 0; color: #475569; font-size: 13.5px; font-weight: 600;">${quiz.title || 'Practice Quiz'}</p>
          <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11.5px;">Category: ${quiz.category_name || 'General'} | Total Questions: ${questions.length}</p>
        </div>
        <div style="text-align: right; font-size: 11.5px; color: #64748b;">
          <span style="background: #ccfbf1; color: #0f766e; font-weight: bold; padding: 4px 10px; border-radius: 12px;">Exam Booklet</span>
          <p style="margin: 4px 0 0 0;">Date: ${dateStr}</p>
        </div>
      </div>
    ` : `
      <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 14px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
        <span style="font-weight: 600; color: #0d9488;">📘 ${quiz.title || 'Question Booklet'}</span>
        <span>Page ${pageIdx + 1}</span>
      </div>
    `;

    const footerHTML = `
      <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
        <span>EdutorAI Quiz Portal — Practice & Active Memory Booklet</span>
        <span>Page ${pageIdx + 1}</span>
      </div>
    `;

    pageEl.innerHTML = `
      <div style="flex: 1; overflow: hidden;">
        ${headerHTML}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;">
          <div id="q-left-${pageIdx}" style="display: flex; flex-direction: column;"></div>
          <div id="q-right-${pageIdx}" style="display: flex; flex-direction: column;"></div>
        </div>
      </div>
      ${footerHTML}
    `;

    wrapper.appendChild(pageEl);
    pageElements.push(pageEl);

    const leftContainer = pageEl.querySelector(`#q-left-${pageIdx}`);
    const rightContainer = pageEl.querySelector(`#q-right-${pageIdx}`);

    page.left.forEach(idx => leftContainer.appendChild(qCardEls[idx]));
    page.right.forEach(idx => rightContainer.appendChild(qCardEls[idx]));
  });



  // ─── Dynamic Answer Key Pagination via Shadow Measurement Table ───────────
  // Root cause of previous failures:
  //   createPage() uses display:flex + fixed height:1130px.
  //   Any child with flex:1 always reports offsetHeight == parent height regardless of content.
  //   We cannot measure natural table height from inside a fixed-height flex container.
  //
  // Solution:
  //   1. Build an off-screen shadow table (height:auto, outside wrapper) and add rows one by one.
  //   2. After each row, measure shadow table's scrollHeight (natural content height).
  //   3. When scrollHeight > PAGE_CONTENT_HEIGHT (accounts for header + footer overhead), 
  //      stop, snapshot the current batch, create a PDF page, then start next batch.

  const PAGE_CONTENT_HEIGHT = 960; // px available inside page (1130px - 32px*2 padding - ~80px header - ~30px footer)
  const ANS_HEADER_HEIGHT = 80;    // approximate header div height

  // Build a hidden measurement shadow table
  const shadowContainer = document.createElement('div');
  shadowContainer.style.cssText = `
    position: fixed; left: -9999px; top: -9999px;
    width: 728px; height: auto; visibility: hidden;
    font-family: 'Outfit', sans-serif, Arial; font-size: 11px;
  `;
  const shadowTable = document.createElement('table');
  shadowTable.style.cssText = 'width: 100%; border-collapse: collapse;';
  // Mirror the thead to ensure accurate column widths
  shadowTable.innerHTML = `
    <thead>
      <tr>
        <th style="width:45px; padding:7px 8px;"></th>
        <th style="width:165px; padding:7px 8px;"></th>
        <th style="padding:7px 8px;"></th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  shadowContainer.appendChild(shadowTable);
  document.body.appendChild(shadowContainer);
  const shadowTbody = shadowTable.querySelector('tbody');

  const buildAnswerPageHTML = (partNum, totalParts, pageNum) => `
    <div style="border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0; color: #0f766e; font-size: 17px; font-weight: 800;">🔑 Answer & Explanation Key ${totalParts > 1 ? `(Part ${partNum})` : ''}</h2>
      <span style="font-size: 11px; color: #64748b; font-style: italic;">Official Answer Sheet</span>
    </div>
  `;

  // Collect all rows with their measured heights first
  const allRowEls = [];
  const allRowHeights = [];

  questions.forEach((q, globalIdx) => {
    const opts = q.options || [];
    const correctChoiceText = opts[q.correct_answer_index] !== undefined
      ? `(${labels[q.correct_answer_index]}) ${opts[q.correct_answer_index]}`
      : 'N/A';
    const explanationText = q.explanation || 'No explanation provided.';

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #e2e8f0';
    tr.innerHTML = `
      <td style="padding: 7px 8px; font-weight: bold; width: 45px; text-align: center; vertical-align: top;">Q${globalIdx + 1}</td>
      <td style="padding: 7px 8px; font-weight: 600; color: #047857; width: 165px; vertical-align: top;">${correctChoiceText}</td>
      <td style="padding: 7px 8px; color: #475569; vertical-align: top; line-height: 1.45;">${explanationText}</td>
    `;

    // Measure this row's natural rendered height using shadow table
    shadowTbody.appendChild(tr);
    renderMath(tr);
    const rowHeight = tr.getBoundingClientRect().height || tr.offsetHeight;
    shadowTbody.removeChild(tr);

    allRowEls.push(tr);
    allRowHeights.push(rowHeight);
  });

  // Clean up shadow container
  document.body.removeChild(shadowContainer);

  // Now bin rows into pages based on accumulated heights
  const TABLE_HEADER_HEIGHT = 30; // thead row height
  const pageBatches = []; // array of arrays of row indices
  let currentBatch = [];
  let accumulatedHeight = ANS_HEADER_HEIGHT + TABLE_HEADER_HEIGHT;

  allRowHeights.forEach((rowH, idx) => {
    if (accumulatedHeight + rowH > PAGE_CONTENT_HEIGHT && currentBatch.length > 0) {
      pageBatches.push(currentBatch);
      currentBatch = [];
      accumulatedHeight = ANS_HEADER_HEIGHT + TABLE_HEADER_HEIGHT;
    }
    currentBatch.push(idx);
    accumulatedHeight += rowH;
  });
  if (currentBatch.length > 0) pageBatches.push(currentBatch);

  const totalAnswerPages = pageBatches.length;

  // Now render each answer page
  pageBatches.forEach((batch, batchIdx) => {
    const pageEl = createPage();
    const pageNum = totalQuestionPages + batchIdx + 1;
    const partNum = batchIdx + 1;

    pageEl.innerHTML = `
      <div style="flex: 1; overflow: hidden;">
        ${buildAnswerPageHTML(partNum, totalAnswerPages, pageNum)}
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; background: #ffffff; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #f0fdfa; color: #0f766e; border-bottom: 2px solid #99f6e4;">
              <th style="padding: 7px 8px; text-align: center;">Item</th>
              <th style="padding: 7px 8px;">Correct Answer</th>
              <th style="padding: 7px 8px;">Explanation</th>
            </tr>
          </thead>
          <tbody id="ans-tbody-${batchIdx}"></tbody>
        </table>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
        <span>EdutorAI Quiz Portal — Practice & Active Memory Booklet</span>
        <span>Page ${pageNum}</span>
      </div>
    `;

    wrapper.appendChild(pageEl);
    pageElements.push(pageEl);

    const tbody = pageEl.querySelector(`#ans-tbody-${batchIdx}`);
    batch.forEach(rowIdx => {
      tbody.appendChild(allRowEls[rowIdx]);
    });
  });



  document.body.appendChild(wrapper);

  try {
    // Render KaTeX equations
    renderMath(wrapper);

    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) pdf.addPage();
      const canvas = await html2canvas(pageElements[i], { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    }

    const safeTitle = (quiz.title || 'Quiz').replace(/[^a-z0-9]/gi, '_');
    pdf.save(`Quiz_Booklet_${safeTitle}.pdf`);
  } catch (err) {
    console.error('PDF Booklet Generation Error:', err);
    alert('Failed to generate PDF booklet. Please try again.');
  } finally {
    document.body.removeChild(wrapper);
  }
}
