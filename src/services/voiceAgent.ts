// Web Speech Synthesis, Real-Time Audio Spectrum Analyzer, and Ultra-Fast Speech Recognition
// Optimized for instantaneous (zero-delay) microphone activation and transcription

export interface VoiceState {
  isSpeaking: boolean;
  isListening: boolean;
  audioLevel: number;
  frequencyData?: Uint8Array;
  transcript?: string;
  interimTranscript?: string;
}

class VoiceAgentService {
  private isSpeaking: boolean = false;
  private isListening: boolean = false;
  private recognition: any = null;
  private listeners: Set<(state: VoiceState) => void> = new Set();
  private audioLevel: number = 0;
  private levelInterval: any = null;
  private currentTranscript: string = '';
  private currentInterim: string = '';

  // Web Audio Context for real mic frequency spectrum
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private frequencyArray: Uint8Array = new Uint8Array(32);

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !this.recognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      } catch (e) {
        console.warn('SpeechRecognition init error:', e);
      }
    }
  }

  public subscribe(fn: (state: VoiceState) => void) {
    this.listeners.add(fn);
    fn(this.getState());
    return () => {
      this.listeners.delete(fn);
    };
  }

  public getState(): VoiceState {
    return {
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      audioLevel: this.audioLevel,
      frequencyData: this.frequencyArray,
      transcript: this.currentTranscript,
      interimTranscript: this.currentInterim,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  // Live Speech Playback (Text-to-Speech)
  public speak(text: string, language: string = 'fa', onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'کدها پردازش شدند.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[#*_~>]/g, '')
        .trim();

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      const shortSpeech =
        cleanText
          .split(/[.!?\n]/)
          .filter(Boolean)
          .slice(0, 3)
          .join('. ') + '.';

      const utterance = new SpeechSynthesisUtterance(shortSpeech);
      utterance.lang = language === 'fa' ? 'fa-IR' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find((v) =>
        language === 'fa'
          ? v.lang.startsWith('fa') || v.lang.startsWith('ar')
          : v.lang.startsWith('en')
      );
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      this.isSpeaking = true;
      this.startLevelOscillation();
      this.notify();

      utterance.onend = () => {
        this.isSpeaking = false;
        this.stopLevelOscillation();
        this.notify();
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.stopLevelOscillation();
        this.notify();
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.isSpeaking = false;
      this.stopLevelOscillation();
      this.notify();
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.stopLevelOscillation();
    this.notify();
  }

  private startLevelOscillation() {
    if (this.levelInterval) clearInterval(this.levelInterval);
    this.levelInterval = setInterval(() => {
      this.audioLevel = 0.2 + Math.random() * 0.7;
      for (let i = 0; i < this.frequencyArray.length; i++) {
        this.frequencyArray[i] = Math.floor(Math.random() * 180 * this.audioLevel);
      }
      this.notify();
    }, 60);
  }

  private stopLevelOscillation() {
    if (this.levelInterval) {
      clearInterval(this.levelInterval);
      this.levelInterval = null;
    }
    this.audioLevel = 0;
    this.frequencyArray.fill(0);
    this.notify();
  }

  // Non-blocking, instant background mic stream connection
  private async startMicrophoneAnalyser() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        if (!this.micStream) {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        }

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!this.audioContext || this.audioContext.state === 'closed') {
            this.audioContext = new AudioCtx();
            const source = this.audioContext.createMediaStreamSource(this.micStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            this.analyser.smoothingTimeConstant = 0.3; // Ultra-fast responsiveness
            source.connect(this.analyser);
          }
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }

          if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            this.analyser.smoothingTimeConstant = 0.3;
            const source = this.audioContext.createMediaStreamSource(this.micStream);
            source.connect(this.analyser);
          }

          const bufferLength = this.analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          this.frequencyArray = new Uint8Array(bufferLength);

          const updateSpectrum = () => {
            if (!this.isListening || !this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            this.frequencyArray = new Uint8Array(dataArray);

            // Compute normalized RMS amplitude instantly
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            this.audioLevel = Math.min(1, avg / 75); // High sensitivity to whisper/voice

            this.notify();
            this.animationFrameId = requestAnimationFrame(updateSpectrum);
          };

          updateSpectrum();
          return;
        }
      }
    } catch (err) {
      console.warn('Real microphone audio analyzer fallback to simulation:', err);
    }

    // Fallback simulation
    this.startLevelOscillation();
  }

  private stopMicrophoneAnalyser() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    // Keep micStream warm so re-clicking the mic button is instant (0ms delay)
    if (this.audioContext && this.audioContext.state === 'running') {
      try {
        this.audioContext.suspend();
      } catch {}
    }
    this.stopLevelOscillation();
  }

  // Instantaneous Start Voice Recognition Listening Session
  public startListening(
    language: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ): boolean {
    // If already active, return instantly
    if (this.isListening) {
      return true;
    }

    this.currentTranscript = '';
    this.currentInterim = '';
    this.isListening = true;
    this.audioLevel = 0.15; // Immediate visual feedback so user sees it live right away
    this.notify();

    // Fire audio spectrum concurrently in background
    this.startMicrophoneAnalyser();

    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (!this.recognition) {
      this.notify();
      return true;
    }

    try {
      this.recognition.lang = language === 'fa' ? 'fa-IR' : 'en-US';

      this.recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          this.currentTranscript = (this.currentTranscript + ' ' + finalTrans).trim();
          this.currentInterim = '';
          onResult(this.currentTranscript, true);
        } else if (interimTrans) {
          this.currentInterim = interimTrans;
          onResult(this.currentTranscript + ' ' + interimTrans, false);
        }
        this.notify();
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition status:', event.error);
          if (onError) onError(event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            // Keep state intact
          }
        }
      };

      // Synchronous immediate start
      this.recognition.start();
      return true;
    } catch (e: any) {
      // If already started, ignore error
      if (e?.name !== 'InvalidStateError') {
        console.warn('Speech recognition start note:', e);
      }
      return true;
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.stopMicrophoneAnalyser();
    this.notify();
  }
}

export const voiceAgent = new VoiceAgentService();
