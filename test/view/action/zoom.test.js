import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { zoom } from '../../../src/view/action/zoom.js';

describe('zoom', () => {
  test('type returns zoom string', () => {
    const factor = Math.random() * 2 + 0.1;
    const act = zoom(factor);
    assert.equal(act.type(), 'zoom', 'type was not zoom');
  });

  test('factor returns provided factor', () => {
    const factor = Math.random() * 2 + 0.1;
    const act = zoom(factor);
    assert.equal(act.factor(), factor, 'factor was not returned correctly');
  });

  test('handles zoom in factor', () => {
    const factor = 1 + Math.random();
    const act = zoom(factor);
    assert.equal(act.factor(), factor, 'zoom in factor was not handled');
  });

  test('handles zoom out factor', () => {
    const factor = Math.random() * 0.9 + 0.1;
    const act = zoom(factor);
    assert.equal(act.factor(), factor, 'zoom out factor was not handled');
  });

  test('handles factor of 1', () => {
    const act = zoom(1);
    assert.equal(act.factor(), 1, 'factor of 1 was not handled');
  });

  test('handles small factor', () => {
    const factor = 0.01 + Math.random() * 0.09;
    const act = zoom(factor);
    assert.equal(act.factor(), factor, 'small factor was not handled');
  });

  test('handles large factor', () => {
    const factor = 10 + Math.random() * 90;
    const act = zoom(factor);
    assert.equal(act.factor(), factor, 'large factor was not handled');
  });
});
