// Borde quemado e irregular de la carta, dibujado como UNA imagen SVG estática que se superpone
// a la hoja (no se recorta ni se filtra el contenido: la página es muy alta y eso la volvía lenta).
// El largo de la página cambia con el contenido, por eso la imagen se calcula en JS.

const MARGEN = 28; // espacio fuera de la carta para la sombra
const MESA = '#CDB791'; // debe coincidir con --mesa en base.css
const OPCIONES = { inset: 4, jitter: 28, step: 15 };

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Profundidad del borde en cada muestra, entre 0 y 1: ondas grandes + ruido fino + "mordidas" de quemadura.
function profundidades(n, rng) {
  const coarse = Array.from({ length: Math.ceil(n / 5) + 2 }, () => rng());
  const out = Array.from({ length: n }, (_, i) => {
    const k = i / 5;
    const i0 = Math.floor(k);
    const t = (1 - Math.cos((k - i0) * Math.PI)) / 2;
    const smooth = coarse[i0] * (1 - t) + coarse[i0 + 1] * t;
    return 0.46 * smooth + 0.2 * rng();
  });
  const mordidas = Math.max(1, Math.round(n / 6));
  for (let b = 0; b < mordidas; b++) {
    const centro = Math.floor(rng() * n);
    const ancho = 2 + Math.floor(rng() * 4);
    const hondo = 0.25 + 0.5 * rng();
    for (let j = -ancho; j <= ancho; j++) {
      const i = centro + j;
      if (i >= 0 && i < n) out[i] += hondo * (1 - Math.abs(j) / (ancho + 1));
    }
  }
  // Cada lado se aplana cerca de las esquinas para que no se formen picos ni rulos.
  return out.map((v, i) => Math.min(1, v) * Math.min(1, (i + 1) / 5, (n - i) / 5));
}

// Puntos del contorno, en el sentido de las agujas del reloj, dentro de [inset, size - inset].
export function edgePoints(width, height, seed, { inset = 0, jitter = 6, step = 24 } = {}) {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  if (w <= 2 * inset + 2 || h <= 2 * inset + 2) {
    return [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ];
  }
  const rng = mulberry32(seed);
  const nx = Math.max(2, Math.ceil((w - 2 * inset) / step));
  const ny = Math.max(2, Math.ceil((h - 2 * inset) / step));
  const top = profundidades(nx + 1, rng);
  const right = profundidades(ny + 1, rng);
  const bottom = profundidades(nx + 1, rng);
  const left = profundidades(ny + 1, rng);
  // Las esquinas se definen aparte (un solo punto cada una, apenas redondeado) para que no se formen rulos.
  const c = jitter * 0.18;
  const X = (i) => inset + ((w - 2 * inset) * i) / nx;
  const Y = (i) => inset + ((h - 2 * inset) * i) / ny;
  const pts = [[inset + c, inset + c]];
  for (let i = 1; i < nx; i++) pts.push([X(i), inset + jitter * top[i]]);
  pts.push([w - inset - c, inset + c]);
  for (let i = 1; i < ny; i++) pts.push([w - inset - jitter * right[i], Y(i)]);
  pts.push([w - inset - c, h - inset - c]);
  for (let i = nx - 1; i >= 1; i--) pts.push([X(i), h - inset - jitter * bottom[i]]);
  pts.push([inset + c, h - inset - c]);
  for (let i = ny - 1; i >= 1; i--) pts.push([inset + jitter * left[i], Y(i)]);
  return pts;
}

const r1 = (v) => Math.round(v * 10) / 10;

// Curva suave que pasa cerca de cada punto (cada punto es punto de control entre dos puntos medios).
function curva(pts, dx, dy) {
  const p = pts.map(([x, y]) => [x + dx, y + dy]);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const first = mid(p[p.length - 1], p[0]);
  let d = `M${r1(first[0])} ${r1(first[1])}`;
  for (let i = 0; i < p.length; i++) {
    const m = mid(p[i], p[(i + 1) % p.length]);
    d += `Q${r1(p[i][0])} ${r1(p[i][1])} ${r1(m[0])} ${r1(m[1])}`;
  }
  return `${d}Z`;
}

export function buildMarcoSvg(width, height, seed = 11) {
  const W = Math.max(0, width) + 2 * MARGEN;
  const H = Math.max(0, height) + 2 * MARGEN;
  const d = curva(edgePoints(width, height, seed, OPCIONES), MARGEN, MARGEN);
  const caja = `M0 0H${W}V${H}H0Z`;
  const escala = (n, a, b) => Array.from({ length: n }, (_, i) => r1(n === 1 ? a : a + ((b - a) * i) / (n - 1)));
  const capas = (anchos, color, opacidades, extra = '') =>
    anchos
      .map(
        (a, i) =>
          `<use href='#p' ${extra} fill='none' stroke='${color}' stroke-opacity='${opacidades[i]}' stroke-width='${a}' stroke-linejoin='round'/>`
      )
      .join('');
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>` +
    `<defs><path id='p' d='${d}'/>` +
    `<clipPath id='in'><use href='#p'/></clipPath>` +
    `<clipPath id='out'><path clip-rule='evenodd' d='${caja}${d}'/></clipPath></defs>` +
    // 1) fuera de la hoja: el color de la mesa, con la sombra de la carta (muchas capas finas = degradé suave)
    `<path fill='${MESA}' fill-rule='evenodd' d='${caja}${d}'/>` +
    `<g clip-path='url(#out)'>${capas(escala(14, 6, 70), 'rgb(30,15,8)', escala(14, 0.032, 0.032), `transform='translate(0 9)'`)}</g>` +
    // 2) dentro de la hoja: el papel se chamusca hacia el borde
    `<g clip-path='url(#in)'>${capas(escala(16, 10, 150), 'rgb(96,48,14)', escala(16, 0.04, 0.04))}` +
    `${capas([8, 14, 22, 34], 'rgb(80,36,10)', [0.16, 0.14, 0.12, 0.1])}` +
    `<use href='#p' fill='none' stroke='rgb(214,98,30)' stroke-opacity='0.4' stroke-width='6' stroke-dasharray='46 8 4 16 90 6 12 22' stroke-linejoin='round'/>` +
    `<use href='#p' fill='none' stroke='rgb(40,22,12)' stroke-opacity='0.5' stroke-width='14' stroke-dasharray='120 34 60 26 200 40' stroke-linejoin='round'/></g>` +
    // 3) borde carbonizado, grueso y entrecortado
    `<use href='#p' fill='none' stroke='rgb(32,18,10)' stroke-width='6' stroke-linejoin='round'/>` +
    `<use href='#p' fill='none' stroke='rgb(18,10,6)' stroke-width='3' stroke-dasharray='70 20 14 30' stroke-linejoin='round'/>` +
    `</svg>`
  );
}

function aUrl(svg) {
  const esc = svg.replace(/%/g, '%25').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23');
  return `url("data:image/svg+xml,${esc}")`;
}

// carta: el contenedor de la hoja. Su ::after usa la variable --marco como imagen de fondo.
export function initPaper(carta, ResizeObserverCtor = globalThis.ResizeObserver) {
  const apply = () => carta.style.setProperty('--marco', aUrl(buildMarcoSvg(carta.offsetWidth, carta.offsetHeight, 11)));
  apply();
  if (typeof ResizeObserverCtor === 'function') new ResizeObserverCtor(apply).observe(carta);
}
