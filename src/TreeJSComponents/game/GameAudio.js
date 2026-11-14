import { engineTone } from "./feel";

export class GameAudio {
  constructor() {
    this._ctx    = null;
    this._muted  = false;
    this._engine = null;   // { osc, gain } while the engine hum runs
  }

  get muted() { return this._muted; }
  set muted(v) { this._muted = v; }

  init() {
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {}
  }

  _play(fn) {
    if (this._muted || !this._ctx) return;
    if (this._ctx.state === 'suspended') this._ctx.resume();
    fn(this._ctx);
  }

  laserFire() {
    this._play(ctx => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.09);
    });
  }

  explosion() {
    this._play(ctx => {
      const bufLen = ctx.sampleRate * 0.35 | 0;
      const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data   = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

      const src    = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain   = ctx.createGain();
      src.buffer        = buf;
      filter.type       = 'lowpass';
      filter.frequency.value = 380;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.38, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      src.start(ctx.currentTime);
    });
  }

  playerHit() {
    this._play(ctx => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    });
  }

  pickup() {
    this._play(ctx => {
      [520, 780].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.07;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.start(t);
        osc.stop(t + 0.14);
      });
    });
  }

  superlaserCharge() {
    this._play(ctx => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 2.5);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 2.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.5);
    });
  }

  superlaserFire() {
    this._play(ctx => {
      const osc  = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);

      const bufLen = ctx.sampleRate * 0.6 | 0;
      const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data   = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

      const src    = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain   = ctx.createGain();
      src.buffer        = buf;
      filter.type       = 'lowpass';
      filter.frequency.value = 220;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      src.start(ctx.currentTime);
    });
  }

  waveComplete() {
    this._play(ctx => {
      [440, 550, 660].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.13;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.start(t);
        osc.stop(t + 0.32);
      });
    });
  }

  gameOver() {
    this._play(ctx => {
      [440, 350, 260, 196].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.22;
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    });
  }

  // A shot that lands: a short tick. A kill: lower and longer.
  hitConfirm(kill = false) {
    this._play(ctx => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      const length = kill ? 0.14 : 0.05;
      osc.frequency.setValueAtTime(kill ? 520 : 1250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(kill ? 180 : 900, ctx.currentTime + length);
      gain.gain.setValueAtTime(kill ? 0.09 : 0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + length);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + length);
    });
  }

  // The engine's hum. Call every frame with the speed as a share of cruise
  // speed; call with null to shut the engine down (pause, game over, exit).
  engine(speed) {
    const ctx = this._ctx;
    if (!ctx) return;
    if (speed === null) {
      if (this._engine) {
        this._engine.osc.stop(ctx.currentTime);
        this._engine.gain.disconnect();
        this._engine = null;
      }
      return;
    }
    if (!this._engine) {
      const osc    = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain   = ctx.createGain();
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.value = 260;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0;
      osc.start(ctx.currentTime);
      this._engine = { osc, gain };
    }
    const tone = engineTone(speed);
    this._engine.osc.frequency.setTargetAtTime(tone.frequency, ctx.currentTime, 0.12);
    this._engine.gain.gain.setTargetAtTime(this._muted ? 0 : tone.gain, ctx.currentTime, 0.12);
  }
}
