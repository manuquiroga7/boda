import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const RUTA = 'assets/img/fondo-perla.svg';
const base = readFileSync('assets/css/base.css', 'utf8');
const envelope = readFileSync('assets/css/envelope.css', 'utf8');
const cuantos = (svg, clase) => (svg.match(new RegExp(`class='${clase}'`, 'g')) ?? []).length;

test('existe el mosaico del fondo, liviano y sin filtros', () => {
  assert.ok(existsSync(RUTA));
  assert.ok(statSync(RUTA).size < 30 * 1024);
  const svg = readFileSync(RUTA, 'utf8');
  assert.doesNotMatch(svg, /<filter|feTurbulence/);
  assert.match(svg, /width='400' height='400'/);
});

test('el mosaico conserva las cruces y las fotitos', () => {
  const svg = readFileSync(RUTA, 'utf8');
  assert.ok(cuantos(svg, 'cruz') >= 5, 'faltan cruces');
  assert.ok(cuantos(svg, 'foto') >= 3, 'faltan fotitos');
});

test('el mosaico suma más elementos: palomas, ramitas de olivo, anillos, corazones, flores y destellos', () => {
  const svg = readFileSync(RUTA, 'utf8');
  for (const [clase, minimo] of [['paloma', 2], ['ramita', 2], ['anillos', 2], ['corazon', 3], ['flor', 3], ['destello', 4]]) {
    assert.ok(cuantos(svg, clase) >= minimo, `faltan elementos: ${clase} (hay ${cuantos(svg, clase)}, mínimo ${minimo})`);
  }
});

test('la página usa el mosaico sobre un fondo perla que se mueve con el scroll', () => {
  assert.match(base, /body\s*{[^}]*fondo-perla\.svg/);
  assert.match(base, /background-size:\s*400px 400px/);
  assert.doesNotMatch(base, /background[^;]*\bfixed\b/);
});

test('el sobre del inicio usa el mismo fondo perla para que la transición sea continua', () => {
  assert.match(envelope, /\.envelope\s*{[^}]*fondo-perla\.svg/);
  assert.match(envelope, /background-size:\s*400px 400px/);
});

test('no quedan los colores beige de la mesa anterior en el fondo', () => {
  assert.doesNotMatch(base, /--mesa-1|--mesa-2/);
});

// ---- Paleta: nada de rosados ni lilas en el fondo (chocolate, bordó, verde, beige y crema) ----
function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s, l };
}
// "Rosado o lila": tono entre magenta y rojo suave, con color apreciable y no oscuro (el chocolate y el bordó son oscuros).
const esRosadoOLila = (r, g, b) => {
  const { h, s, l } = hsl(r, g, b);
  return s > 0.12 && l > 0.45 && (h >= 240 || h <= 25);
};
const coloresDe = (texto) => {
  const hex = [...texto.matchAll(/#([0-9a-fA-F]{6})\b/g)].map((m) => [m[0], ...[0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))]);
  const rgba = [...texto.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)].map((m) => [m[0], +m[1], +m[2], +m[3]]);
  return [...hex, ...rgba];
};

for (const [nombre, ruta] of [['el mosaico', RUTA], ['base.css', 'assets/css/base.css'], ['envelope.css', 'assets/css/envelope.css']]) {
  test(`${nombre} no usa colores rosados ni lilas`, () => {
    const malos = coloresDe(readFileSync(ruta, 'utf8')).filter(([, r, g, b]) => esRosadoOLila(r, g, b)).map(([c]) => c);
    assert.deepEqual(malos, [], `colores rosados o lilas: ${malos.join(', ')}`);
  });
}

test('el chocolate es el color protagonista de los trazos del mosaico', () => {
  const svg = readFileSync(RUTA, 'utf8');
  const chocolate = (svg.match(/#5A3A33/gi) ?? []).length;
  assert.ok(chocolate >= 8, `pocos trazos en chocolate: ${chocolate}`);
});

test('todo el mosaico es semitransparente: un grupo general con opacidad entre .15 y .8', () => {
  const svg = readFileSync(RUTA, 'utf8');
  const grupo = svg.match(/<g class='mosaico' opacity='(0?\.\d+)'>/);
  assert.ok(grupo, 'falta el grupo general del mosaico');
  const o = Number(grupo[1]);
  assert.ok(o >= 0.15 && o <= 0.8, `opacidad fuera de rango: ${o}`);
  // el grupo envuelve todo el contenido dibujado
  const dentro = svg.slice(svg.indexOf(grupo[0]), svg.lastIndexOf('</g>') + 4);
  for (const clase of ['cruz', 'foto', 'paloma', 'ramita', 'anillos', 'corazon', 'flor', 'destello']) {
    assert.ok(dentro.includes(`class='${clase}'`), `${clase} quedó fuera del grupo semitransparente`);
  }
});

test('los símbolos son bien suaves: opacidad general de .65 o menos, sin desaparecer (mínimo .15)', () => {
  const svg = readFileSync(RUTA, 'utf8');
  const o = Number(svg.match(/<g class='mosaico' opacity='(0?\.\d+)'>/)[1]);
  assert.ok(o <= 0.65, `todavía muy opaco: ${o}`);
  assert.ok(o >= 0.15, `demasiado transparente: ${o}`);
});
