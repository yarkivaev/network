/**
 * Immutable 2D coordinate representing a position in world or screen space.
 *
 * A point encapsulates x and y coordinates and provides methods
 * for comparison and string representation. Points are immutable -
 * once created, their coordinates cannot be changed.
 *
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @returns {Object} An immutable point object with x, y, equals, and string methods
 *
 * @example
 * const origin = point(0, 0);
 * const p = point(10, 20);
 * p.x(); // 10
 * p.y(); // 20
 * p.equals(point(10, 20)); // true
 * p.string(); // "(10,20)"
 */
const point = (x, y) => ({
  x: () => x,
  y: () => y,
  equals: (other) => x === other.x() && y === other.y(),
  string: () => `(${x},${y})`
});

export { point };
