/**
 * Web Audio API synthesizer for Retro Chiptune & Arcade Sound FX + Korobeiniki BGM
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxVolumeNode: GainNode | null = null;
  private bgmVolumeNode: GainNode | null = null;
  private masterVolumeNode: GainNode | null = null;

  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  private isMuted = false;
  private sfxVol = 0.6;
  private bgmVol = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterVolumeNode = this.ctx.createGain();
      this.masterVolumeNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterVolumeNode.connect(this.ctx.destination);

      this.sfxVolumeNode = this.ctx.createGain();
      this.sfxVolumeNode.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxVolumeNode.connect(this.masterVolumeNode);

      this.bgmVolumeNode = this.ctx.createGain();
      this.bgmVolumeNode.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
      this.bgmVolumeNode.connect(this.masterVolumeNode);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterVolumeNode && this.ctx) {
      this.masterVolumeNode.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVol = Math.max(0, Math.min(1, vol));
    if (this.sfxVolumeNode && this.ctx) {
      this.sfxVolumeNode.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    }
  }

  public setBgmVolume(vol: number) {
    this.bgmVol = Math.max(0, Math.min(1, vol));
    if (this.bgmVolumeNode && this.ctx) {
      this.bgmVolumeNode.gain.setValueAtTime(this.bgmVol, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getSfxVolume(): number {
    return this.sfxVol;
  }

  public getBgmVolume(): number {
    return this.bgmVol;
  }

  // --- Sound Effects ---

  public playMove() {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxVolumeNode);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playRotate() {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.06);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxVolumeNode);

    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playHold() {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxVolumeNode);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playLock() {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxVolumeNode);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playHardDrop() {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxVolumeNode);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playLineClear(lines: number) {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode || this.isMuted) return;

    const now = this.ctx.currentTime;

    if (lines === 4) {
      // Tetris: 4-tone triumphant fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteStart = now + idx * 0.08;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.28, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxVolumeNode!);

        osc.start(noteStart);
        osc.stop(noteStart + 0.23);
      });
    } else {
      // 1 to 3 lines
      const freqs = [440, 554.37, 659.25].slice(0, lines);
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteStart = now + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxVolumeNode!);

        osc.start(noteStart);
        osc.stop(noteStart + 0.19);
      });
    }
  }

  public playLevelUp() {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode || this.isMuted) return;

    const notes = [440, 554.37, 659.25, 880];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxVolumeNode!);

      osc.start(start);
      osc.stop(start + 0.21);
    });
  }

  public playGameOver() {
    this.initContext();
    if (!this.ctx || !this.sfxVolumeNode || this.isMuted) return;

    const notes = [392, 349.23, 311.13, 261.63];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = now + idx * 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxVolumeNode!);

      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  // --- Background Music: Korobeiniki Chiptune Synthesizer ---
  public startBgm() {
    this.initContext();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.scheduleBgmLoop();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer !== null) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public isBgmActive(): boolean {
    return this.isBgmPlaying;
  }

  private scheduleBgmLoop() {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmVolumeNode) return;

    // Iconic Korobeiniki Melody (Note frequency & beat duration)
    // Quarter note ~ 0.38s (approx 155 BPM)
    const Q = 0.36;
    const E = Q / 2;
    const DQ = Q * 1.5;

    // Pitch constants
    const E5 = 659.25;
    const B4 = 493.88;
    const C5 = 523.25;
    const D5 = 587.33;
    const A4 = 440.00;
    const G4 = 392.00;
    const F4 = 349.23;
    const E4 = 329.63;
    const GS4 = 415.30;

    // Part A + Part B
    const melody: Array<{ note: number; dur: number; rest?: boolean }> = [
      // Measure 1
      { note: E5, dur: Q },
      { note: B4, dur: E },
      { note: C5, dur: E },
      { note: D5, dur: Q },
      { note: C5, dur: E },
      { note: B4, dur: E },
      // Measure 2
      { note: A4, dur: Q },
      { note: A4, dur: E },
      { note: C5, dur: E },
      { note: E5, dur: Q },
      { note: D5, dur: E },
      { note: C5, dur: E },
      // Measure 3
      { note: B4, dur: DQ },
      { note: C5, dur: E },
      { note: D5, dur: Q },
      { note: E5, dur: Q },
      // Measure 4
      { note: C5, dur: Q },
      { note: A4, dur: Q },
      { note: A4, dur: Q },
      { note: 0, dur: Q, rest: true },

      // Measure 5
      { note: D5, dur: DQ },
      { note: F4 * 2, dur: E }, // F5
      { note: 880.00, dur: Q }, // A5
      { note: 783.99, dur: E }, // G5
      { note: F4 * 2, dur: E }, // F5
      // Measure 6
      { note: E5, dur: DQ },
      { note: C5, dur: E },
      { note: E5, dur: Q },
      { note: D5, dur: E },
      { note: C5, dur: E },
      // Measure 7
      { note: B4, dur: Q },
      { note: B4, dur: E },
      { note: C5, dur: E },
      { note: D5, dur: Q },
      { note: E5, dur: Q },
      // Measure 8
      { note: C5, dur: Q },
      { note: A4, dur: Q },
      { note: A4, dur: Q },
      { note: 0, dur: Q, rest: true },
    ];

    let totalDuration = 0;
    melody.forEach((item) => {
      totalDuration += item.dur;
    });

    const startTime = this.ctx.currentTime + 0.05;
    let offset = 0;

    melody.forEach((item) => {
      if (!item.rest && item.note > 0) {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        // 8-bit pulse square wave
        osc.type = 'square';
        osc.frequency.setValueAtTime(item.note, startTime + offset);

        // Staccato envelope for nostalgic 8-bit chiptune sound
        const noteDuration = item.dur * 0.85;
        gain.gain.setValueAtTime(0.12, startTime + offset);
        gain.gain.setValueAtTime(0.12, startTime + offset + noteDuration - 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + offset + noteDuration);

        osc.connect(gain);
        gain.connect(this.bgmVolumeNode!);

        osc.start(startTime + offset);
        osc.stop(startTime + offset + noteDuration);
      }
      offset += item.dur;
    });

    // Schedule next loop before current finishes
    this.bgmTimer = window.setTimeout(() => {
      if (this.isBgmPlaying) {
        this.scheduleBgmLoop();
      }
    }, totalDuration * 1000 - 100);
  }
}

export const sound = new SoundEngine();
