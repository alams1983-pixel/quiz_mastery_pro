function n({title:c,content:o,onClose:t}){const e=document.createElement("div");e.className="modal-overlay";const d=document.createElement("div");d.className="modal-card",d.innerHTML=`
    <div class="modal-header">
      <h2 style="font-size:1.3rem; font-weight:700;">${c}</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body"></div>
  `;const l=d.querySelector(".modal-body");return typeof o=="string"?l.innerHTML=o:o instanceof HTMLElement&&l.appendChild(o),d.querySelector(".modal-close").addEventListener("click",()=>{document.body.removeChild(e),t&&t()}),e.addEventListener("click",a=>{a.target===e&&(document.body.removeChild(e),t&&t())}),e.appendChild(d),document.body.appendChild(e),{close:()=>{document.body.contains(e)&&document.body.removeChild(e)}}}export{n as createModal};
