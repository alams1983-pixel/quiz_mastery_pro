export function createModal({ title, content, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const card = document.createElement('div');
  card.className = 'modal-card';

  card.innerHTML = `
    <div class="modal-header">
      <h2 style="font-size:1.3rem; font-weight:700;">${title}</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body"></div>
  `;

  const bodyEl = card.querySelector('.modal-body');
  if (typeof content === 'string') {
    bodyEl.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    bodyEl.appendChild(content);
  }

  const closeBtn = card.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    if (onClose) onClose();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
      if (onClose) onClose();
    }
  });

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  return {
    close: () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
  };
}
