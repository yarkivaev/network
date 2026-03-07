import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { quadtree } from '../../../src/view/spatial/quadtree.js';
import { region } from '../../../src/view/geometry/region.js';

describe('quadtree', () => {
  test('empty returns true for new quadtree', () => {
    const tree = quadtree();
    assert.equal(tree.empty(), true, 'new quadtree was not empty');
  });

  test('empty returns false after insert', () => {
    const tree = quadtree().insert('item', region(0, 0, 10, 10));
    assert.equal(tree.empty(), false, 'quadtree with item was empty');
  });

  test('insert creates new quadtree with item', () => {
    const tree = quadtree();
    const updated = tree.insert('item', region(0, 0, 10, 10));
    assert.equal(tree.empty(), true, 'original quadtree was modified');
  });

  test('query returns empty array for empty quadtree', () => {
    const tree = quadtree();
    const result = tree.query(region(0, 0, 100, 100));
    assert.deepEqual(result, [], 'empty quadtree did not return empty array');
  });

  test('query returns item within search region', () => {
    const tree = quadtree().insert('item', region(10, 10, 30, 30));
    const result = tree.query(region(0, 0, 50, 50));
    assert.deepEqual(result, ['item'], 'item was not found in query');
  });

  test('query returns empty array when item outside search region', () => {
    const tree = quadtree().insert('item', region(100, 100, 120, 120));
    const result = tree.query(region(0, 0, 50, 50));
    assert.deepEqual(result, [], 'item outside region was returned');
  });

  test('query returns multiple items in search region', () => {
    let tree = quadtree();
    tree = tree.insert('a', region(10, 10, 20, 20));
    tree = tree.insert('b', region(30, 30, 40, 40));
    const result = tree.query(region(0, 0, 50, 50));
    assert.equal(result.length, 2, 'not all items were found');
  });

  test('query returns only items intersecting search region', () => {
    let tree = quadtree();
    tree = tree.insert('inside', region(10, 10, 20, 20));
    tree = tree.insert('outside', region(200, 200, 210, 210));
    const result = tree.query(region(0, 0, 50, 50));
    assert.deepEqual(result, ['inside'], 'wrong items were returned');
  });

  test('query deduplicates items spanning multiple regions', () => {
    let tree = quadtree(null, 2);
    tree = tree.insert('a', region(0, 0, 10, 10));
    tree = tree.insert('b', region(20, 20, 30, 30));
    tree = tree.insert('c', region(40, 40, 50, 50));
    tree = tree.insert('large', region(0, 0, 100, 100));
    const result = tree.query(region(0, 0, 100, 100));
    const unique = [...new Set(result)];
    assert.equal(result.length, unique.length, 'duplicate items were returned');
  });

  test('insert expands boundary for item outside current bounds', () => {
    let tree = quadtree().insert('first', region(0, 0, 10, 10));
    tree = tree.insert('second', region(100, 100, 110, 110));
    const result = tree.query(region(0, 0, 200, 200));
    assert.equal(result.length, 2, 'item outside original bounds was not inserted');
  });

  test('insert handles negative coordinates', () => {
    const tree = quadtree().insert('item', region(-50, -50, -30, -30));
    const result = tree.query(region(-100, -100, 0, 0));
    assert.deepEqual(result, ['item'], 'negative coordinate item was not found');
  });

  test('insert handles item at origin', () => {
    const tree = quadtree().insert('origin', region(-5, -5, 5, 5));
    const result = tree.query(region(-10, -10, 10, 10));
    assert.deepEqual(result, ['origin'], 'origin item was not found');
  });

  test('query handles touching edges', () => {
    const tree = quadtree().insert('item', region(0, 0, 10, 10));
    const result = tree.query(region(10, 0, 20, 10));
    assert.deepEqual(result, ['item'], 'touching item was not found');
  });

  test('query handles point-sized search region', () => {
    const tree = quadtree().insert('item', region(0, 0, 10, 10));
    const result = tree.query(region(5, 5, 5, 5));
    assert.deepEqual(result, ['item'], 'point query did not find item');
  });

  test('insert subdivides when capacity exceeded', () => {
    let tree = quadtree(null, 2);
    tree = tree.insert('a', region(0, 0, 5, 5));
    tree = tree.insert('b', region(10, 10, 15, 15));
    tree = tree.insert('c', region(90, 90, 95, 95));
    const result = tree.query(region(0, 0, 100, 100));
    assert.equal(result.length, 3, 'items were lost after subdivision');
  });

  test('handles non-ASCII identifiers', () => {
    const id = 'элемент-δ-要素';
    const tree = quadtree().insert(id, region(0, 0, 10, 10));
    const result = tree.query(region(0, 0, 20, 20));
    assert.deepEqual(result, [id], 'non-ASCII identifier was not found');
  });

  test('handles numeric identifiers', () => {
    const tree = quadtree().insert(42, region(0, 0, 10, 10));
    const result = tree.query(region(0, 0, 20, 20));
    assert.deepEqual(result, [42], 'numeric identifier was not found');
  });

  test('handles many items efficiently', () => {
    let tree = quadtree();
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 1000;
      const y = Math.random() * 1000;
      tree = tree.insert(`item-${i}`, region(x, y, x + 10, y + 10));
    }
    const result = tree.query(region(0, 0, 1010, 1010));
    assert.equal(result.length, 100, 'not all items were found');
  });

  test('query returns items partially overlapping search region', () => {
    const tree = quadtree().insert('item', region(40, 40, 60, 60));
    const result = tree.query(region(0, 0, 50, 50));
    assert.deepEqual(result, ['item'], 'partially overlapping item was not found');
  });

  test('preserves items when expanding boundary', () => {
    let tree = quadtree().insert('first', region(0, 0, 10, 10));
    tree = tree.insert('far', region(1000, 1000, 1010, 1010));
    const nearResult = tree.query(region(0, 0, 20, 20));
    const farResult = tree.query(region(990, 990, 1020, 1020));
    assert.deepEqual(nearResult, ['first'], 'near item was lost');
  });

  test('query finds item after reinsertion extending beyond boundary', () => {
    let tree = quadtree();
    tree = tree.insert('A', region(100, 100, 150, 150));
    tree = tree.remove('A');
    tree = tree.insert('A', region(140, 100, 200, 150));
    const hits = tree.query(region(180, 120, 180, 120));
    assert.equal(hits.length, 1, 'query at extended portion did not find item');
  });
});
