import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { drawableNode } from '../../../src/view/drawable/drawableNode.js';
import { point } from '../../../src/view/geometry/point.js';

describe('drawableNode', () => {
  test('id returns node identifier provided at construction', () => {
    const identifier = `node-${Math.random().toString(36).slice(2)}`;
    const canvas = { circle: () => {} };
    const d = drawableNode(identifier, canvas);
    assert.equal(d.id(), identifier, 'identifier was not returned correctly');
  });

  test('id returns non-ASCII identifier', () => {
    const identifier = 'вузол-β-ノード';
    const canvas = { circle: () => {} };
    const d = drawableNode(identifier, canvas);
    assert.equal(d.id(), identifier, 'non-ASCII identifier was not returned correctly');
  });

  test('bounds uses default radius when not specified', () => {
    const canvas = { circle: () => {} };
    const d = drawableNode('test', canvas);
    assert.equal(d.bounds().string(), 'relativeRegion(20,20)', 'default bounds was incorrect');
  });

  test('bounds uses custom radius when specified', () => {
    const radius = Math.floor(Math.random() * 50) + 10;
    const canvas = { circle: () => {} };
    const d = drawableNode('test', canvas, radius);
    assert.equal(d.bounds().string(), `relativeRegion(${radius},${radius})`, 'custom bounds was incorrect');
  });

  test('draw invokes canvas circle with position', () => {
    let received = null;
    const canvas = { circle: (pos) => { received = pos; } };
    const pos = point(100, 200);
    const d = drawableNode('test', canvas);
    d.draw(pos);
    assert.equal(received, pos, 'canvas was not invoked with position');
  });

  test('draw invokes canvas circle with radius', () => {
    let received = null;
    const radius = 35;
    const canvas = { circle: (pos, r) => { received = r; } };
    const d = drawableNode('test', canvas, radius);
    d.draw(point(0, 0));
    assert.equal(received, radius, 'canvas was not invoked with radius');
  });

  test('draw invokes canvas circle with label', () => {
    let received = null;
    const identifier = 'my-node';
    const canvas = { circle: (pos, r, label) => { received = label; } };
    const d = drawableNode(identifier, canvas);
    d.draw(point(0, 0));
    assert.equal(received, identifier, 'canvas was not invoked with label');
  });

  test('draw returns result from canvas circle', () => {
    const expected = { drawn: true };
    const canvas = { circle: () => expected };
    const d = drawableNode('test', canvas);
    const result = d.draw(point(0, 0));
    assert.equal(result, expected, 'canvas result was not returned');
  });

  test('bounds at position creates correct circular region', () => {
    const canvas = { circle: () => {} };
    const radius = 30;
    const d = drawableNode('test', canvas, radius);
    const pos = point(100, 100);
    const world = d.bounds().at(pos);
    assert.equal(world.string(), 'region(70,70,130,130)', 'circular region was incorrect');
  });
});
