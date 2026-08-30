import{r as q,g as I,a as _}from"./index-BrA-5OY9.js";import{r as E}from"./richContent-CHIH1ukA.js";const o={NOT_VISITED:1,NOT_ANSWERED:2,ANSWERED:3,MARKED_FOR_REVIEW:4,ANSWERED_AND_MARKED:5};class T{constructor(e,t,a){this.attempt=e,this.exam=t,this.sections=a,this.activeSectionIndex=0,this.activeQuestionIndex=0,this.currentLanguage="en",this.stateMap=new Map,this.startTime=Date.now(),this.questionStartTime=Date.now(),this.remainingSeconds=(t.total_duration_mins||60)*60,this.autoSaveInterval=null,this.initStates()}initStates(){if(this.sections.forEach(t=>{t.questions.forEach(a=>{this.stateMap.set(a.id,{questionId:a.id,sectionId:t.id,paletteState:o.NOT_VISITED,selectedOption:null,timeSpentSec:0,language:"en"})})}),this.attempt&&this.attempt.details_json)try{const t=typeof this.attempt.details_json=="string"?JSON.parse(this.attempt.details_json):this.attempt.details_json;t.stateArray&&Array.isArray(t.stateArray)&&t.stateArray.forEach(a=>{this.stateMap.has(a.questionId)&&this.stateMap.set(a.questionId,{...this.stateMap.get(a.questionId),...a})}),t.remainingSeconds!==void 0&&(this.remainingSeconds=t.remainingSeconds)}catch(t){console.warn("Could not restore saved details_json:",t)}const e=this.getCurrentQuestion();if(e){const t=this.stateMap.get(e.id);t&&t.paletteState===o.NOT_VISITED&&(t.paletteState=o.NOT_ANSWERED)}}getCurrentSection(){return this.sections[this.activeSectionIndex]||null}getCurrentQuestion(){const e=this.getCurrentSection();return e&&e.questions?e.questions[this.activeQuestionIndex]:null}getCurrentState(){const e=this.getCurrentQuestion();return e?this.stateMap.get(e.id):null}flushCurrentTimeSpent(){const e=this.getCurrentQuestion();if(!e)return;const t=this.stateMap.get(e.id);if(t){const a=Math.round((Date.now()-this.questionStartTime)/1e3);t.timeSpentSec+=a}this.questionStartTime=Date.now()}selectOption(e){const t=this.getCurrentQuestion();if(!t)return;const a=this.stateMap.get(t.id);a&&(a.selectedOption=e)}clearResponse(){const e=this.getCurrentQuestion();if(!e)return;const t=this.stateMap.get(e.id);t&&(t.selectedOption=null,t.paletteState===o.ANSWERED?t.paletteState=o.NOT_ANSWERED:t.paletteState===o.ANSWERED_AND_MARKED&&(t.paletteState=o.MARKED_FOR_REVIEW))}saveAndNext(){this.flushCurrentTimeSpent();const e=this.getCurrentQuestion();if(e){const t=this.stateMap.get(e.id);t&&(t.selectedOption!==null&&t.selectedOption!==void 0?t.paletteState=o.ANSWERED:t.paletteState=o.NOT_ANSWERED)}this.nextQuestion()}markForReviewAndNext(){this.flushCurrentTimeSpent();const e=this.getCurrentQuestion();if(e){const t=this.stateMap.get(e.id);t&&(t.selectedOption!==null&&t.selectedOption!==void 0?t.paletteState=o.ANSWERED_AND_MARKED:t.paletteState=o.MARKED_FOR_REVIEW)}this.nextQuestion()}nextQuestion(){const e=this.getCurrentSection();if(!e)return;this.activeQuestionIndex<e.questions.length-1?this.activeQuestionIndex++:this.activeSectionIndex<this.sections.length-1&&this.exam.allow_section_switch!==!1&&(this.activeSectionIndex++,this.activeQuestionIndex=0);const t=this.getCurrentQuestion();if(t){const a=this.stateMap.get(t.id);a&&a.paletteState===o.NOT_VISITED&&(a.paletteState=o.NOT_ANSWERED)}this.questionStartTime=Date.now()}prevQuestion(){if(this.flushCurrentTimeSpent(),this.activeQuestionIndex>0)this.activeQuestionIndex--;else if(this.activeSectionIndex>0&&this.exam.allow_section_switch!==!1){this.activeSectionIndex--;const e=this.getCurrentSection();this.activeQuestionIndex=e?e.questions.length-1:0}this.questionStartTime=Date.now()}jumpToQuestion(e,t){this.flushCurrentTimeSpent(),this.activeSectionIndex=e,this.activeQuestionIndex=t;const a=this.getCurrentQuestion();if(a){const n=this.stateMap.get(a.id);n&&n.paletteState===o.NOT_VISITED&&(n.paletteState=o.NOT_ANSWERED)}this.questionStartTime=Date.now()}getSectionSummary(){const e=[];return this.sections.forEach(t=>{let a=0,n=0,c=0,r=0,u=0;t.questions.forEach(p=>{const d=this.stateMap.get(p.id),l=d?d.paletteState:o.NOT_VISITED;l===o.NOT_VISITED?a++:l===o.NOT_ANSWERED?n++:l===o.ANSWERED?c++:l===o.MARKED_FOR_REVIEW?r++:l===o.ANSWERED_AND_MARKED&&u++}),e.push({sectionId:t.id,sectionName:t.section_name,totalQuestions:t.questions.length,notVisited:a,notAnswered:n,answered:c,marked:r,ansAndMarked:u})}),e}getPayloadForSubmit(){this.flushCurrentTimeSpent();const e=[];return this.stateMap.forEach(t=>{e.push({question_id:t.questionId,section_id:t.sectionId,palette_state:t.paletteState,selected_option:t.selectedOption,time_spent_sec:t.timeSpentSec,language:t.language||this.currentLanguage})}),{responses:e,details_json:{remainingSeconds:this.remainingSeconds,stateArray:Array.from(this.stateMap.values())}}}startAutoSave(e=3e4){this.stopAutoSave(),this.autoSaveInterval=setInterval(async()=>{try{const t=this.getPayloadForSubmit();await q(`/exams/attempts/${this.attempt.id}/save`,{method:"PUT",body:JSON.stringify({details_json:t.details_json})})}catch(t){console.warn("Auto-save heartbeat failed:",t)}},e)}stopAutoSave(){this.autoSaveInterval&&(clearInterval(this.autoSaveInterval),this.autoSaveInterval=null)}}function M(s,e,t={}){const a=document.createElement("div");return a.className="ssc-viewport-container",a.innerHTML=`
    <!-- SSC Header -->
    <header class="ssc-header">
      <div class="ssc-header-left">
        <div class="ssc-logo-box">SSC</div>
        <div>
          <h2 id="ssc-exam-title" class="ssc-exam-title">Staff Selection Commission Examination</h2>
          <span id="ssc-inst-name" class="ssc-inst-sub">Coaching Portal</span>
        </div>
      </div>

      <div class="ssc-header-center">
        <button id="btn-question-paper" class="ssc-btn-hdr" title="Question Paper" aria-label="Question Paper">
          <i class="ri-file-text-line"></i> <span class="btn-text-desktop">Question Paper</span>
        </button>
        <button id="btn-instructions" class="ssc-btn-hdr" title="Instructions" aria-label="Instructions">
          <i class="ri-information-line"></i> <span class="btn-text-desktop">Instructions</span>
        </button>
      </div>

      <div class="ssc-header-right">
        <div class="ssc-timer-box">
          <span class="ssc-timer-lbl">Time Left:</span>
          <span id="ssc-countdown" class="ssc-timer-val">00:00:00</span>
        </div>
        <div class="ssc-profile-box">
          <div class="ssc-avatar" id="ssc-avatar-initials">S</div>
          <div class="ssc-profile-info">
            <span id="ssc-candidate-name" class="ssc-cand-name">Candidate Name</span>
            <span class="ssc-cand-id">Lab ID: C215</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Section Navigation Bar -->
    <nav class="ssc-sec-bar">
      <span class="ssc-sec-lbl">Sections:</span>
      <div id="ssc-sec-tabs" class="ssc-sec-tabs">
        <!-- Dynamic Section Tabs -->
      </div>
    </nav>

    <!-- Main 2-Column Workspace -->
    <main class="ssc-workspace">
      <!-- Left Question Canvas -->
      <section class="ssc-question-canvas">
        <div class="ssc-q-hdr">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span id="ssc-q-num" class="ssc-q-num">Question No. 1</span>
            <span id="ssc-q-marks" class="ssc-q-marks">Marks: +2.00 / -0.50</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">View in:</label>
            <select id="ssc-lang-toggle" class="ssc-lang-select">
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
            </select>
          </div>
        </div>

        <!-- Scrollable Question Body -->
        <div class="ssc-q-body" id="ssc-q-body">
          <!-- Passage/Instruction Left/Top Pane -->
          <div id="ssc-passage-pane" class="ssc-passage-pane" style="display: none;">
            <div id="ssc-passage-box" class="ssc-passage-box"></div>
          </div>

          <!-- Question Statement & Options Right/Bottom Pane -->
          <div id="ssc-question-pane" class="ssc-question-pane">
            <!-- Question Text -->
            <div id="ssc-q-text" class="ssc-q-text">Loading question text...</div>

            <!-- Question Image if present -->
            <div id="ssc-q-img-box" style="margin: 12px 0; display: none;">
              <img id="ssc-q-img" src="" alt="Question Image" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color);">
            </div>

            <!-- Radio Options List -->
            <div id="ssc-options-box" class="ssc-options-box">
              <!-- Dynamic Options -->
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <footer class="ssc-action-bar">
          <div class="ssc-act-left">
            <button id="btn-mark-review" class="ssc-btn ssc-btn-purple" title="Mark for Review & Next" aria-label="Mark for Review & Next">
              <i class="ri-bookmark-fill"></i> <span class="btn-text-desktop">Mark for Review & Next</span>
            </button>
            <button id="btn-clear-resp" class="ssc-btn ssc-btn-outline" title="Clear Response" aria-label="Clear Response">
              <i class="ri-eraser-line"></i> <span class="btn-text-desktop">Clear Response</span>
            </button>
          </div>
          <div class="ssc-act-right">
            <button id="btn-toggle-palette" class="ssc-btn ssc-btn-outline" title="Question Palette" aria-label="Question Palette">
              <i class="ri-grid-fill"></i> <span class="btn-text-desktop">Palette</span>
            </button>
            <button id="btn-prev-q" class="ssc-btn ssc-btn-outline" title="Previous Question" aria-label="Previous Question">
              <i class="ri-arrow-left-s-line"></i><span class="btn-text-desktop"> Previous</span>
            </button>
            <button id="btn-save-next" class="ssc-btn ssc-btn-green" title="Save & Next" aria-label="Save & Next">
              <span class="btn-text-desktop">Save & Next </span><i class="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </footer>
      </section>

      <!-- Right Sidebar (Question Palette) -->
      <aside class="ssc-palette-sidebar" id="ssc-palette-sidebar">
        <!-- Palette Legend Summary -->
        <div class="ssc-legend-box">
          <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; color: var(--text-muted);">PALETTE LEGEND</h4>
          <div class="ssc-legend-grid">
            <div class="ssc-lg-item"><span class="ssc-badge badge-ans">0</span> Answered</div>
            <div class="ssc-lg-item"><span class="ssc-badge badge-not-ans">0</span> Not Answered</div>
            <div class="ssc-lg-item"><span class="ssc-badge badge-not-vis">0</span> Not Visited</div>
            <div class="ssc-lg-item"><span class="ssc-badge badge-review">0</span> Marked Review</div>
            <div class="ssc-lg-item" style="grid-column: 1/-1;"><span class="ssc-badge badge-ans-review">0</span> Answered & Marked (Evaluated)</div>
          </div>
        </div>

        <!-- Section Title in Palette -->
        <div id="ssc-palette-sec-title" class="ssc-palette-sec-title">Section: Reasoning</div>

        <!-- Scrollable Palette Grid -->
        <div id="ssc-palette-grid" class="ssc-palette-grid">
          <!-- Dynamic Q Palette Badges -->
        </div>

        <!-- Final Submit Exam Button -->
        <div style="padding: 14px; border-top: 1px solid var(--border-color); background: var(--card-bg);">
          <button id="btn-submit-exam" class="btn btn-primary" style="width: 100%; font-weight: 800; padding: 12px; background: #27ae60; border-color: #27ae60;" title="Submit Exam" aria-label="Submit Exam">
            <i class="ri-send-plane-fill"></i> <span class="btn-text-desktop">Submit Exam</span>
          </button>
        </div>
      </aside>

      <!-- Palette Drawer Mobile Backdrop Overlay -->
      <div id="ssc-palette-overlay" class="ssc-palette-overlay"></div>
    </main>

    <!-- Section Summary Modal -->
    <div id="ssc-summary-modal" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 2000; align-items: center; justify-content: center;">
      <div class="card" style="width: 100%; max-width: 720px; padding: 24px; background: var(--card-bg);">
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 6px;">Exam Section Summary</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 18px;">Please review your attempt summary before final submission.</p>

        <div style="overflow-x: auto; margin-bottom: 20px;">
          <table class="custom-table" style="width: 100%; font-size: 0.88rem;">
            <thead>
              <tr>
                <th>Section Name</th>
                <th>Total Qs</th>
                <th>Answered</th>
                <th>Not Answered</th>
                <th>Marked Review</th>
                <th>Ans & Marked</th>
                <th>Not Visited</th>
              </tr>
            </thead>
            <tbody id="ssc-summary-tbody">
              <!-- Dynamic Summary Rows -->
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button id="btn-summary-cancel" class="btn btn-outline">← Return to Exam</button>
          <button id="btn-summary-confirm" class="btn btn-primary" style="background: #27ae60; border-color: #27ae60; padding: 10px 24px;">
            Yes, Final Submit Exam
          </button>
        </div>
      </div>
    </div>
  `,setTimeout(()=>{C(a,s,e,t)},0),a}let i=null,f=null;async function C(s,e,t,a){try{let n=a.startData;n||(n=await q(`/exams/${a.examId||1}/start`,{method:"POST"}));const{attempt:c,exam:r,sections:u}=n;i=new T(c,r,u),a.lang&&(i.currentLanguage=a.lang);const p=I()||{full_name:"Candidate"};s.querySelector("#ssc-candidate-name").textContent=p.full_name,s.querySelector("#ssc-avatar-initials").textContent=p.full_name.charAt(0).toUpperCase(),s.querySelector("#ssc-exam-title").textContent=r.title,s.querySelector("#ssc-inst-name").textContent=r.institute_name||"Coaching Portal",s.querySelector("#ssc-q-marks").textContent=`Marks: +${parseFloat(r.positive_marks).toFixed(2)} / -${parseFloat(r.negative_marks).toFixed(2)}`,Q(s,t),x(s),b(s),y(s),N(s,t),i.startAutoSave(3e4)}catch(n){console.error("SSC Exam view error:",n),alert("Could not initialize exam session."),t("dashboard")}}function N(s,e){f&&clearInterval(f);const t=s.querySelector("#ssc-countdown");f=setInterval(()=>{if(!i)return;if(i.remainingSeconds--,i.remainingSeconds<=0){clearInterval(f),t.textContent="00:00:00",alert("Time is up! Your exam will be submitted automatically."),w(s,e,!0);return}const a=Math.floor(i.remainingSeconds/3600),n=Math.floor(i.remainingSeconds%3600/60),c=i.remainingSeconds%60,r=`${String(a).padStart(2,"0")}:${String(n).padStart(2,"0")}:${String(c).padStart(2,"0")}`;t.textContent=r,i.remainingSeconds<300&&(t.style.color="#e74c3c",t.style.animation="pulse 1s infinite")},1e3)}function x(s){const e=s.querySelector("#ssc-sec-tabs");e.innerHTML=i.sections.map((a,n)=>`
    <button class="ssc-tab ${n===i.activeSectionIndex?"active":""}" data-idx="${n}">
      ${a.section_name}
    </button>
  `).join("");const t=e.querySelector(".ssc-tab.active");t&&typeof t.scrollIntoView=="function"&&t.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"}),e.querySelectorAll(".ssc-tab").forEach(a=>{a.addEventListener("click",()=>{if(i.exam.allow_section_switch===!1){alert("Section switching is restricted in this exam.");return}const n=parseInt(a.dataset.idx,10);i.jumpToQuestion(n,0),x(s),b(s),y(s)})})}function b(s){if(!i)return;const e=i.getCurrentQuestion(),t=i.getCurrentState(),a=i.getCurrentSection();if(!e)return;s.querySelector("#ssc-q-num").textContent=`Question No. ${i.activeQuestionIndex+1}`,s.querySelector("#ssc-palette-sec-title").textContent=`Section: ${a.section_name}`;const n=s.querySelector("#ssc-q-body"),c=s.querySelector("#ssc-passage-pane"),r=s.querySelector("#ssc-passage-box"),u=i.currentLanguage==="hi"&&e.passage_text_hi||e.passage_text_en;u&&u.trim().length>0?(n&&n.classList.add("has-passage"),c&&(c.style.display="block"),r&&(r.innerHTML=`<div style="font-weight:800; color:var(--primary); margin-bottom:6px; font-size:0.85rem;"><i class="ri-book-open-line"></i> Passage / Instructions:</div><div>${E(u)}</div>`)):(n&&n.classList.remove("has-passage"),c&&(c.style.display="none"),r&&(r.innerHTML=""));const p=i.currentLanguage==="hi"&&e.question_text_hi||e.question_text_en;s.querySelector("#ssc-q-text").innerHTML=E(p);const d=s.querySelector("#ssc-q-img-box"),l=s.querySelector("#ssc-q-img");e.image_url?(d.style.display="block",l.src=e.image_url):d.style.display="none";const v=s.querySelector("#ssc-options-box"),h=i.currentLanguage==="hi"&&e.options_hi&&e.options_hi.length>0?e.options_hi:e.options_en||[],m=["(A)","(B)","(C)","(D)","(E)"];v.innerHTML=h.map((g,S)=>`
    <label class="ssc-opt-item ${t.selectedOption===S?"selected":""}">
      <input type="radio" name="ssc_opt_group" value="${S}" ${t.selectedOption===S?"checked":""}>
      <span class="ssc-opt-label">${m[S]||S+1}</span>
      <span class="ssc-opt-text">${E(g)}</span>
    </label>
  `).join(""),v.querySelectorAll('input[name="ssc_opt_group"]').forEach(g=>{g.addEventListener("change",S=>{const A=parseInt(S.target.value,10);i.selectOption(A),b(s),y(s)})}),_(s.querySelector("#ssc-q-pane")),r&&_(r)}function y(s){if(!i)return;const e=i.getCurrentSection(),t=s.querySelector("#ssc-palette-grid");t.innerHTML=e.questions.map((l,v)=>{const h=i.stateMap.get(l.id),m=h?h.paletteState:o.NOT_VISITED;let g="badge-not-vis";m===o.NOT_ANSWERED?g="badge-not-ans":m===o.ANSWERED?g="badge-ans":m===o.MARKED_FOR_REVIEW?g="badge-review":m===o.ANSWERED_AND_MARKED&&(g="badge-ans-review");const S=v===i.activeQuestionIndex;return`
      <button class="ssc-badge ${g} ${S?"active-q":""}" data-qidx="${v}">
        ${String(v+1).padStart(2,"0")}
      </button>
    `}).join(""),t.querySelectorAll(".ssc-badge").forEach(l=>{l.addEventListener("click",()=>{const v=parseInt(l.dataset.qidx,10);i.jumpToQuestion(i.activeSectionIndex,v),b(s),y(s);const h=s.querySelector("#ssc-palette-sidebar"),m=s.querySelector("#ssc-palette-overlay");h&&h.classList.contains("mobile-open")&&(h.classList.remove("mobile-open"),m&&m.classList.remove("active"))})});const a=i.getSectionSummary();let n=0,c=0,r=0,u=0,p=0;a.forEach(l=>{n+=l.answered,c+=l.notAnswered,r+=l.notVisited,u+=l.marked,p+=l.ansAndMarked});const d=s.querySelector(".ssc-legend-grid");d&&(d.querySelector(".badge-ans").textContent=n,d.querySelector(".badge-not-ans").textContent=c,d.querySelector(".badge-not-vis").textContent=r,d.querySelector(".badge-review").textContent=u,d.querySelector(".badge-ans-review").textContent=p)}function Q(s,e){const t=s.querySelector("#ssc-palette-sidebar"),a=s.querySelector("#ssc-palette-overlay"),n=s.querySelector("#btn-toggle-palette");if(n&&t&&a){const l=()=>{t.classList.toggle("mobile-open"),a.classList.toggle("active")};n.addEventListener("click",l),a.addEventListener("click",l)}s.querySelector("#btn-save-next").addEventListener("click",()=>{i.saveAndNext(),x(s),b(s),y(s)}),s.querySelector("#btn-mark-review").addEventListener("click",()=>{i.markForReviewAndNext(),x(s),b(s),y(s)}),s.querySelector("#btn-clear-resp").addEventListener("click",()=>{i.clearResponse(),b(s),y(s)}),s.querySelector("#btn-prev-q").addEventListener("click",()=>{i.prevQuestion(),x(s),b(s),y(s)});const c=s.querySelector("#ssc-lang-toggle");c.value=i.currentLanguage,c.addEventListener("change",l=>{i.currentLanguage=l.target.value,b(s)});const r=s.querySelector("#ssc-summary-modal"),u=s.querySelector("#btn-submit-exam"),p=s.querySelector("#btn-summary-cancel"),d=s.querySelector("#btn-summary-confirm");u.addEventListener("click",()=>{R(s),r.style.display="flex"}),p.addEventListener("click",()=>{r.style.display="none"}),d.addEventListener("click",()=>{r.style.display="none",w(s,e,!1)})}function R(s){const e=i.getSectionSummary(),t=s.querySelector("#ssc-summary-tbody");t.innerHTML=e.map(a=>`
    <tr>
      <td style="font-weight: 700;">${a.sectionName}</td>
      <td style="font-weight: 700;">${a.totalQuestions}</td>
      <td style="color: #27ae60; font-weight: 700;">${a.answered}</td>
      <td style="color: #c0392b; font-weight: 700;">${a.notAnswered}</td>
      <td style="color: #8e44ad; font-weight: 700;">${a.marked}</td>
      <td style="color: #8e44ad; font-weight: 700;">${a.ansAndMarked}</td>
      <td>${a.notVisited}</td>
    </tr>
  `).join("")}async function w(s,e,t){f&&clearInterval(f),i&&i.stopAutoSave();try{const a=i.getPayloadForSubmit();a.is_auto_submit=t;const n=await q(`/exams/attempts/${i.attempt.id}/submit`,{method:"POST",body:JSON.stringify(a)});alert(`Exam Submitted Successfully!
Your Score: ${n.totalScore} | Accuracy: ${n.accuracyPct}%

Opening detailed scorecard & item-level analysis...`),e("exam-analysis",{attemptId:i.attempt.id})}catch(a){console.error("Submission failed:",a),alert("Submission failed. Retrying...")}}export{M as renderSSCExamDashboardView};
