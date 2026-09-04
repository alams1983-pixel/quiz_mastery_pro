/**
 * Comprehensive Master AI Prompt Generator for Bulk Question Creation
 * Enables teachers to paste source notes into ChatGPT, Claude, Gemini, or DeepSeek
 * and get prescribed dynamic multi-language JSON / CSV files.
 */

export const MASTER_AI_QUESTION_PROMPT = `You are an expert educational content author & AI question generator.
Generate high-quality multiple-choice questions (MCQs) complying strictly with the prescribed JSON schema below.

==================================================
1. INPUT PARAMETERS (FILL IN YOUR INFORMATION BELOW):
==================================================
- SOURCE MATERIAL / SYLLABUS / NOTES:
  [PASTE YOUR TEXT CONTENT, STUDY NOTES, OR LESSON SUMMARY HERE]

- TARGET LANGUAGES (Specify 1 to 4 languages):
  [SPECIFY LANGUAGES e.g. "English and Hindi", "English, Bengali and Gujarati", or "English"]
  Supported Language Codes:
  en: English | hi: Hindi (हिंदी) | bn: Bengali (বাংলা) | gu: Gujarati (ગુજરાતી) 
  mr: Marathi (मराठी) | ta: Tamil (தமிழ்) | te: Telugu (తెలుగు) | kn: Kannada (ಕನ್ನಡ)

- TOTAL QUESTIONS TO GENERATE:
  [NUMBER e.g. 10]

- CATEGORY / SUBJECT NAME:
  [CATEGORY e.g. "General Science" or "Mathematics"]

- DIFFICULTY LEVEL:
  [easy / medium / hard]

==================================================
2. STRICT JSON OUTPUT FORMAT SCHEMA:
==================================================
Return ONLY a valid JSON array of question objects matching this exact structure:

[
  {
    "category_name": "General Science",
    "tag_names": ["Physics", "SSC CGL"],
    "passage_text_en": "",
    "passage_image_url": "",
    "image_url": "",
    "difficulty": "medium",
    "correct_option_index": 0,
    "primary_language": "en",
    "available_languages": ["en", "bn"],
    "translations": {
      "en": {
        "question_text": "What is the SI unit of electric current?",
        "options": ["Ampere", "Volt", "Watt", "Joule"],
        "explanation": "Ampere is the SI unit of electric current."
      },
      "bn": {
        "question_text": "বিদ্যুৎ প্রবাহের এসআই একক কী?",
        "options": ["অ্যাম্পিয়ার", "ভোল্ট", "ওয়াট", "জুল"],
        "explanation": "বিদ্যুৎ প্রবাহের এসআই একক হল অ্যাম্পিয়ার।"
      }
    }
  }
]

==================================================
3. STRICT COMPLIANCE RULES FOR AI:
==================================================
1. Math Equations: Format all mathematical and scientific formulas using standard inline KaTeX math syntax enclosed in single dollar signs (e.g., $E = mc^2$, $a^2 + b^2 = c^2$, $\\frac{d}{dx}\\sin(x) = \\cos(x)$).
2. Multi-Language Translations: Ensure accuracy in translated question statements, choices, and explanations for each target language.
3. Choices Array: Each translation object must contain an array of exactly 4 choices (or 2 to 6 choices).
4. Correct Answer Index: "correct_option_index" must be 0-indexed (0 = 1st option, 1 = 2nd option, 2 = 3rd option, 3 = 4th option).
5. Output Formatting: Output MUST be ONLY valid raw JSON array text. Do NOT wrap in markdown \`\`\`json codeblocks, do NOT add introductory sentences, and do NOT include conversational remarks.`;

export const AI_PROMPT_INSTRUCTIONS = `
### 🚀 How to use AI Generated Content for Bulk Upload:

1. **Copy the Prompt**: The AI Master Prompt has been copied to your clipboard.
2. **Paste into AI**: Open **ChatGPT**, **Claude**, **Gemini**, or **DeepSeek**.
3. **Fill in the Blanks**:
   - Paste your study notes or textbook content into \`[PASTE YOUR TEXT CONTENT...]\`.
   - Specify your desired target languages (e.g. \`English and Hindi\` or \`English, Bengali and Marathi\`).
   - Set the number of questions, category, and difficulty.
4. **Generate & Save File**:
   - Copy the raw JSON response returned by the AI.
   - Save it on your computer as a **\`questions.json\`** file (or **\`questions.csv\`** if using CSV format).
5. **Upload into Wizard**:
   - Drag & drop or browse and select the saved **\`questions.json\`** file in Step 1 of this modal to complete your bulk question import!
`;

/**
 * Copies the prompt to clipboard and returns success status
 */
export async function copyAiPromptToClipboard() {
  try {
    await navigator.clipboard.writeText(MASTER_AI_QUESTION_PROMPT);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = MASTER_AI_QUESTION_PROMPT;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

