export function safeJSONParse(val) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
}

/**
 * Normalizes question object DB output into a consistent translations_json format
 */
export function normalizeQuestionTranslations(row) {
  if (!row) return null;

  let translationsObj = safeJSONParse(row.translations_json);

  if (!translationsObj || typeof translationsObj !== 'object' || !translationsObj.translations) {
    const optsEn = safeJSONParse(row.options_en_json) || (Array.isArray(row.options_en) ? row.options_en : []);
    const optsHi = safeJSONParse(row.options_hi_json) || (Array.isArray(row.options_hi) ? row.options_hi : []);

    const hasHi = Boolean(
      (row.question_text_hi && row.question_text_hi.trim()) ||
      (Array.isArray(optsHi) && optsHi.length > 0)
    );

    const available = hasHi ? ['en', 'hi'] : ['en'];
    const primary = 'en';

    translationsObj = {
      available_languages: available,
      primary_language: primary,
      translations: {
        en: {
          question_text: row.question_text_en || row.question_text || '',
          options: Array.isArray(optsEn) ? optsEn : [],
          explanation: row.explanation_en || row.explanation || ''
        }
      }
    };

    if (hasHi) {
      translationsObj.translations.hi = {
        question_text: row.question_text_hi || '',
        options: Array.isArray(optsHi) ? optsHi : [],
        explanation: row.explanation_hi || ''
      };
    }
  }

  // Ensure available_languages array is populated
  if (!Array.isArray(translationsObj.available_languages) || translationsObj.available_languages.length === 0) {
    translationsObj.available_languages = Object.keys(translationsObj.translations || {});
  }
  if (!translationsObj.primary_language) {
    translationsObj.primary_language = translationsObj.available_languages[0] || 'en';
  }

  return translationsObj;
}

/**
 * Prepares payload fields for DB insertion/update from incoming request body
 */
export function buildSavePayload(reqBody) {
  let translationsObj = reqBody.translations_json || reqBody.translations;
  if (typeof translationsObj === 'string') {
    translationsObj = safeJSONParse(translationsObj);
  }

  if (!translationsObj || typeof translationsObj !== 'object' || !translationsObj.translations) {
    const primary = reqBody.primary_language || 'en';
    const langs = [];
    const trans = {};

    // Check if custom multi-lang object was passed in body (e.g. body.translations)
    if (reqBody.translations && typeof reqBody.translations === 'object') {
      Object.keys(reqBody.translations).forEach(lang => {
        const item = reqBody.translations[lang];
        if (item && (item.question_text || (item.options && item.options.length > 0))) {
          langs.push(lang);
          trans[lang] = {
            question_text: item.question_text || '',
            options: Array.isArray(item.options) ? item.options : [],
            explanation: item.explanation || ''
          };
        }
      });
    }

    if (langs.length === 0) {
      if (reqBody.question_text_en || reqBody.options_en || reqBody.question_en) {
        langs.push('en');
        trans.en = {
          question_text: reqBody.question_text_en || reqBody.question_en || '',
          options: Array.isArray(reqBody.options_en) ? reqBody.options_en : (Array.isArray(reqBody.options) ? reqBody.options : []),
          explanation: reqBody.explanation_en || reqBody.explanation || ''
        };
      }

      if (reqBody.question_text_hi || (reqBody.options_hi && reqBody.options_hi.length > 0) || reqBody.question_hi) {
        langs.push('hi');
        trans.hi = {
          question_text: reqBody.question_text_hi || reqBody.question_hi || '',
          options: Array.isArray(reqBody.options_hi) ? reqBody.options_hi : [],
          explanation: reqBody.explanation_hi || ''
        };
      }
    }

    if (langs.length === 0) {
      const singleLang = reqBody.language || primary || 'en';
      langs.push(singleLang);
      trans[singleLang] = {
        question_text: reqBody.question_text || '',
        options: Array.isArray(reqBody.options) ? reqBody.options : [],
        explanation: reqBody.explanation || ''
      };
    }

    translationsObj = {
      available_languages: langs,
      primary_language: primary,
      translations: trans
    };
  }

  // Derive legacy fallback values for backward DB queries
  const primaryLang = translationsObj.primary_language || translationsObj.available_languages?.[0] || 'en';
  const primaryTrans = translationsObj.translations?.[primaryLang] || {};
  const enTrans = translationsObj.translations?.en || primaryTrans;
  const hiTrans = translationsObj.translations?.hi || null;

  return {
    translations_json: JSON.stringify(translationsObj),
    question_text_en: enTrans.question_text || primaryTrans.question_text || '',
    question_text_hi: hiTrans ? hiTrans.question_text : '',
    options_en_json: JSON.stringify(enTrans.options || primaryTrans.options || []),
    options_hi_json: JSON.stringify(hiTrans ? hiTrans.options : []),
    explanation_en: enTrans.explanation || primaryTrans.explanation || '',
    explanation_hi: hiTrans ? hiTrans.explanation : ''
  };
}
