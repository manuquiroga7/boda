import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsappUrl, mapsUrl } from '../assets/js/links.js';

test('whatsappUrl deja solo dígitos en el número y codifica el mensaje', () => {
  assert.equal(
    whatsappUrl('+598 99 123 456', 'Hola & gracias'),
    'https://wa.me/59899123456?text=Hola%20%26%20gracias'
  );
});

test('mapsUrl codifica la consulta', () => {
  assert.equal(
    mapsUrl('Iglesia Central, Montevideo'),
    'https://www.google.com/maps/search/?api=1&query=Iglesia%20Central%2C%20Montevideo'
  );
});

import { mapsEmbedUrl } from '../assets/js/links.js';

test('mapsEmbedUrl sin clave usa el incrustado público', () => {
  assert.equal(
    mapsEmbedUrl('Burgues 3826, Montevideo'),
    'https://www.google.com/maps?q=Burgues%203826%2C%20Montevideo&output=embed'
  );
});

test('mapsEmbedUrl con clave usa el Embed API oficial', () => {
  assert.equal(
    mapsEmbedUrl('Burgues 3826, Montevideo', 'ABC123'),
    'https://www.google.com/maps/embed/v1/place?key=ABC123&q=Burgues%203826%2C%20Montevideo'
  );
});
