import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMusic } from '../assets/js/music.js';

function fakeAudio({ rejectPlay = false } = {}) {
  const listeners = {};
  return {
    plays: 0,
    paused: true,
    volume: 0,
    currentTime: 0,
    duration: NaN,
    play() {
      this.plays++;
      if (rejectPlay) return Promise.reject(new Error('NotAllowedError'));
      this.paused = false;
      return Promise.resolve();
    },
    pause() { this.paused = true; },
    addEventListener(name, fn) { listeners[name] = fn; },
  };
}

test('start() reproduce una vez y deja el estado con sonido', async () => {
  const a = fakeAudio();
  const m = createMusic('x.wav', () => a);
  await m.start();
  assert.equal(a.plays, 1);
  assert.equal(m.isMuted(), false);
});

test('si el navegador rechaza la reproducción, start() no falla y queda silenciado', async () => {
  const a = fakeAudio({ rejectPlay: true });
  const m = createMusic('x.wav', () => a);
  await assert.doesNotReject(m.start());
  assert.equal(m.isMuted(), true);
});

test('toggle() alterna el silencio y devuelve el nuevo estado', async () => {
  const a = fakeAudio();
  const m = createMusic('x.wav', () => a);
  await m.start();
  assert.equal(m.toggle(), true);
  assert.equal(m.isMuted(), true);
  assert.equal(m.toggle(), false);
  assert.equal(m.isMuted(), false);
});

test('llamar start() dos veces no crea dos reproductores', async () => {
  let made = 0;
  const m = createMusic('x.wav', () => { made++; return fakeAudio(); });
  await m.start();
  await m.start();
  assert.equal(made, 1);
});

test('si el audio no se puede crear, no rompe', async () => {
  const m = createMusic('x.wav', () => { throw new Error('sin audio'); });
  await assert.doesNotReject(m.start());
  assert.equal(m.isMuted(), true);
});

test('si se silencia antes de empezar, start() no reproduce', async () => {
  const a = fakeAudio();
  const m = createMusic('x.wav', () => a);
  m.toggle();
  await m.start();
  assert.equal(a.plays, 0);
  assert.equal(m.isMuted(), true);
});
