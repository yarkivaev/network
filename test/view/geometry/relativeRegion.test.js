import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { relativeRegion } from '../../../src/view/geometry/relativeRegion.js';
import { point } from '../../../src/view/geometry/point.js';

describe('relativeRegion', () => {
  test('at creates region centered on provided point', () => {
    const bounds = relativeRegion(20, 30);
    const r = bounds.at(point(100, 100));
    assert.equal(r.string(), 'region(80,70,120,130)', 'region was not centered correctly');
  });

  test('at creates region at origin', () => {
    const bounds = relativeRegion(50, 50);
    const r = bounds.at(point(0, 0));
    assert.equal(r.string(), 'region(-50,-50,50,50)', 'region at origin was incorrect');
  });

  test('at creates region at negative coordinates', () => {
    const bounds = relativeRegion(10, 10);
    const r = bounds.at(point(-50, -50));
    assert.equal(r.string(), 'region(-60,-60,-40,-40)', 'region at negative point was incorrect');
  });

  test('at creates zero-size region when dimensions are zero', () => {
    const bounds = relativeRegion(0, 0);
    const r = bounds.at(point(50, 50));
    assert.equal(r.string(), 'region(50,50,50,50)', 'zero-size region was incorrect');
  });

  test('at handles decimal positions', () => {
    const bounds = relativeRegion(5, 5);
    const r = bounds.at(point(10.5, 20.5));
    assert.equal(r.string(), 'region(5.5,15.5,15.5,25.5)', 'decimal position was handled incorrectly');
  });

  test('at handles asymmetric dimensions', () => {
    const bounds = relativeRegion(10, 30);
    const r = bounds.at(point(100, 100));
    assert.equal(r.string(), 'region(90,70,110,130)', 'asymmetric dimensions were incorrect');
  });

  test('string returns formatted representation', () => {
    const bounds = relativeRegion(25, 35);
    assert.equal(bounds.string(), 'relativeRegion(25,35)', 'string format was incorrect');
  });

  test('string handles decimal dimensions', () => {
    const bounds = relativeRegion(12.5, 7.5);
    assert.equal(bounds.string(), 'relativeRegion(12.5,7.5)', 'decimal dimensions were not formatted correctly');
  });

  test('string handles zero dimensions', () => {
    const bounds = relativeRegion(0, 0);
    assert.equal(bounds.string(), 'relativeRegion(0,0)', 'zero dimensions were not formatted correctly');
  });

  test('at result contains center point', () => {
    const bounds = relativeRegion(20, 20);
    const center = point(100, 100);
    const r = bounds.at(center);
    assert.equal(r.contains(center), true, 'region did not contain its center point');
  });

  test('at result has correct width', () => {
    const halfW = Math.random() * 100;
    const bounds = relativeRegion(halfW, 50);
    const r = bounds.at(point(0, 0));
    const width = r.apply((minX, minY, maxX, maxY) => maxX - minX);
    assert.equal(width, halfW * 2, 'region width was incorrect');
  });

  test('at result has correct height', () => {
    const halfH = Math.random() * 100;
    const bounds = relativeRegion(50, halfH);
    const r = bounds.at(point(0, 0));
    const height = r.apply((minX, minY, maxX, maxY) => maxY - minY);
    assert.equal(height, halfH * 2, 'region height was incorrect');
  });
});
