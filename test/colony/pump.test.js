import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { colony } from '../../src/colony/colony.js';
import { pump } from '../../src/colony/pump.js';
import { fakeFlow } from '../../src/colony/fake.js';
import { triangulation } from '../../src/generation/triangulation.js';
import { normal } from '../../src/generation/normal.js';
import { obstacle } from '../../src/generation/obstacle.js';
import { bernoulli } from '../../src/generation/bernoulli.js';

describe('pump', () => {
  test('returns positive total flow', () => {
    const net = triangulation(5, normal(0, 10, Math.random), normal(50, 10, Math.random)).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.ok(pump(col, 0, fakeFlow).total() > 0, 'total flow was not positive');
  });

  test('returns flow per edge', () => {
    const net = triangulation(5, normal(0, 10, Math.random), normal(50, 10, Math.random)).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.ok(pump(col, 0, fakeFlow).flow().size > 0, 'no flow edges returned');
  });

  test('returns bottleneck edges', () => {
    const net = triangulation(5, normal(0, 10, Math.random), normal(50, 10, Math.random)).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.ok(pump(col, 0, fakeFlow).bottlenecks().size > 0, 'no bottlenecks returned');
  });
});
