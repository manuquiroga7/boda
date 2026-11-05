const isText = (v) => typeof v === 'string' && v.trim() !== '';

export function validateContent(c) {
  const problems = [];
  const need = (ok, path) => {
    if (!ok) problems.push(`falta o está vacío: ${path}`);
  };

  need(Array.isArray(c?.couple?.names) && c.couple.names.length === 2 && c.couple.names.every(isText), 'couple.names');
  need(isText(c?.couple?.dateISO), 'couple.dateISO');
  need(isText(c?.couple?.dateText), 'couple.dateText');
  need(Array.isArray(c?.couple?.photos) && c.couple.photos.length >= 3, 'couple.photos');
  (c?.couple?.photos ?? []).forEach((p, i) => {
    need(isText(p?.src), `couple.photos[${i}].src`);
    need(isText(p?.alt), `couple.photos[${i}].alt`);
  });
  need(isText(c?.verse?.text), 'verse.text');
  need(isText(c?.verse?.ref), 'verse.ref');

  need(Array.isArray(c?.story) && c.story.length > 0, 'story');
  (c?.story ?? []).forEach((s, i) => {
    need(isText(s?.title), `story[${i}].title`);
    need(isText(s?.text), `story[${i}].text`);
    need(isText(s?.photo), `story[${i}].photo`);
    need(isText(s?.alt), `story[${i}].alt`);
  });

  for (const k of ['placeName', 'address', 'time', 'mapsQuery']) need(isText(c?.event?.[k]), `event.${k}`);
  need(isText(c?.rsvp?.whatsappNumber), 'rsvp.whatsappNumber');
  need(isText(c?.rsvp?.message), 'rsvp.message');
  need(isText(c?.special?.title), 'special.title');
  need(isText(c?.special?.message), 'special.message');
  need(isText(c?.music?.src), 'music.src');
  need(isText(c?.pdf?.src), 'pdf.src');
  return problems;
}
