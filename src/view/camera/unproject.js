import { point } from '../geometry/point.js';

/**
 * Transforms screen coordinates to world coordinates.
 *
 * The unproject function reverses the camera transformation to convert
 * a point in screen space to world space. The transformation applies
 * offset subtraction followed by zoom division.
 *
 * World = (Screen - offset) / zoom
 *
 * @param {Object} cam - The camera defining the transformation
 * @param {Object} pt - The screen point to unproject
 * @returns {Object} An unprojection result with a point method
 *
 * @example
 * const cam = camera(point(100, 100), 2, 800, 600);
 * const screen = point(200, 200);
 * const world = unproject(cam, screen).point();
 * // world = ((200 - 100) / 2, (200 - 100) / 2) = (50, 50)
 */
const unproject = (cam, pt) => ({
  point: () => point(
    (pt.x() - cam.offset().x()) / cam.zoom(),
    (pt.y() - cam.offset().y()) / cam.zoom()
  )
});

export { unproject };
