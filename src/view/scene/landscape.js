import { world } from '../world/world.js';
import { index } from '../spatial/index.js';
import { quadtree } from '../spatial/quadtree.js';
import { point } from '../geometry/point.js';

/**
 * Computes edge midpoint from two endpoint positions.
 *
 * @param {Object} source - Source node position
 * @param {Object} target - Target node position
 * @returns {Object} Midpoint as a point
 */
const midpoint = (source, target) => point(
  (source.x() + target.x()) / 2,
  (source.y() + target.y()) / 2
);

/**
 * Computes shortest distance from a point to a line segment.
 *
 * Projects the point onto the segment and clamps the parameter
 * to [0,1] so the nearest point is always on the segment.
 *
 * @param {Object} pt - The query point
 * @param {Object} a - Segment start point
 * @param {Object} b - Segment end point
 * @returns {number} Distance from pt to the nearest point on segment AB
 */
const distance = (pt, a, b) => {
  const dx = b.x() - a.x();
  const dy = b.y() - a.y();
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0
    ? 0
    : Math.max(0, Math.min(1, ((pt.x() - a.x()) * dx + (pt.y() - a.y()) * dy) / lengthSq));
  const nx = a.x() + t * dx;
  const ny = a.y() + t * dy;
  return Math.sqrt((pt.x() - nx) ** 2 + (pt.y() - ny) ** 2);
};

/**
 * Replaces an edge drawable in the world with one sized to its endpoints.
 *
 * Removes the old edge, creates a new drawable via the factory with
 * half-extents matching the source-to-target distance, and adds it
 * at the midpoint of the two endpoints.
 *
 * @param {Object} wld - The world to update
 * @param {string} edgeId - The edge identifier
 * @param {Object} sourcePos - Source node position
 * @param {Object} targetPos - Target node position
 * @param {Function} edgeF - Factory (id, halfWidth, halfHeight) => drawable
 * @returns {Object} Updated world with resized edge
 */
const reshape = (wld, edgeId, sourcePos, targetPos, edgeF) => {
  const hw = (targetPos.x() - sourcePos.x()) / 2;
  const hh = (targetPos.y() - sourcePos.y()) / 2;
  const mid = midpoint(sourcePos, targetPos);
  const cleaned = wld.remove(edgeId);
  return cleaned.add(edgeId, edgeF(edgeId, hw, hh), mid);
};

/**
 * Reshapes all edges connected to a node after it has been moved.
 *
 * @param {Object} wld - The world with the node already moved
 * @param {Map} adjacency - Map of nodeId to array of connections
 * @param {string} nodeId - The moved node identifier
 * @param {Function} edgeF - Factory (id, halfWidth, halfHeight) => drawable
 * @returns {Object} Updated world with reshaped edges
 */
const propagate = (wld, adjacency, nodeId, edgeF) => {
  let updated = wld;
  const connections = adjacency.get(nodeId);
  for (const conn of connections) {
    const sourcePos = updated.get([conn.sourceId])[0].position;
    const targetPos = updated.get([conn.targetId])[0].position;
    updated = reshape(updated, conn.edgeId, sourcePos, targetPos, edgeF);
  }
  return updated;
};

/**
 * Wraps a world with topology-aware move semantics.
 *
 * A wrap decorates an existing world so that moving a node reshapes
 * connected edges, and moving an edge repositions connected nodes.
 * Edge drawables are recreated with half-extents matching the new
 * endpoint distances.
 *
 * @param {Object} wld - The underlying world
 * @param {Map} adjacency - Map of nodeId to array of {edgeId, sourceId, targetId}
 * @param {Map} topology - Map of edgeId to {sourceId, targetId}
 * @param {Function} edgeF - Factory (id, halfWidth, halfHeight) => drawable
 * @returns {Object} A topology-aware world proxy
 *
 * @example
 * const w = wrap(wld, adjacency, topology, edgeF);
 * const moved = w.move('A', point(200, 200));
 * // Connected edges are automatically reshaped
 */
const wrap = (wld, adjacency, topology, edgeF) => ({
  /**
   * Moves a drawable, updating connected elements topologically.
   *
   * @param {*} id - The identifier of the drawable to move
   * @param {Object} position - The new world position
   * @returns {Object} A new landscape with updated positions
   */
  move: (id, position) => {
    if (topology.has(id)) {
      const conn = topology.get(id);
      const oldPos = wld.get([id])[0].position;
      const dx = position.x() - oldPos.x();
      const dy = position.y() - oldPos.y();
      const srcPos = wld.get([conn.sourceId])[0].position;
      const tgtPos = wld.get([conn.targetId])[0].position;
      const newSrc = point(srcPos.x() + dx, srcPos.y() + dy);
      const newTgt = point(tgtPos.x() + dx, tgtPos.y() + dy);
      let updated = wld.move(conn.sourceId, newSrc);
      updated = updated.move(conn.targetId, newTgt);
      const edges = new Map();
      for (const c of adjacency.get(conn.sourceId)) {
        edges.set(c.edgeId, c);
      }
      for (const c of adjacency.get(conn.targetId)) {
        edges.set(c.edgeId, c);
      }
      for (const c of edges.values()) {
        const sp = updated.get([c.sourceId])[0].position;
        const tp = updated.get([c.targetId])[0].position;
        updated = reshape(updated, c.edgeId, sp, tp, edgeF);
      }
      return wrap(updated, adjacency, topology, edgeF);
    }
    if (!adjacency.has(id)) {
      return wrap(wld.move(id, position), adjacency, topology, edgeF);
    }
    let updated = wld.move(id, position);
    updated = propagate(updated, adjacency, id, edgeF);
    return wrap(updated, adjacency, topology, edgeF);
  },

  /**
   * Queries for drawables at a world point, nodes before edges.
   *
   * Hit areas are constant in screen space. The zoom parameter scales
   * world-space thresholds so that clickable regions do not grow when
   * the camera zooms in.
   *
   * @param {Object} pt - The world point to query
   * @param {number} zm - The current camera zoom level
   * @returns {Array} Array of drawable identifiers at the point
   */
  query: (pt, zm) => {
    const hits = wld.query(pt);
    const threshold = 10;
    const filtered = hits.filter((id) => {
      if (!topology.has(id)) {
        const items = wld.get([id]);
        const pos = items[0].position;
        const extent = items[0].drawable.bounds().at(pos);
        const half = extent.apply((x1, y1, x2, y2) => (x2 - x1) / 2);
        const dx = pt.x() - pos.x();
        const dy = pt.y() - pos.y();
        return Math.sqrt(dx * dx + dy * dy) <= half / zm;
      }
      const conn = topology.get(id);
      const src = wld.get([conn.sourceId])[0].position;
      const tgt = wld.get([conn.targetId])[0].position;
      return distance(pt, src, tgt) <= threshold / zm;
    });
    return filtered.sort((a, b) => {
      const aEdge = topology.has(a) ? 1 : 0;
      const bEdge = topology.has(b) ? 1 : 0;
      return aEdge - bEdge;
    });
  },

  /**
   * Returns identifiers of drawables visible in a world region, edges first.
   *
   * @param {Object} rgn - The world region to check
   * @returns {Array} Array of drawable identifiers, edges before nodes
   */
  visible: (rgn) => wld.visible(rgn).sort((a, b) => {
    const aNode = topology.has(a) ? 0 : 1;
    const bNode = topology.has(b) ? 0 : 1;
    return aNode - bNode;
  }),

  /**
   * Gets drawables and positions by identifiers.
   *
   * @param {Array} ids - Array of drawable identifiers
   * @returns {Array} Array of { drawable, position } objects
   */
  get: (ids) => wld.get(ids),

  /**
   * Adds a new drawable at a position.
   *
   * @param {*} id - The identifier for the new drawable
   * @param {Object} drawable - The drawable object
   * @param {Object} position - The world position
   * @returns {Object} A new landscape containing the drawable
   */
  add: (id, drawable, position) => wrap(
    wld.add(id, drawable, position), adjacency, topology, edgeF
  ),

  /**
   * Returns the underlying world state for debugging.
   *
   * @returns {Object} The world state
   */
  state: () => wld.state()
});

/**
 * Creates a topology-aware world from a network.
 *
 * A landscape builds a world populated with node and edge drawables
 * at positions computed by a layout algorithm. Edges are placed at the
 * midpoint of their endpoints with half-extents matching the actual
 * node-to-node distances. When a node is moved, connected edges are
 * automatically reshaped. When an edge is moved, connected nodes are
 * translated by the same delta.
 *
 * @param {Object} net - The network providing topology
 * @param {Object} lyt - A layout computing node positions
 * @param {Object} drws - A drawables collector for node drawables
 * @param {Function} edgeF - Factory (id, halfWidth, halfHeight) => drawable
 * @returns {Object} A landscape with the same interface as world
 *
 * @example
 * const lyt = layout(800, 600, 100);
 * const drws = drawables(net, nodeFactory, () => {});
 * const edgeF = (id, hw, hh) => drawableEdge(id, canvas, hw, hh);
 * const lnd = landscape(net, lyt, drws, edgeF);
 * const moved = lnd.move('A', point(200, 200));
 */
const landscape = (net, lyt, drws, edgeF) => {
  const positions = lyt.compute(net);
  const list = drws.list();
  const adjacency = new Map();
  const topology = new Map();
  for (const e of net.edges().items()) {
    const sourceId = e.source().identifier();
    const targetId = e.target().identifier();
    const conn = { edgeId: e.identifier(), sourceId, targetId };
    if (!adjacency.has(sourceId)) {
      adjacency.set(sourceId, []);
    }
    adjacency.get(sourceId).push(conn);
    if (!adjacency.has(targetId)) {
      adjacency.set(targetId, []);
    }
    adjacency.get(targetId).push(conn);
    topology.set(e.identifier(), { sourceId, targetId });
  }
  let wld = world(index(quadtree()), new Map(), new Map());
  for (const drw of list) {
    const id = drw.id();
    if (positions.has(id)) {
      wld = wld.add(id, drw, positions.get(id));
    }
  }
  for (const e of net.edges().items()) {
    const sourcePos = positions.get(e.source().identifier());
    const targetPos = positions.get(e.target().identifier());
    const hw = (targetPos.x() - sourcePos.x()) / 2;
    const hh = (targetPos.y() - sourcePos.y()) / 2;
    wld = wld.add(e.identifier(), edgeF(e.identifier(), hw, hh), midpoint(sourcePos, targetPos));
  }
  return wrap(wld, adjacency, topology, edgeF);
};

export { landscape };
