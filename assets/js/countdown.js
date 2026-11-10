// Contador regresivo hasta la ceremonia. 'inicio' es la fecha y hora en formato ISO con zona horaria.
export function restante(inicio, ahora = Date.now()) {
  let s = Math.max(0, Math.floor((new Date(inicio).getTime() - ahora) / 1000));
  const dias = Math.floor(s / 86400); s -= dias * 86400;
  const horas = Math.floor(s / 3600); s -= horas * 3600;
  const minutos = Math.floor(s / 60);
  return { dias, horas, minutos, segundos: s - minutos * 60 };
}

export function iniciarContador(root) {
  root.querySelectorAll('.contador').forEach((el) => {
    const inicio = el.dataset.inicio;
    if (Number.isNaN(new Date(inicio).getTime())) { el.hidden = true; return; }
    const campos = {};
    ['dias', 'horas', 'minutos', 'segundos'].forEach((k) => { campos[k] = el.querySelector(`[data-u="${k}"]`); });
    const pintar = () => {
      const r = restante(inicio);
      for (const k in campos) campos[k].textContent = String(r[k]).padStart(2, '0');
      if (r.dias + r.horas + r.minutos + r.segundos === 0) { clearInterval(id); el.classList.add('is-listo'); }
    };
    const id = setInterval(pintar, 1000);
    pintar();
  });
}
