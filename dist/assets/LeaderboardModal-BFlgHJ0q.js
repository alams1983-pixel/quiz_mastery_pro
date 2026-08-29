import{r as p}from"./index-w1j3NIg4.js";async function m(s){const t=document.createElement("div");t.className="modal-overlay fade-in",t.style.position="fixed",t.style.inset="0",t.style.background="rgba(0, 0, 0, 0.6)",t.style.backdropFilter="blur(4px)",t.style.zIndex="10000",t.style.display="flex",t.style.alignItems="center",t.style.justifyContent="center",t.style.padding="20px";const e=document.createElement("div");e.className="card",e.style.width="100%",e.style.maxWidth="700px",e.style.maxHeight="90vh",e.style.overflowY="auto",e.style.padding="28px",e.style.background="var(--card-bg)",e.style.borderRadius="20px",e.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)",e.innerHTML=`
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
          </tr>
        </thead>
        <tbody id="leaderboard-table-body">
          <tr><td colspan="6" style="text-align: center; padding: 24px;">Loading leaderboard...</td></tr>
        </tbody>
      </table>
    </div>
  `,e.querySelector("#close-leaderboard-btn").addEventListener("click",()=>{document.body.removeChild(t)}),t.appendChild(e),document.body.appendChild(t);try{const d=(await p(`/exams/${s}/leaderboard`)).leaderboard||[],l=e.querySelector("#leaderboard-table-body"),c=e.querySelector("#leaderboard-podium");if(d.length===0){l.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No student attempts submitted yet for this exam.</td></tr>';return}const o=d[0],a=d[1],i=d[2];c.innerHTML=`
      ${a?`
        <div style="text-align: center;">
          <div style="font-size: 1.6rem;">🥈</div>
          <div style="background: #f1f5f9; border: 2px solid #cbd5e1; padding: 10px 16px; border-radius: 12px 12px 0 0; min-width: 110px;">
            <div style="font-weight: 800; font-size: 0.88rem;">${a.full_name}</div>
            <div style="font-weight: 700; color: var(--primary); font-size: 0.85rem;">${a.total_score} pts</div>
          </div>
        </div>
      `:""}

      ${o?`
        <div style="text-align: center;">
          <div style="font-size: 2rem;">🥇</div>
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 16px 20px; border-radius: 14px 14px 0 0; min-width: 130px; transform: scale(1.08);">
            <div style="font-weight: 800; font-size: 0.95rem; color: #78350f;">${o.full_name}</div>
            <div style="font-weight: 900; color: #b45309; font-size: 1rem;">${o.total_score} pts</div>
          </div>
        </div>
      `:""}

      ${i?`
        <div style="text-align: center;">
          <div style="font-size: 1.6rem;">🥉</div>
          <div style="background: #ffedd5; border: 2px solid #fdba74; padding: 10px 16px; border-radius: 12px 12px 0 0; min-width: 110px;">
            <div style="font-weight: 800; font-size: 0.88rem;">${i.full_name}</div>
            <div style="font-weight: 700; color: var(--primary); font-size: 0.85rem;">${i.total_score} pts</div>
          </div>
        </div>
      `:""}
    `,l.innerHTML=d.map(r=>`
      <tr>
        <td style="font-weight: 900; color: ${r.rank<=3?"var(--primary)":"var(--text-main)"};">
          ${r.rank===1?"🥇 #1":r.rank===2?"🥈 #2":r.rank===3?"🥉 #3":`#${r.rank}`}
        </td>
        <td style="font-weight: 700; color: var(--text-main);">${r.full_name}</td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${r.institute_name}</td>
        <td style="font-weight: 800; color: var(--primary);">${r.total_score}</td>
        <td style="font-weight: 700; color: ${r.accuracy_pct>=70?"var(--success)":"var(--text-main)"};">${r.accuracy_pct}%</td>
        <td style="font-size: 0.85rem;">${r.duration_mins} Mins</td>
      </tr>
    `).join("")}catch(n){console.error("Leaderboard error:",n)}}export{m as renderLeaderboardModal};
