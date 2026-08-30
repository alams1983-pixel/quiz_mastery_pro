import{g as _}from"./index-nPeprFIn.js";function z(t){const e=window.location.hostname,l=window.location.protocol,d=window.location.port?`:${window.location.port}`:"";if(e==="localhost"||e==="127.0.0.1"||e.endsWith(".localhost"))return`${l}//${t}.localhost${d}`;const n=e.split(".");let o=e;return n.length>=2&&(o=n.slice(-2).join(".")),`${l}//${t}.${o}${d}`}function A(t){const e=document.createElement("div");e.className="container page-view",e.style.maxWidth="1050px",e.style.padding="2rem 1rem";const l=_();if(!l||l.role!=="institute_admin"&&l.role!=="admin"&&l.role!=="super_admin")return alert("Access denied. Coaching Institute Admin privileges required."),t("dashboard"),e;e.innerHTML=`
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
  `;const d=e.querySelector("#backToSettingsBtn");d&&d.addEventListener("click",()=>t("student-settings"));const n=e.querySelector("#btn-copy-subdomain"),o=e.querySelector("#btn-copy-fallback"),c=e.querySelector("#branding-subdomain-url"),r=e.querySelector("#branding-fallback-url");n&&c&&n.addEventListener("click",()=>{navigator.clipboard.writeText(c.value),n.textContent="Copied! ✓",setTimeout(()=>n.textContent="Copy",2e3)}),o&&r&&o.addEventListener("click",()=>{navigator.clipboard.writeText(r.value),o.textContent="Copied! ✓",setTimeout(()=>o.textContent="Copy",2e3)});const u=e.querySelector("#brand-color-picker"),s=e.querySelector("#brand-color"),b=e.querySelector("#previewBtn"),m=e.querySelector("#previewLogo"),C=e.querySelector("#previewTitle"),L=e.querySelector("#previewSubtitle"),x=e.querySelector("#brand-name"),w=e.querySelector("#brand-title"),S=e.querySelector("#brand-subtitle"),k=e.querySelector("#brand-logo"),y=()=>{const a=s.value||"#4f46e5";b.style.backgroundColor=a,b.style.borderColor=a;const v=w.value||x.value||"Welcome to Your Institute";C.textContent=v;const h=S.value||"Sign in to access your batch quizzes and study materials.";L.textContent=h;const p=k.value;p?m.innerHTML=`<img src="${p}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`:m.innerHTML="🎓"};u&&s&&(u.addEventListener("input",a=>{s.value=a.target.value,y()}),s.addEventListener("input",a=>{u.value=a.target.value,y()})),[x,w,S,k].forEach(a=>{a&&a.addEventListener("input",y)}),$(e,l,y);const I=e.querySelector("#form-branding-page"),i=e.querySelector("#brandingAlert"),f=e.querySelector("#btn-save-branding");return I.addEventListener("submit",async a=>{a.preventDefault();try{f.disabled=!0,f.textContent="Saving...";const v=localStorage.getItem("token"),h={name:e.querySelector("#brand-name").value,slug:e.querySelector("#brand-slug").value,logo_url:e.querySelector("#brand-logo").value,primary_color:e.querySelector("#brand-color").value,welcome_title:e.querySelector("#brand-title").value,welcome_subtitle:e.querySelector("#brand-subtitle").value,banner_url:e.querySelector("#brand-banner").value,allow_global_content:e.querySelector("#brand-allow-global").checked},p=await fetch("/api/institutes/my-branding",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${v}`},body:JSON.stringify(h)}),g=await p.json();if(i.style.display="block",!p.ok)i.style.background="#fef2f2",i.style.color="#991b1b",i.textContent=g.error||"Failed to update portal branding.";else if(i.style.background="#ecfdf5",i.style.color="#065f46",i.textContent="✅ Portal branding updated successfully!",g.institute){e.querySelector("#brand-slug").value=g.institute.slug;const B=window.location.origin,q=g.institute.slug||g.institute.code;c&&(c.value=z(q)),r&&(r.value=`${B}/?institute=${q}`)}}catch{i.style.display="block",i.style.background="#fef2f2",i.style.color="#991b1b",i.textContent="Network error updating portal branding."}finally{f.disabled=!1,f.textContent="💾 Save Portal Branding"}}),e}async function $(t,e,l){const d=localStorage.getItem("token"),n=e.institute_id;if(n)try{const o=await fetch(`/api/institutes/${n}`,{headers:{Authorization:`Bearer ${d}`}});if(!o.ok)return;const r=(await o.json()).institute;if(!r)return;const u=window.location.origin,s=r.slug||r.code,b=t.querySelector("#branding-subdomain-url"),m=t.querySelector("#branding-fallback-url");b&&(b.value=z(s)),m&&(m.value=`${u}/?institute=${s}`),t.querySelector("#brand-name").value=r.name||"",t.querySelector("#brand-slug").value=r.slug||"",t.querySelector("#brand-logo").value=r.logo_url||"",t.querySelector("#brand-color").value=r.primary_color||"#4f46e5",t.querySelector("#brand-color-picker").value=r.primary_color||"#4f46e5",t.querySelector("#brand-title").value=r.welcome_title||"",t.querySelector("#brand-subtitle").value=r.welcome_subtitle||"",t.querySelector("#brand-banner").value=r.banner_url||"",t.querySelector("#brand-allow-global").checked=r.allow_global_content!==0,l()}catch(o){console.error("Error loading branding data:",o)}}export{A as renderCoachingBrandingView};
