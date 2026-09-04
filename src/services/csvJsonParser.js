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
    let data = cleanAndParseJSON(jsonString);

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

      const ans = item.correct_option_index !== undefined 
        ? item.correct_option_index 
        : (item.answer !== undefined ? item.answer : item.correct_answer);

      let availableLangs = [];
      let primaryLang = item.primary_language || 'en';
      let translations = {};

      if (item.translations && typeof item.translations === 'object') {
        translations = item.translations;
      } else if (item.translations_json) {
        try {
          const parsedTJ = typeof item.translations_json === 'string' ? JSON.parse(item.translations_json) : item.translations_json;
          translations = parsedTJ.translations || {};
          primaryLang = parsedTJ.primary_language || primaryLang;
        } catch (e) {}
      }

      // Legacy fallback construction if no translations object present
      if (Object.keys(translations).length === 0) {
        const qEn = item.question_en || item.question_text_en || item.question || item.question_text || item.title || '';
        const qHi = item.question_hi || item.question_text_hi || '';
        const optsEn = parseArrayField(item.options_en || item.options || item.choices || []);
        const optsHi = parseArrayField(item.options_hi || []);

        if (qEn || optsEn.length > 0) {
          translations.en = {
            question_text: unescapeUnicode(String(qEn)),
            options: optsEn,
            explanation: unescapeUnicode(String(item.explanation_en || item.explanation || ''))
          };
        }

        if (qHi || optsHi.length > 0) {
          translations.hi = {
            question_text: unescapeUnicode(String(qHi)),
            options: optsHi,
            explanation: unescapeUnicode(String(item.explanation_hi || ''))
          };
        }
      }

      // Auto-detect all valid language keys present in translations
      const validLangKeys = Object.keys(translations).filter(k => {
        const obj = translations[k];
        return obj && (obj.question_text || (Array.isArray(obj.options) && obj.options.length > 0));
      });

      if (validLangKeys.length === 0) {
        throw new Error(`Item ${index + 1} is missing valid question text or options in any language.`);
      }

      availableLangs = validLangKeys;
      if (!availableLangs.includes(primaryLang)) {
        primaryLang = availableLangs[0];
      }

      const primaryContent = translations[primaryLang] || translations[availableLangs[0]] || {};

      return {
        category_name: item.category_name || item.category || '',
        tag_names: item.tag_names || item.tags || [],
        passage_text_en: item.passage_text_en || item.passage_en || item.passage || '',
        passage_text_hi: item.passage_text_hi || item.passage_hi || '',
        passage_image_url: normalizeImageUrl(item.passage_image_url || item.passage_image || ''),
        question_text_en: translations.en?.question_text || primaryContent.question_text || '',
        question_text_hi: translations.hi?.question_text || '',
        question_text: primaryContent.question_text || '',
        options: primaryContent.options || [],
        options_en: translations.en?.options || primaryContent.options || [],
        options_hi: translations.hi?.options || [],
        options_images: parseArrayField(item.options_images || item.option_images || []).map(normalizeImageUrl),
        correct_option_index: parseInt(ans, 10) || 0,
        explanation_en: translations.en?.explanation || primaryContent.explanation || '',
        explanation_hi: translations.hi?.explanation || '',
        explanation_image_url: normalizeImageUrl(item.explanation_image_url || item.explanation_image || ''),
        difficulty: item.difficulty || 'medium',
        image_url: normalizeImageUrl(item.image_url || item.image || ''),
        primary_language: primaryLang,
        available_languages: availableLangs,
        translations_json: {
          available_languages: availableLangs,
          primary_language: primaryLang,
          translations
        }
      };
    });

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

  // Detect dynamic language suffixes present in CSV headers (e.g. _en, _bn, _hi, _gu)
  const detectedLangs = new Set();
  headerCols.forEach(col => {
    const match = col.match(/(?:question|optiona|option1|explanation)_([a-z]{2})$/i);
    if (match) detectedLangs.add(match[1].toLowerCase());
  });

  const langList = detectedLangs.size > 0 ? Array.from(detectedLangs) : ['en'];

  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cols = row.map(c => c.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));

    if (cols.length < 3) continue;

    const getVal = (colName) => {
      const idx = headerCols.indexOf(colName.toLowerCase());
      return idx !== -1 && cols[idx] !== undefined ? cols[idx] : '';
    };

    const translations = {};
    const availableLangs = [];

    langList.forEach(lang => {
      const qVal = getVal(`question_${lang}`) || getVal(`question_text_${lang}`) || (lang === 'en' ? (getVal('question') || getVal('question_text')) : '');
      const opts = [];
      ['a', 'b', 'c', 'd', 'e', 'f', '1', '2', '3', '4', '5', '6'].forEach(suffix => {
        const optVal = getVal(`option${suffix}_${lang}`) || getVal(`option_${suffix}_${lang}`) || (lang === 'en' ? getVal(`option${suffix}`) : '');
        if (optVal) opts.push(optVal);
      });
      const expVal = getVal(`explanation_${lang}`) || (lang === 'en' ? getVal('explanation') : '');

      if (qVal || opts.length > 0) {
        availableLangs.push(lang);
        translations[lang] = {
          question_text: unescapeUnicode(qVal),
          options: opts.map(unescapeUnicode),
          explanation: unescapeUnicode(expVal)
        };
      }
    });

    // Fallback single language if no language suffix found
    if (availableLangs.length === 0) {
      const defaultQ = cols[0];
      const defaultOpts = [cols[1], cols[2], cols[3], cols[4]].filter(Boolean);
      availableLangs.push('en');
      translations.en = {
        question_text: unescapeUnicode(defaultQ),
        options: defaultOpts.map(unescapeUnicode),
        explanation: unescapeUnicode(cols[6] || '')
      };
    }

    const ansVal = getVal('answer') || getVal('correct_option_index') || cols[5] || '0';
    const ansIdx = !isNaN(ansVal) ? parseInt(ansVal, 10) : 0;
    const rawTags = getVal('tag_names') || getVal('tags');
    const parsedTags = rawTags ? rawTags.split(';').join(',').split(',') : [];

    const primaryLang = availableLangs[0] || 'en';
    const primaryContent = translations[primaryLang] || {};

    questions.push({
      category_name: getVal('category_name') || getVal('category') || '',
      tag_names: parsedTags,
      passage_text_en: getVal('passage_text_en') || getVal('passage_en') || getVal('passage') || '',
      passage_text_hi: getVal('passage_text_hi') || getVal('passage_hi') || '',
      passage_image_url: normalizeImageUrl(getVal('passage_image_url') || getVal('passage_image')),
      question_text_en: translations.en?.question_text || primaryContent.question_text || '',
      question_text_hi: translations.hi?.question_text || '',
      question_text: primaryContent.question_text || '',
      options: primaryContent.options || [],
      options_en: translations.en?.options || primaryContent.options || [],
      options_hi: translations.hi?.options || [],
      options_images: [],
      correct_option_index: ansIdx,
      explanation_en: translations.en?.explanation || primaryContent.explanation || '',
      explanation_hi: translations.hi?.explanation || '',
      explanation_image_url: normalizeImageUrl(getVal('explanation_image_url') || getVal('explanation_image')),
      difficulty: getVal('difficulty') || 'medium',
      image_url: normalizeImageUrl(getVal('image_url') || getVal('image')),
      primary_language: primaryLang,
      available_languages: availableLangs,
      translations_json: {
        available_languages: availableLangs,
        primary_language: primaryLang,
        translations
      }
    });
  }

  return questions;
}
