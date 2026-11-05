import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { content } from '../assets/js/content.js';
import { renderPage } from '../assets/js/render.js';

const variantHtml = () => readFileSync('para-ti-k7q2/index.html', 'utf8');
const generalHtml = () => readFileSync('index.html', 'utf8');

test('la página de la variante no se indexa', () => {
  assert.match(variantHtml(), /<meta name="robots" content="noindex, nofollow">/);
});

test('la variante usa data-variant especial y rutas relativas a la carpeta superior', () => {
  const html = variantHtml();
  assert.match(html, /data-variant="especial"/);
  assert.match(html, /data-base="\.\.\/"/);
  assert.match(html, /href="\.\.\/assets\/css\/base\.css"/);
  assert.match(html, /src="\.\.\/assets\/js\/main\.js"/);
});

test('la invitación general no enlaza a la variante', () => {
  assert.doesNotMatch(generalHtml(), /para-ti-k7q2/);
  assert.doesNotMatch(renderPage(content, 'general'), /para-ti-k7q2/);
});

test('el mensaje especial aparece solo en la variante', () => {
  assert.ok(renderPage(content, 'especial').includes(content.special.message));
  assert.ok(!renderPage(content, 'general').includes(content.special.message));
});

test('la invitación general no tiene noindex', () => {
  assert.doesNotMatch(generalHtml(), /noindex/);
});
