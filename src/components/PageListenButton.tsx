import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { speak, stopSpeak } from "@/lib/speak";

/** Botão "Ouvir página": narra todo o texto do <main> da página. */
export function PageListenButton() {
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (playing) {
      stopSpeak();
      setPlaying(false);
      return;
    }
    const main = document.querySelector("main");
    const text = (main?.innerText || "").replace(/\s+\n/g, "\n").trim().slice(0, 4000);
    if (!text) return;
    setPlaying(true);
    speak(text, "pt-BR", 1, undefined, () => setPlaying(false));
  };

  // Começa a narrar sozinho assim que a página abre.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const main = document.querySelector("main");
      const text = (main?.innerText || "").replace(/\s+\n/g, "\n").trim().slice(0, 4000);
      if (!text) return;
      setPlaying(true);
      speak(text, "pt-BR", 1, undefined, () => setPlaying(false));
    }, 150);
    return () => {
      window.clearTimeout(id);
      stopSpeak();
    };
  }, []);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-forest-deep shadow-[var(--shadow-glow)] transition hover:brightness-110"
    >
      {playing ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {playing ? "Parar áudio" : "Ouvir página"}
    </button>
  );
}
