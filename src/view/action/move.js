/**
 * Mouse move action at a screen point.
 *
 * The move action represents a mouse movement event at a specific screen
 * coordinate. It is immutable and provides access to its type and point.
 *
 * @param {Object} pt - The screen point where mouse moved to
 * @returns {Object} A move action with type and point methods
 *
 * @example
 * const act = move(point(500, 400));
 * act.type(); // 'move'
 * act.point(); // point(500, 400)
 */
const move = (pt) => ({
  type: () => 'move',
  point: () => pt
});

export { move };
