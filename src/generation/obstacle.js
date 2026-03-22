import { pair } from '../core/pair.js';

/**
 * Creates an immutable obstacle decoration over a network.
 *
 * An obstacle wraps a network, preserving all nodes and edges with
 * their original weights, while adding metadata about which edges
 * are impassable. The distribution is sampled once per undirected
 * edge pair; both directions share the same obstacle status.
 * The decorated object implements the network interface and can
 * be used anywhere a network is expected.
 *
 * @param {Object} net - Network with bidirectional weighted edges
 * @param {Object} distribution - Object with sample() returning 0 or 1
 * @returns {Object} Decorated network with nodes, edges, and blocked query
 *
 * @example
 * const obs = obstacle(topo.network(), bernoulli(0.2, Math.random));
 * obs.edges(); // same edges with original weights
 * obs.blocked(0, 1); // true if edge 0-1 is an obstacle
 */
const obstacle = (net, distribution) => {
  const decisions = new Map();
  return {
    /**
     * Returns the set of all nodes in the decorated network.
     *
     * @returns {Object} Set containing all nodes
     */
    nodes: () => net.nodes(),
    /**
     * Returns the set of all edges with original weights.
     *
     * @returns {Object} Set containing all edges
     */
    edges: () => net.edges(),
    /**
     * Returns the position of a node, delegated to the wrapped network.
     *
     * @param {*} id - Node identifier
     * @returns {Object} Position {x, y}
     */
    position: (id) => net.position(id),
    /**
     * Returns whether the edge between two nodes is an obstacle.
     *
     * @param {*} source - Source node identifier
     * @param {*} target - Target node identifier
     * @returns {boolean} True if the edge is blocked
     */
    blocked: (source, target) => {
      const k = pair(source, target).identifier();
      if (!decisions.has(k)) {
        const exists = net.edges().has(`${source}->${target}`) || net.edges().has(`${target}->${source}`);
        decisions.set(k, exists && distribution.sample() === 1);
      }
      return decisions.get(k);
    }
  };
};

export { obstacle };
