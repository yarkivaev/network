import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { subdivide } from '../../../src/view/geometry/subdivide.js';
import { region } from '../../../src/view/geometry/region.js';

describe('subdivide', () => {
  test('returns four quadrants', () => {
    const r = region(0, 0, 100, 100);
    const quads = subdivide(r);
    assert.equal(quads.length, 4, 'subdivide did not return four quadrants');
  });

  test('creates correct northwest quadrant', () => {
    const r = region(0, 0, 100, 100);
    const quads = subdivide(r);
    assert.equal(quads[0].string(), 'region(0,0,50,50)', 'northwest quadrant was incorrect');
  });

  test('creates correct northeast quadrant', () => {
    const r = region(0, 0, 100, 100);
    const quads = subdivide(r);
    assert.equal(quads[1].string(), 'region(50,0,100,50)', 'northeast quadrant was incorrect');
  });

  test('creates correct southwest quadrant', () => {
    const r = region(0, 0, 100, 100);
    const quads = subdivide(r);
    assert.equal(quads[2].string(), 'region(0,50,50,100)', 'southwest quadrant was incorrect');
  });

  test('creates correct southeast quadrant', () => {
    const r = region(0, 0, 100, 100);
    const quads = subdivide(r);
    assert.equal(quads[3].string(), 'region(50,50,100,100)', 'southeast quadrant was incorrect');
  });

  test('handles negative coordinates', () => {
    const r = region(-100, -100, 0, 0);
    const quads = subdivide(r);
    assert.equal(quads[0].string(), 'region(-100,-100,-50,-50)', 'negative coordinate quadrant was incorrect');
  });

  test('handles non-zero origin', () => {
    const r = region(50, 50, 150, 150);
    const quads = subdivide(r);
    assert.equal(quads[0].string(), 'region(50,50,100,100)', 'non-zero origin quadrant was incorrect');
  });

  test('quadrants cover entire original region', () => {
    const r = region(0, 0, 100, 100);
    const quads = subdivide(r);
    const corners = [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 25, y: 75 },
      { x: 75, y: 75 }
    ];
    for (let i = 0; i < 4; i++) {
      const result = quads[i].apply((minX, minY, maxX, maxY) =>
        corners[i].x >= minX && corners[i].x <= maxX && corners[i].y >= minY && corners[i].y <= maxY
      );
      assert.equal(result, true, `quadrant ${i} did not contain its center`);
    }
  });
});
