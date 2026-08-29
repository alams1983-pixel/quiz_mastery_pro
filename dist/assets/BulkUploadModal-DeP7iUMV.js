import{p as q,a as z}from"./csvJsonParser-Cmc2jVv8.js";import{r as f,e as y}from"./index-Dj_OHbJk.js";function v(c){try{const d=JSON.stringify(c);return btoa(unescape(encodeURIComponent(d)))}catch{return""}}function B(c,d="exam_section",u,b){typeof d=="function"&&(b=u,u=d,d="exam_section");const o=document.createElement("div");o.className="modal-overlay fade-in",o.style.position="fixed",o.style.inset="0",o.style.background="rgba(0, 0, 0, 0.6)",o.style.backdropFilter="blur(4px)",o.style.zIndex="10000",o.style.display="flex",o.style.alignItems="center",o.style.justifyContent="center",o.style.padding="20px";let s=1,p=[],g=null,a=null;const _=`category_name,tag_names,passage_en,passage_hi,passage_image_url,question_en,question_hi,image_url,optionA_en,optionB_en,optionC_en,optionD_en,optionA_hi,optionB_hi,optionC_hi,optionD_hi,answer,explanation_en,explanation_hi,explanation_image_url,difficulty
"General Science","Physics,SSC CGL","Read the passage on Newton's Laws.","न्यूटन के नियमों पर गद्यांश पढ़ें।","https://example.com/passage.jpg","Identify the synonym of 'Abundant'.","'Abundant' का पर्यायवाची शब्द पहचानें।","","Scarce","Plentiful","Meager","Lacking","दुर्लभ","प्रचुर","अल्प","कमी",1,"Plentiful means existing in large quantities.","Plentiful का अर्थ है बड़ी मात्रा में मौजूद।","",medium
"Mathematics","Algebra,Equations","","Solve $E = mc^2$ for $m$.","समीकरण $E = mc^2$ में $m$ का मान बताएं।","","m = E/c^2","m = Ec^2","m = c^2/E","m = E - c^2","","","","",0,"Dividing both sides by c^2.","दोनों पक्षों को c^2 से विभाजित करना।","",hard`,k=JSON.stringify([{category_name:"General Science",tag_names:["Physics","SSC CGL"],passage_text_en:"Rule 32: Unless the Speaker otherwise directs, the first hour of every sitting shall be available for questions.",passage_text_hi:"नियम 32: जब तक अध्यक्ष अन्यथा निर्देश न दें, प्रत्येक बैठक का प्रथम घंटा प्रश्नों के लिए उपलब्ध होगा।",passage_image_url:"https://example.com/passage_diagram.png",question_text_en:`Consider the following statements regarding Rule 32:
1. Question Hour is the first hour.
2. Speaker can direct otherwise.`,question_text_hi:`नियम 32 के संबंध में कथनों पर विचार कीजिए:
1. प्रश्न काल पहला घंटा है।
2. अध्यक्ष अन्यथा निर्देश दे सकते हैं।`,image_url:"https://example.com/question_diagram.png",options_en:["1 only","2 only","Both 1 and 2","Neither 1 nor 2"],options_hi:["केवल 1","केवल 2","1 और 2 दोनों","न तो 1 और न ही 2"],options_images:["","","",""],correct_option_index:2,explanation_en:"Both statements correctly reflect Rule 32 (Question Hour).",explanation_hi:"दोनों कथन नियम 32 (प्रश्न काल) को सही रूप से दर्शाते हैं।",explanation_image_url:"https://example.com/explanation_chart.png",difficulty:"medium"}],null,2),t=document.createElement("div");t.className="card",t.style.width="100%",t.style.maxWidth="820px",t.style.maxHeight="90vh",t.style.overflowY="auto",t.style.padding="28px",t.style.background="var(--card-bg)",t.style.borderRadius="20px",t.style.boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)";function m(){t.innerHTML=`
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

      ${s===1?w():""}
      ${s===2?S():""}
      ${s===3?$():""}
    `,E()}function w(){return`
      <div style="margin-bottom: 20px;">
        <label class="form-label" style="margin-bottom: 8px; display: block;">Select or Drag CSV / JSON Question File:</label>
        <div id="drop-zone" style="border: 2px dashed var(--primary); border-radius: 14px; padding: 36px 20px; text-align: center; background: var(--primary-light); cursor: pointer; transition: all 0.2s;">
          <i class="ri-cloud-upload-line" style="font-size: 2.8rem; color: var(--primary); display: block; margin-bottom: 8px;"></i>
          <p style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 4px;">Click to Browse or Drag & Drop File</p>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Supports .csv and .json formats with 2-6 options, category, tags & image URLs</p>
          <input type="file" id="file-input" accept=".csv,.json" style="display: none;" />
        </div>
        ${g?`<div style="color: var(--danger); font-size: 0.85rem; margin-top: 10px; font-weight: 600;">⚠️ ${g}</div>`:""}
      </div>

      <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h4 style="font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: var(--primary);">📥 Download Sample Templates:</h4>
        <div style="display: flex; gap: 12px;">
          <button id="dl-csv-sample" class="btn btn-outline btn-sm"><i class="ri-file-excel-line"></i> Download CSV Template</button>
          <button id="dl-json-sample" class="btn btn-outline btn-sm"><i class="ri-code-s-slash-line"></i> Download JSON Template</button>
        </div>
      </div>
    `}function S(){const n=a&&(a.missingCategories&&a.missingCategories.length>0||a.missingTags&&a.missingTags.length>0);return`
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-weight: 800; font-size: 1rem; color: var(--text-main);">
            Parsed Preview (${p.length} Questions Found)
          </h4>
          <span class="status-badge ${n?"status-inactive":"status-active"}">
            ${n?"⚠️ Action Required":"Valid & Ready"}
          </span>
        </div>

        ${n?`
          <div style="background: rgba(239, 68, 68, 0.1); border: 1.5px solid var(--danger); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="display:flex; align-items:center; gap:8px; color:var(--danger); font-weight:800; font-size:0.95rem; margin-bottom:6px;">
              <i class="ri-alert-line" style="font-size:1.2rem;"></i> Taxonomy Pre-Validation Warning
            </div>
            <p style="font-size:0.85rem; color:var(--text-main); margin-bottom:10px; line-height:1.4;">
              The uploaded file references categories or tags that <strong>do not exist</strong> in your institute taxonomy. Please create these items first in the <strong>Taxonomy Manager</strong> before proceeding.
            </p>

            ${a.missingCategories&&a.missingCategories.length>0?`
              <div style="margin-bottom:8px;">
                <span style="font-size:0.8rem; font-weight:700; color:var(--danger); display:block; margin-bottom:4px;">Missing Categories (${a.missingCategories.length}):</span>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  ${a.missingCategories.map(e=>`<span class="badge-tag" style="background:rgba(239, 68, 68, 0.15); color:var(--danger); font-weight:700;">📂 ${e}</span>`).join("")}
                </div>
              </div>
            `:""}

            ${a.missingTags&&a.missingTags.length>0?`
              <div>
                <span style="font-size:0.8rem; font-weight:700; color:var(--danger); display:block; margin-bottom:4px;">Missing Tags (${a.missingTags.length}):</span>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  ${a.missingTags.map(e=>`<span class="badge-tag" style="background:rgba(239, 68, 68, 0.15); color:var(--danger); font-weight:700;">🏷️ ${e}</span>`).join("")}
                </div>
              </div>
            `:""}
          </div>
        `:""}

        <div style="overflow-x: auto; max-height: 280px; border: 1px solid var(--border-color); border-radius: 10px;">
          <table class="custom-table" style="width: 100%; font-size: 0.85rem;">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Question (EN)</th>
                <th>Options</th>
                <th>Ans</th>
                <th>Passage</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              ${p.map((e,r)=>`
                <tr>
                  <td style="font-weight: 700;">${r+1}</td>
                  <td><span class="badge-tag" style="font-size:0.75rem;">${e.category_name||"General"}</span></td>
                  <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.question_text_en}</td>
                  <td>${(e.options_en||[]).length} Choices</td>
                  <td style="font-weight: 700; color: var(--primary);">${e.correct_option_index}</td>
                  <td>${e.passage_text_en?"📖 Yes":"-"}</td>
                  <td>${e.image_url||e.passage_image_url||e.explanation_image_url?"🖼️ Yes":"-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step1" class="btn btn-outline">← Back</button>
        <button id="btn-next-step3" class="btn btn-primary" ${n?'disabled title="Please create missing categories/tags first"':""}>
          ${n?"⚠️ Fix Missing Taxonomy First":"Proceed to Import →"}
        </button>
      </div>
    `}function $(){let n="Exam Section";return d==="quiz"&&(n="Practice Quiz"),d==="question_bank"&&(n="Master Question Repository"),`
      <div style="text-align: center; padding: 20px 0; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 12px;">
          <i class="ri-check-double-line"></i>
        </div>
        <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">Ready to Import ${p.length} Questions</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Questions will be added into ${n} ${c?`#${c}`:""} with multi-language support, KaTeX math & embedded image URLs.</p>
      </div>

      <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button id="btn-back-step2" class="btn btn-outline">← Back</button>
        <button id="btn-confirm-import" class="btn btn-primary" style="flex: 1;">Execute Bulk Import (Base64 Encoded) 🚀</button>
      </div>
    `}function E(){var n;if((n=t.querySelector("#close-wizard-btn"))==null||n.addEventListener("click",()=>{document.body.removeChild(o),b&&b()}),s===1){const e=t.querySelector("#drop-zone"),r=t.querySelector("#file-input");e.addEventListener("click",()=>r.click()),e.addEventListener("dragover",i=>{i.preventDefault(),e.style.background="var(--primary-border)"}),e.addEventListener("dragleave",()=>{e.style.background="var(--primary-light)"}),e.addEventListener("drop",i=>{i.preventDefault(),e.style.background="var(--primary-light)",i.dataTransfer.files.length>0&&x(i.dataTransfer.files[0])}),r.addEventListener("change",i=>{i.target.files.length>0&&x(i.target.files[0])}),t.querySelector("#dl-csv-sample").addEventListener("click",()=>h("ssc_questions_template.csv",_)),t.querySelector("#dl-json-sample").addEventListener("click",()=>h("ssc_questions_template.json",k))}if(s===2){t.querySelector("#btn-back-step1").addEventListener("click",()=>{s=1,m()});const e=t.querySelector("#btn-next-step3");e&&!e.disabled&&e.addEventListener("click",()=>{s=3,m()})}s===3&&(t.querySelector("#btn-back-step2").addEventListener("click",()=>{s=2,m()}),t.querySelector("#btn-confirm-import").addEventListener("click",async()=>{const e=t.querySelector("#btn-confirm-import");e.disabled=!0,e.innerHTML="Importing Base64 Payload... ⏳";try{const r=d==="quiz"?`/quizzes/${c}/questions/bulk`:d==="question_bank"?"/exams/questions/bulk":`/exams/sections/${c}/questions/bulk`,i={questions:p,encodedPayload:v(p),section_id:d==="question_bank"?c:null};console.log("[DEBUG CLIENT] Sending Base64 bulk import request:",{endpoint:r,targetId:c,targetType:d,payloadLength:i.encodedPayload.length});const l=await f(r,{method:"POST",body:JSON.stringify(i)});console.log("[DEBUG CLIENT] Bulk import response:",l),y.invalidate(`questions_${c}`),y.invalidate("quizzes"),y.invalidate("questions"),alert(l.message),document.body.removeChild(o),u&&u(l)}catch(r){console.error("[DEBUG CLIENT] Bulk import error:",r),alert(r.message||"Bulk import failed."),e.disabled=!1,e.innerHTML="Execute Bulk Import (Base64 Encoded) 🚀"}}))}async function x(n){const e=new FileReader;e.onload=async r=>{try{const i=r.target.result;if(n.name.endsWith(".json")?p=q(i):p=z(i),p.length===0){g="No valid questions could be extracted from the file.",m();return}g=null,a=null;try{const l=await f("/exams/questions/validate-bulk",{method:"POST",body:JSON.stringify({encodedPayload:v(p)})});l.valid||(a={missingCategories:l.missingCategories||[],missingTags:l.missingTags||[]})}catch(l){console.warn("Pre-validation failed:",l)}s=2,m()}catch(i){g=i.message,m()}},e.readAsText(n)}function h(n,e){const r=new Blob([e],{type:"text/plain"}),i=URL.createObjectURL(r),l=document.createElement("a");l.href=i,l.download=n,l.click(),URL.revokeObjectURL(i)}o.appendChild(t),document.body.appendChild(o),m()}export{B as renderBulkUploadModal};
