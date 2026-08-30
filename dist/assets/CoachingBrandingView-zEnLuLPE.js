import{g as _}from"./index-BrA-5OY9.js";function P(r){const e=document.createElement("div");e.className="container page-view",e.style.maxWidth="1050px",e.style.padding="2rem 1rem";const l=_();if(!l||l.role!=="institute_admin"&&l.role!=="admin"&&l.role!=="super_admin")return alert("Access denied. Coaching Institute Admin privileges required."),r("dashboard"),e;e.innerHTML=`
    <!-- Header -->
    <div class="responsive-page-header">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-color, #111827); margin-bottom: 0.25rem;">
          🌐 Coaching Portal Branding & Customization
        </h1>
        <p style="color: var(--muted-text, #6b7280); font-size: 0.95rem;">
          Customize your student login portal, theme colors, and share your unique coaching URL with students.
        </p>
      </div>
      <button id="backToSettingsBtn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
        ← Back to Settings
      </button>
    </div>

    <!-- Main Grid -->
    <div class="settings-grid">
      
      <!-- Left Column: Shareable URLs & How it Works -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Shareable Links Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            🔗 Shareable Student Login URLs
          </h3>
          <p style="font-size: 0.85rem; color: var(--muted-text, #6b7280); margin-bottom: 1.25rem;">
            Share these unique URLs with your students so they can access your customized student login page.
          </p>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-color, #111827);">
              Subdomain URL (Recommended):
            </label>
            <div class="copy-url-group">
              <input type="text" id="branding-subdomain-url" class="form-input" readonly style="flex: 1; font-weight: 600; background: var(--bg-hover, #f3f4f6); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);" value="Loading...">
              <button type="button" id="btn-copy-subdomain" class="btn btn-primary" style="flex-shrink: 0; padding: 0.65rem 1rem;">Copy</button>
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-color, #111827);">
              Fallback Shareable Link:
            </label>
            <div class="copy-url-group">
              <input type="text" id="branding-fallback-url" class="form-input" readonly style="flex: 1; background: var(--bg-hover, #f3f4f6); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);" value="Loading...">
              <button type="button" id="btn-copy-fallback" class="btn btn-secondary" style="flex-shrink: 0; padding: 0.65rem 1rem;">Copy</button>
            </div>
          </div>

          <div style="padding: 1rem; background: rgba(79, 70, 229, 0.05); border-radius: 10px; border-left: 4px solid var(--primary-color, #4f46e5);">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary-color, #4f46e5); margin-bottom: 0.25rem;">💡 How Subdomains Work:</div>
            <p style="font-size: 0.82rem; color: var(--muted-text, #4b5563); margin: 0; line-height: 1.45;">
              When students open your unique URL, your custom logo, institute name, banner, and theme colors will load automatically on their login screen!
            </p>
          </div>
        </div>

        <!-- Portal Preview Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            👀 Live Branding Preview
          </h3>
          
          <div id="previewCard" style="padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color, #e5e7eb); background: var(--bg-card, #ffffff); text-align: center;">
            <div id="previewLogo" style="width: 50px; height: 50px; border-radius: 50%; background: #e0e7ff; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; overflow: hidden;">
              🎓
            </div>
            <h4 id="previewTitle" style="font-size: 1.1rem; font-weight: 800; color: var(--text-color, #111827); margin: 0 0 0.35rem 0;">
              Welcome to Your Institute
            </h4>
            <p id="previewSubtitle" style="font-size: 0.85rem; color: var(--muted-text, #6b7280); margin: 0 0 1rem 0;">
              Sign in to access your batch quizzes and study materials.
            </p>
            <button id="previewBtn" class="btn btn-primary" style="width: 100%; padding: 0.65rem; border-radius: 8px; font-weight: 600;">
              Sample Student Button
            </button>
          </div>
        </div>

      </div>

      <!-- Right Column: Portal Customization Form -->
      <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg, #ffffff); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border-color, #e5e7eb);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-color, #111827); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          🎨 Customize Portal Settings
        </h3>

        <form id="form-branding-page">
          <div id="brandingAlert" style="display: none; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;"></div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Institute Name *</label>
            <input type="text" id="brand-name" class="form-input" placeholder="e.g. Apex IAS Academy" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">URL Subdomain Slug *</label>
            <input type="text" id="brand-slug" class="form-input" placeholder="e.g. apex-academy" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            <small style="font-size: 0.75rem; color: var(--muted-text, #6b7280); display: block; margin-top: 0.25rem;">
              Unique subdomain prefix. Auto-slugified from institute name if blank.
            </small>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Institute Logo URL</label>
            <input type="url" id="brand-logo" class="form-input" placeholder="https://example.com/logo.png" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Primary Theme Color</label>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <input type="color" id="brand-color-picker" value="#4f46e5" style="width: 44px; height: 38px; border: none; border-radius: 6px; cursor: pointer;">
              <input type="text" id="brand-color" class="form-input" placeholder="#4f46e5" value="#4f46e5" style="flex: 1; font-family: monospace; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Login Welcome Heading</label>
            <input type="text" id="brand-title" class="form-input" placeholder="Welcome to Apex IAS Academy" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Login Subtitle / Description</label>
            <textarea id="brand-subtitle" class="form-input" rows="2" placeholder="Sign in to access your batch tests and practice quizzes." style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);"></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block;">Login Banner Image URL (Optional)</label>
            <input type="url" id="brand-banner" class="form-input" placeholder="https://example.com/banner.jpg" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color, #d1d5db);">
          </div>

          <div style="padding: 1rem; background: var(--bg-hover, #f9fafb); border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border-color, #e5e7eb);">
            <label style="display: flex; align-items: center; gap: 0.75rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; color: var(--text-color, #111827);">
              <input type="checkbox" id="brand-allow-global" checked style="width: 18px; height: 18px;">
              Show Super Admin Global Public Quizzes
            </label>
            <small style="display: block; margin-top: 0.35rem; color: var(--muted-text, #6b7280); font-size: 0.78rem; line-height: 1.4;">
              When checked, students can attempt global public mock tests alongside institute tests. Uncheck to restrict students strictly to your coaching content.
            </small>
          </div>

          <button type="submit" id="btn-save-branding" class="btn btn-primary" style="width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: 700;">
            💾 Save Portal Branding
          </button>
        </form>
      </div>

    </div>
  `;const g=e.querySelector("#backToSettingsBtn");g&&g.addEventListener("click",()=>r("student-settings"));const n=e.querySelector("#btn-copy-subdomain"),a=e.querySelector("#btn-copy-fallback"),s=e.querySelector("#branding-subdomain-url"),t=e.querySelector("#branding-fallback-url");n&&s&&n.addEventListener("click",()=>{navigator.clipboard.writeText(s.value),n.textContent="Copied! ✓",setTimeout(()=>n.textContent="Copy",2e3)}),a&&t&&a.addEventListener("click",()=>{navigator.clipboard.writeText(t.value),a.textContent="Copied! ✓",setTimeout(()=>a.textContent="Copy",2e3)});const c=e.querySelector("#brand-color-picker"),d=e.querySelector("#brand-color"),u=e.querySelector("#previewBtn"),b=e.querySelector("#previewLogo"),y=e.querySelector("#previewTitle"),C=e.querySelector("#previewSubtitle"),w=e.querySelector("#brand-name"),S=e.querySelector("#brand-title"),k=e.querySelector("#brand-subtitle"),q=e.querySelector("#brand-logo"),f=()=>{const i=d.value||"#4f46e5";u.style.backgroundColor=i,u.style.borderColor=i;const h=S.value||w.value||"Welcome to Your Institute";y.textContent=h;const x=k.value||"Sign in to access your batch quizzes and study materials.";C.textContent=x;const m=q.value;m?b.innerHTML=`<img src="${m}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`:b.innerHTML="🎓"};c&&d&&(c.addEventListener("input",i=>{d.value=i.target.value,f()}),d.addEventListener("input",i=>{c.value=i.target.value,f()})),[w,S,k,q].forEach(i=>{i&&i.addEventListener("input",f)}),T(e,l,f);const L=e.querySelector("#form-branding-page"),o=e.querySelector("#brandingAlert"),v=e.querySelector("#btn-save-branding");return L.addEventListener("submit",async i=>{i.preventDefault();try{v.disabled=!0,v.textContent="Saving...";const h=localStorage.getItem("token"),x={name:e.querySelector("#brand-name").value,slug:e.querySelector("#brand-slug").value,logo_url:e.querySelector("#brand-logo").value,primary_color:e.querySelector("#brand-color").value,welcome_title:e.querySelector("#brand-title").value,welcome_subtitle:e.querySelector("#brand-subtitle").value,banner_url:e.querySelector("#brand-banner").value,allow_global_content:e.querySelector("#brand-allow-global").checked},m=await fetch("/api/institutes/my-branding",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${h}`},body:JSON.stringify(x)}),p=await m.json();if(o.style.display="block",!m.ok)o.style.background="#fef2f2",o.style.color="#991b1b",o.textContent=p.error||"Failed to update portal branding.";else if(o.style.background="#ecfdf5",o.style.color="#065f46",o.textContent="✅ Portal branding updated successfully!",p.institute){e.querySelector("#brand-slug").value=p.institute.slug;const I=window.location.origin,B=window.location.port?`:${window.location.port}`:"",z=p.institute.slug||p.institute.code;s&&(s.value=`http://${z}.localhost${B}`),t&&(t.value=`${I}/?institute=${z}`)}}catch{o.style.display="block",o.style.background="#fef2f2",o.style.color="#991b1b",o.textContent="Network error updating portal branding."}finally{v.disabled=!1,v.textContent="💾 Save Portal Branding"}}),e}async function T(r,e,l){const g=localStorage.getItem("token"),n=e.institute_id;if(n)try{const a=await fetch(`/api/institutes/${n}`,{headers:{Authorization:`Bearer ${g}`}});if(!a.ok)return;const t=(await a.json()).institute;if(!t)return;const c=window.location.origin,d=window.location.port?`:${window.location.port}`:"",u=t.slug||t.code,b=r.querySelector("#branding-subdomain-url"),y=r.querySelector("#branding-fallback-url");b&&(b.value=`http://${u}.localhost${d}`),y&&(y.value=`${c}/?institute=${u}`),r.querySelector("#brand-name").value=t.name||"",r.querySelector("#brand-slug").value=t.slug||"",r.querySelector("#brand-logo").value=t.logo_url||"",r.querySelector("#brand-color").value=t.primary_color||"#4f46e5",r.querySelector("#brand-color-picker").value=t.primary_color||"#4f46e5",r.querySelector("#brand-title").value=t.welcome_title||"",r.querySelector("#brand-subtitle").value=t.welcome_subtitle||"",r.querySelector("#brand-banner").value=t.banner_url||"",r.querySelector("#brand-allow-global").checked=t.allow_global_content!==0,l()}catch(a){console.error("Error loading branding data:",a)}}export{P as renderCoachingBrandingView};
