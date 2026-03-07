/**
 * Axis-aligned bounding rectangle in world coordinates.
 *
 * A region represents a rectangular area defined by minimum and maximum
 * x and y coordinates. Regions are immutable and provide methods for
 * containment testing and intersection checking. Uses apply pattern
 * instead of getters to maintain encapsulation.
 *
 * @param {number} minX - The minimum x coordinate (left edge)
 * @param {number} minY - The minimum y coordinate (top edge)
 * @param {number} maxX - The maximum x coordinate (right edge)
 * @param {number} maxY - The maximum y coordinate (bottom edge)
 * @returns {Object} An immutable region object
 *
 * @example
 * const r = region(0, 0, 100, 100);
 * r.contains(point(50, 50)); // true
 * r.contains(point(150, 50)); // false
 * r.intersects(region(50, 50, 150, 150)); // true
 * r.apply((minX, minY, maxX, maxY) => maxX - minX); // 100
 */
const region = (minX, minY, maxX, maxY) => ({
  contains: (pt) => pt.x() >= minX && pt.x() <= maxX && pt.y() >= minY && pt.y() <= maxY,
  intersects: (other) => other.apply((oMinX, oMinY, oMaxX, oMaxY) =>
    !(oMaxX < minX || oMinX > maxX || oMaxY < minY || oMinY > maxY)
  ),
  apply: (fn) => fn(minX, minY, maxX, maxY),
  string: () => `region(${minX},${minY},${maxX},${maxY})`
});

export { region };
