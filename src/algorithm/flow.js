import { scan } from '../core/scan.js';

/**
 * Creates a maximum.
 *
 * @param {Object} net - The network to flow through
 * @param {Object} source - The node where flow originates
 * @param {Object} sink - The node where flow terminates
 * @returns {Object} Flow object with maximum and bottlenecks methods
 * @throws {Error} When source equals sink
 * @throws {Error} When source or sink is not in network
 *
 * @example
 * const f = flow(net, sourceNode, sinkNode);
 * f.maximum(); // maximum flow value
 * f.bottlenecks(); // edges at capacity
 */
const flow = (net, source, sink) => {
  const scanner = scan(net);
  const sourceId = source.identifier();
  const sinkId = sink.identifier();
  if (sourceId === sinkId) {
    throw new Error('Source and sink cannot be the same node');
  }
  if (!scanner.has(source)) {
    throw new Error(`Source node does not exist: ${sourceId}`);
  }
  if (!scanner.has(sink)) {
    throw new Error(`Sink node does not exist: ${sinkId}`);
  }
  return {
    /**
     * Returns the maximum possible flow rate.
     *
     * @returns {number} Maximum flow from source to sink
     */
    maximum: () => {
      throw new Error('Not implemented');
    },
    /**
     * Returns edges that are at full capacity.
     *
     * @returns {Array} Array of saturated edges
     */
    bottlenecks: () => {
      throw new Error('Not implemented');
    },
    /**
     * Returns all edges carrying flow.
     *
     * @returns {Array} Array of edges with non-zero flow
     */
    edges: () => {
      throw new Error('Not implemented');
    }
  };
};

export { flow };
