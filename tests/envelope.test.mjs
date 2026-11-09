import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { openEnvelope } from '../assets/js/envelope.js';

function setup() {
  const dom = new JSDOM('<!doctype html><body><div id="root"></div></body>');
  globalThis.document = dom.window.document;
  return { root: dom.window.document.getElementById('root'), doc: dom.window.document };
}

test('el sello es un botón con etiqueta accesible', () => {
  const { root } = setup();
  openEnvelope({ root, onOpen() {} });
  const seal = root.querySelector('button.seal');
  assert.ok(seal);
  assert.equal(seal.getAttribute('aria-label'), 'Abrir invitación');
});

test('tocar el sello dos veces llama a onOpen una sola vez', () => {
  const { root } = setup();
  let calls = 0;
  openEnvelope({ root, onOpen: () => calls++ });
  const seal = root.querySelector('button.seal');
  seal.click();
  seal.click();
  assert.equal(calls, 1);
});

test('al abrir se inicia la animación y el contenido queda bloqueado hasta terminar', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const { root, doc } = setup();
  openEnvelope({ root, onOpen() {} });
  assert.ok(doc.body.classList.contains('is-locked'));
  root.querySelector('button.seal').click();
  assert.ok(root.querySelector('.envelope').classList.contains('is-opening'));
  assert.ok(doc.body.classList.contains('is-locked'));
  mock.timers.tick(7000);
  assert.ok(!doc.body.classList.contains('is-locked'));
  assert.equal(root.querySelector('.envelope'), null);
  mock.timers.reset();
});

test('el sobre es modal y deja inertes las secciones hasta que termina', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const { root, doc } = setup();
  const section = doc.createElement('section');
  doc.body.append(section);
  openEnvelope({ root, onOpen() {}, inertElements: [section] });
  assert.equal(root.querySelector('.envelope').getAttribute('aria-modal'), 'true');
  assert.ok(section.hasAttribute('inert'));
  root.querySelector('button.seal').click();
  assert.ok(section.hasAttribute('inert'));
  mock.timers.tick(7000);
  assert.ok(!section.hasAttribute('inert'));
  mock.timers.reset();
});

test('al terminar, el foco pasa al elemento indicado', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const { root, doc } = setup();
  const target = doc.createElement('h1');
  target.tabIndex = -1;
  doc.body.append(target);
  openEnvelope({ root, onOpen() {}, focusAfter: target });
  root.querySelector('button.seal').click();
  mock.timers.tick(7000);
  assert.equal(doc.activeElement, target);
  mock.timers.reset();
});

test('con movimiento reducido salta la animación', () => {
  const { root, doc } = setup();
  globalThis.matchMedia = () => ({ matches: true });
  openEnvelope({ root, onOpen() {} });
  root.querySelector('button.seal').click();
  assert.ok(!doc.body.classList.contains('is-locked'));
  assert.equal(root.querySelector('.envelope'), null);
  delete globalThis.matchMedia;
});
