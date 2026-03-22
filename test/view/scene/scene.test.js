import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { dragging, idle, panning, scene } from '../../../src/view/scene/scene.js';
import { world } from '../../../src/view/world/world.js';
import { down } from '../../../src/view/action/down.js';
import { move } from '../../../src/view/action/move.js';
import { up } from '../../../src/view/action/up.js';
import { zoom } from '../../../src/view/action/zoom.js';
import { index } from '../../../src/view/spatial/index.js';
import { quadtree } from '../../../src/view/spatial/quadtree.js';
import { camera } from '../../../src/view/camera/camera.js';
import { unproject } from '../../../src/view/camera/unproject.js';
import { point } from '../../../src/view/geometry/point.js';
import { drawable } from '../../../src/view/drawable/drawable.js';
import { relativeRegion } from '../../../src/view/geometry/relativeRegion.js';

describe('scene', () => {
  test('action returns new scene instance', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    const next = scn.action(down(point(100, 100)));
    assert.notEqual(scn, next, 'action did not return new scene');
  });

  test('zoom action scales camera zoom level', () => {
    const factor = 1 + Math.random();
    const wld = world(index(quadtree()), new Map(), new Map());
    let scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn = scn.action(zoom(factor, point(0, 0)));
    scn.render();
    assert.equal(typeof scn.action, 'function', 'zoom action did not return valid scene');
  });

  test('down action on empty space starts panning mode', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    const next = scn.action(down(point(100, 100)));
    assert.equal(typeof next.action, 'function', 'down action did not return valid scene');
  });

  test('down action on drawable starts dragging mode', () => {
    const id = `test-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const wld = world(index(quadtree()), new Map(), new Map()).add(id, drw, pos);
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    const next = scn.action(down(point(100, 100)));
    assert.equal(typeof next.action, 'function', 'down on drawable did not return valid scene');
  });

  test('move action during panning shifts camera offset', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    let scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn = scn.action(down(point(100, 100)));
    scn = scn.action(move(point(150, 120)));
    assert.equal(typeof scn.render, 'function', 'move during panning did not return valid scene');
  });

  test('move action during dragging updates position', () => {
    const id = `drag-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const wld = world(index(quadtree()), new Map(), new Map()).add(id, drw, pos);
    let scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn = scn.action(down(point(100, 100)));
    scn = scn.action(move(point(150, 150)));
    assert.equal(typeof scn.action, 'function', 'move during dragging did not return valid scene');
  });

  test('up action returns to idle mode', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    let scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn = scn.action(down(point(100, 100)));
    scn = scn.action(up(point(100, 100)));
    assert.equal(typeof scn.action, 'function', 'up action did not return valid scene');
  });

  test('render calls draw on visible drawables', () => {
    const id = `visible-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    let drawn = false;
    const drw = drawable(id, bounds, () => { drawn = true; });
    const pos = point(100, 100);
    const wld = world(index(quadtree()), new Map(), new Map()).add(id, drw, pos);
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn.render();
    assert.equal(drawn, true, 'render did not call draw on visible drawable');
  });

  test('render does not draw offscreen drawables', () => {
    const id = `offscreen-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    let drawn = false;
    const drw = drawable(id, bounds, () => { drawn = true; });
    const pos = point(2000, 2000);
    const wld = world(index(quadtree()), new Map(), new Map()).add(id, drw, pos);
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn.render();
    assert.equal(drawn, false, 'render drew offscreen drawable');
  });

  test('idle mode type returns idle', () => {
    const mode = idle();
    assert.equal(mode.type(), 'idle', 'idle type was not idle');
  });

  test('panning mode type returns panning', () => {
    const anchor = point(Math.random() * 100, Math.random() * 100);
    const mode = panning(anchor);
    assert.equal(mode.type(), 'panning', 'panning type was not panning');
  });

  test('panning mode anchor returns provided anchor', () => {
    const anchor = point(Math.random() * 100, Math.random() * 100);
    const mode = panning(anchor);
    assert.equal(mode.anchor(), anchor, 'panning anchor was not returned correctly');
  });

  test('dragging mode type returns dragging', () => {
    const target = `target-${Math.random().toString(36)}`;
    const anchor = point(Math.random() * 100, Math.random() * 100);
    const mode = dragging(target, anchor);
    assert.equal(mode.type(), 'dragging', 'dragging type was not dragging');
  });

  test('dragging mode target returns provided target', () => {
    const target = `target-${Math.random().toString(36)}`;
    const anchor = point(Math.random() * 100, Math.random() * 100);
    const mode = dragging(target, anchor);
    assert.equal(mode.target(), target, 'dragging target was not returned correctly');
  });

  test('dragging mode anchor returns provided anchor', () => {
    const target = `target-${Math.random().toString(36)}`;
    const anchor = point(Math.random() * 100, Math.random() * 100);
    const mode = dragging(target, anchor);
    assert.equal(mode.anchor(), anchor, 'dragging anchor was not returned correctly');
  });

  test('handles non-ASCII identifiers in drawables', () => {
    const id = `сцена-λ-場景-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    let drawn = false;
    const drw = drawable(id, bounds, () => { drawn = true; });
    const pos = point(100, 100);
    const wld = world(index(quadtree()), new Map(), new Map()).add(id, drw, pos);
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn.render();
    assert.equal(drawn, true, 'non-ASCII identifier was not handled');
  });

  test('handles numeric identifiers', () => {
    const id = Math.floor(Math.random() * 10000);
    const bounds = relativeRegion(25, 25);
    let drawn = false;
    const drw = drawable(id, bounds, () => { drawn = true; });
    const pos = point(100, 100);
    const wld = world(index(quadtree()), new Map(), new Map()).add(id, drw, pos);
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn.render();
    assert.equal(drawn, true, 'numeric identifier was not handled');
  });

  test('multiple zoom actions compound', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    let scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn = scn.action(zoom(2, point(0, 0)));
    scn = scn.action(zoom(1.5, point(0, 0)));
    assert.equal(typeof scn.action, 'function', 'multiple zoom actions did not work');
  });

  test('panning sequence moves camera', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    let scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    scn = scn.action(down(point(100, 100)));
    scn = scn.action(move(point(200, 200)));
    scn = scn.action(up(point(200, 200)));
    assert.equal(typeof scn.render, 'function', 'panning sequence did not complete');
  });

  test('move without down does nothing', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    const next = scn.action(move(point(200, 200)));
    assert.notEqual(scn, next, 'move without down did not return new scene');
  });

  test('up without down returns to idle', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const scn = scene(wld, camera(point(0, 0), 1, 800, 600));
    const next = scn.action(up(point(100, 100)));
    assert.equal(typeof next.action, 'function', 'up without down did not work');
  });

  test('zoom preserves world point under cursor for x', () => {
    const ox = Math.random() * 200;
    const oy = Math.random() * 200;
    const z = 1 + Math.random();
    const cx = Math.random() * 800;
    const cy = Math.random() * 600;
    const factor = 1 + Math.random();
    const cam1 = camera(point(ox, oy), z, 800, 600);
    const cursor = point(cx, cy);
    const before = unproject(cam1, cursor).point();
    const scn = scene(world(index(quadtree()), new Map(), new Map()), cam1);
    const cam2 = scn.action(zoom(factor, cursor)).state().camera;
    const after = unproject(cam2, cursor).point();
    assert.ok(Math.abs(before.x() - after.x()) < 1e-10, 'world x under cursor shifted after zoom');
  });

  test('zoom preserves world point under cursor for y', () => {
    const ox = Math.random() * 200;
    const oy = Math.random() * 200;
    const z = 1 + Math.random();
    const cx = Math.random() * 800;
    const cy = Math.random() * 600;
    const factor = 1 + Math.random();
    const cam1 = camera(point(ox, oy), z, 800, 600);
    const cursor = point(cx, cy);
    const before = unproject(cam1, cursor).point();
    const scn = scene(world(index(quadtree()), new Map(), new Map()), cam1);
    const cam2 = scn.action(zoom(factor, cursor)).state().camera;
    const after = unproject(cam2, cursor).point();
    assert.ok(Math.abs(before.y() - after.y()) < 1e-10, 'world y under cursor shifted after zoom');
  });

  test('zoom out preserves world point under cursor', () => {
    const ox = Math.random() * 200;
    const oy = Math.random() * 200;
    const z = 1 + Math.random();
    const cx = Math.random() * 800;
    const cy = Math.random() * 600;
    const factor = 0.3 + Math.random() * 0.6;
    const cam1 = camera(point(ox, oy), z, 800, 600);
    const cursor = point(cx, cy);
    const before = unproject(cam1, cursor).point();
    const scn = scene(world(index(quadtree()), new Map(), new Map()), cam1);
    const cam2 = scn.action(zoom(factor, cursor)).state().camera;
    const after = unproject(cam2, cursor).point();
    assert.ok(Math.abs(before.x() - after.x()) < 1e-10, 'world point under cursor shifted after zoom out');
  });

  test('sequential zooms preserve world point under cursor', () => {
    const ox = Math.random() * 200;
    const oy = Math.random() * 200;
    const z = 1 + Math.random();
    const cx = Math.random() * 800;
    const cy = Math.random() * 600;
    const cursor = point(cx, cy);
    const cam1 = camera(point(ox, oy), z, 800, 600);
    const before = unproject(cam1, cursor).point();
    let scn = scene(world(index(quadtree()), new Map(), new Map()), cam1);
    scn = scn.action(zoom(1 + Math.random(), cursor));
    scn = scn.action(zoom(0.3 + Math.random() * 0.6, cursor));
    const cam2 = scn.state().camera;
    const after = unproject(cam2, cursor).point();
    assert.ok(Math.abs(before.x() - after.x()) < 1e-10, 'world point under cursor shifted after sequential zooms');
  });
});
