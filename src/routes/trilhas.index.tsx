import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Award, CheckCircle2 } from "lucide-react";
import { TRAILS, hasCertificate, getLearned, fraseDoDia } from "@/lib/trilhas";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/trilhas/")({
  head: () => ({
    meta: [
      { title: "Trilhas de Patxôhã — AWÃ TECH" },
      { name: "description", content: "Trilhas guiadas pelo Professor Akuã: Saudações, Família, Natureza, Animais e Cultura." },
    ],
  }),
  component: TrilhasIndex,
});

function TrilhasIndex() {
  const [tick, setTick] = useState(0);
  useEffect(() => { setTick(1); }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.75)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 font-display font-black text-cream">
            <Sparkles className="h-5 w-5 text-leaf" /> Trilhas
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <section className="card-elev rounded-3xl border border-gold/25 bg-gradient-to-br from-forest-deep/60 to-bark/30 p-6 md:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Frase do dia</div>
          <p className="mt-2 font-display text-2xl md:text-3xl font-black text-cream">{fraseDoDia()}</p>
          <p className="mt-3 text-sm text-foreground/75">
            Bem-chegado! Escolha sua trilha e caminhe com o Professor Akuã. Cada palavra aprendida é uma semente plantada.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(TRAILS).map((t) => {
            const learned = tick ? getLearned(t.slug).size : 0;
            const done = tick ? hasCertificate(t.slug) : false;
            return (
              <Link
                key={t.slug}
                to="/trilhas/$slug"
                params={{ slug: t.slug }}
                className={`card-elev group relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br ${t.color} p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]`}
              >
                <div className="text-5xl">{t.emoji}</div>
                <h2 className="mt-3 font-display text-2xl font-black text-cream">{t.name}</h2>
                <p className="mt-1 text-sm text-foreground/80">{t.intro}</p>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  {done ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/25 px-2.5 py-1 font-bold text-gold">
                      <Award className="h-3.5 w-3.5" /> Concluída
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 font-semibold text-cream/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf" /> {learned} aprendidas
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
