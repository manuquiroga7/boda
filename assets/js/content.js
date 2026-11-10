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
  story: [
    {
      title: 'Cuando nos conocimos',
      text: 'Nunca imaginamos que un día cualquiera iba a cambiarlo todo. Dios ya estaba escribiendo nuestra historia, aun cuando todavía no lo sabíamos.',
      photo: 'assets/img/story/historia-1.jpg',
      alt: 'Emanuel y Belén sonriendo en un selfie al aire libre, en un parque',
      focus: '50% 8%',
    },
    {
      title: 'Aprendimos a esperar',
      text: 'Hubo días difíciles y silencios largos. En cada uno de ellos Él nos sostuvo, nos enseñó a confiar y nos fue acercando.',
      photo: 'assets/img/story/historia-2.jpg',
      alt: 'Emanuel y Belén de pie, abrazados, en un hall',
      focus: '50% 25%',
    },
    {
      title: 'Y dijimos que sí',
      text: 'Hoy queremos compartir contigo la alegría de empezar este camino, con Dios en el centro de nuestro hogar.',
      photo: 'assets/img/story/historia-3.jpg',
      alt: 'Belén sonriendo y mostrando su anillo en un jardín',
      focus: '50% 22%',
    },
  ],
  event: {
    placeName: 'Iglesia Cristo es la Respuesta',
    address: 'Burgues 3826, Montevideo',
    time: '17:00 hs',
    mapsQuery: 'Burgues 3826, Montevideo',
    dressCode: 'Elegante, en tonos tierra y verde',
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
    message:
      'Gracias por el lugar tan importante que tienes en nuestras vidas. Tu cariño, tu apoyo y tu presencia han sido un regalo de Dios para nosotros. Por eso queremos que estés a nuestro lado en este día tan especial.',
  },
  // Video de fondo de "¿Nos acompañas?" (assets/video/). Sin foto de respaldo: mientras carga se ve el papel.
  video: { src: 'assets/video/nosotros.mp4', focus: '50% 22%', speed: 0.6 },
  music: { src: 'assets/audio/ambient.mp3' },
  pdf: { src: 'assets/pdf/invitacion.pdf' },
};
