import{r as f,a as ye}from"./index-CmO4Cwr9.js";import{n as b}from"./csvJsonParser-Cmc2jVv8.js";function he(e,h={}){const d=document.createElement("div");d.className="view-container fade-in";const q=h.questionId||null,c=h.returnView||"exam-questions";return d.innerHTML=`
    <!-- Top Action Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:14px; background:var(--card-bg); padding:16px 24px; border-radius:var(--radius-md); border:1px solid var(--border-color); box-shadow:var(--shadow-sm);">
      <div style="display:flex; align-items:center; gap:12px;">
        <button id="btn-editor-back" class="btn btn-outline" style="font-size:0.9rem; padding:8px 14px; display:inline-flex; align-items:center; gap:6px;">
          <i class="ri-arrow-left-line"></i> Back
        </button>
        <div>
          <h1 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-bottom:2px;" id="editor-page-title">
            ${q?"✏️ Edit Master Question":"➕ Create New Master Question"}
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
  `,setTimeout(()=>{xe(d,e,q,c)},0),d}async function xe(e,h,d,q){let c="en",m=4,u=0;const le=e.querySelector("#btn-editor-back"),re=e.querySelector("#btn-save-question"),se=e.querySelector("#btn-save-next-question"),w=e.querySelector("#tab-lang-en"),S=e.querySelector("#tab-lang-hi"),N=e.querySelector("#section-lang-en"),j=e.querySelector("#section-lang-hi"),F=e.querySelector("#section-passage-en"),G=e.querySelector("#section-passage-hi"),J=e.querySelector("#explanation-pane-en"),K=e.querySelector("#explanation-pane-hi"),_=e.querySelector("#form-p-text-en"),C=e.querySelector("#form-p-text-hi"),O=e.querySelector("#form-p-img-url"),E=e.querySelector("#form-q-text-en"),A=e.querySelector("#form-q-text-hi"),$=e.querySelector("#form-q-img-url"),k=e.querySelector("#form-q-exp-en"),M=e.querySelector("#form-q-exp-hi"),P=e.querySelector("#form-exp-img-url"),U=e.querySelector("#form-q-diff"),Q=e.querySelector("#form-q-section"),H=e.querySelector("#form-q-global"),W=e.querySelector("#prev-lang-label"),ne=e.querySelector("#preview-diff-badge"),B=e.querySelector("#options-list-builder"),pe=e.querySelector("#btn-add-opt"),de=e.querySelector("#btn-rem-opt");function T(a=[],r=[],t=[]){B.innerHTML="";for(let i=0;i<m;i++){const l=String.fromCharCode(65+i),o=document.createElement("div");o.style.cssText="background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:8px;",o.innerHTML=`
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="radio" name="correct_opt_idx" value="${i}" ${u===i?"checked":""} style="width:18px; height:18px; cursor:pointer;" />
          <span style="font-weight:800; min-width:80px; font-size:0.9rem; color:var(--text-main);">Option ${l}:</span>
          <input type="text" class="form-control opt-en-input" data-idx="${i}" value="${a[i]||""}" placeholder="Option ${l} text in English" style="padding:6px 10px; flex:1;" />
          <input type="text" class="form-control opt-hi-input" data-idx="${i}" value="${r[i]||""}" placeholder="हिंदी विकल्प ${l}" style="padding:6px 10px; flex:1;" />
        </div>
        <div style="display:flex; gap:8px; align-items:center; margin-left:110px;">
          <input type="text" class="form-control opt-img-input" data-idx="${i}" value="${t[i]||""}" placeholder="Option ${l} Image URL (Optional)" style="font-size:0.8rem; padding:4px 8px; flex:1;" />
          <input type="file" class="opt-img-file" data-idx="${i}" accept="image/*" style="display:none;" />
          <button type="button" class="icon-action-btn btn-upload-opt-img" data-idx="${i}" data-tooltip="Upload Option ${l} Image" aria-label="Upload Option Image"><i class="ri-image-add-line"></i></button>
        </div>
      `;const s=o.querySelector(".opt-img-file"),y=o.querySelector(".opt-img-input");o.querySelector(".btn-upload-opt-img").addEventListener("click",()=>s.click()),s.addEventListener("change",async()=>{if(s.files[0])try{const x=new FormData;x.append("image",s.files[0]);const I=await f("/images/upload",{method:"POST",body:x});y.value=b(I.imageUrl||I.fullUrl),p()}catch(x){alert("Image upload failed: "+x.message)}}),B.appendChild(o)}B.querySelectorAll("input").forEach(i=>{i.addEventListener("input",p),i.addEventListener("change",p)})}pe.addEventListener("click",()=>{m<6?(m++,T(Array.from(e.querySelectorAll(".opt-en-input")).map(a=>a.value),Array.from(e.querySelectorAll(".opt-hi-input")).map(a=>a.value),Array.from(e.querySelectorAll(".opt-img-input")).map(a=>a.value)),p()):alert("Maximum 6 options allowed per question.")}),de.addEventListener("click",()=>{m>2?(m--,u>=m&&(u=0),T(Array.from(e.querySelectorAll(".opt-en-input")).map(a=>a.value),Array.from(e.querySelectorAll(".opt-hi-input")).map(a=>a.value),Array.from(e.querySelectorAll(".opt-img-input")).map(a=>a.value)),p()):alert("Minimum 2 options required per question.")});function D(a,r,t){const i=e.querySelector(a),l=e.querySelector(r),o=e.querySelector(t);i&&l&&o&&(i.addEventListener("click",()=>l.click()),l.addEventListener("change",async()=>{if(l.files[0])try{const s=new FormData;s.append("image",l.files[0]);const y=await f("/images/upload",{method:"POST",body:s});o.value=b(y.imageUrl||y.fullUrl),p()}catch(s){alert("Image upload failed: "+s.message)}}))}D("#btn-upload-p-img","#form-p-img-file","#form-p-img-url"),D("#btn-upload-q-img","#form-q-img-file","#form-q-img-url"),D("#btn-upload-exp-img","#form-exp-img-file","#form-exp-img-url"),w.addEventListener("click",()=>{c="en",w.classList.add("active"),S.classList.remove("active"),w.style.borderBottom="3px solid var(--primary)",S.style.borderBottom="none",N.style.display="block",j.style.display="none",F.style.display="block",G.style.display="none",J.style.display="block",K.style.display="none",W.textContent="English",p()}),S.addEventListener("click",()=>{c="hi",S.classList.add("active"),w.classList.remove("active"),S.style.borderBottom="3px solid var(--accent)",w.style.borderBottom="none",j.style.display="block",N.style.display="none",G.style.display="block",F.style.display="none",K.style.display="block",J.style.display="none",W.textContent="Hindi (हिंदी)",p()}),le.addEventListener("click",()=>h(q));try{const r=(await f("/categories").catch(()=>({flatCategories:[]}))).flatCategories||[],t=r.filter(o=>!o.institute_id||o.is_global),i=r.filter(o=>o.institute_id&&!o.is_global);let l='<option value="">-- Select Category --</option>';t.length>0&&(l+='<optgroup label="🌐 Global Master Categories">'+t.map(o=>`<option value="${o.id}">${o.icon||"📂"} ${o.name}</option>`).join("")+"</optgroup>"),i.length>0&&(l+='<optgroup label="🏫 Institute Private Categories">'+i.map(o=>`<option value="${o.id}">${o.icon||"📂"} ${o.name}</option>`).join("")+"</optgroup>"),Q.innerHTML=l}catch(a){console.warn("Could not load categories:",a)}function p(){ne.textContent=U.value||"Medium";const a=c==="hi"&&C.value||_.value,r=O.value.trim(),t=e.querySelector("#prevPassageBox"),i=e.querySelector("#prevPassageText"),l=e.querySelector("#prevPassageImg");a.trim()||r?(t.style.display="block",i.innerHTML=a,r?(l.src=r,l.style.display="block"):l.style.display="none"):t.style.display="none";const o=c==="hi"&&A.value||E.value,s=e.querySelector("#prevQText"),y=e.querySelector("#prevQImg");s.innerHTML=o||`Type a question statement in ${c==="hi"?"Hindi":"English"}...`;const x=$.value.trim();x?(y.src=x,y.style.display="block"):y.style.display="none";const I=e.querySelector("#prevOptionsContainer");I.innerHTML="",e.querySelectorAll('input[name="correct_opt_idx"]').forEach(n=>{n.checked&&(u=parseInt(n.value,10))});const te=Array.from(e.querySelectorAll(".opt-en-input")).map(n=>n.value),ce=Array.from(e.querySelectorAll(".opt-hi-input")).map(n=>n.value),me=Array.from(e.querySelectorAll(".opt-img-input")).map(n=>n.value);for(let n=0;n<m;n++){const v=n===u,ue=c==="hi"&&ce[n]||te[n],oe=me[n]||"",z=document.createElement("div");z.className=`option-btn ${v?"selected":""}`,z.style.cssText=`padding: 10px 14px; border: 2px solid ${v?"var(--primary)":"var(--border-color)"}; background: ${v?"var(--primary-light)":"var(--card-bg)"}; border-radius: var(--radius-md); font-weight: 600; display:flex; flex-direction:column; gap:6px;`,z.innerHTML=`
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="width:24px; height:24px; border-radius:50%; background:${v?"var(--primary)":"var(--border-color)"}; color:${v?"#fff":"var(--text-main)"}; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:800;">${String.fromCharCode(65+n)}</span>
          <span style="white-space:pre-line;" class="katex-render">${ue||`Option ${String.fromCharCode(65+n)}`}</span>
          ${v?'<span style="color:var(--success); font-weight:bold; font-size:1.1rem; margin-left:auto;">✓</span>':""}
        </div>
        ${oe?`<img src="${oe}" style="max-width:100%; max-height:140px; border-radius:4px; margin-top:4px;" onerror="this.style.display='none'" />`:""}
      `,I.appendChild(z)}const ae=c==="hi"&&M.value||k.value,R=P.value.trim(),ie=e.querySelector("#prevExplanationBox"),ge=e.querySelector("#prevExplanationText"),V=e.querySelector("#prevExpImg");ae.trim()||R?(ie.style.display="block",ge.innerHTML=ae,R?(V.src=R,V.style.display="block"):V.style.display="none"):ie.style.display="none",ye(e.querySelector("#previewCard"))}e.addEventListener("input",p),e.addEventListener("change",p);let g=[];function L(){const a=e.querySelector("#tags-chips-container");if(a){if(g.length===0){a.innerHTML='<span style="font-size:0.82rem; color:var(--text-muted); font-style:italic;">No tags added yet. Add as many tags as needed.</span>';return}a.innerHTML=g.map((r,t)=>`
      <span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color); font-weight:700; padding:4px 10px; display:inline-flex; align-items:center; gap:6px;">
        🏷️ ${r}
        <button type="button" class="btn-remove-tag-chip" data-idx="${t}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-weight:bold; font-size:1.1rem; padding:0; line-height:1;" aria-label="Remove Tag">&times;</button>
      </span>
    `).join(""),a.querySelectorAll(".btn-remove-tag-chip").forEach(r=>{r.addEventListener("click",t=>{t.preventDefault();const i=parseInt(r.dataset.idx,10);g.splice(i,1),L()})})}}function X(){const a=e.querySelector("#input-new-tag");if(!a)return;const r=a.value.trim();if(!r)return;r.split(",").map(i=>i.trim()).filter(Boolean).forEach(i=>{g.includes(i)||g.push(i)}),a.value="",L()}const Y=e.querySelector("#btn-add-tag-chip"),Z=e.querySelector("#input-new-tag");if(Y&&Y.addEventListener("click",X),Z&&Z.addEventListener("keydown",a=>{(a.key==="Enter"||a.key===",")&&(a.preventDefault(),X())}),L(),T(),d)try{const t=((await f("/exams/questions/all")).questions||[]).find(i=>i.id==d);if(t){E.value=t.question_text_en||t.question_text||"",A.value=t.question_text_hi||"",k.value=t.explanation_en||t.explanation||"",M.value=t.explanation_hi||"",U.value=t.difficulty||"medium",t.category_id&&(Q.value=t.category_id),H&&(H.checked=!!t.is_global),t.passage_text_en&&(_.value=t.passage_text_en),t.passage_text_hi&&(C.value=t.passage_text_hi),t.passage_image_url&&(O.value=b(t.passage_image_url)),t.image_url&&($.value=b(t.image_url)),t.explanation_image_url&&(P.value=b(t.explanation_image_url)),Array.isArray(t.tags)&&t.tags.length>0?g=[...t.tags]:t.tag_names&&(g=t.tag_names.split(",").map(s=>s.trim()).filter(Boolean)),L();const i=t.options_en||t.options||[],l=t.options_hi||[],o=(t.options_images||[]).map(b);m=Math.max(2,Math.min(6,i.length||4)),u=t.correct_option_index!==void 0?t.correct_option_index:t.correct_answer_index||0,T(i,l,o),p()}}catch(a){console.error("Failed loading question details:",a)}else p();async function ee(a=!1){const r=E.value.trim();if(!r){alert("Question Statement in English is required.");return}const t=Array.from(e.querySelectorAll(".opt-en-input")).map(s=>s.value.trim()),i=Array.from(e.querySelectorAll(".opt-hi-input")).map(s=>s.value.trim()),l=Array.from(e.querySelectorAll(".opt-img-input")).map(s=>s.value.trim()),o={category_id:Q.value?parseInt(Q.value,10):null,difficulty:U.value,passage_text_en:_.value.trim(),passage_text_hi:C.value.trim(),passage_image_url:O.value.trim(),question_text_en:r,question_text_hi:A.value.trim(),image_url:$.value.trim(),options_en:t,options_hi:i,options_images:l,correct_option_index:u,explanation_en:k.value.trim(),explanation_hi:M.value.trim(),explanation_image_url:P.value.trim(),is_global:H?H.checked:!1,tags:g};try{d?await f(`/exams/questions/${d}`,{method:"PUT",body:JSON.stringify(o)}):await f("/exams/questions",{method:"POST",body:JSON.stringify(o)}),a?(alert("Master question saved successfully!"),E.value="",A.value="",k.value="",M.value="",_.value="",C.value="",O.value="",$.value="",P.value="",g=[],L(),m=4,u=0,T(),p()):h(q)}catch(s){alert(s.message||"Error saving master question.")}}re.addEventListener("click",()=>ee(!1)),se.addEventListener("click",()=>ee(!0))}export{he as renderMasterQuestionEditorView};
