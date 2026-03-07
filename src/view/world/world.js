import { region } from '../geometry/region.js';

/**
 * Immutable world containing drawables, positions, and spatial index.
 *
 * A world encapsulates all drawable entities and their positions in world
 * coordinates. It keeps the spatial index synchronized with positions,
 * preventing inconsistent state. All operations return new world instances.
 *
 * @param {Object} idx - The spatial index mapping ids to bounds
 * @param {Map} drwMap - Map of id -> drawable
 * @param {Map} posMap - Map of id -> point (positions in world coordinates)
 * @returns {Object} A world with move, query, visible, get, and add methods
 *
 * @example
 * let wld = world(idx, drwMap, posMap);
 * wld = wld.move('node-1', point(100, 200));
 * const ids = wld.query(point(100, 200));
 * const items = wld.get(ids);
 */
const world = (idx, drwMap, posMap) => ({
  /**
   * Moves a drawable to a new world position.
   *
   * Updates both the position map and spatial index atomically.
   *
   * @param {*} id - The identifier of the drawable to move
   * @param {Object} position - The new world position
   * @returns {Object} A new world with updated position and index
   */
  move: (id, position) => {
    const drw = drwMap.get(id);
    const bounds = drw.bounds().at(position);
    const cleaned = idx.remove(id);
    const newIdx = cleaned.add(id, bounds);
    const newPosMap = new Map(posMap);
    newPosMap.set(id, position);
    return world(newIdx, drwMap, newPosMap);
  },

  /**
   * Queries for drawables at a world point.
   *
   * @param {Object} pt - The world point to query
   * @returns {Array} Array of drawable identifiers at the point
   */
  query: (pt) => {
    const tiny = region(pt.x(), pt.y(), pt.x(), pt.y());
    return idx.query(tiny);
  },

  /**
   * Returns identifiers of drawables visible in a world region.
   *
   * @param {Object} rgn - The world region to check
   * @returns {Array} Array of drawable identifiers in the region
   */
  visible: (rgn) => idx.query(rgn),

  /**
   * Gets drawables and positions by identifiers.
   *
   * @param {Array} ids - Array of drawable identifiers
   * @returns {Array} Array of { drawable, position } objects
   */
  get: (ids) => ids.map((id) => ({
    drawable: drwMap.get(id),
    position: posMap.get(id)
  })),

  /**
   * Adds a new drawable at a position.
   *
   * @param {*} id - The identifier for the new drawable
   * @param {Object} drawable - The drawable object
   * @param {Object} position - The world position
   * @returns {Object} A new world containing the drawable
   */
  /**
   * Removes a drawable from the world.
   *
   * @param {*} id - The identifier of the drawable to remove
   * @returns {Object} A new world without the drawable
   */
  remove: (id) => {
    const cleaned = idx.remove(id);
    const newDrwMap = new Map(drwMap);
    newDrwMap.delete(id);
    const newPosMap = new Map(posMap);
    newPosMap.delete(id);
    return world(cleaned, newDrwMap, newPosMap);
  },

  /**
   * Adds a new drawable at a position.
   *
   * @param {*} id - The identifier for the new drawable
   * @param {Object} drawable - The drawable object
   * @param {Object} position - The world position
   * @returns {Object} A new world containing the drawable
   */
  add: (id, drawable, position) => {
    const bounds = drawable.bounds().at(position);
    const newIdx = idx.add(id, bounds);
    const newDrwMap = new Map(drwMap);
    newDrwMap.set(id, drawable);
    const newPosMap = new Map(posMap);
    newPosMap.set(id, position);
    return world(newIdx, newDrwMap, newPosMap);
  },
  state: () => ({
    positions: [...posMap.entries()].map(([id, pos]) => ({ id, position: pos })),
    drawables: [...drwMap.entries()].map(([id, drw]) => ({ id, bounds: drw.bounds() })),
    index: idx
  })
});

export { world };
