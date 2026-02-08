import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { up } from '../../../src/view/action/up.js';
import { point } from '../../../src/view/geometry/point.js';

describe('up', () => {
  test('type returns up string', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = up(point(x, y));
    assert.equal(act.type(), 'up', 'type was not up');
  });

  test('point returns provided point', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const pt = point(x, y);
    const act = up(pt);
    assert.equal(act.point(), pt, 'point was not returned correctly');
  });

  test('point x matches original', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = up(point(x, y));
    assert.equal(act.point().x(), x, 'point x did not match');
  });

  test('point y matches original', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const act = up(point(x, y));
    assert.equal(act.point().y(), y, 'point y did not match');
  });

  test('handles negative coordinates', () => {
    const x = -Math.random() * 1000;
    const y = -Math.random() * 1000;
    const act = up(point(x, y));
    assert.equal(act.point().x(), x, 'negative x was not handled');
  });

  test('handles zero coordinates', () => {
    const act = up(point(0, 0));
    assert.equal(act.point().string(), '(0,0)', 'zero coordinates were not handled');
  });

  test('handles fractional coordinates', () => {
    const x = Math.random();
    const y = Math.random();
    const act = up(point(x, y));
    assert.equal(act.point().x(), x, 'fractional coordinates were not handled');
  });
});
