import { point } from '../geometry/point.js';

/**
 * Transforms world coordinates to screen coordinates.
 *
 * The project function applies the camera transformation to convert
 * a point in world space to screen space. The transformation applies
 * zoom scaling followed by offset translation.
 *
 * Screen = World * zoom + offset
 *
 * @param {Object} cam - The camera defining the transformation
 * @param {Object} pt - The world point to project
 * @returns {Object} A projection result with a point method
 *
 * @example
 * const cam = camera(point(100, 100), 2, 800, 600);
 * const world = point(50, 50);
 * const screen = project(cam, world).point();
 * // screen = (50 * 2 + 100, 50 * 2 + 100) = (200, 200)
 */
const project = (cam, pt) => ({
  point: () => point(
    pt.x() * cam.zoom() + cam.offset().x(),
    pt.y() * cam.zoom() + cam.offset().y()
  )
});

export { project };
