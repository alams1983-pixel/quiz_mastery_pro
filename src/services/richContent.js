import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/mhchem.mjs';

/**
 * Safely unescape literal string escape sequences without corrupting LaTeX backslash commands.
 * Preserves \text, \tan, \theta, \right, \rho, \rightarrow, and double backslashes \\.
 */
export function unescapeBackslashes(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Render math expressions and rich text formatting into clean HTML using KaTeX.
 * Supports:
 * - Block Math: $$ ... $$ and \[ ... \]
 * - Inline Math: $ ... $ and \( ... \)
 * - Un-delimited LaTeX commands: \vec, \frac, \left, \begin, \mathbf, \int, \sum, \sqrt, \alpha, \beta, \theta, etc.
 */
export function renderRichContent(rawText) {
  if (!rawText) return '';
  if (typeof rawText !== 'string') return String(rawText);

  let cleaned = unescapeBackslashes(rawText);

  // 1. Process Block Math $$ ... $$ or \[ ... \]
  cleaned = cleaned.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    try {
      return `<div class="katex-block-expr">${katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return match;
    }
  });

  cleaned = cleaned.replace(/\\\[([\s\S]+?)\\\]/g, (match, expr) => {
    try {
      return `<div class="katex-block-expr">${katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return match;
    }
  });

  // 2. Process Inline Math $ ... $ or \( ... \)
  cleaned = cleaned.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  cleaned = cleaned.replace(/\\\(([\s\S]+?)\\\)/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // 3. Auto-detect un-delimited LaTeX expressions (e.g. \vec{F}(x)=..., \mathbf{a}=..., \int_1^4...)
  const rawLatexRegex = /(\\(?:vec|frac|left|begin|mathbf|math\w+|int|sum|lim|sqrt|alpha|beta|gamma|delta|theta|pi|lambda|sigma|omega|hat|bar|ddot|dot|tan|sin|cos|log|ln|text|times|div|cdot|pm|infty)\b(?:[^{}\s\n]|\{[^{}]*\}|\[[^\]]*\])*)/g;

  cleaned = cleaned.replace(rawLatexRegex, (match, expr) => {
    // Skip if already inside rendered KaTeX HTML span
    if (match.includes('class="katex"') || match.includes('katex-mathml')) return match;
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // 4. Convert all line breaks to <br/>
  cleaned = cleaned.replace(/\r?\n/g, '<br/>');

  return cleaned;
}

export function attachRichContent(element, rawText) {
  if (!element) return;
  element.innerHTML = renderRichContent(rawText);
}
