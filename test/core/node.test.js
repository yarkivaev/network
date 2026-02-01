import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { node } from '../../src/core/node.js';

describe('node', () => {
  test('creates node with string identifier', () => {
    const n = node('A');
    assert.equal(n.identifier(), 'A', 'identifier should be A');
  });

  test('creates node with numeric identifier', () => {
    const n = node(42);
    assert.equal(n.identifier(), 42, 'identifier should be 42');
  });

  test('creates node with UUID identifier', () => {
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const n = node(uuid);
    assert.equal(n.identifier(), uuid, 'identifier should be UUID');
  });

  test('creates node with non-ASCII identifier', () => {
    const unicode = 'узел-α-節點';
    const n = node(unicode);
    assert.equal(n.identifier(), unicode, 'identifier should be unicode string');
  });

  test('equals returns true for same identifier', () => {
    const n1 = node('X');
    const n2 = node('X');
    assert.equal(n1.equals(n2), true, 'nodes with same identifier should be equal');
  });

  test('equals returns false for different identifier', () => {
    const n1 = node('X');
    const n2 = node('Y');
    assert.equal(n1.equals(n2), false, 'nodes with different identifiers should not be equal');
  });

  test('equals works with random identifiers', () => {
    const random1 = Math.random().toString(36).substring(7);
    const random2 = Math.random().toString(36).substring(7);
    const n1 = node(random1);
    const n2 = node(random1);
    const n3 = node(random2);
    assert.equal(n1.equals(n2), true, 'nodes with same random identifier should be equal');
    assert.equal(n1.equals(n3), false, 'nodes with different random identifiers should not be equal');
  });

  test('identifier returns the original value', () => {
    const original = 'test-value-123';
    const n = node(original);
    assert.equal(n.identifier(), original, 'identifier should return original value');
  });

  test('hash returns consistent value for same node', () => {
    const n = node('consistent');
    const hash1 = n.hash();
    const hash2 = n.hash();
    assert.equal(hash1, hash2, 'hash should be consistent');
  });

  test('hash returns different values for different nodes', () => {
    const n1 = node('first');
    const n2 = node('second');
    assert.notEqual(n1.hash(), n2.hash(), 'different nodes should have different hashes');
  });

  test('string contains identifier', () => {
    const n = node('myId');
    assert.ok(n.string().includes('myId'), 'string should contain identifier');
  });

  test('throws when identifier is null', () => {
    assert.throws(() => node(null), /cannot be null/, 'should throw for null identifier');
  });

  test('throws when identifier is undefined', () => {
    assert.throws(() => node(undefined), /cannot be null/, 'should throw for undefined identifier');
  });
});
