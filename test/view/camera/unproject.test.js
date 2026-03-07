import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { unproject } from '../../../src/view/camera/unproject.js';
import { project } from '../../../src/view/camera/project.js';
import { camera } from '../../../src/view/camera/camera.js';
import { point } from '../../../src/view/geometry/point.js';

describe('unproject', () => {
  test('point returns world coordinates with identity camera', () => {
    const cam = camera(point(0, 0), 1, 800, 600);
    const screen = point(100, 200);
    const world = unproject(cam, screen).point();
    assert.equal(world.string(), '(100,200)', 'identity unprojection was incorrect');
  });

  test('point reverses offset translation', () => {
    const cam = camera(point(50, 100), 1, 800, 600);
    const screen = point(150, 300);
    const world = unproject(cam, screen).point();
    assert.equal(world.string(), '(100,200)', 'offset was not reversed correctly');
  });

  test('point reverses zoom scaling', () => {
    const cam = camera(point(0, 0), 2, 800, 600);
    const screen = point(200, 400);
    const world = unproject(cam, screen).point();
    assert.equal(world.string(), '(100,200)', 'zoom was not reversed correctly');
  });

  test('point reverses zoom and offset', () => {
    const cam = camera(point(50, 100), 2, 800, 600);
    const screen = point(250, 500);
    const world = unproject(cam, screen).point();
    assert.equal(world.string(), '(100,200)', 'zoom and offset were not reversed correctly');
  });

  test('point handles negative screen coordinates', () => {
    const cam = camera(point(0, 0), 1, 800, 600);
    const screen = point(-50, -100);
    const world = unproject(cam, screen).point();
    assert.equal(world.string(), '(-50,-100)', 'negative coordinates were not handled');
  });

  test('point handles negative offset', () => {
    const cam = camera(point(-100, -200), 1, 800, 600);
    const screen = point(-50, -150);
    const world = unproject(cam, screen).point();
    assert.equal(world.string(), '(50,50)', 'negative offset was not reversed correctly');
  });

  test('point handles fractional zoom', () => {
    const cam = camera(point(0, 0), 0.5, 800, 600);
    const screen = point(50, 100);
    const world = unproject(cam, screen).point();
    assert.equal(world.string(), '(100,200)', 'fractional zoom was not reversed correctly');
  });

  test('point handles origin screen point', () => {
    const cam = camera(point(100, 200), 2, 800, 600);
    const screen = point(0, 0);
    const world = unproject(cam, screen).point();
    assert.equal(world.string(), '(-50,-100)', 'origin unprojection was incorrect');
  });

  test('unproject reverses project', () => {
    const cam = camera(point(123, 456), 1.5, 800, 600);
    const original = point(78, 90);
    const screen = project(cam, original).point();
    const back = unproject(cam, screen).point();
    assert.equal(back.x(), original.x(), 'round-trip x was not preserved');
  });

  test('project reverses unproject', () => {
    const cam = camera(point(123, 456), 1.5, 800, 600);
    const original = point(78, 90);
    const world = unproject(cam, original).point();
    const back = project(cam, world).point();
    assert.equal(back.x(), original.x(), 'round-trip x was not preserved');
  });

  test('point returns new point each call', () => {
    const cam = camera(point(0, 0), 1, 800, 600);
    const screen = point(100, 100);
    const unproj = unproject(cam, screen);
    const a = unproj.point();
    const b = unproj.point();
    assert.notEqual(a, b, 'same point instance was returned');
  });

  test('handles large zoom values', () => {
    const cam = camera(point(0, 0), 100, 800, 600);
    const screen = point(1000, 2000);
    const world = unproject(cam, screen).point();
    assert.equal(world.x(), 10, 'large zoom was not handled');
  });
});
