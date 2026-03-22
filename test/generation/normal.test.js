import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { normal } from '../../src/generation/normal.js';

describe('normal', () => {
  test('samples near mean when deviation is zero', () => {
    const dist = normal(50, 0, Math.random);
    assert.equal(dist.sample(), 50, 'zero deviation did not return mean');
  });

  test('samples value offset from mean', () => {
    const dist = normal(100, 10, () => 0.5);
    const value = dist.sample();
    assert.notEqual(value, 100, 'nonzero deviation returned exact mean');
  });

  test('samples with random mean and deviation', () => {
    const mean = 10 + Math.random() * 90;
    const deviation = 1 + Math.random() * 10;
    const dist = normal(mean, deviation, Math.random);
    const values = Array.from({ length: 100 }, () => dist.sample());
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    assert.ok(Math.abs(avg - mean) < deviation * 2, 'average did not approximate mean');
  });

  test('produces different values with varying random', () => {
    let call = 0;
    const dist = normal(50, 10, () => { call += 0.1; return call % 1; });
    const first = dist.sample();
    const second = dist.sample();
    assert.notEqual(first, second, 'consecutive samples did not differ');
  });

  test('throws when deviation is negative', () => {
    assert.throws(
      () => normal(50, -1, Math.random),
      Error,
      'negative deviation did not throw'
    );
  });
});
