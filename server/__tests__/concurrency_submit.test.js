import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

describe('High-Concurrency & Submission Optimization Suite', () => {
  let token;
  let testUserId;
  let testExamId;
  let testSectionId;
  let testQuestionId1;
  let testQuestionId2;
  let testAttemptId;

  beforeAll(async () => {
    // 1. Create a test user
    const [userRes] = await pool.query(`
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ('High Concurrency Test Student', 'test_concurrency_student@example.com', 'test_hash', 'user')
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `);
    testUserId = userRes.insertId;

    token = jwt.sign(
      { id: testUserId, email: 'test_concurrency_student@example.com', role: 'user' },
      process.env.JWT_SECRET || 'secret'
    );

    // 2. Create a test exam with 2 questions
    const [examRes] = await pool.query(`
      INSERT INTO exams (institute_id, title, positive_marks, negative_marks, created_by, is_published, is_public)
      VALUES (1, 'Concurrency Performance Test Exam', 2.00, 0.50, ?, TRUE, TRUE)
    `, [testUserId]);
    testExamId = examRes.insertId;

    const [secRes] = await pool.query(`
      INSERT INTO exam_sections (exam_id, section_name, section_order)
      VALUES (?, 'Section 1', 1)
    `, [testExamId]);
    testSectionId = secRes.insertId;

    const [q1Res] = await pool.query(`
      INSERT INTO question_bank (institute_id, question_text_en, options_en_json, correct_option_index)
      VALUES (1, 'Concurrency Q1', '["A","B","C","D"]', 1)
    `);
    testQuestionId1 = q1Res.insertId;

    const [q2Res] = await pool.query(`
      INSERT INTO question_bank (institute_id, question_text_en, options_en_json, correct_option_index)
      VALUES (1, 'Concurrency Q2', '["A","B","C","D"]', 3)
    `);
    testQuestionId2 = q2Res.insertId;

    await pool.query(`
      INSERT INTO exam_section_questions (section_id, question_id, question_order)
      VALUES (?, ?, 1), (?, ?, 2)
    `, [testSectionId, testQuestionId1, testSectionId, testQuestionId2]);

    // 3. Create an in-progress attempt
    const [attRes] = await pool.query(`
      INSERT INTO exam_attempts (exam_id, user_id, institute_id, start_time, status)
      VALUES (?, ?, 1, NOW(), 'in_progress')
    `, [testExamId, testUserId]);
    testAttemptId = attRes.insertId;
  });

  it('evaluates and executes high-speed bulk insertion on submit', async () => {
    const responses = [
      {
        question_id: testQuestionId1,
        section_id: testSectionId,
        palette_state: 3, // Answered
        selected_option: 1, // Correct (+2.00)
        time_spent_sec: 45,
        language: 'en'
      },
      {
        question_id: testQuestionId2,
        section_id: testSectionId,
        palette_state: 3, // Answered
        selected_option: 0, // Wrong (-0.50)
        time_spent_sec: 30,
        language: 'en'
      }
    ];

    const startTime = Date.now();
    const res = await request(app)
      .post(`/api/exams/attempts/${testAttemptId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ responses, is_auto_submit: false });
    const duration = Date.now() - startTime;

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Exam submitted successfully.');
    expect(res.body.totalScore).toBe(1.50); // 2.00 - 0.50 = 1.50
    expect(res.body.correctCount).toBe(1);
    expect(res.body.wrongCount).toBe(1);
    expect(duration).toBeLessThan(500); // Super fast single multi-row write

    // Verify rows were bulk inserted into exam_item_logs
    const [itemLogs] = await pool.query(
      'SELECT * FROM exam_item_logs WHERE attempt_id = ? ORDER BY exam_question_id ASC',
      [testAttemptId]
    );
    expect(itemLogs.length).toBe(2);
    expect(itemLogs[0].is_correct).toBe(1);
    expect(Number(itemLogs[0].marks_awarded)).toBe(2.00);
    expect(itemLogs[1].is_correct).toBe(0);
    expect(Number(itemLogs[1].marks_awarded)).toBe(-0.50);
  });

  it('handles concurrent simulated submissions in parallel without locking', async () => {
    // Spawn 10 concurrent attempt submissions simultaneously
    const attempts = [];
    for (let i = 0; i < 10; i++) {
      const [att] = await pool.query(`
        INSERT INTO exam_attempts (exam_id, user_id, institute_id, start_time, status)
        VALUES (?, ?, 1, NOW(), 'in_progress')
      `, [testExamId, testUserId]);
      attempts.push(att.insertId);
    }

    const promises = attempts.map(attId => {
      return request(app)
        .post(`/api/exams/attempts/${attId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          responses: [
            { question_id: testQuestionId1, section_id: testSectionId, palette_state: 3, selected_option: 1 }
          ]
        });
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      expect(r.status).toBe(200);
      expect(r.body.totalScore).toBe(2.00);
    }
  });
});
