# Invitación de boda web — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una invitación de boda web estática, con apertura de sobre con sello, recorrido vertical animado, música suave, PDF descargable y una variante para damas de honor y testigos.

**Architecture:** Sitio estático sin frameworks ni paso de compilación para el navegador. Todo el contenido vive en un único módulo `content.js`; un renderizador lo convierte en secciones HTML, y módulos pequeños manejan sobre, música y animaciones al deslizar. La variante usa el mismo código con otro mensaje.

**Tech Stack:** HTML, CSS, JavaScript (módulos ES). Node 20+ solo para pruebas (`node:test`) y para generar el PDF una vez (`pdf-lib`, dependencia de desarrollo). Verificación visual con Playwright.

**Spec:** `docs/superpowers/specs/2026-11-05-invitacion-boda-design.md`

## Global Constraints

- Sitio estático: HTML, CSS y JavaScript sin frameworks; funciona en cualquier hosting.
- Primero celular (probar a 375 px), correcto también en escritorio.
- Paleta: crema `#F6EEDF`, beige `#E4D3B8`, chocolate `#5A3A33`, bordó `#6E2B33`, verde `#6F8164`.
- Estilo: animado, comfort, muy suave; animaciones lentas. Respetar `prefers-reduced-motion`.
- Peso total menor a 3 MB sin contar la música; fotos y audio con carga diferida.
- La música empieza solo al tocar el sello, tiene control visible para silenciar desde el sobre, y se repite con entrada y salida suaves.
- Todo el contenido (textos, rutas de fotos, datos) en un único archivo: `assets/js/content.js`.
- Textos de ejemplo; versículo de ejemplo Eclesiastés 4:12 ("cordón de tres dobleces"); historia en tono emotivo.
- Variante damas/testigos: un solo mensaje para ambos grupos, dirección difícil de adivinar, `noindex`, sin enlaces desde la invitación general, sin control de acceso real.
- Confirmar asistencia: enlace `wa.me` con número de ejemplo y mensaje prellenado; sin formulario.
- Mapa: imagen estilizada con botón que abre Maps o Waze; sin iframe.
- Plantas: ilustraciones SVG propias, no emojis.
- PDF: archivo fijo generado una vez; lleva fecha, lugar, hora, enlace de mapa y versículo, no la historia.
- La galería de fotos (QR, 20 fotos por persona) no se construye ni aparece; solo se deja el lugar en el código con un comentario.

## Review Focus

- Navegador que bloquea o falla al reproducir audio, o el archivo de audio no carga: la invitación debe seguir funcionando y el botón mostrar silenciado.
- Una foto de la historia que no carga: no se ve un ícono roto; la sección sigue legible.
- Pantalla muy angosta (320 px) y nombres largos: sin desbordes ni texto cortado.
- JavaScript desactivado o falla del módulo: la persona ve al menos los datos esenciales (fecha, lugar, hora) en un bloque de respaldo.
- Recargar la página o volver atrás después de abrir el sobre: no queda en un estado roto (vuelve a mostrar el sobre o salta directo al contenido, sin música duplicada).

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Página general; contenedor vacío más bloque de respaldo `<noscript>`. |
| `para-ti-k7q2/index.html` | Página de la variante (mismo código, `data-variant="especial"`, `noindex`). |
| `assets/js/content.js` | Único lugar del contenido. |
| `assets/js/validate.js` | `validateContent`: revisa que el contenido esté completo. |
| `assets/js/links.js` | `whatsappUrl`, `mapsUrl`: funciones puras. |
| `assets/js/render.js` | `renderPage`: arma las secciones a partir del contenido. |
| `assets/js/envelope.js` | Apertura del sobre y transición. |
| `assets/js/music.js` | Control de la música. |
| `assets/js/reveal.js` | Aparición suave al deslizar. |
| `assets/js/main.js` | Une todo al cargar. |
| `assets/css/base.css`, `envelope.css`, `sections.css` | Tokens de la paleta, sobre, secciones. |
| `assets/img/plants/*.svg`, `assets/img/story/*`, `assets/img/map.svg` | Ilustraciones y fotos de ejemplo. |
| `assets/audio/ambient.mp3` y `LICENSE.txt` | Pista libre de derechos de ejemplo y su origen. |
| `scripts/build-pdf.mjs` | Genera `assets/pdf/invitacion.pdf`. |
| `tests/*.test.mjs` | Pruebas con `node:test`. |

---

### Task 1: Base del proyecto, contenido y enlaces

**Files:**
- Create: `package.json`, `.gitignore` (incluye `.superpowers/` y `node_modules/`), `assets/js/content.js`, `assets/js/validate.js`, `assets/js/links.js`
- Test: `tests/content.test.mjs`, `tests/links.test.mjs`

**Interfaces:**
- Produces:
  - `content` (export nombrado de `content.js`) con esta forma: `{ couple: { names: [string, string], dateISO: string, dateText: string }, verse: { text: string, ref: string }, story: [{ title: string, text: string, photo: string, alt: string }], event: { placeName: string, address: string, time: string, mapsQuery: string, dressCode?: string }, rsvp: { whatsappNumber: string, message: string }, special: { title: string, message: string }, music: { src: string }, pdf: { src: string } }`
  - `validateContent(content: object): string[]` — lista de problemas; vacía si todo está bien.
  - `whatsappUrl(number: string, message: string): string` — `https://wa.me/<solo dígitos>?text=<mensaje codificado>`
  - `mapsUrl(query: string): string` — `https://www.google.com/maps/search/?api=1&query=<codificado>`

- [ ] **Step 1: `git init`, crear `package.json` (`"type": "module"`, script `test` = `node --test tests/`) y `.gitignore`.**
- [ ] **Step 2: Escribir tests que fallan.** `content.test.mjs`: `validateContent(content)` devuelve `[]` con el contenido de ejemplo; devuelve un problema cuando falta `couple.names`, cuando `story` está vacío y cuando una entrada de `story` no tiene `alt`. `links.test.mjs`: `whatsappUrl("+598 99 123 456", "Hola & gracias")` es `https://wa.me/59899123456?text=Hola%20%26%20gracias`; `mapsUrl("Iglesia Central, Montevideo")` codifica la consulta.
- [ ] **Step 3: Ejecutar `npm test`; esperado: falla porque los módulos no existen.**
- [ ] **Step 4: Implementar los tres módulos.** El contenido de ejemplo incluye el versículo de Eclesiastés 4:12 (RVR1960) y 3 momentos de historia con texto emotivo de ejemplo y fotos en `assets/img/story/`.
- [ ] **Step 5: Ejecutar `npm test`; esperado: pasa todo.**
- [ ] **Step 6: Commit** `feat: base, contenido de ejemplo y enlaces`.

### Task 2: Estilos base y renderizado de secciones

**Files:**
- Create: `index.html`, `assets/css/base.css`, `assets/css/sections.css`, `assets/js/render.js`, `assets/js/main.js`, `assets/img/map.svg`, fotos de ejemplo en `assets/img/story/`
- Test: `tests/render.test.mjs`

**Interfaces:**
- Consumes: `content`, `whatsappUrl`, `mapsUrl`.
- Produces: `renderPage(content: object, variant: "general" | "especial"): string` — HTML de las secciones en orden: portada, versículo, historia, datos, confirmar asistencia, descarga de PDF; si la variante es `especial`, agrega la sección del mensaje especial después del versículo. Cada sección lleva `<section id="…" class="reveal">`. Las fotos usan `loading="lazy"` y `alt`. Deja un comentario HTML `<!-- futuro: galería -->` donde iría la galería.

- [ ] **Step 1: Tests que fallan.** El HTML de `renderPage(content, "general")` contiene, en orden, los ids `portada`, `versiculo`, `historia`, `datos`, `asistencia`, `pdf`; no contiene `especial`. Con `"especial"` contiene el id `especial` justo después de `versiculo`. Todas las `<img>` de la historia tienen `loading="lazy"` y `alt` no vacío. El enlace de asistencia empieza con `https://wa.me/`. No aparece ningún `<iframe>`.
- [ ] **Step 2: Ejecutar; esperado: falla.**
- [ ] **Step 3: Implementar `renderPage`** escapando el texto del contenido, y `main.js` que lo inyecta en `#app`.
- [ ] **Step 4: Estilos:** tokens de paleta en `:root`; tipografía serif cálida para títulos y sans suave para texto; mucho espacio vertical; botones con `cursor: pointer`. Probar a 375 px y 320 px sin desborde horizontal.
- [ ] **Step 5: Ejecutar `npm test`; esperado: pasa. Abrir `index.html` con un servidor estático y revisar con Playwright a 375 px.**
- [ ] **Step 6: Commit** `feat: secciones y estilos base`.

### Task 3: Sobre con sello

**Files:**
- Create: `assets/js/envelope.js`, `assets/css/envelope.css`
- Modify: `index.html`, `assets/js/main.js`
- Test: `tests/envelope.test.mjs`

**Interfaces:**
- Produces: `openEnvelope(opts: { root: HTMLElement, onOpen: () => void }): void` — monta el sobre; al tocar el sello (o con Enter/Espacio) corre la secuencia: el sello se desvanece, la solapa se abre, la carta sube y la pantalla se desliza al contenido; luego llama a `onOpen` una sola vez. El sello es un `<button>` con `aria-label="Abrir invitación"`.

- [ ] **Step 1: Test que falla (con un DOM mínimo simulado):** tocar el sello dos veces llama a `onOpen` una sola vez; Enter sobre el sello también abre.
- [ ] **Step 2: Ejecutar; esperado: falla.**
- [ ] **Step 3: Implementar `openEnvelope`.** Animación lenta (aprox. 4–5 s en total) basada en las maquetas aprobadas. Con `prefers-reduced-motion`, saltar directo al contenido sin animación. Mientras el sobre está visible el contenido no se desplaza (sin scroll).
- [ ] **Step 4: Ejecutar `npm test`; esperado: pasa. Verificar con Playwright a 375 px: sello visible, al hacer clic aparece `#portada`.**
- [ ] **Step 5: Commit** `feat: apertura de sobre con sello`.

### Task 4: Música suave

**Files:**
- Create: `assets/js/music.js`, `assets/audio/ambient.mp3`, `assets/audio/LICENSE.txt`
- Modify: `assets/js/main.js`, `assets/js/render.js` (botón de silencio fijo), `assets/css/base.css`
- Test: `tests/music.test.mjs`

**Interfaces:**
- Produces: `createMusic(src: string, audioFactory?: (src: string) => AudioLike): { start(): Promise<void>; toggle(): boolean; isMuted(): boolean }` — `start` intenta reproducir con entrada suave; si el navegador la rechaza, no lanza error y deja `isMuted()` en `true`. `toggle` devuelve el nuevo estado de silencio. Bucle con entrada y salida suaves.

- [ ] **Step 1: Tests que fallan con un audio simulado:** `start()` llama a `play` una vez; si `play` rechaza, `start()` se resuelve igual y `isMuted()` es `true`; `toggle()` alterna el estado; llamar a `start()` dos veces no crea dos reproductores.
- [ ] **Step 2: Ejecutar; esperado: falla.**
- [ ] **Step 3: Implementar.** La música se inicia desde el `onOpen` del sobre (gesto del usuario). El botón de silencio está visible desde el sobre, con `aria-pressed` y etiqueta clara. Pista CC0 de ejemplo, de menos de 2 MB, con su origen anotado en `LICENSE.txt`; `preload="none"`.
- [ ] **Step 4: Ejecutar `npm test`; esperado: pasa.**
- [ ] **Step 5: Commit** `feat: música suave con control de silencio`.

### Task 5: Aparición suave al deslizar y plantas flotantes

**Files:**
- Create: `assets/js/reveal.js`, `assets/img/plants/*.svg` (al menos 3 ilustraciones)
- Modify: `assets/js/main.js`, `assets/css/sections.css`
- Test: `tests/reveal.test.mjs`

**Interfaces:**
- Produces: `initReveal(root: ParentNode, observerFactory?: typeof IntersectionObserver): void` — agrega la clase `is-visible` a cada `.reveal` cuando entra en pantalla, una sola vez. Si `IntersectionObserver` no existe, marca todo como visible.

- [ ] **Step 1: Tests que fallan:** un elemento que entra en pantalla recibe `is-visible`; un elemento que sale y vuelve no se reprocesa; sin `IntersectionObserver`, todos quedan visibles.
- [ ] **Step 2: Ejecutar; esperado: falla.**
- [ ] **Step 3: Implementar `initReveal`.** Entradas lentas (aprox. 1 s, desplazamiento corto). Plantas SVG que flotan despacio como decoración con `aria-hidden="true"`; sin movimiento con `prefers-reduced-motion`.
- [ ] **Step 4: Ejecutar `npm test`; esperado: pasa. Revisión visual con Playwright a 375 px y 1280 px.**
- [ ] **Step 5: Commit** `feat: animaciones al deslizar y plantas`.

### Task 6: Variante damas de honor y testigos

**Files:**
- Create: `para-ti-k7q2/index.html`
- Modify: `assets/js/main.js`, `assets/css/sections.css`
- Test: `tests/variant.test.mjs`

**Interfaces:**
- Consumes: `renderPage(content, "especial")`, `content.special`.
- Produces: la página en `para-ti-k7q2/` con `<meta name="robots" content="noindex, nofollow">`, rutas a assets relativas (`../assets/...`) y `data-variant="especial"`; `main.js` lee `document.body.dataset.variant`.

- [ ] **Step 1: Tests que fallan:** el HTML de la variante contiene `noindex`; `index.html` no contiene ningún enlace a `para-ti-k7q2`; el mensaje especial aparece solo en la variante.
- [ ] **Step 2: Ejecutar; esperado: falla.**
- [ ] **Step 3: Implementar la página y el mensaje de ejemplo** (apreciación del rol importante en la vida de la pareja, tono cálido).
- [ ] **Step 4: Ejecutar `npm test`; esperado: pasa. Verificar con Playwright que ambas páginas cargan sin errores de consola.**
- [ ] **Step 5: Commit** `feat: variante para damas y testigos`.

### Task 7: PDF descargable

**Files:**
- Create: `scripts/build-pdf.mjs`, `assets/pdf/invitacion.pdf`
- Modify: `package.json` (devDependency `pdf-lib`, script `build:pdf`)
- Test: `tests/pdf.test.mjs`

**Interfaces:**
- Consumes: `content`.
- Produces: `buildPdf(content: object): Promise<Uint8Array>` exportado de `scripts/build-pdf.mjs`; al ejecutarlo como script escribe `assets/pdf/invitacion.pdf`. Una página con nombres, fecha, lugar, hora, dirección, enlace de mapa y versículo con su cita; colores de la paleta.

- [ ] **Step 1: Test que falla:** `buildPdf(content)` devuelve bytes que empiezan con `%PDF`; el PDF generado tiene 1 página.
- [ ] **Step 2: Ejecutar; esperado: falla.**
- [ ] **Step 3: Implementar con `pdf-lib`.** Tipografías estándar del PDF.
- [ ] **Step 4: Ejecutar `npm test` y `npm run build:pdf`; esperado: pasa y el archivo existe. Confirmar que el botón de la sección `pdf` descarga `assets/pdf/invitacion.pdf`.**
- [ ] **Step 5: Commit** `feat: PDF con los datos de la invitación`.

### Task 8: Respaldo sin JavaScript, rendimiento y revisión final

**Files:**
- Modify: `index.html`, `para-ti-k7q2/index.html` (bloque `<noscript>`), estilos y assets según los hallazgos
- Test: `tests/budget.test.mjs`

**Interfaces:**
- Consumes: todo lo anterior.

- [ ] **Step 1: Test que falla:** la suma de tamaños de los archivos bajo `assets/` (excluyendo `assets/audio/`) es menor a 3 MB; ninguna imagen de `assets/img/story/` pesa más de 300 KB.
- [ ] **Step 2: Ejecutar; esperado: falla si hay excesos; optimizar fotos hasta que pase.**
- [ ] **Step 3: Agregar el `<noscript>` con fecha, lugar y hora de `content` (copiados una vez por el script de PDF o a mano, y validado por un test que compara con `content`).**
- [ ] **Step 4: Verificación con Playwright:** a 320, 375 y 1280 px sin desborde horizontal; con `prefers-reduced-motion` no hay animación del sobre; con el audio bloqueado la página sigue funcionando; recargar después de abrir el sobre muestra el sobre otra vez y no duplica música; una foto inexistente no deja ícono roto; sin errores en consola.
- [ ] **Step 5: Ejecutar `npm test`; esperado: pasa todo. Commit** `chore: respaldo, presupuesto de peso y verificación`.

---

## Self-Review

- **Cobertura de la especificación:** sobre y transición (T3), portada/versículo/historia/datos/asistencia/PDF (T2), música (T4), animaciones y plantas (T5), variante (T6), PDF (T7), peso, accesibilidad y respaldo (T8), contenido único y enlaces (T1), galería futura como comentario (T2).
- **Consistencia de nombres:** `content`, `renderPage`, `openEnvelope`, `createMusic`, `initReveal`, `buildPdf`, `whatsappUrl`, `mapsUrl` se usan igual en todas las tareas.
- **Proporción:** el plan decide archivos, firmas y valores; los cuerpos los escribe quien implementa.
