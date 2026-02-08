import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { point } from '../../../src/view/geometry/point.js';

describe('point', () => {
  test('returns x coordinate provided at construction', () => {
    const value = Math.random() * 1000 - 500;
    const p = point(value, 0);
    assert.equal(p.x(), value, 'x coordinate was not returned correctly');
  });

  test('returns y coordinate provided at construction', () => {
    const value = Math.random() * 1000 - 500;
    const p = point(0, value);
    assert.equal(p.y(), value, 'y coordinate was not returned correctly');
  });

  test('equals returns true for points with identical coordinates', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const a = point(x, y);
    const b = point(x, y);
    assert.equal(a.equals(b), true, 'equal points were not identified as equal');
  });

  test('equals returns false for points with different x coordinates', () => {
    const y = Math.random() * 1000;
    const a = point(1, y);
    const b = point(2, y);
    assert.equal(a.equals(b), false, 'points with different x were identified as equal');
  });

  test('equals returns false for points with different y coordinates', () => {
    const x = Math.random() * 1000;
    const a = point(x, 1);
    const b = point(x, 2);
    assert.equal(a.equals(b), false, 'points with different y were identified as equal');
  });

  test('string returns formatted coordinate representation', () => {
    const p = point(42, 73);
    assert.equal(p.string(), '(42,73)', 'string format was incorrect');
  });

  test('string handles negative coordinates', () => {
    const p = point(-10, -20);
    assert.equal(p.string(), '(-10,-20)', 'negative coordinates were not formatted correctly');
  });

  test('string handles decimal coordinates', () => {
    const p = point(3.14, 2.71);
    assert.equal(p.string(), '(3.14,2.71)', 'decimal coordinates were not formatted correctly');
  });

  test('handles zero coordinates', () => {
    const p = point(0, 0);
    assert.equal(p.x(), 0, 'zero x was not returned correctly');
  });

  test('handles very large coordinates', () => {
    const large = 1e15;
    const p = point(large, -large);
    assert.equal(p.x(), large, 'large x was not returned correctly');
  });
});
