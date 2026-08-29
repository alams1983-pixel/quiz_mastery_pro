import{r as a}from"./index-Dj_OHbJk.js";function u(e,r){const i=document.createElement("div");return i.className="view-container fade-in",i.style.maxWidth="900px",i.style.margin="20px auto",i.innerHTML=`
    <div class="card" style="padding: 28px; background: var(--card-bg);">
      <div style="border-bottom: 2px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <span class="institute-badge" id="lobby-inst-name" style="margin-bottom: 8px;">Loading Institute...</span>
          <h1 id="lobby-title" style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">Online CBT Exam Lobby</h1>
          <p id="lobby-desc" style="color: var(--text-muted); font-size: 0.95rem; margin-top: 4px;">Computer Based Online Examination Portal</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">Duration</div>
          <div id="lobby-duration" style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">60 Mins</div>
        </div>
      </div>

      <!-- Key Info Banner -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px 18px; margin-bottom: 24px;">
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">MARKING SCHEME</span>
          <strong id="lobby-marking" style="color: var(--success);">+2.00 / -0.50</strong>
        </div>
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">EXAM MODE</span>
          <strong id="lobby-mode" style="text-transform: capitalize; color: var(--primary);">Actual Exam</strong>
        </div>
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">SECTIONS</span>
          <strong id="lobby-sections-count">4 Sections</strong>
        </div>
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">TOTAL QUESTIONS</span>
          <strong id="lobby-questions-count">100 Questions</strong>
        </div>
      </div>

      <!-- Language Preference Dropdown -->
      <div style="background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: var(--radius-sm); padding: 14px 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <strong style="color: var(--primary); font-size: 0.95rem;">Choose your default viewing language:</strong>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">You can change language for individual questions inside the exam interface anytime.</p>
        </div>
        <select id="select-lang" style="padding: 8px 14px; border-radius: 8px; border: 1px solid var(--primary-border); font-weight: 700; color: var(--primary); cursor: pointer;">
          <option value="en">English</option>
          <option value="hi">Hindi (हिंदी)</option>
        </select>
      </div>

      <!-- SSC Instructions Box -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px;">General Exam Instructions</h3>
        <div style="height: 240px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 16px; background: var(--card-bg); font-size: 0.9rem; line-height: 1.6; color: var(--text-main);">
          <ol style="padding-left: 20px;">
            <li style="margin-bottom: 8px;">The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
            <li style="margin-bottom: 8px;">The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</li>
          </ol>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; padding: 12px; background: var(--bg-color); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 28px; height: 24px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center; font-weight: 700; font-size: 0.8rem; line-height: 22px;">01</span>
              <span>You have not visited the question yet.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 28px; height: 24px; background: #D9534F; color: #fff; border-radius: 4px; text-align: center; font-weight: 700; font-size: 0.8rem; line-height: 24px;">02</span>
              <span>You have not answered the question.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 28px; height: 24px; background: #5CB85C; color: #fff; border-radius: 4px; text-align: center; font-weight: 700; font-size: 0.8rem; line-height: 24px;">03</span>
              <span>You have answered the question.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 28px; height: 24px; background: #8E44AD; color: #fff; border-radius: 50%; text-align: center; font-weight: 700; font-size: 0.8rem; line-height: 24px;">04</span>
              <span>You have NOT answered, but marked for review.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; grid-column: 1/-1;">
              <span style="display: inline-block; width: 28px; height: 24px; background: #8E44AD; color: #fff; border-radius: 50%; text-align: center; font-weight: 700; font-size: 0.8rem; line-height: 24px; position: relative;">05<span style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; background: #2ECC71; border-radius: 50%;"></span></span>
              <span><strong>Answered & Marked for Review:</strong> The question will be <strong>EVALUATED</strong> in scoring.</span>
            </div>
          </div>

          <ol start="3" style="padding-left: 20px;">
            <li style="margin-bottom: 8px;">Clicking on a question number in the Question Palette will take you to that question directly.</li>
            <li style="margin-bottom: 8px;">To select your answer, click on the button for one of the options. To deselect your chosen answer, click on <strong>Clear Response</strong>.</li>
            <li style="margin-bottom: 8px;">To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
          </ol>
        </div>
      </div>

      <!-- Declaration Checkbox -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 18px; margin-bottom: 20px;">
        <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 0.9rem; line-height: 1.5; color: var(--text-main);">
          <input type="checkbox" id="chk-declaration" style="margin-top: 3px; width: 18px; height: 18px; cursor: pointer;">
          <span>
            I have read and understood all the instructions. All computer hardware allotted to me is in proper working condition. I declare that I am not in possession of any prohibited gadgets or smartphones inside the examination hall.
          </span>
        </label>
      </div>

      <!-- Submit / Begin Button -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <button id="btn-lobby-back" class="btn btn-outline">← Back to Dashboard</button>
        <button id="btn-begin-exam" class="btn btn-primary" style="padding: 12px 28px; font-size: 1.05rem; opacity: 0.5;" disabled>
          I am ready to begin →
        </button>
      </div>
    </div>
  `,setTimeout(()=>{x(i,e,r)},0),i}async function x(e,r,i){try{const s=await a(`/exams/${r}`),t=s.exam,c=s.sections||[];e.querySelector("#lobby-inst-name").textContent=t.institute_name||"Coaching Institute",e.querySelector("#lobby-title").textContent=t.title,e.querySelector("#lobby-desc").textContent=t.description||"Staff Selection Commission Computer Based Examination",e.querySelector("#lobby-duration").textContent=`${t.total_duration_mins||60} Mins`,e.querySelector("#lobby-marking").textContent=`+${parseFloat(t.positive_marks).toFixed(2)} / -${parseFloat(t.negative_marks).toFixed(2)}`,e.querySelector("#lobby-mode").textContent=`${t.mode} Mode`,e.querySelector("#lobby-sections-count").textContent=`${c.length} Sections`;const g=await a(`/exams/${r}/sections-questions`);let l=0;if((g.sections||[]).forEach(o=>l+=o.questions.length),e.querySelector("#lobby-questions-count").textContent=`${l} Questions`,t.instructions&&t.instructions.trim()){const o=document.createElement("div");o.style.cssText="background:var(--primary-light); border:1px solid var(--primary-border); border-radius:8px; padding:14px; margin-bottom:16px; font-size:0.9rem; color:var(--text-main);",o.innerHTML=`
        <strong style="color:var(--primary); font-size:0.95rem; display:block; margin-bottom:6px;">📋 Specific Exam Instructions from Teacher:</strong>
        <div style="white-space:pre-wrap;">${t.instructions}</div>
      `;const p=e.querySelector("#lobby-desc").closest(".card").querySelector(".card > div:nth-of-type(4)")||e.querySelector("#chk-declaration").closest("div").previousElementSibling;p&&p.prepend(o)}const d=e.querySelector("#chk-declaration"),n=e.querySelector("#btn-begin-exam"),m=e.querySelector("#btn-lobby-back"),b=e.querySelector("#select-lang");d.addEventListener("change",()=>{d.checked?(n.disabled=!1,n.style.opacity="1"):(n.disabled=!0,n.style.opacity="0.5")}),m.addEventListener("click",()=>{i("dashboard")}),n.addEventListener("click",async()=>{try{n.disabled=!0,n.textContent="Initializing Exam Session...";const o=await a(`/exams/${r}/start`,{method:"POST"});i("ssc-exam",{attemptId:o.attempt.id,lang:b.value,startData:o})}catch(o){alert(o.message||"Could not start exam session."),n.disabled=!1,n.textContent="I am ready to begin →"}})}catch(s){console.error("Lobby error:",s),alert("Failed to load exam details.")}}export{u as renderExamLobbyView};
