const request = require('supertest');
const app = require('../server');

describe('Dashboard and Analytics Statistics Aggregation', () => {
  let userCookie;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Stats User',
      email: 'stats@example.com',
      password: 'Password123!',
      agreedToTerms: 'true',
    });
    userCookie = res.headers['set-cookie'];
  });

  it('DASH-01: should return zero statistics for new user with no problems (no fake data)', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Cookie', userCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats.total).toBe(0);
    expect(res.body.data.stats.solved).toBe(0);
    expect(res.body.data.stats.attempted).toBe(0);
    expect(res.body.data.stats.revisionBacklog).toBe(0);
    expect(res.body.data.stats.byDifficulty).toEqual({ Easy: 0, Medium: 0, Hard: 0 });
    expect(res.body.data.stats.byTopic).toEqual({});
  });

  it('DASH-02, DASH-03, DASH-05: should accurately calculate statistics and analytics from stored records', async () => {
    // Add 3 problems
    // 1: Easy, Arrays, solved
    await request(app).post('/api/problems').set('Cookie', userCookie).send({
      title: 'Two Sum',
      platform: 'LeetCode',
      topic: 'Arrays',
      difficulty: 'Easy',
      status: 'solved',
      needsRevision: false,
    });
    // 2: Medium, Dynamic Programming, needs_revision
    await request(app).post('/api/problems').set('Cookie', userCookie).send({
      title: 'Coin Change',
      platform: 'LeetCode',
      topic: 'Dynamic Programming',
      difficulty: 'Medium',
      status: 'needs_revision',
      needsRevision: true,
    });
    // 3: Hard, Dynamic Programming, attempted
    await request(app).post('/api/problems').set('Cookie', userCookie).send({
      title: 'Burst Balloons',
      platform: 'LeetCode',
      topic: 'Dynamic Programming',
      difficulty: 'Hard',
      status: 'attempted',
      needsRevision: true,
    });

    // Check stats
    const statsRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Cookie', userCookie);

    expect(statsRes.statusCode).toBe(200);
    const stats = statsRes.body.data.stats;
    expect(stats.total).toBe(3);
    expect(stats.solved).toBe(1);
    expect(stats.attempted).toBe(1);
    expect(stats.needsRevision).toBe(1);
    expect(stats.revisionBacklog).toBe(2);
    expect(stats.byDifficulty.Easy).toBe(1);
    expect(stats.byDifficulty.Medium).toBe(1);
    expect(stats.byDifficulty.Hard).toBe(1);
    expect(stats.byTopic['Dynamic Programming']).toBe(2);
    expect(stats.byTopic['Arrays']).toBe(1);

    // Check analytics
    const analyticsRes = await request(app)
      .get('/api/dashboard/analytics?days=30')
      .set('Cookie', userCookie);

    expect(analyticsRes.statusCode).toBe(200);
    const analytics = analyticsRes.body.data;
    expect(analytics.topicBreakdown.length).toBe(2);
    expect(analytics.difficultyBreakdown.length).toBe(3);
    expect(analytics.statusBreakdown.length).toBeGreaterThanOrEqual(2);
  });
});
