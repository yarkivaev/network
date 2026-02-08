import { region } from './region.js';

/**
 * Bounds relative to a center point.
 *
 * A relativeRegion defines dimensions that can be positioned at any point
 * to create an absolute region. This is useful for defining the bounds of
 * shapes that can be moved around, like circles or rectangles centered
 * on a position.
 *
 * @param {number} halfWidth - Half the width of the region
 * @param {number} halfHeight - Half the height of the region
 * @returns {Object} A relativeRegion object with at and string methods
 *
 * @example
 * const bounds = relativeRegion(20, 20);
 * const r = bounds.at(point(100, 100));
 * // Creates region(80, 80, 120, 120)
 * bounds.string(); // "relativeRegion(20,20)"
 */
const relativeRegion = (halfWidth, halfHeight) => ({
  at: (pos) => region(
    pos.x() - halfWidth,
    pos.y() - halfHeight,
    pos.x() + halfWidth,
    pos.y() + halfHeight
  ),
  string: () => `relativeRegion(${halfWidth},${halfHeight})`
});

export { relativeRegion };
