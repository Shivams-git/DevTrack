import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { memoryStore } from '../services/memoryStore.js';
import { sampleIssues } from '../scripts/seedData.js';
import { TYPES, STATUSES, PRIORITIES } from '../utils/constants.js';

describe('User Isolation and Test Mode Scoping', () => {
  beforeEach(() => {
    memoryStore.reset();
    // Seed demo issues with isDemo: true
    for (const sample of sampleIssues.slice(0, 3)) {
      memoryStore.createIssue({ ...sample, isDemo: true, userId: null });
    }
  });

  test('Guest account in normal mode receives empty issue list', async () => {
    const res = await request(app).get('/api/issues');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 0);
    assert.equal(res.body.pagination.total, 0);
  });

  test('Guest dashboard in normal mode receives 0 metrics', async () => {
    const res = await request(app).get('/api/dashboard');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.metrics.total, 0);
    assert.equal(res.body.data.urgentTasks.length, 0);
  });

  test('Test Mode returns the sample demo issues', async () => {
    const res = await request(app)
      .get('/api/issues')
      .set('x-test-mode', 'true');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 3);
    assert.equal(res.body.isTestMode, true);
  });

  test('New registrant has empty dashboard and isolated issues', async () => {
    // 1. Register User A
    const userARes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Alpha',
        email: `alpha_${Date.now()}@devtrack.dev`,
        password: 'password123',
      });
    assert.equal(userARes.status, 201);
    const tokenA = userARes.body.data.token;

    // 2. Check User A starts with 0 issues
    const listAEmpty = await request(app)
      .get('/api/issues')
      .set('Authorization', `Bearer ${tokenA}`);
    assert.equal(listAEmpty.status, 200);
    assert.equal(listAEmpty.body.data.length, 0);

    // 3. User A creates an issue
    const createARes = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: "User Alpha's private task",
        type: TYPES.TASK,
        status: STATUSES.TODO,
        priority: PRIORITIES.HIGH,
      });
    assert.equal(createARes.status, 201);
    const issueA = createARes.body.data;

    // 4. Register User B
    const userBRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Beta',
        email: `beta_${Date.now()}@devtrack.dev`,
        password: 'password123',
      });
    assert.equal(userBRes.status, 201);
    const tokenB = userBRes.body.data.token;

    // 5. User B must NOT see User A's issue (User B starts with 0 issues)
    const listB = await request(app)
      .get('/api/issues')
      .set('Authorization', `Bearer ${tokenB}`);
    assert.equal(listB.status, 200);
    assert.equal(listB.body.data.length, 0);

    // 6. User B cannot access User A's issue by ID
    const getIssueFromB = await request(app)
      .get(`/api/issues/${issueA.key}`)
      .set('Authorization', `Bearer ${tokenB}`);
    assert.equal(getIssueFromB.status, 404);

    // 7. User A sees their own issue
    const listA = await request(app)
      .get('/api/issues')
      .set('Authorization', `Bearer ${tokenA}`);
    assert.equal(listA.status, 200);
    assert.equal(listA.body.data.length, 1);
    assert.equal(listA.body.data[0].title, "User Alpha's private task");
  });
});
