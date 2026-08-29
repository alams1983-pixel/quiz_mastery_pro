import{r as v,d as de}from"./index-w1j3NIg4.js";import{n as f}from"./csvJsonParser-Cmc2jVv8.js";function ye(e,b={}){const d=document.createElement("div");d.className="view-container fade-in";const h=b.questionId||null,c=b.returnView||"exam-questions";return d.innerHTML=`
    <!-- Top Action Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:14px; background:var(--card-bg); padding:16px 24px; border-radius:var(--radius-md); border:1px solid var(--border-color); box-shadow:var(--shadow-sm);">
      <div style="display:flex; align-items:center; gap:12px;">
        <button id="btn-editor-back" class="btn btn-outline" style="font-size:0.9rem; padding:8px 14px; display:inline-flex; align-items:center; gap:6px;">
          <i class="ri-arrow-left-line"></i> Back
        </button>
        <div>
          <h1 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-bottom:2px;" id="editor-page-title">
            ${h?"✏️ Edit Master Question":"➕ Create New Master Question"}
          </h1>
          <p style="font-size:0.85rem; color:var(--text-muted);">
            Dedicated Master Question Workspace • Dynamic 2-6 Options • Line Breaks & Images
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
            <div style="margin-top:8px;">
              <label class="form-label" style="font-size:0.8rem;">Passage Image</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="text" id="form-p-img-url" class="form-control" placeholder="Passage Image URL" style="font-size:0.85rem;" />
                <input type="file" id="form-p-img-file" accept="image/*" style="display:none;" />
                <button type="button" id="btn-upload-p-img" class="icon-action-btn" data-tooltip="Upload Passage Image" aria-label="Upload Passage Image"><i class="ri-image-add-line"></i></button>
              </div>
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
            <label class="form-label" style="font-size:0.82rem; font-weight:700;">Question Main Image</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="form-q-img-url" class="form-control" placeholder="Question Image URL" style="font-size:0.85rem;" />
              <input type="file" id="form-q-img-file" accept="image/*" style="display:none;" />
              <button type="button" id="btn-upload-q-img" class="icon-action-btn" data-tooltip="Upload Question Image" aria-label="Upload Question Image"><i class="ri-image-add-line"></i></button>
            </div>
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
            <label class="form-label" style="font-size:0.82rem; font-weight:700;">Explanation Diagram</label>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="text" id="form-exp-img-url" class="form-control" placeholder="Explanation Image URL" style="font-size:0.85rem;" />
              <input type="file" id="form-exp-img-file" accept="image/*" style="display:none;" />
              <button type="button" id="btn-upload-exp-img" class="icon-action-btn" data-tooltip="Upload Explanation Image" aria-label="Upload Explanation Image"><i class="ri-image-add-line"></i></button>
            </div>
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
  `,setTimeout(()=>{ce(d,e,h,c)},0),d}async function ce(e,b,d,h){let c="en",m=4,u=0;const ee=e.querySelector("#btn-editor-back"),te=e.querySelector("#btn-save-question"),ie=e.querySelector("#btn-save-next-question"),q=e.querySelector("#tab-lang-en"),S=e.querySelector("#tab-lang-hi"),R=e.querySelector("#section-lang-en"),V=e.querySelector("#section-lang-hi"),j=e.querySelector("#section-passage-en"),N=e.querySelector("#section-passage-hi"),F=e.querySelector("#explanation-pane-en"),G=e.querySelector("#explanation-pane-hi"),w=e.querySelector("#form-p-text-en"),I=e.querySelector("#form-p-text-hi"),O=e.querySelector("#form-p-img-url"),_=e.querySelector("#form-q-text-en"),T=e.querySelector("#form-q-text-hi"),C=e.querySelector("#form-q-img-url"),E=e.querySelector("#form-q-exp-en"),$=e.querySelector("#form-q-exp-hi"),A=e.querySelector("#form-exp-img-url"),Q=e.querySelector("#form-q-diff"),P=e.querySelector("#form-q-section"),M=e.querySelector("#form-q-global"),J=e.querySelector("#prev-lang-label"),ae=e.querySelector("#preview-diff-badge"),U=e.querySelector("#options-list-builder"),oe=e.querySelector("#btn-add-opt"),le=e.querySelector("#btn-rem-opt");function k(o=[],n=[],t=[]){U.innerHTML="";for(let i=0;i<m;i++){const l=String.fromCharCode(65+i),a=document.createElement("div");a.style.cssText="background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:8px;",a.innerHTML=`
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="radio" name="correct_opt_idx" value="${i}" ${u===i?"checked":""} style="width:18px; height:18px; cursor:pointer;" />
          <span style="font-weight:800; min-width:80px; font-size:0.9rem; color:var(--text-main);">Option ${l}:</span>
          <input type="text" class="form-control opt-en-input" data-idx="${i}" value="${o[i]||""}" placeholder="Option ${l} text in English" style="padding:6px 10px; flex:1;" />
          <input type="text" class="form-control opt-hi-input" data-idx="${i}" value="${n[i]||""}" placeholder="हिंदी विकल्प ${l}" style="padding:6px 10px; flex:1;" />
        </div>
        <div style="display:flex; gap:8px; align-items:center; margin-left:110px;">
          <input type="text" class="form-control opt-img-input" data-idx="${i}" value="${t[i]||""}" placeholder="Option ${l} Image URL (Optional)" style="font-size:0.8rem; padding:4px 8px; flex:1;" />
          <input type="file" class="opt-img-file" data-idx="${i}" accept="image/*" style="display:none;" />
          <button type="button" class="icon-action-btn btn-upload-opt-img" data-idx="${i}" data-tooltip="Upload Option ${l} Image" aria-label="Upload Option Image"><i class="ri-image-add-line"></i></button>
        </div>
      `;const r=a.querySelector(".opt-img-file"),g=a.querySelector(".opt-img-input");a.querySelector(".btn-upload-opt-img").addEventListener("click",()=>r.click()),r.addEventListener("change",async()=>{if(r.files[0])try{const y=new FormData;y.append("image",r.files[0]);const L=await v("/images/upload",{method:"POST",body:y});g.value=f(L.imageUrl||L.fullUrl),p()}catch(y){alert("Image upload failed: "+y.message)}}),U.appendChild(a)}U.querySelectorAll("input").forEach(i=>{i.addEventListener("input",p),i.addEventListener("change",p)})}oe.addEventListener("click",()=>{m<6?(m++,k(Array.from(e.querySelectorAll(".opt-en-input")).map(o=>o.value),Array.from(e.querySelectorAll(".opt-hi-input")).map(o=>o.value),Array.from(e.querySelectorAll(".opt-img-input")).map(o=>o.value)),p()):alert("Maximum 6 options allowed per question.")}),le.addEventListener("click",()=>{m>2?(m--,u>=m&&(u=0),k(Array.from(e.querySelectorAll(".opt-en-input")).map(o=>o.value),Array.from(e.querySelectorAll(".opt-hi-input")).map(o=>o.value),Array.from(e.querySelectorAll(".opt-img-input")).map(o=>o.value)),p()):alert("Minimum 2 options required per question.")});function z(o,n,t){const i=e.querySelector(o),l=e.querySelector(n),a=e.querySelector(t);i&&l&&a&&(i.addEventListener("click",()=>l.click()),l.addEventListener("change",async()=>{if(l.files[0])try{const r=new FormData;r.append("image",l.files[0]);const g=await v("/images/upload",{method:"POST",body:r});a.value=f(g.imageUrl||g.fullUrl),p()}catch(r){alert("Image upload failed: "+r.message)}}))}z("#btn-upload-p-img","#form-p-img-file","#form-p-img-url"),z("#btn-upload-q-img","#form-q-img-file","#form-q-img-url"),z("#btn-upload-exp-img","#form-exp-img-file","#form-exp-img-url"),q.addEventListener("click",()=>{c="en",q.classList.add("active"),S.classList.remove("active"),q.style.borderBottom="3px solid var(--primary)",S.style.borderBottom="none",R.style.display="block",V.style.display="none",j.style.display="block",N.style.display="none",F.style.display="block",G.style.display="none",J.textContent="English",p()}),S.addEventListener("click",()=>{c="hi",S.classList.add("active"),q.classList.remove("active"),S.style.borderBottom="3px solid var(--accent)",q.style.borderBottom="none",V.style.display="block",R.style.display="none",N.style.display="block",j.style.display="none",G.style.display="block",F.style.display="none",J.textContent="Hindi (हिंदी)",p()}),ee.addEventListener("click",()=>b(h));try{const n=(await v("/categories").catch(()=>({flatCategories:[]}))).flatCategories||[],t=n.filter(a=>!a.institute_id||a.is_global),i=n.filter(a=>a.institute_id&&!a.is_global);let l='<option value="">-- Select Category --</option>';t.length>0&&(l+='<optgroup label="🌐 Global Master Categories">'+t.map(a=>`<option value="${a.id}">${a.icon||"📂"} ${a.name}</option>`).join("")+"</optgroup>"),i.length>0&&(l+='<optgroup label="🏫 Institute Private Categories">'+i.map(a=>`<option value="${a.id}">${a.icon||"📂"} ${a.name}</option>`).join("")+"</optgroup>"),P.innerHTML=l}catch(o){console.warn("Could not load categories:",o)}function p(){ae.textContent=Q.value||"Medium";const o=c==="hi"&&I.value||w.value,n=O.value.trim(),t=e.querySelector("#prevPassageBox"),i=e.querySelector("#prevPassageText"),l=e.querySelector("#prevPassageImg");o.trim()||n?(t.style.display="block",i.innerHTML=o,n?(l.src=n,l.style.display="block"):l.style.display="none"):t.style.display="none";const a=c==="hi"&&T.value||_.value,r=e.querySelector("#prevQText"),g=e.querySelector("#prevQImg");r.innerHTML=a||`Type a question statement in ${c==="hi"?"Hindi":"English"}...`;const y=C.value.trim();y?(g.src=y,g.style.display="block"):g.style.display="none";const L=e.querySelector("#prevOptionsContainer");L.innerHTML="",e.querySelectorAll('input[name="correct_opt_idx"]').forEach(s=>{s.checked&&(u=parseInt(s.value,10))});const W=Array.from(e.querySelectorAll(".opt-en-input")).map(s=>s.value),re=Array.from(e.querySelectorAll(".opt-hi-input")).map(s=>s.value),se=Array.from(e.querySelectorAll(".opt-img-input")).map(s=>s.value);for(let s=0;s<m;s++){const x=s===u,pe=c==="hi"&&re[s]||W[s],Z=se[s]||"",H=document.createElement("div");H.className=`option-btn ${x?"selected":""}`,H.style.cssText=`padding: 10px 14px; border: 2px solid ${x?"var(--primary)":"var(--border-color)"}; background: ${x?"var(--primary-light)":"var(--card-bg)"}; border-radius: var(--radius-md); font-weight: 600; display:flex; flex-direction:column; gap:6px;`,H.innerHTML=`
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="width:24px; height:24px; border-radius:50%; background:${x?"var(--primary)":"var(--border-color)"}; color:${x?"#fff":"var(--text-main)"}; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:800;">${String.fromCharCode(65+s)}</span>
          <span style="white-space:pre-line;" class="katex-render">${pe||`Option ${String.fromCharCode(65+s)}`}</span>
          ${x?'<span style="color:var(--success); font-weight:bold; font-size:1.1rem; margin-left:auto;">✓</span>':""}
        </div>
        ${Z?`<img src="${Z}" style="max-width:100%; max-height:140px; border-radius:4px; margin-top:4px;" onerror="this.style.display='none'" />`:""}
      `,L.appendChild(H)}const X=c==="hi"&&$.value||E.value,B=A.value.trim(),Y=e.querySelector("#prevExplanationBox"),ne=e.querySelector("#prevExplanationText"),D=e.querySelector("#prevExpImg");X.trim()||B?(Y.style.display="block",ne.innerHTML=X,B?(D.src=B,D.style.display="block"):D.style.display="none"):Y.style.display="none",de(e.querySelector("#previewCard"))}if(e.addEventListener("input",p),e.addEventListener("change",p),k(),d)try{const t=((await v("/exams/questions/all")).questions||[]).find(i=>i.id==d);if(t){_.value=t.question_text_en||t.question_text||"",T.value=t.question_text_hi||"",E.value=t.explanation_en||t.explanation||"",$.value=t.explanation_hi||"",Q.value=t.difficulty||"medium",t.category_id&&(P.value=t.category_id),M&&(M.checked=!!t.is_global),t.passage_text_en&&(w.value=t.passage_text_en),t.passage_text_hi&&(I.value=t.passage_text_hi),t.passage_image_url&&(O.value=f(t.passage_image_url)),t.image_url&&(C.value=f(t.image_url)),t.explanation_image_url&&(A.value=f(t.explanation_image_url));const i=t.options_en||t.options||[],l=t.options_hi||[],a=(t.options_images||[]).map(f);m=Math.max(2,Math.min(6,i.length||4)),u=t.correct_option_index!==void 0?t.correct_option_index:t.correct_answer_index||0,k(i,l,a),p()}}catch(o){console.error("Failed loading question details:",o)}else p();async function K(o=!1){const n=_.value.trim();if(!n){alert("Question Statement in English is required.");return}const t=Array.from(e.querySelectorAll(".opt-en-input")).map(r=>r.value.trim()),i=Array.from(e.querySelectorAll(".opt-hi-input")).map(r=>r.value.trim()),l=Array.from(e.querySelectorAll(".opt-img-input")).map(r=>r.value.trim()),a={category_id:P.value?parseInt(P.value,10):null,difficulty:Q.value,passage_text_en:w.value.trim(),passage_text_hi:I.value.trim(),passage_image_url:O.value.trim(),question_text_en:n,question_text_hi:T.value.trim(),image_url:C.value.trim(),options_en:t,options_hi:i,options_images:l,correct_option_index:u,explanation_en:E.value.trim(),explanation_hi:$.value.trim(),explanation_image_url:A.value.trim(),is_global:M?M.checked:!1};try{d?await v(`/exams/questions/${d}`,{method:"PUT",body:JSON.stringify(a)}):await v("/exams/questions",{method:"POST",body:JSON.stringify(a)}),o?(alert("Master question saved successfully!"),_.value="",T.value="",E.value="",$.value="",w.value="",I.value="",O.value="",C.value="",A.value="",m=4,u=0,k(),p()):b(h)}catch(r){alert(r.message||"Error saving master question.")}}te.addEventListener("click",()=>K(!1)),ie.addEventListener("click",()=>K(!0))}export{ye as renderMasterQuestionEditorView};
