import{g as y,b as h,s as v}from"./index-YWsq3nMJ.js";function k(s){const e=document.createElement("div");e.className="container page-view",e.style.maxWidth="1000px",e.style.padding="2rem 1rem";const o=y();if(!o)return s("login"),e;const c=h();e.innerHTML=`
    <!-- Page Header -->
    <div class="responsive-page-header">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-color, #111827); margin-bottom: 0.25rem;">
          ⚙️ Account Settings & Learning Portals
        </h1>
        <p style="color: var(--muted-text, #6b7280); font-size: 0.95rem;">
          Manage your personal profile, change password, and switch active coaching portals.
        </p>
      </div>
      <button id="backToDashBtn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
        ← Back to Dashboard
      </button>
    </div>

    <!-- Layout Grid -->
    <div class="settings-grid">
      
      <!-- Left Column: Enrolled Institutes & Teacher Branding Links -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem; grid-column: span 1;">
        
        ${o&&(o.role==="institute_admin"||o.role==="admin"||o.role==="super_admin")?`
          <!-- Teacher Portal Branding Settings Link Card -->
          <div class="card" style="padding: 1.5rem; border-radius: 12px; background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.1) 100%); border: 1.5 solid rgba(79, 70, 229, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                🌐 Coaching Portal Branding
              </h3>
              <span class="badge" style="background: var(--primary-color, #4f46e5); color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600; font-size: 0.75rem;">
                Teacher Admin
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--muted-text, #4b5563); margin-bottom: 1.25rem; line-height: 1.45;">
              Customize your student login portal, colors, logo, welcome messages, and copy your shareable student URLs.
            </p>
            <button id="goToCoachingBrandingBtn" class="btn btn-primary" style="width: 100%; padding: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">
              ✏️ Manage Portal Branding & URLs
            </button>
          </div>
        `:""}

        <!-- Enrolled Institutes Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              🏫 My Coaching Institutes
            </h3>
            <span style="font-size: 0.8rem; background: rgba(79, 70, 229, 0.1); color: var(--primary-color, #4f46e5); padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600;">
              Portal Switcher
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--muted-text, #6b7280); margin-bottom: 1.25rem;">
            Select which coaching portal you want to view active content and quizzes for.
          </p>

          <div id="institutesListContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="text-align: center; padding: 1.5rem; color: var(--muted-text, #9ca3af);">
              Loading enrolled institutes...
            </div>
          </div>
        </div>

        <!-- Institute Batches & Class Enrollments Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              📚 Class & Batch Memberships
            </h3>
            <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.1); color: #059669; padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600;">
              Teacher Approval
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--muted-text, #6b7280); margin-bottom: 1.25rem;">
            Join batches created by your active coaching institute to gain access to batch-specific CBT exams and tests.
          </p>

          <div id="studentBatchesListContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="text-align: center; padding: 1.5rem; color: var(--muted-text, #9ca3af);">
              Loading institute batches...
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Profile Details & Security -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Profile Info Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            👤 Personal Profile
          </h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted-text, #6b7280);">Full Name</label>
              <div style="font-size: 1rem; font-weight: 600; color: var(--text-color, #111827); margin-top: 0.2rem;">${o.full_name||"Student"}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted-text, #6b7280);">Email Address</label>
              <div style="font-size: 0.95rem; color: var(--text-color, #111827); margin-top: 0.2rem;">${o.email}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted-text, #6b7280);">Account Role</label>
              <div style="margin-top: 0.2rem;">
                <span class="badge" style="background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; text-transform: capitalize;">
                  ${(o.role||"user").replace("_"," ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Change Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            🔒 Security & Password Management
          </h3>

          <form id="changePasswordForm">
            <div id="passwordAlert" style="display: none; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;"></div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Current Password</label>
              <input type="password" id="currentPasswordInput" class="form-input" placeholder="••••••••" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">New Password</label>
              <input type="password" id="newPasswordInput" class="form-input" placeholder="At least 6 characters" minlength="6" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Confirm New Password</label>
              <input type="password" id="confirmPasswordInput" class="form-input" placeholder="Repeat new password" minlength="6" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            </div>

            <button type="submit" id="savePasswordBtn" class="btn btn-primary" style="width: 100%; padding: 0.75rem; border-radius: 8px;">
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  `;const i=e.querySelector("#backToDashBtn");i&&i.addEventListener("click",()=>s("dashboard"));const p=e.querySelector("#goToCoachingBrandingBtn");p&&p.addEventListener("click",()=>s("coaching-branding")),x(e,c),f(e,c);const d=e.querySelector("#changePasswordForm");return d.addEventListener("submit",async t=>{t.preventDefault();const a=e.querySelector("#currentPasswordInput").value,n=e.querySelector("#newPasswordInput").value,m=e.querySelector("#confirmPasswordInput").value,r=e.querySelector("#passwordAlert"),l=e.querySelector("#savePasswordBtn");if(n!==m){r.style.display="block",r.style.background="#fef2f2",r.style.color="#991b1b",r.textContent="New passwords do not match.";return}try{l.disabled=!0,l.textContent="Updating...";const g=localStorage.getItem("token"),b=await fetch("/api/auth/change-password",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${g}`},body:JSON.stringify({current_password:a,new_password:n})}),u=await b.json();r.style.display="block",b.ok?(r.style.background="#ecfdf5",r.style.color="#065f46",r.textContent="✅ Password updated successfully!",d.reset()):(r.style.background="#fef2f2",r.style.color="#991b1b",r.textContent=u.error||"Failed to update password.")}catch{r.style.display="block",r.style.background="#fef2f2",r.style.color="#991b1b",r.textContent="Network error updating password."}finally{l.disabled=!1,l.textContent="Update Password"}}),e}async function x(s,e){const o=s.querySelector("#institutesListContainer"),c=localStorage.getItem("token");try{const i=await fetch("/api/institutes/my-enrollments",{headers:{Authorization:`Bearer ${c}`}});if(!i.ok)throw new Error("Failed loading enrollments");const d=(await i.json()).enrollments||[];if(d.length===0){o.innerHTML=`
        <div style="text-align: center; padding: 1.5rem; background: var(--bg-hover, #f9fafb); border-radius: 8px;">
          <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--muted-text, #6b7280);">
            You are not enrolled in any coaching institute yet.
          </p>
          <span style="font-size: 0.8rem; color: var(--muted-text, #9ca3af);">
            Open a teacher's portal link to join their coaching automatically.
          </span>
        </div>
      `;return}o.innerHTML="",d.forEach(t=>{const a=e&&(e.id===t.id||e.code===t.code),n=document.createElement("div");n.style.cssText=`
        padding: 1rem;
        border-radius: 10px;
        border: 2px solid ${a?t.primary_color||"#4f46e5":"var(--border-color, #e5e7eb)"};
        background: ${a?"rgba(79, 70, 229, 0.03)":"var(--bg-card, #ffffff)"};
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        transition: all 0.2s ease;
      `,n.innerHTML=`
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div style="width: 42px; height: 42px; border-radius: 8px; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
            ${t.logo_url?`<img src="${t.logo_url}" alt="${t.name}" style="width: 100%; height: 100%; object-fit: contain;">`:'<span style="font-size: 1.25rem;">🎓</span>'}
          </div>

          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-color, #111827); line-height: 1.3;">
              ${t.name}
            </div>
            <div style="font-size: 0.8rem; color: var(--muted-text, #6b7280); margin-top: 0.15rem;">
              ${t.batch_name?`Batch: <strong>${t.batch_name}</strong>`:`Code: <code>${t.code}</code>`}
            </div>
          </div>
        </div>

        <button class="switch-inst-btn btn ${a?"btn-success":"btn-secondary"}" 
                data-id="${t.id}" 
                style="padding: 0.4rem 0.85rem; font-size: 0.82rem; border-radius: 6px; font-weight: 600; flex-shrink: 0; ${a?"background: #10b981; border-color: #10b981; color: white;":""}">
          ${a?"✓ Active Portal":"Switch Portal"}
        </button>
      `;const m=n.querySelector(".switch-inst-btn");a||m.addEventListener("click",()=>{v(t),window.location.reload()}),o.appendChild(n)})}catch{o.innerHTML=`
      <div style="color: #ef4444; font-size: 0.85rem; padding: 1rem; text-align: center;">
        Failed loading enrolled institutes.
      </div>
    `}}async function f(s,e){const o=s.querySelector("#studentBatchesListContainer");if(!o)return;if(!e||!e.id){o.innerHTML=`
      <div style="text-align: center; padding: 1.2rem; background: var(--bg-hover, #f9fafb); border-radius: 8px; font-size: 0.85rem; color: var(--muted-text, #6b7280);">
        Select an active coaching institute above to view available classes & batches.
      </div>
    `;return}const c=localStorage.getItem("token");try{const i=await fetch(`/api/institutes/${e.id}/batches-status`,{headers:{Authorization:`Bearer ${c}`}});if(!i.ok)throw new Error("Failed loading batches");const d=(await i.json()).batches||[];if(d.length===0){o.innerHTML=`
        <div style="text-align: center; padding: 1.2rem; background: var(--bg-hover, #f9fafb); border-radius: 8px; font-size: 0.85rem; color: var(--muted-text, #6b7280);">
          No batches or classes created yet for ${e.name}.
        </div>
      `;return}o.innerHTML="",d.forEach(t=>{const a=document.createElement("div");a.style.cssText=`
        padding: 0.85rem 1rem;
        border-radius: 10px;
        border: 1px solid var(--border-color, #e5e7eb);
        background: var(--bg-card, #ffffff);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      `;let n="",m="";t.student_status==="approved"?n='<span style="font-size: 0.8rem; background: #d1fae5; color: #065f46; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">✅ Active Batch</span>':t.student_status==="pending"?n='<span style="font-size: 0.8rem; background: #fef3c7; color: #92400e; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">⏳ Pending Approval</span>':t.student_status==="rejected"?(n='<span style="font-size: 0.8rem; background: #fee2e2; color: #991b1b; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">❌ Request Rejected</span>',m=`<button class="btn btn-secondary re-request-btn" data-batch-id="${t.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">Re-Apply</button>`):m=`<button class="btn btn-primary join-batch-btn" data-batch-id="${t.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 700;">Request to Join</button>`,a.innerHTML=`
        <div>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-color, #111827);">
            ${t.name} ${t.code?`<span style="font-size: 0.75rem; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; color: var(--muted-text); font-weight: 600;">${t.code}</span>`:""}
          </div>
          ${t.description?`<div style="font-size: 0.8rem; color: var(--muted-text, #6b7280); margin-top: 2px;">${t.description}</div>`:""}
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          ${n}
          ${m}
        </div>
      `;const r=a.querySelector(".join-batch-btn, .re-request-btn");r&&r.addEventListener("click",async()=>{r.disabled=!0,r.textContent="Submitting...";try{const l=await fetch("/api/institutes/batches/join-request",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({batch_id:t.id})});if(l.ok)f(s,e);else{const g=await l.json();alert(g.error||"Failed to submit batch request."),r.disabled=!1,r.textContent="Request to Join"}}catch{alert("Network error submitting request."),r.disabled=!1,r.textContent="Request to Join"}}),o.appendChild(a)})}catch{o.innerHTML=`
      <div style="color: #ef4444; font-size: 0.85rem; padding: 1rem; text-align: center;">
        Failed loading batches.
      </div>
    `}}export{k as renderStudentSettingsView};
