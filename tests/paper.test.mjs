import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEdge, initPaper } from '../assets/js/paper.js';

const points = (poly) =>
  [...poly.matchAll(/(-?[\d.]+)px (-?[\d.]+)px/g)].map((m) => [Number(m[1]), Number(m[2])]);

test('buildEdge devuelve un polígono con muchos puntos dentro de la caja', () => {
  const poly = buildEdge(400, 1200, 1, { inset: 4, jitter: 6, step: 24 });
  assert.match(poly, /^polygon\(.*\)$/);
  const pts = points(poly);
  assert.ok(pts.length > 100);
  for (const [x, y] of pts) {
    assert.ok(x >= 0 && x <= 400, `x fuera de la caja: ${x}`);
    assert.ok(y >= 0 && y <= 1200, `y fuera de la caja: ${y}`);
  }
});

test('buildEdge respeta el margen mínimo (inset) en los cuatro lados', () => {
  const pts = points(buildEdge(400, 1200, 3, { inset: 5, jitter: 7, step: 20 }));
  assert.ok(Math.min(...pts.map((p) => p[0])) >= 5 - 1e-6);
  assert.ok(Math.max(...pts.map((p) => p[0])) <= 395 + 1e-6);
  assert.ok(Math.min(...pts.map((p) => p[1])) >= 5 - 1e-6);
  assert.ok(Math.max(...pts.map((p) => p[1])) <= 1195 + 1e-6);
});

test('buildEdge es determinista por semilla y cambia con otra semilla', () => {
  const a = buildEdge(400, 900, 7, { inset: 2, jitter: 6, step: 24 });
  assert.equal(a, buildEdge(400, 900, 7, { inset: 2, jitter: 6, step: 24 }));
  assert.notEqual(a, buildEdge(400, 900, 8, { inset: 2, jitter: 6, step: 24 }));
});

test('buildEdge no rompe con cajas diminutas o vacías', () => {
  assert.match(buildEdge(0, 0, 1, { inset: 4, jitter: 6, step: 24 }), /^polygon\(/);
  assert.match(buildEdge(10, 10, 1, { inset: 4, jitter: 6, step: 24 }), /^polygon\(/);
});

test('initPaper fija los bordes exterior e interior según el tamaño y se actualiza al cambiar', () => {
  const set = {};
  const el = {
    offsetWidth: 380,
    offsetHeight: 2000,
    style: { setProperty: (k, v) => (set[k] = v) },
  };
  let trigger;
  function FakeRO(cb) {
    trigger = cb;
    this.observe = () => {};
  }
  initPaper(el, FakeRO);
  assert.match(set['--borde-exterior'], /^polygon\(/);
  assert.match(set['--borde-interior'], /^polygon\(/);
  const before = set['--borde-exterior'];
  el.offsetHeight = 2600;
  trigger();
  assert.notEqual(set['--borde-exterior'], before);
});

test('initPaper sin ResizeObserver igual calcula los bordes una vez', () => {
  const set = {};
  const el = { offsetWidth: 380, offsetHeight: 1500, style: { setProperty: (k, v) => (set[k] = v) } };
  initPaper(el, undefined);
  assert.match(set['--borde-exterior'], /^polygon\(/);
});
