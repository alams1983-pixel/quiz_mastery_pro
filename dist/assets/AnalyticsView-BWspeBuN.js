import{g as d,r as i}from"./index-BJvuVE6r.js";function u(a){const o=document.createElement("div");o.className="view-container fade-in";const e=d()||{role:"user"};return e.role==="super_admin"?p(o):e.role==="institute_admin"||e.role==="admin"?c(o):l(o,a),o}async function l(a,o){a.innerHTML=`
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
  `;try{const e=await i("/analytics/student-exam-stats");a.querySelector("#stExamsTotal").textContent=e.totalExams||0,a.querySelector("#stAvgAcc").textContent=(e.avgAccuracy||0)+"%",a.querySelector("#stAvgScore").textContent=e.avgScore||"0.00",a.querySelector("#stAvgPercentile").textContent=(e.avgPercentile||0)+"%";const r=a.querySelector("#stExamHistoryTbody"),n=e.attempts||[];if(n.length===0){r.innerHTML='<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No online exam attempt logs found yet. Start an exam from your dashboard!</td></tr>';return}r.innerHTML=n.map(t=>`
      <tr>
        <td>${new Date(t.submit_time||t.created_at).toLocaleString()}</td>
        <td style="font-weight: 700; color: var(--text-main);">${t.exam_title}</td>
        <td><span style="text-transform: capitalize; font-weight: 600;">${t.mode}</span></td>
        <td style="font-weight: 800; color: var(--primary);">${parseFloat(t.total_score).toFixed(2)}</td>
        <td><span style="color: var(--success); font-weight: 700;">${Math.round(t.accuracy_pct)}%</span></td>
        <td><span style="font-weight: 700; color: #f59e0b;">${t.percentile?Math.round(t.percentile)+"%":"N/A"}</span></td>
        <td><span class="badge-tag">Rank #${t.institute_rank||"N/A"}</span></td>
        <td>
          <button class="btn btn-sm btn-outline btn-view-scorecard" data-attemptid="${t.id}">
            📊 Scorecard & Solutions
          </button>
        </td>
      </tr>
    `).join(""),r.querySelectorAll(".btn-view-scorecard").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.attemptid;o("exam-analysis",{attemptId:s})})})}catch(e){console.error("Student Exam Analytics Error:",e)}}async function c(a,o){a.innerHTML=`
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 6px;">🏫 Institute Student Performance Analytics</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Monitor class performance trends, exam attempt metrics across students, and individual student progress.
      </p>
    </div>

    <!-- Institute Overview Cards -->
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
    </div>
  `;try{const e=await i("/analytics/institute-student-analytics");a.querySelector("#instTotalStudents").textContent=e.totalStudents||0,a.querySelector("#instTotalExamAttempts").textContent=e.totalExamAttempts||0,a.querySelector("#instClassAvgAcc").textContent=(e.classAvgAccuracy||0)+"%",a.querySelector("#instClassAvgScore").textContent=e.classAvgScore||"0.00";const r=a.querySelector("#instRosterTbody"),n=e.students||[];if(n.length===0){r.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No student attempt records found in your institute yet.</td></tr>';return}r.innerHTML=n.map(t=>`
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${t.full_name}</td>
        <td>${t.email}</td>
        <td style="font-weight: 700;">${t.exams_completed||0}</td>
        <td>
          <span style="font-weight: 700; color: ${t.avg_accuracy>=70?"var(--success)":"var(--text-main)"};">
            ${t.avg_accuracy?Math.round(t.avg_accuracy)+"%":"-"}
          </span>
        </td>
        <td style="font-weight: 700; color: var(--primary);">${t.max_score?parseFloat(t.max_score).toFixed(2):"-"}</td>
        <td><span style="font-weight: 700; color: #f59e0b;">${t.max_percentile?Math.round(t.max_percentile)+"%":"-"}</span></td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${t.last_active?new Date(t.last_active).toLocaleString():"Never"}</td>
      </tr>
    `).join("")}catch(e){console.error("Institute Analytics Error:",e)}}async function p(a,o){a.innerHTML=`
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
  `;try{const e=await i("/analytics/platform-analytics"),r=e.totals||{};a.querySelector("#pfTotalUsers").textContent=r.total_users||0,a.querySelector("#pfTotalStudents").textContent=r.total_students||0,a.querySelector("#pfTotalInsts").textContent=r.total_institutes||0,a.querySelector("#pfTotalAttempts").textContent=r.total_exam_attempts||0;const n=a.querySelector("#pfInstMatrixTbody"),t=e.institutes||[];if(t.length===0){n.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No institutes registered yet.</td></tr>';return}n.innerHTML=t.map(s=>`
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${s.name}</td>
        <td><span class="code-pill">${s.code}</span></td>
        <td style="font-weight: 700;">${s.student_count||0}</td>
        <td>${s.exam_count||0}</td>
        <td style="font-weight: 700; color: var(--primary);">${s.attempt_count||0}</td>
        <td>
          <span style="font-weight: 700; color: ${s.avg_student_accuracy>=70?"var(--success)":"var(--text-main)"};">
            ${s.avg_student_accuracy?Math.round(s.avg_student_accuracy)+"%":"-"}
          </span>
        </td>
        <td>
          <span class="status-badge ${s.status==="active"?"status-active":"status-inactive"}">
            ${s.status}
          </span>
        </td>
      </tr>
    `).join("")}catch(e){console.error("Platform Analytics Error:",e)}}export{u as renderAnalyticsView};
