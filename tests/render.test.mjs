import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../assets/js/content.js';
import { renderPage } from '../assets/js/render.js';

const ids = (html) => [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);

test('la variante general trae las secciones en orden y sin "especial"', () => {
  assert.deepEqual(ids(renderPage(content, 'general')), ['portada', 'versiculo', 'cuenta', 'datos', 'mapa', 'asistencia', 'pdf']);
});

test('la variante especial pone "especial" justo después del versículo', () => {
  assert.deepEqual(ids(renderPage(content, 'especial')), ['portada', 'versiculo', 'especial', 'cuenta', 'datos', 'mapa', 'asistencia', 'pdf']);
});

test('la asistencia se confirma con un formulario dentro de la web', () => {
  const html = renderPage(content, 'general');
  assert.match(html, /<form class="rsvp" action="api\/rsvp" method="post"/);
  assert.doesNotMatch(html, /wa\.me/);
  for (const n of ['nombre', 'asiste', 'personas']) assert.match(html, new RegExp(`name="${n}"`));
});

test('el único iframe es el mapa de Google y el marcador de galería queda como comentario', () => {
  const html = renderPage(content, 'general');
  assert.equal((html.match(/<iframe/g) ?? []).length, 1);
  assert.match(html, /<!-- futuro: galería -->/);
});

test('escapa el texto del contenido', () => {
  const c = structuredClone(content);
  c.couple.names = ['<b>Ana</b>', 'Luis & Co'];
  const html = renderPage(c, 'general');
  assert.doesNotMatch(html, /<b>Ana<\/b>/);
  assert.match(html, /Luis &amp; Co/);
});

test('basePath se antepone a las rutas de assets', () => {
  const html = renderPage(content, 'general', '../');
  assert.match(html, /src="\.\.\/assets\/img\/pareja\//);
  assert.match(html, /href="\.\.\/assets\/pdf\/invitacion\.pdf"/);
});

test('no hay plantas decorativas', () => {
  const html = renderPage(content, 'general', '../');
  assert.doesNotMatch(html, /class="plant|assets\/img\/plants/);
  assert.doesNotMatch(renderPortada(content, 'a'), /class="plant/);
});

import { renderPortada } from '../assets/js/render.js';

const imgsDe = (html) => [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);

for (const estilo of ['a', 'b', 'c']) {
  test(`portada ${estilo}: tiene nombres, fecha, fotos con alt y no se difiere la carga`, () => {
    const html = renderPortada(content, estilo);
    assert.match(html, new RegExp(`id="portada"[^>]*class="[^"]*portada--${estilo}`));
    assert.match(html, /<h1/);
    assert.match(html, /Emanuel/);
    assert.match(html, /Belén/);
    assert.match(html, /Sábado 20 de marzo de 2027/);
    const fotos = imgsDe(html).filter((i) => !/class="plant/.test(i));
    assert.ok(fotos.length >= 1);
    for (const f of fotos) {
      assert.match(f, /alt="[^"]+"/);
      assert.doesNotMatch(f, /loading="lazy"/);
    }
  });
}

test('portada a usa una foto en arco; b usa tres polaroids; c usa una foto de fondo', () => {
  const fotos = (e) => imgsDe(renderPortada(content, e)).filter((i) => !/class="plant/.test(i)).length;
  assert.equal(fotos('a'), 1);
  assert.equal(fotos('b'), 3);
  assert.equal(fotos('c'), 1);
  assert.match(renderPortada(content, 'a'), /portada__arco/);
  assert.match(renderPortada(content, 'b'), /polaroid/);
  assert.match(renderPortada(content, 'c'), /portada__fondo/);
});

test('renderPage usa la portada c por defecto y acepta otra', () => {
  assert.match(renderPage(content, 'general'), /portada--c/);
  assert.match(renderPage(content, 'general', '', 'a'), /portada--a/);
});

test('las fotos de la portada respetan basePath', () => {
  assert.match(renderPortada(content, 'a', '../'), /src="\.\.\/assets\/img\/pareja\//);
});

test('la sección del mapa incrusta el Google Maps real, diferido y con título accesible', () => {
  const datos = renderPage(content, 'general').match(/<section id="mapa"[\s\S]*?<\/section>/)[0];
  const iframe = datos.match(/<iframe [^>]*>/)[0];
  assert.match(iframe, /src="https:\/\/www\.google\.com\/maps\?q=Burgues%203826%2C%20Montevideo&amp;output=embed"/);
  assert.match(iframe, /loading="lazy"/);
  assert.match(iframe, /title="Mapa de Google Maps: [^"]+"/);
  assert.match(iframe, /referrerpolicy="no-referrer-when-downgrade"/);
});

test('el mapa viene bloqueado hasta tocarlo (para no atrapar el scroll en el celular) y deja el botón Cómo llegar', () => {
  const datos = renderPage(content, 'general').match(/<section id="mapa"[\s\S]*?<\/section>/)[0];
  assert.match(datos, /<button type="button" class="mapa__activar"/);
  assert.match(datos, /Cómo llegar/);
  assert.match(datos, /href="https:\/\/www\.google\.com\/maps\/search\/\?api=1/);
});

test('con una clave de API usa el Embed API oficial', () => {
  const c = structuredClone(content);
  c.event.mapsApiKey = 'CLAVE_DE_PRUEBA';
  const iframe = renderPage(c, 'general').match(/<iframe [^>]*>/)[0];
  assert.match(iframe, /src="https:\/\/www\.google\.com\/maps\/embed\/v1\/place\?key=CLAVE_DE_PRUEBA&amp;q=Burgues%203826%2C%20Montevideo"/);
});

test('la sección de datos lleva una foto de ancho completo propia, diferidas y con alt', () => {
  const datos = renderPage(content, 'general').match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  const figuras = datos.match(/<figure class="banda[^"]*">[\s\S]*?<\/figure>/g) ?? [];
  assert.equal(figuras.length, 1);
  for (const f of figuras) {
    assert.match(f, /loading="lazy"/);
    assert.match(f, /alt="[^"]+"/);
  }
  const fuentes = figuras.map((f) => f.match(/src="([^"]+)"/)[1]);
  for (const s of fuentes) assert.ok(content.event.photos.some((p) => s.endsWith(p.src)), `foto inesperada: ${s}`);
});

test('las fotos de datos no repiten las fotos de la portada', () => {
  const portada = new Set(content.couple.photos.map((p) => p.src));
  for (const p of content.event.photos) assert.ok(!portada.has(p.src), `repetida: ${p.src}`);
});

test('las fotos de datos respetan basePath', () => {
  const datos = renderPage(content, 'general', '../').match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  assert.match(datos, /src="\.\.\/assets\/img\/pareja\//);
});

test('los datos van en una grilla de cuatro celdas: Fecha, Hora, Lugar y Vestimenta, en ese orden', () => {
  const datos = renderPage(content, 'general').match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  const grilla = datos.match(/<dl class="datos__grid">([\s\S]*?)<\/dl>/)[1];
  const celdas = grilla.match(/<div class="dato">[\s\S]*?<\/div>/g) ?? [];
  assert.equal(celdas.length, 4);
  const titulos = celdas.map((c) => c.match(/<dt>([^<]+)<\/dt>/)[1]);
  assert.deepEqual(titulos, ['Fecha', 'Hora', 'Lugar', 'Vestimenta']);
  assert.match(celdas[0], /Sábado 20 de marzo de 2027/);
  assert.match(celdas[1], /17:00 hs/);
  assert.match(celdas[2], /Iglesia Cristo es la Respuesta[\s\S]*Burgues 3826/);
});

test('sin vestimenta la grilla tiene tres celdas', () => {
  const c = structuredClone(content);
  delete c.event.dressCode;
  const datos = renderPage(c, 'general').match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  const iglesia = datos.match(/<dl class="datos__grid">([\s\S]*?)<\/dl>/)[1];
  assert.equal((iglesia.match(/<div class="dato">/g) ?? []).length, 3);
});

test('el foco de cada foto se aplica como object-position (para que no se corten las caras)', () => {
  const html = renderPage(content, 'general');
  assert.match(html, /<img [^>]*style="object-position:\d+% \d+%"/);
  const c = structuredClone(content);
  c.couple.photos[0].focus = '10% 20%';
  assert.match(renderPage(c, 'general'), /portada\.jpg"[^>]*style="object-position:10% 20%"/);
});

test('la portada B con una sola foto igual arma las tres polaroids', () => {
  const c = structuredClone(content);
  c.couple.photos = c.couple.photos.slice(0, 1);
  const fotos = (renderPortada(c, 'b').match(/<figure class="polaroid/g) ?? []).length;
  assert.equal(fotos, 3);
});

test('"¿Nos acompañas?" lleva un video de fondo mudo, en bucle, sin foto de respaldo y el formulario de confirmación', () => {
  const html = renderPage(content, 'general', '../');
  const sec = html.match(/<section id="asistencia"[\s\S]*?<\/section>/)[0];
  const video = sec.match(/<video [^>]*>/)[0];
  for (const a of ['muted', 'loop', 'playsinline', 'autoplay']) assert.match(video, new RegExp(` ${a}[ >]`));
  assert.doesNotMatch(video, /poster=/);
  assert.match(sec, /<source src="\.\.\/assets\/video\/[^"]+\.mp4"/);
  assert.match(sec, /<form class="rsvp" action="\.\.\/api\/rsvp"/);
  assert.match(sec, /<h2>¿Nos acompañas\?<\/h2>/);
});

test('la cuenta regresiva es su propia sección, justo debajo del versículo, con título y fecha de inicio', () => {
  const html = renderPage(content, 'general');
  assert.ok(html.indexOf('id="versiculo"') < html.indexOf('id="cuenta"') && html.indexOf('id="cuenta"') < html.indexOf('id="datos"'));
  const s = html.match(/<section id="cuenta"[\s\S]*?<\/section>/)[0];
  assert.match(s, /<h2>Cuenta regresiva<\/h2>/);
  assert.match(s, /data-inicio="2027-03-20T17:00:00-03:00"/);
});

test('"Te esperamos" muestra la ceremonia civil debajo de la de la iglesia, con fecha, hora y lugar', () => {
  const datos = renderPage(content, 'general').match(/<section id="datos"[\s\S]*?<\/section>/)[0];
  assert.ok(datos.indexOf('Ceremonia en la iglesia') < datos.indexOf('Ceremonia civil'));
  const civil = datos.slice(datos.indexOf('Ceremonia civil'));
  assert.match(civil, /Sábado 20 de marzo de 2027/);
  assert.match(civil, /15:00 hs/);
  assert.match(civil, /Registro Civil/);
  assert.doesNotMatch(civil, /Vestimenta/);
});

test('sin datos del civil no aparece el bloque', () => {
  const c = structuredClone(content);
  delete c.event.civil;
  assert.doesNotMatch(renderPage(c, 'general'), /Ceremonia civil/);
});
