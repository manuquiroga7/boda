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

const fiestaHtml = () => readFileSync('fiesta-m4x9/index.html', 'utf8');

test('la página de la fiesta no se indexa, usa data-variant fiesta y no está enlazada desde las otras', () => {
  assert.match(fiestaHtml(), /noindex, nofollow/);
  assert.match(fiestaHtml(), /data-variant="fiesta"/);
  assert.match(fiestaHtml(), /data-base="\.\.\/"/);
  for (const v of ['general', 'especial']) assert.doesNotMatch(renderPage(content, v), /fiesta-m4x9/);
  assert.doesNotMatch(generalHtml(), /fiesta-m4x9/);
});

test('la fiesta (21:30) aparece solo en las variantes fiesta y especial, después de la ceremonia', () => {
  const datos = (v) => renderPage(content, v).match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  assert.ok(!datos('general').includes('>Fiesta<'));
  assert.ok(!renderPage(content, 'general').includes('21:30'));
  for (const v of ['fiesta', 'especial']) {
    const d = datos(v);
    assert.ok(d.indexOf('>Civil<') < d.indexOf('>Ceremonia<') && d.indexOf('>Ceremonia<') < d.indexOf('>Fiesta<'));
    assert.match(d.slice(d.indexOf('>Fiesta<')), /21:30 hs/);
  }
});

test('el mensaje especial sigue siendo solo de damas y testigos y la fiesta no lo lleva', () => {
  assert.ok(!renderPage(content, 'fiesta').includes(content.special.message));
});

test('sin lugar de la fiesta no hay celda Lugar ni mapa de la fiesta', () => {
  const c = structuredClone(content);
  c.event.party = { time: '21:30 hs' };
  const d = renderPage(c, 'fiesta').match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  const fiesta = d.slice(d.indexOf('>Fiesta<'));
  assert.doesNotMatch(fiesta, /<dt>Lugar/);
  assert.doesNotMatch(fiesta, /<iframe/);
});

test('la fiesta usa la dirección y el punto exacto del link de Maps', () => {
  const d = renderPage(content, 'fiesta').match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  const fiesta = d.slice(d.indexOf('>Fiesta<'));
  assert.match(fiesta, /Gibraltar y Av\. Carlos María Ramírez/);
  assert.match(fiesta, /q=-34\.8759109%2C-56\.2643702/);
  assert.equal((d.match(/<iframe/g) ?? []).length, 3);
});

test('con lugar de la fiesta se muestra el mapa propio', () => {
  const c = structuredClone(content);
  c.event.party = { time: '21:30 hs', placeName: 'Salón', address: 'Calle 1', mapsQuery: 'Calle 1, Montevideo' };
  const d = renderPage(c, 'fiesta').match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  assert.equal((d.match(/<iframe/g) ?? []).length, 3);
  assert.match(d.slice(d.indexOf('>Fiesta<')), /Salón/);
});

test('cada variante descarga su PDF: sin fiesta para la general, con fiesta para las otras', () => {
  assert.match(renderPage(content, 'general'), /href="assets\/pdf\/invitacion\.pdf"/);
  for (const v of ['fiesta', 'especial']) assert.match(renderPage(content, v), /href="assets\/pdf\/invitacion-fiesta\.pdf"/);
});

test('en la variante especial "nuestra historia" va en cursiva dentro del título', () => {
  const h2 = renderPage(content, 'especial').match(/<section id="especial"[\s\S]*?<h2>([\s\S]*?)<\/h2>/)[1];
  assert.match(h2, /<em class="cursiva">nuestra historia<\/em>/);
  assert.equal(h2.replace(/<[^>]+>/g, ''), content.special.title);
});
