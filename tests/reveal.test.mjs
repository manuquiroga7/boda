import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initReveal } from '../assets/js/reveal.js';

function setup() {
  const dom = new JSDOM('<!doctype html><body><p class="reveal" id="a"></p><p class="reveal" id="b"></p></body>');
  return dom.window.document;
}

function fakeObserver() {
  const state = { observed: [], unobserved: [], cb: null };
  function Factory(cb) {
    state.cb = cb;
    this.observe = (el) => state.observed.push(el);
    this.unobserve = (el) => state.unobserved.push(el);
  }
  return { Factory, state };
}

test('un elemento que entra en pantalla recibe is-visible', () => {
  const doc = setup();
  const { Factory, state } = fakeObserver();
  initReveal(doc, Factory);
  assert.equal(state.observed.length, 2);
  const a = doc.getElementById('a');
  state.cb([{ target: a, isIntersecting: true }]);
  assert.ok(a.classList.contains('is-visible'));
  assert.ok(!doc.getElementById('b').classList.contains('is-visible'));
});

test('un elemento ya revelado deja de observarse (no se reprocesa)', () => {
  const doc = setup();
  const { Factory, state } = fakeObserver();
  initReveal(doc, Factory);
  const a = doc.getElementById('a');
  state.cb([{ target: a, isIntersecting: true }]);
  assert.deepEqual(state.unobserved, [a]);
});

test('un elemento que todavía no entra no se revela', () => {
  const doc = setup();
  const { Factory, state } = fakeObserver();
  initReveal(doc, Factory);
  const a = doc.getElementById('a');
  state.cb([{ target: a, isIntersecting: false }]);
  assert.ok(!a.classList.contains('is-visible'));
});

test('al activarse marca el documento con js-reveal', () => {
  const doc = setup();
  const { Factory } = fakeObserver();
  initReveal(doc, Factory);
  assert.ok(doc.documentElement.classList.contains('js-reveal'));
});

test('sin IntersectionObserver todo queda visible y no se oculta nada', () => {
  const doc = setup();
  initReveal(doc, undefined);
  assert.ok(!doc.documentElement.classList.contains('js-reveal'));
  assert.ok(doc.getElementById('a').classList.contains('is-visible'));
  assert.ok(doc.getElementById('b').classList.contains('is-visible'));
});
