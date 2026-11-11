import { mapsUrl, mapsEmbedUrl } from './links.js';

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
  // Apellido en cursiva, medio escondido detrás del nombre (opcional: couple.surnames)
  const apellido = (i) => (c.couple.surnames?.[i] ? `<small class="apellido">${esc(c.couple.surnames[i])}</small>` : '');
  const texto = `
  <h1 class="names"><span>${esc(n1)}${apellido(0)}</span><em>&amp;</em><span>${esc(n2)}${apellido(1)}</span></h1>
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

  const e = c.event;
  // Foto de ancho completo que se funde con el papel (sin marco ni sombra).
  const banda = (f, n, txt = '') =>
    `<figure class="banda banda--${n}"><img src="${a(f.src)}" alt="${esc(f.alt)}" width="600" height="800" loading="lazy" decoding="async"${foco(f)}><div class="banda__velo"></div>${txt ? `<figcaption class="banda__txt">${txt}</figcaption>` : ''}</figure>`;
  const lugar = (nombre, direccion) => `${esc(nombre)}${direccion ? `<br><span>${esc(direccion)}</span>` : ''}`;
  const bloque = (titulo, ev, vestimenta = '') => `
<h3 class="datos__titulo">${esc(titulo)}</h3>
<dl class="datos__grid">
  <div class="dato"><dt>Fecha</dt><dd>${esc(c.couple.dateText)}</dd></div>
  <div class="dato"><dt>Hora</dt><dd>${esc(ev.time)}</dd></div>
  <div class="dato"><dt>Lugar</dt><dd>${lugar(ev.placeName, ev.address)}</dd></div>
  ${vestimenta ? `<div class="dato"><dt>Vestimenta</dt><dd>${esc(vestimenta)}</dd></div>` : ''}
</dl>`;
  // Ceremonia en la iglesia y, debajo, el civil (mismo día)
  const grilla = bloque('Ceremonia en la iglesia', e, e.dressCode) + (e.civil ? bloque('Ceremonia civil', e.civil) : '');
  // Hora de inicio (Uruguay, UTC-3) tomada de "17:00 hs"
  const hm = /(\d{1,2}):(\d{2})/.exec(e.time) ?? [];
  const inicio = `${c.couple.dateISO}T${String(hm[1] ?? 0).padStart(2, '0')}:${hm[2] ?? '00'}:00-03:00`;
  const unidad = (k, t) => `<div><b data-u="${k}">--</b><span>${t}</span></div>`;
  const contador = `<div class="contador" data-inicio="${esc(inicio)}" role="timer" aria-label="Tiempo que falta para la boda">${[unidad('dias', 'días'), unidad('horas', 'horas'), unidad('minutos', 'min'), unidad('segundos', 'seg')].join('<i class="contador__sep" aria-hidden="true">:</i>')}</div>`;
  const datos = `
<section id="datos" class="sec sec--datos reveal">
  ${banda(e.photos[2], 1, `<h2>Te esperamos</h2>${grilla}`)}
</section>

<section id="mapa" class="sec sec--datos sec--mapa reveal">
  <div class="mapa">
    <iframe src="${esc(mapsEmbedUrl(e.mapsQuery, e.mapsApiKey))}" title="Mapa de Google Maps: ${esc(e.placeName)}, ${esc(e.address)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    <button type="button" class="mapa__activar"><span>Toca para mover el mapa</span></button>
  </div>
  <a class="btn" href="${esc(mapsUrl(e.mapsQuery))}" target="_blank" rel="noopener">Cómo llegar</a>
</section>`;

  const asistencia = `
<section id="asistencia" class="sec sec--asistencia reveal">
  <figure class="banda banda--video">
    <video muted loop playsinline autoplay preload="auto" aria-hidden="true" tabindex="-1"${foco(c.video)}><source src="${a(c.video.src)}" type="video/mp4"></video>
    <div class="banda__velo"></div>
    <figcaption class="banda__txt">
      <h2>¿Nos acompañas?</h2>
      <p>Cuéntanos si podrás estar con nosotros.</p>
      <form class="rsvp" action="${a(c.rsvp.endpoint)}" method="post" novalidate>
        <label class="rsvp__campo">Tu nombre
          <input type="text" name="nombre" required minlength="2" maxlength="80" autocomplete="name">
        </label>
        <fieldset class="rsvp__asiste">
          <legend class="sr-only">¿Podrás venir?</legend>
          <label><input type="radio" name="asiste" value="si" checked> Sí, ahí estaré</label>
          <label><input type="radio" name="asiste" value="no"> No podré</label>
        </fieldset>
        <label class="rsvp__campo rsvp__personas">¿Cuántas personas?
          <select name="personas">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}">${n}</option>`).join('')}</select>
        </label>
        <input class="rsvp__trampa" type="text" name="web" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn" type="submit">Confirmar asistencia</button>
        <p class="rsvp__msg" role="status" aria-live="polite"></p>
      </form>
    </figcaption>
  </figure>
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

  const cuenta = `
<section id="cuenta" class="sec sec--cuenta reveal">
  <h2>Cuenta regresiva</h2>
  <p class="cuenta__sub">para el gran día</p>
  ${contador}
</section>`;

  return [mute, portada, versiculo, variant === 'especial' ? especial : '', cuenta, datos, asistencia, pdf].join('\n');
}
