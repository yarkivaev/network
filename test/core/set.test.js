import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { set } from '../../src/core/set.js';
import { node } from '../../src/core/node.js';
import { edge } from '../../src/core/edge.js';

describe('set', () => {
  test('creates empty set', () => {
    const s = set();
    assert.equal(s.items().length, 0, 'empty set should have no items');
  });

  test('get returns existing item after add', () => {
    const n = node('A');
    const s = set().add(n);
    assert.equal(s.get('A').identifier(), 'A', 'get should return added item');
  });

  test('get throws for non-existing key', () => {
    const s = set();
    assert.throws(() => s.get('missing'), /does not exist/, 'get should throw for missing key');
  });

  test('has returns true for existing key', () => {
    const n = node('B');
    const s = set().add(n);
    assert.equal(s.has('B'), true, 'has should return true for existing key');
  });

  test('has returns false for non-existing key', () => {
    const s = set();
    assert.equal(s.has('missing'), false, 'has should return false for missing key');
  });

  test('add inserts new item', () => {
    const n = node('C');
    const s = set().add(n);
    assert.equal(s.items().length, 1, 'set should have one item after add');
  });

  test('add throws when key already exists', () => {
    const n1 = node('D');
    const n2 = node('D');
    const s = set().add(n1);
    assert.throws(() => s.add(n2), /already exists/, 'add should throw for duplicate key');
  });

  test('add with random identifiers', () => {
    const random1 = Math.random().toString(36).substring(7);
    const random2 = Math.random().toString(36).substring(7);
    const s = set().add(node(random1)).add(node(random2));
    assert.equal(s.has(random1), true, 'set should contain first random identifier');
    assert.equal(s.has(random2), true, 'set should contain second random identifier');
  });

  test('remove deletes existing item', () => {
    const n = node('E');
    const s = set().add(n).remove('E');
    assert.equal(s.has('E'), false, 'removed item should not exist');
  });

  test('remove throws for non-existing key', () => {
    const s = set();
    assert.throws(() => s.remove('missing'), /does not exist/, 'remove should throw for missing key');
  });

  test('original set unchanged after add', () => {
    const n = node('F');
    const s1 = set();
    const s2 = s1.add(n);
    assert.equal(s1.items().length, 0, 'original set should remain empty');
    assert.equal(s2.items().length, 1, 'new set should have one item');
  });

  test('original set unchanged after remove', () => {
    const n = node('G');
    const s1 = set().add(n);
    const s2 = s1.remove('G');
    assert.equal(s1.items().length, 1, 'original set should still have one item');
    assert.equal(s2.items().length, 0, 'new set should be empty');
  });

  test('works with node objects', () => {
    const n1 = node('node1');
    const n2 = node('node2');
    const s = set().add(n1).add(n2);
    assert.equal(s.get('node1').identifier(), 'node1', 'should retrieve node by identifier');
    assert.equal(s.items().length, 2, 'set should have two nodes');
  });

  test('works with edge objects', () => {
    const a = node('A');
    const b = node('B');
    const e = edge(a, b, 10, 100);
    const s = set().add(e);
    assert.equal(s.has('A->B'), true, 'should find edge by compound key');
    assert.equal(s.get('A->B').cost(), 10, 'should retrieve edge by compound key');
  });

  test('works with non-ASCII identifiers', () => {
    const n = node('узел-α-節點');
    const s = set().add(n);
    assert.equal(s.has('узел-α-節點'), true, 'should handle non-ASCII identifiers');
    assert.equal(s.get('узел-α-節點').identifier(), 'узел-α-節點', 'should retrieve non-ASCII item');
  });

  test('items returns array of all values', () => {
    const n1 = node('X');
    const n2 = node('Y');
    const n3 = node('Z');
    const s = set().add(n1).add(n2).add(n3);
    const items = s.items();
    assert.equal(items.length, 3, 'items should return all three values');
  });
});
