/**
 * Edite aqui os planos exibidos em /pricing.
 * `priceId` usa os IDs legíveis do catálogo de pagamentos (não os IDs internos).
 */
export type BillingCycle = "month" | "year";

export interface Tier {
  name: "Starter" | "Pro" | "Advanced";
  description: string;
  features: string[];
  priceId: { month: string; year: string };
  highlight?: boolean;
}

export const TIERS: Tier[] = [
  {
    name: "Starter",
    description: "Para começar a aprender Patxôhã no seu ritmo.",
    features: [
      "Dicionário Patxôhã com áudio",
      "Trilhas iniciais de aprendizado",
      "Aprender os números",
    ],
    priceId: { month: "awa_starter_monthly", year: "awa_starter_yearly" },
  },
  {
    name: "Pro",
    description: "Acesso completo às áreas Adulto e Infantil.",
    features: [
      "Tudo do Starter",
      "Todas as trilhas, histórias e cânticos",
      "Área Infantil completa",
      "Professor Akuã (IA) ilimitado",
    ],
    priceId: { month: "awa_pro_monthly", year: "awa_pro_yearly" },
    highlight: true,
  },
  {
    name: "Advanced",
    description: "Para educadores e escolas que querem o máximo.",
    features: [
      "Tudo do Pro",
      "Conteúdo para professores",
      "Tradutor Português ↔ Patxôhã sem limites",
      "Suporte prioritário",
    ],
    priceId: { month: "awa_advanced_monthly", year: "awa_advanced_yearly" },
  },
];

export const ALL_PRICE_IDS = TIERS.flatMap((t) => [t.priceId.month, t.priceId.year]);
