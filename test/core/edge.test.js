import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';

describe('edge', () => {
  test('creates edge with valid source and target nodes', () => {
    const source = node('A');
    const target = node('B');
    const e = edge(source, target, 10, 100);
    assert.equal(e.source().identifier(), 'A', 'source should be A');
    assert.equal(e.target().identifier(), 'B', 'target should be B');
  });

  test('creates edge with positive weight', () => {
    const e = edge(node('A'), node('B'), 50, 100);
    assert.equal(e.cost(), 50, 'cost should be 50');
  });

  test('creates edge with zero weight', () => {
    const e = edge(node('A'), node('B'), 0, 100);
    assert.equal(e.cost(), 0, 'cost should be 0');
  });

  test('creates edge with positive capacity', () => {
    const e = edge(node('A'), node('B'), 10, 200);
    assert.equal(e.capacity(), 200, 'capacity should be 200');
  });

  test('creates edge with zero capacity', () => {
    const e = edge(node('A'), node('B'), 10, 0);
    assert.equal(e.capacity(), 0, 'capacity should be 0');
  });

  test('creates edge with random weight and capacity', () => {
    const weight = Math.floor(Math.random() * 1000);
    const capacity = Math.floor(Math.random() * 1000);
    const e = edge(node('X'), node('Y'), weight, capacity);
    assert.equal(e.cost(), weight, 'cost should match random weight');
    assert.equal(e.capacity(), capacity, 'capacity should match random capacity');
  });

  test('source returns the source node', () => {
    const source = node('source-node');
    const e = edge(source, node('target'), 1, 1);
    assert.equal(e.source().identifier(), 'source-node', 'source should return source node');
  });

  test('target returns the target node', () => {
    const target = node('target-node');
    const e = edge(node('source'), target, 1, 1);
    assert.equal(e.target().identifier(), 'target-node', 'target should return target node');
  });

  test('cost returns weight value', () => {
    const e = edge(node('A'), node('B'), 42, 100);
    assert.equal(e.cost(), 42, 'cost should return weight');
  });

  test('capacity returns capacity value', () => {
    const e = edge(node('A'), node('B'), 10, 999);
    assert.equal(e.capacity(), 999, 'capacity should return capacity');
  });

  test('edge with non-ASCII node identifiers', () => {
    const source = node('источник');
    const target = node('目标');
    const e = edge(source, target, 5, 50);
    assert.equal(e.source().identifier(), 'источник', 'source should have unicode identifier');
    assert.equal(e.target().identifier(), '目标', 'target should have unicode identifier');
  });

  test('throws when source is null', () => {
    assert.throws(() => edge(null, node('B'), 1, 1), /source cannot be null/, 'should throw for null source');
  });

  test('throws when target is null', () => {
    assert.throws(() => edge(node('A'), null, 1, 1), /target cannot be null/, 'should throw for null target');
  });

  test('throws when weight is negative', () => {
    assert.throws(() => edge(node('A'), node('B'), -1, 1), /cannot be negative/, 'should throw for negative weight');
  });

  test('throws when capacity is negative', () => {
    assert.throws(() => edge(node('A'), node('B'), 1, -1), /cannot be negative/, 'should throw for negative capacity');
  });

  test('identifier returns compound key', () => {
    const e = edge(node('source'), node('target'), 5, 50);
    assert.equal(e.identifier(), 'source->target', 'identifier should return compound key');
  });

  test('identifier format is source arrow target', () => {
    const random1 = Math.random().toString(36).substring(7);
    const random2 = Math.random().toString(36).substring(7);
    const e = edge(node(random1), node(random2), 1, 1);
    assert.equal(e.identifier(), `${random1}->${random2}`, 'identifier should follow source->target format');
  });

  test('identifier with non-ASCII nodes', () => {
    const e = edge(node('источник'), node('目标'), 1, 1);
    assert.equal(e.identifier(), 'источник->目标', 'identifier should work with non-ASCII');
  });
});
