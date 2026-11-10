// Lógica de las confirmaciones: validación, guardado en D1 y lista protegida con clave.
const MAX_BYTES = 2048;

export function validarRsvp(b) {
  if (!b || typeof b !== 'object') return { error: 'Datos inválidos' };
  const nombre = typeof b.nombre === 'string' ? b.nombre.trim().replace(/\s+/g, ' ') : '';
  if (nombre.length < 2 || nombre.length > 80) return { error: 'Nombre inválido' };
  if (typeof b.asiste !== 'boolean') return { error: 'Falta indicar si asiste' };
  let personas = 0;
  if (b.asiste) {
    personas = Number(b.personas);
    if (!Number.isInteger(personas) || personas < 1 || personas > 10) return { error: 'Cantidad inválida' };
  }
  const variante = b.variante === 'especial' ? 'especial' : 'general';
  return { valor: { nombre, asiste: b.asiste, personas, variante } };
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

let tablaLista = false;
async function asegurarTabla(db) {
  if (tablaLista) return;
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS confirmaciones (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, asiste INTEGER NOT NULL, personas INTEGER NOT NULL, variante TEXT NOT NULL, creado TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'
    )
    .run();
  tablaLista = true;
}

// Compara claves sin filtrar información por tiempo: se comparan los hashes, siempre de igual largo.
export async function claveCorrecta(recibida, esperada) {
  if (!esperada || !recibida) return false;
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(recibida)),
    crypto.subtle.digest('SHA-256', enc.encode(esperada)),
  ]);
  const a = new Uint8Array(x), c = new Uint8Array(y);
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ c[i];
  return d === 0;
}

async function autorizado(req, env) {
  const m = /^Bearer (.+)$/.exec(req.headers.get('Authorization') ?? '');
  return claveCorrecta(m?.[1], env.ADMIN_KEY);
}

export async function manejarRsvp(req, env) {
  if (!env.DB) return json({ error: 'Base de datos no configurada' }, 503);
  await asegurarTabla(env.DB);

  if (req.method === 'POST') {
    const texto = await req.text();
    if (texto.length > MAX_BYTES) return json({ error: 'Demasiado grande' }, 413);
    let body;
    try { body = JSON.parse(texto); } catch { return json({ error: 'Datos inválidos' }, 400); }
    if (body?.web) return json({ ok: true }); // trampa para bots: se ignora sin guardar
    const { valor, error } = validarRsvp(body);
    if (error) return json({ error }, 400);
    await env.DB.prepare('INSERT INTO confirmaciones (nombre, asiste, personas, variante) VALUES (?1, ?2, ?3, ?4)')
      .bind(valor.nombre, valor.asiste ? 1 : 0, valor.personas, valor.variante)
      .run();
    return json({ ok: true }, 201);
  }

  if (req.method === 'GET' || req.method === 'DELETE') {
    if (!(await autorizado(req, env))) return json({ error: 'No autorizado' }, 401);
    if (req.method === 'DELETE') {
      const id = Number(new URL(req.url).searchParams.get('id'));
      if (!Number.isInteger(id)) return json({ error: 'Id inválido' }, 400);
      await env.DB.prepare('DELETE FROM confirmaciones WHERE id = ?1').bind(id).run();
      return json({ ok: true });
    }
    const { results } = await env.DB.prepare('SELECT id, nombre, asiste, personas, variante, creado FROM confirmaciones ORDER BY id DESC').all();
    const items = results.map((r) => ({ ...r, asiste: !!r.asiste }));
    return json({
      items,
      resumen: {
        respuestas: items.length,
        van: items.filter((r) => r.asiste).length,
        noVan: items.filter((r) => !r.asiste).length,
        personas: items.reduce((s, r) => s + (r.asiste ? r.personas : 0), 0),
      },
    });
  }

  return json({ error: 'Método no permitido' }, 405);
}
