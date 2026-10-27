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

  test('GET /api/auth/users lists team directory', async () => {
    const res = await request(app).get('/api/auth/users');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
  });
});
