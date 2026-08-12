import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAkua } from "@/lib/akua-chat.functions";
import { speakText } from "@/lib/tts.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/pick-lang";
import { Send, Loader2, Volume2, RefreshCcw, ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import logoSrc from "@/assets/infantil-logo-new.jpg.asset.json";

type Msg = { role: "user" | "assistant"; content: string; at?: number };

export function AkuaChatKids() {
  const { t } = useTranslation();
  const lang = useLang();
  const ask = useServerFn(askAkua);
  const speakFn = useServerFn(speakText);
  
  const welcomeMessage = t("infantil.akua.welcome", "Olá, pequeno Parente! Eu sou o Professor Akuã. Quer aprender palavras mágicas em Patxôhã? Pergunte o que quiser! 🌿✨");
  
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: welcomeMessage, at: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSpeak(text: string) {
    try {
      const clean = text.replace(/\[\/?ex\]/g, "").replace(/\|\|/g, ", ").replace(/\*\*/g, "");
      const r = await speakFn({ data: { text: clean, environment: getPaddleEnvironment() } });
      if (r.error || !r.audio_base64) return;
      
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(base64ToBlobUrl(r.audio_base64, r.mime));
      audioRef.current = audio;
      await audio.play();
    } catch (e) {
      console.error("Erro ao falar:", e);
    }
  }

  async function send() {
    const content = input.trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content, at: Date.now() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { reply } = await ask({ 
        data: { 
          messages: nextMessages, 
          environment: getPaddleEnvironment(), 
          lang,
          mode: "infantil" 
        } 
      });
      const assistantMsg = { role: "assistant" as const, content: reply, at: Date.now() };
      setMessages([...nextMessages, assistantMsg]);
      handleSpeak(reply);
    } catch (e: any) {
      toast.error(t("common.error", "Ops! Ocorreu um erro. Tente novamente."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[80vh] bg-white/90 rounded-[2rem] border-4 border-amber-300 shadow-2xl overflow-hidden">
      {/* Header do Chat */}
      <div className="bg-amber-100 p-4 flex items-center justify-between border-b-2 border-amber-200">
        <div className="flex items-center gap-3">
          <img src={logoSrc.url} alt="Akuã" className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover" />
          <div>
            <h3 className="font-display font-black text-amber-900 text-lg">Professor Akuã</h3>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Modo Infantil</span>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ role: "assistant", content: welcomeMessage, at: Date.now() }])}
          className="p-2 bg-white rounded-full text-amber-600 hover:bg-amber-50 transition shadow-sm"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/bg-pattern-kids.png')] bg-repeat">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-md font-medium text-sm md:text-base ${
              m.role === 'user' 
                ? 'bg-amber-400 text-white rounded-tr-none' 
                : 'bg-white text-emerald-900 border-2 border-amber-100 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.role === 'assistant' && (
                <button 
                  onClick={() => handleSpeak(m.content)}
                  className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 hover:text-amber-700"
                >
                  <Volume2 className="w-4 h-4" /> {t("common.listen", "Ouvir")}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl border-2 border-amber-100 shadow-md">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-amber-50 border-t-2 border-amber-100">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Pergunte algo ao Professor Akuã..."
            className="flex-1 bg-white border-2 border-amber-200 rounded-xl px-4 py-3 text-emerald-900 focus:outline-none focus:border-amber-400 font-medium"
          />
          <button 
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl shadow-lg transition disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
