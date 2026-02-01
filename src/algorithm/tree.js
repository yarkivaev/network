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
      throw new Error('Not implemented');
    }
  };
};

export { tree };
