import{r as y}from"./index-Cwis2mjw.js";async function b(s){const e=document.createElement("div");e.className="modal-overlay fade-in",e.style.position="fixed",e.style.inset="0",e.style.background="rgba(0, 0, 0, 0.6)",e.style.backdropFilter="blur(4px)",e.style.zIndex="10000",e.style.display="flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.padding="20px";const d=document.createElement("div");d.className="card",d.style.width="100%",d.style.maxWidth="700px",d.style.maxHeight="90vh",d.style.overflowY="auto",d.style.padding="28px",d.style.background="var(--card-bg)",d.style.borderRadius="20px",d.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)",d.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
          🏆 Exam Leaderboard & Rankings
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Real-time student leaderboard sorted by Score, Accuracy %, and Speed.</p>
      </div>
      <button id="close-leaderboard-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
    </div>

    <!-- Top 3 Podium Area -->
    <div id="leaderboard-podium" style="display: flex; justify-content: center; align-items: flex-end; gap: 14px; margin-bottom: 24px; padding: 14px 0;">
      <!-- Podium slots -->
    </div>

    <!-- Leaderboard Table -->
    <div style="overflow-x: auto;">
      <table class="custom-table" style="width: 100%;">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Candidate Name</th>
            <th>Institute</th>
            <th>Total Score</th>
            <th>Accuracy %</th>
            <th>Time</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody id="leaderboard-table-body">
          <tr><td colspan="7" style="text-align: center; padding: 24px;">Loading leaderboard...</td></tr>
        </tbody>
      </table>
    </div>
  `,d.querySelector("#close-leaderboard-btn").addEventListener("click",()=>{document.body.removeChild(e)}),e.appendChild(d),document.body.appendChild(e);try{const r=(await y(`/exams/${s}/leaderboard`)).leaderboard||[],o=d.querySelector("#leaderboard-table-body"),c=d.querySelector("#leaderboard-podium");if(r.length===0){o.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No student attempts submitted yet for this exam.</td></tr>';return}const a=r[0],i=r[1],n=r[2];c.innerHTML=`
      ${i?`
        <div style="text-align: center;">
          <div style="font-size: 1.6rem;">🥈</div>
          <div style="background: #f1f5f9; border: 2px solid #cbd5e1; padding: 10px 16px; border-radius: 12px 12px 0 0; min-width: 110px;">
            <div style="font-weight: 800; font-size: 0.88rem;">${i.full_name}</div>
            <div style="font-weight: 700; color: var(--primary); font-size: 0.85rem;">${i.total_score} pts</div>
          </div>
        </div>
      `:""}

      ${a?`
        <div style="text-align: center;">
          <div style="font-size: 2rem;">🥇</div>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 16px 20px; border-radius: 14px 14px 0 0; min-width: 130px; transform: scale(1.08);">
            <div style="font-weight: 800; font-size: 0.95rem; color: #78350f;">${a.full_name}</div>
            <div style="font-weight: 900; color: #b45309; font-size: 1rem;">${a.total_score} pts</div>
          </div>
        </div>
      `:""}

      ${n?`
        <div style="text-align: center;">
          <div style="font-size: 1.6rem;">🥉</div>
          <div style="background: #ffedd5; border: 2px solid #fdba74; padding: 10px 16px; border-radius: 12px 12px 0 0; min-width: 110px;">
            <div style="font-weight: 800; font-size: 0.88rem;">${n.full_name}</div>
            <div style="font-weight: 700; color: var(--primary); font-size: 0.85rem;">${n.total_score} pts</div>
          </div>
        </div>
      `:""}
    `,o.innerHTML=r.map(t=>`
      <tr>
        <td style="font-weight: 900; color: ${t.rank<=3?"var(--primary)":"var(--text-main)"};">
          ${t.rank===1?"🥇 #1":t.rank===2?"🥈 #2":t.rank===3?"🥉 #3":`#${t.rank}`}
        </td>
        <td style="font-weight: 700; color: var(--text-main);">${t.full_name}</td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${t.institute_name}</td>
        <td style="font-weight: 800; color: var(--primary);">${t.total_score}</td>
        <td style="font-weight: 700; color: ${t.accuracy_pct>=70?"var(--success)":"var(--text-main)"};">${t.accuracy_pct}%</td>
        <td style="font-size: 0.85rem;">${t.duration_mins} Mins</td>
        <td>
          <button class="btn btn-outline btn-sm btn-view-analysis-modal" data-attemptid="${t.attempt_id}" style="font-size:0.75rem; padding:3px 8px; font-weight:700;">
            📊 View Analysis
          </button>
        </td>
      </tr>
    `).join(""),o.querySelectorAll(".btn-view-analysis-modal").forEach(t=>{t.addEventListener("click",()=>{const p=t.dataset.attemptid;document.body.removeChild(e),window.location.hash=`#/exam-analysis?attemptId=${p}`})})}catch(l){console.error("Leaderboard error:",l)}}export{b as renderLeaderboardModal};
