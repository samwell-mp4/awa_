// Free browser TTS via SpeechSynthesis. No credits/network required.
// Falls back silently on unsupported browsers.

export function speak(text: string, lang: string = "pt-BR", rate: number = 0.95) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = 1.05;
    u.volume = 1;
    // Prefer a matching voice if available
    const voices = synth.getVoices();
    const match =
      voices.find((v) => v.lang?.toLowerCase() === lang.toLowerCase()) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
    if (match) u.voice = match;
    synth.speak(u);
  } catch {
    /* ignore */
  }
}

export function stopSpeak() {
  if (typeof window === "undefined") return;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
