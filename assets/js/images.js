// Si una foto no carga, se oculta el ícono roto y queda el fondo beige de su marco.
export function guardImages(root) {
  root.querySelectorAll('img').forEach((img) => {
    const mark = () => img.classList.add('is-broken');
    img.addEventListener('error', mark);
    if (img.complete && img.naturalWidth === 0) mark();
  });
}
