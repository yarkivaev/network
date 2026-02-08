import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { move } from '../../../src/view/action/move.js';
import { point } from '../../../src/view/geometry/point.js';

describe('move', () => {
  test('type returns move string', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = move(point(x, y));
    assert.equal(act.type(), 'move', 'type was not move');
  });

  test('point returns provided point', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const pt = point(x, y);
    const act = move(pt);
    assert.equal(act.point(), pt, 'point was not returned correctly');
  });

  test('point x matches original', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = move(point(x, y));
    assert.equal(act.point().x(), x, 'point x did not match');
  });

  test('point y matches original', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = move(point(x, y));
    assert.equal(act.point().y(), y, 'point y did not match');
  });

  test('handles negative coordinates', () => {
    const x = -Math.random() * 1000;
    const y = -Math.random() * 1000;
    const act = move(point(x, y));
    assert.equal(act.point().x(), x, 'negative x was not handled');
  });

  test('handles zero coordinates', () => {
    const act = move(point(0, 0));
    assert.equal(act.point().string(), '(0,0)', 'zero coordinates were not handled');
  });

  test('handles large coordinates', () => {
    const x = Math.random() * 1000000;
    const y = Math.random() * 1000000;
    const act = move(point(x, y));
    assert.equal(act.point().x(), x, 'large coordinates were not handled');
  });
});
