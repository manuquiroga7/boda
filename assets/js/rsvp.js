// Confirmación de asistencia dentro de la web: envía el formulario al Worker (POST api/rsvp).
export function datosDelFormulario(form) {
  const f = new FormData(form);
  const asiste = f.get('asiste') === 'si';
  return {
    nombre: String(f.get('nombre') ?? '').trim(),
    asiste,
    personas: asiste ? Number(f.get('personas')) || 1 : 0,
    web: String(f.get('web') ?? ''),
  };
}

export function iniciarRsvp(root, variante = 'general') {
  root.querySelectorAll('form.rsvp').forEach((form) => {
    const msg = form.querySelector('.rsvp__msg');
    const boton = form.querySelector('button[type="submit"]');
    const personas = form.querySelector('.rsvp__personas');
    const sync = () => { personas.hidden = form.elements.asiste.value === 'no'; };
    form.addEventListener('change', sync);
    sync();

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const datos = datosDelFormulario(form);
      if (datos.nombre.length < 2) {
        msg.textContent = 'Escribe tu nombre para confirmar.';
        form.elements.nombre.focus();
        return;
      }
      boton.disabled = true;
      msg.textContent = 'Enviando…';
      try {
        const r = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...datos, variante }),
        });
        if (!r.ok) throw new Error(String(r.status));
        form.innerHTML = `<p class="rsvp__gracias" role="status">${
          datos.asiste ? '¡Gracias por confirmar! Nos alegra mucho que nos acompañes.' : 'Gracias por avisarnos. Te vamos a extrañar.'
        }</p>`;
      } catch {
        boton.disabled = false;
        msg.textContent = 'No pudimos enviar tu respuesta. Inténtalo de nuevo en un momento.';
      }
    });
  });
}
