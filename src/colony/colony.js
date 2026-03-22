/**
 * Creates an immutable Mars colony from a decorated network.
 *
 * A colony wraps a network that has position metadata and obstacle
 * information, presenting it in domain terms: modules (residential
 * units), roads (passable connections), and obstacles (blocked terrain).
 * Supports destructive mutations that return new colony instances.
 *
 * @param {Object} net - Decorated network with position, blocked, decisions
 * @param {Object} distribution - Bernoulli distribution for obstacle sampling
 * @returns {Object} Colony with modules, roads, destroy, sever, etc
 *
 * @example
 * const col = colony(obs, bernoulli(0.2, Math.random));
 * col.destroy(nodeObj); // returns new colony without that module
 */
import { network } from '../core/network.js';
import { mutation } from '../core/mutation.js';
import { obstacle } from '../generation/obstacle.js';

const colony = (net, distribution) => ({
  /**
   * Returns all residential modules in the colony.
   *
   * @returns {Array} Array of node objects
   */
  modules: () => net.nodes().items(),
  /**
   * Returns passable road edges (non-blocked, one per undirected pair).
   *
   * @returns {Array} Array of edge objects
   */
  roads: () => {
    const seen = new Set();
    return net.edges().items().filter((e) => {
      const src = e.source().identifier();
      const tgt = e.target().identifier();
      const k = src < tgt ? `${src},${tgt}` : `${tgt},${src}`;
      if (seen.has(k)) { return false; }
      seen.add(k);
      return !net.blocked(src, tgt);
    });
  },
  /**
   * Returns blocked road edges (one per undirected pair).
   *
   * @returns {Array} Array of blocked edge objects
   */
  obstacles: () => {
    const seen = new Set();
    return net.edges().items().filter((e) => {
      const src = e.source().identifier();
      const tgt = e.target().identifier();
      const k = src < tgt ? `${src},${tgt}` : `${tgt},${src}`;
      if (seen.has(k)) { return false; }
      seen.add(k);
      return net.blocked(src, tgt);
    });
  },
  /**
   * Returns the road distance between two modules.
   *
   * @param {*} a - First module identifier
   * @param {*} b - Second module identifier
   * @returns {number} Edge weight (Euclidean distance)
   */
  distance: (a, b) => net.edges().get(`${a}->${b}`).cost(),
  /**
   * Returns the position of a module.
   *
   * @param {*} id - Module identifier
   * @returns {Object} Position with x and y properties
   */
  position: (id) => net.position(id),
  /**
   * Returns a plain network with only passable edges.
   *
   * @returns {Object} Network without blocked edges
   */
  passable: () => {
    let result = network();
    for (const n of net.nodes().items()) { result = mutation(result).add(n); }
    for (const e of net.edges().items()) {
      if (!net.blocked(e.source().identifier(), e.target().identifier())) {
        result = mutation(result).link(e);
      }
    }
    return result;
  },
  /**
   * Returns the decorated network for external access.
   *
   * @returns {Object} The obstacle-decorated network
   */
  network: () => net,
  /**
   * Returns a new colony with the given module destroyed.
   *
   * @param {Object} nodeObj - The node object to remove
   * @returns {Object} New colony without the module and its edges
   */
  destroy: (nodeObj) => {
    const plain = mutation(net).remove(nodeObj);
    const wrapped = { nodes: () => plain.nodes(), edges: () => plain.edges(), position: (id) => net.position(id) };
    return colony(obstacle(wrapped, distribution, net.decisions()), distribution);
  },
  /**
   * Returns a new colony with the road between two modules severed.
   *
   * @param {*} sourceId - First module identifier
   * @param {*} targetId - Second module identifier
   * @returns {Object} New colony without that road
   */
  sever: (sourceId, targetId) => {
    const src = net.nodes().get(sourceId);
    const tgt = net.nodes().get(targetId);
    let plain = mutation(net).unlink(src, tgt);
    if (plain.edges().has(`${targetId}->${sourceId}`)) {
      plain = mutation(plain).unlink(tgt, src);
    }
    const wrapped = { nodes: () => plain.nodes(), edges: () => plain.edges(), position: (id) => net.position(id) };
    return colony(obstacle(wrapped, distribution, net.decisions()), distribution);
  }
});

export { colony };
