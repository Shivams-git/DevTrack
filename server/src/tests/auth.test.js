import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';
import { memoryStore } from '../services/memoryStore.js';

describe('API Authentication Endpoints', () => {
  before(() => {
    memoryStore.seedDemoUsers();
  });

  test('POST /api/auth/login succeeds with valid demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@devtrack.dev', password: 'password123' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, 'alex@devtrack.dev');
  });

  test('POST /api/auth/login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@devtrack.dev', password: 'wrongpassword' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/auth/register creates a new user and returns JWT token', async () => {
    const testEmail = `tester_${Date.now()}@devtrack.dev`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Automation User',
        email: testEmail,
        password: 'securepassword123',
        role: 'qa_engineer',
        team: 'QA Systems',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, testEmail);
  });

  test('POST /api/auth/register defaults theme to tokyo', async () => {
    const testEmail = `tester_theme_${Date.now()}@devtrack.dev`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Theme Test User',
        email: testEmail,
        password: 'securepassword123',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.user.theme, 'tokyo');
  });

  test('PATCH /api/auth/theme updates user theme preference', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@devtrack.dev', password: 'password123' });

    const token = loginRes.body.data.token;

    const themeRes = await request(app)
      .patch('/api/auth/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'midnight' });

    assert.strictEqual(themeRes.status, 200);
    assert.strictEqual(themeRes.body.data.theme, 'midnight');

    // Verify GET /api/auth/me returns updated theme
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.data.theme, 'midnight');
  });
});

