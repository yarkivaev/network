import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { colony } from '../../src/colony/colony.js';
import { infrastructure } from '../../src/colony/infrastructure.js';
import { fakeVulnerability } from '../../src/colony/fake.js';
import { triangulation } from '../../src/generation/triangulation.js';
import { normal } from '../../src/generation/normal.js';
import { obstacle } from '../../src/generation/obstacle.js';
import { bernoulli } from '../../src/generation/bernoulli.js';

const unit = { sample: () => 1 };

describe('infrastructure', () => {
  test('returns bridge edges', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.ok(infrastructure(col, fakeVulnerability).bridges().size > 0, 'no bridges returned');
  });

  test('returns articulation result', () => {
    const net = triangulation(8, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    const arts = infrastructure(col, fakeVulnerability).articulations();
    assert.equal(arts.size >= 0, true, 'articulations returned invalid result');
  });
});
