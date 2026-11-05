// Bordes irregulares de la carta (papel quemado). Se calculan en JS porque el largo de la página
// cambia con el contenido; el CSS solo usa el resultado como clip-path.

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

// Ruido suave (bahías grandes) más ruido fino (mordidas chicas), siempre entre 0 y 1.
function offsets(n, rng) {
  const coarse = Array.from({ length: Math.ceil(n / 6) + 2 }, () => rng());
  return Array.from({ length: n }, (_, i) => {
    const k = i / 6;
    const i0 = Math.floor(k);
    const t = (1 - Math.cos((k - i0) * Math.PI)) / 2;
    const smooth = coarse[i0] * (1 - t) + coarse[i0 + 1] * t;
    return Math.min(1, Math.max(0, 0.65 * smooth + 0.35 * rng()));
  });
}

const px = (v) => `${Math.round(v * 10) / 10}px`;

export function buildEdge(width, height, seed, { inset = 0, jitter = 6, step = 24 } = {}) {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  if (w <= 2 * inset + 2 || h <= 2 * inset + 2) {
    return `polygon(0px 0px, ${px(w)} 0px, ${px(w)} ${px(h)}, 0px ${px(h)})`;
  }
  const rng = mulberry32(seed);
  const nx = Math.max(2, Math.ceil((w - 2 * inset) / step));
  const ny = Math.max(2, Math.ceil((h - 2 * inset) / step));
  const top = offsets(nx + 1, rng);
  const right = offsets(ny + 1, rng);
  const bottom = offsets(nx + 1, rng);
  const left = offsets(ny + 1, rng);
  const pts = [];
  for (let i = 0; i <= nx; i++) pts.push([inset + ((w - 2 * inset) * i) / nx, inset + jitter * top[i]]);
  for (let i = 0; i <= ny; i++) pts.push([w - inset - jitter * right[i], inset + ((h - 2 * inset) * i) / ny]);
  for (let i = nx; i >= 0; i--) pts.push([inset + ((w - 2 * inset) * i) / nx, h - inset - jitter * bottom[i]]);
  for (let i = ny; i >= 0; i--) pts.push([inset + jitter * left[i], inset + ((h - 2 * inset) * i) / ny]);
  return `polygon(${pts.map(([x, y]) => `${px(x)} ${px(y)}`).join(', ')})`;
}

// El borde exterior (carbonizado) recorta toda la carta; el interior recorta la hoja de papel,
// que está 3 px adentro, y deja ver el borde oscuro entre ambos.
export function initPaper(el, ResizeObserverCtor = globalThis.ResizeObserver) {
  const apply = () => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    el.style.setProperty('--borde-exterior', buildEdge(w, h, 11, { inset: 0, jitter: 8, step: 26 }));
    el.style.setProperty('--borde-interior', buildEdge(w - 6, h - 6, 29, { inset: 0, jitter: 14, step: 16 }));
  };
  apply();
  if (typeof ResizeObserverCtor === 'function') new ResizeObserverCtor(apply).observe(el);
}
