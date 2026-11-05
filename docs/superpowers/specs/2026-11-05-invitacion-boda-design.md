# Invitación de boda web — documento de diseño

Fecha: 2026-11-05

## Intención y por qué

Una invitación de casamiento web, cristiana, que se sienta como abrir una carta física y luego recorrer un "mini viaje": la historia de la pareja, cómo Dios los ayudó, y al final los datos prácticos. Debe sentirse **muy animada, muy "comfort" y muy suave**. Se publicará con dominio y hosting propios (aún sin elegir) y más adelante se le sumará una aplicación de galería compartida para una dinámica de la boda.

El foco actual es un **diseño y funcionamiento sólidos** con **textos de ejemplo**. Los textos reales se definen más adelante y se reemplazan antes de publicar. Una vez publicada, no se vuelve a tocar.

## Metas

- Experiencia de apertura: sobre cerrado con sello bordó; al tocar el sello se abre la solapa, sube la carta y la pantalla se desliza hacia el recorrido.
- Recorrido vertical con animaciones lentas y suaves al deslizar.
- Pensada primero para celular; también correcta en computadora.
- Música suave de fondo, con control visible para silenciar.
- Historia con fotos de la pareja y tono emotivo.
- Descarga de un PDF con todos los datos de la invitación.
- Una variante para damas de honor y testigos.
- Que cambiar textos y fotos antes de publicar sea fácil (todo el contenido en un solo lugar).

## No-metas

- No hay panel de administración ni edición posterior a la publicación.
- La galería de fotos con QR **no** se construye ahora (ver "Más adelante").
- No se elige hosting ni dominio ahora.

## Anti-metas (sería un fracaso aunque funcione)

- Que se sienta brusca, recargada, rápida o "de plantilla genérica".
- Que la música suene sola con volumen sin que la persona haya tocado nada, o que no se pueda silenciar.
- Que se vea mal o pese demasiado en un celular con conexión lenta.
- Que las animaciones marean o no se puedan reducir (respetar `prefers-reduced-motion`).

## Paleta y ambiente

Cálida. Crema y beige de base; marrón chocolate con ligero acento bordó como color fuerte (títulos, sello); verde de plantas como contraste. La decoración real de la boda lleva blanco, beige o crema, marrón bordó chocolatoso y verde de plantas.

Valores de referencia usados en las maquetas (ajustables por quien construya):

| Rol | Hex |
|---|---|
| Crema | `#F6EEDF` |
| Beige | `#E4D3B8` |
| Chocolate | `#5A3A33` |
| Bordó | `#6E2B33` |
| Verde | `#6F8164` |

Detalles decorativos: plantas verdes ilustradas que flotan despacio (en las maquetas son emojis de marcador, no el resultado final).

## Recorrido (de arriba a abajo)

1. **Sobre cerrado con sello bordó.** Al tocar el sello: se desvanece, se abre la solapa, sube la carta y la pantalla se desliza hacia abajo. Este toque es también el momento en que empieza la música (los navegadores bloquean el audio automático).
2. **Portada:** nombres y fecha *(idea de quien diseña, no dicha por la pareja)*.
3. **Versículo central.** Letra grande, mucho aire. Ejemplo: Eclesiastés 4:12, el cordón de tres dobleces.
4. **Nuestra historia y cómo Dios los ayudó.** Tono emotivo, con fotos de la pareja; los momentos van apareciendo al deslizar.
5. **Datos:** fecha, lugar, hora, con mapa y cómo llegar.
6. **Confirmar asistencia** *(idea de quien diseña)*: botón simple, por ejemplo hacia WhatsApp.
7. **Descargar PDF** con todos los datos de la invitación.

## Variante damas de honor y testigos

Mismo recorrido, más una sección con un **mensaje especial y una apreciación del rol importante** que esas personas tuvieron en la vida de la pareja. La pareja dijo que el mensaje es **igual para todos** (no personalizado por persona). Se interpreta como **una sola variante y un solo mensaje** para damas de honor y testigos. Si después quieren un texto distinto por grupo, se agrega un segundo bloque de contenido.

Acceso (decisión de quien diseña): una dirección propia, difícil de adivinar, sin enlaces desde la invitación general, con `noindex` para buscadores. No hay control de acceso real.

## Decisiones tomadas

De la pareja:
- Apertura tipo sobre con sello (elegida entre sobre, carta que se desdobla y telón).
- Estilo animado, comfort, muy suave.
- Música suave de fondo y fotos de ellos en la historia.
- Textos de ejemplo por ahora; reales después.
- Sin edición tras publicar.

Decisiones de quien diseña (la pareja puede cambiarlas):
- **Sitio estático** (HTML, CSS y JavaScript, sin frameworks): funciona en cualquier hosting y no requiere mantenimiento.
- Primero celular.
- Todo el contenido (textos, rutas de fotos, datos) concentrado en un único archivo de contenido.
- Carpeta del proyecto: `C:\wamp64\www\invitacion-boda` (movible).

## Decisiones de quien diseña tras la revisión (la pareja puede cambiarlas)

- **PDF:** un archivo fijo, generado una sola vez al final, cuando estén los textos reales. Contiene los datos prácticos (fecha, lugar, hora, enlace al mapa) y el versículo, no la historia completa. La pareja no lo regenera.
- **Música:** una pista libre de derechos como ejemplo, en bucle con entrada y salida suaves. Empieza al tocar el sello, también en la variante. El control para silenciar queda visible desde el sobre. La pareja elegirá la pista real y tendrá que confirmar que tiene licencia.
- **Confirmar asistencia:** un enlace simple a WhatsApp con número de ejemplo y mensaje prellenado. No hay formulario ni lista de confirmados.
- **Mapa:** una imagen estilizada con botón que abre Maps o Waze. Sin mapa embebido, para no sumar peso ni dependencias.
- **Peso y compatibilidad:** meta de menos de 3 MB antes de la música, con carga diferida de fotos y audio, y funcionamiento correcto en celulares de gama media.
- **Plantas:** ilustraciones SVG dibujadas por quien construye, no emojis.
- **Galería futura:** no aparece en la página publicada hasta que esté lista; solo se deja preparado el lugar en el código.

## Dejado a quien construye

- Cómo se hacen las animaciones (CSS, JS o una librería ligera), siempre que se vean suaves y funcionen en celulares de gama media.
- Cómo se genera el PDF (por ejemplo, un archivo pregenerado a partir de los mismos datos).
- Formato y compresión de fotos y de la música (peso razonable; la música debe poder cortarse).
- Textos, nombres, fecha, lugar y fotos de ejemplo.
- Cómo se organiza la variante (archivo aparte o parámetro), mientras el contenido compartido no se duplique a mano.

## Más adelante (fuera de este alcance)

Galería compartida: se accede por QR o link; cada persona puede subir hasta **20 fotos** a una biblioteca que la pareja luego descarga. Requiere hosting con algo de servidor y almacenamiento. La invitación debe dejar un lugar natural (sección y enlace) para sumarla después sin rehacerla.
