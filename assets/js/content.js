// Único lugar del contenido de la invitación. Textos de ejemplo: reemplazar antes de publicar.
export const content = {
  couple: {
    names: ['Emanuel', 'Belén'],
    dateISO: '2027-03-20',
    dateText: 'Sábado 20 de marzo de 2027',
    photos: [
      { src: 'assets/img/pareja/foto-1.svg', alt: 'Emanuel y Belén juntos, sonriendo' },
      { src: 'assets/img/pareja/foto-2.svg', alt: 'Emanuel y Belén caminando de la mano' },
      { src: 'assets/img/pareja/foto-3.svg', alt: 'Emanuel y Belén abrazados' },
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
      photo: 'assets/img/story/momento-1.svg',
      alt: 'Foto de la pareja el día que se conocieron',
    },
    {
      title: 'Aprendimos a esperar',
      text: 'Hubo días difíciles y silencios largos. En cada uno de ellos Él nos sostuvo, nos enseñó a confiar y nos fue acercando.',
      photo: 'assets/img/story/momento-2.svg',
      alt: 'Foto de la pareja juntos en un momento de calma',
    },
    {
      title: 'Y dijimos que sí',
      text: 'Hoy queremos compartir contigo la alegría de empezar este camino, con Dios en el centro de nuestro hogar.',
      photo: 'assets/img/story/momento-3.svg',
      alt: 'Foto de la pareja el día del compromiso',
    },
  ],
  event: {
    placeName: 'Iglesia Cristo es la Respuesta',
    address: 'Burgues 3826, Montevideo',
    time: '17:00 hs',
    mapsQuery: 'Burgues 3826, Montevideo',
    dressCode: 'Elegante, en tonos tierra y verde',
    // Fotos de la sección "Te esperamos" (polaroids; reemplazar por las reales). Distintas de las de la portada.
    photos: [
      { src: 'assets/img/pareja/foto-4.svg', alt: 'Emanuel y Belén en un paseo' },
      { src: 'assets/img/pareja/foto-5.svg', alt: 'Emanuel y Belén riendo juntos' },
      { src: 'assets/img/pareja/foto-6.svg', alt: 'Emanuel y Belén en un momento especial' },
    ],
  },
  rsvp: {
    whatsappNumber: '+598 99 000 000',
    message: 'Hola, confirmo mi asistencia a la boda.',
  },
  special: {
    title: 'Para ti, que has sido parte de nuestra historia',
    message:
      'Gracias por el lugar tan importante que tienes en nuestras vidas. Tu cariño, tu apoyo y tu presencia han sido un regalo de Dios para nosotros. Por eso queremos que estés a nuestro lado en este día tan especial.',
  },
  music: { src: 'assets/audio/ambient.wav' },
  pdf: { src: 'assets/pdf/invitacion.pdf' },
};
