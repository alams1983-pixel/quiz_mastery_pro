import{p as B,a as U}from"./csvJsonParser-BgyoB-dS.js";import{r as L,k as h}from"./index-BXctJt8i.js";const $=`You are an expert educational content author & AI question generator.
Generate high-quality multiple-choice questions (MCQs) complying strictly with the prescribed JSON schema below.

==================================================
1. INPUT PARAMETERS (FILL IN YOUR INFORMATION BELOW):
==================================================
- SOURCE MATERIAL / SYLLABUS / NOTES:
  [PASTE YOUR TEXT CONTENT, STUDY NOTES, OR LESSON SUMMARY HERE]

- TARGET LANGUAGES (Specify 1 to 4 languages):
  [SPECIFY LANGUAGES e.g. "English and Hindi", "English, Bengali and Gujarati", or "English"]
  Supported Language Codes:
  en: English | hi: Hindi (हिंदी) | bn: Bengali (বাংলা) | gu: Gujarati (ગુજરાતી) 
  mr: Marathi (मराठी) | ta: Tamil (தமிழ்) | te: Telugu (తెలుగు) | kn: Kannada (ಕನ್ನಡ)

- TOTAL QUESTIONS TO GENERATE:
  [NUMBER e.g. 10]

- CATEGORY / SUBJECT NAME:
  [CATEGORY e.g. "General Science" or "Mathematics"]

- DIFFICULTY LEVEL:
  [easy / medium / hard]

==================================================
2. STRICT JSON OUTPUT FORMAT SCHEMA:
==================================================
Return ONLY a valid JSON array of question objects matching this exact structure:

[
  {
    "category_name": "General Science",
    "tag_names": ["Physics", "SSC CGL"],
    "passage_text_en": "",
    "passage_image_url": "",
    "image_url": "",
    "difficulty": "medium",
    "correct_option_index": 0,
    "primary_language": "en",
    "available_languages": ["en", "bn"],
    "translations": {
      "en": {
        "question_text": "What is the SI unit of electric current?",
        "options": ["Ampere", "Volt", "Watt", "Joule"],
        "explanation": "Ampere is the SI unit of electric current."
      },
      "bn": {
        "question_text": "বিদ্যুৎ প্রবাহের এসআই একক কী?",
        "options": ["অ্যাম্পিয়ার", "ভোল্ট", "ওয়াট", "জুল"],
        "explanation": "বিদ্যুৎ প্রবাহের এসআই একক হল অ্যাম্পিয়ার।"
      }
    }
  }
]

==================================================
3. STRICT COMPLIANCE RULES FOR AI:
==================================================
1. Math Equations: Format all mathematical and scientific formulas using standard inline KaTeX math syntax enclosed in single dollar signs (e.g., $E = mc^2$, $a^2 + b^2 = c^2$, $\\frac{d}{dx}\\sin(x) = \\cos(x)$).
2. Multi-Language Translations: Ensure accuracy in translated question statements, choices, and explanations for each target language.
3. Choices Array: Each translation object must contain an array of exactly 4 choices (or 2 to 6 choices).
4. Correct Answer Index: "correct_option_index" must be 0-indexed (0 = 1st option, 1 = 2nd option, 2 = 3rd option, 3 = 4th option).
5. Output Formatting: Output MUST be ONLY valid raw JSON array text. Do NOT wrap in markdown \`\`\`json codeblocks, do NOT add introductory sentences, and do NOT include conversational remarks.`;async function G(){try{return await navigator.clipboard.writeText($),!0}catch{const i=document.createElement("textarea");i.value=$,document.body.appendChild(i),i.select();const g=document.execCommand("copy");return document.body.removeChild(i),g}}function O(l){try{const i=JSON.stringify(l);return btoa(unescape(encodeURIComponent(i)))}catch{return""}}function Q(l,i="exam_section",g,x){typeof i=="function"&&(x=g,g=i,i="exam_section");const r=document.createElement("div");r.className="modal-overlay fade-in",r.style.position="fixed",r.style.inset="0",r.style.background="rgba(0, 0, 0, 0.6)",r.style.backdropFilter="blur(4px)",r.style.zIndex="10000",r.style.display="flex",r.style.alignItems="center",r.style.justifyContent="center",r.style.padding="20px";let s=1,p=[],y=null,u=null;const A=`category_name,tag_names,passage_en,passage_bn,passage_image_url,question_en,question_bn,image_url,optionA_en,optionB_en,optionC_en,optionD_en,optionA_bn,optionB_bn,optionC_bn,optionD_bn,answer,explanation_en,explanation_bn,explanation_image_url,difficulty
"General Science","Physics,SSC CGL","Read the passage on Newton's Laws.","নিউটন এর গতির সূত্র বিষয়ক বিবরণটি পড়ো।","https://example.com/passage.jpg","Identify the synonym of 'Abundant'.","'Abundant' শব্দের সমার্থক শব্দ চিহ্নিত করো।","","Scarce","Plentiful","Meager","Lacking","দুর্লভ","প্রচুর","অল্প","ঘাটতি",1,"Plentiful means existing in large quantities.","Plentiful শব্দের অর্থ বিপুল পরিমানে থাকা।","",medium
"Mathematics","Algebra,Equations","","","","Solve $E = mc^2$ for $m$.","সমিবকরণ $E = mc^2$ এ $m$ এর মান বের করো।","","m = E/c^2","m = Ec^2","m = c^2/E","m = E - c^2","m = E/c^2","m = Ec^2","m = c^2/E","m = E - c^2",0,"Dividing both sides by c^2.","উভয় দিক c^2 দিয়ে ভাগ করে।","",hard`,N=JSON.stringify([{available_languages:["en","bn"],primary_language:"en",translations:{en:{question_text:`Consider the following statements regarding Rule 32:
1. Question Hour is the first hour.
2. Speaker can direct otherwise.`,options:["1 only","2 only","Both 1 and 2","Neither 1 nor 2"],explanation:"Both statements correctly reflect Rule 32 (Question Hour)."},bn:{question_text:`নিয়ম ৩২ সম্পর্কিত নিচের উক্তিগুলি বিবেচনা করুন:
১. প্রশ্ন কাল হল প্রথম ঘণ্টা।
২. অধ্যক্ষ অন্য নির্দেশ দিতে পারেন।`,options:["শুধুমাত্র ১","শুধুমাত্র ২","১ এবং ২ উভয়ই","১ বা ২ কোনোটিই নয়"],explanation:"উভয় উক্তিতেই নিয়ম ৩২ সঠিক প্রতিফলিত হয়েছে।"}},category_name:"General Science",tag_names:["Physics","Polity"],passage_text_en:"Rule 32: Unless the Speaker otherwise directs, the first hour of every sitting shall be available for questions.",passage_image_url:"https://example.com/passage_diagram.png",image_url:"https://example.com/question_diagram.png",correct_option_index:2,explanation_image_url:"https://example.com/explanation_chart.png",difficulty:"medium"}],null,2),a=document.createElement("div");a.className="card",a.style.width="100%",a.style.maxWidth="820px",a.style.maxHeight="90vh",a.style.overflowY="auto",a.style.padding="28px",a.style.background="var(--card-bg)",a.style.borderRadius="20px",a.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)";function m(){a.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">
            <i class="ri-file-upload-line" style="color: var(--primary);"></i> Multi-Language Bulk Question Wizard
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Step ${s} of 3 — Import KaTeX Math, Images & Passages</p>
        </div>
        <button id="close-wizard-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <!-- Step Indicator Bar -->
      <div style="display: flex; gap: 8px; margin-bottom: 24px;">
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${s>=1?"var(--primary)":"var(--border-color)"};"></div>
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${s>=2?"var(--primary)":"var(--border-color)"};"></div>
        <div style="flex: 1; height: 6px; border-radius: 3px; background: ${s>=3?"var(--primary)":"var(--border-color)"};"></div>
      </div>

      ${s===1?R():""}
      ${s===2?I():""}
      ${s===3?q():""}
    `,z()}function R(){return`
      <div style="margin-bottom: 20px;">
        <label class="form-label" style="margin-bottom: 8px; display: block;">Select or Drag CSV / JSON Question File:</label>
        <div id="drop-zone" style="border: 2px dashed var(--primary); border-radius: 14px; padding: 36px 20px; text-align: center; background: var(--primary-light); cursor: pointer; transition: all 0.2s;">
          <i class="ri-cloud-upload-line" style="font-size: 2.8rem; color: var(--primary); display: block; margin-bottom: 8px;"></i>
          <p style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 4px;">Click to Browse or Drag & Drop File</p>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Supports .csv and .json formats with 2-6 options, category, tags & image URLs</p>
          <input type="file" id="file-input" accept=".csv,.json" style="display: none;" />
        </div>
        ${y?`<div style="color: var(--danger); font-size: 0.85rem; margin-top: 10px; font-weight: 600;">⚠️ ${y}</div>`:""}
      </div>

      <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h4 style="font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: var(--primary);">📥 Download Templates & AI Question Creation:</h4>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
          <button id="dl-csv-sample" class="btn btn-outline btn-sm"><i class="ri-file-excel-line"></i> Download CSV Template</button>
          <button id="dl-json-sample" class="btn btn-outline btn-sm"><i class="ri-code-s-slash-line"></i> Download JSON Template</button>
          <button id="btn-copy-ai-prompt" class="btn btn-outline btn-ai-prompt btn-sm">
            <i class="ri-sparkling-fill"></i> 📋 Copy AI Prompt for Bulk Questions
          </button>
        </div>

        <div id="ai-prompt-instructions" style="display: none; background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: 10px; padding: 14px; margin-top: 10px; font-size: 0.83rem; color: var(--text-main);">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: var(--primary); margin-bottom: 6px; font-size: 0.9rem;">
            <i class="ri-checkbox-circle-fill"></i> Prompt Copied to Clipboard! How to use with ChatGPT / Claude / Gemini / DeepSeek:
          </div>
          <ol style="margin: 0; padding-left: 18px; line-height: 1.6;">
            <li>Open your preferred AI tool (ChatGPT, Claude, Gemini, or DeepSeek).</li>
            <li>Paste the copied prompt into the AI chat prompt box.</li>
            <li>Fill in the <strong>[FILL-IN-THE-BLANK]</strong> parameters with your source notes, preferred languages (e.g. <code>English and Hindi</code> or <code>Bengali</code>), total question count, category & difficulty.</li>
            <li>Copy the AI's JSON output response and save it on your computer as a <code>.json</code> file (e.g. <code>my_questions.json</code>).</li>
            <li>Upload the saved <code>.json</code> file right here in Step 1!</li>
          </ol>
        </div>
      </div>
    `}function I(){const o=u&&u.missingCategories||[],d=u&&(u.missingTags||u.newTagsToCreate)||[],n=o.length>0;return`
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-weight: 800; font-size: 1rem; color: var(--text-main);">
            Parsed Preview (${p.length} Questions Found)
          </h4>
          <span class="status-badge ${n?"status-inactive":"status-active"}">
            ${n?"⚠️ Category Action Required":"Valid & Ready"}
          </span>
        </div>

        ${n?`
          <div style="background: rgba(239, 68, 68, 0.1); border: 1.5px solid var(--danger); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="display:flex; align-items:center; gap:8px; color:var(--danger); font-weight:800; font-size:0.95rem; margin-bottom:6px;">
              <i class="ri-alert-line" style="font-size:1.2rem;"></i> Missing Category Warning
            </div>
            <p style="font-size:0.85rem; color:var(--text-main); margin-bottom:10px; line-height:1.4;">
              The uploaded file references categories that <strong>do not exist</strong> in your institute taxonomy. Please create these categories first in the <strong>Taxonomy Manager</strong> before proceeding.
            </p>

            <div style="margin-bottom:8px;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--danger); display:block; margin-bottom:4px;">Missing Categories (${o.length}):</span>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${o.map(e=>`<span class="badge-tag" style="background:rgba(239, 68, 68, 0.15); color:var(--danger); font-weight:700;">📂 ${e}</span>`).join("")}
              </div>
            </div>
          </div>
        `:""}

        ${d.length>0?`
          <div style="background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <div style="display:flex; align-items:center; gap:8px; color:var(--primary); font-weight:800; font-size:0.9rem; margin-bottom:4px;">
              <i class="ri-price-tag-3-line"></i> New Tags Auto-Creation
            </div>
            <p style="font-size:0.82rem; color:var(--text-main); margin-bottom:6px;">
              The following custom tags were found in your upload file and will be <strong>automatically added</strong> to your institute tags:
            </p>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${d.map(e=>`<span class="badge-tag" style="background:var(--bg-color); border:1px solid var(--border-color); font-weight:700;">🏷️ ${e}</span>`).join("")}
            </div>
          </div>
        `:""}

        <div style="overflow-x: auto; max-height: 280px; border: 1px solid var(--border-color); border-radius: 10px;">
          <table class="custom-table" style="width: 100%; font-size: 0.85rem;">
            <thead>
              <tr>
                <th>#</th>
                <th>Languages</th>
                <th>Category</th>
                <th>Question Statement</th>
                <th>Options</th>
                <th>Ans</th>
                <th>Passage</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              ${p.map((e,t)=>{var S,E,w,k,T,C;const c=e.available_languages||(e.translations_json?e.translations_json.available_languages:["en"]),b=e.primary_language||(e.translations_json?e.translations_json.primary_language:c[0]),_=e.question_text||e.question_text_en||((w=(E=(S=e.translations_json)==null?void 0:S.translations)==null?void 0:E[b])==null?void 0:w.question_text)||"Question Statement",P=e.options||e.options_en||((C=(T=(k=e.translations_json)==null?void 0:k.translations)==null?void 0:T[b])==null?void 0:C.options)||[],M=e.passage_text_en||e.passage_text_hi||e.passage_text;return`
                  <tr>
                    <td style="font-weight: 700;">${t+1}</td>
                    <td>
                      <div style="display:flex; gap:3px; flex-wrap:wrap;">
                        ${c.map(j=>`<span class="badge-tag" style="font-size:0.7rem; font-weight:800; background:var(--primary-light); color:var(--primary);">${j.toUpperCase()}</span>`).join("")}
                      </div>
                    </td>
                    <td><span class="badge-tag" style="font-size:0.75rem;">${e.category_name||"General"}</span></td>
                    <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${_}">${_}</td>
                    <td>${P.length} Choices (${b})</td>
                    <td style="font-weight: 700; color: var(--primary);">${e.correct_option_index}</td>
                    <td>${M?"📖 Yes":"-"}</td>
                    <td>${e.image_url||e.passage_image_url||e.explanation_image_url?"🖼️ Yes":"-"}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step1" class="btn btn-outline">← Back</button>
        <button id="btn-next-step3" class="btn btn-primary" ${n?'disabled title="Please create missing categories first"':""}>
          ${n?"⚠️ Fix Missing Categories First":"Proceed to Import →"}
        </button>
      </div>
    `}function q(){let o="Exam Section";return i==="quiz"&&(o="Practice Quiz"),i==="question_bank"&&(o="Master Question Repository"),`
      <div style="text-align: center; padding: 20px 0; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 12px;">
          <i class="ri-check-double-line"></i>
        </div>
        <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">Ready to Import ${p.length} Questions</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Questions will be added into ${o} ${l?`#${l}`:""} with multi-language support, KaTeX math & embedded image URLs.</p>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step2" class="btn btn-outline">← Back</button>
        <button id="btn-confirm-import" class="btn btn-primary" style="flex: 1;">Execute Bulk Import 🚀</button>
      </div>
    `}function z(){var o,d;if((o=a.querySelector("#close-wizard-btn"))==null||o.addEventListener("click",()=>{document.body.removeChild(r),x&&x()}),s===1){const n=a.querySelector("#drop-zone"),e=a.querySelector("#file-input");n.addEventListener("click",()=>e.click()),n.addEventListener("dragover",t=>{t.preventDefault(),n.style.background="var(--primary-border)"}),n.addEventListener("dragleave",()=>{n.style.background="var(--primary-light)"}),n.addEventListener("drop",t=>{t.preventDefault(),n.style.background="var(--primary-light)",t.dataTransfer.files.length>0&&f(t.dataTransfer.files[0])}),e.addEventListener("change",t=>{t.target.files.length>0&&f(t.target.files[0])}),a.querySelector("#dl-csv-sample").addEventListener("click",()=>v("ssc_questions_template.csv",A)),a.querySelector("#dl-json-sample").addEventListener("click",()=>v("ssc_questions_template.json",N)),(d=a.querySelector("#btn-copy-ai-prompt"))==null||d.addEventListener("click",async()=>{const t=a.querySelector("#btn-copy-ai-prompt"),c=a.querySelector("#ai-prompt-instructions");if(await G(),t){const b=t.innerHTML;t.innerHTML='<i class="ri-check-line"></i> Copied to Clipboard!',t.style.background="var(--success-light, #dcfce7)",t.style.color="var(--success, #16a34a)",t.style.borderColor="var(--success, #16a34a)",setTimeout(()=>{t.innerHTML=b,t.style.background="",t.style.color="",t.style.borderColor=""},3e3)}c&&(c.style.display="block",c.scrollIntoView({behavior:"smooth",block:"nearest"}))})}if(s===2){a.querySelector("#btn-back-step1").addEventListener("click",()=>{s=1,m()});const n=a.querySelector("#btn-next-step3");n&&!n.disabled&&n.addEventListener("click",()=>{s=3,m()})}s===3&&(a.querySelector("#btn-back-step2").addEventListener("click",()=>{s=2,m()}),a.querySelector("#btn-confirm-import").addEventListener("click",async()=>{const n=a.querySelector("#btn-confirm-import");n.disabled=!0,n.innerHTML="Importing Base64 Payload... ⏳";try{const e=i==="quiz"?`/quizzes/${l}/questions/bulk`:i==="question_bank"?"/exams/questions/bulk":`/exams/sections/${l}/questions/bulk`,t={questions:p,encodedPayload:O(p),section_id:i==="question_bank"?l:null};console.log("[DEBUG CLIENT] Sending Base64 bulk import request:",{endpoint:e,targetId:l,targetType:i,payloadLength:t.encodedPayload.length});const c=await L(e,{method:"POST",body:JSON.stringify(t)});console.log("[DEBUG CLIENT] Bulk import response:",c),h.invalidate(`questions_${l}`),h.invalidate("quizzes"),h.invalidate("questions"),alert(c.message),document.body.removeChild(r),g&&g(c)}catch(e){console.error("[DEBUG CLIENT] Bulk import error:",e),alert(e.message||"Bulk import failed."),n.disabled=!1,n.innerHTML="Execute Bulk Import (Base64 Encoded) 🚀"}}))}async function f(o){const d=new FileReader;d.onload=async n=>{try{const e=n.target.result;if(o.name.endsWith(".json")?p=B(e):p=U(e),p.length===0){y="No valid questions could be extracted from the file.",m();return}y=null,u=null;try{const t=await L("/exams/questions/validate-bulk",{method:"POST",body:JSON.stringify({encodedPayload:O(p)})});t.valid||(u={missingCategories:t.missingCategories||[],missingTags:t.missingTags||[]})}catch(t){console.warn("Pre-validation failed:",t)}s=2,m()}catch(e){y=e.message,m()}},d.readAsText(o)}function v(o,d){const n=new Blob([d],{type:"text/plain"}),e=URL.createObjectURL(n),t=document.createElement("a");t.href=e,t.download=o,t.click(),URL.revokeObjectURL(e)}r.appendChild(a),document.body.appendChild(r),m()}export{Q as renderBulkUploadModal};
