// Lista privada de confirmados: pide la clave, la guarda solo en esta pestaña y consulta api/rsvp.
const $ = (id) => document.getElementById(id);
const API = '../api/rsvp';
let items = [];

const celda = (tr, texto, cls) => { const td = tr.insertCell(); td.textContent = texto; if (cls) td.className = cls; return td; };

function pintar(data) {
  items = data.items;
  const r = data.resumen;
  const res = $('resumen');
  res.replaceChildren();
  [['van', 'confirmaron'], ['noVan', 'no pueden'], ['personas', 'personas en total'], ['respuestas', 'respuestas']].forEach(([k, t]) => {
    const li = document.createElement('li');
    const b = document.createElement('b'); b.textContent = r[k];
    const s = document.createElement('span'); s.textContent = t;
    li.append(b, s); res.append(li);
  });
  const cuerpo = $('filas');
  cuerpo.replaceChildren();
  items.forEach((it) => {
    const tr = cuerpo.insertRow();
    celda(tr, it.nombre);
    celda(tr, it.asiste ? 'Sí' : 'No', it.asiste ? '' : 'no');
    celda(tr, it.asiste ? it.personas : '—');
    celda(tr, new Date(it.creado.replace(' ', 'T') + 'Z').toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' }));
    const td = tr.insertCell();
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Borrar';
    b.addEventListener('click', () => borrar(it));
    td.append(b);
  });
  $('datos').hidden = false;
}

async function pedir(opciones = {}, query = '') {
  const clave = sessionStorage.getItem('clave') ?? '';
  const r = await fetch(API + query, { ...opciones, headers: { Authorization: `Bearer ${clave}` } });
  if (r.status === 401) throw new Error('Clave incorrecta');
  if (!r.ok) throw new Error('No se pudo leer la lista');
  return r.json();
}

async function cargar() {
  $('estado').textContent = 'Cargando…';
  try {
    pintar(await pedir());
    $('estado').textContent = '';
    $('entrar').hidden = true;
  } catch (e) {
    sessionStorage.removeItem('clave');
    $('datos').hidden = true;
    $('entrar').hidden = false;
    $('estado').textContent = e.message;
  }
}

async function borrar(it) {
  if (!confirm(`¿Borrar la respuesta de ${it.nombre}?`)) return;
  try { await pedir({ method: 'DELETE' }, `?id=${it.id}`); await cargar(); } catch (e) { $('estado').textContent = e.message; }
}

const csvCelda = (v) => { let s = String(v); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
$('csv').addEventListener('click', () => {
  const filas = [['Nombre', 'Asiste', 'Personas', 'Fecha', 'Variante'], ...items.map((i) => [i.nombre, i.asiste ? 'Sí' : 'No', i.personas, i.creado, i.variante])];
  const blob = new Blob(['﻿' + filas.map((f) => f.map(csvCelda).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'confirmados.csv'; a.click();
  URL.revokeObjectURL(a.href);
});

$('entrar').addEventListener('submit', (e) => {
  e.preventDefault();
  sessionStorage.setItem('clave', $('clave').value);
  cargar();
});

if (sessionStorage.getItem('clave')) cargar();
