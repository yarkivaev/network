import { point } from './geometry/point.js';

/**
 * Creates an immutable arrowhead shape for a directional edge indicator.
 *
 * An arrow computes three triangle vertices (tip, left, right) from
 * a center point, direction half-extents, and size. The tip points
 * along the direction defined by hw and hh. When the direction has
 * zero length, all three vertices collapse to the center.
 *
 * @param {Object} center - The midpoint where the arrow is placed
 * @param {number} hw - Horizontal half-extent (direction x-component)
 * @param {number} hh - Vertical half-extent (direction y-component)
 * @param {number} size - Arrowhead length in pixels
 * @returns {Object} Arrow with a vertices method
 *
 * @example
 * const a = arrow(point(50, 50), 10, 0, 6);
 * a.vertices(); // [tip, left, right] as point objects
 */
const arrow = (center, hw, hh, size) => ({
  /**
   * Returns the three triangle vertices of this arrowhead.
   *
   * @returns {Array} Array of three points: [tip, left, right]
   */
  vertices: () => {
    const len = Math.sqrt(hw * hw + hh * hh);
    if (len < 1e-15) {
      return [center, center, center];
    }
    const nx = hw / len;
    const ny = hh / len;
    const px = -ny;
    const py = nx;
    return [
      point(center.x() + nx * size, center.y() + ny * size),
      point(center.x() - nx * size * 0.4 + px * size * 0.5, center.y() - ny * size * 0.4 + py * size * 0.5),
      point(center.x() - nx * size * 0.4 - px * size * 0.5, center.y() - ny * size * 0.4 - py * size * 0.5)
    ];
  }
});

export { arrow };
