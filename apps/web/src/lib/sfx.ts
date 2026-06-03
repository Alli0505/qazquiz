"use client";

/**
 * Tiny zero-asset sound engine. All effects are synthesized with the Web
 * Audio API at runtime — no audio files, no network, no licensing.
 *
 * Browsers start the AudioContext suspended until a user gesture, so call
 * `sfx.resume()` from a click handler (host/join buttons do this).
 */

type SoundName =
  | "pop"
  | "click"
  | "tick"
  | "start"
  | "correct"
  | "wrong"
  | "reveal"
  | "gameover";

const STORAGE_KEY = "qazquiz:muted";

class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.muted = localStorage.getItem(STORAGE_KEY) === "1";
    }
  }

  private ensure() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Resume the context from a user gesture (required by autoplay policy). */
  resume() {
    const ctx = this.ensure();
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }

  isMuted() {
    return this.muted;
  }

  toggleMuted() {
    this.muted = !this.muted;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, this.muted ? "1" : "0");
    }
    if (!this.muted) this.resume();
    return this.muted;
  }

  /** One oscillator note. `t` is an offset (seconds) from now. */
  private note(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = "sine",
    gain = 1,
  ) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    // quick attack + exponential decay → a pleasant "pluck"
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private sweep(from: number, to: number, dur: number, type: OscillatorType) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.8, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  play(name: SoundName) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    switch (name) {
      case "pop":
        this.note(660, 0, 0.12, "sine", 0.7);
        break;
      case "click":
        this.note(880, 0, 0.07, "square", 0.5);
        break;
      case "tick":
        this.note(1040, 0, 0.06, "square", 0.5);
        break;
      case "start":
        this.sweep(300, 900, 0.35, "sawtooth");
        break;
      case "correct":
        // C5 → E5 → G5 major arpeggio
        this.note(523.25, 0, 0.18, "triangle", 0.8);
        this.note(659.25, 0.1, 0.18, "triangle", 0.8);
        this.note(783.99, 0.2, 0.28, "triangle", 0.9);
        break;
      case "wrong":
        // descending two-tone buzz
        this.note(220, 0, 0.18, "sawtooth", 0.6);
        this.note(160, 0.14, 0.28, "sawtooth", 0.6);
        break;
      case "reveal":
        this.sweep(500, 720, 0.25, "sine");
        break;
      case "gameover":
        // little victory fanfare
        this.note(523.25, 0, 0.16, "triangle", 0.8);
        this.note(659.25, 0.14, 0.16, "triangle", 0.8);
        this.note(783.99, 0.28, 0.16, "triangle", 0.8);
        this.note(1046.5, 0.42, 0.5, "triangle", 0.9);
        break;
    }
  }
}

export const sfx = new Sfx();
export type { SoundName };
