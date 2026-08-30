import express from 'express';
import pool from '../db.js';
import { requireAuth, requireInstituteAdmin, requireSuperAdmin } from '../middleware/auth.js';

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

// 3. Get Practice Quiz Attempt History
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

// 4. Get Practice Quiz Stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalAttempts] = await pool.query('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?', [userId]);
    const [avgAccuracy] = await pool.query('SELECT AVG(accuracy_pct) as avg_acc FROM quiz_attempts WHERE user_id = ?', [userId]);
    const [totalTime] = await pool.query('SELECT SUM(time_taken_sec) as total_sec FROM quiz_attempts WHERE user_id = ?', [userId]);

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

// ==========================================
// ROLE-SPECIFIC EXAM ANALYTICS ENDPOINTS
// ==========================================

// 6. Student CBT Exam Analytics (Exclusively for Students)
router.get('/student-exam-stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [attempts] = await pool.query(`
      SELECT ea.*, e.title as exam_title, e.exam_type, e.mode, e.total_duration_mins,
             i.name as institute_name
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      LEFT JOIN institutes i ON ea.institute_id = i.id
      WHERE ea.user_id = ? AND ea.status IN ('completed', 'auto_submitted')
      ORDER BY ea.submit_time DESC
    `, [userId]);

    const [aggregate] = await pool.query(`
      SELECT COUNT(*) as total_exams,
             AVG(accuracy_pct) as avg_accuracy,
             AVG(total_score) as avg_score,
             AVG(percentile) as avg_percentile,
             SUM(TIMESTAMPDIFF(SECOND, start_time, submit_time)) as total_duration_sec
      FROM exam_attempts
      WHERE user_id = ? AND status IN ('completed', 'auto_submitted')
    `, [userId]);

    res.json({
      totalExams: aggregate[0].total_exams || 0,
      avgAccuracy: Math.round(aggregate[0].avg_accuracy || 0),
      avgScore: parseFloat(aggregate[0].avg_score || 0).toFixed(2),
      avgPercentile: Math.round(aggregate[0].avg_percentile || 0),
      totalDurationMins: Math.round((aggregate[0].total_duration_sec || 0) / 60),
      attempts
    });
  } catch (err) {
    console.error('Student Exam Stats Error:', err);
    res.status(500).json({ error: 'Error fetching student CBT exam analytics.' });
  }
});

// 7. Institute Student Analytics (For Coaching / Teacher Role)
router.get('/institute-student-analytics', requireInstituteAdmin, async (req, res) => {
  try {
    const instId = req.user.role === 'super_admin' ? (req.query.institute_id || req.user.institute_id) : req.user.institute_id;
    if (!instId) return res.status(400).json({ error: 'Institute ID is required.' });

    // Aggregate stats for students belonging to this institute (WHERE u.role = 'user')
    const [overall] = await pool.query(`
      SELECT COUNT(DISTINCT u.id) as total_students,
             COUNT(ea.id) as total_exam_attempts,
             AVG(ea.accuracy_pct) as class_avg_accuracy,
             AVG(ea.total_score) as class_avg_score
      FROM users u
      LEFT JOIN exam_attempts ea ON ea.user_id = u.id AND ea.status IN ('completed', 'auto_submitted')
      WHERE u.institute_id = ? AND u.role = 'user'
    `, [instId]);

    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Student performance roster (Paginated)
    const [students] = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.phone_number, u.created_at,
             COUNT(DISTINCT ea.id) as exams_completed,
             AVG(ea.accuracy_pct) as avg_accuracy,
             MAX(ea.total_score) as max_score,
             MAX(ea.percentile) as max_percentile,
             MAX(ea.submit_time) as last_active
      FROM users u
      LEFT JOIN exam_attempts ea ON ea.user_id = u.id AND ea.status IN ('completed', 'auto_submitted')
      WHERE u.institute_id = ? AND u.role = 'user'
      GROUP BY u.id
      ORDER BY exams_completed DESC, avg_accuracy DESC
      LIMIT ? OFFSET ?
    `, [instId, limitNum, offset]);

    const totalStudentsCount = overall[0].total_students || 0;
    const totalPages = Math.ceil(totalStudentsCount / limitNum) || 1;

    // Exam-by-exam summary for this institute
    const [examSummary] = await pool.query(`
      SELECT e.id, e.title, e.exam_type,
             COUNT(DISTINCT ea.id) as attempts_count,
             AVG(ea.total_score) as avg_score,
             AVG(ea.accuracy_pct) as avg_accuracy
      FROM exams e
      LEFT JOIN exam_attempts ea ON ea.exam_id = e.id AND ea.status IN ('completed', 'auto_submitted')
      JOIN users u ON ea.user_id = u.id AND u.role = 'user'
      WHERE e.institute_id = ?
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `, [instId]);

    res.json({
      totalStudents: overall[0].total_students || 0,
      totalExamAttempts: overall[0].total_exam_attempts || 0,
      classAvgAccuracy: Math.round(overall[0].class_avg_accuracy || 0),
      classAvgScore: parseFloat(overall[0].class_avg_score || 0).toFixed(2),
      students,
      examSummary,
      pagination: {
        total: totalStudentsCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error('Institute Analytics Error:', err);
    res.status(500).json({ error: 'Error fetching institute student analytics.' });
  }
});

// 8. Platform Super Admin Analytics (For Platform Super Admin)
router.get('/platform-analytics', requireSuperAdmin, async (req, res) => {
  try {
    const [totals] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'institute_admin') as total_teachers,
        (SELECT COUNT(*) FROM institutes) as total_institutes,
        (SELECT COUNT(*) FROM exams) as total_exams,
        (SELECT COUNT(*) FROM quizzes) as total_quizzes,
        (SELECT COUNT(*) FROM exam_attempts WHERE status IN ('completed', 'auto_submitted')) as total_exam_attempts,
        (SELECT COUNT(*) FROM quiz_attempts) as total_quiz_attempts
    `);

    // Institute Comparative Matrix
    const [institutes] = await pool.query(`
      SELECT i.id, i.name, i.code, i.status, i.created_at,
             COUNT(DISTINCT u.id) as student_count,
             COUNT(DISTINCT e.id) as exam_count,
             COUNT(DISTINCT ea.id) as attempt_count,
             AVG(ea.accuracy_pct) as avg_student_accuracy
      FROM institutes i
      LEFT JOIN users u ON u.institute_id = i.id AND u.role = 'user'
      LEFT JOIN exams e ON e.institute_id = i.id
      LEFT JOIN exam_attempts ea ON ea.institute_id = i.id AND ea.status IN ('completed', 'auto_submitted')
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `);

    res.json({
      totals: totals[0],
      institutes
    });
  } catch (err) {
    console.error('Platform Analytics Error:', err);
    res.status(500).json({ error: 'Error fetching platform analytics.' });
  }
});

export default router;
