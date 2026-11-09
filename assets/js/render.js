import { whatsappUrl, mapsUrl, mapsEmbedUrl } from './links.js';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');


// Portada con fotos. Tres estilos para comparar: a = foto en arco, b = polaroids, c = foto de fondo.
// 'focus' (opcional) es el punto de la foto que no debe cortarse al recortarla: se aplica como object-position.
const foco = (f) => (f.focus ? ` style="object-position:${esc(f.focus)}"` : '');

export function renderPortada(c, estilo = 'a', basePath = '') {
  const a = (path) => esc(basePath + path);
  const [n1, n2] = c.couple.names;
  const fotos = c.couple.photos;
  const foto = (f, cls = '') =>
    `<img${cls ? ` class="${cls}"` : ''} src="${a(f.src)}" alt="${esc(f.alt)}" width="600" height="800" decoding="async"${foco(f)}>`;
  const texto = `
  <p class="eyebrow">Con la bendición de Dios</p>
  <h1 class="names"><span>${esc(n1)}</span><em>&amp;</em><span>${esc(n2)}</span></h1>
  <p class="date">${esc(c.couple.dateText)}</p>`;
  const hint = '<p class="hint" aria-hidden="true">Desliza para continuar</p>';
  const abre = (e) => `<section id="portada" class="sec sec--portada portada--${e} reveal">`;

  if (estilo === 'b') {
    return `
${abre('b')}
  <div class="polaroids">
    <figure class="polaroid polaroid--1">${foto(fotos[0])}</figure>
    <figure class="polaroid polaroid--2">${foto(fotos[1] ?? fotos[0])}</figure>
  </div>${texto}
  <figure class="polaroid polaroid--3">${foto(fotos[2] ?? fotos[0])}</figure>
</section>`;
  }
  if (estilo === 'c') {
    return `
${abre('c')}
  ${foto(fotos[0], 'portada__fondo')}
  <div class="portada__velo"></div>${texto}
  ${hint}
</section>`;
  }
  return `
${abre('a')}
  <div class="portada__arco">${foto(fotos[0])}</div>${texto}
  ${hint}
</section>`;
}

export function renderPage(c, variant = 'general', basePath = '', estilo = 'c') {
  const a = (path) => esc(basePath + path);
  const [n1, n2] = c.couple.names;

  const portada = renderPortada(c, estilo, basePath);

  const versiculo = `
<section id="versiculo" class="sec sec--versiculo reveal">
  <blockquote>
    <p>${esc(c.verse.text)}</p>
    <cite>${esc(c.verse.ref)}</cite>
  </blockquote>
</section>`;

  const especial = `
<section id="especial" class="sec sec--especial reveal">
  <h2>${esc(c.special.title)}</h2>
  <p>${esc(c.special.message)}</p>
</section>`;

  const historia = `
<section id="historia" class="sec sec--historia">
  <h2 class="reveal">Nuestra historia</h2>
  ${c.story
    .map(
      (s) => `
  <article class="momento reveal">
    <img src="${a(s.photo)}" alt="${esc(s.alt)}" loading="lazy" width="640" height="480"${foco(s)}>
    <h3>${esc(s.title)}</h3>
    <p>${esc(s.text)}</p>
  </article>`
    )
    .join('')}
</section>`;

  const e = c.event;
  // Foto de ancho completo que se funde con el papel (sin marco ni sombra).
  const banda = (f, n) =>
    `<figure class="banda banda--${n}"><img src="${a(f.src)}" alt="${esc(f.alt)}" width="600" height="800" loading="lazy" decoding="async"${foco(f)}><div class="banda__velo"></div></figure>`;
  const datos = `
<section id="datos" class="sec sec--datos reveal">
  ${banda(e.photos[0], 1)}
  <h2>Te esperamos</h2>
  <dl class="datos__grid">
    <div class="dato"><dt>Fecha</dt><dd>${esc(c.couple.dateText)}</dd></div>
    <div class="dato"><dt>Hora</dt><dd>${esc(e.time)}</dd></div>
    <div class="dato"><dt>Lugar</dt><dd>${esc(e.placeName)}<br><span>${esc(e.address)}</span></dd></div>
    ${e.dressCode ? `<div class="dato"><dt>Vestimenta</dt><dd>${esc(e.dressCode)}</dd></div>` : ''}
  </dl>
  <div class="mapa">
    <iframe src="${esc(mapsEmbedUrl(e.mapsQuery, e.mapsApiKey))}" title="Mapa de Google Maps: ${esc(e.placeName)}, ${esc(e.address)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    <button type="button" class="mapa__activar"><span>Toca para mover el mapa</span></button>
  </div>
  <a class="btn" href="${esc(mapsUrl(e.mapsQuery))}" target="_blank" rel="noopener">Cómo llegar</a>
  ${banda(e.photos[1], 2)}
  ${banda(e.photos[2], 3)}
</section>`;

  const asistencia = `
<section id="asistencia" class="sec sec--asistencia reveal">
  <h2>¿Nos acompañas?</h2>
  <p>Cuéntanos si podrás estar con nosotros.</p>
  <a class="btn" href="${esc(whatsappUrl(c.rsvp.whatsappNumber, c.rsvp.message))}" target="_blank" rel="noopener">Confirmar por WhatsApp</a>
</section>`;

  const pdf = `
<section id="pdf" class="sec sec--pdf reveal">
  <h2>Guarda los datos</h2>
  <p>Descarga la invitación con toda la información.</p>
  <a class="btn" href="${a(c.pdf.src)}" download>Descargar PDF</a>
</section>
<!-- futuro: galería -->`;

  const mute = `
<button id="mute" class="mute" type="button" aria-pressed="false" aria-label="Silenciar música">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path class="mute__cono" d="M4 9v6h4l5 4V5L8 9H4z"/><path class="mute__on" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path class="mute__off" d="M16 9l5 6m0-6l-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
</button>`;

  return [mute, portada, versiculo, variant === 'especial' ? especial : '', historia, datos, asistencia, pdf].join('\n');
}
