/**
 * Creates an immutable normal (Gaussian) distribution.
 *
 * A normal distribution samples values clustered around a mean with
 * a given standard deviation. Uses the Box-Muller transform to convert
 * uniform random values into normally distributed ones. Values near
 * the mean are most likely; values far from it are exponentially rare.
 *
 * @param {number} mean - The center of the distribution
 * @param {number} deviation - The standard deviation (non-negative)
 * @param {Function} random - A function returning a float in (0, 1)
 * @returns {Object} Distribution object with a sample method
 * @throws {Error} When deviation is negative
 *
 * @example
 * const dist = normal(50, 10, Math.random);
 * dist.sample(); // e.g. 47.3, 52.1, 38.9
 */
const normal = (mean, deviation, random) => {
  if (deviation < 0) {
    throw new Error(`Deviation must be non-negative: ${deviation}`);
  }
  return {
    /**
     * Returns a random value from the normal distribution.
     *
     * @returns {number} A normally distributed value
     */
    sample: () => mean + deviation * Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random())
  };
};

export { normal };
