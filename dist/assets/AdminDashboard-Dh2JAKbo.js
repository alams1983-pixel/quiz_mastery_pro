import{a as P,r as H,e as M,g as R,b as z,c as U,_ as G}from"./index-CmO4Cwr9.js";import{p as F,a as V}from"./csvJsonParser-Cmc2jVv8.js";function I({initialQuestion:x,onSave:f,onCancel:w}){const t=document.createElement("div");t.className="math-editor-grid",t.style.display="grid",t.style.gridTemplateColumns="1fr 1fr",t.style.gap="20px";const p=x||{question_text:"",options:["","","",""],correct_answer_index:0,explanation:""};t.innerHTML=`
    <!-- Left Pane: Inputs -->
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="font-weight:700; font-size:1.1rem;">✍️ Question Editor</h3>
      
      <div class="form-group">
        <label>Question Text (supports LaTeX math like $E=mc^2$)</label>
        <textarea id="editQText" class="form-textarea" rows="4">${p.question_text||""}</textarea>
      </div>

      <div class="form-group">
        <label>Options (A, B, C, D...)</label>
        <div id="optionsInputs" style="display:flex; flex-direction:column; gap:8px;">
          ${[0,1,2,3,4].map(u=>`
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="radio" name="correctRadio" value="${u}" ${p.correct_answer_index===u?"checked":""} />
              <span style="font-weight:bold; font-size:0.85rem; width:16px;">${String.fromCharCode(65+u)}</span>
              <input type="text" class="form-input opt-input" data-idx="${u}" value="${p.options&&p.options[u]?p.options[u]:""}" placeholder="Option ${String.fromCharCode(65+u)}" />
            </div>
          `).join("")}
        </div>
      </div>

      <div class="form-group">
        <label>Explanation</label>
        <textarea id="editExplanation" class="form-textarea" rows="2">${p.explanation||""}</textarea>
      </div>

      <div class="form-group">
        <label>Question Image (optional)</label>
        <input type="file" id="editImage" class="form-input" accept="image/*" />
      </div>

      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="btn" id="saveQuestionBtn">Save Question</button>
        <button class="btn btn-secondary" id="cancelQuestionBtn">Cancel</button>
      </div>
    </div>

    <!-- Right Pane: Real-time Live Preview -->
    <div style="background:var(--card-bg); border:1px solid var(--glass-border); border-radius:var(--radius-md); padding:20px;">
      <h3 style="font-weight:700; font-size:1.1rem; color:var(--primary); margin-bottom:14px;">👁️ Real-time KaTeX Live Preview</h3>
      
      <div id="previewCard" class="question-card" style="margin-bottom:0;">
        <div id="prevQText" class="q-text">Type a question above...</div>
        <img id="prevImg" class="question-img" style="display:none;" />
        <div id="prevOptions" class="options-grid"></div>
        <div id="prevExplanation" style="margin-top:14px; font-size:0.9rem; color:var(--text-muted); background:var(--primary-light); padding:10px; border-radius:var(--radius-sm); display:none;"></div>
      </div>
    </div>
  `;const v=t.querySelector("#editQText"),h=t.querySelector("#editExplanation"),a=t.querySelector("#editImage"),k=t.querySelector("#prevQText"),i=t.querySelector("#prevImg"),r=t.querySelector("#prevOptions"),l=t.querySelector("#prevExplanation");function g(){k.textContent=v.value||"Question text preview...",r.innerHTML="";const u=t.querySelectorAll('input[name="correctRadio"]');let y=0;u.forEach(s=>{s.checked&&(y=parseInt(s.value,10))}),t.querySelectorAll(".opt-input").forEach((s,e)=>{if(s.value.trim().length>0){const d=document.createElement("div");d.className=`option-btn ${e===y?"correct-opt":""}`,d.innerHTML=`<span class="opt-label">${String.fromCharCode(65+e)}</span><span class="opt-text">${s.value}</span>`,r.appendChild(d)}}),h.value.trim().length>0?(l.style.display="block",l.textContent=`Explanation: ${h.value}`):l.style.display="none",P(t.querySelector("#previewCard"))}return v.addEventListener("input",g),h.addEventListener("input",g),t.querySelectorAll(".opt-input").forEach(u=>u.addEventListener("input",g)),t.querySelectorAll('input[name="correctRadio"]').forEach(u=>u.addEventListener("change",g)),a.addEventListener("change",u=>{const y=u.target.files[0];y?(i.src=URL.createObjectURL(y),i.style.display="block"):i.style.display="none"}),g(),t.querySelector("#saveQuestionBtn").addEventListener("click",()=>{const u=t.querySelectorAll('input[name="correctRadio"]');let y=0;u.forEach(e=>{e.checked&&(y=parseInt(e.value,10))});const m=[];t.querySelectorAll(".opt-input").forEach(e=>{e.value.trim()&&m.push(e.value.trim())});const s=new FormData;s.append("question_text",v.value.trim()),s.append("options",JSON.stringify(m)),s.append("correct_answer_index",y),s.append("explanation",h.value.trim()),a.files[0]&&s.append("image",a.files[0]),f(s)}),t.querySelector("#cancelQuestionBtn").addEventListener("click",w),t}function J(x){try{const f=JSON.stringify(x);return btoa(unescape(encodeURIComponent(f)))}catch{return""}}function A(x,f,w){const t=document.createElement("div");t.className="modal-overlay fade-in",t.style.position="fixed",t.style.inset="0",t.style.background="rgba(0, 0, 0, 0.6)",t.style.backdropFilter="blur(4px)",t.style.zIndex="10000",t.style.display="flex",t.style.alignItems="center",t.style.justifyContent="center",t.style.padding="20px";let p=1,v=[],h=null;const a=`question_text,optionA,optionB,optionC,optionD,correct_answer_index,explanation,tags
"What is the capital of France?","London","Berlin","Paris","Madrid",2,"Paris is the capital of France.","Geography,General Knowledge"
"Which element has atomic number 1?","Hydrogen","Helium","Lithium","Beryllium",0,"Hydrogen is the first element in the periodic table.","Chemistry,Science"`,k=JSON.stringify([{question_text:"What is the capital of France?",options:["London","Berlin","Paris","Madrid"],correct_answer_index:2,explanation:"Paris is the capital of France.",tags:["Geography","General Knowledge"]},{question_text:"Which element has atomic number 1?",options:["Hydrogen","Helium","Lithium","Beryllium"],correct_answer_index:0,explanation:"Hydrogen is the first element in the periodic table.",tags:["Chemistry","Science"]}],null,2),i=document.createElement("div");i.className="card",i.style.width="100%",i.style.maxWidth="780px",i.style.maxHeight="90vh",i.style.overflowY="auto",i.style.padding="28px",i.style.background="var(--card-bg)",i.style.borderRadius="20px",i.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)";function r(){i.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">
            <i class="ri-lightbulb-line" style="color: var(--primary);"></i> Practice Quiz Bulk Question Wizard
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Step ${p} of 3 — Dedicated Practice Quiz Bulk Import</p>
        </div>
        <button id="close-quiz-wizard-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <!-- Step Indicator Bar -->
      <div style="display: flex; gap: 8px; margin-bottom: 24px;">
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${p>=1?"var(--primary)":"var(--border-color)"};"></div>
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${p>=2?"var(--primary)":"var(--border-color)"};"></div>
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${p>=3?"var(--primary)":"var(--border-color)"};"></div>
      </div>

      ${p===1?l():""}
      ${p===2?g():""}
      ${p===3?u():""}
    `,y()}function l(){return`
      <div style="margin-bottom: 20px;">
        <label class="form-label" style="margin-bottom: 8px; display: block;">Select or Drag Practice Quiz Question File (CSV / JSON):</label>
        <div id="drop-zone" style="border: 2px dashed var(--primary); border-radius: 14px; padding: 36px 20px; text-align: center; background: var(--primary-light); cursor: pointer; transition: all 0.2s;">
          <i class="ri-file-code-line" style="font-size: 2.8rem; color: var(--primary); display: block; margin-bottom: 8px;"></i>
          <p style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 4px;">Click to Browse or Drag & Drop Practice Quiz File</p>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Supports .csv and .json question files for practice quizzes</p>
          <input type="file" id="file-input" accept=".csv,.json" style="display: none;" />
        </div>
        ${h?`<div style="color: var(--danger); font-size: 0.85rem; margin-top: 10px; font-weight: 600;">⚠️ ${h}</div>`:""}
      </div>

      <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h4 style="font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: var(--primary);">📥 Download Practice Quiz Sample Templates:</h4>
        <div style="display: flex; gap: 12px;">
          <button id="dl-csv-sample" class="btn btn-outline btn-sm"><i class="ri-file-excel-line"></i> Download CSV Template</button>
          <button id="dl-json-sample" class="btn btn-outline btn-sm"><i class="ri-code-s-slash-line"></i> Download JSON Template</button>
        </div>
      </div>
    `}function g(){return`
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-weight: 800; font-size: 1rem; color: var(--text-main);">
            Parsed Preview (${v.length} Questions Found)
          </h4>
          <span class="status-badge status-active">Ready for Quiz #${x}</span>
        </div>

        <div style="overflow-x: auto; max-height: 280px; border: 1px solid var(--border-color); border-radius: 10px;">
          <table class="custom-table" style="width: 100%; font-size: 0.85rem;">
            <thead>
              <tr>
                <th>#</th>
                <th>Question Statement</th>
                <th>Options Count</th>
                <th>Ans Index</th>
                <th>Explanation</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              ${v.map((e,d)=>`
                <tr>
                  <td style="font-weight: 700;">${d+1}</td>
                  <td style="max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.question_text_en||e.question_text}</td>
                  <td>${(e.options_en||e.options||[]).length} Options</td>
                  <td style="font-weight: 700; color: var(--primary);">${e.correct_option_index!==void 0?e.correct_option_index:e.correct_answer_index}</td>
                  <td style="max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted);">${e.explanation_en||e.explanation||"-"}</td>
                  <td>${Array.isArray(e.tag_names||e.tags)?(e.tag_names||e.tags).join(", "):e.tag_names||e.tags||"-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step1" class="btn btn-outline">← Back</button>
        <button id="btn-next-step3" class="btn btn-primary">Proceed to Import →</button>
      </div>
    `}function u(){return`
      <div style="text-align: center; padding: 20px 0; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 12px;">
          <i class="ri-check-double-line"></i>
        </div>
        <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">Ready to Import ${v.length} Questions</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Questions will be added into Practice Quiz #${x}.</p>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step2" class="btn btn-outline">← Back</button>
        <button id="btn-confirm-import" class="btn btn-primary" style="flex: 1;">Execute Quiz Bulk Import 🚀</button>
      </div>
    `}function y(){var e;if((e=i.querySelector("#close-quiz-wizard-btn"))==null||e.addEventListener("click",()=>{document.body.removeChild(t),w&&w()}),p===1){const d=i.querySelector("#drop-zone"),n=i.querySelector("#file-input");d.addEventListener("click",()=>n.click()),d.addEventListener("dragover",c=>{c.preventDefault(),d.style.background="var(--primary-border)"}),d.addEventListener("dragleave",()=>{d.style.background="var(--primary-light)"}),d.addEventListener("drop",c=>{c.preventDefault(),d.style.background="var(--primary-light)",c.dataTransfer.files.length>0&&m(c.dataTransfer.files[0])}),n.addEventListener("change",c=>{c.target.files.length>0&&m(c.target.files[0])}),i.querySelector("#dl-csv-sample").addEventListener("click",()=>s("quiz_questions_template.csv",a)),i.querySelector("#dl-json-sample").addEventListener("click",()=>s("quiz_questions_template.json",k))}p===2&&(i.querySelector("#btn-back-step1").addEventListener("click",()=>{p=1,r()}),i.querySelector("#btn-next-step3").addEventListener("click",()=>{p=3,r()})),p===3&&(i.querySelector("#btn-back-step2").addEventListener("click",()=>{p=2,r()}),i.querySelector("#btn-confirm-import").addEventListener("click",async()=>{const d=i.querySelector("#btn-confirm-import");d.disabled=!0,d.innerHTML="Importing Quiz Questions... ⏳";try{const n=`/quizzes/${x}/questions/bulk`,c={questions:v,encodedPayload:J(v)},b=await H(n,{method:"POST",body:JSON.stringify(c)});M.invalidate(`quiz_${x}`),M.invalidate("quizzes"),alert(b.message||"Practice quiz questions imported successfully!"),document.body.removeChild(t),f&&f(b)}catch(n){console.error("[DEBUG CLIENT] Quiz bulk import error:",n),alert(n.message||"Quiz bulk import failed."),d.disabled=!1,d.innerHTML="Execute Quiz Bulk Import 🚀"}}))}function m(e){const d=new FileReader;d.onload=n=>{try{const c=n.target.result;if(e.name.endsWith(".json")?v=F(c):v=V(c),v.length===0){h="No valid questions could be extracted from the file.",r();return}h=null,p=2,r()}catch(c){h=c.message,r()}},d.readAsText(e)}function s(e,d){const n=new Blob([d],{type:"text/plain"}),c=URL.createObjectURL(n),b=document.createElement("a");b.href=c,b.download=e,b.click(),URL.revokeObjectURL(c)}t.appendChild(i),document.body.appendChild(t),r()}function N(x,f){A(x,f,null)}const W=Object.freeze(Object.defineProperty({__proto__:null,openQuizBulkUploadModal:N,renderQuizBulkUploadModal:A},Symbol.toStringTag,{value:"Module"}));function Y(x){const f=R(),w=document.createElement("div");w.className="view-container fade-in",w.innerHTML=`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
      <div>
        <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:4px;">📚 Practice Quiz Manager</h1>
        <p style="color:var(--text-muted); font-size:0.95rem;">Create, edit, and organize self-paced practice quizzes and questions with MathLive editor.</p>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <button class="btn btn-primary" id="createQuizBtn" style="display:flex; align-items:center; gap:6px; font-weight:700;">
          <i class="ri-add-line"></i> Create New Quiz
        </button>
      </div>
    </div>

    <!-- Main Quizzes Area -->
    <div id="adminSectionContent">
      <div id="adminQuizList" class="grid">
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          Loading practice quizzes...
        </div>
      </div>
    </div>
  `;const t=w.querySelector("#adminSectionContent");w.querySelector("#createQuizBtn").addEventListener("click",()=>v());async function p(){try{const k=(await z.getQuizzes()).quizzes||[];t.innerHTML='<div id="adminQuizList" class="grid"></div>';const i=t.querySelector("#adminQuizList");if(k.length===0){i.innerHTML=`
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            No practice quizzes found. Click "+ Create New Quiz" to get started!
          </div>
        `;return}k.forEach(r=>{const l=document.createElement("div");l.className="card";const g=r.tag_names?r.tag_names.split(",").map(s=>`<span class="badge-tag">🏷️ ${s.trim()}</span>`).join(""):"",u=r.category_icon||"📂",y=r.is_public,m=r.is_published;l.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
            <span style="font-size:0.8rem; font-weight:700; color:var(--primary); background:var(--primary-light); padding:3px 10px; border-radius:var(--radius-pill);">
              ${u} ${r.category_name||"General"}
            </span>
            <div style="display:flex; gap:4px; align-items:center;">
              <span class="badge-tag" style="background: ${y?"var(--primary-light)":"var(--accent-light)"}; color: ${y?"var(--primary)":"var(--accent)"}; font-weight:700; font-size:0.75rem;">
                ${y?"🌐 Global":"🏫 Institute"}
              </span>
              <span class="badge-tag" style="background: ${m?"rgba(16, 185, 129, 0.15)":"rgba(239, 68, 68, 0.15)"}; color: ${m?"var(--success)":"var(--danger)"}; font-weight:700; font-size:0.75rem;">
                ${m?"📢 Published":"🔒 Draft"}
              </span>
              <span style="font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-left:4px;">
                ${r.question_count||0} Qs
              </span>
            </div>
          </div>

          <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:6px;">${r.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); flex:1; margin-bottom:10px; line-height:1.4;">${r.description||""}</p>
          <div style="margin-bottom:14px;">${g}</div>

          <div class="table-action-group" style="margin-top:auto;">
            <button class="icon-action-btn btn-primary-accent manage-q-btn" title="Manage Questions in Quiz">
              <i class="ri-list-check-2"></i>
            </button>
            <button class="icon-action-btn edit-quiz-btn" title="Edit Quiz Details">
              <i class="ri-edit-line"></i>
            </button>
            <button class="icon-action-btn bulk-q-btn" title="Bulk Import Questions">
              <i class="ri-upload-2-line"></i>
            </button>
            <button class="icon-action-btn btn-danger delete-quiz-btn" title="Delete Quiz">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        `,l.querySelector(".manage-q-btn").addEventListener("click",()=>h(r.id,r.title)),l.querySelector(".edit-quiz-btn").addEventListener("click",()=>v(r)),l.querySelector(".bulk-q-btn").addEventListener("click",()=>N(r.id,()=>p())),l.querySelector(".delete-quiz-btn").addEventListener("click",async()=>{if(confirm(`Are you sure you want to delete quiz "${r.title}"?`))try{await z.deleteQuiz(r.id),p()}catch(s){alert(s.message||"Error deleting quiz")}}),i.appendChild(l)})}catch(a){t.innerHTML=`<div style="color:var(--danger); padding:20px;">Error loading quizzes: ${a.message}</div>`}}async function v(a=null){f&&f.role;const[k,i,r]=await Promise.all([z.getCategories().catch(()=>({flatCategories:[]})),z.getTags().catch(()=>({tags:[]})),H("/exams/batches/all").catch(()=>({batches:[]}))]),l=k.flatCategories||[],g=i.tags||[],u=r.batches||[],y=a&&a.tag_names?a.tag_names.split(",").map(o=>o.trim()):[],m=a&&a.batch_ids?a.batch_ids.split(",").map(o=>parseInt(o.trim(),10)):[],s=l.filter(o=>!o.institute_id||o.is_global),e=l.filter(o=>o.institute_id&&!o.is_global),d=new Set(e.map(o=>o.id.toString())),n=document.createElement("form");n.innerHTML=`
      <div class="form-group">
        <label>Quiz Title *</label>
        <input type="text" id="qTitle" class="form-input" value="${a?a.title:""}" required />
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="qDesc" class="form-textarea" rows="2">${a&&a.description||""}</textarea>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        <div class="form-group">
          <label>Publishing Status</label>
          <select id="qPublished" class="form-select">
            <option value="1" ${!a||a.is_published?"selected":""}>📢 Published (Visible)</option>
            <option value="0" ${a&&!a.is_published?"selected":""}>🔒 Draft (Hidden)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Visibility Scope</label>
          <select id="qPublic" class="form-select">
            <option value="0" ${!a||!a.is_public?"selected":""}>🏫 Institute Private (Internal Students)</option>
            <option value="1" ${a&&a.is_public?"selected":""}>🌐 Global Public (All Portal Students)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Category</label>
        <select id="qCategory" class="form-select">
          <option value="">-- Select Category --</option>
          ${s.length>0?`
            <optgroup label="🌐 Global Master Categories (For Public & Private Quizzes)">
              ${s.map(o=>`<option value="${o.id}" data-type="global" ${a&&a.category_id===o.id?"selected":""}>${o.icon||"📂"} ${o.name}</option>`).join("")}
            </optgroup>
          `:""}
          ${e.length>0?`
            <optgroup label="🏫 Institute Private Categories (Private Quizzes Only)" id="optgroup-private-cats">
              ${e.map(o=>`<option value="${o.id}" data-type="private" ${a&&a.category_id===o.id?"selected":""}>${o.icon||"📂"} ${o.name}</option>`).join("")}
            </optgroup>
          `:""}
        </select>
        <div id="qCatHint" style="font-size:0.8rem; color:var(--danger); font-weight:600; margin-top:4px; display:none;">
          ⚠️ Global public quizzes require selecting a standardized Global Master Category (created by Super Admin). Private categories are disabled.
        </div>
      </div>

      <!-- Batch Target Assignment -->
      ${u.length>0?`
        <div class="form-group">
          <label>Target Student Batches / Classes</label>
          <div style="margin-bottom:8px;">
            <label style="font-size:0.85rem; font-weight:700; display:flex; align-items:center; gap:6px; cursor:pointer;">
              <input type="checkbox" id="qAllBatches" ${!a||a.is_all_batches?"checked":""} />
              <span>Make Available to All Batches</span>
            </label>
          </div>

          <div id="batchListContainer" style="display:${a&&!a.is_all_batches?"flex":"none"}; gap:8px; flex-wrap:wrap; background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; max-height:100px; overflow-y:auto;">
            ${u.map(o=>`
              <label style="font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:4px; cursor:pointer;">
                <input type="checkbox" class="batch-checkbox" value="${o.id}" ${m.includes(o.id)?"checked":""} />
                ${o.name} (${o.code||"Batch"})
              </label>
            `).join("")}
          </div>
        </div>
      `:""}

      <div class="form-group">
        <label>Assign Tags</label>
        <div style="display:flex; gap:10px; flex-wrap:wrap; background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; max-height:100px; overflow-y:auto;">
          ${g.map(o=>`
            <label style="font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" class="tag-checkbox" value="${o.id}" ${y.includes(o.name)?"checked":""} />
              ${o.name}
            </label>
          `).join("")}
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:12px; font-weight:700;">${a?"Update Quiz":"Create Quiz"}</button>
    `;const c=U({title:a?"✏️ Edit Quiz Details":"➕ Create New Quiz",content:n}),b=n.querySelector("#qPublic"),S=n.querySelector("#qCategory"),E=n.querySelector("#qCatHint"),C=n.querySelector("#optgroup-private-cats");function q(){const o=b&&b.value==="1";if(C){const $=C.querySelectorAll("option");o?(C.style.display="none",$.forEach(Q=>{Q.disabled=!0}),d.has(S.value)&&(S.value=""),E&&(E.style.display="block")):(C.style.display="",$.forEach(Q=>{Q.disabled=!1}),E&&(E.style.display="none"))}}b&&(b.addEventListener("change",q),q());const L=n.querySelector("#qAllBatches"),T=n.querySelector("#batchListContainer");L&&T&&L.addEventListener("change",()=>{T.style.display=L.checked?"none":"flex"}),n.addEventListener("submit",async o=>{o.preventDefault();const $=b?b.value==="1":!1,Q=S.value;if($&&Q&&d.has(Q)){alert("To publish a quiz globally, you must select a Global Master Category (created by Super Admin). Private categories cannot be used for global quizzes.");return}const j=Array.from(n.querySelectorAll(".tag-checkbox:checked")).map(_=>parseInt(_.value,10)),O=Array.from(n.querySelectorAll(".batch-checkbox:checked")).map(_=>parseInt(_.value,10)),D=L?L.checked:!0,B={title:n.querySelector("#qTitle").value.trim(),description:n.querySelector("#qDesc").value.trim(),category_id:Q||null,is_published:n.querySelector("#qPublished").value==="1",is_public:$,is_all_batches:D,batch_ids:O,tag_ids:j};try{a?await z.updateQuiz(a.id,B):await z.createQuiz(B),c.close(),p()}catch(_){alert(_.message||"Error saving quiz")}})}async function h(a,k){t.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:12px;">
        <div>
          <button class="btn btn-sm btn-secondary" id="backQuizzesBtn" style="font-weight:600;" title="Back to All Quizzes" aria-label="Back to All Quizzes">
            <i class="ri-arrow-left-line"></i> <span class="btn-text-desktop">Back to All Quizzes</span>
          </button>
          <h3 style="font-size:1.3rem; font-weight:700; margin-top:8px;">Questions for: "${k}"</h3>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-outline" id="bulkImportQuizBtn" style="font-weight:700;" title="Bulk Import Quiz Questions" aria-label="Bulk Import Quiz Questions">
            <i class="ri-file-upload-line"></i> <span class="btn-text-desktop">Bulk Import Quiz Questions</span>
          </button>
          <button class="btn btn-primary" id="addQuestionBtn" style="font-weight:700;" title="Add New Question" aria-label="Add New Question">
            <i class="ri-add-line"></i> <span class="btn-text-desktop">Add New Question</span>
          </button>
        </div>
      </div>
      
      <div id="newQuestionEditorContainer" style="display:none; margin-bottom:20px;"></div>
      <div id="questionsList"></div>
    `,t.querySelector("#backQuizzesBtn").addEventListener("click",()=>p()),t.querySelector("#bulkImportQuizBtn").addEventListener("click",async()=>{const{renderQuizBulkUploadModal:m}=await G(async()=>{const{renderQuizBulkUploadModal:s}=await Promise.resolve().then(()=>W);return{renderQuizBulkUploadModal:s}},void 0);m(a,()=>g())});const i=t.querySelector("#newQuestionEditorContainer"),r=t.querySelector("#questionsList");let l=null;async function g(){try{const s=(await z.getQuestions(a)).questions||[];if(r.innerHTML="",i.style.display="none",i.innerHTML="",l=null,s.length===0){r.innerHTML='<div style="padding:30px; text-align:center; color:var(--text-muted); background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-md);">No questions in this practice quiz yet. Click "+ Add New Question" or use "Bulk Import".</div>';return}s.forEach((e,d)=>{const n=document.createElement("div");n.className="question-card-wrapper",n.style.marginBottom="14px";const c=document.createElement("div");c.className="card question-item-card",c.dataset.id=e.id,c.innerHTML=`
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
              <h4 style="font-size:1rem; font-weight:700;" class="katex-render">Q${d+1}: ${e.question_text}</h4>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm btn-secondary edit-q-btn" style="font-weight:600;">
                  <i class="ri-edit-line"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger delete-q-btn" style="font-weight:600;">
                  <i class="ri-delete-bin-line"></i> Delete
                </button>
              </div>
            </div>
            <div style="margin-top:10px; font-size:0.88rem; color:var(--text-muted);">
              Options: ${e.options?e.options.join(" | "):""} (Correct: Option ${e.correct_answer_index+1})
            </div>
          `;const b=document.createElement("div");b.className="inline-editor-slot",b.style.display="none",b.style.marginTop="12px",n.appendChild(c),n.appendChild(b),c.querySelector(".edit-q-btn").addEventListener("click",()=>{u(e,n,b)}),c.querySelector(".delete-q-btn").addEventListener("click",async()=>{if(confirm("Delete this question?"))try{await z.deleteQuestion(e.id),g()}catch(S){alert(S.message||"Error deleting question")}}),r.appendChild(n)}),P(r)}catch(m){r.innerHTML=`<div style="color:var(--danger); padding:20px;">Error loading questions: ${m.message}</div>`}}function u(m,s,e){if(l&&l!==e&&(l.style.display="none",l.innerHTML=""),i.style.display="none",i.innerHTML="",e.style.display==="block"){e.style.display="none",e.innerHTML="",l=null;return}e.innerHTML="",e.style.display="block",l=e;const d=I({initialQuestion:m,onSave:async n=>{try{await z.updateQuestion(m.id,n),e.style.display="none",e.innerHTML="",l=null,await g()}catch(c){alert(c.message)}},onCancel:()=>{e.style.display="none",e.innerHTML="",l=null}});e.appendChild(d),setTimeout(()=>{s.scrollIntoView({behavior:"smooth",block:"center"})},50)}function y(){if(l&&(l.style.display="none",l.innerHTML="",l=null),i.style.display==="block"){i.style.display="none",i.innerHTML="";return}i.innerHTML="",i.style.display="block";const m=I({initialQuestion:null,onSave:async s=>{try{await z.addQuestion(a,s),i.style.display="none",i.innerHTML="",await g()}catch(e){alert(e.message)}},onCancel:()=>{i.style.display="none",i.innerHTML=""}});i.appendChild(m),setTimeout(()=>{i.scrollIntoView({behavior:"smooth",block:"nearest"})},50)}t.querySelector("#addQuestionBtn").addEventListener("click",()=>y()),g()}return p(),w}export{Y as renderAdminDashboard};
