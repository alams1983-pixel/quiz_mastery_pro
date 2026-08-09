import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs';
import 'katex/dist/contrib/mhchem.mjs';

export function renderMath(container) {
  if (!container) return;
  
  const renderFn = typeof renderMathInElement === 'function' 
    ? renderMathInElement 
    : (window.renderMathInElement || null);

  if (!renderFn) return;

  try {
    renderFn(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '[math]', right: '[/math]', display: true }
      ],
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      throwOnError: false,
      errorColor: '#cc0000'
    });
  } catch (e) {
    console.warn('KaTeX rendering warning:', e);
  }
}

export function formatMathString(text) {
  if (!text) return '';
  return text;
}
