import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as speakModule from '@/lib/speak';

describe('Speech System (speak.ts)', () => {
  let mockSynth: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global do SpeechSynthesisUtterance
    (global as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
      text,
      lang: '',
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: null,
      onstart: null,
      onend: null,
    }));

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
  });

  it('stopSpeak deve chamar cancel no sintetizador', () => {
    speakModule.stopSpeak();
    expect(mockSynth.cancel).toHaveBeenCalled();
  });

  it('deve cancelar áudio anterior antes de começar um novo', () => {
    // Nota: O speak do modulo usa window.speechSynthesis internamente
    speakModule.speak('Primeira frase');
    expect(mockSynth.cancel).toHaveBeenCalled();
    expect(mockSynth.speak).toHaveBeenCalled();
  });

  it('deve parar áudio ao clicar na tela (global interrupter)', () => {
    speakModule.speak('Frase teste');
    
    // Reseta o contador para ignorar o cancel() do início do speak
    mockSynth.cancel.mockClear();

    // Simula clique no window (onde o listener é adicionado)
    const event = new PointerEvent('pointerdown', { bubbles: true });
    window.dispatchEvent(event);
    
    // Deve ter sido chamado exatamente uma vez pelo stopHandler
    expect(mockSynth.cancel).toHaveBeenCalledTimes(1);
  });
});
