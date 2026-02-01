/**
 * Creates a scan operator for querying network structure.
 *
 * @param {Object} net - The network to scan
 * @returns {Object} Scan object with has, neighbors, connection, and isolated methods
 *
 * @example
 * const s = scan(net);
 * s.has(nodeA); // true
 * s.neighbors(nodeA).from; // edges going out
 * s.connection(nodeA, nodeB); // edge or throws
 * s.isolated(); // nodes with no connections
 */
const scan = (net) => ({
  /**
   * Checks if a node exists in the network.
   *
   * @param {Object} node - The node to check
   * @returns {boolean} True if node exists
   */
  has: (node) => net.nodes().has(node.identifier()),
  /**
   * Returns incoming and outgoing edges for a node.
   *
   * @param {Object} node - The node to find neighbors for
   * @returns {Object} Object with from (outgoing) and to (incoming) edge arrays
   */
  neighbors: (node) => {
    const id = node.identifier();
    const edges = net.edges().items();
    return {
      from: edges.filter(e => e.source().identifier() === id),
      to: edges.filter(e => e.target().identifier() === id)
    };
  },
  /**
   * Returns the edge connecting two nodes.
   *
   * @param {Object} source - The originating node
   * @param {Object} target - The terminating node
   * @returns {Object} The edge between the nodes
   * @throws {Error} When no connection exists
   */
  connection: (source, target) => {
    const key = `${source.identifier()}->${target.identifier()}`;
    const edgesSet = net.edges();
    if (!edgesSet.has(key)) {
      throw new Error(`Connection does not exist: ${source.identifier()} -> ${target.identifier()}`);
    }
    return edgesSet.get(key);
  },
  /**
   * Returns all nodes with no connections.
   *
   * @returns {Array} Array of isolated nodes
   */
  isolated: () => {
    const edges = net.edges().items();
    return net.nodes().items().filter(n => {
      const id = n.identifier();
      return !edges.some(e =>
        e.source().identifier() === id || e.target().identifier() === id
      );
    });
  }
});

export { scan };
