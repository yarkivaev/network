import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { colony } from '../../src/colony/colony.js';
import { roadmap } from '../../src/colony/roadmap.js';
import { fakeTree } from '../../src/colony/fake.js';
import { triangulation } from '../../src/generation/triangulation.js';
import { normal } from '../../src/generation/normal.js';
import { obstacle } from '../../src/generation/obstacle.js';
import { bernoulli } from '../../src/generation/bernoulli.js';

const unit = { sample: () => 1 };

describe('roadmap', () => {
  test('returns positive total cost', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.ok(roadmap(col, fakeTree).cost() > 0, 'cost was not positive');
  });

  test('returns edge identifiers', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.ok(roadmap(col, fakeTree).edges().size > 0, 'no edges returned');
  });
});
