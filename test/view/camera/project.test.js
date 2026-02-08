import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { project } from '../../../src/view/camera/project.js';
import { camera } from '../../../src/view/camera/camera.js';
import { point } from '../../../src/view/geometry/point.js';

describe('project', () => {
  test('point returns screen coordinates with identity camera', () => {
    const cam = camera(point(0, 0), 1, 800, 600);
    const world = point(100, 200);
    const screen = project(cam, world).point();
    assert.equal(screen.string(), '(100,200)', 'identity projection was incorrect');
  });

  test('point applies offset translation', () => {
    const cam = camera(point(50, 100), 1, 800, 600);
    const world = point(100, 200);
    const screen = project(cam, world).point();
    assert.equal(screen.string(), '(150,300)', 'offset was not applied correctly');
  });

  test('point applies zoom scaling', () => {
    const cam = camera(point(0, 0), 2, 800, 600);
    const world = point(100, 200);
    const screen = project(cam, world).point();
    assert.equal(screen.string(), '(200,400)', 'zoom was not applied correctly');
  });

  test('point applies zoom then offset', () => {
    const cam = camera(point(50, 100), 2, 800, 600);
    const world = point(100, 200);
    const screen = project(cam, world).point();
    assert.equal(screen.string(), '(250,500)', 'zoom and offset were not combined correctly');
  });

  test('point handles negative world coordinates', () => {
    const cam = camera(point(0, 0), 1, 800, 600);
    const world = point(-50, -100);
    const screen = project(cam, world).point();
    assert.equal(screen.string(), '(-50,-100)', 'negative coordinates were not handled');
  });

  test('point handles negative offset', () => {
    const cam = camera(point(-100, -200), 1, 800, 600);
    const world = point(50, 50);
    const screen = project(cam, world).point();
    assert.equal(screen.string(), '(-50,-150)', 'negative offset was not applied correctly');
  });

  test('point handles fractional zoom', () => {
    const cam = camera(point(0, 0), 0.5, 800, 600);
    const world = point(100, 200);
    const screen = project(cam, world).point();
    assert.equal(screen.string(), '(50,100)', 'fractional zoom was not applied correctly');
  });

  test('point handles origin world point', () => {
    const cam = camera(point(100, 200), 2, 800, 600);
    const world = point(0, 0);
    const screen = project(cam, world).point();
    assert.equal(screen.string(), '(100,200)', 'origin projection was incorrect');
  });

  test('point handles large coordinates', () => {
    const cam = camera(point(0, 0), 1, 800, 600);
    const world = point(1e10, 1e10);
    const screen = project(cam, world).point();
    assert.equal(screen.x(), 1e10, 'large x coordinate was not handled');
  });

  test('point returns new point each call', () => {
    const cam = camera(point(0, 0), 1, 800, 600);
    const world = point(100, 100);
    const proj = project(cam, world);
    const a = proj.point();
    const b = proj.point();
    assert.notEqual(a, b, 'same point instance was returned');
  });

  test('point preserves decimal precision', () => {
    const cam = camera(point(0.1, 0.2), 1.5, 800, 600);
    const world = point(10.3, 20.4);
    const screen = project(cam, world).point();
    assert.equal(screen.x(), 10.3 * 1.5 + 0.1, 'decimal precision was lost');
  });
});
