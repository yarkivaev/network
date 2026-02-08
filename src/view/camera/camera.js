/**
 * View state containing offset, zoom, and viewport dimensions.
 *
 * A camera defines the transformation from world coordinates to screen
 * coordinates. It encapsulates the view offset (pan position), zoom level,
 * and viewport dimensions. Cameras are immutable.
 *
 * @param {Object} offset - The offset point (pan position in screen space)
 * @param {number} zoom - The zoom level (1 = 100%, 2 = 200%, etc.)
 * @param {number} width - The viewport width in pixels
 * @param {number} height - The viewport height in pixels
 * @returns {Object} A camera with offset, zoom, width, and height methods
 *
 * @example
 * const cam = camera(point(0, 0), 1, 800, 600);
 * cam.offset(); // point(0, 0)
 * cam.zoom(); // 1
 * cam.width(); // 800
 * cam.height(); // 600
 */
const camera = (offset, zoom, width, height) => ({
  offset: () => offset,
  zoom: () => zoom,
  width: () => width,
  height: () => height
});

export { camera };
