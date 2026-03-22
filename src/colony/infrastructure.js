/**
 * Creates an immutable critical infrastructure analysis for a colony.
 *
 * Delegates to an injected vulnerability algorithm for bridge
 * and articulation point detection.
 *
 * @param {Object} col - The colony to analyze
 * @param {Function} algorithm - Vulnerability factory matching vulnerability(net) interface
 * @returns {Object} Infrastructure with bridges and articulations methods
 *
 * @example
 * const inf = infrastructure(colony, fakeVulnerability);
 * inf.bridges(); // Set of critical edge identifiers
 */
const infrastructure = (col, algorithm) => {
  const result = algorithm(col.passable());
  const bridgeIds = new Set(result.bridges().map((e) => e.identifier()));
  const articulationIds = new Set(result.articulations().map((n) => n.identifier()));
  return {
    /**
     * Returns edges whose removal would disconnect the colony.
     *
     * @returns {Set} Bridge edge identifiers
     */
    bridges: () => bridgeIds,
    /**
     * Returns modules whose removal would fragment the colony.
     *
     * @returns {Set} Articulation point module identifiers
     */
    articulations: () => articulationIds
  };
};

export { infrastructure };
