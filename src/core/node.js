/**
 * Computes a numeric hash code from a string.
 */
const hashCode = (str) => {
  const s = String(str);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
  }
  return hash;
};

/**
 * Creates an immutable node with a unique identifier.
 *
 * @param {*} identifier - Unique identifier for the node
 * @returns {Object} Node object with equals, identifier, hash, and string methods
 * @throws {Error} When identifier is null or undefined
 *
 * @example
 * const n = node('A');
 * n.identifier(); // 'A'
 * n.equals(node('A')); // true
 * n.hash(); // numeric hash
 * n.string(); // 'node(A)'
 */
const node = (identifier) => {
  if (identifier === null || identifier === undefined) {
    throw new Error('Node identifier cannot be null or undefined');
  }
  return {
    /**
     * Compares this node with another for equality.
     *
     * @param {Object} other - The node to compare with
     * @returns {boolean} True if identifiers match
     */
    equals: (other) => identifier === other.identifier(),
    /**
     * Returns the unique identifier of this node.
     *
     * @returns {*} The node identifier
     */
    identifier: () => identifier,
    /**
     * Computes a numeric hash code for this node.
     *
     * @returns {number} Hash code derived from identifier
     */
    hash: () => hashCode(identifier),
    /**
     * Returns a string representation of this node.
     *
     * @returns {string} String in format "node(identifier)"
     */
    string: () => `node(${identifier})`
  };
};

export { node };
