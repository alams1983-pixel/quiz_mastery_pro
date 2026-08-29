import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/mhchem.mjs';
import { renderMath } from './katexRenderer.js';

/**
 * Format math delimiters. If string contains raw un-delimited LaTeX commands
 * (e.g. \vec, \frac, \begin{matrix}, \mathbf, \int, \sqrt) and no $, wrap them in $.
 */
export function formatMathDelimiters(text) {
  if (!text || typeof text !== 'string') return text || '';

  // If already contains math delimiters, return as-is
  if (text.includes('$') || text.includes('\\(') || text.includes('\\[')) {
    return text;
  }

  // Auto-wrap standalone LaTeX expressions starting with backslash math commands
  const latexPattern = /\\(?:vec|frac|begin|matrix|bmatrix|pmatrix|mathbf|math\w+|int|sum|lim|sqrt|left|alpha|beta|gamma|delta|theta|pi|lambda|sigma|omega|hat|bar|ddot|dot)\b/i;

  if (latexPattern.test(text)) {
    // If text is primarily a LaTeX expression, wrap it in $
    return `$${text.trim()}$`;
  }

  return text;
}

/**
 * Render rich content and inline/block math.
 * Converts LaTeX formulas to KaTeX HTML markup.
 */
export function renderRichContent(rawText) {
  if (!rawText) return '';
  if (typeof rawText !== 'string') return String(rawText);

  let text = formatMathDelimiters(rawText);

  // 1. Process Block Math $$ ... $$ or \[ ... \]
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    try {
      return `<div class="katex-block-expr">${katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return match;
    }
  });

  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (match, expr) => {
    try {
      return `<div class="katex-block-expr">${katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return match;
    }
  });

  // 2. Process Inline Math $ ... $ or \( ... \)
  text = text.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // 3. Convert line breaks to <br/>
  text = text.replace(/\r?\n/g, '<br/>');

  return text;
}

export function attachRichContent(element, rawText) {
  if (!element) return;
  element.innerHTML = renderRichContent(rawText);
  renderMath(element);
}
