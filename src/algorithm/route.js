import { scan } from '../core/scan.js';

/**
 * Simple Min Priority Queue (binary heap)
 */
const priorityQueue = () => {
  const heap = [];

  const swap = (i, j) => {
    [heap[i], heap[j]] = [heap[j], heap[i]];
  };

  const bubbleUp = (i) => {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent].priority <= heap[i].priority) break;
      swap(i, parent);
      i = parent;
    }
  };

  const bubbleDown = (i) => {
    const n = heap.length;

    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && heap[left].priority < heap[smallest].priority) {
        smallest = left;
      }
      if (right < n && heap[right].priority < heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === i) break;

      swap(i, smallest);
      i = smallest;
    }
  };

  return {
    push: (value, priority) => {
      heap.push({ value, priority });
      bubbleUp(heap.length - 1);
    },
    pop: () => {
      if (heap.length === 0) return null;
      const top = heap[0];
      const last = heap.pop();
      if (heap.length > 0) {
        heap[0] = last;
        bubbleDown(0);
      }
      return top;
    },
    isEmpty: () => heap.length === 0
  };
};

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

    const pq = priorityQueue();
    pq.push(origin, 0);

    while (!pq.isEmpty()) {
      const { value: current, priority } = pq.pop();
      const currentId = current.identifier();

      const curDist = distances.get(currentId)
      if (priority > curDist) continue;

      // stop early if reached destination
      if (currentId === destination.identifier()) break;

      const edges = scanner.neighbors(current).from;

      for (const e of edges) {
        const neighbor = e.target();
        const nid = neighbor.identifier();

        const alt = curDist + e.cost();

        if (alt < distances.get(nid)) {
          distances.set(nid, alt);
          previous.set(nid, currentId);
          pq.push(neighbor, alt);
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
