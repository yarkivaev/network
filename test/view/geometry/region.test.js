import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { region } from '../../../src/view/geometry/region.js';
import { point } from '../../../src/view/geometry/point.js';

describe('region', () => {
  test('contains returns true for point inside region', () => {
    const r = region(0, 0, 100, 100);
    const p = point(50, 50);
    assert.equal(r.contains(p), true, 'point inside region was not contained');
  });

  test('contains returns true for point on left edge', () => {
    const r = region(0, 0, 100, 100);
    const p = point(0, 50);
    assert.equal(r.contains(p), true, 'point on left edge was not contained');
  });

  test('contains returns true for point on right edge', () => {
    const r = region(0, 0, 100, 100);
    const p = point(100, 50);
    assert.equal(r.contains(p), true, 'point on right edge was not contained');
  });

  test('contains returns true for point on top edge', () => {
    const r = region(0, 0, 100, 100);
    const p = point(50, 0);
    assert.equal(r.contains(p), true, 'point on top edge was not contained');
  });

  test('contains returns true for point on bottom edge', () => {
    const r = region(0, 0, 100, 100);
    const p = point(50, 100);
    assert.equal(r.contains(p), true, 'point on bottom edge was not contained');
  });

  test('contains returns true for point at corner', () => {
    const r = region(0, 0, 100, 100);
    const p = point(0, 0);
    assert.equal(r.contains(p), true, 'point at corner was not contained');
  });

  test('contains returns false for point outside left', () => {
    const r = region(0, 0, 100, 100);
    const p = point(-1, 50);
    assert.equal(r.contains(p), false, 'point outside left was contained');
  });

  test('contains returns false for point outside right', () => {
    const r = region(0, 0, 100, 100);
    const p = point(101, 50);
    assert.equal(r.contains(p), false, 'point outside right was contained');
  });

  test('contains returns false for point outside top', () => {
    const r = region(0, 0, 100, 100);
    const p = point(50, -1);
    assert.equal(r.contains(p), false, 'point outside top was contained');
  });

  test('contains returns false for point outside bottom', () => {
    const r = region(0, 0, 100, 100);
    const p = point(50, 101);
    assert.equal(r.contains(p), false, 'point outside bottom was contained');
  });

  test('intersects returns true for overlapping regions', () => {
    const a = region(0, 0, 100, 100);
    const b = region(50, 50, 150, 150);
    assert.equal(a.intersects(b), true, 'overlapping regions did not intersect');
  });

  test('intersects returns true for touching edges', () => {
    const a = region(0, 0, 100, 100);
    const b = region(100, 0, 200, 100);
    assert.equal(a.intersects(b), true, 'touching regions did not intersect');
  });

  test('intersects returns true for contained region', () => {
    const outer = region(0, 0, 100, 100);
    const inner = region(25, 25, 75, 75);
    assert.equal(outer.intersects(inner), true, 'contained region did not intersect');
  });

  test('intersects returns false for separated regions horizontally', () => {
    const a = region(0, 0, 100, 100);
    const b = region(200, 0, 300, 100);
    assert.equal(a.intersects(b), false, 'separated regions intersected');
  });

  test('intersects returns false for separated regions vertically', () => {
    const a = region(0, 0, 100, 100);
    const b = region(0, 200, 100, 300);
    assert.equal(a.intersects(b), false, 'separated regions intersected');
  });

  test('apply passes coordinates to callback', () => {
    const r = region(10, 20, 30, 40);
    const result = r.apply((minX, minY, maxX, maxY) => [minX, minY, maxX, maxY]);
    assert.deepEqual(result, [10, 20, 30, 40], 'apply did not pass correct coordinates');
  });

  test('apply returns callback result', () => {
    const r = region(0, 0, 100, 100);
    const width = r.apply((minX, minY, maxX, maxY) => maxX - minX);
    assert.equal(width, 100, 'apply did not return callback result');
  });

  test('apply handles negative coordinates', () => {
    const r = region(-50, -50, 50, 50);
    const result = r.apply((minX, minY, maxX, maxY) => minX + minY);
    assert.equal(result, -100, 'apply did not handle negative coordinates');
  });

  test('string returns formatted representation', () => {
    const r = region(10, 20, 30, 40);
    assert.equal(r.string(), 'region(10,20,30,40)', 'string format was incorrect');
  });

  test('string handles negative coordinates', () => {
    const r = region(-50, -50, 50, 50);
    assert.equal(r.string(), 'region(-50,-50,50,50)', 'negative coordinates were not formatted correctly');
  });

  test('handles zero-size region', () => {
    const r = region(50, 50, 50, 50);
    const p = point(50, 50);
    assert.equal(r.contains(p), true, 'zero-size region did not contain its point');
  });
});
