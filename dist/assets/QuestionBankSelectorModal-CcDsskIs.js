import{r as _,s as F,h as V,a as I}from"./index-Cwis2mjw.js";async function R(E,q,B,C){const o=document.createElement("div");o.className="modal-backdrop fade-in",o.style.cssText=`
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  `,o.innerHTML=`
    <div class="card" style="width: 100%; max-width: 920px; max-height: 92vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 4px; color: var(--text-main);">
            ➕ Assign Private Questions to Exam Section
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
            Exam: <strong>${B}</strong> ➔ Section: <strong>${q}</strong> • (Private Questions Only)
          </p>
        </div>
        <button id="close-selector-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <!-- Filter Controls Bar (4-Way Filters) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 14px; background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Category (Hierarchy)</label>
          <select id="selector-filter-cat" class="form-control" style="font-size: 0.82rem;">
            <option value="">-- All Categories --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Difficulty</label>
          <select id="selector-filter-diff" class="form-control" style="font-size: 0.82rem;">
            <option value="">-- All Difficulties --</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Question Tag</label>
          <select id="selector-filter-tag" class="form-control" style="font-size: 0.82rem;">
            <option value="">-- All Tags --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Search Keyword</label>
          <input type="text" id="selector-filter-search" class="form-control" placeholder="Search questions..." style="font-size: 0.82rem;">
        </div>
      </div>

      <!-- Action & Selection Info Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
        <label style="font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-main);">
          <input type="checkbox" id="selector-select-all-page" style="width: 16px; height: 16px; cursor: pointer;">
          <span>Select All Questions on This Page</span>
        </label>
        <span id="selector-selected-count" style="font-size: 0.88rem; font-weight: 800; color: var(--primary);">0 question(s) selected</span>
      </div>

      <!-- Questions List Area -->
      <div id="selector-questions-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; padding-right: 4px; min-height: 220px;">
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          Loading Private Question Bank...
        </div>
      </div>

      <!-- Bottom Pagination Bar -->
      <div id="selector-bottom-pagination" style="margin-bottom: 14px;"></div>

      <!-- Modal Footer -->
      <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 14px;">
        <button id="cancel-selector-modal" class="btn btn-outline">Cancel</button>
        <button id="submit-attach-selected" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
          <i class="ri-link"></i> Attach Selected Questions to Section
        </button>
      </div>
    </div>
  `,document.body.appendChild(o);let c=1,k=20,v={total:0,page:1,limit:20,totalPages:1},x=[],m=new Set,L=!1,b=[],h=[],P=null;async function u(){var s,i,n,l;const t=((s=o.querySelector("#selector-filter-cat"))==null?void 0:s.value)||"",a=((i=o.querySelector("#selector-filter-diff"))==null?void 0:i.value)||"",e=((n=o.querySelector("#selector-filter-tag"))==null?void 0:n.value)||"",r=((l=o.querySelector("#selector-filter-search"))==null?void 0:l.value.trim())||"";F("Loading Private Question Bank...","Fetching questions & metadata...");try{const d=new URLSearchParams({page:c,limit:k,scope:"mine",section_id:E});t&&d.append("category_id",t),a&&d.append("difficulty",a),e&&d.append("tag",e),r&&d.append("search",r);const[f,y,p]=await Promise.all([_(`/exams/questions/all?${d.toString()}`),b.length>0?Promise.resolve({flatCategories:b}):_("/categories").catch(()=>({flatCategories:[]})),h.length>0?Promise.resolve({tags:h}):_("/tags").catch(()=>({tags:[]}))]);x=f.questions||[],v=f.pagination||{total:x.length,page:c,limit:k,totalPages:1},b=y.flatCategories||[],h=p.tags||[],L||(x.forEach(g=>{g.is_attached&&m.add(g.id)}),L=!0),O(),j(),A()}catch(d){console.error("Error loading question bank selector data:",d)}finally{V()}}function D(t){const a=new Map;t.forEach(i=>a.set(i.id,{...i,children:[]}));const e=[];t.forEach(i=>{i.parent_id&&a.has(i.parent_id)?a.get(i.parent_id).children.push(a.get(i.id)):e.push(a.get(i.id))});const r=[];function s(i,n=0){const l=n>0?"— ".repeat(n):"";r.push({id:i.id,label:`${l}${i.icon||"📂"} ${i.name}`}),i.children&&i.children.length>0&&i.children.forEach(d=>s(d,n+1))}return e.forEach(i=>s(i,0)),r}function O(){const t=o.querySelector("#selector-filter-cat"),a=o.querySelector("#selector-filter-tag");if(t&&t.options.length<=1){const e=D(b);t.innerHTML='<option value="">-- All Categories (Hierarchy) --</option>'+e.map(r=>`<option value="${r.id}">${r.label}</option>`).join("")}a&&a.options.length<=1&&(a.innerHTML='<option value="">-- All Tags --</option>'+h.map(e=>`<option value="${e.name}">🏷️ ${e.name}</option>`).join(""))}function j(){var l,d,f,y,p;const t=o.querySelector("#selector-bottom-pagination");if(!t)return;const{total:a,page:e,limit:r,totalPages:s}=v,i=a===0?0:(e-1)*r+1,n=Math.min(a,e*r);t.innerHTML=`
      <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:8px 12px; background:var(--card-bg); border-radius:6px; border:1px solid var(--border-color); font-size:0.82rem;">
        <div style="color:var(--text-muted); font-weight:600;">
          Showing <strong style="color:var(--text-main);">${i}–${n}</strong> of <strong style="color:var(--primary);">${a.toLocaleString()}</strong> questions
        </div>

        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm btn-page-first" ${e<=1?"disabled":""} style="padding:2px 8px; font-size:0.78rem;">
            <i class="ri-skip-left-line"></i> First
          </button>
          <button class="btn btn-outline btn-sm btn-page-prev" ${e<=1?"disabled":""} style="padding:2px 8px; font-size:0.78rem;">
            <i class="ri-arrow-left-s-line"></i> Prev
          </button>

          <span style="font-weight:700; color:var(--text-main); padding:0 2px;">
            Page ${e} of ${s}
          </span>

          <button class="btn btn-outline btn-sm btn-page-next" ${e>=s?"disabled":""} style="padding:2px 8px; font-size:0.78rem;">
            Next <i class="ri-arrow-right-s-line"></i>
          </button>
          <button class="btn btn-outline btn-sm btn-page-last" ${e>=s?"disabled":""} style="padding:2px 8px; font-size:0.78rem;">
            Last <i class="ri-skip-right-line"></i>
          </button>

          <select class="form-control select-page-limit" style="width: auto; padding: 2px 6px; font-size: 0.78rem; font-weight:700;">
            <option value="20" ${r===20?"selected":""}>20 / page</option>
            <option value="50" ${r===50?"selected":""}>50 / page</option>
            <option value="100" ${r===100?"selected":""}>100 / page</option>
          </select>
        </div>
      </div>
    `,(l=t.querySelector(".btn-page-first"))==null||l.addEventListener("click",()=>{c>1&&(c=1,u())}),(d=t.querySelector(".btn-page-prev"))==null||d.addEventListener("click",()=>{c>1&&(c--,u())}),(f=t.querySelector(".btn-page-next"))==null||f.addEventListener("click",()=>{c<s&&(c++,u())}),(y=t.querySelector(".btn-page-last"))==null||y.addEventListener("click",()=>{c<s&&(c=s,u())}),(p=t.querySelector(".select-page-limit"))==null||p.addEventListener("change",g=>{k=parseInt(g.target.value,10)||20,c=1,u()})}function A(){const t=o.querySelector("#selector-questions-list");if(!t)return;if(x.length===0){t.innerHTML=`
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          No private master questions found matching the selected filters.
        </div>
      `,$();return}const a=(v.page-1)*v.limit;t.innerHTML=x.map((e,r)=>{const s=m.has(e.id),i=Array.isArray(e.tags)&&e.tags.length>0?e.tags:e.tag_names?e.tag_names.split(",").map(p=>p.trim()):[],n=e.options_en||[],l=e.options_hi||[],d=e.options_images||[],f=e.passage_text_en||e.passage_text_hi||e.passage_image_url,y=e.explanation_en||e.explanation_hi||e.explanation_image_url;return`
        <div class="card" style="padding: 12px 16px; border: 1.5px solid ${s?"var(--primary)":"var(--border-color)"}; background: ${s?"var(--primary-light)":"var(--card-bg)"}; border-radius: 8px;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <input type="checkbox" class="q-select-cb" data-id="${e.id}" ${s?"checked":""} style="width: 18px; height: 18px; margin-top: 3px; cursor: pointer;">
            <div style="flex: 1;">
              <!-- Header Bar (Badges & Expand Toggle) -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                  <span style="font-size: 0.78rem; font-weight: 800; color: var(--primary);">#${a+r+1}</span>
                  ${e.category_name?`<span class="badge-tag" style="font-size: 0.72rem;">${e.category_icon||"📂"} ${e.category_name}</span>`:""}
                  <span class="badge-tag" style="font-size: 0.72rem; text-transform: capitalize;">⚡ ${e.difficulty||"medium"}</span>
                  ${i.map(p=>`<span class="badge-tag" style="font-size: 0.72rem;">🏷️ ${p}</span>`).join("")}
                  ${e.is_attached?'<span class="badge-tag" style="font-size: 0.72rem; background: var(--success); color: white; font-weight:700;">✓ Currently Attached</span>':""}
                </div>
                <button class="btn btn-outline btn-sm btn-toggle-details" data-id="${e.id}" style="padding: 2px 8px; font-size: 0.76rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                  <i class="ri-eye-line"></i> <span class="btn-text">View Details</span>
                </button>
              </div>

              <!-- Collapsed Summary Question Statement -->
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px; white-space: pre-line;" class="katex-render">
                ${e.question_text_en}
              </div>

              <!-- Collapsed Summary Options List -->
              <div style="display: flex; gap: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                ${n.map((p,g)=>`
                  <span><strong>${String.fromCharCode(65+g)}:</strong> <span class="katex-render">${p}</span></span>
                `).join("")}
              </div>

              <!-- Expandable Full Details Accordion Drawer -->
              <div id="details-container-${e.id}" class="details-accordion-drawer" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
                <!-- Comprehension Passage (If Available) -->
                ${f?`
                  <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 0.82rem; color: var(--primary); margin-bottom: 4px;">📖 Comprehension Passage:</div>
                    ${e.passage_text_en?`<div style="font-size: 0.88rem; margin-bottom: 4px; white-space: pre-line;" class="katex-render">${e.passage_text_en}</div>`:""}
                    ${e.passage_text_hi?`<div style="font-size: 0.85rem; color: var(--text-muted); white-space: pre-line;" class="katex-render">हिंदी: ${e.passage_text_hi}</div>`:""}
                    ${e.passage_image_url?`<div style="margin-top: 6px;"><img src="${e.passage_image_url}" alt="Passage Image" style="max-width: 100%; max-height: 180px; border-radius: 6px;" onerror="this.style.display='none'" /></div>`:""}
                  </div>
                `:""}

                <!-- Hindi Question Statement (If Available) -->
                ${e.question_text_hi?`
                  <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px; white-space: pre-line;" class="katex-render">
                    <strong>हिंदी text:</strong> ${e.question_text_hi}
                  </div>
                `:""}

                <!-- Question Diagram Image (If Available) -->
                ${e.image_url?`
                  <div style="margin-bottom: 10px;">
                    <img src="${e.image_url}" alt="Question Diagram" style="max-width: 100%; max-height: 180px; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.style.display='none'" />
                  </div>
                `:""}

                <!-- Full Options Grid (Bilingual & Option Images) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-bottom: 12px;">
                  ${n.map((p,g)=>{const S=g===e.correct_option_index,H=l[g]||"",Q=d[g]||"";return`
                      <div style="padding: 8px 10px; border-radius: 6px; border: 1px solid ${S?"var(--success)":"var(--border-color)"}; background: ${S?"rgba(34,197,94,0.08)":"var(--bg-color)"}; font-size: 0.85rem;">
                        <div style="display: flex; align-items: flex-start; gap: 6px;">
                          <strong style="color: ${S?"var(--success)":"var(--primary)"}; min-width: 20px;">
                            ${String.fromCharCode(65+g)}:
                          </strong>
                          <div style="flex: 1;">
                            <div style="white-space: pre-line;" class="katex-render">${p}</div>
                            ${H?`<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; white-space: pre-line;" class="katex-render">${H}</div>`:""}
                            ${Q?`<div style="margin-top: 4px;"><img src="${Q}" alt="Option ${String.fromCharCode(65+g)}" style="max-width: 100%; max-height: 100px; border-radius: 4px;" onerror="this.style.display='none'" /></div>`:""}
                          </div>
                          ${S?'<span style="color:var(--success); font-weight:bold; font-size:1rem;">✓</span>':""}
                        </div>
                      </div>
                    `}).join("")}
                </div>

                <!-- Solution Explanation (If Available) -->
                ${y?`
                  <div style="font-size: 0.85rem; color: var(--text-muted); background: var(--bg-color); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                    <div style="font-weight: 700; color: var(--text-main); margin-bottom: 2px;">💡 Solution Explanation:</div>
                    ${e.explanation_en?`<div style="white-space: pre-line; margin-bottom: 2px;" class="katex-render">${e.explanation_en}</div>`:""}
                    ${e.explanation_hi?`<div style="white-space: pre-line; color: var(--text-muted);" class="katex-render">हिंदी: ${e.explanation_hi}</div>`:""}
                    ${e.explanation_image_url?`<div style="margin-top: 4px;"><img src="${e.explanation_image_url}" alt="Explanation Diagram" style="max-width: 100%; max-height: 160px; border-radius: 6px;" onerror="this.style.display='none'" /></div>`:""}
                  </div>
                `:""}
              </div>
            </div>
          </div>
        </div>
      `}).join(""),I(t),t.querySelectorAll(".btn-toggle-details").forEach(e=>{e.addEventListener("click",()=>{const r=e.dataset.id,s=t.querySelector(`#details-container-${r}`),i=e.querySelector(".btn-text"),n=e.querySelector("i");if(s){const l=s.style.display==="none";s.style.display=l?"block":"none",i&&(i.textContent=l?"Hide Details":"View Details"),n&&(n.className=l?"ri-eye-off-line":"ri-eye-line"),l&&I(s)}})}),t.querySelectorAll(".q-select-cb").forEach(e=>{e.addEventListener("change",()=>{const r=parseInt(e.dataset.id,10);e.checked?m.add(r):m.delete(r),$(),M()})}),$(),M()}function $(){const t=o.querySelector("#selector-selected-count");t&&(t.textContent=`${m.size} question(s) selected`)}function M(){const t=o.querySelector("#selector-select-all-page");if(!t||x.length===0)return;const a=x.every(e=>m.has(e.id));t.checked=a}["#selector-filter-cat","#selector-filter-diff","#selector-filter-tag"].forEach(t=>{const a=o.querySelector(t);a&&a.addEventListener("change",()=>{c=1,u()})});const T=o.querySelector("#selector-filter-search");T&&T.addEventListener("input",()=>{clearTimeout(P),P=setTimeout(()=>{c=1,u()},300)});const w=o.querySelector("#selector-select-all-page");w&&w.addEventListener("change",()=>{o.querySelector("#selector-questions-list").querySelectorAll(".q-select-cb").forEach(a=>{a.checked=w.checked;const e=parseInt(a.dataset.id,10);w.checked?m.add(e):m.delete(e)}),$(),A()});const z=()=>o.remove();o.querySelector("#close-selector-modal").addEventListener("click",z),o.querySelector("#cancel-selector-modal").addEventListener("click",z),o.querySelector("#submit-attach-selected").addEventListener("click",async()=>{if(m.size===0){alert("Please select at least 1 question from your Private Master Bank to attach.");return}try{const t=await _(`/exams/sections/${E}/attach-questions`,{method:"POST",body:JSON.stringify({question_ids:Array.from(m)})});alert(t.message||"Questions attached successfully!"),z(),typeof C=="function"&&C()}catch(t){alert(`Error attaching questions: ${t.message}`)}}),u()}export{R as openQuestionBankSelectorModal};
