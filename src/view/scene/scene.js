import { camera } from '../camera/camera.js';
import { point } from '../geometry/point.js';
import { region } from '../geometry/region.js';
import { unproject } from '../camera/unproject.js';
import { project } from '../camera/project.js';

/**
 * Idle interaction mode with no active gesture.
 *
 * @returns {Object} An idle mode object
 */
const idle = () => ({
  type: () => 'idle'
});

/**
 * Panning mode with camera movement gesture active.
 *
 * @param {Object} anchor - The screen point where pan started
 * @returns {Object} A panning mode object
 */
const panning = (anchor) => ({
  type: () => 'panning',
  anchor: () => anchor
});

/**
 * Dragging mode with drawable movement gesture active.
 *
 * @param {*} target - The identifier of the drawable being dragged
 * @param {Object} anchor - The screen point where drag started
 * @returns {Object} A dragging mode object
 */
const dragging = (target, anchor) => ({
  type: () => 'dragging',
  target: () => target,
  anchor: () => anchor
});

/**
 * Converts screen point to world point.
 */
const toWorld = (cam, screen) => unproject(cam, screen).point();

/**
 * Returns viewport region in world coordinates.
 */
const viewport = (cam) => {
  const topLeft = toWorld(cam, point(0, 0));
  const bottomRight = toWorld(cam, point(cam.width(), cam.height()));
  return region(topLeft.x(), topLeft.y(), bottomRight.x(), bottomRight.y());
};

/**
 * Handles move during dragging.
 */
const handleDrag = (state, act, create) => {
  const items = state.wld.get([state.mode.target()]);
  const oldPos = items[0].position;
  const oldScreen = project(state.cam, oldPos).point();
  const dx = act.point().x() - state.mode.anchor().x();
  const dy = act.point().y() - state.mode.anchor().y();
  const newScreen = point(oldScreen.x() + dx, oldScreen.y() + dy);
  const newWorld = toWorld(state.cam, newScreen);
  const newWld = state.wld.move(state.mode.target(), newWorld);
  const newMode = dragging(state.mode.target(), act.point());
  return create({ ...state, wld: newWld, mode: newMode });
};

/**
 * Handles move action based on current mode.
 */
const handleMove = (state, act, create) => {
  if (state.mode.type() === 'panning') {
    const dx = act.point().x() - state.mode.anchor().x();
    const dy = act.point().y() - state.mode.anchor().y();
    const newOffset = point(state.cam.offset().x() + dx, state.cam.offset().y() + dy);
    const newCam = camera(newOffset, state.cam.zoom(), state.cam.width(), state.cam.height());
    return create({ ...state, cam: newCam, mode: panning(act.point()) });
  }
  if (state.mode.type() === 'dragging') {
    return handleDrag(state, act, create);
  }
  return create(state);
};

/**
 * Creates scene from state object.
 */
const fromState = (state) => ({
  state: () => ({
    camera: state.cam,
    world: state.wld,
    mode: state.mode,
    viewport: viewport(state.cam)
  }),
  action: (act) => {
    if (act.type() === 'zoom') {
      const f = act.factor();
      const cx = act.point().x();
      const cy = act.point().y();
      const ox = state.cam.offset().x();
      const oy = state.cam.offset().y();
      const nx = cx * (1 - f) + ox * f;
      const ny = cy * (1 - f) + oy * f;
      const newCam = camera(point(nx, ny), state.cam.zoom() * f, state.cam.width(), state.cam.height());
      return fromState({ ...state, cam: newCam });
    }
    if (act.type() === 'down') {
      return fromState({ ...state, mode: panning(act.point()) });
    }
    if (act.type() === 'move') {
      return handleMove(state, act, fromState);
    }
    if (act.type() === 'up') {
      return fromState({ ...state, mode: idle() });
    }
    return fromState(state);
  },
  render: () => {
    const ids = state.wld.visible(viewport(state.cam));
    const items = state.wld.get(ids);
    for (const item of items) {
      if (item.drawable && item.position) {
        item.drawable.draw(project(state.cam, item.position).point(), state.cam.zoom());
      }
    }
  }
});

/**
 * Immutable view state with action-based state transitions and rendering.
 *
 * A scene encapsulates a world (drawables with positions), camera, and
 * interaction mode. It provides two methods: action() for handling user
 * input and render() for drawing visible elements.
 *
 * @param {Object} wld - The world containing drawables and positions
 * @param {Object} cam - The camera defining view transformation
 * @param {Object} [mode] - The current interaction mode (defaults to idle)
 * @returns {Object} A scene with action and render methods
 *
 * @example
 * let scn = scene(wld, cam);
 * scn = scn.action(down(point(100, 100)));
 * scn = scn.action(move(point(150, 150)));
 * scn = scn.action(up(point(150, 150)));
 * scn.render();
 */
const scene = (wld, cam, mode = idle()) => fromState({ wld, cam, mode });

export { scene, idle, panning, dragging };
