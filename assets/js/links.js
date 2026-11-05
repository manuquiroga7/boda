export function whatsappUrl(number, message) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Mapa incrustado de Google. Sin clave usa el incrustado público; con clave (event.mapsApiKey) usa el Embed API oficial.
export function mapsEmbedUrl(query, apiKey) {
  const q = encodeURIComponent(query);
  return apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${q}`
    : `https://www.google.com/maps?q=${q}&output=embed`;
}
