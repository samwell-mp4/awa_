import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speak, stopSpeak } from '@/lib/speak';

describe('Speech System (speak.ts)', () => {
  let mockSynth: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock robusto do SpeechSynthesis
    mockSynth = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => [{ lang: 'pt-BR', localService: true }]),
      speaking: false,
      pending: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    // Injetar no window
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSynth,
      configurable: true,
      writable: true
    });

    // Resetar o estado interno do modulo speak.ts se necessário 
    // (o modulo usa closure, mas o synth() sempre pega o window.speechSynthesis atual)
  });

  it('stopSpeak deve chamar cancel no sintetizador', () => {
    stopSpeak();
    expect(mockSynth.cancel).toHaveBeenCalled();
  });

  it('deve cancelar áudio anterior antes de começar um novo', () => {
    speak('Primeira frase');
    expect(mockSynth.cancel).toHaveBeenCalled();
    expect(mockSynth.speak).toHaveBeenCalled();
  });

  it('deve parar áudio ao clicar na tela (global interrupter)', () => {
    speak('Frase teste');
    
    // Simula clique no window (onde o listener é adicionado)
    const event = new PointerEvent('pointerdown', { bubbles: true });
    window.dispatchEvent(event);
    
    // 1 call no speak() + 1 call no stopHandler
    expect(mockSynth.cancel).toHaveBeenCalledTimes(2);
  });
});
