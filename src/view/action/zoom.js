/**
 * Zoom action with a scale factor anchored at a screen point.
 *
 * The zoom action represents a zoom change request anchored at the cursor
 * position. Factor greater than 1 zooms in, factor less than 1 zooms out.
 * It is immutable and provides access to its type, factor, and anchor point.
 *
 * @param {number} fct - The zoom scale factor
 * @param {Object} pt - The screen point where zoom is anchored
 * @returns {Object} A zoom action with type, factor, and point methods
 *
 * @example
 * const zoomIn = zoom(1.1, point(400, 300));
 * zoomIn.type(); // 'zoom'
 * zoomIn.factor(); // 1.1
 * zoomIn.point(); // point(400, 300)
 *
 * const zoomOut = zoom(0.9, point(200, 150));
 * zoomOut.factor(); // 0.9
 */
const zoom = (fct, pt) => ({
  type: () => 'zoom',
  factor: () => fct,
  point: () => pt
});

export { zoom };
