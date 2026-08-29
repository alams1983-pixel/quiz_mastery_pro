const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/BulkUploadModal-io96Boxb.js","assets/csvJsonParser-Cmc2jVv8.js","assets/index-BJvuVE6r.js","assets/index-CG2BOuPD.css"])))=>i.map(i=>d[i]);
import{r as u,a as w,_ as $}from"./index-BJvuVE6r.js";let b=[],h=[],v=[],c=null;function L(t,o={}){c=typeof t=="function"?t:null;const i=document.createElement("div");return i.className="view-container fade-in",i.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">📚 Master Question Repository</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Manage your institute's central question bank with taxonomy validation, multi-language support, line breaks, and hybrid image+text content.
        </p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="btn-bank-add" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;" title="Add New Master Question" aria-label="Add New Master Question">
          <i class="ri-add-circle-line"></i> <span class="btn-text-desktop">Add New Master Question</span>
        </button>
        <button id="btn-bank-bulk" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;" title="Bulk Import Master Questions" aria-label="Bulk Import Master Questions">
          <i class="ri-upload-2-line"></i> <span class="btn-text-desktop">Bulk Import Master Questions</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="card" style="padding: 18px; margin-bottom: 24px; background: var(--card-bg);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; align-items: center;">
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Filter by Category</label>
          <select id="filter-category" class="form-control">
            <option value="">-- All Categories --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Filter by Exam</label>
          <select id="filter-exam" class="form-control">
            <option value="">-- All Exams --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Filter by Difficulty</label>
          <select id="filter-difficulty" class="form-control">
            <option value="">-- All Difficulties --</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Search Keyword</label>
          <input type="text" id="filter-search" class="form-control" placeholder="Search text, explanation, passage...">
        </div>
      </div>
    </div>

    <!-- Question Bank Container -->
    <div id="questions-list-container" style="display: flex; flex-direction: column; gap: 16px;">
      <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        Loading master question bank...
      </div>
    </div>
  `,y(i,o),i}async function y(t,o={}){try{const[i,e,a]=await Promise.all([u("/exams"),u("/exams/questions/all"),u("/categories").catch(()=>({flatCategories:[]}))]);if(b=i.exams||[],v=e.questions||[],h=a.flatCategories||[],k(t),_(t,v),E(t),o.examId){const s=t.querySelector("#filter-exam");s&&(s.value=o.examId,f(t))}}catch(i){console.error("Failed to load question bank data:",i)}}function k(t){const o=t.querySelector("#filter-category"),i=t.querySelector("#filter-exam");o&&(o.innerHTML='<option value="">-- All Categories --</option>'+h.map(e=>`<option value="${e.id}">${e.icon||"📂"} ${e.name}</option>`).join("")),i&&(i.innerHTML='<option value="">-- All Exams --</option>'+b.map(e=>`<option value="${e.id}">${e.title}</option>`).join(""))}function _(t,o){const i=t.querySelector("#questions-list-container");if(i){if(!o||o.length===0){i.innerHTML=`
      <div class="card" style="padding: 36px; text-align: center; color: var(--text-muted);">
        No master questions found matching the selected filters.
      </div>
    `;return}i.innerHTML=o.map((e,a)=>{const s=e.tag_names?e.tag_names.split(",").map(d=>`<span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color);">🏷️ ${d.trim()}</span>`).join(""):"",r=e.options_en||[],x=e.options_hi||[],g=e.options_images||[];return`
      <div class="card" style="padding: 20px; border-left: 4px solid var(--primary);">
        <!-- Top Badges & Actions Bar -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="badge-tag" style="background: var(--primary-light); color: var(--primary); font-weight: 700;">
              ${e.category_icon||"📂"} ${e.category_name||"General"}
            </span>
            <span class="badge-tag" style="background: ${e.is_global?"var(--primary-light)":"var(--accent-light)"}; color: ${e.is_global?"var(--primary)":"var(--accent)"}; font-weight:700;">
              ${e.is_global?"🌐 Global":"🏫 Private"}
            </span>
            <span class="badge-tag" style="text-transform: capitalize; font-weight: 700; color: ${e.difficulty==="hard"?"var(--danger)":e.difficulty==="easy"?"var(--success)":"var(--accent)"};">
              ⚡ ${e.difficulty||"medium"}
            </span>
            ${s}
          </div>

          <div class="table-action-group">
            <button class="icon-action-btn btn-edit-q" data-id="${e.id}" title="Edit Question (Math & Image Editor)">
              <i class="ri-edit-line"></i>
            </button>
            <button class="icon-action-btn btn-danger btn-del-q" data-id="${e.id}" title="Delete Master Question">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- Comprehension Passage (If Available) -->
        ${e.passage_text_en||e.passage_text_hi||e.passage_image_url?`
          <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--primary); margin-bottom: 6px;">
              📖 Comprehension Passage:
            </div>
            ${e.passage_text_en?`<div style="font-size: 0.9rem; margin-bottom: 6px; white-space: pre-line;" class="katex-render">${e.passage_text_en}</div>`:""}
            ${e.passage_text_hi?`<div style="font-size: 0.88rem; color: var(--text-muted); white-space: pre-line;" class="katex-render">हिंदी: ${e.passage_text_hi}</div>`:""}
            ${e.passage_image_url?`<div style="margin-top: 8px;"><img src="${e.passage_image_url}" alt="Passage Image" style="max-width: 100%; max-height: 220px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>`:""}
          </div>
        `:""}

        <!-- Question Text (English & Hindi) with Line Breaks -->
        <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 8px; color: var(--text-main); white-space: pre-line;" class="katex-render">Q${a+1}. ${e.question_text_en}</div>
        ${e.question_text_hi?`<div style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 12px; white-space: pre-line;" class="katex-render">हिंदी: ${e.question_text_hi}</div>`:""}
        ${e.image_url?`<div style="margin-bottom: 12px;"><img src="${e.image_url}" alt="Question Diagram" style="max-width: 100%; max-height: 220px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>`:""}

        <!-- Options Grid (Dynamic 2-6 Choices) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 14px;">
          ${r.map((d,n)=>{const l=n===e.correct_option_index,p=x[n]||"",m=g[n]||"";return`
              <div style="padding: 10px 12px; border-radius: 8px; border: 1px solid ${l?"var(--success)":"var(--border-color)"}; background: ${l?"rgba(34,197,94,0.08)":"var(--bg-color)"}; font-size: 0.9rem;">
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <strong style="color: ${l?"var(--success)":"var(--primary)"}; width: 24px;">
                    ${String.fromCharCode(65+n)}:
                  </strong>
                  <div style="flex: 1;">
                    <div style="white-space: pre-line;" class="katex-render">${d}</div>
                    ${p?`<div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; white-space: pre-line;" class="katex-render">${p}</div>`:""}
                    ${m?`<div style="margin-top: 4px;"><img src="${m}" alt="Option ${String.fromCharCode(65+n)}" style="max-width: 100%; max-height: 120px; border-radius: 4px;" onerror="this.style.display='none'" /></div>`:""}
                  </div>
                  ${l?'<span style="color:var(--success); font-weight:bold; font-size:1.1rem;">✓</span>':""}
                </div>
              </div>
            `}).join("")}
        </div>

        <!-- Explanation Section -->
        ${e.explanation_en||e.explanation_hi||e.explanation_image_url?`
          <div style="font-size: 0.88rem; color: var(--text-muted); background: var(--bg-color); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">💡 Solution Explanation:</div>
            ${e.explanation_en?`<div style="white-space: pre-line; margin-bottom: 4px;" class="katex-render">${e.explanation_en}</div>`:""}
            ${e.explanation_hi?`<div style="white-space: pre-line; color: var(--text-muted);" class="katex-render">हिंदी: ${e.explanation_hi}</div>`:""}
            ${e.explanation_image_url?`<div style="margin-top: 6px;"><img src="${e.explanation_image_url}" alt="Explanation Diagram" style="max-width: 100%; max-height: 200px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>`:""}
          </div>
        `:""}
      </div>
    `}).join(""),w(i),i.querySelectorAll(".btn-edit-q").forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.id;typeof c=="function"&&c("question-editor",{questionId:a,returnView:"exam-questions"})})}),i.querySelectorAll(".btn-del-q").forEach(e=>{e.addEventListener("click",async()=>{const a=e.dataset.id;if(confirm("Are you sure you want to delete this master question?"))try{await u(`/exams/questions/${a}`,{method:"DELETE"}),y(t)}catch{alert("Error deleting master question.")}})})}}function f(t){const o=t.querySelector("#filter-category").value,i=t.querySelector("#filter-exam").value,e=t.querySelector("#filter-difficulty").value,a=t.querySelector("#filter-search").value.toLowerCase().trim();let s=v.filter(r=>{if(o&&r.category_id!=o||i&&r.exam_id!=i||e&&r.difficulty!==e)return!1;if(a){const x=r.question_text_en&&r.question_text_en.toLowerCase().includes(a),g=r.question_text_hi&&r.question_text_hi.toLowerCase().includes(a),d=r.explanation_en&&r.explanation_en.toLowerCase().includes(a),n=r.explanation_hi&&r.explanation_hi.toLowerCase().includes(a),l=r.passage_text_en&&r.passage_text_en.toLowerCase().includes(a),p=r.passage_text_hi&&r.passage_text_hi.toLowerCase().includes(a),m=r.tag_names&&r.tag_names.toLowerCase().includes(a);if(!x&&!g&&!d&&!n&&!l&&!p&&!m)return!1}return!0});_(t,s)}function E(t){["#filter-category","#filter-exam","#filter-difficulty"].forEach(a=>{const s=t.querySelector(a);s&&s.addEventListener("change",()=>f(t))});const o=t.querySelector("#filter-search");o&&o.addEventListener("input",()=>f(t));const i=t.querySelector("#btn-bank-add"),e=t.querySelector("#btn-bank-bulk");i&&i.addEventListener("click",()=>{typeof c=="function"&&c("question-editor",{returnView:"exam-questions"})}),e&&e.addEventListener("click",async()=>{const{renderBulkUploadModal:a}=await $(async()=>{const{renderBulkUploadModal:s}=await import("./BulkUploadModal-io96Boxb.js");return{renderBulkUploadModal:s}},__vite__mapDeps([0,1,2,3]));a(null,"question_bank",()=>y(t))})}export{L as renderExamQuestionBankView};
