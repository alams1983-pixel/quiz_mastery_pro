import katex from 'katex';
import 'katex/dist/katex.min.css';

export function unescapeBackslashes(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\\\\/g, '\\')
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function renderRichContent(rawText) {
  if (!rawText) return '';
  if (typeof rawText !== 'string') return String(rawText);

  let cleaned = unescapeBackslashes(rawText);

  // 1. Process Block Math $$ ... $$
  cleaned = cleaned.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    try {
      return `<div class="katex-block-expr">${katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return `<span class="katex-error">${expr}</span>`;
    }
  });

  // 2. Process Inline Math $ ... $ or \( ... \)
  cleaned = cleaned.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return `<span class="katex-error">${expr}</span>`;
    }
  });

  cleaned = cleaned.replace(/\\\(([\s\S]+?)\\\)/g, (match, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return `<span class="katex-error">${expr}</span>`;
    }
  });

  // 3. Convert all line breaks to <br/>
  cleaned = cleaned.replace(/\r?\n/g, '<br/>');

  return cleaned;
}

export function attachRichContent(element, rawText) {
  if (!element) return;
  element.innerHTML = renderRichContent(rawText);
}
