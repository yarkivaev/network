import { point } from '../geometry/point.js';

/**
 * Computes positions via force-directed layout algorithm.
 *
 * A layout applies a force-directed algorithm to position nodes in a
 * network. Nodes repel each other while edges act as springs pulling
 * connected nodes together. The algorithm iterates to find an equilibrium.
 *
 * @param {number} width - The layout area width
 * @param {number} height - The layout area height
 * @param {number} iterations - Number of simulation iterations
 * @returns {Object} A layout with compute and refine methods
 *
 * @example
 * const lyt = layout(800, 600, 100);
 * const positions = lyt.compute(network);
 * // positions is a Map of node identifier -> point
 *
 * // Refine existing positions
 * const refined = lyt.refine(network, positions);
 */
const layout = (width, height, iterations) => {
  const simulate = (net, initial) => {
    const nodes = net.nodes().items();
    const edges = net.edges().items();
    if (nodes.length === 0) {
      return new Map();
    }
    const positions = new Map();
    const velocities = new Map();
    for (const node of nodes) {
      const id = node.identifier();
      if (initial && initial.has(id)) {
        const pos = initial.get(id);
        positions.set(id, { x: pos.x(), y: pos.y() });
      } else {
        positions.set(id, {
          x: Math.random() * width,
          y: Math.random() * height
        });
      }
      velocities.set(id, { x: 0, y: 0 });
    }
    const area = width * height;
    const k = Math.sqrt(area / nodes.length);
    const repulsion = k * k;
    const attraction = 0.01;
    const damping = 0.9;
    const minDistance = 1;
    for (let i = 0; i < iterations; i++) {
      const temperature = 1 - i / iterations;
      for (const node of nodes) {
        const id = node.identifier();
        const pos = positions.get(id);
        let fx = 0;
        let fy = 0;
        for (const other of nodes) {
          const otherId = other.identifier();
          if (id === otherId) {
            continue;
          }
          const otherPos = positions.get(otherId);
          const dx = pos.x - otherPos.x;
          const dy = pos.y - otherPos.y;
          const distance = Math.max(Math.sqrt(dx * dx + dy * dy), minDistance);
          const force = repulsion / (distance * distance);
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }
        const vel = velocities.get(id);
        vel.x = (vel.x + fx) * damping * temperature;
        vel.y = (vel.y + fy) * damping * temperature;
      }
      for (const edge of edges) {
        const sourceId = edge.source().identifier();
        const targetId = edge.target().identifier();
        const sourcePos = positions.get(sourceId);
        const targetPos = positions.get(targetId);
        if (!sourcePos || !targetPos) {
          continue;
        }
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), minDistance);
        const force = (distance - k) * attraction;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        const sourceVel = velocities.get(sourceId);
        const targetVel = velocities.get(targetId);
        sourceVel.x += fx;
        sourceVel.y += fy;
        targetVel.x -= fx;
        targetVel.y -= fy;
      }
      for (const node of nodes) {
        const id = node.identifier();
        const pos = positions.get(id);
        const vel = velocities.get(id);
        pos.x += vel.x;
        pos.y += vel.y;
        pos.x = Math.max(0, Math.min(width, pos.x));
        pos.y = Math.max(0, Math.min(height, pos.y));
      }
    }
    const result = new Map();
    for (const [id, pos] of positions) {
      result.set(id, point(pos.x, pos.y));
    }
    return result;
  };
  return {
    compute: (net) => simulate(net, null),
    refine: (net, existing) => simulate(net, existing)
  };
};

export { layout };
