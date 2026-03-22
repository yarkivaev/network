import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { colony } from '../../src/colony/colony.js';
import { supply } from '../../src/colony/supply.js';
import { fakeRoute } from '../../src/colony/fake.js';
import { triangulation } from '../../src/generation/triangulation.js';
import { normal } from '../../src/generation/normal.js';
import { obstacle } from '../../src/generation/obstacle.js';
import { bernoulli } from '../../src/generation/bernoulli.js';

const unit = { sample: () => 1 };

describe('supply', () => {
  test('finds route between connected modules', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random), new Map()), bernoulli(0, Math.random));
    assert.equal(supply(col, 0, 1, fakeRoute).exists(), true, 'route not found');
  });

  test('path starts with origin', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random), new Map()), bernoulli(0, Math.random));
    assert.equal(supply(col, 0, 1, fakeRoute).path()[0], 0, 'path did not start with origin');
  });

  test('returns positive cost', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random), new Map()), bernoulli(0, Math.random));
    assert.ok(supply(col, 0, 1, fakeRoute).cost() > 0, 'cost was not positive');
  });

  test('returns edge identifiers along route', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random), new Map()), bernoulli(0, Math.random));
    assert.ok(supply(col, 0, 1, fakeRoute).edges().size > 0, 'no edges returned');
  });
});
