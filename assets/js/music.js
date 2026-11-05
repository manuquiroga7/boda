const VOLUME = 0.5;
const FADE_MS = 1500;

export function createMusic(src, audioFactory = (s) => new Audio(s)) {
  let audio = null;
  let muted = false;
  let fadeTimer = null;

  // Un solo fundido a la vez: uno nuevo cancela al anterior para que no se pisen.
  const fade = (to, ms = FADE_MS, done) => {
    clearInterval(fadeTimer);
    const from = audio.volume;
    const steps = Math.max(1, Math.round(ms / 50));
    let i = 0;
    fadeTimer = setInterval(() => {
      i++;
      audio.volume = from + (to - from) * (i / steps);
      if (i >= steps) {
        clearInterval(fadeTimer);
        done?.();
      }
    }, 50);
    fadeTimer.unref?.();
  };

  const play = async () => {
    try {
      clearInterval(fadeTimer);
      audio.volume = 0;
      await audio.play();
      fade(VOLUME);
      return true;
    } catch {
      muted = true;
      return false;
    }
  };

  return {
    async start() {
      if (audio) return;
      try {
        audio = audioFactory(src);
      } catch {
        muted = true;
        return;
      }
      audio.preload = 'auto';
      // El archivo ya trae entrada y salida suaves: al terminar, vuelve a empezar.
      audio.addEventListener?.('ended', () => {
        audio.currentTime = 0;
        if (!muted) play();
      });
      if (!muted) await play();
    },
    // Devuelve el estado final de silencio (puede ser "silenciado" si el navegador rechaza el audio).
    async toggle() {
      muted = !muted;
      if (!audio) return muted;
      if (muted) fade(0, 600, () => muted && audio.pause());
      else await play();
      return muted;
    },
    // Al salir de la página (por ejemplo a WhatsApp) la música se pausa; no cambia el silencio elegido.
    suspend() {
      if (!audio) return;
      clearInterval(fadeTimer);
      audio.pause();
    },
    async resume() {
      if (!audio || muted) return;
      await play();
    },
    isMuted: () => muted,
  };
}
