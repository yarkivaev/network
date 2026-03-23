/**
 * Creates an immutable pump analysis between two modules in a colony.
 *
 * Calculates maximum flow from a source module to a sink module
 * by delegating to an injected flow algorithm.
 *
 * @param {Object} col - The colony to analyze
 * @param {*} source - Source module identifier
 * @param {*} sink - Sink module identifier
 * @param {Function} algorithm - Flow factory matching flow(net, s, t) interface
 * @returns {Object} Pump with total, flow, and bottlenecks methods
 *
 * @example
 * const p = pump(colony, 0, 3, flow);
 * p.total(); // max flow from module 0 to module 3
 */
const pump = (col, source, sink, algorithm) => {
  const net = col.passable();
  const result = algorithm(net, net.nodes().get(source), net.nodes().get(sink));
  const flows = new Map();
  for (const e of result.edges()) {
    flows.set(e.identifier(), result.maximum());
  }
  const necks = new Set(result.bottlenecks().map((e) => e.identifier()));
  return {
    /**
     * Returns the maximum flow from source to sink.
     *
     * @returns {number} Maximum flow value
     */
    total: () => result.maximum(),
    /**
     * Returns the flow per edge.
     *
     * @returns {Map} Map of edge identifier to flow value
     */
    flow: () => flows,
    /**
     * Returns the bottleneck edges at full capacity.
     *
     * @returns {Set} Edge identifiers at capacity
     */
    bottlenecks: () => necks
  };
};

export { pump };
