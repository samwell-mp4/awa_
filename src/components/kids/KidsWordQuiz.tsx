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
    <section className="mt-3 rounded-[1.5rem] border-4 border-amber-900/40 bg-[#5a3a22]/95 p-3 text-amber-50 shadow-xl sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-black opacity-90 sm:text-sm">Quiz da palavra do dia</div>
        <div className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-black text-amber-950 sm:text-sm">
          <Star className="h-3.5 w-3.5 fill-amber-950" /> {score} pts
        </div>
      </div>

      <p className="mt-2 font-display text-base font-black leading-tight sm:text-xl">
        Como se diz <span className="text-amber-300">“{quiz.answer.portugues}”</span> em Patxôhã?
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {quiz.options.map((opt) => {
          const isAnswer = opt === quiz.answer.patxoha;
          const isPicked = opt === picked;
          let cls = "border-amber-600/50 bg-amber-950/40 hover:-translate-y-0.5";
          if (picked && isAnswer) cls = "border-emerald-400 bg-emerald-600/80";
          else if (picked && isPicked) cls = "border-red-400 bg-red-600/70";
          return (
            <button
              key={opt}
              type="button"
              onClick={() => choose(opt)}
              className={`rounded-2xl border-2 px-2 py-2 font-display text-sm font-black shadow transition active:scale-95 sm:text-lg ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black sm:text-sm">
            <Sparkles className="h-4 w-4 text-amber-300" />
            {picked === quiz.answer.patxoha
              ? "Muito bem! +10 pontos!"
              : `Quase! A resposta é “${quiz.answer.patxoha}”.`}
          </div>
          <button
            type="button"
            onClick={next}
            className="rounded-full border-2 border-amber-600/50 bg-amber-500 px-3 py-1 font-display text-xs font-black text-amber-950 shadow transition hover:-translate-y-0.5 active:scale-95 sm:text-sm"
          >
            Próxima
          </button>
        </div>
      )}
    </section>
  );
}
