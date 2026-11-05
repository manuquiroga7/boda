// Genera una pista de ejemplo suave (acordes lentos) en assets/audio/ambient.wav.
// Obra propia, sin licencia de terceros. La pareja la reemplaza por su pista real.
import { writeFileSync, mkdirSync } from 'node:fs';

const RATE = 22050;
const SECONDS = 32;
const chords = [
  [261.63, 329.63, 392.0, 493.88], // Do mayor 7
  [220.0, 261.63, 329.63, 392.0], // La menor 7
  [174.61, 220.0, 261.63, 329.63], // Fa mayor 7
  [196.0, 246.94, 293.66, 392.0], // Sol sus
];
const per = SECONDS / chords.length;
const samples = new Int16Array(RATE * SECONDS);

for (let i = 0; i < samples.length; i++) {
  const t = i / RATE;
  const idx = Math.floor(t / per) % chords.length;
  const local = t - idx * per;
  // Cada acorde entra y sale suavemente (se solapa con el siguiente por la cola larga).
  const env = Math.sin(Math.PI * Math.min(1, local / per)) ** 2;
  let v = 0;
  for (const f of chords[idx]) {
    const vib = 1 + 0.002 * Math.sin(2 * Math.PI * 0.35 * t);
    v += Math.sin(2 * Math.PI * f * vib * t) * 0.6 + Math.sin(2 * Math.PI * f * 2 * t) * 0.12;
  }
  const global = Math.min(1, t / 2, (SECONDS - t) / 2); // entrada/salida del archivo
  samples[i] = Math.round((v / 4) * env * global * 0.55 * 32767);
}

const data = Buffer.from(samples.buffer);
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);

mkdirSync('assets/audio', { recursive: true });
writeFileSync('assets/audio/ambient.wav', Buffer.concat([header, data]));
console.log('assets/audio/ambient.wav', Buffer.concat([header, data]).length, 'bytes');
