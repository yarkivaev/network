/**
 * Creates an immutable pump station analysis for a colony.
 *
 * Calculates maximum flow from a pump station to all other modules
 * by delegating to an injected flow algorithm for each destination.
 *
 * @param {Object} col - The colony to analyze
 * @param {*} station - Pump station module identifier
 * @param {Function} algorithm - Flow factory matching flow(net, s, t) interface
 * @returns {Object} Pump with total, flow, and bottlenecks methods
 *
 * @example
 * const p = pump(colony, 0, fakeFlow);
 * p.total(); // total flow to all modules
 */
const pump = (col, station, algorithm) => {
  const net = col.passable();
  const stationNode = net.nodes().get(station);
  const modules = col.modules().map((m) => m.identifier()).filter((id) => id !== station);
  const flows = new Map();
  let total = 0;
  for (const sink of modules) {
    const sinkNode = net.nodes().get(sink);
    const result = algorithm(net, stationNode, sinkNode);
    const max = result.maximum();
    total += max;
    for (const e of result.edges()) {
      flows.set(e.identifier(), (flows.get(e.identifier()) || 0) + max);
    }
  }
  let maxLoad = 0;
  for (const [, v] of flows) { maxLoad = Math.max(maxLoad, v); }
  const necks = new Set([...flows.entries()].filter(([, v]) => v === maxLoad).map(([k]) => k));
  return {
    /**
     * Returns the total flow from station to all modules.
     *
     * @returns {number} Sum of maximum flows
     */
    total: () => total,
    /**
     * Returns the accumulated flow per edge.
     *
     * @returns {Map} Map of edge identifier to total flow
     */
    flow: () => flows,
    /**
     * Returns the most loaded edges.
     *
     * @returns {Set} Edge identifiers with highest accumulated flow
     */
    bottlenecks: () => necks
  };
};

export { pump };
