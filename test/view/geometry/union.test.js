import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { union } from '../../../src/view/geometry/union.js';
import { region } from '../../../src/view/geometry/region.js';

describe('union', () => {
  test('returns region encompassing both inputs', () => {
    const a = region(0, 0, 50, 50);
    const b = region(25, 25, 100, 100);
    const result = union(a, b);
    assert.equal(result.string(), 'region(0,0,100,100)', 'union did not encompass both regions');
  });

  test('handles non-overlapping regions', () => {
    const a = region(0, 0, 10, 10);
    const b = region(90, 90, 100, 100);
    const result = union(a, b);
    assert.equal(result.string(), 'region(0,0,100,100)', 'union did not encompass distant regions');
  });

  test('handles contained region', () => {
    const outer = region(0, 0, 100, 100);
    const inner = region(25, 25, 75, 75);
    const result = union(outer, inner);
    assert.equal(result.string(), 'region(0,0,100,100)', 'union with contained region changed boundary');
  });

  test('handles identical regions', () => {
    const a = region(10, 20, 30, 40);
    const b = region(10, 20, 30, 40);
    const result = union(a, b);
    assert.equal(result.string(), 'region(10,20,30,40)', 'union of identical regions changed boundary');
  });

  test('handles negative coordinates', () => {
    const a = region(-100, -100, 0, 0);
    const b = region(0, 0, 100, 100);
    const result = union(a, b);
    assert.equal(result.string(), 'region(-100,-100,100,100)', 'union did not handle negative coordinates');
  });

  test('is commutative', () => {
    const a = region(0, 0, 50, 50);
    const b = region(25, 25, 100, 100);
    const ab = union(a, b);
    const ba = union(b, a);
    assert.equal(ab.string(), ba.string(), 'union was not commutative');
  });

  test('handles touching edges', () => {
    const a = region(0, 0, 50, 50);
    const b = region(50, 0, 100, 50);
    const result = union(a, b);
    assert.equal(result.string(), 'region(0,0,100,50)', 'union did not handle touching edges');
  });

  test('handles zero-size region', () => {
    const a = region(50, 50, 50, 50);
    const b = region(0, 0, 100, 100);
    const result = union(a, b);
    assert.equal(result.string(), 'region(0,0,100,100)', 'union did not handle zero-size region');
  });
});
