import { whatsappUrl, mapsUrl } from './links.js';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderPage(c, variant = 'general', basePath = '') {
  const a = (path) => esc(basePath + path);
  const [n1, n2] = c.couple.names;
  const plant = (file, cls) => `<img class="plant ${cls}" src="${a('assets/img/plants/' + file)}" alt="" aria-hidden="true" width="160" height="160">`;

  const portada = `
<section id="portada" class="sec sec--portada reveal">
  ${plant('rama-1.svg', 'plant--tl')}
  ${plant('hojas-3.svg', 'plant--br')}
  <p class="eyebrow">Con la bendición de Dios</p>
  <h1 class="names"><span>${esc(n1)}</span><em>&amp;</em><span>${esc(n2)}</span></h1>
  <p class="date">${esc(c.couple.dateText)}</p>
  <p class="hint" aria-hidden="true">Desliza para continuar</p>
</section>`;

  const versiculo = `
<section id="versiculo" class="sec sec--versiculo reveal">
  ${plant('rama-2.svg', 'plant--tr')}
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
    <img src="${a(s.photo)}" alt="${esc(s.alt)}" loading="lazy" width="640" height="480">
    <h3>${esc(s.title)}</h3>
    <p>${esc(s.text)}</p>
  </article>`
    )
    .join('')}
</section>`;

  const e = c.event;
  const datos = `
<section id="datos" class="sec sec--datos reveal">
  ${plant('rama-1.svg', 'plant--bl')}
  <h2>Te esperamos</h2>
  <dl>
    <dt>Fecha</dt><dd>${esc(c.couple.dateText)}</dd>
    <dt>Hora</dt><dd>${esc(e.time)}</dd>
    <dt>Lugar</dt><dd>${esc(e.placeName)}<br><span>${esc(e.address)}</span></dd>
    ${e.dressCode ? `<dt>Vestimenta</dt><dd>${esc(e.dressCode)}</dd>` : ''}
  </dl>
  <a class="map" href="${esc(mapsUrl(e.mapsQuery))}" target="_blank" rel="noopener">
    <img src="${a('assets/img/map.svg')}" alt="Mapa estilizado del lugar de la ceremonia" loading="lazy" width="640" height="360">
    <span class="btn">Cómo llegar</span>
  </a>
</section>`;

  const asistencia = `
<section id="asistencia" class="sec sec--asistencia reveal">
  <h2>¿Nos acompañas?</h2>
  <p>Cuéntanos si podrás estar con nosotros.</p>
  <a class="btn" href="${esc(whatsappUrl(c.rsvp.whatsappNumber, c.rsvp.message))}" target="_blank" rel="noopener">Confirmar por WhatsApp</a>
</section>`;

  const pdf = `
<section id="pdf" class="sec sec--pdf reveal">
  ${plant('hojas-3.svg', 'plant--tr')}
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
