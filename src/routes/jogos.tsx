import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gamepad2, Trophy, Sparkles } from "lucide-react";
import jungleBg from "@/assets/jogos-jungle-bg.jpg";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos Awã Tech — Aprenda Patxôhã brincando" },
      { name: "description", content: "Jogos culturais Pataxó para aprender Patxôhã brincando." },
      { property: "og:title", content: "Jogos Awã Tech" },
      { property: "og:description", content: "Aprenda Patxôhã brincando com jogos culturais Pataxó." },
    ],
  }),
  component: JogosPage,
});

function JogosPage() {
  const [score] = useState(0);

  return (
    <div
      className="min-h-screen text-cream relative"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,40,20,0.35) 0%, rgba(10,40,20,0.15) 30%, rgba(10,40,20,0.55) 100%), url(${jungleBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-[28px] text-forest-deep"
            style={{
              background: "linear-gradient(160deg,#ffe066,#ffa62b)",
              boxShadow:
                "0 10px 0 #b26a00, 0 18px 30px rgba(0,0,0,0.35), inset 0 -6px 12px rgba(0,0,0,0.15), inset 0 4px 6px rgba(255,255,255,0.5)",
              transform: "rotate(-4deg)",
            }}
          >
            <Gamepad2 className="h-10 w-10" />
          </div>
          <h1
            className="font-serif text-4xl md:text-6xl font-black tracking-tight"
            style={{
              background: "linear-gradient(180deg,#fff9c2 0%,#ffd166 60%,#ff9a3c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 6px 0 rgba(0,0,0,0.35)",
              filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.5))",
            }}
          >
            Jogos Awã Tech
          </h1>
          <p className="mt-3 text-cream/90 px-2 text-base md:text-lg font-semibold">
            Aprenda Patxôhã brincando 🌈✨ — jogos do povo Pataxó
          </p>
          <div
            className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 font-black text-cream text-lg"
            style={{
              background: "linear-gradient(160deg,#ff5470,#c81d5e)",
              boxShadow:
                "0 8px 0 #7a0d38, 0 14px 24px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.35)",
            }}
          >
            <Trophy className="h-5 w-5 text-gold drop-shadow" /> <span>{score} pontos</span>
          </div>
        </div>

        <div
          className="rounded-[32px] p-8 md:p-12 text-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(30,42,120,0.85) 0%, rgba(20,28,80,0.9) 100%)",
            border: "4px solid #f5c542",
            outline: "3px solid #c8451f",
            outlineOffset: "-10px",
            boxShadow:
              "0 20px 0 rgba(0,0,0,0.35), 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 8px rgba(245,197,66,0.15)",
          }}
        >
          <Sparkles className="mx-auto h-12 w-12 text-gold drop-shadow" />
          <h2 className="mt-4 text-2xl md:text-3xl font-black text-gold">Novos jogos chegando 🌱</h2>
          <p className="mt-3 text-cream/85 max-w-md mx-auto">
            Estamos preparando jogos novos com um layout especial para o povo Pataxó. Volte em breve!
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-cream/70 font-semibold">
          Todos os jogos são gratuitos 🌱 — cortesia do povo Pataxó para as próximas gerações.
        </p>
      </div>
    </div>
  );
}
