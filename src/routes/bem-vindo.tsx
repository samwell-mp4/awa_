import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus, LogIn, Eye, Sparkles, Check, Star } from "lucide-react";
import logoSrc from "@/assets/awa-tech-logo.png";

export const Route = createFileRoute("/bem-vindo")({
  head: () => ({
    meta: [
      { title: "Bem-vindo — AWÃ TECH" },
      {
        name: "description",
        content:
          "O caminho para conhecer, aprender e preservar a sabedoria do povo Pataxó e de outros povos originários.",
      },
      { property: "og:title", content: "Bem-vindo ao AWÃ TECH" },
      {
        property: "og:description",
        content: "Línguas Indígenas, Culturas Vivas. Crie sua conta ou conheça sem cadastro.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="min-h-screen bg-[var(--gradient-forest)] text-cream">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-start px-5 py-10 md:py-14">
        {/* HERO */}
        <header className="flex flex-col items-center text-center">
          <img
            src={logoSrc}
            alt="AWÃ TECH"
            className="h-24 w-24 rounded-full bg-cream/95 p-1 shadow-[var(--shadow-glow)] ring-2 ring-gold/50 md:h-28 md:w-28"
          />
          <h1 className="mt-5 font-display text-4xl font-black tracking-tight md:text-5xl">
            AWÃ <span className="text-leaf">TECH</span>
          </h1>
          <p className="mt-1 text-xs font-semibold tracking-[0.22em] text-gold/90">
            LÍNGUAS INDÍGENAS, CULTURAS VIVAS
          </p>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-foreground/85 md:text-base">
            Bem-vindo ao <b className="text-cream">Awã Tech</b>: o caminho para conhecer, aprender
            e preservar a sabedoria do povo <b className="text-leaf">Pataxó</b> e de outros povos
            originários.
          </p>
        </header>

        {/* BUTTONS */}
        <section className="mt-8 grid w-full max-w-md gap-3">
          <Link
            to="/auth"
            className="group flex items-center gap-3 rounded-2xl bg-[var(--gradient-leaf)] px-5 py-4 font-bold text-cream shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cream/15">
              <UserPlus className="h-5 w-5" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-base">Criar minha conta</span>
              <span className="block text-[11px] font-medium text-cream/80">Cadastro rápido</span>
            </span>
          </Link>

          <Link
            to="/auth"
            className="group flex items-center gap-3 rounded-2xl border border-gold/40 bg-card/60 px-5 py-4 font-bold text-cream backdrop-blur transition hover:bg-card/80"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/20 text-gold">
              <LogIn className="h-5 w-5" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-base">Entrar com conta existente</span>
              <span className="block text-[11px] font-medium text-foreground/70">Acesso rápido</span>
            </span>
          </Link>

          <Link
            to="/"
            className="group flex items-center gap-3 rounded-2xl border border-leaf/40 bg-transparent px-5 py-4 font-bold text-cream transition hover:bg-leaf/10"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-leaf/20 text-leaf">
              <Eye className="h-5 w-5" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-base">Conhecer sem cadastro</span>
              <span className="block text-[11px] font-medium text-foreground/70">
                Acesso à versão gratuita
              </span>
            </span>
          </Link>
        </section>

        {/* FREE VERSION PRESENTATION */}
        <section className="mt-10 w-full max-w-2xl rounded-3xl border border-leaf/30 bg-card/50 p-5 backdrop-blur md:p-7">
          <h2 className="flex items-center gap-2 font-display text-xl font-black text-leaf">
            🔓 Versão Gratuita
          </h2>
          <p className="mt-1 text-sm text-foreground/80">O que você pode explorar:</p>
          <ul className="mt-4 grid gap-2 text-sm text-foreground/90 md:grid-cols-2">
            {[
              "Galeria com histórias e imagens explicadas",
              "Dicionário básico Patxohã — palavras essenciais",
              "Biografia completa do Awã Tech",
              "Amostras curtas de áudios, músicas e vídeos",
              "Informações sobre cultura, traços e artesanato",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf" /> {t}
              </li>
            ))}
          </ul>
        </section>

        {/* PREMIUM CALL */}
        <section className="mt-6 w-full max-w-2xl rounded-3xl border border-gold/40 bg-[oklch(0.22_0.06_75/0.55)] p-5 shadow-[var(--shadow-glow)] backdrop-blur md:p-7">
          <div className="flex items-center gap-2 text-gold">
            <Star className="h-5 w-5 fill-gold" />
            <h2 className="font-display text-xl font-black">Awã Premium</h2>
          </div>
          <p className="mt-1 text-sm text-foreground/85">
            Todo o conhecimento ao seu alcance — dicionário completo, cursos, trilhas, jogos e
            acervo integral de áudios, músicas e vídeos.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-foreground/90 md:grid-cols-2">
            {[
              "Dicionário completo + pronúncia em áudio",
              "Cursos completos da língua Patxohã",
              "Histórias, lendas e narrações integrais",
              "Áudios, músicas e vídeos completos",
              "Trilhas, jogos e exercícios",
              "Espaço exclusivo para professores",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/planos"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-black text-forest-deep shadow-[var(--shadow-glow)] hover:brightness-110"
            >
              Assinar agora
            </Link>
            <Link
              to="/"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-leaf/40 px-5 py-3 text-sm font-semibold text-cream hover:bg-leaf/10"
            >
              Continuar na versão gratuita
            </Link>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-foreground/60">
          © {new Date().getFullYear()} AWÃ TECH — Caminho da Sabedoria
        </footer>
      </main>
    </div>
  );
}
