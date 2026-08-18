import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as speakModule from '@/lib/speak';

describe('Speech System (speak.ts)', () => {
  let mockSynth: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
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

    mockSynth = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => [{ lang: 'pt-BR', localService: true }]),
      speaking: false,
      pending: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
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
    speakModule.speak('Teste');
    expect(mockSynth.cancel).toHaveBeenCalled();
    expect(mockSynth.speak).toHaveBeenCalled();
  });

  it('deve registrar listener para parar áudio ao clicar na tela', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    speakModule.speak('Teste');
    expect(addSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), { once: true });
    addSpy.mockRestore();
  });
});
