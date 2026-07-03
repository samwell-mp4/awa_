import { Award, Flame, Sparkles, Star } from "lucide-react";
import heroAsset from "@/assets/awa-hero.jpg.asset.json";
import { Stat } from "./stat";

const heroWoman = heroAsset.url;

export function HeroSection() {
  return (
    <section id="início" className="relative mt-6 overflow-hidden rounded-3xl card-elev">
      <div className="grid md:grid-cols-2">
        <div className="relative order-2 md:order-1 p-6 md:p-10">
          <span className="chip-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Patrimônio vivo
          </span>
          <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] text-cream md:text-5xl lg:text-6xl">
            Aprenda <span className="text-leaf">línguas indígenas</span>, preserve culturas
            <span className="text-gold"> vivas</span>.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/75 md:text-base">
            Uma plataforma digital para aprender idiomas indígenas brasileiros através de
            vídeos, histórias, músicas e desafios — guiados por mestres das aldeias.
          </p>

          <div className="mt-7 grid grid-cols-3 gap-2 rounded-2xl border border-gold/25 bg-[oklch(0.16_0.04_145/0.6)] p-3 text-center">
            <Stat icon={<Flame className="h-4 w-4 text-gold" />} label="Sequência" value="7" sub="dias" />
            <Stat icon={<Star className="h-4 w-4 text-gold" />} label="Pontos" value="250" sub="pontos" />
            <Stat icon={<Award className="h-4 w-4 text-gold" />} label="Nível" value="2" sub="Aprendiz" />
          </div>
        </div>

        <div className="relative order-1 md:order-2 min-h-[280px] md:min-h-[520px]">
          <img
            src={heroWoman}
            alt="Mulher indígena brasileira com cocar tradicional na floresta amazônica"
            width={1024}
            height={1536}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r" />
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-gold/40 bg-card/80 px-3 py-1.5 backdrop-blur">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gold/25 text-[10px] font-black text-gold">
              AK
            </div>
            <div className="text-xs leading-tight">
              <div className="text-foreground/70">Olá,</div>
              <div className="font-bold text-gold">Akuá!</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
