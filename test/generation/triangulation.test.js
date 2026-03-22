import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { triangulation } from '../../src/generation/triangulation.js';
import { normal } from '../../src/generation/normal.js';
import { uniform } from '../../src/generation/uniform.js';

const unit = { sample: () => 1 };

describe('triangulation', () => {
  test('produces empty network for zero nodes', () => {
    const net = triangulation(0, unit, unit).network();
    assert.equal(net.nodes().items().length, 0, 'zero nodes did not produce empty network');
  });

  test('produces single node with no edges', () => {
    const net = triangulation(1, unit, unit).network();
    assert.equal(net.edges().items().length, 0, 'single node did not produce zero edges');
  });

  test('produces one node for count one', () => {
    const net = triangulation(1, unit, unit).network();
    assert.equal(net.nodes().items().length, 1, 'count one did not produce one node');
  });

  test('produces two bidirectional edges for two nodes', () => {
    const net = triangulation(2, unit, unit).network();
    assert.equal(net.edges().items().length, 2, 'two nodes did not produce two directed edges');
  });

  test('produces six bidirectional edges for three nodes', () => {
    const net = triangulation(3, unit, unit).network();
    assert.equal(net.edges().items().length, 6, 'three nodes did not produce six directed edges');
  });

  test('produces 2*(3N-6) directed edges for N nodes when N is at least three', () => {
    const count = 3 + Math.floor(Math.random() * 47);
    const net = triangulation(count, unit, unit).network();
    assert.equal(net.edges().items().length, 2 * (3 * count - 6), 'edge count did not match 2*(3N-6)');
  });

  test('produces correct node count', () => {
    const count = Math.floor(Math.random() * 50) + 2;
    const net = triangulation(count, unit, unit).network();
    assert.equal(net.nodes().items().length, count, 'node count did not match');
  });

  test('produces no duplicate edges', () => {
    const count = 10 + Math.floor(Math.random() * 40);
    const net = triangulation(count, unit, unit).network();
    const ids = net.edges().items().map((e) => e.identifier());
    assert.equal(ids.length, new Set(ids).size, 'duplicate edges were found');
  });

  test('produces symmetric weights for both directions', () => {
    const net = triangulation(5, uniform(1, 100, Math.random), unit, unit).network();
    const edges = net.edges().items();
    const forward = edges.find((e) => e.identifier() === '0->1');
    const reverse = edges.find((e) => e.identifier() === '1->0');
    assert.equal(forward.cost(), reverse.cost(), 'forward and reverse weights differ');
  });

  test('produces edges with unit capacity', () => {
    const net = triangulation(5, unit, unit).network();
    const capacities = net.edges().items().map((e) => e.capacity());
    assert.equal(capacities.every((c) => c === 1), true, 'not all edges had unit capacity');
  });

  test('produces deterministic output with fixed random', () => {
    let a1 = 42;
    let b1 = 7;
    const r1 = () => { a1 = (a1 * 1103515245 + 12345) & 0x7fffffff; return a1 / 0x7fffffff; };
    const w1 = { sample: () => { b1 = (b1 * 1103515245 + 12345) & 0x7fffffff; return 1 + (b1 % 100); } };
    let a2 = 42;
    let b2 = 7;
    const r2 = () => { a2 = (a2 * 1103515245 + 12345) & 0x7fffffff; return a2 / 0x7fffffff; };
    const w2 = { sample: () => { b2 = (b2 * 1103515245 + 12345) & 0x7fffffff; return 1 + (b2 % 100); } };
    const n1 = triangulation(20, w1, unit, unit).network();
    const n2 = triangulation(20, w2, unit, unit).network();
    const ids1 = n1.edges().items().map((e) => e.identifier()).sort();
    const ids2 = n2.edges().items().map((e) => e.identifier()).sort();
    assert.deepEqual(ids1, ids2, 'same seed did not produce identical topology');
  });

  test('produces edges with distinct source and target', () => {
    const count = 5 + Math.floor(Math.random() * 45);
    const net = triangulation(count, unit, unit).network();
    const distinct = net.edges().items().every((e) => e.source().identifier() !== e.target().identifier());
    assert.equal(distinct, true, 'self-loop edge was found');
  });

  test('connects every node when count is at least two', () => {
    const count = 2 + Math.floor(Math.random() * 48);
    const net = triangulation(count, unit, unit).network();
    const connected = new Set();
    for (const e of net.edges().items()) {
      connected.add(e.source().identifier());
      connected.add(e.target().identifier());
    }
    assert.equal(connected.size, count, 'not every node appeared in an edge');
  });

  test('satisfies triangle inequality for all faces', () => {
    const count = 5 + Math.floor(Math.random() * 20);
    const net = triangulation(count, uniform(1, 100, Math.random), unit, unit).network();
    const adj = new Map();
    for (const e of net.edges().items()) {
      const s = e.source().identifier();
      if (!adj.has(s)) { adj.set(s, new Map()); }
      adj.get(s).set(e.target().identifier(), e.cost());
    }
    let valid = true;
    for (const e of net.edges().items()) {
      const u = e.source().identifier();
      const v = e.target().identifier();
      const uv = e.cost();
      const shared = [...adj.get(u).keys()].filter((w) => adj.get(v).has(w));
      for (const w of shared) {
        valid = valid && (uv <= adj.get(u).get(w) + adj.get(v).get(w));
      }
    }
    assert.equal(valid, true, 'triangle inequality violated');
  });

  test('produces positive edge weights', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit, unit).network();
    const costs = net.edges().items().map((e) => e.cost());
    assert.equal(costs.every((c) => c > 0), true, 'not all weights positive');
  });

  test('throws for negative count', () => {
    assert.throws(
      () => triangulation(-1, unit, unit),
      Error,
      'negative count did not throw'
    );
  });

  test('throws for fractional count', () => {
    assert.throws(
      () => triangulation(3.5, unit, unit),
      Error,
      'fractional count did not throw'
    );
  });
});
