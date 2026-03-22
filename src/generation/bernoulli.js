/**
 * Creates an immutable Bernoulli distribution for binary outcomes.
 *
 * A Bernoulli distribution produces 1 (success) with a given probability
 * and 0 (failure) otherwise. Each call to sample() consults the injected
 * random function to determine the outcome.
 *
 * @param {number} probability - The probability of success, in [0, 1]
 * @param {Function} random - A function returning a float in [0, 1)
 * @returns {Object} Distribution object with a sample method
 * @throws {Error} When probability is outside [0, 1]
 *
 * @example
 * const coin = bernoulli(0.5, Math.random);
 * coin.sample(); // 0 or 1
 */
const bernoulli = (probability, random) => {
  if (probability < 0 || probability > 1) {
    throw new Error(`Probability must be between 0 and 1: ${probability}`);
  }
  return {
    /**
     * Returns a binary outcome from the Bernoulli distribution.
     *
     * @returns {number} 1 with the given probability, 0 otherwise
     */
    sample: () => random() < probability ? 1 : 0
  };
};

export { bernoulli };
