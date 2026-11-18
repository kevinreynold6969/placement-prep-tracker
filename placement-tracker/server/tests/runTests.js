process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-64-characters-long-for-jwt-signing-security-requirements-test';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../server');

const testResults = [];

function assert(id, description, condition, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${id}: ${description}`);
    testResults.push({ id, description, status: 'PASSED', details });
  } else {
    console.error(`  ❌ [FAIL] ${id}: ${description} - ${details}`);
    testResults.push({ id, description, status: 'FAILED', details });
    throw new Error(`Test failed: ${id} - ${description}`);
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING PLACEMENT TRACKER BACKEND TEST SUITE');
  console.log('====================================================\n');

  console.log('📦 Starting In-Memory MongoDB Server...');
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(`📡 In-Memory MongoDB running at: ${uri}`);

  await mongoose.connect(uri);
  console.log('🔌 Mongoose connected successfully!\n');

  try {
    // ─────────────────────────────────────────────────────────────────
    // 1. AUTHENTICATION TEST SUITE
    // ─────────────────────────────────────────────────────────────────
    console.log('─── 1. AUTHENTICATION TEST SUITE ───');

    const validCandidate = {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      password: 'SecurePassword123!',
      agreedToTerms: 'true',
    };

    // AUTH-01: Register with valid data
    const regRes = await request(app).post('/api/auth/register').send(validCandidate);
    assert('AUTH-01', 'Register with valid data returns 201, user profile, and HttpOnly cookie',
      regRes.statusCode === 201 &&
      regRes.body.success === true &&
      regRes.body.data.user.email === validCandidate.email.toLowerCase() &&
      !regRes.body.data.user.password &&
      regRes.headers['set-cookie'] &&
      regRes.headers['set-cookie'].some(c => c.startsWith('token=') && c.includes('HttpOnly'))
    );
    const authCookie = regRes.headers['set-cookie'];

    // AUTH-02: Register with duplicate email
    const dupRes = await request(app).post('/api/auth/register').send(validCandidate);
    assert('AUTH-02', 'Register with duplicate email returns 409 Conflict',
      dupRes.statusCode === 409 &&
      dupRes.body.success === false &&
      /already exists/i.test(dupRes.body.message)
    );

    // AUTH-03: Register without name
    const noNameRes = await request(app).post('/api/auth/register').send({
      email: 'noname@example.com',
      password: 'Password123!',
      agreedToTerms: 'true',
    });
    assert('AUTH-03', 'Register without name returns 400 validation error',
      noNameRes.statusCode === 400 &&
      noNameRes.body.errors.some(e => e.field === 'name')
    );

    // AUTH-04: Register with password < 8 chars
    const shortPassRes = await request(app).post('/api/auth/register').send({
      name: 'Short Pass',
      email: 'short@example.com',
      password: '123',
      agreedToTerms: 'true',
    });
    assert('AUTH-04', 'Register with password < 8 characters returns 400 validation error',
      shortPassRes.statusCode === 400 &&
      shortPassRes.body.errors.some(e => e.field === 'password')
    );

    // AUTH-05: Register without accepting terms
    const noTermsRes = await request(app).post('/api/auth/register').send({
      name: 'No Terms',
      email: 'noterms@example.com',
      password: 'Password123!',
      agreedToTerms: 'false',
    });
    assert('AUTH-05', 'Register without accepting terms returns 400 validation error',
      noTermsRes.statusCode === 400 &&
      noTermsRes.body.errors.some(e => e.field === 'agreedToTerms')
    );

    // AUTH-06: Login with correct credentials
    const loginRes = await request(app).post('/api/auth/login').send({
      email: validCandidate.email,
      password: validCandidate.password,
    });
    assert('AUTH-06', 'Login with correct credentials returns 200 and token cookie',
      loginRes.statusCode === 200 &&
      loginRes.body.success === true &&
      loginRes.body.data.user.email === validCandidate.email.toLowerCase() &&
      loginRes.headers['set-cookie']
    );

    // AUTH-07: Login with wrong password
    const wrongPassRes = await request(app).post('/api/auth/login').send({
      email: validCandidate.email,
      password: 'WrongPassword!',
    });
    assert('AUTH-07', 'Login with wrong password returns 401 "Invalid credentials"',
      wrongPassRes.statusCode === 401 &&
      wrongPassRes.body.message === 'Invalid credentials'
    );

    // AUTH-08: Login with non-existent email
    const wrongEmailRes = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'Password123!',
    });
    assert('AUTH-08', 'Login with non-existent email returns 401 "Invalid credentials" (prevents enumeration)',
      wrongEmailRes.statusCode === 401 &&
      wrongEmailRes.body.message === 'Invalid credentials'
    );

    // AUTH-09: Access /api/auth/me with valid cookie
    const meRes = await request(app).get('/api/auth/me').set('Cookie', authCookie);
    assert('AUTH-09', 'Access /api/auth/me with valid cookie returns 200 and current user profile',
      meRes.statusCode === 200 &&
      meRes.body.data.user.email === validCandidate.email.toLowerCase()
    );

    // AUTH-10: Access /api/auth/me without cookie
    const unauthMeRes = await request(app).get('/api/auth/me');
    assert('AUTH-10', 'Access /api/auth/me without cookie returns 401 Unauthorized',
      unauthMeRes.statusCode === 401 &&
      unauthMeRes.body.success === false
    );

    // AUTH-11: Access /api/auth/me with tampered JWT
    const tamperedRes = await request(app).get('/api/auth/me').set('Cookie', ['token=tampered.fake.jwt']);
    assert('AUTH-11', 'Access protected endpoint with invalid/tampered token returns 401',
      tamperedRes.statusCode === 401
    );

    // AUTH-12: Logout clears cookie
    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', authCookie);
    assert('AUTH-12', 'Logout clears authentication cookie (sets expiration in the past)',
      logoutRes.statusCode === 200 &&
      logoutRes.headers['set-cookie'] &&
      logoutRes.headers['set-cookie'].some(c => c.includes('Expires='))
    );

    // ─────────────────────────────────────────────────────────────────
    // 2. PROBLEM MANAGEMENT & OWNERSHIP ISOLATION
    // ─────────────────────────────────────────────────────────────────
    console.log('\n─── 2. PROBLEM MANAGEMENT & DATA ISOLATION TEST SUITE ───');

    // Register User 2 to verify ownership isolation
    const user2Res = await request(app).post('/api/auth/register').send({
      name: 'Bob Miller',
      email: 'bob@example.com',
      password: 'Password123!',
      agreedToTerms: 'true',
    });
    const user2Cookie = user2Res.headers['set-cookie'];

    // PROB-05: Empty list for new user
    const emptyListRes = await request(app).get('/api/problems').set('Cookie', authCookie);
    assert('PROB-05', 'Get problem list for new user returns empty array (no fake data)',
      emptyListRes.statusCode === 200 &&
      Array.isArray(emptyListRes.body.data.problems) &&
      emptyListRes.body.data.problems.length === 0 &&
      emptyListRes.body.data.pagination.total === 0
    );

    // PROB-01: Create problem with all valid fields
    const fullProblem = {
      title: 'Two Sum',
      platform: 'LeetCode',
      url: 'https://leetcode.com/problems/two-sum/',
      topic: 'Hashing',
      difficulty: 'Easy',
      status: 'solved',
      notes: 'Used hash map for complement lookup in O(n).',
      approach: 'Single pass hash table.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      needsRevision: false,
    };
    const createFullRes = await request(app).post('/api/problems').set('Cookie', authCookie).send(fullProblem);
    assert('PROB-01', 'Create problem with all valid fields returns 201 and created document',
      createFullRes.statusCode === 201 &&
      createFullRes.body.success === true &&
      createFullRes.body.data.problem.title === fullProblem.title &&
      createFullRes.body.data.problem.topic === fullProblem.topic
    );
    const problem1Id = createFullRes.body.data.problem._id;

    // PROB-02: Create problem with only required fields
    const minimalProblem = {
      title: 'Reverse Linked List',
      platform: 'LeetCode',
      topic: 'Linked Lists',
      difficulty: 'Easy',
      status: 'solved',
    };
    const createMinRes = await request(app).post('/api/problems').set('Cookie', authCookie).send(minimalProblem);
    assert('PROB-02', 'Create problem with only required fields succeeds with 201',
      createMinRes.statusCode === 201 &&
      createMinRes.body.data.problem.title === minimalProblem.title
    );

    // PROB-03: Create problem without title
    const noTitleRes = await request(app).post('/api/problems').set('Cookie', authCookie).send({
      platform: 'LeetCode',
      topic: 'Arrays',
      difficulty: 'Easy',
      status: 'solved',
    });
    assert('PROB-03', 'Create problem without title returns 400 validation error',
      noTitleRes.statusCode === 400 &&
      noTitleRes.body.errors.some(e => e.field === 'title')
    );

    // PROB-04: Create problem with invalid topic
    const invalidTopicRes = await request(app).post('/api/problems').set('Cookie', authCookie).send({
      title: 'Invalid Topic Problem',
      platform: 'LeetCode',
      topic: 'Artificial Intelligence',
      difficulty: 'Easy',
      status: 'attempted',
    });
    assert('PROB-04', 'Create problem with invalid DSA topic returns 400 validation error',
      invalidTopicRes.statusCode === 400 &&
      invalidTopicRes.body.errors.some(e => e.field === 'topic')
    );

    // Add a revision problem for filtering
    await request(app).post('/api/problems').set('Cookie', authCookie).send({
      title: 'Coin Change',
      platform: 'LeetCode',
      topic: 'Dynamic Programming',
      difficulty: 'Medium',
      status: 'needs_revision',
      needsRevision: true,
    });

    // PROB-06: Get list of problems after creating
    const listRes = await request(app).get('/api/problems').set('Cookie', authCookie);
    assert('PROB-06', 'Get problem list returns all user problems',
      listRes.statusCode === 200 &&
      listRes.body.data.problems.length === 3 &&
      listRes.body.data.pagination.total === 3
    );

    // PROB-07: Get single problem by valid ID
    const getSingleRes = await request(app).get(`/api/problems/${problem1Id}`).set('Cookie', authCookie);
    assert('PROB-07', 'Get single problem by ID returns 200 and problem data',
      getSingleRes.statusCode === 200 &&
      getSingleRes.body.data.problem._id === problem1Id
    );

    // PROB-08: Get problem with invalid ID format
    const invalidIdRes = await request(app).get('/api/problems/not-a-valid-id').set('Cookie', authCookie);
    assert('PROB-08', 'Get problem with invalid ID format returns 400 error',
      invalidIdRes.statusCode === 400 &&
      /invalid.*id/i.test(invalidIdRes.body.message)
    );

    // PROB-09, PROB-11, PROB-13: DATA ISOLATION / OWNERSHIP ENFORCEMENT
    // User 2 attempts to read User 1 problem
    const u2ReadRes = await request(app).get(`/api/problems/${problem1Id}`).set('Cookie', user2Cookie);
    assert('PROB-09', 'User 2 CANNOT read User 1 problem (returns 404 to avoid leaking existence)',
      u2ReadRes.statusCode === 404
    );

    // User 2 attempts to update User 1 problem
    const u2UpdateRes = await request(app).put(`/api/problems/${problem1Id}`).set('Cookie', user2Cookie).send({
      title: 'Compromised Title',
    });
    assert('PROB-11', 'User 2 CANNOT update User 1 problem (returns 404)',
      u2UpdateRes.statusCode === 404
    );

    // User 2 attempts to delete User 1 problem
    const u2DeleteRes = await request(app).delete(`/api/problems/${problem1Id}`).set('Cookie', user2Cookie);
    assert('PROB-13', 'User 2 CANNOT delete User 1 problem (returns 404)',
      u2DeleteRes.statusCode === 404
    );

    // PROB-10: Update own problem
    const updateOwnRes = await request(app).put(`/api/problems/${problem1Id}`).set('Cookie', authCookie).send({
      notes: 'Updated notes with follow-up optimization.',
    });
    assert('PROB-10', 'User 1 can update their own problem',
      updateOwnRes.statusCode === 200 &&
      updateOwnRes.body.data.problem.notes === 'Updated notes with follow-up optimization.'
    );

    // PROB-14: Filter problems by topic
    const topicFilterRes = await request(app).get('/api/problems?topic=Dynamic Programming').set('Cookie', authCookie);
    assert('PROB-14', 'Filter problems by topic returns only matching topic records',
      topicFilterRes.statusCode === 200 &&
      topicFilterRes.body.data.problems.length === 1 &&
      topicFilterRes.body.data.problems[0].title === 'Coin Change'
    );

    // PROB-15: Filter problems by difficulty
    const diffFilterRes = await request(app).get('/api/problems?difficulty=Easy').set('Cookie', authCookie);
    assert('PROB-15', 'Filter problems by difficulty returns only Easy records',
      diffFilterRes.statusCode === 200 &&
      diffFilterRes.body.data.problems.length === 2 &&
      diffFilterRes.body.data.problems.every(p => p.difficulty === 'Easy')
    );

    // PROB-16: Filter problems by status
    const statusFilterRes = await request(app).get('/api/problems?status=needs_revision').set('Cookie', authCookie);
    assert('PROB-16', 'Filter problems by status returns only needs_revision records',
      statusFilterRes.statusCode === 200 &&
      statusFilterRes.body.data.problems.length === 1 &&
      statusFilterRes.body.data.problems[0].title === 'Coin Change'
    );

    // PROB-17: Search problems by title
    const searchRes = await request(app).get('/api/problems?search=two').set('Cookie', authCookie);
    assert('PROB-17', 'Case-insensitive search by title returns matching records',
      searchRes.statusCode === 200 &&
      searchRes.body.data.problems.length === 1 &&
      searchRes.body.data.problems[0].title === 'Two Sum'
    );

    // PROB-18: Get revision problems
    const revFilterRes = await request(app).get('/api/problems?needsRevision=true').set('Cookie', authCookie);
    assert('PROB-18', 'Filter by needsRevision=true returns revision backlog records',
      revFilterRes.statusCode === 200 &&
      revFilterRes.body.data.problems.length === 1 &&
      revFilterRes.body.data.problems[0].title === 'Coin Change'
    );

    // PROB-19: Pagination
    const pageRes = await request(app).get('/api/problems?page=1&limit=2').set('Cookie', authCookie);
    assert('PROB-19', 'Pagination returns requested limit and pagination metadata',
      pageRes.statusCode === 200 &&
      pageRes.body.data.problems.length === 2 &&
      pageRes.body.data.pagination.page === 1 &&
      pageRes.body.data.pagination.limit === 2 &&
      pageRes.body.data.pagination.total === 3 &&
      pageRes.body.data.pagination.totalPages === 2 &&
      pageRes.body.data.pagination.hasNext === true
    );

    // PROB-12: Delete own problem
    const deleteOwnRes = await request(app).delete(`/api/problems/${problem1Id}`).set('Cookie', authCookie);
    assert('PROB-12', 'User can delete their own problem',
      deleteOwnRes.statusCode === 200 &&
      deleteOwnRes.body.success === true
    );

    // ─────────────────────────────────────────────────────────────────
    // 3. DASHBOARD STATISTICS & AGGREGATION PIPELINES
    // ─────────────────────────────────────────────────────────────────
    console.log('\n─── 3. DASHBOARD & ANALYTICS TEST SUITE ───');

    // DASH-01: Stats for empty user
    const emptyStatsRes = await request(app).get('/api/dashboard/stats').set('Cookie', user2Cookie);
    assert('DASH-01', 'Dashboard statistics for user with 0 problems returns zero counts (no fake stats)',
      emptyStatsRes.statusCode === 200 &&
      emptyStatsRes.body.data.stats.total === 0 &&
      emptyStatsRes.body.data.stats.solved === 0 &&
      emptyStatsRes.body.data.stats.attempted === 0 &&
      emptyStatsRes.body.data.stats.revisionBacklog === 0 &&
      emptyStatsRes.body.data.stats.byDifficulty.Easy === 0
    );

    // DASH-02 & DASH-03: Accurate stats calculated from stored records
    // User 1 currently has 2 problems (Reverse Linked List: Easy/solved, Coin Change: Medium/needs_revision)
    const user1StatsRes = await request(app).get('/api/dashboard/stats').set('Cookie', authCookie);
    const s = user1StatsRes.body.data.stats;
    assert('DASH-02 & DASH-03', 'Dashboard statistics reflect exact numbers from MongoDB aggregation',
      user1StatsRes.statusCode === 200 &&
      s.total === 2 &&
      s.solved === 1 &&
      s.needsRevision === 1 &&
      s.revisionBacklog === 1 &&
      s.byDifficulty.Easy === 1 &&
      s.byDifficulty.Medium === 1 &&
      s.byTopic['Linked Lists'] === 1 &&
      s.byTopic['Dynamic Programming'] === 1
    );

    // DASH-04 & DASH-05: Analytics breakdowns
    const analyticsRes = await request(app).get('/api/dashboard/analytics?days=30').set('Cookie', authCookie);
    assert('DASH-04 & DASH-05', 'Analytics endpoint returns topic breakdown, difficulty distribution, and status data',
      analyticsRes.statusCode === 200 &&
      Array.isArray(analyticsRes.body.data.topicBreakdown) &&
      analyticsRes.body.data.topicBreakdown.length === 2 &&
      Array.isArray(analyticsRes.body.data.difficultyBreakdown) &&
      Array.isArray(analyticsRes.body.data.statusBreakdown)
    );

    // ─────────────────────────────────────────────────────────────────
    // 4. RELIABILITY & ERROR HANDLING
    // ─────────────────────────────────────────────────────────────────
    console.log('\n─── 4. RELIABILITY & ERROR HANDLING TEST SUITE ───');

    // REL-02: Non-existent route
    const notFoundRes = await request(app).get('/api/non-existent-route');
    assert('REL-02', 'Request to non-existent route returns 404 with structured error envelope',
      notFoundRes.statusCode === 404 &&
      notFoundRes.body.success === false &&
      /not found/i.test(notFoundRes.body.message)
    );

    // Health check reports the live MongoDB connection state
    const healthRes = await request(app).get('/api/health');
    assert('REL-HEALTH-READY', 'Health check returns 200 when MongoDB is connected',
      healthRes.statusCode === 200 &&
      healthRes.body.success === true &&
      healthRes.body.database === 'connected'
    );

    await mongoose.disconnect();
    const unavailableHealthRes = await request(app).get('/api/health');
    assert('REL-HEALTH-DB', 'Health check returns 503 when MongoDB is disconnected',
      unavailableHealthRes.statusCode === 503 &&
      unavailableHealthRes.body.success === false &&
      unavailableHealthRes.body.database === 'disconnected'
    );
    await mongoose.connect(uri);

    console.log('\n====================================================');
    console.log(`🎉 ALL ${testResults.length} BACKEND TESTS PASSED!`);
    console.log('====================================================\n');

  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('🧹 Cleanup completed: In-memory MongoDB stopped.');
  }
}

runAllTests().catch((err) => {
  console.error('\n💥 Test execution halted with error:', err.message);
  process.exit(1);
});
