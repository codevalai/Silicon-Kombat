// Diamond-Status Multi-Layered WebAudio Synthesizer, Adaptive Synthwave & Spatialized 'Fenrir' Neural Announcer
export class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  public voiceEnabled: boolean = true;
  private isAnnouncing: boolean = false;
  private lastAnnouncedText: string = '';
  private lastAnnouncedTime: number = 0;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isAnnouncing = false;
  }

  /**
   * Calls the server-side Gemini 2.5 Flash TTS endpoint configured with the
   * deep, aggressive male esports announcer voice ('Fenrir') and spatializes it
   * across the 3D stereo field (-1.0 left to +1.0 right).
   */
  public async speakAnnouncer(text: string, stereoPan: number = 0): Promise<void> {
    if (this.muted || !this.voiceEnabled || !text) return;

    const now = performance.now();
    if (text === this.lastAnnouncedText && now - this.lastAnnouncedTime < 2200) {
      return;
    }
    this.lastAnnouncedText = text;
    this.lastAnnouncedTime = now;

    try {
      this.isAnnouncing = true;
      const response = await fetch('/api/tts/announcer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Fenrir' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.audioBase64) {
          this.playPCM24k(data.audioBase64, stereoPan);
          return;
        }
      }
    } catch {
      // Fallback to deep male Web Speech synthesis if offline
    } finally {
      this.isAnnouncing = false;
    }

    this.speakDeepMaleFallback(text, 0.72, 1.02);
  }

  /**
   * Decodes raw 24kHz 16-bit mono PCM audio returned by Gemini 2.5 Flash TTS
   * and plays it through a StereoPannerNode for 3D arena spatialization.
   */
  private playPCM24k(base64Pcm: string, stereoPan: number = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const binary = atob(base64Pcm);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = this.ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.95;

      if (typeof this.ctx.createStereoPanner === 'function') {
        const panner = this.ctx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, stereoPan));
        source.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        source.connect(gain);
        gain.connect(this.ctx.destination);
      }

      source.start();
    } catch {
      // Ignore malformed PCM frames
    }
  }

  public speakFounderQuote(
    text: string,
    pitch: number = 0.78,
    rate: number = 0.98,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (this.muted || !this.voiceEnabled) return;
    this.speakDeepMaleFallback(text, pitch, rate, onStart, onEnd);
  }

  private speakDeepMaleFallback(
    text: string,
    pitch: number = 0.76,
    rate: number = 0.98,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const femalePattern =
        /female|zira|samantha|victoria|karen|moira|tessa|fiona|veena|susan|linda|hazel|heather|catherine|aria|jenny|sonia|natasha|clara|siri|kortana|alice|alva|amelie|anna|carmit|damayanti|ellen|ioana|joana|kanya|kyoko|laura|lekha|luciana|mariska|mei-jia|melina|milena|monica|nora|paulina|sara|satu|sin-ji|ting-ting|yu-shu|zosia/i;
      const malePattern =
        /male|david|mark|guy|daniel|alex|fred|jorge|thomas|oliver|LIAM|rishi|aaron|arthur|gordon|lee|martin|reed|rocko|shelley|bruce|ralph|albert|junior|english.*us|google us english/i;

      const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
      const nonFemaleVoices = englishVoices.filter((v) => !femalePattern.test(v.name));
      const explicitMaleVoice =
        nonFemaleVoices.find((v) => malePattern.test(v.name)) ||
        nonFemaleVoices[0] ||
        englishVoices[0];

      if (explicitMaleVoice) {
        utterance.voice = explicitMaleVoice;
      }

      utterance.pitch = Math.max(0.55, Math.min(0.82, pitch * 0.78));
      utterance.rate = Math.max(0.9, Math.min(1.08, rate));
      utterance.volume = 0.95;

      if (onStart) utterance.onstart = onStart;
      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public playSelect(high = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(high ? 560 : 380, now);
    osc.frequency.exponentialRampToValueAtTime(high ? 920 : 620, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Diamond-Status 3-Layer Procedural Strike Synthesis:
   * 1. Low-End Sub-Bass Thud (150Hz -> 30Hz sine drop)
   * 2. Mid-Range Leather Crack (bandpass filtered noise burst)
   * 3. High-End Metallic Ring (sharp transient for heavy/counter hits)
   */
  public playHit(
    typeOrHeavy: 'light' | 'heavy' | 'special' | 'block' | 'ult' | boolean = 'light',
    panX: number = 0
  ) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const type: 'light' | 'heavy' | 'special' | 'block' | 'ult' =
      typeof typeOrHeavy === 'boolean' ? (typeOrHeavy ? 'heavy' : 'light') : typeOrHeavy;

    const now = this.ctx.currentTime;
    const isHeavy = type === 'heavy' || type === 'special' || type === 'ult';

    // Optional stereo panner
    const dest: AudioNode =
      typeof this.ctx.createStereoPanner === 'function'
        ? (() => {
            const p = this.ctx!.createStereoPanner();
            p.pan.value = Math.max(-1, Math.min(1, panX));
            p.connect(this.ctx!.destination);
            return p;
          })()
        : this.ctx.destination;

    if (type === 'block') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.09);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.1);
      return;
    }

    // LAYER 1: Low-End Sub-Bass Thud (150Hz -> 30Hz sine wave drop)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    const subDur = type === 'ult' ? 0.42 : isHeavy ? 0.30 : 0.16;
    subOsc.frequency.setValueAtTime(isHeavy ? 155 : 130, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + subDur);
    subGain.gain.setValueAtTime(isHeavy ? 0.52 : 0.28, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + subDur + 0.02);
    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(now);
    subOsc.stop(now + subDur + 0.02);

    // LAYER 2: Mid-Range Flesh-on-Leather Crack (Filtered Noise Burst)
    const noiseLen = Math.floor(this.ctx.sampleRate * (isHeavy ? 0.14 : 0.075));
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.32));
    }
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHeavy ? 1150 : 1650, now);
    filter.Q.setValueAtTime(1.4, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isHeavy ? 0.38 : 0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.14 : 0.075));

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noiseSrc.start(now);

    // LAYER 3: High-End Metallic Transient Ring (Heavy / Special / Ultimate)
    if (isHeavy) {
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ringOsc.type = 'sawtooth';
      ringOsc.frequency.setValueAtTime(type === 'ult' ? 880 : 640, now);
      ringOsc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      ringGain.gain.setValueAtTime(0.16, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
      ringOsc.connect(ringGain);
      ringGain.connect(dest);
      ringOsc.start(now);
      ringOsc.stop(now + 0.19);
    }
  }

  /**
   * Plays a dramatic cinematic Fatality / Hostile Takeover synth drop
   */
  public playFatalitySound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [110, 82.4, 55].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 1.5, now + idx * 0.12);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.9 + idx * 0.12);

      gain.gain.setValueAtTime(0.22, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95 + idx * 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + 0.98 + idx * 0.12);
    });
  }

  public playKoBoom() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + 0.65);

    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.68);
  }

  public playRoundChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.26);
    });
  }

  public playBlock(panX: number = 0) {
    this.playHit('block', panX);
  }

  public playSpecial(panX: number = 0) {
    this.playHit('special', panX);
  }

  public playUltimate(panX: number = 0) {
    this.playHit('ult', panX);
  }

  public playKO() {
    this.playKoBoom();
  }

  public playRoundStart() {
    this.playRoundChime();
  }

  public playDash() {
    this.playSelect(true);
  }

  public playJump() {
    this.playSelect(false);
  }
}
