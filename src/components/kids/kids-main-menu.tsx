import { Link } from "@tanstack/react-router";
import mockup from "@/assets/kids-menu-mockup.png.asset.json";

/**
 * Menu infantil 100% fiel à arte enviada: a imagem é renderizada como está
 * (proporção original 1023x1537) e as áreas navegáveis ficam sobre ela como
 * "hotspots" invisíveis, calculados em porcentagem da arte.
 */
const W = 1023;
const H = 1537;

type Spot = { to: string; label: string; x: number; y: number; w: number; h: number };

const box = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});

const SPOTS: Spot[] = [
  // Continuar aprendendo
  { to: "/trilhas-infantil", label: "Continuar aprendendo", x: 28, y: 612, w: 480, h: 140 },
  // Trilhas de aprendizado (5 cartões) + "Ver todas"
  { to: "/trilhas-infantil", label: "Ver todas as trilhas", x: 855, y: 765, w: 150, h: 42 },
  { to: "/trilhas-infantil", label: "Trilha Saudações", x: 32, y: 808, w: 190, h: 222 },
  { to: "/trilhas-infantil", label: "Trilha Família", x: 228, y: 808, w: 190, h: 222 },
  { to: "/trilhas-infantil", label: "Trilha Natureza", x: 420, y: 808, w: 190, h: 222 },
  { to: "/trilhas-infantil", label: "Trilha Animais", x: 610, y: 808, w: 190, h: 222 },
  { to: "/trilhas-infantil", label: "Trilha Cultura", x: 800, y: 808, w: 190, h: 222 },
  // Vídeo do dia
  { to: "/musicas-infantil", label: "Assistir vídeo do dia", x: 28, y: 1046, w: 520, h: 200 },
  { to: "/musicas-infantil", label: "Assistir agora", x: 592, y: 1246, w: 272, h: 56 },
  // Explorar mais
  { to: "/musicas-infantil", label: "Pronúncia", x: 48, y: 1360, w: 92, h: 108 },
  { to: "/musicas-infantil", label: "Músicas", x: 154, y: 1360, w: 92, h: 108 },
  { to: "/historias-infantil", label: "Histórias", x: 258, y: 1360, w: 92, h: 108 },
  { to: "/historias-infantil", label: "Cultura", x: 356, y: 1360, w: 92, h: 108 },
  { to: "/aprender-numeros", label: "Aprender Números", x: 454, y: 1360, w: 92, h: 108 },
  { to: "/musicas-infantil", label: "Vídeos", x: 552, y: 1360, w: 92, h: 108 },
  // Palavra do dia
  { to: "/amizade", label: "Palavra do dia", x: 672, y: 1338, w: 330, h: 130 },
  // Barra inferior
  { to: "/infantil", label: "Início", x: 24, y: 1482, w: 190, h: 55 },
  { to: "/trilhas-infantil", label: "Aprender", x: 214, y: 1482, w: 200, h: 55 },
  { to: "/musicas-infantil", label: "Vídeos", x: 414, y: 1482, w: 190, h: 55 },
  { to: "/jogos-infantil", label: "Desafios", x: 604, y: 1482, w: 200, h: 55 },
  { to: "/minha-conta", label: "Perfil", x: 804, y: 1482, w: 195, h: 55 },
];

export function KidsMainMenu() {
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
        <img
          src={mockup.url}
          alt="Menu do Awã Tech Infantil: trilhas, vídeo do dia, palavra do dia e explorar mais"
          className="absolute inset-0 h-full w-full select-none object-contain"
          draggable={false}
        />
        {SPOTS.map((s) => (
          <Link
            key={`${s.label}-${s.x}-${s.y}`}
            to={s.to}
            aria-label={s.label}
            className="absolute rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe9b8]"
            style={box(s.x, s.y, s.w, s.h)}
          >
            <span className="sr-only">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
