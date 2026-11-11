const isText = (v) => typeof v === 'string' && v.trim() !== '';

export function validateContent(c) {
  const problems = [];
  const need = (ok, path) => {
    if (!ok) problems.push(`falta o está vacío: ${path}`);
  };

  need(Array.isArray(c?.couple?.names) && c.couple.names.length === 2 && c.couple.names.every(isText), 'couple.names');
  need(isText(c?.couple?.dateISO), 'couple.dateISO');
  need(isText(c?.couple?.dateText), 'couple.dateText');
  need(Array.isArray(c?.couple?.photos) && c.couple.photos.length >= 1, 'couple.photos');
  (c?.couple?.photos ?? []).forEach((p, i) => {
    need(isText(p?.src), `couple.photos[${i}].src`);
    need(isText(p?.alt), `couple.photos[${i}].alt`);
  });
  need(isText(c?.verse?.text), 'verse.text');
  need(isText(c?.verse?.ref), 'verse.ref');

  need(Array.isArray(c?.event?.photos) && c.event.photos.length >= 3, 'event.photos');
  (c?.event?.photos ?? []).forEach((p, i) => {
    need(isText(p?.src), `event.photos[${i}].src`);
    need(isText(p?.alt), `event.photos[${i}].alt`);
  });
  need(isText(c?.rsvp?.endpoint), 'rsvp.endpoint');
  need(isText(c?.special?.title), 'special.title');
  need(isText(c?.special?.message), 'special.message');
  need(isText(c?.video?.src), 'video.src');
  need(isText(c?.music?.src), 'music.src');
  need(isText(c?.pdf?.src), 'pdf.src');
  return problems;
}
