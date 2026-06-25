import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";

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
          <Field label="URL do vídeo"><Input value={v.video_url ?? ""} onChange={(e) => setV({ ...v, video_url: e.target.value })} /></Field>
          <Field label="URL da thumbnail"><Input value={v.thumbnail_url ?? ""} onChange={(e) => setV({ ...v, thumbnail_url: e.target.value })} /></Field>
        </div>
      </div>
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
