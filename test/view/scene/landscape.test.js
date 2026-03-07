import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { landscape } from '../../../src/view/scene/landscape.js';
import { network } from '../../../src/core/network.js';
import { mutation } from '../../../src/core/mutation.js';
import { node } from '../../../src/core/node.js';
import { edge } from '../../../src/core/edge.js';
import { point } from '../../../src/view/geometry/point.js';
import { region } from '../../../src/view/geometry/region.js';
import { drawable } from '../../../src/view/drawable/drawable.js';
import { drawables } from '../../../src/view/drawable/drawables.js';
import { relativeRegion } from '../../../src/view/geometry/relativeRegion.js';

/**
 * Creates a fake layout returning predetermined positions.
 *
 * @param {Map} positions - Map of node identifier to point
 * @returns {Object} A layout with compute method
 */
const fakeLayout = (positions) => ({
  compute: () => positions,
  refine: () => positions
});

/**
 * Creates a fake node drawable with given size.
 *
 * @param {Object} n - The node
 * @param {number} radius - Half-extent for bounds
 * @returns {Object} A drawable
 */
const fakeNode = (n, radius) => drawable(
  n.identifier(),
  relativeRegion(radius, radius),
  () => {}
);

/**
 * Creates a fake edge drawable with given signed half-extents.
 *
 * @param {string} id - The edge identifier
 * @param {number} hw - Signed half-width
 * @param {number} hh - Signed half-height
 * @returns {Object} A drawable with absolute bounds and signed rendering
 */
const fakeEdge = (id, hw, hh) => drawable(
  id,
  relativeRegion(Math.max(Math.abs(hw), 1), Math.max(Math.abs(hh), 1)),
  () => {}
);

describe('landscape', () => {
  test('query returns empty for empty network', () => {
    const net = network();
    const lyt = fakeLayout(new Map());
    const drws = drawables(net, () => ({}), () => ({}));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const hits = lnd.query(point(Math.random() * 1000, Math.random() * 1000));
    assert.deepEqual(hits, [], 'query did not return empty for empty network');
  });

  test('query finds node drawable', () => {
    let net = network();
    net = mutation(net).add(node('α'));
    const positions = new Map([['α', point(150, 150)]]);
    const lyt = fakeLayout(positions);
    const radius = 25;
    const drws = drawables(net, (n) => fakeNode(n, radius), () => ({}));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const hits = lnd.query(point(150, 150));
    assert.equal(hits.length, 1, 'query did not find node drawable');
  });

  test('query finds edge drawable at midpoint', () => {
    let net = network();
    net = mutation(net).add(node('β'));
    net = mutation(net).add(node('γ'));
    net = mutation(net).link(edge(node('β'), node('γ'), 1, 1));
    const positions = new Map([['β', point(100, 100)], ['γ', point(200, 200)]]);
    const lyt = fakeLayout(positions);
    const drws = drawables(net, (n) => fakeNode(n, 10), (e) => ({ id: () => e.identifier() }));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const hits = lnd.query(point(150, 150));
    assert.equal(hits.length, 1, 'query did not find edge drawable at midpoint');
  });

  test('query returns nodes before edges when overlapping', () => {
    let net = network();
    net = mutation(net).add(node('λ'));
    net = mutation(net).add(node('μ'));
    net = mutation(net).link(edge(node('λ'), node('μ'), 1, 1));
    const positions = new Map([['λ', point(100, 100)], ['μ', point(100, 100)]]);
    const lyt = fakeLayout(positions);
    const radius = 30;
    const drws = drawables(net, (n) => fakeNode(n, radius), (e) => ({ id: () => e.identifier() }));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const hits = lnd.query(point(100, 100));
    assert.ok(!hits[0].includes('->'), 'edge was returned before node');
  });

  test('move repositions node', () => {
    let net = network();
    net = mutation(net).add(node('δ'));
    const positions = new Map([['δ', point(100, 100)]]);
    const lyt = fakeLayout(positions);
    const drws = drawables(net, (n) => fakeNode(n, 25), (e) => ({ id: () => e.identifier() }));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const destination = point(300, 400);
    const moved = lnd.move('δ', destination);
    const items = moved.get(['δ']);
    assert.ok(items[0].position.equals(destination), 'node was not repositioned');
  });

  test('move repositions connected edges to new midpoint', () => {
    let net = network();
    net = mutation(net).add(node('ε'));
    net = mutation(net).add(node('ζ'));
    net = mutation(net).link(edge(node('ε'), node('ζ'), 1, 1));
    const positions = new Map([['ε', point(100, 100)], ['ζ', point(300, 300)]]);
    const lyt = fakeLayout(positions);
    const drws = drawables(net, (n) => fakeNode(n, 25), (e) => ({ id: () => e.identifier() }));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const moved = lnd.move('ε', point(500, 100));
    const items = moved.get(['ε->ζ']);
    const expected = point((500 + 300) / 2, (100 + 300) / 2);
    assert.ok(items[0].position.equals(expected), 'edge was not repositioned to new midpoint');
  });

  test('move edge repositions connected nodes by same delta', () => {
    let net = network();
    net = mutation(net).add(node('η'));
    net = mutation(net).add(node('θ'));
    net = mutation(net).link(edge(node('η'), node('θ'), 1, 1));
    const positions = new Map([['η', point(100, 100)], ['θ', point(300, 300)]]);
    const lyt = fakeLayout(positions);
    const drws = drawables(net, (n) => fakeNode(n, 25), (e) => ({ id: () => e.identifier() }));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const edgeMid = point(200, 200);
    const moved = lnd.move('η->θ', point(210, 220));
    const items = moved.get(['η', 'θ']);
    assert.ok(items[0].position.equals(point(110, 120)), 'source node was not translated by edge drag delta');
  });

  test('handles non-ASCII node identifiers', () => {
    let net = network();
    const id = `узел-κόσμος-${Math.random().toString(36)}`;
    net = mutation(net).add(node(id));
    const positions = new Map([[id, point(200, 200)]]);
    const lyt = fakeLayout(positions);
    const drws = drawables(net, (n) => fakeNode(n, 25), (e) => ({ id: () => e.identifier() }));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const hits = lnd.query(point(200, 200));
    assert.equal(hits.length, 1, 'non-ASCII identifier was not handled');
  });

  test('visible returns drawables in region', () => {
    let net = network();
    net = mutation(net).add(node('ι'));
    net = mutation(net).add(node('κ'));
    const positions = new Map([['ι', point(50, 50)], ['κ', point(900, 900)]]);
    const lyt = fakeLayout(positions);
    const drws = drawables(net, (n) => fakeNode(n, 10), (e) => ({ id: () => e.identifier() }));
    const lnd = landscape(net, lyt, drws, fakeEdge);
    const ids = lnd.visible(region(0, 0, 200, 200));
    assert.equal(ids.length, 1, 'visible did not return correct drawables in region');
  });
});
