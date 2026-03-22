/**
 * Creates an immutable selection tracking 0-2 module identifiers.
 *
 * A selection represents the user's chosen modules for algorithm
 * operations. Toggling an already-selected module removes it;
 * toggling a new module adds it (up to 2). The first selected
 * module is the origin, the second is the destination.
 *
 * @param {Array} ids - Currently selected identifiers (default empty)
 * @returns {Object} Selection with toggle, clear, has, origin, destination
 *
 * @example
 * let sel = selection();
 * sel = sel.toggle(3);      // [3]
 * sel = sel.toggle(7);      // [3, 7]
 * sel.origin();             // 3
 * sel.destination();        // 7
 */
const selection = (ids = []) => ({
  /**
   * Returns a new selection with the id added or removed.
   *
   * @param {*} id - Module identifier to toggle
   * @returns {Object} New selection
   */
  toggle: (id) => {
    if (ids.includes(id)) {
      return selection(ids.filter((i) => i !== id));
    }
    return ids.length < 2 ? selection([...ids, id]) : selection([id]);
  },
  /**
   * Returns an empty selection.
   *
   * @returns {Object} New empty selection
   */
  clear: () => selection(),
  /**
   * Checks if a module is selected.
   *
   * @param {*} id - Module identifier
   * @returns {boolean} True if selected
   */
  has: (id) => ids.includes(id),
  /**
   * Returns the first selected module identifier.
   *
   * @returns {*} Origin identifier or undefined
   */
  origin: () => ids[0],
  /**
   * Returns the second selected module identifier.
   *
   * @returns {*} Destination identifier or undefined
   */
  destination: () => ids[1],
  /**
   * Returns all selected identifiers.
   *
   * @returns {Array} Array of selected identifiers
   */
  identifiers: () => [...ids]
});

export { selection };
