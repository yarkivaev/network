/**
 * Creates an immutable supply route between two colony modules.
 *
 * A supply route delegates to an injected route algorithm for
 * shortest path computation over the roadmap's spanning network.
 *
 * @param {Object} rm - The roadmap whose span provides the routing network
 * @param {*} origin - Origin module identifier
 * @param {*} destination - Destination module identifier
 * @param {Function} algorithm - Route factory matching route(net, o, d) interface
 * @returns {Object} Supply with path, cost, exists, edges methods
 *
 * @example
 * const s = supply(roadmap(colony, tree), 0, 5, route);
 * s.exists(); // true if route found
 */
const supply = (rm, origin, destination, algorithm) => {
  const net = rm.span();
  const originNode = net.nodes().get(origin);
  const destNode = net.nodes().get(destination);
  const result = algorithm(net, originNode, destNode);
  const edgeIds = new Set();
  if (result.exists()) {
    const ids = result.path().map((n) => n.identifier());
    for (let i = 0; i < ids.length - 1; i++) {
      edgeIds.add(`${ids[i]}->${ids[i + 1]}`);
      edgeIds.add(`${ids[i + 1]}->${ids[i]}`);
    }
  }
  return {
    /**
     * Returns the ordered sequence of module identifiers.
     *
     * @returns {Array} Path from origin to destination
     */
    path: () => result.path().map((n) => n.identifier()),
    /**
     * Returns the total route distance.
     *
     * @returns {number} Sum of edge weights along path
     */
    cost: () => result.cost(),
    /**
     * Returns whether a route was found.
     *
     * @returns {boolean} True if destination is reachable
     */
    exists: () => result.exists(),
    /**
     * Returns edge identifiers along the route.
     *
     * @returns {Set} Edge identifiers (both directions)
     */
    edges: () => edgeIds
  };
};

export { supply };
