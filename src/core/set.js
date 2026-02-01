/**
 * Creates an immutable set for storing items with unique identifiers.
 * Uses Map internally for O(1) lookups.
 *
 * @param {Map} itemsMap - Map of identifiers to items (internal)
 * @returns {Object} Set object with get, has, add, remove, and items methods
 *
 * @example
 * const s = set();
 * const s2 = s.add(node('A')).add(node('B'));
 * s2.has('A'); // true
 * s2.get('A'); // node('A')
 * s2.items(); // [nodeA, nodeB]
 * const s3 = s2.remove('A');
 */
const set = (itemsMap = new Map()) => ({
  /**
   * Retrieves an item by its identifier.
   *
   * @param {*} key - The identifier to look up
   * @returns {Object} The item with matching identifier
   * @throws {Error} When no item exists with the given key
   */
  get: (key) => {
    if (!itemsMap.has(key)) {
      throw new Error(`Item does not exist: ${key}`);
    }
    return itemsMap.get(key);
  },
  /**
   * Checks if an item exists with the given identifier.
   *
   * @param {*} key - The identifier to check
   * @returns {boolean} True if item exists
   */
  has: (key) => itemsMap.has(key),
  /**
   * Returns a new set with the item added.
   *
   * @param {Object} item - The item to add (must have identifier method)
   * @returns {Object} New set containing the added item
   * @throws {Error} When item with same identifier already exists
   */
  add: (item) => {
    const key = item.identifier();
    if (itemsMap.has(key)) {
      throw new Error(`Item already exists: ${key}`);
    }
    const newMap = new Map(itemsMap);
    newMap.set(key, item);
    return set(newMap);
  },
  /**
   * Returns a new set with the item removed.
   *
   * @param {*} key - The identifier of item to remove
   * @returns {Object} New set without the removed item
   * @throws {Error} When no item exists with the given key
   */
  remove: (key) => {
    if (!itemsMap.has(key)) {
      throw new Error(`Item does not exist: ${key}`);
    }
    const newMap = new Map(itemsMap);
    newMap.delete(key);
    return set(newMap);
  },
  /**
   * Returns all items as an array for iteration.
   *
   * @returns {Array} Array of all items in the set
   */
  items: () => Array.from(itemsMap.values())
});

export { set };
