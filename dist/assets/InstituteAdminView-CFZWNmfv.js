const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LeaderboardModal-BTEPiycK.js","assets/index-BPiJPJV5.js","assets/index-CG2BOuPD.css","assets/QuestionBankSelectorModal-De8F_GRN.js"])))=>i.map(i=>d[i]);
import{r as b,d as U,_ as R}from"./index-BPiJPJV5.js";function ae(e){const o=document.createElement("div");return o.className="view-container fade-in",o.innerHTML=`
    <div class="saas-header">
      <div class="saas-title-group">
        <h1 id="inst-title">Institute Admin Portal 🏢</h1>
        <p id="inst-subtitle">Manage your coaching institute's students, multi-section CBT mock exams, and practice quizzes.</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <span class="institute-badge" id="inst-code-badge"><i class="ri-key-2-line"></i> Code: Loading...</span>
      </div>
    </div>

    <!-- Stats Overview Cards -->
    <div class="saas-stats-grid">
      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-user-follow-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="inst-stat-students">-</span>
          <span class="saas-stat-label">Enrolled Students</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-computer-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="inst-stat-exams">-</span>
          <span class="saas-stat-label">Live Online Exams</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-file-list-3-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="inst-stat-quizzes">-</span>
          <span class="saas-stat-label">Practice Quizzes</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 12px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px; flex-wrap: wrap;">
      <button id="tab-inst-exams" class="btn-text active" style="font-weight: 700; padding: 10px 16px; border-bottom: 3px solid var(--primary);">CBT Exam Engine</button>
      <button id="tab-inst-batches" class="btn-text" style="font-weight: 700; padding: 10px 16px; color: var(--text-muted);">🏫 Batches & Classes</button>
      <button id="tab-inst-students" class="btn-text" style="font-weight: 700; padding: 10px 16px; color: var(--text-muted);">Student Roster</button>
    </div>

    <!-- Tab 1: CBT Exam Engine -->
    <div id="section-inst-exams">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">Multi-Section Online CBT Exams</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Create scheduled CBT exams with positive/negative marking and multi-section layouts.</p>
          </div>
          <button id="btn-create-exam" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
            <i class="ri-add-circle-line"></i> Create New Online Exam
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Schedule Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="exams-table-body">
              <tr><td colspan="8" style="text-align: center; padding: 30px;">Loading institute exams...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 2: Batches & Classes -->
    <div id="section-inst-batches" style="display: none;">
      
      <!-- Pending Student Join Requests Card -->
      <div class="card" style="padding: 20px; margin-bottom: 20px; border-left: 4px solid var(--warning, #f59e0b);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
              ⏳ Pending Student Batch Join Requests
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Review and approve student requests to join specific classes and target batches.
            </p>
          </div>
          <span id="pending-requests-count-badge" class="badge" style="background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 700; font-size: 0.85rem; padding: 4px 10px; border-radius: 20px;">
            0 Pending
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Requested Batch</th>
                <th>Requested Date</th>
                <th>Action Controls</th>
              </tr>
            </thead>
            <tbody id="pending-requests-table-body">
              <tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">Loading pending requests...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Existing Batches List -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">Batches, Classes & Standards Management</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Create batches (e.g. SSC CGL Morning 2026, Class 10 Science) to target exams specifically to student groups.</p>
          </div>
          <button id="btn-create-batch" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
            <i class="ri-team-line"></i> + Create New Batch/Class
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Batch / Class Name</th>
                <th>Code</th>
                <th>Description</th>
                <th>Enrolled Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="batches-table-body">
              <tr><td colspan="5" style="text-align: center; padding: 30px;">Loading batches...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 3: Student Roster -->
    <div id="section-inst-students" style="display: none;">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">Enrolled Student Roster</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Students linked to your institute using your unique institute code.</p>
          </div>
          <button id="btn-copy-code" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;">
            <i class="ri-file-copy-line"></i> Copy Student Invite Link
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Enrolled Batch</th>
                <th>Total Attempts</th>
                <th>Average Accuracy</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody id="students-table-body">
              <tr><td colspan="7" style="text-align: center; padding: 30px;">Loading student roster...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Create / Edit Online CBT Exam -->
    <div id="modal-create-exam" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
      <div class="card" style="width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; padding: 24px; background: var(--card-bg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 id="modal-exam-heading" style="font-size: 1.3rem; font-weight: 800;">Create Online CBT Exam</h3>
          <button id="close-modal-exam" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <form id="form-create-exam">
          <input type="hidden" id="edit-exam-id" value="">

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Exam Title *</label>
            <input type="text" id="exam-title" class="form-control" placeholder="e.g. Competitive Mock Test #01" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label">Multilevel Category Bundle</label>
              <select id="exam-category-id" class="form-control">
                <option value="">-- Select Category / Subcategory --</option>
              </select>
              <div id="exam-category-hint" style="font-size:0.8rem; color:var(--danger); font-weight:600; margin-top:4px; display:none;">
                ⚠️ Global Open Tests require selecting a standardized Global Master Category (created by Super Admin). Private categories are disabled.
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Exam Type</label>
              <select id="exam-type" class="form-control">
                <option value="COMPETITIVE">Competitive Exam (UPSC, SSC, Bank)</option>
                <option value="ENTRANCE">Entrance Test (GATE, JEE, NEET)</option>
                <option value="SELECTION">Selection & Recruitment Exam</option>
                <option value="ACADEMIC">Academic Test (School/University)</option>
                <option value="MOCK_TEST">Full Mock Test Series</option>
                <option value="CUSTOM">Custom Exam Series</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label">Access Visibility</label>
              <select id="exam-visibility" class="form-control">
                <option value="private">Coaching Students Only (Private)</option>
                <option value="public">Global Open Test (Public for All)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Exam Mode</label>
              <select id="exam-mode" class="form-control">
                <option value="actual">Actual Exam (Fixed Time Window)</option>
                <option value="practice">Practice Mode (Anytime)</option>
              </select>
            </div>
          </div>

          <!-- Target Batch / Class Allocation -->
          <div class="form-group" style="margin-bottom: 14px; background: var(--bg-color); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
            <label class="form-label" style="font-weight: 700; color: var(--primary);">🎯 Target Batch / Class Allocation</label>
            <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 8px;">
              <label style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer;">
                <input type="radio" name="batch_allocation_mode" value="all" checked style="width: 16px; height: 16px;">
                <span>🌐 All Batches (Visible to all students in institute)</span>
              </label>
              <label style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer;">
                <input type="radio" name="batch_allocation_mode" value="specific" style="width: 16px; height: 16px;">
                <span>🎯 Target Specific Batches/Classes</span>
              </label>
            </div>
            <div id="exam-batch-checklist" style="display: none; margin-top: 10px; padding: 10px; background: var(--card-bg); border-radius: 6px; max-height: 120px; overflow-y: auto;">
              <span style="font-size: 0.82rem; color: var(--text-muted);">Loading institute batches...</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label">Duration (Mins)</label>
              <input type="number" id="exam-duration" class="form-control" value="60" min="5" required>
            </div>
            <div class="form-group">
              <label class="form-label">+ Marks (Correct)</label>
              <input type="number" step="0.25" id="exam-pos" class="form-control" value="2.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">- Marks (Wrong)</label>
              <input type="number" step="0.25" id="exam-neg" class="form-control" value="0.50" required>
            </div>
          </div>

          <!-- Exam Tags Selection -->
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Exam Tags (Select multiple)</label>
            <div id="exam-tags-container" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; max-height: 100px; overflow-y: auto;">
              <span style="font-size: 0.82rem; color: var(--text-muted);">Loading tags...</span>
            </div>
          </div>

          <!-- Custom Exam Instructions -->
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Custom Exam Instructions (Rendered in Exam Lobby)</label>
            <textarea id="exam-instructions" class="form-control" rows="3" placeholder="e.g. 1. Scientific calculators are not allowed.&#10;2. Each section has a 15 minute target timing."></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
            <div class="form-group">
              <label class="form-label">Scheduled Start (Optional)</label>
              <input type="datetime-local" id="exam-start" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Scheduled End (Optional)</label>
              <input type="datetime-local" id="exam-end" class="form-control">
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" id="cancel-modal-exam" class="btn btn-outline">Cancel</button>
            <button type="submit" id="submit-modal-exam" class="btn btn-primary">Create Exam</button>
          </div>
        </form>
      </div>
    </div>
  `,setTimeout(()=>{X(o),$(o)},0),o}let I=[],N=[],D=[];async function $(e){try{let w=function(){if(!u||!l)return;const c=u.value==="public",x=l.querySelector("#exam-optgroup-private");if(x){const E=x.querySelectorAll("option");c?(x.style.display="none",E.forEach(h=>{h.disabled=!0}),C.has(l.value)&&(l.value=""),v&&(v.style.display="block")):(x.style.display="",E.forEach(h=>{h.disabled=!1}),v&&(v.style.display="none"))}};const i=(await b("/auth/me")).user;if(i.institute_name&&(e.querySelector("#inst-title").textContent=`${i.institute_name} Admin Portal 🏢`),i.institute_code&&(e.querySelector("#inst-code-badge").innerHTML=`<i class="ri-key-2-line"></i> Code: ${i.institute_code}`),!i.institute_id&&i.role!=="super_admin"){e.querySelector("#exams-table-body").innerHTML='<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Your account is not assigned to a coaching institute yet. Contact Super Admin.</td></tr>';return}const[t,d,a,y,k,L,_]=await Promise.all([b("/exams"),i.institute_id?b(`/institutes/${i.institute_id}/students`):Promise.resolve({students:[]}),b("/quizzes"),b("/categories").catch(()=>({flatCategories:[]})),b("/tags").catch(()=>({tags:[]})),b("/exams/batches/all").catch(()=>({batches:[]})),i.institute_id?b(`/institutes/${i.institute_id}`).catch(()=>null):Promise.resolve(null)]);if(I=t.exams||[],N=d.students||[],D=L.batches||[],_&&_.institute){const c=_.institute,x=window.location.origin,E=window.location.port?`:${window.location.port}`:"",h=c.slug||c.code,p=`http://${h}.localhost${E}`,O=`${x}/?institute=${h}`,r=e.querySelector("#branding-subdomain-url"),B=e.querySelector("#branding-fallback-url");r&&(r.value=p),B&&(B.value=O);const s=e.querySelector("#brand-name"),n=e.querySelector("#brand-slug"),m=e.querySelector("#brand-logo"),g=e.querySelector("#brand-color"),f=e.querySelector("#brand-color-picker"),S=e.querySelector("#brand-title"),q=e.querySelector("#brand-subtitle"),A=e.querySelector("#brand-banner"),P=e.querySelector("#brand-allow-global");s&&(s.value=c.name||""),n&&(n.value=c.slug||""),m&&(m.value=c.logo_url||""),g&&(g.value=c.primary_color||"#4f46e5"),f&&(f.value=c.primary_color||"#4f46e5"),S&&(S.value=c.welcome_title||""),q&&(q.value=c.welcome_subtitle||""),A&&(A.value=c.banner_url||""),P&&(P.checked=c.allow_global_content!==0)}const l=e.querySelector("#exam-category-id"),u=e.querySelector("#exam-visibility"),v=e.querySelector("#exam-category-hint");let C=new Set;if(l){const c=y.flatCategories||[],x=c.filter(p=>!p.institute_id||p.is_global),E=c.filter(p=>p.institute_id&&!p.is_global);C=new Set(E.map(p=>p.id.toString()));let h='<option value="">-- Select Category / Subcategory --</option>';x.length>0&&(h+='<optgroup label="🌐 Global Master Categories (For Public & Private Exams)">'+x.map(p=>`<option value="${p.id}" data-type="global">${p.icon||"📂"} ${p.name}</option>`).join("")+"</optgroup>"),E.length>0&&(h+='<optgroup id="exam-optgroup-private" label="🏫 My Institute Private Categories (Internal Exams Only)">'+E.map(p=>`<option value="${p.id}" data-type="private">${p.icon||"📂"} ${p.name}</option>`).join("")+"</optgroup>"),l.innerHTML=h}u&&(u.addEventListener("change",w),w());const T=e.querySelector("#exam-tags-container");if(T){const c=k.tags||[];c.length===0?T.innerHTML='<span style="font-size:0.82rem; color:var(--text-muted);">No tags created yet. Add tags in Quiz Manager!</span>':T.innerHTML=c.map(x=>`
          <label style="display:inline-flex; align-items:center; gap:4px; font-size:0.82rem; cursor:pointer; background:var(--bg-color); padding:4px 8px; border-radius:4px; border:1px solid var(--border-color);">
            <input type="checkbox" class="exam-tag-cb" value="${x.id}">
            <span>${x.name}</span>
          </label>
        `).join("")}const M=e.querySelector("#exam-batch-checklist");M&&(D.length===0?M.innerHTML='<span style="font-size:0.82rem; color:var(--text-muted);">No custom batches created yet. All exams apply to General Batch.</span>':M.innerHTML=D.map(c=>`
          <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; cursor:pointer; padding:4px 0;">
            <input type="checkbox" class="exam-batch-cb" value="${c.id}">
            <span><strong>${c.name}</strong> ${c.code?`(${c.code})`:""}</span>
          </label>
        `).join("")),e.querySelector("#inst-stat-exams").textContent=I.length,e.querySelector("#inst-stat-students").textContent=N.length,e.querySelector("#inst-stat-quizzes").textContent=(a.quizzes||[]).length,K(e,I),W(e,D),Y(e,N),V(e)}catch(o){console.error("Failed to load institute admin data:",o)}}async function V(e){const o=e.querySelector("#pending-requests-table-body"),i=e.querySelector("#pending-requests-count-badge");if(o)try{const d=(await b("/exams/batches/pending-requests")).requests||[];if(i&&(i.textContent=`${d.length} Pending`),d.length===0){o.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No pending student batch join requests.</td></tr>';return}o.innerHTML=d.map(a=>`
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${a.student_name}</td>
        <td>${a.student_email}</td>
        <td>
          <span class="badge-tag" style="background: rgba(79, 70, 229, 0.1); color: var(--primary); font-weight: 700;">
            ${a.batch_name} ${a.batch_code?`(${a.batch_code})`:""}
          </span>
        </td>
        <td>${new Date(a.created_at).toLocaleDateString()}</td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-success btn-approve-batch-req" data-uid="${a.user_id}" data-bid="${a.batch_id}" style="padding: 4px 10px; font-weight: 700;">
              ✓ Approve
            </button>
            <button class="btn btn-sm btn-secondary btn-reject-batch-req" data-uid="${a.user_id}" data-bid="${a.batch_id}" style="padding: 4px 10px; color: #ef4444;">
              ✕ Reject
            </button>
          </div>
        </td>
      </tr>
    `).join(""),o.querySelectorAll(".btn-approve-batch-req").forEach(a=>{a.addEventListener("click",async()=>{a.disabled=!0,a.textContent="Approving...";try{await b("/exams/batches/approve-request",{method:"POST",body:JSON.stringify({user_id:a.dataset.uid,batch_id:a.dataset.bid,action:"approve"})}),$(e)}catch(y){alert("Error approving request: "+y.message),a.disabled=!1}})}),o.querySelectorAll(".btn-reject-batch-req").forEach(a=>{a.addEventListener("click",async()=>{a.disabled=!0,a.textContent="Rejecting...";try{await b("/exams/batches/approve-request",{method:"POST",body:JSON.stringify({user_id:a.dataset.uid,batch_id:a.dataset.bid,action:"reject"})}),$(e)}catch(y){alert("Error rejecting request: "+y.message),a.disabled=!1}})})}catch(t){console.error("Error loading pending batch requests:",t),o.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Failed to load pending requests.</td></tr>'}}function W(e,o){const i=e.querySelector("#batches-table-body");if(i){if(!o||o.length===0){i.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">No custom batches created yet. Click "+ Create New Batch/Class" above to add one.</td></tr>';return}i.innerHTML=o.map(t=>`
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${t.name}</td>
      <td><span class="badge-tag">${t.code||"DEFAULT"}</span></td>
      <td style="color: var(--text-muted); font-size: 0.88rem;">${t.description||"-"}</td>
      <td style="font-weight: 700;">${t.student_count||0} Students</td>
      <td>
        <button class="icon-action-btn btn-danger btn-delete-batch" data-id="${t.id}" title="Delete Batch">
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    </tr>
  `).join(""),i.querySelectorAll(".btn-delete-batch").forEach(t=>{t.addEventListener("click",async()=>{if(confirm("Delete this batch? Enrolled students will revert to general access."))try{await b(`/exams/batches/${t.dataset.id}`,{method:"DELETE"}),$(e)}catch(d){alert(d.message)}})})}}function K(e,o){const i=e.querySelector("#exams-table-body");if(!o||o.length===0){i.innerHTML='<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No exams created yet. Click "Create New Online Exam" above to add one.</td></tr>';return}i.innerHTML=o.map(t=>`
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">
        ${t.title}
        ${t.category_name?`<div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal; margin-top:2px;">${t.category_icon||"📂"} ${t.category_name}</div>`:""}
        ${t.tag_names?`<div style="margin-top:4px;">${t.tag_names.split(",").map(d=>`<span class="badge-tag" style="font-size:0.7rem; margin-right:4px;">#${d.trim()}</span>`).join("")}</div>`:""}
      </td>
      <td><span class="badge-tag">${t.exam_type}</span></td>
      <td><span style="text-transform: capitalize; font-weight: 600;">${t.mode}</span></td>
      <td>${t.total_duration_mins} Mins</td>
      <td>+${parseFloat(t.positive_marks).toFixed(2)} / -${parseFloat(t.negative_marks).toFixed(2)}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">
        ${t.scheduled_start?new Date(t.scheduled_start).toLocaleString():"Anytime"}
      </td>
      <td>
        <span class="status-badge ${t.is_published?"status-active":"status-inactive"}">
          ${t.is_published?"Published":"Draft"}
        </span>
      </td>
      <td>
        <div class="table-action-group">
          <button class="icon-action-btn btn-primary-accent btn-manage-exam-q" data-id="${t.id}" title="Manage Exam Sections & Questions">
            <i class="ri-list-check-2"></i>
          </button>
          <button class="icon-action-btn btn-edit-exam" data-id="${t.id}" title="Edit Exam Details & Instructions">
            <i class="ri-edit-line"></i>
          </button>
          <button class="icon-action-btn btn-toggle-publish" data-id="${t.id}" data-pub="${t.is_published}" title="${t.is_published?"Unpublish Exam":"Publish Exam"}">
            <i class="${t.is_published?"ri-eye-off-line":"ri-eye-line"}"></i>
          </button>
          <button class="icon-action-btn btn-view-leaderboard" data-id="${t.id}" title="View Student Leaderboard & Class Analytics">
            <i class="ri-trophy-line"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join(""),i.querySelectorAll(".btn-manage-exam-q").forEach(t=>{t.addEventListener("click",()=>{const d=t.dataset.id,a=I.find(y=>y.id==d);a&&Z(e,a)})}),i.querySelectorAll(".btn-edit-exam").forEach(t=>{t.addEventListener("click",()=>{const d=t.dataset.id,a=I.find(k=>k.id==d);if(!a)return;const y=e.querySelector("#modal-create-exam");e.querySelector("#modal-exam-heading").textContent="✏️ Edit Online CBT Exam",e.querySelector("#edit-exam-id").value=a.id,e.querySelector("#exam-title").value=a.title||"",e.querySelector("#exam-duration").value=a.total_duration_mins||60,e.querySelector("#exam-pos").value=a.positive_marks||2,e.querySelector("#exam-neg").value=a.negative_marks||.5,e.querySelector("#exam-instructions").value=a.instructions||"",e.querySelector("#exam-type").value=a.exam_type||"COMPETITIVE",e.querySelector("#exam-mode").value=a.mode||"actual",e.querySelector("#exam-category-id")&&(e.querySelector("#exam-category-id").value=a.category_id||""),e.querySelector("#exam-visibility")&&(e.querySelector("#exam-visibility").value=a.is_public?"public":"private"),a.scheduled_start&&(e.querySelector("#exam-start").value=new Date(a.scheduled_start).toISOString().slice(0,16)),a.scheduled_end&&(e.querySelector("#exam-end").value=new Date(a.scheduled_end).toISOString().slice(0,16)),y.style.display="flex"})}),i.querySelectorAll(".btn-toggle-publish").forEach(t=>{t.addEventListener("click",async()=>{const d=t.dataset.id,a=t.dataset.pub==="true"||t.dataset.pub==="1";try{await b(`/exams/${d}`,{method:"PUT",body:JSON.stringify({is_published:!a})}),$(e)}catch{alert("Error updating exam status.")}})}),i.querySelectorAll(".btn-view-leaderboard").forEach(t=>{t.addEventListener("click",async()=>{const d=t.dataset.id,{renderLeaderboardModal:a}=await R(async()=>{const{renderLeaderboardModal:y}=await import("./LeaderboardModal-BTEPiycK.js");return{renderLeaderboardModal:y}},__vite__mapDeps([0,1,2]));a(d)})})}function Y(e,o){const i=e.querySelector("#students-table-body");if(!o||o.length===0){i.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No students have joined your institute yet. Share your institute code for them to register!</td></tr>';return}i.innerHTML=o.map(t=>`
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${t.full_name}</td>
      <td>${t.email}</td>
      <td>${t.phone_number||"-"}</td>
      <td><span class="badge-tag" style="background:var(--accent-light); color:var(--accent); font-weight:700;">${t.batch_name||"General Batch"}</span></td>
      <td style="font-weight: 700;">${t.attempts_count||0}</td>
      <td>
        <span style="font-weight: 700; color: ${t.avg_accuracy>=70?"var(--success)":"var(--text-main)"};">
          ${t.avg_accuracy?Math.round(t.avg_accuracy)+"%":"-"}
        </span>
      </td>
      <td>${new Date(t.created_at).toLocaleDateString()}</td>
    </tr>
  `).join("")}function X(e){const o=e.querySelector("#tab-inst-exams"),i=e.querySelector("#tab-inst-batches"),t=e.querySelector("#tab-inst-students"),d=e.querySelector("#tab-inst-branding"),a=e.querySelector("#section-inst-exams"),y=e.querySelector("#section-inst-batches"),k=e.querySelector("#section-inst-students"),L=e.querySelector("#section-inst-branding"),_=(s,n)=>{[o,i,t,d].forEach(m=>{m&&(m.classList.remove("active"),m.style.borderBottom="none",m.style.color="var(--text-muted)")}),[a,y,k,L].forEach(m=>{m&&(m.style.display="none")}),s&&n&&(s.classList.add("active"),s.style.borderBottom="3px solid var(--primary)",s.style.color="var(--text-main)",n.style.display="block")};o&&o.addEventListener("click",()=>_(o,a)),i&&i.addEventListener("click",()=>_(i,y)),t&&t.addEventListener("click",()=>_(t,k)),d&&d.addEventListener("click",()=>_(d,L));const l=e.querySelector("#btn-copy-subdomain"),u=e.querySelector("#btn-copy-fallback"),v=e.querySelector("#branding-subdomain-url"),C=e.querySelector("#branding-fallback-url");l&&v&&l.addEventListener("click",()=>{navigator.clipboard.writeText(v.value),l.textContent="Copied! ✓",setTimeout(()=>l.textContent="Copy",2e3)}),u&&C&&u.addEventListener("click",()=>{navigator.clipboard.writeText(C.value),u.textContent="Copied! ✓",setTimeout(()=>u.textContent="Copy",2e3)});const w=e.querySelector("#brand-color-picker"),T=e.querySelector("#brand-color");w&&T&&(w.addEventListener("input",s=>T.value=s.target.value),T.addEventListener("input",s=>w.value=s.target.value));const M=e.querySelector("#form-branding");M&&M.addEventListener("submit",async s=>{s.preventDefault();const n=e.querySelector("#btn-save-branding");try{n.disabled=!0,n.textContent="Saving Branding...";const m={name:e.querySelector("#brand-name").value,slug:e.querySelector("#brand-slug").value,logo_url:e.querySelector("#brand-logo").value,primary_color:e.querySelector("#brand-color").value,welcome_title:e.querySelector("#brand-title").value,welcome_subtitle:e.querySelector("#brand-subtitle").value,banner_url:e.querySelector("#brand-banner").value,allow_global_content:e.querySelector("#brand-allow-global").checked},g=await b("/institutes/my-branding",{method:"PUT",body:JSON.stringify(m)});if(alert("✅ Portal branding saved successfully!"),g.institute){e.querySelector("#brand-slug").value=g.institute.slug;const f=window.location.origin,S=window.location.port?`:${window.location.port}`:"",q=g.institute.slug||g.institute.code;v&&(v.value=`http://${q}.localhost${S}`),C&&(C.value=`${f}/?institute=${q}`)}}catch(m){alert(m.message||"Error saving portal branding.")}finally{n.disabled=!1,n.textContent="💾 Save Portal Branding"}});const c=e.querySelectorAll('input[name="batch_allocation_mode"]'),x=e.querySelector("#exam-batch-checklist");c.forEach(s=>{s.addEventListener("change",n=>{x&&(x.style.display=n.target.value==="specific"?"block":"none")})});const E=e.querySelector("#btn-create-batch");E&&E.addEventListener("click",()=>{const s=document.createElement("form");s.innerHTML=`
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-weight: 700;">Batch / Class Name *</label>
          <input type="text" id="new-batch-name" class="form-control" placeholder="e.g. SSC CGL Morning 2026, Class 10 Science" required style="padding: 10px;" />
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-weight: 700;">Batch Code (Optional)</label>
          <input type="text" id="new-batch-code" class="form-control" placeholder="e.g. BATCH-CGL-01" style="padding: 10px; text-transform: uppercase;" />
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" style="font-weight: 700;">Description / Target Exam Notes (Optional)</label>
          <textarea id="new-batch-desc" class="form-control" rows="3" placeholder="Enter batch timing, target competitive exam, or class schedule details..."></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" id="btn-cancel-batch-modal" class="btn btn-outline">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight: 700;">Create Batch →</button>
        </div>
      `;const n=U({title:"🏫 Create New Batch / Class",content:s});s.querySelector("#btn-cancel-batch-modal").addEventListener("click",()=>n.close()),s.addEventListener("submit",async m=>{m.preventDefault();const g=s.querySelector("#new-batch-name").value.trim(),f=s.querySelector("#new-batch-code").value.trim(),S=s.querySelector("#new-batch-desc").value.trim();if(g)try{await b("/exams/batches",{method:"POST",body:JSON.stringify({name:g,code:f,description:S})}),n.close(),$(e)}catch(q){alert(q.message||"Error creating batch.")}})});const h=()=>{let s=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(!s)return;document.body.contains(s)||document.body.appendChild(s);const n=s.querySelector("#modal-exam-heading"),m=s.querySelector("#edit-exam-id"),g=s.querySelector("#submit-modal-exam"),f=s.querySelector("#form-create-exam"),S=s.querySelector("#exam-batch-checklist");n&&(n.textContent="Create Online CBT Exam"),m&&(m.value=""),g&&(g.textContent="Create Exam"),f&&f.reset(),S&&(S.style.display="none"),s.style.display="flex",s.style.position="fixed",s.style.inset="0",s.style.zIndex="99999",s.style.background="rgba(15, 23, 42, 0.75)",s.style.backdropFilter="blur(4px)",s.style.alignItems="center",s.style.justifyContent="center"},p=()=>{const s=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(!s)return;const n=s.querySelector("#form-create-exam");s.style.display="none",n&&n.reset()},O=s=>{s.target.closest("#btn-create-exam, .btn-open-create-exam")&&(s.preventDefault(),h())};e.removeEventListener("click",O),e.addEventListener("click",O);const r=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(r){const s=r.querySelector("#close-modal-exam"),n=r.querySelector("#cancel-modal-exam");s&&s.addEventListener("click",p),n&&n.addEventListener("click",p),r.addEventListener("click",g=>{g.target===r&&p()});const m=r.querySelector("#form-create-exam");m&&m.addEventListener("submit",async g=>{var F,G,Q;g.preventDefault();const f=((F=r.querySelector("#edit-exam-id"))==null?void 0:F.value)||"",S=r.querySelector("#exam-visibility")?r.querySelector("#exam-visibility").value:"private",q=r.querySelector("#exam-category-id"),A=q&&q.selectedIndex>=0?q.options[q.selectedIndex]:null;if(S==="public"&&A&&((G=A.dataset)==null?void 0:G.type)==="private"){alert("To publish a Global Open Test, you must select a Global Master Category (created by Super Admin). Private categories cannot be used for global tests.");return}const P=Array.from(r.querySelectorAll(".exam-tag-cb:checked")).map(z=>parseInt(z.value,10)),H=(((Q=r.querySelector('input[name="batch_allocation_mode"]:checked'))==null?void 0:Q.value)||"all")==="all",J=H?[]:Array.from(r.querySelectorAll(".exam-batch-cb:checked")).map(z=>parseInt(z.value,10)),j={title:r.querySelector("#exam-title").value.trim(),category_id:r.querySelector("#exam-category-id").value?parseInt(r.querySelector("#exam-category-id").value,10):null,exam_type:r.querySelector("#exam-type").value,mode:r.querySelector("#exam-mode").value||"actual",is_public:S==="public",total_duration_mins:parseInt(r.querySelector("#exam-duration").value,10),positive_marks:parseFloat(r.querySelector("#exam-pos").value),negative_marks:parseFloat(r.querySelector("#exam-neg").value),instructions:r.querySelector("#exam-instructions").value.trim()||null,tag_ids:P,is_all_batches:H,batch_ids:J,scheduled_start:r.querySelector("#exam-start").value||null,scheduled_end:r.querySelector("#exam-end").value||null};try{f?(await b(`/exams/${f}`,{method:"PUT",body:JSON.stringify(j)}),alert(`Exam "${j.title}" updated successfully!`)):(await b("/exams",{method:"POST",body:JSON.stringify(j)}),alert(`Online Exam "${j.title}" created successfully!`)),p(),$(e)}catch(z){alert(`Error saving exam: ${z.message}`)}})}const B=e.querySelector("#btn-copy-code");B&&B.addEventListener("click",async()=>{try{const n=(await b("/auth/me")).user.institute_code;n&&(await navigator.clipboard.writeText(n),alert(`Institute Code "${n}" copied to clipboard! Share this code with your students.`))}catch{alert("Failed to copy code.")}})}async function Z(e,o){const i=document.createElement("div");i.className="modal-backdrop fade-in",i.style.cssText=`
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  `,i.innerHTML=`
    <div class="card" style="width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
      <!-- Modal Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 4px;">📋 Exam Section Question Builder</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            Exam: <strong>${o.title}</strong> (${o.total_duration_mins} Mins | +${parseFloat(o.positive_marks).toFixed(1)} / -${parseFloat(o.negative_marks).toFixed(1)})
          </p>
        </div>
        <button id="close-builder-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer;">&times;</button>
      </div>

      <!-- Sections & Questions Body -->
      <div id="builder-body-content" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; padding-right: 6px;">
        <div style="text-align: center; color: var(--text-muted); padding: 40px;">
          Loading exam sections and attached questions...
        </div>
      </div>

      <!-- Footer -->
      <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: 12px;">
        <button id="done-builder-modal" class="btn btn-primary">Done / Close</button>
      </div>
    </div>
  `,document.body.appendChild(i);const t=()=>i.remove();i.querySelector("#close-builder-modal").addEventListener("click",t),i.querySelector("#done-builder-modal").addEventListener("click",t),await d();async function d(){const a=i.querySelector("#builder-body-content");try{const k=(await b(`/exams/${o.id}/sections-questions`)).sections||[];if(k.length===0){a.innerHTML=`
          <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
            No sections created in this exam yet.
          </div>
        `;return}const{openQuestionBankSelectorModal:L}=await R(async()=>{const{openQuestionBankSelectorModal:l}=await import("./QuestionBankSelectorModal-De8F_GRN.js");return{openQuestionBankSelectorModal:l}},__vite__mapDeps([3,1,2])),{renderMath:_}=await R(async()=>{const{renderMath:l}=await import("./index-BPiJPJV5.js").then(u=>u.j);return{renderMath:l}},__vite__mapDeps([1,2]));a.innerHTML=k.map(l=>`
        <div class="card" style="padding: 18px; border: 1px solid var(--border-color); background: var(--bg-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">
                📁 ${l.section_name}
              </h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                ${l.questions?l.questions.length:0} Question(s) Attached
              </span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm btn-attach-bank" data-secid="${l.id}" data-secname="${l.section_name}">
                <i class="ri-link"></i> ➕ Attach Questions from Master Bank
              </button>
            </div>
          </div>

          <!-- Questions attached to this section -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${!l.questions||l.questions.length===0?`
              <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; padding: 12px; text-align: center;">
                No questions attached to this section yet. Click "Attach Questions from Master Bank" above to add questions!
              </div>
            `:l.questions.map((u,v)=>`
              <div class="card" style="padding: 12px 14px; background: var(--card-bg); border-left: 3px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary);">Question #${v+1} (Bank ID: #${u.id})</span>
                  <button class="btn btn-outline btn-sm btn-detach-q" data-secid="${l.id}" data-qid="${u.id}" style="color: var(--danger); border-color: var(--danger);" title="Remove this question from exam (keeps question in Master Bank)">
                    ❌ Detach from Exam
                  </button>
                </div>
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;" class="katex-render">
                  ${u.question_text_en}
                </div>
                <div style="display: flex; gap: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                  ${(u.options_en||[]).map((C,w)=>`
                    <span style="color: ${w===u.correct_option_index?"var(--success)":"inherit"}; font-weight: ${w===u.correct_option_index?"bold":"normal"};">
                      ${String.fromCharCode(65+w)}: <span class="katex-render">${C}</span> ${w===u.correct_option_index?"✓":""}
                    </span>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join(""),_(a),a.querySelectorAll(".btn-attach-bank").forEach(l=>{l.addEventListener("click",()=>{const u=parseInt(l.dataset.secid,10),v=l.dataset.secname;L(u,v,o.title,()=>{d(),$(e)})})}),a.querySelectorAll(".btn-detach-q").forEach(l=>{l.addEventListener("click",async()=>{const u=l.dataset.secid,v=l.dataset.qid;if(confirm("Detach this question from the exam? (The question will remain safe in your Master Question Bank)"))try{await b(`/exams/sections/${u}/detach-questions/${v}`,{method:"DELETE"}),d(),$(e)}catch{alert("Error detaching question from exam.")}})})}catch(y){console.error("Error loading builder content:",y),a.innerHTML=`<div style="color: var(--danger); padding: 20px;">Error loading exam sections: ${y.message}</div>`}}}export{ae as renderInstituteAdminView};
