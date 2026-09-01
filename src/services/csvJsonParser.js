export function cleanAndParseJSON(jsonString) {
  if (typeof jsonString !== 'string') return jsonString;

  try {
    return JSON.parse(jsonString);
  } catch (initialErr) {
    let cleaned = jsonString;
    cleaned = cleaned.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    cleaned = cleaned.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');
    cleaned = cleaned.replace(/,(\s*[\}\]])/g, '$1');

    try {
      return JSON.parse(cleaned);
    } catch (secondErr) {
      try {
        const relaxedCleaned = cleaned
          .replace(/'/g, '"')
          .replace(/,\s*([\}\]])/g, '$1');
        return JSON.parse(relaxedCleaned);
      } catch (thirdErr) {
        throw new Error(`Invalid JSON syntax after auto-repair: ${initialErr.message}`);
      }
    }
  }
}

export function unescapeUnicode(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
}

export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/uploads/')) return trimmed;
  if (trimmed.startsWith('uploads/')) return '/' + trimmed;
  if (trimmed.startsWith('/api/images/')) return trimmed.replace('/api/images/', '/uploads/');
  if (trimmed.startsWith('api/images/')) return '/' + trimmed.replace('api/images/', 'uploads/');
  if (/^img_\d+_\d+\.(jpg|jpeg|png|webp|gif)$/i.test(trimmed)) return `/uploads/${trimmed}`;
  if (/^u\d+_i\d+_\d+_\d+\.(jpg|jpeg|png|webp|gif)$/i.test(trimmed)) return `/uploads/${trimmed}`;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function parseJSONQuestions(jsonString) {
  try {
    console.log('[DEBUG csvJsonParser] Incoming jsonString length:', jsonString?.length);
    let data = cleanAndParseJSON(jsonString);
    console.log('[DEBUG csvJsonParser] Parsed raw JSON data:', data);

    if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
      if (Array.isArray(data.questions)) {
        data = data.questions;
      } else if (Array.isArray(data.data)) {
        data = data.data;
      } else if (Array.isArray(data.items)) {
        data = data.items;
      }
    }

    if (!Array.isArray(data)) {
      throw new Error('JSON data must be an array of question objects.');
    }

    const parsed = data.map((item, index) => {
      const qTextEn = item.question_en || item.question_text_en || item.question || item.question_text || item.title || '';
      const qTextHi = item.question_hi || item.question_text_hi || '';

      const optsEn = item.options_en || item.options || item.choices || [];
      const optsHi = item.options_hi || [];

      const ans = item.correct_option_index !== undefined 
        ? item.correct_option_index 
        : (item.answer !== undefined ? item.answer : item.correct_answer);

      if (!qTextEn || !optsEn || ans === undefined) {
        console.error(`[DEBUG csvJsonParser] Item ${index + 1} missing required fields:`, { qTextEn, optsEn, ans, item });
        throw new Error(`Item ${index + 1} is missing required fields (question_en, options_en, correct_option_index).`);
      }

      const parseArrayField = (field) => {
        if (Array.isArray(field)) return field.map(x => unescapeUnicode(String(x)));
        if (typeof field === 'string') {
          try {
            return JSON.parse(field).map(x => unescapeUnicode(String(x)));
          } catch (e) {
            return field.split(',').map(s => unescapeUnicode(s.trim()));
          }
        }
        return [];
      };

      return {
        category_name: item.category_name || item.category || '',
        tag_names: item.tag_names || item.tags || [],
        passage_text_en: item.passage_text_en || item.passage_en || item.passage || '',
        passage_text_hi: item.passage_text_hi || item.passage_hi || '',
        passage_image_url: normalizeImageUrl(item.passage_image_url || item.passage_image || ''),
        question_text_en: unescapeUnicode(String(qTextEn)),
        question_text_hi: unescapeUnicode(String(qTextHi)),
        options_en: parseArrayField(optsEn),
        options_hi: parseArrayField(optsHi),
        options_images: parseArrayField(item.options_images || item.option_images || []).map(normalizeImageUrl),
        correct_option_index: parseInt(ans, 10) || 0,
        explanation_en: unescapeUnicode(String(item.explanation_en || item.explanation || '')),
        explanation_hi: unescapeUnicode(String(item.explanation_hi || '')),
        explanation_image_url: normalizeImageUrl(item.explanation_image_url || item.explanation_image || ''),
        difficulty: item.difficulty || 'medium',
        image_url: normalizeImageUrl(item.image_url || item.image || '')
      };
    });

    console.log('[DEBUG csvJsonParser] Successfully mapped questions count:', parsed.length);
    return parsed;
  } catch (e) {
    console.error('[DEBUG csvJsonParser] Error parsing JSON:', e);
    throw new Error(`JSON Parse Error: ${e.message}`);
  }
}

export function parseCSVQuestions(csvString) {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and data rows.');
  }

  const headerCols = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"(.*)"$/, '$1'));

  const isMultiLangFormat = headerCols.includes('question_en') || headerCols.includes('optiona_en') || headerCols.includes('question_text_en');

  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    // Robust CSV split respecting quotes
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cols = row.map(c => c.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));

    if (cols.length < 3) continue;

    if (isMultiLangFormat) {
      const getVal = (colName) => {
        const idx = headerCols.indexOf(colName.toLowerCase());
        return idx !== -1 && cols[idx] !== undefined ? cols[idx] : '';
      };

      const qEn = getVal('question_text_en') || getVal('question_en') || getVal('question');
      const qHi = getVal('question_text_hi') || getVal('question_hi');

      // Support Option A-F or Option 1-6
      const optKeysEn = ['optiona_en', 'optionb_en', 'optionc_en', 'optiond_en', 'optione_en', 'optionf_en', 'option1_en', 'option2_en', 'option3_en', 'option4_en', 'option5_en', 'option6_en'];
      const optKeysHi = ['optiona_hi', 'optionb_hi', 'optionc_hi', 'optiond_hi', 'optione_hi', 'optionf_hi', 'option1_hi', 'option2_hi', 'option3_hi', 'option4_hi', 'option5_hi', 'option6_hi'];

      const optsEn = [];
      const optsHi = [];

      ['a', 'b', 'c', 'd', 'e', 'f', '1', '2', '3', '4', '5', '6'].forEach(suffix => {
        const valEn = getVal(`option${suffix}_en`) || getVal(`option_${suffix}_en`) || getVal(`option${suffix}`);
        if (valEn) optsEn.push(valEn);

        const valHi = getVal(`option${suffix}_hi`) || getVal(`option_${suffix}_hi`);
        if (valHi) optsHi.push(valHi);
      });

      const ansVal = getVal('answer') || getVal('correct_option_index') || '0';
      const ansIdx = !isNaN(ansVal) ? parseInt(ansVal, 10) : 0;

      const rawTags = getVal('tag_names') || getVal('tags');
      const parsedTags = rawTags ? rawTags.split(';').join(',').split(',') : [];

      questions.push({
        category_name: getVal('category_name') || getVal('category'),
        tag_names: parsedTags,
        passage_text_en: getVal('passage_text_en') || getVal('passage_en') || getVal('passage'),
        passage_text_hi: getVal('passage_text_hi') || getVal('passage_hi'),
        passage_image_url: normalizeImageUrl(getVal('passage_image_url') || getVal('passage_image')),
        question_text_en: qEn,
        question_text_hi: qHi,
        options_en: optsEn,
        options_hi: optsHi,
        options_images: [],
        correct_option_index: ansIdx,
        explanation_en: getVal('explanation_en') || getVal('explanation'),
        explanation_hi: getVal('explanation_hi'),
        explanation_image_url: normalizeImageUrl(getVal('explanation_image_url') || getVal('explanation_image')),
        difficulty: getVal('difficulty') || 'medium',
        image_url: normalizeImageUrl(getVal('image_url') || getVal('image'))
      });
    } else {
      // Simple format
      const question_text = cols[0];
      const options = [cols[1], cols[2], cols[3], cols[4]].filter(Boolean);
      const answer = parseInt(cols[5], 10) || 0;
      const explanation = cols[6] || '';

      questions.push({
        category_name: '',
        tag_names: [],
        question_text_en: question_text,
        question_text_hi: '',
        options_en: options,
        options_hi: [],
        options_images: [],
        correct_option_index: answer,
        explanation_en: explanation,
        explanation_hi: '',
        difficulty: 'medium'
      });
    }
  }

  return questions;
}
