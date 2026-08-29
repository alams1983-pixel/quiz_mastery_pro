import{r as E}from"./index-BPiJPJV5.js";import{r as v}from"./richContent-BZg4P9sy.js";import{renderLeaderboardModal as z}from"./LeaderboardModal-BTEPiycK.js";function R(w,C){const r=document.createElement("div");r.className="view-container fade-in",r.style.maxWidth="1000px",r.style.margin="0 auto",r.innerHTML=`
    <!-- Header Navigation -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <button id="btn-back-dash" class="btn btn-outline btn-sm">
        ← Back to Dashboard
      </button>
      <button id="btn-open-leaderboard" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
        🏆 View Exam Leaderboard
      </button>
    </div>

    <!-- Scorecard Summary Header -->
    <div class="card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, var(--card-bg) 0%, var(--primary-light) 100%); border: 2px solid var(--primary-border);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
        <div>
          <span id="analysis-exam-type" class="badge-tag" style="margin-bottom: 6px; display: inline-block;">SSC Exam</span>
          <h1 id="analysis-exam-title" style="font-size: 1.6rem; font-weight: 800; color: var(--text-main);">Loading Exam Results...</h1>
          <p id="analysis-cand-name" style="font-size: 0.9rem; color: var(--text-muted);">-</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Overall Rank</span>
          <div id="analysis-rank-badge" style="font-size: 2rem; font-weight: 900; color: var(--primary); font-family: monospace;"># -</div>
        </div>
      </div>

      <!-- Stats Metric Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 14px; text-align: center;">
        <div style="background: var(--card-bg); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">TOTAL SCORE</span>
          <div id="stat-score" style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">-</div>
        </div>
        <div style="background: var(--card-bg); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">ACCURACY</span>
          <div id="stat-accuracy" style="font-size: 1.4rem; font-weight: 800; color: var(--success);">-</div>
        </div>
        <div style="background: var(--card-bg); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">PERCENTILE</span>
          <div id="stat-percentile" style="font-size: 1.4rem; font-weight: 800; color: var(--accent);">-</div>
        </div>
        <div style="background: var(--card-bg); padding: 12px; border-radius: 10px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">CORRECT / WRONG</span>
          <div id="stat-counts" style="font-size: 1.1rem; font-weight: 800; margin-top: 4px;">-</div>
        </div>
      </div>
    </div>

    <!-- Question Filter Tabs -->
    <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;" id="analysis-filter-bar">
      <button class="btn btn-outline btn-sm active" data-filter="all">All Questions (<span id="cnt-all">0</span>)</button>
      <button class="btn btn-outline btn-sm" data-filter="correct" style="color: var(--success);">Correct (<span id="cnt-correct">0</span>)</button>
      <button class="btn btn-outline btn-sm" data-filter="wrong" style="color: var(--danger);">Wrong (<span id="cnt-wrong">0</span>)</button>
      <button class="btn btn-outline btn-sm" data-filter="unattempted">Unattempted (<span id="cnt-unatt">0</span>)</button>
    </div>

    <!-- Item-Level Question List -->
    <div id="item-analysis-list" style="display: flex; flex-direction: column; gap: 20px;">
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading item analytics...</div>
    </div>
  `;let o=null,b="all";async function $(){try{const e=await E(`/exams/attempts/${w}/analysis`);o=e,S(r,e),m(r,e.itemAnalysis,b)}catch(e){console.error("Error loading analysis:",e),r.querySelector("#item-analysis-list").innerHTML=`<div style="color: var(--danger); text-align: center;">Failed to load analysis: ${e.message}</div>`}}function S(e,i){const{attempt:a,rank:l,percentile:p,totalCandidates:t,itemAnalysis:u}=i;e.querySelector("#analysis-exam-title").textContent=a.exam_title,e.querySelector("#analysis-exam-type").textContent=a.exam_type,e.querySelector("#analysis-cand-name").textContent=`Candidate: ${a.candidate_name} • ${a.institute_name||"Independent"}`,e.querySelector("#analysis-rank-badge").textContent=`#${l} / ${t}`,e.querySelector("#stat-score").textContent=parseFloat(a.total_score).toFixed(2),e.querySelector("#stat-accuracy").textContent=`${Math.round(a.accuracy_pct)}%`,e.querySelector("#stat-percentile").textContent=`${p} %ile`,e.querySelector("#stat-counts").innerHTML=`<span style="color:var(--success);">${a.correct_count}</span> / <span style="color:var(--danger);">${a.wrong_count}</span>`;let n=0,g=0,y=0;u.forEach(s=>{s.is_correct===1||s.is_correct===!0?n++:s.is_correct===0||s.is_correct===!1?g++:y++}),e.querySelector("#cnt-all").textContent=u.length,e.querySelector("#cnt-correct").textContent=n,e.querySelector("#cnt-wrong").textContent=g,e.querySelector("#cnt-unatt").textContent=y}function m(e,i,a){const l=e.querySelector("#item-analysis-list");l.innerHTML="";const p=i.filter(t=>a==="correct"?t.is_correct===1||t.is_correct===!0:a==="wrong"?t.is_correct===0||t.is_correct===!1:a==="unattempted"?t.is_correct===null:!0);if(p.length===0){l.innerHTML='<div style="text-align: center; padding: 30px; color: var(--text-muted);">No questions match this filter.</div>';return}p.forEach((t,u)=>{const n=document.createElement("div");n.className="card",n.style.padding="20px";const g=t.is_correct===1||t.is_correct===!0,y=t.is_correct===0||t.is_correct===!1;let s='<span class="status-badge" style="background:#e2e8f0; color:#475569;">Unattempted</span>';g?s='<span class="status-badge status-active">✓ Correct (+2.00)</span>':y&&(s='<span class="status-badge status-inactive">✕ Wrong (-0.50)</span>');const k=["(A)","(B)","(C)","(D)","(E)"],q=(t.options_en||[]).map((L,d)=>{const c=d===t.correct_option_index,h=d===t.selected_option,_=(t.option_stats_pct&&t.option_stats_pct[d])!==void 0?t.option_stats_pct[d]:0;let x="";return c?x="background: #e8f5e9; border: 1.5px solid #2ecc71;":h&&!c&&(x="background: #ffebee; border: 1.5px solid #e74c3c;"),`
          <div style="padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 8px; ${x}">
            <div style="display: flex; justify-content: space-between; font-size: 0.92rem; margin-bottom: 4px;">
              <span>
                <strong>${k[d]}</strong> ${v(L)}
                ${c?' <strong style="color: #27ae60;">(Correct Answer)</strong>':""}
                ${h&&!c?' <strong style="color: #c0392b;">(Your Answer)</strong>':""}
              </span>
              <span style="font-weight: 700; color: var(--text-muted); font-size: 0.82rem;">${_}% students</span>
            </div>
            <!-- Percentage Bar -->
            <div style="height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="width: ${_}%; height: 100%; background: ${c?"#2ecc71":"var(--primary)"}; transition: width 0.4s ease;"></div>
            </div>
          </div>
        `}).join("");n.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">Section: ${t.section_name}</span>
            <h3 style="font-size: 1.05rem; font-weight: 800; margin-top: 2px;">Question #${u+1}</h3>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.78rem; font-weight: 700; background: var(--bg-color); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 6px;">
              ⏱️ You: ${t.time_spent_sec}s | Avg: ${t.avg_time_sec}s
            </span>
            ${s}
          </div>
        </div>

        ${t.passage_text_en?`
          <div class="ssc-passage-box" style="margin-bottom: 14px;">
            <strong>Passage:</strong><br>${v(t.passage_text_en)}
          </div>
        `:""}

        <div style="font-size: 1rem; font-weight: 600; margin-bottom: 14px; line-height: 1.5;">
          ${v(t.question_text_en)}
        </div>

        <div style="margin-bottom: 16px;">
          ${q}
        </div>

        ${t.explanation_en?`
          <div style="background: var(--bg-color); border-left: 4px solid var(--primary); padding: 12px 14px; border-radius: 4px; font-size: 0.88rem;">
            <strong>💡 Explanation:</strong><br>${v(t.explanation_en)}
          </div>
        `:""}
      `,l.appendChild(n)})}r.querySelector("#btn-back-dash").addEventListener("click",()=>C("dashboard")),r.querySelector("#btn-open-leaderboard").addEventListener("click",()=>{o&&o.attempt&&z(o.attempt.exam_id)});const f=r.querySelector("#analysis-filter-bar");return f.querySelectorAll("button").forEach(e=>{e.addEventListener("click",()=>{f.querySelectorAll("button").forEach(i=>i.classList.remove("active")),e.classList.add("active"),b=e.dataset.filter,o&&m(r,o.itemAnalysis,b)})}),$(),r}export{R as renderExamAnalysisView};
