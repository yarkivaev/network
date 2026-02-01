import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';
import { network } from '../../src/core/network.js';
import { mutation } from '../../src/core/mutation.js';
import { scan } from '../../src/core/scan.js';

describe('scan', () => {
  test('has returns true for existing node', () => {
    const a = node('A');
    const net = mutation(network()).add(a);
    assert.ok(scan(net).has(a), 'should find existing node');
  });

  test('has returns false for non-existing node', () => {
    const a = node('A');
    const b = node('B');
    const net = mutation(network()).add(a);
    assert.ok(!scan(net).has(b), 'should not find non-existing node');
  });

  test('has with random identifiers', () => {
    const random = Math.random().toString(36).substring(7);
    const n = node(random);
    const net = mutation(network()).add(n);
    assert.ok(scan(net).has(n), 'should find node with random identifier');
  });

  test('neighbors returns outgoing edges in from array', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const neighbors = scan(net).neighbors(a);
    assert.equal(neighbors.from.length, 1, 'should have one outgoing edge');
    assert.equal(neighbors.from[0].target().identifier(), 'B', 'outgoing edge should target B');
  });

  test('neighbors returns incoming edges in to array', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const neighbors = scan(net).neighbors(b);
    assert.equal(neighbors.to.length, 1, 'should have one incoming edge');
    assert.equal(neighbors.to[0].source().identifier(), 'A', 'incoming edge should come from A');
  });

  test('neighbors returns empty arrays for isolated node', () => {
    const a = node('A');
    const net = mutation(network()).add(a);
    const neighbors = scan(net).neighbors(a);
    assert.equal(neighbors.from.length, 0, 'isolated node should have no outgoing edges');
    assert.equal(neighbors.to.length, 0, 'isolated node should have no incoming edges');
  });

  test('neighbors returns multiple edges', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const e1 = edge(a, b, 10, 100);
    const e2 = edge(a, c, 20, 200);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(e1);
    net = mutation(net).link(e2);
    const neighbors = scan(net).neighbors(a);
    assert.equal(neighbors.from.length, 2, 'should have two outgoing edges');
  });

  test('connection returns edge between nodes', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const result = scan(net).connection(a, b);
    assert.equal(result.cost(), 10, 'connection should return correct edge');
  });

  test('connection throws when no edge exists', () => {
    const a = node('A');
    const b = node('B');
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    assert.throws(() => scan(net).connection(a, b), /does not exist/, 'should throw for non-existent connection');
  });

  test('connection with random edge data', () => {
    const weight = Math.floor(Math.random() * 1000);
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, weight, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const result = scan(net).connection(a, b);
    assert.equal(result.cost(), weight, 'connection should return edge with correct weight');
  });

  test('isolated returns nodes with no connections', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(e);
    const isolated = scan(net).isolated();
    assert.equal(isolated.length, 1, 'should find one isolated node');
    assert.equal(isolated[0].identifier(), 'C', 'C should be isolated');
  });

  test('isolated returns empty array when all nodes connected', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const isolated = scan(net).isolated();
    assert.equal(isolated.length, 0, 'should find no isolated nodes');
  });

  test('isolated returns all nodes in empty network edges', () => {
    const a = node('A');
    const b = node('B');
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    const isolated = scan(net).isolated();
    assert.equal(isolated.length, 2, 'all nodes should be isolated');
  });

  test('isolated returns empty array for empty network', () => {
    const net = network();
    const isolated = scan(net).isolated();
    assert.equal(isolated.length, 0, 'empty network should have no isolated nodes');
  });

  test('isolated with random node identifiers', () => {
    const random = Math.random().toString(36).substring(7);
    const n = node(random);
    const net = mutation(network()).add(n);
    const isolated = scan(net).isolated();
    assert.equal(isolated.length, 1, 'single node should be isolated');
    assert.equal(isolated[0].identifier(), random, 'isolated node should have random identifier');
  });
});
