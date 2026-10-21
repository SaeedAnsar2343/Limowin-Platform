// Web Audio API Synthesizer for High-End Realistic Casino Sound Effects & Mobile Haptics

export const triggerHaptic = (pattern: number | number[] = 25) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgOsc: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopBackgroundMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Soft Chip Click / Bet placement with haptic feedback
  public playChip() {
    triggerHaptic(15);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Card Flip / Deal sound
  public playCardFlip() {
    triggerHaptic(20);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  // Dice roll / shake sound
  public playDiceRoll() {
    triggerHaptic([15, 20, 25]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320 + Math.random() * 200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
      }, i * 45);
    }
  }

  // Slot Reel Spin Click
  public playReelTick() {
    triggerHaptic(10);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  // Rocket thrust sound for Aviator / Crash
  public playRocketThrust() {
    triggerHaptic(10);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Pop / Bounce sound for Plinko, Mines, Roulette & Sports
  public playBounce() {
    triggerHaptic(12);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Standard Win Sound (Melodic Chime)
  public playWin() {
    triggerHaptic([30, 50, 40]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      }, idx * 75);
    });
  }

  // Soft Loss Thud / Whomp
  public playLose() {
    triggerHaptic(30);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // Big Jackpot Win Fanfare (Rich Multi-Oscillator Brass Fanfare)
  public playJackpot() {
    triggerHaptic([60, 40, 80, 50, 120]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [
      [523.25, 659.25, 783.99],       // C Maj
      [587.33, 739.99, 880.00],       // D Maj
      [659.25, 830.61, 987.77],       // E Maj
      [1046.5, 1318.5, 1567.98]       // High C Maj Fanfare
    ];

    chords.forEach((chord, chordIdx) => {
      setTimeout(() => {
        chord.forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = chordIdx === 3 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          const dur = chordIdx === 3 ? 0.9 : 0.22;
          gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + dur);
        });
      }, chordIdx * 130);
    });
  }

  // Ambient Lounge / VIP Casino Background Music
  public toggleBackgroundMusic() {
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
  }

  public startBackgroundMusic() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.stopBackgroundMusic();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime); // Gentle A3 ambient drone

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();

      this.bgOsc = osc;
      this.bgGain = gain;
      this.isMusicPlaying = true;
    } catch {}
  }

  public stopBackgroundMusic() {
    try {
      if (this.bgOsc) {
        this.bgOsc.stop();
        this.bgOsc.disconnect();
        this.bgOsc = null;
      }
      this.isMusicPlaying = false;
    } catch {}
  }
}

export const sound = new SoundManager();
