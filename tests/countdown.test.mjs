import test from 'node:test';
import assert from 'node:assert/strict';
import { restante } from '../assets/js/countdown.js';

test('restante calcula días, horas, minutos y segundos', () => {
  const ahora = new Date('2027-03-18T14:58:55-03:00').getTime();
  assert.deepEqual(restante('2027-03-20T17:00:00-03:00', ahora), { dias: 2, horas: 2, minutos: 1, segundos: 5 });
});

test('restante no baja de cero después de la fecha', () => {
  assert.deepEqual(restante('2027-03-20T17:00:00-03:00', new Date('2028-01-01').getTime()), { dias: 0, horas: 0, minutos: 0, segundos: 0 });
});
