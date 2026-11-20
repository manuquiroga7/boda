// Figuras en trazo fino para la sección de vestimenta (dibujadas a mano, sin relleno).
// Se definen como datos (viewBox 120 x 260) para usarlas igual en la web (SVG) y en el PDF.
export const FIGURAS = {
  dama: {
    alt: 'Dama con vestido largo',
    elipse: [60, 30, 10, 13],
    trazos: [
      'M50 27C48 13 63 8 70 18C74 24 71 32 68 37C75 41 77 50 73 59',
      'M56 43V52M64 43V52',
      'M56 52C48 54 44 58 43 66C42 80 46 92 48 104M64 52C72 54 76 58 77 66C78 80 74 92 72 104',
      'M47 66C54 76 66 76 73 66',
      'M52 55L50 66M68 55L70 66',
      'M48 104H72',
      'M48 104C40 150 28 200 20 250C45 255 75 255 100 250C92 200 80 150 72 104',
      'M60 106C58 160 56 210 52 252M54 106C46 160 38 206 34 252M66 106C74 160 82 206 86 252',
      'M43 66C37 80 39 96 49 105',
      'M44 97L58 92L60 100L46 105Z',
    ],
  },
  caballero: {
    alt: 'Caballero de traje',
    elipse: [60, 30, 10, 13],
    trazos: [
      'M50 25C52 13 68 13 70 25C66 19 54 19 50 25',
      'M55 42V50M65 42V50',
      'M55 50C44 52 36 56 34 66C31 90 30 112 32 130H42M65 50C76 52 84 56 86 66C89 90 90 112 88 130H78',
      'M42 130C41 140 43 148 44 152M78 130C79 140 77 148 76 152',
      'M44 152H76',
      'M55 50L58 92L46 76L52 62ZM65 50L62 92L74 76L68 62Z',
      'M57 51L60 58L63 51',
      'M60 58L58 82L60 90L62 82Z',
      'M60 98V100M60 112V114',
      'M44 152L47 238H58L60 166L62 238H73L76 152',
      'M47 238C42 244 41 250 49 250H58V238M73 238C78 244 79 250 71 250H62V238',
    ],
  },
};

const svg = (f) =>
  `<svg class="vest__fig" viewBox="0 0 120 260" role="img" aria-label="${f.alt}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="${f.elipse[0]}" cy="${f.elipse[1]}" rx="${f.elipse[2]}" ry="${f.elipse[3]}"/>${f.trazos.map((d) => `<path d="${d}"/>`).join('')}</svg>`;

// d = { nota, damas, caballeros, evitar: [{ nombre, color }] }
export function renderVestimenta(d, esc) {
  const colores = (d.evitar ?? [])
    .map((c) => `<li><i class="vest__color" style="background:${esc(c.color)}"></i>${esc(c.nombre)}</li>`)
    .join('');
  return `<div class="vest">
    <p class="vest__nota">${esc(d.nota)}</p>
    <div class="vest__figuras">
      <figure>${svg(FIGURAS.dama)}<figcaption>${esc(d.damas)}</figcaption></figure>
      <figure>${svg(FIGURAS.caballero)}<figcaption>${esc(d.caballeros)}</figcaption></figure>
    </div>
    ${colores ? `<p class="vest__titulo">Colores que no se pueden usar</p><ul class="vest__colores">${colores}</ul>` : ''}
  </div>`;
}
