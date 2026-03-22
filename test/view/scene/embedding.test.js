import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { embedding } from '../../../src/view/scene/embedding.js';
import { triangulation } from '../../../src/generation/triangulation.js';
import { normal } from '../../../src/generation/normal.js';

describe('embedding', () => {
  test('compute returns empty map for empty network', () => {
    const net = { nodes: () => ({ items: () => [] }), edges: () => ({ items: () => [] }), position: () => ({ x: 0, y: 0 }) };
    assert.equal(embedding(800, 600).compute(net).size, 0, 'empty network did not return empty map');
  });

  test('compute returns positions for all nodes', () => {
    const net = triangulation(5, normal(0, 10, Math.random), normal(50, 10, Math.random)).network();
    assert.equal(embedding(800, 600).compute(net).size, 5, 'not all nodes have positions');
  });

  test('compute positions have point x method', () => {
    const net = triangulation(4, normal(0, 10, Math.random), normal(50, 10, Math.random)).network();
    const pos = embedding(800, 600).compute(net).get(0);
    assert.equal(typeof pos.x, 'function', 'position does not have x method');
  });

  test('compute positions are within canvas bounds', () => {
    const net = triangulation(8, normal(0, 10, Math.random), normal(50, 10, Math.random)).network();
    const positions = embedding(800, 600).compute(net);
    for (const [, pos] of positions) {
      assert.ok(pos.x() >= 0 && pos.x() <= 800, 'x coordinate out of bounds');
    }
  });

  test('refine returns positions for all nodes', () => {
    const net = triangulation(5, normal(0, 10, Math.random), normal(50, 10, Math.random)).network();
    assert.equal(embedding(800, 600).refine(net).size, 5, 'refine did not return all positions');
  });
});
