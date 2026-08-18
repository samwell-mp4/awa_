import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2, Upload, Music, Loader2, Sparkles, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
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
  aldeia: string | null;
  is_active: boolean;
  order_index: number;
  sync_offsets?: number[];
};

const ALDEIAS = ["Aldeia Velha", "Barra Velha", "Coroa Vermelha", "Jaqueira", "Boca da Mata"];

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
  ambient_video_id: "",
  aldeia: "",
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
  const [mode, setMode] = useState<"list" | "review">("list");

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
      aldeia: draft.aldeia || null,
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl font-black text-cream flex items-center gap-2">
          <Music className="h-6 w-6 text-gold" /> Gestão de Músicas
        </h2>
        <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
          <button
            onClick={() => setMode("list")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
              mode === "list" ? "bg-gold text-forest-deep shadow-lg" : "text-foreground/60 hover:text-cream"
            }`}
          >
            Lista & Cadastro
          </button>
          <button
            onClick={() => setMode("review")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
              mode === "review" ? "bg-rose-500 text-white shadow-lg" : "text-foreground/60 hover:text-rose-400"
            }`}
          >
            <Sparkles className="h-4 w-4" /> Modo Revisão
          </button>
        </div>
      </div>

      {mode === "list" ? (
        <>
          <Card>
            <h2 className="font-display text-lg font-black text-cream mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5 text-gold" /> Nova música
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
              <Field label="Aldeia">
                <select
                  value={draft.aldeia}
                  onChange={(e) => setDraft({ ...draft, aldeia: e.target.value })}
                  className="rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream"
                >
                  <option value="">Nenhuma</option>
                  {ALDEIAS.map((a) => <option key={a} value={a}>{a}</option>)}
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
        </>
      ) : (
        <ReviewMode songs={songs} ambients={ambients} />
      )}
    </div>
  );
}

function ReviewMode({ songs, ambients }: { songs: Song[]; ambients: Ambient[] }) {
  const [filter, setFilter] = useState<"all" | "missing" | "sync">("missing");
  const qc = useQueryClient();

  const issues = songs.map(s => {
    const indLines = (s.lyrics_indigenous || "").split("\n").filter(l => l.trim());
    const ptLines = (s.lyrics_pt || "").split("\n").filter(l => l.trim());
    const isMissing = !s.lyrics_indigenous || !s.lyrics_pt;
    const isDesync = indLines.length > 0 && ptLines.length > 0 && indLines.length !== ptLines.length;
    
    return { ...s, isMissing, isDesync, indLines, ptLines };
  });

  const filtered = issues.filter(s => {
    if (filter === "missing") return s.isMissing;
    if (filter === "sync") return s.isDesync;
    return true;
  });

  async function applySuggestion(song: Song, type: "pt-to-ind" | "ind-to-pt" | "fill-empty") {
    let newIndigenous = song.lyrics_indigenous;
    let newPt = song.lyrics_pt;

    const indLines = (song.lyrics_indigenous || "").split("\n").filter(l => l.trim());
    const ptLines = (song.lyrics_pt || "").split("\n").filter(l => l.trim());

    if (type === "pt-to-ind") {
      newIndigenous = song.lyrics_pt;
    } else if (type === "ind-to-pt") {
      newPt = song.lyrics_indigenous;
    } else if (type === "fill-empty") {
      if (indLines.length > ptLines.length) {
        newPt = song.lyrics_indigenous;
      } else {
        newIndigenous = song.lyrics_pt;
      }
    }

    const { error } = await supabase.from("songs").update({
      lyrics_indigenous: newIndigenous,
      lyrics_pt: newPt
    }).eq("id", song.id);

    if (error) return toast.error(error.message);
    toast.success("Sugestão aplicada!");
    qc.invalidateQueries({ queryKey: ["songs_admin"] });
  }

  const stats = useMemo(() => {
    const total = issues.length;
    const clean = issues.filter(s => !s.isMissing && !s.isDesync).length;
    const pct = total > 0 ? Math.round((clean / total) * 100) : 100;
    return { total, clean, pct };
  }, [issues]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gold/10 text-gold">
              <Music className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-cream">{stats.total}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 text-nowrap">Total de Músicas</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-cream">{stats.clean}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 text-nowrap">Prontas (100%)</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col justify-center">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Progresso Geral</span>
              <span className="text-lg font-black text-gold">{stats.pct}%</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold/50 to-gold transition-all duration-1000" 
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 p-1 bg-black/20 rounded-xl w-fit">
        {(["missing", "sync", "all"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === f ? "bg-white/10 text-cream ring-1 ring-white/20" : "text-foreground/50 hover:text-cream"
            }`}
          >
            {f === "missing" ? "Letras Ausentes" : f === "sync" ? "Fora de Sincronia" : "Todas as Músicas"}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10">
             <div className="text-4xl">🎉</div>
             <p className="font-bold text-cream">Tudo limpo! Nenhuma música com problemas nesta categoria.</p>
          </div>
        ) : (
          filtered.map(s => {
            const score = 100 - (s.isMissing ? 50 : 0) - (s.isDesync ? 50 : 0);
            return (
              <div key={s.id} className={`group p-1 rounded-[2.5rem] bg-gradient-to-br ${s.isDesync ? "from-orange-500/20 to-red-500/10" : "from-rose-500/20 to-rose-600/10"} border border-white/5 transition hover:border-white/20`}>
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-black text-cream truncate">{s.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.lyrics_indigenous ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {s.lyrics_indigenous ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Letra Indígena
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.lyrics_pt ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {s.lyrics_pt ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Letra Português
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${!s.isDesync ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"}`}>
                        {!s.isDesync ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        Sincronia ({s.indLines.length} vs {s.ptLines.length})
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-2xl font-black ${score === 100 ? "text-emerald-400" : score >= 50 ? "text-orange-400" : "text-rose-400"}`}>
                        {score}
                      </div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-foreground/40">Qualidade</div>
                    </div>

                    <div className="flex flex-col gap-2">
                       {s.isDesync && (
                         <div className="flex gap-2">
                           <button 
                             onClick={() => applySuggestion(s, "ind-to-pt")}
                             className="px-3 py-1.5 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-tighter text-cream hover:bg-white/10 transition border border-white/10"
                           >
                             Fix: Usar Indígena
                           </button>
                           <button 
                             onClick={() => applySuggestion(s, "pt-to-ind")}
                             className="px-3 py-1.5 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-tighter text-cream hover:bg-white/10 transition border border-white/10"
                           >
                             Fix: Usar PT
                           </button>
                         </div>
                       )}
                       {s.isMissing && (
                         <button 
                           onClick={() => applySuggestion(s, "fill-empty")}
                           className="px-4 py-2 rounded-xl bg-gold text-[10px] font-black uppercase tracking-wider text-forest-deep hover:scale-105 transition shadow-lg"
                         >
                           Autofill: Replicar Letra
                         </button>
                       )}
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden transition-all duration-500">
                  <SongRow song={s} ambients={ambients} />
                </div>
              </div>
            );
          })
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
        aldeia: s.aldeia || null,
        sync_offsets: s.sync_offsets,
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
        <Field label="Aldeia">
          <select
            value={s.aldeia ?? ""}
            onChange={(e) => setS({ ...s, aldeia: e.target.value || null })}
            className="rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream"
          >
            <option value="">Nenhuma</option>
            {ALDEIAS.map((a) => <option key={a} value={a}>{a}</option>)}
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
