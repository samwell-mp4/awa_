import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AdultPlayer, type Song } from "@/components/music/AdultPlayer";

// Mock router / pickLang / supabase / audio
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => opts,
  Link: ({ to, children, ...rest }: any) => React.createElement("a", { href: to, ...rest }, children),
}));

vi.mock("@/lib/pick-lang", () => ({
  useLang: () => "pt",
  pickLang: (row: any, field: string) => row[field],
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

const mockSong: Song = {
  id: "test-adult-song-1",
  title: "Cântico Sagrado de Exemplo",
  artist: "Txopai Pataxó",
  language: "Patxôhã",
  audio_url: "https://example.com/audio.mp3",
  cover_url: null,
  video_url: null,
  ambient_video_id: null,
  lyrics_indigenous: "Awê Pataxó\nMayõ werimehe\nErtõ Pataxó",
  lyrics_pt: "Salve Pataxó\nPovo unido cantando\nForça Pataxó",
  description: "Cântico sagrado de união entoado nos rituais.",
  aldeia: "Aldeia Velha",
  duration_seconds: 90,
};

describe("AdultPlayer Media Player Component", () => {
  it("renders the player modal in maximized state by default with bilingual mode", () => {
    render(
      <AdultPlayer
        song={mockSong}
        songs={[mockSong]}
        onClose={vi.fn()}
        onChange={vi.fn()}
        initialMaximized={true}
      />
    );

    // Should display song title
    expect(screen.getAllByText("Cântico Sagrado de Exemplo").length).toBeGreaterThan(0);
    // Should display tabs
    expect(screen.getByText("Bilíngue")).toBeDefined();
    expect(screen.getByText("Lado a Lado")).toBeDefined();
    expect(screen.getByText("Patxôhã")).toBeDefined();
    expect(screen.getByText("Português")).toBeDefined();
    expect(screen.getByText("Vinil & Capa")).toBeDefined();

    // Default view is Bilíngue - should display verses from both languages
    expect(screen.getByText("Awê Pataxó")).toBeDefined();
    expect(screen.getByText("Salve Pataxó")).toBeDefined();
  });

  it("switches to 'Lado a Lado' (split) view when clicking the tab", () => {
    render(
      <AdultPlayer
        song={mockSong}
        songs={[mockSong]}
        onClose={vi.fn()}
        onChange={vi.fn()}
        initialMaximized={true}
      />
    );

    const splitBtn = screen.getByText("Lado a Lado");
    fireEvent.click(splitBtn);

    // Both columns should be present with their headers
    expect(screen.getByText("Exibição Lado a Lado · Duas Colunas Paralelas")).toBeDefined();
    expect(screen.getAllByText("Mayõ werimehe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Povo unido cantando").length).toBeGreaterThan(0);
  });

  it("switches to 'Patxôhã' and 'Português' solo views cleanly", () => {
    render(
      <AdultPlayer
        song={mockSong}
        songs={[mockSong]}
        onClose={vi.fn()}
        onChange={vi.fn()}
        initialMaximized={true}
      />
    );

    // Switch to Patxôhã
    fireEvent.click(screen.getByText("Patxôhã"));
    expect(screen.getByText("Patxôhã Puro · Letra na Língua Sagrada")).toBeDefined();
    expect(screen.getByText("Ertõ Pataxó")).toBeDefined();

    // Switch to Português
    fireEvent.click(screen.getByText("Português"));
    expect(screen.getByText("Português · Tradução e Significado")).toBeDefined();
    expect(screen.getByText("Força Pataxó")).toBeDefined();
  });

  it("minimizes into floating bottom dock and maximizes back", () => {
    render(
      <AdultPlayer
        song={mockSong}
        songs={[mockSong]}
        onClose={vi.fn()}
        onChange={vi.fn()}
        initialMaximized={true}
      />
    );

    // Click minimize button
    const minBtn = screen.getByTitle("Minimizar player");
    fireEvent.click(minBtn);

    // Docked mini player should show expand button
    const expandBtn = screen.getByTitle("Expandir player");
    expect(expandBtn).toBeDefined();

    // Click expand
    fireEvent.click(expandBtn);

    // Full modal should be visible again
    expect(screen.getByTitle("Minimizar player")).toBeDefined();
  });
});
