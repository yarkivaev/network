import { network } from './network.js';

/**
 * Creates a mutation operator for modifying networks immutably.
 *
 * @param {Object} net - The network to mutate
 * @returns {Object} Mutation object with add, remove, link, and unlink methods
 *
 * @example
 * const m = mutation(network());
 * const net1 = m.add(node('A'));
 * const net2 = mutation(net1).add(node('B'));
 * const net3 = mutation(net2).link(edge(nodeA, nodeB, 10, 100));
 */
const mutation = (net) => ({
  /**
   * Returns a new network with the node inserted.
   *
   * @param {Object} node - The node to insert
   * @returns {Object} New network containing the added node
   * @throws {Error} When node with same identifier already exists
   */
  add: (node) => {
    const nodesSet = net.nodes();
    if (nodesSet.has(node.identifier())) {
      throw new Error(`Node already exists: ${node.identifier()}`);
    }
    return network(nodesSet.add(node), net.edges());
  },
  /**
   * Returns a new network with the node deleted.
   *
   * @param {Object} node - The node to delete
   * @returns {Object} New network without the node and its edges
   * @throws {Error} When network is empty
   * @throws {Error} When node does not exist
   */
  remove: (node) => {
    const nodesSet = net.nodes();
    const edgesSet = net.edges();
    const id = node.identifier();
    if (nodesSet.items().length === 0) {
      throw new Error('Cannot remove from empty network');
    }
    if (!nodesSet.has(id)) {
      throw new Error(`Node does not exist: ${id}`);
    }
    let newEdges = edgesSet;
    for (const e of edgesSet.items()) {
      if (e.source().identifier() === id || e.target().identifier() === id) {
        newEdges = newEdges.remove(e.identifier());
      }
    }
    return network(nodesSet.remove(id), newEdges);
  },
  /**
   * Returns a new network with the edge added.
   *
   * @param {Object} edge - The edge to add
   * @returns {Object} New network containing the added edge
   * @throws {Error} When source node does not exist
   * @throws {Error} When target node does not exist
   * @throws {Error} When connection already exists
   */
  link: (edge) => {
    const nodesSet = net.nodes();
    const edgesSet = net.edges();
    const source = edge.source();
    const target = edge.target();
    if (!nodesSet.has(source.identifier())) {
      throw new Error(`Source node does not exist: ${source.identifier()}`);
    }
    if (!nodesSet.has(target.identifier())) {
      throw new Error(`Target node does not exist: ${target.identifier()}`);
    }
    if (edgesSet.has(edge.identifier())) {
      throw new Error(`Connection already exists: ${source.identifier()} -> ${target.identifier()}`);
    }
    return network(nodesSet, edgesSet.add(edge));
  },
  /**
   * Returns a new network with the connection removed.
   *
   * @param {Object} source - The originating node
   * @param {Object} target - The terminating node
   * @returns {Object} New network without the connection
   * @throws {Error} When connection does not exist
   */
  unlink: (source, target) => {
    const edgesSet = net.edges();
    const key = `${source.identifier()}->${target.identifier()}`;
    if (!edgesSet.has(key)) {
      throw new Error(`Connection does not exist: ${source.identifier()} -> ${target.identifier()}`);
    }
    return network(net.nodes(), edgesSet.remove(key));
  }
});

export { mutation };
