import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import jungleBgAsset from "@/assets/jogos-jungle-bg.png.asset.json";

const jungleBg = jungleBgAsset.url;

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
  return (
    <div
      className="min-h-screen text-cream relative"
      style={{
        backgroundImage: `url(${jungleBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div
          className="rounded-[28px] p-10"
          style={{
            background: "linear-gradient(180deg, rgba(30,42,120,0.85), rgba(20,28,80,0.9))",
            border: "3px solid #f5c542",
            boxShadow: "0 16px 0 rgba(0,0,0,0.3), 0 24px 50px rgba(0,0,0,0.45)",
          }}
        >
          <Sparkles className="mx-auto h-10 w-10 text-gold" />
          <p className="mt-3 font-black text-gold text-lg">Novos jogos em breve 🌱</p>
        </div>
      </div>
    </div>
  );
}
