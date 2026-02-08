import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { drawableEdge } from '../../../src/view/drawable/drawableEdge.js';
import { point } from '../../../src/view/geometry/point.js';

describe('drawableEdge', () => {
  test('id returns edge identifier provided at construction', () => {
    const identifier = `edge-${Math.random().toString(36).slice(2)}`;
    const canvas = { line: () => {} };
    const d = drawableEdge(identifier, canvas, 50, 30);
    assert.equal(d.id(), identifier, 'identifier was not returned correctly');
  });

  test('id returns non-ASCII identifier', () => {
    const identifier = 'ребро-γ-エッジ';
    const canvas = { line: () => {} };
    const d = drawableEdge(identifier, canvas, 50, 30);
    assert.equal(d.id(), identifier, 'non-ASCII identifier was not returned correctly');
  });

  test('bounds uses provided dimensions', () => {
    const canvas = { line: () => {} };
    const d = drawableEdge('test', canvas, 40, 25);
    assert.equal(d.bounds().string(), 'relativeRegion(40,25)', 'bounds was incorrect');
  });

  test('bounds handles asymmetric dimensions', () => {
    const canvas = { line: () => {} };
    const hw = Math.floor(Math.random() * 100) + 10;
    const hh = Math.floor(Math.random() * 100) + 10;
    const d = drawableEdge('test', canvas, hw, hh);
    assert.equal(d.bounds().string(), `relativeRegion(${hw},${hh})`, 'asymmetric bounds was incorrect');
  });

  test('draw invokes canvas line with position', () => {
    let received = null;
    const canvas = { line: (pos) => { received = pos; } };
    const pos = point(100, 200);
    const d = drawableEdge('test', canvas, 50, 30);
    d.draw(pos);
    assert.equal(received, pos, 'canvas was not invoked with position');
  });

  test('draw invokes canvas line with halfWidth', () => {
    let received = null;
    const hw = 45;
    const canvas = { line: (pos, halfWidth) => { received = halfWidth; } };
    const d = drawableEdge('test', canvas, hw, 30);
    d.draw(point(0, 0));
    assert.equal(received, hw, 'canvas was not invoked with halfWidth');
  });

  test('draw invokes canvas line with halfHeight', () => {
    let received = null;
    const hh = 35;
    const canvas = { line: (pos, halfWidth, halfHeight) => { received = halfHeight; } };
    const d = drawableEdge('test', canvas, 50, hh);
    d.draw(point(0, 0));
    assert.equal(received, hh, 'canvas was not invoked with halfHeight');
  });

  test('draw returns result from canvas line', () => {
    const expected = { drawn: true };
    const canvas = { line: () => expected };
    const d = drawableEdge('test', canvas, 50, 30);
    const result = d.draw(point(0, 0));
    assert.equal(result, expected, 'canvas result was not returned');
  });

  test('handles zero halfWidth', () => {
    const canvas = { line: () => {} };
    const d = drawableEdge('test', canvas, 0, 30);
    assert.equal(d.bounds().string(), 'relativeRegion(0,30)', 'zero halfWidth was not handled');
  });

  test('handles zero halfHeight', () => {
    const canvas = { line: () => {} };
    const d = drawableEdge('test', canvas, 50, 0);
    assert.equal(d.bounds().string(), 'relativeRegion(50,0)', 'zero halfHeight was not handled');
  });

  test('bounds at position creates correct world region', () => {
    const canvas = { line: () => {} };
    const d = drawableEdge('test', canvas, 40, 20);
    const pos = point(100, 100);
    const world = d.bounds().at(pos);
    assert.equal(world.string(), 'region(60,80,140,120)', 'world region was incorrect');
  });
});
