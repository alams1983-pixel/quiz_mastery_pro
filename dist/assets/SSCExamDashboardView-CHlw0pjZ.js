import{r as q,g as A}from"./index-w1j3NIg4.js";import{r as E}from"./richContent-CaTr0paQ.js";const o={NOT_VISITED:1,NOT_ANSWERED:2,ANSWERED:3,MARKED_FOR_REVIEW:4,ANSWERED_AND_MARKED:5};class I{constructor(e,t,i){this.attempt=e,this.exam=t,this.sections=i,this.activeSectionIndex=0,this.activeQuestionIndex=0,this.currentLanguage="en",this.stateMap=new Map,this.startTime=Date.now(),this.questionStartTime=Date.now(),this.remainingSeconds=(t.total_duration_mins||60)*60,this.autoSaveInterval=null,this.initStates()}initStates(){if(this.sections.forEach(t=>{t.questions.forEach(i=>{this.stateMap.set(i.id,{questionId:i.id,sectionId:t.id,paletteState:o.NOT_VISITED,selectedOption:null,timeSpentSec:0,language:"en"})})}),this.attempt&&this.attempt.details_json)try{const t=typeof this.attempt.details_json=="string"?JSON.parse(this.attempt.details_json):this.attempt.details_json;t.stateArray&&Array.isArray(t.stateArray)&&t.stateArray.forEach(i=>{this.stateMap.has(i.questionId)&&this.stateMap.set(i.questionId,{...this.stateMap.get(i.questionId),...i})}),t.remainingSeconds!==void 0&&(this.remainingSeconds=t.remainingSeconds)}catch(t){console.warn("Could not restore saved details_json:",t)}const e=this.getCurrentQuestion();if(e){const t=this.stateMap.get(e.id);t&&t.paletteState===o.NOT_VISITED&&(t.paletteState=o.NOT_ANSWERED)}}getCurrentSection(){return this.sections[this.activeSectionIndex]||null}getCurrentQuestion(){const e=this.getCurrentSection();return e&&e.questions?e.questions[this.activeQuestionIndex]:null}getCurrentState(){const e=this.getCurrentQuestion();return e?this.stateMap.get(e.id):null}flushCurrentTimeSpent(){const e=this.getCurrentQuestion();if(!e)return;const t=this.stateMap.get(e.id);if(t){const i=Math.round((Date.now()-this.questionStartTime)/1e3);t.timeSpentSec+=i}this.questionStartTime=Date.now()}selectOption(e){const t=this.getCurrentQuestion();if(!t)return;const i=this.stateMap.get(t.id);i&&(i.selectedOption=e)}clearResponse(){const e=this.getCurrentQuestion();if(!e)return;const t=this.stateMap.get(e.id);t&&(t.selectedOption=null,t.paletteState===o.ANSWERED?t.paletteState=o.NOT_ANSWERED:t.paletteState===o.ANSWERED_AND_MARKED&&(t.paletteState=o.MARKED_FOR_REVIEW))}saveAndNext(){this.flushCurrentTimeSpent();const e=this.getCurrentQuestion();if(e){const t=this.stateMap.get(e.id);t&&(t.selectedOption!==null&&t.selectedOption!==void 0?t.paletteState=o.ANSWERED:t.paletteState=o.NOT_ANSWERED)}this.nextQuestion()}markForReviewAndNext(){this.flushCurrentTimeSpent();const e=this.getCurrentQuestion();if(e){const t=this.stateMap.get(e.id);t&&(t.selectedOption!==null&&t.selectedOption!==void 0?t.paletteState=o.ANSWERED_AND_MARKED:t.paletteState=o.MARKED_FOR_REVIEW)}this.nextQuestion()}nextQuestion(){const e=this.getCurrentSection();if(!e)return;this.activeQuestionIndex<e.questions.length-1?this.activeQuestionIndex++:this.activeSectionIndex<this.sections.length-1&&this.exam.allow_section_switch!==!1&&(this.activeSectionIndex++,this.activeQuestionIndex=0);const t=this.getCurrentQuestion();if(t){const i=this.stateMap.get(t.id);i&&i.paletteState===o.NOT_VISITED&&(i.paletteState=o.NOT_ANSWERED)}this.questionStartTime=Date.now()}prevQuestion(){if(this.flushCurrentTimeSpent(),this.activeQuestionIndex>0)this.activeQuestionIndex--;else if(this.activeSectionIndex>0&&this.exam.allow_section_switch!==!1){this.activeSectionIndex--;const e=this.getCurrentSection();this.activeQuestionIndex=e?e.questions.length-1:0}this.questionStartTime=Date.now()}jumpToQuestion(e,t){this.flushCurrentTimeSpent(),this.activeSectionIndex=e,this.activeQuestionIndex=t;const i=this.getCurrentQuestion();if(i){const n=this.stateMap.get(i.id);n&&n.paletteState===o.NOT_VISITED&&(n.paletteState=o.NOT_ANSWERED)}this.questionStartTime=Date.now()}getSectionSummary(){const e=[];return this.sections.forEach(t=>{let i=0,n=0,c=0,l=0,u=0;t.questions.forEach(p=>{const d=this.stateMap.get(p.id),r=d?d.paletteState:o.NOT_VISITED;r===o.NOT_VISITED?i++:r===o.NOT_ANSWERED?n++:r===o.ANSWERED?c++:r===o.MARKED_FOR_REVIEW?l++:r===o.ANSWERED_AND_MARKED&&u++}),e.push({sectionId:t.id,sectionName:t.section_name,totalQuestions:t.questions.length,notVisited:i,notAnswered:n,answered:c,marked:l,ansAndMarked:u})}),e}getPayloadForSubmit(){this.flushCurrentTimeSpent();const e=[];return this.stateMap.forEach(t=>{e.push({question_id:t.questionId,section_id:t.sectionId,palette_state:t.paletteState,selected_option:t.selectedOption,time_spent_sec:t.timeSpentSec,language:t.language||this.currentLanguage})}),{responses:e,details_json:{remainingSeconds:this.remainingSeconds,stateArray:Array.from(this.stateMap.values())}}}startAutoSave(e=3e4){this.stopAutoSave(),this.autoSaveInterval=setInterval(async()=>{try{const t=this.getPayloadForSubmit();await q(`/exams/attempts/${this.attempt.id}/save`,{method:"PUT",body:JSON.stringify({details_json:t.details_json})})}catch(t){console.warn("Auto-save heartbeat failed:",t)}},e)}stopAutoSave(){this.autoSaveInterval&&(clearInterval(this.autoSaveInterval),this.autoSaveInterval=null)}}function k(s,e,t={}){const i=document.createElement("div");return i.className="ssc-viewport-container",i.innerHTML=`
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
  `,setTimeout(()=>{T(i,s,e,t)},0),i}let a=null,f=null;async function T(s,e,t,i){try{let n=i.startData;n||(n=await q(`/exams/${i.examId||1}/start`,{method:"POST"}));const{attempt:c,exam:l,sections:u}=n;a=new I(c,l,u),i.lang&&(a.currentLanguage=i.lang);const p=A()||{full_name:"Candidate"};s.querySelector("#ssc-candidate-name").textContent=p.full_name,s.querySelector("#ssc-avatar-initials").textContent=p.full_name.charAt(0).toUpperCase(),s.querySelector("#ssc-exam-title").textContent=l.title,s.querySelector("#ssc-inst-name").textContent=l.institute_name||"Coaching Portal",s.querySelector("#ssc-q-marks").textContent=`Marks: +${parseFloat(l.positive_marks).toFixed(2)} / -${parseFloat(l.negative_marks).toFixed(2)}`,N(s,t),x(s),b(s),y(s),C(s,t),a.startAutoSave(3e4)}catch(n){console.error("SSC Exam view error:",n),alert("Could not initialize exam session."),t("dashboard")}}function C(s,e){f&&clearInterval(f);const t=s.querySelector("#ssc-countdown");f=setInterval(()=>{if(!a)return;if(a.remainingSeconds--,a.remainingSeconds<=0){clearInterval(f),t.textContent="00:00:00",alert("Time is up! Your exam will be submitted automatically."),_(s,e,!0);return}const i=Math.floor(a.remainingSeconds/3600),n=Math.floor(a.remainingSeconds%3600/60),c=a.remainingSeconds%60,l=`${String(i).padStart(2,"0")}:${String(n).padStart(2,"0")}:${String(c).padStart(2,"0")}`;t.textContent=l,a.remainingSeconds<300&&(t.style.color="#e74c3c",t.style.animation="pulse 1s infinite")},1e3)}function x(s){const e=s.querySelector("#ssc-sec-tabs");e.innerHTML=a.sections.map((i,n)=>`
    <button class="ssc-tab ${n===a.activeSectionIndex?"active":""}" data-idx="${n}">
      ${i.section_name}
    </button>
  `).join("");const t=e.querySelector(".ssc-tab.active");t&&typeof t.scrollIntoView=="function"&&t.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"}),e.querySelectorAll(".ssc-tab").forEach(i=>{i.addEventListener("click",()=>{if(a.exam.allow_section_switch===!1){alert("Section switching is restricted in this exam.");return}const n=parseInt(i.dataset.idx,10);a.jumpToQuestion(n,0),x(s),b(s),y(s)})})}function b(s){if(!a)return;const e=a.getCurrentQuestion(),t=a.getCurrentState(),i=a.getCurrentSection();if(!e)return;s.querySelector("#ssc-q-num").textContent=`Question No. ${a.activeQuestionIndex+1}`,s.querySelector("#ssc-palette-sec-title").textContent=`Section: ${i.section_name}`;const n=s.querySelector("#ssc-q-body"),c=s.querySelector("#ssc-passage-pane"),l=s.querySelector("#ssc-passage-box"),u=a.currentLanguage==="hi"&&e.passage_text_hi||e.passage_text_en;u&&u.trim().length>0?(n&&n.classList.add("has-passage"),c&&(c.style.display="block"),l&&(l.innerHTML=`<div style="font-weight:800; color:var(--primary); margin-bottom:6px; font-size:0.85rem;"><i class="ri-book-open-line"></i> Passage / Instructions:</div><div>${E(u)}</div>`)):(n&&n.classList.remove("has-passage"),c&&(c.style.display="none"),l&&(l.innerHTML=""));const p=a.currentLanguage==="hi"&&e.question_text_hi||e.question_text_en;s.querySelector("#ssc-q-text").innerHTML=E(p);const d=s.querySelector("#ssc-q-img-box"),r=s.querySelector("#ssc-q-img");e.image_url?(d.style.display="block",r.src=e.image_url):d.style.display="none";const v=s.querySelector("#ssc-options-box"),h=a.currentLanguage==="hi"&&e.options_hi&&e.options_hi.length>0?e.options_hi:e.options_en||[],m=["(A)","(B)","(C)","(D)","(E)"];v.innerHTML=h.map((g,S)=>`
    <label class="ssc-opt-item ${t.selectedOption===S?"selected":""}">
      <input type="radio" name="ssc_opt_group" value="${S}" ${t.selectedOption===S?"checked":""}>
      <span class="ssc-opt-label">${m[S]||S+1}</span>
      <span class="ssc-opt-text">${E(g)}</span>
    </label>
  `).join(""),v.querySelectorAll('input[name="ssc_opt_group"]').forEach(g=>{g.addEventListener("change",S=>{const w=parseInt(S.target.value,10);a.selectOption(w),b(s),y(s)})})}function y(s){if(!a)return;const e=a.getCurrentSection(),t=s.querySelector("#ssc-palette-grid");t.innerHTML=e.questions.map((r,v)=>{const h=a.stateMap.get(r.id),m=h?h.paletteState:o.NOT_VISITED;let g="badge-not-vis";m===o.NOT_ANSWERED?g="badge-not-ans":m===o.ANSWERED?g="badge-ans":m===o.MARKED_FOR_REVIEW?g="badge-review":m===o.ANSWERED_AND_MARKED&&(g="badge-ans-review");const S=v===a.activeQuestionIndex;return`
      <button class="ssc-badge ${g} ${S?"active-q":""}" data-qidx="${v}">
        ${String(v+1).padStart(2,"0")}
      </button>
    `}).join(""),t.querySelectorAll(".ssc-badge").forEach(r=>{r.addEventListener("click",()=>{const v=parseInt(r.dataset.qidx,10);a.jumpToQuestion(a.activeSectionIndex,v),b(s),y(s);const h=s.querySelector("#ssc-palette-sidebar"),m=s.querySelector("#ssc-palette-overlay");h&&h.classList.contains("mobile-open")&&(h.classList.remove("mobile-open"),m&&m.classList.remove("active"))})});const i=a.getSectionSummary();let n=0,c=0,l=0,u=0,p=0;i.forEach(r=>{n+=r.answered,c+=r.notAnswered,l+=r.notVisited,u+=r.marked,p+=r.ansAndMarked});const d=s.querySelector(".ssc-legend-grid");d&&(d.querySelector(".badge-ans").textContent=n,d.querySelector(".badge-not-ans").textContent=c,d.querySelector(".badge-not-vis").textContent=l,d.querySelector(".badge-review").textContent=u,d.querySelector(".badge-ans-review").textContent=p)}function N(s,e){const t=s.querySelector("#ssc-palette-sidebar"),i=s.querySelector("#ssc-palette-overlay"),n=s.querySelector("#btn-toggle-palette");if(n&&t&&i){const r=()=>{t.classList.toggle("mobile-open"),i.classList.toggle("active")};n.addEventListener("click",r),i.addEventListener("click",r)}s.querySelector("#btn-save-next").addEventListener("click",()=>{a.saveAndNext(),x(s),b(s),y(s)}),s.querySelector("#btn-mark-review").addEventListener("click",()=>{a.markForReviewAndNext(),x(s),b(s),y(s)}),s.querySelector("#btn-clear-resp").addEventListener("click",()=>{a.clearResponse(),b(s),y(s)}),s.querySelector("#btn-prev-q").addEventListener("click",()=>{a.prevQuestion(),x(s),b(s),y(s)});const c=s.querySelector("#ssc-lang-toggle");c.value=a.currentLanguage,c.addEventListener("change",r=>{a.currentLanguage=r.target.value,b(s)});const l=s.querySelector("#ssc-summary-modal"),u=s.querySelector("#btn-submit-exam"),p=s.querySelector("#btn-summary-cancel"),d=s.querySelector("#btn-summary-confirm");u.addEventListener("click",()=>{Q(s),l.style.display="flex"}),p.addEventListener("click",()=>{l.style.display="none"}),d.addEventListener("click",()=>{l.style.display="none",_(s,e,!1)})}function Q(s){const e=a.getSectionSummary(),t=s.querySelector("#ssc-summary-tbody");t.innerHTML=e.map(i=>`
    <tr>
      <td style="font-weight: 700;">${i.sectionName}</td>
      <td style="font-weight: 700;">${i.totalQuestions}</td>
      <td style="color: #27ae60; font-weight: 700;">${i.answered}</td>
      <td style="color: #c0392b; font-weight: 700;">${i.notAnswered}</td>
      <td style="color: #8e44ad; font-weight: 700;">${i.marked}</td>
      <td style="color: #8e44ad; font-weight: 700;">${i.ansAndMarked}</td>
      <td>${i.notVisited}</td>
    </tr>
  `).join("")}async function _(s,e,t){f&&clearInterval(f),a&&a.stopAutoSave();try{const i=a.getPayloadForSubmit();i.is_auto_submit=t;const n=await q(`/exams/attempts/${a.attempt.id}/submit`,{method:"POST",body:JSON.stringify(i)});alert(`Exam Submitted Successfully!
Your Score: ${n.totalScore} | Accuracy: ${n.accuracyPct}%

Opening detailed scorecard & item-level analysis...`),e("exam-analysis",{attemptId:a.attempt.id})}catch(i){console.error("Submission failed:",i),alert("Submission failed. Retrying...")}}export{k as renderSSCExamDashboardView};
