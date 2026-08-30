const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CyV29KP3.js","assets/index-CG2BOuPD.css"])))=>i.map(i=>d[i]);
import{b as r,_ as P,c as k}from"./index-CyV29KP3.js";function M(o){const c=document.createElement("div");return c.className="view-container fade-in",c.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 4px;">🏷️ Master Taxonomy & Tag Management</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Single-source taxonomy shared across both Online CBT Exams and Practice Quizzes.
        </p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="btn-add-category" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;" title="Add Category" aria-label="Add Category">
          <i class="ri-folder-add-line"></i> <span class="btn-text-desktop">Add Category</span>
        </button>
        <button id="btn-add-tag" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;" title="Create Tag" aria-label="Create Tag">
          <i class="ri-price-tag-3-line"></i> <span class="btn-text-desktop">Create Tag</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 12px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px;">
      <button id="tab-tax-cat" class="btn-text active" style="font-weight: 700; padding: 10px 18px; border-bottom: 3px solid var(--primary);">
        📂 Categories & Emoji Icons
      </button>
      <button id="tab-tax-tags" class="btn-text" style="font-weight: 700; padding: 10px 18px; color: var(--text-muted);">
        🏷️ Question & Exam Tags Dictionary
      </button>
    </div>

    <!-- Section Content -->
    <div id="taxonomy-content">
      <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        Loading taxonomy...
      </div>
    </div>
  `,setTimeout(()=>{q(c)},0),c}async function q(o,c){const p=o.querySelector("#tab-tax-cat"),g=o.querySelector("#tab-tax-tags"),n=o.querySelector("#taxonomy-content"),T=o.querySelector("#btn-add-category"),E=o.querySelector("#btn-add-tag");let u="categories",l=[],v=[];function x(t){u=t,[p,g].forEach(a=>a.classList.remove("active")),p.style.borderBottom="none",g.style.borderBottom="none",t==="categories"?(p.classList.add("active"),p.style.borderBottom="3px solid var(--primary)"):(g.classList.add("active"),g.style.borderBottom="3px solid var(--accent)"),f()}p.addEventListener("click",()=>x("categories")),g.addEventListener("click",()=>x("tags"));async function m(){try{const[t,a]=await Promise.all([r.getCategories().catch(()=>({flatCategories:[]})),r.getTags().catch(()=>({tags:[]}))]);l=t.flatCategories||[],v=a.tags||[],f()}catch(t){n.innerHTML=`<div style="color:var(--danger); padding:20px;">Error loading taxonomy: ${t.message}</div>`}}function f(){if(u==="categories"){if(l.length===0){n.innerHTML='<div class="card" style="padding:30px; text-align:center; color:var(--text-muted);">No categories created yet. Click "+ Add Category" to create one.</div>';return}n.innerHTML=`
        <div class="card" style="padding: 20px;">
          <div class="table-wrap">
            <table class="custom-table mobile-card-table" style="width: 100%;">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Category Name</th>
                  <th>Scope / Ownership</th>
                  <th>Parent Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${l.map(t=>{var b;const a=!t.institute_id||t.is_global;return`
                  <tr>
                    <td data-label="Icon" style="font-size: 1.4rem; text-align: center;">${t.icon||"📂"}</td>
                    <td data-label="Category Name" style="font-weight: 700;">${t.name}</td>
                    <td data-label="Scope">
                      <span class="badge-tag" style="background: ${a?"var(--primary-light)":"var(--accent-light)"}; color: ${a?"var(--primary)":"var(--accent)"}; font-weight: 700;">
                        ${a?"🌐 Global Master":`🏫 Private (${t.institute_name||"Institute"})`}
                      </span>
                    </td>
                    <td data-label="Parent">${t.parent_id?((b=l.find(s=>s.id===t.parent_id))==null?void 0:b.name)||t.parent_id:"Root (Top Level)"}</td>
                    <td data-label="Description" style="color: var(--text-muted); font-size: 0.88rem;">${t.description||"-"}</td>
                    <td data-label="Actions">
                      <div class="table-action-group">
                        <button class="icon-action-btn edit-cat-btn" data-id="${t.id}" title="Edit Category">
                          <i class="ri-edit-line"></i>
                        </button>
                        <button class="icon-action-btn btn-danger delete-cat-btn" data-id="${t.id}" title="Delete Category">
                          <i class="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `}).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `,n.querySelectorAll(".edit-cat-btn").forEach(t=>{t.addEventListener("click",()=>{const a=l.find(b=>b.id==t.dataset.id);h(a)})}),n.querySelectorAll(".delete-cat-btn").forEach(t=>{t.addEventListener("click",async()=>{if(confirm("Delete category?"))try{await r.deleteCategory(t.dataset.id),m()}catch(a){alert(a.message)}})})}else if(u==="tags"){if(v.length===0){n.innerHTML='<div class="card" style="padding:30px; text-align:center; color:var(--text-muted);">No tags created yet. Click "+ Create Tag" to add tags.</div>';return}n.innerHTML=`
        <div class="card" style="padding: 24px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 16px;">Tag Dictionary (Global & Institute Private)</h3>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            ${v.map(t=>`
              <div style="background: var(--bg-color); border: 1.5px solid var(--border-color); border-radius: var(--radius-pill); padding: 8px 16px; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem;">
                <span>${!t.institute_id||t.is_global?"🌐":"🏫"} #${t.name}</span>
                <button class="btn-delete-tag" data-id="${t.id}" data-name="${t.name}" style="background: none; border: none; color: var(--danger); font-weight: 900; cursor: pointer; font-size: 1.1rem;">&times;</button>
              </div>
            `).join("")}
          </div>
        </div>
      `,n.querySelectorAll(".btn-delete-tag").forEach(t=>{t.addEventListener("click",async()=>{if(confirm(`Delete tag "${t.dataset.name}"?`))try{await r.deleteTag(t.dataset.id),m()}catch(a){alert(a.message)}})})}}T.addEventListener("click",()=>h(null)),E.addEventListener("click",async()=>{const t=prompt("Enter new Tag name (e.g. Algebra, Tier1, PYQ):");if(t)try{await r.createTag({name:t.trim()}),m()}catch(a){alert(a.message)}});async function h(t=null){const{getUser:a}=await P(async()=>{const{getUser:e}=await import("./index-CyV29KP3.js").then(d=>d.h);return{getUser:e}},__vite__mapDeps([0,1])),s=(a()||{}).role==="super_admin",_=["📂","⚛️","🧪","📐","🧬","🌍","💻","📘","⚡","🏆","🧠","📜"],C=l.filter(e=>!t||e.id!==t.id),w=C.filter(e=>!e.institute_id||e.is_global),$=C.filter(e=>e.institute_id&&!e.is_global);let y='<option value="">-- None (Top Level Root) --</option>';s?w.length>0&&(y+='<optgroup label="🌐 Global Master Categories">'+w.map(e=>`<option value="${e.id}" ${t&&t.parent_id===e.id?"selected":""}>${e.icon||"📂"} ${e.name}</option>`).join("")+"</optgroup>"):$.length>0&&(y+='<optgroup label="🏫 My Institute Private Categories">'+$.map(e=>`<option value="${e.id}" ${t&&t.parent_id===e.id?"selected":""}>${e.icon||"📂"} ${e.name}</option>`).join("")+"</optgroup>");const i=document.createElement("form");i.innerHTML=`
      <div style="margin-bottom: 14px; padding: 10px 14px; border-radius: 8px; background: ${s?"var(--primary-light)":"var(--accent-light)"}; color: ${s?"var(--primary)":"var(--accent)"}; font-size: 0.85rem; font-weight: 700;">
        ${s?"🌐 Creating Global Master Category (Visible platform-wide)":"🏫 Creating Private Category (Exclusive to your Coaching Institute)"}
      </div>

      <div class="form-group">
        <label>Category Emoji Icon</label>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" id="catIcon" class="form-input" style="width:80px; text-align:center; font-size:1.4rem;" value="${t&&t.icon||"📂"}" required />
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${_.map(e=>`<button type="button" class="btn btn-sm btn-secondary emoji-preset-btn">${e}</button>`).join("")}
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Category Name *</label>
        <input type="text" id="catName" class="form-input" value="${t?t.name:""}" required />
      </div>
      <div class="form-group">
        <label>Parent Category (Optional)</label>
        <select id="catParent" class="form-select">
          ${y}
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="catDesc" class="form-textarea" rows="2">${t&&t.description||""}</textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:12px; font-weight:700;">${t?"Update Category":"Create Category"}</button>
    `;const L=k({title:t?"✏️ Edit Category":"➕ Add Category",content:i}),S=i.querySelector("#catIcon");i.querySelectorAll(".emoji-preset-btn").forEach(e=>{e.addEventListener("click",()=>{S.value=e.textContent.trim()})}),i.addEventListener("submit",async e=>{e.preventDefault();try{const d={name:i.querySelector("#catName").value.trim(),icon:i.querySelector("#catIcon").value.trim(),parent_id:i.querySelector("#catParent").value||null,description:i.querySelector("#catDesc").value.trim()};t?await r.updateCategory(t.id,d):await r.createCategory(d),L.close(),m()}catch(d){alert(d.message)}})}m()}export{M as renderTaxonomyView};
