import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { content } from '../assets/js/content.js';
import { buildPdf } from '../scripts/build-pdf.mjs';

test('buildPdf devuelve un PDF válido de una sola página', async () => {
  const bytes = await buildPdf(content);
  assert.equal(Buffer.from(bytes.slice(0, 4)).toString(), '%PDF');
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
});

test('buildPdf funciona con nombres largos y versículo largo', async () => {
  const c = structuredClone(content);
  c.couple.names = ['Maximiliano Alejandro', 'Ana Paula de los Ángeles'];
  c.verse.text = content.verse.text.repeat(3);
  const doc = await PDFDocument.load(await buildPdf(c));
  assert.equal(doc.getPageCount(), 1);
});

test('wrap parte las palabras más largas que el ancho disponible', async () => {
  const { wrap } = await import('../scripts/build-pdf.mjs');
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
  const lines = wrap('https://www.google.com/maps/search/?api=1&query=Iglesia%20de%20Ejemplo%2C%20Calle%20Ejemplo', font, 7, 200);
  assert.ok(lines.length > 1);
  for (const l of lines) assert.ok(font.widthOfTextAtSize(l, 7) <= 200, `línea demasiado ancha: ${l}`);
});

test('el PDF guardado corresponde al contenido actual (si cambia content.js hay que correr npm run build:pdf)', async () => {
  const { pdfFingerprint } = await import('../scripts/build-pdf.mjs');
  const { readFileSync } = await import('node:fs');
  const doc = await PDFDocument.load(readFileSync('assets/pdf/invitacion.pdf'));
  assert.equal(doc.getSubject(), pdfFingerprint(content));
});

test('la huella cambia cuando cambian fecha, lugar u hora', async () => {
  const { pdfFingerprint } = await import('../scripts/build-pdf.mjs');
  const c = structuredClone(content);
  c.event.time = '19:00 hs';
  assert.notEqual(pdfFingerprint(c), pdfFingerprint(content));
});
