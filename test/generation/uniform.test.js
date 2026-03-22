import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { uniform } from '../../src/generation/uniform.js';

describe('uniform', () => {
  test('samples midpoint when random returns half', () => {
    const dist = uniform(2, 8, () => 0.5);
    assert.equal(dist.sample(), 5, 'sample did not return midpoint');
  });

  test('samples minimum when random returns zero', () => {
    const dist = uniform(3, 10, () => 0);
    assert.equal(dist.sample(), 3, 'sample did not return minimum');
  });

  test('samples below maximum when random returns near one', () => {
    const dist = uniform(0, 100, () => 0.999);
    assert.ok(dist.sample() < 100, 'sample reached or exceeded maximum');
  });

  test('samples according to formula with random inputs', () => {
    const min = Math.random() * 50;
    const max = min + Math.random() * 50 + 1;
    const fixed = Math.random();
    const dist = uniform(min, max, () => fixed);
    assert.equal(dist.sample(), min + fixed * (max - min), 'sample did not match formula');
  });

  test('produces different values with varying random', () => {
    let call = 0;
    const dist = uniform(0, 10, () => { call += 0.3; return call - 0.3; });
    const first = dist.sample();
    const second = dist.sample();
    assert.notEqual(first, second, 'consecutive samples did not differ');
  });

  test('throws when minimum equals maximum', () => {
    assert.throws(
      () => uniform(5, 5, () => 0),
      Error,
      'equal min and max did not throw'
    );
  });

  test('throws when minimum exceeds maximum', () => {
    assert.throws(
      () => uniform(10, 5, () => 0),
      Error,
      'inverted range did not throw'
    );
  });
});
