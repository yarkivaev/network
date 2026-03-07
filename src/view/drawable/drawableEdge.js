import { drawable } from './drawable.js';
import { relativeRegion } from '../geometry/relativeRegion.js';

/**
 * Creates a drawable for a network edge with line bounds.
 *
 * A drawableEdge wraps an edge identifier with a rectangular extent
 * defined by half-width and half-height. The canvas abstraction is
 * used for rendering - it must provide a line method. The drawable
 * is rendering-agnostic; actual drawing is delegated to the canvas.
 *
 * @param {string} id - The edge identifier
 * @param {Object} canvas - Canvas abstraction with a line(pos, halfWidth, halfHeight) method
 * @param {number} halfWidth - Half the width of the line bounding box
 * @param {number} halfHeight - Half the height of the line bounding box
 * @returns {Object} A drawable for the edge
 *
 * @example
 * const canvas = {
 *   line: (pos, halfWidth, halfHeight) => { // draw line }
 * };
 * const d = drawableEdge('A->B', canvas, 50, 30);
 * d.id(); // 'A->B'
 * d.bounds(); // relativeRegion(50, 30)
 * d.draw(point(100, 100)); // renders line at position
 */
const drawableEdge = (id, canvas, halfWidth, halfHeight) => drawable(
  id,
  relativeRegion(halfWidth, halfHeight),
  (pos) => canvas.line(pos, halfWidth, halfHeight)
);

export { drawableEdge };
