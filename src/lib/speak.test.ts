import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speak, stopSpeak } from '@/lib/speak';

describe('Speech System (speak.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.speechSynthesis
    const mockSynth = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
      speaking: false,
      pending: false,
    };
    (window as any).speechSynthesis = mockSynth;
  });

  it('deve cancelar áudio anterior antes de começar um novo', () => {
    const synth = window.speechSynthesis;
    
    speak('Primeira frase');
    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.speak).toHaveBeenCalled();
    
    vi.clearAllMocks();
    
    speak('Segunda frase');
    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.speak).toHaveBeenCalled();
  });

  it('stopSpeak deve chamar cancel no sintetizador', () => {
    const synth = window.speechSynthesis;
    stopSpeak();
    expect(synth.cancel).toHaveBeenCalled();
  });

  it('deve parar áudio ao clicar na tela (global interrupter)', () => {
    const synth = window.speechSynthesis;
    speak('Frase teste');
    
    // Simula clique no body
    const event = new PointerEvent('pointerdown');
    window.dispatchEvent(event);
    
    expect(synth.cancel).toHaveBeenCalledTimes(2); // Um no speak(), outro no handler
  });
});
