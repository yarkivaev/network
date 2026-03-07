/**
 * Mouse down action at a screen point.
 *
 * The down action represents a mouse press event at a specific screen
 * coordinate. It is immutable and provides access to its type and point.
 *
 * @param {Object} pt - The screen point where mouse was pressed
 * @returns {Object} A down action with type and point methods
 *
 * @example
 * const act = down(point(400, 300));
 * act.type(); // 'down'
 * act.point(); // point(400, 300)
 */
const down = (pt) => ({
  type: () => 'down',
  point: () => pt
});

export { down };
