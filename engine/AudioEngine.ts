
export class AudioEngine {
  ctx: AudioContext;
  masterGain: GainNode;
  effectsGain: GainNode;
  masterVolume: number = 0.3;
  effectsVolume: number = 1.0;
  isMuted: boolean = false;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.effectsGain = this.ctx.createGain();
    
    this.effectsGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    
    this.updateVolumes();
  }

  updateVolumes() {
    const vol = this.isMuted ? 0 : this.masterVolume;
    this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    this.effectsGain.gain.setTargetAtTime(this.effectsVolume, this.ctx.currentTime, 0.05);
  }

  setMasterVolume(val: number) {
    this.masterVolume = val;
    this.updateVolumes();
  }

  setEffectsVolume(val: number) {
    this.effectsVolume = val;
    this.updateVolumes();
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    this.updateVolumes();
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playShoot() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.effectsGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playHit() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.effectsGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playCollect() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.effectsGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playLevelUp() {
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + i * 0.1 + 0.05);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.effectsGain);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
    });
  }
}
