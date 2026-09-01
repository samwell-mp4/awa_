import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Volume2, Square, X } from "lucide-react";
import { requireArea } from "@/lib/area-guard";
import { setLastArea } from "@/lib/last-area";
import { speak, stopSpeak } from "@/lib/speak";
import { getStoriesConfig } from "@/lib/infantil-content.functions";
import { KIDS_STORIES, type KidsStory } from "@/lib/kids-data";
import { KidsPage, KidsCard } from "@/components/kids/kids-page";

export const Route = createFileRoute("/historias-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Histórias da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Histórias do povo Pataxó contadas para crianças: anciãos, aldeia, língua Patxôhã, Awê e floresta.",
      },
      { property: "og:title", content: "Histórias da Aldeia — Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Contos dos anciãos Pataxó para as crianças ouvirem e sonharem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoriasInfantilPage,
});

function HistoriasInfantilPage() {
  useEffect(() => setLastArea("/infantil"), []);
  useEffect(() => () => stopSpeak(), []);

  const getFn = useServerFn(getStoriesConfig);
  const { data: configStories } = useQuery({
    queryKey: ["site_config", "infantil_stories"],
    queryFn: () => getFn(),
    staleTime: 1000 * 60 * 10,
  });

  const stories = useMemo<KidsStory[]>(() => {
    if (Array.isArray(configStories) && configStories.length > 0) {
      return configStories as KidsStory[];
    }
    return KIDS_STORIES;
  }, [configStories]);

  const [open, setOpen] = useState<KidsStory | null>(null);

  return (
    <KidsPage title="Histórias" subtitle="Escolha um conto da aldeia" emoji="📖">
      <ul className="grid gap-4 md:grid-cols-2">
        {stories.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => {
                stopSpeak();
                setOpen(s);
              }}
              className="w-full overflow-hidden rounded-[1.75rem] border-[5px] border-[#e9c46a] bg-[#fdfcf0] text-left shadow-[0_12px_0_-4px_rgba(0,0,0,.35)] transition-transform active:translate-y-1 active:shadow-none"
            >
              <img
                src={s.image}
                alt={s.title}
                loading="lazy"
                className="h-40 w-full object-cover"
              />
              <span className="block p-4 text-[#123a2b]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#14503c] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#ffe9b8]">
                  {s.chipEmoji} {s.chip}
                </span>
                <span className="mt-2 block font-display text-2xl leading-tight">
                  {s.title}
                </span>
                <span className="block text-sm font-bold text-[#3f6b57]">
                  {s.highlight}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && <StoryReader story={open} onClose={() => setOpen(null)} />}
    </KidsPage>
  );
}

function StoryReader({ story, onClose }: { story: KidsStory; onClose: () => void }) {
  const [reading, setReading] = useState(false);

  const fullText = `${story.title}. ${story.highlight}. ${story.paragraphs.join(" ")} ${
    story.quote ?? ""
  }`;

  useEffect(() => () => stopSpeak(), []);

  const toggle = () => {
    if (reading) {
      stopSpeak();
      setReading(false);
      return;
    }
    setReading(true);
    speak(fullText, "pt-BR", 0.95, undefined, () => setReading(false));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0d2b21]/95 p-4 backdrop-blur">
      <KidsCard className="mx-auto max-w-lg overflow-hidden">
        <div className="relative">
          <img src={story.image} alt={story.title} className="h-48 w-full object-cover" />
          <button
            onClick={() => {
              stopSpeak();
              onClose();
            }}
            aria-label="Fechar história"
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border-[3px] border-[#fdfcf0] bg-[#e76f51] text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <h2 className="font-display text-3xl leading-tight">{story.title}</h2>
          <p className="text-sm font-black uppercase tracking-wide text-[#3f6b57]">
            {story.highlight}
          </p>

          <button
            onClick={toggle}
            className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-[#123a2b] bg-[#e9c46a] px-4 py-2 text-sm font-black uppercase tracking-wide text-[#123a2b]"
          >
            {reading ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {reading ? "Parar" : "Ouvir a história"}
          </button>

          <div className="mt-4 space-y-3 text-[15px] font-semibold leading-relaxed">
            {story.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {story.quote && (
            <blockquote className="mt-4 rounded-2xl border-l-[6px] border-[#e76f51] bg-[#f2ead6] p-3 text-sm font-bold italic">
              “{story.quote}”
            </blockquote>
          )}
        </div>
      </KidsCard>
    </div>
  );
}
