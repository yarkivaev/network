import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';
import { network } from '../../src/core/network.js';
import { mutation } from '../../src/core/mutation.js';
import { tree } from '../../src/algorithm/tree.js';
import { pair } from '../../src/core/pair.js';

describe('tree', () => {
  test('empty network returns empty tree', { skip: false }, () => {
    const net = network();
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 0, 'empty network should have no tree edges');
  });

  test('single node network returns network with no edges', { skip: false }, () => {
    const net = mutation(network()).add(node('A'));
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 0, 'single node should have no edges');
  });

  test('two connected nodes returns network with single edge', { skip: false }, () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 1, 'two nodes should have one edge');
  });

  test('triangle network returns network with 2 cheapest edges', { skip: false }, () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 1, 100);
    const eBC = edge(b, c, 2, 100);
    const eAC = edge(a, c, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    net = mutation(net).link(eAC);
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 2, 'triangle should have 2 MST edges');
  });

  test('linear network returns network with all edges', { skip: false }, () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const d = node('D');
    const eAB = edge(a, b, 1, 100);
    const eBC = edge(b, c, 2, 100);
    const eCD = edge(c, d, 3, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).add(d);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    net = mutation(net).link(eCD);
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 3, 'linear network should have 3 edges');
  });

  test('disconnected network throws exception', { skip: false }, () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 1, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    const t = tree(net);
    assert.throws(() => t.span(), /disconnected/, 'should throw for disconnected network');
  });

  test('span returns network with n-1 edges', { skip: false }, () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const d = node('D');
    const eAB = edge(a, b, 1, 100);
    const eBC = edge(b, c, 1, 100);
    const eCD = edge(c, d, 1, 100);
    const eAD = edge(a, d, 1, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).add(d);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    net = mutation(net).link(eCD);
    net = mutation(net).link(eAD);
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 3, 'MST should have n-1 edges');
  });

  test('span preserves all nodes', { skip: false }, () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 1, 100);
    const eBC = edge(b, c, 2, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.nodes().items().length, 3, 'MST should preserve all nodes');
  });

  test('span for 5/7 returns correct edges', { skip: false }, () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const d = node('D');
    const e = node('E');
    const eAB = edge(a, b, 5, 100);
    const eBC = edge(b, c, 7, 100);
    const eAC = edge(a, c, 10, 100);
    const eAD = edge(a, d, 20, 100);
    const eCD = edge(c, d, 2, 100);
    const eAE = edge(a, e, 30, 100);
    const eDE = edge(d, e, 5, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).add(d);
    net = mutation(net).add(e);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    net = mutation(net).link(eAC);
    net = mutation(net).link(eCD);
    net = mutation(net).link(eAD);
    net = mutation(net).link(eAE);
    net = mutation(net).link(eDE);
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 4, 'MST should have n-1 edges');

    const actual = mst.edges().items().map(link =>
      pair(link.source().identifier(), link.target().identifier()).identifier()
    );

    const expected = [
      pair('A', 'B').identifier(),
      pair('B', 'C').identifier(),
      pair('C', 'D').identifier(),
      pair('D', 'E').identifier()
    ];

    // сравниваем как множества
    assert.deepEqual(
      new Set(actual),
      new Set(expected),
      'MST should contain correct edges'
    );
  });
});
