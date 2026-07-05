import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock TanStack Router — extrair componente puro sem inicializar router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => opts,
  Link: ({ to, children, ...rest }: any) =>
    React.createElement("a", { href: to, ...rest }, children),
}));

// Mock asset import
vi.mock("@/assets/awa-tech-logo.png", () => ({ default: "/logo.png" }));

import { Route } from "./bem-vindo";

const Welcome = (Route as any).options?.component ?? (Route as any).component;

describe("<Welcome /> (rota /bem-vindo)", () => {
  it("renderiza o hero com marca e slogan", () => {
    render(<Welcome />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/AWÃ.*TECH/);
    expect(screen.getByText(/LÍNGUAS INDÍGENAS, CULTURAS VIVAS/i)).toBeInTheDocument();
    expect(screen.getByAltText("AWÃ TECH")).toHaveAttribute("src", "/logo.png");
  });

  it("mostra os 3 CTAs principais com destinos corretos", () => {
    render(<Welcome />);
    const criar = screen.getByRole("link", { name: /Criar minha conta/i });
    const entrar = screen.getByRole("link", { name: /Entrar com conta existente/i });
    const conhecer = screen.getByRole("link", { name: /Conhecer sem cadastro/i });

    expect(criar).toHaveAttribute("href", "/auth");
    expect(entrar).toHaveAttribute("href", "/auth");
    expect(conhecer).toHaveAttribute("href", "/");
  });

  it("lista os 5 benefícios da versão gratuita", () => {
    render(<Welcome />);
    expect(screen.getByRole("heading", { name: /Versão Gratuita/i })).toBeInTheDocument();
    for (const t of [
      /Galeria com histórias/i,
      /Dicionário básico Patxohã/i,
      /Biografia completa/i,
      /Amostras curtas/i,
      /cultura, traços e artesanato/i,
    ]) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
  });

  it("mostra a chamada Premium com link para /planos", () => {
    render(<Welcome />);
    expect(screen.getByRole("heading", { name: /Awã Premium/i })).toBeInTheDocument();
    const assinar = screen.getByRole("link", { name: /Assinar agora/i });
    expect(assinar).toHaveAttribute("href", "/planos");
  });

  it("exibe o ano corrente no rodapé", () => {
    render(<Welcome />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("define título e descrição via head()", () => {
    const head = (Route as any).options?.head?.() ?? (Route as any).head?.();
    const meta = head.meta as Array<Record<string, string>>;
    expect(meta.find((m) => m.title)?.title).toMatch(/Bem-vindo/i);
    expect(meta.find((m) => m.name === "description")?.content).toMatch(/Pataxó/);
    expect(meta.find((m) => m.property === "og:title")?.content).toMatch(/AWÃ TECH/);
  });
});
