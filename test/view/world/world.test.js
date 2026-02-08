import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { world } from '../../../src/view/world/world.js';
import { index } from '../../../src/view/spatial/index.js';
import { quadtree } from '../../../src/view/spatial/quadtree.js';
import { point } from '../../../src/view/geometry/point.js';
import { region } from '../../../src/view/geometry/region.js';
import { drawable } from '../../../src/view/drawable/drawable.js';
import { relativeRegion } from '../../../src/view/geometry/relativeRegion.js';

describe('world', () => {
  test('move returns new world instance', () => {
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const idx = index(quadtree()).add(id, bounds.at(pos));
    const drwMap = new Map([[id, drw]]);
    const posMap = new Map([[id, pos]]);
    const wld = world(idx, drwMap, posMap);
    const next = wld.move(id, point(200, 200));
    assert.notEqual(wld, next, 'move did not return new world');
  });

  test('move updates position in new world', () => {
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const newPos = point(200, 200);
    const idx = index(quadtree()).add(id, bounds.at(pos));
    const drwMap = new Map([[id, drw]]);
    const posMap = new Map([[id, pos]]);
    const wld = world(idx, drwMap, posMap);
    const next = wld.move(id, newPos);
    const items = next.get([id]);
    assert.equal(items[0].position.x(), 200, 'position x was not updated');
  });

  test('move updates spatial index in new world', () => {
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const newPos = point(500, 500);
    const idx = index(quadtree()).add(id, bounds.at(pos));
    const drwMap = new Map([[id, drw]]);
    const posMap = new Map([[id, pos]]);
    const wld = world(idx, drwMap, posMap);
    const next = wld.move(id, newPos);
    const hits = next.query(point(500, 500));
    assert.equal(hits.length, 1, 'spatial index was not updated');
  });

  test('query returns empty array when no drawable at point', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const hits = wld.query(point(100, 100));
    assert.deepEqual(hits, [], 'query did not return empty array');
  });

  test('query returns id when drawable at point', () => {
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const idx = index(quadtree()).add(id, bounds.at(pos));
    const drwMap = new Map([[id, drw]]);
    const posMap = new Map([[id, pos]]);
    const wld = world(idx, drwMap, posMap);
    const hits = wld.query(point(100, 100));
    assert.equal(hits.length, 1, 'query did not find drawable');
  });

  test('visible returns empty array for empty world', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const rgn = region(0, 0, 800, 600);
    const ids = wld.visible(rgn);
    assert.deepEqual(ids, [], 'visible did not return empty array');
  });

  test('visible returns ids in region', () => {
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const idx = index(quadtree()).add(id, bounds.at(pos));
    const drwMap = new Map([[id, drw]]);
    const posMap = new Map([[id, pos]]);
    const wld = world(idx, drwMap, posMap);
    const rgn = region(0, 0, 200, 200);
    const ids = wld.visible(rgn);
    assert.equal(ids.length, 1, 'visible did not return id');
  });

  test('visible excludes ids outside region', () => {
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(500, 500);
    const idx = index(quadtree()).add(id, bounds.at(pos));
    const drwMap = new Map([[id, drw]]);
    const posMap = new Map([[id, pos]]);
    const wld = world(idx, drwMap, posMap);
    const rgn = region(0, 0, 200, 200);
    const ids = wld.visible(rgn);
    assert.deepEqual(ids, [], 'visible included id outside region');
  });

  test('get returns empty array for empty ids', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const items = wld.get([]);
    assert.deepEqual(items, [], 'get did not return empty array');
  });

  test('get returns drawable and position for id', () => {
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const idx = index(quadtree()).add(id, bounds.at(pos));
    const drwMap = new Map([[id, drw]]);
    const posMap = new Map([[id, pos]]);
    const wld = world(idx, drwMap, posMap);
    const items = wld.get([id]);
    assert.equal(items.length, 1, 'get did not return item');
    assert.equal(items[0].drawable, drw, 'get did not return drawable');
    assert.equal(items[0].position, pos, 'get did not return position');
  });

  test('get returns multiple items for multiple ids', () => {
    const id1 = `node-${Math.random().toString(36)}`;
    const id2 = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw1 = drawable(id1, bounds, () => {});
    const drw2 = drawable(id2, bounds, () => {});
    const pos1 = point(100, 100);
    const pos2 = point(200, 200);
    let idx = index(quadtree());
    idx = idx.add(id1, bounds.at(pos1));
    idx = idx.add(id2, bounds.at(pos2));
    const drwMap = new Map([[id1, drw1], [id2, drw2]]);
    const posMap = new Map([[id1, pos1], [id2, pos2]]);
    const wld = world(idx, drwMap, posMap);
    const items = wld.get([id1, id2]);
    assert.equal(items.length, 2, 'get did not return all items');
  });

  test('add returns new world instance', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const next = wld.add(id, drw, pos);
    assert.notEqual(wld, next, 'add did not return new world');
  });

  test('add makes drawable queryable', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const next = wld.add(id, drw, pos);
    const hits = next.query(point(100, 100));
    assert.equal(hits.length, 1, 'added drawable was not queryable');
  });

  test('add makes drawable retrievable via get', () => {
    const wld = world(index(quadtree()), new Map(), new Map());
    const id = `node-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const next = wld.add(id, drw, pos);
    const items = next.get([id]);
    assert.equal(items[0].drawable, drw, 'added drawable was not retrievable');
  });

  test('handles non-ASCII identifiers', () => {
    const id = `узел-κόσμος-世界-${Math.random().toString(36)}`;
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const wld = world(index(quadtree()), new Map(), new Map());
    const next = wld.add(id, drw, pos);
    const hits = next.query(point(100, 100));
    assert.equal(hits[0], id, 'non-ASCII identifier was not handled');
  });

  test('handles numeric identifiers', () => {
    const id = Math.floor(Math.random() * 10000);
    const bounds = relativeRegion(25, 25);
    const drw = drawable(id, bounds, () => {});
    const pos = point(100, 100);
    const wld = world(index(quadtree()), new Map(), new Map());
    const next = wld.add(id, drw, pos);
    const hits = next.query(point(100, 100));
    assert.equal(hits[0], id, 'numeric identifier was not handled');
  });
});
