import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import {
  getInstituteBunnyConfig,
  getBunnyTusUploadAuth,
  generateSignedHlsUrl,
} from '../utils/bunnyHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edutorai_mastery_quiz_secret_key_2026';

describe('LMS Enhancements Suite (Live Classes, Video Lectures, Study Materials)', () => {
  let adminToken;
  let studentInBatchToken;
  let studentNotInBatchToken;
  let testInstituteId = 1;
  let testBatchAId;
  let testBatchBId;
  const randSuffix = Date.now();
  let adminId;
  let studentAId;
  let studentBId;

  beforeAll(async () => {
    // 1. Create Admin User
    const [uAdmin] = await pool.query(
      `INSERT INTO users (full_name, email, role, institute_id) VALUES ('Test Institute Admin', ?, 'institute_admin', ?)`,
      [`admin_test_${randSuffix}@edutor.ai`, testInstituteId]
    );
    adminId = uAdmin.insertId;

    // 2. Create 2 test batches
    const [b1] = await pool.query(
      `INSERT INTO batches (institute_id, name, code) VALUES (?, 'Test Batch A', ?)`,
      [testInstituteId, `TBA_${randSuffix}`]
    );
    testBatchAId = b1.insertId;

    const [b2] = await pool.query(
      `INSERT INTO batches (institute_id, name, code) VALUES (?, 'Test Batch B', ?)`,
      [testInstituteId, `TBB_${randSuffix}`]
    );
    testBatchBId = b2.insertId;

    // 3. Create Student A in Batch A
    const [u1] = await pool.query(
      `INSERT INTO users (full_name, email, role, institute_id) VALUES ('Student In Batch A', ?, 'user', ?)`,
      [`student_a_${randSuffix}@edutor.ai`, testInstituteId]
    );
    studentAId = u1.insertId;
    await pool.query(
      `INSERT INTO student_batches (user_id, batch_id, status) VALUES (?, ?, 'approved')`,
      [studentAId, testBatchAId]
    );

    // 4. Create Student B in Batch B
    const [u2] = await pool.query(
      `INSERT INTO users (full_name, email, role, institute_id) VALUES ('Student In Batch B', ?, 'user', ?)`,
      [`student_b_${randSuffix}@edutor.ai`, testInstituteId]
    );
    studentBId = u2.insertId;
    await pool.query(
      `INSERT INTO student_batches (user_id, batch_id, status) VALUES (?, ?, 'approved')`,
      [studentBId, testBatchBId]
    );

    // 5. Generate Auth Tokens
    adminToken = jwt.sign(
      { id: adminId, full_name: 'Test Institute Admin', role: 'institute_admin', institute_id: testInstituteId },
      JWT_SECRET
    );
    studentInBatchToken = jwt.sign(
      { id: studentAId, full_name: 'Student In Batch A', email: `student_a_${randSuffix}@edutor.ai`, role: 'user', institute_id: testInstituteId },
      JWT_SECRET
    );
    studentNotInBatchToken = jwt.sign(
      { id: studentBId, full_name: 'Student In Batch B', email: `student_b_${randSuffix}@edutor.ai`, role: 'user', institute_id: testInstituteId },
      JWT_SECRET
    );
  });

  afterAll(async () => {
    // Cleanup test records
    await pool.query(`DELETE FROM batches WHERE id IN (?, ?)`, [testBatchAId, testBatchBId]);
    await pool.query(`DELETE FROM users WHERE id IN (?, ?, ?)`, [adminId, studentAId, studentBId]);
  });

  // -------------------------------------------------------------
  // 1. Study Materials & Batch Access Tests
  // -------------------------------------------------------------
  describe('Study Materials (Cloudflare R2 & Batch Access)', () => {
    let materialBatchAId;

    it('Admin can request presigned R2 upload URL', async () => {
      const res = await request(app)
        .post('/api/study-materials/presigned-upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fileName: 'mechanics_notes.pdf', category: 'notes' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('uploadUrl');
      expect(res.body).toHaveProperty('fileKey');
      expect(res.body.fileKey).toContain('study-materials');
    });

    it('Admin can publish study material assigned exclusively to Batch A', async () => {
      const res = await request(app)
        .post('/api/study-materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Mechanics Module 1',
          subject: 'Physics',
          chapter: 'Kinematics',
          category: 'notes',
          fileR2Key: `tenants/inst-1/study-materials/notes/test_mechanics.pdf`,
          fileName: 'mechanics_notes.pdf',
          fileSizeBytes: 2048500,
          isAllBatches: false,
          batchIds: [testBatchAId],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('materialId');
      materialBatchAId = res.body.materialId;
    });

    it('Student in Batch A CAN access and view document with dynamic watermark', async () => {
      const res = await request(app)
        .get(`/api/study-materials/${materialBatchAId}/view`)
        .set('Authorization', `Bearer ${studentInBatchToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('viewUrl');
      expect(res.body).toHaveProperty('watermark');
      expect(res.body.watermark.text).toContain('Student In Batch A');
    });

    it('Student in Batch B is FORBIDDEN from viewing Batch A material', async () => {
      const res = await request(app)
        .get(`/api/study-materials/${materialBatchAId}/view`)
        .set('Authorization', `Bearer ${studentNotInBatchToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Access denied');
    });
  });

  // -------------------------------------------------------------
  // 2. Video Lectures (Bunny.net Stream VOD & Signed HLS)
  // -------------------------------------------------------------
  describe('Video Lectures (Bunny.net Stream VOD)', () => {
    let lectureBatchAId;

    it('Admin can initiate video lecture upload with Bunny Tus auth', async () => {
      const res = await request(app)
        .post('/api/videos/create-upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Newton Laws of Motion - Part 1',
          subject: 'Physics',
          chapter: 'Dynamics',
          isAllBatches: false,
          batchIds: [testBatchAId],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('lectureId');
      expect(res.body).toHaveProperty('videoId');
      expect(res.body).toHaveProperty('tusAuth');
      lectureBatchAId = res.body.lectureId;
    }, 15000);

    it('Student in Batch A can fetch signed HLS token & resume position', async () => {
      // Simulate Tus upload completion & ready status
      await pool.query('UPDATE video_lectures SET status = "ready" WHERE id = ?', [lectureBatchAId]);

      const res = await request(app)
        .get(`/api/videos/${lectureBatchAId}/playback`)
        .set('Authorization', `Bearer ${studentInBatchToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('playbackUrl');
      expect(res.body.playbackUrl).toContain('playlist.m3u8');
      expect(res.body).toHaveProperty('watermark');
    });

    it('Student in Batch B is FORBIDDEN from streaming Batch A video', async () => {
      const res = await request(app)
        .get(`/api/videos/${lectureBatchAId}/playback`)
        .set('Authorization', `Bearer ${studentNotInBatchToken}`);

      expect(res.status).toBe(403);
    });

    it('Student in Batch A can update watch progress timestamp', async () => {
      const res = await request(app)
        .post(`/api/videos/${lectureBatchAId}/progress`)
        .set('Authorization', `Bearer ${studentInBatchToken}`)
        .send({ positionSeconds: 125, durationSeconds: 600 });

      expect(res.status).toBe(200);
      expect(res.body.saved).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 3. Live Classes (Live Stream Ingest & Access Control)
  // -------------------------------------------------------------
  describe('Live Classes (Live Stream & Socket Rooms)', () => {
    let liveClassAId;

    it('Admin can schedule live class and generate RTMP/Stream credentials', async () => {
      const res = await request(app)
        .post('/api/live-classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Live Thermodynamics Problem Solving',
          subject: 'Physics',
          scheduledStartTime: new Date(Date.now() + 3600000).toISOString(),
          scheduledEndTime: new Date(Date.now() + 7200000).toISOString(),
          isAllBatches: false,
          batchIds: [testBatchAId],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('liveClassId');
      expect(res.body).toHaveProperty('streamKey');
      expect(res.body).toHaveProperty('playbackUrl');
      liveClassAId = res.body.liveClassId;
    }, 15000);

    it('Student in Batch A can join live class session', async () => {
      const res = await request(app)
        .get(`/api/live-classes/${liveClassAId}/join`)
        .set('Authorization', `Bearer ${studentInBatchToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('playbackUrl');
      expect(res.body).toHaveProperty('watermark');
      expect(res.body.isInstructor).toBe(false);
    });

    it('Student in Batch B is FORBIDDEN from joining Batch A live class', async () => {
      const res = await request(app)
        .get(`/api/live-classes/${liveClassAId}/join`)
        .set('Authorization', `Bearer ${studentNotInBatchToken}`);

      expect(res.status).toBe(403);
    });

    let pollId;

    it('Admin can create live in-class MCQ poll', async () => {
      const res = await request(app)
        .post(`/api/live-classes/${liveClassAId}/polls`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          question: 'What is the SI unit of heat capacity?',
          options: ['Joule / Kelvin', 'Watt', 'Newton', 'Pascal'],
          correctOption: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('pollId');
      pollId = res.body.pollId;
    });

    it('Student can vote with responseTimeMs in active poll', async () => {
      const res = await request(app)
        .post(`/api/live-classes/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${studentInBatchToken}`)
        .send({
          selectedOption: 0,
          responseTimeMs: 1420,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('counts');
      expect(res.body.counts.length).toBeGreaterThan(0);
    });

    it('Can fetch Top 10 fastest correct response leaderboard', async () => {
      const res = await request(app)
        .get(`/api/live-classes/polls/${pollId}/leaderboard`)
        .set('Authorization', `Bearer ${studentInBatchToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body.leaderboard.length).toBe(1);
      expect(res.body.leaderboard[0].rank).toBe(1);
      expect(res.body.leaderboard[0].responseTimeMs).toBe(1420);
      expect(res.body.leaderboard[0].responseTimeSec).toBe('1.4s');
    });

    it('Teacher can share poll leaderboard with class and close poll', async () => {
      const res = await request(app)
        .post(`/api/live-classes/polls/${pollId}/share-leaderboard`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body.leaderboard.length).toBe(1);

      // Verify poll is now closed
      const voteAttempt = await request(app)
        .post(`/api/live-classes/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${studentInBatchToken}`)
        .send({ selectedOption: 1 });

      expect(voteAttempt.status).toBe(400);
      expect(voteAttempt.body.error).toMatch(/no longer active/i);
    });

    it('Admin can end live class and it automatically archives into video_lectures for Batch A students', async () => {
      const res = await request(app)
        .post(`/api/live-classes/${liveClassAId}/end`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
      expect(res.body).toHaveProperty('replayVideoId');

      // Student in Batch A can now see it in their video lectures
      const vRes = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${studentInBatchToken}`);

      expect(vRes.status).toBe(200);
      const replay = vRes.body.videos.find((v) => v.id === res.body.replayVideoId);
      expect(replay).toBeDefined();
      expect(['ready', 'no_broadcast']).toContain(replay.status);

      // Student in Batch B (not in batch) CANNOT see it
      const vResB = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${studentNotInBatchToken}`);

      const replayB = vResB.body.videos.find((v) => v.id === res.body.replayVideoId);
      expect(replayB).toBeUndefined();
    });
  });

  // -------------------------------------------------------------
  // 4. Multi-Tenant Bunny.net Video Library Architecture Tests
  // -------------------------------------------------------------
  describe('Multi-Tenant Bunny.net Video Library Architecture', () => {
    let dedicatedInstituteId;

    beforeAll(async () => {
      // Create a dedicated coaching institute with custom Bunny Video Library credentials
      const [inst] = await pool.query(
        `INSERT INTO institutes 
          (name, code, contact_email, bunny_library_id, bunny_api_key, bunny_token_key, bunny_cdn_hostname)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `Apex Coaching ${randSuffix}`,
          `APX_${randSuffix}`,
          `apex_${randSuffix}@edutor.ai`,
          889900,
          'mock_dedicated_api_key_123',
          'mock_dedicated_token_key_456',
          'apex-stream.b-cdn.net',
        ]
      );
      dedicatedInstituteId = inst.insertId;
    });

    afterAll(async () => {
      if (dedicatedInstituteId) {
        await pool.query('DELETE FROM institutes WHERE id = ?', [dedicatedInstituteId]);
      }
    });

    it('Falls back to Master Bunny config when institute has no dedicated credentials', async () => {
      const config = await getInstituteBunnyConfig(testInstituteId);
      expect(config).toBeDefined();
      expect(config.isDedicated).toBe(false);
      expect(config.libraryId).toBe(process.env.BUNNY_STREAM_LIBRARY_ID || '750798');
    });

    it('Resolves Dedicated Bunny Video Library when institute has custom credentials', async () => {
      const config = await getInstituteBunnyConfig(dedicatedInstituteId);
      expect(config).toBeDefined();
      expect(config.isDedicated).toBe(true);
      expect(config.libraryId).toBe(889900);
      expect(config.apiKey).toBe('mock_dedicated_api_key_123');
      expect(config.tokenKey).toBe('mock_dedicated_token_key_456');
      expect(config.cdnHostname).toBe('apex-stream.b-cdn.net');
    });

    it('Generates Tus upload auth matching dedicated library credentials', () => {
      const dedicatedConfig = {
        libraryId: 889900,
        apiKey: 'mock_dedicated_api_key_123',
        tokenKey: 'mock_dedicated_token_key_456',
        cdnHostname: 'apex-stream.b-cdn.net',
      };

      const tusAuth = getBunnyTusUploadAuth('vid_test_123', 3600, dedicatedConfig);
      expect(tusAuth.libraryId).toBe(889900);
      expect(tusAuth.videoId).toBe('vid_test_123');
      expect(tusAuth.signature).toBeDefined();
      expect(tusAuth.signature.length).toBe(64); // SHA-256 hex
    });

    it('Generates Signed HLS playback URL with dedicated CDN hostname and token', () => {
      const dedicatedConfig = {
        libraryId: 889900,
        apiKey: 'mock_dedicated_api_key_123',
        tokenKey: 'mock_dedicated_token_key_456',
        cdnHostname: 'apex-stream.b-cdn.net',
      };

      const hlsUrl = generateSignedHlsUrl({
        videoId: 'vid_test_456',
        expiresInSeconds: 3600,
        config: dedicatedConfig,
      });

      expect(hlsUrl).toContain('https://apex-stream.b-cdn.net/vid_test_456/playlist.m3u8?token=');
      expect(hlsUrl).toContain('expires=');
    });

    it('Institute Admin can call provision-video-library endpoint safely', async () => {
      const dedicatedAdminToken = jwt.sign(
        { id: adminId, full_name: 'Apex Admin', role: 'institute_admin', institute_id: dedicatedInstituteId },
        JWT_SECRET
      );

      const res = await request(app)
        .post(`/api/institutes/${dedicatedInstituteId}/provision-video-library`)
        .set('Authorization', `Bearer ${dedicatedAdminToken}`);

      // Without BUNNY_ACCOUNT_API_KEY, it safely falls back to master library config with status 200
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('library');
      expect(res.body.library).toHaveProperty('libraryId');
    });
  });
});
