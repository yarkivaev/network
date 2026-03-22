/**
 * Creates an immutable Mars colony from a decorated network.
 *
 * A colony wraps a network that has position metadata and obstacle
 * information, presenting it in domain terms: modules (residential
 * units), roads (passable connections), and obstacles (blocked terrain).
 *
 * @param {Object} net - Decorated network with position(id) and blocked(a, b)
 * @returns {Object} Colony with modules, roads, obstacles, distance, position
 *
 * @example
 * const col = colony(obstacle(topo.network(), bernoulli(0.2, Math.random)));
 * col.modules(); // all residential modules
 * col.roads();   // passable connections
 */
import { network } from '../core/network.js';
import { mutation } from '../core/mutation.js';

const colony = (net) => ({
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
  }
});

export { colony };
