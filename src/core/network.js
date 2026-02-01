import { set } from './set.js';

/**
 * Creates an immutable network (graph) data structure.
 *
 * @param {Object} nodesSet - Set of nodes (internal)
 * @param {Object} edgesSet - Set of edge objects (internal)
 * @returns {Object} Network object with nodes and edges methods
 *
 * @example
 * const net = network();
 * net.nodes(); // empty set
 * net.edges(); // empty set
 * net.nodes().has('A'); // false
 */
const network = (nodesSet = set(), edgesSet = set()) => ({
  /**
   * Returns the set of all nodes in this network.
   *
   * @returns {Object} Set containing all nodes
   */
  nodes: () => nodesSet,
  /**
   * Returns the set of all edges in this network.
   *
   * @returns {Object} Set containing all edges
   */
  edges: () => edgesSet
});

export { network };
