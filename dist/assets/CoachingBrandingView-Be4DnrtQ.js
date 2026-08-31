import{g as _}from"./index-CmO4Cwr9.js";function z(t){const e=window.location.hostname,n=window.location.protocol,d=window.location.port?`:${window.location.port}`:"";if(e==="localhost"||e==="127.0.0.1"||e.endsWith(".localhost"))return`${n}//${t}.localhost${d}`;const l=e.split(".");let o=e;return l.length>=2&&(o=l.slice(-2).join(".")),`${n}//${t}.${o}${d}`}function A(t){const e=document.createElement("div");e.className="container page-view",e.style.maxWidth="1050px",e.style.padding="2rem 1rem";const n=_();if(!n||n.role!=="institute_admin"&&n.role!=="admin"&&n.role!=="super_admin")return alert("Access denied. Coaching Institute Admin privileges required."),t("dashboard"),e;e.innerHTML=`
    <!-- Header -->
    <div class="responsive-page-header">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
          🌐 Coaching Portal Branding & Customization
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
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
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            🔗 Shareable Student Login URLs
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Share these unique URLs with your students so they can access your customized student login page.
          </p>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-main);">
              Subdomain URL (Recommended):
            </label>
            <div class="copy-url-group">
              <input type="text" id="branding-subdomain-url" class="form-input" readonly style="flex: 1; font-weight: 600; background: var(--bg-color); color: var(--text-main); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);" value="Loading...">
              <button type="button" id="btn-copy-subdomain" class="btn btn-primary" style="flex-shrink: 0; padding: 0.65rem 1rem;">Copy</button>
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-main);">
              Fallback Shareable Link:
            </label>
            <div class="copy-url-group">
              <input type="text" id="branding-fallback-url" class="form-input" readonly style="flex: 1; background: var(--bg-color); color: var(--text-main); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color);" value="Loading...">
              <button type="button" id="btn-copy-fallback" class="btn btn-secondary" style="flex-shrink: 0; padding: 0.65rem 1rem;">Copy</button>
            </div>
          </div>

          <div style="padding: 1rem; background: var(--primary-light); border-radius: 10px; border-left: 4px solid var(--primary);">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary); margin-bottom: 0.25rem;">💡 How Subdomains Work:</div>
            <p style="font-size: 0.82rem; color: var(--text-main); margin: 0; line-height: 1.45;">
              When students open your unique URL, your custom logo, institute name, banner, and theme colors will load automatically on their login screen!
            </p>
          </div>
        </div>

        <!-- Portal Preview Card -->
        <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            👀 Live Branding Preview
          </h3>
          
          <div id="previewCard" style="padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); background: var(--card-bg); text-align: center;">
            <div id="previewLogo" style="width: 50px; height: 50px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; overflow: hidden;">
              🎓
            </div>
            <h4 id="previewTitle" style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin: 0 0 0.35rem 0;">
              Welcome to Your Institute
            </h4>
            <p id="previewSubtitle" style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 1rem 0;">
              Sign in to access your batch quizzes and study materials.
            </p>
            <button id="previewBtn" class="btn btn-primary" style="width: 100%; padding: 0.65rem; border-radius: 8px; font-weight: 600;">
              Sample Student Button
            </button>
          </div>
        </div>

      </div>

      <!-- Right Column: Portal Customization Form -->
      <div class="card" style="padding: 1.5rem; border-radius: 12px; background: var(--card-bg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          🎨 Customize Portal Settings
        </h3>

        <form id="form-branding-page">
          <div id="brandingAlert" style="display: none; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;"></div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Institute Name *</label>
            <input type="text" id="brand-name" class="form-input" placeholder="e.g. Apex IAS Academy" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">URL Subdomain Slug *</label>
            <input type="text" id="brand-slug" class="form-input" placeholder="e.g. apex-academy" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
            <small style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.25rem;">
              Unique subdomain prefix. Auto-slugified from institute name if blank.
            </small>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Institute Logo URL</label>
            <input type="url" id="brand-logo" class="form-input" placeholder="https://example.com/logo.png" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Primary Theme Color</label>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <input type="color" id="brand-color-picker" value="#4f46e5" style="width: 44px; height: 38px; border: none; border-radius: 6px; cursor: pointer;">
              <input type="text" id="brand-color" class="form-input" placeholder="#4f46e5" value="#4f46e5" style="flex: 1; font-family: monospace; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Login Welcome Heading</label>
            <input type="text" id="brand-title" class="form-input" placeholder="Welcome to Apex IAS Academy" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Login Subtitle / Description</label>
            <textarea id="brand-subtitle" class="form-input" rows="2" placeholder="Sign in to access your batch tests and practice quizzes." style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);"></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--text-main);">Login Banner Image URL (Optional)</label>
            <input type="url" id="brand-banner" class="form-input" placeholder="https://example.com/banner.jpg" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
          </div>

          <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
            <label style="display: flex; align-items: center; gap: 0.75rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; color: var(--text-main);">
              <input type="checkbox" id="brand-allow-global" checked style="width: 18px; height: 18px;">
              Show Super Admin Global Public Quizzes
            </label>
            <small style="display: block; margin-top: 0.35rem; color: var(--text-muted); font-size: 0.78rem; line-height: 1.4;">
              When checked, students can attempt global public mock tests alongside institute tests. Uncheck to restrict students strictly to your coaching content.
            </small>
          </div>

          <button type="submit" id="btn-save-branding" class="btn btn-primary" style="width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: 700;">
            💾 Save Portal Branding
          </button>
        </form>
      </div>

    </div>
  `;const d=e.querySelector("#backToSettingsBtn");d&&d.addEventListener("click",()=>t("student-settings"));const l=e.querySelector("#btn-copy-subdomain"),o=e.querySelector("#btn-copy-fallback"),c=e.querySelector("#branding-subdomain-url"),r=e.querySelector("#branding-fallback-url");l&&c&&l.addEventListener("click",()=>{navigator.clipboard.writeText(c.value),l.textContent="Copied! ✓",setTimeout(()=>l.textContent="Copy",2e3)}),o&&r&&o.addEventListener("click",()=>{navigator.clipboard.writeText(r.value),o.textContent="Copied! ✓",setTimeout(()=>o.textContent="Copy",2e3)});const u=e.querySelector("#brand-color-picker"),s=e.querySelector("#brand-color"),m=e.querySelector("#previewBtn"),b=e.querySelector("#previewLogo"),C=e.querySelector("#previewTitle"),L=e.querySelector("#previewSubtitle"),x=e.querySelector("#brand-name"),w=e.querySelector("#brand-title"),k=e.querySelector("#brand-subtitle"),S=e.querySelector("#brand-logo"),y=()=>{const i=s.value||"#4f46e5";m.style.backgroundColor=i,m.style.borderColor=i;const f=w.value||x.value||"Welcome to Your Institute";C.textContent=f;const h=k.value||"Sign in to access your batch quizzes and study materials.";L.textContent=h;const p=S.value;p?b.innerHTML=`<img src="${p}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`:b.innerHTML="🎓"};u&&s&&(u.addEventListener("input",i=>{s.value=i.target.value,y()}),s.addEventListener("input",i=>{u.value=i.target.value,y()})),[x,w,k,S].forEach(i=>{i&&i.addEventListener("input",y)}),$(e,n,y);const I=e.querySelector("#form-branding-page"),a=e.querySelector("#brandingAlert"),v=e.querySelector("#btn-save-branding");return I.addEventListener("submit",async i=>{i.preventDefault();try{v.disabled=!0,v.textContent="Saving...";const f=localStorage.getItem("token"),h={name:e.querySelector("#brand-name").value,slug:e.querySelector("#brand-slug").value,logo_url:e.querySelector("#brand-logo").value,primary_color:e.querySelector("#brand-color").value,welcome_title:e.querySelector("#brand-title").value,welcome_subtitle:e.querySelector("#brand-subtitle").value,banner_url:e.querySelector("#brand-banner").value,allow_global_content:e.querySelector("#brand-allow-global").checked},p=await fetch("/api/institutes/my-branding",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify(h)}),g=await p.json();if(a.style.display="block",!p.ok)a.style.background="#fef2f2",a.style.color="#991b1b",a.textContent=g.error||"Failed to update portal branding.";else if(a.style.background="#ecfdf5",a.style.color="#065f46",a.textContent="✅ Portal branding updated successfully!",g.institute){e.querySelector("#brand-slug").value=g.institute.slug;const B=window.location.origin,q=g.institute.slug||g.institute.code;c&&(c.value=z(q)),r&&(r.value=`${B}/?institute=${q}`)}}catch{a.style.display="block",a.style.background="#fef2f2",a.style.color="#991b1b",a.textContent="Network error updating portal branding."}finally{v.disabled=!1,v.textContent="💾 Save Portal Branding"}}),e}async function $(t,e,n){const d=localStorage.getItem("token"),l=e.institute_id;if(l)try{const o=await fetch(`/api/institutes/${l}`,{headers:{Authorization:`Bearer ${d}`}});if(!o.ok)return;const r=(await o.json()).institute;if(!r)return;const u=window.location.origin,s=r.slug||r.code,m=t.querySelector("#branding-subdomain-url"),b=t.querySelector("#branding-fallback-url");m&&(m.value=z(s)),b&&(b.value=`${u}/?institute=${s}`),t.querySelector("#brand-name").value=r.name||"",t.querySelector("#brand-slug").value=r.slug||"",t.querySelector("#brand-logo").value=r.logo_url||"",t.querySelector("#brand-color").value=r.primary_color||"#4f46e5",t.querySelector("#brand-color-picker").value=r.primary_color||"#4f46e5",t.querySelector("#brand-title").value=r.welcome_title||"",t.querySelector("#brand-subtitle").value=r.welcome_subtitle||"",t.querySelector("#brand-banner").value=r.banner_url||"",t.querySelector("#brand-allow-global").checked=r.allow_global_content!==0,n()}catch(o){console.error("Error loading branding data:",o)}}export{A as renderCoachingBrandingView};
