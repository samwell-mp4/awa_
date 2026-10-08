import { useMemo, useState } from "react";
import { Sparkles, Star } from "lucide-react";
import dicPtPat from "@/data/dic-pt-pat.json";

type Entry = { portugues: string; patxoha: string };

const ENTRIES = (dicPtPat as Entry[]).filter(
  (e) => e.portugues && e.patxoha && e.portugues.length > 2 && e.patxoha.length > 1,
);

function daySeed() {
  const d = new Date();
  return d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();
}

function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Palavra do dia + 3 distratores — mudam automaticamente a cada dia. */
function buildQuiz(seed: number) {
  const rnd = mulberry(seed);
  const answer = ENTRIES[Math.floor(rnd() * ENTRIES.length)];
  const options = new Set<string>([answer.patxoha]);
  while (options.size < 4) {
    options.add(ENTRIES[Math.floor(rnd() * ENTRIES.length)].patxoha);
  }
  const shuffled = [...options].sort(() => rnd() - 0.5);
  return { answer, options: shuffled };
}

export function KidsWordQuiz() {
  const [round, setRound] = useState(0);
  const quiz = useMemo(() => buildQuiz(daySeed() + round * 7919), [round]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === quiz.answer.patxoha) setScore((s) => s + 10);
  };

  const next = () => {
    setPicked(null);
    setRound((r) => r + 1);
  };

  return (
    <section className="kids-wood-box mt-3 rounded-2xl p-4 text-[#fefae0] shadow-xl sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#ffd166] sm:text-sm">
          <Sparkles className="h-4 w-4 text-[#ffd166]" /> Quiz da palavra do dia
        </div>
        <div className="flex items-center gap-1 rounded-full border border-[#f59e0b] bg-[#f59e0b]/20 px-3 py-0.5 text-xs font-black text-[#ffd166] sm:text-sm">
          <Star className="h-3.5 w-3.5 fill-[#ffd166] text-[#ffd166]" /> {score} pts
        </div>
      </div>

      <p className="mt-2.5 font-display text-base font-black leading-tight sm:text-xl text-[#fefae0]">
        Como se diz <span className="text-[#ffd166]">“{quiz.answer.portugues}”</span> em Patxôhã?
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {quiz.options.map((opt) => {
          const isAnswer = opt === quiz.answer.patxoha;
          const isPicked = opt === picked;
          let cls = "border-[#8d5b2d] bg-[#2a160a] text-[#fefae0] hover:border-[#ffd166] hover:bg-[#3d2210]";
          if (picked && isAnswer) cls = "border-[#4ade80] bg-[#1b4332] text-white shadow-[0_0_12px_rgba(74,222,128,0.4)]";
          else if (picked && isPicked) cls = "border-red-500 bg-red-950/80 text-white";
          return (
            <button
              key={opt}
              type="button"
              onClick={() => choose(opt)}
              className={`rounded-xl border-2 px-3 py-2.5 font-display text-sm font-black shadow transition active:scale-95 sm:text-lg ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#8d5b2d]/40">
          <div className="flex items-center gap-1.5 text-xs font-black sm:text-sm text-[#ffd166]">
            <Sparkles className="h-4 w-4 text-[#ffd166]" />
            {picked === quiz.answer.patxoha
              ? "Muito bem! +10 pontos! 🎉"
              : `Quase! A resposta certa é “${quiz.answer.patxoha}”.`}
          </div>
          <button
            type="button"
            onClick={next}
            className="rounded-full border-b-2 border-[#b45309] bg-gradient-to-r from-[#ffd166] to-[#f59e0b] px-4 py-1.5 font-display text-xs font-black text-[#2e180c] shadow transition hover:brightness-110 active:scale-95 sm:text-sm"
          >
            Próxima ➔
          </button>
        </div>
      )}
    </section>
  );
}
