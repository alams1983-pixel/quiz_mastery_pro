const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/BulkUploadModal-CMPG8sYk.js","assets/csvJsonParser-Cmc2jVv8.js","assets/index-CmO4Cwr9.js","assets/index-CT652Wiu.css"])))=>i.map(i=>d[i]);
import{f as M,r as y,h as P,_ as B,a as A}from"./index-CmO4Cwr9.js";let _=[],w=[],$=[],x=null,L="all",p=1,E=20,k={total:0,page:1,limit:20,totalPages:1,hasNextPage:!1,hasPrevPage:!1},S=null;function I(i,r={}){x=typeof i=="function"?i:null,p=1;const o=document.createElement("div");return o.className="view-container fade-in",o.innerHTML=`
    <!-- Header & Action Buttons -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">📚 Master Question Repository</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Central independent repository of questions with server-side pagination, multi-language support, KaTeX math, dynamic tags, and category hierarchy.
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

    <!-- Scope Filter Tabs (All / Global / Private) -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 2px;">
      <button id="scope-tab-all" class="scope-tab-btn active" style="font-weight: 700; padding: 8px 16px; border-bottom: 3px solid var(--primary); background: none; border-top: none; border-left: none; border-right: none; cursor: pointer; color: var(--primary);">
        <i class="ri-file-list-3-line"></i> All Questions
      </button>
      <button id="scope-tab-global" class="scope-tab-btn" style="font-weight: 700; padding: 8px 16px; background: none; border: none; cursor: pointer; color: var(--text-muted);">
        🌐 Global Master Questions
      </button>
      <button id="scope-tab-mine" class="scope-tab-btn" style="font-weight: 700; padding: 8px 16px; background: none; border: none; cursor: pointer; color: var(--text-muted);">
        🏫 My Institute Private Questions
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="card" style="padding: 18px; margin-bottom: 20px; background: var(--card-bg);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; align-items: center;">
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Category (Hierarchy)</label>
          <select id="filter-category" class="form-control">
            <option value="">-- All Categories --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Difficulty Level</label>
          <select id="filter-difficulty" class="form-control">
            <option value="">-- All Difficulties --</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Question Tags</label>
          <select id="filter-tag" class="form-control">
            <option value="">-- All Tags --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Search Keyword</label>
          <input type="text" id="filter-search" class="form-control" placeholder="Search text, options, explanation...">
        </div>
      </div>
    </div>

    <!-- Top Pagination Bar Container -->
    <div id="top-pagination-container" style="margin-bottom: 16px;"></div>

    <!-- Question Bank Container -->
    <div id="questions-list-container" style="display: flex; flex-direction: column; gap: 16px;">
      <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        Loading master question bank...
      </div>
    </div>

    <!-- Bottom Pagination Bar Container -->
    <div id="bottom-pagination-container" style="margin-top: 20px;"></div>
  `,c(o,r),z(o),o}async function c(i,r={}){var e,s,l,m;const o=((e=i.querySelector("#filter-category"))==null?void 0:e.value)||"",n=((s=i.querySelector("#filter-difficulty"))==null?void 0:s.value)||"",t=((l=i.querySelector("#filter-tag"))==null?void 0:l.value)||"",a=((m=i.querySelector("#filter-search"))==null?void 0:m.value.trim())||"";M("Loading Master Question Repository...","Fetching page & metadata from central repository...");try{const d=new URLSearchParams({page:p,limit:E,scope:L});o&&d.append("category_id",o),n&&d.append("difficulty",n),t&&d.append("tag",t),a&&d.append("search",a);const[b,g,u]=await Promise.all([y(`/exams/questions/all?${d.toString()}`),_.length>0?Promise.resolve({flatCategories:_}):y("/categories").catch(()=>({flatCategories:[]})),w.length>0?Promise.resolve({tags:w}):y("/tags").catch(()=>({tags:[]}))]);$=b.questions||[],k=b.pagination||{total:$.length,page:p,limit:E,totalPages:1},_=g.flatCategories||[],w=u.tags||[],q(i),C(i),Q(i,$)}catch(d){console.error("Failed to load question bank data:",d)}finally{P()}}function T(i){const r=new Map;i.forEach(a=>r.set(a.id,{...a,children:[]}));const o=[];i.forEach(a=>{a.parent_id&&r.has(a.parent_id)?r.get(a.parent_id).children.push(r.get(a.id)):o.push(r.get(a.id))});const n=[];function t(a,e=0){const s=e>0?"— ".repeat(e):"";n.push({id:a.id,label:`${s}${a.icon||"📂"} ${a.name}`}),a.children&&a.children.length>0&&a.children.forEach(l=>t(l,e+1))}return o.forEach(a=>t(a,0)),n}function q(i){const r=i.querySelector("#filter-category"),o=i.querySelector("#filter-tag");if(r&&r.options.length<=1){const n=T(_);r.innerHTML='<option value="">-- All Categories (Hierarchy) --</option>'+n.map(t=>`<option value="${t.id}">${t.label}</option>`).join("")}o&&o.options.length<=1&&(o.innerHTML='<option value="">-- All Tags --</option>'+w.map(n=>`<option value="${n.name}">🏷️ ${n.name}</option>`).join(""))}function C(i){const r=i.querySelector("#top-pagination-container"),o=i.querySelector("#bottom-pagination-container"),{total:n,page:t,limit:a,totalPages:e}=k,s=n===0?0:(t-1)*a+1,l=Math.min(n,t*a),m=`
    <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:12px 18px; background:var(--card-bg); border-radius:var(--radius-md); border:1px solid var(--border-color);">
      <div style="font-size:0.88rem; color:var(--text-muted); font-weight:600;">
        Showing <strong style="color:var(--text-main);">${s}–${l}</strong> of <strong style="color:var(--primary);">${n.toLocaleString()}</strong> questions
      </div>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm btn-page-first" ${t<=1?"disabled":""} style="font-weight:700;">
          <i class="ri-skip-left-line"></i> First
        </button>
        <button class="btn btn-outline btn-sm btn-page-prev" ${t<=1?"disabled":""} style="font-weight:700;">
          <i class="ri-arrow-left-s-line"></i> Prev
        </button>

        <span style="font-size:0.88rem; font-weight:700; color:var(--text-main); padding:0 4px;">
          Page ${t} of ${e}
        </span>

        <button class="btn btn-outline btn-sm btn-page-next" ${t>=e?"disabled":""} style="font-weight:700;">
          Next <i class="ri-arrow-right-s-line"></i>
        </button>
        <button class="btn btn-outline btn-sm btn-page-last" ${t>=e?"disabled":""} style="font-weight:700;">
          Last <i class="ri-skip-right-line"></i>
        </button>

        <select class="form-control select-page-limit" style="width: auto; padding: 4px 8px; font-size: 0.85rem; font-weight:700;">
          <option value="20" ${a===20?"selected":""}>20 / page</option>
          <option value="50" ${a===50?"selected":""}>50 / page</option>
          <option value="100" ${a===100?"selected":""}>100 / page</option>
          <option value="200" ${a===200?"selected":""}>200 / page</option>
        </select>
      </div>
    </div>
  `;r&&(r.innerHTML=m),o&&(o.innerHTML=m),[r,o].forEach(d=>{var b,g,u,f,v;d&&((b=d.querySelector(".btn-page-first"))==null||b.addEventListener("click",()=>{p>1&&(p=1,c(i))}),(g=d.querySelector(".btn-page-prev"))==null||g.addEventListener("click",()=>{p>1&&(p--,c(i))}),(u=d.querySelector(".btn-page-next"))==null||u.addEventListener("click",()=>{p<e&&(p++,c(i))}),(f=d.querySelector(".btn-page-last"))==null||f.addEventListener("click",()=>{p<e&&(p=e,c(i))}),(v=d.querySelector(".select-page-limit"))==null||v.addEventListener("change",h=>{E=parseInt(h.target.value,10)||20,p=1,c(i)}))})}function Q(i,r){const o=i.querySelector("#questions-list-container");if(!o)return;if(!r||r.length===0){o.innerHTML=`
      <div class="card" style="padding: 36px; text-align: center; color: var(--text-muted);">
        No master questions found matching the selected filters.
      </div>
    `;return}const n=(k.page-1)*k.limit;o.innerHTML=r.map((t,a)=>{const s=(Array.isArray(t.tags)&&t.tags.length>0?t.tags:t.tag_names?t.tag_names.split(",").map(g=>g.trim()):[]).map(g=>`
      <span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color); font-weight:600;">🏷️ ${g}</span>
    `).join(""),l=!!t.is_global,m=t.options_en||[],d=t.options_hi||[],b=t.options_images||[];return`
      <div class="card" style="padding: 20px; border-left: 4px solid ${l?"var(--primary)":"var(--accent)"}; background: ${l?"rgba(59, 130, 246, 0.02)":"var(--card-bg)"};">
        <!-- Top Badges & Actions Bar -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="badge-tag" style="background: var(--primary-light); color: var(--primary); font-weight: 700;">
              ${t.category_icon||"📂"} ${t.category_name||"General"}
            </span>
            <span class="badge-tag" style="background: ${l?"rgba(59, 130, 246, 0.15)":"rgba(168, 85, 247, 0.15)"}; color: ${l?"var(--primary)":"var(--accent)"}; font-weight:800; border: 1px solid ${l?"var(--primary)":"var(--accent)"};">
              ${l?"🌐 Global Master (Super Admin)":"🏫 Private (Institute)"}
            </span>
            <span class="badge-tag" style="text-transform: capitalize; font-weight: 700; color: ${t.difficulty==="hard"?"var(--danger)":t.difficulty==="easy"?"var(--success)":"var(--accent)"};">
              ⚡ ${t.difficulty||"medium"}
            </span>
            ${s}
          </div>

          <div class="table-action-group" style="display:flex; gap:6px;">
            ${l?`
              <button class="btn btn-outline btn-sm btn-dup-q" data-id="${t.id}" title="Duplicate to My Bank (Create Private Copy)" style="font-size:0.8rem; padding:4px 8px;">
                <i class="ri-file-copy-line"></i> Duplicate to My Bank
              </button>
            `:""}
            <button class="icon-action-btn btn-edit-q" data-id="${t.id}" title="Edit Master Question">
              <i class="ri-edit-line"></i>
            </button>
            <button class="icon-action-btn btn-danger btn-del-q" data-id="${t.id}" title="Delete Master Question">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>

        <!-- Comprehension Passage (If Available) -->
        ${t.passage_text_en||t.passage_text_hi||t.passage_image_url?`
          <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--primary); margin-bottom: 6px;">
              📖 Comprehension Passage:
            </div>
            ${t.passage_text_en?`<div style="font-size: 0.9rem; margin-bottom: 6px; white-space: pre-line;" class="katex-render">${t.passage_text_en}</div>`:""}
            ${t.passage_text_hi?`<div style="font-size: 0.88rem; color: var(--text-muted); white-space: pre-line;" class="katex-render">हिंदी: ${t.passage_text_hi}</div>`:""}
            ${t.passage_image_url?`<div style="margin-top: 8px;"><img src="${t.passage_image_url}" alt="Passage Image" style="max-width: 100%; max-height: 220px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>`:""}
          </div>
        `:""}

        <!-- Question Text (English & Hindi) -->
        <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 8px; color: var(--text-main); white-space: pre-line;" class="katex-render">Q${n+a+1}. ${t.question_text_en}</div>
        ${t.question_text_hi?`<div style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 12px; white-space: pre-line;" class="katex-render">हिंदी: ${t.question_text_hi}</div>`:""}
        ${t.image_url?`<div style="margin-bottom: 12px;"><img src="${t.image_url}" alt="Question Diagram" style="max-width: 100%; max-height: 220px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>`:""}

        <!-- Options Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 14px;">
          ${m.map((g,u)=>{const f=u===t.correct_option_index,v=d[u]||"",h=b[u]||"";return`
              <div style="padding: 10px 12px; border-radius: 8px; border: 1px solid ${f?"var(--success)":"var(--border-color)"}; background: ${f?"rgba(34,197,94,0.08)":"var(--bg-color)"}; font-size: 0.9rem;">
                <div style="display: flex; align-items: flex-start; gap: 6px;">
                  <strong style="color: ${f?"var(--success)":"var(--primary)"}; width: 24px;">
                    ${String.fromCharCode(65+u)}:
                  </strong>
                  <div style="flex: 1;">
                    <div style="white-space: pre-line;" class="katex-render">${g}</div>
                    ${v?`<div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; white-space: pre-line;" class="katex-render">${v}</div>`:""}
                    ${h?`<div style="margin-top: 4px;"><img src="${h}" alt="Option ${String.fromCharCode(65+u)}" style="max-width: 100%; max-height: 120px; border-radius: 4px;" onerror="this.style.display='none'" /></div>`:""}
                  </div>
                  ${f?'<span style="color:var(--success); font-weight:bold; font-size:1.1rem;">✓</span>':""}
                </div>
              </div>
            `}).join("")}
        </div>

        <!-- Solution Explanation -->
        ${t.explanation_en||t.explanation_hi||t.explanation_image_url?`
          <div style="font-size: 0.88rem; color: var(--text-muted); background: var(--bg-color); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">💡 Solution Explanation:</div>
            ${t.explanation_en?`<div style="white-space: pre-line; margin-bottom: 4px;" class="katex-render">${t.explanation_en}</div>`:""}
            ${t.explanation_hi?`<div style="white-space: pre-line; color: var(--text-muted);" class="katex-render">हिंदी: ${t.explanation_hi}</div>`:""}
            ${t.explanation_image_url?`<div style="margin-top: 6px;"><img src="${t.explanation_image_url}" alt="Explanation Diagram" style="max-width: 100%; max-height: 200px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" /></div>`:""}
          </div>
        `:""}
      </div>
    `}).join(""),A(o),o.querySelectorAll(".btn-edit-q").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.id;typeof x=="function"&&x("question-editor",{questionId:a,returnView:"exam-questions"})})}),o.querySelectorAll(".btn-del-q").forEach(t=>{t.addEventListener("click",async()=>{const a=t.dataset.id;if(confirm("Are you sure you want to delete this master question?"))try{await y(`/exams/questions/${a}`,{method:"DELETE"}),c(i)}catch(e){alert(e.message||"Error deleting master question.")}})}),o.querySelectorAll(".btn-dup-q").forEach(t=>{t.addEventListener("click",async()=>{const a=t.dataset.id,e=$.find(s=>s.id==a);if(e&&confirm("Duplicate this Global Master question to your institute private question bank?"))try{const s={category_id:e.category_id,difficulty:e.difficulty,passage_text_en:e.passage_text_en||"",passage_text_hi:e.passage_text_hi||"",passage_image_url:e.passage_image_url||"",question_text_en:e.question_text_en,question_text_hi:e.question_text_hi||"",image_url:e.image_url||"",options_en:e.options_en||[],options_hi:e.options_hi||[],options_images:e.options_images||[],correct_option_index:e.correct_option_index||0,explanation_en:e.explanation_en||"",explanation_hi:e.explanation_hi||"",explanation_image_url:e.explanation_image_url||"",is_global:!1,tags:e.tags||(e.tag_names?e.tag_names.split(",").map(l=>l.trim()):[])};await y("/exams/questions",{method:"POST",body:JSON.stringify(s)}),alert("Question duplicated to your Private Bank successfully!"),c(i)}catch(s){alert(s.message||"Failed to duplicate question.")}})})}function z(i){[{id:"#scope-tab-all",scope:"all"},{id:"#scope-tab-global",scope:"global"},{id:"#scope-tab-mine",scope:"mine"}].forEach(a=>{const e=i.querySelector(a.id);e&&e.addEventListener("click",()=>{L=a.scope,i.querySelectorAll(".scope-tab-btn").forEach(s=>{s.classList.remove("active"),s.style.borderBottom="none",s.style.color="var(--text-muted)"}),e.classList.add("active"),e.style.borderBottom="3px solid var(--primary)",e.style.color="var(--primary)",p=1,c(i)})}),["#filter-category","#filter-difficulty","#filter-tag"].forEach(a=>{const e=i.querySelector(a);e&&e.addEventListener("change",()=>{p=1,c(i)})});const o=i.querySelector("#filter-search");o&&o.addEventListener("input",()=>{clearTimeout(S),S=setTimeout(()=>{p=1,c(i)},300)});const n=i.querySelector("#btn-bank-add"),t=i.querySelector("#btn-bank-bulk");n&&n.addEventListener("click",()=>{typeof x=="function"&&x("question-editor",{returnView:"exam-questions"})}),t&&t.addEventListener("click",async()=>{const{renderBulkUploadModal:a}=await B(async()=>{const{renderBulkUploadModal:e}=await import("./BulkUploadModal-CMPG8sYk.js");return{renderBulkUploadModal:e}},__vite__mapDeps([0,1,2,3]));a(null,"question_bank",()=>c(i))})}export{I as renderExamQuestionBankView};
