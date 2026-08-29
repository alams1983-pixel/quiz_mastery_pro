import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import pool from '../db.js';

describe('Hardened API & Security Suite', () => {
  beforeAll(async () => {
    // Ensure DB pool is alive before testing
    await pool.query('SELECT 1');
  });

  describe('GET /api/health', () => {
    it('should return 200 and verify active database connectivity', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('database', 'connected');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/auth Security Checks', () => {
    const testEmail = `test_security_${Date.now()}@example.com`;
    const testPassword = 'SecurePassword123!';

    it('should register a new test user and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Security Test User',
          email: testEmail,
          password: testPassword,
          account_type: 'student'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testEmail);
    });

    it('should authenticate user login and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testEmail);
    });

    it('forgot-password MUST NOT leak resetToken in HTTP response', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      // CRITICAL SECURITY ASSERTION
      expect(res.body).not.toHaveProperty('resetToken');
    });
  });

  describe('POST /api/images/upload Security Checks', () => {
    it('should reject unauthenticated upload requests with 401', async () => {
      const res = await request(app)
        .post('/api/images/upload');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Role-Based Deletion & Mutation Guards', () => {
    it('should reject unauthenticated DELETE requests on exams with 401', async () => {
      const res = await request(app).delete('/api/exams/9999');
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated DELETE requests on quizzes with 401', async () => {
      const res = await request(app).delete('/api/quizzes/9999');
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated DELETE requests on batches with 401', async () => {
      const res = await request(app).delete('/api/exams/batches/9999');
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated DELETE requests on categories with 401', async () => {
      const res = await request(app).delete('/api/categories/9999');
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated DELETE requests on tags with 401', async () => {
      const res = await request(app).delete('/api/tags/9999');
      expect(res.status).toBe(401);
    });
  });
});
