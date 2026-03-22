import { network } from '../core/network.js';
import { mutation } from '../core/mutation.js';

/**
 * BFS helper that returns predecessor map and tree edges from a network.
 *
 * @param {Object} net - Network to traverse
 * @param {*} start - Starting node identifier
 * @returns {Object} Object with predecessors Map and tree edge array
 */
const bfs = (net, start) => {
  const prev = new Map();
  const tree = [];
  const queue = [start];
  prev.set(start, start);
  while (queue.length > 0) {
    const current = queue.shift();
    for (const e of net.edges().items()) {
      const src = e.source().identifier();
      const tgt = e.target().identifier();
      if (src === current && !prev.has(tgt)) {
        prev.set(tgt, current);
        tree.push(e);
        queue.push(tgt);
      }
    }
  }
  return { predecessors: prev, tree };
};

/**
 * Reconstructs a path from a predecessor map.
 *
 * @param {Map} predecessors - Map of id → previous id
 * @param {*} origin - Start identifier
 * @param {*} destination - End identifier
 * @returns {Array} Ordered array of identifiers, empty if no path
 */
const path = (predecessors, origin, destination) => {
  if (!predecessors.has(destination)) { return []; }
  const route = [];
  let step = destination;
  while (step !== origin) {
    route.unshift(step);
    step = predecessors.get(step);
  }
  route.unshift(origin);
  return route;
};

/**
 * Fake MST implementation using BFS spanning tree.
 *
 * @param {Object} net - Network to span
 * @returns {Object} Tree object with span method
 */
const fakeTree = (net) => ({
  /**
   * Returns a BFS spanning tree (not minimum cost).
   *
   * @returns {Object} Network with tree edges
   */
  span: () => {
    const nodes = net.nodes().items();
    if (nodes.length === 0) { return network(); }
    const { tree } = bfs(net, nodes[0].identifier());
    let result = network();
    for (const n of nodes) { result = mutation(result).add(n); }
    for (const e of tree) { result = mutation(result).link(e); }
    return result;
  }
});

/**
 * Fake shortest path using BFS (ignores edge weights).
 *
 * @param {Object} net - Network to route through
 * @param {Object} origin - Origin node
 * @param {Object} dest - Destination node
 * @returns {Object} Route object with path, cost, exists methods
 */
const fakeRoute = (net, origin, dest) => {
  const oid = origin.identifier();
  const did = dest.identifier();
  if (oid === did) {
    return { path: () => [origin], cost: () => 0, exists: () => true, shortest: () => fakeRoute(net, origin, dest) };
  }
  const { predecessors } = bfs(net, oid);
  const ids = path(predecessors, oid, did);
  const found = ids.length > 0;
  const nodes = found ? ids.map((id) => net.nodes().get(id)) : [];
  let total = 0;
  for (let i = 0; i < ids.length - 1; i++) {
    total += net.edges().get(`${ids[i]}->${ids[i + 1]}`).cost();
  }
  return {
    path: () => {
      if (!found) { throw new Error('No path exists'); }
      return [...nodes];
    },
    cost: () => {
      if (!found) { throw new Error('No path exists'); }
      return total;
    },
    exists: () => found,
    shortest: () => fakeRoute(net, origin, dest)
  };
};

/**
 * Fake max flow using single BFS path minimum capacity.
 *
 * @param {Object} net - Network to flow through
 * @param {Object} source - Source node
 * @param {Object} sink - Sink node
 * @returns {Object} Flow object with maximum and bottlenecks methods
 */
const fakeFlow = (net, source, sink) => {
  const { predecessors } = bfs(net, source.identifier());
  const ids = path(predecessors, source.identifier(), sink.identifier());
  const caps = [];
  for (let i = 0; i < ids.length - 1; i++) {
    const key = `${ids[i]}->${ids[i + 1]}`;
    if (net.edges().has(key)) {
      caps.push(net.edges().get(key));
    }
  }
  const min = caps.length > 0 ? Math.min(...caps.map((e) => e.capacity())) : 0;
  const necks = caps.filter((e) => e.capacity() === min);
  return {
    maximum: () => min,
    bottlenecks: () => necks,
    edges: () => [...caps]
  };
};

/**
 * Fake vulnerability using BFS tree heuristic.
 *
 * @param {Object} net - Network to analyze
 * @returns {Object} Vulnerability object with bridges, articulations, critical, fragments
 */
const fakeVulnerability = (net) => {
  const nodes = net.nodes().items();
  if (nodes.length === 0) {
    return { bridges: () => [], articulations: () => [], critical: () => ({ bridges: [], articulations: [] }), fragments: (node) => [] };
  }
  const { tree } = bfs(net, nodes[0].identifier());
  const degree = new Map();
  for (const e of tree) {
    const src = e.source().identifier();
    const tgt = e.target().identifier();
    degree.set(src, (degree.get(src) || 0) + 1);
    degree.set(tgt, (degree.get(tgt) || 0) + 1);
  }
  const arts = nodes.filter((n) => (degree.get(n.identifier()) || 0) >= 3);
  return {
    bridges: () => [...tree],
    articulations: () => arts,
    critical: () => ({ bridges: [...tree], articulations: arts }),
    fragments: (node) => []
  };
};

export { fakeFlow, fakeRoute, fakeTree, fakeVulnerability };
