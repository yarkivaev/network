/**
 * Creates an immutable canonical representation of an undirected edge.
 *
 * A pair normalizes two node identifiers into a consistent order,
 * ensuring that (a, b) and (b, a) produce the same identifier.
 * This is used to track undirected edges in directed graph structures.
 *
 * @param {*} a - First node identifier
 * @param {*} b - Second node identifier
 * @returns {Object} Pair with an identifier method
 *
 * @example
 * pair(3, 1).identifier(); // "1,3"
 * pair(1, 3).identifier(); // "1,3"
 */
const pair = (a, b) => ({
  /**
   * Returns the canonical key for this undirected edge.
   *
   * @returns {string} Key with smaller identifier first
   */
  identifier: () => a < b ? `${a},${b}` : `${b},${a}`
});

export { pair };
