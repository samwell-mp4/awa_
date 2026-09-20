import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Eye, Loader2, RotateCcw, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveSongStyle } from "@/lib/visual-editor.functions";
import { notifyContentUpdated } from "@/lib/notify-content-updated";
import { MiniPlayer, type MiniPlayerSong, type SongStyle } from "@/components/kids/MiniPlayer";
import { Btn, Card, Field, Input } from "./ui";

type SongRow = MiniPlayerSong & { style: SongStyle | null };

const DEFAULTS: SongStyle = {
  bg_color: "#4a2c13",
  panel_color: "#fffbeb",
  indigenous_color: "#ecfdf5",
  translation_color: "#f6e7c4",
  accent_color: "#fde68a",
  layout: "lado-a-lado",
};

export function SongStyleEditor() {
  const qc = useQueryClient();
  const saveFn = useServerFn(saveSongStyle);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [style, setStyle] = useState<SongStyle>(DEFAULTS);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["admin_songs_style"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(
          "id,title,artist,audio_url,cover_url,language,lyrics_indigenous,lyrics_pt,lyrics_pt_en,lyrics_pt_es,duration_seconds,sync_offsets,sync_times,style",
        )
        .eq("is_active", true)
        .order("order_index");
      if (error) throw error;
      return data as unknown as SongRow[];
    },
  });

  const song = songs.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (!song) return;
    setStyle({ ...DEFAULTS, ...(song.style ?? {}) });
  }, [selectedId, songs.length]);

  async function publish() {
    if (!song) return;
    setBusy(true);
    try {
      await saveFn({ data: { id: song.id, style } });
      await qc.invalidateQueries({ queryKey: ["admin_songs_style"] });
      await qc.invalidateQueries({ queryKey: ["songs_infantil"] });
      notifyContentUpdated();
      toast.success("Estilo publicado — já aparece para as crianças.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-gold" />;

  return (
    <div className="space-y-4">
      <Card>
        <Field label="Cantiga">
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value || null)}
            className="rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream"
          >
            <option value="">Escolha uma cantiga</option>
            {songs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {song && (
        <Card>
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                ["bg_color", "Cor de fundo da tela"],
                ["panel_color", "Cor da moldura das letras"],
                ["indigenous_color", "Cor do painel Patxohã"],
                ["translation_color", "Cor do painel da tradução"],
                ["accent_color", "Cor do título"],
              ] as const
            ).map(([k, label]) => (
              <Field key={k} label={label}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(String(style[k] ?? "")) ? String(style[k]) : "#ffffff"}
                    onChange={(e) => setStyle((p) => ({ ...p, [k]: e.target.value }))}
                    className="h-10 w-12 rounded-lg border border-gold/25 bg-transparent"
                  />
                  <Input
                    value={String(style[k] ?? "")}
                    onChange={(e) => setStyle((p) => ({ ...p, [k]: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </Field>
            ))}
            <Field label="Layout das letras">
              <select
                value={style.layout ?? "lado-a-lado"}
                onChange={(e) => setStyle((p) => ({ ...p, layout: e.target.value as SongStyle["layout"] }))}
                className="rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream"
              >
                <option value="lado-a-lado">Patxohã e Português lado a lado</option>
                <option value="empilhado">Um embaixo do outro</option>
              </select>
            </Field>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="outline" onClick={() => setPreview(true)}>
              <Eye className="h-4 w-4" /> Ver como fica
            </Btn>
            <Btn variant="outline" onClick={() => setStyle(DEFAULTS)}>
              <RotateCcw className="h-4 w-4" /> Voltar ao padrão
            </Btn>
            <Btn disabled={busy} onClick={publish}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Publicar
              estilo
            </Btn>
          </div>
          <p className="mt-2 text-xs text-foreground/60">
            As cores só mudam para as crianças depois de clicar em <strong>Publicar estilo</strong>.
          </p>
        </Card>
      )}

      {preview && song && (
        <MiniPlayer
          song={{ ...song, style }}
          isMaximized
          onClose={() => setPreview(false)}
          onToggleMaximize={() => setPreview(false)}
        />
      )}
    </div>
  );
}
