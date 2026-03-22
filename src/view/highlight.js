/**
 * Creates an immutable highlight describing visual emphasis.
 *
 * A highlight specifies which edges and nodes should be rendered
 * with special styling, the color to use, and a descriptive label
 * for the UI panel.
 *
 * @param {Set} edgeIds - Set of edge identifiers to highlight
 * @param {Set} nodeIds - Set of node identifiers to highlight
 * @param {string} clr - CSS color string
 * @param {string} lbl - Description text for the panel
 * @returns {Object} Highlight with edges, nodes, color, label
 *
 * @example
 * const h = highlight(new Set(['0->1']), new Set([0]), '#00aa00', 'MST: cost 342');
 * h.edges().has('0->1'); // true
 * h.color(); // '#00aa00'
 */
const highlight = (edgeIds = new Set(), nodeIds = new Set(), clr = '', lbl = '') => ({
  /**
   * Returns the set of highlighted edge identifiers.
   *
   * @returns {Set} Edge identifiers
   */
  edges: () => edgeIds,
  /**
   * Returns the set of highlighted node identifiers.
   *
   * @returns {Set} Node identifiers
   */
  nodes: () => nodeIds,
  /**
   * Returns the highlight color.
   *
   * @returns {string} CSS color string
   */
  color: () => clr,
  /**
   * Returns the description label.
   *
   * @returns {string} Label text
   */
  label: () => lbl
});

export { highlight };
