import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';
import { network } from '../../src/core/network.js';
import { mutation } from '../../src/core/mutation.js';
import { tree } from '../../src/algorithm/tree.js';

describe('tree', () => {
  test('empty network returns empty tree', { skip: true }, () => {
    const net = network();
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 0, 'empty network should have no tree edges');
  });

  test('single node network returns network with no edges', { skip: true }, () => {
    const net = mutation(network()).add(node('A'));
    const t = tree(net);
    const mst = t.span();
    assert.equal(mst.edges().items().length, 0, 'single node should have no edges');
  });

  test('two connected nodes returns network with single edge', { skip: true }, () => {
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

  test('triangle network returns network with 2 cheapest edges', { skip: true }, () => {
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

  test('linear network returns network with all edges', { skip: true }, () => {
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

  test('disconnected network throws exception', { skip: true }, () => {
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

  test('span returns network with n-1 edges', { skip: true }, () => {
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

  test('span preserves all nodes', { skip: true }, () => {
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
});
