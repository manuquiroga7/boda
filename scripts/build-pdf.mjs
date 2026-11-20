// Genera assets/pdf/invitacion.pdf (sin fiesta) e invitacion-fiesta.pdf (con fiesta) a partir de assets/js/content.js.
// Uso: npm run build:pdf
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from 'pdf-lib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { content } from '../assets/js/content.js';
import { mapsUrl } from '../assets/js/links.js';
import { FIGURAS } from '../assets/js/vestimenta.js';

const hex = (h) => rgb(...[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255));
const COLORS = {
  crema: hex('#F6EEDF'),
  papel: hex('#FEFCF8'),
  beige: hex('#E4D3B8'),
  chocolate: hex('#5A3A33'),
  bordo: hex('#6E2B33'),
  verde: hex('#6F8164'),
  negro: rgb(0, 0, 0),
};

export function wrap(text, font, size, maxWidth) {
  const fits = (t) => font.widthOfTextAtSize(t, size) <= maxWidth;
  const lines = [];
  let line = '';
  const push = () => {
    if (line) lines.push(line);
    line = '';
  };
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (fits(next)) {
      line = next;
      continue;
    }
    push();
    if (fits(word)) {
      line = word;
      continue;
    }
    // Palabra más ancha que la línea (por ejemplo una URL): se corta por caracteres.
    for (const ch of word) {
      if (fits(line + ch)) line += ch;
      else {
        push();
        line = ch;
      }
    }
  }
  push();
  return lines;
}

// Huella de los datos que lleva el PDF. Se guarda dentro del archivo para que un test detecte
// si el PDF quedó desactualizado respecto de content.js.
export function pdfFingerprint(c) {
  const { names, surnames, dateISO, dateText } = c.couple; // las fotos no van en el PDF
  const { mapsApiKey, photos, ...event } = c.event; // ni la clave de mapas ni las fotos van en el PDF
  const data = { couple: { names, surnames, dateISO, dateText }, verse: c.verse, event, pdf: c.pdf };
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Enlace tocable sobre un rectángulo de la página.
function enlace(doc, page, x, y, w, h, url) {
  const ref = doc.context.register(
    doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [x, y, x + w, y + h], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) } }),
  );
  const anots = page.node.Annots() ?? doc.context.obj([]);
  anots.push(ref);
  page.node.set(PDFName.of('Annots'), anots);
}

// conFiesta: agrega la fiesta (hora, lugar y mapa). El PDF general no la lleva.
export async function buildPdf(c, conFiesta = false) {
  const doc = await PDFDocument.create();
  doc.setSubject(pdfFingerprint(c));
  doc.setTitle(`Invitación de boda · ${c.couple.names.join(' y ')}`);
  const W = 595;
  const H = 842;
  const page = doc.addPage([W, H]);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifIt = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const M = 64; // margen interior
  const maxW = W - 2 * M;

  // Hoja: papel crema con doble marco fino
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: COLORS.crema });
  page.drawRectangle({ x: 24, y: 24, width: W - 48, height: H - 48, borderColor: COLORS.beige, borderWidth: 1.8 });
  page.drawRectangle({ x: 32, y: 32, width: W - 64, height: H - 64, borderColor: COLORS.beige, borderWidth: 0.6 });

  let y = H - 70;
  const ancho = (t, font, size) => font.widthOfTextAtSize(t, size);
  // Texto centrado en [cx - w/2, cx + w/2]; devuelve cuánto bajó
  const centrado = (texto, font, size, color, cx = W / 2, w = maxW, interlineado = 1.25) => {
    let bajo = 0;
    for (const linea of wrap(texto, font, size, w)) {
      page.drawText(linea, { x: cx - ancho(linea, font, size) / 2, y: y - bajo - size, size, font, color });
      bajo += size * interlineado;
    }
    return bajo;
  };
  const bajar = (n) => { y -= n; };
  const filete = (largo = 70, grosor = 0.8) => {
    page.drawLine({ start: { x: W / 2 - largo / 2, y }, end: { x: W / 2 + largo / 2, y }, thickness: grosor, color: COLORS.beige });
  };

  // ---- Nombres y fecha ----
  const [n1, n2] = c.couple.names;
  const tam = 46;
  const enUnaLinea = ancho(n1, serif, tam) + ancho(n2, serif, tam) + 70 <= maxW;
  if (enUnaLinea) {
    const total = ancho(n1, serif, tam) + 58 + ancho(n2, serif, tam);
    let x = (W - total) / 2;
    page.drawText(n1, { x, y: y - tam, size: tam, font: serif, color: COLORS.chocolate });
    x += ancho(n1, serif, tam);
    page.drawText('&', { x: x + 29 - ancho('&', serifIt, 30) / 2, y: y - tam + 3, size: 30, font: serifIt, color: COLORS.bordo });
    x += 58;
    page.drawText(n2, { x, y: y - tam, size: tam, font: serif, color: COLORS.chocolate });
    bajar(tam * 1.15);
  } else {
    bajar(centrado(n1, serif, tam, COLORS.chocolate));
    bajar(centrado('&', serifIt, 28, COLORS.bordo));
    bajar(centrado(n2, serif, tam, COLORS.chocolate));
  }
  if (c.couple.surnames?.length) bajar(2 + centrado(c.couple.surnames.join('  ·  '), serifIt, 15, COLORS.bordo));
  bajar(12);
  bajar(centrado(c.couple.dateText, serif, 17, COLORS.chocolate));
  bajar(14);
  filete(90);
  bajar(18);

  // ---- Versículo ----
  bajar(centrado(c.verse.text, serifIt, 13, COLORS.chocolate, W / 2, maxW - 50, 1.35));
  bajar(7);
  bajar(centrado(c.verse.ref.toUpperCase(), sans, 8.5, COLORS.bordo));
  bajar(18);
  filete(90);
  bajar(20);

  // ---- Ceremonias: columnas Civil · Ceremonia · Fiesta ----
  const e = c.event;
  const bloques = [
    e.civil && { titulo: 'Civil', hora: e.civil.time, lugar: null, direccion: e.civil.address, query: e.civil.mapsQuery },
    { titulo: 'Ceremonia', hora: e.time, lugar: e.placeName, direccion: e.address, query: e.mapsQuery },
    conFiesta && e.party && { titulo: 'Fiesta', hora: e.party.time, lugar: e.party.placeName, direccion: e.party.address, query: e.party.mapsQuery },
  ].filter(Boolean);
  const colW = maxW / bloques.length;
  const arriba = y;
  let abajoMax = y;
  bloques.forEach((b, i) => {
    const cx = M + colW * i + colW / 2;
    const w = colW - 22;
    y = arriba;
    bajar(centrado(b.titulo, serifIt, 30, COLORS.bordo, cx, w, 1.1));
    bajar(8);
    bajar(centrado('HORA', sans, 7.5, COLORS.verde, cx, w) + 2);
    bajar(centrado(b.hora, serif, 17, COLORS.chocolate, cx, w) + 6);
    if (b.lugar || b.direccion) {
      bajar(centrado('LUGAR', sans, 7.5, COLORS.verde, cx, w) + 2);
      if (b.lugar) bajar(centrado(b.lugar, serif, 12.5, COLORS.chocolate, cx, w, 1.3) + 2);
      if (b.direccion) bajar(centrado(b.direccion, sans, 9, COLORS.chocolate, cx, w, 1.35) + 4);
    }
    if (b.query) {
      bajar(4);
      const etiqueta = 'Cómo llegar';
      const lw = ancho(etiqueta, sans, 9.5);
      page.drawText(etiqueta, { x: cx - lw / 2, y: y - 9.5, size: 9.5, font: sans, color: COLORS.bordo });
      page.drawLine({ start: { x: cx - lw / 2, y: y - 11.5 }, end: { x: cx + lw / 2, y: y - 11.5 }, thickness: 0.5, color: COLORS.bordo });
      enlace(doc, page, cx - lw / 2 - 4, y - 14, lw + 8, 16, mapsUrl(b.query));
      bajar(16);
    }
    abajoMax = Math.min(abajoMax, y);
  });
  // Líneas verticales finas entre columnas
  for (let i = 1; i < bloques.length; i++) {
    const x = M + colW * i;
    page.drawLine({ start: { x, y: arriba - 4 }, end: { x, y: abajoMax + 6 }, thickness: 0.6, color: COLORS.beige });
  }
  y = abajoMax - 16;
  filete(90);
  bajar(20);

  // ---- Vestimenta ----
  if (e.dressCode) {
    const d = e.dressCode;
    bajar(centrado('Vestimenta', serifIt, 30, COLORS.bordo, W / 2, maxW, 1.1));
    bajar(8);
    bajar(centrado(d.nota, serifIt, 11.5, COLORS.chocolate, W / 2, maxW - 90, 1.35) + 12);

    // Figuras en trazo fino (mismos dibujos que la web)
    const alto = 100;
    const esc = alto / 260;
    const figuras = [
      { f: FIGURAS.dama, texto: d.damas, cx: W / 2 - 92 },
      { f: FIGURAS.caballero, texto: d.caballeros, cx: W / 2 + 92 },
    ];
    for (const { f, texto, cx } of figuras) {
      const izq = cx - 60 * esc;
      const [ex, ey, rx, ry] = f.elipse;
      page.drawEllipse({ x: izq + ex * esc, y: y - ey * esc, xScale: rx * esc, yScale: ry * esc, borderColor: COLORS.chocolate, borderWidth: 0.7 });
      for (const trazo of f.trazos) {
        page.drawSvgPath(trazo, { x: izq, y, scale: esc, borderColor: COLORS.chocolate, borderWidth: 0.7 / esc });
      }
      const bajo = y - alto - 6;
      for (const [k, linea] of wrap(texto, serif, 11, 150).entries()) {
        page.drawText(linea, { x: cx - ancho(linea, serif, 11) / 2, y: bajo - 11 - k * 13, size: 11, font: serif, color: COLORS.chocolate });
      }
    }
    bajar(alto + 6 + 11 + 13 + 14);

    // Colores que no se pueden usar: círculos tachados en negro
    if (d.evitar?.length) {
      bajar(centrado('COLORES QUE NO SE PUEDEN USAR', sans, 7.5, COLORS.verde) + 8);
      const r = 12;
      const paso = 62;
      const x0 = W / 2 - (paso * (d.evitar.length - 1)) / 2;
      d.evitar.forEach((col, i) => {
        const cx = x0 + paso * i;
        const cy = y - r;
        page.drawCircle({ x: cx, y: cy, size: r, color: hex(col.color), borderColor: COLORS.negro, borderWidth: 1.1 });
        const a = { x: cx - r * 0.78, y: cy - r * 0.78 };
        const b = { x: cx + r * 0.78, y: cy + r * 0.78 };
        page.drawLine({ start: a, end: b, thickness: 3.4, color: COLORS.papel });
        page.drawLine({ start: a, end: b, thickness: 1.6, color: COLORS.negro });
        const t = col.nombre;
        page.drawText(t, { x: cx - ancho(t, sans, 8) / 2, y: cy - r - 11, size: 8, font: sans, color: COLORS.chocolate });
      });
      bajar(r * 2 + 18);
    }
  }

  return doc.save();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  mkdirSync('assets/pdf', { recursive: true });
  writeFileSync('assets/pdf/invitacion.pdf', await buildPdf(content));
  writeFileSync('assets/pdf/invitacion-fiesta.pdf', await buildPdf(content, true));
  console.log('assets/pdf/invitacion.pdf\nassets/pdf/invitacion-fiesta.pdf');
}
