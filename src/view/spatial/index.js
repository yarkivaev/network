/**
 * Spatial index mapping identifiers to bounds for efficient spatial queries.
 *
 * An index wraps a quadtree to provide a simple interface for adding
 * items and querying which items intersect a given region. The index
 * is immutable - adding items returns a new index.
 *
 * @param {Object} tree - The quadtree backing this index
 * @returns {Object} An index with query and add methods
 *
 * @example
 * let idx = index(quadtree());
 * idx = idx.add('node-1', region(0, 0, 20, 20));
 * idx = idx.add('node-2', region(50, 50, 70, 70));
 * const hits = idx.query(region(0, 0, 100, 100)); // ['node-1', 'node-2']
 */
const index = (tree) => ({
  query: (rgn) => tree.query(rgn),
  add: (id, bounds) => index(tree.insert(id, bounds)),
  remove: (id) => index(tree.remove(id)),
  state: () => tree.state()
});

export { index };
