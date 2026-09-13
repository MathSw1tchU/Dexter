// Pokédex Kid Speech Engine using Web Speech API (Text-to-Speech)
type VoiceStateListener = (isSpeaking: boolean) => void;

class PokedexVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<VoiceStateListener> = new Set();
  private isSpeaking = false;
  private autoSpeak = true; // Auto speak when discovering a new Pokémon or scanning miniature

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Pre-warm voices
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          // Voices ready
        };
      }
    }
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((fn) => fn(speaking));
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isAutoSpeakEnabled(): boolean {
    return this.autoSpeak;
  }

  public setAutoSpeak(enabled: boolean) {
    this.autoSpeak = enabled;
  }

  private getPortugueseVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Prefer pt-BR voices (Brazilian Portuguese)
    const ptBr = voices.find((v) => v.lang.toLowerCase().includes('pt-br') || v.lang.toLowerCase().includes('pt_br'));
    if (ptBr) return ptBr;

    // 2. Any Portuguese voice
    const ptAny = voices.find((v) => v.lang.toLowerCase().startsWith('pt'));
    if (ptAny) return ptAny;

    // 3. Fallback to default or first voice
    return voices[0] || null;
  }

  // Speak kid friendly text
  public speak(text: string, onEnd?: () => void, onStart?: () => void) {
    if (!this.synth) return;

    // Stop current speech first
    this.stop();

    if (!text || !text.trim()) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const voice = this.getPortugueseVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'pt-BR';
      }

      // Kid-friendly voice tuning: slightly cheerful pitch, clear conversational rate
      utterance.pitch = 1.05;
      utterance.rate = 0.96;

      utterance.onstart = () => {
        this.notify(true);
        onStart?.();
      };

      utterance.onend = () => {
        this.notify(false);
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('Pokédex voice speech error:', e);
        this.notify(false);
        this.currentUtterance = null;
        onEnd?.();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Falha ao acionar sintetizador de voz:', err);
      this.notify(false);
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    this.currentUtterance = null;
    this.notify(false);
  }
}

export const pokedexVoice = new PokedexVoiceEngine();
