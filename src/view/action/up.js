/**
 * Mouse up action at a screen point.
 *
 * The up action represents a mouse release event at a specific screen
 * coordinate. It is immutable and provides access to its type and point.
 *
 * @param {Object} pt - The screen point where mouse was released
 * @returns {Object} An up action with type and point methods
 *
 * @example
 * const act = up(point(450, 350));
 * act.type(); // 'up'
 * act.point(); // point(450, 350)
 */
const up = (pt) => ({
  type: () => 'up',
  point: () => pt
});

export { up };
