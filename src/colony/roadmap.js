import { network } from '../core/network.js';
import { mutation } from '../core/mutation.js';

/**
 * Creates an immutable minimum-cost road network for a colony.
 *
 * A roadmap delegates to an injected tree algorithm to compute
 * the spanning tree of the colony's passable roads.
 *
 * @param {Object} col - The colony to build roads for
 * @param {Function} algorithm - Tree factory matching tree(net).span() interface
 * @returns {Object} Roadmap with cost, edges, and span methods
 *
 * @example
 * const rm = roadmap(colony, fakeTree);
 * rm.cost();  // total construction cost
 * rm.edges(); // Set of edge identifiers in the road network
 * rm.span();  // bidirectional MST network for routing
 */
const roadmap = (col, algorithm) => {
  const passable = col.passable();
  const mst = algorithm(passable).span();
  const items = mst.edges().items();
  const edgeIds = new Set(items.flatMap((e) => [e.identifier(), `${e.target().identifier()}->${e.source().identifier()}`]));
  const total = items.reduce((sum, e) => sum + e.cost(), 0);
  let filtered = network();
  for (const n of passable.nodes().items()) { filtered = mutation(filtered).add(n); }
  for (const e of passable.edges().items()) {
    if (edgeIds.has(e.identifier())) { filtered = mutation(filtered).link(e); }
  }
  return {
    /**
     * Returns the total construction cost of the road network.
     *
     * @returns {number} Sum of edge weights in the spanning tree
     */
    cost: () => total,
    /**
     * Returns the set of edge identifiers in the road network.
     *
     * @returns {Set} Edge identifiers
     */
    edges: () => edgeIds,
    /**
     * Returns the bidirectional MST network for routing.
     *
     * @returns {Object} Network with all nodes and MST edges in both directions
     */
    span: () => filtered
  };
};

export { roadmap };
