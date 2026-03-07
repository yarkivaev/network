/**
 * Zoom action with a scale factor.
 *
 * The zoom action represents a zoom change request. Factor greater than 1
 * zooms in, factor less than 1 zooms out. It is immutable and provides
 * access to its type and factor.
 *
 * @param {number} fct - The zoom scale factor
 * @returns {Object} A zoom action with type and factor methods
 *
 * @example
 * const zoomIn = zoom(1.1);
 * zoomIn.type(); // 'zoom'
 * zoomIn.factor(); // 1.1
 *
 * const zoomOut = zoom(0.9);
 * zoomOut.factor(); // 0.9
 */
const zoom = (fct) => ({
  type: () => 'zoom',
  factor: () => fct
});

export { zoom };
