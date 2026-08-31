import{g as f,C as h,o as x,s as w}from"./index-BHxKXAPC.js";function P(l){const r=document.createElement("div");r.className="container page-view",r.style.maxWidth="1400px",r.style.padding="2rem 1rem";const t=f();if(!t)return l("login"),r;r.innerHTML=`
    <!-- Page Header -->
    <div class="responsive-page-header">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
          ⚙️ Account Settings
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
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
        
        ${t&&(t.role==="institute_admin"||t.role==="admin"||t.role==="super_admin")?`
          <!-- Teacher Portal Branding Settings Link Card -->
          <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--primary-light); border: 1px solid var(--primary-border); box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                🌐 Coaching Portal Branding
              </h3>
              <span class="badge" style="background: var(--primary); color: #ffffff; padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600; font-size: 0.75rem;">
                Teacher Admin
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.45;">
              Customize your student login portal, colors, logo, welcome messages, and copy your shareable student URLs.
            </p>
            <button id="goToCoachingBrandingBtn" class="btn btn-primary" style="width: 100%; padding: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">
              ✏️ Manage Portal Branding & URLs
            </button>
          </div>
        `:""}

        ${!t||t.role==="user"?`
          <!-- Institute Batches & Class Enrollments Card (Students Only) -->
          <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                📚 Class & Batch Memberships
              </h3>
              <span style="font-size: 0.8rem; background: var(--success-bg); color: var(--success); padding: 0.2rem 0.6rem; border-radius: 20px; font-weight: 600; border: 1px solid var(--success-border);">
                Teacher Approval
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Join batches created by your coaching institute to gain access to batch-specific CBT exams and tests.
            </p>

            <div id="studentBatchesListContainer" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
                Loading institute batches...
              </div>
            </div>
          </div>
        `:""}

      </div>

      <!-- Right Column: Profile Details & Security -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Profile Info Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            👤 Personal Profile
          </h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--text-muted);">Full Name</label>
              <div style="font-size: 1rem; font-weight: 600; color: var(--text-main); margin-top: 0.2rem;">${t.full_name||"Student"}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--text-muted);">Email Address</label>
              <div style="font-size: 0.95rem; color: var(--text-main); margin-top: 0.2rem;">${t.email}</div>
            </div>

            <div>
              <label style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--text-muted);">Account Role</label>
              <div style="margin-top: 0.2rem;">
                <span class="badge" style="background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-border); padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem; text-transform: capitalize;">
                  ${(t.role||"user").replace("_"," ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Change Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            🔒 Security & Password Management
          </h3>

          <form id="changePasswordForm">
            <div id="passwordAlert" style="display: none; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;"></div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Current Password</label>
              <input type="password" id="currentPasswordInput" class="form-control" placeholder="••••••••" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px;">
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">New Password</label>
              <input type="password" id="newPasswordInput" class="form-control" placeholder="At least 6 characters" minlength="6" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px;">
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Confirm New Password</label>
              <input type="password" id="confirmPasswordInput" class="form-control" placeholder="Repeat new password" minlength="6" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px;">
            </div>

            <button type="submit" id="savePasswordBtn" class="btn btn-primary" style="width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: 700;">
              Update Password
            </button>
          </form>
        </div>

        <!-- GDPR Privacy & Cookie Storage Settings Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); margin-top: 1.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            🛡️ Privacy & Cookie Storage Controls
          </h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.45;">
            Control your data privacy preferences under GDPR & ePrivacy regulations. View and manage optional storage categories (functional UI choices, performance metrics, and marketing tags).
          </p>

          <div style="background: var(--app-bg); padding: 12px 16px; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); display: block;">Consent Decision Status</span>
              <span id="consent-status-pill" style="font-size: 0.78rem; color: var(--primary); font-weight: 600;">
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
  `;const c=r.querySelector("#backToDashBtn");c&&c.addEventListener("click",()=>l("dashboard"));const i=r.querySelector("#btnOpenGdprSettings");i&&i.addEventListener("click",()=>{x()});const s=r.querySelector("#goToCoachingBrandingBtn");s&&s.addEventListener("click",()=>l("coaching-branding")),y(r,t);const d=r.querySelector("#changePasswordForm");return d.addEventListener("submit",async b=>{b.preventDefault();const a=r.querySelector("#currentPasswordInput").value,n=r.querySelector("#newPasswordInput").value,m=r.querySelector("#confirmPasswordInput").value,e=r.querySelector("#passwordAlert"),p=r.querySelector("#savePasswordBtn");if(n!==m){e.style.display="block",e.style.background="var(--danger-bg)",e.style.color="var(--danger)",e.style.border="1px solid var(--danger-border)",e.textContent="New password and confirmation password do not match.";return}try{p.disabled=!0,p.textContent="Updating...";const u=localStorage.getItem("token"),o=await fetch("/api/auth/change-password",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},body:JSON.stringify({currentPassword:a,newPassword:n})}),g=await o.json();e.style.display="block",o.ok?(e.style.background="var(--success-bg)",e.style.color="var(--success)",e.style.border="1px solid var(--success-border)",e.textContent=g.message||"Password changed successfully.",d.reset()):(e.style.background="var(--danger-bg)",e.style.color="var(--danger)",e.style.border="1px solid var(--danger-border)",e.textContent=g.error||"Failed to change password.")}catch{e.style.display="block",e.style.background="var(--danger-bg)",e.style.color="var(--danger)",e.style.border="1px solid var(--danger-border)",e.textContent="Error connecting to server. Please try again."}finally{p.disabled=!1,p.textContent="Update Password"}}),w(r),r}async function y(l,r){const t=l.querySelector("#studentBatchesListContainer");if(!t)return;const c=localStorage.getItem("token");let i=r?r.institute_id:null;if(!i)try{const s=await fetch("/api/institutes/my-enrollments",{headers:{Authorization:`Bearer ${c}`}});if(s.ok){const d=await s.json();d.enrollments&&d.enrollments.length>0&&(i=d.enrollments[0].id)}}catch{}if(!i){t.innerHTML=`
      <div style="text-align: center; padding: 1.2rem; background: var(--app-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-muted); border: 1px solid var(--border-color);">
        You are not enrolled in any coaching institute yet.
      </div>
    `;return}try{const s=await fetch(`/api/institutes/${i}/batches-status`,{headers:{Authorization:`Bearer ${c}`}});if(!s.ok)throw new Error("Failed loading batches");const b=(await s.json()).batches||[];if(b.length===0){t.innerHTML=`
        <div style="text-align: center; padding: 1.2rem; background: var(--app-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-muted); border: 1px solid var(--border-color);">
          No batches or classes created yet for your institute.
        </div>
      `;return}t.innerHTML="",b.forEach(a=>{const n=document.createElement("div");n.style.cssText=`
        padding: 0.85rem 1rem;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      `;let m="",e="";a.student_status==="approved"?m='<span style="font-size: 0.8rem; background: var(--success-bg); color: var(--success); padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700; border: 1px solid var(--success-border);">✅ Active Batch</span>':a.student_status==="pending"?m='<span style="font-size: 0.8rem; background: rgba(245, 158, 11, 0.15); color: #d97706; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.35);">⏳ Pending Approval</span>':a.student_status==="rejected"?(m='<span style="font-size: 0.8rem; background: var(--danger-bg); color: var(--danger); padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 700; border: 1px solid var(--danger-border);">❌ Request Rejected</span>',e=`<button class="btn btn-outline btn-sm btn-reapply" data-id="${a.id}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">Re-Apply</button>`):e=`<button class="btn btn-primary btn-sm btn-request-join" data-id="${a.id}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">Request to Join</button>`;const p=a.batch_name||a.name||"Unnamed Batch",u=a.batch_code||a.code||"";n.innerHTML=`
        <div>
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">${p}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.1rem;">
            ${a.target_exam?`Exam: ${a.target_exam}`:""} ${u?`(Code: <code>${u}</code>)`:""}
          </div>
        </div>
        <div>
          ${m}
          ${e}
        </div>
      `;const o=n.querySelector(".btn-request-join")||n.querySelector(".btn-reapply");o&&o.addEventListener("click",async()=>{try{o.disabled=!0,o.textContent="Submitting...";const g=await fetch("/api/institutes/batches/join-request",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({batch_id:a.id})});if(g.ok)y(l,r);else{const v=await g.json();alert(v.error||"Failed to submit batch request."),o.disabled=!1,o.textContent="Request to Join"}}catch{alert("Error submitting request."),o.disabled=!1,o.textContent="Request to Join"}}),t.appendChild(n)})}catch{t.innerHTML=`
      <div style="color: var(--danger); font-size: 0.85rem; padding: 1rem; text-align: center; background: var(--danger-bg); border-radius: 8px; border: 1px solid var(--danger-border);">
        Failed loading institute batches.
      </div>
    `}}export{P as renderStudentSettingsView};
