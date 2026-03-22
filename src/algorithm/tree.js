import { network } from '../core/network.js';
import { mutation } from '../core/mutation.js';

/**
 * Disjoint Set (Union-Find) for cycle detection
 */
const disjointSet = (nodes) => {
  const parent = new Map();
  const rank = new Map();

  // init
  for (const n of nodes) {
    const id = n.identifier();
    parent.set(id, id);
    rank.set(id, 0);
  }

  const find = (x) => {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x))); // path compression
    }
    return parent.get(x);
  };

  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);

    if (rootA === rootB) return false;

    const rankA = rank.get(rootA);
    const rankB = rank.get(rootB);

    if (rankA < rankB) {
      parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      parent.set(rootB, rootA);
    } else {
      parent.set(rootB, rootA);
      rank.set(rootA, rankA + 1);
    }

    return true;
  };

  return { find, union };
};

/**
 * Creates a minimum spanning tree builder for the given network.
 *
 * @param {Object} net - The network to build tree from
 * @returns {Object} Tree object with span method
 * @throws {Error} When network is disconnected
 *
 * @example
 * const t = tree(net);
 * const mst = t.span(); // returns network with MST edges
 */
const tree = (net) => {
  return {
    /**
     * Returns a network containing the minimum spanning tree.
     *
     * @returns {Object} Network with MST edges
     */
    span: () => {
      const nodes = net.nodes().items();
      const edges = net.edges().items();

      if (nodes.length === 0) return network();
      if (nodes.length === 1) {
        let mst = network();
        mst = mutation(mst).add(nodes[0]);
        return mst;
      }

      const sorted = [...edges].sort((a, b) => a.cost() - b.cost());

      const ds = disjointSet(nodes);

      const mstEdges = [];

      for (const e of sorted) {
        const u = e.source().identifier();
        const v = e.target().identifier();

        if (ds.union(u, v)) {
          mstEdges.push(e);
        }

        if (mstEdges.length === nodes.length - 1) break;
      }

      if (mstEdges.length !== nodes.length - 1) {
        throw new Error('Network is disconnected');
      }

      let mst = network();

      for (const n of nodes) {
        mst = mutation(mst).add(n);
      }

      for (const e of mstEdges) {
        mst = mutation(mst).link(e);
      }

      return mst;
    }
  };
};

export { tree };
