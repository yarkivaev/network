import { point } from '../src/view/geometry/point.js';
import { camera } from '../src/view/camera/camera.js';
import { unproject } from '../src/view/camera/unproject.js';
import { scene } from '../src/view/scene/scene.js';
import { drawableNode } from '../src/view/drawable/drawableNode.js';
import { drawable } from '../src/view/drawable/drawable.js';
import { relativeRegion } from '../src/view/geometry/relativeRegion.js';
import { drawables } from '../src/view/drawable/drawables.js';
import { landscape } from '../src/view/scene/landscape.js';
import { embedding } from '../src/view/scene/embedding.js';
import { down } from '../src/view/action/down.js';
import { move } from '../src/view/action/move.js';
import { up } from '../src/view/action/up.js';
import { zoom } from '../src/view/action/zoom.js';
import { triangulation } from '../src/generation/triangulation.js';
import { normal } from '../src/generation/normal.js';
import { bernoulli } from '../src/generation/bernoulli.js';
import { obstacle } from '../src/generation/obstacle.js';
import { colony } from '../src/colony/colony.js';
import { roadmap } from '../src/colony/roadmap.js';
import { supply } from '../src/colony/supply.js';
import { pump } from '../src/colony/pump.js';
import { infrastructure } from '../src/colony/infrastructure.js';
import { tree } from '../src/algorithm/tree.js';
import { route } from '../src/algorithm/route.js';
import { vulnerability } from '../src/algorithm/vulnerability.js';
import { flow } from '../src/algorithm/flow.js';
import { selection } from '../src/view/selection.js';
import { highlight } from '../src/view/highlight.js';
import { arrow } from '../src/view/arrow.js';

const el = document.getElementById('canvas');
const ctx = el.getContext('2d');
const dpr = window.devicePixelRatio || 1;
const cssWidth = window.innerWidth;
const cssHeight = window.innerHeight;
el.width = cssWidth * dpr;
el.height = cssHeight * dpr;
el.style.width = `${cssWidth}px`;
el.style.height = `${cssHeight}px`;
ctx.scale(dpr, dpr);
const width = cssWidth;
const height = cssHeight;

const generate = (count, weightDev, capMean, capDev, obstacleProb) => {
  const topo = triangulation(count, normal(0, weightDev, Math.random), normal(capMean, capDev, Math.random));
  const dist = bernoulli(obstacleProb, Math.random);
  const obs = obstacle(topo.network(), dist, new Map());
  return colony(obs, dist);
};

let original = generate(10, 15, 50, 10, 0.2);
let col = original;

let blockedEdges = new Set();
let capacityMap = new Map();
let weightMap = new Map();
let sel = selection();
let hl = highlight();
let routeHl = highlight();
let flowMap = new Map();
let labels = [];
let destroyMode = false;
let showDistance = false;
let showCapacity = false;
let activeOverlay = null;
let currentRoadmap = null;
const nodeRadius = 7;

const rebuildMaps = () => {
  const net = col.network();
  blockedEdges = new Set();
  capacityMap = new Map();
  weightMap = new Map();
  for (const e of net.edges().items()) {
    if (net.blocked(e.source().identifier(), e.target().identifier())) {
      blockedEdges.add(e.identifier());
    }
    capacityMap.set(e.identifier(), e.capacity());
    weightMap.set(e.identifier(), e.cost());
  }
};
rebuildMaps();

const canvas = {
  circle: (pos, radius, label) => {
    const id = Number(label);
    ctx.beginPath();
    ctx.arc(pos.x(), pos.y(), radius, 0, Math.PI * 2);
    if (routeHl.nodes().has(id)) {
      ctx.fillStyle = routeHl.color();
    } else if (hl.nodes().has(id)) {
      ctx.fillStyle = hl.color();
    } else if (sel.has(id)) {
      ctx.fillStyle = '#4a90d9';
    } else {
      ctx.fillStyle = 'white';
    }
    ctx.fill();
    ctx.strokeStyle = sel.has(id) ? '#2060a0' : '#333';
    ctx.lineWidth = sel.has(id) ? 2 : 1;
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(8, radius)}px monospace`;
    ctx.fillText(label, pos.x(), pos.y());
    ctx.lineWidth = 1;
  },
  line: (pos, halfWidth, halfHeight, edgeId) => {
    ctx.save();
    if (routeHl.edges().has(edgeId)) {
      ctx.strokeStyle = routeHl.color();
      ctx.lineWidth = 2.5;
    } else if (hl.edges().has(edgeId)) {
      ctx.strokeStyle = hl.color();
      ctx.lineWidth = 2.5;
    } else if (blockedEdges.has(edgeId)) {
      ctx.strokeStyle = 'rgba(180, 60, 60, 0.4)';
      ctx.setLineDash([5, 4]);
    } else {
      ctx.strokeStyle = '#555';
    }
    ctx.beginPath();
    ctx.moveTo(pos.x() - halfWidth, pos.y() - halfHeight);
    ctx.lineTo(pos.x() + halfWidth, pos.y() + halfHeight);
    ctx.stroke();
    if (flowMap.has(edgeId)) {
      const vertices = arrow(pos, halfWidth, halfHeight, 6).vertices();
      ctx.beginPath();
      ctx.moveTo(vertices[0].x(), vertices[0].y());
      ctx.lineTo(vertices[1].x(), vertices[1].y());
      ctx.lineTo(vertices[2].x(), vertices[2].y());
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }
    const parts = edgeId.split('->');
    if (parts[0] < parts[1] && (showDistance || showCapacity)) {
      const reverseId = `${parts[1]}->${parts[0]}`;
      const flowValue = flowMap.get(edgeId) || flowMap.get(reverseId);
      const segments = [];
      if (showDistance) { segments.push(weightMap.get(edgeId).toFixed(0)); }
      if (showCapacity) {
        const cap = capacityMap.get(edgeId);
        segments.push(flowValue === undefined ? `${cap.toFixed(0)}` : `${flowValue.toFixed(0)}/${cap.toFixed(0)}`);
      }
      labels.push({ x: pos.x(), y: pos.y() - 8, tag: segments.join('|'), isFlow: flowValue !== undefined });
    }
    ctx.restore();
  }
};

const edgeF = (id, hw, hh) => drawable(
  id,
  relativeRegion(Math.max(Math.abs(hw), 10), Math.max(Math.abs(hh), 10)),
  (pos, zm) => canvas.line(pos, hw * zm, hh * zm, id)
);

const rebuildScene = () => {
  const net = col.network();
  const lyt = embedding(width, height);
  const drws = drawables(
    net,
    (n) => drawableNode(n.identifier(), canvas, nodeRadius),
    (e) => ({ id: () => e.identifier() })
  );
  return landscape(net, lyt, drws, edgeF);
};
let lnd = rebuildScene();

const cam = camera(point(0, 0), 1, width, height);
let scn = scene(lnd, cam);

const updatePanel = () => {
  document.getElementById('stats').textContent =
    `Modules: ${col.modules().length}\nRoads: ${col.roads().length}\nObstacles: ${col.obstacles().length}`;
  document.getElementById('selection').textContent =
    sel.identifiers().length > 0
      ? `Selected: ${sel.identifiers().join(' → ')}`
      : 'Click a module to select';
  document.getElementById('results').textContent = [hl.label(), routeHl.label()].filter(Boolean).join('\n');
};

const render = () => {
  ctx.clearRect(0, 0, width, height);
  labels = [];
  scn.render();
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const lbl of labels) {
    const tw = ctx.measureText(lbl.tag).width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(lbl.x - tw / 2 - 3, lbl.y - 6, tw + 6, 12);
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(lbl.x - tw / 2 - 3, lbl.y - 6, tw + 6, 12);
    ctx.fillStyle = lbl.isFlow ? '#c06000' : '#555';
    ctx.fillText(lbl.tag, lbl.x, lbl.y);
  }
  updatePanel();
};

const runMst = () => {
  flowMap = new Map();
  try {
    currentRoadmap = roadmap(col, tree);
    hl = highlight(currentRoadmap.edges(), new Set(), '#2ecc71', `Road network cost: ${currentRoadmap.cost().toFixed(1)}`);
  } catch (e) {
    currentRoadmap = null;
    hl = highlight(new Set(), new Set(), '#e74c3c', e.message);
  }
};

const runCritical = () => {
  const inf = infrastructure(col, vulnerability);
  hl = highlight(inf.bridges(), inf.articulations(), '#e74c3c', `Bridges: ${inf.bridges().size / 2} | Critical modules: ${inf.articulations().size}`);
};

const syncButtons = () => {
  document.getElementById('btn-mst').style.background = activeOverlay === 'mst' ? '#1a6b3a' : '#333';
  document.getElementById('btn-route').style.display = activeOverlay === 'mst' ? '' : 'none';
  document.getElementById('btn-critical').style.background = activeOverlay === 'critical' ? '#8b2020' : '#333';
  document.getElementById('btn-flow').style.background = activeOverlay === 'flow' ? '#b35900' : '#333';
};

const runFlow = () => {
  if (sel.origin() === undefined || sel.destination() === undefined) {
    hl = highlight(new Set(), new Set(), '', 'Select 2 modules first');
    flowMap = new Map();
    return;
  }
  const p = pump(col, sel.origin(), sel.destination(), flow);
  flowMap = p.flow();
  hl = highlight(new Set([...p.flow().keys()]), p.bottlenecks(), '#e67e22', `Flow: ${sel.origin()} → ${sel.destination()}\nMax flow: ${p.total().toFixed(1)}`);
};

const rerunOverlay = () => {
  flowMap = new Map();
  routeHl = highlight();
  if (activeOverlay === 'mst') { runMst(); }
  else if (activeOverlay === 'critical') { currentRoadmap = null; runCritical(); }
  else if (activeOverlay === 'flow') { runFlow(); }
  else { currentRoadmap = null; hl = highlight(); }
};

const afterDestroy = () => {
  rebuildMaps();
  lnd = rebuildScene();
  scn = scene(lnd, scn.state().camera);
  rerunOverlay();
  render();
};

el.onmousedown = (e) => {
  const pt = point(e.offsetX, e.offsetY);
  const worldPt = unproject(scn.state().camera, pt).point();
  const hits = scn.state().world.query(worldPt, scn.state().camera.zoom());
  if (destroyMode) {
    const nodeHit = hits.find((id) => !String(id).includes('->'));
    if (nodeHit !== undefined) {
      col = col.destroy(col.network().nodes().get(nodeHit));
      afterDestroy();
      return;
    }
    const edgeHit = hits.find((id) => String(id).includes('->'));
    if (edgeHit !== undefined) {
      const parts = String(edgeHit).split('->');
      col = col.sever(Number(parts[0]), Number(parts[1]));
      afterDestroy();
      return;
    }
  }
  const nodeHit = hits.find((id) => !String(id).includes('->'));
  if (nodeHit !== undefined) {
    sel = sel.toggle(nodeHit);
    render();
    return;
  }
  sel = selection();
  scn = scn.action(down(pt));
  render();
};

el.onmousemove = (e) => {
  scn = scn.action(move(point(e.offsetX, e.offsetY)));
  render();
};

el.onmouseup = (e) => {
  scn = scn.action(up(point(e.offsetX, e.offsetY)));
  render();
};

el.onwheel = (e) => {
  e.preventDefault();
  const f = e.deltaY > 0 ? 0.99 : 1.01;
  scn = scn.action(zoom(f, point(e.offsetX, e.offsetY)));
  render();
};

document.getElementById('btn-mst').onclick = () => {
  activeOverlay = activeOverlay === 'mst' ? null : 'mst';
  syncButtons();
  rerunOverlay();
  render();
};

document.getElementById('btn-route').onclick = () => {
  flowMap = new Map();
  if (routeHl.edges().size > 0) {
    routeHl = highlight();
    render();
    return;
  }
  if (activeOverlay !== 'mst' || currentRoadmap === null) {
    routeHl = highlight(new Set(), new Set(), '', 'Enable Show Roads first');
    render();
    return;
  }
  if (sel.origin() === undefined || sel.destination() === undefined) {
    routeHl = highlight(new Set(), new Set(), '', 'Select 2 modules first');
    render();
    return;
  }
  const s = supply(currentRoadmap, sel.origin(), sel.destination(), route);
  if (!s.exists()) {
    routeHl = highlight(new Set(), new Set(), '', 'No route found');
    render();
    return;
  }
  routeHl = highlight(s.edges(), new Set(s.path()), '#3498db', `Route cost: ${s.cost().toFixed(1)}`);
  render();
};

document.getElementById('btn-flow').onclick = () => {
  activeOverlay = activeOverlay === 'flow' ? null : 'flow';
  syncButtons();
  rerunOverlay();
  render();
};

document.getElementById('btn-critical').onclick = () => {
  activeOverlay = activeOverlay === 'critical' ? null : 'critical';
  syncButtons();
  rerunOverlay();
  render();
};

document.getElementById('btn-destroy').onclick = () => {
  destroyMode = !destroyMode;
  document.getElementById('btn-destroy').style.background = destroyMode ? '#8b2020' : '#333';
  document.body.style.cursor = destroyMode ? 'crosshair' : 'default';
};

document.getElementById('btn-generate').onclick = () => {
  const count = Number(document.getElementById('node-count').value) || 10;
  const weightDev = parseFloat(document.getElementById('weight-dev').value);
  const capMean = parseFloat(document.getElementById('cap-mean').value);
  const capDev = parseFloat(document.getElementById('cap-dev').value);
  const obstacleProb = parseFloat(document.getElementById('obstacle-prob').value);
  original = generate(
    count,
    isNaN(weightDev) ? 15 : weightDev,
    isNaN(capMean) ? 50 : capMean,
    isNaN(capDev) ? 10 : capDev,
    isNaN(obstacleProb) ? 0.2 : obstacleProb
  );
  col = original;
  afterDestroy();
};

document.getElementById('btn-restore').onclick = () => {
  col = original;
  afterDestroy();
};

document.getElementById('btn-reset').onclick = () => {
  sel = selection();
  hl = highlight();
  routeHl = highlight();
  flowMap = new Map();
  render();
};

document.getElementById('chk-distance').onchange = (e) => { showDistance = e.target.checked; render(); };
document.getElementById('chk-capacity').onchange = (e) => { showCapacity = e.target.checked; render(); };

render();
