import{b as d}from"./index-CyV29KP3.js";function f(t){const s=document.createElement("div");return s.className="view-container fade-in",s.innerHTML=`
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
          👑 User Role Control & Access Management
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Platform-wide user management. Assign administrator permissions, adjust user roles, and monitor active accounts.
        </p>
      </div>
      <span class="role-badge super_admin" style="font-size: 0.9rem; padding: 6px 14px;">
        👑 Super Admin Privileged
      </span>
    </div>

    <!-- User Metrics Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total User Accounts</span>
        <div id="statTotalUsers" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Super Administrators</span>
        <div id="statSuperAdmins" style="font-size: 1.8rem; font-weight: 800; color: #8b5cf6; margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Institute Admins</span>
        <div id="statInstituteAdmins" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Quiz Admins</span>
        <div id="statQuizAdmins" style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 18px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Students / Users</span>
        <div id="statStudents" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-</div>
      </div>
    </div>

    <!-- User Table Card -->
    <div class="card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">User Account Directory</h3>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <select id="roleFilter" class="form-select" style="padding: 8px 12px; width: 160px; font-size: 0.88rem;">
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="institute_admin">Institute Admin</option>
            <option value="admin">Quiz Admin</option>
            <option value="user">Student / User</option>
          </select>
          <input type="text" id="userSearchInput" class="form-input" placeholder="🔍 Search name or email..." style="width: 260px; font-size: 0.88rem;" />
        </div>
      </div>

      <div class="table-wrap">
        <table class="custom-table mobile-card-table" style="width: 100%;">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Registration Date</th>
              <th>Role Permission Actions</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <tr>
              <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                Loading user directory...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,setTimeout(()=>{p(s)},0),s}let o=[];async function p(t){try{o=(await d.getUsers()).users||[];let r=0,e=0,a=0,i=0;o.forEach(n=>{n.role==="super_admin"?r++:n.role==="institute_admin"?e++:n.role==="admin"?a++:i++}),t.querySelector("#statTotalUsers").textContent=o.length,t.querySelector("#statSuperAdmins").textContent=r,t.querySelector("#statInstituteAdmins").textContent=e,t.querySelector("#statQuizAdmins").textContent=a,t.querySelector("#statStudents").textContent=i,c(t,o),m(t)}catch(s){const r=t.querySelector("#usersTableBody");r&&(r.innerHTML=`<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--danger);">Error loading users: ${s.message}</td></tr>`)}}function c(t,s){const r=t.querySelector("#usersTableBody");if(r){if(!s||s.length===0){r.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No users match the search filter.</td></tr>';return}r.innerHTML=s.map(e=>{const a=e.role==="super_admin";return`
      <tr>
        <td data-label="ID" style="font-weight: 700; color: var(--text-muted); font-size: 0.85rem;">#${e.id}</td>
        <td data-label="Name" style="font-weight: 700; color: var(--text-main);">${e.full_name}</td>
        <td data-label="Email">${e.email}</td>
        <td data-label="Role">
          <span class="role-badge ${e.role}">${e.role.replace("_"," ")}</span>
        </td>
        <td data-label="Registered" style="font-size: 0.85rem; color: var(--text-muted);">${new Date(e.created_at).toLocaleDateString()}</td>
        <td data-label="Action">
          ${a?'<span style="font-size:0.82rem; color:var(--text-muted); font-style:italic;">Protected Owner</span>':`
            <select class="user-role-select form-select" data-id="${e.id}" style="padding: 4px 8px; font-size: 0.82rem; width: 140px; display: inline-block;">
              <option value="user" ${e.role==="user"?"selected":""}>Student / User</option>
              <option value="admin" ${e.role==="admin"?"selected":""}>Quiz Admin</option>
              <option value="institute_admin" ${e.role==="institute_admin"?"selected":""}>Institute Admin</option>
            </select>
          `}
        </td>
      </tr>
    `}).join(""),r.querySelectorAll(".user-role-select").forEach(e=>{e.addEventListener("change",async()=>{const a=e.dataset.id,i=e.value;try{await d.updateUserRole(a,i),p(t)}catch(n){alert(n.message||"Error updating user role")}})})}}function m(t){const s=t.querySelector("#userSearchInput"),r=t.querySelector("#roleFilter");function e(){const a=s.value.toLowerCase().trim(),i=r.value,n=o.filter(l=>!(i&&l.role!==i||a&&!(l.full_name.toLowerCase().includes(a)||l.email.toLowerCase().includes(a))));c(t,n)}s&&s.addEventListener("input",e),r&&r.addEventListener("change",e)}export{f as renderUserManagementView};
