import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateTimeType } from '../services/plannerService.js';
import { getRuntimeManifest } from '../controllers/mlOpsController.js';

test('evaluateTimeType leave_after keeps departure hour', () => {
  const out = evaluateTimeType('leave_after', 9, 15, 42);
  assert.equal(out.feasible, true);
  assert.equal(out.suggested_departure_hour, 9);
  assert.equal(out.suggested_departure_time, '09:15');
});

test('evaluateTimeType arrive_by computes feasible departure', () => {
  const out = evaluateTimeType('arrive_by', 10, 0, 35);
  assert.equal(out.feasible, true);
  assert.equal(out.suggested_departure_time, '09:25');
});

test('runtime manifest endpoint returns object payload', async () => {
  let payload = null;
  const req = {};
  const res = {
    json: (data) => {
      payload = data;
      return data;
    },
  };
  await getRuntimeManifest(req, res, (err) => {
    throw err;
  });
  assert.equal(typeof payload, 'object');
  assert.ok(payload.activeModels !== undefined);
});
