import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { arrow } from '../../src/view/arrow.js';
import { point } from '../../src/view/geometry/point.js';

describe('arrow', () => {
  test('tip points in direction of positive hw when hh is zero', () => {
    const vertices = arrow(point(0, 0), 10, 0, 5).vertices();
    assert.ok(
      Math.abs(vertices[0].x() - 5) < 1e-10 && Math.abs(vertices[0].y()) < 1e-10,
      'tip did not point along positive x axis'
    );
  });

  test('tip points in direction of positive hh when hw is zero', () => {
    const vertices = arrow(point(0, 0), 0, 10, 5).vertices();
    assert.ok(
      Math.abs(vertices[0].x()) < 1e-10 && Math.abs(vertices[0].y() - 5) < 1e-10,
      'tip did not point along positive y axis'
    );
  });

  test('tip offsets from center by provided position', () => {
    const cx = 100 + Math.random() * 200;
    const cy = 100 + Math.random() * 200;
    const vertices = arrow(point(cx, cy), 10, 0, 5).vertices();
    assert.ok(
      Math.abs(vertices[0].x() - (cx + 5)) < 1e-10,
      'tip was not offset from center x'
    );
  });

  test('left and right are symmetric around direction axis', () => {
    const hw = 3 + Math.random() * 10;
    const hh = 3 + Math.random() * 10;
    const vertices = arrow(point(0, 0), hw, hh, 5).vertices();
    const midX = (vertices[1].x() + vertices[2].x()) / 2;
    const midY = (vertices[1].y() + vertices[2].y()) / 2;
    const len = Math.sqrt(hw * hw + hh * hh);
    const nx = hw / len;
    const ny = hh / len;
    const cross = midX * ny - midY * nx;
    assert.ok(Math.abs(cross) < 1e-10, 'left and right were not symmetric around direction axis');
  });

  test('vertices scale with size parameter', () => {
    const hw = 3 + Math.random() * 10;
    const hh = 3 + Math.random() * 10;
    const small = arrow(point(0, 0), hw, hh, 4).vertices();
    const large = arrow(point(0, 0), hw, hh, 8).vertices();
    const distSmall = Math.sqrt(small[0].x() ** 2 + small[0].y() ** 2);
    const distLarge = Math.sqrt(large[0].x() ** 2 + large[0].y() ** 2);
    assert.ok(Math.abs(distLarge / distSmall - 2) < 1e-10, 'doubling size did not double tip distance');
  });

  test('zero length direction returns degenerate triangle at center', () => {
    const cx = Math.random() * 100;
    const cy = Math.random() * 100;
    const vertices = arrow(point(cx, cy), 0, 0, 5).vertices();
    assert.ok(
      vertices[0].equals(point(cx, cy)) && vertices[1].equals(point(cx, cy)) && vertices[2].equals(point(cx, cy)),
      'zero direction did not produce degenerate triangle at center'
    );
  });

  test('tip distance from center equals size for random direction', () => {
    const hw = -50 + Math.random() * 100;
    const hh = -50 + Math.random() * 100;
    const size = 3 + Math.random() * 20;
    const len = Math.sqrt(hw * hw + hh * hh);
    if (len < 1e-10) return;
    const vertices = arrow(point(0, 0), hw, hh, size).vertices();
    const dist = Math.sqrt(vertices[0].x() ** 2 + vertices[0].y() ** 2);
    assert.ok(Math.abs(dist - size) < 1e-10, 'tip distance from center did not equal size');
  });

  test('handles negative direction components', () => {
    const vertices = arrow(point(0, 0), -10, -10, 5).vertices();
    assert.ok(
      vertices[0].x() < 0 && vertices[0].y() < 0,
      'tip did not point in negative direction'
    );
  });
});
