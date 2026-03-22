import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { colony } from '../../src/colony/colony.js';
import { triangulation } from '../../src/generation/triangulation.js';
import { normal } from '../../src/generation/normal.js';
import { obstacle } from '../../src/generation/obstacle.js';
import { bernoulli } from '../../src/generation/bernoulli.js';

const unit = { sample: () => 1 };

describe('colony', () => {
  test('returns all modules', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.equal(col.modules().length, 5, 'module count did not match');
  });

  test('returns passable roads excluding obstacles', () => {
    const net = triangulation(4, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(1, () => 0)));
    assert.equal(col.roads().length, 0, 'blocked colony reported passable roads');
  });

  test('returns all roads when no obstacles', () => {
    const net = triangulation(4, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.ok(col.roads().length > 0, 'no roads returned without obstacles');
  });

  test('returns obstacle edges', () => {
    const net = triangulation(4, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(1, () => 0)));
    assert.ok(col.obstacles().length > 0, 'no obstacles returned');
  });

  test('returns distance between connected modules', () => {
    const net = triangulation(3, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.ok(col.distance(0, 1) > 0, 'distance was not positive');
  });

  test('returns position of a module', () => {
    const net = triangulation(3, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(0, Math.random)));
    assert.equal(typeof col.position(0).x, 'number', 'position x was not a number');
  });

  test('passable returns network without blocked edges', () => {
    const net = triangulation(4, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, bernoulli(1, () => 0)));
    assert.equal(col.passable().edges().items().length, 0, 'passable network had blocked edges');
  });
});
