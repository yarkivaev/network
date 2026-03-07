import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { layout } from '../../../src/view/scene/layout.js';
import { network } from '../../../src/core/network.js';
import { mutation } from '../../../src/core/mutation.js';
import { node } from '../../../src/core/node.js';
import { edge } from '../../../src/core/edge.js';

describe('layout', () => {
  test('compute returns empty map for empty network', () => {
    const lyt = layout(800, 600, 10);
    const net = network();
    const positions = lyt.compute(net);
    assert.equal(positions.size, 0, 'empty network did not return empty map');
  });

  test('compute returns position for single node', () => {
    const lyt = layout(800, 600, 10);
    const net = mutation(network()).add(node('A'));
    const positions = lyt.compute(net);
    assert.equal(positions.size, 1, 'single node did not return one position');
  });

  test('compute returns positions for all nodes', () => {
    const lyt = layout(800, 600, 10);
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    net = mutation(net).add(node('C'));
    const positions = lyt.compute(net);
    assert.equal(positions.size, 3, 'not all nodes have positions');
  });

  test('compute positions are within bounds', () => {
    const w = 800;
    const h = 600;
    const lyt = layout(w, h, 50);
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    const positions = lyt.compute(net);
    for (const [id, pos] of positions) {
      assert.ok(pos.x() >= 0 && pos.x() <= w, `x coordinate out of bounds for ${id}`);
    }
  });

  test('compute positions have point objects', () => {
    const lyt = layout(800, 600, 10);
    const net = mutation(network()).add(node('A'));
    const positions = lyt.compute(net);
    const pos = positions.get('A');
    assert.equal(typeof pos.x, 'function', 'position does not have x method');
  });

  test('compute positions have y method', () => {
    const lyt = layout(800, 600, 10);
    const net = mutation(network()).add(node('A'));
    const positions = lyt.compute(net);
    const pos = positions.get('A');
    assert.equal(typeof pos.y, 'function', 'position does not have y method');
  });

  test('compute spreads connected nodes apart initially then attracts', () => {
    const lyt = layout(800, 600, 100);
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    net = mutation(net).link(edge(node('A'), node('B'), 1, 1));
    const positions = lyt.compute(net);
    const a = positions.get('A');
    const b = positions.get('B');
    const distance = Math.sqrt((a.x() - b.x())**2 + (a.y() - b.y())**2);
    assert.ok(distance > 0, 'connected nodes are at same position');
  });

  test('refine starts from existing positions', () => {
    const lyt = layout(800, 600, 1);
    const net = mutation(network()).add(node('A'));
    const initial = lyt.compute(net);
    const refined = lyt.refine(net, initial);
    assert.equal(refined.size, 1, 'refined positions has wrong size');
  });

  test('refine preserves node identifiers', () => {
    const lyt = layout(800, 600, 10);
    let net = network();
    net = mutation(net).add(node('X'));
    net = mutation(net).add(node('Y'));
    const initial = lyt.compute(net);
    const refined = lyt.refine(net, initial);
    assert.ok(refined.has('X'), 'refined positions missing X');
  });

  test('handles non-ASCII node identifiers', () => {
    const lyt = layout(800, 600, 10);
    const net = mutation(network()).add(node('узел-α'));
    const positions = lyt.compute(net);
    assert.ok(positions.has('узел-α'), 'non-ASCII identifier not in positions');
  });

});
