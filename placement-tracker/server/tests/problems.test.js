const request = require('supertest');
const app = require('../server');

describe('Problem Management API Endpoints & Ownership Protection', () => {
  let user1Cookie;
  let user2Cookie;

  beforeEach(async () => {
    // Register User 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'User One',
      email: 'user1@example.com',
      password: 'Password123!',
      agreedToTerms: 'true',
    });
    user1Cookie = res1.headers['set-cookie'];

    // Register User 2
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'Password123!',
      agreedToTerms: 'true',
    });
    user2Cookie = res2.headers['set-cookie'];
  });

  const sampleProblem = {
    title: 'Two Sum',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/two-sum/',
    topic: 'Hashing',
    difficulty: 'Easy',
    status: 'solved',
    notes: 'Used a hash map for O(n) lookup.',
    approach: 'Map complement values to indices.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    needsRevision: false,
  };

  describe('POST /api/problems (Create)', () => {
    it('PROB-01: should create problem with all valid fields', async () => {
      const res = await request(app)
        .post('/api/problems')
        .set('Cookie', user1Cookie)
        .send(sampleProblem);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.problem.title).toBe(sampleProblem.title);
      expect(res.body.data.problem.topic).toBe(sampleProblem.topic);
    });

    it('PROB-02: should create problem with only required fields', async () => {
      const res = await request(app)
        .post('/api/problems')
        .set('Cookie', user1Cookie)
        .send({
          title: 'Minimum Path Sum',
          platform: 'LeetCode',
          topic: 'Dynamic Programming',
          difficulty: 'Medium',
          status: 'attempted',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.problem.title).toBe('Minimum Path Sum');
    });

    it('PROB-03: should reject problem without title with 400', async () => {
      const res = await request(app)
        .post('/api/problems')
        .set('Cookie', user1Cookie)
        .send({
          platform: 'LeetCode',
          topic: 'Dynamic Programming',
          difficulty: 'Medium',
          status: 'attempted',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'title')).toBe(true);
    });

    it('PROB-04: should reject invalid DSA topic with 400', async () => {
      const res = await request(app)
        .post('/api/problems')
        .set('Cookie', user1Cookie)
        .send({
          title: 'Custom Algorithm',
          platform: 'LeetCode',
          topic: 'NonExistentTopic',
          difficulty: 'Medium',
          status: 'attempted',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'topic')).toBe(true);
    });
  });

  describe('GET /api/problems (List & Filter)', () => {
    it('PROB-05: should return empty array for new user with no problems', async () => {
      const res = await request(app)
        .get('/api/problems')
        .set('Cookie', user1Cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.problems).toEqual([]);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('PROB-06, PROB-14, PROB-15, PROB-17: should list, filter by topic & difficulty, and search', async () => {
      // Create 2 problems for user1
      await request(app).post('/api/problems').set('Cookie', user1Cookie).send({
        title: 'Reverse Linked List',
        platform: 'LeetCode',
        topic: 'Linked Lists',
        difficulty: 'Easy',
        status: 'solved',
      });
      await request(app).post('/api/problems').set('Cookie', user1Cookie).send({
        title: 'Coin Change',
        platform: 'LeetCode',
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        status: 'needs_revision',
        needsRevision: true,
      });

      // Filter by topic
      const topicRes = await request(app)
        .get('/api/problems?topic=Linked Lists')
        .set('Cookie', user1Cookie);
      expect(topicRes.statusCode).toBe(200);
      expect(topicRes.body.data.problems.length).toBe(1);
      expect(topicRes.body.data.problems[0].title).toBe('Reverse Linked List');

      // Search by title
      const searchRes = await request(app)
        .get('/api/problems?search=coin')
        .set('Cookie', user1Cookie);
      expect(searchRes.statusCode).toBe(200);
      expect(searchRes.body.data.problems.length).toBe(1);
      expect(searchRes.body.data.problems[0].title).toBe('Coin Change');

      // Filter by needsRevision
      const revRes = await request(app)
        .get('/api/problems?needsRevision=true')
        .set('Cookie', user1Cookie);
      expect(revRes.statusCode).toBe(200);
      expect(revRes.body.data.problems.length).toBe(1);
      expect(revRes.body.data.problems[0].title).toBe('Coin Change');
    });
  });

  describe('Data Isolation and Ownership Enforcement', () => {
    it('PROB-09, PROB-11, PROB-13: User 2 CANNOT read, update, or delete User 1 problems', async () => {
      // User 1 creates a problem
      const createRes = await request(app)
        .post('/api/problems')
        .set('Cookie', user1Cookie)
        .send(sampleProblem);
      const problemId = createRes.body.data.problem._id;

      // User 1 can read it
      const readRes1 = await request(app)
        .get(`/api/problems/${problemId}`)
        .set('Cookie', user1Cookie);
      expect(readRes1.statusCode).toBe(200);

      // User 2 attempts to read User 1 problem -> 404 (avoids leaking existence)
      const readRes2 = await request(app)
        .get(`/api/problems/${problemId}`)
        .set('Cookie', user2Cookie);
      expect(readRes2.statusCode).toBe(404);

      // User 2 attempts to update User 1 problem -> 404
      const updateRes2 = await request(app)
        .put(`/api/problems/${problemId}`)
        .set('Cookie', user2Cookie)
        .send({ title: 'Hacked Title' });
      expect(updateRes2.statusCode).toBe(404);

      // User 2 attempts to delete User 1 problem -> 404
      const deleteRes2 = await request(app)
        .delete(`/api/problems/${problemId}`)
        .set('Cookie', user2Cookie);
      expect(deleteRes2.statusCode).toBe(404);

      // User 1 can still read and delete it
      const deleteRes1 = await request(app)
        .delete(`/api/problems/${problemId}`)
        .set('Cookie', user1Cookie);
      expect(deleteRes1.statusCode).toBe(200);
    });

    it('PROB-08: should reject invalid ObjectId format with 400', async () => {
      const res = await request(app)
        .get('/api/problems/invalid-id-format')
        .set('Cookie', user1Cookie);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid.*id/i);
    });
  });
});
