import { resourceCards } from "@/lib/home-content";

export function ResourcesSection() {
  return (
    <section className="mt-10">
      <div className="mb-4 text-center">
        <div className="tribal-border mx-auto w-20" />
        <h2 className="mt-3 font-display text-2xl font-black text-cream md:text-3xl">
          Recursos da plataforma
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-foreground/70">
          Tudo o que você precisa para mergulhar nas línguas e culturas dos povos originários.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {resourceCards.map((r) => (
          <div
            key={r.label}
            className="card-elev group rounded-2xl p-5 transition hover:-translate-y-1"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]">
              <r.icon className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-display text-lg font-bold text-cream">{r.label}</h4>
            <p className="mt-1 text-xs leading-relaxed text-foreground/70">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
