import { drawable } from './drawable.js';
import { relativeRegion } from '../geometry/relativeRegion.js';

/**
 * Creates a drawable for a network node with circular bounds.
 *
 * A drawableNode wraps a node identifier with a circular shape defined
 * by a radius. The canvas abstraction is used for rendering - it must
 * provide a circle method. The drawable is rendering-agnostic; actual
 * drawing is delegated to the canvas.
 *
 * @param {string} id - The node identifier
 * @param {Object} canvas - Canvas abstraction with a circle(pos, radius, label) method
 * @param {number} [radius=20] - The circle radius
 * @returns {Object} A drawable for the node
 *
 * @example
 * const canvas = {
 *   circle: (pos, radius, label) => { // draw circle }
 * };
 * const d = drawableNode('A', canvas, 25);
 * d.id(); // 'A'
 * d.bounds(); // relativeRegion(25, 25)
 * d.draw(point(100, 100)); // renders circle at position
 */
const drawableNode = (id, canvas, radius = 20) => drawable(
  id,
  relativeRegion(radius, radius),
  (pos) => canvas.circle(pos, radius, id)
);

export { drawableNode };
