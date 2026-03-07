import { region } from '../geometry/region.js';
import { subdivide } from '../geometry/subdivide.js';
import { union } from '../geometry/union.js';

/**
 * Spatial index for an infinite world using a quadtree structure.
 *
 * A quadtree partitions space into quadrants for efficient spatial queries.
 * Items can span multiple regions and are stored in all leaf nodes they
 * intersect. The boundary expands dynamically to accommodate items outside
 * the current bounds, supporting an infinite world.
 *
 * @param {Object|null} [boundary=null] - The region boundary of this node
 * @param {number} [capacity=4] - Maximum items before subdivision
 * @param {Array} [items=[]] - Array of {id, bounds} objects at this node
 * @param {Array|null} [children=null] - Array of 4 child quadtrees or null
 * @param {number} [depth=0] - Current depth in the tree
 * @returns {Object} A quadtree with insert, query, and empty methods
 *
 * @example
 * let tree = quadtree();
 * tree = tree.insert('node-1', region(0, 0, 20, 20));
 * tree = tree.insert('node-2', region(50, 50, 70, 70));
 * const hits = tree.query(region(0, 0, 100, 100)); // ['node-1', 'node-2']
 */
const quadtree = (boundary = null, capacity = 4, items = [], children = null, depth = 0) => {
  const maxDepth = 20;
  const expand = (bounds) => {
    if (boundary === null) {
      return bounds;
    }
    return union(boundary, bounds).apply((minX, minY, maxX, maxY) => {
      const width = maxX - minX;
      const height = maxY - minY;
      const size = Math.max(width, height);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      return region(centerX - size / 2, centerY - size / 2, centerX + size / 2, centerY + size / 2);
    });
  };
  const spans = (bnd, bounds) => {
    const quads = subdivide(bnd);
    let count = 0;
    for (const q of quads) {
      if (q.intersects(bounds)) {
        count++;
      }
    }
    return count > 1;
  };
  const insertItem = (bnd, id, bounds, cap, itms, chld, lvl) => {
    if (!bnd.intersects(bounds)) {
      return quadtree(bnd, cap, itms, chld, lvl);
    }
    if (spans(bnd, bounds) || lvl >= maxDepth) {
      return quadtree(bnd, cap, [...itms, { id, bounds }], chld, lvl);
    }
    if (chld === null) {
      const newItems = [...itms, { id, bounds }];
      if (newItems.length <= cap) {
        return quadtree(bnd, cap, newItems, null, lvl);
      }
      const quads = subdivide(bnd);
      let newChildren = quads.map((q) => quadtree(q, cap, [], null, lvl + 1));
      const kept = [];
      for (const item of newItems) {
        if (spans(bnd, item.bounds)) {
          kept.push(item);
        } else {
          newChildren = newChildren.map((child, i) => {
            if (quads[i].intersects(item.bounds)) {
              return insertItem(quads[i], item.id, item.bounds, cap, child.items(), child.children(), lvl + 1);
            }
            return child;
          });
        }
      }
      return quadtree(bnd, cap, kept, newChildren, lvl);
    }
    const quads = subdivide(bnd);
    const newChildren = chld.map((child, i) => {
      if (quads[i].intersects(bounds)) {
        return insertItem(quads[i], id, bounds, cap, child.items(), child.children(), lvl + 1);
      }
      return child;
    });
    return quadtree(bnd, cap, itms, newChildren, lvl);
  };
  return {
    insert: (id, worldBounds) => {
      const newBoundary = expand(worldBounds);
      if (boundary === null) {
        return quadtree(newBoundary, capacity, [{ id, bounds: worldBounds }], null, 0);
      }
      const outside = worldBounds.apply((iMinX, iMinY, iMaxX, iMaxY) =>
        boundary.apply((oMinX, oMinY, oMaxX, oMaxY) =>
          iMinX < oMinX || iMaxX > oMaxX || iMinY < oMinY || iMaxY > oMaxY
        )
      );
      if (outside) {
        const seen = new Set();
        const allItems = [];
        for (const item of items) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            allItems.push(item);
          }
        }
        if (children !== null) {
          const collectItems = (node) => {
            const result = [...node.items()];
            const nodeChildren = node.children();
            if (nodeChildren !== null) {
              for (const child of nodeChildren) {
                result.push(...collectItems(child));
              }
            }
            return result;
          };
          for (const child of children) {
            for (const item of collectItems(child)) {
              if (!seen.has(item.id)) {
                seen.add(item.id);
                allItems.push(item);
              }
            }
          }
        }
        let fullBoundary = newBoundary;
        for (const item of allItems) {
          fullBoundary = union(fullBoundary, item.bounds).apply((minX, minY, maxX, maxY) => {
            const width = maxX - minX;
            const height = maxY - minY;
            const size = Math.max(width, height);
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            return region(centerX - size / 2, centerY - size / 2, centerX + size / 2, centerY + size / 2);
          });
        }
        let expandedItems = [];
        let expandedChildren = null;
        for (const item of allItems) {
          const result = insertItem(fullBoundary, item.id, item.bounds, capacity, expandedItems, expandedChildren, 0);
          expandedItems = result.items();
          expandedChildren = result.children();
        }
        return insertItem(fullBoundary, id, worldBounds, capacity, expandedItems, expandedChildren, 0);
      }
      return insertItem(boundary, id, worldBounds, capacity, items, children, depth);
    },
    query: (rgn) => {
      if (boundary === null || !boundary.intersects(rgn)) {
        return [];
      }
      const seen = new Set();
      const result = [];
      for (const item of items) {
        if (item.bounds.intersects(rgn) && !seen.has(item.id)) {
          seen.add(item.id);
          result.push(item.id);
        }
      }
      if (children !== null) {
        for (const child of children) {
          for (const id of child.query(rgn)) {
            if (!seen.has(id)) {
              seen.add(id);
              result.push(id);
            }
          }
        }
      }
      return result;
    },
    empty: () => items.length === 0 && children === null,
    items: () => items,
    children: () => children,
    boundary: () => boundary,
    remove: (id) => {
      if (boundary === null) {
        return quadtree();
      }
      const newItems = items.filter((item) => item.id !== id);
      if (children === null) {
        return quadtree(boundary, capacity, newItems, null, depth);
      }
      const newChildren = children.map((child) => child.remove(id));
      return quadtree(boundary, capacity, newItems, newChildren, depth);
    },
    state: () => ({
      boundary,
      depth,
      items,
      children: children ? children.map((c) => c.state()) : null
    })
  };
};

export { quadtree };
