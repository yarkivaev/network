import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';
import { network } from '../../src/core/network.js';
import { mutation } from '../../src/core/mutation.js';
import { flow } from '../../src/algorithm/flow.js';

describe('flow', () => {
  test('single edge flow equals edge capacity', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 1, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const f = flow(net, a, b);
    assert.equal(f.maximum(), 100, 'max flow should equal capacity');
  });

  test('two parallel edges flow equals sum of capacities', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const d = node('D');
    const eAB = edge(a, b, 1, 50);
    const eAC = edge(a, c, 1, 50);
    const eBD = edge(b, d, 1, 50);
    const eCD = edge(c, d, 1, 50);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).add(d);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eAC);
    net = mutation(net).link(eBD);
    net = mutation(net).link(eCD);
    const f = flow(net, a, d);
    assert.equal(f.maximum(), 100, 'max flow should be sum of parallel paths');
  });

  test('serial edges flow equals minimum capacity', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 1, 100);
    const eBC = edge(b, c, 1, 50);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    const f = flow(net, a, c);
    assert.equal(f.maximum(), 50, 'max flow should be bottleneck capacity');
  });

  test('diamond network correct flow', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const d = node('D');
    const eAB = edge(a, b, 1, 10);
    const eAC = edge(a, c, 1, 10);
    const eBD = edge(b, d, 1, 10);
    const eCD = edge(c, d, 1, 10);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).add(d);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eAC);
    net = mutation(net).link(eBD);
    net = mutation(net).link(eCD);
    const f = flow(net, a, d);
    assert.equal(f.maximum(), 20, 'diamond should have flow of 20');
  });

  test('source equals sink throws exception', () => {
    const a = node('A');
    const net = mutation(network()).add(a);
    assert.throws(() => flow(net, a, a), /cannot be the same/, 'should throw when source equals sink');
  });

  test('source not in network throws exception', () => {
    const a = node('A');
    const b = node('B');
    const net = mutation(network()).add(b);
    assert.throws(() => flow(net, a, b), /Source node does not exist/, 'should throw for missing source');
  });

  test('sink not in network throws exception', () => {
    const a = node('A');
    const b = node('B');
    const net = mutation(network()).add(a);
    assert.throws(() => flow(net, a, b), /Sink node does not exist/, 'should throw for missing sink');
  });

  test('no path from source to sink returns zero maximum', () => {
    const a = node('A');
    const b = node('B');
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    const f = flow(net, a, b);
    assert.equal(f.maximum(), 0, 'disconnected nodes should have zero flow');
  });

  test('random capacities', () => {
    const cap = Math.floor(Math.random() * 100) + 1;
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 1, cap);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const f = flow(net, a, b);
    assert.equal(f.maximum(), cap, 'max flow should equal random capacity');
  });

  test('bidirectional edges dont zero out residual capacity', () => {
    const a = node('A');
    const b = node('B');
    const cap = Math.floor(Math.random() * 100) + 1;
    const eAB = edge(a, b, 1, cap);
    const eBA = edge(b, a, 1, cap);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBA);
    const f = flow(net, a, b);
    assert.ok(f.maximum() > 0, 'bidirectional edge flow was zero due to residual overwrite');
  });

  test('flows returns per edge flow not total maximum', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const d = node('D');
    const eAB = edge(a, b, 1, 10);
    const eAC = edge(a, c, 1, 10);
    const eBD = edge(b, d, 1, 10);
    const eCD = edge(c, d, 1, 10);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).add(d);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eAC);
    net = mutation(net).link(eBD);
    net = mutation(net).link(eCD);
    const f = flow(net, a, d);
    const perEdge = f.flows();
    assert.ok(perEdge instanceof Map, 'flows did not return a Map');
    assert.equal(perEdge.get('A->B'), 10, 'edge A->B flow was not 10');
    assert.equal(perEdge.get('A->C'), 10, 'edge A->C flow was not 10');
    assert.equal(perEdge.get('B->D'), 10, 'edge B->D flow was not 10');
    assert.equal(perEdge.get('C->D'), 10, 'edge C->D flow was not 10');
  });

  test('flows returns per edge flow for serial bottleneck', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 1, 100);
    const eBC = edge(b, c, 1, 30);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    const f = flow(net, a, c);
    const perEdge = f.flows();
    assert.equal(perEdge.get('A->B'), 30, 'edge A->B flow was not 30');
    assert.equal(perEdge.get('B->C'), 30, 'edge B->C flow was not 30');
  });

  test('bottlenecks returns edges at capacity', () => {
    const a = node('A');
    const b = node('B');
    const c = node('C');
    const eAB = edge(a, b, 1, 50);
    const eBC = edge(b, c, 1, 30);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).add(c);
    net = mutation(net).link(eAB);
    net = mutation(net).link(eBC);
    const f = flow(net, a, c);
    const bottlenecks = f.bottlenecks();
    assert.ok(bottlenecks.length > 0, 'should have at least one bottleneck');
    assert.ok(bottlenecks.some(e => e.capacity() === 30), 'bottleneck should be the edge with capacity 30');
  });

});
