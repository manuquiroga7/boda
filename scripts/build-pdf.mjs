// Genera assets/pdf/invitacion.pdf una sola vez, a partir de assets/js/content.js.
// Uso: npm run build:pdf
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { content } from '../assets/js/content.js';
import { mapsUrl } from '../assets/js/links.js';

const hex = (h) => rgb(...[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255));
const COLORS = {
  crema: hex('#F6EEDF'),
  beige: hex('#E4D3B8'),
  chocolate: hex('#5A3A33'),
  bordo: hex('#6E2B33'),
  verde: hex('#6F8164'),
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
  const { names, dateISO, dateText } = c.couple; // las fotos no van en el PDF
  const { mapsApiKey, photos, ...event } = c.event; // ni la clave de mapas ni las fotos van en el PDF
  const data = { couple: { names, dateISO, dateText }, verse: c.verse, event, pdf: c.pdf };
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

export async function buildPdf(c) {
  const doc = await PDFDocument.create();
  doc.setSubject(pdfFingerprint(c));
  const page = doc.addPage([420, 595]);
  const { width, height } = page.getSize();
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifIt = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const maxW = width - 110;

  page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.crema });
  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: COLORS.beige, borderWidth: 1.5 });

  let y = height - 80;
  const center = (text, font, size, color, gap = 0) => {
    for (const line of wrap(text, font, size, maxW)) {
      y -= size;
      page.drawText(line, { x: (width - font.widthOfTextAtSize(line, size)) / 2, y, size, font, color });
      y -= size * 0.35;
    }
    y -= gap;
  };

  center('CON LA BENDICIÓN DE DIOS', sans, 8, COLORS.verde, 10);
  center(c.couple.names[0], serif, 34, COLORS.chocolate);
  center('&', serifIt, 22, COLORS.bordo);
  center(c.couple.names[1], serif, 34, COLORS.chocolate, 6);
  center(c.couple.dateText, serif, 15, COLORS.chocolate, 18);

  center(c.verse.text, serifIt, 12, COLORS.chocolate, 2);
  center(c.verse.ref.toUpperCase(), sans, 8, COLORS.bordo, 18);

  const e = c.event;
  center('HORA', sans, 7.5, COLORS.verde);
  center(e.time, serif, 13, COLORS.chocolate, 4);
  center('LUGAR', sans, 7.5, COLORS.verde);
  center(e.placeName, serif, 13, COLORS.chocolate);
  center(e.address, sans, 9.5, COLORS.chocolate, 4);
  if (e.dressCode) {
    center('VESTIMENTA', sans, 7.5, COLORS.verde);
    center(e.dressCode, serif, 12, COLORS.chocolate, 4);
  }
  center('MAPA', sans, 7.5, COLORS.verde);
  center(mapsUrl(e.mapsQuery), sans, 7, COLORS.bordo);

  return doc.save();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  mkdirSync('assets/pdf', { recursive: true });
  writeFileSync('assets/pdf/invitacion.pdf', await buildPdf(content));
  console.log('assets/pdf/invitacion.pdf');
}
