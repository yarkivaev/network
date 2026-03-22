/**
 * Creates an immutable uniform distribution over a continuous range.
 *
 * A uniform distribution samples values with equal probability from
 * the interval [min, max). Each call to sample() produces a new
 * random value using the injected random function.
 *
 * @param {number} min - The lower bound (inclusive)
 * @param {number} max - The upper bound (exclusive)
 * @param {Function} random - A function returning a float in [0, 1)
 * @returns {Object} Distribution object with a sample method
 * @throws {Error} When min is not less than max
 *
 * @example
 * const dist = uniform(0, 10, Math.random);
 * dist.sample(); // e.g. 7.32
 * dist.sample(); // e.g. 2.18
 */
const uniform = (min, max, random) => {
  if (min >= max) {
    throw new Error(`Minimum must be less than maximum: ${min} >= ${max}`);
  }
  return {
    /**
     * Returns a random value from the uniform distribution.
     *
     * @returns {number} A value in [min, max)
     */
    sample: () => min + random() * (max - min)
  };
};

export { uniform };
