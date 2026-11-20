// Único lugar del contenido de la invitación. Textos de ejemplo: reemplazar antes de publicar.
export const content = {
  couple: {
    names: ['Emanuel', 'Belén'],
    surnames: ['Quiroga', 'Medina'], // se muestran en cursiva bajo los nombres (opcional)
    dateISO: '2027-03-20',
    dateText: 'Sábado 20 de marzo de 2027',
    // Foto de la portada. La portada A y la C usan la primera; la B usa hasta tres (si hay menos, repite).
    // 'focus' es el punto de la foto que no debe cortarse al recortarla (object-position).
    photos: [
      { src: 'assets/img/pareja/portada.jpg', alt: 'Emanuel y Belén abrazados, vestidos de gala, en blanco y negro', focus: '50% 22%' },
    ],
  },
  verse: {
    text: 'Y si alguno prevaleciere contra uno, dos le resistirán; y cordón de tres dobleces no se rompe pronto.',
    ref: 'Eclesiastés 4:12',
  },
  event: {
    placeName: 'Iglesia Cristo es la Respuesta',
    address: 'Burgues 3826, Montevideo',
    time: '19:30 hs',
    mapsQuery: 'Burgues 3826, Montevideo',
    // Vestimenta: nota, leyendas de las dos figuras y colores que no se pueden usar
    dressCode: {
      nota: 'Vestimenta formal. Nos reservamos el blanco, o tonos asemejados, para la novia.',
      damas: 'Damas de vestido largo',
      caballeros: 'Caballeros de traje',
      evitar: [
        { nombre: 'Blanco', color: '#FFFFFF' },
        { nombre: 'Beige', color: '#E4D3B8' },
        { nombre: 'Marrón', color: '#8B5A3C' },
        { nombre: 'Crema', color: '#F6EEDF' },
        { nombre: 'Café', color: '#5A3A28' },
      ],
    },
    // Ceremonia civil (mismo día). 'address' es opcional.
    civil: { time: '15:00 hs', placeName: 'Registro Civil', mapsQuery: 'Registro Civil, Montevideo, Uruguay' },
    // Fiesta (mismo día): solo la ven las variantes "fiesta" y "especial". 'placeName', 'address' y
    // 'mapsQuery' son opcionales: sin 'mapsQuery' no se muestra el mapa.
    party: {
      time: '21:30 hs',
      address: 'Gibraltar y Av. Carlos María Ramírez, Montevideo',
      mapsQuery: '-34.8759109,-56.2643702', // el punto exacto del link de Maps
    },
    // Fotos de la sección "Te esperamos" (polaroids). Distintas de las de la portada.
    photos: [
      { src: 'assets/img/pareja/polaroid-1.jpg', alt: 'Emanuel y Belén sentados en un restaurante, sonriendo', focus: '45% 50%' },
      { src: 'assets/img/pareja/polaroid-2.jpg', alt: 'Emanuel y Belén en un selfie, paseando por un jardín', focus: '65% 50%' },
      { src: 'assets/img/pareja/polaroid-3.jpg', alt: 'Emanuel y Belén de pie, abrazados, en un hall', focus: '50% 10%' },
    ],
  },
  rsvp: {
    endpoint: 'api/rsvp', // Worker de Cloudflare que guarda las confirmaciones (ver worker/)
  },
  special: {
    title: 'Para ti, que has sido parte de nuestra historia',
    highlight: 'nuestra historia', // parte del título que se muestra en cursiva (opcional)
    message:
      'Gracias por el lugar tan importante que tienes en nuestras vidas. Tu cariño, tu apoyo y tu presencia han sido un regalo de Dios para nosotros. Por eso queremos que estés a nuestro lado en este día tan especial.',
  },
  // Video de fondo de "¿Nos acompañas?" (assets/video/). Sin foto de respaldo: mientras carga se ve el papel.
  video: { src: 'assets/video/nosotros.mp4', focus: '50% 22%', speed: 0.6 },
  music: { src: 'assets/audio/ambient.mp3' },
  // PDF sin fiesta (variante general) y con fiesta (variantes "fiesta" y "especial")
  pdf: { src: 'assets/pdf/invitacion.pdf', srcFiesta: 'assets/pdf/invitacion-fiesta.pdf' },
};
