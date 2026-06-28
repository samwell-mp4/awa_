import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2, Upload, Loader2, Video as VideoIcon } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

async function uploadVideoFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage.from("videos").upload(path, file, {
    contentType: file.type || "video/mp4",
    upsert: false,
  });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from("videos").createSignedUrl(path, FIVE_YEARS);
  if (error || !data?.signedUrl) throw error ?? new Error("URL não gerada");
  return data.signedUrl;
}

type Video = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  is_active: boolean;
};

export function VideoAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["daily_video_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_video")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Video[];
    },
  });

  async function create() {
    const { error } = await supabase.from("daily_video").insert({
      title: "Novo vídeo",
      description: "",
      duration_minutes: 3,
      is_active: false,
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["daily_video_all"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg font-black text-cream">Vídeos do dia</h2>
        <Btn onClick={create}><Plus className="h-4 w-4" /> Novo vídeo</Btn>
      </div>
      <p className="text-xs text-foreground/60">O vídeo "ativo" mais recente é exibido na home.</p>
      {data.map((v) => <VideoRow key={v.id} video={v} />)}
    </div>
  );
}

function VideoRow({ video }: { video: Video }) {
  const qc = useQueryClient();
  const [v, setV] = useState(video);
  useEffect(() => setV(video), [video]);

  async function save() {
    const { error } = await supabase.from("daily_video").update({
      title: v.title, description: v.description, thumbnail_url: v.thumbnail_url,
      video_url: v.video_url, duration_minutes: v.duration_minutes, is_active: v.is_active,
    }).eq("id", v.id);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    qc.invalidateQueries({ queryKey: ["daily_video_all"] });
    qc.invalidateQueries({ queryKey: ["daily_video"] });
  }
  async function remove() {
    if (!confirm("Excluir?")) return;
    const { error } = await supabase.from("daily_video").delete().eq("id", v.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["daily_video_all"] });
  }
  return (
    <Card>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Título"><Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
        <Field label="Duração (min)"><Input type="number" value={v.duration_minutes ?? 0} onChange={(e) => setV({ ...v, duration_minutes: +e.target.value })} /></Field>
        <Field label="Descrição"><Textarea rows={3} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
        <div className="grid gap-3">
          <Field label="Enviar vídeo do celular ou computador">
            <VideoUploader currentUrl={v.video_url} onUploaded={(url) => setV({ ...v, video_url: url })} />
          </Field>
          <Field label="URL do vídeo (ou cole um link)"><Input value={v.video_url ?? ""} onChange={(e) => setV({ ...v, video_url: e.target.value })} placeholder="https://..." /></Field>
          <Field label="URL da thumbnail"><Input value={v.thumbnail_url ?? ""} onChange={(e) => setV({ ...v, thumbnail_url: e.target.value })} /></Field>
        </div>
      </div>
      {v.video_url && (
        <video src={v.video_url} controls playsInline className="mt-3 w-full max-h-64 rounded-xl border border-gold/20 bg-black/40" />
      )}
      <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-cream">
          <input type="checkbox" checked={v.is_active} onChange={(e) => setV({ ...v, is_active: e.target.checked })} />
          Ativo (exibir na home)
        </label>
        <div className="flex gap-2">
          <Btn onClick={save}><Save className="h-4 w-4" /> Salvar</Btn>
          <Btn variant="danger" onClick={remove}><Trash2 className="h-4 w-4" /></Btn>
        </div>
      </div>
    </Card>
  );
}

function VideoUploader({
  currentUrl,
  onUploaded,
}: {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  async function handle(file: File | undefined) {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx. 500 MB)");
      return;
    }
    setUploading(true);
    setProgress(`Enviando ${(file.size / 1024 / 1024).toFixed(1)} MB...`);
    try {
      const url = await uploadVideoFile(file);
      onUploaded(url);
      toast.success("Vídeo enviado! Clique em Salvar para publicar.");
    } catch (e: any) {
      toast.error("Erro no upload: " + (e.message ?? e));
    } finally {
      setUploading(false);
      setProgress("");
    }
  }

  return (
    <div className="space-y-2">
      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      <input ref={camRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      <div className="flex flex-wrap gap-2">
        <Btn type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Enviando..." : "Escolher arquivo"}
        </Btn>
        <Btn type="button" variant="outline" onClick={() => camRef.current?.click()} disabled={uploading}>
          <VideoIcon className="h-4 w-4" /> Gravar com câmera
        </Btn>
      </div>
      {progress && <div className="text-xs text-foreground/60">{progress}</div>}
      {currentUrl && !uploading && <div className="text-[10px] text-leaf truncate">✓ Vídeo carregado</div>}
    </div>
  );
}
