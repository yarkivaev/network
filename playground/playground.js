import { point } from '../src/view/geometry/point.js';
import { region } from '../src/view/geometry/region.js';
import { camera } from '../src/view/camera/camera.js';
import { unproject } from '../src/view/camera/unproject.js';
import { project } from '../src/view/camera/project.js';
import { scene } from '../src/view/scene/scene.js';
import { world } from '../src/view/world/world.js';
import { quadtree } from '../src/view/spatial/quadtree.js';
import { index } from '../src/view/spatial/index.js';
import { drawableNode } from '../src/view/drawable/drawableNode.js';
import { drawableEdge } from '../src/view/drawable/drawableEdge.js';
import { drawable } from '../src/view/drawable/drawable.js';
import { relativeRegion } from '../src/view/geometry/relativeRegion.js';
import { drawables } from '../src/view/drawable/drawables.js';
import { landscape } from '../src/view/scene/landscape.js';
import { layout } from '../src/view/scene/layout.js';
import { network } from '../src/core/network.js';
import { mutation } from '../src/core/mutation.js';
import { node } from '../src/core/node.js';
import { edge } from '../src/core/edge.js';
import { down } from '../src/view/action/down.js';
import { move } from '../src/view/action/move.js';
import { up } from '../src/view/action/up.js';
import { zoom } from '../src/view/action/zoom.js';

const el = document.getElementById('canvas');
const ctx = el.getContext('2d');
const debugEl = document.getElementById('debug');
const dpr = window.devicePixelRatio || 1;
console.log(`Device pixel ratio: ${dpr}`);
const cssWidth = 800;
const cssHeight = 600;
el.width = cssWidth * dpr;
el.height = cssHeight * dpr;
el.style.width = cssWidth + 'px';
el.style.height = cssHeight + 'px';
ctx.scale(dpr, dpr);
const width = cssWidth;
const height = cssHeight;

let debug = false;

/**
 * Formats a point for display.
 */
const fmtPoint = (p) => p ? `(${p.x().toFixed(1)}, ${p.y().toFixed(1)})` : 'null';

/**
 * Formats a region for display.
 */
const fmtRegion = (r) => r ? r.apply((x1, y1, x2, y2) =>
  `(${x1.toFixed(1)}, ${y1.toFixed(1)}) - (${x2.toFixed(1)}, ${y2.toFixed(1)})`) : 'null';

/**
 * Formats quadtree state recursively.
 */
const fmtQuadtree = (state, indent = '') => {
  if (!state || !state.boundary) return indent + 'empty\n';
  let result = indent + `boundary: ${fmtRegion(state.boundary)}\n`;
  if (state.items.length > 0) {
    result += indent + `items: [${state.items.map((i) => i.id).join(', ')}]\n`;
  }
  if (state.children) {
    result += indent + 'children:\n';
    state.children.forEach((child, i) => {
      const labels = ['NW', 'NE', 'SW', 'SE'];
      result += indent + `  ${labels[i]}:\n`;
      result += fmtQuadtree(child, indent + '    ');
    });
  }
  return result;
};

/**
 * Renders debug information panel.
 */
const renderDebug = () => {
  if (!debug) {
    debugEl.style.display = 'none';
    return;
  }
  debugEl.style.display = 'block';
  const state = scn.state();
  const worldState = state.world.state();
  const indexState = worldState.index.state();
  let info = '=== CAMERA ===\n';
  info += `offset: ${fmtPoint(state.camera.offset())}\n`;
  info += `zoom: ${state.camera.zoom().toFixed(2)}\n`;
  info += `size: ${state.camera.width()} x ${state.camera.height()}\n\n`;
  info += '=== VIEWPORT ===\n';
  info += `${fmtRegion(state.viewport)}\n\n`;
  info += '=== MODE ===\n';
  info += `type: ${state.mode.type()}\n`;
  if (state.mode.anchor) info += `anchor: ${fmtPoint(state.mode.anchor())}\n`;
  if (state.mode.target) info += `target: ${state.mode.target()}\n`;
  info += '\n=== NODES ===\n';
  worldState.positions.forEach(({ id, position }) => {
    info += `${id}: ${fmtPoint(position)}\n`;
  });
  info += '\n=== QUADTREE ===\n';
  info += fmtQuadtree(indexState);
  debugEl.textContent = info;
};

/**
 * Draws a hitbox rectangle for debug visualization.
 */
const hitbox = (x, y, w, h) => {
  if (!debug) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
};

/**
 * Canvas wrapper implementing the drawing API for drawables.
 */
const canvas = {
  circle: (pos, radius, label) => {
    ctx.beginPath();
    ctx.arc(pos.x(), pos.y(), radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, pos.x(), pos.y());
    hitbox(pos.x() - radius, pos.y() - radius, radius * 2, radius * 2);
  },
  line: (pos, halfWidth, halfHeight) => {
    ctx.beginPath();
    ctx.moveTo(pos.x() - halfWidth, pos.y() - halfHeight);
    ctx.lineTo(pos.x() + halfWidth, pos.y() + halfHeight);
    ctx.stroke();
    if (!debug) return;
    const angle = Math.atan2(halfHeight, halfWidth);
    const length = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight) * 2;
    const thickness = 20;
    ctx.save();
    ctx.translate(pos.x(), pos.y());
    ctx.rotate(angle);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-length / 2, -thickness / 2, length, thickness);
    ctx.restore();
  }
};

/**
 * Logs all node positions and index state after a state change.
 */
const logStateChange = (actionType, screenPoint, beforeState, afterState) => {
  const beforeWorld = beforeState.world.state();
  const afterWorld = afterState.world.state();
  const beforeIdx = beforeWorld.index.state();
  const afterIdx = afterWorld.index.state();
  console.log(`\n[${actionType}]`);
  if (screenPoint) {
    const worldPt = unproject(beforeState.camera, screenPoint).point();
    const queryRegion = region(worldPt.x(), worldPt.y(), worldPt.x(), worldPt.y());
    const hits = beforeWorld.index.query(queryRegion);
    console.log(`  Screen: ${fmtPoint(screenPoint)} -> World: ${fmtPoint(worldPt)}`);
    console.log(`  Query result: [${hits.join(', ')}]`);
  }
  console.log(`  Mode: ${beforeState.mode.type()} -> ${afterState.mode.type()}`);
  if (afterState.mode.target) {
    console.log(`  Dragging target: ${afterState.mode.target()}`);
  }
  console.log('  Positions (world -> screen):');
  afterWorld.positions.forEach(({ id, position }) => {
    const drw = afterWorld.drawables.find((d) => d.id === id);
    const bounds = drw ? drw.bounds.at(position) : null;
    const boundsStr = bounds ? bounds.apply((x1, y1, x2, y2) =>
      `[${x1.toFixed(0)},${y1.toFixed(0)} - ${x2.toFixed(0)},${y2.toFixed(0)}]`) : '';
    const screenPos = project(afterState.camera, position).point();
    console.log(`    ${id}: world${fmtPoint(position)} screen${fmtPoint(screenPos)} ${boundsStr}`);
  });
  console.log(`  Index boundary: ${fmtRegion(beforeIdx.boundary)} -> ${fmtRegion(afterIdx.boundary)}`);
};

const nodeRadius = 25;

let net = network();
net = mutation(net).add(node('A'));
net = mutation(net).add(node('B'));
net = mutation(net).add(node('C'));
net = mutation(net).add(node('D'));
net = mutation(net).add(node('E'));
net = mutation(net).add(node('F'));
net = mutation(net).add(node('G'));
net = mutation(net).link(edge(node('A'), node('B'), 1, 1));
net = mutation(net).link(edge(node('A'), node('C'), 1, 1));
net = mutation(net).link(edge(node('B'), node('D'), 1, 1));
net = mutation(net).link(edge(node('C'), node('D'), 1, 1));
net = mutation(net).link(edge(node('E'), node('A'), 1, 1));
net = mutation(net).link(edge(node('E'), node('B'), 1, 1));
net = mutation(net).link(edge(node('E'), node('C'), 1, 1));
net = mutation(net).link(edge(node('E'), node('D'), 1, 1));
net = mutation(net).link(edge(node('F'), node('A'), 1, 1));

const lyt = layout(width, height, 100);
const drws = drawables(
  net,
  (n) => drawableNode(n.identifier(), canvas, nodeRadius),
  (e) => ({ id: () => e.identifier() })
);
const edgeF = (id, hw, hh) => drawable(
  id,
  relativeRegion(Math.max(Math.abs(hw), 10), Math.max(Math.abs(hh), 10)),
  (pos) => canvas.line(pos, hw, hh)
);
const lnd = landscape(net, lyt, drws, edgeF);

const cam = camera(point(0, 0), 1, width, height);
let scn = scene(lnd, cam);

/**
 * Clears the canvas and renders the current scene.
 */
const render = () => {
  ctx.clearRect(0, 0, width, height);
  scn.render();
  renderDebug();
};

el.onmousedown = (e) => {
  const before = scn.state();
  const pt = point(e.offsetX, e.offsetY);
  scn = scn.action(down(pt));
  logStateChange('DOWN', pt, before, scn.state());
  render();
};

el.onmousemove = (e) => {
  scn = scn.action(move(point(e.offsetX, e.offsetY)));
  render();
};

el.onmouseup = (e) => {
  const before = scn.state();
  const pt = point(e.offsetX, e.offsetY);
  scn = scn.action(up(pt));
  logStateChange('UP', pt, before, scn.state());
  render();
};

el.onwheel = (e) => {
  e.preventDefault();
};

document.onkeydown = (e) => {
  if (e.key === 'd') {
    debug = !debug;
    render();
  }
};

render();
