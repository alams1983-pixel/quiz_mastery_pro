import{a as $,g as I,b as k,d as lt}from"./index-CmO4Cwr9.js";import{r as R}from"./richContent-DkV-UtbV.js";function pt(q,T,Q){const t=document.createElement("div");t.className="view-container",t.innerHTML=`
    <div class="quiz-wrapper" id="quizWrapper">
      <!-- 1. START SCREEN -->
      <div id="startScreen" style="text-align:center; padding: 20px 0;">
        <div style="font-size:3rem; margin-bottom:8px; color:var(--primary);">📘</div>
        <h1 id="quizTitleHeader" style="font-size:2rem; font-weight:700; margin-bottom:8px;">Mastery Quiz</h1>
        <p id="quizDescHeader" style="color:var(--text-muted); font-size:1rem; margin-bottom:24px;">
          Learn by repetition — master each question by answering correctly multiple times.
        </p>

        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; margin-bottom:24px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Total Questions</span>
            <div id="totalQtyDisplay" style="font-size:1.6rem; font-weight:700; color:var(--primary);">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Quiz Mode</span>
            <div style="font-size:1.1rem; font-weight:600; color:var(--text-main);">Mastery Repetition</div>
          </div>
        </div>

        <!-- Mastery required selector -->
        <div style="background:var(--primary-light); border:1px solid var(--primary-border); border-radius:var(--radius-md); padding:20px; margin-bottom:28px; text-align:left;">
          <label style="font-weight:700; color:var(--primary); display:block; margin-bottom:12px;">
            🎯 Select Mastery required (correct answers needed per question):
          </label>
          <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
            ${[1,2,3,4,5].map(e=>`
              <label style="background:var(--card-bg); padding:8px 18px; border-radius:var(--radius-pill); border:1.5px solid var(--border-color); cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px;">
                <input type="radio" name="mastery" value="${e}" ${e===1?"checked":""} /> ${e} ${e===1?"(Standard)":""}
              </label>
            `).join("")}
          </div>
        </div>

        <button class="btn" id="startQuizBtn" style="min-width:240px;">Start Mastery Session</button>
      </div>

      <!-- 2. QUIZ ACTIVE SCREEN -->
      <div id="activeScreen" style="display:none;">
        <div class="quiz-header">
          <div class="mastery-status" id="masteryStatus">Mastered: 0 / 0</div>
          <div class="timer-badge" id="timerDisplay">00:00</div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" id="progressFill"></div>
        </div>

        <div class="question-card" id="questionCard">
          <div class="q-text" id="qText">Loading question...</div>
          <img id="qImg" class="question-img" style="display:none;" />
          <div class="options-grid" id="optionsContainer"></div>

          <!-- Feedback block -->
          <div class="feedback" id="feedback">
            <div class="fb-head" id="fbHead"></div>
            <div class="fb-correct" id="fbCorrectAnswer"></div>
            <div class="fb-explain" id="fbExplain"></div>
          </div>

          <div id="nextBtnContainer" style="display:none; margin-top:20px; text-align:right;">
            <button class="btn" id="nextQuestionBtn" title="Next Question" aria-label="Next Question"><span class="btn-text-desktop">Next Question </span><i class="ri-arrow-right-line"></i></button>
          </div>
        </div>
      </div>

      <!-- 3. COMPLETION SCREEN -->
      <div id="completionScreen" style="display:none; text-align:center; padding:20px 0;">
        <div style="font-size:3.5rem; margin-bottom:8px;">🎉</div>
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:6px;">EdutorAi Pro Practice Complete!</h2>
        <p style="color:var(--text-muted); font-size:1rem; margin-bottom:20px;">
          You have mastered every question according to your required repetition target.
        </p>

        <!-- Guest Notice Banner -->
        <div id="guestNoticeBanner" style="display:none; background:var(--primary-light); border:1px solid var(--primary-border); border-radius:var(--radius-md); padding:14px 20px; margin-bottom:24px; text-align:center;">
          <span style="font-size:0.92rem; font-weight:600; color:var(--primary);">
            💡 You took this quiz as a Guest. Sign in or register to save your attempt history & track analytics!
          </span>
          <button class="btn btn-sm" id="guestSignInBtn" style="margin-left:12px;">Sign In to Track Analytics</button>
        </div>

        <!-- Stats Grid -->
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:20px; margin-bottom:28px; display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:12px;">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Total Qs</span>
            <div id="statTotal" style="font-size:1.5rem; font-weight:700; color:var(--primary);">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Attempts</span>
            <div id="statAttempts" style="font-size:1.5rem; font-weight:700;">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Correct</span>
            <div id="statCorrect" style="font-size:1.5rem; font-weight:700; color:var(--success);">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Wrong</span>
            <div id="statWrong" style="font-size:1.5rem; font-weight:700; color:var(--danger);">0</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Accuracy</span>
            <div id="statAccuracy" style="font-size:1.5rem; font-weight:700; color:var(--success);">0%</div>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted);">Time</span>
            <div id="statTime" style="font-size:1.5rem; font-weight:700;">00:00</div>
          </div>
        </div>

        <!-- Summary Table -->
        <div style="margin-bottom:28px; text-align:left;">
          <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:12px;">📊 Question Performance Summary</h3>
          <div class="table-wrap">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Question Item</th>
                  <th>Required Mastery</th>
                  <th>Total Attempts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="summaryTableBody"></tbody>
            </table>
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
          <button class="btn" id="downloadPdfBtn" style="background:#047857;" title="Download PDF Report" aria-label="Download PDF Report">
            <i class="ri-file-pdf-2-line"></i> <span class="btn-text-desktop">Download PDF Report</span>
          </button>
          <button class="btn btn-secondary" id="restartQuizBtn" title="Restart Session" aria-label="Restart Session">
            <i class="ri-refresh-line"></i> <span class="btn-text-desktop">Restart Session</span>
          </button>
          <button class="btn btn-secondary" id="backCatalogBtn" title="Back to Catalogue" aria-label="Back to Catalogue">
            <i class="ri-arrow-left-line"></i> <span class="btn-text-desktop">Back to Catalogue</span>
          </button>
        </div>
      </div>
    </div>
  `;let y={title:"Mastery Practice",description:""},o=[],d=[],v=1,p={},f={},g=0,w=0,m=0,b=null,z=!1,i=null,C=[],D=0,x={},E=null;const N=t.querySelector("#startScreen"),P=t.querySelector("#activeScreen"),H=t.querySelector("#completionScreen"),Z=t.querySelector("#startQuizBtn"),F=t.querySelector("#timerDisplay"),K=t.querySelector("#masteryStatus"),X=t.querySelector("#progressFill"),tt=t.querySelector("#qText"),B=t.querySelector("#qImg"),M=t.querySelector("#optionsContainer"),_=t.querySelector("#feedback"),et=t.querySelector("#fbHead"),O=t.querySelector("#fbCorrectAnswer"),W=t.querySelector("#fbExplain"),j=t.querySelector("#nextBtnContainer"),rt=t.querySelector("#nextQuestionBtn"),G=t.querySelector("#guestNoticeBanner"),U=t.querySelector("#guestSignInBtn");function V(e){const r=String(Math.floor(e/60)).padStart(2,"0"),n=String(e%60).padStart(2,"0");return`${r}:${n}`}function A(e){for(let r=e.length-1;r>0;r--){const n=Math.floor(Math.random()*(r+1));[e[r],e[n]]=[e[n],e[r]]}return e}async function it(){try{T&&T.isWeakArea?(y={title:"Weak Areas Targeted Quiz",description:"Personalized practice focusing on weak questions"},o=T.questions):(y=(await k.getQuiz(q)).quiz,o=(await k.getQuestions(q)).questions),t.querySelector("#quizTitleHeader").textContent=y.title,t.querySelector("#quizDescHeader").textContent=y.description||"Practice & repetition quiz mode.",t.querySelector("#totalQtyDisplay").textContent=o.length}catch(e){alert("Error loading quiz: "+e.message),Q("dashboard")}}function st(){const e=t.querySelector('input[name="mastery"]:checked');v=e?parseInt(e.value,10):1,p={},f={},x={},g=0,w=0,m=0,z=!1,o.forEach(r=>{p[r.id]=0,f[r.id]=0,x[r.id]=0}),d=o.map(r=>r.id),A(d)}Z.addEventListener("click",()=>{st(),N.style.display="none",P.style.display="block",m=0,F.textContent="00:00",b&&clearInterval(b),b=setInterval(()=>{m++,F.textContent=V(m)},1e3),Y(),L()});function L(){if(d.length===0){ot();return}const e=Math.floor(Math.random()*d.length),r=d[e];if(i=o.find(s=>s.id===r),!i){d.splice(e,1),L();return}z=!1,D=Date.now(),tt.innerHTML=R(i.question_text),i.image_path?(B.src=`/api/images/${i.image_path}`,B.style.display="block"):B.style.display="none";const n=["A","B","C","D","E","F"];M.innerHTML="";const l=(i.options||[]).map((s,u)=>({text:s,origIdx:u}));C=A([...l]),C.forEach((s,u)=>{const a=document.createElement("button");a.className="option-btn",a.innerHTML=`<span class="opt-label">${n[u]}</span><span class="opt-text">${R(s.text)}</span>`,a.addEventListener("click",()=>nt(u)),M.appendChild(a)}),_.className="feedback",O.textContent="",W.innerHTML="",j.style.display="none",$(t.querySelector("#questionCard"))}async function nt(e){if(z)return;z=!0;const r=Math.max(1,Math.round((Date.now()-D)/1e3));x[i.id]=(x[i.id]||0)+r;const n=M.querySelectorAll(".option-btn");n.forEach(c=>c.classList.add("disabled-opt"));const l=C[e],s=l&&l.origIdx===i.correct_answer_index,u=i.options[i.correct_answer_index];if(n.forEach((c,h)=>{const S=C[h];S&&S.origIdx===i.correct_answer_index&&c.classList.add("correct-opt"),h===e&&!s&&c.classList.add("wrong-opt")}),s){if(p[i.id]=(p[i.id]||0)+1,g++,p[i.id]>=v){const c=d.indexOf(i.id);c!==-1&&d.splice(c,1)}}else f[i.id]=(f[i.id]||0)+1,w++,A(d);_.className=`feedback visible ${s?"correct":"wrong"}`,et.textContent=s?"✅ Correct!":"❌ Incorrect",O.textContent=s?"":`Correct Answer: ${u}`,W.innerHTML=R(i.explanation||""),$(_),Y(),j.style.display="block",I()&&k.logQuestion({question_id:i.id,quiz_id:q||i.quiz_id,is_correct:s,time_spent_sec:r,selected_option_index:l?l.origIdx:0}).catch(console.error)}rt.addEventListener("click",()=>{L()});function Y(){const e=o.length;let r=0;o.forEach(l=>{(p[l.id]||0)>=v&&r++});const n=e>0?r/e*100:0;X.style.width=`${n}%`,K.textContent=`Mastered: ${r} / ${e}`}async function ot(){b&&clearInterval(b);const e=o.length,r=g+w,n=r>0?Math.round(g/r*100):0;t.querySelector("#statTotal").textContent=e,t.querySelector("#statAttempts").textContent=r,t.querySelector("#statCorrect").textContent=g,t.querySelector("#statWrong").textContent=w,t.querySelector("#statAccuracy").textContent=n+"%",t.querySelector("#statTime").textContent=V(m);const l=t.querySelector("#summaryTableBody");l.innerHTML="";const s={};if(o.forEach((a,c)=>{const h=p[a.id]||0,S=f[a.id]||0,at=h+S;s[a.id]={correct:h,wrong:S,time_spent:x[a.id]||0};const J=document.createElement("tr");J.innerHTML=`
        <td style="font-weight:600;">Q${c+1}: ${a.question_text.substring(0,45)}...</td>
        <td>${v}</td>
        <td><span class="role-badge user">${at} attempts</span></td>
        <td><span style="color:var(--success); font-weight:bold;">✅ Mastered</span></td>
      `,l.appendChild(J)}),$(l),E={quiz_id:q||(o[0]?o[0].quiz_id:1),score:e,total_questions:e,accuracy_pct:n,time_taken_sec:m,mastery_level:v,details_json:s},I()){G.style.display="none";try{await k.saveQuizAttempt(E)}catch(a){console.error("Failed to save quiz attempt:",a)}}else G.style.display="block";P.style.display="none",H.style.display="block"}return U&&U.addEventListener("click",()=>{Q("login")}),t.querySelector("#downloadPdfBtn").addEventListener("click",async()=>{const e=I()||{full_name:"Guest Student",email:"guest@example.com",role:"user"};await lt({user:e,quiz:y,attempt:E,questions:o})}),t.querySelector("#restartQuizBtn").addEventListener("click",()=>{H.style.display="none",N.style.display="block"}),t.querySelector("#backCatalogBtn").addEventListener("click",()=>{Q("dashboard")}),it(),t}export{pt as renderQuizView};
