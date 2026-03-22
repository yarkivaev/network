import { point } from '../src/view/geometry/point.js';
import { camera } from '../src/view/camera/camera.js';
import { unproject } from '../src/view/camera/unproject.js';
import { project } from '../src/view/camera/project.js';
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
import { fakeFlow, fakeRoute, fakeTree, fakeVulnerability } from '../src/colony/fake.js';
import { selection } from '../src/view/selection.js';
import { highlight } from '../src/view/highlight.js';

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

const topo = triangulation(10, normal(0, 15, Math.random), normal(50, 10, Math.random));
const obs = obstacle(topo.network(), bernoulli(0.2, Math.random));
const col = colony(obs);

const blockedEdges = new Set();
for (const e of obs.edges().items()) {
  if (obs.blocked(e.source().identifier(), e.target().identifier())) {
    blockedEdges.add(e.identifier());
  }
}

const capacityMap = new Map();
for (const e of obs.edges().items()) {
  capacityMap.set(e.identifier(), e.capacity());
}

let sel = selection();
let hl = highlight();
let flowMap = new Map();
let labels = [];
const nodeRadius = 7;

const canvas = {
  circle: (pos, radius, label) => {
    const id = Number(label);
    ctx.beginPath();
    ctx.arc(pos.x(), pos.y(), radius, 0, Math.PI * 2);
    if (hl.nodes().has(id)) {
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
    if (hl.edges().has(edgeId)) {
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
    const cap = capacityMap.get(edgeId);
    const parts = edgeId.split('->');
    if (cap !== undefined && parts[0] < parts[1]) {
      const tag = flowMap.has(edgeId) ? `${flowMap.get(edgeId).toFixed(0)}/${cap.toFixed(0)}` : cap.toFixed(0);
      const isFlow = flowMap.has(edgeId);
      labels.push({ x: pos.x(), y: pos.y() - 8, tag, isFlow });
    }
    ctx.restore();
  }
};

const lyt = embedding(width, height);
const drws = drawables(
  obs,
  (n) => drawableNode(n.identifier(), canvas, nodeRadius),
  (e) => ({ id: () => e.identifier() })
);
const edgeF = (id, hw, hh) => drawable(
  id,
  relativeRegion(Math.max(Math.abs(hw), 10), Math.max(Math.abs(hh), 10)),
  (pos, zm) => canvas.line(pos, hw * zm, hh * zm, id)
);
const lnd = landscape(obs, lyt, drws, edgeF);

const cam = camera(point(0, 0), 1, width, height);
let scn = scene(lnd, cam);

const updatePanel = () => {
  document.getElementById('stats').textContent =
    `Modules: ${col.modules().length}\nRoads: ${col.roads().length}\nObstacles: ${col.obstacles().length}`;
  document.getElementById('selection').textContent =
    sel.identifiers().length > 0
      ? `Selected: ${sel.identifiers().join(' → ')}`
      : 'Click a module to select';
  document.getElementById('results').textContent = hl.label();
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

el.onmousedown = (e) => {
  const pt = point(e.offsetX, e.offsetY);
  const worldPt = unproject(scn.state().camera, pt).point();
  const hits = scn.state().world.query(worldPt, scn.state().camera.zoom());
  const nodeHit = hits.find((id) => !String(id).includes('->'));
  if (nodeHit !== undefined) {
    sel = sel.toggle(nodeHit);
    render();
    return;
  }
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
  flowMap = new Map();
  const rm = roadmap(col, fakeTree);
  hl = highlight(rm.edges(), new Set(), '#2ecc71', `Road network cost: ${rm.cost().toFixed(1)}`);
  render();
};

document.getElementById('btn-route').onclick = () => {
  flowMap = new Map();
  if (sel.origin() === undefined || sel.destination() === undefined) {
    hl = highlight(new Set(), new Set(), '', 'Select 2 modules first');
    render();
    return;
  }
  const s = supply(col, sel.origin(), sel.destination(), fakeRoute);
  if (!s.exists()) {
    hl = highlight(new Set(), new Set(), '', 'No route found');
    render();
    return;
  }
  hl = highlight(s.edges(), new Set(s.path()), '#3498db', `Route cost: ${s.cost().toFixed(1)}`);
  render();
};

document.getElementById('btn-flow').onclick = () => {
  if (sel.origin() === undefined) {
    hl = highlight(new Set(), new Set(), '', 'Select a pump station module');
    flowMap = new Map();
    render();
    return;
  }
  const p = pump(col, sel.origin(), fakeFlow);
  flowMap = p.flow();
  hl = highlight(new Set([...p.flow().keys()]), p.bottlenecks(), '#e67e22', `Pump station ${sel.origin()} → all\nTotal flow: ${p.total().toFixed(1)}`);
  render();
};

document.getElementById('btn-critical').onclick = () => {
  flowMap = new Map();
  const inf = infrastructure(col, fakeVulnerability);
  hl = highlight(inf.bridges(), inf.articulations(), '#e74c3c', `Bridges: ${inf.bridges().size / 2} | Critical modules: ${inf.articulations().size}`);
  render();
};

document.getElementById('btn-reset').onclick = () => {
  sel = selection();
  hl = highlight();
  flowMap = new Map();
  render();
};

render();
