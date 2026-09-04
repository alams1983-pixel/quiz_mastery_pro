/**
 * AI Auto-Translation Service Stub for Dynamic Multi-Language Question Authoring
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' }
];

export const LANGUAGE_NAME_MAP = SUPPORTED_LANGUAGES.reduce((acc, l) => {
  acc[l.code] = `${l.name} (${l.native})`;
  return acc;
}, {});

/**
 * Translates a single text string using Gemini/OpenAI API or local fallback
 */
export async function translateText(sourceText, targetLangCode, apiKey = null) {
  if (!sourceText || !sourceText.trim()) return '';

  const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === targetLangCode);
  const langName = targetLang ? targetLang.name : targetLangCode;

  if (apiKey) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate the following educational question text/options/explanation accurately into ${langName}. Preserve LaTeX math formulas like $E=mc^2$ and HTML tags.\n\nText: "${sourceText}"`
            }]
          }]
        })
      });
      const data = await response.json();
      const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (translated) return translated.trim();
    } catch (e) {
      console.warn('AI API Call failed, falling back to client stub:', e.message);
    }
  }

  // Simulated AI response notice when no API key provided
  return `[${langName} AI Draft]: ${sourceText}`;
}

/**
 * Auto-translates an entire question object from source language to target language
 */
export async function autoTranslateQuestion(sourceLangContent, targetLangCode, apiKey = null) {
  if (!sourceLangContent) return null;

  const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === targetLangCode);
  const langName = targetLang ? targetLang.name : targetLangCode;

  const translatedText = await translateText(sourceLangContent.question_text || '', targetLangCode, apiKey);
  const translatedExplanation = await translateText(sourceLangContent.explanation || '', targetLangCode, apiKey);

  const translatedOptions = [];
  if (Array.isArray(sourceLangContent.options)) {
    for (const opt of sourceLangContent.options) {
      const transOpt = await translateText(opt || '', targetLangCode, apiKey);
      translatedOptions.push(transOpt);
    }
  }

  return {
    question_text: translatedText,
    options: translatedOptions,
    explanation: translatedExplanation
  };
}
