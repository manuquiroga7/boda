export function initReveal(root, observerFactory = globalThis.IntersectionObserver) {
  const items = root.querySelectorAll('.reveal');

  if (typeof observerFactory !== 'function') {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const docEl = (root.ownerDocument ?? root).documentElement;
  const observer = new observerFactory(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15 }
  );

  docEl.classList.add('js-reveal');
  items.forEach((el) => observer.observe(el));
}
