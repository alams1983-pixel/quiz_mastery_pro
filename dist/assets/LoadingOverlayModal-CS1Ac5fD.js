let o=null;function p(e="Loading Data...",s="Please wait while we process your request..."){d();const t=document.createElement("div");t.id="global-loading-overlay",t.className="fade-in",t.style.cssText=`
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;const n=document.createElement("div");if(n.style.cssText=`
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border-color, #e2e8f0);
    border-radius: 20px;
    padding: 36px 44px;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    max-width: 420px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  `,n.innerHTML=`
    <div style="position: relative; width: 64px; height: 64px;">
      <div style="
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 4px solid var(--primary-light, rgba(59, 130, 246, 0.2));
        border-top-color: var(--primary, #3b82f6);
        animation: spin-loading 0.8s linear infinite;
      "></div>
      <div style="
        position: absolute;
        inset: 8px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-bottom-color: var(--accent, #a855f7);
        animation: spin-loading 1.2s linear infinite reverse;
      "></div>
      <div style="
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        color: var(--primary, #3b82f6);
      ">
        📚
      </div>
    </div>

    <div>
      <h3 id="loading-overlay-title" style="font-size: 1.15rem; font-weight: 800; color: var(--text-main, #0f172a); margin-bottom: 6px;">
        ${e}
      </h3>
      <p id="loading-overlay-subtitle" style="font-size: 0.88rem; color: var(--text-muted, #64748b); margin: 0; line-height: 1.4;">
        ${s}
      </p>
    </div>
  `,!document.getElementById("style-loading-spin")){const i=document.createElement("style");i.id="style-loading-spin",i.innerHTML=`
      @keyframes spin-loading {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,document.head.appendChild(i)}return t.appendChild(n),document.body.appendChild(t),o=t,{updateMessage:(i,r)=>{const a=n.querySelector("#loading-overlay-title"),l=n.querySelector("#loading-overlay-subtitle");a&&i&&(a.textContent=i),l&&r&&(l.textContent=r)},hide:d}}function d(){const e=document.getElementById("global-loading-overlay");e&&e.parentNode&&e.parentNode.removeChild(e),o&&o.parentNode&&o.parentNode.removeChild(o),o=null}export{d as h,p as s};
