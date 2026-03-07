import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { drawables } from '../../../src/view/drawable/drawables.js';
import { network } from '../../../src/core/network.js';
import { mutation } from '../../../src/core/mutation.js';
import { node } from '../../../src/core/node.js';
import { edge } from '../../../src/core/edge.js';

describe('drawables', () => {
  test('list returns empty array for empty network', () => {
    const net = network();
    const drws = drawables(net, () => ({}), () => ({}));
    assert.deepEqual(drws.list(), [], 'empty network did not return empty array');
  });

  test('list returns drawable for single node', () => {
    const net = mutation(network()).add(node('A'));
    const drws = drawables(net, (n) => ({ id: n.identifier() }), () => ({}));
    const result = drws.list();
    assert.equal(result.length, 1, 'single node did not return one drawable');
  });

  test('list returns drawable with correct node identifier', () => {
    const net = mutation(network()).add(node('Test'));
    const drws = drawables(net, (n) => ({ id: n.identifier() }), () => ({}));
    const result = drws.list();
    assert.equal(result[0].id, 'Test', 'node identifier was not passed correctly');
  });

  test('list returns drawables for multiple nodes', () => {
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    net = mutation(net).add(node('C'));
    const drws = drawables(net, (n) => ({ id: n.identifier() }), () => ({}));
    const result = drws.list();
    assert.equal(result.length, 3, 'not all nodes returned drawables');
  });

  test('list returns drawable for edge', () => {
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    net = mutation(net).link(edge(node('A'), node('B'), 1, 1));
    const drws = drawables(net, () => null, (e) => ({ id: e.identifier() }));
    const result = drws.list().filter((d) => d !== null);
    assert.equal(result.length, 1, 'edge did not return drawable');
  });

  test('list returns both node and edge drawables', () => {
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    net = mutation(net).link(edge(node('A'), node('B'), 1, 1));
    const drws = drawables(
      net,
      (n) => ({ type: 'node', id: n.identifier() }),
      (e) => ({ type: 'edge', id: e.identifier() })
    );
    const result = drws.list();
    assert.equal(result.length, 3, 'not all elements returned drawables');
  });

  test('list passes node to factory function', () => {
    const net = mutation(network()).add(node('Test'));
    let received = null;
    const drws = drawables(net, (n) => { received = n; return {}; }, () => ({}));
    drws.list();
    assert.equal(received.identifier(), 'Test', 'node was not passed to factory');
  });

  test('list passes edge to factory function', () => {
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    net = mutation(net).link(edge(node('A'), node('B'), 1, 1));
    let received = null;
    const drws = drawables(net, () => null, (e) => { received = e; return {}; });
    drws.list();
    assert.ok(received !== null, 'edge was not passed to factory');
  });

  test('list handles non-ASCII identifiers', () => {
    const net = mutation(network()).add(node('узел-δ'));
    const drws = drawables(net, (n) => ({ id: n.identifier() }), () => ({}));
    const result = drws.list();
    assert.equal(result[0].id, 'узел-δ', 'non-ASCII identifier was not handled');
  });

  test('list returns nodes before edges', () => {
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    net = mutation(net).link(edge(node('A'), node('B'), 1, 1));
    const drws = drawables(
      net,
      (n) => ({ type: 'node' }),
      (e) => ({ type: 'edge' })
    );
    const result = drws.list();
    const nodeCount = result.filter((d) => d.type === 'node').length;
    assert.equal(nodeCount, 2, 'nodes were not returned first');
  });

  test('list returns new array each call', () => {
    const net = mutation(network()).add(node('A'));
    const drws = drawables(net, (n) => ({ id: n.identifier() }), () => ({}));
    const a = drws.list();
    const b = drws.list();
    assert.notEqual(a, b, 'same array instance was returned');
  });
});
