import{j as B,E as O}from"./index-D_04MIJ9.js";import{renderMath as H}from"./katexRenderer-DzahxjNr.js";async function J({user:g,quiz:p,attempt:d,questions:E}){const i=document.createElement("div");i.style.position="fixed",i.style.left="-9999px",i.style.top="-9999px",i.style.width="800px",i.style.background="#ffffff",i.style.color="#0f172a",i.style.fontFamily="'Outfit', sans-serif, Arial",i.style.padding="40px",i.style.boxSizing="border-box";const _=new Date(d.created_at||Date.now()).toLocaleString(),u=`REP-${Math.floor(1e5+Math.random()*9e5)}`;let C="";Array.isArray(E)&&E.forEach((n,v)=>{const s=d.details_json&&d.details_json[n.id]||{},x=n.options?n.options[n.correct_answer_index]:"",y=s.selected_option!==void 0&&n.options?n.options[n.selected_option]:"N/A",c=s.time_spent||0,l=(s.correct||0)+(s.wrong||0);C+=`
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold;">Q${v+1}</td>
          <td style="padding: 10px;">${n.question_text||""}</td>
          <td style="padding: 10px; color: ${s.is_correct?"#059669":"#dc2626"};">${y}</td>
          <td style="padding: 10px; font-weight: 600;">${x}</td>
          <td style="padding: 10px;">${l>0?l:1}</td>
          <td style="padding: 10px;">${c}s</td>
        </tr>
      `}),i.innerHTML=`
    <div style="border-bottom: 3px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin: 0; color: #4f46e5; font-size: 24px;">📘 EdutorAi Pro Portal</h1>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Official Quiz Performance & Practice Activity Report</p>
      </div>
      <div style="text-align: right;">
        <span style="background: #eef2ff; color: #4f46e5; font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${u}</span>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Generated: ${_}</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #64748b;">👤 Student Profile</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Full Name:</strong> ${g.full_name||"N/A"}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${g.email||"N/A"}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>User Role:</strong> ${g.role||"user"}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #64748b;">🎯 Quiz Session Info</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Quiz Title:</strong> ${p.title||"Mastery Practice"}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${p.category_name||"General"}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Selected Mode:</strong> Mastery Level ${d.mastery_level||1}</p>
      </div>
    </div>

    <div style="background: #eef2ff; border-radius: 16px; padding: 20px; margin-bottom: 28px; display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 12px;">
      <div>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Accuracy</span>
        <div style="font-size: 24px; font-weight: bold; color: #047857;">${d.accuracy_pct}%</div>
      </div>
      <div>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Score</span>
        <div style="font-size: 24px; font-weight: bold; color: #4f46e5;">${d.score} / ${d.total_questions}</div>
      </div>
      <div>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Time Taken</span>
        <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${Math.floor((d.time_taken_sec||0)/60)}m ${(d.time_taken_sec||0)%60}s</div>
      </div>
      <div>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Mastery Status</span>
        <div style="font-size: 24px; font-weight: bold; color: #b45309;">COMPLETED</div>
      </div>
    </div>

    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">📊 Detailed Item Telemetry Table</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
      <thead>
        <tr style="background: #f1f5f9; color: #475569;">
          <th style="padding: 10px;">Item</th>
          <th style="padding: 10px;">Question</th>
          <th style="padding: 10px;">Your Choice</th>
          <th style="padding: 10px;">Correct Answer</th>
          <th style="padding: 10px;">Attempts</th>
          <th style="padding: 10px;">Time Spent</th>
        </tr>
      </thead>
      <tbody>
        ${C}
      </tbody>
    </table>

    <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
      EdutorAi Pro Portal — Practice & Mastery Learning System — Confidential & Verified Report
    </div>
  `,document.body.appendChild(i);try{H(i);const n=await B(i,{scale:2,useCORS:!0}),v=n.toDataURL("image/png"),s=new O("p","mm","a4"),x=210,y=297,c=n.height*x/n.width;let l=c,h=0;for(s.addImage(v,"PNG",0,h,x,c),l-=y;l>=0;)h=l-c,s.addPage(),s.addImage(v,"PNG",0,h,x,c),l-=y;const m=(p.title||"Quiz").replace(/[^a-z0-9]/gi,"_"),$=(g.full_name||"User").replace(/[^a-z0-9]/gi,"_");s.save(`Quiz_Report_${m}_${$}.pdf`)}catch(n){console.error("PDF Generation Error:",n),alert("Failed to generate PDF report. Please try again.")}finally{document.body.removeChild(i)}}async function X({quiz:g,questions:p}){if(!Array.isArray(p)||p.length===0){alert("No questions available in this quiz to generate a PDF booklet.");return}const d=new Date().toLocaleDateString(),E=["A","B","C","D","E","F"],i=document.createElement("div");i.style.position="fixed",i.style.left="-9999px",i.style.top="-9999px",i.style.width="800px";const _=()=>{const t=document.createElement("div");return t.className="pdf-page",t.style.width="800px",t.style.height="1130px",t.style.padding="32px 36px",t.style.boxSizing="border-box",t.style.background="#ffffff",t.style.color="#0f172a",t.style.fontFamily="'Outfit', sans-serif, Arial",t.style.position="relative",t.style.display="flex",t.style.flexDirection="column",t.style.justifyContent="space-between",t},u=[],C=930,n=120,v=45,s=document.createElement("div");s.style.cssText=`
    position: fixed; left: -9999px; top: -9999px;
    width: 356px; height: auto; visibility: hidden;
    font-family: 'Outfit', sans-serif, Arial; font-size: 12px;
    box-sizing: border-box;
  `,document.body.appendChild(s);const x=[],y=[];p.forEach((t,o)=>{const e=document.createElement("div");e.style.cssText="margin-bottom: 14px; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; box-sizing: border-box;";const f=t.options||[];let r="";f.forEach((D,z)=>{r+=`
        <div style="display: flex; gap: 6px; align-items: baseline;">
          <strong style="color: #0d9488; min-width: 22px;">(${E[z]})</strong>
          <span>${D}</span>
        </div>
      `});let a="";t.image_path&&(a=`<div style="margin: 6px 0;"><img src="/api/images/${t.image_path}" style="max-width: 100%; max-height: 110px; border-radius: 6px; border: 1px solid #e2e8f0;" /></div>`),e.innerHTML=`
      <div style="font-weight: 700; font-size: 12.5px; margin-bottom: 5px; color: #0f172a; line-height: 1.35;">
        Q${o+1}. ${t.question_text}
      </div>
      ${a}
      <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; margin-top: 5px; color: #334155;">
        ${r}
      </div>
    `,s.appendChild(e),H(e);const b=e.getBoundingClientRect().height||e.offsetHeight;s.removeChild(e),x.push(e),y.push(b+14)}),document.body.removeChild(s);const c=[];let l=[],h=[],m=0,$=0,S=!0;const j=t=>t?n:v,L=t=>C-j(t),M=()=>{c.push({left:l,right:h}),l=[],h=[],m=0,$=0,S=!1};p.forEach((t,o)=>{const e=y[o],f=L(S);if(m+e<=f)l.push(o),m+=e;else if($+e<=f)h.push(o),$+=e;else{M();const r=L(S);e<=r,l.push(o),m+=e}}),(l.length>0||h.length>0)&&M();const I=c.length;c.forEach((t,o)=>{const e=_(),r=o===0?`
      <div style="border-bottom: 3px solid #0d9488; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="margin: 0; color: #0d9488; font-size: 21px; font-weight: 800;">📘 EdutorAI Question Booklet</h1>
          <p style="margin: 3px 0 0 0; color: #475569; font-size: 13.5px; font-weight: 600;">${g.title||"Practice Quiz"}</p>
          <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11.5px;">Category: ${g.category_name||"General"} | Total Questions: ${p.length}</p>
        </div>
        <div style="text-align: right; font-size: 11.5px; color: #64748b;">
          <span style="background: #ccfbf1; color: #0f766e; font-weight: bold; padding: 4px 10px; border-radius: 12px;">Exam Booklet</span>
          <p style="margin: 4px 0 0 0;">Date: ${d}</p>
        </div>
      </div>
    `:`
      <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 14px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
        <span style="font-weight: 600; color: #0d9488;">📘 ${g.title||"Question Booklet"}</span>
        <span>Page ${o+1}</span>
      </div>
    `,a=`
      <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
        <span>EdutorAI Quiz Portal — Practice & Active Memory Booklet</span>
        <span>Page ${o+1}</span>
      </div>
    `;e.innerHTML=`
      <div style="flex: 1; overflow: hidden;">
        ${r}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start;">
          <div id="q-left-${o}" style="display: flex; flex-direction: column;"></div>
          <div id="q-right-${o}" style="display: flex; flex-direction: column;"></div>
        </div>
      </div>
      ${a}
    `,i.appendChild(e),u.push(e);const b=e.querySelector(`#q-left-${o}`),D=e.querySelector(`#q-right-${o}`);t.left.forEach(z=>b.appendChild(x[z])),t.right.forEach(z=>D.appendChild(x[z]))});const U=960,Q=80,P=document.createElement("div");P.style.cssText=`
    position: fixed; left: -9999px; top: -9999px;
    width: 728px; height: auto; visibility: hidden;
    font-family: 'Outfit', sans-serif, Arial; font-size: 11px;
  `;const T=document.createElement("table");T.style.cssText="width: 100%; border-collapse: collapse;",T.innerHTML=`
    <thead>
      <tr>
        <th style="width:45px; padding:7px 8px;"></th>
        <th style="width:165px; padding:7px 8px;"></th>
        <th style="padding:7px 8px;"></th>
      </tr>
    </thead>
    <tbody></tbody>
  `,P.appendChild(T),document.body.appendChild(P);const R=T.querySelector("tbody"),K=(t,o,e)=>`
    <div style="border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0; color: #0f766e; font-size: 17px; font-weight: 800;">🔑 Answer & Explanation Key ${o>1?`(Part ${t})`:""}</h2>
      <span style="font-size: 11px; color: #64748b; font-style: italic;">Official Answer Sheet</span>
    </div>
  `,F=[],N=[];p.forEach((t,o)=>{const e=t.options||[],f=e[t.correct_answer_index]!==void 0?`(${E[t.correct_answer_index]}) ${e[t.correct_answer_index]}`:"N/A",r=t.explanation||"No explanation provided.",a=document.createElement("tr");a.style.borderBottom="1px solid #e2e8f0",a.innerHTML=`
      <td style="padding: 7px 8px; font-weight: bold; width: 45px; text-align: center; vertical-align: top;">Q${o+1}</td>
      <td style="padding: 7px 8px; font-weight: 600; color: #047857; width: 165px; vertical-align: top;">${f}</td>
      <td style="padding: 7px 8px; color: #475569; vertical-align: top; line-height: 1.45;">${r}</td>
    `,R.appendChild(a),H(a);const b=a.getBoundingClientRect().height||a.offsetHeight;R.removeChild(a),F.push(a),N.push(b)}),document.body.removeChild(P);const G=30,A=[];let w=[],k=Q+G;N.forEach((t,o)=>{k+t>U&&w.length>0&&(A.push(w),w=[],k=Q+G),w.push(o),k+=t}),w.length>0&&A.push(w);const V=A.length;A.forEach((t,o)=>{const e=_(),f=I+o+1,r=o+1;e.innerHTML=`
      <div style="flex: 1; overflow: hidden;">
        ${K(r,V)}
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; background: #ffffff; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #f0fdfa; color: #0f766e; border-bottom: 2px solid #99f6e4;">
              <th style="padding: 7px 8px; text-align: center;">Item</th>
              <th style="padding: 7px 8px;">Correct Answer</th>
              <th style="padding: 7px 8px;">Explanation</th>
            </tr>
          </thead>
          <tbody id="ans-tbody-${o}"></tbody>
        </table>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
        <span>EdutorAI Quiz Portal — Practice & Active Memory Booklet</span>
        <span>Page ${f}</span>
      </div>
    `,i.appendChild(e),u.push(e);const a=e.querySelector(`#ans-tbody-${o}`);t.forEach(b=>{a.appendChild(F[b])})}),document.body.appendChild(i);try{H(i);const t=new O("p","mm","a4");for(let e=0;e<u.length;e++){e>0&&t.addPage();const r=(await B(u[e],{scale:2,useCORS:!0})).toDataURL("image/png");t.addImage(r,"PNG",0,0,210,297)}const o=(g.title||"Quiz").replace(/[^a-z0-9]/gi,"_");t.save(`Quiz_Booklet_${o}.pdf`)}catch(t){console.error("PDF Booklet Generation Error:",t),alert("Failed to generate PDF booklet. Please try again.")}finally{document.body.removeChild(i)}}export{X as d,J as g};
