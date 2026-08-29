import{r as f,a as S}from"./index-YWsq3nMJ.js";async function q(m,v,h,g){const t=document.createElement("div");t.className="modal-backdrop fade-in",t.style.cssText=`
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  `,t.innerHTML=`
    <div class="card" style="width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 4px;">➕ Assign Questions from Master Question Bank</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            Exam: <strong>${h}</strong> ➔ Section: <strong>${v}</strong>
          </p>
        </div>
        <button id="close-selector-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer;">&times;</button>
      </div>

      <!-- Filter Controls Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Category Filter</label>
          <select id="selector-filter-cat" class="form-control">
            <option value="">-- All Categories --</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Difficulty</label>
          <select id="selector-filter-diff" class="form-control">
            <option value="">-- All Difficulties --</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Search Keyword</label>
          <input type="text" id="selector-filter-search" class="form-control" placeholder="Search master questions...">
        </div>
      </div>

      <!-- Action Sub-header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <label style="font-size: 0.88rem; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <input type="checkbox" id="selector-select-all" style="width: 16px; height: 16px;">
          <span>Select All Filtered Questions</span>
        </label>
        <span id="selector-selected-count" style="font-size: 0.88rem; font-weight: 700; color: var(--primary);">0 questions selected</span>
      </div>

      <!-- Questions List Area -->
      <div id="selector-questions-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding-right: 6px;">
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          Loading Master Question Bank...
        </div>
      </div>

      <!-- Modal Footer -->
      <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 14px;">
        <button id="cancel-selector-modal" class="btn btn-outline">Cancel</button>
        <button id="submit-attach-selected" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
          <i class="ri-link"></i> Attach Selected Questions to Section
        </button>
      </div>
    </div>
  `,document.body.appendChild(t);let d=[],s=new Set;try{const[o,i]=await Promise.all([f("/categories").catch(()=>({flatCategories:[]})),f(`/exams/questions/all?section_id=${m}`)]),a=t.querySelector("#selector-filter-cat");a&&(a.innerHTML='<option value="">-- All Categories --</option>'+(o.flatCategories||[]).map(r=>`<option value="${r.id}">${r.icon||"📂"} ${r.name}</option>`).join("")),d=i.questions||[],d.forEach(r=>{r.is_attached&&s.add(r.id)}),n()}catch(o){console.error("Error opening question bank selector modal:",o)}function n(){const o=t.querySelector("#selector-questions-list"),i=t.querySelector("#selector-filter-cat").value,a=t.querySelector("#selector-filter-diff").value,r=t.querySelector("#selector-filter-search").value.toLowerCase().trim(),x=d.filter(e=>!(i&&e.category_id!=i||a&&e.difficulty!==a||r&&!(e.question_text_en.toLowerCase().includes(r)||e.question_text_hi&&e.question_text_hi.toLowerCase().includes(r))));if(x.length===0){o.innerHTML=`
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          No master questions found matching the selected filters.
        </div>
      `,p();return}o.innerHTML=x.map(e=>{const l=s.has(e.id);return`
        <div class="card" style="padding: 12px 16px; border: 1px solid ${l?"var(--primary)":"var(--border-color)"}; background: ${l?"var(--primary-light)":"var(--card-bg)"}; border-radius: 8px;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <input type="checkbox" class="q-select-cb" data-id="${e.id}" ${l?"checked":""} style="width: 18px; height: 18px; margin-top: 3px; cursor: pointer;">
            <div style="flex: 1;">
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px; flex-wrap: wrap;">
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">#${e.id}</span>
                ${e.category_name?`<span class="badge-tag" style="font-size: 0.72rem;">${e.category_icon||"📂"} ${e.category_name}</span>`:""}
                <span class="badge-tag" style="font-size: 0.72rem; text-transform: capitalize;">${e.difficulty}</span>
                ${e.is_attached?'<span class="badge-tag" style="font-size: 0.72rem; background: var(--success); color: white;">✓ Currently in Section</span>':""}
              </div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;" class="katex-render">
                ${e.question_text_en}
              </div>
              <div style="display: flex; gap: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                ${(e.options_en||[]).map((b,k)=>`
                  <span><strong>${String.fromCharCode(65+k)}:</strong> <span class="katex-render">${b}</span></span>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      `}).join(""),S(o),o.querySelectorAll(".q-select-cb").forEach(e=>{e.addEventListener("change",()=>{const l=parseInt(e.dataset.id,10);e.checked?s.add(l):s.delete(l),p()})}),p()}function p(){const o=t.querySelector("#selector-selected-count");o&&(o.textContent=`${s.size} question(s) selected`)}["#selector-filter-cat","#selector-filter-diff"].forEach(o=>{const i=t.querySelector(o);i&&i.addEventListener("change",n)});const y=t.querySelector("#selector-filter-search");y&&y.addEventListener("input",n);const c=t.querySelector("#selector-select-all");c&&c.addEventListener("change",()=>{t.querySelector("#selector-questions-list").querySelectorAll(".q-select-cb").forEach(i=>{i.checked=c.checked;const a=parseInt(i.dataset.id,10);c.checked?s.add(a):s.delete(a)}),n()});const u=()=>t.remove();t.querySelector("#close-selector-modal").addEventListener("click",u),t.querySelector("#cancel-selector-modal").addEventListener("click",u),t.querySelector("#submit-attach-selected").addEventListener("click",async()=>{if(s.size===0){alert("Please select at least 1 question from the Master Question Bank to attach.");return}try{const o=await f(`/exams/sections/${m}/attach-questions`,{method:"POST",body:JSON.stringify({question_ids:Array.from(s)})});alert(o.message||"Questions attached successfully!"),u(),typeof g=="function"&&g()}catch(o){alert(`Error attaching questions: ${o.message}`)}})}export{q as openQuestionBankSelectorModal};
