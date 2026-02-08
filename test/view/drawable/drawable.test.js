import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { drawable } from '../../../src/view/drawable/drawable.js';
import { relativeRegion } from '../../../src/view/geometry/relativeRegion.js';
import { point } from '../../../src/view/geometry/point.js';

describe('drawable', () => {
  test('id returns identifier provided at construction', () => {
    const identifier = `drawable-${Math.random().toString(36).slice(2)}`;
    const d = drawable(identifier, relativeRegion(10, 10), () => {});
    assert.equal(d.id(), identifier, 'identifier was not returned correctly');
  });

  test('id returns non-ASCII identifier', () => {
    const identifier = 'узел-α-節點';
    const d = drawable(identifier, relativeRegion(10, 10), () => {});
    assert.equal(d.id(), identifier, 'non-ASCII identifier was not returned correctly');
  });

  test('bounds returns relativeRegion provided at construction', () => {
    const bounds = relativeRegion(25, 35);
    const d = drawable('test', bounds, () => {});
    assert.equal(d.bounds().string(), bounds.string(), 'bounds was not returned correctly');
  });

  test('draw invokes render function with position', () => {
    let received = null;
    const pos = point(100, 200);
    const d = drawable('test', relativeRegion(10, 10), (p) => { received = p; });
    d.draw(pos);
    assert.equal(received, pos, 'render was not invoked with position');
  });

  test('draw returns result from render function', () => {
    const expected = { rendered: true };
    const d = drawable('test', relativeRegion(10, 10), () => expected);
    const result = d.draw(point(0, 0));
    assert.equal(result, expected, 'render result was not returned');
  });

  test('draw passes position correctly to render', () => {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    let capturedX = null;
    let capturedY = null;
    const d = drawable('test', relativeRegion(10, 10), (p) => {
      capturedX = p.x();
      capturedY = p.y();
    });
    d.draw(point(x, y));
    assert.equal(capturedX, x, 'x coordinate was not passed correctly');
  });

  test('handles empty string id', () => {
    const d = drawable('', relativeRegion(10, 10), () => {});
    assert.equal(d.id(), '', 'empty string id was not handled');
  });

  test('handles numeric id', () => {
    const d = drawable(42, relativeRegion(10, 10), () => {});
    assert.equal(d.id(), 42, 'numeric id was not handled');
  });

  test('bounds at position creates correct world region', () => {
    const bounds = relativeRegion(20, 30);
    const d = drawable('test', bounds, () => {});
    const pos = point(100, 100);
    const world = d.bounds().at(pos);
    assert.equal(world.string(), 'region(80,70,120,130)', 'world region was incorrect');
  });
});
