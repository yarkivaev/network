import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { bernoulli } from '../../src/generation/bernoulli.js';

describe('bernoulli', () => {
  test('samples one when random is below probability', () => {
    const dist = bernoulli(0.5, () => 0.3);
    assert.equal(dist.sample(), 1, 'did not return 1 when random below probability');
  });

  test('samples zero when random is above probability', () => {
    const dist = bernoulli(0.5, () => 0.7);
    assert.equal(dist.sample(), 0, 'did not return 0 when random above probability');
  });

  test('samples zero when random equals probability', () => {
    const dist = bernoulli(0.5, () => 0.5);
    assert.equal(dist.sample(), 0, 'did not return 0 when random equals probability');
  });

  test('always samples one when probability is one', () => {
    const dist = bernoulli(1, () => 0.999);
    assert.equal(dist.sample(), 1, 'did not return 1 with probability one');
  });

  test('always samples zero when probability is zero', () => {
    const dist = bernoulli(0, () => 0);
    assert.equal(dist.sample(), 0, 'did not return 0 with probability zero');
  });

  test('samples with random probability value', () => {
    const prob = 0.01 + Math.random() * 0.98;
    const dist = bernoulli(prob, () => prob - 0.001);
    assert.equal(dist.sample(), 1, 'did not return 1 when random just below probability');
  });

  test('throws when probability is negative', () => {
    assert.throws(
      () => bernoulli(-0.1, () => 0),
      Error,
      'negative probability did not throw'
    );
  });

  test('throws when probability exceeds one', () => {
    assert.throws(
      () => bernoulli(1.1, () => 0),
      Error,
      'probability above one did not throw'
    );
  });
});
