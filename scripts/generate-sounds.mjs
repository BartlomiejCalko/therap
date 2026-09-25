// Generates the three focus-sound loops in assets/sounds as small mono WAV files.
// Run with `npm run sounds`. Every loop is made seamless by crossfading its tail into its head.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const SECONDS = 24;
const LENGTH = RATE * SECONDS;
const FADE = RATE * 2;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

// Deterministic noise so the files are reproducible.
let seed = 20260925;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const white = () => random() * 2 - 1;

function loopable(render) {
  const raw = render(LENGTH + FADE);
  const out = new Float32Array(LENGTH);
  for (let i = 0; i < LENGTH; i++) out[i] = raw[i];
  for (let i = 0; i < FADE; i++) {
    const t = i / FADE;
    out[i] = raw[i] * t + raw[LENGTH + i] * (1 - t);
  }
  return out;
}

function normalize(samples, targetRms) {
  let sum = 0;
  for (const s of samples) sum += s * s;
  const gain = targetRms / Math.sqrt(sum / samples.length);
  return samples.map((s) => Math.max(-1, Math.min(1, s * gain)));
}

function pinkNoise(n) {
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = white();
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    out[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
  }
  return out;
}

function lowpass(samples, cutoff) {
  const a = Math.exp((-2 * Math.PI * cutoff) / RATE);
  let y = 0;
  return samples.map((x) => (y = (1 - a) * x + a * y));
}

function rain(n) {
  const bed = lowpass(pinkNoise(n), 2400);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = bed[i] * 0.6;
  // Scattered droplets: short, bright, decaying ticks.
  for (let i = 0; i < n; i++) {
    if (random() < 45 / RATE) {
      const amp = 0.15 + random() * 0.5;
      const decay = RATE * (0.004 + random() * 0.012);
      let prev = 0;
      for (let j = 0; j < decay * 5 && i + j < n; j++) {
        const w = white();
        const hp = w - prev;
        prev = w;
        out[i + j] += hp * amp * Math.exp(-j / decay);
      }
    }
  }
  return lowpass(out, 5000);
}

function brown(n) {
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    y = (y + 0.02 * white()) / 1.02;
    out[i] = y;
  }
  return lowpass(out, 900);
}

function drone(n) {
  // Frequencies are multiples of 1/SECONDS so every partial completes whole cycles per loop.
  const partials = [
    [82.5, 0.5],
    [110, 1],
    [110.125, 0.7],
    [165, 0.45],
    [220, 0.25],
    [329.625, 0.08],
  ];
  const out = new Float32Array(n);
  const air = lowpass(pinkNoise(n), 600);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const swell = 0.75 + 0.25 * Math.sin((2 * Math.PI * t) / SECONDS);
    let s = 0;
    for (const [f, a] of partials) s += a * Math.sin(2 * Math.PI * f * t);
    out[i] = s * swell * 0.25 + air[i] * 0.08;
  }
  return out;
}

function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(s * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, render, rms] of [
  ['rain', rain, 0.08],
  ['brown', brown, 0.09],
  ['drone', drone, 0.07],
]) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(normalize(loopable(render), rms)));
  console.log(`wrote ${file}`);
}
