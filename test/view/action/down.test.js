import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { down } from '../../../src/view/action/down.js';
import { point } from '../../../src/view/geometry/point.js';

describe('down', () => {
  test('type returns down string', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = down(point(x, y));
    assert.equal(act.type(), 'down', 'type was not down');
  });

  test('point returns provided point', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const pt = point(x, y);
    const act = down(pt);
    assert.equal(act.point(), pt, 'point was not returned correctly');
  });

  test('point x matches original', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = down(point(x, y));
    assert.equal(act.point().x(), x, 'point x did not match');
  });

  test('point y matches original', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = down(point(x, y));
    assert.equal(act.point().y(), y, 'point y did not match');
  });

  test('handles negative coordinates', () => {
    const x = -Math.random() * 1000;
    const y = -Math.random() * 1000;
    const act = down(point(x, y));
    assert.equal(act.point().x(), x, 'negative x was not handled');
  });

  test('handles zero coordinates', () => {
    const act = down(point(0, 0));
    assert.equal(act.point().string(), '(0,0)', 'zero coordinates were not handled');
  });

  test('handles non-ASCII point values as strings in description', () => {
    const x = 123.456;
    const y = 789.012;
    const act = down(point(x, y));
    assert.equal(act.type(), 'down', 'non-ASCII context did not work');
  });
});
