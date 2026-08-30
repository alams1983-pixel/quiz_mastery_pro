import{g as f,r as l}from"./index-nPeprFIn.js";function S(t){const e=document.createElement("div");e.className="view-container fade-in";const a=f()||{role:"user"};return a.role==="super_admin"?b(e):a.role==="institute_admin"||a.role==="admin"?h(e):x(e,t),e}async function x(t,e){t.innerHTML=`
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">📊 My CBT Exam Analytics & Performance</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Track your online mock exam attempts, percentiles, institute rankings, and detailed solution scorecards.
      </p>
    </div>

    <!-- Exam Performance Overview Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Exams Attempted</span>
        <div id="stExamsTotal" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Average Accuracy</span>
        <div id="stAvgAcc" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-%</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Average Score</span>
        <div id="stAvgScore" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Average Percentile</span>
        <div id="stAvgPercentile" style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">-%</div>
      </div>
    </div>

    <!-- CBT Exam Attempt History Table -->
    <div class="card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">📜 Online CBT Exam Attempt History</h3>
      </div>

      <div style="overflow-x: auto;">
        <table class="custom-table" style="width: 100%;">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Exam Title</th>
              <th>Mode</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Percentile</th>
              <th>Rank</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="stExamHistoryTbody">
            <tr><td colspan="8" style="text-align: center; padding: 24px;">Loading CBT exam performance history...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;try{const a=await l("/analytics/student-exam-stats");t.querySelector("#stExamsTotal").textContent=a.totalExams||0,t.querySelector("#stAvgAcc").textContent=(a.avgAccuracy||0)+"%",t.querySelector("#stAvgScore").textContent=a.avgScore||"0.00",t.querySelector("#stAvgPercentile").textContent=(a.avgPercentile||0)+"%";const n=t.querySelector("#stExamHistoryTbody"),s=a.attempts||[];if(s.length===0){n.innerHTML='<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No online exam attempt logs found yet. Start an exam from your dashboard!</td></tr>';return}n.innerHTML=s.map(r=>`
      <tr>
        <td>${new Date(r.submit_time||r.created_at).toLocaleString()}</td>
        <td style="font-weight: 700; color: var(--text-main);">${r.exam_title}</td>
        <td><span style="text-transform: capitalize; font-weight: 600;">${r.mode}</span></td>
        <td style="font-weight: 800; color: var(--primary);">${parseFloat(r.total_score).toFixed(2)}</td>
        <td><span style="color: var(--success); font-weight: 700;">${Math.round(r.accuracy_pct)}%</span></td>
        <td><span style="font-weight: 700; color: #f59e0b;">${r.percentile?Math.round(r.percentile)+"%":"N/A"}</span></td>
        <td><span class="badge-tag">Rank #${r.institute_rank||"N/A"}</span></td>
        <td>
          <button class="btn btn-sm btn-outline btn-view-scorecard" data-attemptid="${r.id}">
            📊 Scorecard & Solutions
          </button>
        </td>
      </tr>
    `).join(""),n.querySelectorAll(".btn-view-scorecard").forEach(r=>{r.addEventListener("click",()=>{const o=r.dataset.attemptid;e("exam-analysis",{attemptId:o})})})}catch(a){console.error("Student Exam Analytics Error:",a)}}async function h(t,e){t.innerHTML=`
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">🏫 Institute Student Performance Analytics</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Comprehensive student roster, accuracy percentiles, total CBT test attempts, and overall class performance metrics.
      </p>
    </div>

    <!-- Overview Metrics Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Enrolled Students</span>
        <div id="instTotalStudents" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total Student Attempts</span>
        <div id="instTotalExamAttempts" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Class Average Accuracy</span>
        <div id="instClassAvgAcc" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-%</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Class Average Score</span>
        <div id="instClassAvgScore" style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">-</div>
      </div>
    </div>

    <!-- Student Performance Roster Table -->
    <div class="card" style="padding: 24px; margin-bottom: 28px;">
      <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 16px;">👥 Student Performance Roster</h3>
      <div style="overflow-x: auto;">
        <table class="custom-table" style="width: 100%;">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Exams Attempted</th>
              <th>Average Accuracy</th>
              <th>Max Score</th>
              <th>Best Percentile</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody id="instRosterTbody">
            <tr><td colspan="7" style="text-align: center; padding: 24px;">Loading student performance roster...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Roster Pagination Container -->
      <div id="rosterPaginationContainer" style="margin-top: 20px;"></div>
    </div>
  `,i(t)}async function i(t){showLoadingOverlay("Loading Student Roster Analytics...","Fetching performance stats...");try{const e=await l(`/analytics/institute-student-analytics?page=${instRosterPage}&limit=${instRosterLimit}`);t.querySelector("#instTotalStudents").textContent=(e.totalStudents||0).toLocaleString(),t.querySelector("#instTotalExamAttempts").textContent=(e.totalExamAttempts||0).toLocaleString(),t.querySelector("#instClassAvgAcc").textContent=(e.classAvgAccuracy||0)+"%",t.querySelector("#instClassAvgScore").textContent=e.classAvgScore||"0.00",instRosterMeta=e.pagination||{total:(e.students||[]).length,page:instRosterPage,limit:instRosterLimit,totalPages:1};const a=t.querySelector("#instRosterTbody"),n=e.students||[];if(n.length===0){a.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No student attempt records found in your institute yet.</td></tr>',u(t);return}a.innerHTML=n.map(s=>`
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${s.full_name}</td>
        <td>${s.email}</td>
        <td style="font-weight: 700;">${s.exams_completed||0}</td>
        <td>
          <span style="font-weight: 700; color: ${s.avg_accuracy>=70?"var(--success)":"var(--text-main)"};">
            ${s.avg_accuracy?Math.round(s.avg_accuracy)+"%":"-"}
          </span>
        </td>
        <td style="font-weight: 700; color: var(--primary);">${s.max_score?parseFloat(s.max_score).toFixed(2):"-"}</td>
        <td><span style="font-weight: 700; color: #f59e0b;">${s.max_percentile?Math.round(s.max_percentile)+"%":"-"}</span></td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${s.last_active?new Date(s.last_active).toLocaleString():"Never"}</td>
      </tr>
    `).join(""),u(t)}catch(e){console.error("Institute Analytics Error:",e)}finally{hideLoadingOverlay()}}function u(t){var d,c,p,m,g;const e=t.querySelector("#rosterPaginationContainer");if(!e)return;const{total:a,page:n,limit:s,totalPages:r}=instRosterMeta,o=a===0?0:(n-1)*s+1,y=Math.min(a,n*s);e.innerHTML=`
    <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:12px 18px; background:var(--card-bg); border-radius:var(--radius-md); border:1px solid var(--border-color);">
      <div style="font-size:0.88rem; color:var(--text-muted); font-weight:600;">
        Showing <strong style="color:var(--text-main);">${o}–${y}</strong> of <strong style="color:var(--primary);">${a.toLocaleString()}</strong> roster students
      </div>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm btn-page-first" ${n<=1?"disabled":""} style="font-weight:700;">
          <i class="ri-skip-left-line"></i> First
        </button>
        <button class="btn btn-outline btn-sm btn-page-prev" ${n<=1?"disabled":""} style="font-weight:700;">
          <i class="ri-arrow-left-s-line"></i> Prev
        </button>

        <span style="font-size:0.88rem; font-weight:700; color:var(--text-main); padding:0 4px;">
          Page ${n} of ${r}
        </span>

        <button class="btn btn-outline btn-sm btn-page-next" ${n>=r?"disabled":""} style="font-weight:700;">
          Next <i class="ri-arrow-right-s-line"></i>
        </button>
        <button class="btn btn-outline btn-sm btn-page-last" ${n>=r?"disabled":""} style="font-weight:700;">
          Last <i class="ri-skip-right-line"></i>
        </button>

        <select class="form-control select-page-limit" style="width: auto; padding: 4px 8px; font-size: 0.85rem; font-weight:700;">
          <option value="20" ${s===20?"selected":""}>20 / page</option>
          <option value="50" ${s===50?"selected":""}>50 / page</option>
        </select>
      </div>
    </div>
  `,(d=e.querySelector(".btn-page-first"))==null||d.addEventListener("click",()=>{instRosterPage>1&&(instRosterPage=1,i(t))}),(c=e.querySelector(".btn-page-prev"))==null||c.addEventListener("click",()=>{instRosterPage>1&&(instRosterPage--,i(t))}),(p=e.querySelector(".btn-page-next"))==null||p.addEventListener("click",()=>{instRosterPage<r&&(instRosterPage++,i(t))}),(m=e.querySelector(".btn-page-last"))==null||m.addEventListener("click",()=>{instRosterPage<r&&(instRosterPage=r,i(t))}),(g=e.querySelector(".select-page-limit"))==null||g.addEventListener("change",v=>{instRosterLimit=parseInt(v.target.value,10)||20,instRosterPage=1,i(t)})}async function b(t,e){t.innerHTML=`
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">👑 Platform-Wide Super Admin Analytics</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Comprehensive platform metrics across all registered coaching tenants, users, and exam activity.
      </p>
    </div>

    <!-- Platform Totals Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total Users</span>
        <div id="pfTotalUsers" style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total Students</span>
        <div id="pfTotalStudents" style="font-size: 1.8rem; font-weight: 800; color: var(--success); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Coaching Institutes</span>
        <div id="pfTotalInsts" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 4px;">-</div>
      </div>
      <div class="card" style="padding: 20px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Total CBT Attempts</span>
        <div id="pfTotalAttempts" style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">-</div>
      </div>
    </div>

    <!-- Multi-Tenant Institute Comparative Matrix -->
    <div class="card" style="padding: 24px;">
      <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 16px;">🏫 Multi-Tenant Institute Comparative Matrix</h3>
      <div style="overflow-x: auto;">
        <table class="custom-table" style="width: 100%;">
          <thead>
            <tr>
              <th>Institute Name</th>
              <th>Code</th>
              <th>Enrolled Students</th>
              <th>Total Exams</th>
              <th>Total CBT Attempts</th>
              <th>Avg Student Accuracy</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="pfInstMatrixTbody">
            <tr><td colspan="7" style="text-align: center; padding: 24px;">Loading platform comparative matrix...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;try{const a=await l("/analytics/platform-analytics"),n=a.totals||{};t.querySelector("#pfTotalUsers").textContent=n.total_users||0,t.querySelector("#pfTotalStudents").textContent=n.total_students||0,t.querySelector("#pfTotalInsts").textContent=n.total_institutes||0,t.querySelector("#pfTotalAttempts").textContent=n.total_exam_attempts||0;const s=t.querySelector("#pfInstMatrixTbody"),r=a.institutes||[];if(r.length===0){s.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No institutes registered yet.</td></tr>';return}s.innerHTML=r.map(o=>`
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${o.name}</td>
        <td><span class="code-pill">${o.code}</span></td>
        <td style="font-weight: 700;">${o.student_count||0}</td>
        <td>${o.exam_count||0}</td>
        <td style="font-weight: 700; color: var(--primary);">${o.attempt_count||0}</td>
        <td>
          <span style="font-weight: 700; color: ${o.avg_student_accuracy>=70?"var(--success)":"var(--text-main)"};">
            ${o.avg_student_accuracy?Math.round(o.avg_student_accuracy)+"%":"-"}
          </span>
        </td>
        <td>
          <span class="status-badge ${o.status==="active"?"status-active":"status-inactive"}">
            ${o.status}
          </span>
        </td>
      </tr>
    `).join("")}catch(a){console.error("Platform Analytics Error:",a)}}export{S as renderAnalyticsView};
