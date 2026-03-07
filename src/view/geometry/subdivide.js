import { region } from './region.js';

/**
 * Subdivides a region into four equal quadrants.
 *
 * Returns an array of four regions representing the northwest, northeast,
 * southwest, and southeast quadrants of the original region.
 *
 * @param {Object} rgn - The region to subdivide
 * @returns {Array} Array of four child regions [NW, NE, SW, SE]
 *
 * @example
 * const r = region(0, 0, 100, 100);
 * const quads = subdivide(r);
 * quads[0].string(); // 'region(0,0,50,50)' - northwest
 * quads[1].string(); // 'region(50,0,100,50)' - northeast
 * quads[2].string(); // 'region(0,50,50,100)' - southwest
 * quads[3].string(); // 'region(50,50,100,100)' - southeast
 */
const subdivide = (rgn) => rgn.apply((minX, minY, maxX, maxY) => {
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  return [
    region(minX, minY, midX, midY),
    region(midX, minY, maxX, midY),
    region(minX, midY, midX, maxY),
    region(midX, midY, maxX, maxY)
  ];
});

export { subdivide };
