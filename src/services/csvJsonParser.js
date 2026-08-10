export function cleanAndParseJSON(jsonString) {
  if (typeof jsonString !== 'string') return jsonString;

  // Try direct parse first
  try {
    return JSON.parse(jsonString);
  } catch (initialErr) {
    // Attempt auto-repair
    let cleaned = jsonString;

    // 1. Remove JS-style comments
    cleaned = cleaned.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // 2. Fix unescaped backslashes inside JSON strings (e.g. \mathrm, \Delta, \frac, \ce, \int, \times)
    // Valid JSON escape sequences: \", \\, \/, \b, \f, \n, \r, \t, \uHEX
    cleaned = cleaned.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');

    // 3. Remove trailing commas before closing brackets or braces
    cleaned = cleaned.replace(/,(\s*[\}\]])/g, '$1');

    try {
      return JSON.parse(cleaned);
    } catch (secondErr) {
      // 4. Advanced repair: try replacing single quotes around keys/values if needed
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

export function parseJSONQuestions(jsonString) {
  try {
    let data = cleanAndParseJSON(jsonString);
    
    // Support root object wrapping questions like { "questions": [...] } or { "data": [...] }
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
      throw new Error('JSON data must be an array of question objects or contain a questions array.');
    }

    return data.map((item, index) => {
      const qText = item.question || item.question_text || item.title || '';
      const opts = item.options || item.choices || [];
      const ans = item.answer !== undefined ? item.answer : (item.correct_answer_index !== undefined ? item.correct_answer_index : item.correct_answer);

      if (!qText || !opts || ans === undefined) {
        throw new Error(`Item ${index + 1} is missing required fields (question/question_text, options, answer/correct_answer_index).`);
      }

      let parsedOptions = opts;
      if (typeof opts === 'string') {
        try {
          parsedOptions = cleanAndParseJSON(opts);
        } catch (e) {
          parsedOptions = opts.split(',').map(s => s.trim());
        }
      }

      const rawOpts = Array.isArray(parsedOptions) ? parsedOptions : [String(parsedOptions)];

      return {
        question_text: unescapeUnicode(String(qText)),
        options: rawOpts.map(o => unescapeUnicode(String(o))),
        correct_answer_index: parseInt(ans, 10) || 0,
        explanation: unescapeUnicode(String(item.explanation || '')),
        tags: Array.isArray(item.tags) 
          ? item.tags.map(t => unescapeUnicode(String(t))) 
          : (typeof item.tags === 'string' ? item.tags.split(';').map(t => unescapeUnicode(t.trim())) : [])
      };
    });
  } catch (e) {
    throw new Error(`JSON Parse Error: ${e.message}`);
  }
}

export function parseCSVQuestions(csvString) {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.');
  }

  // Header format: question,optionA,optionB,optionC,optionD,answer,explanation,tags
  const questions = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
    if (cols.length < 6) continue;

    const question_text = cols[0];
    const options = [cols[1], cols[2], cols[3], cols[4]];
    if (cols[5] && cols[5].length > 0 && !isNaN(cols[5])) {
      // index
    }
    const answer = parseInt(cols[5], 10) || 0;
    const explanation = cols[6] || '';
    const tags = cols[7] ? cols[7].split(';') : [];

    questions.push({
      question_text,
      options,
      correct_answer_index: answer,
      explanation,
      tags
    });
  }

  return questions;
}
