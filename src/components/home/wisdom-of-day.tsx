import { Link } from "@tanstack/react-router";
import { fraseDoDia } from "@/lib/trilhas";

export function WisdomOfDay() {
  return (
    <section className="mt-6">
      <Link
        to="/trilhas"
        className="card-elev block rounded-2xl border border-gold/25 bg-gradient-to-br from-forest-deep/60 to-bark/30 p-5 transition hover:-translate-y-0.5"
      >
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
          Sabedoria do dia · Trilhas
        </div>
        <p className="mt-2 font-display text-lg md:text-xl font-bold text-cream">{fraseDoDia()}</p>
        <p className="mt-2 text-xs text-foreground/70">
          Toque para entrar nas trilhas guiadas pelo Professor Akuã →
        </p>
      </Link>
    </section>
  );
}
