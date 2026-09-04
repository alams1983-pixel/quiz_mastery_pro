import { apiRequest } from './api.js';

export const PALETTE_STATES = {
  NOT_VISITED: 1,
  NOT_ANSWERED: 2,
  ANSWERED: 3,
  MARKED_FOR_REVIEW: 4,
  ANSWERED_AND_MARKED: 5
};

export class ExamSessionManager {
  constructor(attemptOrData, exam, sections) {
    if (attemptOrData && (attemptOrData.exam || attemptOrData.attempt)) {
      this.attempt = attemptOrData.attempt || attemptOrData;
      this.exam = attemptOrData.exam || {};
      this.sections = attemptOrData.sections || [];
    } else {
      this.attempt = attemptOrData || {};
      this.exam = exam || {};
      this.sections = sections || [];
    }

    this.activeSectionIndex = 0;
    this.activeQuestionIndex = 0;
    this.currentLanguage = 'en'; // 'en' or 'hi'

    // Question Map & State tracking: questionId -> { paletteState, selectedOption, timeSpentSec, language }
    this.stateMap = new Map();
    this.startTime = Date.now();
    this.questionStartTime = Date.now();
    this.remainingSeconds = ((this.exam && this.exam.total_duration_mins) || 60) * 60;
    this.autoSaveInterval = null;
    this.autoSaveInterval = null;

    this.initStates();
  }

  initStates() {
    // Populate state map for all questions across all sections
    this.sections.forEach(sec => {
      sec.questions.forEach(q => {
        this.stateMap.set(q.id, {
          questionId: q.id,
          sectionId: sec.id,
          paletteState: PALETTE_STATES.NOT_VISITED,
          selectedOption: null,
          timeSpentSec: 0,
          language: 'en'
        });
      });
    });

    // Restore previous attempt state if available in attempt.details_json
    if (this.attempt && this.attempt.details_json) {
      try {
        const saved = typeof this.attempt.details_json === 'string'
          ? JSON.parse(this.attempt.details_json)
          : this.attempt.details_json;

        if (saved.stateArray && Array.isArray(saved.stateArray)) {
          saved.stateArray.forEach(item => {
            if (this.stateMap.has(item.questionId)) {
              this.stateMap.set(item.questionId, {
                ...this.stateMap.get(item.questionId),
                ...item
              });
            }
          });
        }

        if (saved.remainingSeconds !== undefined) {
          this.remainingSeconds = saved.remainingSeconds;
        }
      } catch (e) {
        console.warn('Could not restore saved details_json:', e);
      }
    }

    // Mark initial question as visited
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      const stateObj = this.stateMap.get(currentQ.id);
      if (stateObj && stateObj.paletteState === PALETTE_STATES.NOT_VISITED) {
        stateObj.paletteState = PALETTE_STATES.NOT_ANSWERED;
      }
    }
  }

  getCurrentSection() {
    return this.sections[this.activeSectionIndex] || null;
  }

  getCurrentSectionQuestions() {
    const sec = this.getCurrentSection();
    return sec && sec.questions ? sec.questions : [];
  }

  getCurrentQuestionIndex() {
    return this.activeQuestionIndex;
  }

  getRemainingTimeSec() {
    return this.remainingSeconds;
  }

  tickTimer() {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
    }
    return this.remainingSeconds;
  }

  switchSection(sectionId) {
    const secIdx = this.sections.findIndex(s => s.id === sectionId);
    if (secIdx !== -1) {
      this.jumpToQuestion(secIdx, 0);
    }
  }

  switchQuestion(questionId) {
    const sec = this.getCurrentSection();
    if (!sec || !sec.questions) return;
    const qIdx = sec.questions.findIndex(q => q.id === questionId);
    if (qIdx !== -1) {
      this.jumpToQuestion(this.activeSectionIndex, qIdx);
    }
  }

  getPaletteSummaryCounts() {
    let answered = 0, not_answered = 0, not_visited = 0, marked_for_review = 0, ans_and_marked = 0;
    this.stateMap.forEach((val) => {
      const st = val.paletteState;
      if (st === PALETTE_STATES.ANSWERED) answered++;
      else if (st === PALETTE_STATES.NOT_ANSWERED) not_answered++;
      else if (st === PALETTE_STATES.NOT_VISITED) not_visited++;
      else if (st === PALETTE_STATES.MARKED_FOR_REVIEW) marked_for_review++;
      else if (st === PALETTE_STATES.ANSWERED_AND_MARKED) ans_and_marked++;
    });
    return { answered, not_answered, not_visited, marked_for_review, ans_and_marked };
  }

  generateSubmissionPayload() {
    return this.getPayloadForSubmit();
  }

  getCurrentQuestion() {
    const sec = this.getCurrentSection();
    return sec && sec.questions ? sec.questions[this.activeQuestionIndex] : null;
  }

  getCurrentState() {
    const q = this.getCurrentQuestion();
    return q ? this.stateMap.get(q.id) : null;
  }

  flushCurrentTimeSpent() {
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return;
    const stateObj = this.stateMap.get(currentQ.id);
    if (stateObj) {
      const elapsed = Math.round((Date.now() - this.questionStartTime) / 1000);
      stateObj.timeSpentSec += elapsed;
    }
    this.questionStartTime = Date.now();
  }

  selectOption(optionIndex) {
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return;
    const stateObj = this.stateMap.get(currentQ.id);
    if (stateObj) {
      stateObj.selectedOption = optionIndex;
    }
  }

  clearResponse() {
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return;
    const stateObj = this.stateMap.get(currentQ.id);
    if (stateObj) {
      stateObj.selectedOption = null;
      if (stateObj.paletteState === PALETTE_STATES.ANSWERED) {
        stateObj.paletteState = PALETTE_STATES.NOT_ANSWERED;
      } else if (stateObj.paletteState === PALETTE_STATES.ANSWERED_AND_MARKED) {
        stateObj.paletteState = PALETTE_STATES.MARKED_FOR_REVIEW;
      }
    }
  }

  saveAndNext() {
    this.flushCurrentTimeSpent();
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      const stateObj = this.stateMap.get(currentQ.id);
      if (stateObj) {
        if (stateObj.selectedOption !== null && stateObj.selectedOption !== undefined) {
          stateObj.paletteState = PALETTE_STATES.ANSWERED;
        } else {
          stateObj.paletteState = PALETTE_STATES.NOT_ANSWERED;
        }
      }
    }
    this.nextQuestion();
  }

  markForReviewAndNext() {
    this.flushCurrentTimeSpent();
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      const stateObj = this.stateMap.get(currentQ.id);
      if (stateObj) {
        if (stateObj.selectedOption !== null && stateObj.selectedOption !== undefined) {
          stateObj.paletteState = PALETTE_STATES.ANSWERED_AND_MARKED;
        } else {
          stateObj.paletteState = PALETTE_STATES.MARKED_FOR_REVIEW;
        }
      }
    }
    this.nextQuestion();
  }

  nextQuestion() {
    const sec = this.getCurrentSection();
    if (!sec) return;

    if (this.activeQuestionIndex < sec.questions.length - 1) {
      this.activeQuestionIndex++;
    } else if (this.activeSectionIndex < this.sections.length - 1) {
      // Advance to next section if section switching is allowed
      if (this.exam.allow_section_switch !== false) {
        this.activeSectionIndex++;
        this.activeQuestionIndex = 0;
      }
    }

    const nextQ = this.getCurrentQuestion();
    if (nextQ) {
      const stateObj = this.stateMap.get(nextQ.id);
      if (stateObj && stateObj.paletteState === PALETTE_STATES.NOT_VISITED) {
        stateObj.paletteState = PALETTE_STATES.NOT_ANSWERED;
      }
    }
    this.questionStartTime = Date.now();
  }

  prevQuestion() {
    this.flushCurrentTimeSpent();
    if (this.activeQuestionIndex > 0) {
      this.activeQuestionIndex--;
    } else if (this.activeSectionIndex > 0 && this.exam.allow_section_switch !== false) {
      this.activeSectionIndex--;
      const prevSec = this.getCurrentSection();
      this.activeQuestionIndex = prevSec ? prevSec.questions.length - 1 : 0;
    }
    this.questionStartTime = Date.now();
  }

  jumpToQuestion(sectionIndex, questionIndex) {
    this.flushCurrentTimeSpent();
    this.activeSectionIndex = sectionIndex;
    this.activeQuestionIndex = questionIndex;

    const targetQ = this.getCurrentQuestion();
    if (targetQ) {
      const stateObj = this.stateMap.get(targetQ.id);
      if (stateObj && stateObj.paletteState === PALETTE_STATES.NOT_VISITED) {
        stateObj.paletteState = PALETTE_STATES.NOT_ANSWERED;
      }
    }
    this.questionStartTime = Date.now();
  }

  getSectionSummary() {
    const summary = [];
    this.sections.forEach((sec) => {
      let notVisited = 0;
      let notAnswered = 0;
      let answered = 0;
      let marked = 0;
      let ansAndMarked = 0;

      sec.questions.forEach((q) => {
        const stateObj = this.stateMap.get(q.id);
        const st = stateObj ? stateObj.paletteState : PALETTE_STATES.NOT_VISITED;

        if (st === PALETTE_STATES.NOT_VISITED) notVisited++;
        else if (st === PALETTE_STATES.NOT_ANSWERED) notAnswered++;
        else if (st === PALETTE_STATES.ANSWERED) answered++;
        else if (st === PALETTE_STATES.MARKED_FOR_REVIEW) marked++;
        else if (st === PALETTE_STATES.ANSWERED_AND_MARKED) ansAndMarked++;
      });

      summary.push({
        sectionId: sec.id,
        sectionName: sec.section_name,
        totalQuestions: sec.questions.length,
        notVisited,
        notAnswered,
        answered,
        marked,
        ansAndMarked
      });
    });

    return summary;
  }

  getPayloadForSubmit() {
    this.flushCurrentTimeSpent();
    const responses = [];
    this.stateMap.forEach((val) => {
      responses.push({
        question_id: val.questionId,
        section_id: val.sectionId,
        palette_state: val.paletteState,
        selected_option: val.selectedOption,
        time_spent_sec: val.timeSpentSec,
        language: val.language || this.currentLanguage
      });
    });

    return {
      responses,
      details_json: {
        remainingSeconds: this.remainingSeconds,
        stateArray: Array.from(this.stateMap.values())
      }
    };
  }

  startAutoSave(intervalMs = 30000) {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(async () => {
      try {
        const payload = this.getPayloadForSubmit();
        await apiRequest(`/exams/attempts/${this.attempt.id}/save`, {
          method: 'PUT',
          body: JSON.stringify({ details_json: payload.details_json })
        });
      } catch (e) {
        console.warn('Auto-save heartbeat failed:', e);
      }
    }, intervalMs);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
}
