import { scan } from '../core/scan.js';

/**
 * Creates a route finder.
 *
 * @param {Object} net - The network to route through
 * @param {Object} origin - The starting node
 * @param {Object} destination - The ending node
 * @returns {Object} Route object with shortest, path, cost, and exists methods
 * @throws {Error} When origin or destination is not in network
 *
 * @example
 * const r = route(net, nodeA, nodeB);
 * r.exists(); // true/false
 * r.path(); // [nodeA, ..., nodeB]
 * r.cost(); // total path cost
 */
const route = (net, origin, destination) => {
  const scanner = scan(net);
  if (!scanner.has(origin)) {
    throw new Error(`Origin node does not exist: ${origin.identifier()}`);
  }
  if (!scanner.has(destination)) {
    throw new Error(`Destination node does not exist: ${destination.identifier()}`);
  }
  return {
    /**
     * Returns a new route finder for the same path.
     *
     * @returns {Object} New route object
     */
    shortest: () => {
      throw new Error('Not implemented');
    },
    /**
     * Returns the ordered sequence of nodes in the path.
     *
     * @returns {Array} Array of nodes from origin to destination
     * @throws {Error} When no path exists
     */
    path: () => {
      throw new Error('Not implemented');
    },
    /**
     * Returns the total traversal cost of the path.
     *
     * @returns {number} Sum of edge weights along the path
     * @throws {Error} When no path exists
     */
    cost: () => {
      throw new Error('Not implemented');
    },
    /**
     * Checks if a path exists between origin and destination.
     *
     * @returns {boolean} True if route is possible
     */
    exists: () => {
      throw new Error('Not implemented');
    }
  };
};

export { route };
