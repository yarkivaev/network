/**
 * Collects drawables from a network using factory functions.
 *
 * The drawables function takes a network and factory functions for
 * creating node and edge drawables. It returns an object that can
 * list all drawables for the network elements.
 *
 * @param {Object} net - The network to create drawables from
 * @param {Function} nodeF - Factory function for creating node drawables
 * @param {Function} edgeF - Factory function for creating edge drawables
 * @returns {Object} A drawables collector with a list method
 *
 * @example
 * const nodeF = (node) => drawableNode(node.identifier(), canvas);
 * const edgeF = (edge) => drawableEdge(edge.identifier(), canvas, 50, 30);
 * const drws = drawables(network, nodeF, edgeF);
 * const list = drws.list(); // array of drawables
 */
const drawables = (net, nodeF, edgeF) => ({
  list: () => {
    const result = [];
    for (const node of net.nodes().items()) {
      result.push(nodeF(node));
    }
    for (const edge of net.edges().items()) {
      result.push(edgeF(edge));
    }
    return result;
  }
});

export { drawables };
