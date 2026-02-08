import { region } from './region.js';

/**
 * Merges two regions into an encompassing bounding region.
 *
 * Returns a new region that contains both input regions, with boundaries
 * at the minimum and maximum coordinates of both.
 *
 * @param {Object} a - The first region
 * @param {Object} b - The second region
 * @returns {Object} A region encompassing both inputs
 *
 * @example
 * const r1 = region(0, 0, 50, 50);
 * const r2 = region(25, 25, 100, 100);
 * union(r1, r2).string(); // 'region(0,0,100,100)'
 */
const union = (a, b) => a.apply((aMinX, aMinY, aMaxX, aMaxY) =>
  b.apply((bMinX, bMinY, bMaxX, bMaxY) =>
    region(
      Math.min(aMinX, bMinX),
      Math.min(aMinY, bMinY),
      Math.max(aMaxX, bMaxX),
      Math.max(aMaxY, bMaxY)
    )
  )
);

export { union };
