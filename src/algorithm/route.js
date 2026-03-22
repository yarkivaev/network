import { scan } from '../core/scan.js';

/**
 * Creates a route finder.
 *
 * @param {Object} net - The network to route through
 * @param {Object} origin - The starting node
 * @param {Object} destination - The ending node
 * @returns {Object} Route object with shortest, path, cost, and exists methods
 * @throws {Error} When origin or destination is not in network
 *
 * @example
 * const r = route(net, nodeA, nodeB);
 * r.exists(); // true/false
 * r.path(); // [nodeA, ..., nodeB]
 * r.cost(); // total path cost
 */
const route = (net, origin, destination) => {
  const scanner = scan(net);
  if (!scanner.has(origin)) {
    throw new Error(`Origin node does not exist: ${origin.identifier()}`);
  }
  if (!scanner.has(destination)) {
    throw new Error(`Destination node does not exist: ${destination.identifier()}`);
  }

  let computed = false;
  let distances = new Map();
  let previous = new Map();
  let exists = false;


  const compute = () => {
    if (computed) return;

    const nodes = net.nodes().items();

    // init
    for (const n of nodes) {
      distances.set(n.identifier(), Infinity);
      previous.set(n.identifier(), null);
    }

    distances.set(origin.identifier(), 0);

    const visited = new Set();

    while (visited.size < nodes.length) {
      // find closest unvisited
      let current = null;
      let minDist = Infinity;

      for (const n of nodes) {
        const id = n.identifier();
        if (!visited.has(id) && distances.get(id) < minDist) {
          minDist = distances.get(id);
          current = n;
        }
      }

      if (current === null) break;

      const currentId = current.identifier();
      visited.add(currentId);

      // stop early if reached destination
      if (currentId === destination.identifier()) break;

      // relax edges
      const neighbors = scanner.neighbors(current).from;

      for (const e of neighbors) {
        const neighbor = e.target();
        const nid = neighbor.identifier();

        const alt = distances.get(currentId) + e.cost();

        if (alt < distances.get(nid)) {
          distances.set(nid, alt);
          previous.set(nid, currentId);
        }
      }
    }

    exists = distances.get(destination.identifier()) !== Infinity;
    computed = true;
  };

  const buildPath = () => {
    compute();

    if (!exists) {
      throw new Error('No path exists');
    }

    const path = [];
    let currentId = destination.identifier();

    while (currentId !== null) {
      const node = net.nodes().get(currentId);
      path.unshift(node);
      currentId = previous.get(currentId);
    }

    return path;
  };

  return {
    /**
     * Returns a new route finder for the same path.
     *
     * @returns {Object} New route object
     */
    shortest: () => {
      compute();
      return route(net, origin, destination);
    },
    /**
     * Returns the ordered sequence of nodes in the path.
     *
     * @returns {Array} Array of nodes from origin to destination
     * @throws {Error} When no path exists
     */
    path: () => {
      return buildPath();
    },
    /**
     * Returns the total traversal cost of the path.
     *
     * @returns {number} Sum of edge weights along the path
     * @throws {Error} When no path exists
     */
    cost: () => {
      compute();

      if (!exists) {
        throw new Error('No path exists');
      }

      return distances.get(destination.identifier());
    },
    /**
     * Checks if a path exists between origin and destination.
     *
     * @returns {boolean} True if route is possible
     */
    exists: () => {
      compute();
      return exists;
    }
  };
};

export { route };
