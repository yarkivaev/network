/**
 * Generic drawable object with shape bounds and rendering capability.
 *
 * A drawable encapsulates an identifier, relative bounds defining its shape
 * extent, and a render function that can draw the object at a given position.
 * Drawables are immutable and rendering-agnostic - the actual drawing is
 * delegated to the provided render function.
 *
 * @param {string} id - Unique identifier for this drawable
 * @param {Object} bounds - A relativeRegion defining the shape extent
 * @param {Function} render - Function that renders the drawable at a position
 * @returns {Object} A drawable object with id, bounds, and draw methods
 *
 * @example
 * const d = drawable('node-1', relativeRegion(20, 20), (pos) => {
 *   canvas.circle(pos, 20);
 * });
 * d.id(); // 'node-1'
 * d.bounds(); // the relativeRegion
 * d.draw(point(100, 100)); // renders at position
 */
const drawable = (id, bounds, render) => ({
  id: () => id,
  bounds: () => bounds,
  draw: (position, zm) => render(position, zm)
});

export { drawable };
