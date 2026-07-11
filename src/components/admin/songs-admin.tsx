import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2, Upload, Music, Loader2 } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";

type Song = {
  id: string;
  title: string;
  artist: string | null;
  language: string;
  audio_url: string;
  cover_url: string | null;
  video_url: string | null;
  ambient_video_id: string | null;
  lyrics_indigenous: string;
  lyrics_pt: string;
  description: string | null;
  is_active: boolean;
  order_index: number;
};

type Ambient = { id: string; name: string; video_url: string };

const ONE_YEAR = 60 * 60 * 24 * 365;

async function uploadToSongs(file: File, prefix: string): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("songs").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage.from("songs").createSignedUrl(path, ONE_YEAR);
  if (signErr) throw signErr;
  return data.signedUrl;
}

const defaultDraft = {
  title: "",
  artist: "",
  language: "Patxôhã",
  audio_url: "",
  cover_url: "",
  video_url: "",
  ambient_video_id: "",
  lyrics_indigenous: "",
  lyrics_pt: "",
  description: "",
  is_active: true,
};

export function SongsAdmin() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState(defaultDraft);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: songs = [] } = useQuery({
    queryKey: ["songs_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });

  const { data: ambients = [] } = useQuery({
    queryKey: ["ambient_videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ambient_videos").select("id,name,video_url").order("order_index");
      if (error) throw error;
      return data as Ambient[];
    },
  });

  async function handleUpload(field: "audio_url" | "cover_url", file: File) {
    setUploading(field);
    try {
      const url = await uploadToSongs(file, field === "audio_url" ? "audio" : "covers");
      setDraft((d) => ({ ...d, [field]: url }));
      toast.success(field === "audio_url" ? "Áudio enviado" : "Capa enviada");
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    } finally {
      setUploading(null);
    }
  }

  async function add() {
    if (!draft.title.trim() || !draft.audio_url.trim()) {
      toast.error("Título e áudio são obrigatórios");
      return;
    }
    setSaving(true);
    const payload = {
      ...draft,
      ambient_video_id: draft.ambient_video_id || null,
      artist: draft.artist || null,
      cover_url: draft.cover_url || null,
      description: draft.description || null,
    };
    const { error } = await supabase.from("songs").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Música adicionada");
    setDraft(defaultDraft);
    qc.invalidateQueries({ queryKey: ["songs_admin"] });
    qc.invalidateQueries({ queryKey: ["songs_public"] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-lg font-black text-cream mb-3 flex items-center gap-2">
          <Music className="h-5 w-5 text-gold" /> Nova música
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Título">
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
          <Field label="Artista / cantor">
            <Input value={draft.artist} onChange={(e) => setDraft({ ...draft, artist: e.target.value })} />
          </Field>
          <Field label="Língua">
            <Input value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} />
          </Field>
          <Field label="Vídeo ambiente (de fundo)">
            <select
              value={draft.ambient_video_id}
              onChange={(e) => setDraft({ ...draft, ambient_video_id: e.target.value })}
              className="rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream"
            >
              <option value="">Nenhum (capa estática)</option>
              {ambients.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <UploadOrUrl
            label="Áudio (upload MP3 ou cole URL)"
            value={draft.audio_url}
            onChange={(v) => setDraft({ ...draft, audio_url: v })}
            onFile={(f) => handleUpload("audio_url", f)}
            accept="audio/*"
            busy={uploading === "audio_url"}
          />
          <UploadOrUrl
            label="Capa (upload imagem ou cole URL)"
            value={draft.cover_url}
            onChange={(v) => setDraft({ ...draft, cover_url: v })}
            onFile={(f) => handleUpload("cover_url", f)}
            accept="image/*"
            busy={uploading === "cover_url"}
          />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Letra (idioma indígena) — uma linha por verso">
            <Textarea
              rows={8}
              value={draft.lyrics_indigenous}
              onChange={(e) => setDraft({ ...draft, lyrics_indigenous: e.target.value })}
              placeholder="Awere kanaema...&#10;Patxôhã ãhão txuru..."
            />
          </Field>
          <Field label="Tradução (português) — uma linha por verso">
            <Textarea
              rows={8}
              value={draft.lyrics_pt}
              onChange={(e) => setDraft({ ...draft, lyrics_pt: e.target.value })}
              placeholder="Bom dia, sol...&#10;A língua Patxôhã vive..."
            />
          </Field>
        </div>

        <Field label="Descrição (opcional)">
          <Textarea
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </Field>

        <Btn className="mt-4" onClick={add} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Publicar música
        </Btn>
      </Card>

      <div className="grid gap-3">
        {songs.map((s) => (
          <SongRow key={s.id} song={s} ambients={ambients} />
        ))}
        {songs.length === 0 && (
          <div className="text-center text-foreground/60 py-8">Nenhuma música cadastrada.</div>
        )}
      </div>
    </div>
  );
}

function UploadOrUrl({
  label,
  value,
  onChange,
  onFile,
  accept,
  busy,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFile: (f: File) => void;
  accept: string;
  busy: boolean;
}) {
  return (
    <Field label={label}>
      <div className="flex flex-col gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
        <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-gold/40 bg-card/40 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {busy ? "Enviando..." : "Enviar arquivo"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>
    </Field>
  );
}

function SongRow({ song, ambients }: { song: Song; ambients: Ambient[] }) {
  const qc = useQueryClient();
  const [s, setS] = useState(song);
  useEffect(() => setS(song), [song]);

  async function save() {
    const { error } = await supabase
      .from("songs")
      .update({
        title: s.title,
        artist: s.artist,
        language: s.language,
        audio_url: s.audio_url,
        cover_url: s.cover_url,
        ambient_video_id: s.ambient_video_id || null,
        lyrics_indigenous: s.lyrics_indigenous,
        lyrics_pt: s.lyrics_pt,
        description: s.description,
        is_active: s.is_active,
        order_index: s.order_index,
      })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    qc.invalidateQueries({ queryKey: ["songs_admin"] });
    qc.invalidateQueries({ queryKey: ["songs_public"] });
  }

  async function remove() {
    if (!confirm("Apagar esta música?")) return;
    const { error } = await supabase.from("songs").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["songs_admin"] });
    qc.invalidateQueries({ queryKey: ["songs_public"] });
  }

  return (
    <Card>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Título"><Input value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} /></Field>
        <Field label="Artista"><Input value={s.artist ?? ""} onChange={(e) => setS({ ...s, artist: e.target.value })} /></Field>
        <Field label="Língua"><Input value={s.language} onChange={(e) => setS({ ...s, language: e.target.value })} /></Field>
        <Field label="Vídeo ambiente">
          <select
            value={s.ambient_video_id ?? ""}
            onChange={(e) => setS({ ...s, ambient_video_id: e.target.value || null })}
            className="rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream"
          >
            <option value="">Nenhum</option>
            {ambients.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="URL áudio"><Input value={s.audio_url} onChange={(e) => setS({ ...s, audio_url: e.target.value })} /></Field>
        <Field label="URL capa"><Input value={s.cover_url ?? ""} onChange={(e) => setS({ ...s, cover_url: e.target.value })} /></Field>
        <Field label="Letra indígena">
          <Textarea rows={6} value={s.lyrics_indigenous} onChange={(e) => setS({ ...s, lyrics_indigenous: e.target.value })} />
        </Field>
        <Field label="Letra português">
          <Textarea rows={6} value={s.lyrics_pt} onChange={(e) => setS({ ...s, lyrics_pt: e.target.value })} />
        </Field>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2 text-xs text-foreground/70">
          <input type="checkbox" checked={s.is_active} onChange={(e) => setS({ ...s, is_active: e.target.checked })} />
          Música ativa (visível ao público)
        </label>
        <div className="flex gap-2">
          <Btn onClick={save}><Save className="h-4 w-4" /> Salvar</Btn>
          <Btn variant="danger" onClick={remove}><Trash2 className="h-4 w-4" /></Btn>
        </div>
      </div>
    </Card>
  );
}
