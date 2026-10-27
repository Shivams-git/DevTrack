import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { memoryStore } from '../services/memoryStore.js';
import { STATUSES, PRIORITIES, TYPES } from '../utils/constants.js';

test.beforeEach(() => {
  memoryStore.reset();
});

test('API GET /api/health returns healthy payload', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(res.body.database);
});

test('API Issue Lifecycle (Create, Read, Update, Delete)', async () => {
  // 1. Create issue
  const createRes = await request(app)
    .post('/api/issues')
    .send({
      title: 'Fix authentication cookie flag',
      description: 'SameSite=None requires Secure attribute in HTTPS.',
      type: TYPES.BUG,
      status: STATUSES.TODO,
      priority: PRIORITIES.HIGH,
      estimatedHours: 3,
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.success, true);
  const created = createRes.body.data;
  assert.ok(created.key.startsWith('DEV-'));
  assert.equal(created.title, 'Fix authentication cookie flag');

  // 2. Fetch issue list
  const listRes = await request(app).get('/api/issues');
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.data.length, 1);

  // 3. Update status to Done
  const patchRes = await request(app)
    .patch(`/api/issues/${created.key}`)
    .send({
      status: STATUSES.DONE,
    });

  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.data.status, STATUSES.DONE);
  // Urgency should now be 0 for completed issue
  assert.equal(patchRes.body.data.urgencyScore, 0);

  // 4. Verify activity was logged
  const actRes = await request(app).get('/api/activity');
  assert.equal(actRes.status, 200);
  assert.ok(actRes.body.data.length >= 2); // 1 create + 1 status change

  // 5. Delete issue
  const delRes = await request(app).delete(`/api/issues/${created.key}`);
  assert.equal(delRes.status, 200);

  // 6. Verify deleted
  const getDeleted = await request(app).get(`/api/issues/${created.key}`);
  assert.equal(getDeleted.status, 404);
});

test('API Validation errors reject invalid payloads', async () => {
  // Missing/short title
  const res = await request(app)
    .post('/api/issues')
    .send({
      title: 'a',
      type: TYPES.TASK,
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});
