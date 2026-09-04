import{r as z}from"./index--RLdyeHQ.js";import{renderMath as Se}from"./katexRenderer-OjKm2_7m.js";import{n as G}from"./csvJsonParser-BYEbs1eI.js";import{s as ke,h as ce}from"./LoadingOverlayModal-CS1Ac5fD.js";function Ce(e,I={}){const b=document.createElement("div");b.className="view-container fade-in";const T=I.questionId||null,f=I.returnView||"exam-questions";return b.innerHTML=`
    <!-- Top Action Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:14px; background:var(--card-bg); padding:16px 24px; border-radius:var(--radius-md); border:1px solid var(--border-color); box-shadow:var(--shadow-sm);">
      <div style="display:flex; align-items:center; gap:12px;">
        <button id="btn-editor-back" class="btn btn-outline" style="font-size:0.9rem; padding:8px 14px; display:inline-flex; align-items:center; gap:6px;">
          <i class="ri-arrow-left-line"></i> Back
        </button>
        <div>
          <h1 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-bottom:2px;" id="editor-page-title">
            ${T?"✏️ Edit Master Question":"➕ Create New Master Question"}
          </h1>
          <p style="font-size:0.85rem; color:var(--text-muted);">
            Dedicated Master Question Workspace • Dynamic 2-6 Options • Line Breaks & Deferred Image Upload
          </p>
        </div>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button id="btn-save-question" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
          <i class="ri-save-3-line"></i> Save Master Question
        </button>
        <button id="btn-save-next-question" class="btn btn-secondary" style="display:inline-flex; align-items:center; gap:6px; font-weight:700;">
          <i class="ri-add-line"></i> Save & Add Another
        </button>
      </div>
    </div>

    <!-- Main Workspace Grid (Left: Form Controls | Right: Live Preview) -->
    <div class="editor-grid-container" id="editor-main-grid">
      
      <!-- Left Column: Form Controls -->
      <div class="card" style="padding:24px;">
        <!-- Metadata Header -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label" style="font-weight:700;">Category</label>
            <select id="form-q-section" class="form-control" style="padding:10px;">
              <option value="">-- Select Category --</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight:700;">Difficulty Level</label>
            <select id="form-q-diff" class="form-control" style="padding:10px;">
              <option value="easy">Easy</option>
              <option value="medium" selected>Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:16px; background:var(--bg-color); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
          <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-weight:700; font-size:0.92rem; color:var(--text-main);">
            <input type="checkbox" id="form-q-global" style="width:18px; height:18px; cursor:pointer;" />
            🌐 Publish Globally (Make visible to all coaching institutes in Question Bank)
          </label>
        </div>

        <!-- Question Tags Input -->
        <div class="form-group" style="margin-bottom:18px; background:var(--card-bg); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
          <label class="form-label" style="font-weight:700; margin-bottom:6px; display:block;">🏷️ Question Tags (Array)</label>
          <div id="tags-chips-container" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; min-height:28px;"></div>
          <div style="display:flex; gap:8px;">
            <input type="text" id="input-new-tag" class="form-control" placeholder="Type tag and press Enter or comma (e.g. Physics, SSC CGL 2026)..." style="font-size:0.88rem; flex:1;" />
            <button type="button" id="btn-add-tag-chip" class="btn btn-outline btn-sm" style="font-weight:700;">+ Add Tag</button>
          </div>
        </div>

        <!-- Language Tabs -->
        <div style="display:flex; gap:10px; border-bottom:2px solid var(--border-color); margin-bottom:18px;">
          <button id="tab-lang-en" class="btn-text active" style="font-weight:700; padding:8px 14px; border-bottom:3px solid var(--primary);">
            🇬🇧 English Language
          </button>
          <button id="tab-lang-hi" class="btn-text" style="font-weight:700; padding:8px 14px; color:var(--text-muted);">
            🇮🇳 Hindi Language (हिंदी)
          </button>
        </div>

        <form id="form-master-q">
          <!-- Passage Controls -->
          <div style="background:var(--bg-color); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:16px;">
            <label class="form-label" style="font-weight:700; color:var(--primary); margin-bottom:8px; display:block;">
              📖 Comprehension Passage / Statement (Optional)
            </label>
            <div id="section-passage-en" class="lang-pane">
              <textarea id="form-p-text-en" class="form-control" rows="2" placeholder="Passage text in English (supports newlines \\n)..."></textarea>
            </div>
            <div id="section-passage-hi" class="lang-pane" style="display:none;">
              <textarea id="form-p-text-hi" class="form-control" rows="2" placeholder="गद्यांश पाठ (हिंदी)..."></textarea>
            </div>
            <div style="margin-top:10px;">
              <label class="form-label" style="font-size:0.8rem; font-weight:700;">Passage Image</label>
              <div id="passage-img-picker-container"></div>
            </div>
          </div>

          <!-- Question Text Controls -->
          <div id="section-lang-en" class="lang-pane">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:700;">Question Statement (English) *</label>
              <textarea id="form-q-text-en" class="form-control" rows="4" placeholder="Enter question statement (e.g. Solve $x^2 + 5x + 6 = 0$)" required></textarea>
            </div>
          </div>

          <div id="section-lang-hi" class="lang-pane" style="display:none;">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:700;">प्रश्न कथन (Hindi Question Statement)</label>
              <textarea id="form-q-text-hi" class="form-control" rows="4" placeholder="हिंदी में प्रश्न दर्ज करें..."></textarea>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-size:0.82rem; font-weight:700;">Question Main Diagram / Image</label>
            <div id="question-img-picker-container"></div>
          </div>

          <!-- Dynamic Options Section (2 to 6 Options) -->
          <div style="background:var(--bg-color); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <label class="form-label" style="font-weight:700; margin-bottom:0; color:var(--primary);">
                Options & Correct Choice Selection
              </label>
              <div style="display:flex; gap:6px;">
                <button type="button" id="btn-add-opt" class="icon-action-btn btn-primary-accent" data-tooltip="Add Option (+)" aria-label="Add Option"><i class="ri-add-line"></i></button>
                <button type="button" id="btn-rem-opt" class="icon-action-btn btn-danger" data-tooltip="Remove Option (-)" aria-label="Remove Option"><i class="ri-subtract-line"></i></button>
              </div>
            </div>

            <div id="options-list-builder" style="display:flex; flex-direction:column; gap:12px;">
              <!-- Option Rows built dynamically -->
            </div>
          </div>

          <!-- Solution Explanation -->
          <div id="explanation-pane-en" class="lang-pane">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:700;">Solution Explanation (English)</label>
              <textarea id="form-q-exp-en" class="form-control" rows="3" placeholder="Step-by-step solution details..."></textarea>
            </div>
          </div>

          <div id="explanation-pane-hi" class="lang-pane" style="display:none;">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:700;">व्याख्या / विवरण (Hindi Explanation)</label>
              <textarea id="form-q-exp-hi" class="form-control" rows="3" placeholder="चरणबद्ध समाधान विवरण..."></textarea>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-size:0.82rem; font-weight:700;">Explanation Diagram / Image</label>
            <div id="explanation-img-picker-container"></div>
          </div>
        </form>
      </div>

      <!-- Right Column: Real-time Live KaTeX & Card Preview -->
      <div class="card" style="padding:24px; position:sticky; top:84px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
          <h3 style="font-size:1.15rem; font-weight:800; color:var(--primary); display:flex; align-items:center; gap:8px;">
            <i class="ri-eye-line"></i> Live Preview (<span id="prev-lang-label">English</span>)
          </h3>
          <span class="badge-tag" id="preview-diff-badge" style="text-transform:capitalize;">Medium</span>
        </div>

        <div id="previewCard" style="background:var(--bg-color); border:1.5px solid var(--border-color); border-radius:var(--radius-lg); padding:20px;">
          <!-- Passage Preview -->
          <div id="prevPassageBox" style="display:none; background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:14px;">
            <div style="font-weight:700; font-size:0.8rem; color:var(--primary); margin-bottom:4px;">📖 Comprehension Passage</div>
            <div id="prevPassageText" style="white-space:pre-line;" class="katex-render"></div>
            <img id="prevPassageImg" style="display:none; max-width:100%; max-height:180px; margin-top:8px; border-radius:6px;" />
          </div>

          <!-- Question Statement -->
          <div id="prevQText" style="font-size:1.05rem; font-weight:700; color:var(--text-main); margin-bottom:12px; line-height:1.5; white-space:pre-line;" class="katex-render">
            Type a question in the editor to see real-time KaTeX preview...
          </div>
          <img id="prevQImg" style="display:none; max-width:100%; max-height:220px; margin-bottom:14px; border-radius:6px;" />

          <!-- Options Preview -->
          <div id="prevOptionsContainer" style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
            <!-- Dynamic Live Options -->
          </div>

          <!-- Solution Explanation -->
          <div id="prevExplanationBox" style="display:none; background:var(--primary-light); border:1px solid var(--primary-border); border-radius:var(--radius-sm); padding:12px; font-size:0.88rem; color:var(--text-main);">
            <strong>💡 Solution:</strong>
            <div id="prevExplanationText" style="white-space:pre-line; margin-top:4px;" class="katex-render"></div>
            <img id="prevExpImg" style="display:none; max-width:100%; max-height:180px; margin-top:8px; border-radius:6px;" />
          </div>
        </div>
      </div>

    </div>
  `,setTimeout(()=>{Le(b,e,T,f)},0),b}async function Le(e,I,b,T){let f="en",h=4,q=0;const v=new Map,n=new Map,ge=e.querySelector("#btn-editor-back"),me=e.querySelector("#btn-save-question"),ue=e.querySelector("#btn-save-next-question"),C=e.querySelector("#tab-lang-en"),O=e.querySelector("#tab-lang-hi"),K=e.querySelector("#section-lang-en"),ee=e.querySelector("#section-lang-hi"),te=e.querySelector("#section-passage-en"),ae=e.querySelector("#section-passage-hi"),ie=e.querySelector("#explanation-pane-en"),oe=e.querySelector("#explanation-pane-hi"),$=e.querySelector("#form-p-text-en"),B=e.querySelector("#form-p-text-hi"),R=e.querySelector("#form-q-text-en"),Q=e.querySelector("#form-q-text-hi"),A=e.querySelector("#form-q-exp-en"),D=e.querySelector("#form-q-exp-hi"),J=e.querySelector("#form-q-diff"),j=e.querySelector("#form-q-section"),W=e.querySelector("#form-q-global"),re=e.querySelector("#prev-lang-label"),ve=e.querySelector("#preview-diff-badge"),X=e.querySelector("#options-list-builder"),xe=e.querySelector("#btn-add-opt"),ye=e.querySelector("#btn-rem-opt");function F(t,l,a="",i){const r=document.createElement("div");r.className="image-picker-widget-box",r.dataset.field=t;const o=G(a);r.innerHTML=`
      <div class="img-thumb-card" style="display:${o?"flex":"none"}; align-items:center; gap:12px; background:var(--bg-color); padding:8px 12px; border-radius:8px; border:1.5px solid var(--primary-border);">
        <img class="img-thumb-preview" src="${o}" style="width:52px; height:52px; object-fit:contain; background:#ffffff; border-radius:6px; border:1px solid var(--border-color); flex-shrink:0;" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><rect width=%2218%22 height=%2218%22 x=%223%22 y=%223%22 rx=%222%22/><circle cx=%229%22 cy=%229%22 r=%222%22/><path d=%22m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21%22/></svg>';" />
        <div style="flex:1; min-width:0;">
          <div class="img-type-badge" style="font-size:0.78rem; font-weight:700; color:var(--primary);">
            ${o.startsWith("blob:")?"📁 Local File (Pending Upload)":"🌐 Image URL Attached"}
          </div>
          <div class="img-path-txt" style="font-size:0.75rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${o.startsWith("blob:")?"Selected from local disk":o}
          </div>
        </div>
        <button type="button" class="btn-remove-picker-img icon-action-btn btn-danger" data-tooltip="Remove Image" aria-label="Remove Image" title="Remove Image">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>

      <div class="img-picker-controls" style="display:${o?"none":"flex"}; gap:8px; align-items:center;">
        <input type="text" class="form-control picker-url-input" placeholder="${l||"Image URL"}" value="${o.startsWith("blob:")?"":o}" style="font-size:0.85rem; flex:1;" />
        <input type="file" class="picker-file-input" accept="image/*" style="display:none;" />
        <button type="button" class="btn-browse-file icon-action-btn" data-tooltip="Upload Local Image" title="Upload Local Image">
          <i class="ri-image-add-line"></i>
        </button>
      </div>
    `;const s=r.querySelector(".img-thumb-card"),g=r.querySelector(".img-thumb-preview"),x=r.querySelector(".img-type-badge"),y=r.querySelector(".img-path-txt"),L=r.querySelector(".btn-remove-picker-img"),m=r.querySelector(".img-picker-controls"),S=r.querySelector(".picker-url-input"),k=r.querySelector(".picker-file-input");return r.querySelector(".btn-browse-file").addEventListener("click",()=>k.click()),k.addEventListener("change",()=>{if(k.files[0]){const d=k.files[0];n.has(t)&&URL.revokeObjectURL(n.get(t));const u=URL.createObjectURL(d);n.set(t,u),v.set(t,d),g.src=u,x.textContent="📁 Local File (Pending Upload)",y.textContent=d.name+` (${(d.size/1024).toFixed(1)} KB)`,s.style.display="flex",m.style.display="none",i&&i(u)}}),S.addEventListener("input",()=>{const d=S.value.trim();d&&(n.has(t)&&(URL.revokeObjectURL(n.get(t)),n.delete(t)),v.delete(t),g.src=d,x.textContent="🌐 Image URL Attached",y.textContent=d,s.style.display="flex",m.style.display="none"),i&&i(d)}),L.addEventListener("click",d=>{d.preventDefault(),n.has(t)&&(URL.revokeObjectURL(n.get(t)),n.delete(t)),v.delete(t),k.value="",S.value="",s.style.display="none",m.style.display="flex",i&&i("")}),r.getValue=()=>v.has(t)&&n.has(t)?n.get(t):S.value.trim(),r.setValue=d=>{const u=G(d);u?u.startsWith("blob:")?(g.src=u,x.textContent="📁 Local File (Pending Upload)",y.textContent="Selected from local disk",s.style.display="flex",m.style.display="none"):(n.has(t)&&(URL.revokeObjectURL(n.get(t)),n.delete(t)),v.delete(t),S.value=u,g.src=u,x.textContent="🌐 Image URL Attached",y.textContent=u,s.style.display="flex",m.style.display="none"):(n.has(t)&&(URL.revokeObjectURL(n.get(t)),n.delete(t)),v.delete(t),k.value="",S.value="",s.style.display="none",m.style.display="flex")},r}const be=e.querySelector("#passage-img-picker-container"),M=F("passage","Passage Image URL (Optional)","",()=>c());be.appendChild(M);const fe=e.querySelector("#question-img-picker-container"),P=F("question","Question Image URL (Optional)","",()=>c());fe.appendChild(P);const he=e.querySelector("#explanation-img-picker-container"),U=F("explanation","Explanation Image URL (Optional)","",()=>c());he.appendChild(U);let _=[];function H(t=[],l=[],a=[]){X.innerHTML="",_=[];for(let i=0;i<h;i++){const r=String.fromCharCode(65+i),o=document.createElement("div");o.style.cssText="background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:8px;",o.innerHTML=`
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="radio" name="correct_opt_idx" value="${i}" ${q===i?"checked":""} style="width:18px; height:18px; cursor:pointer;" />
          <span style="font-weight:800; min-width:80px; font-size:0.9rem; color:var(--text-main);">Option ${r}:</span>
          <input type="text" class="form-control opt-en-input" data-idx="${i}" value="${t[i]||""}" placeholder="Option ${r} text in English" style="padding:6px 10px; flex:1;" />
          <input type="text" class="form-control opt-hi-input" data-idx="${i}" value="${l[i]||""}" placeholder="हिंदी विकल्प ${r}" style="padding:6px 10px; flex:1;" />
        </div>
        <div class="opt-img-picker-slot" style="margin-left:110px;"></div>
      `;const s=o.querySelector(".opt-img-picker-slot"),g=F(`option_${i}`,`Option ${r} Image URL (Optional)`,a[i]||"",()=>c());s.appendChild(g),_.push(g),X.appendChild(o)}X.querySelectorAll("input").forEach(i=>{i.addEventListener("input",c),i.addEventListener("change",c)})}xe.addEventListener("click",()=>{if(h<6){h++;const t=Array.from(e.querySelectorAll(".opt-en-input")).map(i=>i.value),l=Array.from(e.querySelectorAll(".opt-hi-input")).map(i=>i.value),a=_.map(i=>i.getValue());H(t,l,a),c()}else alert("Maximum 6 options allowed per question.")}),ye.addEventListener("click",()=>{if(h>2){h--,q>=h&&(q=0);const t=Array.from(e.querySelectorAll(".opt-en-input")).map(i=>i.value),l=Array.from(e.querySelectorAll(".opt-hi-input")).map(i=>i.value),a=_.map(i=>i.getValue());H(t,l,a),c()}else alert("Minimum 2 options required per question.")}),C.addEventListener("click",()=>{f="en",C.classList.add("active"),O.classList.remove("active"),C.style.borderBottom="3px solid var(--primary)",O.style.borderBottom="none",K.style.display="block",ee.style.display="none",te.style.display="block",ae.style.display="none",ie.style.display="block",oe.style.display="none",re.textContent="English",c()}),O.addEventListener("click",()=>{f="hi",O.classList.add("active"),C.classList.remove("active"),O.style.borderBottom="3px solid var(--accent)",C.style.borderBottom="none",ee.style.display="block",K.style.display="none",ae.style.display="block",te.style.display="none",oe.style.display="block",ie.style.display="none",re.textContent="Hindi (हिंदी)",c()}),ge.addEventListener("click",()=>I(T));try{const l=(await z("/categories").catch(()=>({flatCategories:[]}))).flatCategories||[],a=l.filter(o=>!o.institute_id||o.is_global),i=l.filter(o=>o.institute_id&&!o.is_global);let r='<option value="">-- Select Category --</option>';a.length>0&&(r+='<optgroup label="🌐 Global Master Categories">'+a.map(o=>`<option value="${o.id}">${o.icon||"📂"} ${o.name}</option>`).join("")+"</optgroup>"),i.length>0&&(r+='<optgroup label="🏫 Institute Private Categories">'+i.map(o=>`<option value="${o.id}">${o.icon||"📂"} ${o.name}</option>`).join("")+"</optgroup>"),j.innerHTML=r}catch(t){console.warn("Could not load categories:",t)}function c(){ve.textContent=J.value||"Medium";const t=f==="hi"&&B.value||$.value,l=M.getValue(),a=e.querySelector("#prevPassageBox"),i=e.querySelector("#prevPassageText"),r=e.querySelector("#prevPassageImg");t.trim()||l?(a.style.display="block",i.innerHTML=t,l?(r.src=l,r.style.display="block"):r.style.display="none"):a.style.display="none";const o=f==="hi"&&Q.value||R.value,s=e.querySelector("#prevQText"),g=e.querySelector("#prevQImg");s.innerHTML=o||`Type a question statement in ${f==="hi"?"Hindi":"English"}...`;const x=P.getValue();x?(g.src=x,g.style.display="block"):g.style.display="none";const y=e.querySelector("#prevOptionsContainer");y.innerHTML="",e.querySelectorAll('input[name="correct_opt_idx"]').forEach(p=>{p.checked&&(q=parseInt(p.value,10))});const m=Array.from(e.querySelectorAll(".opt-en-input")).map(p=>p.value),S=Array.from(e.querySelectorAll(".opt-hi-input")).map(p=>p.value),k=_.map(p=>p.getValue());for(let p=0;p<h;p++){const E=p===q,qe=f==="hi"&&S[p]||m[p],de=k[p]||"",N=document.createElement("div");N.className=`option-btn ${E?"selected":""}`,N.style.cssText=`padding: 10px 14px; border: 2px solid ${E?"var(--primary)":"var(--border-color)"}; background: ${E?"var(--primary-light)":"var(--card-bg)"}; border-radius: var(--radius-md); font-weight: 600; display:flex; flex-direction:column; gap:6px;`,N.innerHTML=`
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="width:24px; height:24px; border-radius:50%; background:${E?"var(--primary)":"var(--border-color)"}; color:${E?"#fff":"var(--text-main)"}; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:800;">${String.fromCharCode(65+p)}</span>
          <span style="white-space:pre-line;" class="katex-render">${qe||`Option ${String.fromCharCode(65+p)}`}</span>
          ${E?'<span style="color:var(--success); font-weight:bold; font-size:1.1rem; margin-left:auto;">✓</span>':""}
        </div>
        ${de?`<img src="${de}" style="max-width:100%; max-height:140px; border-radius:4px; margin-top:4px;" onerror="this.style.display='none'" />`:""}
      `,y.appendChild(N)}const Y=f==="hi"&&D.value||A.value,d=U.getValue(),u=e.querySelector("#prevExplanationBox"),we=e.querySelector("#prevExplanationText"),Z=e.querySelector("#prevExpImg");Y.trim()||d?(u.style.display="block",we.innerHTML=Y,d?(Z.src=d,Z.style.display="block"):Z.style.display="none"):u.style.display="none",Se(e.querySelector("#previewCard"))}e.addEventListener("input",c),e.addEventListener("change",c);let w=[];function V(){const t=e.querySelector("#tags-chips-container");if(t){if(w.length===0){t.innerHTML='<span style="font-size:0.82rem; color:var(--text-muted); font-style:italic;">No tags added yet. Add as many tags as needed.</span>';return}t.innerHTML=w.map((l,a)=>`
      <span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color); font-weight:700; padding:4px 10px; display:inline-flex; align-items:center; gap:6px;">
        🏷️ ${l}
        <button type="button" class="btn-remove-tag-chip" data-idx="${a}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-weight:bold; font-size:1.1rem; padding:0; line-height:1;" aria-label="Remove Tag">&times;</button>
      </span>
    `).join(""),t.querySelectorAll(".btn-remove-tag-chip").forEach(l=>{l.addEventListener("click",a=>{a.preventDefault();const i=parseInt(l.dataset.idx,10);w.splice(i,1),V()})})}}function se(){const t=e.querySelector("#input-new-tag");if(!t)return;const l=t.value.trim();if(!l)return;l.split(",").map(i=>i.trim()).filter(Boolean).forEach(i=>{w.includes(i)||w.push(i)}),t.value="",V()}const le=e.querySelector("#btn-add-tag-chip"),ne=e.querySelector("#input-new-tag");if(le&&le.addEventListener("click",se),ne&&ne.addEventListener("keydown",t=>{(t.key==="Enter"||t.key===",")&&(t.preventDefault(),se())}),V(),H(),b)try{const a=((await z("/exams/questions/all")).questions||[]).find(i=>i.id==b);if(a){R.value=a.question_text_en||a.question_text||"",Q.value=a.question_text_hi||"",A.value=a.explanation_en||a.explanation||"",D.value=a.explanation_hi||"",J.value=a.difficulty||"medium",a.category_id&&(j.value=a.category_id),W&&(W.checked=!!a.is_global),a.passage_text_en&&($.value=a.passage_text_en),a.passage_text_hi&&(B.value=a.passage_text_hi),a.passage_image_url&&M.setValue(a.passage_image_url),a.image_url&&P.setValue(a.image_url),a.explanation_image_url&&U.setValue(a.explanation_image_url),Array.isArray(a.tags)&&a.tags.length>0?w=[...a.tags]:a.tag_names&&(w=a.tag_names.split(",").map(s=>s.trim()).filter(Boolean)),V();const i=a.options_en||a.options||[],r=a.options_hi||[],o=(a.options_images||[]).map(G);h=Math.max(2,Math.min(6,i.length||4)),q=a.correct_option_index!==void 0?a.correct_option_index:a.correct_answer_index||0,H(i,r,o),c()}}catch(t){console.error("Failed loading question details:",t)}else c();async function pe(t=!1){const l=R.value.trim();if(!l){alert("Question Statement in English is required.");return}const a=Array.from(e.querySelectorAll(".opt-en-input")).map(s=>s.value.trim()),i=Array.from(e.querySelectorAll(".opt-hi-input")).map(s=>s.value.trim()),r=_.map(s=>s.getValue()),o={category_id:j.value?parseInt(j.value,10):null,difficulty:J.value,passage_text_en:$.value.trim(),passage_text_hi:B.value.trim(),passage_image_url:M.getValue(),question_text_en:l,question_text_hi:Q.value.trim(),image_url:P.getValue(),options_en:a,options_hi:i,options_images:r,correct_option_index:q,explanation_en:A.value.trim(),explanation_hi:D.value.trim(),explanation_image_url:U.getValue(),is_global:W?W.checked:!1,tags:w};if(v.size>0){ke("Uploading Image Assets...",`Uploading ${v.size} image asset(s) to server...`);try{for(const[s,g]of v.entries()){const x=new FormData;x.append("image",g);const y=await z("/images/upload",{method:"POST",body:x}),L=G(y.imageUrl||y.fullUrl);if(s==="passage")o.passage_image_url=L;else if(s==="question")o.image_url=L;else if(s==="explanation")o.explanation_image_url=L;else if(s.startsWith("option_")){const m=parseInt(s.replace("option_",""),10);!isNaN(m)&&m<o.options_images.length&&(o.options_images[m]=L)}}}catch(s){ce(),alert("Failed to upload image assets: "+s.message);return}finally{ce()}}try{b?await z(`/exams/questions/${b}`,{method:"PUT",body:JSON.stringify(o)}):await z("/exams/questions",{method:"POST",body:JSON.stringify(o)}),n.forEach(s=>URL.revokeObjectURL(s)),n.clear(),v.clear(),t?(alert("Master question saved successfully!"),R.value="",Q.value="",A.value="",D.value="",$.value="",B.value="",M.setValue(""),P.setValue(""),U.setValue(""),w=[],V(),h=4,q=0,H(),c()):I(T)}catch(s){alert(s.message||"Error saving master question.")}}me.addEventListener("click",()=>pe(!1)),ue.addEventListener("click",()=>pe(!0))}export{Ce as renderMasterQuestionEditorView};
