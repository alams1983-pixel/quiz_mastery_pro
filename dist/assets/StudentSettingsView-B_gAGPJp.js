import{g as y,C as h,o as v}from"./index-OqYRO6st.js";function w(l){const e=document.createElement("div");e.className="container page-view",e.style.maxWidth="1000px",e.style.padding="2rem 1rem";const r=y();if(!r)return l("login"),e;e.innerHTML=`
    <!-- Page Header -->
    <div class="responsive-page-header">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-color, #111827); margin-bottom: 0.25rem;">
          ⚙️ Account Settings
        </h1>
        <p style="color: var(--muted-text, #6b7280); font-size: 0.95rem;">
          Manage your personal profile, change password, and view enrolled class & batch memberships.
        </p>
      </div>
      <button id="backToDashBtn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
        ← Back to Dashboard
      </button>
    </div>

    <!-- Layout Grid -->
    <div class="settings-grid">
      
      <!-- Left Column: Teacher Branding Links & Class Enrollments -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem; grid-column: span 1;">
        
        ${r&&(r.role==="institute_admin"||r.role==="admin"||r.role==="super_admin")?`
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

        ${!r||r.role==="user"?`
          <!-- Institute Batches & Class Enrollments Card (Students Only) -->
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
              Join batches created by your coaching institute to gain access to batch-specific CBT exams and tests.
            </p>

            <div id="studentBatchesListContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="text-align: center; padding: 1.5rem; color: var(--muted-text, #9ca3af);">
                Loading institute batches...
              </div>
            </div>
          </div>
        `:""}

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
              <div style="font-size: 1rem; font-weight: 600; color: var(--text-color, #111827); margin-top: 0.2rem;">${r.full_name||"Student"}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted-text, #6b7280);">Email Address</label>
              <div style="font-size: 0.95rem; color: var(--text-color, #111827); margin-top: 0.2rem;">${r.email}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--muted-text, #6b7280);">Account Role</label>
              <div style="margin-top: 0.2rem;">
                <span class="badge" style="background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; text-transform: capitalize;">
                  ${(r.role||"user").replace("_"," ")}
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

        <!-- GDPR Privacy & Cookie Storage Settings Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb); margin-top: 1.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            🛡️ Privacy & Cookie Storage Controls
          </h3>
          <p style="color: var(--muted-text, #6b7280); font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.45;">
            Control your data privacy preferences under GDPR & ePrivacy regulations. View and manage optional storage categories (functional UI choices, performance metrics, and marketing tags).
          </p>

          <div style="background: var(--bg-color, #f8fafc); padding: 12px 16px; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--primary-border, #e2e8f0); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-main, #1e293b); display: block;">Consent Decision Status</span>
              <span id="consent-status-pill" style="font-size: 0.78rem; color: var(--primary-color, #4f46e5); font-weight: 600;">
                ${h.hasDecided()?"✓ Preferences Configured":"⚠️ Pending Decision"}
              </span>
            </div>
            <button id="btnOpenGdprSettings" class="btn btn-secondary" style="font-size: 0.85rem; padding: 6px 14px; border-radius: 6px; display: flex; align-items: center; gap: 6px;">
              <i class="ri-settings-4-line"></i> Manage Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  `;const c=e.querySelector("#backToDashBtn");c&&c.addEventListener("click",()=>l("dashboard"));const s=e.querySelector("#btnOpenGdprSettings");s&&s.addEventListener("click",()=>{v()});const n=e.querySelector("#goToCoachingBrandingBtn");n&&n.addEventListener("click",()=>l("coaching-branding")),f(e,r);const i=e.querySelector("#changePasswordForm");return i.addEventListener("submit",async g=>{g.preventDefault();const o=e.querySelector("#currentPasswordInput").value,d=e.querySelector("#newPasswordInput").value,p=e.querySelector("#confirmPasswordInput").value,t=e.querySelector("#passwordAlert"),a=e.querySelector("#savePasswordBtn");if(d!==p){t.style.display="block",t.style.background="#fef2f2",t.style.color="#991b1b",t.textContent="New passwords do not match.";return}try{a.disabled=!0,a.textContent="Updating...";const m=localStorage.getItem("token"),b=await fetch("/api/auth/change-password",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m}`},body:JSON.stringify({current_password:o,new_password:d})}),u=await b.json();t.style.display="block",b.ok?(t.style.background="#ecfdf5",t.style.color="#065f46",t.textContent="✅ Password updated successfully!",i.reset()):(t.style.background="#fef2f2",t.style.color="#991b1b",t.textContent=u.error||"Failed to update password.")}catch{t.style.display="block",t.style.background="#fef2f2",t.style.color="#991b1b",t.textContent="Network error updating password."}finally{a.disabled=!1,a.textContent="Update Password"}}),e}async function f(l,e){const r=l.querySelector("#studentBatchesListContainer");if(!r)return;const c=localStorage.getItem("token");let s=e?e.institute_id:null;if(!s)try{const n=await fetch("/api/institutes/my-enrollments",{headers:{Authorization:`Bearer ${c}`}});if(n.ok){const i=await n.json();i.enrollments&&i.enrollments.length>0&&(s=i.enrollments[0].id)}}catch{}if(!s){r.innerHTML=`
      <div style="text-align: center; padding: 1.2rem; background: var(--bg-hover, #f9fafb); border-radius: 8px; font-size: 0.85rem; color: var(--muted-text, #6b7280);">
        You are not enrolled in any coaching institute yet.
      </div>
    `;return}try{const n=await fetch(`/api/institutes/${s}/batches-status`,{headers:{Authorization:`Bearer ${c}`}});if(!n.ok)throw new Error("Failed loading batches");const g=(await n.json()).batches||[];if(g.length===0){r.innerHTML=`
        <div style="text-align: center; padding: 1.2rem; background: var(--bg-hover, #f9fafb); border-radius: 8px; font-size: 0.85rem; color: var(--muted-text, #6b7280);">
          No batches or classes created yet for your institute.
        </div>
      `;return}r.innerHTML="",g.forEach(o=>{const d=document.createElement("div");d.style.cssText=`
        padding: 0.85rem 1rem;
        border-radius: 10px;
        border: 1px solid var(--border-color, #e5e7eb);
        background: var(--bg-card, #ffffff);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      `;let p="",t="";o.student_status==="approved"?p='<span style="font-size: 0.8rem; background: #d1fae5; color: #065f46; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">✅ Active Batch</span>':o.student_status==="pending"?p='<span style="font-size: 0.8rem; background: #fef3c7; color: #92400e; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">⏳ Pending Approval</span>':o.student_status==="rejected"?(p='<span style="font-size: 0.8rem; background: #fee2e2; color: #991b1b; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700;">❌ Request Rejected</span>',t=`<button class="btn btn-secondary re-request-btn" data-batch-id="${o.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">Re-Apply</button>`):t=`<button class="btn btn-primary join-batch-btn" data-batch-id="${o.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 700;">Request to Join</button>`,d.innerHTML=`
        <div>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-color, #111827);">
            ${o.name} ${o.code?`<span style="font-size: 0.75rem; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; color: var(--muted-text); font-weight: 600;">${o.code}</span>`:""}
          </div>
          ${o.description?`<div style="font-size: 0.8rem; color: var(--muted-text, #6b7280); margin-top: 2px;">${o.description}</div>`:""}
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          ${p}
          ${t}
        </div>
      `;const a=d.querySelector(".join-batch-btn, .re-request-btn");a&&a.addEventListener("click",async()=>{a.disabled=!0,a.textContent="Submitting...";try{const m=await fetch("/api/institutes/batches/join-request",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({batch_id:o.id})});if(m.ok)f(l,e);else{const b=await m.json();alert(b.error||"Failed to submit batch request."),a.disabled=!1,a.textContent="Request to Join"}}catch{alert("Network error submitting request."),a.disabled=!1,a.textContent="Request to Join"}}),r.appendChild(d)})}catch{r.innerHTML=`
      <div style="color: #ef4444; font-size: 0.85rem; padding: 1rem; text-align: center;">
        Failed loading batches.
      </div>
    `}}export{w as renderStudentSettingsView};
