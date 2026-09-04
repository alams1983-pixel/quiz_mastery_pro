const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LeaderboardModal-1M3bgC0o.js","assets/index-D_04MIJ9.js","assets/index-0wnOhacZ.css","assets/QuestionBankSelectorModal-BXYTdtF_.js","assets/katexRenderer-DzahxjNr.js","assets/LoadingOverlayModal-CS1Ac5fD.js"])))=>i.map(i=>d[i]);
import{r as g,_ as ee}from"./index-D_04MIJ9.js";import{createModal as pe}from"./Modal-gSRHaNEz.js";function we(e,r="exams"){const l=document.createElement("div");return l.className="view-container fade-in",l.innerHTML=`
    <div class="saas-header">
      <div class="saas-title-group">
        <h1 id="inst-title">Institute Admin Portal 🏢</h1>
        <p id="inst-subtitle">Manage your coaching institute's students, multi-section CBT mock exams, and practice quizzes.</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <span class="institute-badge" id="inst-code-badge"><i class="ri-key-2-line"></i> Code: Loading...</span>
      </div>
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
      <!-- Sub-Tab Navigation Header -->
      <div style="display: flex; gap: 10px; border-bottom: 2px solid var(--border-color); margin-bottom: 20px; flex-wrap: wrap;">
        <button id="subtab-inst-batches-list" class="btn-text active" style="font-weight: 700; padding: 8px 14px; border-bottom: 3px solid var(--primary); color: var(--text-main);">
          🏷️ Batches & Classes Directory
        </button>
        <button id="subtab-inst-batches-pending" class="btn-text" style="font-weight: 700; padding: 8px 14px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 6px;">
          ⏳ Pending Join Requests <span id="subtab-pending-badge" class="badge" style="background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 700; font-size: 0.78rem; padding: 2px 8px; border-radius: 12px;">0</span>
        </button>
      </div>

      <!-- Sub-Tab 1: Batches Directory List -->
      <div id="subtab-content-batches-list" class="card" style="padding: 20px;">
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

      <!-- Sub-Tab 2: Pending Student Join Requests Card -->
      <div id="subtab-content-batches-pending" class="card" style="padding: 20px; display: none; border-left: 4px solid var(--warning, #f59e0b);">
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

    <!-- Modal: View & Manage Enrolled Students in Batch -->
    <div id="modal-batch-students" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1050; align-items: center; justify-content: center;">
      <div class="card" style="width: 100%; max-width: 760px; max-height: 85vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h3 id="modal-batch-students-title" style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin: 0;">👥 Enrolled Students</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Review active batch members or revoke batch access.</p>
          </div>
          <button id="close-modal-batch-students" style="background: none; border: none; font-size: 1.6rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <!-- Search Bar -->
        <div style="margin-bottom: 16px;">
          <input
            type="text"
            id="search-batch-students"
            class="form-control"
            placeholder="🔍 Search student by name or email..."
            style="padding: 8px 14px; font-size: 0.9rem;"
          />
        </div>

        <!-- Student Table -->
        <div style="overflow-y: auto; flex: 1; border: 1px solid var(--border-color); border-radius: 8px;">
          <table class="custom-table" style="width: 100%; font-size: 0.88rem;">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Enrolled Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="table-body-batch-students">
              <tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">Loading batch students...</td></tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <button type="button" id="btn-close-batch-students-modal" class="btn btn-outline">Close Window</button>
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
  `,setTimeout(()=>{xe(l,r),k(l,r)},0),l}let Q=[],X=[],Y=[];async function k(e,r="exams"){try{let O=function(){if(!x||!b)return;const y=x.value==="public",E=b.querySelector("#exam-optgroup-private");if(E){const B=E.querySelectorAll("option");y?(E.style.display="none",B.forEach(L=>{L.disabled=!0}),q.has(b.value)&&(b.value=""),w&&(w.style.display="block")):(E.style.display="",B.forEach(L=>{L.disabled=!1}),w&&(w.style.display="none"))}};const t=(await g("/auth/me")).user,c=t.institute_name||"Coaching Institute",s=e.querySelector("#inst-title"),o=e.querySelector("#inst-subtitle");if(s&&o&&(r==="batches"?(s.textContent="🏷️ Batches & Classes Management",o.textContent="Create custom batches, standards, manage student enrollments, and approve pending join requests."):r==="students"?(s.textContent="👥 Enrolled Student Roster",o.textContent=`Manage students enrolled in ${c}, track test performance, and copy invite links.`):(s.textContent="💻 Online CBT Exam Engine Setup",o.textContent="Create multi-section online CBT exams with positive/negative marking and schedule windows.")),t.institute_code&&(e.querySelector("#inst-code-badge").innerHTML=`<i class="ri-key-2-line"></i> Code: ${t.institute_code}`),!t.institute_id&&t.role!=="super_admin"){e.querySelector("#exams-table-body").innerHTML='<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Your account is not assigned to a coaching institute yet. Contact Super Admin.</td></tr>';return}const[i,f,A,M,_,n,u]=await Promise.all([g("/exams"),t.institute_id?g(`/institutes/${t.institute_id}/students`):Promise.resolve({students:[]}),g("/quizzes"),g("/categories").catch(()=>({flatCategories:[]})),g("/tags").catch(()=>({tags:[]})),g("/exams/batches/all").catch(()=>({batches:[]})),t.institute_id?g(`/institutes/${t.institute_id}`).catch(()=>null):Promise.resolve(null)]);if(Q=i.exams||[],X=f.students||[],Y=n.batches||[],u&&u.institute){const y=u.institute,E=window.location.origin,B=window.location.port?`:${window.location.port}`:"",L=y.slug||y.code,v=`http://${L}.localhost${B}`,U=`${E}/?institute=${L}`,V=e.querySelector("#branding-subdomain-url"),D=e.querySelector("#branding-fallback-url");V&&(V.value=v),D&&(D.value=U);const G=e.querySelector("#brand-name"),p=e.querySelector("#brand-slug"),J=e.querySelector("#brand-logo"),a=e.querySelector("#brand-color"),m=e.querySelector("#brand-color-picker"),d=e.querySelector("#brand-title"),h=e.querySelector("#brand-subtitle"),T=e.querySelector("#brand-banner"),$=e.querySelector("#brand-allow-global");G&&(G.value=y.name||""),p&&(p.value=y.slug||""),J&&(J.value=y.logo_url||""),a&&(a.value=y.primary_color||"#4f46e5"),m&&(m.value=y.primary_color||"#4f46e5"),d&&(d.value=y.welcome_title||""),h&&(h.value=y.welcome_subtitle||""),T&&(T.value=y.banner_url||""),$&&($.checked=y.allow_global_content!==0)}const b=e.querySelector("#exam-category-id"),x=e.querySelector("#exam-visibility"),w=e.querySelector("#exam-category-hint");let q=new Set;if(b){const y=M.flatCategories||[],E=y.filter(v=>!v.institute_id||v.is_global),B=y.filter(v=>v.institute_id&&!v.is_global);q=new Set(B.map(v=>v.id.toString()));let L='<option value="">-- Select Category / Subcategory --</option>';E.length>0&&(L+='<optgroup label="🌐 Global Master Categories (For Public & Private Exams)">'+E.map(v=>`<option value="${v.id}" data-type="global">${v.icon||"📂"} ${v.name}</option>`).join("")+"</optgroup>"),B.length>0&&(L+='<optgroup id="exam-optgroup-private" label="🏫 My Institute Private Categories (Internal Exams Only)">'+B.map(v=>`<option value="${v.id}" data-type="private">${v.icon||"📂"} ${v.name}</option>`).join("")+"</optgroup>"),b.innerHTML=L}x&&(x.addEventListener("change",O),O());const F=e.querySelector("#exam-tags-container");if(F){const y=_.tags||[];y.length===0?F.innerHTML='<span style="font-size:0.82rem; color:var(--text-muted);">No tags created yet. Add tags in Quiz Manager!</span>':F.innerHTML=y.map(E=>`
          <label style="display:inline-flex; align-items:center; gap:4px; font-size:0.82rem; cursor:pointer; background:var(--bg-color); padding:4px 8px; border-radius:4px; border:1px solid var(--border-color);">
            <input type="checkbox" class="exam-tag-cb" value="${E.id}">
            <span>${E.name}</span>
          </label>
        `).join("")}const z=e.querySelector("#exam-batch-checklist");z&&(Y.length===0?z.innerHTML='<span style="font-size:0.82rem; color:var(--text-muted);">No custom batches created yet. All exams apply to General Batch.</span>':z.innerHTML=Y.map(y=>`
          <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; cursor:pointer; padding:4px 0;">
            <input type="checkbox" class="exam-batch-cb" value="${y.id}">
            <span><strong>${y.name}</strong> ${y.code?`(${y.code})`:""}</span>
          </label>
        `).join(""));const P=e.querySelector("#inst-stat-exams"),R=e.querySelector("#inst-stat-students"),N=e.querySelector("#inst-stat-quizzes");P&&(P.textContent=Q.length),R&&(R.textContent=X.length),N&&(N.textContent=(A.quizzes||[]).length),ye(e,Q),be(e,Y),ge(e,X),me(e)}catch(l){console.error("Failed to load institute admin data:",l)}}async function me(e){const r=e.querySelector("#pending-requests-table-body"),l=e.querySelector("#pending-requests-count-badge"),t=e.querySelector("#subtab-pending-badge");if(r)try{const s=(await g("/exams/batches/pending-requests")).requests||[];if(l&&(l.textContent=`${s.length} Pending`),t&&(t.textContent=s.length),s.length===0){r.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No pending student batch join requests.</td></tr>';return}r.innerHTML=s.map(o=>`
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${o.student_name}</td>
        <td>${o.student_email}</td>
        <td>
          <span class="badge-tag" style="background: rgba(79, 70, 229, 0.1); color: var(--primary); font-weight: 700;">
            ${o.batch_name} ${o.batch_code?`(${o.batch_code})`:""}
          </span>
        </td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-success btn-approve-batch-req" data-uid="${o.user_id}" data-bid="${o.batch_id}" style="padding: 4px 10px; font-weight: 700;">
              ✓ Approve
            </button>
            <button class="btn btn-sm btn-secondary btn-reject-batch-req" data-uid="${o.user_id}" data-bid="${o.batch_id}" style="padding: 4px 10px; color: #ef4444;">
              ✕ Reject
            </button>
          </div>
        </td>
      </tr>
    `).join(""),r.querySelectorAll(".btn-approve-batch-req").forEach(o=>{o.addEventListener("click",async()=>{o.disabled=!0,o.textContent="Approving...";try{await g("/exams/batches/approve-request",{method:"POST",body:JSON.stringify({user_id:o.dataset.uid,batch_id:o.dataset.bid,action:"approve"})}),k(e)}catch(i){alert("Error approving request: "+i.message),o.disabled=!1}})}),r.querySelectorAll(".btn-reject-batch-req").forEach(o=>{o.addEventListener("click",async()=>{o.disabled=!0,o.textContent="Rejecting...";try{await g("/exams/batches/approve-request",{method:"POST",body:JSON.stringify({user_id:o.dataset.uid,batch_id:o.dataset.bid,action:"reject"})}),k(e)}catch(i){alert("Error rejecting request: "+i.message),o.disabled=!1}})})}catch(c){console.error("Error loading pending batch requests:",c),r.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ef4444;">Failed to load pending requests.</td></tr>'}}function be(e,r){const l=e.querySelector("#batches-table-body");if(l){if(!r||r.length===0){l.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">No custom batches created yet. Click "+ Create New Batch/Class" above to add one.</td></tr>';return}l.innerHTML=r.map(t=>`
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${t.name}</td>
      <td><span class="badge-tag">${t.code||"DEFAULT"}</span></td>
      <td style="color: var(--text-muted); font-size: 0.88rem;">${t.description||"-"}</td>
      <td style="font-weight: 700;">
        <span class="btn-view-batch-students-count" data-id="${t.id}" data-name="${t.name}" style="cursor: pointer; color: var(--primary); text-decoration: underline;" title="Click to view enrolled students">
          ${t.student_count||0} Students
        </span>
      </td>
      <td>
        <div className="btn-icon-group" style="display: flex; gap: 8px;">
          <button class="btn btn-outline btn-sm btn-view-batch-students" data-id="${t.id}" data-name="${t.name}" title="View Enrolled Students in Batch" aria-label="View Enrolled Students in Batch">
            <i class="ri-user-shared-line"></i> <span class="btn-text-desktop">Enrolled Students</span>
          </button>
          <button class="icon-action-btn btn-danger btn-delete-batch" data-id="${t.id}" title="Delete Batch" aria-label="Delete Batch">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join(""),l.querySelectorAll(".btn-view-batch-students, .btn-view-batch-students-count").forEach(t=>{t.addEventListener("click",()=>{te(e,t.dataset.id,t.dataset.name)})}),l.querySelectorAll(".btn-delete-batch").forEach(t=>{t.addEventListener("click",async()=>{if(confirm("Delete this batch? Enrolled students will revert to general access."))try{await g(`/exams/batches/${t.dataset.id}`,{method:"DELETE"}),k(e)}catch(c){alert(c.message)}})})}}let Z=[];async function te(e,r,l){const t=e.querySelector("#modal-batch-students"),c=e.querySelector("#modal-batch-students-title"),s=e.querySelector("#table-body-batch-students"),o=e.querySelector("#search-batch-students");if(!(!t||!s)){c&&(c.textContent=`👥 Enrolled Students - ${l}`),o&&(o.value=""),s.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">Loading batch students...</td></tr>',t.style.display="flex";try{Z=(await g(`/exams/batches/${r}/enrolled-students`)).students||[],de(e,r,l,Z,""),o&&(o.oninput=f=>{const A=f.target.value.toLowerCase().trim();de(e,r,l,Z,A)})}catch(i){console.error("Error fetching batch students:",i),s.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 30px; color: #ef4444;">Failed to load batch students.</td></tr>'}}}function de(e,r,l,t,c){const s=e.querySelector("#table-body-batch-students");if(!s)return;const o=t.filter(i=>(i.student_name||"").toLowerCase().includes(c)||(i.student_email||"").toLowerCase().includes(c));if(o.length===0){s.innerHTML='<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">No enrolled students found matching search.</td></tr>';return}s.innerHTML=o.map(i=>{const f=i.status==="approved",A=i.status==="pending",M=i.status==="rejected";let _='<span class="badge badge-success" style="background: rgba(34, 197, 94, 0.15); color: #16a34a; font-weight: 700; padding: 4px 10px; border-radius: 20px;">Active Enrolled</span>';return A?_='<span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 700; padding: 4px 10px; border-radius: 20px;">Pending Approval</span>':M&&(_='<span class="badge badge-danger" style="background: rgba(239, 68, 68, 0.15); color: #dc2626; font-weight: 700; padding: 4px 10px; border-radius: 20px;">Access Revoked</span>'),`
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${i.student_name}</td>
        <td>${i.student_email}</td>
        <td>${new Date(i.enrolled_at).toLocaleDateString()}</td>
        <td>${_}</td>
        <td>
          ${f?`
            <button class="btn btn-danger btn-sm btn-action-revoke-student" data-uid="${i.user_id}" data-bid="${r}" data-name="${i.student_name}" title="Revoke Student Batch Access">
              <i class="ri-user-unfollow-line"></i> <span class="btn-text-desktop">Revoke Access</span>
            </button>
          `:`
            <button class="btn btn-success btn-sm btn-action-approve-student" data-uid="${i.user_id}" data-bid="${r}" data-name="${i.student_name}" title="Approve/Restore Student Batch Access">
              <i class="ri-user-follow-line"></i> <span class="btn-text-desktop">Re-Approve Access</span>
            </button>
          `}
        </td>
      </tr>
    `}).join(""),s.querySelectorAll(".btn-action-revoke-student").forEach(i=>{i.onclick=async()=>{if(confirm(`Revoke batch access for ${i.dataset.name}? The student will immediately lose access to all batch exams and quizzes.`)){i.disabled=!0;try{await g("/exams/batches/approve-request",{method:"POST",body:JSON.stringify({user_id:i.dataset.uid,batch_id:i.dataset.bid,action:"revoke"})}),te(e,r,l),k(e)}catch(f){alert(f.message),i.disabled=!1}}}}),s.querySelectorAll(".btn-action-approve-student").forEach(i=>{i.onclick=async()=>{i.disabled=!0;try{await g("/exams/batches/approve-request",{method:"POST",body:JSON.stringify({user_id:i.dataset.uid,batch_id:i.dataset.bid,action:"approve"})}),te(e,r,l),k(e)}catch(f){alert(f.message),i.disabled=!1}}})}function ye(e,r){const l=e.querySelector("#exams-table-body");if(!r||r.length===0){l.innerHTML='<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No exams created yet. Click "Create New Online Exam" above to add one.</td></tr>';return}l.innerHTML=r.map(t=>`
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
  `).join(""),l.querySelectorAll(".btn-manage-exam-q").forEach(t=>{t.addEventListener("click",()=>{const c=t.dataset.id,s=Q.find(o=>o.id==c);s&&ve(e,s)})}),l.querySelectorAll(".btn-edit-exam").forEach(t=>{t.addEventListener("click",()=>{const c=t.dataset.id,s=Q.find(i=>i.id==c);if(!s)return;const o=e.querySelector("#modal-create-exam");e.querySelector("#modal-exam-heading").textContent="✏️ Edit Online CBT Exam",e.querySelector("#edit-exam-id").value=s.id,e.querySelector("#exam-title").value=s.title||"",e.querySelector("#exam-duration").value=s.total_duration_mins||60,e.querySelector("#exam-pos").value=s.positive_marks||2,e.querySelector("#exam-neg").value=s.negative_marks||.5,e.querySelector("#exam-instructions").value=s.instructions||"",e.querySelector("#exam-type").value=s.exam_type||"COMPETITIVE",e.querySelector("#exam-mode").value=s.mode||"actual",e.querySelector("#exam-category-id")&&(e.querySelector("#exam-category-id").value=s.category_id||""),e.querySelector("#exam-visibility")&&(e.querySelector("#exam-visibility").value=s.is_public?"public":"private"),s.scheduled_start&&(e.querySelector("#exam-start").value=new Date(s.scheduled_start).toISOString().slice(0,16)),s.scheduled_end&&(e.querySelector("#exam-end").value=new Date(s.scheduled_end).toISOString().slice(0,16)),o.style.display="flex"})}),l.querySelectorAll(".btn-toggle-publish").forEach(t=>{t.addEventListener("click",async()=>{const c=t.dataset.id,s=t.dataset.pub==="true"||t.dataset.pub==="1";try{await g(`/exams/${c}`,{method:"PUT",body:JSON.stringify({is_published:!s})}),k(e)}catch{alert("Error updating exam status.")}})}),l.querySelectorAll(".btn-view-leaderboard").forEach(t=>{t.addEventListener("click",async()=>{const c=t.dataset.id,{renderLeaderboardModal:s}=await ee(async()=>{const{renderLeaderboardModal:o}=await import("./LeaderboardModal-1M3bgC0o.js");return{renderLeaderboardModal:o}},__vite__mapDeps([0,1,2]));s(c)})})}function ge(e,r){const l=e.querySelector("#students-table-body");if(!r||r.length===0){l.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No students have joined your institute yet. Share your institute code for them to register!</td></tr>';return}l.innerHTML=r.map(t=>`
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
  `).join("")}function xe(e,r="exams"){const l=e.querySelector("#tab-inst-exams"),t=e.querySelector("#tab-inst-batches"),c=e.querySelector("#tab-inst-students"),s=e.querySelector("#tab-inst-branding"),o=e.querySelector("#section-inst-exams"),i=e.querySelector("#section-inst-batches"),f=e.querySelector("#section-inst-students"),A=e.querySelector("#section-inst-branding"),M=(a,m)=>{[l,t,c,s].forEach(d=>{d&&(d.classList.remove("active"),d.style.borderBottom="none",d.style.color="var(--text-muted)")}),[o,i,f,A].forEach(d=>{d&&(d.style.display="none")}),a&&m&&(a.classList.add("active"),a.style.borderBottom="3px solid var(--primary)",a.style.color="var(--text-main)",m.style.display="block")};l&&l.addEventListener("click",()=>M(l,o)),t&&t.addEventListener("click",()=>M(t,i)),c&&c.addEventListener("click",()=>M(c,f)),s&&s.addEventListener("click",()=>M(s,A)),[o,i,f,A].forEach(a=>{a&&(a.style.display="none")}),r==="batches"?i&&(i.style.display="block"):r==="students"?f&&(f.style.display="block"):o&&(o.style.display="block");const _=e.querySelector("#subtab-inst-batches-list"),n=e.querySelector("#subtab-inst-batches-pending"),u=e.querySelector("#subtab-content-batches-list"),b=e.querySelector("#subtab-content-batches-pending"),x=(a,m)=>{[_,n].forEach(d=>{d&&(d.classList.remove("active"),d.style.borderBottom="none",d.style.color="var(--text-muted)")}),[u,b].forEach(d=>{d&&(d.style.display="none")}),a&&m&&(a.classList.add("active"),a.style.borderBottom="3px solid var(--primary)",a.style.color="var(--text-main)",m.style.display="block")};_&&_.addEventListener("click",()=>x(_,u)),n&&n.addEventListener("click",()=>x(n,b));const w=e.querySelector("#modal-batch-students"),q=e.querySelector("#close-modal-batch-students"),O=e.querySelector("#btn-close-batch-students-modal"),F=()=>{w&&(w.style.display="none")};q&&q.addEventListener("click",F),O&&O.addEventListener("click",F);const z=e.querySelector("#btn-copy-subdomain"),P=e.querySelector("#btn-copy-fallback"),R=e.querySelector("#branding-subdomain-url"),N=e.querySelector("#branding-fallback-url");z&&R&&z.addEventListener("click",()=>{navigator.clipboard.writeText(R.value),z.textContent="Copied! ✓",setTimeout(()=>z.textContent="Copy",2e3)}),P&&N&&P.addEventListener("click",()=>{navigator.clipboard.writeText(N.value),P.textContent="Copied! ✓",setTimeout(()=>P.textContent="Copy",2e3)});const y=e.querySelector("#brand-color-picker"),E=e.querySelector("#brand-color");y&&E&&(y.addEventListener("input",a=>E.value=a.target.value),E.addEventListener("input",a=>y.value=a.target.value));const B=e.querySelector("#form-branding");B&&B.addEventListener("submit",async a=>{a.preventDefault();const m=e.querySelector("#btn-save-branding");try{m.disabled=!0,m.textContent="Saving Branding...";const d={name:e.querySelector("#brand-name").value,slug:e.querySelector("#brand-slug").value,logo_url:e.querySelector("#brand-logo").value,primary_color:e.querySelector("#brand-color").value,welcome_title:e.querySelector("#brand-title").value,welcome_subtitle:e.querySelector("#brand-subtitle").value,banner_url:e.querySelector("#brand-banner").value,allow_global_content:e.querySelector("#brand-allow-global").checked},h=await g("/institutes/my-branding",{method:"PUT",body:JSON.stringify(d)});if(alert("✅ Portal branding saved successfully!"),h.institute){e.querySelector("#brand-slug").value=h.institute.slug;const T=window.location.origin,$=window.location.port?`:${window.location.port}`:"",I=h.institute.slug||h.institute.code;R&&(R.value=`http://${I}.localhost${$}`),N&&(N.value=`${T}/?institute=${I}`)}}catch(d){alert(d.message||"Error saving portal branding.")}finally{m.disabled=!1,m.textContent="💾 Save Portal Branding"}});const L=e.querySelectorAll('input[name="batch_allocation_mode"]'),v=e.querySelector("#exam-batch-checklist");L.forEach(a=>{a.addEventListener("change",m=>{v&&(v.style.display=m.target.value==="specific"?"block":"none")})});const U=e.querySelector("#btn-create-batch");U&&U.addEventListener("click",()=>{const a=document.createElement("form");a.innerHTML=`
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
      `;const m=pe({title:"🏫 Create New Batch / Class",content:a});a.querySelector("#btn-cancel-batch-modal").addEventListener("click",()=>m.close()),a.addEventListener("submit",async d=>{d.preventDefault();const h=a.querySelector("#new-batch-name").value.trim(),T=a.querySelector("#new-batch-code").value.trim(),$=a.querySelector("#new-batch-desc").value.trim();if(h)try{await g("/exams/batches",{method:"POST",body:JSON.stringify({name:h,code:T,description:$})}),m.close(),k(e)}catch(I){alert(I.message||"Error creating batch.")}})});const V=()=>{let a=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(!a)return;document.body.contains(a)||document.body.appendChild(a);const m=a.querySelector("#modal-exam-heading"),d=a.querySelector("#edit-exam-id"),h=a.querySelector("#submit-modal-exam"),T=a.querySelector("#form-create-exam"),$=a.querySelector("#exam-batch-checklist");m&&(m.textContent="Create Online CBT Exam"),d&&(d.value=""),h&&(h.textContent="Create Exam"),T&&T.reset(),$&&($.style.display="none"),a.style.display="flex",a.style.position="fixed",a.style.inset="0",a.style.zIndex="99999",a.style.background="rgba(15, 23, 42, 0.75)",a.style.backdropFilter="blur(4px)",a.style.alignItems="center",a.style.justifyContent="center"},D=()=>{const a=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(!a)return;const m=a.querySelector("#form-create-exam");a.style.display="none",m&&m.reset()},G=a=>{a.target.closest("#btn-create-exam, .btn-open-create-exam")&&(a.preventDefault(),V())};e.removeEventListener("click",G),e.addEventListener("click",G);const p=document.querySelector("#modal-create-exam")||e.querySelector("#modal-create-exam");if(p){const a=p.querySelector("#close-modal-exam"),m=p.querySelector("#cancel-modal-exam");a&&a.addEventListener("click",D),m&&m.addEventListener("click",D),p.addEventListener("click",S=>{S.target===p&&D()});const d=p.querySelector("#exam-sections-input-container"),h=p.querySelector("#btn-add-sec-input-row"),T=p.querySelector("#sec-count-badge"),$=()=>{if(!d)return;const S=d.querySelectorAll(".sec-input-row").length;T&&(T.textContent=`${S} / 10 Sections`),h&&(h.disabled=S>=10)},I=S=>{d&&(d.innerHTML="",S.forEach(C=>{const j=document.createElement("div");j.className="sec-input-row",j.style.cssText="display: flex; gap: 8px; align-items: center;",j.innerHTML=`
          <input type="text" class="form-control exam-sec-name-input" value="${C}" placeholder="Section Name" required>
          <button type="button" class="btn btn-outline btn-sm btn-remove-sec-row" style="color: var(--danger); border-color: var(--danger);" title="Remove section">&times;</button>
        `,d.appendChild(j)}),$())};h&&h.addEventListener("click",()=>{const S=d.querySelectorAll(".sec-input-row").length;if(S>=10){alert("Maximum of 10 sections allowed per exam.");return}const C=document.createElement("div");C.className="sec-input-row",C.style.cssText="display: flex; gap: 8px; align-items: center;",C.innerHTML=`
          <input type="text" class="form-control exam-sec-name-input" value="Section ${S+1}" placeholder="Section Name" required>
          <button type="button" class="btn btn-outline btn-sm btn-remove-sec-row" style="color: var(--danger); border-color: var(--danger);" title="Remove section">&times;</button>
        `,d.appendChild(C),$()}),d&&d.addEventListener("click",S=>{if(S.target.classList.contains("btn-remove-sec-row")){if(d.querySelectorAll(".sec-input-row").length<=1){alert("An exam must have at least 1 section.");return}S.target.closest(".sec-input-row").remove(),$()}}),p.querySelectorAll(".btn-sec-preset").forEach(S=>{S.addEventListener("click",()=>{const C=S.dataset.preset;C==="single"?I(["General"]):C==="ssc"?I(["General Intelligence & Reasoning","General Awareness","Quantitative Aptitude","English Comprehension"]):C==="bank"&&I(["Reasoning Ability","Quantitative Aptitude","English Language"])})});const ae=p.querySelector("#form-create-exam");ae&&ae.addEventListener("submit",async S=>{var ie,le,re;S.preventDefault();const C=((ie=p.querySelector("#edit-exam-id"))==null?void 0:ie.value)||"",j=p.querySelector("#exam-visibility")?p.querySelector("#exam-visibility").value:"private",W=p.querySelector("#exam-category-id"),se=W&&W.selectedIndex>=0?W.options[W.selectedIndex]:null;if(j==="public"&&se&&((le=se.dataset)==null?void 0:le.type)==="private"){alert("To publish a Global Open Test, you must select a Global Master Category (created by Super Admin). Private categories cannot be used for global tests.");return}const ce=Array.from(p.querySelectorAll(".exam-tag-cb:checked")).map(H=>parseInt(H.value,10)),ne=(((re=p.querySelector('input[name="batch_allocation_mode"]:checked'))==null?void 0:re.value)||"all")==="all",ue=ne?[]:Array.from(p.querySelectorAll(".exam-batch-cb:checked")).map(H=>parseInt(H.value,10)),oe=Array.from(p.querySelectorAll(".exam-sec-name-input")).map(H=>H.value.trim()).filter(Boolean),K={title:p.querySelector("#exam-title").value.trim(),category_id:p.querySelector("#exam-category-id").value?parseInt(p.querySelector("#exam-category-id").value,10):null,exam_type:p.querySelector("#exam-type").value,mode:p.querySelector("#exam-mode").value||"actual",is_public:j==="public",total_duration_mins:parseInt(p.querySelector("#exam-duration").value,10),positive_marks:parseFloat(p.querySelector("#exam-pos").value),negative_marks:parseFloat(p.querySelector("#exam-neg").value),instructions:p.querySelector("#exam-instructions").value.trim()||null,tag_ids:ce,is_all_batches:ne,batch_ids:ue,sections:oe.length>0?oe:["General"],scheduled_start:p.querySelector("#exam-start").value||null,scheduled_end:p.querySelector("#exam-end").value||null};try{C?(await g(`/exams/${C}`,{method:"PUT",body:JSON.stringify(K)}),alert(`Exam "${K.title}" updated successfully!`)):(await g("/exams",{method:"POST",body:JSON.stringify(K)}),alert(`Online Exam "${K.title}" created successfully!`)),D(),k(e)}catch(H){alert(`Error saving exam: ${H.message}`)}})}const J=e.querySelector("#btn-copy-code");J&&J.addEventListener("click",async()=>{try{const m=(await g("/auth/me")).user.institute_code;m&&(await navigator.clipboard.writeText(m),alert(`Institute Code "${m}" copied to clipboard! Share this code with your students.`))}catch{alert("Failed to copy code.")}})}async function ve(e,r){const l=document.createElement("div");l.className="modal-backdrop fade-in",l.style.cssText=`
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1100;
    display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
  `,l.innerHTML=`
    <div class="card" style="width: 100%; max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; padding: 24px; background: var(--card-bg);">
      <!-- Modal Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 4px;">📋 Exam Section Question Builder</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            Exam: <strong>${r.title}</strong> (${r.total_duration_mins} Mins | +${parseFloat(r.positive_marks).toFixed(1)} / -${parseFloat(r.negative_marks).toFixed(1)})
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
  `,document.body.appendChild(l);const t=()=>l.remove();l.querySelector("#close-builder-modal").addEventListener("click",t),l.querySelector("#done-builder-modal").addEventListener("click",t),await c();async function c(){const s=l.querySelector("#builder-body-content");try{const i=(await g(`/exams/${r.id}/sections-questions`)).sections||[];if(i.length===0){s.innerHTML=`
          <div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">
            No sections created in this exam yet.
          </div>
        `;return}const{openQuestionBankSelectorModal:f}=await ee(async()=>{const{openQuestionBankSelectorModal:n}=await import("./QuestionBankSelectorModal-BXYTdtF_.js");return{openQuestionBankSelectorModal:n}},__vite__mapDeps([3,1,2,4,5])),{renderMath:A}=await ee(async()=>{const{renderMath:n}=await import("./katexRenderer-DzahxjNr.js");return{renderMath:n}},__vite__mapDeps([4,1,2]));s.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 4px;">
          <div>
            <strong style="font-size: 1rem; color: var(--primary);">Exam Sections (${i.length} / 10)</strong>
            <span style="font-size: 0.82rem; color: var(--text-muted); display: block;">Organize test into 1 to 10 custom sections</span>
          </div>
          <button id="btn-add-modal-section" class="btn btn-primary btn-sm" ${i.length>=10?'disabled style="opacity: 0.6;"':""}>
            ➕ Add Section
          </button>
        </div>
      `+i.map((n,u)=>`
        <div class="card" style="padding: 18px; border: 1px solid var(--border-color); background: var(--bg-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                📁 Section ${u+1}: ${n.section_name}
              </h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                ${n.questions?n.questions.length:0} Question(s) Attached
              </span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-outline btn-sm btn-rename-sec" data-secid="${n.id}" data-secname="${n.section_name}" title="Rename Section">
                ✏️ Rename
              </button>
              ${u>0?`<button class="btn btn-outline btn-sm btn-move-sec-up" data-idx="${u}" title="Move Up">⬆️</button>`:""}
              ${u<i.length-1?`<button class="btn btn-outline btn-sm btn-move-sec-down" data-idx="${u}" title="Move Down">⬇️</button>`:""}
              <button class="btn btn-outline btn-sm btn-delete-sec" data-secid="${n.id}" data-secname="${n.section_name}" data-qcount="${n.questions?n.questions.length:0}" style="color: var(--danger); border-color: var(--danger);" title="Delete Section">
                🗑️ Delete
              </button>
              <button class="btn btn-primary btn-sm btn-attach-bank" data-secid="${n.id}" data-secname="${n.section_name}">
                <i class="ri-link"></i> ➕ Attach Questions from Master Bank
              </button>
            </div>
          </div>

          <!-- Questions attached to this section -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${!n.questions||n.questions.length===0?`
              <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; padding: 12px; text-align: center;">
                No questions attached to this section yet. Click "Attach Questions from Master Bank" above to add questions!
              </div>
            `:n.questions.map((b,x)=>`
              <div class="card" style="padding: 12px 14px; background: var(--card-bg); border-left: 3px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary);">Question #${x+1} (Bank ID: #${b.id})</span>
                  <button class="btn btn-outline btn-sm btn-detach-q" data-secid="${n.id}" data-qid="${b.id}" style="color: var(--danger); border-color: var(--danger);" title="Remove this question from exam (keeps question in Master Bank)">
                    ❌ Detach from Exam
                  </button>
                </div>
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;" class="katex-render">
                  ${b.question_text_en}
                </div>
                <div style="display: flex; gap: 12px; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
                  ${(b.options_en||[]).map((w,q)=>`
                    <span style="color: ${q===b.correct_option_index?"var(--success)":"inherit"}; font-weight: ${q===b.correct_option_index?"bold":"normal"};">
                      ${String.fromCharCode(65+q)}: <span class="katex-render">${w}</span> ${q===b.correct_option_index?"✓":""}
                    </span>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join(""),A(s);const M=s.querySelector("#btn-add-modal-section");M&&M.addEventListener("click",async()=>{if(i.length>=10)return alert("Maximum of 10 sections allowed per exam.");const n=prompt("Enter new section name (e.g. Reasoning, Physics, General Knowledge):");if(n&&n.trim())try{await g(`/exams/${r.id}/sections`,{method:"POST",body:JSON.stringify({section_name:n.trim()})}),await c(),k(e)}catch(u){alert(`Error adding section: ${u.message}`)}}),s.querySelectorAll(".btn-rename-sec").forEach(n=>{n.addEventListener("click",async()=>{const u=n.dataset.secid,b=n.dataset.secname,x=prompt("Rename section:",b);if(x&&x.trim()&&x.trim()!==b)try{await g(`/exams/sections/${u}`,{method:"PUT",body:JSON.stringify({section_name:x.trim()})}),await c(),k(e)}catch(w){alert(`Error renaming section: ${w.message}`)}})}),s.querySelectorAll(".btn-delete-sec").forEach(n=>{n.addEventListener("click",async()=>{const u=n.dataset.secid,b=n.dataset.secname,x=parseInt(n.dataset.qcount,10);if(i.length<=1)return alert("An exam must have at least 1 section. You cannot delete the only section.");let w=`Are you sure you want to delete section "${b}"?`;if(x>0&&(w+=`
Warning: This section has ${x} attached question(s). Deleting it will detach those questions from this exam.`),confirm(w))try{await g(`/exams/sections/${u}`,{method:"DELETE"}),await c(),k(e)}catch(q){alert(`Error deleting section: ${q.message}`)}})});const _=async(n,u)=>{const b=[...i],[x]=b.splice(n,1);b.splice(u,0,x);const w=b.map((q,O)=>({id:q.id,order:O+1}));try{await g(`/exams/${r.id}/sections/reorder`,{method:"PUT",body:JSON.stringify({section_orders:w})}),await c(),k(e)}catch(q){alert(`Error reordering sections: ${q.message}`)}};s.querySelectorAll(".btn-move-sec-up").forEach(n=>{n.addEventListener("click",()=>{const u=parseInt(n.dataset.idx,10);u>0&&_(u,u-1)})}),s.querySelectorAll(".btn-move-sec-down").forEach(n=>{n.addEventListener("click",()=>{const u=parseInt(n.dataset.idx,10);u<i.length-1&&_(u,u+1)})}),s.querySelectorAll(".btn-attach-bank").forEach(n=>{n.addEventListener("click",()=>{const u=parseInt(n.dataset.secid,10),b=n.dataset.secname;f(u,b,r.title,()=>{c(),k(e)})})}),s.querySelectorAll(".btn-detach-q").forEach(n=>{n.addEventListener("click",async()=>{const u=n.dataset.secid,b=n.dataset.qid;if(confirm("Detach this question from the exam? (The question will remain safe in your Master Question Bank)"))try{await g(`/exams/sections/${u}/detach-questions/${b}`,{method:"DELETE"}),c(),k(e)}catch{alert("Error detaching question from exam.")}})})}catch(o){console.error("Error loading builder content:",o),s.innerHTML=`<div style="color: var(--danger); padding: 20px;">Error loading exam sections: ${o.message}</div>`}}}export{we as renderInstituteAdminView};
