import { point } from '../geometry/point.js';

/**
 * Creates an immutable layout that reads position metadata from a network.
 *
 * Reads positions from the network's position(id) method and scales
 * them to fit the canvas. No computation — just coordinate transform.
 *
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {Object} Layout with compute and refine methods
 *
 * @example
 * const lyt = embedding(800, 600);
 * const positions = lyt.compute(net); // Map of id → point
 */
const embedding = (width, height) => ({
  /**
   * Returns node positions scaled to fit the canvas.
   *
   * @param {Object} net - Network with position(id) method
   * @returns {Map} Map of nodeId to point objects
   */
  compute: (net) => {
    const ids = net.nodes().items().map((n) => n.identifier());
    if (ids.length === 0) {
      return new Map();
    }
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let minY = Infinity;
    for (const id of ids) {
      const pos = net.position(id);
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    }
    const span = Math.max(maxX - minX, maxY - minY, 1);
    const scale = Math.min(width, height) * 0.8 / span;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const result = new Map();
    for (const id of ids) {
      const pos = net.position(id);
      result.set(id, point(width / 2 + scale * (pos.x - cx), height / 2 + scale * (pos.y - cy)));
    }
    return result;
  },
  /**
   * Returns recomputed positions from network metadata.
   *
   * @param {Object} net - Network with position(id) method
   * @param {Map} existing - Ignored
   * @returns {Map} Map of nodeId to point objects
   */
  refine: (net) => {
    const ids = net.nodes().items().map((n) => n.identifier());
    if (ids.length === 0) {
      return new Map();
    }
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let minY = Infinity;
    for (const id of ids) {
      const pos = net.position(id);
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    }
    const span = Math.max(maxX - minX, maxY - minY, 1);
    const scale = Math.min(width, height) * 0.8 / span;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const result = new Map();
    for (const id of ids) {
      const pos = net.position(id);
      result.set(id, point(width / 2 + scale * (pos.x - cx), height / 2 + scale * (pos.y - cy)));
    }
    return result;
  }
});

export { embedding };
