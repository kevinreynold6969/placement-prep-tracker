const request = require('supertest');
const app = require('../server');

describe('Authentication API Endpoints', () => {
  const validUser = {
    name: 'Test Candidate',
    email: 'candidate@example.com',
    password: 'Password123!',
    agreedToTerms: 'true',
  };

  describe('POST /api/auth/register', () => {
    it('AUTH-01: should register a new user with valid data and set HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.name).toBe(validUser.name);
      expect(res.body.data.user.email).toBe(validUser.email.toLowerCase());
      expect(res.body.data.user.password).toBeUndefined();

      // Verify cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith('token='))).toBe(true);
      expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
    });

    it('AUTH-02: should reject duplicate email with 409 Conflict', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('AUTH-03: should reject registration without name with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'noname@example.com',
          password: 'Password123!',
          agreedToTerms: 'true',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('AUTH-04: should reject password < 8 characters with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'shortpass@example.com',
          password: 'short',
          agreedToTerms: 'true',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
    });

    it('AUTH-05: should reject registration without agreeing to terms with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'No Terms',
          email: 'noterms@example.com',
          password: 'Password123!',
          agreedToTerms: 'false',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e) => e.field === 'agreedToTerms')).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('AUTH-06: should log in with correct credentials and return token cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email.toLowerCase());

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith('token='))).toBe(true);
    });

    it('AUTH-07: should reject login with wrong password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('AUTH-08: should reject login with non-existent email with 401 (preventing user enumeration)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me and POST /api/auth/logout', () => {
    it('AUTH-09 & AUTH-10: should allow access to /me with valid cookie and reject without cookie', async () => {
      // Reject without cookie
      const unauthRes = await request(app).get('/api/auth/me');
      expect(unauthRes.statusCode).toBe(401);

      // Register and get cookie
      const regRes = await request(app).post('/api/auth/register').send(validUser);
      const cookie = regRes.headers['set-cookie'];

      // Allow with cookie
      const authRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(authRes.statusCode).toBe(200);
      expect(authRes.body.data.user.email).toBe(validUser.email.toLowerCase());
    });

    it('AUTH-12 & AUTH-13: should clear cookie on logout and reject subsequent calls', async () => {
      const regRes = await request(app).post('/api/auth/register').send(validUser);
      const cookie = regRes.headers['set-cookie'];

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(logoutRes.statusCode).toBe(200);
      const expiredCookie = logoutRes.headers['set-cookie'];
      expect(expiredCookie.some((c) => c.includes('Expires='))).toBe(true);
    });
  });
});
