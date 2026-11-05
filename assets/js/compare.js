// Selector temporal para comparar las tres portadas (se activa con ?comparar=1 en la dirección).
export function mountCompare(doc, actual, onChange) {
  const nav = doc.createElement('nav');
  nav.className = 'comparar';
  nav.setAttribute('aria-label', 'Comparar portadas');
  nav.innerHTML =
    '<span>Portada</span>' +
    ['a', 'b', 'c']
      .map((e) => `<button type="button" data-estilo="${e}" aria-pressed="${e === actual}">${e.toUpperCase()}</button>`)
      .join('');
  nav.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-estilo]');
    if (!btn) return;
    nav.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    onChange(btn.dataset.estilo);
  });
  doc.body.append(nav);
  return nav;
}
