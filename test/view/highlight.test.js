import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { highlight } from '../../src/view/highlight.js';

describe('highlight', () => {
  test('starts with empty edges', () => {
    assert.equal(highlight().edges().size, 0, 'default edges not empty');
  });

  test('returns provided edge set', () => {
    const edges = new Set(['0->1', '1->2']);
    assert.equal(highlight(edges).edges().size, 2, 'edge set not returned');
  });

  test('returns provided node set', () => {
    const nodes = new Set([0, 1]);
    assert.equal(highlight(new Set(), nodes).nodes().size, 2, 'node set not returned');
  });

  test('returns provided color', () => {
    assert.equal(highlight(new Set(), new Set(), '#ff0000').color(), '#ff0000', 'color not returned');
  });

  test('returns provided label', () => {
    assert.equal(highlight(new Set(), new Set(), '', 'MST cost').label(), 'MST cost', 'label not returned');
  });
});
