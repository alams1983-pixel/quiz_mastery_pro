import{f as b,b as y,h as w}from"./index-BHxKXAPC.js";let i=1,p=20,x={total:0,page:1,limit:20,totalPages:1},v=null;function $(t){i=1;const s=document.createElement("div");return s.className="view-container fade-in",s.innerHTML=`
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
          👑 User Role Control & Access Management
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Platform-wide user management. Assign administrator permissions, adjust user roles, and monitor active accounts with server-side pagination.
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
          <input type="text" id="userSearchInput" class="form-input" placeholder="🔍 Search name, email, phone..." style="width: 260px; font-size: 0.88rem;" />
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

      <!-- Bottom Pagination Container -->
      <div id="usersPaginationContainer" style="margin-top: 20px;"></div>
    </div>
  `,l(s),L(s),s}async function l(t){var e,n;const s=((e=t.querySelector("#roleFilter"))==null?void 0:e.value)||"",r=((n=t.querySelector("#userSearchInput"))==null?void 0:n.value.trim())||"";b("Loading User Accounts...","Fetching users & role statistics...");try{const a=await y.getUsers({page:i,limit:p,role:s,search:r}),o=a.users||[],d=a.stats||{};x=a.pagination||{total:o.length,page:i,limit:p,totalPages:1},t.querySelector("#statTotalUsers").textContent=(d.total||0).toLocaleString(),t.querySelector("#statSuperAdmins").textContent=(d.super_admin||0).toLocaleString(),t.querySelector("#statInstituteAdmins").textContent=(d.institute_admin||0).toLocaleString(),t.querySelector("#statQuizAdmins").textContent=(d.admin||0).toLocaleString(),t.querySelector("#statStudents").textContent=(d.user||0).toLocaleString(),S(t,o),z(t)}catch(a){const o=t.querySelector("#usersTableBody");o&&(o.innerHTML=`<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--danger);">Error loading users: ${a.message}</td></tr>`)}finally{w()}}function S(t,s){const r=t.querySelector("#usersTableBody");if(r){if(!s||s.length===0){r.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No users match the search filter.</td></tr>';return}r.innerHTML=s.map(e=>{const n=e.role==="super_admin";return`
      <tr>
        <td data-label="ID" style="font-weight: 700; color: var(--text-muted); font-size: 0.85rem;">#${e.id}</td>
        <td data-label="Name" style="font-weight: 700; color: var(--text-main);">${e.full_name}</td>
        <td data-label="Email">${e.email}</td>
        <td data-label="Role">
          <span class="role-badge ${e.role}">${e.role.replace("_"," ")}</span>
        </td>
        <td data-label="Registered" style="font-size: 0.85rem; color: var(--text-muted);">${new Date(e.created_at).toLocaleDateString()}</td>
        <td data-label="Action">
          ${n?'<span style="font-size:0.82rem; color:var(--text-muted); font-style:italic;">Protected Owner</span>':`
            <select class="user-role-select form-select" data-id="${e.id}" style="padding: 4px 8px; font-size: 0.82rem; width: 140px; display: inline-block;">
              <option value="user" ${e.role==="user"?"selected":""}>Student / User</option>
              <option value="admin" ${e.role==="admin"?"selected":""}>Quiz Admin</option>
              <option value="institute_admin" ${e.role==="institute_admin"?"selected":""}>Institute Admin</option>
            </select>
          `}
        </td>
      </tr>
    `}).join(""),r.querySelectorAll(".user-role-select").forEach(e=>{e.addEventListener("change",async()=>{const n=e.dataset.id,a=e.value;try{await y.updateUserRole(n,a),l(t)}catch(o){alert(o.message||"Error updating user role")}})})}}function z(t){var c,u,m,g,f;const s=t.querySelector("#usersPaginationContainer");if(!s)return;const{total:r,page:e,limit:n,totalPages:a}=x,o=r===0?0:(e-1)*n+1,d=Math.min(r,e*n);s.innerHTML=`
    <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:12px 18px; background:var(--card-bg); border-radius:var(--radius-md); border:1px solid var(--border-color);">
      <div style="font-size:0.88rem; color:var(--text-muted); font-weight:600;">
        Showing <strong style="color:var(--text-main);">${o}–${d}</strong> of <strong style="color:var(--primary);">${r.toLocaleString()}</strong> users
      </div>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm btn-page-first" ${e<=1?"disabled":""} style="font-weight:700;">
          <i class="ri-skip-left-line"></i> First
        </button>
        <button class="btn btn-outline btn-sm btn-page-prev" ${e<=1?"disabled":""} style="font-weight:700;">
          <i class="ri-arrow-left-s-line"></i> Prev
        </button>

        <span style="font-size:0.88rem; font-weight:700; color:var(--text-main); padding:0 4px;">
          Page ${e} of ${a}
        </span>

        <button class="btn btn-outline btn-sm btn-page-next" ${e>=a?"disabled":""} style="font-weight:700;">
          Next <i class="ri-arrow-right-s-line"></i>
        </button>
        <button class="btn btn-outline btn-sm btn-page-last" ${e>=a?"disabled":""} style="font-weight:700;">
          Last <i class="ri-skip-right-line"></i>
        </button>

        <select class="form-control select-page-limit" style="width: auto; padding: 4px 8px; font-size: 0.85rem; font-weight:700;">
          <option value="20" ${n===20?"selected":""}>20 / page</option>
          <option value="50" ${n===50?"selected":""}>50 / page</option>
          <option value="100" ${n===100?"selected":""}>100 / page</option>
        </select>
      </div>
    </div>
  `,(c=s.querySelector(".btn-page-first"))==null||c.addEventListener("click",()=>{i>1&&(i=1,l(t))}),(u=s.querySelector(".btn-page-prev"))==null||u.addEventListener("click",()=>{i>1&&(i--,l(t))}),(m=s.querySelector(".btn-page-next"))==null||m.addEventListener("click",()=>{i<a&&(i++,l(t))}),(g=s.querySelector(".btn-page-last"))==null||g.addEventListener("click",()=>{i<a&&(i=a,l(t))}),(f=s.querySelector(".select-page-limit"))==null||f.addEventListener("change",h=>{p=parseInt(h.target.value,10)||20,i=1,l(t)})}function L(t){const s=t.querySelector("#userSearchInput"),r=t.querySelector("#roleFilter");r&&r.addEventListener("change",()=>{i=1,l(t)}),s&&s.addEventListener("input",()=>{clearTimeout(v),v=setTimeout(()=>{i=1,l(t)},300)})}export{$ as renderUserManagementView};
