import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Log Individual Question Activity
router.post('/question-log', requireAuth, async (req, res) => {
  try {
    const { question_id, quiz_id, is_correct, time_spent_sec, selected_option_index } = req.body;

    if (!question_id || !quiz_id || is_correct === undefined) {
      return res.status(400).json({ error: 'Missing required question activity fields.' });
    }

    await pool.query(
      'INSERT INTO question_activity_logs (user_id, question_id, quiz_id, is_correct, time_spent_sec, selected_option_index) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, question_id, quiz_id, !!is_correct, parseInt(time_spent_sec, 10) || 0, parseInt(selected_option_index, 10) || 0]
    );

    res.status(201).json({ message: 'Question activity logged.' });
  } catch (err) {
    console.error('Question Log Error:', err);
    res.status(500).json({ error: 'Error logging question activity.' });
  }
});

// 2. Record Completed Quiz Attempt
router.post('/quiz-attempt', requireAuth, async (req, res) => {
  try {
    const { quiz_id, score, total_questions, accuracy_pct, time_taken_sec, mastery_level, details_json } = req.body;

    if (!quiz_id || score === undefined || !total_questions) {
      return res.status(400).json({ error: 'Missing required quiz attempt data.' });
    }

    const [result] = await pool.query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, accuracy_pct, time_taken_sec, mastery_level, details_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        quiz_id,
        score,
        total_questions,
        accuracy_pct || 0,
        time_taken_sec || 0,
        mastery_level || 1,
        JSON.stringify(details_json || {})
      ]
    );

    res.status(201).json({ message: 'Quiz attempt saved successfully.', attemptId: result.insertId });
  } catch (err) {
    console.error('Quiz Attempt Save Error:', err);
    res.status(500).json({ error: 'Error saving quiz attempt.' });
  }
});

// 3. Get User Attempt History
router.get('/history', requireAuth, async (req, res) => {
  try {
    const [attempts] = await pool.query(`
      SELECT qa.*, q.title as quiz_title, c.name as category_name
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      LEFT JOIN categories c ON q.category_id = c.id
      WHERE qa.user_id = ?
      ORDER BY qa.created_at DESC
    `, [req.user.id]);

    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching attempt history.' });
  }
});

// 4. Get User Analytics Dashboard Stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalAttempts] = await pool.query('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?', [userId]);
    const [avgAccuracy] = await pool.query('SELECT AVG(accuracy_pct) as avg_acc FROM quiz_attempts WHERE user_id = ?', [userId]);
    const [totalTime] = await pool.query('SELECT SUM(time_taken_sec) as total_sec FROM quiz_attempts WHERE user_id = ?', [userId]);

    // Question activity breakdown
    const [questionStats] = await pool.query(`
      SELECT
        COUNT(*) as total_logs,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as total_correct,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as total_wrong
      FROM question_activity_logs
      WHERE user_id = ?
    `, [userId]);

    res.json({
      totalAttempts: totalAttempts[0].count || 0,
      avgAccuracy: Math.round(avgAccuracy[0].avg_acc || 0),
      totalTimeSec: totalTime[0].total_sec || 0,
      totalCorrectAnswers: questionStats[0].total_correct || 0,
      totalWrongAnswers: questionStats[0].total_wrong || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching analytics stats.' });
  }
});

// 5. Get Weak Area Questions (Accuracy < 60%)
router.get('/weak-areas', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [weakQuestions] = await pool.query(`
      SELECT q.*,
             COUNT(qal.id) as total_attempts,
             SUM(CASE WHEN qal.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
             (SUM(CASE WHEN qal.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(qal.id) * 100) as accuracy
      FROM question_activity_logs qal
      JOIN questions q ON qal.question_id = q.id
      WHERE qal.user_id = ?
      GROUP BY q.id
      HAVING accuracy < 60 OR total_attempts = 0
      ORDER BY accuracy ASC
      LIMIT 20
    `, [userId]);

    const formatted = weakQuestions.map(q => ({
      ...q,
      options: typeof q.options_json === 'string' ? JSON.parse(q.options_json) : q.options_json,
      tags: q.tags_json ? (typeof q.tags_json === 'string' ? JSON.parse(q.tags_json) : q.tags_json) : []
    }));

    res.json({ questions: formatted });
  } catch (err) {
    console.error('Weak Areas Error:', err);
    res.status(500).json({ error: 'Error generating weak area practice quiz.' });
  }
});

export default router;
