import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { camera } from '../../../src/view/camera/camera.js';
import { point } from '../../../src/view/geometry/point.js';

describe('camera', () => {
  test('offset returns point provided at construction', () => {
    const off = point(100, 200);
    const cam = camera(off, 1, 800, 600);
    assert.equal(cam.offset(), off, 'offset was not returned correctly');
  });

  test('offset returns point with negative coordinates', () => {
    const off = point(-50, -100);
    const cam = camera(off, 1, 800, 600);
    assert.equal(cam.offset().x(), -50, 'negative x offset was not returned correctly');
  });

  test('zoom returns value provided at construction', () => {
    const z = Math.random() * 5 + 0.1;
    const cam = camera(point(0, 0), z, 800, 600);
    assert.equal(cam.zoom(), z, 'zoom was not returned correctly');
  });

  test('zoom handles small values', () => {
    const cam = camera(point(0, 0), 0.01, 800, 600);
    assert.equal(cam.zoom(), 0.01, 'small zoom was not returned correctly');
  });

  test('zoom handles large values', () => {
    const cam = camera(point(0, 0), 100, 800, 600);
    assert.equal(cam.zoom(), 100, 'large zoom was not returned correctly');
  });

  test('width returns value provided at construction', () => {
    const w = Math.floor(Math.random() * 1000) + 100;
    const cam = camera(point(0, 0), 1, w, 600);
    assert.equal(cam.width(), w, 'width was not returned correctly');
  });

  test('height returns value provided at construction', () => {
    const h = Math.floor(Math.random() * 1000) + 100;
    const cam = camera(point(0, 0), 1, 800, h);
    assert.equal(cam.height(), h, 'height was not returned correctly');
  });

  test('handles decimal dimensions', () => {
    const cam = camera(point(0, 0), 1, 800.5, 600.5);
    assert.equal(cam.width(), 800.5, 'decimal width was not returned correctly');
  });

});
