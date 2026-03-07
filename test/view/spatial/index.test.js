import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { index } from '../../../src/view/spatial/index.js';
import { quadtree } from '../../../src/view/spatial/quadtree.js';
import { region } from '../../../src/view/geometry/region.js';

describe('index', () => {
  test('query returns empty array for empty index', () => {
    const idx = index(quadtree());
    const result = idx.query(region(0, 0, 100, 100));
    assert.deepEqual(result, [], 'empty index did not return empty array');
  });

  test('query returns item within search region', () => {
    const idx = index(quadtree()).add('item', region(10, 10, 30, 30));
    const result = idx.query(region(0, 0, 50, 50));
    assert.deepEqual(result, ['item'], 'item was not found in query');
  });

  test('query returns empty array when item outside search region', () => {
    const idx = index(quadtree()).add('item', region(100, 100, 120, 120));
    const result = idx.query(region(0, 0, 50, 50));
    assert.deepEqual(result, [], 'item outside region was returned');
  });

  test('add creates new index with item', () => {
    const idx = index(quadtree());
    const updated = idx.add('item', region(0, 0, 10, 10));
    const original = idx.query(region(0, 0, 100, 100));
    const added = updated.query(region(0, 0, 100, 100));
    assert.deepEqual(original, [], 'original index was modified');
  });

  test('add returns index containing new item', () => {
    const idx = index(quadtree());
    const updated = idx.add('item', region(0, 0, 10, 10));
    const result = updated.query(region(0, 0, 100, 100));
    assert.deepEqual(result, ['item'], 'new index did not contain item');
  });

  test('query returns multiple items in search region', () => {
    let idx = index(quadtree());
    idx = idx.add('a', region(10, 10, 20, 20));
    idx = idx.add('b', region(30, 30, 40, 40));
    const result = idx.query(region(0, 0, 50, 50));
    assert.equal(result.length, 2, 'not all items were found');
  });

  test('query handles non-ASCII identifiers', () => {
    const id = 'индекс-ε-索引';
    const idx = index(quadtree()).add(id, region(0, 0, 10, 10));
    const result = idx.query(region(0, 0, 20, 20));
    assert.deepEqual(result, [id], 'non-ASCII identifier was not found');
  });

  test('query handles numeric identifiers', () => {
    const idx = index(quadtree()).add(42, region(0, 0, 10, 10));
    const result = idx.query(region(0, 0, 20, 20));
    assert.deepEqual(result, [42], 'numeric identifier was not found');
  });

  test('add handles items at negative coordinates', () => {
    const idx = index(quadtree()).add('negative', region(-50, -50, -30, -30));
    const result = idx.query(region(-100, -100, 0, 0));
    assert.deepEqual(result, ['negative'], 'negative coordinate item was not found');
  });

  test('add handles items far apart', () => {
    let idx = index(quadtree());
    idx = idx.add('near', region(0, 0, 10, 10));
    idx = idx.add('far', region(1000, 1000, 1010, 1010));
    const nearResult = idx.query(region(0, 0, 20, 20));
    const farResult = idx.query(region(990, 990, 1020, 1020));
    assert.deepEqual(nearResult, ['near'], 'near item was not found');
  });

  test('chained adds work correctly', () => {
    const idx = index(quadtree())
      .add('a', region(0, 0, 10, 10))
      .add('b', region(20, 20, 30, 30))
      .add('c', region(40, 40, 50, 50));
    const result = idx.query(region(0, 0, 60, 60));
    assert.equal(result.length, 3, 'chained adds did not add all items');
  });

  test('query handles point-sized search region', () => {
    const idx = index(quadtree()).add('item', region(0, 0, 10, 10));
    const result = idx.query(region(5, 5, 5, 5));
    assert.deepEqual(result, ['item'], 'point query did not find item');
  });

  test('query deduplicates overlapping items', () => {
    let idx = index(quadtree());
    idx = idx.add('large', region(0, 0, 100, 100));
    idx = idx.add('small', region(10, 10, 15, 15));
    const result = idx.query(region(0, 0, 100, 100));
    const unique = [...new Set(result)];
    assert.equal(result.length, unique.length, 'duplicate items were returned');
  });
});
