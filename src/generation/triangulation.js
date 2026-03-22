import { node } from '../core/node.js';
import { edge } from '../core/edge.js';
import { network } from '../core/network.js';
import { mutation } from '../core/mutation.js';

/**
 * Computes Euclidean distance between two positions.
 *
 * @param {Object} p1 - First position {x, y}
 * @param {Object} p2 - Second position {x, y}
 * @returns {number} Distance between the two points
 */
const distance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

/**
 * Tests whether a point is inside a triangle defined by three vertices.
 *
 * @param {Object} p - Point to test
 * @param {Object} a - First vertex
 * @param {Object} b - Second vertex
 * @param {Object} c - Third vertex
 * @returns {boolean} True if p is inside triangle abc
 */
const inside = (p, a, b, c) => {
  const d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
  const d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
  const d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
  const neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(neg && pos);
};

/**
 * Computes the area of a triangle from vertex positions.
 *
 * @param {Object} a - First vertex
 * @param {Object} b - Second vertex
 * @param {Object} c - Third vertex
 * @returns {number} Area of the triangle
 */
const area = (a, b, c) => Math.abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2;

/**
 * Finds the index of the face with the largest geometric area.
 *
 * @param {Object} state - State with faces and positions
 * @returns {number} Index of the biggest face
 */
const biggest = (state) => {
  let idx = 0;
  let max = -1;
  for (let i = 0; i < state.faces.length; i++) {
    const face = state.faces[i];
    const size = area(state.positions.get(face[0]), state.positions.get(face[1]), state.positions.get(face[2]));
    if (size > max) {
      max = size;
      idx = i;
    }
  }
  return idx;
};

/**
 * Links two nodes bidirectionally with Euclidean distance as weight.
 *
 * @param {Object} state - Mutable state with net and positions
 * @param {number} a - First node index
 * @param {number} b - Second node index
 */
const link = (state, a, b) => {
  const cost = distance(state.positions.get(a), state.positions.get(b));
  const cap = state.capacity.sample();
  state.net = mutation(state.net).link(edge(state.nodes[a], state.nodes[b], cost, cap));
  state.net = mutation(state.net).link(edge(state.nodes[b], state.nodes[a], cost, cap));
};

/**
 * Places a node near the centroid of a face and links it to face vertices.
 *
 * @param {Object} state - Mutable state
 * @param {Array} face - The face [a, b, c]
 * @param {number} v - Node identifier
 * @param {Object} weight - Distribution for position offsets
 */
const place = (state, face, v, weight) => {
  const pa = state.positions.get(face[0]);
  const pb = state.positions.get(face[1]);
  const pc = state.positions.get(face[2]);
  const cx = (pa.x + pb.x + pc.x) / 3;
  const cy = (pa.y + pb.y + pc.y) / 3;
  let pos = { x: cx + weight.sample(), y: cy + weight.sample() };
  let tries = 0;
  while (!inside(pos, pa, pb, pc) && tries < 20) {
    pos = { x: cx + weight.sample(), y: cy + weight.sample() };
    tries++;
  }
  if (!inside(pos, pa, pb, pc)) {
    pos = { x: cx, y: cy };
  }
  state.positions.set(v, pos);
  link(state, face[0], v);
  link(state, face[1], v);
  link(state, face[2], v);
};

/**
 * Splits the largest-area face, places node, links edges.
 *
 * @param {Object} state - Mutable state
 * @param {number} v - Index of the new node
 * @param {Object} weight - Distribution for position offsets
 */
const split = (state, v, weight) => {
  const idx = biggest(state);
  const face = state.faces[idx];
  state.faces[idx] = state.faces[state.faces.length - 1];
  state.faces.pop();
  state.faces.push([face[0], face[1], v], [face[1], face[2], v], [face[0], face[2], v]);
  state.net = mutation(state.net).add(state.nodes[v]);
  place(state, face, v, weight);
};

/**
 * Creates the initial triangular state.
 *
 * @param {Object} weight - Distribution for position offsets
 * @param {Array} nodes - Array of all node objects
 * @returns {Object} State with faces, positions, net, and nodes
 */
const seed = (weight, capacity, nodes) => {
  const pa = { x: 0, y: 0 };
  const pb = { x: 100 + Math.abs(weight.sample()), y: 0 };
  const cx = (pa.x + pb.x) / 2;
  const cy = 80 + Math.abs(weight.sample());
  const pc = { x: cx + weight.sample(), y: cy };
  const positions = new Map([[0, pa], [1, pb], [2, pc]]);
  let net = network();
  net = mutation(net).add(nodes[0]);
  net = mutation(net).add(nodes[1]);
  net = mutation(net).add(nodes[2]);
  const state = { faces: [[0, 1, 2]], positions, net, nodes, capacity };
  link(state, 0, 1);
  link(state, 1, 2);
  link(state, 0, 2);
  return state;
};

/**
 * Builds the complete state for a planar triangulation.
 *
 * @param {number} count - Number of nodes
 * @param {Object} weight - Distribution for position offsets
 * @param {Array} nodes - Array of all node objects
 * @returns {Object} State with net and positions
 */
const build = (count, weight, capacity, nodes) => {
  const state = seed(weight, capacity, nodes);
  for (let v = 3; v < count; v++) {
    split(state, v, weight);
  }
  return state;
};

/**
 * Creates an immutable planar graph topology via face-splitting triangulation.
 *
 * A triangulation generates a maximal planar graph by always splitting
 * the face with the largest area. New nodes are placed near the face
 * centroid with offset from the weight distribution. Edge weights are
 * the actual Euclidean distances between nodes. The returned network
 * is decorated with a position(id) method for visualization.
 *
 * @param {number} count - Number of nodes (non-negative integer)
 * @param {Object} weight - Distribution for position offsets (mean 0)
 * @param {Object} capacity - Distribution for edge capacities
 * @returns {Object} Triangulation with a network method
 * @throws {Error} When count is not a non-negative integer
 *
 * @example
 * const topo = triangulation(10, normal(0, 10, Math.random), normal(50, 10, Math.random));
 * const net = topo.network(); // decorated network with position(id)
 */
const triangulation = (count, weight, capacity) => {
  if (count < 0 || count !== Math.floor(count)) {
    throw new Error(`Count must be a non-negative integer: ${count}`);
  }
  return {
    /**
     * Returns a decorated planar network with position metadata.
     *
     * @returns {Object} Network with nodes, edges, and position query
     */
    network: () => {
      const nodes = Array.from({ length: count }, (_, i) => node(i));
      if (count < 2) {
        let net = network();
        for (const n of nodes) { net = mutation(net).add(n); }
        return { nodes: () => net.nodes(), edges: () => net.edges(), position: () => ({ x: 0, y: 0 }) };
      }
      if (count === 2) {
        const p0 = { x: weight.sample(), y: weight.sample() };
        const p1 = { x: weight.sample(), y: weight.sample() };
        const cost = distance(p0, p1);
        let net = network();
        net = mutation(net).add(nodes[0]);
        net = mutation(net).add(nodes[1]);
        const cap = capacity.sample();
        net = mutation(net).link(edge(nodes[0], nodes[1], cost, cap));
        net = mutation(net).link(edge(nodes[1], nodes[0], cost, cap));
        const positions = new Map([[0, p0], [1, p1]]);
        return { nodes: () => net.nodes(), edges: () => net.edges(), position: (id) => positions.get(id) };
      }
      const state = build(count, weight, capacity, nodes);
      return {
        nodes: () => state.net.nodes(),
        edges: () => state.net.edges(),
        position: (id) => state.positions.get(id)
      };
    }
  };
};

export { triangulation };
