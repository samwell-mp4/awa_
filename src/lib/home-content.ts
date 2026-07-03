import {
  Award,
  BookOpen,
  Download,
  Home,
  Library,
  Play,
  ScrollText,
  Sparkles,
  Star,
  Trophy,
  Video,
  type LucideIcon,
} from "lucide-react";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";
import trailFamilia from "@/assets/trail-familia.jpg";
import trailNatureza from "@/assets/trail-natureza.jpg";
import trailAnimais from "@/assets/trail-animais.jpg";

export const fallbackTrailImages: Record<string, string> = {
  Saudações: trailSaudacoes,
  Família: trailFamilia,
  Natureza: trailNatureza,
  Animais: trailAnimais,
};

export type TrailSlug = "saudacoes" | "familia" | "natureza" | "animais";

export const trailSlugMap: Record<string, TrailSlug> = {
  Saudações: "saudacoes",
  Família: "familia",
  Natureza: "natureza",
  Animais: "animais",
};

export const rankingSeed = [
  { name: "Aruá Pataxó", points: 780, initials: "AP" },
  { name: "Jandira Txã", points: 650, initials: "JT" },
  { name: "Txai Uru", points: 520, initials: "TU" },
];

export const resourceCards: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: ScrollText, label: "Histórias", desc: "Narrativas ancestrais em texto e áudio." },
  { icon: Video, label: "Vídeos", desc: "Cenas e narrativas da aldeia Pataxó." },
];

export type NavItem = { label: string; href: string; icon: LucideIcon; premium?: boolean };
export type NavGroup = { title: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    title: "Língua e Conhecimento",
    items: [
      { label: "Dicionário", href: "/dicionario", icon: Library },
      { label: "Tradutor", href: "/traduzir", icon: BookOpen },
      { label: "Trilhas", href: "/trilhas", icon: Award },
      { label: "Espaço do Professor", href: "/professor", icon: Sparkles },
    ],
  },
  {
    title: "Cultura e Expressões",
    items: [
      { label: "Histórias e Narrativas", href: "/historias", icon: ScrollText },
      { label: "Músicas e Cantigas", href: "/musicas", icon: Play },
      { label: "Vídeos e Registros", href: "/videos", icon: Video },
      { label: "Jogos e Atividades", href: "/jogos", icon: Trophy },
    ],
  },
  {
    title: "Quem Somos e Ajuda",
    items: [
      { label: "Biografia Awã Tech", href: "/biografia", icon: BookOpen },
      { label: "Baixar / Instalar App", href: "/instalar", icon: Download },
      { label: "Boas-vindas", href: "/bem-vindo", icon: Home },
    ],
  },
  {
    title: "Área do Usuário",
    items: [{ label: "Awã Premium", href: "/planos", icon: Star }],
  },
];

export const topNavLinks = [
  { label: "Dicionário", href: "/dicionario" },
  { label: "Tradutor", href: "/traduzir" },
  { label: "Trilhas", href: "/trilhas" },
  { label: "Histórias", href: "/historias" },
  { label: "Músicas", href: "/musicas" },
  { label: "Vídeos", href: "/videos" },
  { label: "Jogos", href: "/jogos" },
];
