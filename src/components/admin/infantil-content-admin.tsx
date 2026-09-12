import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getStoriesConfig, updateStoriesConfig, getGamesConfig, updateGamesConfig, getTrailsTotemsConfig, updateTrailsTotemsConfig } from "@/lib/infantil-content.functions";
import { toast } from "sonner";
import { Save, Plus, Trash2, BookOpen, Gamepad2, Map, Upload, Loader2, Volume2, Type, Palette } from "lucide-react";
import { Field, Input, Btn, Card, Textarea } from "./ui";
import { supabase } from "@/integrations/supabase/client";
import { notifyContentUpdated } from "@/lib/notify-content-updated";

export function InfantilContentAdmin() {
  const [tab, setTab] = useState<"stories" | "games" | "trails">("stories");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-black/20 rounded-2xl w-fit">
        <button
          onClick={() => setTab("stories")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            tab === "stories" ? "bg-gold text-forest-deep shadow-lg" : "text-foreground/60 hover:text-cream"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Histórias
        </button>
        <button
          onClick={() => setTab("games")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            tab === "games" ? "bg-gold text-forest-deep shadow-lg" : "text-foreground/60 hover:text-cream"
          }`}
        >
          <Gamepad2 className="h-4 w-4" /> Jogos
        </button>
        <button
          onClick={() => setTab("trails")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            tab === "trails" ? "bg-gold text-forest-deep shadow-lg" : "text-foreground/60 hover:text-cream"
          }`}
        >
          <Map className="h-4 w-4" /> Trilhas
        </button>
      </div>

      {tab === "stories" && <StoriesAdmin />}
      {tab === "games" && <GamesAdmin />}
      {tab === "trails" && <TrailsTotemsAdmin />}
    </div>
  );
}

function StoriesAdmin() {
  const qc = useQueryClient();
  const getFn = useServerFn(getStoriesConfig);
  const updateFn = useServerFn(updateStoriesConfig);

  const { data: stories, isLoading } = useQuery({
    queryKey: ["site_config", "infantil_stories"],
    queryFn: () => getFn(),
  });

  const [draft, setDraft] = useState<any[]>([]);

  useEffect(() => {
    if (stories) setDraft(stories);
  }, [stories]);

  async function save() {
    try {
      await updateFn({ data: draft });
      toast.success("Histórias atualizadas!");
      qc.invalidateQueries({ queryKey: ["site_config", "infantil_stories"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (isLoading) return <div className="py-10 text-center text-foreground/60">Carregando histórias...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-black text-cream">Gerenciar Histórias</h3>
          <Btn variant="outline" onClick={() => setDraft([...draft, { id: crypto.randomUUID(), title: "", highlight: "", paragraphs: [""], chip: "", chipEmoji: "📖", color: "#f4a261", accent: "#2f6d3a", image: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Nova História
          </Btn>
        </div>

        <div className="space-y-6">
          {draft.map((s, i) => (
            <div key={s.id || i} className="p-4 rounded-2xl border border-gold/10 bg-black/20 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Título">
                  <Input value={s.title} onChange={e => {
                    const copy = [...draft];
                    copy[i].title = e.target.value;
                    setDraft(copy);
                  }} />
                </Field>
                <Field label="Destaque">
                  <Input value={s.highlight} onChange={e => {
                    const copy = [...draft];
                    copy[i].highlight = e.target.value;
                    setDraft(copy);
                  }} />
                </Field>
                <Field label="Chip (Categoria)">
                  <div className="flex gap-2">
                    <Input className="w-16" value={s.chipEmoji} onChange={e => {
                      const copy = [...draft];
                      copy[i].chipEmoji = e.target.value;
                      setDraft(copy);
                    }} />
                    <Input value={s.chip} onChange={e => {
                      const copy = [...draft];
                      copy[i].chip = e.target.value;
                      setDraft(copy);
                    }} />
                  </div>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <UploadOrUrl
                  label="Imagem da Capa"
                  value={s.image}
                  onChange={(v: string) => {
                    const copy = [...draft];
                    copy[i].image = v;
                    setDraft(copy);
                  }}
                  onFile={async (file: File) => {

                    const path = `stories/covers/${crypto.randomUUID()}.${(file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
                    const { error } = await supabase.storage.from("songs").upload(path, file);
                    if (error) return toast.error(error.message);
                    const { data } = await supabase.storage.from("songs").createSignedUrl(path, 60 * 60 * 24 * 365);
                    const copy = [...draft];
                    copy[i].image = data?.signedUrl || "";
                    setDraft(copy);
                    toast.success("Capa enviada!");
                  }}
                  accept="image/*"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Cor Principal">
                    <Input type="color" value={s.color} onChange={e => {
                      const copy = [...draft];
                      copy[i].color = e.target.value;
                      setDraft(copy);
                    }} />
                  </Field>
                  <Field label="Cor de Destaque">
                    <Input type="color" value={s.accent} onChange={e => {
                      const copy = [...draft];
                      copy[i].accent = e.target.value;
                      setDraft(copy);
                    }} />
                  </Field>
                </div>
              </div>

              <Field label="Parágrafos (um por linha)">
                <Textarea 
                  rows={4} 
                  value={s.paragraphs?.join("\n")} 
                  onChange={e => {
                    const copy = [...draft];
                    copy[i].paragraphs = e.target.value.split("\n");
                    setDraft(copy);
                  }} 
                />
              </Field>

              <div className="flex justify-end">
                <Btn variant="danger" onClick={() => setDraft(draft.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4" /> Excluir
                </Btn>
              </div>
            </div>
          ))}
        </div>

        <Btn className="mt-8 w-full" onClick={save}>
          <Save className="h-4 w-4" /> Salvar Histórias
        </Btn>
      </Card>
    </div>
  );
}

function GamesAdmin() {
  const qc = useQueryClient();
  const getFn = useServerFn(getGamesConfig);
  const updateFn = useServerFn(updateGamesConfig);

  const { data: games, isLoading } = useQuery({
    queryKey: ["site_config", "infantil_games"],
    queryFn: () => getFn(),
  });

  const [draft, setDraft] = useState<any[]>([]);

  useEffect(() => {
    if (games) setDraft(games);
  }, [games]);

  async function save() {
    try {
      await updateFn({ data: draft });
      toast.success("Jogos atualizados!");
      qc.invalidateQueries({ queryKey: ["site_config", "infantil_games"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (isLoading) return <div className="py-10 text-center text-foreground/60">Carregando jogos...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-black text-cream">Gerenciar Jogos</h3>
          <Btn variant="outline" onClick={() => setDraft([...draft, { id: crypto.randomUUID(), title: "", desc: "", emoji: "🎮", color: "from-emerald-400 to-emerald-600" }])}>
            <Plus className="h-3.5 w-3.5" /> Novo Jogo
          </Btn>
        </div>

        <div className="space-y-4">
          {draft.map((g, i) => (
            <div key={g.id || i} className="grid gap-3 p-4 rounded-2xl border border-gold/10 bg-black/20 md:grid-cols-[80px_1fr_2fr_1fr_auto]">
              <Field label="Emoji">
                <Input value={g.emoji} onChange={e => {
                  const copy = [...draft];
                  copy[i].emoji = e.target.value;
                  setDraft(copy);
                }} />
              </Field>
              <Field label="Título">
                <Input value={g.title} onChange={e => {
                  const copy = [...draft];
                  copy[i].title = e.target.value;
                  setDraft(copy);
                }} />
              </Field>
              <Field label="Descrição">
                <Input value={g.desc} onChange={e => {
                  const copy = [...draft];
                  copy[i].desc = e.target.value;
                  setDraft(copy);
                }} />
              </Field>
              <Field label="Cores (Tailwind)">
                <Input value={g.color} onChange={e => {
                  const copy = [...draft];
                  copy[i].color = e.target.value;
                  setDraft(copy);
                }} placeholder="from-color to-color" />
              </Field>
              <div className="flex items-end pb-1">
                <Btn variant="danger" onClick={() => setDraft(draft.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Btn>
              </div>
            </div>
          ))}
        </div>

        <Btn className="mt-8 w-full" onClick={save}>
          <Save className="h-4 w-4" /> Salvar Jogos
        </Btn>
      </Card>
    </div>
  );
}

function TrailsTotemsAdmin() {
  const qc = useQueryClient();
  const getFn = useServerFn(getTrailsTotemsConfig);
  const updateFn = useServerFn(updateTrailsTotemsConfig);

  const { data: totems, isLoading } = useQuery({
    queryKey: ["site_config", "infantil_trails_totems"],
    queryFn: () => getFn(),
  });

  const [draft, setDraft] = useState<Record<string, any>>({});

  useEffect(() => {
    if (totems) setDraft(totems);
  }, [totems]);

  async function save() {
    try {
      await updateFn({ data: draft });
      toast.success("Totens das trilhas atualizados!");
      qc.invalidateQueries({ queryKey: ["site_config", "infantil_trails_totems"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (isLoading) return <div className="py-10 text-center text-foreground/60">Carregando totens...</div>;

  const slugs = ["saudacoes", "familia", "natureza", "animais"];

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-lg font-black text-cream mb-6">Estilo dos Totens da Aldeia</h3>
        
        <div className="space-y-8">
          {slugs.map((slug) => {
            const s = draft[slug] || { emoji: "✨", color: "#000000", shadow: "rgba(0,0,0,0.45)", islandTop: "#ffffff", islandBottom: "#cccccc", rotate: "0deg" };
            return (
              <div key={slug} className="p-4 rounded-2xl border border-gold/10 bg-black/20 space-y-4">
                <h4 className="font-bold text-gold uppercase tracking-wider">{slug}</h4>
                <div className="grid gap-4 md:grid-cols-4">
                  <Field label="Emoji">
                    <Input value={s.emoji} onChange={e => {
                      setDraft({ ...draft, [slug]: { ...s, emoji: e.target.value } });
                    }} />
                  </Field>
                  <Field label="Cor Principal">
                    <Input type="color" value={s.color} onChange={e => {
                      setDraft({ ...draft, [slug]: { ...s, color: e.target.value } });
                    }} />
                  </Field>
                  <Field label="Ilha (Topo)">
                    <Input type="color" value={s.islandTop} onChange={e => {
                      setDraft({ ...draft, [slug]: { ...s, islandTop: e.target.value } });
                    }} />
                  </Field>
                  <Field label="Ilha (Base)">
                    <Input type="color" value={s.islandBottom} onChange={e => {
                      setDraft({ ...draft, [slug]: { ...s, islandBottom: e.target.value } });
                    }} />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Sombra (RGBA)">
                    <Input value={s.shadow} onChange={e => {
                      setDraft({ ...draft, [slug]: { ...s, shadow: e.target.value } });
                    }} />
                  </Field>
                  <Field label="Rotação (ex: -3deg)">
                    <Input value={s.rotate} onChange={e => {
                      setDraft({ ...draft, [slug]: { ...s, rotate: e.target.value } });
                    }} />
                  </Field>
                </div>
              </div>
            );
          })}
        </div>

        <Btn className="mt-8 w-full" onClick={save}>
          <Save className="h-4 w-4" /> Salvar Totens
        </Btn>
      </Card>
    </div>
  );
}

function UploadOrUrl({
  label,
  value,
  onChange,
  onFile,
  accept,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFile: (f: File) => void;
  accept: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Field label={label}>
      <div className="flex flex-col gap-2">
        <Input 
          className="w-full text-xs" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder="https://..." 
        />
        <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-gold/40 bg-card/40 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10 transition">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {busy ? "Enviando..." : "Gravar/Enviar Arquivo"}
          <input type="file" accept={accept} className="hidden" onChange={async e => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try { 
              await onFile(f); 
            } finally { 
              setBusy(false); 
              e.currentTarget.value = "";
            }
          }} />
        </label>
      </div>
    </Field>
  );
}


