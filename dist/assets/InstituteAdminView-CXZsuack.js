const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LeaderboardModal-zMBhbrfR.js","assets/index-Bv_9YFTr.js","assets/index-CT652Wiu.css","assets/QuestionBankSelectorModal-BXAazssJ.js"])))=>i.map(i=>d[i]);
import{r as b,c as Z,_ as G}from"./index-Bv_9YFTr.js";function re(e){const o=document.createElement("div");return o.className="view-container fade-in",o.innerHTML=`
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

          <!-- Dynamic Exam Sections Setup (1 to 10 Sections) -->
          <div class="form-group" style="margin-bottom: 14px; background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label class="form-label" style="font-weight: 700; color: var(--primary); margin: 0;">📁 Exam Sections (1 to 10 Sections)</label>
              <span style="font-size: 0.8rem; color: var(--text-muted);" id="sec-count-badge">1 / 10 Sections</span>
            </div>
            <div style="margin-bottom: 10px; display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline btn-sm btn-sec-preset" data-preset="single">🚀 1 Sec (General)</button>
              <button type="button" class="btn btn-outline btn-sm btn-sec-preset" data-preset="ssc">📚 SSC (4 Sec)</button>
              <button type="button" class="btn btn-outline btn-sm btn-sec-preset" data-preset="bank">🏦 Bank PO (3 Sec)</button>
            </div>
            <div id="exam-sections-input-container" style="display: flex; flex-direction: column; gap: 8px;">
              <div class="sec-input-row" style="display: flex; gap: 8px; align-items: center;">
                <input type="text" class="form-control exam-sec-name-input" value="General" placeholder="Section Name (e.g. Quantitative Aptitude)" required>
                <button type="button" class="btn btn-outline btn-sm btn-remove-sec-row" style="color: var(--danger); border-color: var(--danger);" title="Remove section">&times;</button>
              </div>
            </div>
            <button type="button" id="btn-add-sec-input-row" class="btn btn-outline btn-sm" style="margin-top: 10px; display: inline-flex; align-items: center; gap: 4px;">
              ➕ Add Section
            </button>
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
  `,setTimeout(()=>{ie(o),C(o)},0),o}let N=[],F=[],H=[];async function C(e){try{let m=function(){if(!$||!w)return;const l=$.value==="public",h=w.querySelector("#exam-optgroup-private");if(h){const L=h.querySelectorAll("option");l?(h.style.display="none",L.forEach(k=>{k.disabled=!0}),r.has(w.value)&&(w.value=""),s&&(s.style.display="block")):(h.style.display="",L.forEach(k=>{k.disabled=!1}),s&&(s.style.display="none"))}};const n=(await b("/auth/me")).user;if(n.institute_name&&(e.querySelector("#inst-title").textContent=`${n.institute_name} Admin Portal 🏢`),n.institute_code&&(e.querySelector("#inst-code-badge").innerHTML=`<i class="ri-key-2-line"></i> Code: ${n.institute_code}`),!n.institute_id&&n.role!=="super_admin"){e.querySelector("#exams-table-body").innerHTML='<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Your account is not assigned to a coaching institute yet. Contact Super Admin.</td></tr>';return}const[t,c,a,x,S,z,A]=await Promise.all([b("/exams"),n.institute_id?b(`/institutes/${n.institute_id}/students`):Promise.resolve({students:[]}),b("/quizzes"),b("/categories").catch(()=>({flatCategories:[]})),b("/tags").catch(()=>({tags:[]})),b("/exams/batches/all").catch(()=>({batches:[]})),n.institute_id?b(`/institutes/${n.institute_id}`).catch(()=>null):Promise.resolve(null)]);if(N=t.exams||[],F=c.students||[],H=z.batches||[],A&&A.institute){const l=A.institute,h=window.location.origin,L=window.location.port?`:${window.location.port}`:"",k=l.slug||l.code,y=`http://${k}.localhost${L}`,R=`${h}/?institute=${k}`,d=e.querySelector("#branding-subdomain-url"),O=e.querySelector("#branding-fallback-url");d&&(d.value=y),O&&(O.value=R);const i=e.querySelector("#brand-name"),p=e.querySelector("#brand-slug"),u=e.querySelector("#brand-logo"),f=e.querySelector("#brand-color"),T=e.querySelector("#brand-color-picker"),_=e.querySelector("#brand-title"),M=e.querySelector("#brand-subtitle"),P=e.querySelector("#brand-banner"),v=e.querySelector("#brand-allow-global");i&&(i.value=l.name||""),p&&(p.value=l.slug||""),u&&(u.value=l.logo_url||""),f&&(f.value=l.primary_color||"#4f46e5"),T&&(T.value=l.primary_color||"#4f46e5"),_&&(_.value=l.welcome_title||""),M&&(M.value=l.welcome_subtitle||""),P&&(P.value=l.banner_url||""),v&&(v.checked=l.allow_global_content!==0)}const w=e.querySelector("#exam-category-id"),$=e.querySelector("#exam-visibility"),s=e.querySelector("#exam-category-hint");let r=new Set;if(w){const l=x.flatCategories||[],h=l.filter(y=>!y.institute_id||y.is_global),L=l.filter(y=>y.institute_id&&!y.is_global);r=new Set(L.map(y=>y.id.toString()));let k='<option value="">-- Select Category / Subcategory --</option>';h.length>0&&(k+='<optgroup label="🌐 Global Master Categories (For Public & Private Exams)">'+h.map(y=>`<option value="${y.id}" data-type="global">${y.icon||"📂"} ${y.name}</option>`).join("")+"</optgroup>"),L.length>0&&(k+='<optgroup id="exam-optgroup-private" label="🏫 My Institute Private Categories (Internal Exams Only)">'+L.map(y=>`<option value="${y.id}" data-type="private">${y.icon||"📂"} ${y.name}</option>`).join("")+"</optgroup>"),w.innerHTML=k}$&&($.addEventListener("change",m),m());const g=e.querySelector("#exam-tags-container");if(g){const l=S.tags||[];l.length===0?g.innerHTML='<span style="font-size:0.82rem; color:var(--text-muted);">No tags created yet. Add tags in Quiz Manager!</span>':g.innerHTML=l.map(h=>`
          <label style="display:inline-flex; align-items:center; gap:4px; font-size:0.82rem; cursor:pointer; background:var(--bg-color); padding:4px 8px; border-radius:4px; border:1px solid var(--border-color);">
            <input type="checkbox" class="exam-tag-cb" value="${h.id}">
            <span>${h.name}</span>
          </label>
        `).join("")}const q=e.querySelector("#exam-batch-checklist");q&&(H.length===0?q.innerHTML='<span style="font-size:0.82rem; color:var(--text-muted);">No custom batches created yet. All exams apply to General Batch.</span>':q.innerHTML=H.map(l=>`
          <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; cursor:pointer; padding:4px 0;">
            <input type="checkbox" class="exam-batch-cb" value="${l.id}">
            <span><strong>${l.name}</strong> ${l.code?`(${l.code})`:""}</span>
          </label>
        `).join("")),e.querySelector("#inst-stat-exams").textContent=N.length,e.querySelector("#inst-stat-students").textContent=F.length,e.querySelector("#inst-stat-quizzes").textContent=(a.quizzes||[]).length,ae(e,N),te(e,H),se(e,F),ee(e)}catch(o){console.error("Failed to load institute admin data:",o)}}async function ee(e){const o=e.querySelector("#pending-requests-table-body"),n=e.querySelector("#pending-requests-count-badge");if(o)try{const c=(await b("/exams/batches/pending-requests")).requests||[];if(n&&(n.textContent=`${c.length} Pending`),c.length===0){o.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No pending student batch join requests.</td></tr>';return}o.innerHTML=c.map(a=>`
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
    `).join(""),o.querySelectorAll(".btn-approve-batch-req").forEach(a=>{a.addEventListener("click",async()=>{a.disabled=!0,a.textContent="Approving...";try{await b("/exams/batches/approve-request",{method:"POST",body:JSON.stringify({user_id:a.dataset.uid,batch_id:a.dataset.bid,action:"approve"})}),C(e)}catch(x){alert("Error approving request: "+x.message),a.disabled=!1}})}),o.querySelectorAll(".btn-reject-batch-req").forEach(a=>{a.addEventListener("click",async()=>{a.disabled=!0,a.textContent="Rejecting...";try{await b("/exams/batches/approve-request",{method:"POST",body:JSON.stringify({user_id:a.dataset.uid,batch_id:a.dataset.bid,action:"reject"})}),C(e)}catch(x){alert("Error rejecting request: "+x.message),a.disabled=!1}})})}catch(t){console.error("Error loading pending batch requests:",t),o.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Failed to load pending requests.</td></tr>'}}function te(e,o){const n=e.querySelector("#batches-table-body");if(n){if(!o||o.length===0){n.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">No custom batches created yet. Click "+ Create New Batch/Class" above to add one.</td></tr>';return}n.innerHTML=o.map(t=>`
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
  `).join(""),n.querySelectorAll(".btn-delete-batch").forEach(t=>{t.addEventListener("click",async()=>{if(confirm("Delete this batch? Enrolled students will revert to general access."))try{await b(`/exams/batches/${t.dataset.id}`,{method:"DELETE"}),C(e)}catch(c){alert(c.message)}})})}}function ae(e,o){const n=e.querySelector("#exams-table-body");if(!o||o.length===0){n.innerHTML='<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No exams created yet. Click "Create New Online Exam" above to add one.</td></tr>';return}n.innerHTML=o.map(t=>`
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">
        ${t.title}
        ${t.category_name?`<div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal; margin-top:2px;">${t.category_icon||"📂"} ${t.category_name}</div>`:""}
        ${t.tag_names?`<div style="margin-top:4px;">${t.tag_names.split(",").map(c=>`<span class="badge-tag" style="font-size:0.7rem; margin-right:4px;">#${c.trim()}</span>`).join("")}</div>`:""}
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
  `).join(""),n.querySelectorAll(".btn-manage-exam-q").forEach(t=>{t.addEventListener("click",()=>{const c=t.dataset.id,a=N.find(x=>x.id==c);a&&ne(e,a)})}),n.querySelectorAll(".btn-edit-exam").forEach(t=>{t.addEventListener("click",()=>{const c=t.dataset.id,a=N.find(S=>S.id==c);if(!a)return;const x=e.querySelector("#modal-create-exam");e.querySelector("#modal-exam-heading").textContent="✏️ Edit Online CBT Exam",e.querySelector("#edit-exam-id").value=a.id,e.querySelector("#exam-title").value=a.title||"",e.querySelector("#exam-duration").value=a.total_duration_mins||60,e.querySelector("#exam-pos").value=a.positive_marks||2,e.querySelector("#exam-neg").value=a.negative_marks||.5,e.querySelector("#exam-instructions").value=a.instructions||"",e.querySelector("#exam-type").value=a.exam_type||"COMPETITIVE",e.querySelector("#exam-mode").value=a.mode||"actual",e.querySelector("#exam-category-id")&&(e.querySelector("#exam-category-id").value=a.category_id||""),e.querySelector("#exam-visibility")&&(e.querySelector("#exam-visibility").value=a.is_public?"public":"private"),a.scheduled_start&&(e.querySelector("#exam-start").value=new Date(a.scheduled_start).toISOString().slice(0,16)),a.scheduled_end&&(e.querySelector("#exam-end").value=new Date(a.scheduled_end).toISOString().slice(0,16)),x.style.display="flex"})}),n.querySelectorAll(".btn-toggle-publish").forEach(t=>{t.addEventListener("click",async()=>{const c=t.dataset.id,a=t.dataset.pub==="true"||t.dataset.pub==="1";try{await b(`/exams/${c}`,{method:"PUT",body:JSON.stringify({is_published:!a})}),C(e)}catch{alert("Error updating exam status.")}})}),n.querySelectorAll(".btn-view-leaderboard").forEach(t=>{t.addEventListener("click",async()=>{const c=t.dataset.id,{renderLeaderboardModal:a}=await G(async()=>{const{renderLeaderboardModal:x}=await import("./LeaderboardModal-zMBhbrfR.js");return{renderLeaderboardModal:x}},__vite__mapDeps([0,1,2]));a(c)})})}function se(e,o){const n=e.querySelector("#students-table-body");if(!o||o.length===0){n.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No students have joined your institute yet. Share your institute code for them to register!</td></tr>';return}n.innerHTML=o.map(t=>`
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
  `).join("")}function ie(e){const o=e.querySelector("#tab-inst-exams"),n=e.querySelector("#tab-inst-batches"),t=e.querySelector("#tab-inst-students"),c=e.querySelector("#tab-inst-branding"),a=e.querySelector("#section-inst-exams"),x=e.querySelector("#section-inst-batches"),S=e.querySelector("#section-inst-students"),z=e.querySelector("#section-inst-branding"),A=(i,p)=>{[o,n,t,c].forEach(u=>{u&&(u.classList.remove("active"),u.style.borderBottom="none",u.style.color="var(--text-muted)")}),[a,x,S,z].forEach(u=>{u&&(u.style.display="none")}),i&&p&&(i.classList.add("active"),i.style.borderBottom="3px solid var(--primary)",i.style.color="var(--text-main)",p.style.display="block")};o&&o.addEventListener("click",()=>A(o,a)),n&&n.addEventListener("click",()=>A(n,x)),t&&t.addEventListener("click",()=>A(t,S)),c&&c.addEventListener("click",()=>A(c,z));const w=e.querySelector("#btn-copy-subdomain"),$=e.querySelector("#btn-copy-fallback"),s=e.querySelector("#branding-subdomain-url"),r=e.querySelector("#branding-fallback-url");w&&s&&w.addEventListener("click",()=>{navigator.clipboard.writeText(s.value),w.textContent="Copied! ✓",setTimeout(()=>w.textContent="Copy",2e3)}),$&&r&&$.addEventListener("click",()=>{navigator.clipboard.writeText(r.value),$.textContent="Copied! ✓",setTimeout(()=>$.textContent="Copy",2e3)});const m=e.querySelector("#brand-color-picker"),g=e.querySelector("#brand-color");m&&g&&(m.addEventListener("input",i=>g.value=i.target.value),g.addEventListener("input",i=>m.value=i.target.value));const q=e.querySelector("#form-branding");q&&q.addEventListener("submit",async i=>{i.preventDefault();const p=e.querySelector("#btn-save-branding");try{p.disabled=!0,p.textContent="Saving Branding...";const u={name:e.querySelector("#brand-name").value,slug:e.querySelector("#brand-slug").value,logo_url:e.querySelector("#brand-logo").value,primary_color:e.querySelector("#brand-color").value,welcome_title:e.querySelector("#brand-title").value,welcome_subtitle:e.querySelector("#brand-subtitle").value,banner_url:e.querySelector("#brand-banner").value,allow_global_content:e.querySelector("#brand-allow-global").checked},f=await b("/institutes/my-branding",{method:"PUT",body:JSON.stringify(u)});if(alert("✅ Portal branding saved successfully!"),f.institute){e.querySelector("#brand-slug").value=f.institute.slug;const T=window.location.origin,_=window.location.port?`:${window.location.port}`:"",M=f.institute.slug||f.institute.code;s&&(s.value=`http://${M}.localhost${_}`),r&&(r.value=`${T}/?institute=${M}`)}}catch(u){alert(u.message||"Error saving portal branding.")}finally{p.disabled=!1,p.textContent="💾 Save Portal Branding"}});const l=e.querySelectorAll('input[name="batch_allocation_mode"]'),h=e.querySelector("#exam-batch-checklist");l.forEach(i=>{i.addEventListener("change",p=>{h&&(h.style.display=p.target.value==="specific"?"block":"none")})});const L=e.querySelector("#btn-create-batch");L&&L.addEventListener("click",()=>{const i=document.createElement("form");i.innerHTML=`
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
      `;const p=Z({title:"🏫 Create New Batch / Class",content:i});i.querySelector("#btn-cancel-batch-modal").addEventListener("click",()=>p.close()),i.addEventListener("submit",async u=>{u.preventDefault();const f=i.querySelector("#new-batch-name").value.trim(),T=i.querySelector("#new-batch-code").value.trim(),_=i.querySelector("#new-batch-desc").value.trim();if(f)try{await b("/exams/batches",{method:"POST",body:JSON.stringify({name:f,code:T,description:_})}),p.close(),C(e)}catch(M){alert(M.message||"Error creating batch.")}})});const k=()=>{let i=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(!i)return;document.body.contains(i)||document.body.appendChild(i);const p=i.querySelector("#modal-exam-heading"),u=i.querySelector("#edit-exam-id"),f=i.querySelector("#submit-modal-exam"),T=i.querySelector("#form-create-exam"),_=i.querySelector("#exam-batch-checklist");p&&(p.textContent="Create Online CBT Exam"),u&&(u.value=""),f&&(f.textContent="Create Exam"),T&&T.reset(),_&&(_.style.display="none"),i.style.display="flex",i.style.position="fixed",i.style.inset="0",i.style.zIndex="99999",i.style.background="rgba(15, 23, 42, 0.75)",i.style.backdropFilter="blur(4px)",i.style.alignItems="center",i.style.justifyContent="center"},y=()=>{const i=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(!i)return;const p=i.querySelector("#form-create-exam");i.style.display="none",p&&p.reset()},R=i=>{i.target.closest("#btn-create-exam, .btn-open-create-exam")&&(i.preventDefault(),k())};e.removeEventListener("click",R),e.addEventListener("click",R);const d=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(d){const i=d.querySelector("#close-modal-exam"),p=d.querySelector("#cancel-modal-exam");i&&i.addEventListener("click",y),p&&p.addEventListener("click",y),d.addEventListener("click",v=>{v.target===d&&y()});const u=d.querySelector("#exam-sections-input-container"),f=d.querySelector("#btn-add-sec-input-row"),T=d.querySelector("#sec-count-badge"),_=()=>{if(!u)return;const v=u.querySelectorAll(".sec-input-row").length;T&&(T.textContent=`${v} / 10 Sections`),f&&(f.disabled=v>=10)},M=v=>{u&&(u.innerHTML="",v.forEach(E=>{const B=document.createElement("div");B.className="sec-input-row",B.style.cssText="display: flex; gap: 8px; align-items: center;",B.innerHTML=`
          <input type="text" class="form-control exam-sec-name-input" value="${E}" placeholder="Section Name" required>
          <button type="button" class="btn btn-outline btn-sm btn-remove-sec-row" style="color: var(--danger); border-color: var(--danger);" title="Remove section">&times;</button>
        `,u.appendChild(B)}),_())};f&&f.addEventListener("click",()=>{const v=u.querySelectorAll(".sec-input-row").length;if(v>=10){alert("Maximum of 10 sections allowed per exam.");return}const E=document.createElement("div");E.className="sec-input-row",E.style.cssText="display: flex; gap: 8px; align-items: center;",E.innerHTML=`
          <input type="text" class="form-control exam-sec-name-input" value="Section ${v+1}" placeholder="Section Name" required>
          <button type="button" class="btn btn-outline btn-sm btn-remove-sec-row" style="color: var(--danger); border-color: var(--danger);" title="Remove section">&times;</button>
        `,u.appendChild(E),_()}),u&&u.addEventListener("click",v=>{if(v.target.classList.contains("btn-remove-sec-row")){if(u.querySelectorAll(".sec-input-row").length<=1){alert("An exam must have at least 1 section.");return}v.target.closest(".sec-input-row").remove(),_()}}),d.querySelectorAll(".btn-sec-preset").forEach(v=>{v.addEventListener("click",()=>{const E=v.dataset.preset;E==="single"?M(["General"]):E==="ssc"?M(["General Intelligence & Reasoning","General Awareness","Quantitative Aptitude","English Comprehension"]):E==="bank"&&M(["Reasoning Ability","Quantitative Aptitude","English Language"])})});const P=d.querySelector("#form-create-exam");P&&P.addEventListener("submit",async v=>{var V,W,K;v.preventDefault();const E=((V=d.querySelector("#edit-exam-id"))==null?void 0:V.value)||"",B=d.querySelector("#exam-visibility")?d.querySelector("#exam-visibility").value:"private",D=d.querySelector("#exam-category-id"),Q=D&&D.selectedIndex>=0?D.options[D.selectedIndex]:null;if(B==="public"&&Q&&((W=Q.dataset)==null?void 0:W.type)==="private"){alert("To publish a Global Open Test, you must select a Global Master Category (created by Super Admin). Private categories cannot be used for global tests.");return}const Y=Array.from(d.querySelectorAll(".exam-tag-cb:checked")).map(I=>parseInt(I.value,10)),J=(((K=d.querySelector('input[name="batch_allocation_mode"]:checked'))==null?void 0:K.value)||"all")==="all",X=J?[]:Array.from(d.querySelectorAll(".exam-batch-cb:checked")).map(I=>parseInt(I.value,10)),U=Array.from(d.querySelectorAll(".exam-sec-name-input")).map(I=>I.value.trim()).filter(Boolean),j={title:d.querySelector("#exam-title").value.trim(),category_id:d.querySelector("#exam-category-id").value?parseInt(d.querySelector("#exam-category-id").value,10):null,exam_type:d.querySelector("#exam-type").value,mode:d.querySelector("#exam-mode").value||"actual",is_public:B==="public",total_duration_mins:parseInt(d.querySelector("#exam-duration").value,10),positive_marks:parseFloat(d.querySelector("#exam-pos").value),negative_marks:parseFloat(d.querySelector("#exam-neg").value),instructions:d.querySelector("#exam-instructions").value.trim()||null,tag_ids:Y,is_all_batches:J,batch_ids:X,sections:U.length>0?U:["General"],scheduled_start:d.querySelector("#exam-start").value||null,scheduled_end:d.querySelector("#exam-end").value||null};try{E?(await b(`/exams/${E}`,{method:"PUT",body:JSON.stringify(j)}),alert(`Exam "${j.title}" updated successfully!`)):(await b("/exams",{method:"POST",body:JSON.stringify(j)}),alert(`Online Exam "${j.title}" created successfully!`)),y(),C(e)}catch(I){alert(`Error saving exam: ${I.message}`)}})}const O=e.querySelector("#btn-copy-code");O&&O.addEventListener("click",async()=>{try{const p=(await b("/auth/me")).user.institute_code;p&&(await navigator.clipboard.writeText(p),alert(`Institute Code "${p}" copied to clipboard! Share this code with your students.`))}catch{alert("Failed to copy code.")}})}async function ne(e,o){const n=document.createElement("div");n.className="modal-backdrop fade-in",n.style.cssText=`
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  `,n.innerHTML=`
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
  `,document.body.appendChild(n);const t=()=>n.remove();n.querySelector("#close-builder-modal").addEventListener("click",t),n.querySelector("#done-builder-modal").addEventListener("click",t),await c();async function c(){const a=n.querySelector("#builder-body-content");try{const S=(await b(`/exams/${o.id}/sections-questions`)).sections||[];if(S.length===0){a.innerHTML=`
          <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
            No sections created in this exam yet.
          </div>
        `;return}const{openQuestionBankSelectorModal:z}=await G(async()=>{const{openQuestionBankSelectorModal:s}=await import("./QuestionBankSelectorModal-BXAazssJ.js");return{openQuestionBankSelectorModal:s}},__vite__mapDeps([3,1,2])),{renderMath:A}=await G(async()=>{const{renderMath:s}=await import("./index-Bv_9YFTr.js").then(r=>r.l);return{renderMath:s}},__vite__mapDeps([1,2]));a.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 4px;">
          <div>
            <strong style="font-size: 1rem; color: var(--primary);">Exam Sections (${S.length} / 10)</strong>
            <span style="font-size: 0.82rem; color: var(--text-muted); display: block;">Organize test into 1 to 10 custom sections</span>
          </div>
          <button id="btn-add-modal-section" class="btn btn-primary btn-sm" ${S.length>=10?'disabled style="opacity: 0.6;"':""}>
            ➕ Add Section
          </button>
        </div>
      `+S.map((s,r)=>`
        <div class="card" style="padding: 18px; border: 1px solid var(--border-color); background: var(--bg-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                📁 Section ${r+1}: ${s.section_name}
              </h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                ${s.questions?s.questions.length:0} Question(s) Attached
              </span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-outline btn-sm btn-rename-sec" data-secid="${s.id}" data-secname="${s.section_name}" title="Rename Section">
                ✏️ Rename
              </button>
              ${r>0?`<button class="btn btn-outline btn-sm btn-move-sec-up" data-idx="${r}" title="Move Up">⬆️</button>`:""}
              ${r<S.length-1?`<button class="btn btn-outline btn-sm btn-move-sec-down" data-idx="${r}" title="Move Down">⬇️</button>`:""}
              <button class="btn btn-outline btn-sm btn-delete-sec" data-secid="${s.id}" data-secname="${s.section_name}" data-qcount="${s.questions?s.questions.length:0}" style="color: var(--danger); border-color: var(--danger);" title="Delete Section">
                🗑️ Delete
              </button>
              <button class="btn btn-primary btn-sm btn-attach-bank" data-secid="${s.id}" data-secname="${s.section_name}">
                <i class="ri-link"></i> ➕ Attach Questions from Master Bank
              </button>
            </div>
          </div>

          <!-- Questions attached to this section -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${!s.questions||s.questions.length===0?`
              <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; padding: 12px; text-align: center;">
                No questions attached to this section yet. Click "Attach Questions from Master Bank" above to add questions!
              </div>
            `:s.questions.map((m,g)=>`
              <div class="card" style="padding: 12px 14px; background: var(--card-bg); border-left: 3px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary);">Question #${g+1} (Bank ID: #${m.id})</span>
                  <button class="btn btn-outline btn-sm btn-detach-q" data-secid="${s.id}" data-qid="${m.id}" style="color: var(--danger); border-color: var(--danger);" title="Remove this question from exam (keeps question in Master Bank)">
                    ❌ Detach from Exam
                  </button>
                </div>
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;" class="katex-render">
                  ${m.question_text_en}
                </div>
                <div style="display: flex; gap: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                  ${(m.options_en||[]).map((q,l)=>`
                    <span style="color: ${l===m.correct_option_index?"var(--success)":"inherit"}; font-weight: ${l===m.correct_option_index?"bold":"normal"};">
                      ${String.fromCharCode(65+l)}: <span class="katex-render">${q}</span> ${l===m.correct_option_index?"✓":""}
                    </span>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join(""),A(a);const w=a.querySelector("#btn-add-modal-section");w&&w.addEventListener("click",async()=>{if(S.length>=10)return alert("Maximum of 10 sections allowed per exam.");const s=prompt("Enter new section name (e.g. Reasoning, Physics, General Knowledge):");if(s&&s.trim())try{await b(`/exams/${o.id}/sections`,{method:"POST",body:JSON.stringify({section_name:s.trim()})}),await c(),C(e)}catch(r){alert(`Error adding section: ${r.message}`)}}),a.querySelectorAll(".btn-rename-sec").forEach(s=>{s.addEventListener("click",async()=>{const r=s.dataset.secid,m=s.dataset.secname,g=prompt("Rename section:",m);if(g&&g.trim()&&g.trim()!==m)try{await b(`/exams/sections/${r}`,{method:"PUT",body:JSON.stringify({section_name:g.trim()})}),await c(),C(e)}catch(q){alert(`Error renaming section: ${q.message}`)}})}),a.querySelectorAll(".btn-delete-sec").forEach(s=>{s.addEventListener("click",async()=>{const r=s.dataset.secid,m=s.dataset.secname,g=parseInt(s.dataset.qcount,10);if(S.length<=1)return alert("An exam must have at least 1 section. You cannot delete the only section.");let q=`Are you sure you want to delete section "${m}"?`;if(g>0&&(q+=`
Warning: This section has ${g} attached question(s). Deleting it will detach those questions from this exam.`),confirm(q))try{await b(`/exams/sections/${r}`,{method:"DELETE"}),await c(),C(e)}catch(l){alert(`Error deleting section: ${l.message}`)}})});const $=async(s,r)=>{const m=[...S],[g]=m.splice(s,1);m.splice(r,0,g);const q=m.map((l,h)=>({id:l.id,order:h+1}));try{await b(`/exams/${o.id}/sections/reorder`,{method:"PUT",body:JSON.stringify({section_orders:q})}),await c(),C(e)}catch(l){alert(`Error reordering sections: ${l.message}`)}};a.querySelectorAll(".btn-move-sec-up").forEach(s=>{s.addEventListener("click",()=>{const r=parseInt(s.dataset.idx,10);r>0&&$(r,r-1)})}),a.querySelectorAll(".btn-move-sec-down").forEach(s=>{s.addEventListener("click",()=>{const r=parseInt(s.dataset.idx,10);r<S.length-1&&$(r,r+1)})}),a.querySelectorAll(".btn-attach-bank").forEach(s=>{s.addEventListener("click",()=>{const r=parseInt(s.dataset.secid,10),m=s.dataset.secname;z(r,m,o.title,()=>{c(),C(e)})})}),a.querySelectorAll(".btn-detach-q").forEach(s=>{s.addEventListener("click",async()=>{const r=s.dataset.secid,m=s.dataset.qid;if(confirm("Detach this question from the exam? (The question will remain safe in your Master Question Bank)"))try{await b(`/exams/sections/${r}/detach-questions/${m}`,{method:"DELETE"}),c(),C(e)}catch{alert("Error detaching question from exam.")}})})}catch(x){console.error("Error loading builder content:",x),a.innerHTML=`<div style="color: var(--danger); padding: 20px;">Error loading exam sections: ${x.message}</div>`}}}export{re as renderInstituteAdminView};
