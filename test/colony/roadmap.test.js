import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { colony } from '../../src/colony/colony.js';
import { roadmap } from '../../src/colony/roadmap.js';
import { fakeTree, fakeRoute } from '../../src/colony/fake.js';
import { tree } from '../../src/algorithm/tree.js';
import { triangulation } from '../../src/generation/triangulation.js';
import { normal } from '../../src/generation/normal.js';
import { obstacle } from '../../src/generation/obstacle.js';
import { bernoulli } from '../../src/generation/bernoulli.js';

const unit = { sample: () => 1 };
const nobs = bernoulli(0, Math.random);

describe('roadmap', () => {
  test('returns positive total cost', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, nobs, new Map()), nobs);
    assert.ok(roadmap(col, fakeTree).cost() > 0, 'cost was not positive');
  });

  test('returns edge identifiers', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, nobs, new Map()), nobs);
    assert.ok(roadmap(col, fakeTree).edges().size > 0, 'no edges returned');
  });

  test('edges include both directions with real tree', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, nobs, new Map()), nobs);
    const rm = roadmap(col, tree);
    const edges = rm.edges();
    const forward = [...edges].find((id) => id.includes('->'));
    const parts = forward.split('->');
    const reverse = `${parts[1]}->${parts[0]}`;
    assert.ok(edges.has(reverse), 'reverse direction missing from MST edges');
  });

  test('cost equals sum of MST edge weights not halved', () => {
    const net = triangulation(4, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, nobs, new Map()), nobs);
    const rm = roadmap(col, tree);
    assert.ok(rm.cost() > 0, 'cost was not positive');
    const passable = col.passable();
    const mst = tree(passable).span();
    const expected = mst.edges().items().reduce((sum, e) => sum + e.cost(), 0);
    assert.equal(rm.cost(), expected, 'cost did not match MST edge sum');
  });

  test('span returns routable network between any two modules', () => {
    const net = triangulation(5, normal(0, 10, Math.random), unit).network();
    const col = colony(obstacle(net, nobs, new Map()), nobs);
    const rm = roadmap(col, fakeTree);
    const mstNet = rm.span();
    const nodes = mstNet.nodes().items();
    const r = fakeRoute(mstNet, nodes[0], nodes[nodes.length - 1]);
    assert.ok(r.exists(), 'route not found on MST network');
  });
});
