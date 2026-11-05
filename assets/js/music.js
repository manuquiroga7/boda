const VOLUME = 0.5;
const FADE_MS = 1500;

function fade(audio, to, ms = FADE_MS, done) {
  const from = audio.volume;
  const steps = Math.max(1, Math.round(ms / 50));
  let i = 0;
  const timer = setInterval(() => {
    i++;
    audio.volume = from + (to - from) * (i / steps);
    if (i >= steps) {
      clearInterval(timer);
      done?.();
    }
  }, 50);
  timer.unref?.();
}

export function createMusic(src, audioFactory = (s) => new Audio(s)) {
  let audio = null;
  let muted = false;

  const play = async () => {
    try {
      audio.volume = 0;
      await audio.play();
      fade(audio, VOLUME);
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
    toggle() {
      muted = !muted;
      if (!audio) return muted;
      if (muted) fade(audio, 0, 600, () => audio.pause());
      else play();
      return muted;
    },
    isMuted: () => muted,
  };
}
