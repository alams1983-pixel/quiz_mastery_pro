import{s as w,r as p}from"./index-CmO4Cwr9.js";function L(){const t=document.createElement("div");return t.className="view-container fade-in",t.innerHTML=`
    <div class="saas-header">
      <div class="saas-title-group">
        <h1>Super Admin Console 👑</h1>
        <p>Global multi-tenant platform oversight, coaching institute administration, and system metrics.</p>
      </div>
      <div>
        <button id="btn-create-institute" class="btn btn-primary">
          <i class="ri-add-line"></i> Create Coaching Institute
        </button>
      </div>
    </div>

    <!-- Platform Stats Cards -->
    <div class="saas-stats-grid">
      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-building-4-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="stat-institutes">-</span>
          <span class="saas-stat-label">Coaching Institutes</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-user-star-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="stat-students">-</span>
          <span class="saas-stat-label">Enrolled Students</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-questionnaire-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="stat-quizzes">-</span>
          <span class="saas-stat-label">Active Quizzes</span>
        </div>
      </div>

      <div class="saas-stat-card">
        <div class="saas-stat-icon"><i class="ri-shield-user-line"></i></div>
        <div class="saas-stat-info">
          <span class="saas-stat-value" id="stat-users">-</span>
          <span class="saas-stat-label">Total Accounts</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 12px; border-bottom: 2px solid var(--border-color); margin-bottom: 24px;">
      <button id="tab-institutes" class="btn-text active" style="font-weight: 700; padding: 10px 16px; border-bottom: 3px solid var(--primary);">Coaching Institutes</button>
      <button id="tab-users" class="btn-text" style="font-weight: 700; padding: 10px 16px; color: var(--text-muted);">Users & Roles</button>
    </div>

    <!-- Tab 1: Institutes Table -->
    <div id="section-institutes">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.2rem; font-weight: 700;">Coaching Institutes Directory</h3>
          <input type="text" id="search-institutes" placeholder="Search institute name or code..." style="padding: 8px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); width: 280px;">
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Institute Name</th>
                <th>Institute Code</th>
                <th>Contact Email</th>
                <th>Students</th>
                <th>Quizzes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="institutes-table-body">
              <tr><td colspan="7" style="text-align: center; padding: 30px;">Loading institutes...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 2: Users & Roles Table -->
    <div id="section-users" style="display: none;">
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.2rem; font-weight: 700;">User Accounts & Role Permissions</h3>
          <input type="text" id="search-users" placeholder="Search by name or email..." style="padding: 8px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); width: 280px;">
        </div>

        <div style="overflow-x: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Institute</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="users-table-body">
              <tr><td colspan="6" style="text-align: center; padding: 30px;">Loading users...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Institute Modal -->
    <div id="modal-create-inst" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
      <div class="card" style="width: 100%; max-width: 540px; padding: 24px; background: var(--card-bg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="font-size: 1.3rem; font-weight: 800;">Register New Coaching Institute</h3>
          <button id="close-modal-inst" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <form id="form-create-inst">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Institute Name *</label>
            <input type="text" id="inst-name" class="form-control" placeholder="e.g. Apex Academy" required>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Contact Email *</label>
            <input type="email" id="inst-email" class="form-control" placeholder="contact@apexacademy.com" required>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Address / Location</label>
            <input type="text" id="inst-address" class="form-control" placeholder="City, State">
          </div>

          <hr style="margin: 18px 0; border: none; border-top: 1px solid var(--border-color);">
          <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 10px;">Institute Admin Account (Optional)</h4>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Admin Name</label>
              <input type="text" id="inst-admin-name" class="form-control" placeholder="John Doe">
            </div>
            <div class="form-group">
              <label class="form-label">Admin Email</label>
              <input type="email" id="inst-admin-email" class="form-control" placeholder="admin@apex.com">
            </div>
          </div>

          <div class="form-group" style="margin-top: 12px; margin-bottom: 20px;">
            <label class="form-label">Admin Password</label>
            <input type="password" id="inst-admin-pass" class="form-control" placeholder="Initial password">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" id="cancel-modal-inst" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Institute</button>
          </div>
        </form>
      </div>
    </div>
  `,setTimeout(()=>{w(t),q(t),y(t)},0),t}let u=[],m=[];async function y(t){try{const[s,a]=await Promise.all([p("/institutes"),p("/auth/users")]);u=s.institutes||[],m=a.users||[];let e=0,i=0;u.forEach(r=>{e+=parseInt(r.student_count||0,10),i+=parseInt(r.quiz_count||0,10)}),t.querySelector("#stat-institutes").textContent=u.length,t.querySelector("#stat-students").textContent=e,t.querySelector("#stat-quizzes").textContent=i,t.querySelector("#stat-users").textContent=m.length,h(t,u),f(t,m)}catch(s){console.error("Failed to load Super Admin data:",s)}}function h(t,s){const a=t.querySelector("#institutes-table-body");if(!s||s.length===0){a.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No coaching institutes found. Click "Create Coaching Institute" to add one.</td></tr>';return}a.innerHTML=s.map(e=>`
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${e.name}</td>
      <td><span class="code-pill">${e.code}</span></td>
      <td>${e.contact_email}</td>
      <td style="font-weight: 700;">${e.student_count||0}</td>
      <td>${e.quiz_count||0}</td>
      <td><span class="status-badge status-${e.status}">${e.status}</span></td>
      <td>
        <button class="btn-text btn-toggle-status" data-id="${e.id}" data-status="${e.status}" style="font-size: 0.85rem; font-weight: 600; color: var(--primary);">
          ${e.status==="active"?"Deactivate":"Activate"}
        </button>
      </td>
    </tr>
  `).join(""),a.querySelectorAll(".btn-toggle-status").forEach(e=>{e.addEventListener("click",async()=>{const i=e.dataset.id,o=e.dataset.status==="active"?"inactive":"active";try{await p(`/institutes/${i}`,{method:"PUT",body:JSON.stringify({status:o})}),y(t)}catch(v){alert(v.message||"Error updating status")}})})}function f(t,s){const a=t.querySelector("#users-table-body");if(!s||s.length===0){a.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 24px;">No users found.</td></tr>';return}a.innerHTML=s.map(e=>`
    <tr>
      <td style="font-weight: 700;">${e.full_name}</td>
      <td>${e.email}</td>
      <td><span class="role-badge role-${e.role}">${e.role}</span></td>
      <td>${e.institute_name?`<span class="institute-badge"><i class="ri-building-line"></i> ${e.institute_name}</span>`:'<span style="color: var(--text-light);">-</span>'}</td>
      <td>${new Date(e.created_at).toLocaleDateString()}</td>
      <td>
        ${e.role!=="super_admin"?`
          <select class="role-selector" data-id="${e.id}" style="padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.85rem;">
            <option value="user" ${e.role==="user"?"selected":""}>Student / User</option>
            <option value="institute_admin" ${e.role==="institute_admin"?"selected":""}>Institute Admin</option>
          </select>
        `:'<span style="font-size: 0.8rem; color: var(--text-light);">Owner</span>'}
      </td>
    </tr>
  `).join(""),a.querySelectorAll(".role-selector").forEach(e=>{e.addEventListener("change",async()=>{const i=e.dataset.id,r=e.value;try{await p(`/auth/users/${i}/role`,{method:"PUT",body:JSON.stringify({role:r})}),y(t)}catch(o){alert(o.message||"Error updating user role")}})})}function q(t){const s=t.querySelector("#tab-institutes"),a=t.querySelector("#tab-users"),e=t.querySelector("#section-institutes"),i=t.querySelector("#section-users");s.addEventListener("click",()=>{s.classList.add("active"),s.style.borderBottom="3px solid var(--primary)",s.style.color="var(--text-main)",a.classList.remove("active"),a.style.borderBottom="none",a.style.color="var(--text-muted)",e.style.display="block",i.style.display="none"}),a.addEventListener("click",()=>{a.classList.add("active"),a.style.borderBottom="3px solid var(--primary)",a.style.color="var(--text-main)",s.classList.remove("active"),s.style.borderBottom="none",s.style.color="var(--text-muted)",i.style.display="block",e.style.display="none"});const r=t.querySelector("#modal-create-inst"),o=t.querySelector("#btn-create-institute"),v=t.querySelector("#close-modal-inst"),x=t.querySelector("#cancel-modal-inst"),g=t.querySelector("#form-create-inst"),S=()=>{r.style.display="flex"},b=()=>{r.style.display="none",g.reset()};o.addEventListener("click",S),v.addEventListener("click",b),x.addEventListener("click",b),g.addEventListener("submit",async d=>{d.preventDefault();const l={name:t.querySelector("#inst-name").value.trim(),contact_email:t.querySelector("#inst-email").value.trim(),address:t.querySelector("#inst-address").value.trim(),admin_name:t.querySelector("#inst-admin-name").value.trim(),admin_email:t.querySelector("#inst-admin-email").value.trim(),admin_password:t.querySelector("#inst-admin-pass").value.trim()};try{const n=await p("/institutes",{method:"POST",body:JSON.stringify(l)});alert(`Institute "${l.name}" created successfully! Code: ${n.code}`),b(),y(t)}catch(n){alert(n.message||"Error creating institute.")}}),t.querySelector("#search-institutes").addEventListener("input",d=>{const l=d.target.value.toLowerCase(),n=u.filter(c=>c.name.toLowerCase().includes(l)||c.code.toLowerCase().includes(l));h(t,n)}),t.querySelector("#search-users").addEventListener("input",d=>{const l=d.target.value.toLowerCase(),n=m.filter(c=>c.full_name.toLowerCase().includes(l)||c.email.toLowerCase().includes(l));f(t,n)})}export{L as renderSuperAdminView};
