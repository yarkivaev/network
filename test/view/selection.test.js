import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { selection } from '../../src/view/selection.js';

describe('selection', () => {
  test('starts empty', () => {
    assert.equal(selection().identifiers().length, 0, 'new selection was not empty');
  });

  test('toggle adds a module', () => {
    const sel = selection().toggle(3);
    assert.equal(sel.has(3), true, 'toggled module not found');
  });

  test('toggle removes an already selected module', () => {
    const sel = selection().toggle(3).toggle(3);
    assert.equal(sel.has(3), false, 'double toggle did not remove');
  });

  test('toggle limits to two modules', () => {
    const sel = selection().toggle(1).toggle(2).toggle(3);
    assert.equal(sel.identifiers().length, 1, 'third toggle did not reset');
  });

  test('clear returns empty selection', () => {
    const sel = selection().toggle(5).clear();
    assert.equal(sel.identifiers().length, 0, 'clear did not empty');
  });

  test('origin returns first selected', () => {
    const sel = selection().toggle(3).toggle(7);
    assert.equal(sel.origin(), 3, 'origin did not return first');
  });

  test('destination returns second selected', () => {
    const sel = selection().toggle(3).toggle(7);
    assert.equal(sel.destination(), 7, 'destination did not return second');
  });

  test('origin returns undefined when empty', () => {
    assert.equal(selection().origin(), undefined, 'empty origin was not undefined');
  });
});
