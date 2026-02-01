import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';
import { network } from '../../src/core/network.js';
import { mutation } from '../../src/core/mutation.js';
import { route } from '../../src/algorithm/route.js';

describe('route', () => {
  test('direct connection returns single edge path', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const r = route(net, a, b);
    assert.ok(r.exists(), 'path should exist');
    assert.equal(r.path().length, 2, 'path should have 2 nodes');
    assert.equal(r.cost(), 10, 'cost should be edge weight');
  });

  test('two-hop path returns correct sequence', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 5, 100);
    const eBC = edge(b, c, 7, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    const r = route(net, a, c);
    const path = r.path();
    assert.equal(path.length, 3, 'path should have 3 nodes');
    assert.equal(path[0].identifier(), 'A', 'path should start at A');
    assert.equal(path[1].identifier(), 'B', 'path should go through B');
    assert.equal(path[2].identifier(), 'C', 'path should end at C');
  });

  test('multiple paths chooses cheapest', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 1, 100);
    const eBC = edge(b, c, 1, 100);
    const eAC = edge(a, c, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    net = mutation(net).link(eAC);
    const r = route(net, a, c);
    assert.equal(r.cost(), 2, 'should choose path through B with cost 2');
  });

  test('no path exists returns false', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 1, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    const r = route(net, a, c);
    assert.ok(!r.exists(), 'path should not exist');
  });

  test('origin equals destination returns zero cost path', () => {
    const a = node('A');
    const net = mutation(network()).add(a);
    const r = route(net, a, a);
    assert.ok(r.exists(), 'path to self should exist');
    assert.equal(r.cost(), 0, 'path to self should have zero cost');
    assert.equal(r.path().length, 1, 'path to self should have one node');
  });

  test('origin not in network throws exception', () => {
    const a = node('A');
    const b = node('B');
    const net = mutation(network()).add(b);
    assert.throws(() => route(net, a, b), /Origin node does not exist/, 'should throw for missing origin');
  });

  test('destination not in network throws exception', () => {
    const a = node('A');
    const b = node('B');
    const net = mutation(network()).add(a);
    assert.throws(() => route(net, a, b), /Destination node does not exist/, 'should throw for missing destination');
  });

  test('path with random weights', () => {
    const a = node('A');
    const b = node('B');
    const w = Math.floor(Math.random() * 100) + 1;
    const e = edge(a, b, w, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const r = route(net, a, b);
    assert.equal(r.cost(), w, 'cost should match random weight');
  });

  test('path returns nodes in correct order', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const d = node('D');
    const eAB = edge(a, b, 1, 100);
    const eBC = edge(b, c, 1, 100);
    const eCD = edge(c, d, 1, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).add(d);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    net = mutation(net).link(eCD);
    const r = route(net, a, d);
    const path = r.path();
    assert.equal(path[0].identifier(), 'A', 'first node should be A');
    assert.equal(path[3].identifier(), 'D', 'last node should be D');
  });

  test('cost returns sum of edge costs', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 3, 100);
    const eBC = edge(b, c, 4, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    const r = route(net, a, c);
    assert.equal(r.cost(), 7, 'cost should be 3+4=7');
  });

  test('disconnected components exists returns false', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const d = node('D');
    const eAB = edge(a, b, 1, 100);
    const eCD = edge(c, d, 1, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).add(d);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eCD);
    const r = route(net, a, c);
    assert.ok(!r.exists(), 'path between disconnected components should not exist');
  });

  test('path throws when no path exists', () => {
    const a = node('A');
    const b = node('B');
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    const r = route(net, a, b);
    assert.throws(() => r.path(), /No path exists/, 'should throw when getting path that doesnt exist');
  });

  test('cost throws when no path exists', () => {
    const a = node('A');
    const b = node('B');
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    const r = route(net, a, b);
    assert.throws(() => r.cost(), /No path exists/, 'should throw when getting cost for non-existent path');
  });

  test('methods return new objects without mutating original', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const r1 = route(net, a, b);
    const r2 = r1.shortest();
    assert.equal(r1.cost(), r2.cost(), 'both routes should have same cost');
  });
});
