import { describe, it, expect } from 'vitest';
import { cleanTextForSpeech } from '@/lib/clean-speech-text';

describe('cleanTextForSpeech', () => {
  it('remove prefixos de resposta de dicionario', () => {
    expect(cleanTextForSpeech('resp. - akunã')).toBe('akunã');
    expect(cleanTextForSpeech('res/p - hayôxó')).toBe('hayôxó');
    expect(cleanTextForSpeech('resp: kaxinã')).toBe('kaxinã');
    expect(cleanTextForSpeech('res/p. - bolukunã')).toBe('bolukunã');
  });

  it('corrige iota grego com perispomeno para i latino com til', () => {
    expect(cleanTextForSpeech('ῖtxê hamôp')).toBe('ĩtxê hamôp');
    expect(cleanTextForSpeech('ῖtxê niató')).toBe('ĩtxê niató');
  });

  it('normaliza aspas e apostrofos curvos', () => {
    expect(cleanTextForSpeech('nipatxiõ’xó')).toBe("nipatxiõ'xó");
    expect(cleanTextForSpeech('p‘ap’ai')).toBe("p'ap'ai");
  });

  it('transforma barras em conectivo "ou"', () => {
    expect(cleanTextForSpeech('tsägô/txägô')).toBe('tsägô ou txägô');
    expect(cleanTextForSpeech('p’ap’ai/ pâpây')).toBe("p'ap'ai ou pâpây");
  });

  it('transforma variantes entre parenteses em "ou"', () => {
    expect(cleanTextForSpeech('ehä(ehé)')).toBe('ehä ou ehé');
    expect(cleanTextForSpeech('kamayurá(kamaruá/kamarurá)')).toBe('kamayurá ou kamaruá ou kamarurá');
  });

  it('lida com texto vazio ou nulo graciosamente', () => {
    expect(cleanTextForSpeech('')).toBe('');
    expect(cleanTextForSpeech('   ')).toBe('');
  });
});
