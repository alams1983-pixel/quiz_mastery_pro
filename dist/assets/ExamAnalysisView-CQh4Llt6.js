import{r as q}from"./index-B0viijh0.js";import{r as x}from"./richContent-UQABmDgB.js";import{renderLeaderboardModal as E}from"./LeaderboardModal-y5SuBZY-.js";function j(C,L){const s=document.createElement("div");s.className="view-container fade-in",s.style.maxWidth="1000px",s.style.margin="0 auto",s.innerHTML=`
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

    <!-- Graphical Section-Wise Performance Analysis Card -->
    <div id="section-graphics-container" class="card" style="display: none; padding: 24px; margin-bottom: 24px; border: 1px solid var(--border-color); background: var(--card-bg);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px;">
            📊 Section-Wise Comparative Analysis
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
            Graphical breakdown comparing your score, accuracy, and time against cohort average and topper performance across sections.
          </p>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm btn-sec-mode active" data-mode="score">Score Comparison</button>
          <button class="btn btn-outline btn-sm btn-sec-mode" data-mode="accuracy">Accuracy %</button>
          <button class="btn btn-outline btn-sm btn-sec-mode" data-mode="time">Time Distribution</button>
        </div>
      </div>

      <!-- Legend Indicator -->
      <div style="display: flex; gap: 16px; margin-bottom: 16px; font-size: 0.82rem; font-weight: 700; flex-wrap: wrap;">
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 12px; background: #4f46e5; border-radius: 3px; display: inline-block;"></span>
          👤 My Performance
        </span>
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 12px; background: #f59e0b; border-radius: 3px; display: inline-block;"></span>
          👥 Cohort Average
        </span>
        <span style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 12px; height: 12px; background: #10b981; border-radius: 3px; display: inline-block;"></span>
          🏆 Topper Benchmark
        </span>
      </div>

      <!-- Graphical Section List Body -->
      <div id="sec-graphics-body" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="text-align: center; color: var(--text-muted); padding: 20px;">Loading section analysis graphics...</div>
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
  `;let v=null,b="all";async function A(){try{const a=await q(`/exams/attempts/${C}/analysis`);v=a,z(s,a),M(s,a.sectionAnalysis),w(s,a.itemAnalysis,b)}catch(a){console.error("Error loading analysis:",a),s.querySelector("#item-analysis-list").innerHTML=`<div style="color: var(--danger); text-align: center;">Failed to load analysis: ${a.message}</div>`}}function z(a,c){const{attempt:r,rank:p,percentile:n,totalCandidates:t,itemAnalysis:e}=c;a.querySelector("#analysis-exam-title").textContent=r.exam_title,a.querySelector("#analysis-exam-type").textContent=r.exam_type,a.querySelector("#analysis-cand-name").textContent=`Candidate: ${r.candidate_name} • ${r.institute_name||"Independent"}`,a.querySelector("#analysis-rank-badge").textContent=`#${p} / ${t}`,a.querySelector("#stat-score").textContent=parseFloat(r.total_score).toFixed(2),a.querySelector("#stat-accuracy").textContent=`${Math.round(r.accuracy_pct)}%`,a.querySelector("#stat-percentile").textContent=`${n} %ile`,a.querySelector("#stat-counts").innerHTML=`<span style="color:var(--success);">${r.correct_count}</span> / <span style="color:var(--danger);">${r.wrong_count}</span>`;let l=0,i=0,d=0;e.forEach(o=>{o.is_correct===1||o.is_correct===!0?l++:o.is_correct===0||o.is_correct===!1?i++:d++}),a.querySelector("#cnt-all").textContent=e.length,a.querySelector("#cnt-correct").textContent=l,a.querySelector("#cnt-wrong").textContent=i,a.querySelector("#cnt-unatt").textContent=d}function w(a,c,r){const p=a.querySelector("#item-analysis-list");p.innerHTML="";const n=c.filter(t=>r==="correct"?t.is_correct===1||t.is_correct===!0:r==="wrong"?t.is_correct===0||t.is_correct===!1:r==="unattempted"?t.is_correct===null:!0);if(n.length===0){p.innerHTML='<div style="text-align: center; padding: 30px; color: var(--text-muted);">No questions match this filter.</div>';return}n.forEach((t,e)=>{const l=document.createElement("div");l.className="card",l.style.padding="20px";const i=t.is_correct===1||t.is_correct===!0,d=t.is_correct===0||t.is_correct===!1;let o='<span class="status-badge" style="background:#e2e8f0; color:#475569;">Unattempted</span>';i?o='<span class="status-badge status-active">✓ Correct (+2.00)</span>':d&&(o='<span class="status-badge status-inactive">✕ Wrong (-0.50)</span>');const g=["(A)","(B)","(C)","(D)","(E)"],f=(t.options_en||[]).map((h,u)=>{const m=u===t.correct_option_index,S=u===t.selected_option,k=(t.option_stats_pct&&t.option_stats_pct[u])!==void 0?t.option_stats_pct[u]:0;let _="";return m?_="background: #e8f5e9; border: 1.5px solid #2ecc71;":S&&!m&&(_="background: #ffebee; border: 1.5px solid #e74c3c;"),`
          <div style="padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 8px; ${_}">
            <div style="display: flex; justify-content: space-between; font-size: 0.92rem; margin-bottom: 4px;">
              <span>
                <strong>${g[u]}</strong> ${x(h)}
                ${m?' <strong style="color: #27ae60;">(Correct Answer)</strong>':""}
                ${S&&!m?' <strong style="color: #c0392b;">(Your Answer)</strong>':""}
              </span>
              <span style="font-weight: 700; color: var(--text-muted); font-size: 0.82rem;">${k}% students</span>
            </div>
            <!-- Percentage Bar -->
            <div style="height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="width: ${k}%; height: 100%; background: ${m?"#2ecc71":"var(--primary)"}; transition: width 0.4s ease;"></div>
            </div>
          </div>
        `}).join("");l.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">Section: ${t.section_name}</span>
            <h3 style="font-size: 1.05rem; font-weight: 800; margin-top: 2px;">Question #${e+1}</h3>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.78rem; font-weight: 700; background: var(--bg-color); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 6px;">
              ⏱️ You: ${t.time_spent_sec}s | Avg: ${t.avg_time_sec}s
            </span>
            ${o}
          </div>
        </div>

        ${t.passage_text_en?`
          <div class="ssc-passage-box" style="margin-bottom: 14px;">
            <strong>Passage:</strong><br>${x(t.passage_text_en)}
          </div>
        `:""}

        <div style="font-size: 1rem; font-weight: 600; margin-bottom: 14px; line-height: 1.5;">
          ${x(t.question_text_en)}
        </div>

        <div style="margin-bottom: 16px;">
          ${f}
        </div>

        ${t.explanation_en?`
          <div style="background: var(--bg-color); border-left: 4px solid var(--primary); padding: 12px 14px; border-radius: 4px; font-size: 0.88rem;">
            <strong>💡 Explanation:</strong><br>${x(t.explanation_en)}
          </div>
        `:""}
      `,p.appendChild(l)})}function M(a,c){const r=a.querySelector("#section-graphics-container");if(!r||!c||c.length===0)return;r.style.display="block";const p=(n="score")=>{const t=c.map((e,l)=>{let i=0,d=0,o=0,g=100,y="";n==="score"?(i=e.score,d=e.cohort_avg_score,o=e.top_score,g=Math.max(e.max_score||1,o||1),y=" Marks"):n==="accuracy"?(i=e.accuracy_pct,d=e.cohort_avg_accuracy,o=100,g=100,y="%"):n==="time"&&(i=Math.round(e.time_spent_sec/60),d=Math.round(e.cohort_avg_time_sec/60),o=Math.max(i,d,1),g=Math.max(i,d,1),y=" mins");const f=Math.min(100,Math.max(5,Math.round(i/g*100))),h=Math.min(100,Math.max(5,Math.round(d/g*100))),u=Math.min(100,Math.max(5,Math.round(o/g*100)));return`
          <div class="card" style="padding: 16px; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h4 style="font-size: 1rem; font-weight: 800; color: var(--primary); margin: 0;">
                📁 Section ${l+1}: ${e.section_name}
              </h4>
              <div style="display: flex; gap: 10px; font-size: 0.8rem; font-weight: 700;">
                <span style="color: var(--primary);">Score: ${e.score} / ${e.max_score}</span>
                <span style="color: var(--success);">Acc: ${e.accuracy_pct}%</span>
                <span style="color: var(--text-muted);">Qs: ${e.correct_count}✓ / ${e.wrong_count}✕ / ${e.unattempted_count}-</span>
              </div>
            </div>

            <!-- Grouped Bar Graphics -->
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;">
              <!-- My Performance Bar -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: var(--text-main); margin-bottom: 3px;">
                  <span>👤 My ${n==="score"?"Score":n==="accuracy"?"Accuracy":"Time"}</span>
                  <span>${i}${y}</span>
                </div>
                <div style="width: 100%; height: 12px; background: rgba(0,0,0,0.06); border-radius: 6px; overflow: hidden;">
                  <div style="width: ${f}%; height: 100%; background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%); border-radius: 6px; transition: width 0.5s ease;"></div>
                </div>
              </div>

              <!-- Cohort Average Bar -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 3px;">
                  <span>👥 Cohort Average</span>
                  <span>${d}${y}</span>
                </div>
                <div style="width: 100%; height: 12px; background: rgba(0,0,0,0.06); border-radius: 6px; overflow: hidden;">
                  <div style="width: ${h}%; height: 100%; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%); border-radius: 6px; transition: width 0.5s ease;"></div>
                </div>
              </div>

              <!-- Topper Score Bar (for Score comparison) -->
              ${n==="score"?`
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: var(--success); margin-bottom: 3px;">
                    <span>🏆 Topper Score</span>
                    <span>${o}${y}</span>
                  </div>
                  <div style="width: 100%; height: 12px; background: rgba(0,0,0,0.06); border-radius: 6px; overflow: hidden;">
                    <div style="width: ${u}%; height: 100%; background: linear-gradient(90deg, #10b981 0%, #34d399 100%); border-radius: 6px; transition: width 0.5s ease;"></div>
                  </div>
                </div>
              `:""}
            </div>

            <!-- Per Section Footer Stats -->
            <div style="display: flex; gap: 14px; font-size: 0.78rem; color: var(--text-muted); flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 8px;">
              <span>⏱ Time Spent: <strong>${Math.floor(e.time_spent_sec/60)}m ${e.time_spent_sec%60}s</strong> (Cohort Avg: <strong>${Math.floor(e.cohort_avg_time_sec/60)}m ${e.cohort_avg_time_sec%60}s</strong>)</span>
              <span>🎯 Accuracy Delta: <strong style="color: ${e.accuracy_pct>=e.cohort_avg_accuracy?"var(--success)":"var(--danger)"}">${e.accuracy_pct>=e.cohort_avg_accuracy?"+":""}${e.accuracy_pct-e.cohort_avg_accuracy}% vs Avg</strong></span>
            </div>
          </div>
        `}).join("");r.querySelector("#sec-graphics-body").innerHTML=t};p("score"),r.querySelectorAll(".btn-sec-mode").forEach(n=>{n.addEventListener("click",()=>{r.querySelectorAll(".btn-sec-mode").forEach(t=>t.classList.remove("active")),n.classList.add("active"),p(n.dataset.mode)})})}s.querySelector("#btn-back-dash").addEventListener("click",()=>L("dashboard")),s.querySelector("#btn-open-leaderboard").addEventListener("click",()=>{v&&v.attempt&&E(v.attempt.exam_id)});const $=s.querySelector("#analysis-filter-bar");return $.querySelectorAll("button").forEach(a=>{a.addEventListener("click",()=>{$.querySelectorAll("button").forEach(c=>c.classList.remove("active")),a.classList.add("active"),b=a.dataset.filter,v&&w(s,v.itemAnalysis,b)})}),A(),s}export{j as renderExamAnalysisView};
