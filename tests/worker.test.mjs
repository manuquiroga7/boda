import test from 'node:test';
import assert from 'node:assert/strict';
import { manejarRsvp, validarRsvp, claveCorrecta } from '../worker/rsvp.js';

// D1 simulada en memoria: solo entiende las consultas que usa el Worker.
function fakeDB() {
  const filas = [];
  let id = 0;
  return {
    filas,
    prepare(sql) {
      let args = [];
      const st = {
        bind: (...a) => { args = a; return st; },
        async run() {
          if (/^INSERT/.test(sql)) filas.push({ id: ++id, nombre: args[0], asiste: args[1], personas: args[2], variante: args[3], creado: '2027-01-01 10:00:00' });
          if (/^DELETE/.test(sql)) { const i = filas.findIndex((f) => f.id === args[0]); if (i >= 0) filas.splice(i, 1); }
          return {};
        },
        async all() { return { results: [...filas].reverse() }; },
      };
      return st;
    },
  };
}
const post = (body, extra = {}) => new Request('https://x.test/api/rsvp', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), ...extra });
const get = (clave, method = 'GET', q = '') => new Request('https://x.test/api/rsvp' + q, { method, headers: clave ? { Authorization: `Bearer ${clave}` } : {} });

test('validarRsvp acepta una confirmación y limpia el nombre', () => {
  assert.deepEqual(validarRsvp({ nombre: '  Ana   Pérez ', asiste: true, personas: 2 }).valor, { nombre: 'Ana Pérez', asiste: true, personas: 2, variante: 'general' });
});
test('validarRsvp: quien no asiste cuenta 0 personas', () => {
  assert.equal(validarRsvp({ nombre: 'Ana', asiste: false, personas: 5 }).valor.personas, 0);
});
test('validarRsvp rechaza nombre corto, asiste ausente y cantidades inválidas', () => {
  for (const b of [null, { nombre: 'A', asiste: true, personas: 1 }, { nombre: 'Ana', personas: 1 }, { nombre: 'Ana', asiste: true, personas: 0 }, { nombre: 'Ana', asiste: true, personas: 11 }, { nombre: 'x'.repeat(81), asiste: true, personas: 1 }]) {
    assert.ok(validarRsvp(b).error, JSON.stringify(b));
  }
});

test('POST guarda la confirmación y GET con clave la lista con el resumen', async () => {
  const env = { DB: fakeDB(), ADMIN_KEY: 'secreta' };
  assert.equal((await manejarRsvp(post({ nombre: 'Ana', asiste: true, personas: 3 }), env)).status, 201);
  assert.equal((await manejarRsvp(post({ nombre: 'Luis', asiste: false }), env)).status, 201);
  const data = await (await manejarRsvp(get('secreta'), env)).json();
  assert.deepEqual(data.resumen, { respuestas: 2, van: 1, noVan: 1, personas: 3 });
  assert.equal(data.items[0].nombre, 'Luis');
});

test('la lista exige la clave correcta, también si no hay clave configurada', async () => {
  const env = { DB: fakeDB(), ADMIN_KEY: 'secreta' };
  assert.equal((await manejarRsvp(get(), env)).status, 401);
  assert.equal((await manejarRsvp(get('otra'), env)).status, 401);
  assert.equal((await manejarRsvp(get('secreta'), { DB: fakeDB() })).status, 401);
  assert.equal((await manejarRsvp(get('', 'DELETE', '?id=1'), env)).status, 401);
});

test('DELETE borra una respuesta con la clave', async () => {
  const env = { DB: fakeDB(), ADMIN_KEY: 'k' };
  await manejarRsvp(post({ nombre: 'Ana', asiste: true, personas: 1 }), env);
  assert.equal((await manejarRsvp(get('k', 'DELETE', '?id=1'), env)).status, 200);
  assert.equal(env.DB.filas.length, 0);
});

test('el campo trampa, el JSON roto y los cuerpos enormes no guardan nada', async () => {
  const env = { DB: fakeDB(), ADMIN_KEY: 'k' };
  await manejarRsvp(post({ nombre: 'Bot', asiste: true, personas: 1, web: 'http://spam' }), env);
  assert.equal((await manejarRsvp(post('{no es json'), env)).status, 400);
  assert.equal((await manejarRsvp(post('x'.repeat(5000)), env)).status, 413);
  assert.equal(env.DB.filas.length, 0);
});

test('sin base de datos configurada responde 503 y otros métodos 405', async () => {
  assert.equal((await manejarRsvp(post({}), {})).status, 503);
  assert.equal((await manejarRsvp(new Request('https://x.test/api/rsvp', { method: 'PUT' }), { DB: fakeDB() })).status, 405);
});

test('claveCorrecta compara con exactitud', async () => {
  assert.equal(await claveCorrecta('abc', 'abc'), true);
  assert.equal(await claveCorrecta('abd', 'abc'), false);
  assert.equal(await claveCorrecta('', 'abc'), false);
});
