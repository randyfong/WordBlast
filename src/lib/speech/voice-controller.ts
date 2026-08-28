export interface SpeechMatchEvent {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  speechTimestamp: number;
}

export type SpeechCallback = (event: SpeechMatchEvent) => void;

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceController {
  private recognition: any = null;
  private isListening: boolean = false;
  private onMatchCallback: SpeechCallback | null = null;
  private isSupported: boolean = false;
  private isFallbackSimulated: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;
        this.isSupported = true;

        this.setupListeners();
      } else {
        console.warn('Web Speech API is not supported in this browser. Fallback mode enabled.');
        this.isSupported = false;
      }
    }
  }

  private setupListeners() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const now = performance.now();
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        const transcript = res[0].transcript.trim().toLowerCase();
        const confidence = res[0].confidence || 0.9;
        const isFinal = res.isFinal;

        if (this.onMatchCallback) {
          this.onMatchCallback({
            transcript,
            isFinal,
            confidence,
            speechTimestamp: now
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.isFallbackSimulated = true;
      }
    };

    this.recognition.onend = () => {
      // Auto restart if still marked as listening
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch {
          // Ignore restart errors
        }
      }
    };
  }

  public start(callback: SpeechCallback) {
    this.onMatchCallback = callback;
    this.isListening = true;

    if (this.isSupported && this.recognition) {
      try {
        this.recognition.start();
      } catch (err) {
        console.log('Recognition already running or restarting', err);
      }
    }
  }

  public stop() {
    this.isListening = false;
    this.onMatchCallback = null;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  public simulateUtterance(word: string) {
    if (this.onMatchCallback) {
      this.onMatchCallback({
        transcript: word.toLowerCase(),
        isFinal: true,
        confidence: 0.99,
        speechTimestamp: performance.now()
      });
    }
  }

  public getStatus() {
    return {
      isSupported: this.isSupported,
      isListening: this.isListening,
      isFallback: this.isFallbackSimulated
    };
  }
}

export const voiceController = new VoiceController();
