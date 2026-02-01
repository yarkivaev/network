import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';
import { network } from '../../src/core/network.js';
import { set } from '../../src/core/set.js';

describe('network', () => {
  test('creates empty network with no nodes', () => {
    const net = network();
    assert.equal(net.nodes().items().length, 0, 'empty network should have no nodes');
  });

  test('creates empty network with no edges', () => {
    const net = network();
    assert.equal(net.edges().items().length, 0, 'empty network should have no edges');
  });

  test('nodes returns set object', () => {
    const net = network();
    assert.equal(typeof net.nodes().has, 'function', 'nodes should return set with has method');
    assert.equal(typeof net.nodes().get, 'function', 'nodes should return set with get method');
    assert.equal(typeof net.nodes().items, 'function', 'nodes should return set with items method');
  });

  test('edges returns set object', () => {
    const net = network();
    assert.equal(typeof net.edges().has, 'function', 'edges should return set with has method');
    assert.equal(typeof net.edges().get, 'function', 'edges should return set with get method');
    assert.equal(typeof net.edges().items, 'function', 'edges should return set with items method');
  });

  test('nodes returns provided nodes set', () => {
    const a = node('A');
    const b = node('B');
    const nodesSet = set().add(a).add(b);
    const net = network(nodesSet, set());
    assert.equal(net.nodes().items().length, 2, 'network should have two nodes');
  });

  test('edges returns provided edges set', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    const nodesSet = set().add(a).add(b);
    const edgesSet = set().add(e);
    const net = network(nodesSet, edgesSet);
    assert.equal(net.edges().items().length, 1, 'network should have one edge');
  });

  test('nodes set supports has lookup', () => {
    const a = node('A');
    const nodesSet = set().add(a);
    const net = network(nodesSet, set());
    assert.equal(net.nodes().has('A'), true, 'nodes set should have A');
    assert.equal(net.nodes().has('B'), false, 'nodes set should not have B');
  });

  test('edges set supports has lookup', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    const nodesSet = set().add(a).add(b);
    const edgesSet = set().add(e);
    const net = network(nodesSet, edgesSet);
    assert.equal(net.edges().has('A->B'), true, 'edges set should have A->B');
    assert.equal(net.edges().has('B->A'), false, 'edges set should not have B->A');
  });

  test('nodes set supports get lookup', () => {
    const a = node('A');
    const nodesSet = set().add(a);
    const net = network(nodesSet, set());
    assert.equal(net.nodes().get('A').identifier(), 'A', 'get should return node A');
  });

  test('edges set supports get lookup', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    const nodesSet = set().add(a).add(b);
    const edgesSet = set().add(e);
    const net = network(nodesSet, edgesSet);
    assert.equal(net.edges().get('A->B').cost(), 10, 'get should return edge with cost 10');
  });

  test('nodes with random identifiers', () => {
    const random1 = Math.random().toString(36).substring(7);
    const random2 = Math.random().toString(36).substring(7);
    const nodesSet = set().add(node(random1)).add(node(random2));
    const net = network(nodesSet, set());
    assert.equal(net.nodes().items().length, 2, 'network should have two random nodes');
  });

  test('edges with random weights', () => {
    const a = node('A');
    const b = node('B');
    const weight = Math.floor(Math.random() * 1000);
    const e = edge(a, b, weight, 100);
    const nodesSet = set().add(a).add(b);
    const edgesSet = set().add(e);
    const net = network(nodesSet, edgesSet);
    assert.equal(net.edges().get('A->B').cost(), weight, 'edge cost should match random weight');
  });

  test('items returns new array each call', () => {
    const a = node('A');
    const nodesSet = set().add(a);
    const net = network(nodesSet, set());
    const items1 = net.nodes().items();
    const items2 = net.nodes().items();
    assert.notEqual(items1, items2, 'items should return new array each time');
  });

  test('modifying items array does not affect set', () => {
    const a = node('A');
    const nodesSet = set().add(a);
    const net = network(nodesSet, set());
    const items = net.nodes().items();
    items.push(node('B'));
    assert.equal(net.nodes().items().length, 1, 'set should still have one node');
  });
});
