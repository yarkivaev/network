import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';
import { network } from '../../src/core/network.js';
import { mutation } from '../../src/core/mutation.js';

describe('mutation', () => {
  test('add inserts node into empty network', () => {
    const net = network();
    const n = node('A');
    const net2 = mutation(net).add(n);
    assert.equal(net2.nodes().items().length, 1, 'network should have one node');
  });

  test('add inserts multiple nodes', () => {
    let net = network();
    net = mutation(net).add(node('A'));
    net = mutation(net).add(node('B'));
    net = mutation(net).add(node('C'));
    assert.equal(net.nodes().items().length, 3, 'network should have three nodes');
  });

  test('add throws when node already exists', () => {
    const net = mutation(network()).add(node('A'));
    assert.throws(() => mutation(net).add(node('A')), /already exists/, 'should throw for duplicate node');
  });

  test('add with random node identifiers', () => {
    const random1 = Math.random().toString(36).substring(7);
    const random2 = Math.random().toString(36).substring(7);
    let net = network();
    net = mutation(net).add(node(random1));
    net = mutation(net).add(node(random2));
    assert.equal(net.nodes().items().length, 2, 'network should have two random nodes');
  });

  test('remove deletes existing node', () => {
    const n = node('A');
    const net = mutation(network()).add(n);
    const net2 = mutation(net).remove(n);
    assert.equal(net2.nodes().items().length, 0, 'network should have no nodes after remove');
  });

  test('remove throws when network is empty', () => {
    const net = network();
    assert.throws(() => mutation(net).remove(node('A')), /empty network/, 'should throw for empty network');
  });

  test('remove throws when node does not exist', () => {
    const net = mutation(network()).add(node('A'));
    assert.throws(() => mutation(net).remove(node('B')), /does not exist/, 'should throw for non-existent node');
  });

  test('remove also removes connected edges', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const net2 = mutation(net).remove(a);
    assert.equal(net2.edges().items().length, 0, 'edges should be removed with node');
  });

  test('link creates connection between existing nodes', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    assert.equal(net.edges().items().length, 1, 'network should have edge');
  });

  test('link throws when source node does not exist', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    const net = mutation(network()).add(b);
    assert.throws(() => mutation(net).link(e), /Source node does not exist/, 'should throw for missing source');
  });

  test('link throws when target node does not exist', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    const net = mutation(network()).add(a);
    assert.throws(() => mutation(net).link(e), /Target node does not exist/, 'should throw for missing target');
  });

  test('link throws when connection already exists', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const e2 = edge(a, b, 20, 200);
    assert.throws(() => mutation(net).link(e2), /already exists/, 'should throw for duplicate connection');
  });

  test('link with random edge weights', () => {
    const weight = Math.floor(Math.random() * 1000);
    const capacity = Math.floor(Math.random() * 1000);
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, weight, capacity);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    assert.equal(net.edges().items()[0].cost(), weight, 'edge cost should match');
  });

  test('unlink removes existing connection', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    net = mutation(net).link(e);
    const net2 = mutation(net).unlink(a, b);
    assert.equal(net2.edges().items().length, 0, 'connection should be removed');
  });

  test('unlink throws when connection does not exist', () => {
    const a = node('A');
    const b = node('B');
    let net = mutation(network()).add(a);
    net = mutation(net).add(b);
    assert.throws(() => mutation(net).unlink(a, b), /does not exist/, 'should throw for non-existent connection');
  });

  test('original network unchanged after add', () => {
    const net1 = network();
    const net2 = mutation(net1).add(node('A'));
    assert.equal(net1.nodes().items().length, 0, 'original network should be unchanged');
    assert.equal(net2.nodes().items().length, 1, 'new network should have node');
  });

  test('original network unchanged after remove', () => {
    const n = node('A');
    const net1 = mutation(network()).add(n);
    const net2 = mutation(net1).remove(n);
    assert.equal(net1.nodes().items().length, 1, 'original network should be unchanged');
    assert.equal(net2.nodes().items().length, 0, 'new network should have no nodes');
  });

  test('original network unchanged after link', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net1 = mutation(network()).add(a);
    net1 = mutation(net1).add(b);
    const net2 = mutation(net1).link(e);
    assert.equal(net1.edges().items().length, 0, 'original network should have no edges');
    assert.equal(net2.edges().items().length, 1, 'new network should have edge');
  });

  test('original network unchanged after unlink', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    let net1 = mutation(network()).add(a);
    net1 = mutation(net1).add(b);
    net1 = mutation(net1).link(e);
    const net2 = mutation(net1).unlink(a, b);
    assert.equal(net1.edges().items().length, 1, 'original network should have edge');
    assert.equal(net2.edges().items().length, 0, 'new network should have no edges');
  });
});
