/**
 * Creates an immutable edge connecting two nodes with weight and capacity.
 *
 * @param {Object} source - The originating node
 * @param {Object} target - The terminating node
 * @param {number} weight - The cost or distance weight
 * @param {number} capacity - The maximum throughput capacity
 * @returns {Object} Edge object with source, target, cost, and capacity methods
 * @throws {Error} When source or target is null/undefined
 * @throws {Error} When weight or capacity is negative
 *
 * @example
 * const e = edge(node('A'), node('B'), 10, 100);
 * e.source().identifier(); // 'A'
 * e.target().identifier(); // 'B'
 * e.cost(); // 10
 * e.capacity(); // 100
 */
const edge = (source, target, weight, capacity) => {
  if (source === null || source === undefined) {
    throw new Error('Edge source cannot be null or undefined');
  }
  if (target === null || target === undefined) {
    throw new Error('Edge target cannot be null or undefined');
  }
  if (weight < 0) {
    throw new Error(`Edge weight cannot be negative: ${weight}`);
  }
  if (capacity < 0) {
    throw new Error(`Edge capacity cannot be negative: ${capacity}`);
  }
  return {
    /**
     * Returns the originating node of this edge.
     *
     * @returns {Object} The source node
     */
    source: () => source,
    /**
     * Returns the terminating node of this edge.
     *
     * @returns {Object} The target node
     */
    target: () => target,
    /**
     * Returns the traversal cost of this edge.
     *
     * @returns {number} The weight value
     */
    cost: () => weight,
    /**
     * Returns the maximum throughput of this edge.
     *
     * @returns {number} The capacity value
     */
    capacity: () => capacity,
    /**
     * Returns a compound key identifying this edge.
     *
     * @returns {string} Key in format "sourceId->targetId"
     */
    identifier: () => `${source.identifier()}->${target.identifier()}`
  };
};

export { edge };
