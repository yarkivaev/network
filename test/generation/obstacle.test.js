import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { obstacle } from '../../src/generation/obstacle.js';
import { triangulation } from '../../src/generation/triangulation.js';
import { bernoulli } from '../../src/generation/bernoulli.js';
import { normal } from '../../src/generation/normal.js';
import { network } from '../../src/core/network.js';

const unit = { sample: () => 1 };

describe('obstacle', () => {
  test('delegates nodes to wrapped network', () => {
    const count = 5 + Math.floor(Math.random() * 10);
    const base = triangulation(count, unit, unit).network();
    const obs = obstacle(base, bernoulli(0.2, Math.random), new Map(), new Map());
    assert.equal(obs.nodes().items().length, count, 'node count did not match wrapped network');
  });

  test('delegates edges to wrapped network', () => {
    const count = 5 + Math.floor(Math.random() * 10);
    const base = triangulation(count, unit, unit).network();
    const obs = obstacle(base, bernoulli(0.2, Math.random), new Map(), new Map());
    assert.equal(obs.edges().items().length, base.edges().items().length, 'edge count did not match');
  });

  test('preserves original edge weights', () => {
    const base = triangulation(4, normal(0, 10, Math.random), unit).network();
    const obs = obstacle(base, bernoulli(1, () => 0), new Map(), new Map());
    const original = base.edges().items().map((e) => e.cost());
    const decorated = obs.edges().items().map((e) => e.cost());
    assert.deepEqual(decorated, original, 'edge weights were modified');
  });

  test('reports blocked when distribution returns one', () => {
    const base = triangulation(3, unit, unit).network();
    const obs = obstacle(base, bernoulli(1, () => 0), new Map(), new Map());
    assert.equal(obs.blocked(0, 1), true, 'edge not reported as blocked');
  });

  test('reports unblocked when distribution returns zero', () => {
    const base = triangulation(3, unit, unit).network();
    const obs = obstacle(base, bernoulli(0, Math.random), new Map(), new Map());
    assert.equal(obs.blocked(0, 1), false, 'edge incorrectly reported as blocked');
  });

  test('reports symmetric blocked status', () => {
    const base = triangulation(5, unit, unit).network();
    const obs = obstacle(base, bernoulli(0.5, Math.random), new Map(), new Map());
    assert.equal(obs.blocked(0, 1), obs.blocked(1, 0), 'blocked status not symmetric');
  });

  test('returns false for nonexistent edge', () => {
    const obs = obstacle(network(), bernoulli(0.5, Math.random), new Map(), new Map());
    assert.equal(obs.blocked(99, 100), false, 'nonexistent edge reported as blocked');
  });
});
